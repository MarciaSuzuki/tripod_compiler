import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * The vendored, pinned `_spec/` directory. This is the single source of truth the
 * validator reads (decision A). The canonical originals live in the wiki vault and are
 * vendored here pinned by version + sha256 (see `_spec/pins.json` + SPEC_CHANGES.md).
 */
export const SPEC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "_spec");

export function loadSpecJson<T = any>(name: string): T {
  return JSON.parse(readFileSync(join(SPEC_DIR, name), "utf8")) as T;
}

export interface CanonicalP01Enumerations {
  proposition_kind: string[];
  scene_kind: string[];
  presence_value: string[];
  referential_form: string[];
  arc_element: string[];
  context_element: string[];
  tone_element: string[];
  pace_element: string[];
  communicative_function_element: string[];
  role_in_scene_examples_being: string[];
  role_in_scene_examples_place: string[];
  role_in_scene_examples_time: string[];
  function_in_scene_examples_object: string[];
  [k: string]: string[];
}

export interface ValidationRules {
  version: string;
  tagset_version: string;
  for_model_schema: Record<string, unknown>;
  closed_lists: Record<string, string[] | string>;
  drift_detector: {
    canonical_p01_enumerations: CanonicalP01Enumerations;
    drift_warning_recommendations?: unknown;
    [k: string]: unknown;
  };
}

let _rules: ValidationRules | undefined;
export function loadValidationRules(): ValidationRules {
  return (_rules ??= loadSpecJson<ValidationRules>("validation-rules.json"));
}

/** A closed list as a string[] (the `closed_lists` object also carries a `description` string). */
export function closedList(name: string): string[] {
  const v = loadValidationRules().closed_lists[name];
  if (!Array.isArray(v)) throw new Error(`closed_lists.${name} is not a list`);
  return v;
}
