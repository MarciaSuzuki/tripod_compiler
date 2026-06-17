import { readFileSync } from "node:fs";

/**
 * Reader for the pilot-2 Obsidian artifact notes: YAML frontmatter + a prose line + a single
 * fenced ```json block carrying the artifact JSON. We parse the JSON body (what the validator
 * checks) and capture a few routing fields from the frontmatter. Frontmatter parsing is kept
 * deliberately light (no YAML dep): the JSON body is authoritative.
 */
export class ReaderError extends Error {}

export interface ArtifactNote {
  path: string;
  /** Raw frontmatter block (between the leading `---` fences), or null if none. */
  frontmatterRaw: string | null;
  /** A handful of frontmatter keys parsed leniently (type, pericope, status, pilot, ...). */
  frontmatter: Record<string, string>;
  /** The parsed JSON from the fenced ```json block. */
  json: unknown;
  /** The raw JSON text (for line/offset reporting if needed). */
  rawJson: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const JSON_FENCE = /```json\s*\r?\n([\s\S]*?)\r?\n```/;
const SIMPLE_KV = /^([A-Za-z0-9_-]+):\s*(.+?)\s*$/;

function parseFrontmatter(raw: string): { frontmatterRaw: string | null; body: string; kv: Record<string, string> } {
  const m = raw.match(FRONTMATTER);
  if (!m) return { frontmatterRaw: null, body: raw, kv: {} };
  const block = m[1] ?? "";
  const kv: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const kvm = line.match(SIMPLE_KV);
    if (kvm) kv[kvm[1]!] = (kvm[2] ?? "").replace(/^["']|["']$/g, "");
  }
  return { frontmatterRaw: block, body: raw.slice(m[0].length), kv };
}

/** Read an artifact note (FOR_MODEL / COMPILATION-LOG / BCD-DELTA / VERIFICATION-INPUT). */
export function readArtifactNote(path: string): ArtifactNote {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    throw new ReaderError(`cannot read ${path}: ${(e as Error).message}`);
  }
  const { frontmatterRaw, body, kv } = parseFrontmatter(raw);
  const fence = body.match(JSON_FENCE) ?? raw.match(JSON_FENCE);
  if (!fence) {
    // SC-0065: oral STA artifacts arrive as a raw .json file (no Obsidian envelope, no fenced
    // block). Fall back to parsing the whole file as JSON. Biblical .md notes always carry a
    // fence, so they never reach here; a fence-less .md (e.g. frontmatter only) is not valid JSON
    // and re-throws the original error below.
    try {
      const json = JSON.parse(raw);
      return { path, frontmatterRaw, frontmatter: kv, json, rawJson: raw };
    } catch {
      throw new ReaderError(`no \`\`\`json fenced block found in ${path}`);
    }
  }
  let json: unknown;
  try {
    json = JSON.parse(fence[1]!);
  } catch (e) {
    throw new ReaderError(`invalid JSON in ${path}: ${(e as Error).message}`);
  }
  return { path, frontmatterRaw, frontmatter: kv, json, rawJson: fence[1]! };
}
