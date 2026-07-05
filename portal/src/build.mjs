#!/usr/bin/env node
// Tripod Review Portal — static site builder.
//
//   node src/build.mjs [--root <repo>] [--out <dir>] [--config <file>]
//
// Reads ONLY:  fixtures/{meaning-map,for-model,compilation-log}/*.md   (the blessed artifacts)
//              _spec/registry/*.json                                   (public registries, for tooltips)
//              _spec/approved-enumerations.json, _spec/validation-rules.json,
//              SPEC_CHANGES.md                                         (atlas-data sources, spec §2.1)
// Writes ONLY: the output directory (default portal/dist).
//
// Exit codes:  0 built · 2 APPROVED-ONLY GATE violation (nothing written) · 1 any other error.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

import { parseNote, extractFencedJson } from './lib/frontmatter.mjs';
import { ARTIFACT_CLASSES, checkArtifact, GateError } from './lib/gate.mjs';
import { buildAtlas } from './atlas/export.mjs';
import { atlasPages } from './atlas/pages.mjs';
import { loadRegistries } from './lib/registry.mjs';
import { renderMarkdown } from './lib/markdown.mjs';
import { renderJsonTree } from './lib/jsontree.mjs';
import { sectionAskUrlFactory } from './lib/feedback.mjs';
import { renderMethodPage } from './lib/method-page.mjs';
import { layout, indexPage, pericopePage } from './lib/pages.mjs';

const portalDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function main() {
  const repoRoot = path.resolve(arg('root', path.resolve(portalDir, '..')));
  const outDir = path.resolve(arg('out', path.join(portalDir, 'dist')));
  const configPath = path.resolve(arg('config', path.join(portalDir, 'portal.config.json')));

  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const formCfg = cfg.feedbackForm ?? null;

  const fixturesRoot = path.join(repoRoot, 'fixtures');
  if (!fs.existsSync(fixturesRoot)) {
    throw new Error(`no fixtures/ directory under --root ${repoRoot} — wrong root?`);
  }
  const fixturesRealRoot = fs.realpathSync(fixturesRoot);

  // Output-dir safety: never point the (cleaned) output at the repo root or
  // into fixtures/.
  if (outDir === repoRoot || outDir.startsWith(fixturesRealRoot + path.sep)) {
    throw new Error(`refusing to write output to ${outDir}`);
  }

  // ---- 1. Collect + parse ---------------------------------------------------
  const artifacts = [];
  const gateViolations = [];

  for (const classKey of Object.keys(ARTIFACT_CLASSES)) {
    const dir = path.join(fixturesRoot, ARTIFACT_CLASSES[classKey].dir);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || name.startsWith('.')) continue;
      const filePath = path.join(dir, name);
      const relPath = path.relative(repoRoot, filePath);
      let realPath;
      try {
        realPath = fs.realpathSync(filePath);
      } catch {
        gateViolations.push(`${relPath}: cannot resolve real path (broken symlink?)`);
        continue;
      }
      let parsed;
      try {
        parsed = parseNote(fs.readFileSync(filePath, 'utf8'), relPath);
      } catch (e) {
        // A note we cannot read cannot prove its approval — that is a gate
        // violation, not a soft skip.
        gateViolations.push(e.message);
        continue;
      }
      artifacts.push({
        classKey,
        filePath,
        relPath,
        realPath,
        fixturesRealRoot,
        frontmatter: parsed.frontmatter,
        body: parsed.body,
      });
    }
  }

  // ---- 2. THE GATE (approved-only; all-or-nothing) -------------------------
  for (const a of artifacts) gateViolations.push(...checkArtifact(a));
  if (gateViolations.length > 0) throw new GateError(gateViolations);

  // ---- 3. Group into pericopes ---------------------------------------------
  const registries = loadRegistries(repoRoot, cfg.books);
  const pericopes = new Map();
  const ensure = (id) => {
    if (!pericopes.has(id)) pericopes.set(id, { id, map: null, forModel: null, log: null });
    return pericopes.get(id);
  };

  for (const a of artifacts) {
    const fm = a.frontmatter;
    if (a.classKey === 'meaning-map') {
      const id = fm['pericope-num'];
      if (!id) throw new Error(`${a.relPath}: meaning map has no pericope-num`);
      const p = ensure(id);
      if (p.map) throw new Error(`duplicate meaning map for ${id}: ${p.map.relPath} and ${a.relPath}`);
      p.map = a;
    } else {
      const id = fm['pericope'];
      if (!id) throw new Error(`${a.relPath}: artifact has no pericope field`);
      const p = ensure(id);
      const slot = a.classKey === 'for-model' ? 'forModel' : 'log';
      if (p[slot]) throw new Error(`duplicate ${a.classKey} for ${id}: ${p[slot].relPath} and ${a.relPath}`);
      p[slot] = a;
    }
  }

  const published = new Map();
  for (const [id, p] of pericopes) {
    const set = new Set();
    if (p.map) set.add('meaning-map');
    if (p.forModel) set.add('for-model');
    if (p.log) set.add('compilation-log');
    published.set(id, set);
  }

  // ---- 4. Render -------------------------------------------------------------
  const buildInfo = { commit: resolveCommit(repoRoot), builtAt: new Date().toISOString().slice(0, 10) };
  const pages = new Map(); // out-relative path → html

  const ordered = [...pericopes.values()].sort((a, b) => {
    const ba = bookIndex(cfg, a.id);
    const bb = bookIndex(cfg, b.id);
    return ba !== bb ? ba - bb : a.id.localeCompare(b.id);
  });

  for (const p of ordered) {
    const bookPrefix = p.id.charAt(0);
    const book = registries.byPrefix.get(bookPrefix);
    if (!book) {
      throw new Error(
        `pericope ${p.id}: unknown book prefix "${bookPrefix}" — add the new book to portal.config.json "books" (prefix, registry aliases file)`
      );
    }
    const ctx = {
      registries,
      bookPrefix,
      published,
      relRoot: '../',
      // Resolved registry mentions become navigable into the Atlas (V3 bar;
      // the declared Reading-Room change alongside the header nav link).
      atlas: { bookIdByPrefix: new Map(cfg.books.map((b) => [b.prefix, String(b.name).toLowerCase()])) },
    };

    const mapFm = p.map?.frontmatter ?? p.forModel?.frontmatter ?? p.log?.frontmatter ?? {};
    const title = mapFm['pericope-title'] ?? '';
    const bcv = mapFm['bcv'] ?? jsonOf(p.forModel, p.relPath)?.header?.bcv ?? '';

    let mapHtml = `<p class="note">The Meaning Map for this passage is not published yet.</p>`;
    if (p.map) {
      const askUrl = sectionAskUrlFactory(formCfg, { pericope: `${p.id} — ${bcv}`, artifact: 'Meaning Map' });
      mapHtml = renderMarkdown(ctx, p.map.body, { headingPrefix: 'map', sectionAskUrl: askUrl }).html;
    }
    const forModelHtml = p.forModel
      ? renderJsonTree(ctx, jsonOf(p.forModel), { openDepth: 2 })
      : null;
    const logHtml = p.log ? renderJsonTree(ctx, jsonOf(p.log), { openDepth: 1 }) : null;

    pages.set(
      `pericopes/${p.id}.html`,
      layout({
        cfg,
        title: `${p.id} · ${bcv}`,
        relRoot: '../',
        buildInfo,
        contentHtml: pericopePage({
          cfg,
          formCfg,
          wikilinkCtx: ctx,
          p: { id: p.id, bcv, title, mapFrontmatter: mapFm, mapHtml, forModelHtml, logHtml },
        }),
      })
    );
  }

  const books = cfg.books
    .map((b) => ({
      title: b.title,
      pericopes: ordered
        .filter((p) => p.id.startsWith(b.prefix))
        .map((p) => ({
          id: p.id,
          bcv: p.map?.frontmatter?.bcv ?? '',
          title: p.map?.frontmatter?.['pericope-title'] ?? '',
          has: { map: !!p.map, forModel: !!p.forModel, log: !!p.log },
        })),
    }))
    .filter((b) => b.pericopes.length > 0);

  const formConfigured = !!formCfg?.formBase;
  pages.set(
    'index.html',
    layout({
      cfg,
      title: null,
      relRoot: '',
      buildInfo,
      contentHtml: indexPage({ cfg, books, buildInfo, formConfigured }),
    })
  );

  // The Tripod Method page — Marcia's approved artifact, vendored byte-identical
  // plus exactly the two ruled insertions (see lib/method-page.mjs). Rendered
  // here, before the write phase, so a pin mismatch aborts with nothing on disk.
  pages.set(
    'tripod-method.html',
    renderMethodPage(
      fs.readFileSync(path.join(portalDir, 'assets', 'tripod-method-source.html'), 'utf8'),
      formCfg
    )
  );

  // ---- 4b. Atlas data (spec §3) — computed before anything is written, so a
  // source violation (GateError, exit 2) still means nothing hits disk.
  const atlas = buildAtlas({ repoRoot, cfg, buildInfo, pericopes: ordered, jsonOf, configPath });

  // ---- 4c. Atlas pages (spec §4 V1 + V3) — rendered from the same data.
  const atlasHtml = atlasPages({ cfg, formCfg, atlas: atlas.data, buildInfo });

  // ---- 5. Write (only after everything rendered cleanly) --------------------
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'pericopes'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'atlas'), { recursive: true });
  for (const [rel, html] of pages) fs.writeFileSync(path.join(outDir, rel), html);
  for (const f of atlas.files) {
    fs.writeFileSync(path.join(outDir, f.file), JSON.stringify(f.data, null, 2) + '\n');
  }
  for (const [rel, html] of atlasHtml) {
    const target = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }
  fs.copyFileSync(path.join(portalDir, 'assets', 'style.css'), path.join(outDir, 'assets', 'style.css'));
  fs.copyFileSync(path.join(portalDir, 'assets', 'atlas.css'), path.join(outDir, 'assets', 'atlas.css'));
  fs.copyFileSync(path.join(portalDir, 'assets', 'atlas-brain.js'), path.join(outDir, 'assets', 'atlas-brain.js'));
  fs.copyFileSync(path.join(portalDir, 'assets', 'atlas-tours.js'), path.join(outDir, 'assets', 'atlas-tours.js'));
  fs.copyFileSync(path.join(portalDir, 'assets', 'shema-logo.svg'), path.join(outDir, 'assets', 'shema-logo.svg'));
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  const manifest = {
    builtAt: buildInfo.builtAt,
    commit: buildInfo.commit,
    approvedOnly: true,
    artifacts: artifacts.map((a) => ({
      path: a.relPath,
      class: a.classKey,
      status: a.frontmatter.status,
      pericope: a.frontmatter['pericope-num'] ?? a.frontmatter['pericope'],
      sha256: crypto.createHash('sha256').update(fs.readFileSync(a.filePath)).digest('hex'),
    })),
    pericopes: ordered.map((p) => p.id),
    atlas: atlas.manifestSection,
  };
  fs.writeFileSync(path.join(outDir, 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(
    `portal: built ${ordered.length} pericope page(s) from ${artifacts.length} approved artifact(s) → ${outDir}`
  );
  console.log(`  atlas: ${atlas.summary}`);
  console.log(`  atlas pages: ${atlasHtml.size} (index + ${atlas.data.books.length} books + registry)`);
  for (const p of ordered) {
    const parts = [p.map && 'map', p.forModel && 'for-model', p.log && 'log'].filter(Boolean);
    console.log(`  ${p.id}: ${parts.join(' + ')}`);
  }
}

const jsonCache = new WeakMap();
function jsonOf(artifact) {
  if (!artifact) return null;
  if (!jsonCache.has(artifact)) {
    jsonCache.set(artifact, extractFencedJson(artifact.body, artifact.relPath));
  }
  return jsonCache.get(artifact);
}

function bookIndex(cfg, pericopeId) {
  const i = cfg.books.findIndex((b) => pericopeId.startsWith(b.prefix));
  return i === -1 ? cfg.books.length : i;
}

function resolveCommit(repoRoot) {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

try {
  main();
} catch (e) {
  if (e instanceof GateError) {
    console.error(e.message);
    process.exit(2);
  }
  console.error(`portal build failed: ${e.message}`);
  process.exit(1);
}
