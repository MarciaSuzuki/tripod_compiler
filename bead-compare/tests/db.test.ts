import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import type { Comment, Meta, Tape } from "../src/model";
import { sha256Hex } from "../src/model";
import { repo } from "../src/db/repo";
import type { ParsedRecording } from "../src/db/repo";
import { PASSAGE_ZIP_FORMAT, importPassageZip } from "../src/db/passageZip";
import { tape } from "./helpers";

// ---- tiny fixtures ---------------------------------------------------------

/** A minimal 16-bit mono PCM WAV with the given samples. */
function wavBytes(samples: number[], sampleRate = 16000): Uint8Array<ArrayBuffer> {
  const dataLen = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(buf);
  const tag = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
  };
  tag(0, "RIFF");
  dv.setUint32(4, 36 + dataLen, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  tag(36, "data");
  dv.setUint32(40, dataLen, true);
  samples.forEach((s, i) => dv.setInt16(44 + i * 2, s, true));
  return new Uint8Array(buf);
}

function wav(samples: number[]): Blob {
  return new Blob([wavBytes(samples)], { type: "audio/wav" });
}

function rec(t: Tape, meta: Meta, samples: number[]): ParsedRecording {
  return { audio: wav(samples), tape: t, meta, warnings: [] };
}

const REC_A = () => rec(tape([[1, 5], [49, 3], [2, 4]]), { label: "v1 rascunho", narrator: "Ana" }, [0, 100, -100, 50]);
const REC_B = () => rec(tape([[1, 5], [49, 3], [3, 4], [49, 2]]), {}, [0, 200, -200, 50, 7]);

async function bytesOf(b: Blob): Promise<number[]> {
  return Array.from(new Uint8Array(await b.arrayBuffer()));
}

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

const draft = (version_id: string, start: number, end: number, extra: Partial<Comment> = {}): Omit<Comment, "id" | "created_at"> => ({
  span: { version_id, start_frame: start, end_frame: end },
  author: "Marcia",
  text: "fix this",
  kind: "fix_requested",
  status: "open",
  ...extra,
});

beforeEach(async () => {
  await repo.clearAll();
});

// ---- passages --------------------------------------------------------------

describe("passages", () => {
  it("creates, gets, renames and lists newest first", async () => {
    const a = await repo.createPassage("Ruth 1:1-5");
    await tick(5);
    const b = await repo.createPassage("Ruth 1:6-14");
    expect(a.version_ids).toEqual([]);
    expect(await repo.getPassage(a.id)).toEqual(a);
    expect((await repo.listPassages()).map((p) => p.id)).toEqual([b.id, a.id]);

    await repo.renamePassage(a.id, "Rute 1:1-5");
    expect((await repo.getPassage(a.id))?.title).toBe("Rute 1:1-5");
    await expect(repo.renamePassage("missing", "x")).rejects.toThrow(/not found/);
    expect(await repo.getPassage("missing")).toBeUndefined();
  });
});

// ---- versions --------------------------------------------------------------

