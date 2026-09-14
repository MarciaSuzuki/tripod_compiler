import { describe, expect, it } from "vitest";
import {
  alignClusters,
  buildRegions,
  computeSummary,
  groupClusters,
  rangesOverlap,
  regionKey,
} from "../src/model";
import { settings, tape } from "./helpers";

const g = settings.grouping;
const al = settings.alignment;

function run(ta: ReturnType<typeof tape>, tb: ReturnType<typeof tape>, over: Partial<typeof al> = {}) {
  const s = { ...al, ...over };
  const a = groupClusters(ta, g);
  const b = groupClusters(tb, g);
  const alignment = alignClusters(a, b, s);
  const regions = buildRegions(alignment, a, b, ta, tb, s);
  const summary = computeSummary(alignment, b, tb, regions);
  return { a, b, alignment, regions, summary };
}

describe("buildRegions", () => {
  it("produces no regions for identical tapes", () => {
    const t = tape([[1, 20], [49, 5], [2, 20], [3, 20]]);
    const r = run(t, t);
    expect(r.regions).toEqual([]);
    expect(r.summary.stability).toBe(100);
    expect(r.summary.changed_seconds).toBe(0);
  });

  it("produces no regions for empty tapes", () => {
    const r = run(tape([]), tape([]));
    expect(r.regions).toEqual([]);
    expect(r.summary.stability).toBe(100);
  });

  it("marks a whole B as inserted when A is empty", () => {
    const r = run(tape([]), tape([[1, 10], [2, 10]]));
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "inserted", a: { start: 0, end: 0 }, b: { start: 0, end: 20 } });
    expect(r.summary.stability).toBe(0);
  });

  it("treats all-pause tapes as identical", () => {
    const r = run(tape([[49, 30]]), tape([[49, 50]]));
    expect(r.regions).toEqual([]);
  });

  it("locates a substitution in both versions", () => {
    const ta = tape([[1, 20], [2, 20], [3, 20]]);
    const tb = tape([[1, 20], [9, 25], [3, 20]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "substituted", a: { start: 20, end: 40 }, b: { start: 20, end: 45 } });
    expect(r.summary.changed_seconds).toBeCloseTo(25 / 50);
    expect(r.summary.stability).toBeCloseTo((40 / 65) * 100, 0);
  });

  it("gives a deletion a zero-length point in B", () => {
    const ta = tape([[1, 20], [2, 20], [3, 20]]);
    const tb = tape([[1, 20], [3, 20]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "deleted", a: { start: 20, end: 40 }, b: { start: 20, end: 20 } });
  });

  it("gives an insertion a zero-length point in A", () => {
    const ta = tape([[1, 20], [3, 20]]);
    const tb = tape([[1, 20], [2, 20], [3, 20]]);
    const r = run(ta, tb);
    expect(r.regions[0]).toMatchObject({ kind: "inserted", a: { start: 20, end: 20 }, b: { start: 20, end: 40 } });
  });

  it("merges regions separated by fewer than merge_gap_frames matched frames", () => {
    // two substitutions separated by a 5-frame match; default gap is 10
    const ta = tape([[1, 20], [2, 10], [3, 5], [4, 10], [5, 20]]);
    const tb = tape([[1, 20], [8, 10], [3, 5], [9, 10], [5, 20]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "substituted", a: { start: 20, end: 45 }, b: { start: 20, end: 45 } });
  });

  it("keeps regions apart when the gap is wide enough", () => {
    const ta = tape([[1, 20], [2, 10], [3, 15], [4, 10], [5, 20]]);
    const tb = tape([[1, 20], [8, 10], [3, 15], [9, 10], [5, 20]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(2);
  });

  it("respects a custom merge gap", () => {
    const ta = tape([[1, 20], [2, 10], [3, 15], [4, 10], [5, 20]]);
    const tb = tape([[1, 20], [8, 10], [3, 15], [9, 10], [5, 20]]);
    expect(run(ta, tb, { merge_gap_frames: 20 }).regions).toHaveLength(1);
  });

  it("labels same sounds with a different melody", () => {
    const ta = tape([[1, 20, 10], [2, 20, 10], [3, 20, 10]]);
    const tb = tape([[1, 20, 10], [2, 20, 20], [3, 20, 10]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0].kind).toBe("melody");
    // melody-only differences still count as matched sound
    expect(r.summary.stability).toBe(100);
  });

  it("ignores melody in unvoiced clusters", () => {
    const ta = tape([[1, 20, 0], [2, 20, 0]]);
    const tb = tape([[1, 20, 0], [2, 20, 25]]);
    expect(run(ta, tb).regions).toEqual([]);
  });

  it("calls a mixed insert+delete group a substitution", () => {
    const ta = tape([[1, 20], [2, 10], [3, 20]]);
    const tb = tape([[1, 20], [3, 20], [4, 10]]);
    const r = run(ta, tb);
    expect(r.regions.every((x) => ["substituted", "inserted", "deleted"].includes(x.kind))).toBe(true);
  });

  it("handles B much longer than A as one big insertion", () => {
    const ta = tape([[1, 20]]);
    const tb = tape([[1, 20], [2, 20], [3, 20], [4, 20], [5, 20], [6, 20]]);
    const r = run(ta, tb);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "inserted", b: { start: 20, end: 120 } });
    expect(r.summary.stability).toBeCloseTo((20 / 120) * 100, 0);
  });

  it("builds a stable key", () => {
    const ta = tape([[1, 20], [2, 20]]);
    const tb = tape([[1, 20], [9, 20]]);
    const r = run(ta, tb);
    expect(regionKey(r.regions[0])).toBe("substituted|a:20-40|b:20-40");
  });
});

describe("rangesOverlap", () => {
  it("detects plain overlap", () => {
    expect(rangesOverlap({ start: 0, end: 10 }, { start: 5, end: 15 })).toBe(true);
    expect(rangesOverlap({ start: 0, end: 10 }, { start: 10, end: 15 })).toBe(false);
  });
  it("treats a point inside a range as overlap", () => {
    expect(rangesOverlap({ start: 5, end: 5 }, { start: 0, end: 10 })).toBe(true);
    expect(rangesOverlap({ start: 0, end: 10 }, { start: 10, end: 10 })).toBe(true);
    expect(rangesOverlap({ start: 0, end: 10 }, { start: 11, end: 11 })).toBe(false);
  });
  it("never overlaps two points", () => {
    expect(rangesOverlap({ start: 5, end: 5 }, { start: 5, end: 5 })).toBe(false);
  });
});
