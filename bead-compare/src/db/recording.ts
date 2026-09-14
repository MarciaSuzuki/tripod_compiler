/**
 * Turn the files of one Recording (a folder with audio.wav + tape.json +
 * meta.json, or a single .zip wrapping such a folder) into a ParsedRecording.
 *
 * Errors and warnings are structured diagnostics ({ code, vars }); the screen
 * translates them with t(`passages.import.${code}`, vars), so a consultant
 * never sees an English parser message. Only a `detail` var may carry raw
 * English (a JSON parse error, a tape.json field check), as a suffix.
 */

import { strFromU8, unzipSync } from "fflate";
import type { Meta, Tape } from "../model";
import { parseTape } from "../model";

export type ImportDiagnosticCode =
  | "no_files"
  | "audio_missing"
  | "tape_missing"
  | "duplicates"
  | "not_wav"
  | "tape_invalid"
  | "meta_missing"
  | "meta_not_object"
  | "meta_invalid_json"
  | "wav_format"
  | "wav_not_pcm"
  | "duration_mismatch"
  | "frame_rate_unusual"
  | "zip_unreadable"
  | "zip_not_passage"
  | "zip_format_version"
  | "manifest_invalid"
  | "zip_file_missing"
  | "comment_audio_missing";

/** One problem found while importing. `vars` fill the `{placeholders}` of the translated message. */
export interface ImportDiagnostic {
  code: ImportDiagnosticCode;
  vars?: Record<string, string | number>;
}

/** Thrown by the passage-zip importer; `diagnostic` is what the screen translates. */
export class ImportError extends Error {
  constructor(
    public readonly diagnostic: ImportDiagnostic,
    message?: string,
  ) {
    super(message ?? diagnostic.code);
    this.name = "ImportError";
  }
}

export interface ParsedRecording {
  /** audio.wav bytes */
  audio: Blob;
  tape: Tape;
  meta: Meta;
  /** e.g. { code: "meta_missing" } */
  warnings: ImportDiagnostic[];
}

export const AUDIO_FILE = "audio.wav";
export const TAPE_FILE = "tape.json";
export const META_FILE = "meta.json";

/** What the brief specifies for audio.wav and tape.json. */
export const EXPECTED_SAMPLE_RATE = 16000;
export const EXPECTED_CHANNELS = 1;
export const EXPECTED_BITS = 16;
export const EXPECTED_FRAME_RATE = 50;
/** Audio and tape durations further apart than this (seconds) earn a warning. */
export const DURATION_TOLERANCE_SECONDS = 0.5;
/** How much of the wav is read to find the fmt and data chunks. */
const WAV_HEAD_BYTES = 65536;

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

export interface WavInfo {
  /** 1 = integer PCM, 3 = IEEE float, anything else = compressed/unknown */
  format: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  /** Bytes of the data chunk, when it was found within the bytes given. */
  dataBytes?: number;
  /** Duration in seconds, when the data chunk was found. */
  seconds?: number;
}

const WAVE_FORMAT_EXTENSIBLE = 0xfffe;

/**
 * Walk the RIFF chunks of a WAV head to the `fmt ` chunk (and, when present
 * in these bytes, the `data` chunk). `fileSize` caps a data-chunk size that a
 * streaming writer left as 0 or 0xFFFFFFFF. Null when the fmt chunk is
 * missing or the header is not RIFF/WAVE.
 */
export function parseWavHeader(bytes: Uint8Array, fileSize?: number): WavInfo | null {
  if (!isWavHeader(bytes)) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let info: WavInfo | null = null;
  let off = 12;
  while (off + 8 <= bytes.length) {
    const id = ascii(bytes, off, off + 4);
    const size = dv.getUint32(off + 4, true);
    const body = off + 8;
    if (id === "fmt ") {
      if (body + 16 > bytes.length) return null;
      let format = dv.getUint16(body, true);
      const channels = dv.getUint16(body + 2, true);
      const sampleRate = dv.getUint32(body + 4, true);
      const bitsPerSample = dv.getUint16(body + 14, true);
      if (format === WAVE_FORMAT_EXTENSIBLE && size >= 40 && body + 26 <= bytes.length) {
        format = dv.getUint16(body + 24, true); // first two bytes of the sub-format GUID
      }
      info = { format, channels, sampleRate, bitsPerSample };
    } else if (id === "data") {
      if (!info) return null;
      const total = fileSize ?? bytes.length;
      const available = Math.max(0, total - body);
      const dataBytes = size === 0 || size === 0xffffffff || size > available ? available : size;
      const bytesPerSecond = info.sampleRate * info.channels * (info.bitsPerSample / 8);
      info.dataBytes = dataBytes;
      if (bytesPerSecond > 0) info.seconds = dataBytes / bytesPerSecond;
      return info;
    }
    off = body + size + (size % 2); // chunks are word-aligned
  }
  return info;
}

