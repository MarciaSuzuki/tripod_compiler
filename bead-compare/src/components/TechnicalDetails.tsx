import type { ReactNode } from "react";

/**
 * The ONLY place in the UI where tape numbers (U/F values, frame indexes,
 * sample counts, hashes) may appear. Collapsed by default.
 *
 * The screen passes the translated summary text (t("common.tech.summary")).
 * The fallback below is only a safety net for a screen that forgot to.
 */
export function TechnicalDetails(props: { children: ReactNode; summary?: string }): JSX.Element {
  return (
    <details className="tech">
      <summary className="tech__summary">{props.summary ?? "Detalhes técnicos"}</summary>
      <div className="tech__body">{props.children}</div>
    </details>
  );
}
