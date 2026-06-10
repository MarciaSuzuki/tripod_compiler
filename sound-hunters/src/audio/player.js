// Rule 1 & 3 — audio is the object; every playback goes through here.
// Exactly one Audio element plays at a time (starting a new playback stops the
// previous one), and a tap plays a recording exactly once — no loops, no
// queueing the same take twice.

import { getAudioBlob } from '../db.js';

const urlCache = new Map(); // recordingId -> object URL
let current = null;         // the single live Audio element
let lastStart = { id: null, t: 0 };

export async function urlFor(recordingId) {
  if (urlCache.has(recordingId)) return urlCache.get(recordingId);
  const blob = await getAudioBlob(recordingId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(recordingId, url);
  return url;
}

export function invalidateUrl(recordingId) {
  const url = urlCache.get(recordingId);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(recordingId);
}

export function stopPlayback() {
  if (current) {
    current.pause();
    current.src = '';
    current = null;
  }
}

/**
 * Play one recording once. `volume` < 1 gives the soft drop-confirmation
 * replay (rule 1). Rapid double-fire of the same id is debounced (200 ms) so a
 * tap can never trigger two plays.
 */
export async function playRecording(recordingId, { volume = 1.0 } = {}) {
  if (!recordingId) return false;
  const now = performance.now();
  if (lastStart.id === recordingId && now - lastStart.t < 200) return false;
  lastStart = { id: recordingId, t: now };
  const url = await urlFor(recordingId);
  if (!url) return false;
  stopPlayback();
  const audio = new Audio(url);
  audio.volume = volume;
  current = audio;
  await audio.play().catch(() => {});
  return new Promise((resolve) => {
    audio.onended = () => { if (current === audio) current = null; resolve(true); };
    audio.onerror = () => { if (current === audio) current = null; resolve(false); };
  });
}
