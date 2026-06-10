// Export contract check: manifest.json must match the agreed schema exactly
// (field names and only those fields), including coreItem on items and
// recordingIds on crossSpeakerCheck judgments.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildManifest } from '../src/export/manifest.js';

const deck = JSON.parse(
  readFileSync(fileURLToPath(new URL('../public/decks/default-deck.json', import.meta.url)), 'utf8')
);

const manifest = buildManifest({
  language: { id: 'lang_1', name: 'Demo' },
  deck,
  speakers: [{ id: 'spk_1', languageId: 'lang_1', alias: 'Ana', ageBand: '31–45', gender: 'feminino', consentAt: '2026-06-10T12:00:00Z' }],
  sessions: [{ id: 'ses_1', speakerId: 'spk_1', startedAt: '2026-06-10T12:01:00Z', deviceInfo: 'test-device' }],
  recordings: [{
    id: 'rec_1', itemId: 'w-sun', speakerId: 'spk_1', sessionId: 'ses_1', takeIndex: 1,
    purpose: 'probe', durationMs: 800, quality: 'ok', canonical: true, hummed: false,
    category: null, setId: null, attribution: null, reuseConsent: null,
    createdAt: '2026-06-10T12:02:00Z',
    // internal fields that must NOT leak:
    qualityScore: 33.2, canonicalManual: false, mimeType: 'audio/webm;codecs=opus',
  }],
  judgments: [{
    id: 'jdg_1', type: 'crossSpeakerCheck', mode: 'convergence', speakerId: 'spk_1',
    judgeSpeakerId: 'spk_1', sessionId: 'ses_1', itemIds: ['w-sun'],
    recordingIds: ['rec_1', 'rec_2'], result: 'same', dangerZone: false,
    createdAt: '2026-06-10T12:05:00Z',
  }],
  minimalPairs: [{
    id: 'mpc_1', itemA: 'w-sun', itemB: 'w-moon', differsBy: 'segment',
    confirmedBy: 'spk_1', sessionId: 'ses_1', recordingA: 'rec_1', recordingB: 'rec_2',
  }],
});

// Top-level shape.
assert.deepEqual(Object.keys(manifest).sort(), [
  'deckVersion', 'items', 'judgments', 'language', 'minimalPairCandidates',
  'recordings', 'sessions', 'speakers',
].sort());
assert.deepEqual(manifest.language, { id: 'lang_1', name: 'Demo' });
assert.equal(manifest.deckVersion, deck.version);

// Exact field sets per record type (schema fields, nothing internal).
assert.deepEqual(Object.keys(manifest.speakers[0]).sort(),
  ['id', 'alias', 'ageBand', 'gender', 'consentAt'].sort());
assert.deepEqual(Object.keys(manifest.sessions[0]).sort(),
  ['id', 'speakerId', 'startedAt', 'deviceInfo'].sort());
assert.deepEqual(Object.keys(manifest.items[0]).sort(),
  ['id', 'level', 'conceptGloss', 'imageRef', 'rootId', 'possessor', 'frame', 'coreItem'].sort());
assert.deepEqual(Object.keys(manifest.recordings[0]).sort(), [
  'id', 'itemId', 'speakerId', 'sessionId', 'takeIndex', 'purpose', 'file',
  'durationMs', 'quality', 'canonical', 'hummed', 'category', 'setId',
  'attribution', 'reuseConsent', 'createdAt',
].sort());
assert.deepEqual(Object.keys(manifest.judgments[0]).sort(), [
  'id', 'type', 'mode', 'speakerId', 'judgeSpeakerId', 'sessionId', 'itemIds',
  'recordingIds', 'result', 'dangerZone', 'createdAt',
].sort());
assert.deepEqual(Object.keys(manifest.minimalPairCandidates[0]).sort(), [
  'id', 'itemA', 'itemB', 'differsBy', 'confirmedBy', 'sessionId', 'recordingA', 'recordingB',
].sort());

// Internal fields stripped; file path derived from id + container.
assert.equal(manifest.recordings[0].file, 'audio/rec_1.webm');
assert.ok(!('qualityScore' in manifest.recordings[0]));
assert.ok(!('mimeType' in manifest.recordings[0]));
assert.ok(!('canonicalManual' in manifest.recordings[0]));
assert.ok(!('languageId' in manifest.speakers[0]));

// Deck invariants the spec calls out.
assert.ok(manifest.items.some((i) => i.coreItem === true), 'deck must flag core items');
const l1 = manifest.items.filter((i) => i.level === 1);
const core = l1.filter((i) => i.coreItem);
assert.ok(core.length >= l1.length * 0.4 && core.length <= l1.length * 0.6,
  `~half of Level-1 items must be core (got ${core.length}/${l1.length})`);
assert.ok(manifest.items.filter((i) => i.level === 2).every((i) => i.rootId && i.possessor));
assert.ok(manifest.items.filter((i) => i.level === 3)
  .every((i) => i.frame?.targetWordIds?.length === 2 &&
                i.frame.panels.every((p) => p.framePosition)));

// crossSpeakerCheck carries the two compared recording ids.
assert.equal(manifest.judgments[0].recordingIds.length, 2);

console.log(`manifest OK — schema-exact export, ${manifest.items.length} deck items (${core.length}/${l1.length} L1 core)`);
