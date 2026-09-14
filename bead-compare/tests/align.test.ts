import { describe, expect, it } from "vitest";
import { alignClusters, groupClusters } from "../src/model";
import { settings, tape } from "./helpers";

const g = settings.grouping;
const al = settings.alignment;
const cl = (spec: Parameters<typeof tape>[0]) => groupClusters(tape(spec), g);

describe("alignClusters", () => {
  it("aligns two empty sequences to nothing", () => {
    const r = alignClusters([], [], al);
    expect(r.ops).toEqual([]);
    expect(r.score).toBe(0);
  });

  it("aligns identical sequences as all matches", () => {
    const a = cl([[1, 5], [2, 5], [3, 5]]);
    const r = alignClusters(a, a, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["match", "match", "match"]);
    expect(r.ops.map((o) => [o.a, o.b])).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  it("aligns an empty A against B as all insertions", () => {
    const b = cl([[1, 5], [2, 5]]);
    const r = alignClusters([], b, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["insert_b", "insert_b"]);
  });

  it("aligns A against an empty B as all deletions", () => {
    const a = cl([[1, 5], [2, 5]]);
    const r = alignClusters(a, [], al);
    expect(r.ops.map((o) => o.kind)).toEqual(["delete_b", "delete_b"]);
  });

  it("finds a substitution", () => {
    const a = cl([[1, 5], [2, 5], [3, 5]]);
    const b = cl([[1, 5], [9, 5], [3, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["match", "mismatch", "match"]);
  });

  it("finds an insertion in B", () => {
    const a = cl([[1, 5], [3, 5]]);
    const b = cl([[1, 5], [2, 5], [3, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["match", "insert_b", "match"]);
    expect(r.ops[1].b).toBe(1);
  });

  it("finds a deletion from B", () => {
    const a = cl([[1, 5], [2, 5], [3, 5]]);
    const b = cl([[1, 5], [3, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["match", "delete_b", "match"]);
    expect(r.ops[1].a).toBe(1);
  });

  it("handles B much longer than A", () => {
    const a = cl([[1, 5], [2, 5]]);
    const b = cl([[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.filter((o) => o.kind === "match")).toHaveLength(2);
    expect(r.ops.filter((o) => o.kind === "insert_b")).toHaveLength(6);
    // every B cluster is consumed exactly once, in order
    expect(r.ops.map((o) => o.b).filter((x) => x !== null)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("consumes every cluster of both sides exactly once", () => {
    const a = cl([[1, 5], [2, 5], [3, 5], [4, 5], [5, 5]]);
    const b = cl([[2, 5], [3, 5], [7, 5], [5, 5], [6, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.map((o) => o.a).filter((x) => x !== null)).toEqual([0, 1, 2, 3, 4]);
    expect(r.ops.map((o) => o.b).filter((x) => x !== null)).toEqual([0, 1, 2, 3, 4]);
  });

  it("prefers matches on ties (score is optimal)", () => {
    const a = cl([[1, 5], [2, 5], [3, 5]]);
    const b = cl([[3, 5]]);
    const r = alignClusters(a, b, al);
    expect(r.ops.map((o) => o.kind)).toEqual(["delete_b", "delete_b", "match"]);
    expect(r.score).toBe(al.match_score - 2 * al.gap_penalty);
  });
});
