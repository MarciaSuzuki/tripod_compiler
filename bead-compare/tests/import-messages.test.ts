import { describe, expect, it } from "vitest";
import { ImportError, type ImportDiagnostic } from "../src/db/recording";
import { translate, type Lang, type T } from "../src/i18n";
import { diagnosticLine, importErrorLine } from "../src/screens/importMessages";

/**
 * Import diagnostics reach the passage card as one translated sentence plus
 * an optional technical detail. The sentence never carries the parser's
 * English or the file's numbers; those go into the detail, which the card
 * shows inside a collapsed <TechnicalDetails>.
 */

const tFor = (lang: Lang): T => (key, vars) => translate(lang, key, vars);
const pt = tFor("pt-BR");
const en = tFor("en");

describe("diagnosticLine", () => {
  it("keeps the raw parser text of an invalid tape out of the sentence", () => {
    const d = { code: "tape_invalid" as const, vars: { file: "tape.json", detail: "u[12] is out of range 0–99" } };
    expect(diagnosticLine(pt, "pt-BR", d)).toEqual({ text: "O arquivo tape.json é inválido.", detail: "u[12] is out of range 0–99" });
    expect(diagnosticLine(en, "en", d)).toEqual({ text: "The file tape.json is invalid.", detail: "u[12] is out of range 0–99" });
  });

  it("puts the file's numbers in a translated detail, with seconds in the language's notation", () => {
    const wav = { code: "wav_format" as const, vars: { rate: 44100, channels: 2, bits: 24 } };
    expect(diagnosticLine(pt, "pt-BR", wav)).toEqual({
      text: "O audio.wav não está em 16 kHz, mono, 16 bits. Ele foi importado assim mesmo.",
      detail: "44100 Hz, 2 canal(is), 24 bits",
    });
    const rate = { code: "frame_rate_unusual" as const, vars: { rate: 100 } };
    expect(diagnosticLine(en, "en", rate)).toEqual({
      text: "The tape does not use the expected frame rate. It was imported anyway.",
      detail: "100 frames per second; expected: 50",
    });
    const duration = { code: "duration_mismatch" as const, vars: { audio_s: 6.2, tape_s: 5.4 } };
    expect(diagnosticLine(pt, "pt-BR", duration).detail).toBe("áudio 6,2 s · fita 5,4 s");
    expect(diagnosticLine(en, "en", duration).detail).toBe("audio 6.2 s · tape 5.4 s");
    expect(diagnosticLine(pt, "pt-BR", duration).text).not.toMatch(/\d/);
  });

  it("has no detail for a plain diagnostic", () => {
    expect(diagnosticLine(pt, "pt-BR", { code: "tape_missing" })).toEqual({ text: "O arquivo tape.json não foi encontrado." });
    expect(diagnosticLine(pt, "pt-BR", { code: "meta_missing" })).toEqual({
      text: "meta.json ausente; a versão foi importada sem narrador(a) nem data.",
    });
  });

  it("keeps the file's own numbers and the parser's English out of every sentence", () => {
    const samples: ImportDiagnostic[] = [
      { code: "tape_invalid", vars: { file: "tape.json", detail: "u and f differ in length (300 vs 299)" } },
      { code: "meta_invalid_json", vars: { detail: "Unexpected token } in JSON at position 4" } },
      { code: "zip_unreadable", vars: { detail: "invalid zip data" } },
      { code: "manifest_invalid", vars: { detail: "versions is not an array" } },
      { code: "wav_format", vars: { rate: 48000, channels: 2, bits: 24 } },
      { code: "frame_rate_unusual", vars: { rate: 25 } },
      { code: "duration_mismatch", vars: { audio_s: 12.4, tape_s: 9.9 } },
    ];
    for (const d of samples) {
      const line = diagnosticLine(pt, "pt-BR", d);
      expect(line.text, d.code).not.toMatch(/out of range|differ|token|invalid zip|array/i);
      for (const [k, v] of Object.entries(d.vars ?? {})) {
        if (typeof v === "number") expect(line.text, `${d.code}.${k}`).not.toContain(String(v).replace(".", ","));
      }
      expect(line.detail, d.code).toBeDefined();
    }
  });
});

describe("importErrorLine", () => {
  it("translates a thrown ImportError and passes any other error through", () => {
    const e = new ImportError({ code: "zip_not_passage" }, "not a passage");
    expect(importErrorLine(pt, "pt-BR", e)).toEqual({ text: "Este .zip não é uma passagem exportada pelo Bead Compare." });
    expect(importErrorLine(en, "en", new Error("disk full"))).toEqual({ text: "disk full" });
    expect(importErrorLine(en, "en", "odd")).toEqual({ text: "odd" });
  });
});
