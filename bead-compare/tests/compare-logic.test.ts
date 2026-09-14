import { describe, expect, it } from "vitest";
import { compareTapes, regionKey, type CarriedComment, type PairRecord } from "../src/model";
import {
  VERDICTS,
  buildConnectors,
  carriedHighlightId,
  carriedHighlights,
  carriedMarkers,
  carriedPlayTarget,
  describeSide,
  formatPercent,
  formatSeconds,
  opCounts,
  parseHighlightId,
  regionHighlightId,
  regionHighlights,
  regionPlayItems,
  sourceMarkerId,
  sourceMarkers,
  verdictOf,
} from "../src/screens/compareLogic";
import { comment, settings, tape } from "./helpers";

// A: speech 0..20 (u1), pause 20..30, speech 30..50 (u2), speech 50..70 (u3)
// B: speech 0..20 (u1), pause 20..30, speech 30..50 (u9), speech 50..70 (u3), speech 70..90 (u4)
// → ops: match, match(pause), mismatch, match, insert_b
// → regions: 0 = substituted (a 30..50, b 30..50); 1 = inserted (a point 70, b 70..90)
const tapeA = tape([
  [1, 20],
  [49, 10],
  [2, 20],
  [3, 20],
]);
const tapeB = tape([
  [1, 20],
  [49, 10],
  [9, 20],
  [3, 20],
  [4, 20],
]);
const TOTAL_A = 70;
const TOTAL_B = 90;
const refA = { versionId: "A", frameRate: 50 };
const refB = { versionId: "B", frameRate: 50 };

const changedComment = comment("A", 30, 50); // lands on the substituted region → changed_here
const untouchedComment = comment("A", 0, 10); // matched material → no_change_detected
const result = compareTapes(tapeA, tapeB, [changedComment, untouchedComment], "B", settings);

describe("fixture sanity", () => {
  it("has the expected regions and carried comments", () => {
    expect(result.regions.map((r) => r.kind)).toEqual(["substituted", "inserted"]);
    expect(result.regions[0].a).toEqual({ start: 30, end: 50 });
    expect(result.regions[0].b).toEqual({ start: 30, end: 50 });
    expect(result.regions[1].a).toEqual({ start: 70, end: 70 });
    expect(result.regions[1].b).toEqual({ start: 70, end: 90 });
    expect(result.carried.map((c) => c.outcome)).toEqual(["changed_here", "no_change_detected"]);
  });
});

describe("buildConnectors", () => {
  it("draws one light line per match/mismatch between speech clusters, skipping pauses and gaps", () => {
    const cs = buildConnectors(result.alignment, result.clustersA, result.clustersB, TOTAL_A, TOTAL_B, 900);
    expect(cs.map((c) => c.kind)).toEqual(["match", "mismatch", "match"]);
    // centres: A cluster 0 = frame 10 of 70; B cluster 0 = frame 10 of 90
    expect(cs[0].x1).toBeCloseTo((10 / 70) * 900, 6);
    expect(cs[0].x2).toBeCloseTo((10 / 90) * 900, 6);
    // the mismatch joins the centres of the substituted clusters (frame 40 on both)
    expect(cs[1].x1).toBeCloseTo((40 / 70) * 900, 6);
    expect(cs[1].x2).toBeCloseTo((40 / 90) * 900, 6);
    expect(cs[2].x1).toBeCloseTo((60 / 70) * 900, 6);
    expect(cs[2].x2).toBeCloseTo((60 / 90) * 900, 6);
  });

  it("draws nothing without a width", () => {
    expect(buildConnectors(result.alignment, result.clustersA, result.clustersB, TOTAL_A, TOTAL_B, 0)).toEqual([]);
    expect(buildConnectors(result.alignment, result.clustersA, result.clustersB, TOTAL_A, TOTAL_B, NaN)).toEqual([]);
  });

  it("handles an empty alignment", () => {
    expect(buildConnectors({ ops: [], score: 0 }, [], [], 0, 0, 800)).toEqual([]);
  });
});

