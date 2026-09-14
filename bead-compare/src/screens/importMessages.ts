import { ImportError, type ImportDiagnostic } from "../db/recording";
import { formatSeconds } from "../export/report";
import type { Lang, T } from "../i18n";

/**
 * Turn an import diagnostic ({ code, vars }) into the consultant's language.
 * Numeric vars named `*_s` are seconds and take the language's decimal mark.
 */
export function diagnosticMessage(t: T, lang: Lang, d: ImportDiagnostic): string {
  const vars: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(d.vars ?? {})) {
    vars[k] = k.endsWith("_s") && typeof v === "number" ? formatSeconds(v, lang) : v;
  }
  return t(`passages.import.${d.code}`, vars);
}

/** A thrown import failure as a message: translated when it carries a diagnostic, its own text otherwise. */
export function importErrorMessage(t: T, lang: Lang, e: unknown): string {
  if (e instanceof ImportError) return diagnosticMessage(t, lang, e.diagnostic);
  return e instanceof Error ? e.message : String(e);
}
