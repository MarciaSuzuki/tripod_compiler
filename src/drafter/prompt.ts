import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { SPEC_DIR, loadValidationRules } from "../spec/load.js";
import type { Gap } from "../compiler/skeleton.js";
import { fillableLocations } from "./merge.js";

const REPO_ROOT = dirname(SPEC_DIR);
const read = (p: string) => readFileSync(p, "utf8");

/** The drafter's task framing — the discipline, kept stable so it caches. */
const SYSTEM_INSTRUCTIONS = `You are Agent 3, the STA drafter for the Tripod Method (pilot-2, schema TRIPOD_STA_v2_0).

A deterministic compiler has already produced a FOR_MODEL *skeleton* from an approved Meaning Map. Every
extracted field - entity codes (B/PL/O/TH/TM), verse anchors, scene IDs, concept/figure flags,
genre/genre_group/register - is FIXED and correct. Your ONLY job is to fill the skeleton's judgment gaps:
controlled-vocabulary tokens and event-participant slots that require reading the source prose.

You will receive: (1) the Meaning Map (the source of truth), (2) the skeleton with judgment fields marked
"__TODO__: <source span>", and (3) the exact list of gap locations to fill.

Rules - non-negotiable:
- Fill ONLY the listed gap locations. Return one fill per gap. Do not invent entities, claims, scenes, or
  propositions; do not restate extracted data.
- Draw every value from the source prose carried in the gap's span / the Meaning Map. No semantic addition.
- For CONVERGENT axes (proposition_kind, scene_kind, presence, arc/context/tone/pace/communicative_function
  elements), PREFER a value from the approved-enumerations menu below. If - and only if - none fits the
  source, propose a new UPPER_SNAKE token and set is_new_value=true (this is a reviewable drift signal).
- L1 element arrays (arc/context/tone/pace/communicative_function_elements) take an ARRAY of tokens.
- event_specific_slots use event-participant slot names (giver/blesser/deceased/kisser/...), NEVER
  agent/patient/theme. Multi-event propositions decompose into a *_components array; every component
  carries a mandatory "speech_act" (L1 closed list). Values reference the skeleton's existing entity codes.
- inter_proposition_links use only: forward_link_to, caused_by, paired_with, purposed_for,
  back_reference_to_proposition - targeting declared prop_ids.
- significant_absence and scene_communicative_purpose, when gapped, are load-bearing prose from the Meaning Map.
- For EVERY fill, give a one-sentence "reason" quoting the exact source span you drew the value from. These
  reasons are read by a human reviewer to calibrate this prompt against the gold artifacts - make them specific.

Call the submit_fills tool exactly once with all fills.`;

export const SUBMIT_FILLS_TOOL = {
  name: "submit_fills",
  description:
    "Submit the judgment-field fills for the FOR_MODEL skeleton. Provide exactly one entry per gap location given in the input. `value` is a token string (e.g. scene_kind), an array of token strings (L1 element arrays), or an object (event_specific_slots / inter_proposition_links / register_overrides).",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      fills: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            location: { type: "string", description: "exact gap location, e.g. /level_2_scenes/0/scene_kind" },
            value: { description: "token string | array of token strings | object - the filled value" },
            reason: { type: "string", description: "ONE sentence: why this value, quoting the source span you drew it from" },
            is_new_value: { type: "boolean", description: "true if a convergent token is NOT in the approved menu (a proposed new value)" },
          },
          required: ["location", "value", "reason"],
        },
      },
    },
    required: ["fills"],
  },
};

/**
 * The stable, cacheable system prefix: instructions + closed lists + the converged vocabulary menu +
 * the FOR_MODEL JSON-schema + one worked example (P01 MM -> gold FOR_MODEL). Byte-identical across
 * pericopes and pinned, so it caches. `cache_control` goes on the LAST block (caches tools + system).
 * P01 is the worked example ONLY - never grade the drafter on P01 (it would leak the answer).
 */
export function buildSystem(workedExampleId = "P01-Ruth-1-1-5"): any[] {
  const rules = loadValidationRules() as any;
  const closed = JSON.stringify(rules.closed_lists, null, 2);
  const schema = JSON.stringify(rules.for_model_schema, null, 2);
  const menu = read(join(SPEC_DIR, "approved-enumerations.json"));
  const exMM = read(join(REPO_ROOT, "fixtures", "meaning-map", `${workedExampleId}.md`));
  const exFM = read(join(REPO_ROOT, "fixtures", "for-model", `${workedExampleId}-FOR-MODEL.md`));
  const blocks: any[] = [
    { type: "text", text: SYSTEM_INSTRUCTIONS },
    { type: "text", text: `## Layer-1 CLOSED lists (a value not here is a hard error)\n\`\`\`json\n${closed}\n\`\`\`` },
    { type: "text", text: `## Approved convergent vocabulary (the menu - prefer these; flag genuinely new tokens)\n\`\`\`json\n${menu}\n\`\`\`` },
    { type: "text", text: `## FOR_MODEL JSON-schema (the artifact must validate against this)\n\`\`\`json\n${schema}\n\`\`\`` },
    { type: "text", text: `## Worked example - Meaning Map ${workedExampleId} and its approved FOR_MODEL\n### Meaning Map\n${exMM}\n### Gold FOR_MODEL\n${exFM}` },
  ];
  // cache_control on the last block -> caches tools + the whole system prefix
  return blocks.map((b, i) => (i === blocks.length - 1 ? { ...b, cache_control: { type: "ephemeral" } } : b));
}

/** The per-pericope (uncached) user turn: source Meaning Map + the skeleton + the gap list to fill. */
export function buildUserTurn(rawMeaningMap: string, skeleton: Record<string, unknown>, gaps: Gap[]): string {
  const fillable = fillableLocations(gaps);
  const list = gaps
    .filter((g) => fillable.has(g.location))
    .map((g) => `- ${g.location}  [${g.field}] - ${g.reason}${g.hint ? `  (span: ${g.hint})` : ""}`)
    .join("\n");
  return [
    `# Source Meaning Map\n${rawMeaningMap}`,
    `# FOR_MODEL skeleton (fill the __TODO__ judgment fields; everything else is fixed)\n\`\`\`json\n${JSON.stringify(skeleton, null, 2)}\n\`\`\``,
    `# Gap locations to fill (${fillable.size}). Return exactly one fill per location via submit_fills:\n${list}`,
  ].join("\n\n");
}
