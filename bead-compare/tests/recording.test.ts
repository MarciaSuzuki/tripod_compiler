import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { parseRecordingFiles } from "../src/db/recording";
import fixtureTape from "../fixtures/ruth-1-1-5/v1/tape.json";
import fixtureMeta from "../fixtures/ruth-1-1-5/v1/meta.json";

// ---- fixtures --------------------------------------------------------------

function wavBytes(samples: number[]): Uint8Array<ArrayBuffer> {
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
  dv.setUint32(24, 8000, true);
  dv.setUint32(28, 16000, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  tag(36, "data");
  dv.setUint32(40, dataLen, true);
  samples.forEach((s, i) => dv.setInt16(44 + i * 2, s, true));
  return new Uint8Array(buf);
}

const WAV = wavBytes([0, 10, -10, 5]);
const TAPE = { codebook_hash: "sha256:demo", frame_rate: 50, u: [1, 1, 49, 2], f: [10, 10, 0, 12], pause_unit: 49, mock: true };
const META = { passage: "Ruth 1:1-5", language: "por", narrator: "Ana", recorded_at: "2026-09-01T10:00:00Z", label: "v1 rascunho" };

/** A File as the browser produces it from <input webkitdirectory>: basename + webkitRelativePath. */
function folderFile(path: string, content: Uint8Array | string): File {
  const name = path.split("/").pop()!;
  const file = new File([typeof content === "string" ? content : content.slice()], name);
  Object.defineProperty(file, "webkitRelativePath", { value: path });
  return file;
}

function folder(opts: { audio?: Uint8Array | null; tape?: unknown | string; meta?: unknown | string | null; dir?: string } = {}): File[] {
  const dir = opts.dir ?? "v1";
  const files: File[] = [];
  const audio = opts.audio === undefined ? WAV : opts.audio;
  if (audio) files.push(folderFile(`${dir}/audio.wav`, audio));
  const tape = opts.tape ?? TAPE;
  files.push(folderFile(`${dir}/tape.json`, typeof tape === "string" ? tape : JSON.stringify(tape)));
  const meta = opts.meta === undefined ? META : opts.meta;
  if (meta !== null) files.push(folderFile(`${dir}/meta.json`, typeof meta === "string" ? meta : JSON.stringify(meta)));
  return files;
}

function zipFile(entries: Record<string, Uint8Array | string>, name = "v1.zip"): File {
  const data: Record<string, Uint8Array> = {};
  for (const [k, v] of Object.entries(entries)) data[k] = typeof v === "string" ? strToU8(v) : v;
  return new File([zipSync(data)], name, { type: "application/zip" });
}

// ---- tests -----------------------------------------------------------------

describe("parseRecordingFiles — folder", () => {
  it("parses a folder's files (webkitRelativePath) into a ParsedRecording", async () => {
    const r = await parseRecordingFiles(folder());
    expect(r.errors).toEqual([]);
    expect(r.recording).toBeDefined();
    const rec = r.recording!;
    expect(rec.tape).toEqual(TAPE);
    expect(rec.meta).toEqual(META);
    expect(rec.warnings).toEqual([]);
    expect(rec.audio.type).toBe("audio/wav");
    expect(new Uint8Array(await rec.audio.arrayBuffer())).toEqual(WAV);
  });

  it("finds the files at any depth and matches names case-insensitively", async () => {
    const files = [
      folderFile("Ruth/gravacoes/V1/AUDIO.WAV", WAV),
      folderFile("Ruth/gravacoes/V1/Tape.JSON", JSON.stringify(TAPE)),
      folderFile("Ruth/gravacoes/V1/notes.txt", "ignored"),
      folderFile("Ruth/gravacoes/V1/.DS_Store", "junk"),
    ];
    const r = await parseRecordingFiles(files);
    expect(r.errors).toEqual([]);
    expect(r.recording?.tape.u).toEqual(TAPE.u);
    expect(r.recording?.warnings).toEqual(["meta.json missing"]);
  });

  it("also accepts plain File names (multi-file picker, no relative path)", async () => {
    const files = [new File([WAV.slice()], "audio.wav"), new File([JSON.stringify(TAPE)], "tape.json")];
    const r = await parseRecordingFiles(files);
    expect(r.errors).toEqual([]);
    expect(r.recording?.meta).toEqual({});
  });

  it("missing meta.json is a warning, not an error", async () => {
    const r = await parseRecordingFiles(folder({ meta: null }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.meta).toEqual({});
    expect(r.recording?.warnings).toContain("meta.json missing");
  });

  it("a broken meta.json is ignored with a warning", async () => {
    const r = await parseRecordingFiles(folder({ meta: "{ not json" }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.meta).toEqual({});
    expect(r.recording?.warnings[0]).toMatch(/meta\.json is not valid JSON/);
  });

  it("keeps only the known string fields of meta.json", async () => {
    const r = await parseRecordingFiles(folder({ meta: { narrator: "Ana", label: 3, extra: "x", passage: "" } }));
    expect(r.recording?.meta).toEqual({ narrator: "Ana" });
  });

  it("a tape with unequal u/f lengths is an error and yields no recording", async () => {
    const r = await parseRecordingFiles(folder({ tape: { ...TAPE, f: [10, 10] } }));
    expect(r.recording).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatch(/^tape\.json: u and f differ in length/);
  });

  it("a tape that is not JSON is an error", async () => {
    const r = await parseRecordingFiles(folder({ tape: "{" }));
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatch(/^tape\.json is not valid JSON/);
  });

  it("audio that is not a WAV file is an error", async () => {
    const r = await parseRecordingFiles(folder({ audio: strToU8("ID3 this is an mp3, honestly") }));
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual(["audio.wav is not a WAV file (it does not start with a RIFF/WAVE header)."]);
  });

  it("missing audio and tape are both reported", async () => {
    const r = await parseRecordingFiles([folderFile("v1/meta.json", JSON.stringify(META))]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual(["audio.wav was not found.", "tape.json was not found."]);
  });

  it("two candidate folders in one selection is an error", async () => {
    const r = await parseRecordingFiles([...folder({ dir: "ruth/v1" }), ...folder({ dir: "ruth/v2" })]);
    expect(r.recording).toBeUndefined();
    expect(r.errors.some((e) => /Found 2 files named tape\.json/.test(e))).toBe(true);
    expect(r.errors.some((e) => /Choose one Recording folder/.test(e))).toBe(true);
  });

  it("an empty selection is an error", async () => {
    const r = await parseRecordingFiles([]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual(["No files were selected."]);
  });

  it("parses the shipped demo fixture's tape.json and meta.json", async () => {
    // The fixture wav is not importable without node typings; the header check is covered above.
    const files = [
      folderFile("v1/audio.wav", WAV),
      folderFile("v1/tape.json", JSON.stringify(fixtureTape)),
      folderFile("v1/meta.json", JSON.stringify(fixtureMeta)),
    ];
    const r = await parseRecordingFiles(files);
    expect(r.errors).toEqual([]);
    expect(r.recording?.tape.mock).toBe(true);
    expect(r.recording?.tape.u.length).toBe(fixtureTape.u.length);
    expect(r.recording?.tape.u.length).toBe(r.recording?.tape.f.length);
    expect(r.recording?.tape.codebook_hash).toBe(fixtureTape.codebook_hash);
    expect(r.recording?.meta).toEqual({
      passage: "Ruth 1:1-5",
      language: "por",
      narrator: fixtureMeta.narrator,
      recorded_at: fixtureMeta.recorded_at,
      label: "v1 rascunho",
    });
    expect(r.recording?.warnings).toEqual([]);
  });
});

describe("parseRecordingFiles — zip", () => {
  it("reads a zip that wraps a top-level folder", async () => {
    const zip = zipFile({
      "ruth-1-1-5/v1/audio.wav": WAV,
      "ruth-1-1-5/v1/tape.json": JSON.stringify(TAPE),
      "ruth-1-1-5/v1/meta.json": JSON.stringify(META),
      "__MACOSX/ruth-1-1-5/v1/._audio.wav": strToU8("resource fork"),
    });
    const r = await parseRecordingFiles([zip]);
    expect(r.errors).toEqual([]);
    expect(r.recording?.tape).toEqual(TAPE);
    expect(r.recording?.meta).toEqual(META);
    expect(r.recording?.audio.type).toBe("audio/wav");
    expect(new Uint8Array(await r.recording!.audio.arrayBuffer())).toEqual(WAV);
  });

  it("a zip missing tape.json is an error", async () => {
    const zip = zipFile({ "v1/audio.wav": WAV, "v1/meta.json": JSON.stringify(META) });
    const r = await parseRecordingFiles([zip]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual(["tape.json was not found."]);
  });

  it("a zip with a bad tape is an error", async () => {
    const zip = zipFile({ "v1/audio.wav": WAV, "v1/tape.json": JSON.stringify({ ...TAPE, u: [1, 2] }) });
    const r = await parseRecordingFiles([zip]);
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatch(/differ in length/);
  });

  it("a zip without meta.json warns", async () => {
    const zip = zipFile({ "v1/audio.wav": WAV, "v1/tape.json": JSON.stringify(TAPE) }, "V1.ZIP");
    const r = await parseRecordingFiles([zip]);
    expect(r.errors).toEqual([]);
    expect(r.recording?.warnings).toEqual(["meta.json missing"]);
  });

  it("a file that is not a zip archive is reported", async () => {
    const r = await parseRecordingFiles([new File(["definitely not a zip"], "v1.zip")]);
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatch(/^The zip file could not be read/);
  });
});
