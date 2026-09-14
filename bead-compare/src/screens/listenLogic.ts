import type { StripMarker } from "../components/BeadStrip";
import type { Cluster, Comment, FrameRange, Span, Tape } from "../model";

/**
 * Pure logic behind the Listen screen: keyboard selection steps, comment
 * markers, the author name, the key map and the (technical-details-only)
 * U/F series of a selection. No React, no DOM, no I/O — everything here is
 * unit-tested in tests/listen-logic.test.ts.
 *
 * Selection steps move in units of *speech* clusters: a pause cluster is
 * never selected on its own by the keyboard and is absorbed when the
 * selection grows across it, so "one step" always adds or removes something
 * the consultant can hear.
 */

export type Direction = "left" | "right";

export const AUTHOR_KEY = "bead-compare.author";

/** Longest U/F series printed inside technical details before it is cut with an ellipsis. */
export const SERIES_LIMIT = 60;

// ---------------------------------------------------------------------------
// ranges

export function clusterRange(c: Cluster): FrameRange {
  return { start: c.start, end: c.end };
}

export function hasSelection(r: FrameRange | null | undefined): r is FrameRange {
  return r != null && Number.isFinite(r.start) && Number.isFinite(r.end) && r.end > r.start;
}

export function wholeRange(totalFrames: number): FrameRange {
  return { start: 0, end: Math.max(0, Math.floor(totalFrames)) };
}

export function spanToRange(span: Span): FrameRange {
  return { start: span.start_frame, end: span.end_frame };
}

export function rangeToSpan(versionId: string, range: FrameRange): Span {
  return { version_id: versionId, start_frame: range.start, end_frame: range.end };
}

export function sameRange(a: FrameRange | null | undefined, b: FrameRange | null | undefined): boolean {
  if (a == null || b == null) return a == null && b == null;
  return a.start === b.start && a.end === b.end;
}

// ---------------------------------------------------------------------------
// clusters

/** The speech clusters, in order; a tape with no speech falls back to every cluster. */
export function speechClusters(clusters: Cluster[]): Cluster[] {
  const speech = clusters.filter((c) => !c.is_pause);
  return speech.length > 0 ? speech : clusters;
}

/** The first thing worth hearing: the first speech cluster (or the first cluster). */
export function firstClusterRange(clusters: Cluster[]): FrameRange | null {
  const speech = speechClusters(clusters);
  return speech.length > 0 ? clusterRange(speech[0]) : null;
}

/** Speech clusters lying entirely inside a range, in order. */
export function clustersInside(clusters: Cluster[], range: FrameRange): Cluster[] {
  return speechClusters(clusters).filter((c) => c.start >= range.start && c.end <= range.end);
}

/**
 * The speech cluster just beyond a selection in one direction: to the right,
 * the first speech cluster ending after the selection; to the left, the last
 * one starting before it. Null at the edge of the tape.
 */
export function nextClusterRange(clusters: Cluster[], selection: FrameRange, direction: Direction): FrameRange | null {
  const speech = speechClusters(clusters);
  if (direction === "right") {
    const c = speech.find((x) => x.end > selection.end);
    return c ? clusterRange(c) : null;
  }
  for (let i = speech.length - 1; i >= 0; i--) {
    if (speech[i].start < selection.start) return clusterRange(speech[i]);
  }
  return null;
}

/**
 * One keyboard step on the selection. The arrow names the direction a
 * boundary moves; without Shift the selection grows (Right: the end moves
 * right, Left: the start moves left), with Shift it shrinks (Right: the start
 * moves right, Left: the end moves left). A selection never shrinks below one
 * speech cluster. With no selection either arrow selects the first cluster.
 */
export function extendSelection(
  clusters: Cluster[],
  selection: FrameRange | null | undefined,
  direction: Direction,
  shrink = false,
): FrameRange | null {
  if (!hasSelection(selection)) return firstClusterRange(clusters);
  if (!shrink) {
    const next = nextClusterRange(clusters, selection, direction);
    if (!next) return selection;
    return direction === "right"
      ? { start: selection.start, end: next.end }
      : { start: next.start, end: selection.end };
  }
  const inside = clustersInside(clusters, selection);
  if (inside.length < 2) return selection;
  return direction === "right"
    ? { start: inside[1].start, end: selection.end }
    : { start: selection.start, end: inside[inside.length - 2].end };
}

