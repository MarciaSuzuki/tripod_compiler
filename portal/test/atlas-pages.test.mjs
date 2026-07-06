// V1 Book Atlas + V3 registry browser (PR-2) — the §4 acceptance bars, held as
// tests. Real-tree assertions use floors/invariants (the SC-0075 lesson: this
// suite gates deploys); the wikilink-upgrade unit pins exact markup.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, mkTree, mkMap, runBuild, rmrf } from './helpers.mjs';
import { renderWikilink } from '../src/lib/wikilinks.mjs';
import { loadRegistries } from '../src/lib/registry.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));

const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');

test('atlas pages: real tree meets the V1 + V3 acceptance bars', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-atlas-pages-'));
  const r = runBuild(repoRoot, out);
  assert.equal(r.status, 0, r.stderr);

  // V1 accept: the Ruth page shows all pericopes with REAL titles.
  const ruth = read(out, 'atlas/ruth.html');
  assert.ok((ruth.match(/class="tile( emo)?"/g) || []).length >= 14, 'all Ruth pericope tiles');
  assert.match(ruth, /The famine, the family's sojourn, and the emptying of the household/);
  assert.match(ruth, /The gate: the non-name, the field before Ruth, and the sandal/);

  // V1 accept: at least one real entity lane and one real CB lane, from data.
  const lanes = ruth.slice(ruth.indexOf('Threads across the book'), ruth.indexOf('Cast &amp; registry'));
  assert.match(lanes, /registry\/ruth\/B10\.html/, 'B10 (YHWH) entity lane');
  assert.match(lanes, /registry\/concept\//, 'a Concept Bank lane');
  assert.ok((lanes.match(/class="dot"/g) || []).length >= 9, 'real span dots in the lanes');

  // Register-override markers (e.g. the INTIMATE moments) render on the spine.
  assert.match(ruth, /class="chip amber"[^>]*>S\d+ → INTIMATE/, 'an INTIMATE scene-level override marker');

  // Drill-down: significant absences are carried, styled as load-bearing.
  assert.match(ruth, /Narrator never says YHWH sent the famine/);
  assert.ok((ruth.match(/class="absence"/g) || []).length >= 14, 'absences render per scene');

  // SC-0079 compile close: all 18 Esther pericopes carry map + MEANING_COORDINATES + valid CL, so the
  // book graduates compile-pending -> complete, same footing as Ruth/Jonah.
  // (The registry-only rendering itself stays covered by the synthetic-tree test below.)
  const esther = read(out, 'atlas/esther.html');
  assert.match(esther, /class="status complete"/);
  assert.doesNotMatch(esther, /compile-pending/);
  assert.ok((esther.match(/class="castcard"/g) || []).length >= 51, 'Esther cast from the pinned registry');
  assert.match(esther, /Pericope spine — 18 passages/);
  assert.ok((esther.match(/class="tile( emo)?"/g) || []).length >= 18, 'all 18 Esther pericopes tile the spine');
  // SC-0079 compile landed: Esther's MCs exist, so the structured absence drill-downs
  // derive from them — Esther's God-absence signature must now render on the spine.
  assert.match(esther, /class="absence"/);

  // V3 accept: B10 (YHWH) — 4 referential forms + its Ruth pericopes as links.
  const b10 = read(out, 'atlas/registry/ruth/B10.html');
  for (const form of ['YHWH', 'ELOHIM', 'SHADDAI', 'ALTERNATING_YHWH_AND_SHADDAI']) {
    assert.ok(b10.includes(form), `B10 referential form ${form}`);
  }
  assert.ok((b10.match(/\.\.\/\.\.\/ruth\.html#P\d{2}/g) || []).length >= 9, 'B10 appears-in links');
  assert.match(b10, /Scene participations/);

  // V3 accept: CB_0001 (Kinsman-Redeemer) lists its flagging propositions.
  const cb1 = read(out, 'atlas/registry/concept/CB_0001.html');
  assert.match(cb1, /Kinsman Redeemer/);
  assert.ok((cb1.match(/<tr><td class="mono">/g) || []).length >= 1, 'flagging statements listed');

  // V3 accept: Reading-Room wikilink mentions link into the registry pages
  // (the declared navigation addition; classes + tooltips unchanged).
  const p01 = read(out, 'pericopes/P01.html');
  assert.ok(
    (p01.match(/<a class="wl wl-entity" href="\.\.\/atlas\/registry\/ruth\//g) || []).length >= 10,
    'entity mentions navigate into the Atlas'
  );
  assert.match(p01, /<a class="wl wl-concept" href="\.\.\/atlas\/registry\/concept\//);
  // The two-mode switcher (home v2) is on every Reading-Room page.
  assert.match(p01, /class="mode mind" href="\.\.\/atlas\/index\.html"/);
  assert.match(read(out, 'index.html'), /class="mode mind" href="atlas\/index\.html"/);

  // §2.4: the ONLY script anywhere is the Atlas home's vendored brain engine
  // (the declared JS departure, PR-3); every other page ships zero JS.
  for (const rel of ['atlas/index.html', 'atlas/ruth.html', 'atlas/esther.html', 'atlas/registry/ruth/B10.html', 'atlas/registry/concept/CB_0001.html']) {
    const html = read(out, rel);
    if (rel === 'atlas/index.html') {
      const scripts = html.match(/<script[^>]*>/gi) ?? [];
      assert.deepEqual(scripts, ['<script src="../assets/atlas-brain.js" defer>'], `${rel}: exactly the one vendored engine`);
    } else {
      assert.doesNotMatch(html, /<script/i, `${rel} must ship no JS`);
    }
    assert.match(html, /name="robots" content="noindex"/, `${rel} keeps noindex`);
  }
  for (const rel of ['atlas/index.html', 'atlas/ruth.html', 'atlas/esther.html', 'atlas/registry/ruth/B10.html', 'atlas/registry/concept/CB_0001.html']) {
    assert.match(read(out, rel), /class="btns/, `${rel} carries the feedback buttons (§2.5: every Atlas page)`);
  }

  // Stats footer is computed (real counts), and the atlas stylesheet ships.
  assert.match(ruth, /58 concepts · 126 figures/);
  assert.ok(fs.existsSync(path.join(out, 'assets', 'atlas.css')));

  rmrf(out);
});

test('atlas pages: registry-only book renders honestly from a synthetic tree', () => {
  const root = mkTree({ 'fixtures/meaning-map/P01-Test.md': mkMap('P01') });
  const out = path.join(root, 'dist');
  assert.equal(runBuild(root, out).status, 0);
  const esther = read(out, 'atlas/esther.html');
  assert.match(esther, /maps in progress/);
  assert.match(esther, /castcard/);
  assert.match(esther, /B19/);
  assert.doesNotMatch(esther, /class="tile( emo)?"/);
  rmrf(root);
});

test('atlas pages: an override without its anchor key renders the bare value, never "undefined"', () => {
  // The pinned schema makes scene_id/verse optional on override entries; a
  // register-critical override must survive that honestly (verify-confirmed).
  const mc = `---
type: "sta-meaning-coordinates"
pericope: "P01"
pericope-title: "A test passage"
source-meaning-map: [[P01-Test]]
status: "valid"
pilot: "pilot-2"
---

# P01 — MEANING_COORDINATES

\`\`\`json
{
  "sta_id": "test_p01",
  "header": { "bcv": "Ruth 9:1-5" },
  "pericope_classification": {
    "genre_group": "NARRATIVE", "genre": "HISTORICAL_NARRATIVE", "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "scene_level": [ { "override_value": "CEREMONIAL" } ],
      "moment_level": [ { "framing_override": "COMMUNITY_MEMORY" } ]
    }
  },
  "level_1": {},
  "level_2_scenes": [],
  "level_3_propositions": []
}
\`\`\`
`;
  const root = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    'fixtures/meaning-coordinates/P01-Test-MEANING-COORDINATES.md': mc,
  });
  const out = path.join(root, 'dist');
  assert.equal(runBuild(root, out).status, 0);
  const ruth = read(out, 'atlas/ruth.html');
  assert.doesNotMatch(ruth, /undefined/);
  assert.match(ruth, /class="chip amber"[^>]*>CEREMONIAL</);
  assert.match(ruth, /class="chip amber"[^>]*>COMMUNITY_MEMORY</);
  rmrf(root);
});

test('wikilinks: atlas ctx upgrades resolved mentions to links; without it, spans (unchanged)', () => {
  const root = mkTree({});
  const registries = loadRegistries(root, [
    { prefix: 'P', name: 'RUTH', title: 'Ruth', aliasesFile: 'ruth.aliases.json' },
  ]);
  const base = { registries, bookPrefix: 'P', published: new Map(), relRoot: '../' };

  // Without atlas ctx: the original tooltip-only span, byte-for-byte shape.
  const span = renderWikilink(base, 'B2-Elimelech', null);
  assert.match(span, /^<span class="wl wl-entity" title="[^"]*"><bdi>Elimelech<\/bdi><\/span>$/);

  // With atlas ctx: same classes, same tooltip, now an anchor into the registry.
  const withAtlas = { ...base, atlas: { bookIdByPrefix: new Map([['P', 'ruth']]) } };
  const link = renderWikilink(withAtlas, 'B2-Elimelech', null);
  assert.match(link, /^<a class="wl wl-entity" href="\.\.\/atlas\/registry\/ruth\/B2\.html" title="[^"]*"><bdi>Elimelech<\/bdi><\/a>$/);

  const concept = renderWikilink(withAtlas, 'CB_0029-Judges-Era', null);
  assert.match(concept, /^<a class="wl wl-concept" href="\.\.\/atlas\/registry\/concept\/CB_0029\.html"/);

  // Unresolvable mentions still degrade to plain spans — never broken links.
  assert.match(renderWikilink(withAtlas, 'B999-Nobody', null), /^<span class="wl wl-plain"/);
  rmrf(root);
});
