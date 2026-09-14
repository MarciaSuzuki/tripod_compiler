import type { Alignment, AlignmentSettings, AlignOp, Cluster } from "./types";

/**
 * Global alignment (Needleman–Wunsch) of two cluster sequences on U only.
 * Score: +match_score for equal U, -mismatch_penalty otherwise, -gap_penalty per gap.
 *
 * Memory: one Uint8Array traceback of (n+1)*(m+1) bytes plus two Int32 rows,
 * so a 5-minute recording at ~1 cluster / 100 ms (3000 clusters) costs ~9 MB.
 */
/**
 * Upper bound on the traceback table, in cells (= bytes). 200 MB is far
 * beyond any real pair of recordings (a 45-minute tape at ~1 cluster per
 * 100 ms is ~27 000 clusters, i.e. ~730 MB against itself only when the
 * grouping is set to 1 frame); above it the alignment refuses instead of
 * allocating until the tab dies.
 */
export const MAX_ALIGNMENT_CELLS = 200_000_000;

/** Thrown by alignClusters when the two cluster sequences are too long to align in memory. */
export class AlignmentTooLargeError extends Error {
  constructor(
    public readonly clustersA: number,
    public readonly clustersB: number,
  ) {
    super(`alignment too large: ${clustersA} x ${clustersB} clusters`);
    this.name = "AlignmentTooLargeError";
  }
}

export function alignClusters(
  a: Cluster[],
  b: Cluster[],
  settings: Pick<AlignmentSettings, "match_score" | "mismatch_penalty" | "gap_penalty">,
): Alignment {
  const n = a.length;
  const m = b.length;
  if ((n + 1) * (m + 1) > MAX_ALIGNMENT_CELLS) throw new AlignmentTooLargeError(n, m);
  const MATCH = settings.match_score;
  const MIS = -settings.mismatch_penalty;
  const GAP = -settings.gap_penalty;

  // traceback codes: 1 = diagonal, 2 = up (consume A only → delete_b), 3 = left (consume B only → insert_b)
  const W = m + 1;
  const trace = new Uint8Array((n + 1) * W);
  let prev = new Int32Array(W);
  let cur = new Int32Array(W);
  for (let j = 1; j <= m; j++) {
    prev[j] = j * GAP;
    trace[j] = 3;
  }
  for (let i = 1; i <= n; i++) {
    cur[0] = i * GAP;
    trace[i * W] = 2;
    const au = a[i - 1].u;
    for (let j = 1; j <= m; j++) {
      const diag = prev[j - 1] + (au === b[j - 1].u ? MATCH : MIS);
      const up = prev[j] + GAP;
      const left = cur[j - 1] + GAP;
      // Prefer diagonal on ties, then up, then left: keeps runs of matches contiguous.
      let best = diag;
      let code = 1;
      if (up > best) {
        best = up;
        code = 2;
      }
      if (left > best) {
        best = left;
        code = 3;
      }
      cur[j] = best;
      trace[i * W + j] = code;
    }
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }
  const score = prev[m];

  const ops: AlignOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const code = trace[i * W + j];
    if (i > 0 && j > 0 && code === 1) {
      ops.push({ kind: a[i - 1].u === b[j - 1].u ? "match" : "mismatch", a: i - 1, b: j - 1 });
      i--;
      j--;
    } else if (i > 0 && (code === 2 || j === 0)) {
      ops.push({ kind: "delete_b", a: i - 1, b: null });
      i--;
    } else {
      ops.push({ kind: "insert_b", a: null, b: j - 1 });
      j--;
    }
  }
  ops.reverse();
  return { ops, score };
}
