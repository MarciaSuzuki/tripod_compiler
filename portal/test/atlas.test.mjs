// Atlas-data exporter (Portal Atlas PR-1, spec §3) — the shards every Atlas
// view consumes. Real-tree assertions use FLOORS and INVARIANTS, never exact
// state pins, so the day new canon merges (e.g. SC-0079 turns Esther on) the
// deploy-gating suite stays green — the SC-0075 stale-assertion lesson.
// Exact-shape pins live in the synthetic-tree tests, where the tree is ours.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

import { portalDir, mkTree, mkMap, mkMeaningCoordinates, mkLog, runBuild, rmrf } from './helpers.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function assertUniqueIds(shard, name) {
  const ids = shard.nodes.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length, `duplicate node ids in ${name}`);
}

// ---- the real tree -----------------------------------------------------------

test('atlas: real tree exports shards with namespaced ids, real spans, honest statuses', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-atlas-real-'));
  const r = runBuild(repoRoot, out);
  assert.equal(r.status, 0, r.stderr);

  const g = readJson(path.join(out, 'atlas', 'global.json'));
  const shards = new Map(g.books.map((b) => [b.id, readJson(path.join(out, b.shard))]));

  // Book statuses are DERIVED (never hardcoded): the invariant, not today's state.
  for (const b of g.books) {
    const shard = shards.get(b.id);
    const pericopes = shard.nodes.filter((n) => n.kind === 'pericope');
    if (pericopes.length === 0) {
      assert.equal(b.status, 'registry-only', `${b.id}: no artifacts must mean registry-only`);
      assert.equal(shard.nodes.filter((n) => ['scene', 'proposition'].includes(n.kind)).length, 0);
    } else if (pericopes.every((p) => p.status === 'complete')) {
      assert.equal(b.status, 'complete');
    } else {
      assert.equal(b.status, 'compile-pending');
    }
    assertUniqueIds(shard, b.id);
  }

  // Today's floors (growth-safe): Ruth ≥14, Jonah ≥5 pericopes.
  const ruth = shards.get('ruth');
  assert.ok(ruth.nodes.filter((n) => n.kind === 'pericope').length >= 14);
  assert.ok(shards.get('jonah').nodes.filter((n) => n.kind === 'pericope').length >= 5);

  // THE namespacing bar (§4 V2 / §8.4): ruth/P13 the pericope and
  // ruth/P01/prop/P13 the proposition are different nodes.
  const p13 = ruth.nodes.find((n) => n.id === 'ruth/P13');
  const propP13 = ruth.nodes.find((n) => n.id === 'ruth/P01/prop/P13');
  assert.ok(p13 && propP13, 'both P13 nodes must exist');
  assert.equal(p13.kind, 'pericope');
  assert.equal(propP13.kind, 'proposition');

  // B10 (YHWH): referential forms + real appears_in spans (V3 bar data).
  const b10 = ruth.nodes.find((n) => n.id === 'ruth/B10');
  assert.equal(b10.english, 'YHWH');
  assert.equal(b10.referential_forms.length, 4);
  assert.ok(b10.appears_in.length >= 9);
  const b10Spans = ruth.edges.filter((e) => e.kind === 'appears_in' && e.from === 'ruth/B10');
  assert.ok(b10Spans.length >= 9, 'B10 span edges must materialize');
  for (const e of b10Spans) assert.ok(ruth.nodes.some((n) => n.id === e.to), `span to missing node ${e.to}`);

  // participates carries the register-critical axes (role · presence · referential_form).
  const elimelech = ruth.edges.find(
    (e) => e.kind === 'participates' && e.from === 'ruth/P01/S1' && e.to === 'ruth/B2'
  );
  assert.deepEqual(
    { role: elimelech.role, presence: elimelech.presence, referential_form: elimelech.referential_form },
    { role: 'HUSBAND', presence: 'PRESENT', referential_form: 'UNNAMED_MAN_FROM_BETHLEHEM' }
  );

  // significant_absence is load-bearing and must survive verbatim.
  const s1 = ruth.nodes.find((n) => n.id === 'ruth/P01/S1');
  assert.match(s1.significant_absence, /^Narrator never says YHWH sent the famine/);

  // flags: P01/P1 → CB_0029 + FIG_0007 (cross-shard ids into global).
  const p1Flags = ruth.edges.filter((e) => e.kind === 'flags' && e.from === 'ruth/P01/prop/P1').map((e) => e.to);
  assert.deepEqual(p1Flags.sort(), ['concept/CB_0029', 'figure/FIG_0007']);

  // inter-prop links: the P8 ↔ P13 paired_with figure (FIG_0052 envelope).
  assert.ok(
    ruth.edges.some(
      (e) => e.kind === 'prop-link' && e.link === 'paired_with' && e.from === 'ruth/P01/prop/P8' && e.to === 'ruth/P01/prop/P13'
    )
  );

  // uses-value: attested classification value, linked into the global vocab node.
  assert.ok(
    ruth.edges.some((e) => e.kind === 'uses-value' && e.from === 'ruth/P01' && e.to === 'vocab/proposition_kind/FAMINE_OCCURRED')
  );
  const famine = g.nodes.find((n) => n.id === 'vocab/proposition_kind/FAMINE_OCCURRED');
  assert.equal(famine.layer, 'L2-bounded-open');
  assert.ok(famine.sc_ref, 'bounded-open value carries its admitting SC');
  assert.ok(g.edges.some((e) => e.kind === 'introduced-by' && e.from === famine.id && e.to === `sc/${famine.sc_ref}`));

  // Unresolved refs are honest, never silent: every one keeps its canon ref
  // and a null target. (Today: canon's deliberate `B?` unknown-being marker +
  // three TH_* phrase-objects staged in scenes but absent from the registry
  // pin — a surfaced drift, reported in the PR, not fixed here.)
  for (const shard of shards.values()) {
    for (const e of shard.edges.filter((x) => x.unresolved)) {
      assert.equal(e.to, null);
      assert.ok(e.ref, 'unresolved edge must carry the raw canon ref');
    }
  }

  // Global registry counts: floors (they only grow, via deliberate re-pins).
  assert.ok(g.counts.concepts >= 58);
  assert.ok(g.counts.figures >= 126);
  assert.ok(g.counts.sc_rulings >= 77); // 78 allocated ids; SC-0028 has no ledger row
  const axis = Object.fromEntries(g.vocabulary.axes.map((a) => [a.axis, a]));
  assert.equal(axis.register.approved, 7); // the pinned L1 list — changes only by SC
  assert.equal(axis.genre_group.approved, 4);
  assert.ok(axis.speech_act.approved >= 33);
  assert.ok(axis.genre.approved >= 31);
  assert.ok(axis.proposition_kind.approved >= 86);
  assert.ok(g.vocabulary.axes.length >= 13);

  // Manifest provenance: every atlas file listed, sha-exact, with real sources.
  const manifest = readJson(path.join(out, 'build-manifest.json'));
  assert.equal(manifest.atlas.length, g.books.length + 1);
  for (const entry of manifest.atlas) {
    const emitted = fs.readFileSync(path.join(out, entry.path), 'utf8');
    assert.equal(entry.sha256, crypto.createHash('sha256').update(emitted).digest('hex'), `${entry.path} sha mismatch`);
    assert.ok(entry.sources.length > 0, `${entry.path} has no sources`);
    for (const s of entry.sources) assert.ok(s.path && s.sha256, `${entry.path} source missing path/sha`);
  }
  const ruthEntry = manifest.atlas.find((e) => e.path === 'atlas/ruth.json');
  assert.ok(ruthEntry.sources.some((s) => s.path === '_spec/registry/ruth.aliases.json'));
  assert.ok(ruthEntry.sources.some((s) => s.path.startsWith('fixtures/meaning-coordinates/P01')));
  assert.equal(g.generated.commit, manifest.commit);

  rmrf(out);
});

