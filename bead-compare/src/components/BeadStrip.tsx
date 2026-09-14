import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { Cluster, CommentKind, CommentStatus, FrameRange, RegionKind } from "../model";
import { clusterAtFrame } from "../model";
import { formatTime, frameTime } from "../audio/format";
import type { Lang } from "../i18n";

/**
 * The bead strip (SVG). Beads are rounded rects whose width is proportional
 * to duration; pause clusters draw only a faint dotted baseline; each phrase
 * gets a thin line under its beads. Beads are never labelled with numbers —
 * their aria-label is the time position only.
 */

export interface StripHighlight {
  range: FrameRange;
  kind: RegionKind | "carried" | "carried_warning";
  id: string;
  active?: boolean;
}

export interface StripMarker {
  range: FrameRange;
  kind: CommentKind;
  status: CommentStatus;
  id: string;
  active?: boolean;
  carried?: boolean;
  /** Accessible name of the marker button (kind, author, time range), translated by the screen. */
  ariaLabel?: string;
}

export interface BeadStripProps {
  clusters: Cluster[];
  totalFrames: number;
  frameRate: number;
  height?: number;
  selection?: FrameRange | null;
  cursorFrame?: number | null;
  highlights?: StripHighlight[];
  markers?: StripMarker[];
  onTapCluster?(c: Cluster): void;
  /** Drag across beads; the range snaps to cluster bounds of the first and last beads touched. */
  onSelect?(range: FrameRange): void;
  onTapHighlight?(id: string): void;
  onTapMarker?(id: string): void;
  /** Reports the drawn width so Compare can draw connectors. */
  onWidth?(px: number): void;
  ariaLabel?: string;
  /** Decimal mark of the bead names (time positions); en when omitted. */
  lang?: Lang;
}

/** Width used when no layout is available (tests, SSR). */
export const FALLBACK_WIDTH = 800;
export const DEFAULT_HEIGHT = 56;
const BEAD_GAP = 2;
const MARKER_H = 8;
const POINT_MARKER_W = 3;
const TAP_SLOP_PX = 4;
const HIGHLIGHT_HIT_SLOP_PX = 4;

export function frameToX(frame: number, totalFrames: number, width: number): number {
  if (!(totalFrames > 0) || !(width > 0) || !Number.isFinite(frame)) return 0;
  return (frame / totalFrames) * width;
}

/** Inverse of frameToX, clamped into 0..totalFrames-1. */
export function xToFrame(x: number, totalFrames: number, width: number): number {
  if (!(totalFrames > 0) || !(width > 0) || !Number.isFinite(x)) return 0;
  const f = Math.floor((x / width) * totalFrames);
  return Math.min(Math.max(0, f), totalFrames - 1);
}

/** The cluster under a pixel position; x outside the strip snaps to the nearest end. Pure. */
export function snapPixelToCluster(x: number, width: number, totalFrames: number, clusters: Cluster[]): Cluster | null {
  if (clusters.length === 0 || !(width > 0) || !(totalFrames > 0)) return null;
  const px = Math.min(Math.max(0, x), width);
  return clusterAtFrame(clusters, xToFrame(px, totalFrames, width));
}

/** The frame range covering two clusters in either order (cluster bounds). Pure. */
export function snapRange(a: Cluster, b: Cluster): FrameRange {
  return { start: Math.min(a.start, b.start), end: Math.max(a.end, b.end) };
}

/** The top-most highlight under a pixel/frame, if any. Pure. */
export function hitHighlight(
  highlights: StripHighlight[],
  frame: number,
  x: number,
  totalFrames: number,
  width: number,
): StripHighlight | null {
  for (let i = highlights.length - 1; i >= 0; i--) {
    const h = highlights[i];
    if (h.range.start === h.range.end) {
      if (Math.abs(frameToX(h.range.start, totalFrames, width) - x) <= HIGHLIGHT_HIT_SLOP_PX) return h;
    } else if (frame >= h.range.start && frame < h.range.end) {
      return h;
    }
  }
  return null;
}

interface Layout {
  beadTop: number;
  beadH: number;
  phraseY: number;
  markerTop: number;
}

function layoutFor(height: number): Layout {
  const markerTop = height - MARKER_H - 1;
  const phraseY = markerTop - 5;
  const beadTop = 2;
  const beadH = Math.max(4, phraseY - 4 - beadTop);
  return { beadTop, beadH, phraseY, markerTop };
}

function markerFill(kind: CommentKind): string {
  switch (kind) {
    case "fix_requested":
      return "var(--comment-fix)";
    case "approved":
      return "var(--comment-approved)";
    default:
      return "var(--comment-note)";
  }
}

