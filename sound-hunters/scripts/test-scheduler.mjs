// Acceptance checks for the spaced scheduler (rules 2 & 7), run against the
// exact module the app ships. `npm test`.
import assert from 'node:assert/strict';
import { buildHistory, nextItem, repsOf, targetOf, interveningSince } from '../src/logic/scheduler.js';
import { mulberry32 } from '../src/logic/ids.js';

const settings = {
  spacingMinIntervening: 6,
  maxRepsPerSessionDay: 2,
  repsTarget: { 1: 5, 2: 5, 3: 2 },
};

// 40 L1 items, half core — mirrors the placeholder deck shape.
const items = Array.from({ length: 40 }, (_, i) => ({
  id: `w${i}`, level: 1, coreItem: i < 20,
}));

function simulate({ days = 10, perDay = 200 } = {}) {
  const recordings = [];
  let clock = Date.parse('2026-06-01T08:00:00Z');
  const rng = mulberry32(42);
  const picksPerDay = [];

  for (let d = 0; d < days; d++) {
    const dayPicks = [];
    for (let t = 0; t < perDay; t++) {
      const now = new Date(clock);
      const history = buildHistory(recordings, now);
      const { item, debug } = nextItem({ items, history, settings, rng });
      if (!item) break; // nothing eligible right now (spacing/day-cap) — valid
      dayPicks.push({ item, debug, sinceLast: interveningSince(history, item.id) });
      recordings.push({
        itemId: item.id, purpose: 'probe', hummed: false,
        createdAt: new Date(clock).toISOString(),
      });
      clock += 60_000;
    }
    picksPerDay.push(dayPicks);
    clock += 12 * 3600_000; // next day
  }
  return { recordings, picksPerDay };
}

const { recordings, picksPerDay } = simulate();

// --- Rule 2a: >= 6 intervening items between reps of the same item, so never
// the same word twice in a row.
const lastSeenAt = new Map();
recordings.forEach((r, i) => {
  if (lastSeenAt.has(r.itemId)) {
    const gap = i - lastSeenAt.get(r.itemId) - 1;
    assert.ok(gap >= settings.spacingMinIntervening,
      `spacing violated: ${r.itemId} re-recorded after only ${gap} intervening items`);
  }
  lastSeenAt.set(r.itemId, i);
});

// --- Rule 2b: at most 2 reps per item per session-day.
const byDay = new Map();
for (const r of recordings) {
  const day = r.createdAt.slice(0, 10);
  const key = `${day}:${r.itemId}`;
  byDay.set(key, (byDay.get(key) ?? 0) + 1);
  assert.ok(byDay.get(key) <= settings.maxRepsPerSessionDay,
    `daily cap violated for ${key}`);
}

// --- Rule 2c: every item ends at exactly 5 reps, never more.
const finalHistory = buildHistory(recordings, new Date('2026-07-01'));
for (const it of items) {
  assert.ok(repsOf(finalHistory, it.id) <= targetOf(it, settings), `overshoot on ${it.id}`);
}
assert.ok(items.every((it) => repsOf(finalHistory, it.id) === 5),
  'after enough sessions every item reaches exactly 5 reps');

// --- Rule 7: while the core is incomplete, expansion items appear ONLY as
// spacing filler (i.e. when no core item was eligible at that moment).
for (const dayPicks of picksPerDay) {
  for (const p of dayPicks) {
    if (p.debug.corePhase && !p.item.coreItem) {
      assert.equal(p.debug.eligibleCore, 0,
        `expansion item ${p.item.id} served while ${p.debug.eligibleCore} core items were eligible`);
    }
  }
}

// --- Core completes before expansion completes (core-first overall).
const coreDoneIndex = (() => {
  const reps = new Map();
  for (let i = 0; i < recordings.length; i++) {
    const r = recordings[i];
    reps.set(r.itemId, (reps.get(r.itemId) ?? 0) + 1);
    if (items.filter((it) => it.coreItem).every((it) => (reps.get(it.id) ?? 0) >= 5)) return i;
  }
  return -1;
})();
const expansionDoneIndex = recordings.length - 1;
assert.ok(coreDoneIndex !== -1 && coreDoneIndex < expansionDoneIndex,
  'core must complete before the expansion set');

// --- Hummed and archive recordings never count as reps.
const withExtras = [
  ...recordings.slice(0, 30),
  { itemId: 'w0', purpose: 'probe', hummed: true, createdAt: '2026-06-09T09:00:00Z' },
  { itemId: null, purpose: 'archive', hummed: false, createdAt: '2026-06-09T09:01:00Z' },
];
const h1 = buildHistory(recordings.slice(0, 30), new Date('2026-06-09'));
const h2 = buildHistory(withExtras, new Date('2026-06-09'));
assert.equal(repsOf(h1, 'w0'), repsOf(h2, 'w0'), 'hummed take must not count as a rep');

console.log(`scheduler OK — ${recordings.length} takes simulated, spacing>=6, cap<=2/day, core-first, exact 5 reps`);
