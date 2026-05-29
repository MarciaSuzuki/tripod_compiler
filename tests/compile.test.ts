import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { readMeaningMap } from "../src/reader/meaning-map.js";
import { compileSkeleton, TODO, isTodo } from "../src/compiler/skeleton.js";
import { traceCheck } from "../src/compiler/trace.js";
import { goldDiff } from "../src/compiler/golddiff.js";
import { compileCompilationLog } from "../src/compiler/complog.js";
import { validateArtifact } from "../src/engine/validate.js";
import { readArtifactNote } from "../src/reader/obsidian.js";

const here = dirname(fileURLToPath(import.meta.url));
const MM = (n: string) => join(here, "..", "fixtures", "meaning-map", n);
const FM = (n: string) => join(here, "..", "fixtures", "for-model", n);
const gold = (n: string): any => readArtifactNote(FM(n)).json;

describe("Slice 2 — MeaningMap → FOR_MODEL skeleton (P01)", () => {
  const { skeleton, gaps } = compileSkeleton(readMeaningMap(MM("P01-Ruth-1-1-5.md")));
  const g = gold("P01-Ruth-1-1-5-FOR-MODEL.md");
  const sk = skeleton as any;

  it("derives sta_id + header + classification deterministically", () => {
    expect(sk.sta_id).toBe("ruth_pericope_01_v2_0");
    expect(sk.tagset_version).toBe("TRIPOD_STA_v2_0");
    expect(sk.header.bcv).toBe("Ruth 1:1-5");
    expect(sk.pericope_classification.genre_group).toBe("NARRATIVE");
    expect(sk.pericope_classification.genre).toBe("HISTORICAL_NARRATIVE");
    expect(sk.pericope_classification.register).toBe("INFORMAL_CASUAL");
  });

  it("scene IDs + verse-ranges match the gold FOR_MODEL", () => {
    expect(sk.level_2_scenes.map((s: any) => s.scene_id)).toEqual(g.level_2_scenes.map((s: any) => s.scene_id));
    expect(sk.level_2_scenes.map((s: any) => s.verse_range)).toEqual(g.level_2_scenes.map((s: any) => s.verse_range));
  });

  it("per-scene beings are a faithful subset of the gold (matching presence; MM may under-list prose-only REFERENCED beings)", () => {
    sk.level_2_scenes.forEach((s: any, i: number) => {
      const got = s.beings_in_scene.entries.map((e: any) => `${e.being_id}:${e.presence}`);
      const want = new Set(g.level_2_scenes[i].beings_in_scene.entries.map((e: any) => `${e.being_id}:${e.presence}`));
      for (const b of got) expect(want.has(b), `scene ${i}: ${b} not in gold`).toBe(true);
    });
  });

  it("flags beings named only in scene prose (S4 should flag B2/B8/B9 that the gold adds as REFERENCED)", () => {
    const s4 = gaps.find((x) => x.location === "/level_2_scenes/3/beings_in_scene" && x.field === "beings_in_scene");
    expect(s4, "expected a prose-only beings gap on S4").toBeTruthy();
    for (const code of ["B2", "B8", "B9"]) expect(s4!.hint).toContain(code);
    // and the gold indeed carries them as REFERENCED
    const goldS4 = g.level_2_scenes[3].beings_in_scene.entries.map((e: any) => e.being_id);
    for (const code of ["B2", "B8", "B9"]) expect(goldS4).toContain(code);
  });

  it("lifts significant_absence (non-TODO) on every scene", () => {
    for (const s of sk.level_2_scenes) expect(isTodo(s.significant_absence)).toBe(false);
  });

  it("carries the Section-5 concept/figure flags", () => {
    const flags = sk.level_3_propositions.flatMap((p: any) => [...p.cb_flags, ...p.figure_flags]);
    expect(flags).toContain("CB_0029");
    expect(flags).toContain("FIG_0052");
  });

  it("leaves controlled-vocabulary tokens as judgment gaps (never invents them)", () => {
    const fields = new Set(gaps.map((x) => x.field));
    for (const f of ["scene_kind", "proposition_kind", "role_in_scene", "event_specific_slots", "referential_form"]) {
      expect(fields.has(f), `expected a gap for ${f}`).toBe(true);
    }
    // controlled tokens are span-carrying placeholders, not guesses
    expect(isTodo(sk.level_2_scenes[0].scene_kind)).toBe(true);
    expect(isTodo(sk.level_3_propositions[0].proposition_kind)).toBe(true);
    // the placeholder carries its source-prose span (item 2)
    expect(String(sk.level_2_scenes[0].scene_kind)).toContain("Famine and exile to Moab");
    expect(String(TODO)).toBe("__TODO__");
  });

  it("reports every __TODO__ placeholder as a gap (no silent placeholder)", () => {
    const todos: string[] = [];
    const walk = (v: any, path: string) => {
      if (isTodo(v)) todos.push(path);
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}/${i}`));
      else if (v && typeof v === "object") for (const [k, val] of Object.entries(v)) walk(val, `${path}/${k}`);
    };
    walk(skeleton, "");
    expect(todos.length).toBeGreaterThan(0);
    const gapLocs = new Set(gaps.map((x) => x.location));
    for (const loc of todos) {
      const covered = [...gapLocs].some((gl) => loc === gl || loc.startsWith(gl + "/"));
      expect(covered, `no gap reported for TODO at ${loc}`).toBe(true);
    }
  });
});

describe("Slice 2 — extract-only trace (item 4)", () => {
  const ALL = ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7", "P06-Ruth-2-8-16"];
  it("every emitted token traces to an MM span — no invented values (P01–P06)", () => {
    for (const n of ALL) {
      const mm = readMeaningMap(MM(`${n}.md`));
      const { skeleton } = compileSkeleton(mm);
      const r = traceCheck(mm, skeleton);
      expect(r.violations, `${n}: ${JSON.stringify(r.violations, null, 2)}`).toEqual([]);
      expect(r.traced).toBeGreaterThan(0);
    }
  });
  it("flags an invented entity code as a trace violation", () => {
    const mm = readMeaningMap(MM("P01-Ruth-1-1-5.md"));
    const { skeleton } = compileSkeleton(mm);
    (skeleton as any).level_2_scenes[0].beings_in_scene.entries[0].being_id = "B999";
    expect(traceCheck(mm, skeleton).violations.some((v) => v.value === "B999")).toBe(true);
  });
});

describe("Slice 2 — chapter derivation (P05, Ruth 2)", () => {
  it("derives chapter-2 verse-ranges that match the gold", () => {
    const { skeleton } = compileSkeleton(readMeaningMap(MM("P05-Ruth-2-1-7.md")));
    const g = gold("P05-Ruth-2-1-7-FOR-MODEL.md");
    const ranges = (skeleton as any).level_2_scenes.map((s: any) => s.verse_range);
    expect(ranges.every((r: string) => r.startsWith("2:"))).toBe(true);
    expect(ranges).toEqual(g.level_2_scenes.map((s: any) => s.verse_range));
  });
});

describe("Slice 2 — compiles all six meaning maps without error", () => {
  for (const n of ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7", "P06-Ruth-2-8-16"]) {
    it(`${n} → skeleton with scenes + propositions`, () => {
      const { skeleton, stats } = compileSkeleton(readMeaningMap(MM(`${n}.md`)));
      expect(stats.scenes).toBeGreaterThan(0);
      expect(stats.propositions).toBeGreaterThan(0);
      expect((skeleton as any).sta_id).toMatch(/^ruth_pericope_\d{2}_v2_0$/);
    });
  }
});

describe("Slice 2 — gold diff (item 1) matches the committed regression baseline", () => {
  const PIDS = ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7", "P06-Ruth-2-8-16"];
  const baseline = JSON.parse(readFileSync(join(here, "..", "fixtures", "gold-diff-baseline.json"), "utf8"));
  const current = PIDS.map((n) => goldDiff(readMeaningMap(MM(`${n}.md`)), compileSkeleton(readMeaningMap(MM(`${n}.md`))).skeleton, gold(`${n}-FOR-MODEL.md`)));

  it("recomputed gold diff equals the baseline (extractor + gold unchanged)", () => {
    expect(current).toEqual(baseline);
  });
  it("gold agreement on the comparable deterministic layer is high (>=90%) and P01/P03 are exact", () => {
    for (const d of current) expect(d.agreementPct, `${d.pericope} agreement`).toBeGreaterThanOrEqual(90);
    expect(current.find((d: any) => d.pericope === "P01")!.agreementPct).toBe(100);
  });
});

describe("Slice 2 — gap report emits as a schema-valid COMPILATION-LOG (item 3)", () => {
  const tmp = mkdtempSync(join(tmpdir(), "tripod-clog-"));
  const mm = readMeaningMap(MM("P01-Ruth-1-1-5.md"));
  const result = compileSkeleton(mm);
  const log = compileCompilationLog(mm, result);

  it("validates block-clean via Slice 1 (compilation-log schema)", () => {
    const note = `---\ntype: "compilation-log"\npericope: "P01"\n---\n\n# P01 COMPILATION-LOG (skeleton)\n\n\`\`\`json\n${JSON.stringify(log, null, 2)}\n\`\`\`\n`;
    const f = join(tmp, "P01-Ruth-1-1-5-COMPILATION-LOG.md");
    writeFileSync(f, note);
    const r = validateArtifact(f);
    expect(r.artifact).toBe("COMPILATION-LOG");
    expect(r.counts.block, JSON.stringify(r.findings.filter((x) => x.severity === "block"), null, 2)).toBe(0);
    expect(r.ok).toBe(true);
  });
  it("carries the gaps in known_limitations and attests extract-only", () => {
    expect((log as any).known_limitations.join(" ")).toContain("judgment gaps");
    expect((log as any).validation_checklist.no_content_added_beyond_meaning_map).toBe(true);
    expect((log as any).vocabulary_additions.proposition_kinds).toEqual([]); // skeleton proposes no vocab
  });
});
