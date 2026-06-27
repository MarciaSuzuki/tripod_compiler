// Smoke test against the REAL repo tree (read-only): the actual blessed
// fixtures must build, and the output must carry the expected day-one shape.
// This is the test CI runs before every deploy.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, runBuild, rmrf } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));

test('the real fixtures tree builds clean', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-real-'));
  const r = runBuild(repoRoot, out);
  assert.equal(r.status, 0, r.stderr);

  const index = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  // day-one content: at least P01–P06 + J01 (more appear as graduations land)
  for (const id of ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'J01']) {
    assert.match(index, new RegExp(`pericopes/${id}\\.html`), `${id} missing from index`);
  }

  // a rendered page has resolved wikilinks (no [[ left), a JSON tree, Hebrew tooltips
  const p01 = fs.readFileSync(path.join(out, 'pericopes', 'P01.html'), 'utf8');
  assert.doesNotMatch(p01, /\[\[/);
  assert.match(p01, /class="jsontree"/);
  assert.match(p01, /wl-entity/);
  assert.match(p01, /[֐-׿]/, 'expected Hebrew text in tooltips');

  // J01: fully authored — map + FOR_MODEL + compilation log. All 19 pericopes have now
  // graduated, so no real fixture is map-only; the "Not yet authored" placeholder branch
  // (pages.mjs) is retained for future genuinely-absent artifacts but no longer triggered
  // by the real tree. SC-0075 (this assertion previously encoded the day-one map-only state).
  const j01 = fs.readFileSync(path.join(out, 'pericopes', 'J01.html'), 'utf8');
  assert.doesNotMatch(j01, /Not yet authored for this passage/);
  assert.match(j01, /id="for-model"/);
  assert.match(j01, /id="compilation-log"/);

  // the Shema logo ships and every page's header references it (relRoot-correct)
  assert.ok(fs.existsSync(path.join(out, 'assets', 'shema-logo.svg')), 'logo asset missing from dist');
  assert.match(index, /<img class="logo" src="assets\/shema-logo\.svg"/);
  assert.match(p01, /<img class="logo" src="\.\.\/assets\/shema-logo\.svg"/);

  // the manifest records provenance for every artifact rendered
  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'build-manifest.json'), 'utf8'));
  assert.ok(manifest.artifacts.length >= 19);
  for (const a of manifest.artifacts) {
    assert.match(a.path, /^fixtures\//, `manifest artifact outside fixtures/: ${a.path}`);
    assert.ok(
      a.status === 'complete' || a.status === 'valid',
      `manifest artifact with non-approved status: ${a.path} → ${a.status}`
    );
  }
  rmrf(out);
});
