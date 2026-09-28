import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0087 — regression guard for Marcia's P11 rulings of 2026-09-27 (Ruth 4:1–8), all nine
 * given with «(a), sim, pode seguir com as recomendações».
 *
 * The Internalize app's voice reads the Meaning Map prose (frontmatter stripped; since SC-0087
 * R-9 D only the code inside [[ ]] is shown) and its Validator reads the Meaning Coordinates'
 * significant absences plus every do_not_decide note of the COMPILATION-LOG. The rulings removed
 * wording that decides what the text leaves open: strategy words for Boaz's order (the field,
 * then Ruth), "friend" before So-and-so and any reason for the non-name, a reason or verdict on
 * the refusal, "chance"/"coincidence" at 4:1 and its 2:3 "twin", the handing of the sandal, the
 * women and the blessing waiting offstage, the redeemer "queue", every pointer ahead to 4:9–22,
 * and the Jonah aside. This guard makes that wording impossible to reintroduce silently into
 * what the app reads (fix-hierarchy tier: gate). A future governed change that re-rules P11
 * edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P11-Ruth-4-1-8.md";
const MC = "fixtures/meaning-coordinates/P11-Ruth-4-1-8-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P11-Ruth-4-1-8-COMPILATION-LOG.md";

const rawMap = read(MAP);
// What the voice reads: the prose without frontmatter, each [[CODE-Slug]] shown as its code.
const voiceText = rawMap
  .replace(/^---\n[\s\S]*?\n---\n/, "")
  .replace(/\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_m, target: string) => target.split("-")[0]!);
const mc = jsonBlock(read(MC));
const cl = jsonBlock(read(CL));

// The Coordinates' prose (strings with a space); codes such as CHANCE_PROVIDENCE_ARRIVAL or the
// proposition IDs P12/P13 are not prose and stay out of this check (the spec leaves them).
const mcProse: string[] = [];
const walk = (o: unknown): void => {
  if (typeof o === "string") { if (/\s/.test(o)) mcProse.push(o); }
  else if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === "object") Object.values(o as Record<string, unknown>).forEach(walk);
};
walk(mc);
const mcProseText = mcProse.join("\n");

// Phrases the rulings removed from what the voice and the Validator read (case-insensitive).
const BANNED_IN_MAP_AND_MC = [
  // R-1 the order of the telling
  "held card", "staged", "staging", "springs", "draws the", "frees boaz", "whose own claim waits",
  // R-2 the man without a name
  "friend", "would not preserve", "keeps his own name", "leaves the book", "spoken to his face",
  "names everyone", "names with care",
  // R-3 the refusal
  "will not carry",
  // R-4 chance at the gate
  "chance", "coincidence", "twin", "as flatly",
  // R-5 the sandal
  "handed over", "shared law", "levirate", "deuteronomy",
  // R-6 the gate silences
  "asks ruth", "asks naomi", "bloodless", "irony", "blessing waits", "blessing lands", "whose future",
  // R-7 the P09 rulings: whisper, queue, 3:11, forward pointers, Jonah
  "whisper", "queue", "named at 3:11", "named ahead", "leaves hanging", "next scene", "one scene",
  "named at last", "attestation scene", "arc runs", "p12", "p13", "4:9", "4:10", "4:11", "4:12",
  "jonah", "nineveh",
  // R-8 minor text
  "word from the night before", "the morning naomi promised", "three sittings",
];

// The do_not_decide notes may name what must not be said ("no 'by chance', no 'coincidence'",
// "'friend' is not in the Hebrew", "the levirate law, the ceremony of Deuteronomy 25"), so their
// list is narrower.
const BANNED_IN_RULE_NOTES = [
  "held card", "staged", "springs", "frees boaz", "keeps his own name", "leaves the book",
  "spoken to his face", "names everyone", "will not carry", "twin", "bloodless", "irony",
  "asks ruth", "queue", "whisper", "next scene", "jonah", "nineveh",
];

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

