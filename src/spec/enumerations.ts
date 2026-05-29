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
