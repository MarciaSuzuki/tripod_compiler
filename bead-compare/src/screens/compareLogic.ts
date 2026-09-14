import type { PlayItem } from "../audio/engine";
import { formatRange, formatTime, frameTime } from "../audio/format";
import { frameToX, type StripHighlight, type StripMarker } from "../components/BeadStrip";
import type { Lang } from "../i18n";
import type {
  AlignOpKind,
  Alignment,
  CarriedComment,
  Cluster,
  FrameRange,
  PairRecord,
  Region,
  Verdict,
} from "../model";
import { regionKey } from "../model";

/**
 * Pure helpers for the Compare screen: connector geometry, strip highlights
 * and markers, region-row text, verdict lookup and play items. No React, no
 * I/O, no strings (the screen translates); tested in tests/compare-logic.test.ts.
 */

// ---------------------------------------------------------------------------
// Connectors between the A and B strips

export interface Connector {
  /** x of the A cluster centre, in strip pixels */
  x1: number;
  /** x of the B cluster centre, in strip pixels */
  x2: number;
  kind: "match" | "mismatch";
}

function centreFrame(c: Cluster): number {
  return (c.start + c.end) / 2;
}

/**
 * One connector per match/mismatch alignment op between two speech clusters,
 * from the centre of the A cluster to the centre of the B cluster. Pause
 * clusters and gaps (insert/delete) draw nothing.
 */
