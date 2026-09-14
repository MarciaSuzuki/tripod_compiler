/**
 * Turn the files of one Recording (a folder with audio.wav + tape.json +
 * meta.json, or a single .zip wrapping such a folder) into a ParsedRecording.
 *
 * Errors and warnings are human-readable English strings; the screen shows
 * them under a translated heading.
 */

import { strFromU8, unzipSync } from "fflate";
import type { Meta, Tape } from "../model";
import { parseTape } from "../model";

export interface ParsedRecording {
  /** audio.wav bytes */
  audio: Blob;
  tape: Tape;
  meta: Meta;
  /** e.g. "meta.json missing" */
  warnings: string[];
}

export const AUDIO_FILE = "audio.wav";
export const TAPE_FILE = "tape.json";
export const META_FILE = "meta.json";

const META_FIELDS: ReadonlyArray<keyof Meta> = ["passage", "language", "narrator", "recorded_at", "label"];

/** Last path segment, accepting "/" or "\" separators. */
export function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? "";
}

function depth(path: string): number {
  return path.split(/[\\/]/).length;
}

/** Resource forks, hidden files and zip directory entries are never Recording files. */
function isJunkPath(path: string): boolean {
  if (path.endsWith("/") || path.endsWith("\\")) return true;
  const parts = path.split(/[\\/]/);
  return parts.some((p) => p === "__MACOSX" || p.startsWith("._") || p === ".DS_Store");
}

/** A WAV file starts with "RIFF" <size> "WAVE". */
export function isWavHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WAVE";
}

/**
 * A view that the Blob constructor accepts: TS 5.9's DOM lib only takes
 * ArrayBuffer-backed views, and bytes from fflate are typed ArrayBufferLike.
 * Copies only when the backing store is not a plain ArrayBuffer.
 */
export function blobPart(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  if (bytes.buffer instanceof ArrayBuffer) return bytes as Uint8Array<ArrayBuffer>;
  return bytes.slice();
}

function ascii(bytes: Uint8Array, from: number, to: number): string {
  let s = "";
  for (let i = from; i < to; i++) s += String.fromCharCode(bytes[i] ?? 0);
  return s;
}

/** Keep only the known string fields of meta.json; everything else is dropped. */
export function normalizeMeta(raw: unknown): Meta {
  const meta: Meta = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return meta;
  const r = raw as Record<string, unknown>;
  for (const k of META_FIELDS) {
    const v = r[k];
    if (typeof v === "string" && v.trim().length > 0) meta[k] = v;
  }
  return meta;
}

/** Parse meta.json text. A broken file is a warning, never an error. */
export function parseMetaText(text: string): { meta: Meta; warning?: string } {
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { meta: {}, warning: "meta.json is not a JSON object; it was ignored" };
    }
    return { meta: normalizeMeta(raw) };
  } catch (e) {
    return { meta: {}, warning: `meta.json is not valid JSON; it was ignored (${(e as Error).message})` };
  }
}

/** Errors from parseTape, prefixed with the file name when they do not already carry it. */
export function tapeErrors(text: string): { tape?: Tape; errors: string[] } {
  const r = parseTape(text);
  return { tape: r.tape, errors: r.errors.map((e) => (e.startsWith(TAPE_FILE) ? e : `${TAPE_FILE}: ${e}`)) };
}

export function isZipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

/** One candidate file, whether it came from a folder pick or from inside a zip. */
export interface RecordingEntry {
  path: string;
  /** The first `n` bytes. */
  head(n: number): Promise<Uint8Array>;
  text(): Promise<string>;
  /** The whole file as a Blob of the given type. */
  blob(type: string): Blob;
}

function fileEntry(file: File): RecordingEntry {
  const rel = (file as { webkitRelativePath?: string }).webkitRelativePath;
  return {
    path: rel && rel.length > 0 ? rel : file.name,
    head: async (n) => new Uint8Array(await file.slice(0, n).arrayBuffer()),
    text: () => file.text(),
    blob: (type) => new Blob([file], { type }),
  };
}

