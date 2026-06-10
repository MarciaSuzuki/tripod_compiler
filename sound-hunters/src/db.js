// IndexedDB persistence — ALL state and audio live here so a mid-session
// refresh loses nothing. Audio blobs are stored in their own store keyed by
// recording id; recording metadata stays light for dashboard queries.
//
// Internal-only fields on recordings (NOT exported in manifest.json):
//   qualityScore   – canonical auto-selection proxy (rule 3)
//   canonicalManual– facilitator override flag (review screen)
//   mimeType       – decides the file extension at export time

import { openDB } from 'idb';
import { newId } from './logic/ids.js';
import { pickCanonicalId } from './logic/canonical.js';

const DB_NAME = 'sound-hunters';
const DB_VERSION = 1;

let dbPromise = null;

export function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        d.createObjectStore('kv');
        d.createObjectStore('languages', { keyPath: 'id' });
        d.createObjectStore('speakers', { keyPath: 'id' })
          .createIndex('byLanguage', 'languageId');
        d.createObjectStore('sessions', { keyPath: 'id' })
          .createIndex('bySpeaker', 'speakerId');
        d.createObjectStore('decks', { keyPath: 'id' });
        const rec = d.createObjectStore('recordings', { keyPath: 'id' });
        rec.createIndex('bySpeaker', 'speakerId');
        rec.createIndex('byItem', 'itemId');
        rec.createIndex('byItemSpeaker', ['itemId', 'speakerId']);
        d.createObjectStore('audio'); // recordingId -> Blob
        d.createObjectStore('judgments', { keyPath: 'id' });
        d.createObjectStore('minimalPairs', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

// ---------- kv ----------
export async function kvGet(key) { return (await db()).get('kv', key); }
export async function kvSet(key, value) { return (await db()).put('kv', value, key); }

// ---------- languages / speakers / sessions ----------
export async function upsertLanguage(lang) {
  const l = { id: lang.id ?? newId('lang'), name: lang.name ?? '' };
  await (await db()).put('languages', l);
  return l;
}
export async function listLanguages() { return (await db()).getAll('languages'); }

export async function addSpeaker(sp) {
  const s = {
    id: newId('spk'),
    languageId: sp.languageId,
    alias: sp.alias ?? '',
    ageBand: sp.ageBand ?? '',
    gender: sp.gender ?? '',
    consentAt: sp.consentAt ?? null, // ISO timestamp set when consent box ticked
  };
  await (await db()).put('speakers', s);
  return s;
}
export async function getSpeaker(id) { return (await db()).get('speakers', id); }
export async function listSpeakers(languageId) {
  const all = await (await db()).getAll('speakers');
  return languageId ? all.filter((s) => s.languageId === languageId) : all;
}

function deviceInfoString() {
  const n = navigator;
  return `${n.platform ?? '?'} | ${n.userAgent} | screen ${screen.width}x${screen.height}`;
}

/** Rule 4 — sessionId + deviceInfo on every recording comes from here. */
export async function getOrCreateTodaySession(speakerId) {
  const d = await db();
  const all = await d.getAllFromIndex('sessions', 'bySpeaker', speakerId);
  const today = new Date().toDateString();
  const existing = all.find(
    (s) => new Date(s.startedAt).toDateString() === today &&
           s.deviceInfo === deviceInfoString()
  );
  if (existing) return existing;
  const s = {
    id: newId('ses'),
    speakerId,
    startedAt: new Date().toISOString(),
    deviceInfo: deviceInfoString(),
  };
  await d.put('sessions', s);
  return s;
}
export async function getSession(id) { return (await db()).get('sessions', id); }
export async function listSessions() { return (await db()).getAll('sessions'); }
export async function putSession(s) { return (await db()).put('sessions', s); }

// ---------- decks ----------
export async function saveDeck(deck) { await (await db()).put('decks', deck); return deck; }
export async function getDeckById(id) { return (await db()).get('decks', id); }
export async function listDecks() { return (await db()).getAll('decks'); }

// ---------- recordings + audio ----------
/**
 * Persist one take (metadata + blob), then recompute the canonical take for
 * its (item, speaker) — rule 3 keeps exactly one canonical at all times.
 */
export async function addRecording(meta, blob) {
  const d = await db();
  const rec = {
    id: newId('rec'),
    itemId: meta.itemId ?? null,
    speakerId: meta.speakerId,
    sessionId: meta.sessionId,
    takeIndex: meta.takeIndex ?? 1,
    purpose: meta.purpose, // 'probe' | 'archive' — rule 5, set at capture time
    durationMs: meta.durationMs ?? 0,
    quality: meta.quality ?? 'ok',
    canonical: false,
    hummed: meta.hummed ?? false,
    category: meta.category ?? null,
    setId: meta.setId ?? null,
    attribution: meta.attribution ?? null,
    reuseConsent: meta.reuseConsent ?? null,
    createdAt: meta.createdAt ?? new Date().toISOString(),
    // internal:
    qualityScore: meta.qualityScore ?? 0,
    canonicalManual: false,
    mimeType: meta.mimeType ?? 'audio/webm',
  };
  const tx = d.transaction(['recordings', 'audio'], 'readwrite');
  await tx.objectStore('recordings').put(rec);
  await tx.objectStore('audio').put(blob, rec.id);
  await tx.done;
  if (rec.itemId && rec.purpose === 'probe') {
    await recomputeCanonical(rec.itemId, rec.speakerId);
  }
  return (await d.get('recordings', rec.id));
}

export async function updateRecording(id, patch) {
  const d = await db();
  const rec = await d.get('recordings', id);
  if (!rec) return null;
  const next = { ...rec, ...patch };
  await d.put('recordings', next);
  return next;
}

export async function getRecording(id) { return (await db()).get('recordings', id); }
export async function getAudioBlob(recordingId) { return (await db()).get('audio', recordingId); }
export async function listAllRecordings() { return (await db()).getAll('recordings'); }

export async function listRecordings({ speakerId, itemId, purpose } = {}) {
  const d = await db();
  let recs;
  if (itemId && speakerId) {
    recs = await d.getAllFromIndex('recordings', 'byItemSpeaker', [itemId, speakerId]);
  } else if (speakerId) {
    recs = await d.getAllFromIndex('recordings', 'bySpeaker', speakerId);
  } else if (itemId) {
    recs = await d.getAllFromIndex('recordings', 'byItem', itemId);
  } else {
    recs = await d.getAll('recordings');
  }
  if (purpose) recs = recs.filter((r) => r.purpose === purpose);
  return recs;
}

/** Rule 3 — exactly one canonical per (item, speaker); manual override wins. */
export async function recomputeCanonical(itemId, speakerId) {
  const d = await db();
  const takes = await d.getAllFromIndex('recordings', 'byItemSpeaker', [itemId, speakerId]);
  const winner = pickCanonicalId(takes);
  const tx = d.transaction('recordings', 'readwrite');
  for (const t of takes) {
    const shouldBe = t.id === winner;
    if (t.canonical !== shouldBe) {
      await tx.store.put({ ...t, canonical: shouldBe });
    }
  }
  await tx.done;
  return winner;
}

/** Facilitator override from the canonical review screen. */
export async function setCanonicalManual(recordingId) {
  const d = await db();
  const rec = await d.get('recordings', recordingId);
  if (!rec) return;
  const takes = await d.getAllFromIndex('recordings', 'byItemSpeaker', [rec.itemId, rec.speakerId]);
  const tx = d.transaction('recordings', 'readwrite');
  for (const t of takes) {
    await tx.store.put({ ...t, canonicalManual: t.id === recordingId, canonical: t.id === recordingId });
  }
  await tx.done;
}

// ---------- judgments / minimal pairs ----------
export async function addJudgment(j) {
  const rec = {
    id: newId('jdg'),
    type: j.type,
    mode: j.mode ?? null,
    speakerId: j.speakerId,
    judgeSpeakerId: j.judgeSpeakerId ?? null,
    sessionId: j.sessionId,
    itemIds: j.itemIds ?? [],
    recordingIds: j.recordingIds ?? [],
    result: j.result ?? '',
    dangerZone: j.dangerZone ?? false,
    createdAt: new Date().toISOString(),
  };
  await (await db()).put('judgments', rec);
  return rec;
}
export async function listJudgments() { return (await db()).getAll('judgments'); }

export async function addMinimalPair(mp) {
  const rec = {
    id: newId('mpc'),
    itemA: mp.itemA,
    itemB: mp.itemB,
    differsBy: mp.differsBy, // 'segment' | 'rhythm' | 'unknown'
    confirmedBy: mp.confirmedBy,
    sessionId: mp.sessionId,
    recordingA: mp.recordingA,
    recordingB: mp.recordingB,
  };
  await (await db()).put('minimalPairs', rec);
  return rec;
}
export async function listMinimalPairs() { return (await db()).getAll('minimalPairs'); }

// ---------- export / wipe ----------
export async function exportAll() {
  const d = await db();
  return {
    languages: await d.getAll('languages'),
    speakers: await d.getAll('speakers'),
    sessions: await d.getAll('sessions'),
    decks: await d.getAll('decks'),
    recordings: await d.getAll('recordings'),
    judgments: await d.getAll('judgments'),
    minimalPairs: await d.getAll('minimalPairs'),
  };
}

export async function wipeAll() {
  const d = await db();
  const stores = ['kv', 'languages', 'speakers', 'sessions', 'decks', 'recordings', 'audio', 'judgments', 'minimalPairs'];
  const tx = d.transaction(stores, 'readwrite');
  await Promise.all(stores.map((s) => tx.objectStore(s).clear()));
  await tx.done;
}
