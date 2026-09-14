/**
 * Time formatting for the UI.
 *
 * Positions are shown as m:ss.s (tenths of a second). Frames are never shown;
 * they are converted to seconds first. The tenths separator follows the
 * language ("0:03,4" in pt-BR, "0:03.4" in en) so a position never sits next
 * to "1,8 s" with a different decimal mark.
 */

import type { Lang } from "../i18n";

/** The decimal mark of a language; en (and no language) uses a dot. */
export function decimalMark(lang?: Lang): string {
  return lang === "pt-BR" ? "," : ".";
}

/** Seconds → "m:ss.s", e.g. 3.4 → "0:03.4" (en) / "0:03,4" (pt-BR), 72 → "1:12.0". Negative/NaN → "0:00.0". */
export function formatTime(seconds: number, lang?: Lang): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const tenths = Math.round(s * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = tenths - minutes * 600;
  const whole = Math.floor(rest / 10);
  const tenth = rest % 10;
  return `${minutes}:${whole < 10 ? "0" : ""}${whole}${decimalMark(lang)}${tenth}`;
}

/** Frame index → seconds. A non-positive frame rate yields 0. */
export function frameTime(frame: number, frameRate: number): number {
  if (!(frameRate > 0) || !Number.isFinite(frame)) return 0;
  return frame / frameRate;
}

/** "0:03.4 – 0:04.1" (en dash with spaces), tenths separator per language. */
export function formatRange(startFrame: number, endFrame: number, frameRate: number, lang?: Lang): string {
  return `${formatTime(frameTime(startFrame, frameRate), lang)} – ${formatTime(frameTime(endFrame, frameRate), lang)}`;
}
