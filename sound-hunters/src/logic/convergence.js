// Rule 8 — cross-speaker convergence is verified, never assumed.
// "Voices check" judgments (type crossSpeakerCheck) decide, per core item and
// per unordered speaker pair, whether two speakers say the SAME word for the
// image. "different" only excludes the item from the cross-speaker set for
// that pair — the item stays valid for all within-speaker analyses.

export function pairKey(a, b) {
  return [a, b].sort().join('|');
}

/**
 * Latest verdict per (item, speaker pair).
 * @returns Map itemId -> { pairs: Map pairKey->'same'|'different', sameCount, judgedCount }
 */
export function deriveConvergence({ judgments, recordingsById }) {
  const byItem = new Map();
  const sorted = [...judgments]
    .filter((j) => j.type === 'crossSpeakerCheck')
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)); // later judgment wins
  for (const j of sorted) {
    const itemId = j.itemIds[0];
    const [ra, rb] = j.recordingIds.map((id) => recordingsById.get(id));
    if (!ra || !rb) continue;
    const key = pairKey(ra.speakerId, rb.speakerId);
    if (!byItem.has(itemId)) byItem.set(itemId, { pairs: new Map() });
    byItem.get(itemId).pairs.set(key, j.result);
  }
  for (const entry of byItem.values()) {
    entry.judgedCount = entry.pairs.size;
    entry.sameCount = [...entry.pairs.values()].filter((r) => r === 'same').length;
  }
  return byItem;
}

/**
 * Pending Voices-check queue: core items where >= 2 speakers have a canonical
 * take and at least one speaker pair has no verdict yet.
 * @returns [{ item, recA, recB }] — recA/recB are the two canonical recordings
 */
export function voicesQueue({ coreItems, recordings, judgments }) {
  const recordingsById = new Map(recordings.map((r) => [r.id, r]));
  const verdicts = deriveConvergence({ judgments, recordingsById });
  const queue = [];
  for (const item of coreItems) {
    const canons = recordings.filter((r) => r.itemId === item.id && r.canonical);
    for (let i = 0; i < canons.length; i++) {
      for (let j = i + 1; j < canons.length; j++) {
        const a = canons[i], b = canons[j];
        if (a.speakerId === b.speakerId) continue;
        const done = verdicts.get(item.id)?.pairs.has(pairKey(a.speakerId, b.speakerId));
        if (!done) queue.push({ item, recA: a, recB: b });
      }
    }
  }
  return queue;
}
