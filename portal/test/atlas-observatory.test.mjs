// V4 Vocabulary Observatory (PR-4) — the §4 accept bars: the SC-0078 story
// readable from the view; every value card links its SC; counts computed.
// Counts are compared against the built global.json at test time — never
// typed into the test — so the suite stays green as the vocabulary grows.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, mkTree, mkMap, runBuild, rmrf } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));

test('observatory: real tree meets the V4 acceptance bars', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-obs-'));
  const r = runBuild(repoRoot, out);
  assert.equal(r.status, 0, r.stderr);

  const html = fs.readFileSync(path.join(out, 'atlas', 'vocabulary.html'), 'utf8');
  const g = JSON.parse(fs.readFileSync(path.join(out, 'atlas', 'global.json'), 'utf8'));

  // Counts are computed, not typed: every axis heading shows the same number
  // the data layer holds, for all axes.
  for (const ax of g.vocabulary.axes) {
    assert.match(html, new RegExp(`id="${ax.axis}"[\\s\\S]{0,200}${ax.axis} — ${ax.approved} approved`),
      `axis ${ax.axis} heading carries its computed count`);
  }

  // The SC-0078 story is readable from the view: the ruling card is dated
  // 2026-06-27, carries the ledger's own "SPEECH_ACT 26 → 33" headline, and
  // lists the six admitted status values.
  const sc78 = html.slice(html.indexOf('id="SC-0078"'), html.indexOf('id="SC-0078"') + 4000);
  assert.match(sc78, /2026-06-27/);
  assert.match(sc78, /SPEECH_ACT 26 → 33/);
  assert.match(sc78, /status \+6/);
  for (const v of ['PERMITTED', 'FORESEEN', 'RECALLED', 'COUNTERFACTUAL', 'NORM', 'HABITUAL']) {
    assert.ok(sc78.includes(v), `SC-0078 card lists ${v}`);
  }

  // Every approved bounded-open value card links its admitting SC.
  const cardBlocks = html.match(/<div class="vcard[^"]*" id="vocab\/[^"]+">[\s\S]*?<\/div>/g) ?? [];
  assert.ok(cardBlocks.length >= g.counts.vocabulary_values - 5, 'a card per value');
  let l2 = 0;
  for (const c of cardBlocks) {
    if (!c.includes('admitted by')) continue;
    l2++;
    assert.match(c, /admitted by <a href="#SC-\d{4}">/, 'value card links its SC');
  }
  assert.ok(l2 >= 400, `bounded-open cards carry SC links (saw ${l2})`);

  // Spot bar: FAMINE_OCCURRED → SC-0006, with first-seen/approved pericope.
  const famine = html.slice(html.indexOf('id="vocab/proposition_kind/FAMINE_OCCURRED"'), html.indexOf('id="vocab/proposition_kind/FAMINE_OCCURRED"') + 900);
  assert.match(famine, /first seen P01 · approved in P01 · admitted by <a href="#SC-0006">SC-0006<\/a>/);
  assert.match(famine, /used in/);

  // Attested-only drift stays visible, honestly labeled.
  assert.match(html, /attested in the corpus — awaiting a ruling \(visible drift\)/);

  // House rules: no JS, noindex, feedback buttons, three-layer explainer.
  assert.doesNotMatch(html, /<script/i);
  assert.match(html, /name="robots" content="noindex"/);
  assert.match(html, /class="btns/);
  for (const layer of ['L1 — closed', 'L2 — bounded-open', 'L3 — registry']) {
    assert.ok(html.includes(layer), `three-layer explainer names ${layer}`);
  }

  // The Atlas index links the observatory.
  assert.match(fs.readFileSync(path.join(out, 'atlas', 'index.html'), 'utf8'), /href="vocabulary\.html"/);

  rmrf(out);
});

test('observatory: synthetic tree builds and renders its one admitted value', () => {
  const root = mkTree({ 'fixtures/meaning-map/P01-Test.md': mkMap('P01') });
  const out = path.join(root, 'dist');
  assert.equal(runBuild(root, out).status, 0);
  const html = fs.readFileSync(path.join(out, 'atlas', 'vocabulary.html'), 'utf8');
  assert.match(html, /TIME_ANCHOR_ESTABLISHED/);
  assert.match(html, /admitted by <a href="#SC-0006">/);
  rmrf(root);
});
