import { clusterAtFrame } from "./cluster";
import { rangesOverlap } from "./regions";
import type { Alignment, CarriedComment, Cluster, Comment, Region, Span } from "./types";

/** Maps A frames onto B frames through a cluster alignment. */
export class FrameMapper {
  private opOfA: Int32Array;

  constructor(
    private a: Cluster[],
    private b: Cluster[],
    private alignment: Alignment,
    private aFrames: number,
    private bFrames: number,
  ) {
    this.opOfA = new Int32Array(a.length).fill(-1);
    alignment.ops.forEach((op, k) => {
      if (op.a !== null) this.opOfA[op.a] = k;
    });
  }

  /** B position just after the last B cluster seen at or before op k. */
  private bPointBefore(k: number): number {
    for (let q = k; q >= 0; q--) {
      const bi = this.alignment.ops[q].b;
      if (bi !== null) return this.b[bi].end;
    }
    return 0;
  }

  /** Map one A frame (0..aFrames inclusive) to a B frame (0..bFrames inclusive). */
  mapFrame(frame: number): number {
    if (this.aFrames === 0 || this.a.length === 0) return 0;
    if (frame >= this.aFrames) return this.bFrames;
    if (frame < 0) return 0;
    const ca = clusterAtFrame(this.a, frame);
    if (!ca) return 0;
    const k = this.opOfA[ca.index];
    const op = this.alignment.ops[k];
    if (op.b === null) return Math.min(this.bPointBefore(k), this.bFrames);
    const cb = this.b[op.b];
    const rel = (frame - ca.start) / (ca.end - ca.start);
    return Math.min(cb.start + Math.floor(rel * (cb.end - cb.start)), this.bFrames);
  }

  /**
   * Map an exclusive end frame. Unlike mapFrame, an end that closes a cluster
   * closes the matching B cluster, so a span at the tail of A does not swallow
   * material inserted after it in B.
   */
  mapEnd(end: number): number {
    if (end <= 0 || this.aFrames === 0 || this.a.length === 0) return 0;
    const last = Math.min(end, this.aFrames) - 1;
    const ca = clusterAtFrame(this.a, last);
    if (!ca) return 0;
    const k = this.opOfA[ca.index];
    const op = this.alignment.ops[k];
    if (op.b === null) return Math.min(this.bPointBefore(k), this.bFrames);
    const cb = this.b[op.b];
    const rel = (Math.min(end, ca.end) - ca.start) / (ca.end - ca.start);
    return Math.min(cb.start + Math.ceil(rel * (cb.end - cb.start)), this.bFrames);
  }

  mapSpan(span: Span, bVersionId: string): Span {
    const start = this.mapFrame(span.start_frame);
    let end = this.mapEnd(span.end_frame);
    if (end < start) end = start;
    return { version_id: bVersionId, start_frame: start, end_frame: end };
  }
}

/**
 * Carry every open `fix_requested` comment on A onto B. A carried comment whose
 * span (on A or on B) overlaps a difference region is "changed_here"; otherwise
 * "no_change_detected", which the UI shows as a warning because the team may
 * have missed the fix.
 */
export function carryComments(
  commentsA: Comment[],
  mapper: FrameMapper,
  regions: Region[],
  bVersionId: string,
): CarriedComment[] {
  const out: CarriedComment[] = [];
  for (const c of commentsA) {
    if (c.kind !== "fix_requested" || c.status !== "open") continue;
    const span = mapper.mapSpan(c.span, bVersionId);
    const aRange = { start: c.span.start_frame, end: c.span.end_frame };
    const bRange = { start: span.start_frame, end: span.end_frame };
    const region_indexes = regions
      .filter((r) => rangesOverlap(r.a, aRange) || rangesOverlap(r.b, bRange))
      .map((r) => r.index);
    out.push({
      source: c,
      span,
      outcome: region_indexes.length > 0 ? "changed_here" : "no_change_detected",
      region_indexes,
    });
  }
  return out;
}
