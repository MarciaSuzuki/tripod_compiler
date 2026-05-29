import { basename } from "node:path";
import { readArtifactNote } from "../reader/obsidian.js";
import { loadValidationRules, loadSpecJson } from "../spec/load.js";
import { compileSchema, structuralFindings, type Validator } from "./structural.js";
import { vocabularyFindings } from "./vocabulary.js";
import { driftBaseline } from "../spec/enumerations.js";
import { tally, type Finding, type ValidationReport } from "./report.js";

export type ArtifactKind =
  | "FOR_MODEL"
  | "COMPILATION-LOG"
  | "BCD-DELTA"
  | "VERIFICATION-INPUT"
  | "UNKNOWN";

export function detectArtifact(path: string, frontmatterType?: string): ArtifactKind {
  const n = basename(path).toUpperCase();
  if (n.includes("FOR-MODEL") || frontmatterType === "sta-for-model") return "FOR_MODEL";
  if (n.includes("COMPILATION-LOG") || frontmatterType === "compilation-log") return "COMPILATION-LOG";
  if (n.includes("BCD-DELTA") || frontmatterType === "bcd-delta") return "BCD-DELTA";
  if (n.includes("VERIFICATION-INPUT") || frontmatterType === "verification-input") return "VERIFICATION-INPUT";
  return "UNKNOWN";
}

const validators = new Map<ArtifactKind, Validator>();
function validatorFor(kind: ArtifactKind): Validator | null {
  if (validators.has(kind)) return validators.get(kind)!;
  let schema: object;
  switch (kind) {
    case "FOR_MODEL":
      schema = loadValidationRules().for_model_schema as object;
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
 * ajv); the deep Layer-2/3 + register-critical vocabulary pass currently leads with FOR_MODEL
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

  const kind = detectArtifact(path, note.frontmatter["type"]);
  const validator = validatorFor(kind);
  if (!validator) {
    const findings: Finding[] = [
      { severity: "block", code: "schema", location: "(file)", message: `unrecognized artifact type for ${basename(path)}` },
    ];
    return { ...base, artifact: kind, ok: false, findings, counts: tally(findings) };
  }

  const findings: Finding[] = [...structuralFindings(validator, note.json)];
  if (kind === "FOR_MODEL") {
    findings.push(...vocabularyFindings(note.json as any, driftBaseline()));
  }
  const counts = tally(findings);
  return { ...base, artifact: kind, ok: counts.block === 0, findings, counts };
}
