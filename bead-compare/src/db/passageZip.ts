/**
 * Export / import one passage as a zip (fflate). Layout, from ARCHITECTURE.md:
 *
 *   passage.json                    { format: "bead-compare-passage", format_version: 1,
 *                                     passage, versions: [{ id, label, meta, tape_sha256, audio_sha256, imported_at }],
 *                                     comments: [{ ...comment without audio_blob, audio_file: "comments/<id>.webm" | null }],
 *                                     pairs: [PairRecord] }
 *   versions/<version_id>/audio.wav
 *   versions/<version_id>/tape.json
 *   versions/<version_id>/meta.json
 *   comments/<comment_id>.<ext>     spoken comment blobs (ext from the blob type)
 *
 * Ids inside the zip are the exporter's ids; repo.importPassage regenerates
 * them. This module only moves bytes.
 */

import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import type { Comment, Meta, Passage, PairRecord, Version } from "../model";
import { AUDIO_FILE, META_FILE, TAPE_FILE, basename, blobPart, isWavHeader, normalizeMeta, parseMetaText, tapeErrors } from "./recording";
import type { ParsedRecording } from "./recording";

export const PASSAGE_ZIP_FORMAT = "bead-compare-passage";
export const PASSAGE_ZIP_FORMAT_VERSION = 1;
export const MANIFEST_FILE = "passage.json";

export interface ManifestVersion {
  id: string;
  label: string;
  meta: Meta;
  tape_sha256: string;
  audio_sha256: string;
  imported_at: string;
}

export interface ManifestComment extends Omit<Comment, "audio_blob"> {
  audio_file: string | null;
}

export interface PassageManifest {
  format: typeof PASSAGE_ZIP_FORMAT;
  format_version: typeof PASSAGE_ZIP_FORMAT_VERSION;
  passage: Passage;
  versions: ManifestVersion[];
  comments: ManifestComment[];
  pairs: PairRecord[];
}

/** A version as read back from a zip: the recording plus what the manifest said about it. */
export interface ImportedVersion extends ParsedRecording, ManifestVersion {}

export interface ImportedPassage {
  passage: Passage;
  versions: ImportedVersion[];
  /** audio_blob restored from comments/<id>.<ext> when present. Ids are the exporter's. */
  comments: Comment[];
  pairs: PairRecord[];
  /** Non-fatal problems (a comment audio file missing from the zip, ...). */
  warnings: string[];
}

// ---- comment audio file naming --------------------------------------------

const EXT_BY_SUBTYPE: Record<string, string> = {
  webm: "webm",
  ogg: "ogg",
  mp4: "mp4",
  "x-m4a": "mp4",
  wav: "wav",
  wave: "wav",
  "x-wav": "wav",
  "vnd.wave": "wav",
};

const TYPE_BY_EXT: Record<string, string> = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  mp4: "audio/mp4",
  wav: "audio/wav",
  bin: "application/octet-stream",
};

/** File extension for a spoken-comment blob: webm, ogg, mp4, wav; default bin. */
export function commentAudioExt(blob: Pick<Blob, "type">): string {
  const mime = (blob.type ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  const subtype = mime.split("/")[1] ?? "";
  return EXT_BY_SUBTYPE[subtype] ?? "bin";
}

export function commentAudioFile(comment: Pick<Comment, "id" | "audio_blob">): string | null {
  if (!comment.audio_blob) return null;
  return `comments/${comment.id}.${commentAudioExt(comment.audio_blob)}`;
}

function mimeForExt(ext: string): string {
  return TYPE_BY_EXT[ext.toLowerCase()] ?? TYPE_BY_EXT.bin!;
}

// ---- export ---------------------------------------------------------------

export async function exportPassageZip(
  passage: Passage,
  versions: Version[],
  comments: Comment[],
  pairs: PairRecord[],
): Promise<Blob> {
  const files: Record<string, Uint8Array> = {};

  const manifestVersions: ManifestVersion[] = [];
  for (const v of versions) {
    const dir = `versions/${v.id}`;
    files[`${dir}/${AUDIO_FILE}`] = new Uint8Array(await v.audio.arrayBuffer());
    files[`${dir}/${TAPE_FILE}`] = strToU8(JSON.stringify(v.tape));
    files[`${dir}/${META_FILE}`] = strToU8(JSON.stringify(v.meta ?? {}, null, 2));
    manifestVersions.push({
      id: v.id,
      label: v.label,
      meta: v.meta ?? {},
      tape_sha256: v.tape_sha256,
      audio_sha256: v.audio_sha256,
      imported_at: v.imported_at,
    });
  }

  const manifestComments: ManifestComment[] = [];
  for (const c of comments) {
    const { audio_blob, ...rest } = c;
    const audio_file = commentAudioFile(c);
    if (audio_blob && audio_file) files[audio_file] = new Uint8Array(await audio_blob.arrayBuffer());
    manifestComments.push({ ...rest, audio_file });
  }

  const manifest: PassageManifest = {
    format: PASSAGE_ZIP_FORMAT,
    format_version: PASSAGE_ZIP_FORMAT_VERSION,
    passage,
    versions: manifestVersions,
    comments: manifestComments,
    pairs,
  };
  files[MANIFEST_FILE] = strToU8(JSON.stringify(manifest, null, 2));

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: "application/zip" });
}

// ---- import ---------------------------------------------------------------

async function toBytes(input: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return new Uint8Array(await input.arrayBuffer());
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((s) => typeof s === "string");
}

