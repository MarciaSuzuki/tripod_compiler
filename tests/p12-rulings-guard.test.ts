import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0088 — regression guard for P12 (Ruth 4:9–12) under Marcia's map standard of 2026-09-28
 * («(a), sim, pode seguir com as recomendações», item 16 included) and her four SC-0088 rulings of
 * 2026-09-28 («(b), (b), (a), sim — pode seguir com as recomendações»).
 *
 * The Internalize app's voice reads the Meaning Map prose (frontmatter stripped; only the code inside
 * [[ ]] is shown, SC-0087 R-9 D) and its Validator reads the Meaning Coordinates' significant absences
 * plus every do_not_decide note of the COMPILATION-LOG. The standard took out of P12 what the text does
 * not say: the pointers ahead (the seed "yet to be born", the genealogy, David), Genesis and the levirate
 * law, "matriarchs"/"outsider-brides"/"precedent", the narrator's intent ("withheld", "careful
 * namelessness"), Boaz's purpose told as done ("secured", "alive"), "turns to", "at once", the seal image
 * and the verdict on the gate's work. Ruling D2 (b): in 4:9–12 the map says only "Neither Ruth nor Naomi
 * speaks." and the voice never says whether they are at the gate. Ruling D3 (a): "do worthily" keeps the
 * worth-word chayil (CB_0032). Ruling D4 ("sim"): the P01/P02/P06 notes say the Mahlon–Ruth pairing is said
 * at 4:10 and the text never says whose wife Orpah was; the stale "P13" labels for 4:10 read P12. This
 * guard makes that wording impossible to reintroduce silently (fix-hierarchy tier: gate). A future
 * governed change that re-rules P12 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P12-Ruth-4-9-12.md";
const MC = "fixtures/meaning-coordinates/P12-Ruth-4-9-12-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P12-Ruth-4-9-12-COMPILATION-LOG.md";

const rawMap = read(MAP);
// What the voice reads: the prose without frontmatter, each [[CODE-Slug]] shown as its code.
const voiceText = rawMap
  .replace(/^---\n[\s\S]*?\n---\n/, "")
  .replace(/\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_m, target: string) => target.split("-")[0]!);
const mc = jsonBlock(read(MC));
const cl = jsonBlock(read(CL));

// The Coordinates' prose (strings with a space); codes are not prose.
const mcProse: string[] = [];
const walk = (o: unknown): void => {
  if (typeof o === "string") { if (/\s/.test(o)) mcProse.push(o); }
  else if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === "object") Object.values(o as Record<string, unknown>).forEach(walk);
};
walk(mc);
const mcProseText = mcProse.join("\n");

type Entry = { id: string; kind: string; note: string; do_not_decide?: boolean; required_in_audit?: boolean; source_in_meaning_map?: string; carries_forward_to?: string };
const audit = cl.high_risk_register_audit as Entry[];
const note = (id: string) => audit.find((e) => e.id === id)!.note;
const dndNotes = audit.filter((e) => e.do_not_decide).map((e) => e.note).join("\n");

// Wording the standard removed from what the voice and the Validator read (case-insensitive).
const BANNED_IN_MAP_AND_MC = [
  // pointers ahead (item 6): the child, the genealogy, David, the later passages
  "david", "obed", "jesse", "genealog", "yet to be born", "runs to", "p13", "p14", "4:13", "4:17", "4:18",
  // other books and readings (items 3, 5, 8)
  "levirat", "deuteronomy", "matriarch", "outsider", "precedent", "bride", "fruitful", "prayer",
  "withh", "namelessness", "deliberate", "named openly", "at last", "finally",
  "secured", "alive", "erased", "toward a future", "waits for", "over them", "over her", "not asked",
  "turns to", "at once", "the gate scene", "sandal sealed", "seal", "careful",
  // D2: only "Neither Ruth nor Naomi speaks." for 4:9–12
  "not at the gate", "absent", "not present",
  // carried rulings (P09, P11): no field at 4:9–10, no whisper, no queue, redeemer never kinsman, no friend, no chance
  "field", "whisper", "queue", "kinsman", "friend", "chance",
];
// The do_not_decide notes may name what must not be said ("the levirate law, Deuteronomy 25",
// "do not tell that the name of the dead is now kept or secured", "no prayer"), so their list is narrower.
const BANNED_IN_RULE_NOTES = [
  "david", "obed", "jesse", "genealog", "matriarch", "outsider", "precedent", "withh", "namelessness",
  "careful", "seal", "not at the gate", "absent", "whisper", "queue", "kinsman", "friend", "chance",
];

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

