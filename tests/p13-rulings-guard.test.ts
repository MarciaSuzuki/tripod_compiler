import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0088 — regression guard for P13 (Ruth 4:13–17) under Marcia's map standard of 2026-09-28
 * («(a), sim, pode seguir com as recomendações», item 16 included) and her four SC-0088 rulings of
 * 2026-09-28 («(b), (b), (a), sim — pode seguir com as recomendações»).
 *
 * The voice reads the map prose (frontmatter stripped, [[CODE]] only); the Validator reads the
 * Coordinates' significant absences and the do_not_decide notes. The standard took out of P13 what the
 * text does not say: "king", "royal line", "kingdom", "covenant", "faithfulness", the "emptiness"
 * reversed, "reckoned", "grandmother", the "cradle", "the book's second direct act of God", the answer
 * and fulfilment links, "kinsman-redeemer", "suddenly vast", and every pointer ahead to 4:18–22; a place
 * (Naomi's dwelling) and a concept (the redeemer at 4:13) the text does not have; the child listed twice
 * in Scene 3. Ruling D1 (b): a team's "King David" is a nuance, named once — «a história dá só o nome
 * dele, Davi» — without a send-back, the same rule and words as P14 R4. Ruling D2 (b): "not at the gate"
 * only for 4:1–8; in 4:9–12 neither Ruth nor Naomi speaks, and the voice never says whether they were at
 * the gate. A future governed change that re-rules P13 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P13-Ruth-4-13-17.md";
const MC = "fixtures/meaning-coordinates/P13-Ruth-4-13-17-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P13-Ruth-4-13-17-COMPILATION-LOG.md";

const rawMap = read(MAP);
const voiceText = rawMap
  .replace(/^---\n[\s\S]*?\n---\n/, "")
  .replace(/\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_m, target: string) => target.split("-")[0]!);
const mc = jsonBlock(read(MC));
const cl = jsonBlock(read(CL));

const mcProse: string[] = [];
const walk = (o: unknown): void => {
  if (typeof o === "string") { if (/\s/.test(o)) mcProse.push(o); }
  else if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === "object") Object.values(o as Record<string, unknown>).forEach(walk);
};
walk(mc);
const mcProseText = mcProse.join("\n");

type Entry = { id: string; kind: string; applies_to: string; note: string; do_not_decide?: boolean; required_in_audit?: boolean; source_in_meaning_map?: string };
const audit = cl.high_risk_register_audit as Entry[];
const note = (id: string) => audit.find((e) => e.id === id)!.note;
const dndNotes = audit.filter((e) => e.do_not_decide).map((e) => e.note).join("\n");

// The one D1 rule, word for word the same in P13 R8 and P14 R4.
const D1_NEVER = "For the voice only, never to be said: do not call David king, say who he is or will be, or bring in anything from other books; if asked, the text gives only his name.";
const D1_NUANCE = "A team telling 'King David' ('o rei Davi') is a nuance: the voice names it once — 'a história dá só o nome dele, Davi' ('the story gives only his name, David') — without a send-back, and moves on.";

const BANNED_IN_MAP_AND_MC = [
  // other books and readings (items 3, 5): kingship, covenant, the reversal
  "royal", "kingdom", "covenant", "faithful", "emptiness", "fullness", "reversal", "reckon", "grandmother",
  "claimed", "adopt", "counterpart", "prologue", "inclusio", "horizon", "vast", "lifting", "then full",
  "the gift", "second", "heir to", "genealog", "matriarch", "outsider", "foreign", "precedent", "levirat",
  "deuterono", "providen", "chance", "planned", "strateg",
  // images the text does not give (item 8)
  "cradle",
  // no answer, no fulfilment (item 6); no pointers ahead
  "answer", "fulfil", "lands on", "at last", "finally", "withh", "next scene", "p14", "4:18", "perez",
  // carried rulings: redeemer never kinsman; no queue, whisper, friend; 'the women' at 4:14 (not 'of Bethlehem')
  "kinsman", "queue", "whisper", "friend", "of bethlehem", "naomi's dwelling",
  // D2: 'not at the gate' only for 4:1–8
  "not at the gate (4:1–12)", "not at the gate in 4:1–12",
  // the wish kept a wish (items 1 and 2; SC-0088 review): the name is 'called out', not 'known'
  "known among",
];
// The do_not_decide notes may name what must not be said ("the levirate law, Deuteronomy 25", "that she
// adopted him"), so their list is narrower. R7 gives no name meaning for Obed (cross-check).
const BANNED_IN_RULE_NOTES = [
  "royal", "kingdom", "covenant", "faithful", "emptiness", "fullness", "reckon", "grandmother", "cradle",
  "kinsman", "queue", "whisper", "not at the gate in 4:1–12", "one who serves",
];

