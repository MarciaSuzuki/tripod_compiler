import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DraftRequest } from "./assemble.js";
import { DRAFT_OUTPUT_SCHEMA, type DraftOutput } from "./fills.js";

/**
 * The paid edge of the drafter (SC-0063). Everything in this module is gated:
 * no ANTHROPIC_API_KEY in the environment → a clear throw BEFORE any client construction,
 * so no network is reachable from dry-run paths. The model is pinned to Opus per Marcia's
 * word; spend is bounded by the SC-0063 ceiling ($25) — the CLI prints usage after every call.
 */

export const DRAFTER_MODEL = "claude-opus-4-8";
/** Generous room for fills + adaptive thinking on the largest pericopes; streaming avoids HTTP timeouts. */
const MAX_TOKENS = 32000;

export class DrafterKeyMissingError extends Error {
  constructor() {
    super(
      "ANTHROPIC_API_KEY is not set — the drafter's paid path is locked. Set the key in the environment, " +
        "or put `ANTHROPIC_API_KEY=...` in a `.env` file at the repo root (gitignored; chmod 600). Never commit it, " +
        "never paste it into chat. Free paths work keyless (--measure byte estimate; default is dry-run).",
    );
  }
}

/**
 * Fallback when the variable isn't in the process environment: walk up from this module
 * toward the filesystem root looking for a `.env` file (gitignored at any depth) carrying
 * ANTHROPIC_API_KEY=…  Worktrees live inside the main repo, so a `.env` at the main root is
 * found from either. The value is loaded into process.env and NEVER logged.
 */
function loadKeyFromDotEnv(): void {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    try {
      const text = readFileSync(join(dir, ".env"), "utf8");
      const line = text.split(/\r?\n/).find((l) => /^\s*(export\s+)?ANTHROPIC_API_KEY\s*=/.test(l));
      if (line) {
        const value = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
        if (value) {
          process.env.ANTHROPIC_API_KEY = value;
          return;
        }
      }
    } catch {
      /* no .env here — keep walking up */
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

function requireKey(): void {
  // TRIPOD_DRAFTER_NO_DOTENV=1 disables the .env fallback (test isolation for the guard).
  if (!process.env.ANTHROPIC_API_KEY && process.env.TRIPOD_DRAFTER_NO_DOTENV !== "1") loadKeyFromDotEnv();
  if (!process.env.ANTHROPIC_API_KEY) throw new DrafterKeyMissingError();
}

/** Build the SDK message payload from an assembled request — cache breakpoint on the last stable block. */
function buildMessages(req: DraftRequest): any[] {
  const content: any[] = [];
  req.stableBlocks.forEach((text, i) => {
    const block: any = { type: "text", text };
    if (i === req.stableBlocks.length - 1) block.cache_control = { type: "ephemeral" };
    content.push(block);
  });
  for (const text of req.variableBlocks) content.push({ type: "text", text });
  return [{ role: "user", content }];
}

export interface DraftCallResult {
  output: DraftOutput;
  rawText: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

/** Phase B+ only: one paid drafting call. Streaming + adaptive thinking + structured output. */
export async function draftViaApi(req: DraftRequest): Promise<DraftCallResult> {
  requireKey();
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: DRAFTER_MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    system: req.system,
    messages: buildMessages(req),
    output_config: { format: { type: "json_schema", schema: DRAFT_OUTPUT_SCHEMA } },
  } as any);
  const final = await stream.finalMessage();
  const rawText = final.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
  let output: DraftOutput;
  try {
    output = JSON.parse(rawText) as DraftOutput;
  } catch (e) {
    throw new Error(`drafter response was not parseable JSON despite structured output (stop_reason ${final.stop_reason}): ${String(e)}`);
  }
  return { output, rawText, model: final.model, usage: final.usage as any };
}

/** Free endpoint: exact token count for an assembled request (still needs the key for auth). */
export async function measureTokens(req: DraftRequest): Promise<number> {
  requireKey();
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const res = await client.messages.countTokens({
    model: DRAFTER_MODEL,
    system: req.system,
    messages: buildMessages(req),
  } as any);
  return (res as any).input_tokens;
}

/** $ cost of one call at Opus list prices ($5/M in · $25/M out · cache write 1.25× · cache read 0.1×). */
export function callCostUSD(u: DraftCallResult["usage"]): number {
  const inFull = (u.input_tokens ?? 0) * 5e-6;
  const cacheWrite = (u.cache_creation_input_tokens ?? 0) * 6.25e-6;
  const cacheRead = (u.cache_read_input_tokens ?? 0) * 0.5e-6;
  const out = (u.output_tokens ?? 0) * 25e-6;
  return inFull + cacheWrite + cacheRead + out;
}
