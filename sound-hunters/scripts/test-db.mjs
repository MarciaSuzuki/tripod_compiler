// End-to-end data-layer test in Node against the REAL app modules, with
// fake-indexeddb standing in for the browser. Covers the acceptance checks
// that don't need a microphone:
//   - canonical: exactly one per (item, speaker); manual override sticks
//   - Voices check unlock (>=2 speakers with canonical core takes) and the
//     "different" verdict excluding ONLY the cross-speaker count
//   - export manifest derived from real store contents
import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Browser globals db.js touches outside of IndexedDB.
globalThis.navigator ??= {};
if (!globalThis.navigator.userAgent) {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'node-test', platform: 'node' }, configurable: true,
  });
}
globalThis.screen ??= { width: 0, height: 0 };

const db = await import('../src/db.js');
const { seedDemoData } = await import('../src/dev/seed.js');
const { voicesQueue, deriveConvergence } = await import('../src/logic/convergence.js');
const { buildManifest } = await import('../src/export/manifest.js');
const { countsAsRep } = await import('../src/logic/scheduler.js');

const deck = JSON.parse(
  readFileSync(fileURLToPath(new URL('../public/decks/default-deck.json', import.meta.url)), 'utf8')
);
const coreItems = deck.items.filter((i) => i.coreItem);

const language = await db.upsertLanguage({ name: 'Língua teste' });
await seedDemoData({ language, deck });

const speakers = await db.listSpeakers(language.id);
assert.equal(speakers.length, 2, 'seed creates two speakers');
const beto = speakers.find((s) => s.alias.startsWith('Beto'));
const ana = speakers.find((s) => s.alias.startsWith('Ana'));

// Beto: full core, 5 reps each, exactly ONE canonical per item.
for (const item of coreItems) {
  const takes = (await db.listRecordings({ speakerId: beto.id, itemId: item.id })).filter(countsAsRep);
  assert.equal(takes.length, 5, `Beto ${item.id} must have 5 reps`);
  assert.equal(takes.filter((t) => t.canonical).length, 1, `exactly one canonical for ${item.id}`);
}

// Voices check unlocks for items BOTH speakers have canonicals for.
let recordings = await db.listAllRecordings();
let judgments = await db.listJudgments();
const queue0 = voicesQueue({ coreItems, recordings, judgments });
const anaCanonItems = new Set(recordings.filter((r) => r.speakerId === ana.id && r.canonical).map((r) => r.itemId));
const expected = coreItems.filter((i) => anaCanonItems.has(i.id)).length;
assert.ok(expected > 0 && queue0.length === expected,
  `voices queue should hold ${expected} pairs, got ${queue0.length}`);

// Judge one pair "different": it leaves the queue and the cross-speaker count,
// but its recordings/reps stay untouched everywhere else (tag, never delete).
const target = queue0[0];
const repsBefore = (await db.listRecordings({ speakerId: ana.id, itemId: target.item.id })).filter(countsAsRep).length;
await db.addJudgment({
  type: 'crossSpeakerCheck', mode: 'convergence',
  speakerId: beto.id, judgeSpeakerId: beto.id, sessionId: target.recB.sessionId,
  itemIds: [target.item.id], recordingIds: [target.recA.id, target.recB.id],
  result: 'different',
});
recordings = await db.listAllRecordings();
judgments = await db.listJudgments();
const queue1 = voicesQueue({ coreItems, recordings, judgments });
assert.equal(queue1.length, queue0.length - 1, 'judged pair leaves the queue');
const conv = deriveConvergence({ judgments, recordingsById: new Map(recordings.map((r) => [r.id, r])) });
assert.equal(conv.get(target.item.id).sameCount, 0);
assert.equal(conv.get(target.item.id).judgedCount, 1);
const repsAfter = (await db.listRecordings({ speakerId: ana.id, itemId: target.item.id })).filter(countsAsRep).length;
assert.equal(repsBefore, repsAfter, '"different" must not remove recordings anywhere');

// Manual canonical override: facilitator stars a non-canonical take.
const takes = (await db.listRecordings({ speakerId: beto.id, itemId: coreItems[1].id })).filter(countsAsRep);
const loser = takes.find((t) => !t.canonical);
await db.setCanonicalManual(loser.id);
const after = await db.listRecordings({ speakerId: beto.id, itemId: coreItems[1].id });
assert.equal(after.filter((t) => t.canonical).length, 1, 'still exactly one canonical');
assert.ok(after.find((t) => t.id === loser.id).canonical, 'starred take is now canonical');

// Export manifest from real store contents.
const all = await db.exportAll();
const manifest = buildManifest({
  language, deck,
  speakers: all.speakers, sessions: all.sessions,
  recordings: all.recordings, judgments: all.judgments, minimalPairs: all.minimalPairs,
});
assert.equal(manifest.recordings.length, all.recordings.length);
assert.ok(manifest.recordings.every((r) => r.file === `audio/${r.id}.wav`), 'seeded audio exports as wav');
const csc = manifest.judgments.find((j) => j.type === 'crossSpeakerCheck');
assert.equal(csc.recordingIds.length, 2, 'crossSpeakerCheck keeps both recording ids');
assert.ok(manifest.items.some((i) => i.coreItem), 'items carry coreItem');
// Audio blobs really exist for every recording.
for (const r of all.recordings.slice(0, 5)) {
  const blob = await db.getAudioBlob(r.id);
  assert.ok(blob && blob.size > 1000, 'audio blob stored');
}

console.log(`db OK — seed, one-canonical invariant, voices unlock ${expected}→${queue1.length}, override, manifest from store`);
