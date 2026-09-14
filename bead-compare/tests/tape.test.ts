import { describe, expect, it } from "vitest";
import { checkTape, parseTape } from "../src/model";

describe("checkTape", () => {
  it("accepts a minimal tape", () => {
    expect(checkTape({ codebook_hash: "sha256:x", frame_rate: 50, u: [1, 2], f: [0, 3] }).ok).toBe(true);
  });
  it("rejects unequal u/f", () => {
    const r = checkTape({ codebook_hash: "sha256:x", frame_rate: 50, u: [1, 2], f: [0] });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/differ in length/);
  });
  it("rejects out-of-range values", () => {
    expect(checkTape({ codebook_hash: "sha256:x", frame_rate: 50, u: [100], f: [0] }).errors[0]).toMatch(/u\[0\]/);
    expect(checkTape({ codebook_hash: "sha256:x", frame_rate: 50, u: [1], f: [32] }).errors[0]).toMatch(/f\[0\]/);
  });
  it("rejects a missing codebook hash", () => {
    expect(checkTape({ frame_rate: 50, u: [], f: [] }).errors).toContain("codebook_hash missing");
  });
  it("parses JSON text and keeps the mock flag", () => {
    const r = parseTape(JSON.stringify({ codebook_hash: "sha256:x", frame_rate: 50, u: [1], f: [0], mock: true }));
    expect(r.tape?.mock).toBe(true);
    expect(parseTape("{").errors[0]).toMatch(/not valid JSON/);
  });
});
