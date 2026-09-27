import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0086 — regression guard for Marcia's P09 rulings of 2026-09-26 (Ruth 3:6–13).
 *
 * The Internalize app's voice reads the Meaning Map prose (frontmatter stripped, wikilink slugs
 * included) and its Validator reads the Meaning Coordinates' significant absences plus every
 * do_not_decide note of the COMPILATION-LOG. The rulings removed wording that decides what the
 * text leaves open (a verdict on the night, a status reading of amah, "suitors", a redeemer
 * "queue" pointing ahead to the gate, "authority"/"handoff" framing, the P11 designation for
 * the nearer redeemer, the INTIMATE/CEREMONIAL register). This guard makes that wording
 * impossible to reintroduce silently into what the app reads (fix-hierarchy tier: gate).
 * A future governed change that re-rules P09 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const mapText = read("fixtures/meaning-map/P09-Ruth-3-6-13.md").replace(/^---\n[\s\S]*?\n---\n/, "");
const mcText = read("fixtures/meaning-coordinates/P09-Ruth-3-6-13-MEANING-COORDINATES.md");
const mc = jsonBlock(mcText);
const cl = jsonBlock(read("fixtures/compilation-log/P09-Ruth-3-6-13-COMPILATION-LOG.md"));

// Phrases the rulings removed from what the voice and the Validator read.
const BANNED_IN_MAP_AND_MC = [
  "nothing improper", "modesty", "while he sleeps", "asleep", "sleeper", "So-and-so",
  "suitor", "queue", "whisper", "hushed", "most private", "authority", "handoff", "overturn",
  "step up", "marriageable", "status-shift", "the very thing", "loyalty to the dead",
  "does not say yes to the marriage", "Gate-Legal-Venue", "legal scene", "gate scene",
  "INTIMATE", "CEREMONIAL",
];
// The do_not_decide notes may name what must not be said ("never call them suitors",
// "never say ... gained authority", "no whispering"), so their list is narrower.
const BANNED_IN_RULE_NOTES = [
  "nothing improper", "modesty", "So-and-so", "queue", "handoff", "overturn", "step up",
  "marriageable", "the very thing", "loyalty to the dead",
];