describe("versions", () => {
  it("adds two versions with hashes, default labels and version_ids order", async () => {
    const p = await repo.createPassage("P");
    const ra = REC_A();
    const rb = REC_B();
    const v1 = await repo.addVersion(p.id, ra);
    const v2 = await repo.addVersion(p.id, rb);

    expect(v1.label).toBe("v1 rascunho"); // from meta.label
    expect(v2.label).toBe("v2"); // no meta.label → v{n}
    expect(v1.passage_id).toBe(p.id);
    expect(v1.meta).toEqual({ label: "v1 rascunho", narrator: "Ana" });

    expect(v1.tape_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(v1.tape_sha256).toBe(await sha256Hex(JSON.stringify(ra.tape)));
    expect(v1.audio_sha256).toBe(await sha256Hex(await ra.audio.arrayBuffer()));
    expect(v1.tape_sha256).not.toBe(v2.tape_sha256);
    expect(v1.audio_sha256).not.toBe(v2.audio_sha256);

    expect((await repo.listVersions(p.id)).map((v) => v.id)).toEqual([v1.id, v2.id]);
    expect((await repo.getPassage(p.id))?.version_ids).toEqual([v1.id, v2.id]);

    const stored = await repo.getVersion(v1.id);
    expect(stored?.tape).toEqual(ra.tape);
    expect(stored?.audio.type).toBe("audio/wav");
    expect(await bytesOf(stored!.audio)).toEqual(await bytesOf(ra.audio));

    const v3 = await repo.addVersion(p.id, REC_B(), "final");
    expect(v3.label).toBe("final");
    await repo.relabelVersion(v3.id, "revisada");
    expect((await repo.getVersion(v3.id))?.label).toBe("revisada");
    expect((await repo.listVersions(p.id)).map((v) => v.label)).toEqual(["v1 rascunho", "v2", "revisada"]);
  });

  it("refuses a version for an unknown passage", async () => {
    await expect(repo.addVersion("nope", REC_A())).rejects.toThrow(/not found/);
    expect(await repo.getVersion("nope")).toBeUndefined();
    expect(await repo.listVersions("nope")).toEqual([]);
  });
});

// ---- comments --------------------------------------------------------------

describe("comments", () => {
  it("adds, lists by created_at, updates and deletes", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());

    const c1 = await repo.addComment(draft(v1.id, 0, 5));
    await tick(5);
    const c2 = await repo.addComment(draft(v1.id, 8, 12, { kind: "note", text: "nice", audio_blob: new Blob([1, 2, 3].map((n) => String(n))) }));
    const other = await repo.addComment(draft(v2.id, 0, 5, { kind: "approved" }));

    expect(c1.id).not.toBe(c2.id);
    expect(c1.created_at <= c2.created_at).toBe(true);
    expect((await repo.listComments(v1.id)).map((c) => c.id)).toEqual([c1.id, c2.id]);
    expect((await repo.listComments(v2.id)).map((c) => c.id)).toEqual([other.id]);

    const updated = await repo.updateComment(c1.id, { status: "resolved", text: "done" });
    expect(updated).toMatchObject({ id: c1.id, status: "resolved", text: "done", kind: "fix_requested" });
    expect((await repo.listComments(v1.id))[0]).toMatchObject({ status: "resolved", text: "done" });
    await expect(repo.updateComment("missing", { text: "x" })).rejects.toThrow(/not found/);

    await repo.deleteComment(c1.id);
    expect((await repo.listComments(v1.id)).map((c) => c.id)).toEqual([c2.id]);
    await repo.deleteComment("missing"); // no-op
  });
});

// ---- carried copies ---------------------------------------------------------

describe("syncCarriedComments", () => {
  it("places one carried copy per source on B, keyed by carried_from, and never duplicates", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    const spoken = new Blob([new Uint8Array([1, 2])], { type: "audio/webm" });
    const src1 = await repo.addComment(draft(v1.id, 0, 5));
    const src2 = await repo.addComment(draft(v1.id, 8, 12, { text: undefined, audio_blob: spoken, author: "Ana" }));
    const items = [
      { source: src1, span: { version_id: v2.id, start_frame: 0, end_frame: 5 } },
      { source: src2, span: { version_id: v2.id, start_frame: 9, end_frame: 14 } },
    ];

    const first = await repo.syncCarriedComments(v1.id, v2.id, items);
    expect(first).toHaveLength(2);
    const copyOf = (cs: Comment[], sourceId: string) => cs.find((c) => c.carried_from === sourceId)!;
    const copy1 = copyOf(first, src1.id);
    const copy2 = copyOf(first, src2.id);
    expect(copy1).toMatchObject({ status: "carried", kind: "fix_requested", author: "Marcia", text: "fix this" });
    expect(copy1.span).toEqual({ version_id: v2.id, start_frame: 0, end_frame: 5 });
    expect(copy2).toMatchObject({ status: "carried", author: "Ana" });
    expect(copy2.text).toBeUndefined();
    expect(await bytesOf(copy2.audio_blob!)).toEqual([1, 2]);
    expect([copy1.id, copy2.id]).not.toContain(src1.id);

    // the copies live on B and A is untouched
    expect((await repo.listComments(v2.id)).map((c) => c.carried_from).sort()).toEqual([src1.id, src2.id].sort());
    expect((await repo.listComments(v1.id)).map((c) => c.status)).toEqual(["open", "open"]);

    // a second sync (a re-opened Compare, StrictMode) keeps the same ids; a moved span is updated in place
    const again = await repo.syncCarriedComments(v1.id, v2.id, [
      items[0]!,
      { source: src2, span: { version_id: v2.id, start_frame: 10, end_frame: 15 } },
    ]);
    expect(again.map((c) => c.id).sort()).toEqual([copy1.id, copy2.id].sort());
    expect(copyOf(again, src2.id).span).toEqual({ version_id: v2.id, start_frame: 10, end_frame: 15 });
    expect(copyOf(again, src1.id).span).toEqual(copy1.span);
    expect(await repo.listComments(v2.id)).toHaveLength(2);
  });

  it("resolves the copy when its source was resolved, removes it when the source is gone, and leaves other pairs alone", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    const v3 = await repo.addVersion(p.id, REC_B());
    const src1 = await repo.addComment(draft(v1.id, 0, 5));
    const src2 = await repo.addComment(draft(v1.id, 6, 9));
    const fromV2 = await repo.addComment(draft(v2.id, 1, 3));
    const span = (start: number, end: number) => ({ version_id: v3.id, start_frame: start, end_frame: end });

    await repo.syncCarriedComments(v1.id, v3.id, [
      { source: src1, span: span(0, 5) },
      { source: src2, span: span(6, 9) },
    ]);
    await repo.syncCarriedComments(v2.id, v3.id, [{ source: fromV2, span: span(1, 3) }]);
    expect(await repo.listComments(v3.id)).toHaveLength(3);

    await repo.updateComment(src1.id, { status: "resolved" });
    await repo.deleteComment(src2.id); // cascades to the copy right away
    const byFrom = (cs: Comment[]) => [...cs].sort((x, y) => (x.carried_from ?? "").localeCompare(y.carried_from ?? ""));
    const expectedOrder = [src1.id, fromV2.id].sort();
    expect(byFrom(await repo.listComments(v3.id)).map((c) => c.carried_from)).toEqual(expectedOrder);

    const after = byFrom(await repo.syncCarriedComments(v1.id, v3.id, []));
    expect(after.map((c) => [c.carried_from, c.status])).toEqual(
      [
        [src1.id, "resolved"],
        [fromV2.id, "carried"], // carried from v2, not part of the v1→v3 pair
      ].sort((x, y) => x[0]!.localeCompare(y[0]!)),
    );
    // a copy whose source vanished without the cascade (an imported zip, say) is dropped on sync
    await repo.addComment({ ...draft(v3.id, 2, 4), status: "carried", carried_from: "ghost" });
    const cleaned = byFrom(await repo.syncCarriedComments(v1.id, v3.id, []));
    expect(cleaned.map((c) => c.carried_from)).toEqual(expectedOrder);
    expect((await repo.listComments(v3.id)).some((c) => c.carried_from === "ghost")).toBe(false);
  });
});