export function buildConnectors(
  alignment: Alignment,
  clustersA: Cluster[],
  clustersB: Cluster[],
  totalA: number,
  totalB: number,
  width: number,
): Connector[] {
  const out: Connector[] = [];
  if (!(width > 0)) return out;
  for (const op of alignment.ops) {
    if (op.kind !== "match" && op.kind !== "mismatch") continue;
    if (op.a === null || op.b === null) continue;
    const ca = clustersA[op.a];
    const cb = clustersB[op.b];
    if (!ca || !cb || ca.is_pause || cb.is_pause) continue;
    out.push({
      x1: frameToX(centreFrame(ca), totalA, width),
      x2: frameToX(centreFrame(cb), totalB, width),
      kind: op.kind,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Highlight and marker ids

export const CARRIED_PREFIX = "carried:";
export const SOURCE_PREFIX = "source:";

/** Id of the highlight/marker drawn on B for a carried comment. */
export function carriedHighlightId(commentId: string): string {
  return CARRIED_PREFIX + commentId;
}

/** Id of the marker drawn on A for the original comment of a carried one. */
export function sourceMarkerId(commentId: string): string {
  return SOURCE_PREFIX + commentId;
}

/** Id of the highlight drawn for a region (on both strips). */
export function regionHighlightId(region: Pick<Region, "index">): string {
  return String(region.index);
}

export type HighlightRef =
  | { type: "region"; index: number }
  | { type: "carried"; commentId: string }
  | { type: "source"; commentId: string };

/** The inverse of the id helpers above; null for an id the screen did not make. */
export function parseHighlightId(id: string): HighlightRef | null {
  if (id.startsWith(CARRIED_PREFIX)) {
    const commentId = id.slice(CARRIED_PREFIX.length);
    return commentId ? { type: "carried", commentId } : null;
  }
  if (id.startsWith(SOURCE_PREFIX)) {
    const commentId = id.slice(SOURCE_PREFIX.length);
    return commentId ? { type: "source", commentId } : null;
  }
  if (!/^\d+$/.test(id)) return null;
  return { type: "region", index: Number(id) };
}

// ---------------------------------------------------------------------------
// Strip highlights and markers

/** Region highlights for one strip; the active one is the region with `activeKey`. */
export function regionHighlights(regions: Region[], side: "a" | "b", activeKey: string | null): StripHighlight[] {
  return regions.map((r) => ({
    range: { start: r[side].start, end: r[side].end },
    kind: r.kind,
    id: regionHighlightId(r),
    active: activeKey !== null && regionKey(r) === activeKey,
  }));
}

/** Where each carried comment lands on B: slate when the spot changed, amber when it did not. */
export function carriedHighlights(carried: CarriedComment[], activeCommentId: string | null = null): StripHighlight[] {
  return carried.map((c) => ({
    range: { start: c.span.start_frame, end: c.span.end_frame },
    kind: c.outcome === "changed_here" ? "carried" : "carried_warning",
    id: carriedHighlightId(c.source.id),
    active: activeCommentId !== null && c.source.id === activeCommentId,
  }));
}

/** Markers on B for the carried comments (dashed, `carried: true`). */
export function carriedMarkers(carried: CarriedComment[], activeCommentId: string | null = null): StripMarker[] {
  return carried.map((c) => ({
    range: { start: c.span.start_frame, end: c.span.end_frame },
    kind: c.source.kind,
    status: c.source.status,
    id: carriedHighlightId(c.source.id),
    active: activeCommentId !== null && c.source.id === activeCommentId,
    carried: true,
  }));
}

/** Markers on A for the original comments that were carried. */
export function sourceMarkers(carried: CarriedComment[], activeCommentId: string | null = null): StripMarker[] {
  return carried.map((c) => ({
    range: { start: c.source.span.start_frame, end: c.source.span.end_frame },
    kind: c.source.kind,
    status: c.source.status,
    id: sourceMarkerId(c.source.id),
    active: activeCommentId !== null && c.source.id === activeCommentId,
  }));
}

// ---------------------------------------------------------------------------
// Region rows

export type SideDescription =
  | { kind: "range"; text: string; startSeconds: number; endSeconds: number }
  | { kind: "point"; text: string; atSeconds: number };

/**
 * One side of a region as time text: "0:03.4 – 0:04.1" for a span, or the
 * single position for a zero-length side (the screen adds "here").
 */
export function describeSide(range: FrameRange, frameRate: number): SideDescription {
  const startSeconds = frameTime(range.start, frameRate);
  if (range.end <= range.start) {
    return { kind: "point", text: formatTime(startSeconds), atSeconds: startSeconds };
  }
  return {
    kind: "range",
    text: formatRange(range.start, range.end, frameRate),
    startSeconds,
    endSeconds: frameTime(range.end, frameRate),
  };
}

export const VERDICTS: readonly Verdict[] = [
  "requested_fix_confirmed",
  "unrequested_ok",
  "unrequested_problem",
  "undecided",
];

export function isVerdict(x: unknown): x is Verdict {
  return typeof x === "string" && (VERDICTS as readonly string[]).includes(x);
}

/** The stored verdict for a region; a missing or unknown value reads as "undecided". */
export function verdictOf(pair: PairRecord | null | undefined, region: Region): Verdict {
  const v = pair?.verdicts?.[regionKey(region)];
  return isVerdict(v) ? v : "undecided";
}

// ---------------------------------------------------------------------------
// Playback

export interface TapeRef {
  versionId: string;
  frameRate: number;
}

export type PlayWhich = "a" | "b" | "both";

function item(ref: TapeRef, range: FrameRange): PlayItem {
  return { versionId: ref.versionId, startFrame: range.start, endFrame: range.end, frameRate: ref.frameRate };
}

/** Play items for a region: A then B (or one side). A zero-length side is skipped. */
export function regionPlayItems(region: Region, a: TapeRef, b: TapeRef, which: PlayWhich = "both"): PlayItem[] {
  const items: PlayItem[] = [];
  if (which !== "b" && region.a.end > region.a.start) items.push(item(a, region.a));
  if (which !== "a" && region.b.end > region.b.start) items.push(item(b, region.b));
  return items;
}

export interface CarriedPlayTarget {
  /** "b" plays where the comment lands; "a" plays the original span when nothing lands on B. */
  side: "a" | "b";
  item: PlayItem;
}

/** What "play here" plays for a carried comment; null when neither span has length. */
export function carriedPlayTarget(c: CarriedComment, a: TapeRef, b: TapeRef): CarriedPlayTarget | null {
  if (c.span.end_frame > c.span.start_frame) {
    return { side: "b", item: item(b, { start: c.span.start_frame, end: c.span.end_frame }) };
  }
  const s = c.source.span;
  if (s.end_frame > s.start_frame) {
    return { side: "a", item: item(a, { start: s.start_frame, end: s.end_frame }) };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Technical details and summary formatting

export function opCounts(alignment: Alignment): Record<AlignOpKind, number> {
  const counts: Record<AlignOpKind, number> = { match: 0, mismatch: 0, insert_b: 0, delete_b: 0 };
  for (const op of alignment.ops) counts[op.kind] += 1;
  return counts;
}

function numberFormat(lang: Lang, options: Intl.NumberFormatOptions): Intl.NumberFormat | null {
  try {
    return new Intl.NumberFormat(lang, options);
  } catch {
    return null;
  }
}

/** Seconds with one decimal in the language's notation: 1.8 → "1,8" (pt-BR) / "1.8" (en). */
export function formatSeconds(seconds: number, lang: Lang): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const nf = numberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return nf ? nf.format(s) : s.toFixed(1);
}

/** A 0–100 score as a percent with up to one decimal: 87.5 → "87,5%" (pt-BR) / "87.5%" (en). */
export function formatPercent(value: number, lang: Lang): string {
  const v = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const nf = numberFormat(lang, { style: "percent", maximumFractionDigits: 1 });
  return nf ? nf.format(v / 100) : `${v}%`;
}
