import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { audioWarnings, parseRecordingFiles, parseWavHeader, type ImportDiagnostic } from "../src/db/recording";
import { STRINGS, translate } from "../src/i18n";
import fixtureTape from "../fixtures/ruth-1-1-5/v1/tape.json";
import fixtureMeta from "../fixtures/ruth-1-1-5/v1/meta.json";

// ---- fixtures --------------------------------------------------------------

/** A 16-bit PCM WAV; `rate`/`channels` default to what the brief expects (16 kHz mono). */
function wavBytes(samples: number[], opts: { rate?: number; channels?: number; format?: number } = {}): Uint8Array<ArrayBuffer> {
  const rate = opts.rate ?? 16000;
  const channels = opts.channels ?? 1;
  const format = opts.format ?? 1;
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
  dv.setUint16(20, format, true);
  dv.setUint16(22, channels, true);
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * channels * 2, true);
  dv.setUint16(32, channels * 2, true);
  dv.setUint16(34, 16, true);
  tag(36, "data");
  dv.setUint32(40, dataLen, true);
  samples.forEach((s, i) => dv.setInt16(44 + i * 2, s, true));
  return new Uint8Array(buf);
}

/** Every diagnostic code must have a message in both languages. */
function expectTranslatable(diagnostics: ImportDiagnostic[]): void {
  for (const d of diagnostics) {
    const key = `passages.import.${d.code}`;
    expect(STRINGS["pt-BR"][key], key).toBeDefined();
    expect(STRINGS.en[key], key).toBeDefined();
    const pt = translate("pt-BR", key, d.vars);
    expect(pt, key).not.toMatch(/\{\w+\}/); // every placeholder was filled
  }
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
    expect(r.recording?.warnings).toEqual([{ code: "meta_missing" }]);
    expectTranslatable(r.recording!.warnings);
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
    expect(r.recording?.warnings).toContainEqual({ code: "meta_missing" });
  });

  it("a broken meta.json is ignored with a warning", async () => {
    const r = await parseRecordingFiles(folder({ meta: "{ not json" }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.meta).toEqual({});
    expect(r.recording?.warnings[0]).toMatchObject({ code: "meta_invalid_json", vars: { detail: expect.any(String) } });
    expectTranslatable(r.recording!.warnings);
  });

  it("a meta.json that is not an object is ignored with a warning", async () => {
    const r = await parseRecordingFiles(folder({ meta: "[1, 2]" }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.warnings).toEqual([{ code: "meta_not_object" }]);
  });

  it("keeps only the known string fields of meta.json", async () => {
    const r = await parseRecordingFiles(folder({ meta: { narrator: "Ana", label: 3, extra: "x", passage: "" } }));
    expect(r.recording?.meta).toEqual({ narrator: "Ana" });
  });

  it("a tape with unequal u/f lengths is an error and yields no recording", async () => {
    const r = await parseRecordingFiles(folder({ tape: { ...TAPE, f: [10, 10] } }));
    expect(r.recording).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toEqual({ code: "tape_invalid", vars: { file: "tape.json", detail: expect.stringMatching(/^u and f differ in length/) } });
    expectTranslatable(r.errors);
  });

  it("a tape that is not JSON is an error", async () => {
    const r = await parseRecordingFiles(folder({ tape: "{" }));
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatchObject({ code: "tape_invalid", vars: { file: "tape.json", detail: expect.stringMatching(/not valid JSON/) } });
  });

  it("audio that is not a WAV file is an error", async () => {
    const r = await parseRecordingFiles(folder({ audio: strToU8("ID3 this is an mp3, honestly") }));
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual([{ code: "not_wav", vars: { file: "audio.wav" } }]);
    expectTranslatable(r.errors);
  });

  it("missing audio and tape are both reported", async () => {
    const r = await parseRecordingFiles([folderFile("v1/meta.json", JSON.stringify(META))]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual([{ code: "audio_missing" }, { code: "tape_missing" }]);
    expectTranslatable(r.errors);
  });

  it("two candidate folders in one selection is an error", async () => {
    const r = await parseRecordingFiles([...folder({ dir: "ruth/v1" }), ...folder({ dir: "ruth/v2" })]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toContainEqual({ code: "duplicates", vars: { file: "tape.json", count: 2, list: "ruth/v1/tape.json, ruth/v2/tape.json" } });
    expect(r.errors.map((e) => e.code)).toEqual(["duplicates", "duplicates", "duplicates"]);
    expectTranslatable(r.errors);
  });

  it("an empty selection is an error", async () => {
    const r = await parseRecordingFiles([]);
    expect(r.recording).toBeUndefined();
    expect(r.errors).toEqual([{ code: "no_files" }]);
  });

  it("warns about audio that is not 16 kHz mono PCM, but still imports it", async () => {
    const stereo = await parseRecordingFiles(folder({ audio: wavBytes([0, 1, 0, 1], { rate: 44100, channels: 2 }) }));
    expect(stereo.errors).toEqual([]);
    expect(stereo.recording?.warnings).toEqual([{ code: "wav_format", vars: { rate: 44100, channels: 2, bits: 16 } }]);
    expectTranslatable(stereo.recording!.warnings);
    const float = await parseRecordingFiles(folder({ audio: wavBytes([0, 1, 0, 1], { format: 3 }) }));
    expect(float.recording?.warnings).toEqual([{ code: "wav_not_pcm" }]);
  });

  it("warns when audio.wav and tape.json disagree about the duration", async () => {
    // 4 samples of audio (0.00025 s) against a tape of 100 frames (2 s)
    const long = { ...TAPE, u: Array(100).fill(1), f: Array(100).fill(10) };
    const r = await parseRecordingFiles(folder({ tape: long }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.warnings).toEqual([{ code: "duration_mismatch", vars: { audio_s: 0, tape_s: 2 } }]);
    expectTranslatable(r.recording!.warnings);
    // within half a second is fine (0.08 s of tape against 0.00025 s of audio)
    expect((await parseRecordingFiles(folder())).recording?.warnings).toEqual([]);
  });

  it("warns about an unusual frame rate", async () => {
    const r = await parseRecordingFiles(folder({ tape: { ...TAPE, frame_rate: 100 } }));
    expect(r.errors).toEqual([]);
    expect(r.recording?.warnings).toEqual([{ code: "frame_rate_unusual", vars: { rate: 100 } }]);
    expectTranslatable(r.recording!.warnings);
  });

  it("parses the shipped demo fixture's tape.json and meta.json", async () => {
    // A silent wav of the fixture's exact length (309 frames × 320 samples) stands in for the real audio.
    const files = [
      folderFile("v1/audio.wav", wavBytes(Array(fixtureTape.u.length * 320).fill(0))),
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
      passage: "Rute 1:1-5",
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
    expect(r.errors).toEqual([{ code: "tape_missing" }]);
  });

  it("a zip with a bad tape is an error", async () => {
    const zip = zipFile({ "v1/audio.wav": WAV, "v1/tape.json": JSON.stringify({ ...TAPE, u: [1, 2] }) });
    const r = await parseRecordingFiles([zip]);
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatchObject({ code: "tape_invalid", vars: { detail: expect.stringMatching(/differ in length/) } });
  });

  it("a zip without meta.json warns", async () => {
    const zip = zipFile({ "v1/audio.wav": WAV, "v1/tape.json": JSON.stringify(TAPE) }, "V1.ZIP");
    const r = await parseRecordingFiles([zip]);
    expect(r.errors).toEqual([]);
    expect(r.recording?.warnings).toEqual([{ code: "meta_missing" }]);
  });

  it("a file that is not a zip archive is reported", async () => {
    const r = await parseRecordingFiles([new File(["definitely not a zip"], "v1.zip")]);
    expect(r.recording).toBeUndefined();
    expect(r.errors[0]).toMatchObject({ code: "zip_unreadable", vars: { detail: expect.any(String) } });
    expectTranslatable(r.errors);
  });
});

describe("parseWavHeader", () => {
  it("reads format, rate, channels, bits and the data length", () => {
    expect(parseWavHeader(wavBytes([0, 0, 0, 0]))).toEqual({ format: 1, channels: 1, sampleRate: 16000, bitsPerSample: 16, dataBytes: 8, seconds: 8 / 32000 });
    expect(parseWavHeader(wavBytes([0, 0], { rate: 44100, channels: 2 }))).toMatchObject({ channels: 2, sampleRate: 44100, dataBytes: 4 });
    expect(parseWavHeader(strToU8("not a wav at all"))).toBeNull();
  });

  it("skips other chunks before fmt and data, and caps a bogus data size at the file size", () => {
    const base = wavBytes([1, 2, 3, 4]);
    // insert a 6-byte LIST chunk between WAVE and fmt (padded to an even length)
    const list = new Uint8Array([0x4c, 0x49, 0x53, 0x54, 5, 0, 0, 0, 1, 2, 3, 4, 5, 0]);
    const withList = new Uint8Array(base.length + list.length);
    withList.set(base.subarray(0, 12));
    withList.set(list, 12);
    withList.set(base.subarray(12), 12 + list.length);
    expect(parseWavHeader(withList)).toMatchObject({ sampleRate: 16000, dataBytes: 8 });
    // a streaming writer left the data size as 0xFFFFFFFF: the file size decides
    const streaming = wavBytes([1, 2, 3, 4]);
    new DataView(streaming.buffer).setUint32(40, 0xffffffff, true);
    expect(parseWavHeader(streaming, streaming.length)).toMatchObject({ dataBytes: 8 });
    // only the head of a big file is read: the data chunk may be further down
    expect(parseWavHeader(base.subarray(0, 36), base.length)).toEqual({ format: 1, channels: 1, sampleRate: 16000, bitsPerSample: 16 });
  });

  it("audioWarnings stays quiet without header information", () => {
    expect(audioWarnings(null, TAPE)).toEqual([]);
    expect(audioWarnings({ format: 1, channels: 1, sampleRate: 16000, bitsPerSample: 16 }, TAPE)).toEqual([]);
  });
});
