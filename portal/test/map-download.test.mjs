// Copy / download on the Meaning Map (Marcia's ask 2026-07-24). Download is
// the blessed source file, byte-identical — its sha256 must equal the one the
// manifest records (the same fingerprint the approval pin names). Copy needs
// JS, so the button ships hidden and the page's script reveals it: the no-JS
// page shows no dead control.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, runBuild } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));
const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

test('map download: dist ships every published map byte-identical to its manifest sha', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-mapdl-'));
  assert.equal(runBuild(repoRoot, out).status, 0);

  const manifest = JSON.parse(read(out, 'build-manifest.json'));
  const maps = manifest.artifacts.filter((a) => a.class === 'meaning-map');
  assert.ok(maps.length > 0);
  for (const a of maps) {
    const distFile = path.join(out, 'pericopes', `${a.pericope}.map.md`);
    assert.ok(fs.existsSync(distFile), `${a.pericope}.map.md ships in dist`);
    assert.equal(sha256(fs.readFileSync(distFile)), a.sha256,
      `${a.pericope}: the downloadable map is the blessed bytes the manifest fingerprints`);
  }

  for (const f of fs.readdirSync(path.join(out, 'pericopes')).filter((f) => f.endsWith('.html'))) {
    const id = f.replace(/\.html$/, '');
    const html = read(out, path.join('pericopes', f));
    if (maps.some((a) => a.pericope === id)) {
      assert.match(html, new RegExp(`<a class="btn" href="${id}\\.map\\.md" download="${id}-meaning-map\\.md" rel="nofollow">Download the map</a>`),
        `${f}: download link targets the shipped source, nofollow (raw .md cannot carry the noindex meta)`);
      assert.match(html, /<button class="btn" id="copymap" type="button" aria-live="polite" hidden>Copy the map text<\/button>/,
        `${f}: copy button ships hidden until JS reveals it`);
      assert.match(html, /navigator\.clipboard\.writeText/, `${f}: copy script present`);
      assert.match(html, /Copy failed — use Download\./, `${f}: rejection is not silent`);
      const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) ?? [];
      assert.equal(scripts.length, 1, `${f}: exactly the one map-tools script`);
      for (const sc of scripts) {
        assert.doesNotMatch(sc, /https?:\/\//, `${f}: every script block stays self-contained`);
        assert.doesNotMatch(sc, /\bsrc=/i, `${f}: inline only — nothing loaded`);
      }
    } else {
      assert.doesNotMatch(html, /copymap|\.map\.md/, `${f}: no map, no tools`);
    }
  }
});
