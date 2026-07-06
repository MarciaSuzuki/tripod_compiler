import { basename } from "node:path";
import { readArtifactNote } from "../reader/obsidian.js";
import { loadValidationRules, loadSpecJson } from "../spec/load.js";
import { compileSchema, structuralFindings, type Validator } from "./structural.js";
import { vocabularyFindings } from "./vocabulary.js";
import { oralFindings } from "./oral.js";
import { driftBaseline } from "../spec/enumerations.js";
import { tally, type Finding, type ValidationReport } from "./report.js";

export type ArtifactKind =
  | "MEANING_COORDINATES"
  | "COMPILATION-LOG"
  | "BCD-DELTA"
  | "VERIFICATION-INPUT"
  | "UNKNOWN";

export function detectArtifact(path: string, frontmatterType?: string, json?: unknown): ArtifactKind {
  const n = basename(path).toUpperCase();
  if (n.includes("MEANING-COORDINATES") || frontmatterType === "sta-meaning-coordinates") return "MEANING_COORDINATES";
  if (n.includes("COMPILATION-LOG") || frontmatterType === "sta-compilation-log") return "COMPILATION-LOG";
  if (n.includes("BCD-DELTA") || frontmatterType === "bcd-delta") return "BCD-DELTA";
  if (n.includes("VERIFICATION-INPUT") || frontmatterType === "verification-input") return "VERIFICATION-INPUT";
  // SC-0065: an oral STA arrives as raw .json — no MEANING-COORDINATES filename, no frontmatter type. Detect
  // it by signature: an STA/MEANING_COORDINATES carries sta_id + a level_3_propositions array. The sibling
  // artifacts (compilation-log / bcd-delta / verification-input) have neither, so this stays tight.
  if (json && typeof json === "object") {
    const j = json as Record<string, unknown>;
    if (typeof j["sta_id"] === "string" && Array.isArray(j["level_3_propositions"])) return "MEANING_COORDINATES";
  }
  return "UNKNOWN";
}

/**
 * SC-0075: the canonical note `type` envelope value each artifact class must carry.
 * The Review Portal's approved-only gate keys on these exact strings, so a drifted
 * envelope (e.g. the 13 SC-0064 compilation-logs that carried "compilation-log" instead
 * of "sta-compilation-log") deploys-red at the portal while the body-only validator stays
 * green. Enforcing the envelope HERE makes that drift a hard block at validate time.
 * Oral STA arrive as raw .json with no frontmatter type (detected by body signature) and
 * are exempt — the check fires only when a type envelope is actually present.
 */
export const CANONICAL_NOTE_TYPE: Partial<Record<ArtifactKind, string>> = {
  MEANING_COORDINATES: "sta-meaning-coordinates",
  "COMPILATION-LOG": "sta-compilation-log",
  "BCD-DELTA": "bcd-delta",
  "VERIFICATION-INPUT": "verification-input",
};

const validators = new Map<ArtifactKind, Validator>();
function validatorFor(kind: ArtifactKind): Validator | null {
  if (validators.has(kind)) return validators.get(kind)!;
  let schema: object;
  switch (kind) {
    case "MEANING_COORDINATES":
      schema = loadValidationRules().meaning_coordinates_schema as object;
      break;
    case "COMPILATION-LOG":
      schema = loadSpecJson("compilation-log.schema.json");
      break;
    case "BCD-DELTA":
      schema = loadSpecJson("bcd-delta.schema.json");
      break;
    case "VERIFICATION-INPUT":
      schema = loadSpecJson("verification-input.schema.json");
      break;
    default:
      return null;
  }
  const v = compileSchema(schema);
  validators.set(kind, v);
  return v;
}

/**
 * Validate one artifact note. All four locked schemas are ingested structurally (Layer 1 via
 * ajv); the deep Layer-2/3 + register-critical vocabulary pass currently leads with MEANING_COORDINATES
 * (decision E — BCD-DELTA → COMPILATION-LOG → VERIFICATION-INPUT vocab passes follow).
 */
export function validateArtifact(path: string): ValidationReport {
  const rules = loadValidationRules();
  const base = { file: path, specVersion: rules.version };

  let note: ReturnType<typeof readArtifactNote>;
  try {
    note = readArtifactNote(path);
  } catch (e) {
    const findings: Finding[] = [{ severity: "block", code: "schema", location: "(file)", message: (e as Error).message }];
    return { ...base, artifact: detectArtifact(path), ok: false, findings, counts: tally(findings) };
  }

  const kind = detectArtifact(path, note.frontmatter["type"], note.json);
  const validator = validatorFor(kind);
  if (!validator) {
    const findings: Finding[] = [
      { severity: "block", code: "schema", location: "(file)", message: `unrecognized artifact type for ${basename(path)}` },
    ];
    return { ...base, artifact: kind, ok: false, findings, counts: tally(findings) };
  }

  const findings: Finding[] = [...structuralFindings(validator, note.json)];

  // SC-0075: enforce the note `type` envelope against the canonical per-class value the
  // portal gate keys on. Fires only when a type envelope is present (oral raw-.json STA,
  // detected by body signature, carry none and are exempt).
  const noteType = note.frontmatter["type"];
  const canonicalType = CANONICAL_NOTE_TYPE[kind];
  if (noteType && canonicalType && noteType !== canonicalType) {
    findings.push({
      severity: "block",
      code: "note-type",
      location: "frontmatter.type",
      message: `note type envelope is "${noteType}", expected "${canonicalType}" for a ${kind} (the portal approved-only gate keys on this)`,
    });
  }

  if (kind === "MEANING_COORDINATES") {
    findings.push(...vocabularyFindings(note.json as any, driftBaseline()));
    // SC-0065: oral artifacts (source_domain = oral_archive) get the bead-span integrity pass
    // (tiling + nesting) — the audio analogue of the biblical scene/verse-coverage invariants.
    if ((note.json as any)?.source_domain === "oral_archive") {
      findings.push(...oralFindings(note.json as any));
    }
  }
  const counts = tally(findings);
  return { ...base, artifact: kind, ok: counts.block === 0, findings, counts };
}
