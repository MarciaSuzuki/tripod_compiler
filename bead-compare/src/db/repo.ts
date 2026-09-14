/**
 * The Repo API used by the screens. One IndexedDB transaction per call where
 * practical; hashing and Blob reads happen before a transaction is opened
 * (see db.ts for why).
 *
 * `Passage.version_ids` is the ordering source of truth for versions.
 */

import type { CarriedComment, Comment, CommentStatus, Meta, Passage, PairRecord, Tape, Verdict, Version } from "../model";
import { newId, sha256Hex } from "../model";
import {
  STORE_NAMES,
  clearStore,
  deleteByIndex,
  deleteFrom,
  getAllFrom,
  getAllKeysFrom,
  getFrom,
  putIn,
  withTx,
} from "./db";
import { exportPassageZip, importPassageZip } from "./passageZip";
import type { ParsedRecording } from "./recording";

export type { ParsedRecording } from "./recording";

export interface Repo {
  listPassages(): Promise<Passage[]>; // newest first
  getPassage(id: string): Promise<Passage | undefined>;
  createPassage(title: string): Promise<Passage>;
  renamePassage(id: string, title: string): Promise<void>;
  deletePassage(id: string): Promise<void>; // cascades versions, comments, pairs
  listVersions(passageId: string): Promise<Version[]>; // in passage.version_ids order
  getVersion(id: string): Promise<Version | undefined>;
  addVersion(passageId: string, rec: ParsedRecording, label?: string): Promise<Version>; // computes both sha256; label defaults to meta.label or "v{n}"
  relabelVersion(id: string, label: string): Promise<void>;
  deleteVersion(id: string): Promise<void>; // cascades comments and pairs
  listComments(versionId: string): Promise<Comment[]>; // by created_at
  addComment(c: Omit<Comment, "id" | "created_at">): Promise<Comment>;
  updateComment(id: string, patch: Partial<Omit<Comment, "id">>): Promise<Comment>;
  deleteComment(id: string): Promise<void>; // also removes the copies carried from it onto other versions
  /**
   * Persist the carry-forward of A's fix requests onto B: one comment per
   * source with carried_from = source id, keyed by carried_from so repeated
   * calls never duplicate. The copy's status follows its source: "carried"
   * while the source is open, "resolved" once it is resolved (and back to
   * "carried" when it is reopened). A copy whose source no longer exists, or
   * no longer carries, is removed or resolved. Returns B's carried copies
   * after the sync.
   */
  syncCarriedComments(aVersionId: string, bVersionId: string, carried: ReadonlyArray<Pick<CarriedComment, "source" | "span">>): Promise<Comment[]>;
  getPair(aId: string, bId: string): Promise<PairRecord | undefined>;
  setVerdict(passageId: string, aId: string, bId: string, regionKey: string, verdict: Verdict): Promise<PairRecord>;
  exportPassage(passageId: string): Promise<Blob>; // zip, see passageZip.ts
  importPassage(zip: Blob | ArrayBuffer): Promise<Passage>; // ids are regenerated to avoid collisions
  clearAll(): Promise<void>; // for tests and a hidden "reset" in settings
}

/** Key of the pairs store: `${a_version_id}::${b_version_id}`. */
export function pairId(aId: string, bId: string): string {
  return `${aId}::${bId}`;
}

/** The canonical tape JSON whose bytes are hashed into Version.tape_sha256. */
export function canonicalTapeJson(tape: Tape): string {
  return JSON.stringify(tape);
}

export async function hashRecording(audio: Blob, tape: Tape): Promise<{ tape_sha256: string; audio_sha256: string }> {
  const [tape_sha256, audio_sha256] = await Promise.all([
    sha256Hex(canonicalTapeJson(tape)),
    audio.arrayBuffer().then((buf) => sha256Hex(buf)),
  ]);
  return { tape_sha256, audio_sha256 };
}

function nowIso(): string {
  return new Date().toISOString();
}

function clean(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t && t.length > 0 ? t : undefined;
}

function defaultLabel(explicit: string | undefined, meta: Meta, n: number): string {
  return clean(explicit) ?? clean(meta.label) ?? `v${n}`;
}

function byCreatedAt(a: { created_at: string; id: string }, b: { created_at: string; id: string }): number {
  return a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
}

