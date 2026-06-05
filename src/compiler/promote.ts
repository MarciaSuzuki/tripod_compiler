import { basename } from "node:path";
import { readArtifactNote } from "../reader/obsidian.js";
import { loadApprovedEnumerations, quarantineSets, type ApprovedEnumerations, type ApprovedValue } from "../spec/enumerations.js";

/**
 * Promote approved bounded-open values from a pericope's COMPILATION-LOG `vocabulary_additions`
 * into the growing approved-enumerations registry (SC-0006). Only *convergent* axes accumulate.
 *
 * The COMPILATION-LOG records additions under proposition_kinds / scene_kinds / presence_values
 * and (SC-0007) the L1-element axes (arc/context/tone/pace/communicative_function),
 * discourse_thread_states, and high_risk_register_kinds — all convergent → promotable.
 * referential_forms / other.category remain descriptive → not promoted. As of SC-0007 every
 * convergent axis has an intake slot, so `UNCOVERED_CONVERGENT_AXES` is empty.
 */
const VA_KEY_TO_AXIS: Record<string, string> = {
  proposition_kinds: "proposition_kind",
  scene_kinds: "scene_kind",
  presence_values: "presence_value",
  // SC-0022: beings' participant role reclassified descriptive→convergent (the enforced 21-relation slot)
  role_in_scene_beings: "role_in_scene_being",
  // SC-0007: L1-element / discourse / high-risk convergent axes
  arc_elements: "arc_element",
  context_elements: "context_element",
  tone_elements: "tone_element",
  pace_elements: "pace_element",
  communicative_function_elements: "communicative_function_element",
  discourse_thread_states: "discourse_thread_state",
  high_risk_register_kinds: "high_risk_register_kind",
};
/** Convergent axes with no COMPILATION-LOG intake slot. Empty since SC-0007 (all axes promotable). */
export const UNCOVERED_CONVERGENT_AXES: string[] = [];

export interface PromotionCandidate {
  axis: string;
  value: string;
  source?: string;
  status?: string;
}

export interface PromotionPlan {
  pericope: string | null;
  sourceArtifact: string;
  statusFilter: string;
  promote: PromotionCandidate[]; // new + passing the status gate
  alreadyApproved: PromotionCandidate[]; // present in vocab_additions, already in the registry
  skippedByStatus: PromotionCandidate[]; // failed the status gate
  skippedByQuarantine: PromotionCandidate[]; // in quarantined-vocabulary.json (SC-0023) — never auto-promote
  uncoveredAxes: string[];
}

export function planPromotion(compilationLogPath: string, opts: { status?: string; reg?: ApprovedEnumerations } = {}): PromotionPlan {
  const statusFilter = (opts.status ?? "CONFIRMED").toUpperCase();
  const j = readArtifactNote(compilationLogPath).json as any;
  const pericope: string | null = j?.pericope_id ?? null;
  const va = j?.vocabulary_additions ?? {};
  const reg = opts.reg ?? loadApprovedEnumerations();
  const quarantine = quarantineSets();

  const promote: PromotionCandidate[] = [];
  const alreadyApproved: PromotionCandidate[] = [];
  const skippedByStatus: PromotionCandidate[] = [];
  const skippedByQuarantine: PromotionCandidate[] = [];

  for (const [vaKey, axis] of Object.entries(VA_KEY_TO_AXIS)) {
    const known = new Set((reg.axes[axis] ?? []).map((e) => e.value));
    const items = Array.isArray(va[vaKey]) ? va[vaKey] : [];
    for (const item of items) {
      const value = item?.value;
      if (typeof value !== "string") continue;
      const cand: PromotionCandidate = { axis, value, source: item?.source, status: item?.status };
      // SC-0023: a quarantined value is never auto-promoted, regardless of status — its recurrence is
      // the revisit signal, and lifting it out of quarantine is a governed decision, not a promote.
      if (quarantine[axis]?.has(value)) skippedByQuarantine.push(cand);
      else if (known.has(value)) alreadyApproved.push(cand);
      else if (statusFilter !== "ANY" && String(item?.status ?? "").toUpperCase() !== statusFilter) skippedByStatus.push(cand);
      else promote.push(cand);
    }
  }
  return {
    pericope,
    sourceArtifact: basename(compilationLogPath).replace(/\.md$/, ""),
    statusFilter,
    promote,
    alreadyApproved,
    skippedByStatus,
    skippedByQuarantine,
    uncoveredAxes: UNCOVERED_CONVERGENT_AXES,
  };
}

/** Grow a registry (mutating a deep copy) with a plan's promotions, stamping provenance. */
export function applyPromotion(reg: ApprovedEnumerations, plan: PromotionPlan, scRef = "SC-0006"): { reg: ApprovedEnumerations; added: PromotionCandidate[] } {
  const grown: ApprovedEnumerations = JSON.parse(JSON.stringify(reg));
  const added: PromotionCandidate[] = [];
  for (const c of plan.promote) {
    const list = (grown.axes[c.axis] ??= []);
    if (list.some((e) => e.value === c.value)) continue;
    const entry: ApprovedValue = {
      value: c.value,
      first_seen: plan.pericope ?? undefined,
      approved_in: plan.pericope ?? undefined,
      source_artifact: plan.sourceArtifact,
      sc_ref: scRef,
    };
    list.push(entry);
    added.push(c);
  }
  return { reg: grown, added };
}