function readManifest(text: string): PassageManifest {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new Error(`${MANIFEST_FILE} is not valid JSON: ${(e as Error).message}`);
  }
  if (!isRecord(raw) || raw.format !== PASSAGE_ZIP_FORMAT) {
    throw new Error("This zip is not a Bead Compare passage export.");
  }
  if (raw.format_version !== PASSAGE_ZIP_FORMAT_VERSION) {
    throw new Error(`This passage export uses format version ${String(raw.format_version)}; this app reads version ${PASSAGE_ZIP_FORMAT_VERSION}.`);
  }
  const p = raw.passage;
  if (!isRecord(p) || typeof p.id !== "string" || typeof p.title !== "string" || !isStringArray(p.version_ids)) {
    throw new Error(`${MANIFEST_FILE} has no valid passage entry.`);
  }
  if (!Array.isArray(raw.versions) || !Array.isArray(raw.comments) || !Array.isArray(raw.pairs)) {
    throw new Error(`${MANIFEST_FILE} is missing its versions, comments or pairs lists.`);
  }
  const versions = raw.versions.map((v: unknown, i: number): ManifestVersion => {
    if (!isRecord(v) || typeof v.id !== "string") throw new Error(`${MANIFEST_FILE}: version entry ${i + 1} has no id.`);
    return {
      id: v.id,
      label: typeof v.label === "string" ? v.label : "",
      meta: normalizeMeta(v.meta),
      tape_sha256: typeof v.tape_sha256 === "string" ? v.tape_sha256 : "",
      audio_sha256: typeof v.audio_sha256 === "string" ? v.audio_sha256 : "",
      imported_at: typeof v.imported_at === "string" ? v.imported_at : "",
    };
  });
  const comments = raw.comments.map((c: unknown, i: number): ManifestComment => {
    if (!isRecord(c) || typeof c.id !== "string" || !isRecord(c.span) || typeof c.span.version_id !== "string") {
      throw new Error(`${MANIFEST_FILE}: comment entry ${i + 1} is malformed.`);
    }
    return c as unknown as ManifestComment;
  });
  const pairs = raw.pairs.map((pr: unknown, i: number): PairRecord => {
    if (!isRecord(pr) || typeof pr.a_version_id !== "string" || typeof pr.b_version_id !== "string" || !isRecord(pr.verdicts)) {
      throw new Error(`${MANIFEST_FILE}: pair entry ${i + 1} is malformed.`);
    }
    return pr as unknown as PairRecord;
  });
  return {
    format: PASSAGE_ZIP_FORMAT,
    format_version: PASSAGE_ZIP_FORMAT_VERSION,
    passage: {
      id: p.id,
      title: p.title,
      created_at: typeof p.created_at === "string" ? p.created_at : "",
      version_ids: p.version_ids,
    },
    versions,
    comments,
    pairs,
  };
}

export async function importPassageZip(bytes: Blob | ArrayBuffer | Uint8Array): Promise<ImportedPassage> {
  const data = await toBytes(bytes);
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(data);
  } catch (e) {
    throw new Error(`The zip file could not be read: ${(e as Error).message}`);
  }

  // passage.json sits at the root, but tolerate a zip that wraps one folder.
  const manifestPath = Object.keys(entries)
    .filter((k) => !k.endsWith("/") && basename(k) === MANIFEST_FILE)
    .sort((a, b) => a.split("/").length - b.split("/").length)[0];
  if (!manifestPath) throw new Error(`${MANIFEST_FILE} was not found; this zip is not a Bead Compare passage export.`);
  const prefix = manifestPath.slice(0, manifestPath.length - MANIFEST_FILE.length);
  const file = (rel: string): Uint8Array | undefined => entries[prefix + rel];

  const manifest = readManifest(strFromU8(entries[manifestPath]!));
  const warnings: string[] = [];

  const versions: ImportedVersion[] = [];
  for (const mv of manifest.versions) {
    const dir = `versions/${mv.id}`;
    const audioBytes = file(`${dir}/${AUDIO_FILE}`);
    if (!audioBytes) throw new Error(`${dir}/${AUDIO_FILE} is missing from the zip.`);
    if (!isWavHeader(audioBytes)) throw new Error(`${dir}/${AUDIO_FILE} is not a WAV file (it does not start with a RIFF/WAVE header).`);
    const tapeBytes = file(`${dir}/${TAPE_FILE}`);
    if (!tapeBytes) throw new Error(`${dir}/${TAPE_FILE} is missing from the zip.`);
    const t = tapeErrors(strFromU8(tapeBytes));
    if (!t.tape) throw new Error(`${dir}/${t.errors.join("; ")}`);

    const versionWarnings: string[] = [];
    let meta: Meta = mv.meta;
    const metaBytes = file(`${dir}/${META_FILE}`);
    if (metaBytes) {
      const m = parseMetaText(strFromU8(metaBytes));
      if (m.warning) versionWarnings.push(m.warning);
      else meta = m.meta;
    } else {
      versionWarnings.push(`${META_FILE} missing`);
    }

    versions.push({
      ...mv,
      meta,
      audio: new Blob([blobPart(audioBytes)], { type: "audio/wav" }),
      tape: t.tape,
      warnings: versionWarnings,
    });
  }

  const comments: Comment[] = manifest.comments.map((mc) => {
    const { audio_file, ...rest } = mc;
    const comment: Comment = { ...rest };
    if (audio_file) {
      const audioBytes = file(audio_file);
      if (audioBytes) {
        const ext = audio_file.split(".").pop() ?? "bin";
        comment.audio_blob = new Blob([blobPart(audioBytes)], { type: mimeForExt(ext) });
      } else {
        warnings.push(`Spoken comment audio ${audio_file} is missing from the zip; the comment was kept without audio.`);
      }
    }
    return comment;
  });

  return { passage: manifest.passage, versions, comments, pairs: manifest.pairs, warnings };
}
