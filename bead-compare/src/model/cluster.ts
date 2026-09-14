import type { Cluster, GroupingSettings, Tape } from "./types";

interface Run {
  start: number;
  end: number;
  u: number;
}

/** Run-length encode `u`: consecutive identical values become one run. */
export function runLengthEncode(u: number[]): Run[] {
  const runs: Run[] = [];
  for (let i = 0; i < u.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.u === u[i]) last.end = i + 1;
    else runs.push({ start: i, end: i + 1, u: u[i] });
  }
  return runs;
}

/**
 * Group a tape into clusters.
 *
 * 1. Run-length encode `u`.
 * 2. Any run shorter than `min_cluster_frames` merges into its left neighbour.
 *    Two exceptions keep short speech out of a pause where a speech neighbour
 *    exists:
 *    - a short run with no left neighbour merges into the right neighbour;
 *    - a short speech run whose left neighbour is a pause merges right when the
 *      right neighbour is speech (a short burst between two pauses still
 *      joins the left pause).
 *    A tape that is a single short run stays as one cluster.
 * 3. Clusters bounded by pause runs form phrases (pause clusters have phrase null).
 */
export function groupClusters(tape: Tape, settings: GroupingSettings): Cluster[] {
  const min = Math.max(1, Math.floor(settings.min_cluster_frames));
  const pause = tape.pause_unit;
  const isPause = (u: number) => pause !== undefined && u === pause;
  const runs = runLengthEncode(tape.u);

  const merged: Run[] = [];
  let pendingPrefix: Run | null = null; // a short first run waiting for a right neighbour
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const len = run.end - run.start;
    const left = merged[merged.length - 1];
    if (len >= min) {
      if (pendingPrefix) {
        merged.push({ start: pendingPrefix.start, end: run.end, u: run.u });
        pendingPrefix = null;
      } else {
        merged.push({ ...run });
      }
      continue;
    }
    // short run
    if (!left) {
      pendingPrefix = pendingPrefix
        ? { start: pendingPrefix.start, end: run.end, u: run.u }
        : { ...run };
      continue;
    }
    const right = runs[i + 1];
    const preferRight = !isPause(run.u) && isPause(left.u) && right !== undefined && !isPause(right.u);
    if (preferRight) {
      // fold this run into the right neighbour by extending the right run backwards
      runs[i + 1] = { start: run.start, end: right.end, u: right.u };
      continue;
    }
    left.end = run.end;
  }
  if (pendingPrefix) merged.push(pendingPrefix); // whole tape was short

  const clusters: Cluster[] = [];
  let phrase = 0;
  let sawSpeechInPhrase = false;
  for (let i = 0; i < merged.length; i++) {
    const r = merged[i];
    const p = isPause(r.u);
    if (p) {
      if (sawSpeechInPhrase) {
        phrase += 1;
        sawSpeechInPhrase = false;
      }
      clusters.push({ index: i, start: r.start, end: r.end, u: r.u, is_pause: true, phrase: null });
    } else {
      sawSpeechInPhrase = true;
      clusters.push({ index: i, start: r.start, end: r.end, u: r.u, is_pause: false, phrase });
    }
  }
  return clusters;
}

export function clusterFrames(c: Cluster): number {
  return c.end - c.start;
}

/** Find the cluster containing a frame, or null when out of range. */
export function clusterAtFrame(clusters: Cluster[], frame: number): Cluster | null {
  let lo = 0;
  let hi = clusters.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = clusters[mid];
    if (frame < c.start) hi = mid - 1;
    else if (frame >= c.end) lo = mid + 1;
    else return c;
  }
  return null;
}

/** Mean voiced F over a cluster, or null when the cluster is fully unvoiced. */
export function meanVoicedF(tape: Tape, c: Cluster): number | null {
  let sum = 0;
  let n = 0;
  for (let i = c.start; i < c.end; i++) {
    const f = tape.f[i];
    if (f > 0) {
      sum += f;
      n++;
    }
  }
  return n === 0 ? null : sum / n;
}
