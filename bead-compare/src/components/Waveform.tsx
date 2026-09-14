import { useLayoutEffect, useRef, useState } from "react";
import type { FrameRange } from "../model";
import { frameToX } from "./BeadStrip";

/**
 * Thin waveform (canvas): mirrored peaks in a muted ink colour, a selection
 * tint and a cursor line. Same width as the strip beneath it (ResizeObserver).
 */

export interface WaveformProps {
  peaks: Float32Array | null;
  totalFrames: number;
  cursorFrame?: number | null;
  selection?: FrameRange | null;
  height?: number;
}

const FALLBACK_WIDTH = 800;
const DEFAULT_HEIGHT = 40;

function cssVar(el: Element, name: string, fallback: string): string {
  try {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
}

export function Waveform(props: WaveformProps): JSX.Element {
  const { peaks, totalFrames, cursorFrame, selection, height = DEFAULT_HEIGHT } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (w: number) => setWidth(w > 0 ? Math.round(w) : FALLBACK_WIDTH);
    apply(el.clientWidth);
    if (typeof ResizeObserver !== "function") return;
    const ro = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const ink = cssVar(canvas, "--ink-muted", "#8f8a80");
    const accent = cssVar(canvas, "--selection", cssVar(canvas, "--accent", "#4a7c8c"));
    const cursorColor = cssVar(canvas, "--cursor", cssVar(canvas, "--ink", "#2b2924"));
    const mid = height / 2;

    // Baseline
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, mid - 0.5, width, 1);
    ctx.globalAlpha = 1;

    if (peaks && peaks.length > 0) {
      const n = peaks.length;
      const bw = width / n;
      const maxAmp = mid - 1;
      ctx.fillStyle = ink;
      for (let i = 0; i < n; i++) {
        const amp = Math.min(1, Math.max(0, peaks[i])) * maxAmp;
        if (amp <= 0) continue;
        const x = i * bw;
        ctx.fillRect(x, mid - amp, Math.max(1, bw), amp * 2);
      }
    }

    if (selection && selection.end > selection.start && totalFrames > 0) {
      const x0 = frameToX(selection.start, totalFrames, width);
      const x1 = frameToX(selection.end, totalFrames, width);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(x0, 0, Math.max(1, x1 - x0), height);
      ctx.globalAlpha = 1;
    }

    if (cursorFrame != null && Number.isFinite(cursorFrame) && totalFrames > 0) {
      const x = frameToX(cursorFrame, totalFrames, width);
      ctx.fillStyle = cursorColor;
      ctx.fillRect(x - 1, 0, 2, height);
    }
  }, [peaks, totalFrames, cursorFrame, selection, width, height]);

  return (
    <div className="waveform-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="waveform" aria-hidden="true" style={{ display: "block" }} />
    </div>
  );
}
