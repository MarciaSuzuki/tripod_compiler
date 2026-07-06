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
 *  - quarantined : a value on a convergent axis that is in `quarantined-vocabulary.json` (SC-0023) —
 *                  a used-once coin-flip deliberately NOT promoted. Surfaced as an explicit NOTICE
 *                  (neither approved-and-silent nor a failing `drift`); a recurrence (the value in
 *                  ≥2 pericopes) is flagged RECURS by the corpus `quarantineWatch` — the revisit signal.
 *  - propose     : an L3 registry code (B/PL/O/TM/I/CB/FIG) that may need a BCD-delta entry.
 *  - info        : informational (counts, register-critical presence notes).
 */
export type Severity = "block" | "drift" | "quarantined" | "descriptive" | "propose" | "info";

export type FindingCode =
  | "schema"
  | "note-type"
  | "closed-list"
  | "referential-integrity"
  | "drift"
  | "quarantined"
  | "descriptive"
  | "registry"
  | "register-critical"
  | "fidelity-shape"
  | "bead-span";

export interface Finding {
  severity: Severity;
  code: FindingCode;
  location: string; // JSON-pointer-ish path within the artifact, or "(root)"
  message: string;
  /** for drift/descriptive/quarantined findings: the seed-enumeration axis (e.g. "proposition_kind"). */
  axis?: string;
  /** for drift/descriptive/quarantined findings: the raw offending value (for cross-artifact aggregation). */
  value?: string;
}

export interface ValidationReport {
  file: string;
  artifact: string; // "MEANING_COORDINATES" | "COMPILATION-LOG" | ...
  specVersion: string;
  ok: boolean; // true iff no `block` findings
  findings: Finding[];
  counts: Record<Severity, number>;
}

export function tally(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { block: 0, drift: 0, quarantined: 0, descriptive: 0, propose: 0, info: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

const ORDER: Severity[] = ["block", "drift", "quarantined", "descriptive", "propose", "info"];
const GLYPH: Record<Severity, string> = { block: "✗ BLOCK", drift: "~ DRIFT", quarantined: "⚠ QUARANTINED", descriptive: "≈ descr", propose: "+ PROPOSE", info: "· info" };

/** Human-readable one-artifact report for the CLI. */
export function formatReport(r: ValidationReport): string {
  const lines: string[] = [];
  const status = r.ok ? "VALID" : "INVALID";
  lines.push(`${r.ok ? "✓" : "✗"} ${status}  ${r.artifact}  ${r.file}`);
  lines.push(
    `   spec ${r.specVersion} · ${r.counts.block} block · ${r.counts.drift} drift · ${r.counts.quarantined} quarantined · ${r.counts.descriptive} descr · ${r.counts.propose} propose · ${r.counts.info} info`,
  );
  const sorted = [...r.findings].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  for (const f of sorted) {
    lines.push(`   ${GLYPH[f.severity]}  ${f.location}  ${f.message}`);
  }
  return lines.join("\n");
}

/** A quarantined value's exposure across a set of validated artifacts (SC-0023). */
export interface QuarantineWatchEntry {
  value: string;
  axis: string;
  pericopes: string[]; // distinct pericope ids (P0N) the value appears in
  occurrences: number; // total uses across the artifacts
  recurs: boolean; // true once the value appears in ≥2 pericopes → the explicit revisit signal
}

const pericopeOf = (file: string): string => /\b(P\d{2})\b/.exec(file)?.[1] ?? file;

/**
 * Aggregate `quarantined` findings across artifacts so a RECURRENCE is explicit, not merely excluded
 * from the drift gate (SC-0023). A quarantined value seen in ≥2 pericopes is flagged `recurs` — the
 * signal that frequency data has arrived and the value should be revisited (promote or collapse).
 */
export function quarantineWatch(reports: ValidationReport[]): QuarantineWatchEntry[] {
  const byValue = new Map<string, { axis: string; pericopes: Set<string>; occurrences: number }>();
  for (const r of reports) {
    const pid = pericopeOf(r.file);
    for (const f of r.findings) {
      if (f.severity !== "quarantined" || !f.value) continue;
      const e = byValue.get(f.value) ?? { axis: f.axis ?? "", pericopes: new Set<string>(), occurrences: 0 };
      e.pericopes.add(pid);
      e.occurrences++;
      byValue.set(f.value, e);
    }
  }
  return [...byValue.entries()]
    .map(([value, e]) => ({ value, axis: e.axis, pericopes: [...e.pericopes].sort(), occurrences: e.occurrences, recurs: e.pericopes.size >= 2 }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/** Render the corpus quarantine watch for the CLI; empty string when nothing is quarantined. */
export function formatQuarantineWatch(entries: QuarantineWatchEntry[]): string {
  if (entries.length === 0) return "";
  const lines = [`— quarantine watch (SC-0023): ${entries.length} quarantined value(s) in use —`];
  for (const e of entries) {
    const tag = e.recurs
      ? `⚠ RECURS in ${e.pericopes.length} pericopes [${e.pericopes.join(", ")}] — revisit: promote (real type) or collapse (one-off)`
      : `parked [${e.pericopes.join(", ")}] — single pericope, awaiting revisit`;
    lines.push(`   ${e.value}  (${e.axis})  ${e.occurrences}×  ${tag}`);
  }
  const recurring = entries.filter((e) => e.recurs).length;
  lines.push(recurring ? `  → ${recurring} value(s) now RECUR — bring to review.` : `  → none recur yet (P01–P06 each used once); recurrence in P07–P14 will flag here.`);
  return lines.join("\n");
}