/** Order versions by passage.version_ids; anything unlisted goes last, by import time. */
function orderVersions(versionIds: readonly string[], versions: Version[]): Version[] {
  const byId = new Map(versions.map((v) => [v.id, v]));
  const ordered: Version[] = [];
  for (const id of versionIds) {
    const v = byId.get(id);
    if (v) {
      ordered.push(v);
      byId.delete(id);
    }
  }
  const rest = [...byId.values()].sort((a, b) => a.imported_at.localeCompare(b.imported_at) || a.id.localeCompare(b.id));
  return ordered.concat(rest);
}

async function listPassages(): Promise<Passage[]> {
  const all = await withTx("passages", "readonly", (tx) => getAllFrom<Passage>(tx, "passages"));
  return all.sort((a, b) => byCreatedAt(b, a));
}

function getPassage(id: string): Promise<Passage | undefined> {
  return withTx("passages", "readonly", (tx) => getFrom<Passage>(tx, "passages", id));
}

async function createPassage(title: string): Promise<Passage> {
  const passage: Passage = { id: newId(), title, created_at: nowIso(), version_ids: [] };
  await withTx("passages", "readwrite", (tx) => putIn(tx, "passages", passage));
  return passage;
}

function renamePassage(id: string, title: string): Promise<void> {
  return withTx("passages", "readwrite", async (tx) => {
    const passage = await getFrom<Passage>(tx, "passages", id);
    if (!passage) throw new Error(`Passage not found: ${id}`);
    await putIn(tx, "passages", { ...passage, title });
  });
}

function deletePassage(id: string): Promise<void> {
  return withTx(STORE_NAMES, "readwrite", async (tx) => {
    const versionIds = await getAllKeysFrom(tx, "versions", "by_passage", id);
    for (const vid of versionIds) {
      await deleteByIndex(tx, "comments", "by_version", vid);
      await deleteFrom(tx, "versions", vid);
    }
    await deleteByIndex(tx, "pairs", "by_passage", id);
    await deleteFrom(tx, "passages", id);
  });
}

function listVersions(passageId: string): Promise<Version[]> {
  return withTx(["passages", "versions"], "readonly", async (tx) => {
    const passage = await getFrom<Passage>(tx, "passages", passageId);
    const versions = await getAllFrom<Version>(tx, "versions", "by_passage", passageId);
    return orderVersions(passage?.version_ids ?? [], versions);
  });
}

function getVersion(id: string): Promise<Version | undefined> {
  return withTx("versions", "readonly", (tx) => getFrom<Version>(tx, "versions", id));
}

async function addVersion(passageId: string, rec: ParsedRecording, label?: string): Promise<Version> {
  const hashes = await hashRecording(rec.audio, rec.tape);
  const id = newId();
  const imported_at = nowIso();
  return withTx(["passages", "versions"], "readwrite", async (tx) => {
    const passage = await getFrom<Passage>(tx, "passages", passageId);
    if (!passage) throw new Error(`Passage not found: ${passageId}`);
    const version: Version = {
      id,
      passage_id: passageId,
      label: defaultLabel(label, rec.meta, passage.version_ids.length + 1),
      meta: { ...rec.meta },
      tape: rec.tape,
      audio: rec.audio,
      tape_sha256: hashes.tape_sha256,
      audio_sha256: hashes.audio_sha256,
      imported_at,
    };
    await putIn(tx, "versions", version);
    await putIn(tx, "passages", { ...passage, version_ids: [...passage.version_ids, id] });
    return version;
  });
}

function relabelVersion(id: string, label: string): Promise<void> {
  return withTx("versions", "readwrite", async (tx) => {
    const version = await getFrom<Version>(tx, "versions", id);
    if (!version) throw new Error(`Version not found: ${id}`);
    await putIn(tx, "versions", { ...version, label });
  });
}

function deleteVersion(id: string): Promise<void> {
  return withTx(STORE_NAMES, "readwrite", async (tx) => {
    const version = await getFrom<Version>(tx, "versions", id);
    if (!version) return;
    await deleteByIndex(tx, "comments", "by_version", id);
    const pairs = await getAllFrom<PairRecord>(tx, "pairs");
    for (const p of pairs) {
      if (p.a_version_id === id || p.b_version_id === id) await deleteFrom(tx, "pairs", p.id);
    }
    await deleteFrom(tx, "versions", id);
    const passage = await getFrom<Passage>(tx, "passages", version.passage_id);
    if (passage) {
      await putIn(tx, "passages", { ...passage, version_ids: passage.version_ids.filter((v) => v !== id) });
    }
  });
}

async function listComments(versionId: string): Promise<Comment[]> {
  const comments = await withTx("comments", "readonly", (tx) => getAllFrom<Comment>(tx, "comments", "by_version", versionId));
  return comments.sort(byCreatedAt);
}

