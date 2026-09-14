import { describe, expect, it } from "vitest";
import { clusterAtFrame, groupClusters, runLengthEncode } from "../src/model";
import { tape } from "./helpers";

const g = { min_cluster_frames: 3 };

describe("runLengthEncode", () => {
  it("encodes runs", () => {
    expect(runLengthEncode([1, 1, 2, 3, 3, 3])).toEqual([
      { start: 0, end: 2, u: 1 },
      { start: 2, end: 3, u: 2 },
      { start: 3, end: 6, u: 3 },
    ]);
  });
  it("handles empty input", () => {
    expect(runLengthEncode([])).toEqual([]);
  });
});

describe("groupClusters", () => {
  it("returns no clusters for an empty tape", () => {
    expect(groupClusters(tape([]), g)).toEqual([]);
  });

  it("keeps runs of at least min frames as separate clusters", () => {
    const cs = groupClusters(tape([[5, 4], [7, 3], [5, 10]]), g);
    expect(cs.map((c) => [c.u, c.start, c.end])).toEqual([
      [5, 0, 4],
      [7, 4, 7],
      [5, 7, 17],
    ]);
  });

  it("merges a short run into its left neighbour", () => {
    const cs = groupClusters(tape([[5, 4], [7, 2], [9, 5]]), g);
    expect(cs.map((c) => [c.u, c.start, c.end])).toEqual([
      [5, 0, 6],
      [9, 6, 11],
    ]);
  });

  it("merges a short first run into its right neighbour", () => {
    const cs = groupClusters(tape([[5, 1], [7, 6]]), g);
    expect(cs.map((c) => [c.u, c.start, c.end])).toEqual([[7, 0, 7]]);
  });

  it("keeps a tape that is a single short run", () => {
    const cs = groupClusters(tape([[5, 2]]), g);
    expect(cs).toHaveLength(1);
    expect(cs[0]).toMatchObject({ u: 5, start: 0, end: 2 });
  });

  it("does not hide short speech inside a pause when speech follows", () => {
    const cs = groupClusters(tape([[49, 5], [7, 2], [9, 5]]), g);
    expect(cs.map((c) => [c.u, c.start, c.end, c.is_pause])).toEqual([
      [49, 0, 5, true],
      [9, 5, 12, false],
    ]);
  });

  it("marks pauses and numbers phrases", () => {
    const cs = groupClusters(tape([[3, 5], [4, 5], [49, 4], [3, 5], [49, 3]]), g);
    expect(cs.map((c) => [c.is_pause, c.phrase])).toEqual([
      [false, 0],
      [false, 0],
      [true, null],
      [false, 1],
      [true, null],
    ]);
  });

  it("treats a tape of all pauses as one pause cluster", () => {
    const cs = groupClusters(tape([[49, 40]]), g);
    expect(cs).toHaveLength(1);
    expect(cs[0].is_pause).toBe(true);
    expect(cs[0].phrase).toBeNull();
  });

  it("works without a pause_unit", () => {
    const t = tape([[3, 5], [49, 5]]);
    delete t.pause_unit;
    const cs = groupClusters(t, g);
    expect(cs.every((c) => !c.is_pause)).toBe(true);
    expect(cs.map((c) => c.phrase)).toEqual([0, 0]);
  });

  it("finds the cluster at a frame", () => {
    const cs = groupClusters(tape([[5, 4], [7, 3], [5, 10]]), g);
    expect(clusterAtFrame(cs, 0)?.index).toBe(0);
    expect(clusterAtFrame(cs, 4)?.index).toBe(1);
    expect(clusterAtFrame(cs, 16)?.index).toBe(2);
    expect(clusterAtFrame(cs, 17)).toBeNull();
    expect(clusterAtFrame(cs, -1)).toBeNull();
  });
});