// ---------------------------------------------------------------------------
// comments

/** One strip marker per comment; the active one is drawn stronger. */
export function markersFromComments(comments: Comment[], activeId: string | null | undefined): StripMarker[] {
  return comments.map((c) => ({
    id: c.id,
    range: spanToRange(c.span),
    kind: c.kind,
    status: c.status,
    active: activeId != null && activeId === c.id,
    carried: c.carried_from !== undefined,
  }));
}

/** The author to save on a comment: the typed name, or the translated fallback when empty. */
export function resolveAuthor(typed: string | null | undefined, fallback: string): string {
  const s = (typed ?? "").trim();
  return s.length > 0 ? s : fallback;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredAuthor(): string {
  try {
    return storage()?.getItem(AUTHOR_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeStoredAuthor(author: string): void {
  try {
    storage()?.setItem(AUTHOR_KEY, author);
  } catch {
    // storage unavailable; the name lives for this session only
  }
}

// ---------------------------------------------------------------------------
// technical details (the only place these numbers are shown)

/** The U and F values of a selection; empty arrays without a selection. */
export function selectionValues(tape: Pick<Tape, "u" | "f">, range: FrameRange | null | undefined): { u: number[]; f: number[] } {
  if (!hasSelection(range)) return { u: [], f: [] };
  const start = Math.max(0, range.start);
  const end = Math.min(tape.u.length, range.end);
  return { u: tape.u.slice(start, end), f: tape.f.slice(start, end) };
}

/** "5 5 7 …" — at most `limit` values, then an ellipsis. */
export function formatSeries(values: readonly number[], limit = SERIES_LIMIT): string {
  if (values.length === 0) return "";
  const shown = values.slice(0, Math.max(0, limit)).join(" ");
  return values.length > limit ? `${shown} …` : shown;
}

// ---------------------------------------------------------------------------
// keyboard

export type ListenKeyAction =
  | { type: "play_pause" }
  | { type: "step"; direction: Direction; shrink: boolean }
  | { type: "comment" }
  | { type: "escape" };

export interface KeyLike {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

/** The screen action for a key press, or null when the key is not one of ours. */
export function keyboardAction(e: KeyLike): ListenKeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const shrink = e.shiftKey === true;
  switch (e.key) {
    case " ":
    case "Spacebar":
      return { type: "play_pause" };
    case "ArrowRight":
      return { type: "step", direction: "right", shrink };
    case "ArrowLeft":
      return { type: "step", direction: "left", shrink };
    case "c":
    case "C":
      return shrink ? null : { type: "comment" };
    case "Escape":
    case "Esc":
      return { type: "escape" };
    default:
      return null;
  }
}

export interface TargetLike {
  tagName?: string;
  isContentEditable?: boolean;
}

const TEXT_ENTRY_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
/** Elements that activate on Space themselves (a click, a details toggle). */
const SPACE_OWNER_TAGS = new Set(["BUTTON", "SUMMARY"]);

/** True for an element that takes typed text; keys must reach it untouched. */
export function isTextEntryTarget(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as TargetLike;
  const tag = typeof el.tagName === "string" ? el.tagName.toUpperCase() : "";
  return TEXT_ENTRY_TAGS.has(tag) || el.isContentEditable === true;
}

/**
 * keyboardAction, minus the cases where the focused element owns the key:
 * a text field owns everything; a button or a <summary> owns Space (it is a
 * click there).
 */
export function resolveKeyAction(e: KeyLike, target: unknown): ListenKeyAction | null {
  if (isTextEntryTarget(target)) return null;
  const action = keyboardAction(e);
  if (!action) return null;
  const tag = target && typeof target === "object" ? (target as TargetLike).tagName : undefined;
  if (action.type === "play_pause" && typeof tag === "string" && SPACE_OWNER_TAGS.has(tag.toUpperCase())) return null;
  return action;
}
