import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SPEC_DIR, loadSpecJson } from "./load.js";

export interface Pin {
  version: string;
  sha256: string;
}
export interface Pins {
  tagset_version: string;
  /**
   * Vault-canonical, governed spec files: vendored AND compared to the wiki `_spec/` via
   * `check-drift --vault`. Criterion: a human authors/governs it and it belongs in the wiki → schema.
   */
  schemas: Record<string, Pin>;
  /**
   * Generated, offline-frozen extracts (BHSA packets, derived alias table): vendored-hash check only,
   * NO vault comparison (no wiki-canonical original). Criterion: a tool produces it → source.
   */
  sources?: Record<string, Pin>;
}

export function loadPins(): Pins {
  return loadSpecJson<Pins>("pins.json");
}

export function sha256OfFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export interface DriftResult {
  file: string;
  pinnedVersion: string;
  pinnedSha: string;
  vendoredSha: string;
  vendoredOk: boolean;
  /** sha256 of the wiki's canonical copy, when a vault `_spec` dir was supplied. */
  vaultSha?: string;
  /** true when the vault copy still matches the pin; false = upstream drift; undefined = not checked. */
  vaultOk?: boolean;
  /** true when a pinned canonical file is entirely ABSENT from the vault — a kind of drift (SC-0008). */
  vaultAbsent?: boolean;
}

/**
 * Verify each vendored schema against its pin. With `vaultSpecDir`, also compare the wiki's
 * canonical copy — a mismatch there is *upstream drift*: the locked spec changed without a
 * re-pin (which must only happen through a governed SPEC_CHANGES.md entry).
 */
export function checkDrift(vaultSpecDir?: string): DriftResult[] {
  const pins = loadPins();
  const results: DriftResult[] = [];
  for (const [file, pin] of Object.entries(pins.schemas)) {
    const vendoredSha = sha256OfFile(join(SPEC_DIR, file));
    const res: DriftResult = {
      file,
      pinnedVersion: pin.version,
      pinnedSha: pin.sha256,
      vendoredSha,
      vendoredOk: vendoredSha === pin.sha256,
    };
    if (vaultSpecDir) {
      try {
        res.vaultSha = sha256OfFile(join(vaultSpecDir, file));
        res.vaultOk = res.vaultSha === pin.sha256;
      } catch {
        // SC-0008: a canonical schema MISSING from the vault is drift, not "not checked".
        // (Previously `vaultOk = undefined`, which the exit code ignored — a silent blind spot.)
        res.vaultAbsent = true;
        res.vaultOk = false;
      }
    }
    results.push(res);
  }
  // Generated source extracts (BHSA packets + alias table): vendored-hash check only.
  // They have no wiki-canonical original, so there is no vault comparison.
  for (const [file, pin] of Object.entries(pins.sources ?? {})) {
    const vendoredSha = sha256OfFile(join(SPEC_DIR, file));
    results.push({
      file,
      pinnedVersion: pin.version,
      pinnedSha: pin.sha256,
      vendoredSha,
      vendoredOk: vendoredSha === pin.sha256,
    });
  }
  return results;
}

/**
 * Spec self-check: the two representations of each closed list must agree —
 * `closed_lists.X` === `meaning_coordinates_schema.$defs.<x>_value.enum`. A mismatch means the spec
 * itself drifted internally (the kind of bug SC-0001 had to fix by hand).
 */
export function closedListSyncIssues(): string[] {
  const rules = loadSpecJson<any>("validation-rules.json");
  const defs = rules.meaning_coordinates_schema?.$defs ?? {};
  const pairs: Array<[string, string]> = [
    ["REGISTER", "register_value"],
    ["GENRE", "genre_value"],
    ["NARRATIVE_FRAMING", "narrative_framing_value"],
  ];
  const issues: string[] = [];
  for (const [listName, defName] of pairs) {
    const list = rules.closed_lists?.[listName];
    const en = defs?.[defName]?.enum;
    if (!Array.isArray(list) || !Array.isArray(en)) {
      issues.push(`cannot compare closed_lists.${listName} with $defs.${defName}.enum (missing)`);
      continue;
    }
    const a = JSON.stringify(list);
    const b = JSON.stringify(en);
    if (a !== b) issues.push(`closed_lists.${listName} != $defs.${defName}.enum (${list.length} vs ${en.length} values)`);
  }
  return issues;
}
