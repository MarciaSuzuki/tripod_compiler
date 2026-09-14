import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalTapeJson, hashRecording } from "../src/db/repo";
import { compareTapes, DEFAULT_SETTINGS, parseTape, sha256Hex } from "../src/model";
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

  it("hash to the values tools/tape_hash.py and sha256sum reproduce", async () => {
    // tape_sha256 is the SHA-256 of the canonical JSON of the parsed tape (not of the
    // file's bytes): `python3 tools/tape_hash.py fixtures/ruth-1-1-5/v1/tape.json` prints
    // the first value below. audio_sha256 is the hash of the wav bytes: `sha256sum audio.wav`.
    const wav = (v: string) => new Blob([fs.readFileSync(path.join(root, v, "audio.wav"))]);
    expect(await hashRecording(wav("v1"), v1)).toEqual({
      tape_sha256: "ea512c652256668f77deefe125b15bd63019922ce2fdde06fafeb922d5711ff7",
      audio_sha256: "1971cd366685103cd4d8d7cd4e3b14766d88da6182e83d5393d5783654e66535",
    });
    expect(await hashRecording(wav("v2"), v2)).toEqual({
      tape_sha256: "708ac42540ca6f349295cd625f316ea9f2fe50895d54a9a4cc100135e294b1bb",
      audio_sha256: "04f982665643aa0530a8943b5f41c31fd3c6e075160b5b54bb498b60d049012b",
    });
    // the canonical form: fixed key order, no spaces, mock only when true
    expect(canonicalTapeJson(v1)).toMatch(/^\{"codebook_hash":"sha256:[0-9a-f]+","frame_rate":50,"u":\[\d+(,\d+)*\],"f":\[\d+(,\d+)*\],"pause_unit":49,"mock":true\}$/);
    // the raw file hashes differently (it is pretty-printed), which is why the script exists
    expect(await sha256Hex(fs.readFileSync(path.join(root, "v1", "tape.json")))).not.toBe(
      "ea512c652256668f77deefe125b15bd63019922ce2fdde06fafeb922d5711ff7",
    );
  });

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

  it("do not flag the clusters next to the inserted syllable as changed", () => {
    const r = compareTapes(v1, v2, [], "B", DEFAULT_SETTINGS);
    const inserted = r.regions[1];
    expect(inserted.kind).toBe("inserted");
    expect(inserted.a).toEqual({ start: 186, end: 186 });
    // v1's cluster 172..186 (3.44–3.72 s) ends exactly at the insertion point; 186..196 starts there
    const before = comment("A", 172, 186);
    const after = comment("A", 186, 196);
    const across = comment("A", 172, 196);
    const rr = compareTapes(v1, v2, [before, after, across], "B", DEFAULT_SETTINGS);
    expect(rr.carried.map((c) => c.outcome)).toEqual(["no_change_detected", "no_change_detected", "changed_here"]);
    expect(rr.carried[2].region_indexes).toEqual([1]);
  });
});
