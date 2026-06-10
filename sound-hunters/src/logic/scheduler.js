// Spaced scheduler — Core domain rules 2 and 7.
//
// Rule 2: each Level-1/2 item is recorded 5x by the same speaker, never
// back-to-back: an item re-enters the queue only after >= N other items have
// intervened (default 6), and at most M reps of the same item per session-day
// (default 2). Both knobs are configurable (settings).
//
// Rule 7: while a speaker's calibration core (Level-1 items with coreItem:true)
// is incomplete, core items are served first; expansion items appear only as
// spacing filler (i.e. when no core item is currently eligible).
//
// Pure functions over plain data so the acceptance checks run in Node
// (scripts/test-scheduler.mjs) against the exact code the app ships.

import { todayKey } from './ids.js';

// Recordings that count as "reps" for scheduling: spoken probe takes.
// Hummed takes (rhythm-basket bonus) and archive recordings never count.
export function countsAsRep(rec) {
  return rec.purpose === 'probe' && !rec.hummed;
}

/**
 * Build the speaker's scheduling history from their recordings.
 * @param recordings all recordings by ONE speaker, any order
 * @param now Date (for the session-day cap)
 */
export function buildHistory(recordings, now = new Date()) {
  const reps = recordings.filter(countsAsRep)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  const repCount = new Map();
  const lastIndex = new Map(); // index in `reps` of the item's most recent take
  const todayCount = new Map();
  const today = todayKey(now);
  reps.forEach((r, i) => {
    repCount.set(r.itemId, (repCount.get(r.itemId) ?? 0) + 1);
    lastIndex.set(r.itemId, i);
    if (todayKey(new Date(r.createdAt)) === today) {
      todayCount.set(r.itemId, (todayCount.get(r.itemId) ?? 0) + 1);
    }
  });
  return { repCount, lastIndex, todayCount, total: reps.length };
}

export function repsOf(history, itemId) {
  return history.repCount.get(itemId) ?? 0;
}

export function targetOf(item, settings) {
  return settings.repsTarget[item.level] ?? 5;
}

/** Recordings of OTHER items since this item's last take (∞ if never taken). */
export function interveningSince(history, itemId) {
  const last = history.lastIndex.get(itemId);
  if (last === undefined) return Infinity;
  return history.total - 1 - last;
}

function itemEligibility(item, history, settings) {
  const need = targetOf(item, settings) - repsOf(history, item.id);
  const today = history.todayCount.get(item.id) ?? 0;
  const since = interveningSince(history, item.id);
  return {
    need,
    today,
    since,
    eligible:
      need > 0 &&
      today < settings.maxRepsPerSessionDay &&
      since >= settings.spacingMinIntervening,
  };
}

/** True while any core item still needs reps (drives core-first priority). */
export function coreRemaining(items, history, settings) {
  return items.some(
    (it) => it.coreItem && repsOf(history, it.id) < targetOf(it, settings)
  );
}

/**
 * Pick the next item to elicit.
 * @param items deck items already filtered to the active level scope
 *   (pass ALL levels for the default "auto" queue)
 * @returns { item, debug } — item is null when nothing is eligible right now
 *   (everything complete or spaced out: the UI shows a "done for now" state).
 */
export function nextItem({ items, history, settings, rng = Math.random }) {
  const rows = items.map((it) => ({ it, ...itemEligibility(it, history, settings) }));
  const eligible = rows.filter((r) => r.eligible);
  const corePhase = coreRemaining(items, history, settings);
  let pool = eligible;
  if (corePhase) {
    const core = eligible.filter((r) => r.it.coreItem);
    // Expansion items are used ONLY as spacing filler while the core is open.
    pool = core.length > 0 ? core : eligible.filter((r) => !r.it.coreItem);
  }
  const pick = pool.length ? pool[Math.floor(rng() * pool.length)].it : null;
  return {
    item: pick,
    debug: {
      corePhase,
      eligibleCore: eligible.filter((r) => r.it.coreItem).length,
      eligibleExpansion: eligible.filter((r) => !r.it.coreItem).length,
      usedFiller: corePhase && pick ? !pick.coreItem : false,
      rows: rows.map((r) => ({
        itemId: r.it.id,
        core: !!r.it.coreItem,
        reps: repsOf(history, r.it.id),
        target: targetOf(r.it, settings),
        sinceLast: r.since === Infinity ? null : r.since,
        today: r.today,
        eligible: r.eligible,
      })),
    },
  };
}
