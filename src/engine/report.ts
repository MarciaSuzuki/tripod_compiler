/**
 * The 3-layer vocabulary model produces findings at four severities:
 *  - block   : schema error or closed-list (L1) violation, or broken referential integrity. Fails validation.
 *  - drift   : a bounded-open (L2) value not in the canonical-P01 seed enumeration. Review → add-with-provenance.
 *  - propose : an L3 registry code (B/PL/O/TM/I/CB/FIG) that may need a BCD-delta entry.
 *  - info    : informational (counts, register-critical presence notes).
 */
export type Severity = "block" | "drift" | "propose" | "info";

export type FindingCode =
  | "schema"
  | "closed-list"
  | "referential-integrity"
  | "drift"
  | "registry"
  | "register-critical";

export interface Finding {
  severity: Severity;
  code: FindingCode;
  location: string; // JSON-pointer-ish path within the artifact, or "(root)"
  message: string;
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
  const counts: Record<Severity, number> = { block: 0, drift: 0, propose: 0, info: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

const ORDER: Severity[] = ["block", "drift", "propose", "info"];
const GLYPH: Record<Severity, string> = { block: "✗ BLOCK", drift: "~ DRIFT", propose: "+ PROPOSE", info: "· info" };

/** Human-readable one-artifact report for the CLI. */
export function formatReport(r: ValidationReport): string {
  const lines: string[] = [];
  const status = r.ok ? "VALID" : "INVALID";
  lines.push(`${r.ok ? "✓" : "✗"} ${status}  ${r.artifact}  ${r.file}`);
  lines.push(
    `   spec ${r.specVersion} · ${r.counts.block} block · ${r.counts.drift} drift · ${r.counts.propose} propose · ${r.counts.info} info`,
  );
  const sorted = [...r.findings].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  for (const f of sorted) {
    lines.push(`   ${GLYPH[f.severity]}  ${f.location}  ${f.message}`);
  }
  return lines.join("\n");
}
