import type { MeaningMap } from "../reader/meaning-map.js";
import type { CompileResult } from "./skeleton.js";

/**
 * Emit the skeleton's gap report as a **schema-valid COMPILATION-LOG** (item 3): the gaps land in
 * `known_limitations`, the extract-only guarantee is attested in `validation_checklist`
 * (`no_content_added_beyond_meaning_map: true`), and the skeleton state is reflected honestly
 * (confidence LOW, nothing community/team-verified, high-risk audit pending). Validates clean via
 * Slice 1's compilation-log schema.
 */
export function compileCompilationLog(
  mm: MeaningMap,
  result: CompileResult,
  opts: { compiledAt?: string } = {},
): Record<string, unknown> {
  const num = (mm.pericope ?? "P00").replace(/\D/g, "").padStart(2, "0");
  const pid = `P${num}`;
  const bcv = (mm.bcv ?? "").replace(/[–—]/g, "-") || "(unknown bcv)";
  const book = ((mm.bcv ?? "").split(/\s+/)[0] || "ruth").toLowerCase(); // SC-0032: book-general sta_id prefix
  const { gaps, stats } = result;

  // gap report → known_limitations (each a non-empty string)
  const byField = new Map<string, number>();
  for (const g of gaps) byField.set(g.field, (byField.get(g.field) ?? 0) + 1);
  const knownLimitations: string[] = [
    `Deterministic skeleton (tripod compile): ${gaps.length} judgment gaps remain as typed __TODO__ placeholders carrying their source-prose span.`,
    `Judgment gaps by field — ${[...byField.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f}:${n}`).join(", ")}.`,
    `Propositions are at MEANING-MAP granularity (${stats.propositions}); the MEANING_COORDINATES may decompose multi-event propositions further (judgment, Agent 3).`,
    "Controlled-vocabulary tokens (scene_kind, proposition_kind, role/function), event_specific_slots, inter_proposition_links, referential_form, and the L1 element arrays are judgment — deferred to Agent 3 (Slice 4). No values were invented.",
  ];

  return {
    sta_id: `${book}_pericope_${num}_v2_0`,
    tagset_version: "TRIPOD_STA_v2_0",
    bcv,
    pericope_id: pid,
    pericope_title: mm.title ?? "(untitled)",
    compiled_at: opts.compiledAt ?? "2026-05-29",
    review_status: {
      meaning_map_status: "PARSED_BY_COMPILER",
      sta_compilation_status: "SKELETON_DETERMINISTIC",
      community_verified: false,
      translation_team_verified: false,
      consultant_review_required: true,
      production_use: false,
    },
    confidence_overall: "LOW",
    confidence_overall_note: `Deterministic skeleton from the approved Meaning Map. ${stats.beings} beings + ${stats.placesWithCode} place codes extracted, ${stats.flagsCarried} flags carried, ${gaps.length} judgment gaps deferred. Extract-only: no controlled-vocabulary values assigned by the compiler.`,
    compilation_decisions: [
      {
        decision_id: `${pid}-D1`,
        decision: "Deterministically compiled a MEANING_COORDINATES skeleton from the approved Meaning Map.",
        description: `Extracted header/classification, scene + entity IDs + presence, verse-ranges, significant_absence, communicative purpose, proposition anchors/scene-links/cross-refs, and Section-5 concept/figure flags. ${gaps.length} judgment fields left as typed placeholders for Agent 3. No values invented (extract-only).`,
      },
    ],
    vocabulary_additions: { proposition_kinds: [], scene_kinds: [], presence_values: [], referential_forms: [], other: [] },
    proposition_kind_slot_sets: [],
    high_risk_register_audit: [
      {
        id: "R1",
        kind: "SKELETON_PENDING_HIGH_RISK_REVIEW",
        applies_to: "(whole pericope — high-risk register audit not yet assigned)",
        note: "Deterministic skeleton: the high-risk register audit (figures to keep, naming shifts, structural absences) is judgment and is deferred to Agent 3 / the READING_QUALITY gate. This is a placeholder so the COMPILATION-LOG is schema-valid; it is not a finding.",
        required_in_audit: true,
        source_in_meaning_map: "(skeleton — pending judgment)",
      },
    ],
    cross_pericope_pair_verification: { pairs: [] },
    validation_checklist: {
      meaning_map_contains_only_story_content: true,
      meaning_coordinates_contains_only_inference_signal: false,
      every_proposition_has_cb_flags_and_figure_flags: false,
      no_grammatical_frame_slot_names: true,
      speech_act_present_on_all_component_records: false,
      speech_act_values_used: [],
      discourse_threads_tracked_in_audit_only: true,
      known_limitations_tracked_in_audit_only: true,
      high_risk_register_complete: false,
      every_high_risk_entry_traces_to_meaning_map: false,
      no_content_added_beyond_meaning_map: true,
      registry_additions_extracted_to_bcd_delta: true,
      no_reviewer_facing_prompts_in_compilation_log: true,
    },
    known_limitations: knownLimitations,
  };
}