// ---- verdicts --------------------------------------------------------------

describe("verdicts", () => {
  it("setVerdict creates the pair, then updates it in place", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    expect(await repo.getPair(v1.id, v2.id)).toBeUndefined();

    const first = await repo.setVerdict(p.id, v1.id, v2.id, "substituted:1:2", "requested_fix_confirmed");
    expect(first).toMatchObject({
      id: `${v1.id}::${v2.id}`,
      passage_id: p.id,
      a_version_id: v1.id,
      b_version_id: v2.id,
      verdicts: { "substituted:1:2": "requested_fix_confirmed" },
    });

    const second = await repo.setVerdict(p.id, v1.id, v2.id, "inserted:3:0", "unrequested_problem");
    expect(second.verdicts).toEqual({ "substituted:1:2": "requested_fix_confirmed", "inserted:3:0": "unrequested_problem" });
    expect(second.updated_at >= first.updated_at).toBe(true);

    const third = await repo.setVerdict(p.id, v1.id, v2.id, "substituted:1:2", "undecided");
    expect(third.verdicts["substituted:1:2"]).toBe("undecided");
    expect(await repo.getPair(v1.id, v2.id)).toEqual(third);
    expect(await repo.getPair(v2.id, v1.id)).toBeUndefined(); // pairs are ordered
  });
});

// ---- cascades --------------------------------------------------------------

