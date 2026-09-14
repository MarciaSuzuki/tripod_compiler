import { meanVoicedF } from "./cluster";
import type {
  Alignment,
  AlignmentSettings,
  Cluster,
  CompareSummary,
  FrameRange,
  Region,
  RegionKind,
  Tape,
} from "./types";

type OpClass = RegionKind | null;

/** Classify every alignment column: null means a clean match. */
export function classifyOps(
  alignment: Alignment,
  a: Cluster[],
  b: Cluster[],
  tapeA: Tape,
  tapeB: Tape,
  settings: Pick<AlignmentSettings, "melody_threshold">,
): OpClass[] {
  return alignment.ops.map((op) => {
    switch (op.kind) {
      case "mismatch":
        return "substituted";
      case "insert_b":
        return "inserted";
      case "delete_b":
        return "deleted";
      case "match": {
        const ca = a[op.a as number];
        const cb = b[op.b as number];
        if (ca.is_pause || cb.is_pause) return null;
        const fa = meanVoicedF(tapeA, ca);
        const fb = meanVoicedF(tapeB, cb);
        if (fa === null || fb === null) return null;
        return Math.abs(fa - fb) > settings.melody_threshold ? "melody" : null;
      }
    }
  });
}

function rangeOf(
  ops: Alignment["ops"],
  from: number,
  to: number,
  side: "a" | "b",
  clusters: Cluster[],
  totalFrames: number,
): FrameRange {
  let start = Infinity;
  let end = -Infinity;
  for (let k = from; k <= to; k++) {
    const ci = ops[k][side];
    if (ci === null) continue;
    const c = clusters[ci];
    if (c.start < start) start = c.start;
    if (c.end > end) end = c.end;
  }
  if (start !== Infinity) return { start, end };
  // No frames on this side: a point just after the previous cluster on this side.
  let point = 0;
  for (let k = from - 1; k >= 0; k--) {
    const ci = ops[k][side];
    if (ci !== null) {
      point = clusters[ci].end;
      break;
    }
  }
  return { start: Math.min(point, totalFrames), end: Math.min(point, totalFrames) };
}

function kindOfGroup(classes: OpClass[], from: number, to: number): RegionKind {
  const seen = new Set<RegionKind>();
  for (let k = from; k <= to; k++) {
    const c = classes[k];
    if (c) seen.add(c);
  }
  if (seen.size === 1) return [...seen][0];
  if (seen.has("substituted") || (seen.has("inserted") && seen.has("deleted"))) return "substituted";
  if (seen.has("inserted")) return "inserted";
  if (seen.has("deleted")) return "deleted";
  return "melody";
}

/**
 * Turn an alignment into difference regions, then merge regions separated by
 * fewer than `merge_gap_frames` matched B frames so the consultant sees a few
 * meaningful spans rather than confetti. The matched material between merged
 * regions becomes part of the region.
 */
export function buildRegions(
  alignment: Alignment,
  a: Cluster[],
  b: Cluster[],
  tapeA: Tape,
  tapeB: Tape,
  settings: Pick<AlignmentSettings, "merge_gap_frames" | "melody_threshold">,
): Region[] {
  const ops = alignment.ops;
  const classes = classifyOps(alignment, a, b, tapeA, tapeB, settings);

  // 1. raw groups of consecutive non-clean ops
  const groups: Array<{ from: number; to: number }> = [];
  for (let k = 0; k < classes.length; k++) {
    if (classes[k] === null) continue;
    const last = groups[groups.length - 1];
    if (last && last.to === k - 1) last.to = k;
    else groups.push({ from: k, to: k });
  }

  // 2. merge groups separated by too few matched B frames
  const merged: Array<{ from: number; to: number }> = [];
  for (const g of groups) {
    const last = merged[merged.length - 1];
    if (last) {
      let between = 0;
      for (let k = last.to + 1; k < g.from; k++) {
        const bi = ops[k].b;
        if (bi !== null) between += b[bi].end - b[bi].start;
      }
      if (between < settings.merge_gap_frames) {
        last.to = g.to;
        continue;
      }
    }
    merged.push({ ...g });
  }

  return merged.map((g, index) => ({
    index,
    kind: kindOfGroup(classes, g.from, g.to),
    a: rangeOf(ops, g.from, g.to, "a", a, tapeA.u.length),
    b: rangeOf(ops, g.from, g.to, "b", b, tapeB.u.length),
    op_start: g.from,
    op_end: g.to,
  }));
}

/** Stable key for a region, used to store verdicts across re-computation. */
export function regionKey(r: Region): string {
  return `${r.kind}|a:${r.a.start}-${r.a.end}|b:${r.b.start}-${r.b.end}`;
}

export function computeSummary(
  alignment: Alignment,
  b: Cluster[],
  tapeB: Tape,
  regions: Region[],
): CompareSummary {
  let matched = 0;
  for (const op of alignment.ops) {
    if (op.kind === "match" && op.b !== null) matched += b[op.b].end - b[op.b].start;
  }
  const total = tapeB.u.length;
  let changedFrames = 0;
  for (const r of regions) changedFrames += Math.max(r.a.end - r.a.start, r.b.end - r.b.start);
  return {
    region_count: regions.length,
    changed_seconds: changedFrames / tapeB.frame_rate,
    stability: total === 0 ? 100 : Math.round((matched / total) * 1000) / 10,
    matched_b_frames: matched,
    total_b_frames: total,
  };
}

/**
 * Whether two frame ranges share material. A zero-length range (a pure
 * insertion or deletion point) counts only when it lies strictly inside the
 * other range: a point sitting exactly on a range's boundary touches it but
 * does not change it, so a fix request on a cluster that merely borders an
 * inserted or deleted cluster is not reported as "changed here".
 */
export function rangesOverlap(x: FrameRange, y: FrameRange): boolean {
  if (x.start === x.end) return y.start < x.start && x.start < y.end;
  if (y.start === y.end) return x.start < y.start && y.start < x.end;
  return x.start < y.end && y.start < x.end;
}