describe("SC-0088 — P12 rulings guard (what the app reads)", () => {
  it("the P12 map, as the voice reads it, carries none of the removed wording (and never 'king')", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(voiceText).not.toMatch(/\bking\b/i);
  });

  it("the P12 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(4);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(mcProseText).not.toMatch(/\bking\b/i);
  });

  it("the P12 do_not_decide notes carry none of the removed wording", () => {
    expect(lowHits(dndNotes, BANNED_IN_RULE_NOTES)).toEqual([]);
    expect(dndNotes).not.toMatch(/\bking\b/i);
  });

  it("the register has R1–R12, do_not_decide exactly on R2, R3, R5, R6, every entry traced to the map", () => {
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 12 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R2", "R3", "R5", "R6"]);
    expect(audit.filter((e) => e.required_in_audit !== true).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => !(e.source_in_meaning_map ?? "").trim()).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW")).toEqual([]);
    // Every single-quoted map fragment the register cites is verbatim in the map.
    const missing: string[] = [];
    for (const e of audit) {
      for (const m of (e.source_in_meaning_map ?? "").matchAll(/(?:\(|; |, | )'(.{8,}?)'(?=[;),])/g)) {
        if (!rawMap.includes(m[1]!)) missing.push(`${e.id}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("the three gate signals agree (real audit, both checklist flags, sta-status complete)", () => {
    expect(cl.validation_checklist.high_risk_register_complete).toBe(true);
    expect(cl.validation_checklist.every_high_risk_entry_traces_to_meaning_map).toBe(true);
    expect(rawMap).toMatch(/^sta-status: "complete"$/m);
  });

  it("the Coordinates' two scene purposes and absences are the map's 3F and Significant Absence texts", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[];
    expect(scenes.map((s) => s.scene_id)).toEqual(["S1", "S2"]);
    for (const s of scenes) {
      expect(rawMap, `${s.scene_id} purpose`).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
      expect(rawMap, `${s.scene_id} absence`).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    }
  });

  it("D2 (b): in 4:9–12 only 'Neither Ruth nor Naomi speaks.'; the voice never says whether they are at the gate", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; significant_absence: string }[];
    expect(scenes.find((s) => s.scene_id === "S1")!.significant_absence).toBe(
      "Neither Ruth nor Naomi speaks. At the gate no one speaks of the night at the threshing floor. No one says the name of God in Boaz's declaration.",
    );
    expect(scenes.find((s) => s.scene_id === "S2")!.significant_absence).toMatch(/^Neither Ruth nor Naomi speaks\. /);
    expect(rawMap).toMatch(/### 2\.2 Context\n[^\n]*Neither Ruth nor Naomi speaks\.\n/);
    expect(audit.find((e) => e.id === "R3")!.do_not_decide).toBe(true);
    expect(note("R3")).toContain(
      "The voice never says whether Ruth or Naomi is at the gate in 4:9–12; if asked, the text does not say ('this young woman', 4:12, is not read as proof either way).",
    );
    // P11's sentence stays for 4:1–8 only (the P11 guard pins it there).
    expect(read("fixtures/meaning-map/P11-Ruth-4-1-8.md")).toContain("Ruth and Naomi are not at the gate; neither of them speaks.");
  });

  it("D3 (a): 'do worthily' keeps the worth-word — CB_0032 flagged at Proposition 9, the team rule in R9", () => {
    const props = mc.level_3_propositions as { prop_id: string; cb_flags: string[]; figure_flags: string[] }[];
    expect(props.filter((p) => p.cb_flags.includes("CB_0032")).map((p) => p.prop_id)).toEqual(["P9"]);
    expect(rawMap).toContain("- [[CB_0032-Chayil]] — active at Proposition 9 (the worth-word chayil, as in \"a man of worth\" (2:1) and \"a woman of worth\" (3:11))");
    const r9 = note("R9");
    expect(r9).toContain("the voice keeps the worth-word the same as at 2:1 and 3:11");
    expect(r9).toContain("In a team telling, worth, standing, strength, prosperity or means are correct; accept them without comment.");
    expect(r9).toContain("'Have (many) children' is offered back gently with the map's reading, as at 4:5 (P11 R13). The voice does not teach the variants.");
  });

  it("FIG_0003 closes here (Proposition 5); FIG_0014 has its middle station here and closes at P13", () => {
    const props = mc.level_3_propositions as { prop_id: string; figure_flags: string[] }[];
    expect(props.filter((p) => p.figure_flags.includes("FIG_0003")).map((p) => p.prop_id)).toEqual(["P5"]);
    expect(rawMap).toContain("- [[FIG_0003-Gate-as-Place-of-Remembered-Name]] — active at Proposition 5");
    const r4 = audit.find((e) => e.id === "R4")!;
    expect(r4.kind).not.toBe("CROSS_PERICOPE_PAIRING_CLOSED_HERE");
    expect(r4.carries_forward_to).toBe("P13_audit");
    const pairs = cl.cross_pericope_pair_verification.pairs as { fig_id: string; closes_at: string; verification_status: string }[];
    const row = (fig: string) => pairs.find((r) => r.fig_id === fig)!;
    expect(row("FIG_0014").closes_at).toMatch(/^P13 P4 /);
    expect(row("FIG_0003").verification_status).toBe("VERIFIED");
    expect(row("FIG_0001").verification_status).toBe("VERIFIED");
  });

  it("the standard's text points: §2.1 without the future, §2.3 without the seal or a verdict, the wish kept a wish", () => {
    const s21 = rawMap.match(/### 2\.1 [^\n]*\n([^\n]*)\n/)![1]!;
    expect(s21).not.toMatch(/seed is asked|born|David|Obed/);
    expect(s21).toContain("from the seed that YHWH will give you from this young woman");
    const s23 = rawMap.match(/### 2\.3 [^\n]*\n([^\n]*)\n/)![1]!;
    expect(s23).toContain("\"you are witnesses\" opening and closing it.");
    expect(s23).toMatch(/to the broad, generous swing of the blessing\.$/);
    expect(rawMap).toContain("After the sandal is drawn off (4:8), Boaz speaks to the elders and all the people.");
    expect(rawMap).toContain("At 4:5 Ruth was \"the wife of the dead\"; here she is \"the wife of Mahlon\".");
  });

  it("label fixes: Mahlon once in the MC Scene 1, CB_0009 not a Scene 2 object, B27's new slug everywhere", () => {
    const [s1, s2] = mc.level_2_scenes as { beings_in_scene: { entries: { being_id: string }[] }; objects_in_scene: { entries: { object_id: string }[] } }[];
    expect(s1!.beings_in_scene.entries.filter((e) => e.being_id === "B4")).toHaveLength(1);
    expect(s2!.objects_in_scene.entries.map((e) => e.object_id)).not.toContain("CB_0009");
    expect(rawMap).not.toMatch(/^\[\[CB_0009[^\]]*\]\] — /m); // no Section 3C entry; the flag stays
    expect(rawMap).toContain("[[CB_0009-Divine-Name]] — active at Propositions 8 and 11");
    expect(rawMap.split("[[B27-Perez-and-His-Descendants]]").length - 1).toBe(3);
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
    expect(files.filter((f) => read(f).includes("B27-Genealogy-Figures"))).toEqual([]);
  });

  it("registry labels (items 1 and 10): B24 'The Women', B27 'Perez and His Descendants', PL1 'Bethlehem'", () => {
    const reg = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    const ent = (reg.entities ?? reg.entries ?? reg) as Record<string, { english: string; referential_forms: string[] }>;
    expect(ent.B24!.english).toBe("The Women");
    expect(ent.B24!.referential_forms).toContain("Women of Bethlehem"); // the approved P04 links still bind
    expect(ent.B27!.english).toBe("Perez and His Descendants");
    expect(ent.PL1!.english).toBe("Bethlehem");
    expect(ent.PL1!.referential_forms).toContain("Bethlehem of Judah"); // the text's own form at 1:1–2
    expect(ent.B26!.english).toBe("Jesse and David"); // both names are in 4:17 and 4:22
  });

  it("D4 (sim): 4:10 says only Ruth's pairing; the text never says whose wife Orpah was; 4:10 is P12", () => {
    const fact = "The Mahlon–Ruth pairing is said at 4:10; the text never says whose wife Orpah was.";
    const p01 = jsonBlock(read("fixtures/compilation-log/P01-Ruth-1-1-5-COMPILATION-LOG.md"));
    const p02 = jsonBlock(read("fixtures/compilation-log/P02-Ruth-1-6-14-COMPILATION-LOG.md"));
    const p06 = jsonBlock(read("fixtures/compilation-log/P06-Ruth-2-8-16-COMPILATION-LOG.md"));
    const reg = (d: { high_risk_register_audit: Entry[] }, id: string) => d.high_risk_register_audit.find((e) => e.id === id)!;
    const dec = (d: { compilation_decisions: { decision_id: string; description: string }[] }, id: string) =>
      d.compilation_decisions.find((x) => x.decision_id === id)!.description;
    expect(reg(p01, "R10").do_not_decide).toBe(true);
    expect(reg(p01, "R10").note).toContain(fact);
    expect(dec(p01, "P01-D2")).toContain(fact);
    expect(reg(p02, "R5").note).toContain(fact);
    expect(dec(p02, "P02-D6")).toContain(fact);
    expect(dec(p06, "P06-D1")).toContain(fact);
    for (const f of ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P06-Ruth-2-8-16"]) {
      const t = read(`fixtures/compilation-log/${f}-COMPILATION-LOG.md`);
      for (const stale of ["Pairing is disclosed at 4:10", "Chilion-Orpah is disclosed", "Disclosure deferred to 4:10", "disclosure deferred to 4:10", "P13 audit at 4:10", "P13 compilation"]) {
        expect(t, `${f}: ${stale}`).not.toContain(stale);
      }
    }
    // Mahlon–Ruth at 4:10 is correct and stays (P06 R4).
    expect(reg(p06, "R4").note).toContain("The pairing Mahlon-Ruth is disclosed at 4:10.");
  });
});
