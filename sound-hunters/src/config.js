// Tunable domain rules. Defaults follow the spec; the facilitator can change
// the scheduler knobs at runtime (Setup > Dev panel) — they are persisted in IndexedDB.
export const DEFAULT_SETTINGS = {
  // Rule 2 — spaced repetitions: an item re-enters the queue only after
  // >= spacingMinIntervening recordings of OTHER items by the same speaker.
  spacingMinIntervening: 6,
  // Rule 2 — at most N reps of the same item per session-day (calendar day).
  maxRepsPerSessionDay: 2,
  // Reps target per deck level. Rule 2 mandates 5 for Levels 1 & 2;
  // Level-3 "little sentences" default to 2 (not covered by the 5x rule).
  repsTarget: { 1: 5, 2: 5, 3: 2 },
  // Rule 6 — gentle quality gate windows (ms).
  wordGateMs: { min: 300, max: 4000 },   // Levels 1 & 2
  frameGateMs: { min: 500, max: 8000 },  // Level 3 little sentences
  archiveGateMs: { min: 500, max: 300000 }, // free area: only sanity bounds
  // Phase 2 round sizing (spec: 6–9 tiles).
  basketRoundTiles: { min: 6, max: 9 },
};

export const SETTINGS_KV_KEY = 'settings';

// Categories for the free "verbal art" area.
export const ARCHIVE_CATEGORIES = ['tongueTwister', 'song', 'story', 'riddle', 'other'];

// Basket sub-modes (Phase 2). `stub: true` modes are functional but their
// candidate pre-seeding / special UI is a placeholder (same data writes).
export const BASKET_MODES = [
  { mode: 'echo', baskets: 1 },          // ends alike / rhyme
  { mode: 'sameMouth', baskets: 1 },     // starts alike / alliteration
  { mode: 'rhythm', baskets: 1, hum: true }, // suprasegmental + "hum it" bonus
  { mode: 'twins', baskets: 1, preSeeded: true }, // very similar overall
  { mode: 'foreignerTrap', baskets: 1, dangerZone: true }, // facilitator-led
];
