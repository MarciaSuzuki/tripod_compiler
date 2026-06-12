import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendReceipt, CALL_RESERVE_USD, CEILING_USD, checkCeiling, cumulativeUSD, readReceipts, RECEIPTS_PATH, usageCostUSD, type Receipt } from "../src/drafter/receipts.js";

// SC-0063 spend governance (Marcia's Phase-C condition): receipts on success AND failure,
// cumulative from the ledger, ceiling enforced before dialing.

const mk = (cost: number, status: Receipt["status"] = "ok"): Receipt => ({
  ts: "2026-06-12T00:00:00.000Z",
  pericope: "PXX",
  request_sha256: "deadbeef",
  model: "claude-opus-4-8",
  status,
  usage: { input_tokens: 1, output_tokens: 1 },
  cost_usd: cost,
});

describe("drafter receipts ledger", () => {
  it("appends, reads back, and sums — failures count toward the cumulative", () => {
    const path = join(mkdtempSync(join(tmpdir(), "receipts-")), "ledger.jsonl");
    appendReceipt(mk(1.5, "ok"), path);
    appendReceipt(mk(0.75, "truncated"), path);
    expect(readReceipts(path)).toHaveLength(2);
    expect(cumulativeUSD(path)).toBeCloseTo(2.25, 6);
  });

  it("ceiling gate refuses when spent + reserve would breach, allows under it", () => {
    const path = join(mkdtempSync(join(tmpdir(), "receipts-")), "ledger.jsonl");
    appendReceipt(mk(CEILING_USD - CALL_RESERVE_USD - 0.01), path);
    expect(checkCeiling(path).ok).toBe(true);
    appendReceipt(mk(0.02), path);
    const gate = checkCeiling(path);
    expect(gate.ok).toBe(false);
    expect(gate.cumulative).toBeCloseTo(CEILING_USD - CALL_RESERVE_USD + 0.01, 6);
  });

  it("usageCostUSD reproduces the printed P02 receipts at list prices", () => {
    expect(usageCostUSD({ input_tokens: 26907, output_tokens: 32174, cache_creation_input_tokens: 32455, cache_read_input_tokens: 0 })).toBeCloseTo(1.1417, 3);
    expect(usageCostUSD({ input_tokens: 26907, output_tokens: 30175, cache_creation_input_tokens: 33481, cache_read_input_tokens: 0 })).toBeCloseTo(1.0982, 3);
  });

  it("the committed ledger carries the three P02 calibration calls, failure included", () => {
    const entries = readReceipts(RECEIPTS_PATH);
    expect(entries.length).toBeGreaterThanOrEqual(3);
    const p02 = entries.filter((e) => e.pericope === "P02");
    expect(p02.map((e) => e.status)).toEqual(["truncated", "ok", "ok"]);
    expect(p02[0]!.note).toMatch(/RECONSTRUCTED/);
    expect(p02.reduce((s, e) => s + e.cost_usd, 0)).toBeCloseTo(3.377, 2);
    // the failure receipt is real spend: ledger > sum of successes
    expect(readFileSync(RECEIPTS_PATH, "utf8")).toMatch(/"status":"truncated"/);
  });
});
