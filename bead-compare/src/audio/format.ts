/**
 * Time formatting for the UI.
 *
 * Positions are shown as m:ss.s (tenths of a second). Frames are never shown;
 * they are converted to seconds first.
 */

/** Seconds → "m:ss.s", e.g. 3.4 → "0:03.4", 72 → "1:12.0". Negative/NaN → "0:00.0". */
export function formatTime(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const tenths = Math.round(s * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = tenths - minutes * 600;
  const whole = Math.floor(rest / 10);
  const tenth = rest % 10;
  return `${minutes}:${whole < 10 ? "0" : ""}${whole}.${tenth}`;
}

/** Frame index → seconds. A non-positive frame rate yields 0. */
export function frameTime(frame: number, frameRate: number): number {
  if (!(frameRate > 0) || !Number.isFinite(frame)) return 0;
  return frame / frameRate;
}

/** "0:03.4 – 0:04.1" (en dash with spaces). */
export function formatRange(startFrame: number, endFrame: number, frameRate: number): string {
  return `${formatTime(frameTime(startFrame, frameRate))} – ${formatTime(frameTime(endFrame, frameRate))}`;
}