describe("SC-0087 — P11 rulings guard (what the app reads)", () => {
  it("the P11 map, as the voice reads it, carries none of the removed wording", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
  });

  it("the P11 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(8);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
  });

  it("the P11 do_not_decide notes carry none of the removed wording", () => {
    const notes = (cl.high_risk_register_audit as { do_not_decide?: boolean; note: string }[])
      .filter((e) => e.do_not_decide)
      .map((e) => e.note)
      .join("\n");
    expect(lowHits(notes, BANNED_IN_RULE_NOTES)).toEqual([]);
  });

  it("R-9 E: the register has R1–R14, do_not_decide exactly on R1–R7 and R10, every entry traced", () => {
    const audit = cl.high_risk_register_audit as {
      id: string; kind: string; do_not_decide?: boolean; required_in_audit?: boolean; source_in_meaning_map?: string;
    }[];
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 14 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R10"]);
    expect(audit.filter((e) => e.required_in_audit !== true).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => !(e.source_in_meaning_map ?? "").trim()).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW")).toEqual([]);
  });

  it("R-9 E: the three gate signals agree (real audit, both checklist flags, sta-status complete)", () => {
    expect(cl.validation_checklist.high_risk_register_complete).toBe(true);
    expect(cl.validation_checklist.every_high_risk_entry_traces_to_meaning_map).toBe(true);
    expect(rawMap).toMatch(/^sta-status: "complete"$/m);
  });

  it("the Coordinates' four scene purposes and absences are the map's 3F and Significant Absence texts", () => {
    for (const s of mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[]) {
      expect(rawMap, `${s.scene_id} purpose`).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
      expect(rawMap, `${s.scene_id} absence`).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    }
  });

  it("R-1 to R-6: the ruled facts are in the map", () => {
    for (const fact of [
      "The narrator does not say why Boaz speaks in this order.", // R-1
      "The narrator does not give his name; Boaz calls him So-and-so.", // R-2
      "Why it would ruin the man's inheritance is never explained; he says only \"I cannot\", twice.", // R-3
      "the narrator does not say why he passes at that moment", // R-4
      "- Function in scene: the sign that confirmed the matter (4:7); by the custom the narrator has just told, a man gave his sandal to the other\n", // R-5 (point A)
      "Ruth and Naomi are not at the gate; neither of them speaks.", // R-6
      "At the gate no one speaks of the night at the threshing floor.", // R-6 (new)
      "In the whole proceeding no one says the name of God.", // R-6
      "the gate is where the matter is done before everyone", // R-7 (1)
      "there is no one besides you to redeem, and I am after you", // R-7 (2)
      "the place where the matter is settled before witnesses", // R-7 (3)
      "Naomi's word from that morning", // R-8 (1)
    ]) {
      expect(rawMap, fact).toContain(fact);
    }
    expect(rawMap).toContain("So-and-so");
  });

  it("point A (Marcia 2026-09-28): the Scene 4 silence without the handing, R2/R5 accept without remark, B19 'the nearer redeemer'", () => {
    // (1) The handing is not a silence: the custom the narrator tells at 4:7 says the sandal was
    // given, so the fact now lives in O26's Function line and the Scene 4 absence no longer says it.
    const s4Absence = "No words of parting are given to the nearer redeemer. The terms now Boaz's — the field, the widow, the name — are not restated. In the whole proceeding no one says the name of God.";
    expect(rawMap).toContain(`**Significant Absence**\n${s4Absence}\n`);
    const s4 = mc.level_2_scenes.find((s: { scene_id: string }) => s.scene_id === "S4");
    expect(s4.significant_absence).toBe(s4Absence);
    for (const gone of ["The narrator tells only that he drew off his sandal", "the custom he has just explained says the sandal was given to the other"]) {
      expect(rawMap, gone).not.toContain(gone);
      expect(mcProseText, gone).not.toContain(gone);
    }
    // (2) The voice accepts a non-name for So-and-so and "and gave it to Boaz" without remark.
    const note = (id: string) => (cl.high_risk_register_audit as { id: string; note: string }[]).find((e) => e.id === id)!.note;
    expect(note("R2")).toMatch(/If asked, the story gives no name and does not say why\. The voice accepts such a rendering and does not correct or remark on it\.$/);
    expect(note("R5")).toContain("A team telling 'and gave it to Boaz' is correct, not an addition. The voice accepts it and does not correct or remark on it. Voice and team");
    expect(note("R5")).toContain("The voice tells as the text and does not itself add the handing"); // ruling 5 stands
    // (3) B19 is "the nearer redeemer" in every Relationship line; "kinsman" is not his word here.
    expect(rawMap.toLowerCase()).not.toContain("nearer kinsman");
    for (const rel of ["- Relationship: the nearer redeemer\n", "- Relationship: the nearer redeemer, now declining\n", "- Relationship: the nearer redeemer, withdrawing by the old form\n"]) {
      expect(rawMap, rel).toContain(rel);
    }
  });

  it("R-4: FIG_0015 is not flagged at 4:1 — the 2:3 pair lives in the canon record only", () => {
    expect(rawMap).not.toContain("FIG_0015");
    const flagged = (mc.level_3_propositions as { prop_id: string; figure_flags: string[] }[])
      .filter((p) => p.figure_flags.includes("FIG_0015"))
      .map((p) => p.prop_id);
    expect(flagged).toEqual([]);
    const row = cl.cross_pericope_pair_verification.pairs.find((r: { fig_id: string }) => r.fig_id === "FIG_0015");
    expect(row.closes_at).toContain("canon-record link only");
    // P05 R5 and the P05 pair row no longer say 4:1 repeats the words of 2:3; P05 R4 is unchanged.
    const p05cl = read("fixtures/compilation-log/P05-Ruth-2-1-7-COMPILATION-LOG.md");
    expect(p05cl).not.toContain("recurs at P11 4:1");
    expect(p05cl).not.toContain("parallel vayyiqer construction");
    const p05map = read("fixtures/meaning-map/P05-Ruth-2-1-7.md");
    expect(p05map).not.toContain("comes back at the town gate");
    expect(p05map).not.toContain("parallel chance-providence construction");
  });

  it("R-9 B(i): B2 Elimelech is not among the Coordinates' Scene 1 beings", () => {
    const s1 = mc.level_2_scenes.find((s: { scene_id: string }) => s.scene_id === "S1");
    expect(s1.beings_in_scene.entries.map((e: { being_id: string }) => e.being_id)).not.toContain("B2");
  });

  it("R-9 A: the carried rules are in the register", () => {
    const note = (id: string) => (cl.high_risk_register_audit as { id: string; note: string }[]).find((e) => e.id === id)!.note;
    expect(note("R7")).toContain("Never say or suggest which of Naomi's sons was Ruth's husband");
    expect(note("R8")).toContain("Keep 'the Moabite' in the line.");
    expect(note("R9")).toContain("never 'kinsman' or 'relative'");
    expect(note("R10")).toContain("never say that Boaz married Ruth or will marry her in this passage");
    expect(note("R11")).toContain("2:20 is not brought into 4:5");
  });

  it("R-5 + R-9 C: the new slugs are in the registry and the maps; the old slugs are in no live fixture or registry file", () => {
    const concepts = JSON.parse(read("_spec/registry/concepts.json"));
    const figures = JSON.parse(read("_spec/registry/figures.json"));
    const byCode = (reg: { entries?: Record<string, { name_slug: string }> } & Record<string, unknown>, code: string) => {
      const table = (reg.entries ?? reg) as Record<string, { name_slug?: string }>;
      return table[code]?.name_slug;
    };
    expect(byCode(concepts, "CB_0002")).toBe("Widow-Acquired-to-Raise-Up-the-Name-of-the-Dead");
    expect(byCode(figures, "FIG_0122")).toBe("He-Will-Tell-You");
    expect(rawMap).toContain("[[CB_0002-Widow-Acquired-to-Raise-Up-the-Name-of-the-Dead]]");
    expect(read("fixtures/meaning-map/P12-Ruth-4-9-12.md")).toContain("[[CB_0002-Widow-Acquired-to-Raise-Up-the-Name-of-the-Dead]]");
    expect(read("fixtures/meaning-map/P08-Ruth-3-1-5.md")).toContain("[[FIG_0122-He-Will-Tell-You]]");
    const files: string[] = [];
    const collect = (dir: string): void => {
      for (const name of readdirSync(join(root, dir))) {
        const rel = join(dir, name);
        if (statSync(join(root, rel)).isDirectory()) collect(rel);
        else if (/\.(md|json)$/.test(name)) files.push(rel);
      }
    };
    collect("fixtures");
    collect("_spec");
    const stale = files.filter((f) => /Levirate-Style-Obligation|He-Will-Tell-You-Handoff/.test(read(f)));
    expect(stale).toEqual([]);
  });

  it("R-9 C: P10 Scene 1 is CONSULTATIVE, Scene 2 stays INTIMATE, and the P10 map points nowhere ahead", () => {
    const p10mc = jsonBlock(read("fixtures/meaning-coordinates/P10-Ruth-3-14-18-MEANING-COORDINATES.md"));
    const sl = p10mc.pericope_classification.register_overrides.scene_level as { scene_id: string; override_value: string }[];
    expect(sl.map((s) => `${s.scene_id}:${s.override_value}`)).toEqual(["S1:CONSULTATIVE", "S2:INTIMATE"]);
    const p10map = read("fixtures/meaning-map/P10-Ruth-3-14-18.md");
    expect(p10map).toContain("Scene 1 shifts to CONSULTATIVE at scene level");
    expect(p10map).toContain("keep the secret Boaz asked for (3:14)");
    expect(p10map).toContain("- What it is: the place of his feet\n");
    // Whole words: "negated" (the 1:21 lament-word) is not a pointer to the gate.
    const p10prose = p10map.replace(/^---\n[\s\S]*?\n---\n/, "");
    const p10hits = [/\bgate\b/i, /\bhush/i, /\bsleeper/i, /\bP11\b/, /\b4:1\b/].filter((re) => re.test(p10prose)).map(String);
    expect(p10hits).toEqual([]);
  });

  it("R-9 A + C: the P06, P07 and P08 lines the rulings touched", () => {
    const p06 = jsonBlock(read("fixtures/compilation-log/P06-Ruth-2-8-16-COMPILATION-LOG.md"));
    const p06r1 = p06.high_risk_register_audit.find((e: { id: string }) => e.id === "R1").note as string;
    expect(p06r1).toContain("so the same word, wing, is heard in both places (a verbal echo)");
    expect(p06r1).not.toContain("lands as an answer");
    const p07 = jsonBlock(read("fixtures/compilation-log/P07-Ruth-2-17-23-COMPILATION-LOG.md"));
    const p07r4 = p07.high_risk_register_audit.find((e: { id: string }) => e.id === "R4").note as string;
    expect(p07r4).toContain("4:5 says only 'the dead'");
    expect(p07r4).not.toContain("pairs forward to P11 4:5");
    const p08map = read("fixtures/meaning-map/P08-Ruth-3-1-5.md");
    expect(p08map).not.toContain("the reverse lands at P09");
    expect(p08map).not.toContain("Handoff");
  });
});