// ---- synthetic trees: exact-shape pins ----------------------------------------

const MC_RICH = `---
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
  "header": { "bcv": "Ruth 9:1-5", "source_meaning_map_ref": "P01-Test" },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "scene_level": [ { "scene_id": "S1", "override_value": "INTIMATE" } ],
      "moment_level": [ { "verse": "9:1a", "framing_override": "COMMUNITY_MEMORY" } ]
    }
  },
  "level_1": { "arc_elements": ["AFFLICTION"] },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "9:1",
      "scene_kind": "OPENING_CHRONICLE_SCENE",
      "scene_communicative_purpose": "test",
      "beings_in_scene": { "entries": [
        { "being_id": "B2", "role_in_scene": "HUSBAND", "presence": "PRESENT", "referential_form": "UNNAMED_MAN" },
        { "being_id": "B?", "role_in_scene": "MYSTERY", "presence": "REFERENCED" }
      ] },
      "objects_in_scene": { "entries": [ { "object_id": "CB_0029" } ] },
      "times_in_scene": { "entries": null },
      "significant_absence": "Nothing is said about the cause."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "9:1a",
      "proposition_kind": "TIME_ANCHOR_ESTABLISHED",
      "event_specific_slots": {
        "components": [ { "action": "UNAPPROVED_ACTION", "speech_act": "STATES_AS_TRUE", "status": "REALIZED" } ]
      },
      "inter_proposition_links": { "forward_link_to": "P2", "paired_with": "P9" },
      "cb_flags": ["CB_0029"],
      "figure_flags": ["FIG_0007"]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "9:1b",
      "proposition_kind": "FAMINE_OCCURRED",
      "event_specific_slots": {},
      "inter_proposition_links": { "caused_by": "P1" },
      "cb_flags": [],
      "figure_flags": []
    }
  ]
}
\`\`\`
`;

