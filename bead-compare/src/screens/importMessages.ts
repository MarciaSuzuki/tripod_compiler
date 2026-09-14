import { ImportError, type ImportDiagnostic, type ImportDiagnosticCode } from "../db/recording";
import { formatSeconds } from "../export/report";
import type { Lang, T } from "../i18n";

/**
 * Turn an import diagnostic ({ code, vars }) into what the passage card shows:
 * one translated sentence, plus an optional technical detail that the card
 * puts inside a collapsed <TechnicalDetails>. The detail is where the raw
 * parser text (a tape.json field check, a JSON error) and the file's numbers
 * (sample rate, frame rate, durations) live, so the sentence itself carries
 * neither English nor tape numbers.
 *
 * Numeric vars named `*_s` are seconds and take the language's decimal mark.
 */
export interface ImportLineText {
  text: string;
  detail?: string;
}

/** Codes whose numbers are rendered from a translated `<code>.detail` template. */
const DETAIL_TEMPLATES: ReadonlySet<ImportDiagnosticCode> = new Set<ImportDiagnosticCode>([
  "wav_format",
  "duration_mismatch",
  "frame_rate_unusual",
]);

function formatVars(lang: Lang, d: ImportDiagnostic): Record<string, string | number> {
  const vars: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(d.vars ?? {})) {
    vars[k] = k.endsWith("_s") && typeof v === "number" ? formatSeconds(v, lang) : v;
  }
  return vars;
}

export function diagnosticLine(t: T, lang: Lang, d: ImportDiagnostic): ImportLineText {
  const vars = formatVars(lang, d);
  const text = t(`passages.import.${d.code}`, vars);
  const raw = d.vars?.detail;
  if (typeof raw === "string" && raw.trim().length > 0) return { text, detail: raw };
  if (DETAIL_TEMPLATES.has(d.code)) return { text, detail: t(`passages.import.${d.code}.detail`, vars) };
  return { text };
}

/** A thrown import failure as a line: translated when it carries a diagnostic, its own text otherwise. */
export function importErrorLine(t: T, lang: Lang, e: unknown): ImportLineText {
  if (e instanceof ImportError) return diagnosticLine(t, lang, e.diagnostic);
  return { text: e instanceof Error ? e.message : String(e) };
}
