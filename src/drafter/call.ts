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
      "ANTHROPIC_API_KEY is not set — the drafter's paid path is locked. Set the key in the environment " +
        "(never commit it, never paste it into chat) and re-run, or use the free paths (--measure works keyless via byte estimate; default is dry-run).",
    );
  }
}

function requireKey(): void {
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
