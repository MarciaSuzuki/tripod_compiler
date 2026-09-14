import type { Comment, Settings, Tape } from "../src/model";
import { DEFAULT_SETTINGS } from "../src/model";

export const HASH = "sha256:test-codebook";

/** Build a tape from a compact spec: [[u, frames], ...]. F is 10 for speech, 0 for pauses unless given. */
export function tape(
  spec: Array<[number, number] | [number, number, number]>,
  opts: { pause_unit?: number; hash?: string; frame_rate?: number } = {},
): Tape {
  const pause = opts.pause_unit ?? 49;
  const u: number[] = [];
  const f: number[] = [];
  for (const [val, n, fval] of spec) {
    for (let i = 0; i < n; i++) {
      u.push(val);
      f.push(fval ?? (val === pause ? 0 : 10));
    }
  }
  return { codebook_hash: opts.hash ?? HASH, frame_rate: opts.frame_rate ?? 50, u, f, pause_unit: pause };
}

export const settings: Settings = structuredClone(DEFAULT_SETTINGS);

export function comment(
  version_id: string,
  start: number,
  end: number,
  kind: Comment["kind"] = "fix_requested",
  status: Comment["status"] = "open",
): Comment {
  return {
    id: `c-${start}-${end}`,
    span: { version_id, start_frame: start, end_frame: end },
    author: "test",
    text: "x",
    kind,
    created_at: "2026-01-01T00:00:00Z",
    status,
  };
}
