import { loadSpecJson, loadValidationRules, axisClass } from "./load.js";

export interface ApprovedValue {
  value: string;
  first_seen?: string;
  approved_in?: string;
  source_artifact?: string;
  sc_ref?: string;
}

export interface ApprovedEnumerations {
  version: string;
  tagset_version: string;
  axes: Record<string, ApprovedValue[]>;
  [k: string]: unknown;
}

export function loadApprovedEnumerations(): ApprovedEnumerations {
  return loadSpecJson<ApprovedEnumerations>("approved-enumerations.json");
}

export interface QuarantinedValue {
  value: string;
  first_seen?: string;
  reason?: string;
  sc_ref?: string;
}
export interface QuarantinedVocabulary {
  version: string;
  tagset_version: string;
  axes: Record<string, QuarantinedValue[]>;
  [k: string]: unknown;
}

export function loadQuarantinedVocabulary(): QuarantinedVocabulary {
  return loadSpecJson<QuarantinedVocabulary>("quarantined-vocabulary.json");
}

/**
 * Per-axis sets of quarantined values (SC-0023): convergent bounded-open values deliberately NOT
 * promoted (used-once coin-flips). A value here is surfaced as a `quarantined` notice, never `drift`,
 * never silently-approved. Pure of approved-enumerations — the two sets must stay disjoint.
 */
export function quarantineSets(reg = loadQuarantinedVocabulary()): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {};
  for (const [axis, vals] of Object.entries(reg.axes ?? {})) out[axis] = new Set(vals.map((v) => v.value));
  return out;
}

/**
 * The live drift baseline per axis (replaces the frozen P01-only baseline — SC-0006):
 *  - convergent axes → the GROWING `approved-enumerations.json` registry (seeded from P01, grown by
 *    governed promotion). As values are approved + promoted, later pericopes stop drifting on them.
 *  - descriptive axes → the static canonical-P01 seed (used only for the informational `descriptive`
 *    note; these axes never converge so the baseline doesn't grow).
 * A convergent axis absent from the registry falls back to the P01 seed.
 */
export function driftBaseline(reg = loadApprovedEnumerations()): Record<string, string[]> {
  const seeds = loadValidationRules().drift_detector.canonical_p01_enumerations as Record<string, string[]>;
  const axes = reg.axes ?? {};
  const out: Record<string, string[]> = {};
  for (const axis of Object.keys(seeds)) {
    if (axisClass(axis) === "convergent") {
      out[axis] = axes[axis] ? axes[axis]!.map((e) => e.value) : (seeds[axis] ?? []);
    } else {
      out[axis] = seeds[axis] ?? [];
    }
  }
  return out;
}
