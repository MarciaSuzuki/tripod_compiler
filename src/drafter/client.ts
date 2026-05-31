import type { Fill } from "./merge.js";

export type DrafterModel = "claude-opus-4-8" | "claude-sonnet-4-6";

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}
export interface DrafterCall {
  fills: Fill[];
  usage: Usage;
  /** raw assistant content blocks, so the caller can append them for a repair round. */
  content: any[];
  calledTool: boolean;
}

const ZERO: Usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
const addUsage = (a: Usage, u: any): Usage => ({
  input_tokens: a.input_tokens + (u?.input_tokens ?? 0),
  output_tokens: a.output_tokens + (u?.output_tokens ?? 0),
  cache_read_input_tokens: a.cache_read_input_tokens + (u?.cache_read_input_tokens ?? 0),
  cache_creation_input_tokens: a.cache_creation_input_tokens + (u?.cache_creation_input_tokens ?? 0),
});

export class DrafterError extends Error {}

export function requireApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new DrafterError(
      "ANTHROPIC_API_KEY is not set. The drafter needs an Anthropic API key (api.anthropic.com is reachable from this environment). Set it and re-run.",
    );
  }
}

/**
 * One drafter call. Adaptive thinking (the judgment is non-trivial) + the submit_fills tool for
 * structured, validated output. No `temperature` - Opus 4.8 rejects sampling params; determinism
 * comes from low effort + the constrained tool schema. Streamed (output may exceed 16K with thinking).
 * If the model doesn't call the tool under adaptive thinking + auto tool_choice, retry once with
 * thinking off + forced tool_choice (forced tools are incompatible with thinking).
 */
export async function callDrafter(
  model: DrafterModel,
  system: any[],
  messages: any[],
  tool: any,
  opts: { effort?: "low" | "medium" | "high"; maxTokens?: number } = {},
): Promise<DrafterCall> {
  requireApiKey();
  // Lazy import so non-draft CLI commands (validate, check-drift, compile, promote) never load the SDK.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const maxTokens = opts.maxTokens ?? 32000;
  const effort = opts.effort ?? "high";

  const run = async (forceTool: boolean): Promise<DrafterCall> => {
    const params: any = {
      model,
      max_tokens: maxTokens,
      system,
      messages,
      tools: [tool],
      output_config: { effort },
    };
    if (forceTool) params.tool_choice = { type: "tool", name: tool.name };
    else params.thinking = { type: "adaptive" }; // forced tool_choice is incompatible with thinking

    const stream = (client.messages as any).stream(params);
    const msg = await stream.finalMessage();
    const content = (msg as any).content ?? [];
    const toolUse = content.find((b: any) => b.type === "tool_use" && b.name === tool.name);
    const fills: Fill[] = Array.isArray(toolUse?.input?.fills) ? toolUse.input.fills : [];
    return { fills, usage: addUsage(ZERO, (msg as any).usage), content, calledTool: !!toolUse };
  };

  let call = await run(false);
  if (!call.calledTool) {
    const retry = await run(true);
    return { ...retry, usage: addUsage(call.usage, retry.usage) };
  }
  return call;
}

/** List price per 1M tokens (skill table, cached 2026-05-26). Cache read ~0.1x, write ~1.25x (5-min). */
const PRICE: Record<DrafterModel, { in: number; out: number }> = {
  "claude-opus-4-8": { in: 5, out: 25 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
};
export function estimateCostUsd(model: DrafterModel, u: Usage): number {
  const p = PRICE[model];
  const inCost = ((u.input_tokens + u.cache_creation_input_tokens * 1.25 + u.cache_read_input_tokens * 0.1) * p.in) / 1e6;
  const outCost = (u.output_tokens * p.out) / 1e6;
  return Math.round((inCost + outCost) * 1e4) / 1e4;
}