async function addComment(c: Omit<Comment, "id" | "created_at">): Promise<Comment> {
  const comment: Comment = { ...c, id: newId(), created_at: nowIso() };
  await withTx("comments", "readwrite", (tx) => putIn(tx, "comments", comment));
  return comment;
}

function updateComment(id: string, patch: Partial<Omit<Comment, "id">>): Promise<Comment> {
  return withTx("comments", "readwrite", async (tx) => {
    const existing = await getFrom<Comment>(tx, "comments", id);
    if (!existing) throw new Error(`Comment not found: ${id}`);
    const next: Comment = { ...existing, ...patch, id };
    await putIn(tx, "comments", next);
    return next;
  });
}

function deleteComment(id: string): Promise<void> {
  return withTx("comments", "readwrite", async (tx) => {
    await deleteFrom(tx, "comments", id);
    const all = await getAllFrom<Comment>(tx, "comments");
    for (const c of all) if (c.carried_from === id) await deleteFrom(tx, "comments", c.id);
  });
}

function sameSpan(a: Comment["span"], b: Comment["span"]): boolean {
  return a.version_id === b.version_id && a.start_frame === b.start_frame && a.end_frame === b.end_frame;
}

function syncCarriedComments(
  aVersionId: string,
  bVersionId: string,
  carried: ReadonlyArray<Pick<CarriedComment, "source" | "span">>,
): Promise<Comment[]> {
  return withTx("comments", "readwrite", async (tx) => {
    const onB = await getAllFrom<Comment>(tx, "comments", "by_version", bVersionId);
    const copies = new Map<string, Comment>();
    for (const c of onB) if (c.carried_from) copies.set(c.carried_from, c);

    // 1. Upsert one copy per carried fix request on A; its status mirrors the source.
    for (const item of carried) {
      const src = item.source;
      const existing = copies.get(src.id);
      const span = { version_id: bVersionId, start_frame: item.span.start_frame, end_frame: item.span.end_frame };
      const status: CommentStatus = src.status === "resolved" ? "resolved" : "carried";
      if (existing) {
        const next: Comment = { ...existing, span, author: src.author, kind: src.kind, status, text: src.text, audio_blob: src.audio_blob };
        if (src.text === undefined) delete next.text;
        if (src.audio_blob === undefined) delete next.audio_blob;
        const changed =
          !sameSpan(existing.span, next.span) ||
          existing.author !== next.author ||
          existing.kind !== next.kind ||
          existing.status !== next.status ||
          existing.text !== next.text ||
          existing.audio_blob !== next.audio_blob;
        if (changed) await putIn(tx, "comments", next);
        copies.set(src.id, changed ? next : existing);
      } else {
        const copy: Comment = {
          id: newId(),
          span,
          author: src.author,
          kind: src.kind,
          created_at: nowIso(),
          status,
          carried_from: src.id,
        };
        if (src.text !== undefined) copy.text = src.text;
        if (src.audio_blob !== undefined) copy.audio_blob = src.audio_blob;
        await putIn(tx, "comments", copy);
        copies.set(src.id, copy);
      }
    }

    // 2. Copies of sources on A that no longer carry (or no longer exist).
    const still = new Set(carried.map((c) => c.source.id));
    for (const [sourceId, copy] of copies) {
      if (still.has(sourceId)) continue;
      const src = await getFrom<Comment>(tx, "comments", sourceId);
      if (!src) {
        await deleteFrom(tx, "comments", copy.id);
        copies.delete(sourceId);
        continue;
      }
      if (src.span.version_id !== aVersionId) continue; // carried from another version: not ours to touch
      if (copy.status === "carried") {
        const resolved: Comment = { ...copy, status: "resolved" };
        await putIn(tx, "comments", resolved);
        copies.set(sourceId, resolved);
      }
    }

    return [...copies.values()].sort(byCreatedAt);
  });
}

function getPair(aId: string, bId: string): Promise<PairRecord | undefined> {
  return withTx("pairs", "readonly", (tx) => getFrom<PairRecord>(tx, "pairs", pairId(aId, bId)));
}

