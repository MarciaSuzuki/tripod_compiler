// V5 tours + V6 emotion lens (PR-5) — the §4 accept bars. The lens must show
// ONLY data-derived highlights; Tier 2 renders a planted appraisal block and
// renders NOTHING without one; absences stay visually senior; the tours page
// reads fully without JS and ships only the vendored engine.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, mkTree, mkMap, runBuild, rmrf } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));
const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');

test('emotion lens: real tree lights only what canon attests', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-emo-'));
  assert.equal(runBuild(repoRoot, out).status, 0);

  const ruthHtml = read(out, 'atlas/ruth.html');
  const jonahHtml = read(out, 'atlas/jonah.html');

  // The spec's own named attestations, present as data-derived chips.
  assert.match(ruthHtml, /KISSED ×3/);
  assert.match(ruthHtml, /WEPT_ALOUD/);
  assert.match(ruthHtml, /CLUNG_TO/);
  assert.match(ruthHtml, /ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT ×4/);
  assert.match(jonahHtml, /FEARED ×3/);

  // The lens toggle exists, is CSS-only, and P02 carries the emo class.
  assert.match(ruthHtml, /id="emolens"/);
  assert.match(ruthHtml, new RegExp('<div class="drill emo" id="P02"'));
  // P14 (genealogy) attests no emotion — it must NOT carry the class.
  assert.match(ruthHtml, new RegExp('<div class="drill" id="P14"'));

  // Data honesty: the pericope pages carry no emotion labels beyond what the
  // shards attest — spot: the words the mock hand-authored ("LAMENT_SCENE")
  // appear only where canon has them (P04), never on P01.
  const p01drill = ruthHtml.slice(ruthHtml.indexOf('id="P01"'), ruthHtml.indexOf('id="P02"'));
  assert.doesNotMatch(p01drill, /class="emorow"/, 'P01 attests no emotion — no chips');

  // Shard data carries the attestations (greppable provenance for the lens).
  const shard = JSON.parse(read(out, 'atlas/ruth.json'));
  const p02 = shard.nodes.find((n) => n.id === 'ruth/P02');
  assert.equal(p02.emotion_attested.KISSED, 3);
  const p14 = shard.nodes.find((n) => n.id === 'ruth/P14');
  assert.equal(p14.emotion_attested, null);

  // Method page: verbatim ruled wording.
  const method = read(out, 'atlas/emotion.html');
  for (const q of ['Frame of Mind', 'Influence of Relationship(s)', 'Expectation of the Event(s)',
    'Influence of Location(s)', 'Default Response to Emotion(s)', 'Underlying Values at Play']) {
    assert.ok(method.includes(q), `six questions verbatim: ${q}`);
  }
  assert.match(method, /method adopted 2026-07-02 · appraisal block piloting at Psalm 13/);
  assert.match(method, /trumps everything/);
  assert.match(method, /never in meaning-space/);
  assert.match(method, /diu\.edu\/documents\/theses\/Frost_Joshua-thesis\.pdf/);
  assert.doesNotMatch(method, /<script/i, 'method page ships no JS');

  // The mind carries Emotion mode + the renamed placeholder.
  const brain = fs.readFileSync(path.join(portalDir, 'assets', 'atlas-brain.js'), 'utf8');
  assert.match(brain, /"Mind", "Books", "Cast", "Concepts", "Emotion", "Growth"/);
  assert.match(read(out, 'atlas/index.html'), /placeholder="search the mind…"/);

  rmrf(out);
});

const FM_WITH_APPRAISAL = `---
type: "sta-for-model"
pericope: "P01"
pericope-title: "A test passage"
source-meaning-map: [[P01-Test]]
status: "valid"
pilot: "pilot-2"
---

# P01 — FOR_MODEL

\`\`\`json
{
  "sta_id": "test_p01",
  "header": { "bcv": "Ruth 9:1-5" },
  "pericope_classification": { "genre_group": "NARRATIVE", "genre": "HISTORICAL_NARRATIVE", "register": "INFORMAL_CASUAL" },
  "level_1": {},
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "9:1",
      "scene_kind": "OPENING_CHRONICLE_SCENE",
      "significant_absence": "Narrator never says what the speaker felt.",
      "emotion_appraisals": {
        "entries": [
          { "holder": "B2", "valued": "CB_0029", "emotion": "DISTRESS", "script_stage": "COMPLAINT", "evidence_anchor": "9:1" }
        ]
      }
    }
  ],
  "level_3_propositions": []
}
\`\`\`
`;

test('emotion Tier 2: a planted appraisal block renders badged and JUNIOR to the absence; no block → nothing', () => {
  const withBlock = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    'fixtures/for-model/P01-Test-FOR-MODEL.md': FM_WITH_APPRAISAL,
  });
  let out = path.join(withBlock, 'dist');
  assert.equal(runBuild(withBlock, out).status, 0);
  const page = read(out, 'atlas/ruth.html');
  assert.match(page, /pilotbadge/);
  assert.match(page, /DISTRESS/);
  assert.match(page, /evidence 9:1/);
  assert.match(page, /junior to the absence above/);
  // Seniority: the absence block precedes the appraisal block in the scene.
  const scene = page.slice(page.indexOf('id="P01"'));
  assert.ok(scene.indexOf('class="absence"') < scene.indexOf('class="appraisals"'),
    'significant_absence renders before (senior to) the appraisal');
  rmrf(withBlock);

  // Without the block: not a trace — absence of data is absence of claim.
  const without = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
  });
  out = path.join(without, 'dist');
  assert.equal(runBuild(without, out).status, 0);
  const clean = read(out, 'atlas/ruth.html');
  assert.doesNotMatch(clean, /pilotbadge|appraisals|PILOT/);
  rmrf(without);
});