test('atlas: synthetic tree pins the exact graph shape (overrides, slots walk, unresolved links)', () => {
  const root = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    'fixtures/meaning-coordinates/P01-Test-MEANING-COORDINATES.md': MC_RICH,
    'fixtures/compilation-log/P01-Test-COMPILATION-LOG.md': mkLog('P01'),
  });
  const out = path.join(root, 'dist');
  const r = runBuild(root, out);
  assert.equal(r.status, 0, r.stderr);

  const ruth = readJson(path.join(out, 'atlas', 'ruth.json'));
  assertUniqueIds(ruth, 'ruth');

  // Book + pericope status derivation.
  assert.equal(ruth.book.status, 'complete');
  assert.equal(ruth.nodes.find((n) => n.id === 'ruth/P01').status, 'complete');

  // Overrides normalized: facts kept, _note dropped, canon spelling intact.
  const pericope = ruth.nodes.find((n) => n.id === 'ruth/P01');
  assert.deepEqual(pericope.register_overrides, {
    scene_level: [{ scene_id: 'S1', override_value: 'INTIMATE' }],
    moment_level: [{ verse: '9:1a', framing_override: 'COMMUNITY_MEMORY' }],
  });

  // uses-value: closed-list values resolve to L1-closed nodes; the unapproved
  // action is attested-only — visible drift, never relabeled.
  const uses = ruth.edges.filter((e) => e.kind === 'uses-value' && e.from === 'ruth/P01').map((e) => e.to);
  for (const expected of [
    'vocab/genre_group/NARRATIVE',
    'vocab/register/INFORMAL_CASUAL',
    'vocab/register/INTIMATE',
    'vocab/narrative_framing/COMMUNITY_MEMORY',
    'vocab/arc_element/AFFLICTION',
    'vocab/scene_kind/OPENING_CHRONICLE_SCENE',
    'vocab/proposition_kind/TIME_ANCHOR_ESTABLISHED',
    'vocab/speech_act/STATES_AS_TRUE',
    'vocab/action/UNAPPROVED_ACTION',
    'vocab/status/REALIZED',
    'vocab/role_in_scene_being/HUSBAND',
    'vocab/presence_value/PRESENT',
  ]) {
    assert.ok(uses.includes(expected), `missing uses-value ${expected}`);
  }
  const g = readJson(path.join(out, 'atlas', 'global.json'));
  assert.equal(g.nodes.find((n) => n.id === 'vocab/register/INTIMATE').layer, 'L1-closed');
  assert.equal(g.nodes.find((n) => n.id === 'vocab/action/UNAPPROVED_ACTION').layer, 'attested-only');
  assert.equal(g.nodes.find((n) => n.id === 'vocab/proposition_kind/TIME_ANCHOR_ESTABLISHED').layer, 'L2-bounded-open');

  // participates: a concept staged as scene object resolves into global;
  // canon's B? marker stays as an honest unresolved edge.
  assert.ok(ruth.edges.some((e) => e.kind === 'participates' && e.from === 'ruth/P01/S1' && e.to === 'concept/CB_0029'));
  const mystery = ruth.edges.find((e) => e.kind === 'participates' && e.ref === 'B?');
  assert.equal(mystery.to, null);
  assert.equal(mystery.unresolved, true);
  assert.equal(mystery.role, 'MYSTERY');

  // prop-links: resolvable ones bind; the dangling paired_with P9 is flagged.
  assert.ok(ruth.edges.some((e) => e.kind === 'prop-link' && e.link === 'forward_link_to' && e.from === 'ruth/P01/prop/P1' && e.to === 'ruth/P01/prop/P2'));
  assert.ok(ruth.edges.some((e) => e.kind === 'prop-link' && e.link === 'caused_by' && e.from === 'ruth/P01/prop/P2' && e.to === 'ruth/P01/prop/P1'));
  const dangling = ruth.edges.find((e) => e.kind === 'prop-link' && e.ref === 'P9');
  assert.equal(dangling.to, null);
  assert.equal(dangling.unresolved, true);

  // contains chain: book → pericope → scene → prop.
  for (const [from, to] of [
    ['ruth', 'ruth/P01'],
    ['ruth/P01', 'ruth/P01/S1'],
    ['ruth/P01/S1', 'ruth/P01/prop/P1'],
  ]) {
    assert.ok(ruth.edges.some((e) => e.kind === 'contains' && e.from === from && e.to === to), `missing contains ${from} → ${to}`);
  }

  rmrf(root);
});

