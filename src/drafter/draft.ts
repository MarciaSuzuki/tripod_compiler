import { readFileSync } from "node:fs";
import { readMeaningMap } from "../reader/meaning-map.js";
import { compileSkeleton } from "../compiler/skeleton.js";
import { traceCheck } from "../compiler/trace.js";
import { loadValidationRules } from "../spec/load.js";
import { compileSchema, structuralFindings } from "../engine/structural.js";
import { vocabularyFindings } from "../engine/vocabulary.js";
import { driftBaseline } from "../spec/enumerations.js";
import { tally, type Finding } from "../engine/report.js";
import { mergeFills, type MergeResult, type Fill } from "./merge.js";
import { buildSystem, buildUserTurn, SUBMIT_FILLS_TOOL } from "./prompt.js";
import { callDrafter, estimateCostUsd, type DrafterModel, type Usage } from "./client.js";

/** Validate a FOR_MODEL JSON object in-memory (Slice 1 rules: ajv structural + L2/L3 vocabulary). */
export function validateForModel(json: any): { findings: Finding[]; counts: ReturnType<typeof tally>; ok: boolean } {
  const validator = compileSchema(loadValidationRules().for_model_schema as object);
  const findings: Finding[] = [...structuralFindings(validator, json), ...vocabularyFindings(json, driftBaseline())];
  const counts = tally(findings);
  return { findings, counts, ok: counts.block === 0 };
}

const blockText = (findings: Finding[]): string =>
  findings.filter((f) => f.severity === "block").map((f) => `- ${f.location}: ${f.message}`).join("\n");

export interface DraftResult {
  pericope: string | null;
  model: DrafterModel;
  forModel: Record<string, unknown>;
  fills: Fill[]; // the (final) fills the model submitted, each with its reason
  merge: MergeResult;
  validation: ReturnType<typeof validateForModel>;
  traceViolations: ReturnType<typeof traceCheck>["violations"];
  usage: Usage;
  costUsd: number;
  repaired: boolean;
  /** true if still block-dirty after the one repair round - caller must surface the errors. */
  blocked: boolean;
}

/**
 * Draft a complete FOR_MODEL from a Meaning Map: deterministic skeleton -> LLM fills the judgment
 * gaps -> merge (gap locations only) -> validate. One repair round on block errors; if it's still
 * dirty, return blocked=true with the located findings (surface, don't loop).
 */
export async function draft(mmPath: string, model: DrafterModel, opts: { effort?: "low" | "medium" | "high" } = {}): Promise<DraftResult> {
  const mm = readMeaningMap(mmPath);
  const rawMM = readFileSync(mmPath, "utf8");
  const { skeleton, gaps } = compileSkeleton(mm);

  const system = buildSystem();
  const messages: any[] = [{ role: "user", content: buildUserTurn(rawMM, skeleton, gaps) }];

  const call = await callDrafter(model, system, messages, SUBMIT_FILLS_TOOL, { effort: opts.effort });
  let fills = call.fills;
  let merge = mergeFills(skeleton, gaps, fills);
  let validation = validateForModel(merge.forModel);
  let usage = call.usage;
  let repaired = false;

  if (!validation.ok) {
    repaired = true;
    const repairMessages: any[] = [
      ...messages,
      { role: "assistant", content: call.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: call.content.find((b: any) => b.type === "tool_use")?.id ?? "unknown",
            content:
              `The merged FOR_MODEL has ${validation.counts.block} blocking validation error(s). Fix ONLY these and resubmit ALL fills via submit_fills:\n${blockText(validation.findings)}`,
            is_error: true,
          },
        ],
      },
    ];
    const call2 = await callDrafter(model, system, repairMessages, SUBMIT_FILLS_TOOL, { effort: opts.effort });
    fills = call2.fills;
    merge = mergeFills(skeleton, gaps, fills);
    validation = validateForModel(merge.forModel);
    usage = {
      input_tokens: usage.input_tokens + call2.usage.input_tokens,
      output_tokens: usage.output_tokens + call2.usage.output_tokens,
      cache_read_input_tokens: usage.cache_read_input_tokens + call2.usage.cache_read_input_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens + call2.usage.cache_creation_input_tokens,
    } as Usage;
  }

  return {
    pericope: mm.pericope,
    model,
    forModel: merge.forModel,
    fills,
    merge,
    validation,
    traceViolations: traceCheck(mm, merge.forModel).violations,
    usage,
    costUsd: estimateCostUsd(model, usage),
    repaired,
    blocked: !validation.ok,
  };
}