function highlightFill(kind: StripHighlight["kind"]): string {
  switch (kind) {
    case "carried":
      return "var(--carried)";
    case "carried_warning":
      return "var(--carried-warning)";
    default:
      return `var(--region-${kind})`;
  }
}

type Drag =
  | { kind: "bead"; first: Cluster; last: Cluster; x0: number; moved: boolean }
  | { kind: "marker"; id: string; x0: number; moved: boolean };

/** Observes the wrapper width; falls back to FALLBACK_WIDTH without layout. */
function useMeasuredWidth(ref: RefObject<HTMLDivElement>): number {
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number) => setWidth(w > 0 ? Math.round(w) : FALLBACK_WIDTH);
    apply(el.clientWidth);
    if (typeof ResizeObserver !== "function") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      apply(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export function BeadStrip(props: BeadStripProps): JSX.Element {
  const {
    clusters,
    totalFrames,
    frameRate,
    height = DEFAULT_HEIGHT,
    selection,
    cursorFrame,
    highlights = [],
    markers = [],
    ariaLabel,
    lang,
  } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = useMeasuredWidth(wrapRef);
  const dragRef = useRef<Drag | null>(null);
  const [dragRange, setDragRange] = useState<FrameRange | null>(null);

  const onWidthRef = useRef(props.onWidth);
  onWidthRef.current = props.onWidth;
  useEffect(() => {
    onWidthRef.current?.(width);
  }, [width]);

  const L = layoutFor(height);
  const fx = (frame: number) => frameToX(frame, totalFrames, width);
  const shownSelection = dragRange ?? selection ?? null;

  const localX = (e: ReactPointerEvent): number => {
    const svg = svgRef.current;
    if (!svg) return e.clientX;
    return e.clientX - svg.getBoundingClientRect().left;
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const x = localX(e);
    const target = e.target as Element;
    const markerEl = typeof target.closest === "function" ? target.closest("[data-marker-id]") : null;
    if (markerEl) {
      dragRef.current = { kind: "marker", id: markerEl.getAttribute("data-marker-id") ?? "", x0: x, moved: false };
    } else {
      const c = snapPixelToCluster(x, width, totalFrames, clusters);
      if (!c) return;
      dragRef.current = { kind: "bead", first: c, last: c, x0: x, moved: false };
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture unavailable (tests)
    }
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const x = localX(e);
    if (Math.abs(x - d.x0) > TAP_SLOP_PX) d.moved = true;
    if (d.kind !== "bead") return;
    const c = snapPixelToCluster(x, width, totalFrames, clusters);
    if (c && c !== d.last) {
      d.last = c;
      d.moved = true;
    }
    if (d.moved) setDragRange(snapRange(d.first, d.last));
  };

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
    setDragRange(null);
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const x = localX(e);
    endDrag(e);
    if (d.kind === "marker") {
      if (!d.moved) props.onTapMarker?.(d.id);
      return;
    }
    if (d.moved) {
      props.onSelect?.(snapRange(d.first, d.last));
      return;
    }
    const frame = xToFrame(Math.min(Math.max(0, x), width), totalFrames, width);
    const h = props.onTapHighlight ? hitHighlight(highlights, frame, x, totalFrames, width) : null;
    if (h) props.onTapHighlight?.(h.id);
    else props.onTapCluster?.(d.first);
  };

  // Phrase lines: from the first to the last speech bead of each phrase.
  const phrases = new Map<number, { x0: number; x1: number }>();
  for (const c of clusters) {
    if (c.is_pause || c.phrase === null) continue;
    const x0 = fx(c.start) + BEAD_GAP / 2;
    const x1 = fx(c.end) - BEAD_GAP / 2;
    const p = phrases.get(c.phrase);
    if (!p) phrases.set(c.phrase, { x0, x1 });
    else {
      p.x0 = Math.min(p.x0, x0);
      p.x1 = Math.max(p.x1, x1);
    }
  }

  const inSelection = (c: Cluster) =>
    !!shownSelection && c.start >= shownSelection.start && c.end <= shownSelection.end && shownSelection.end > shownSelection.start;
  const atCursor = (c: Cluster) => cursorFrame != null && cursorFrame >= c.start && cursorFrame < c.end;

  return (
    <div className="bead-strip-wrap" ref={wrapRef}>
      <svg
        ref={svgRef}
        className={"bead-strip" + (dragRange ? " bead-strip--dragging" : "")}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        style={{ touchAction: "none", userSelect: "none", display: "block" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={endDrag}
      >
        <g className="strip-beads">
          {clusters.map((c) => {
            const x0 = fx(c.start);
            const x1 = fx(c.end);
            if (c.is_pause) {
              return (
                <line
                  key={c.index}
                  className="bead-baseline"
                  x1={x0 + 1}
                  x2={Math.max(x0 + 1, x1 - 1)}
                  y1={L.beadTop + L.beadH / 2}
                  y2={L.beadTop + L.beadH / 2}
                  stroke="var(--bead-baseline, var(--bead))"
                  strokeOpacity={0.5}
                  strokeWidth={1}
                  strokeDasharray="1 3"
                  data-cluster={c.index}
                />
              );
            }
            const w = Math.max(1, x1 - x0 - BEAD_GAP);
            const selected = inSelection(c);
            const cls =
              "bead" + (selected ? " bead--selected" : "") + (atCursor(c) ? " bead--at-cursor" : "");
            return (
              <rect
                key={c.index}
                className={cls}
                x={x0 + BEAD_GAP / 2}
                y={L.beadTop}
                width={w}
                height={L.beadH}
                rx={4}
                ry={4}
                fill={selected ? "var(--bead-active)" : "var(--bead)"}
                role="button"
                aria-label={formatTime(frameTime(c.start, frameRate), lang)}
                data-cluster={c.index}
              />
            );
          })}
        </g>
        <g className="strip-phrases">
          {Array.from(phrases.entries()).map(([n, p]) => (
            <line
              key={n}
              className="strip-phrase"
              x1={p.x0}
              x2={Math.max(p.x0, p.x1)}
              y1={L.phraseY}
              y2={L.phraseY}
              stroke="var(--phrase-line, var(--bead))"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
        </g>
        <g className="strip-highlights" style={{ pointerEvents: "none" }}>
          {highlights.map((h) => {
            const point = h.range.start === h.range.end;
            const x0 = fx(h.range.start);
            const x1 = fx(h.range.end);
            const x = point ? x0 - POINT_MARKER_W / 2 : x0;
            const w = point ? POINT_MARKER_W : Math.max(1, x1 - x0);
            // "No change detected here" gets a dashed full-opacity outline on top of its
            // colour, so the one warning the strip carries reads without colour too.
            const warning = h.kind === "carried_warning";
            const cls =
              `strip-highlight strip-highlight--${h.kind}` +
              (h.active ? " strip-highlight--active" : "") +
              (point ? " strip-highlight--point" : "");
            return (
              <rect
                key={h.id}
                className={cls}
                x={x}
                y={L.beadTop - 1}
                width={w}
                height={L.beadH + 2}
                rx={point ? 1.5 : 3}
                fill={highlightFill(h.kind)}
                fillOpacity={point ? 0.9 : h.active ? 0.5 : 0.32}
                stroke={h.active || warning ? highlightFill(h.kind) : "none"}
                strokeWidth={h.active || warning ? 2 : 0}
                strokeDasharray={warning ? "4 3" : undefined}
                data-highlight-id={h.id}
              />
            );
          })}
        </g>
        {shownSelection && shownSelection.end > shownSelection.start && (
          <rect
            className="strip-selection"
            x={fx(shownSelection.start)}
            y={0}
            width={Math.max(1, fx(shownSelection.end) - fx(shownSelection.start))}
            height={L.phraseY + 2}
            rx={3}
            fill="var(--selection, var(--accent))"
            fillOpacity={0.18}
            stroke="var(--selection, var(--accent))"
            strokeOpacity={0.6}
            strokeWidth={1}
            style={{ pointerEvents: "none" }}
          />
        )}
        {cursorFrame != null && Number.isFinite(cursorFrame) && (
          <line
            className="strip-cursor"
            x1={fx(cursorFrame)}
            x2={fx(cursorFrame)}
            y1={0}
            y2={height}
            stroke="var(--cursor, var(--ink))"
            strokeWidth={2}
            style={{ pointerEvents: "none" }}
          />
        )}
        <g className="strip-markers">
          {markers.map((m) => {
            const x0 = fx(m.range.start);
            const x1 = fx(m.range.end);
            const minW = 6;
            const w = Math.max(minW, x1 - x0);
            const x = x1 - x0 < minW ? x0 - (minW - (x1 - x0)) / 2 : x0;
            const hollow = m.status === "resolved";
            const color = markerFill(m.kind);
            const cls =
              `strip-marker strip-marker--${m.kind} strip-marker--${m.status}` +
              (m.active ? " strip-marker--active" : "") +
              (m.carried ? " strip-marker--carried" : "");
            return (
              <rect
                key={m.id}
                className={cls}
                x={x}
                y={L.markerTop}
                width={w}
                height={MARKER_H}
                rx={2}
                ry={2}
                fill={hollow ? "none" : color}
                stroke={color}
                strokeWidth={m.active ? 2 : 1.5}
                strokeDasharray={m.carried ? "3 2" : undefined}
                role="button"
                aria-label={m.ariaLabel}
                data-marker-id={m.id}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