describe("highlight ids", () => {
  it("round-trips region, carried and source ids", () => {
    expect(regionHighlightId(result.regions[1])).toBe("1");
    expect(parseHighlightId("1")).toEqual({ type: "region", index: 1 });
    expect(carriedHighlightId("abc")).toBe("carried:abc");
    expect(parseHighlightId("carried:abc")).toEqual({ type: "carried", commentId: "abc" });
    expect(sourceMarkerId("abc")).toBe("source:abc");
    expect(parseHighlightId("source:abc")).toEqual({ type: "source", commentId: "abc" });
  });

  it("rejects ids the screen did not make", () => {
    expect(parseHighlightId("")).toBeNull();
    expect(parseHighlightId("carried:")).toBeNull();
    expect(parseHighlightId("source:")).toBeNull();
    expect(parseHighlightId("-1")).toBeNull();
    expect(parseHighlightId("1.5")).toBeNull();
    expect(parseHighlightId("x")).toBeNull();
  });
});

describe("regionHighlights", () => {
  it("draws every region on the requested side with its kind and index id", () => {
    const a = regionHighlights(result.regions, "a", null);
    const b = regionHighlights(result.regions, "b", null);
    expect(a).toEqual([
      { range: { start: 30, end: 50 }, kind: "substituted", id: "0", active: false },
      { range: { start: 70, end: 70 }, kind: "inserted", id: "1", active: false },
    ]);
    expect(b[1]).toEqual({ range: { start: 70, end: 90 }, kind: "inserted", id: "1", active: false });
  });

  it("marks the region whose key is active", () => {
    const key = regionKey(result.regions[1]);
    const hs = regionHighlights(result.regions, "b", key);
    expect(hs.map((h) => h.active)).toEqual([false, true]);
  });
});

describe("carried highlights and markers", () => {
  it("uses the carried colour when the spot changed and the warning colour when it did not", () => {
    const hs = carriedHighlights(result.carried);
    expect(hs).toEqual([
      { range: { start: 30, end: 50 }, kind: "carried", id: "carried:c-30-50", active: false },
      { range: { start: 0, end: 10 }, kind: "carried_warning", id: "carried:c-0-10", active: false },
    ]);
    expect(carriedHighlights(result.carried, "c-0-10").map((h) => h.active)).toEqual([false, true]);
  });

  it("draws dashed carried markers on B and plain source markers on A", () => {
    const b = carriedMarkers(result.carried, "c-30-50");
    expect(b[0]).toEqual({
      range: { start: 30, end: 50 },
      kind: "fix_requested",
      status: "open",
      id: "carried:c-30-50",
      active: true,
      carried: true,
    });
    const a = sourceMarkers(result.carried);
    expect(a[1]).toEqual({ range: { start: 0, end: 10 }, kind: "fix_requested", status: "open", id: "source:c-0-10", active: false });
    expect(a[1]).not.toHaveProperty("carried");
  });
});

describe("describeSide", () => {
  it("describes a span as a time range", () => {
    expect(describeSide({ start: 30, end: 50 }, 50)).toEqual({
      kind: "range",
      text: "0:00.6 – 0:01.0",
      startSeconds: 0.6,
      endSeconds: 1,
    });
  });

  it("describes a zero-length side as a single position", () => {
    expect(describeSide({ start: 70, end: 70 }, 50)).toEqual({ kind: "point", text: "0:01.4", atSeconds: 1.4 });
  });
});

describe("verdictOf", () => {
  const region = result.regions[0];
  const pair = (verdicts: Record<string, string>): PairRecord => ({
    id: "A::B",
    passage_id: "p",
    a_version_id: "A",
    b_version_id: "B",
    verdicts: verdicts as PairRecord["verdicts"],
    updated_at: "2026-01-01T00:00:00Z",
  });

  it("is undecided without a pair record or a stored value", () => {
    expect(verdictOf(undefined, region)).toBe("undecided");
    expect(verdictOf(null, region)).toBe("undecided");
    expect(verdictOf(pair({}), region)).toBe("undecided");
    expect(verdictOf(pair({ [regionKey(region)]: "undecided" }), region)).toBe("undecided");
  });

  it("reads the verdict stored under the region key", () => {
    expect(verdictOf(pair({ [regionKey(region)]: "unrequested_problem" }), region)).toBe("unrequested_problem");
    expect(verdictOf(pair({ [regionKey(result.regions[1])]: "unrequested_ok" }), region)).toBe("undecided");
  });

  it("treats an unknown stored value as undecided", () => {
    expect(verdictOf(pair({ [regionKey(region)]: "nonsense" }), region)).toBe("undecided");
    expect(VERDICTS).toEqual(["requested_fix_confirmed", "unrequested_ok", "unrequested_problem", "undecided"]);
  });
});