function setVerdict(passageId: string, aId: string, bId: string, regionKey: string, verdict: Verdict): Promise<PairRecord> {
  return withTx("pairs", "readwrite", async (tx) => {
    const id = pairId(aId, bId);
    const existing = await getFrom<PairRecord>(tx, "pairs", id);
    const pair: PairRecord = {
      id,
      passage_id: existing?.passage_id ?? passageId,
      a_version_id: aId,
      b_version_id: bId,
      verdicts: { ...(existing?.verdicts ?? {}), [regionKey]: verdict },
      updated_at: nowIso(),
    };
    await putIn(tx, "pairs", pair);
    return pair;
  });
}

async function exportPassage(passageId: string): Promise<Blob> {
  const data = await withTx(STORE_NAMES, "readonly", async (tx) => {
    const passage = await getFrom<Passage>(tx, "passages", passageId);
    if (!passage) throw new Error(`Passage not found: ${passageId}`);
    const versions = orderVersions(passage.version_ids, await getAllFrom<Version>(tx, "versions", "by_passage", passageId));
    const comments: Comment[] = [];
    for (const v of versions) {
      comments.push(...(await getAllFrom<Comment>(tx, "comments", "by_version", v.id)).sort(byCreatedAt));
    }
    const pairs = await getAllFrom<PairRecord>(tx, "pairs", "by_passage", passageId);
    return { passage, versions, comments, pairs };
  });
  return exportPassageZip(data.passage, data.versions, data.comments, data.pairs);
}

async function importPassage(zip: Blob | ArrayBuffer): Promise<Passage> {
  const imported = await importPassageZip(zip);
  const now = nowIso();

  // Fresh ids for everything, so importing the same zip twice never collides.
  const passageId = newId();
  const versionIds = new Map(imported.versions.map((v) => [v.id, newId()]));
  const commentIds = new Map(imported.comments.map((c) => [c.id, newId()]));

  // Hashes are recomputed from the bytes we actually hold (before any transaction).
  const versions: Version[] = await Promise.all(
    imported.versions.map(async (v, i): Promise<Version> => {
      const hashes = await hashRecording(v.audio, v.tape);
      return {
        id: versionIds.get(v.id)!,
        passage_id: passageId,
        label: defaultLabel(v.label, v.meta, i + 1),
        meta: v.meta,
        tape: v.tape,
        audio: v.audio,
        tape_sha256: hashes.tape_sha256,
        audio_sha256: hashes.audio_sha256,
        imported_at: v.imported_at || now,
      };
    }),
  );

  const listed = imported.passage.version_ids.filter((id) => versionIds.has(id)).map((id) => versionIds.get(id)!);
  const unlisted = versions.map((v) => v.id).filter((id) => !listed.includes(id));
  const passage: Passage = {
    id: passageId,
    title: imported.passage.title,
    created_at: imported.passage.created_at || now,
    version_ids: [...listed, ...unlisted],
  };

  const comments: Comment[] = imported.comments
    .filter((c) => versionIds.has(c.span.version_id))
    .map((c) => {
      const next: Comment = {
        ...c,
        id: commentIds.get(c.id)!,
        span: { ...c.span, version_id: versionIds.get(c.span.version_id)! },
      };
      if (c.carried_from && commentIds.has(c.carried_from)) next.carried_from = commentIds.get(c.carried_from)!;
      return next;
    });

  const pairs: PairRecord[] = imported.pairs
    .filter((p) => versionIds.has(p.a_version_id) && versionIds.has(p.b_version_id))
    .map((p) => {
      const a = versionIds.get(p.a_version_id)!;
      const b = versionIds.get(p.b_version_id)!;
      return {
        id: pairId(a, b),
        passage_id: passageId,
        a_version_id: a,
        b_version_id: b,
        verdicts: { ...p.verdicts },
        updated_at: p.updated_at || now,
      };
    });

  await withTx(STORE_NAMES, "readwrite", async (tx) => {
    await putIn(tx, "passages", passage);
    for (const v of versions) await putIn(tx, "versions", v);
    for (const c of comments) await putIn(tx, "comments", c);
    for (const p of pairs) await putIn(tx, "pairs", p);
  });
  return passage;
}

function clearAll(): Promise<void> {
  return withTx(STORE_NAMES, "readwrite", async (tx) => {
    for (const store of STORE_NAMES) await clearStore(tx, store);
  });
}

export const repo: Repo = {
  listPassages,
  getPassage,
  createPassage,
  renamePassage,
  deletePassage,
  listVersions,
  getVersion,
  addVersion,
  relabelVersion,
  deleteVersion,
  listComments,
  addComment,
  updateComment,
  deleteComment,
  syncCarriedComments,
  getPair,
  setVerdict,
  exportPassage,
  importPassage,
  clearAll,
};