/** Warnings about audio.wav's format and its length against the tape. */
export function audioWarnings(info: WavInfo | null, tape: Tape): ImportDiagnostic[] {
  const out: ImportDiagnostic[] = [];
  if (!info) return out;
  if (info.format !== 1) {
    out.push({ code: "wav_not_pcm" });
  } else if (info.sampleRate !== EXPECTED_SAMPLE_RATE || info.channels !== EXPECTED_CHANNELS || info.bitsPerSample !== EXPECTED_BITS) {
    out.push({ code: "wav_format", vars: { rate: info.sampleRate, channels: info.channels, bits: info.bitsPerSample } });
  }
  if (info.seconds !== undefined && tape.frame_rate > 0) {
    const tapeSeconds = tape.u.length / tape.frame_rate;
    if (Math.abs(info.seconds - tapeSeconds) > DURATION_TOLERANCE_SECONDS) {
      out.push({ code: "duration_mismatch", vars: { audio_s: round1(info.seconds), tape_s: round1(tapeSeconds) } });
    }
  }
  return out;
}

/** Warnings about tape.json values that are valid but unexpected. */
export function tapeWarnings(tape: Tape): ImportDiagnostic[] {
  return tape.frame_rate !== EXPECTED_FRAME_RATE ? [{ code: "frame_rate_unusual", vars: { rate: tape.frame_rate } }] : [];
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
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
export function parseMetaText(text: string): { meta: Meta; warning?: ImportDiagnostic } {
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { meta: {}, warning: { code: "meta_not_object" } };
    }
    return { meta: normalizeMeta(raw) };
  } catch (e) {
    return { meta: {}, warning: { code: "meta_invalid_json", vars: { detail: (e as Error).message } } };
  }
}

/** Errors from parseTape as diagnostics naming the file (`file` defaults to tape.json). */
export function tapeErrors(text: string, file: string = TAPE_FILE): { tape?: Tape; errors: ImportDiagnostic[] } {
  const r = parseTape(text);
  return { tape: r.tape, errors: r.errors.map((detail) => ({ code: "tape_invalid", vars: { file, detail } })) };
}

export function isZipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

/** One candidate file, whether it came from a folder pick or from inside a zip. */
export interface RecordingEntry {
  path: string;
  /** Total size in bytes. */
  size: number;
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
    size: file.size,
    head: async (n) => new Uint8Array(await file.slice(0, n).arrayBuffer()),
    text: () => file.text(),
    blob: (type) => new Blob([file], { type }),
  };
}

function bytesEntry(path: string, bytes: Uint8Array): RecordingEntry {
  return {
    path,
    size: bytes.length,
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
function pickEntry(entries: RecordingEntry[], name: string, errors: ImportDiagnostic[]): RecordingEntry | undefined {
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
  errors.push({ code: "duplicates", vars: { file: name, count: shallow.length, list: listed } });
  return undefined;
}

/** Shared by folder picks, zips and the passage importer. */
export async function parseRecordingEntries(entries: RecordingEntry[]): Promise<{ recording?: ParsedRecording; errors: ImportDiagnostic[] }> {
  const errors: ImportDiagnostic[] = [];
  const warnings: ImportDiagnostic[] = [];
  const usable = entries.filter((e) => !isJunkPath(e.path));

  const audioEntry = pickEntry(usable, AUDIO_FILE, errors);
  const tapeEntry = pickEntry(usable, TAPE_FILE, errors);
  const metaEntry = pickEntry(usable, META_FILE, errors);

  const duplicated = (file: string) => errors.some((e) => e.code === "duplicates" && e.vars?.file === file);
  if (!audioEntry && !duplicated(AUDIO_FILE)) errors.push({ code: "audio_missing" });
  if (!tapeEntry && !duplicated(TAPE_FILE)) errors.push({ code: "tape_missing" });

  let wav: WavInfo | null = null;
  if (audioEntry) {
    const head = await audioEntry.head(WAV_HEAD_BYTES);
    if (!isWavHeader(head)) errors.push({ code: "not_wav", vars: { file: AUDIO_FILE } });
    else wav = parseWavHeader(head, audioEntry.size);
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
    warnings.push({ code: "meta_missing" });
  }

  if (errors.length > 0 || !audioEntry || !tape) return { errors };
  warnings.push(...tapeWarnings(tape), ...audioWarnings(wav, tape));
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
export async function parseRecordingFiles(files: File[]): Promise<{ recording?: ParsedRecording; errors: ImportDiagnostic[] }> {
  if (!files || files.length === 0) return { errors: [{ code: "no_files" }] };

  const first = files[0];
  if (files.length === 1 && first && isZipFile(first)) {
    let entries: RecordingEntry[];
    try {
      entries = await zipEntries(first);
    } catch (e) {
      return { errors: [{ code: "zip_unreadable", vars: { detail: (e as Error).message } }] };
    }
    return parseRecordingEntries(entries);
  }

  return parseRecordingEntries(files.map(fileEntry));
}
