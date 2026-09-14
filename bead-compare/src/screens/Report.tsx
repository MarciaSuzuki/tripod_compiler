import { useCallback, useEffect, useMemo, useState } from "react";
import "./Report.css";
import { MockBadge } from "../components/MockBadge";
import { TechnicalDetails } from "../components/TechnicalDetails";
import { repo } from "../db/repo";
import { safeFilename } from "../export/download";
import {
  buildReport,
  describeSpan,
  downloadText,
  formatPercent,
  formatReportDate,
  formatSeconds,
  reportToJson,
  reportToMarkdown,
  type ReportData,
  type ReportVersion,
} from "../export/report";
import { useI18n, type Lang, type T } from "../i18n";
import type { Comment, CompareResult, PairRecord, Passage, Version } from "../model";
import { AlignmentTooLargeError, compareTapes, shortHash } from "../model";
import { routePath, useRoute } from "../router";
import { useSettings } from "../settings";

/**
 * Report (#/report/:aId/:bId): what the consultant hands to the team for
 * one pair (A older, B newer). The same content as the Markdown export,
 * rendered as calm HTML: the two versions, three summary numbers, the
 * regions with their verdicts (read-only here; a link to Compare changes
 * them), the carried fix requests, and the two downloads.
 *
 * Hashes and the settings used appear only inside <TechnicalDetails>; the
 * downloaded files carry them in full, since they are hand-off documents.
 */

interface Loaded {
  passage: Passage | undefined;
  a: Version;
  b: Version;
  commentsA: Comment[];
  pair: PairRecord | undefined;
}

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Loaded };

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const MARKDOWN_MIME = "text/markdown;charset=utf-8";
const JSON_MIME = "application/json;charset=utf-8";

// ---------------------------------------------------------------------------

