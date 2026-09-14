import type { Tape } from "./types";

export interface TapeCheck {
  ok: boolean;
  errors: string[];
}

/** Validate the shape of a tape.json object. Returns every problem found. */
export function checkTape(raw: unknown): TapeCheck {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["tape is not an object"] };
  const t = raw as Record<string, unknown>;
  if (typeof t.codebook_hash !== "string" || t.codebook_hash.length === 0)
    errors.push("codebook_hash missing");
  if (typeof t.frame_rate !== "number" || !(t.frame_rate > 0))
    errors.push("frame_rate missing or not positive");
  if (!Array.isArray(t.u)) errors.push("u is not an array");
  if (!Array.isArray(t.f)) errors.push("f is not an array");
  if (Array.isArray(t.u) && Array.isArray(t.f) && t.u.length !== t.f.length)
    errors.push(`u and f differ in length (${t.u.length} vs ${t.f.length})`);
  if (Array.isArray(t.u)) {
    const bad = t.u.findIndex((v) => !Number.isInteger(v) || v < 0 || v > 99);
    if (bad >= 0) errors.push(`u[${bad}] is out of range 0–99`);
  }
  if (Array.isArray(t.f)) {
    const bad = t.f.findIndex((v) => !Number.isInteger(v) || v < 0 || v > 31);
    if (bad >= 0) errors.push(`f[${bad}] is out of range 0–31`);
  }
  if (t.pause_unit !== undefined && (!Number.isInteger(t.pause_unit) || (t.pause_unit as number) < 0))
    errors.push("pause_unit is not a non-negative integer");
  return { ok: errors.length === 0, errors };
}

export function parseTape(text: string): { tape?: Tape; errors: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { errors: [`tape.json is not valid JSON: ${(e as Error).message}`] };
  }
  const check = checkTape(raw);
  if (!check.ok) return { errors: check.errors };
  const t = raw as Tape;
  return {
    tape: {
      codebook_hash: t.codebook_hash,
      frame_rate: t.frame_rate,
      u: t.u.slice(),
      f: t.f.slice(),
      pause_unit: t.pause_unit,
      mock: t.mock === true ? true : undefined,
    },
    errors: [],
  };
}

export function frameToSeconds(frame: number, tape: Pick<Tape, "frame_rate">): number {
  return frame / tape.frame_rate;
}

export function tapeDurationSeconds(tape: Tape): number {
  return tape.u.length / tape.frame_rate;
}

/** Two tapes are comparable only when they share the frozen codebook. */
export function sameCodebook(a: Tape, b: Tape): boolean {
  return a.codebook_hash === b.codebook_hash;
}
