// Rule 3 — one canonical take per (item, speaker).
// Auto-selection proxy: highest trimmed-RMS-to-noise-floor ratio, no clipping
// (clipped takes are heavily penalized in qualityScore by audio/analysis.js).
// A facilitator override (canonicalManual) always wins.

import { countsAsRep } from './scheduler.js';

/** Takes eligible to be canonical: spoken probe recordings of the item. */
export function canonicalCandidates(recordings) {
  return recordings.filter(countsAsRep);
}

/**
 * @param takes recordings of ONE item by ONE speaker
 * @returns the recording id that must be canonical, or null
 */
export function pickCanonicalId(takes) {
  const cands = canonicalCandidates(takes);
  if (cands.length === 0) return null;
  const manual = cands.find((t) => t.canonicalManual);
  if (manual) return manual.id;
  const rank = (t) => (t.quality === 'ok' ? 0 : 1); // prefer gate-passing takes
  const best = [...cands].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (b.qualityScore ?? 0) - (a.qualityScore ?? 0) ||
      (a.createdAt < b.createdAt ? -1 : 1)
  )[0];
  return best.id;
}