describe("delete cascade", () => {
  it("deleteVersion removes its comments, its pairs and its slot in version_ids", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    const v3 = await repo.addVersion(p.id, REC_B());
    await repo.addComment(draft(v2.id, 0, 3));
    const keep = await repo.addComment(draft(v1.id, 0, 3));
    await repo.setVerdict(p.id, v1.id, v2.id, "k", "unrequested_ok");
    await repo.setVerdict(p.id, v2.id, v3.id, "k", "unrequested_ok");
    await repo.setVerdict(p.id, v1.id, v3.id, "k", "unrequested_ok");

    await repo.deleteVersion(v2.id);

    expect(await repo.getVersion(v2.id)).toBeUndefined();
    expect((await repo.getPassage(p.id))?.version_ids).toEqual([v1.id, v3.id]);
    expect((await repo.listVersions(p.id)).map((v) => v.id)).toEqual([v1.id, v3.id]);
    expect(await repo.listComments(v2.id)).toEqual([]);
    expect((await repo.listComments(v1.id)).map((c) => c.id)).toEqual([keep.id]);
    expect(await repo.getPair(v1.id, v2.id)).toBeUndefined();
    expect(await repo.getPair(v2.id, v3.id)).toBeUndefined();
    expect(await repo.getPair(v1.id, v3.id)).toBeDefined();

    await repo.deleteVersion("missing"); // no-op
  });

  it("deletePassage removes versions, comments and pairs, and leaves other passages alone", async () => {
    const p = await repo.createPassage("P");
    const q = await repo.createPassage("Q");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    const w1 = await repo.addVersion(q.id, REC_A());
    await repo.addComment(draft(v1.id, 0, 3));
    const wc = await repo.addComment(draft(w1.id, 0, 3));
    await repo.setVerdict(p.id, v1.id, v2.id, "k", "unrequested_ok");

    await repo.deletePassage(p.id);

    expect(await repo.getPassage(p.id)).toBeUndefined();
    expect(await repo.getVersion(v1.id)).toBeUndefined();
    expect(await repo.getVersion(v2.id)).toBeUndefined();
    expect(await repo.listComments(v1.id)).toEqual([]);
    expect(await repo.getPair(v1.id, v2.id)).toBeUndefined();

    expect((await repo.listPassages()).map((x) => x.id)).toEqual([q.id]);
    expect((await repo.listVersions(q.id)).map((v) => v.id)).toEqual([w1.id]);
    expect((await repo.listComments(w1.id)).map((c) => c.id)).toEqual([wc.id]);
  });
});

// ---- export / import ---------------------------------------------------------