test('atlas: Esther flips by data alone — registry-only → compile-pending → complete', () => {
  // No Esther artifacts: registry-only, cast browsable, zero artifact content.
  const bare = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    'fixtures/meaning-coordinates/P01-Test-MEANING-COORDINATES.md': mkMeaningCoordinates('P01'),
    'fixtures/compilation-log/P01-Test-COMPILATION-LOG.md': mkLog('P01'),
  });
  let out = path.join(bare, 'dist');
  assert.equal(runBuild(bare, out).status, 0);
  let esther = readJson(path.join(out, 'atlas', 'esther.json'));
  assert.equal(esther.book.status, 'registry-only');
  assert.ok(esther.nodes.some((n) => n.id === 'esther/B19'));
  assert.equal(esther.nodes.filter((n) => ['pericope', 'scene', 'proposition'].includes(n.kind)).length, 0);
  assert.equal(esther.edges.filter((e) => e.kind === 'appears_in').length, 0, 'no span edges without pericope nodes');
  rmrf(bare);

  // Map lands alone: compile-pending, honestly.
  const pending = mkTree({
    'fixtures/meaning-map/E01-Test.md': mkMap('E01', { bcv: 'Esther 1:1-9' }),
  });
  out = path.join(pending, 'dist');
  assert.equal(runBuild(pending, out).status, 0);
  esther = readJson(path.join(out, 'atlas', 'esther.json'));
  assert.equal(esther.book.status, 'compile-pending');
  assert.equal(esther.nodes.find((n) => n.id === 'esther/E01').status, 'compile-pending');
  rmrf(pending);

  // Full triple: complete, and B19's appears_in span materializes as an edge.
  const done = mkTree({
    'fixtures/meaning-map/E01-Test.md': mkMap('E01', { bcv: 'Esther 1:1-9' }),
    'fixtures/meaning-coordinates/E01-Test-MEANING-COORDINATES.md': mkMeaningCoordinates('E01'),
    'fixtures/compilation-log/E01-Test-COMPILATION-LOG.md': mkLog('E01'),
  });
  out = path.join(done, 'dist');
  assert.equal(runBuild(done, out).status, 0);
  esther = readJson(path.join(out, 'atlas', 'esther.json'));
  assert.equal(esther.book.status, 'complete');
  assert.ok(esther.edges.some((e) => e.kind === 'appears_in' && e.from === 'esther/B19' && e.to === 'esther/E01'));
  rmrf(done);
});

