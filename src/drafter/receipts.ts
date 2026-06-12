import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0063 spend governance (Marcia's Phase-C condition, 2026-06-12): every paid drafter call
 * leaves a RECEIPT — success or failure — in an append-only ledger, and the ceiling is
 * enforced mechanically BEFORE dialing, not by narrative arithmetic after. The first three
 * entries are seeded from the P02 calibration (one reconstructed: the truncated call predates
 * receipts-on-failure; its input is sha-identical to round 1 and its output is exactly the
 * 32k cap, so the reconstruction is bounded — the Anthropic Console is the authoritative meter).
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RECEIPTS_PATH = join(ROOT, "_working", "DRAFTER-RECEIPTS.jsonl");

/** The SC-0063 ceiling (Marcia's word, 2026-06-12). Override only via env for a future governed change. */
export const CEILING_USD = Number(process.env.TRIPOD_DRAFTER_CEILING_USD ?? 25);

/** Conservative single-call reserve: refuse to dial unless this much headroom remains. */
export const CALL_RESERVE_USD = 2;

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface Receipt {
  ts: string;
  pericope: string;
  request_sha256: string;
  model: string;
  status: "ok" | "truncated" | "parse_error" | "api_error";
  usage: Usage | null;
  cost_usd: number;
  note?: string;
}

/** $ at Opus list prices: in $5/M · cache-write $6.25/M · cache-read $0.50/M · out $25/M. */
export function usageCostUSD(u: Usage): number {
  return (
    (u.input_tokens ?? 0) * 5e-6 +
    (u.cache_creation_input_tokens ?? 0) * 6.25e-6 +
    (u.cache_read_input_tokens ?? 0) * 0.5e-6 +
    (u.output_tokens ?? 0) * 25e-6
  );
}

export function readReceipts(path: string = RECEIPTS_PATH): Receipt[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => l.trim().length)
    .map((l) => JSON.parse(l) as Receipt);
}

export function appendReceipt(r: Receipt, path: string = RECEIPTS_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(r) + "\n");
}

export function cumulativeUSD(path: string = RECEIPTS_PATH): number {
  return readReceipts(path).reduce((s, r) => s + (r.cost_usd || 0), 0);
}

export interface CeilingCheck {
  ok: boolean;
  cumulative: number;
  reserve: number;
  ceiling: number;
}

/** Pre-dial gate: spent + a conservative per-call reserve must stay under the ceiling. */
export function checkCeiling(path: string = RECEIPTS_PATH): CeilingCheck {
  const cumulative = cumulativeUSD(path);
  return { ok: cumulative + CALL_RESERVE_USD <= CEILING_USD, cumulative, reserve: CALL_RESERVE_USD, ceiling: CEILING_USD };
}
