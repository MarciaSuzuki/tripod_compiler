// The living brain (V2, PR-3) — what a node test CAN hold: the progressive
// no-JS contract, the vendored-JS discipline, and the data-derivation rules.
// The animated bars (murmuration travel, threads-on-touch, firing, growth
// captions) are held by the browser acceptance run recorded in the PR.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, mkTree, mkMap, runBuild, rmrf } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));
const brainSrc = fs.readFileSync(path.join(portalDir, 'assets', 'atlas-brain.js'), 'utf8');

test('brain: the vendored engine reaches no external host and hardcodes no book', () => {
  // §2.4: vendored, no CDN — the only network calls are same-directory shard fetches.
  assert.doesNotMatch(brainSrc, /https?:\/\//, 'no external URL anywhere in the engine');
  for (const m of brainSrc.matchAll(/fetch\(([^)]*)\)/g)) {
    assert.match(m[1], /^[`"']\.\//, `fetch target must be relative to the atlas dir: ${m[1]}`);
  }
  // Data honesty: nothing book-specific lives in executable code — the ghost
  // state, the spines, and the growth order all derive from the shards.
  // (Comments may cite ids as documentation; code may not.)
  const codeOnly = brainSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(codeOnly, /esther|ruth|jonah/i, 'no book name hardcoded in code');
  // Motion discipline: ambient animation is gated on prefers-reduced-motion.
  assert.match(brainSrc, /prefers-reduced-motion/);
  // Camera + hands (Marcia's rulings): pan, zoom, and book-cluster drag whose
  // placement PERSISTS (anchors travel with the drag), single-gesture pointer
  // discipline, and cancel cleanup.
  assert.match(brainSrc, /panX/);
  assert.match(brainSrc, /m\.ax \+= dx; m\.ay \+= dy;/, 'cluster placement must move the anchors too');
  assert.match(brainSrc, /activePtr/, 'multi-touch: one gesture, one pointer');
  assert.match(brainSrc, /pointercancel/);
  // Focus discipline (Marcia's ruling): labels fade with their node — no additive
  // brightness floor holding dimmed text bright. Only the selected/hovered node's
  // label may floor up, for readability under the pointer.
  assert.doesNotMatch(brainSrc, /0\.40 \+ 0\.45 \* n\.alpha/, 'dimmed labels must not keep a bright floor');
  assert.match(brainSrc, /isSel \|\| isHov \? Math\.max\(\.85 \* n\.alpha, \.75\) : \.85 \* n\.alpha/,
    'label alpha follows n.alpha, floored only for the selected/hovered node');
  const css = fs.readFileSync(path.join(portalDir, 'assets', 'atlas.css'), 'utf8');
  assert.match(css, /touch-action: none/);
  const toursSrc = fs.readFileSync(path.join(portalDir, 'assets', 'atlas-tours.js'), 'utf8');
  assert.match(toursSrc, /resetView\?\.\(\)/, 'tour steps reset a viewer-panned viewport');
});

test('brain: the atlas index stays a complete no-JS page (progressive, §2.4)', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-brain-real-'));
  const r = runBuild(repoRoot, out);
  assert.equal(r.status, 0, r.stderr);

  const index = fs.readFileSync(path.join(out, 'atlas', 'index.html'), 'utf8');
  // The static core content is fully present in the HTML itself…
  assert.match(index, /class="bookcard"/, 'book cards render without JS');
  assert.match(index, /Concept Bank entries/);
  // …the brain UI ships inert (outside <main>, hidden until body.brain-on)…
  assert.match(index, /<canvas id="stage" class="brainui"/);
  const mainEnd = index.indexOf('</main>');
  assert.ok(index.indexOf('<canvas id="stage"') > mainEnd, 'brain overlay lives OUTSIDE <main> — brain-on hides main, never its own UI');
  // …and the engine is the vendored file, loaded from the same site.
  assert.match(index, /<script src="\.\.\/assets\/atlas-brain\.js" defer><\/script>/);
  assert.ok(fs.existsSync(path.join(out, 'assets', 'atlas-brain.js')), 'engine ships in dist');

  // The brain is the Atlas home only — no other page loads a script.
  for (const rel of ['atlas/ruth.html', 'atlas/esther.html', 'atlas/registry/ruth/B10.html', 'index.html', 'pericopes/P01.html']) {
    assert.doesNotMatch(fs.readFileSync(path.join(out, rel), 'utf8'), /<script/i, `${rel} stays script-free`);
  }
  rmrf(out);
});

test('brain: HUD skeleton carries the V2 controls (modes mount point, filters, search, all-threads)', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-brain-hud-'));
  assert.equal(runBuild(repoRoot, out).status, 0);
  const index = fs.readFileSync(path.join(out, 'atlas', 'index.html'), 'utf8');
  for (const id of ['id="modes"', 'id="f-book"', 'id="f-kind"', 'id="f-genre"', 'id="f-register"', 'id="search"', 'id="allthreads"', 'id="panel"', 'id="legend"', 'id="zoomctl"']) {
    assert.ok(index.includes(id), `missing HUD element ${id}`);
  }
  // Naming ruling (Marcia, 2026-07-04): the user-facing title is "The Meaning
  // Mind" (h1 + the canvas accessible name, kept in sync); internal names
  // (atlas-brain.js, brain-on, __tripodBrain) deliberately stay brain-*.
  assert.match(index, /<h1>The Meaning Mind<\/h1>/);
  assert.match(index, /aria-label="The Meaning Mind — an interactive graph/);
  assert.doesNotMatch(index, /Tripod Brain/);
  rmrf(out);
});

test('brain: synthetic tree still builds with the brain wired (no data dependency on real books)', () => {
  const root = mkTree({ 'fixtures/meaning-map/P01-Test.md': mkMap('P01') });
  const out = path.join(root, 'dist');
  assert.equal(runBuild(root, out).status, 0);
  assert.ok(fs.existsSync(path.join(out, 'assets', 'atlas-brain.js')));
  rmrf(root);
});