describe("regionPlayItems", () => {
  it("plays A then B for a region with both sides", () => {
    expect(regionPlayItems(result.regions[0], refA, refB)).toEqual([
      { versionId: "A", startFrame: 30, endFrame: 50, frameRate: 50 },
      { versionId: "B", startFrame: 30, endFrame: 50, frameRate: 50 },
    ]);
    expect(regionPlayItems(result.regions[0], refA, refB, "a")).toEqual([
      { versionId: "A", startFrame: 30, endFrame: 50, frameRate: 50 },
    ]);
    expect(regionPlayItems(result.regions[0], refA, refB, "b")).toEqual([
      { versionId: "B", startFrame: 30, endFrame: 50, frameRate: 50 },
    ]);
  });

  it("skips a zero-length side", () => {
    expect(regionPlayItems(result.regions[1], refA, refB)).toEqual([
      { versionId: "B", startFrame: 70, endFrame: 90, frameRate: 50 },
    ]);
    expect(regionPlayItems(result.regions[1], refA, refB, "a")).toEqual([]);
  });
});

describe("carriedPlayTarget", () => {
  it("plays where the comment lands on B", () => {
    expect(carriedPlayTarget(result.carried[0], refA, refB)).toEqual({
      side: "b",
      item: { versionId: "B", startFrame: 30, endFrame: 50, frameRate: 50 },
    });
  });

  it("falls back to the original span on A when nothing lands on B", () => {
    const c: CarriedComment = {
      source: comment("A", 30, 50),
      span: { version_id: "B", start_frame: 40, end_frame: 40 },
      outcome: "changed_here",
      region_indexes: [0],
    };
    expect(carriedPlayTarget(c, refA, refB)).toEqual({
      side: "a",
      item: { versionId: "A", startFrame: 30, endFrame: 50, frameRate: 50 },
    });
  });

  it("has nothing to play when both spans are empty", () => {
    const c: CarriedComment = {
      source: comment("A", 12, 12),
      span: { version_id: "B", start_frame: 12, end_frame: 12 },
      outcome: "no_change_detected",
      region_indexes: [],
    };
    expect(carriedPlayTarget(c, refA, refB)).toBeNull();
  });
});

describe("opCounts", () => {
  it("counts every op kind, including absent ones", () => {
    expect(opCounts(result.alignment)).toEqual({ match: 3, mismatch: 1, insert_b: 1, delete_b: 0 });
    expect(opCounts({ ops: [], score: 0 })).toEqual({ match: 0, mismatch: 0, insert_b: 0, delete_b: 0 });
  });
});

describe("summary formatting", () => {
  it("formats changed seconds with one decimal in each language", () => {
    expect(formatSeconds(1.8, "pt-BR")).toBe("1,8");
    expect(formatSeconds(1.8, "en")).toBe("1.8");
    expect(formatSeconds(12, "en")).toBe("12.0");
    expect(formatSeconds(0, "pt-BR")).toBe("0,0");
    expect(formatSeconds(NaN, "en")).toBe("0.0");
    expect(formatSeconds(-3, "en")).toBe("0.0");
  });

  it("formats the stability score as a percent in each language", () => {
    expect(formatPercent(87.5, "pt-BR")).toBe("87,5%");
    expect(formatPercent(87.5, "en")).toBe("87.5%");
    expect(formatPercent(100, "en")).toBe("100%");
    expect(formatPercent(0, "pt-BR")).toBe("0%");
    expect(formatPercent(NaN, "en")).toBe("0%");
    expect(formatPercent(250, "en")).toBe("100%");
  });
});
