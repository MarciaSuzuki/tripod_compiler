import { describe, expect, it } from "vitest";
import { FIELDS, parseFieldValue } from "../src/components/SettingsPanel";

/**
 * The settings fields are text fields (inputmode decimal), so what the
 * consultant types reaches parseFieldValue untouched: a comma or a dot is
 * the decimal mark, and an unusable draft is refused (null) rather than
 * silently changed.
 */

const decimal = { min: 0, integer: false };
const whole = { min: 1, integer: true };

describe("parseFieldValue", () => {
  it("accepts a comma or a dot as the decimal mark", () => {
    expect(parseFieldValue(decimal, "0,5")).toBe(0.5);
    expect(parseFieldValue(decimal, "0.5")).toBe(0.5);
    expect(parseFieldValue(decimal, "1,5")).toBe(1.5);
    expect(parseFieldValue(decimal, ",5")).toBe(0.5);
    expect(parseFieldValue(decimal, " 2 ")).toBe(2);
    expect(parseFieldValue(decimal, "0")).toBe(0);
  });

  it("refuses an empty draft, text, a second decimal mark and exponents", () => {
    expect(parseFieldValue(decimal, "")).toBeNull();
    expect(parseFieldValue(decimal, "   ")).toBeNull();
    expect(parseFieldValue(decimal, "abc")).toBeNull();
    expect(parseFieldValue(decimal, "1,5,5")).toBeNull();
    expect(parseFieldValue(decimal, "1e3")).toBeNull();
    expect(parseFieldValue(decimal, "Infinity")).toBeNull();
    expect(parseFieldValue(decimal, "0x10")).toBeNull();
  });

  it("refuses values below the field minimum (no negative penalties, no empty group)", () => {
    expect(parseFieldValue(decimal, "-1")).toBeNull();
    expect(parseFieldValue(decimal, "-0,5")).toBeNull();
    expect(parseFieldValue(whole, "0")).toBeNull();
    expect(parseFieldValue(whole, "1")).toBe(1);
  });

  it("refuses fractions in the fields counted in beads", () => {
    expect(parseFieldValue(whole, "2,5")).toBeNull();
    expect(parseFieldValue(whole, "2.5")).toBeNull();
    expect(parseFieldValue(whole, "3")).toBe(3);
    expect(parseFieldValue(whole, "3.0")).toBe(3);
  });

  it("declares every settings field with its rule", () => {
    expect(FIELDS.map((f) => `${f.group}.${f.name}`)).toEqual([
      "grouping.min_cluster_frames",
      "alignment.match_score",
      "alignment.mismatch_penalty",
      "alignment.gap_penalty",
      "alignment.merge_gap_frames",
      "alignment.melody_threshold",
    ]);
    const byName = Object.fromEntries(FIELDS.map((f) => [f.name, f]));
    expect(byName.min_cluster_frames).toMatchObject({ min: 1, integer: true });
    expect(byName.merge_gap_frames).toMatchObject({ min: 0, integer: true });
    for (const name of ["match_score", "mismatch_penalty", "gap_penalty", "melody_threshold"]) {
      expect(byName[name], name).toMatchObject({ min: 0, integer: false });
    }
  });
});