function bytesEntry(path: string, bytes: Uint8Array): RecordingEntry {
  return {
    path,
    head: async (n) => bytes.subarray(0, n),
    text: async () => strFromU8(bytes),
    blob: (type) => new Blob([blobPart(bytes)], { type }),
  };
}

async function zipEntries(file: File): Promise<RecordingEntry[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const unzipped = unzipSync(data);
  return Object.entries(unzipped)
    .filter(([path]) => !isJunkPath(path))
    .map(([path, bytes]) => bytesEntry(path, bytes));
}

/** Pick the one entry whose basename matches; two candidates is an error. */
function pickEntry(entries: RecordingEntry[], name: string, errors: string[]): RecordingEntry | undefined {
  const wanted = name.toLowerCase();
  const matches = entries.filter((e) => basename(e.path).toLowerCase() === wanted);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  // A zip that wraps a folder may also list the folder itself; keep the
  // shallowest file when there is exactly one at that depth.
  const minDepth = Math.min(...matches.map((m) => depth(m.path)));
  const shallow = matches.filter((m) => depth(m.path) === minDepth);
  if (shallow.length === 1) return shallow[0];
  const listed = shallow.map((m) => m.path).join(", ");
  errors.push(`Found ${shallow.length} files named ${name} (${listed}). Choose one Recording folder at a time.`);
  return undefined;
}

/** Shared by folder picks, zips and the passage importer. */
export async function parseRecordingEntries(entries: RecordingEntry[]): Promise<{ recording?: ParsedRecording; errors: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const usable = entries.filter((e) => !isJunkPath(e.path));

  const audioEntry = pickEntry(usable, AUDIO_FILE, errors);
  const tapeEntry = pickEntry(usable, TAPE_FILE, errors);
  const metaEntry = pickEntry(usable, META_FILE, errors);

  if (!audioEntry && !errors.some((e) => e.includes(AUDIO_FILE))) errors.push(`${AUDIO_FILE} was not found.`);
  if (!tapeEntry && !errors.some((e) => e.includes(TAPE_FILE))) errors.push(`${TAPE_FILE} was not found.`);

  if (audioEntry) {
    const head = await audioEntry.head(12);
    if (!isWavHeader(head)) errors.push(`${AUDIO_FILE} is not a WAV file (it does not start with a RIFF/WAVE header).`);
  }

  let tape: Tape | undefined;
  if (tapeEntry) {
    const r = tapeErrors(await tapeEntry.text());
    tape = r.tape;
    errors.push(...r.errors);
  }

  let meta: Meta = {};
  if (metaEntry) {
    const r = parseMetaText(await metaEntry.text());
    meta = r.meta;
    if (r.warning) warnings.push(r.warning);
  } else {
    warnings.push(`${META_FILE} missing`);
  }

  if (errors.length > 0 || !audioEntry || !tape) return { errors };
  return {
    recording: { audio: audioEntry.blob("audio/wav"), tape, meta, warnings },
    errors: [],
  };
}

/**
 * Accepts either the files of one folder (from `<input webkitdirectory>` or a
 * multi-file picker) or a single `.zip`. Finds audio.wav, tape.json and
 * meta.json at any depth (case-insensitive basename match).
 */
export async function parseRecordingFiles(files: File[]): Promise<{ recording?: ParsedRecording; errors: string[] }> {
  if (!files || files.length === 0) return { errors: ["No files were selected."] };

  const first = files[0];
  if (files.length === 1 && first && isZipFile(first)) {
    let entries: RecordingEntry[];
    try {
      entries = await zipEntries(first);
    } catch (e) {
      return { errors: [`The zip file could not be read: ${(e as Error).message}`] };
    }
    return parseRecordingEntries(entries);
  }

  return parseRecordingEntries(files.map(fileEntry));
}