describe("SC-0086 — P09 rulings guard (what the app reads)", () => {
  it("the P09 map prose carries none of the removed wording", () => {
    const hits = BANNED_IN_MAP_AND_MC.filter((w) => mapText.toLowerCase().includes(w.toLowerCase()));
    expect(hits).toEqual([]);
  });

  it("the P09 Meaning Coordinates carry none of the removed wording or codes", () => {
    const hits = BANNED_IN_MAP_AND_MC.filter((w) => mcText.toLowerCase().includes(w.toLowerCase()));
    expect(hits).toEqual([]);
    expect(mcText).not.toContain('"B?"');
    expect(mcText).not.toContain('"PL7"');
    expect(mcText).not.toContain('"CB_0006"');
  });

  it("the P09 do_not_decide notes carry none of the removed wording", () => {
    const notes = (cl.high_risk_register_audit as { do_not_decide?: boolean; note: string }[])
      .filter((e) => e.do_not_decide)
      .map((e) => e.note)
      .join("\n")
      .toLowerCase();
    const hits = BANNED_IN_RULE_NOTES.filter((w) => notes.includes(w.toLowerCase()));
    expect(hits).toEqual([]);
  });

  it("ruling 1 + 2: the Scene 3 silence carries Marcia's wording, in the map and the Coordinates alike", () => {
    const s3 = mc.level_2_scenes.find((s: { scene_id: string }) => s.scene_id === "S3").significant_absence as string;
    expect(s3).toContain("The text gives no verdict on the night — neither that something happened nor that nothing did.");
    expect(s3).toContain("The text does not say which of the two will act, nor what Boaz feels or wants.");
    expect(mapText).toContain(s3);
    const s2 = mc.level_2_scenes.find((s: { scene_id: string }) => s.scene_id === "S2").significant_absence as string;
    expect(mapText).toContain(s2);
  });

  it("ruling 5: Scenes 2-3 are CONSULTATIVE with no moment-level override", () => {
    const ro = mc.pericope_classification.register_overrides;
    expect(ro.scene_level.map((s: { override_value: string }) => s.override_value)).toEqual(["CONSULTATIVE", "CONSULTATIVE"]);
    expect(ro.moment_level).toBeNull();
  });

  it("ruling 6: the young men of 3:10 are B32 (distinct from B17), in scene 3 and at P13", () => {
    const s3 = mc.level_2_scenes.find((s: { scene_id: string }) => s.scene_id === "S3");
    const b32 = s3.beings_in_scene.entries.find((e: { being_id: string }) => e.being_id === "B32");
    expect(b32?.role_in_scene).toBe("NOT_GONE_AFTER");
    const p13 = mc.level_3_propositions.find((p: { prop_id: string }) => p.prop_id === "P13");
    expect(p13.event_specific_slots.young_men).toBe("B32");
    const aliases = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    expect(aliases.entities.B32.hebrew_cons).toBe("בחורים");
    expect(aliases.entities.B17.hebrew_cons).toBe("נערים");
  });

  it("ruling 3 reaches the Validator: R2 (the change of servant word) is do_not_decide", () => {
    const r2 = (cl.high_risk_register_audit as { id: string; do_not_decide?: boolean; note: string }[]).find((e) => e.id === "R2")!;
    expect(r2.do_not_decide).toBe(true);
    expect(r2.note).toContain("the text does not say what it means");
  });

  it("ruling 6: POTENTIAL_SUITORS is used in no Meaning Coordinates of P09 or P10", () => {
    const p10mc = read("fixtures/meaning-coordinates/P10-Ruth-3-14-18-MEANING-COORDINATES.md");
    expect(mcText).not.toContain("POTENTIAL_SUITORS");
    expect(p10mc).not.toContain("POTENTIAL_SUITORS");
  });

  it("ruling 10a: the map links B19 by the form the Coordinates carry, and that form is registered", () => {
    expect(mapText).toContain("[[B19-NEARER_REDEEMER_UNNAMED]]");
    const forms = new Set<string>();
    const walk = (o: unknown): void => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object") {
        const r = o as Record<string, unknown>;
        if ((r.being_id === "B19" || r.disclosed_party === "B19") && typeof r.referential_form === "string") forms.add(r.referential_form);
        Object.values(r).forEach(walk);
      }
    };
    walk(mc);
    expect([...forms]).toEqual(["NEARER_REDEEMER_UNNAMED"]);
    const aliases = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    expect(aliases.entities.B19.referential_forms).toContain("NEARER_REDEEMER_UNNAMED");
  });

  // The rulings also changed lines outside P09 (P06 R2 + P06 map §5B; P10 map + MC; the P03/P04/P05
  // 3:13 forecast). Guard every surface a ruling touched, not only P09 (recurring-error discipline).
  it("rulings 3, 5 and 10b hold in the neighbouring passages they touched", () => {
    const low = (p: string) => read(p).toLowerCase();
    for (const p of ["fixtures/compilation-log/P06-Ruth-2-8-16-COMPILATION-LOG.md", "fixtures/meaning-map/P06-Ruth-2-8-16.md"]) {
      const t = low(p);
      expect(["status-shift", "positioning for marriage"].filter((w) => t.includes(w)), p).toEqual([]);
    }
    for (const p of ["fixtures/meaning-map/P10-Ruth-3-14-18.md", "fixtures/meaning-coordinates/P10-Ruth-3-14-18-MEANING-COORDINATES.md"]) {
      const t = low(p);
      expect(["hushed", "low instructions"].filter((w) => t.includes(w)), p).toEqual([]);
    }
    for (const p of [
      "fixtures/compilation-log/P03-Ruth-1-15-18-COMPILATION-LOG.md",
      "fixtures/compilation-log/P04-Ruth-1-19-22-COMPILATION-LOG.md",
      "fixtures/compilation-log/P05-Ruth-2-1-7-COMPILATION-LOG.md",
    ]) {
      const t = low(p);
      expect(["recur at 3:13", "recurs at 3:13 when", "with 3:13", "boaz's oath) deferred", "same oath-formula form at both"].filter((w) => t.includes(w)), p).toEqual([]);
    }
  });

  // Marcia, 2026-09-27 («sim, siga as recomendações»), OWED items 1 and 3 of SC-0086:
  // (A) B19's book-level name — the app labels B19's coverage element with the registry `english`,
  //     and P11's 4:1 designation (peloni almoni) reached the voice's ledger on P09 turns (and P11, where B19 is labelled);
  // (B) the P09 title — "the redeemer named" could be heard as naming the nearer redeemer.
  it("2026-09-27 (A): B19's book-level name is The Nearer Redeemer, and no So-and-so reaches P09/P10 canon", () => {
    const aliases = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    expect(aliases.entities.B19.english).toBe("The Nearer Redeemer");
    expect(aliases.entities.B19.english.toLowerCase()).not.toContain("so-and-so");
    for (const p of [
      "fixtures/meaning-map/P09-Ruth-3-6-13.md",
      "fixtures/meaning-coordinates/P09-Ruth-3-6-13-MEANING-COORDINATES.md",
      "fixtures/compilation-log/P09-Ruth-3-6-13-COMPILATION-LOG.md",
      "fixtures/meaning-map/P10-Ruth-3-14-18.md",
      "fixtures/meaning-coordinates/P10-Ruth-3-14-18-MEANING-COORDINATES.md",
      "fixtures/compilation-log/P10-Ruth-3-14-18-COMPILATION-LOG.md",
    ]) {
      expect(read(p).toLowerCase(), p).not.toContain("so-and-so");
    }
    // The canon slug follows the name (id-check: slug = slugify(english)); the old slug is gone.
    const p11 = read("fixtures/meaning-map/P11-Ruth-4-1-8.md");
    expect(p11).toContain("[[B19-The-Nearer-Redeemer]]");
    expect(p11).not.toContain("B19-The-Man-Mr");
    // P11's own words keep the passage's referential form (peloni almoni, "friend So-and-so").
    expect(p11).toContain("friend So-and-so");
    expect(aliases.entities.B19.referential_forms).toContain("PLONI_ALMONI_VOCATIVE_OF_ANONYMITY");
  });

  it("2026-09-27 (B): the P09 title is \"…the word redeemer spoken…\" in the map, the Coordinates and the log", () => {
    const TITLE = "The threshing-floor night: the wing asked for, the word redeemer spoken, the oath";
    const rawMap = read("fixtures/meaning-map/P09-Ruth-3-6-13.md");
    expect(rawMap).toContain(`pericope-title: "${TITLE}"`);
    expect(rawMap).toContain(`- **Pericope title:** ${TITLE}\n`);
    expect(mcText).toContain(`pericope-title: "${TITLE}"`);
    expect(mc.header.pericope_title).toBe(TITLE);
    expect(cl.pericope_title).toBe(TITLE);
    for (const t of [rawMap, mcText, read("fixtures/compilation-log/P09-Ruth-3-6-13-COMPILATION-LOG.md")]) {
      expect(t).not.toContain("the redeemer named");
    }
  });

  it("ruling 2: P19 keeps both conditions of the morning", () => {
    const p19 = mc.level_3_propositions.find((p: { prop_id: string }) => p.prop_id === "P19");
    const conds = p19.event_specific_slots.protocol_components.map((c: { condition: string }) => c.condition);
    expect(conds).toEqual(["IF_HE_REDEEMS", "IF_NOT_WILLING"]);
  });
});
