// Twins-basket candidate pre-seeding.
//
// TODO(production): replace the body of findNeighbors with the real acoustic
// neighbor miner — e.g. cosine distance between self-supervised encoder
// embeddings (per candidate layer) of the canonical takes. Keep this exact
// interface so the miner drops in without touching the UI:
//
//   findNeighbors({ itemIds, seed, k }) -> [{ itemA, itemB, distance }]
//   sorted ascending by distance (most similar first).
//
// Prototype: deterministic pseudo-random distances (seeded), so rounds are
// stable within a session but obviously placeholder.

import { hashSeed, mulberry32 } from './ids.js';

export function findNeighbors({ itemIds, seed = 'proto', k = 8 }) {
  const rng = mulberry32(hashSeed(String(seed)));
  const pairs = [];
  for (let i = 0; i < itemIds.length; i++) {
    for (let j = i + 1; j < itemIds.length; j++) {
      pairs.push({ itemA: itemIds[i], itemB: itemIds[j], distance: rng() });
    }
  }
  pairs.sort((a, b) => a.distance - b.distance);
  return pairs.slice(0, k);
}
