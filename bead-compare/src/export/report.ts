/**
 * The report a consultant hands to the team for one pair (A older, B newer):
 * a plain data object (`ReportData`), rendered as Markdown or JSON.
 *
 * Everything here is pure: no React, no I/O. The screen (`screens/Report.tsx`)
 * renders the same data as HTML and calls `downloadText` for the files.
 *
 * Times are seconds, derived from frames with each tape's own frame rate.
 * The files carry the full hashes on purpose: they are hand-off documents,
 * not the listening UI.
 */

import { formatTime } from "../audio/format";
import { translate, type Lang } from "../i18n";
import type {
  CarryOutcome,
  CommentKind,
  CompareResult,
  PairRecord,
  Passage,
  RegionKind,
  Settings,
  Verdict,
  Version,
} from "../model";
import { regionKey, shortHash } from "../model";

export { downloadText } from "./download";

export const REPORT_APP_NAME = "Bead Compare";
export const REPORT_FORMAT_VERSION = 1;

export interface ReportRegion {
  /** The region's index in the comparison (0-based, as in the model); shown as index + 1. */
  index: number;
  kind: RegionKind;
  a_start_s: number;
  a_end_s: number;
  b_start_s: number;
  b_end_s: number;
  verdict: Verdict;
}

export interface ReportCarried {
  comment_id: string;
  author: string;
  kind: CommentKind;
  text?: string;
  has_audio: boolean;
  a_start_s: number;
  a_end_s: number;
  b_start_s: number;
  b_end_s: number;
  outcome: CarryOutcome;
}

export interface ReportVersion {
  label: string;
  tape_sha256: string;
  audio_sha256: string;
  mock: boolean;
  narrator?: string;
  recorded_at?: string;
  language?: string;
}

export interface ReportData {
  generated_at: string;
  passage: string;
  a: ReportVersion;
  b: ReportVersion;
  codebook_hash: string;
  stability: number;
  region_count: number;
  changed_seconds: number;
  regions: ReportRegion[];
  carried: ReportCarried[];
  settings: Settings;
  app: { name: string; format_version: number };
}

export interface BuildReportInput {
  passage: Passage;
  a: Version;
  b: Version;
  result: CompareResult;
  pair?: PairRecord;
  settings: Settings;
  generated_at: string;
}

const VERDICTS: readonly Verdict[] = ["requested_fix_confirmed", "unrequested_ok", "unrequested_problem", "undecided"];

function isVerdict(x: unknown): x is Verdict {
  return typeof x === "string" && (VERDICTS as readonly string[]).includes(x);
}

function seconds(frame: number, frameRate: number): number {
  if (!(frameRate > 0) || !Number.isFinite(frame)) return 0;
  return frame / frameRate;
}

function versionFacts(v: Version): ReportVersion {
  const out: ReportVersion = {
    label: v.label,
    tape_sha256: v.tape_sha256,
    audio_sha256: v.audio_sha256,
    mock: v.tape.mock === true,
  };
  if (v.meta.narrator) out.narrator = v.meta.narrator;
  if (v.meta.recorded_at) out.recorded_at = v.meta.recorded_at;
  if (v.meta.language) out.language = v.meta.language;
  return out;
}

/** Shape a comparison into the report data. A region with no stored verdict reads as "undecided". */
export function buildReport(input: BuildReportInput): ReportData {
  const { passage, a, b, result, pair, settings, generated_at } = input;
  const rateA = a.tape.frame_rate;
  const rateB = b.tape.frame_rate;

  const regions: ReportRegion[] = result.regions.map((r) => {
    const stored = pair?.verdicts?.[regionKey(r)];
    return {
      index: r.index,
      kind: r.kind,
      a_start_s: seconds(r.a.start, rateA),
      a_end_s: seconds(r.a.end, rateA),
      b_start_s: seconds(r.b.start, rateB),
      b_end_s: seconds(r.b.end, rateB),
      verdict: isVerdict(stored) ? stored : "undecided",
    };
  });

  const carried: ReportCarried[] = result.carried.map((c) => {
    const item: ReportCarried = {
      comment_id: c.source.id,
      author: c.source.author,
      kind: c.source.kind,
      has_audio: !!c.source.audio_blob,
      a_start_s: seconds(c.source.span.start_frame, rateA),
      a_end_s: seconds(c.source.span.end_frame, rateA),
      b_start_s: seconds(c.span.start_frame, rateB),
      b_end_s: seconds(c.span.end_frame, rateB),
      outcome: c.outcome,
    };
    if (c.source.text !== undefined) item.text = c.source.text;
    return item;
  });

  return {
    generated_at,
    passage: passage.title,
    a: versionFacts(a),
    b: versionFacts(b),
    codebook_hash: a.tape.codebook_hash,
    stability: result.summary.stability,
    region_count: result.summary.region_count,
    changed_seconds: result.summary.changed_seconds,
    regions,
    carried,
    settings: structuredClone(settings),
    app: { name: REPORT_APP_NAME, format_version: REPORT_FORMAT_VERSION },
  };
}

