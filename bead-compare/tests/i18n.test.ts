import { describe, expect, it } from "vitest";
import { LANGS, STRINGS, STRING_MODULES, interpolate, translate, type Lang, type StringModule } from "../src/i18n";

const KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

describe("translate", () => {
  it("returns the pt-BR and en strings for a key", () => {
    expect(translate("pt-BR", "common.nav.passages")).toBe("Passagens");
    expect(translate("en", "common.nav.passages")).toBe("Passages");
    expect(translate("pt-BR", "common.carry.no_change_detected")).toBe("Sem mudança detectada aqui");
    expect(translate("pt-BR", "common.mock.badge")).toBe("Fita simulada");
    expect(translate("en", "common.mock.badge")).toBe("Mock tape");
  });

  it("replaces {vars}, including numbers", () => {
    expect(translate("en", "common.error.with_detail", { message: "disk full" })).toBe("Something went wrong: disk full");
    expect(translate("pt-BR", "passages.version.imported", { label: "v2" })).toBe("Versão “v2” adicionada.");
    expect(interpolate("{n} of {total}", { n: 3, total: 10 })).toBe("3 of 10");
  });

  it("leaves unknown placeholders and repeated ones as expected", () => {
    expect(interpolate("{a} and {b}", { a: "x" })).toBe("x and {b}");
    expect(interpolate("{a}{a}", { a: "y" })).toBe("yy");
    expect(interpolate("no vars", undefined)).toBe("no vars");
  });

  it("returns the key itself when it is missing", () => {
    expect(translate("pt-BR", "nope.missing.key")).toBe("nope.missing.key");
    expect(translate("en", "nope.missing.key", { x: 1 })).toBe("nope.missing.key");
  });
});

describe("strings modules", () => {
  const modules = Object.entries(STRING_MODULES) as Array<[string, StringModule]>;

  it("registers every screen module", () => {
    expect(Object.keys(STRING_MODULES).sort()).toEqual(["common", "compare", "listen", "passages", "report"]);
  });

  it.each(modules)("%s: pt-BR and en define exactly the same keys", (_name, mod) => {
    const pt = Object.keys(mod["pt-BR"]).sort();
    const en = Object.keys(mod.en).sort();
    const onlyPt = pt.filter((k) => !en.includes(k));
    const onlyEn = en.filter((k) => !pt.includes(k));
    expect({ onlyInPtBR: onlyPt, onlyInEn: onlyEn }).toEqual({ onlyInPtBR: [], onlyInEn: [] });
    expect(pt).toEqual(en);
  });

  it.each(modules)("%s: keys are screen.section.item and values are non-empty strings", (_name, mod) => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(mod[lang])) {
        expect(key, `key ${key}`).toMatch(KEY_PATTERN);
        expect(typeof value, `value of ${key} (${lang})`).toBe("string");
        expect(value.trim().length, `empty value for ${key} (${lang})`).toBeGreaterThan(0);
      }
    }
  });

  it("uses the same {placeholders} in both languages", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const [, mod] of modules) {
      for (const key of Object.keys(mod["pt-BR"])) {
        expect(placeholders(mod.en[key] ?? ""), `placeholders of ${key}`).toEqual(placeholders(mod["pt-BR"][key] ?? ""));
      }
    }
  });

  it("never defines one key in two modules", () => {
    const seen = new Map<string, string>();
    for (const [name, mod] of modules) {
      for (const key of Object.keys(mod["pt-BR"])) {
        expect(seen.has(key), `key ${key} defined in both ${seen.get(key)} and ${name}`).toBe(false);
        seen.set(key, name);
      }
    }
  });

  it("common and passages are populated and merged into STRINGS", () => {
    expect(Object.keys(STRING_MODULES.common["pt-BR"]).length).toBeGreaterThan(40);
    expect(Object.keys(STRING_MODULES.passages["pt-BR"]).length).toBeGreaterThan(20);
    for (const lang of LANGS as readonly Lang[]) {
      const total = modules.reduce((n, [, mod]) => n + Object.keys(mod[lang]).length, 0);
      expect(Object.keys(STRINGS[lang]).length).toBe(total);
    }
  });

  it("covers the keys the shared components ask the screens for", () => {
    const required = [
      "common.app.title",
      "common.nav.passages",
      "common.nav.listen",
      "common.nav.compare",
      "common.nav.report",
      "common.nav.back",
      "common.button.play",
      "common.button.pause",
      "common.button.stop",
      "common.button.loop",
      "common.button.save",
      "common.button.cancel",
      "common.button.delete",
      "common.button.export",
      "common.button.import",
      "common.button.close",
      "common.button.confirm",
      "common.kind.note",
      "common.kind.fix_requested",
      "common.kind.approved",
      "common.status.open",
      "common.status.resolved",
      "common.status.carried",
      "common.region.substituted",
      "common.region.inserted",
      "common.region.deleted",
      "common.region.melody",
      "common.verdict.requested_fix_confirmed",
      "common.verdict.unrequested_ok",
      "common.verdict.unrequested_problem",
      "common.verdict.undecided",
      "common.carry.changed_here",
      "common.carry.no_change_detected",
      "common.mock.badge",
      "common.tech.summary",
      "common.settings.min_cluster_frames",
      "common.settings.match_score",
      "common.settings.mismatch_penalty",
      "common.settings.gap_penalty",
      "common.settings.merge_gap_frames",
      "common.settings.melody_threshold",
      "common.settings.reset",
      "common.settings.language",
      "common.error.codebook_mismatch",
      "common.error.generic",
      "common.state.loading",
      "common.state.empty",
      "common.footer.original_only",
      "common.author.label",
    ];
    for (const lang of LANGS) {
      for (const key of required) expect(STRINGS[lang][key], `${key} (${lang})`).toBeDefined();
    }
  });
});