// R2's never-list names the word it forbids ('kinsman'); that one sentence is left out of the ban check.
const R2_NEVER = "For the voice only, never to be said: do not call the redeemer 'kinsman' or 'relative', add another reason for the women's words, or explain what 'seven sons' stands for.";

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

describe("SC-0088 — P13 rulings guard (what the app reads)", () => {
  it("the P13 map, as the voice reads it, carries none of the removed wording (and never 'king')", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(voiceText).not.toMatch(/\bking\b/i);
  });

  it("the P13 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(6);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(mcProseText).not.toMatch(/\bking\b/i);
  });

  it("the P13 do_not_decide notes carry none of the removed wording", () => {
    expect(dndNotes).toContain(R2_NEVER);
    expect(lowHits(dndNotes.replace(R2_NEVER, ""), BANNED_IN_RULE_NOTES)).toEqual([]);
  });

  it("the register has R1–R13, do_not_decide exactly on R1, R2, R3, R5, R7, R8, R9, R10, R13, every entry traced", () => {
    // Marcia 2026-09-28, after the session: «Pode passar as regras do tipo nunca para o validador» (P13-D6).
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 13 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R3", "R5", "R7", "R8", "R9", "R10", "R13"]);
    expect(audit.filter((e) => e.required_in_audit !== true).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => !(e.source_in_meaning_map ?? "").trim()).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW")).toEqual([]);
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

  it("the Coordinates' three scene purposes and absences are the map's 3F and Significant Absence texts", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[];
    expect(scenes.map((s) => s.scene_id)).toEqual(["S1", "S2", "S3"]);
    for (const s of scenes) {
      expect(rawMap, `${s.scene_id} purpose`).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
      expect(rawMap, `${s.scene_id} absence`).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    }
  });

  it("D1 (b): 'King David' is a nuance named once — the same rule, word for word, in P13 R8 and P14 R4", () => {
    const r8 = audit.find((e) => e.id === "R8")!;
    expect(r8.do_not_decide).toBe(true);
    expect(r8.note).toContain(D1_NEVER);
    expect(r8.note).toContain(D1_NUANCE);
    const p14 = jsonBlock(read("fixtures/compilation-log/P14-Ruth-4-18-22-COMPILATION-LOG.md"));
    const r4 = (p14.high_risk_register_audit as Entry[]).find((e) => e.id === "R4")!;
    expect(r4.do_not_decide).toBe(true);
    expect(r4.note).toContain(D1_NEVER);
    expect(r4.note).toContain(D1_NUANCE);
    // The voice itself never says 'king' (the map says only 'David'); no send-back sentence survives.
    expect(r8.note).not.toMatch(/offered back|told again/);
    expect(rawMap).toContain("The narrator names David and says nothing more about him.");
  });

  it("D2 (b): 'not at the gate' only for 4:1–8; for 4:9–12 neither speaks, and the voice never says", () => {
    expect(rawMap).toContain(
      "- [[FIG_0016-Ruth-and-Naomi-Absent-from-the-Proceeding]] — active at Proposition 8 (Ruth and Naomi are not at the gate in 4:1–8, and in 4:9–12 neither of them speaks; here Naomi takes the child)",
    );
    expect(note("R10")).toContain(
      "do not say whether Ruth or Naomi was at the gate in 4:9–12; if asked, the text does not say ('this young woman', 4:12, is not read as proof either way).",
    );
  });

  it("R3 settled on the approved reading; R5, R7, R9 keep their never-lists for the voice only", () => {
    expect(note("R3")).toContain("the one Ruth has borne is the redeemer, and 'his name' is his.");
    expect(note("R3")).toContain("For the voice only, never to be said: do not teach other readings");
    for (const id of ["R1", "R2", "R5", "R7", "R9", "R10", "R13"]) expect(note(id), id).toContain("For the voice only, never to be said:");
    // SC-0088 post-session (P13-D6): every never-list is do_not_decide; R11's moved, word for word, into R13.
    expect(audit.filter((e) => /never to be said/.test(e.note) && !e.do_not_decide).map((e) => e.id)).toEqual([]);
    expect(note("R13")).toBe("For the voice only, never to be said: do not say that the women's blessing answers the blessing at the gate or fulfils it, or that it ends Naomi's grief.");
    expect(note("R11")).not.toContain("never to be said");
    expect(note("R2")).toContain(R2_NEVER);
    expect(note("R7")).toContain("The text does not say why the name Obed; if asked, the text does not tell.");
    expect(note("R9")).toContain("A telling that recalls Boaz's words at the gate — he bought Ruth to raise up the name of the dead — is correct; accept it without comment.");
  });

  it("elements the text does not have are gone: no place in 4:13–17, no CB_0001 at 4:13, the child once in Scene 3", () => {
    expect(read(MC)).not.toContain("PL_NAOMIS_DWELLING");
    expect(rawMap).not.toContain("PL_NAOMIS_DWELLING");
    // SC-0088 review: 4:13 does not say 'redeemer' (the reason CB_0001 left S1), so Boaz's S1 line does not either.
    expect(rawMap).toContain("- Relationship: now her husband\n");
    expect(rawMap).not.toContain("the redeemer, now her husband");
    const [s1, , s3] = mc.level_2_scenes as {
      places_in_scene: { entries: unknown[] | null }; objects_in_scene: { entries: unknown[] | null };
      beings_in_scene: { entries: { being_id: string }[] };
    }[];
    expect(s1!.places_in_scene.entries).toBeNull();
    expect(s1!.objects_in_scene.entries).toBeNull();
    expect(s3!.places_in_scene.entries).toBeNull();
    expect(s3!.beings_in_scene.entries.map((e) => e.being_id)).not.toContain("B?");
    const props = mc.level_3_propositions as { prop_id: string; cb_flags: string[]; event_specific_slots: Record<string, unknown> }[];
    expect(props.find((p) => p.prop_id === "P1")!.cb_flags).not.toContain("CB_0001");
    const slot = (id: string, key: string) => props.find((p) => p.prop_id === id)!.event_specific_slots[key];
    expect([slot("P8", "child_taken"), slot("P9", "for_child"), slot("P10", "named_child")]).toEqual(["B25", "B25", "B25"]);
    expect(rawMap).toContain("[[B25-Obed]] — הַיֶּלֶד / \"the child\"; עוֹבֵד / Obed");
    expect(rawMap).not.toMatch(/^The child — הַיֶּלֶד/m);
  });

  it("the pairs close here: FIG_0014 (P11 → middle P12 → P13), FIG_0016, FIG_0187, FIG_0007 VERIFIED", () => {
    const pairs = cl.cross_pericope_pair_verification.pairs as { fig_id: string; closes_at: string; verification_status: string }[];
    const row = (fig: string) => pairs.find((r) => r.fig_id === fig)!;
    for (const fig of ["FIG_0014", "FIG_0016", "FIG_0187", "FIG_0007"]) expect(row(fig).verification_status, fig).toBe("VERIFIED");
    expect(row("FIG_0014").closes_at).toContain("middle station at P12 P8");
    for (const fig of ["FIG_0194", "FIG_0192", "FIG_0189"]) expect(row(fig).verification_status, fig).toBe("PENDING");
  });

  it("Scene 3 is not INTIMATE (standard item 10): only S2 CEREMONIAL at scene level; the log has no placeholder link", () => {
    const ro = mc.pericope_classification.register_overrides as { scene_level: { scene_id: string; override_value: string }[] | null; moment_level: unknown };
    expect(mc.pericope_classification.register).toBe("INFORMAL_CASUAL");
    expect(ro.scene_level!.map((s) => `${s.scene_id}:${s.override_value}`)).toEqual(["S2:CEREMONIAL"]);
    expect(ro.moment_level).toBeNull();
    expect(rawMap).toContain("Scene 3, Naomi taking the child and the neighbor-women naming him (4:16–17), stays in the pericope-level INFORMAL_CASUAL.");
    expect(rawMap).not.toContain("settles to INTIMATE");
    const r12 = audit.find((e) => e.id === "R12")!;
    expect(r12.note).not.toContain("INTIMATE");
    expect(r12.applies_to).not.toContain("INTIMATE");
    expect(read(CL)).not.toMatch(/\[\[\s*\]\]|\[\[CODE\]\]/);
  });

  it("titles and §2.1 (P14's story-so-far) carry no reading and no pointer ahead", () => {
    const headings = [...rawMap.matchAll(/^### Scene \d — (.+)$/gm)].map((m) => m[1]);
    expect(headings).toEqual([
      "The marriage, the conception, the birth (4:13)",
      "The women's words to Naomi (4:14–15)",
      "The child on Naomi's lap; the naming (4:16–17)",
    ]);
    const s21 = rawMap.match(/### 2\.1 [^\n]*\n([^\n]*)\n/)![1]!;
    expect(s21).not.toMatch(/Perez|4:18|\bking\b|line of/i);
    expect(s21).toMatch(/and the passage ends on three names — Obed, Jesse, David\.$/);
    // SC-0088 review: the 4:17 closing line is the narrator's in the story-so-far P14 hears, as P14 §2.2 has it.
    expect(s21).toContain("and they call his name Obed. The narrator adds: he is the father of Jesse, the father of David.");
    expect(rawMap).toMatch(/### 2\.3 [^\n]*\nSwift, then warm, then still\. /);
    expect(rawMap).toContain("And the last line is the narrator's: Obed is the father of Jesse, the father of David.");
  });
});
