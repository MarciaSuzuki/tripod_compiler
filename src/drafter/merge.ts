import type { Gap } from "../compiler/skeleton.js";
import { isTodo } from "../compiler/skeleton.js";

/**
 * Deterministic merge of the drafter's gap-fills into the skeleton (Slice 4).
 *
 * The drafter is a *constrained gap-filler*: it may only set values at locations that the
 * deterministic compiler declared as judgment gaps. Every other field — entity codes, verse
 * anchors, scene IDs, flags, classification — is the skeleton's, untouched. This preserves the
 * extract-only guarantee by construction (the model cannot overwrite extracted data) and makes the
 * result gradeable field-by-field against gold.
 *
 * Gaps whose `field` is structural-by-judgment are NOT fillable here (they would change the
 * shape of the artifact, not just fill a leaf): `(granularity)` and `beings_in_scene` (adding
 * REFERENCED beings). Those are deferred — recorded as `skipped`.
 */
const NON_FILLABLE = new Set(["(granularity)", "beings_in_scene"]);

export interface Fill {
  location: string; // exact gap location, e.g. /level_2_scenes/0/scene_kind
  value: unknown; // token string | string[] | object (event_specific_slots / links / overrides)
  reason?: string; // one-sentence justification citing the source span — drives the diagnostic loop
  is_new_value?: boolean; // model flag: convergent token not in the approved vocabulary
}

export interface MergeResult {
  forModel: Record<string, unknown>;
  applied: number;
  /** fills whose location is not a fillable gap — rejected to protect deterministic fields. */
  rejected: Fill[];
  /** fillable gap locations that received no fill (still __TODO__). */
  unfilled: string[];
  /** locations the model marked as proposing a NEW convergent value (drift, expected for new pericopes). */
  proposedNew: string[];
}

/** Fillable gap locations = every gap location except the non-fillable (structural) kinds. */
export function fillableLocations(gaps: Gap[]): Set<string> {
  return new Set(gaps.filter((g) => !NON_FILLABLE.has(g.field)).map((g) => g.location));
}

/** Set the value at a `/a/b/0/c` location; navigates existing parents, sets (or creates) the leaf key. */
function setAt(root: any, location: string, value: unknown): boolean {
  const parts = location.split("/").filter((p) => p.length > 0);
  if (parts.length === 0) return false;
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = /^\d+$/.test(parts[i]!) ? Number(parts[i]) : parts[i]!;
    if (node == null || typeof node !== "object") return false;
    node = (node as any)[key as any];
  }
  if (node == null || typeof node !== "object") return false;
  const last = parts[parts.length - 1]!;
  (node as any)[/^\d+$/.test(last) ? Number(last) : last] = value;
  return true;
}

/** Deep clone (skeletons are plain JSON). */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Merge fills into a copy of the skeleton. Only fills at fillable gap locations are applied;
 * anything else is rejected. Returns the completed FOR_MODEL plus a reconciliation report.
 */
export function mergeFills(skeleton: Record<string, unknown>, gaps: Gap[], fills: Fill[]): MergeResult {
  const forModel = clone(skeleton);
  const fillable = fillableLocations(gaps);
  const seen = new Set<string>();
  const rejected: Fill[] = [];
  const proposedNew: string[] = [];
  let applied = 0;

  for (const f of fills) {
    if (!fillable.has(f.location)) {
      rejected.push(f);
      continue;
    }
    if (setAt(forModel, f.location, f.value)) {
      applied++;
      seen.add(f.location);
      if (f.is_new_value) proposedNew.push(f.location);
    } else {
      rejected.push(f);
    }
  }

  // fillable locations still carrying a __TODO__ placeholder (or never set) after the merge
  const unfilled: string[] = [];
  for (const loc of fillable) {
    if (seen.has(loc)) continue;
    unfilled.push(loc);
  }

  return { forModel, applied, rejected, unfilled, proposedNew };
}

/** True if a completed FOR_MODEL still has any unfilled __TODO__ placeholder anywhere. */
export function hasResidualTodo(forModel: unknown): boolean {
  if (isTodo(forModel)) return true;
  if (Array.isArray(forModel)) return forModel.some(hasResidualTodo);
  if (forModel && typeof forModel === "object") return Object.values(forModel).some(hasResidualTodo);
  return false;
}