describe("export → import round trip", () => {
  it("writes the documented zip layout and restores everything under new ids", async () => {
    const p = await repo.createPassage("Ruth 1:1-5");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B(), "v2 revisada");
    const c1 = await repo.addComment(draft(v1.id, 0, 5));
    await tick(5);
    const spoken = new Blob([new Uint8Array([9, 8, 7, 6])], { type: "audio/webm;codecs=opus" });
    const c2 = await repo.addComment(draft(v1.id, 8, 12, { kind: "note", text: undefined, audio_blob: spoken }));
    const c3 = await repo.addComment(draft(v2.id, 1, 6, { status: "carried", carried_from: c1.id }));
    await repo.setVerdict(p.id, v1.id, v2.id, "substituted:1:2", "requested_fix_confirmed");
    await repo.setVerdict(p.id, v1.id, v2.id, "melody:4:4", "unrequested_ok");

    const zip = await repo.exportPassage(p.id);
    expect(zip.type).toBe("application/zip");

    // Layout
    const entries = unzipSync(new Uint8Array(await zip.arrayBuffer()));
    expect(Object.keys(entries).sort()).toEqual(
      [
        "passage.json",
        `versions/${v1.id}/audio.wav`,
        `versions/${v1.id}/tape.json`,
        `versions/${v1.id}/meta.json`,
        `versions/${v2.id}/audio.wav`,
        `versions/${v2.id}/tape.json`,
        `versions/${v2.id}/meta.json`,
        `comments/${c2.id}.webm`,
      ].sort(),
    );
    const manifest = JSON.parse(strFromU8(entries["passage.json"]!));
    expect(manifest.format).toBe(PASSAGE_ZIP_FORMAT);
    expect(manifest.format_version).toBe(1);
    expect(manifest.passage).toEqual({ ...p, version_ids: [v1.id, v2.id] });
    expect(manifest.versions.map((v: { id: string; label: string }) => [v.id, v.label])).toEqual([
      [v1.id, "v1 rascunho"],
      [v2.id, "v2 revisada"],
    ]);
    expect(manifest.versions[0]).toMatchObject({ meta: v1.meta, tape_sha256: v1.tape_sha256, audio_sha256: v1.audio_sha256, imported_at: v1.imported_at });
    expect(manifest.versions[0].tape).toBeUndefined();
    expect(manifest.comments.find((c: { id: string }) => c.id === c2.id)).toMatchObject({ audio_file: `comments/${c2.id}.webm` });
    expect(manifest.comments.find((c: { id: string }) => c.id === c1.id)).toMatchObject({ audio_file: null, text: "fix this" });
    expect(manifest.comments.every((c: Record<string, unknown>) => !("audio_blob" in c))).toBe(true);
    expect(manifest.pairs).toHaveLength(1);
    expect(strFromU8(entries[`versions/${v1.id}/tape.json`]!)).toBe(JSON.stringify(v1.tape));
    expect(Array.from(entries[`comments/${c2.id}.webm`]!)).toEqual([9, 8, 7, 6]);
    expect(Array.from(entries[`versions/${v1.id}/audio.wav`]!)).toEqual(await bytesOf(v1.audio));

    // importPassageZip alone keeps the exporter's ids
    const parsed = await importPassageZip(zip);
    expect(parsed.passage.id).toBe(p.id);
    expect(parsed.versions.map((v) => v.id)).toEqual([v1.id, v2.id]);
    expect(parsed.versions[0]!.tape).toEqual(v1.tape);
    expect(parsed.versions[0]!.warnings).toEqual([]);
    expect(parsed.comments.find((c) => c.id === c2.id)?.audio_blob?.type).toBe("audio/webm");
    expect(parsed.warnings).toEqual([]);

    // repo.importPassage regenerates ids
    const imported = await repo.importPassage(zip);
    expect(imported.id).not.toBe(p.id);
    expect(imported.title).toBe("Ruth 1:1-5");
    expect(imported.created_at).toBe(p.created_at);
    expect(imported.version_ids).toHaveLength(2);
    expect(imported.version_ids).not.toContain(v1.id);
    expect(imported.version_ids).not.toContain(v2.id);

    const [n1, n2] = await repo.listVersions(imported.id);
    expect(n1!.label).toBe("v1 rascunho");
    expect(n2!.label).toBe("v2 revisada");
    expect(n1!.passage_id).toBe(imported.id);
    expect(n1!.tape).toEqual(v1.tape);
    expect(n2!.tape).toEqual(v2.tape);
    expect(n1!.tape_sha256).toBe(v1.tape_sha256);
    expect(n1!.audio_sha256).toBe(v1.audio_sha256);
    expect(n2!.audio_sha256).toBe(v2.audio_sha256);
    expect(n1!.meta).toEqual(v1.meta);
    expect(n1!.imported_at).toBe(v1.imported_at);
    expect(await bytesOf(n1!.audio)).toEqual(await bytesOf(v1.audio));

    const n1Comments = await repo.listComments(n1!.id);
    expect(n1Comments).toHaveLength(2);
    expect(n1Comments.map((c) => c.id)).not.toContain(c1.id);
    const [m1, m2] = n1Comments;
    expect(m1).toMatchObject({ text: "fix this", kind: "fix_requested", status: "open", author: "Marcia", created_at: c1.created_at });
    expect(m1!.span).toEqual({ version_id: n1!.id, start_frame: 0, end_frame: 5 });
    expect(m2!.kind).toBe("note");
    expect(m2!.audio_blob?.type).toBe("audio/webm");
    expect(await bytesOf(m2!.audio_blob!)).toEqual([9, 8, 7, 6]);

    const n2Comments = await repo.listComments(n2!.id);
    expect(n2Comments).toHaveLength(1);
    expect(n2Comments[0]!.status).toBe("carried");
    expect(n2Comments[0]!.carried_from).toBe(m1!.id); // remapped, not c1.id
    expect(n2Comments[0]!.id).not.toBe(c3.id);

    const pair = await repo.getPair(n1!.id, n2!.id);
    expect(pair).toMatchObject({
      id: `${n1!.id}::${n2!.id}`,
      passage_id: imported.id,
      verdicts: { "substituted:1:2": "requested_fix_confirmed", "melody:4:4": "unrequested_ok" },
    });

    // the original is untouched, and importing again never collides
    expect((await repo.listVersions(p.id)).map((v) => v.id)).toEqual([v1.id, v2.id]);
    const again = await repo.importPassage(await zip.arrayBuffer());
    expect(again.id).not.toBe(imported.id);
    expect(await repo.listPassages()).toHaveLength(3);
  });

  it("rejects a zip that is not a passage export", async () => {
    await expect(repo.importPassage(new Blob(["not a zip"]))).rejects.toThrow(/could not be read/);
    await expect(repo.exportPassage("missing")).rejects.toThrow(/not found/);
  });
});

// ---- clearAll --------------------------------------------------------------

describe("clearAll", () => {
  it("empties every store", async () => {
    const p = await repo.createPassage("P");
    const v1 = await repo.addVersion(p.id, REC_A());
    const v2 = await repo.addVersion(p.id, REC_B());
    await repo.addComment(draft(v1.id, 0, 3));
    await repo.setVerdict(p.id, v1.id, v2.id, "k", "undecided");

    await repo.clearAll();

    expect(await repo.listPassages()).toEqual([]);
    expect(await repo.getVersion(v1.id)).toBeUndefined();
    expect(await repo.listComments(v1.id)).toEqual([]);
    expect(await repo.getPair(v1.id, v2.id)).toBeUndefined();
    // still usable afterwards
    expect((await repo.createPassage("Q")).title).toBe("Q");
  });
});