export function Report(): JSX.Element {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const route = useRoute();
  const aId = route.name === "report" ? route.aId : "";
  const bId = route.name === "report" ? route.bId : "";

  const [load, setLoad] = useState<LoadState>({ status: "loading" });

  // Both versions, the passage, A's comments and the stored verdicts.
  useEffect(() => {
    if (!aId || !bId) {
      setLoad({ status: "not_found" });
      return;
    }
    let cancelled = false;
    setLoad({ status: "loading" });
    void (async () => {
      try {
        const [a, b] = await Promise.all([repo.getVersion(aId), repo.getVersion(bId)]);
        if (cancelled) return;
        if (!a || !b) {
          setLoad({ status: "not_found" });
          return;
        }
        const [passage, commentsA, pair] = await Promise.all([
          repo.getPassage(a.passage_id),
          repo.listComments(aId),
          repo.getPair(aId, bId),
        ]);
        if (cancelled) return;
        setLoad({ status: "ready", data: { passage, a, b, commentsA, pair } });
      } catch (e) {
        if (!cancelled) setLoad({ status: "error", message: errorMessage(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aId, bId]);

  const data = load.status === "ready" ? load.data : null;
  const mismatch = data !== null && data.a.tape.codebook_hash !== data.b.tape.codebook_hash;
  const rateMismatch = data !== null && data.a.tape.frame_rate !== data.b.tape.frame_rate;

  const computed = useMemo<{ result: CompareResult | null; tooLarge: boolean }>(() => {
    if (!data || mismatch || rateMismatch) return { result: null, tooLarge: false };
    try {
      return { result: compareTapes(data.a.tape, data.b.tape, data.commentsA, bId, settings), tooLarge: false };
    } catch (e) {
      if (e instanceof AlignmentTooLargeError) return { result: null, tooLarge: true };
      throw e;
    }
  }, [data, mismatch, rateMismatch, bId, settings]);
  const result = computed.result;
  const refusal = mismatch ? "codebook_mismatch" : rateMismatch ? "frame_rate_mismatch" : computed.tooLarge ? "too_large" : null;

  /** The passage as the report needs it; a missing passage record gets a placeholder title. */
  const passageForReport = useCallback(
    (d: Loaded): Passage =>
      d.passage ?? { id: d.a.passage_id, title: t("report.header.untitled"), created_at: "", version_ids: [] },
    [t],
  );

  const makeReport = useCallback(
    (generated_at: string): ReportData | null => {
      if (!data || !result) return null;
      return buildReport({
        passage: passageForReport(data),
        a: data.a,
        b: data.b,
        result,
        pair: data.pair,
        settings,
        generated_at,
      });
    },
    [data, result, settings, passageForReport],
  );

  // What the screen shows. Downloads rebuild with a fresh timestamp.
  const report = useMemo(() => makeReport(new Date().toISOString()), [makeReport]);

  const download = (format: "md" | "json") => {
    const fresh = makeReport(new Date().toISOString());
    if (!fresh || !data) return;
    const base = `bead-compare-${safeFilename(fresh.passage)}-${safeFilename(data.a.label, "A")}-vs-${safeFilename(data.b.label, "B")}`;
    if (format === "md") downloadText(`${base}.md`, reportToMarkdown(fresh, lang), MARKDOWN_MIME);
    else downloadText(`${base}.json`, reportToJson(fresh), JSON_MIME);
  };

  // ---- render ---------------------------------------------------------------

  if (load.status === "loading") {
    return (
      <section className="screen report">
        <p className="muted">{t("report.state.loading")}</p>
      </section>
    );
  }
  if (load.status === "not_found" || load.status === "error") {
    const message =
      load.status === "not_found" ? t("report.state.not_found") : t("report.state.load_failed", { message: load.message });
    return (
      <section className="screen report">
        <div className="card stack">
          <p className="report__refusal" role="alert">
            {message}
          </p>
          <p>
            <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
              {t("report.header.passages")}
            </a>
          </p>
        </div>
      </section>
    );
  }

  const { a, b } = load.data;
  const title = passageForReport(load.data).title;
  const compareHref = routePath({ name: "compare", aId, bId });

  if (refusal) {
    return (
      <section className="screen report">
        <Header title={title} a={a} b={b} t={t} compareHref={compareHref} />
        <div className="card stack">
          <p className="report__refusal" role="alert">
            {t(`common.error.${refusal}`)}
          </p>
          <p>
            <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
              {t("report.header.passages")}
            </a>
          </p>
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="screen report">
        <p className="muted">{t("report.state.loading")}</p>
      </section>
    );
  }

  const hasWarning = report.carried.some((c) => c.outcome === "no_change_detected");

  return (
    <section className="screen report">
      <Header title={title} a={a} b={b} t={t} compareHref={compareHref} />

      <div className="card stack">
        <div className="row report__actions">
          <button type="button" className="btn btn--primary" onClick={() => download("md")}>
            {t("report.actions.download_md")}
          </button>
          <button type="button" className="btn" onClick={() => download("json")}>
            {t("report.actions.download_json")}
          </button>
        </div>
        <p className="report__actions-hint">{t("report.actions.hint")}</p>
      </div>

      <div className="card stack">
        <h2>{t("report.facts.title")}</h2>
        <div className="report-facts">
          <VersionFacts tag={t("report.facts.version_a")} version={a} facts={report.a} lang={lang} t={t} />
          <VersionFacts tag={t("report.facts.version_b")} version={b} facts={report.b} lang={lang} t={t} />
        </div>
      </div>

      <div className="card stack">
        <h2>{t("report.summary.title")}</h2>
        <div className="report__summary">
          <Fact value={String(report.region_count)} label={t("report.summary.regions")} />
          <Fact
            value={t("report.summary.seconds", { value: formatSeconds(report.changed_seconds, lang) })}
            label={t("report.summary.changed_seconds")}
          />
          <Fact value={formatPercent(report.stability, lang)} label={t("report.summary.stability")} />
        </div>
      </div>

      <div className="card stack">
        <div>
          <h2>{t("report.regions.title")}</h2>
          <p className="muted small">{t("report.regions.intro")}</p>
        </div>
        {report.regions.length === 0 ? (
          <p className="muted">{t("report.summary.no_regions")}</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col" className="report-table__index">
                    {t("report.regions.col_index")}
                  </th>
                  <th scope="col">{t("report.regions.col_kind")}</th>
                  <th scope="col">{t("report.regions.col_a")}</th>
                  <th scope="col">{t("report.regions.col_b")}</th>
                  <th scope="col">{t("report.regions.col_verdict")}</th>
                </tr>
              </thead>
              <tbody>
                {report.regions.map((r) => (
                  <tr key={r.index}>
                    <td className="report-table__index">{r.index + 1}</td>
                    <td className="report-table__kind">
                      <span className={"swatch swatch--" + r.kind} aria-hidden="true" />
                      {t(`common.region.${r.kind}`)}
                    </td>
                    <td className="report-table__time">{describeSpan(r.a_start_s, r.a_end_s, lang)}</td>
                    <td className="report-table__time">{describeSpan(r.b_start_s, r.b_end_s, lang)}</td>
                    <td className={"report__verdict report__verdict--" + r.verdict}>{t(`common.verdict.${r.verdict}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {report.regions.length > 0 && (
          <p>
            <a className="btn btn--quiet" href={compareHref}>
              {t("report.regions.edit")}
            </a>
          </p>
        )}
      </div>

      <div className="card stack">
        <div>
          <h2>{t("report.carried.title")}</h2>
          <p className="muted small">{t("report.carried.intro")}</p>
        </div>
        {hasWarning && (
          <p className="report__warning" role="status">
            {t("report.carried.warning")}
          </p>
        )}
        {report.carried.length === 0 ? (
          <p className="muted">{t("report.carried.empty")}</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">{t("report.carried.col_author")}</th>
                  <th scope="col">{t("report.carried.col_kind")}</th>
                  <th scope="col">{t("report.carried.col_text")}</th>
                  <th scope="col">{t("report.carried.col_audio")}</th>
                  <th scope="col">{t("report.carried.col_a")}</th>
                  <th scope="col">{t("report.carried.col_b")}</th>
                  <th scope="col">{t("report.carried.col_outcome")}</th>
                </tr>
              </thead>
              <tbody>
                {report.carried.map((c) => (
                  <tr key={c.comment_id}>
                    <td className="report-table__author">{c.author}</td>
                    <td className="report-table__kind">
                      <span className={"swatch swatch--" + c.kind} aria-hidden="true" />
                      {t(`common.kind.${c.kind}`)}
                    </td>
                    <td className="report-table__text">{c.text && c.text.trim() ? c.text : t("report.facts.none")}</td>
                    <td>{t(c.has_audio ? "report.carried.audio_yes" : "report.carried.audio_no")}</td>
                    <td className="report-table__time">{describeSpan(c.a_start_s, c.a_end_s, lang)}</td>
                    <td className="report-table__time">{describeSpan(c.b_start_s, c.b_end_s, lang)}</td>
                    <td>
                      <span className={"report__outcome report__outcome--" + c.outcome}>{t(`common.carry.${c.outcome}`)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="report__footer">
        <p className="muted small">
          {t("report.footer.generated_at", { date: formatReportDate(report.generated_at, lang) ?? report.generated_at })}
        </p>
        <TechnicalDetails summary={t("common.tech.summary")}>
          <dl className="tech__list">
            <HashRow label={`${t("report.header.a_label", { label: a.label })} · ${t("report.facts.tape_hash")}`} hash={a.tape_sha256} />
            <HashRow label={`${t("report.header.a_label", { label: a.label })} · ${t("report.facts.audio_hash")}`} hash={a.audio_sha256} />
            <HashRow label={`${t("report.header.b_label", { label: b.label })} · ${t("report.facts.tape_hash")}`} hash={b.tape_sha256} />
            <HashRow label={`${t("report.header.b_label", { label: b.label })} · ${t("report.facts.audio_hash")}`} hash={b.audio_sha256} />
            <HashRow label={t("report.facts.codebook")} hash={report.codebook_hash} />
            <dt>{t("report.footer.settings")}</dt>
            <dd>
              <code>
                {t("common.settings.grouping")}: {t("common.settings.min_cluster_frames")} {report.settings.grouping.min_cluster_frames}
              </code>
              <br />
              <code>
                {t("common.settings.alignment")}: {t("common.settings.match_score")} {report.settings.alignment.match_score} ·{" "}
                {t("common.settings.mismatch_penalty")} {report.settings.alignment.mismatch_penalty} ·{" "}
                {t("common.settings.gap_penalty")} {report.settings.alignment.gap_penalty} ·{" "}
                {t("common.settings.merge_gap_frames")} {report.settings.alignment.merge_gap_frames} ·{" "}
                {t("common.settings.melody_threshold")} {report.settings.alignment.melody_threshold}
              </code>
            </dd>
            <dt>{t("report.footer.format_version")}</dt>
            <dd>
              <code>
                {report.app.name} · {report.app.format_version}
              </code>
            </dd>
          </dl>
        </TechnicalDetails>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function Header(props: { title: string; a: Version; b: Version; t: T; compareHref: string }): JSX.Element {
  const { title, a, b, t, compareHref } = props;
  return (
    <div className="screen__head">
      <div>
        <p className="muted small">{t("report.header.title")}</p>
        <h1 className="screen__title">{title}</h1>
        <div className="report__versions">
          <span className="report__version">
            <span>{t("report.header.a_label", { label: a.label })}</span>
            <span className="report__version-hint">{t("report.header.a_hint")}</span>
            <MockBadge tape={a.tape} label={t("common.mock.badge")} />
          </span>
          <span className="report__version">
            <span>{t("report.header.b_label", { label: b.label })}</span>
            <span className="report__version-hint">{t("report.header.b_hint")}</span>
            <MockBadge tape={b.tape} label={t("common.mock.badge")} />
          </span>
        </div>
      </div>
      <div className="row report__links">
        <a className="btn btn--quiet" href={compareHref}>
          {t("report.header.compare")}
        </a>
        <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
          {t("report.header.passages")}
        </a>
      </div>
    </div>
  );
}

function VersionFacts(props: { tag: string; version: Version; facts: ReportVersion; lang: Lang; t: T }): JSX.Element {
  const { tag, version, facts, lang, t } = props;
  const none = t("report.facts.none");
  return (
    <div className="report-facts__side">
      <span className="report-facts__tag">{tag}</span>
      <span className="report-facts__label">
        <span>{facts.label}</span>
        <MockBadge tape={version.tape} label={t("common.mock.badge")} />
      </span>
      <dl className="report-facts__meta">
        <dt>{t("report.facts.narrator")}</dt>
        <dd>{facts.narrator ?? none}</dd>
        <dt>{t("report.facts.recorded_at")}</dt>
        <dd>{formatReportDate(facts.recorded_at, lang) ?? none}</dd>
        <dt>{t("report.facts.language")}</dt>
        <dd>{facts.language ?? none}</dd>
      </dl>
      {facts.mock && <p className="report-facts__mock">{t("report.facts.mock")}</p>}
    </div>
  );
}

function Fact(props: { value: string; label: string }): JSX.Element {
  return (
    <div className="report-fact">
      <span className="report-fact__value">{props.value}</span>
      <span className="report-fact__label">{props.label}</span>
    </div>
  );
}

function HashRow(props: { label: string; hash: string }): JSX.Element {
  return (
    <>
      <dt>{props.label}</dt>
      <dd>
        <code>{shortHash(props.hash)}</code> <code className="tech__full">{props.hash}</code>
      </dd>
    </>
  );
}