test('naming ruling (Marcia, 2026-07-04): zero visible "Atlas" on any built page', { skip: !haveFixtures }, () => {
  // The section reads "Meaning Mind" everywhere a visitor reads; URLs, file
  // names and internals stay atlas-* by the same ruling (plumbing, not
  // reading). Pinned exactly like the Tripod-Brain pin.
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-naming-'));
  assert.equal(runBuild(repoRoot, out).status, 0);
  const walk = (d) => fs.readdirSync(d).flatMap((f) => {
    const p = path.join(d, f);
    return fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') ? [p] : [];
  });
  for (const page of walk(out)) {
    const visible = fs.readFileSync(page, 'utf8').replace(/<[^>]*>/g, ' ');
    assert.doesNotMatch(visible, /\b[Aa]tlas\b/, `visible "Atlas" on ${path.relative(out, page)}`);
  }
  // The ruled surfaces read Meaning Mind.
  const index = fs.readFileSync(path.join(out, 'atlas', 'index.html'), 'utf8');
  assert.match(index, /Tripod Method · Meaning Mind/);
  assert.match(index, /<title>Meaning Mind · /);
  // Reading Room home v2 (Marcia's ruling): the two rooms, explicit — the
  // switcher on the header and the Mind room card carrying the ruled phrase.
  const rrIndex = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  assert.match(rrIndex, /class="modeswitch"/);
  assert.match(rrIndex, /The whole seed corpus, connected/);
  assert.match(rrIndex, /Meaning Mind →/);
  // Tour ruling D: the trajectory count is computed, never hardcoded.
  const tours = fs.readFileSync(path.join(out, 'atlas', 'tours.html'), 'utf8');
  const g = JSON.parse(fs.readFileSync(path.join(out, 'atlas', 'global.json'), 'utf8'));
  const n = g.books.reduce((s, b) => s + b.counts.pericopes, 0);
  assert.ok(tours.includes(`${n} passages today.`), 'trajectory step counts from the data');
  assert.doesNotMatch(tours, /Nineteen passages/);
  // Tour 4 step 3 is likewise self-updating (Marcia's ruling): the arriving
  // book's cast count comes from the registry, never from prose.
  const arriving = g.books.find((b) => b.status !== 'complete');
  if (arriving) {
    assert.ok(tours.includes(`cast of ${arriving.counts.entities}`), 'arriving cast counts from the data');
    if (arriving.counts.maps) {
      assert.ok(tours.includes(`${arriving.counts.maps} of its maps have already landed`),
        'landed-maps clause counts actual maps, not pericope rows');
    }
  } else {
    assert.match(tours, /Every book here arrived the same way/);
  }
  assert.doesNotMatch(tours, /fifty-one|fifty-four/);
  assert.match(tours, /becomes a full spine by itself as its approved artifacts merge/);
  // The ruled portal title (Marcia, 2026-07-04), on both sides of the house.
  assert.match(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), /<title>Tripod Method Leg One: The Exegete Portal</);
  assert.match(index, /The Exegete Portal/);
  rmrf(out);
});

test('tours: the page reads complete without JS and ships only the vendored engine', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-tours-'));
  assert.equal(runBuild(repoRoot, out).status, 0);
  const tours = read(out, 'atlas/tours.html');

  // Never orphaned (found live by Marcia, 2026-07-04): the tours must be
  // reachable from the Mind HUD, the no-JS Mind index, and the Reading Room.
  const mindIndex = read(out, 'atlas/index.html');
  assert.match(mindIndex, /class="brandlinks"><a href="tours\.html">Guided tours/);
  assert.match(mindIndex, /<a href="tours\.html">four guided tours<\/a>/);
  assert.match(read(out, 'index.html'), /<a href="atlas\/tours\.html">Four guided tours<\/a>/);

  // Four tours, each a complete readable article (the no-JS fallback).
  assert.equal((tours.match(/<article class="tour"/g) || []).length, 4);
  for (const t of ['What is a Meaning Map?', 'From Map to Machine (STA)', 'How the vocabulary grows', 'The growing mind']) {
    assert.ok(tours.includes(t), `tour present: ${t}`);
  }
  assert.ok((tours.match(/class="tstep"/g) || []).length >= 20, 'every step readable inline');
  // Start buttons are hidden until the engine unhides them.
  assert.match(tours, /<button class="tstart" hidden/);
  // Vendored engine only; no external hosts in it.
  const scripts = tours.match(/<script[^>]*>/gi) ?? [];
  assert.deepEqual(scripts, ['<script src="../assets/atlas-tours.js" defer>']);
  const engine = fs.readFileSync(path.join(portalDir, 'assets', 'atlas-tours.js'), 'utf8');
  assert.doesNotMatch(engine, /https?:\/\//);
  assert.ok(fs.existsSync(path.join(out, 'assets', 'atlas-tours.js')));
  // Every step URL resolves inside the built site.
  for (const m of tours.matchAll(/data-url="([^"]+)"/g)) {
    const target = path.join(out, 'atlas', m[1].split('#')[0]);
    assert.ok(fs.existsSync(target), `step target exists: ${m[1]}`);
  }
  rmrf(out);
});
