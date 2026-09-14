import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compareTapes, DEFAULT_SETTINGS, parseTape } from "../src/model";
import { comment } from "./helpers";

const root = path.join(__dirname, "..", "fixtures", "ruth-1-1-5");
const load = (v: string) => {
  const r = parseTape(fs.readFileSync(path.join(root, v, "tape.json"), "utf8"));
  if (!r.tape) throw new Error(r.errors.join("; "));
  return r.tape;
};

describe("demo fixtures (ruth-1-1-5)", () => {
  const v1 = load("v1");
  const v2 = load("v2");

  it("are mock tapes on the same codebook", () => {
    expect(v1.mock).toBe(true);
    expect(v2.mock).toBe(true);
    expect(v1.codebook_hash).toBe(v2.codebook_hash);
  });

  it("show an empty diff against themselves", () => {
    const r = compareTapes(v1, v1, [], "B", DEFAULT_SETTINGS);
    expect(r.regions).toEqual([]);
    expect(r.summary.stability).toBe(100);
  });

  it("show exactly the three deliberate edits, in order", () => {
    const r = compareTapes(v1, v2, [], "B", DEFAULT_SETTINGS);
    expect(r.regions.map((x) => x.kind)).toEqual(["substituted", "inserted", "melody"]);
    expect(r.summary.stability).toBeGreaterThan(85);
  });

  it("carry a fix request onto the substituted span as changed_here", () => {
    const r = compareTapes(v1, v2, [], "B", DEFAULT_SETTINGS);
    const sub = r.regions[0];
    const c = comment("A", sub.a.start, sub.a.end);
    const r2 = compareTapes(v1, v2, [c], "B", DEFAULT_SETTINGS);
    expect(r2.carried).toHaveLength(1);
    expect(r2.carried[0].outcome).toBe("changed_here");
    // a fix requested on untouched material is flagged as not changed
    const untouched = comment("A", 20, 40);
    const r3 = compareTapes(v1, v2, [untouched], "B", DEFAULT_SETTINGS);
    expect(r3.carried[0].outcome).toBe("no_change_detected");
  });
});
