import { describe, expect, it } from "vitest";
import { groupClusters } from "../src/model";
import {
  FALLBACK_WIDTH,
  frameToX,
  hitHighlight,
  snapPixelToCluster,
  snapRange,
  xToFrame,
  type StripHighlight,
} from "../src/components/BeadStrip";
import { tape } from "./helpers";

const g = { min_cluster_frames: 3 };
// [u, frames]: speech 0..10, pause 10..15, speech 15..25, speech 25..30, pause 30..40
const clusters = groupClusters(
  tape([
    [5, 10],
    [49, 5],
    [7, 10],
    [8, 5],
    [49, 10],
  ]),
  g,
);
const TOTAL = 40;

describe("frameToX", () => {
  it("is linear in the frame", () => {
    expect(frameToX(0, 100, 800)).toBe(0);
    expect(frameToX(50, 100, 800)).toBe(400);
    expect(frameToX(100, 100, 800)).toBe(800);
    expect(frameToX(25, 100, 200)).toBe(50);
  });
  it("returns 0 when there is nothing to map", () => {
    expect(frameToX(10, 0, 800)).toBe(0);
    expect(frameToX(10, 100, 0)).toBe(0);
    expect(frameToX(NaN, 100, 800)).toBe(0);
  });
  it("has a sensible fallback width for tests", () => {
    expect(FALLBACK_WIDTH).toBe(800);
  });
});

describe("xToFrame", () => {
  it("inverts frameToX and clamps to the tape", () => {
    expect(xToFrame(0, TOTAL, 800)).toBe(0);
    expect(xToFrame(400, TOTAL, 800)).toBe(20);
    expect(xToFrame(800, TOTAL, 800)).toBe(TOTAL - 1);
    expect(xToFrame(-50, TOTAL, 800)).toBe(0);
    expect(xToFrame(5000, TOTAL, 800)).toBe(TOTAL - 1);
  });
  it("round-trips through frameToX for every frame", () => {
    for (let f = 0; f < TOTAL; f++) {
      const x = frameToX(f, TOTAL, 800);
      expect(xToFrame(x + 0.5, TOTAL, 800)).toBe(f);
    }
  });
});

describe("snapPixelToCluster", () => {
  it("finds the cluster under a pixel", () => {
    // 800 px / 40 frames = 20 px per frame
    expect(snapPixelToCluster(0, 800, TOTAL, clusters)?.index).toBe(0);
    expect(snapPixelToCluster(199, 800, TOTAL, clusters)?.index).toBe(0);
    expect(snapPixelToCluster(200, 800, TOTAL, clusters)?.index).toBe(1); // pause
    expect(snapPixelToCluster(200, 800, TOTAL, clusters)?.is_pause).toBe(true);
    expect(snapPixelToCluster(300, 800, TOTAL, clusters)?.index).toBe(2);
    expect(snapPixelToCluster(510, 800, TOTAL, clusters)?.index).toBe(3);
  });
  it("snaps pixels outside the strip to the ends", () => {
    expect(snapPixelToCluster(-100, 800, TOTAL, clusters)?.index).toBe(0);
    expect(snapPixelToCluster(2000, 800, TOTAL, clusters)?.index).toBe(clusters.length - 1);
  });
  it("returns null without clusters or width", () => {
    expect(snapPixelToCluster(10, 800, TOTAL, [])).toBeNull();
    expect(snapPixelToCluster(10, 0, TOTAL, clusters)).toBeNull();
  });
});

describe("snapRange", () => {
  it("covers both clusters' bounds in either order", () => {
    const a = clusters[0];
    const b = clusters[3];
    expect(snapRange(a, b)).toEqual({ start: 0, end: 30 });
    expect(snapRange(b, a)).toEqual({ start: 0, end: 30 });
    expect(snapRange(a, a)).toEqual({ start: 0, end: 10 });
  });
  it("makes a drag snap to whole clusters", () => {
    const first = snapPixelToCluster(50, 800, TOTAL, clusters)!;
    const last = snapPixelToCluster(330, 800, TOTAL, clusters)!;
    expect(snapRange(first, last)).toEqual({ start: 0, end: 25 });
  });
});

describe("hitHighlight", () => {
  const hs: StripHighlight[] = [
    { id: "sub", kind: "substituted", range: { start: 2, end: 8 } },
    { id: "ins", kind: "inserted", range: { start: 20, end: 20 } },
  ];
  it("hits a ranged highlight by frame", () => {
    expect(hitHighlight(hs, 5, frameToX(5, TOTAL, 800), TOTAL, 800)?.id).toBe("sub");
    expect(hitHighlight(hs, 8, frameToX(8, TOTAL, 800), TOTAL, 800)).toBeNull();
  });
  it("hits a zero-length highlight within a few pixels", () => {
    const x = frameToX(20, TOTAL, 800);
    expect(hitHighlight(hs, 20, x + 3, TOTAL, 800)?.id).toBe("ins");
    expect(hitHighlight(hs, 20, x + 10, TOTAL, 800)).toBeNull();
  });
  it("prefers the top-most (last drawn) highlight", () => {
    const stacked: StripHighlight[] = [
      { id: "under", kind: "deleted", range: { start: 0, end: 10 } },
      { id: "over", kind: "carried", range: { start: 4, end: 6 } },
    ];
    expect(hitHighlight(stacked, 5, 100, TOTAL, 800)?.id).toBe("over");
    expect(hitHighlight(stacked, 1, 20, TOTAL, 800)?.id).toBe("under");
  });
});
