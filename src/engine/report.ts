/**
 * The 3-layer vocabulary model produces findings at four severities:
 *  - block       : schema error or closed-list (L1) violation, or broken referential integrity. Fails validation.
 *  - drift       : a value not in the seed on a *convergent* bounded-open axis (proposition_kind,
 *                  scene_kind, arc/context/tone/pace/communicative_function, presence_value,
 *                  discourse_thread_state, high_risk_register_kind). Real review-signal — these
 *                  lists are expected to converge; promote-with-provenance on review.
 *  - descriptive : a value not in the seed on an *open/descriptive* axis (role_in_scene,
 *                  function_in_scene, the *_kind_examples, referential_form). These are per-pericope
 *                  by nature and never converge — informational only, not a review signal.
 *  - propose     : an L3 registry code (B/PL/O/TM/I/CB/FIG) that may need a BCD-delta entry.
 *  - info        : informational (counts, register-critical presence notes).
 */
export type Severity = "block" | "drift" | "descriptive" | "propose" | "info";

export type FindingCode =
  | "schema"
  | "closed-list"
  | "referential-integrity"
  | "drift"
  | "descriptive"
  | "registry"
  | "register-critical";

export interface Finding {
  severity: Severity;
  code: FindingCode;
  location: string; // JSON-pointer-ish path within the artifact, or "(root)"
  message: string;
  /** for drift/descriptive findings: the seed-enumeration axis (e.g. "proposition_kind"). */
  axis?: string;
}

export interface ValidationReport {
  file: string;
  artifact: string; // "FOR_MODEL" | "COMPILATION-LOG" | ...
  specVersion: string;
  ok: boolean; // true iff no `block` findings
  findings: Finding[];
  counts: Record<Severity, number>;
}

export function tally(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { block: 0, drift: 0, descriptive: 0, propose: 0, info: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

const ORDER: Severity[] = ["block", "drift", "descriptive", "propose", "info"];
const GLYPH: Record<Severity, string> = { block: "✗ BLOCK", drift: "~ DRIFT", descriptive: "≈ descr", propose: "+ PROPOSE", info: "· info" };

/** Human-readable one-artifact report for the CLI. */
export function formatReport(r: ValidationReport): string {
  const lines: string[] = [];
  const status = r.ok ? "VALID" : "INVALID";
  lines.push(`${r.ok ? "✓" : "✗"} ${status}  ${r.artifact}  ${r.file}`);
  lines.push(
    `   spec ${r.specVersion} · ${r.counts.block} block · ${r.counts.drift} drift · ${r.counts.descriptive} descr · ${r.counts.propose} propose · ${r.counts.info} info`,
  );
  const sorted = [...r.findings].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  for (const f of sorted) {
    lines.push(`   ${GLYPH[f.severity]}  ${f.location}  ${f.message}`);
  }
  return lines.join("\n");
}