// ---------------------------------------------------------------------------
// Formatting shared by the Markdown export and the screen

function numberFormat(lang: Lang, options: Intl.NumberFormatOptions): Intl.NumberFormat | null {
  try {
    return new Intl.NumberFormat(lang, options);
  } catch {
    return null;
  }
}

/** Seconds with one decimal in the language's notation: 1.8 → "1,8" (pt-BR) / "1.8" (en). */
export function formatSeconds(value: number, lang: Lang): string {
  const s = Number.isFinite(value) && value > 0 ? value : 0;
  const nf = numberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return nf ? nf.format(s) : s.toFixed(1);
}

/** A 0–100 score as a percent with up to one decimal: 87.5 → "87,5%" (pt-BR) / "87.5%" (en). */
export function formatPercent(value: number, lang: Lang): string {
  const v = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const nf = numberFormat(lang, { style: "percent", maximumFractionDigits: 1 });
  return nf ? nf.format(v / 100) : `${v}%`;
}

/**
 * A date for people: an ISO timestamp becomes "14 de set. de 2026, 07:00";
 * a bare date (YYYY-MM-DD) and anything unparseable are shown as written.
 */
export function formatReportDate(value: string | undefined, lang: Lang): string | undefined {
  if (value === undefined) return undefined;
  const raw = value.trim();
  if (raw === "" || /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw || undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** "0:00.6 – 0:01.0" (en) / "0:00,6 – 0:01,0" (pt-BR) for a span; "em 0:01,4" / "at 0:01.4" for a zero-length point. */
export function describeSpan(startSeconds: number, endSeconds: number, lang: Lang): string {
  if (!(endSeconds > startSeconds)) return translate(lang, "report.regions.point", { time: formatTime(startSeconds, lang) });
  return `${formatTime(startSeconds, lang)} – ${formatTime(endSeconds, lang)}`;
}

// ---------------------------------------------------------------------------
// Markdown

/** One line of text: newlines collapsed to spaces. */
function inline(s: string): string {
  return s.replace(/\s*[\r\n]+\s*/g, " ").trim();
}

/** A table cell: one line, pipes escaped, "—" when empty. */
function cell(s: string | undefined, none: string): string {
  const text = inline(s ?? "").replace(/\|/g, "\\|");
  return text.length > 0 ? text : none;
}

function tableRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

function table(header: string[], rows: string[][]): string[] {
  return [tableRow(header), tableRow(header.map(() => "---")), ...rows.map(tableRow)];
}

function code(s: string): string {
  return "`" + s.replace(/`/g, "") + "`";
}

/** The report as GitHub/Obsidian-friendly Markdown in the given language. */
export function reportToMarkdown(r: ReportData, lang: Lang): string {
  const tr = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const none = tr("report.facts.none");
  const lines: string[] = [];

  lines.push(`# ${r.app.name} — ${inline(r.passage)}`, "", tr("report.header.intro"), "");

  // Versions: the facts of A and B, then the hashes in one small table.
  lines.push(`## ${tr("report.facts.title")}`, "");
  for (const [tag, v] of [
    ["report.facts.version_a", r.a],
    ["report.facts.version_b", r.b],
  ] as const) {
    lines.push(`**${tr(tag)}** — ${inline(v.label) || none}`, "");
    lines.push(`- ${tr("report.facts.narrator")}: ${v.narrator ? inline(v.narrator) : none}`);
    lines.push(`- ${tr("report.facts.recorded_at")}: ${formatReportDate(v.recorded_at, lang) ?? none}`);
    lines.push(`- ${tr("report.facts.language")}: ${v.language ? inline(v.language) : none}`);
    if (v.mock) lines.push(`- ${tr("report.facts.mock")}`);
    lines.push("");
  }
  const aName = `${tr("report.header.a_label", { label: cell(r.a.label, none) })}`;
  const bName = `${tr("report.header.b_label", { label: cell(r.b.label, none) })}`;
  lines.push(
    ...table(
      [tr("report.facts.version"), tr("report.facts.hash"), tr("report.facts.short"), tr("report.facts.full")],
      [
        [aName, tr("report.facts.tape_hash"), code(shortHash(r.a.tape_sha256)), code(r.a.tape_sha256)],
        [aName, tr("report.facts.audio_hash"), code(shortHash(r.a.audio_sha256)), code(r.a.audio_sha256)],
        [bName, tr("report.facts.tape_hash"), code(shortHash(r.b.tape_sha256)), code(r.b.tape_sha256)],
        [bName, tr("report.facts.audio_hash"), code(shortHash(r.b.audio_sha256)), code(r.b.audio_sha256)],
        [tr("report.facts.shared"), tr("report.facts.codebook"), code(shortHash(r.codebook_hash)), code(r.codebook_hash)],
      ],
    ),
    "",
  );

  // Summary
  lines.push(
    `## ${tr("report.summary.title")}`,
    "",
    `- ${tr("report.summary.regions")}: ${r.region_count}`,
    `- ${tr("report.summary.changed_seconds")}: ${tr("report.summary.seconds", { value: formatSeconds(r.changed_seconds, lang) })}`,
    `- ${tr("report.summary.stability")}: ${formatPercent(r.stability, lang)}`,
    "",
  );

  // Regions
  lines.push(`## ${tr("report.regions.title")}`, "");
  if (r.regions.length === 0) {
    lines.push(tr("report.summary.no_regions"), "");
  } else {
    lines.push(
      ...table(
        [
          tr("report.regions.col_index"),
          tr("report.regions.col_kind"),
          tr("report.regions.col_a"),
          tr("report.regions.col_b"),
          tr("report.regions.col_verdict"),
        ],
        r.regions.map((x) => [
          String(x.index + 1),
          tr(`common.region.${x.kind}`),
          describeSpan(x.a_start_s, x.a_end_s, lang),
          describeSpan(x.b_start_s, x.b_end_s, lang),
          tr(`common.verdict.${x.verdict}`),
        ]),
      ),
      "",
    );
  }

  // Carried fix requests
  lines.push(`## ${tr("report.carried.title")}`, "");
  if (r.carried.length === 0) {
    lines.push(tr("report.carried.empty"), "");
  } else {
    if (r.carried.some((c) => c.outcome === "no_change_detected")) lines.push(tr("report.carried.warning"), "");
    lines.push(
      ...table(
        [
          tr("report.carried.col_author"),
          tr("report.carried.col_kind"),
          tr("report.carried.col_text"),
          tr("report.carried.col_audio"),
          tr("report.carried.col_a"),
          tr("report.carried.col_b"),
          tr("report.carried.col_outcome"),
        ],
        r.carried.map((c) => [
          cell(c.author, none),
          tr(`common.kind.${c.kind}`),
          cell(c.text, none),
          tr(c.has_audio ? "report.carried.audio_yes" : "report.carried.audio_no"),
          describeSpan(c.a_start_s, c.a_end_s, lang),
          describeSpan(c.b_start_s, c.b_end_s, lang),
          tr(`common.carry.${c.outcome}`),
        ]),
      ),
      "",
    );
  }

  // Footer: when, by what, with which settings.
  const g = r.settings.grouping;
  const al = r.settings.alignment;
  lines.push(
    "---",
    "",
    `## ${tr("report.footer.title")}`,
    "",
    `- ${tr("report.footer.generated_at", { date: formatReportDate(r.generated_at, lang) ?? r.generated_at })}`,
    `- ${tr("report.footer.generated_by", { app: r.app.name, version: r.app.format_version })}`,
    `- ${tr("report.footer.settings")}:`,
    `  - ${tr("common.settings.grouping")}: ${tr("common.settings.min_cluster_frames")} ${g.min_cluster_frames}`,
    `  - ${tr("common.settings.alignment")}: ${[
      `${tr("common.settings.match_score")} ${al.match_score}`,
      `${tr("common.settings.mismatch_penalty")} ${al.mismatch_penalty}`,
      `${tr("common.settings.gap_penalty")} ${al.gap_penalty}`,
      `${tr("common.settings.merge_gap_frames")} ${al.merge_gap_frames}`,
      `${tr("common.settings.melody_threshold")} ${al.melody_threshold}`,
    ].join(" · ")}`,
    "",
  );

  return lines.join("\n");
}

export function reportToJson(r: ReportData): string {
  return JSON.stringify(r, null, 2);
}