test('atlas BITE: a registry source smuggled from _working/ kills the build — exit 2, nothing written', () => {
  const root = mkTree({
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    '_working/evil.json': JSON.stringify({ book: 'RUTH', entities: { B666: { english: 'Not canon', kind: 'PERSON' } } }),
  });
  // Replace the blessed aliases file with a symlink into _working/.
  const target = path.join(root, '_spec', 'registry', 'ruth.aliases.json');
  fs.rmSync(target);
  fs.symlinkSync(path.join(root, '_working', 'evil.json'), target);

  const out = path.join(root, 'dist');
  const r = runBuild(root, out);
  assert.equal(r.status, 2, `expected gate exit 2, got ${r.status}: ${r.stderr}`);
  assert.match(r.stderr, /_working/);
  assert.ok(!fs.existsSync(out), 'nothing may be written on a gate violation');
  rmrf(root);
});

test('atlas BITE: a source escaping the repo root entirely also dies (exit 2)', () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-outside-'));
  fs.writeFileSync(path.join(outside, 'rules.json'), '{}');
  const root = mkTree({ 'fixtures/meaning-map/P01-Test.md': mkMap('P01') });
  const target = path.join(root, '_spec', 'validation-rules.json');
  fs.rmSync(target);
  fs.symlinkSync(path.join(outside, 'rules.json'), target);

  const out = path.join(root, 'dist');
  const r = runBuild(root, out);
  assert.equal(r.status, 2, `expected gate exit 2, got ${r.status}: ${r.stderr}`);
  assert.ok(!fs.existsSync(out), 'nothing may be written on a gate violation');
  rmrf(root);
  rmrf(outside);
});

test('atlas: identical inputs → byte-identical shards (deterministic export)', () => {
  const tree = {
    'fixtures/meaning-map/P01-Test.md': mkMap('P01'),
    'fixtures/meaning-coordinates/P01-Test-MEANING-COORDINATES.md': mkMeaningCoordinates('P01'),
    'fixtures/compilation-log/P01-Test-COMPILATION-LOG.md': mkLog('P01'),
  };
  const a = mkTree(tree);
  const b = mkTree(tree);
  assert.equal(runBuild(a, path.join(a, 'dist')).status, 0);
  assert.equal(runBuild(b, path.join(b, 'dist')).status, 0);
  for (const f of ['ruth.json', 'jonah.json', 'esther.json', 'global.json']) {
    assert.equal(
      fs.readFileSync(path.join(a, 'dist', 'atlas', f), 'utf8'),
      fs.readFileSync(path.join(b, 'dist', 'atlas', f), 'utf8'),
      `${f} differs between identical builds`
    );
  }
  rmrf(a);
  rmrf(b);
});
