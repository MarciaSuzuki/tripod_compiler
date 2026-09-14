import { describe, expect, it } from "vitest";
import { CodebookMismatchError, compareTapes } from "../src/model";
import { comment, settings, tape } from "./helpers";

describe("carry-forward", () => {
  it("places a comment on the same span when tapes are identical", () => {
    const t = tape([[1, 20], [2, 20], [3, 20]]);
    const r = compareTapes(t, t, [comment("A", 20, 40)], "B", settings);
    expect(r.carried).toHaveLength(1);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 20, end_frame: 40 });
    expect(r.carried[0].outcome).toBe("no_change_detected");
  });

  it("shifts a comment after an insertion in B", () => {
    const ta = tape([[1, 20], [3, 20], [4, 20]]);
    const tb = tape([[1, 20], [2, 30], [3, 20], [4, 20]]);
    const r = compareTapes(ta, tb, [comment("A", 40, 60)], "B", settings);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 70, end_frame: 90 });
    expect(r.carried[0].outcome).toBe("no_change_detected");
  });

  it("does not report changed_here for untouched material that merely borders an insertion", () => {
    // A: pause 0..5 | X 5..15 | pause 15..20;  B: pause 0..5 | X 5..15 | Y 15..25 | pause 25..30
    const ta = tape([[49, 5], [1, 10], [49, 5]]);
    const tb = tape([[49, 5], [1, 10], [2, 10], [49, 5]]);
    const r = compareTapes(ta, tb, [comment("A", 5, 15)], "B", settings);
    expect(r.regions).toHaveLength(1);
    expect(r.regions[0]).toMatchObject({ kind: "inserted", a: { start: 15, end: 15 }, b: { start: 15, end: 25 } });
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 5, end_frame: 15 });
    expect(r.carried[0].outcome).toBe("no_change_detected");
    expect(r.carried[0].region_indexes).toEqual([]);
  });

  it("does not report changed_here for untouched material that merely borders a deletion", () => {
    // A: X 0..10 | Y 10..20 | Z 20..30;  B: X 0..10 | Z 10..20  (Y deleted; its B point is 10)
    const ta = tape([[1, 10], [2, 10], [3, 10]]);
    const tb = tape([[1, 10], [3, 10]]);
    const r = compareTapes(ta, tb, [comment("A", 0, 10), comment("A", 20, 30)], "B", settings);
    expect(r.regions[0]).toMatchObject({ kind: "deleted", a: { start: 10, end: 20 }, b: { start: 10, end: 10 } });
    expect(r.carried.map((c) => c.outcome)).toEqual(["no_change_detected", "no_change_detected"]);
  });

  it("reports changed_here when the fixed span was substituted", () => {
    const ta = tape([[1, 20], [2, 20], [3, 20]]);
    const tb = tape([[1, 20], [9, 40], [3, 20]]);
    const r = compareTapes(ta, tb, [comment("A", 20, 40)], "B", settings);
    expect(r.carried[0].outcome).toBe("changed_here");
    expect(r.carried[0].region_indexes).toEqual([0]);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 20, end_frame: 60 });
  });

  it("reports changed_here when the span was deleted from B", () => {
    const ta = tape([[1, 20], [2, 20], [3, 20]]);
    const tb = tape([[1, 20], [3, 20]]);
    const r = compareTapes(ta, tb, [comment("A", 20, 40)], "B", settings);
    expect(r.carried[0].outcome).toBe("changed_here");
    expect(r.carried[0].span.start_frame).toBe(20);
    expect(r.carried[0].span.end_frame).toBeGreaterThanOrEqual(20);
  });

  it("scales a comment inside a cluster that got longer", () => {
    const ta = tape([[1, 20], [2, 20]]);
    const tb = tape([[1, 20], [2, 40]]);
    const r = compareTapes(ta, tb, [comment("A", 25, 35)], "B", settings);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 30, end_frame: 50 });
  });

  it("carries only open fix_requested comments", () => {
    const t = tape([[1, 20], [2, 20]]);
    const r = compareTapes(
      t,
      t,
      [
        comment("A", 0, 10, "note"),
        comment("A", 0, 10, "approved"),
        comment("A", 0, 10, "fix_requested", "resolved"),
        comment("A", 10, 20, "fix_requested", "open"),
      ],
      "B",
      settings,
    );
    expect(r.carried).toHaveLength(1);
    expect(r.carried[0].source.span.start_frame).toBe(10);
  });

  it("handles an empty A tape", () => {
    const r = compareTapes(tape([]), tape([[1, 20]]), [comment("A", 0, 0)], "B", settings);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 0, end_frame: 0 });
  });

  it("maps the end of A to the end of B", () => {
    const ta = tape([[1, 20], [2, 20]]);
    const tb = tape([[1, 20], [2, 20], [3, 30]]);
    const r = compareTapes(ta, tb, [comment("A", 30, 40)], "B", settings);
    expect(r.carried[0].span).toEqual({ version_id: "B", start_frame: 30, end_frame: 40 });
    expect(r.mapper.mapFrame(40)).toBe(70);
  });

  it("refuses tapes with different codebooks", () => {
    const ta = tape([[1, 20]], { hash: "sha256:one" });
    const tb = tape([[1, 20]], { hash: "sha256:two" });
    expect(() => compareTapes(ta, tb, [], "B", settings)).toThrow(CodebookMismatchError);
  });
});
