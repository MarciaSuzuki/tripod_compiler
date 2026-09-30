import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0089 — regression guard for P08 (Ruth 3:1–5) under Marcia's map standard of 2026-09-28
 * («(a), sim, pode seguir com as recomendações», item 16 included), her word to begin
 * («sim, pode começar pela P08 e P10», 2026-09-28) and her SC-0089 rulings of 2026-09-29
 * («(b), (b), (a), sim — pode seguir com as recomendações»).
 *
 * The voice reads the map prose (frontmatter stripped, [[CODE]] only); the Validator reads the map prose,
 * the Coordinates' significant absences and the do_not_decide notes. The standard took out of P08 what
 * 3:1–5 does not say: the handoff, the risk and danger of the night, the "hushed" talk, the goal and the
 * "means" of the plan, "the secure home a married woman has", the "softer" family word and the redeemer
 * word "unspoken" (intent), the pointers ahead (P09, 3:11, the night scenes' verse list, "the next
 * pericope"), the "total" assent and "the one whose word is accepted whole" (verdicts), the denial
 * "no public moment", a place the text does not name (Naomi's dwelling) and a being it does not mention
 * (Elimelech, B2, in the Coordinates' Scene 1); 3:5 does not say Ruth's name ("she said").
 * Ruling D1 (b): §2.2 carries the 1:9 words "each in the house of her husband", so a team that keeps "a
 * resting place" and adds marriage or a husband is accepted without comment (R2); an added "redeemer" at
 * 3:2 is offered back gently with "our kinsman" (R10, SC-0053). Ruling D3 (a): the small fixes (i)–(iv) in
 * the approved P07 and P09 files that pointed at P08 are pinned here; (v)–(vi) in the P10 guard.
 * Her rulings of 2026-09-29 after the team's session («(a), (a), sim — pode seguir com as recomendações»):
 * (1) the Scene 1 absence no longer says 'Naomi says "a resting place".' (live, the voice read it as "the
 * story does not say what the rest is" and treated an added marriage as a filled silence), and the 1:9 words
 * sit at the rest-word (§3C CB_0014 Cross-ref); (3) R9, a named Ruth accepted without comment, is
 * do_not_decide (item 16) — do_not_decide is R2–R11.
 * A future governed change that re-rules P08 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P08-Ruth-3-1-5.md";
const MC = "fixtures/meaning-coordinates/P08-Ruth-3-1-5-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P08-Ruth-3-1-5-COMPILATION-LOG.md";
// Seen, not changed under SC-0089 (listed for a later title pass): the only place 'total' may stand.
const TITLE = "Naomi's plan for rest; Ruth's total consent";

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

type Entry = { id: string; kind: string; applies_to: string; note: string; do_not_decide?: boolean; required_in_audit?: boolean; source_in_meaning_map?: string };
const audit = cl.high_risk_register_audit as Entry[];
const entry = (id: string) => audit.find((e) => e.id === id)!;
const dndNotes = audit.filter((e) => e.do_not_decide).map((e) => e.note).join("\n");

// Ruling D1 (b), in the words approved with the cross-check (#19, #23), as her ruling (1) of 2026-09-29
// (after the team's session) reworded it: the sentence 'Naomi says "a resting place".' is out.
const S1_ABSENCE = "After \"lie down\" she says only: he will tell you what you shall do. The word redeemer (2:20) is not said here; Naomi calls Boaz \"our kinsman\".";
const OLD_S1_SENTENCE = "Naomi says \"a resting place\".";
// Her ruling (1): the 1:9 words at the rest-word itself (§3C Scene 1, CB_0014).
const CB_0014_XREF = "- Cross-ref: the rest-word of 1:9 comes again (1:9 menuchah, 3:1 manoach); at 1:9 Naomi wished each daughter-in-law rest, \"each in the house of her husband\"\n";
// Her ruling (3), R9 to the Validator (item 16).
const R9_NEVER = "For the voice only, never to be said: a remark that the text does not say her name, when a team names Ruth; a team that names Ruth is accepted without comment (item 16).";
const DND = ["R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11"];
const D1_MARRIAGE = "do not tell the plan as a marriage plan or say that Naomi wants a husband for Ruth; a team telling that keeps \"a resting place\" and adds marriage or a husband, as 1:9 said, is accepted without comment; one that puts marriage in place of \"a resting place\" is offered back gently.";
const D1_REDEEMER = "A telling that calls Boaz \"redeemer\" at 3:2 fills the silence recorded here (SC-0053): offer it back gently with \"our kinsman\".";
const ITEM16 = "Do not announce this silence before the team tells (item 16).";

// Wording the standard removed from what the voice and the Validator read (case-insensitive).
const BANNED_IN_MAP_AND_MC = [
  // the handoff, the night's danger, the hushed talk (items 3, 8; P09 rulings 1 and 9)
  "hand", "risk", "danger", "hush", "whisper", "sleep", "fold", "boldest", "wake", "if the man is angry",
  // readings of the plan: its goal and means, marriage told as the plan, intent (items 2, 3; D1 (b))
  "goal", "the means", "secure home", "married woman", "marri", "softer", "legal word", "unspoken",
  "permanence", "provision", "promise", "sought for", "trust", "hesitation", "levirat", "bride", "wedding",
  // no motive for Boaz the text does not give (item 3): the grain line says what he is winnowing (SC-0089 review)
  "what brings",
  // verdicts and denials nobody raised (items 3, 16)
  "total assent", "accepted whole", "completely", "public moment", "ceremonial lift", "the closed door", "alone at",
  // nothing of what comes later (item 6): no passage IDs, no later verses, no 'next'
  "next", "p07", "p09", "p10", "3:7", "3:8", "3:9", "3:11", "3:13", "3:14", "the dark", "hinge", "door",
  // carried rulings: no queue, no friend, the text's word for מֹדַעְתָּנוּ (not 'moda')
  "queue", "friend", "moda", "withh", "authorit", "fulfil",
];
// The do_not_decide notes name what must not be said ("a bride's preparation, a wedding custom" in R5,
// "never 'fold the covering back', never 'while he sleeps'" in R6), so those two sentences are left out of
// the check (as SC-0088 did for P13 R2 and P14 R6) and the list is narrower.
const R5_NEVER = "For the voice only, never to be said: do not call it a bride's preparation, a wedding custom or making herself beautiful for him, and give no reason for the three steps (the text gives none).";
const R6_NEVER = "For the voice only, never to be said: do not decide what the uncovering and the lying down mean; add no touch, no word of love or desire, no verdict — neither that something will happen nor that nothing will (P09 R16); never 'fold the covering back', never 'while he sleeps' (P09 ruling 1).";
const BANNED_IN_RULE_NOTES = [
  "handoff", "hush", "whisper", "queue", "moda", "levirat", "bride", "wedding", "fold the covering", "while he sleeps",
  "public moment", "ceremonial lift", "the goal", "and after that?", "and when he lies down?",
];

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

describe("SC-0089 — P08 rulings guard (what the app reads)", () => {
  it("the P08 map, as the voice reads it, carries none of the removed wording; 'total' only in the title", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(voiceText.split(TITLE).join("")).not.toMatch(/\btotal\b/i);
    expect(rawMap).toContain(`pericope-title: "${TITLE}"`);
  });

  it("the P08 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(4);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(mcProseText.split(TITLE).join("")).not.toMatch(/\btotal\b/i);
  });

  it("the P08 do_not_decide notes carry none of the removed wording", () => {
    expect(dndNotes).toContain(R5_NEVER);
    expect(dndNotes).toContain(R6_NEVER);
    expect(lowHits(dndNotes.replace(R5_NEVER, "").replace(R6_NEVER, ""), BANNED_IN_RULE_NOTES)).toEqual([]);
  });

  it("the register has R1–R13, do_not_decide exactly on R2–R11, every entry traced to the map", () => {
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 13 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(DND);
    expect(audit.filter((e) => e.required_in_audit !== true).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => !(e.source_in_meaning_map ?? "").trim()).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW")).toEqual([]);
    // Every never-rule is do_not_decide from the start (the SC-0088 lesson): no 'never' outside do_not_decide.
    expect(audit.filter((e) => /\bnever\b/i.test(e.note) && !e.do_not_decide).map((e) => e.id)).toEqual([]);
    // Every single-quoted map fragment the register cites is verbatim in the map.
    const missing: string[] = [];
    for (const e of audit) {
      for (const m of (e.source_in_meaning_map ?? "").matchAll(/(?:\(|; |, | )'(.{8,}?)'(?=[;),])/g)) {
        if (!rawMap.includes(m[1]!)) missing.push(`${e.id}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
    // Obsidian: the Compilation Log carries no empty or placeholder link.
    expect(read(CL)).not.toMatch(/\[\[\s*\]\]|\[\[CODE\]\]/);
  });

  it("the three gate signals agree (real audit, both checklist flags, sta-status complete)", () => {
    expect(cl.validation_checklist.high_risk_register_complete).toBe(true);
    expect(cl.validation_checklist.every_high_risk_entry_traces_to_meaning_map).toBe(true);
    expect(rawMap).toMatch(/^sta-status: "complete"$/m);
  });

  it("the record: P08-D4 quotes her words of 2026-09-28 and 2026-09-29; the grain line gives no motive", () => {
    const d4 = (cl.compilation_decisions as { decision_id: string; description: string }[]).find((x) => x.decision_id === "P08-D4")!.description;
    expect(d4).toContain("sim, pode começar pela P08 e P10");
    expect(d4).toContain("(b), (b), (a), sim — pode seguir com as recomendações");
    expect(rawMap).toContain("- Function in scene: what Boaz is winnowing at the threshing floor tonight\n");
  });

  it("the Coordinates' two scene purposes and absences are the map's 3F and Significant Absence texts", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[];
    expect(scenes.map((s) => s.scene_id)).toEqual(["S1", "S2"]);
    for (const s of scenes) {
      expect(rawMap, `${s.scene_id} purpose`).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
      expect(rawMap, `${s.scene_id} absence`).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    }
  });

  it("D1 (b): the 1:9 words in §2.2, the ruled Scene 1 absence, R2 and R10 (do_not_decide)", () => {
    expect(rawMap).toMatch(/### 2\.2 Context\n[^\n]*when she wished that YHWH would grant each daughter-in-law rest, each in the house of her husband\. /);
    const s1 = (mc.level_2_scenes as { scene_id: string; significant_absence: string }[]).find((s) => s.scene_id === "S1")!;
    expect(s1.significant_absence).toBe(S1_ABSENCE);
    expect(rawMap).toContain(`**Significant Absence**\n${S1_ABSENCE}\n`);
    expect(entry("R2").do_not_decide).toBe(true);
    expect(entry("R2").note).toContain(`For the voice only, never to be said: ${D1_MARRIAGE}`);
    expect(entry("R10").do_not_decide).toBe(true);
    expect(entry("R10").note).toContain(D1_REDEEMER);
    expect(entry("R10").note).toContain(ITEM16);
    // 'our kinsman' (מֹדַעְתָּנוּ) is the family word the text uses at 3:2; the voice never calls Boaz the redeemer here.
    expect(rawMap).toContain("- Referential form: \"Boaz our kinsman\" (מֹדַעְתָּנוּ, a family word) at v.2;");
    expect(entry("R10").note).toContain("For the voice only, never to be said: do not call Boaz the redeemer in this passage;");
  });

  it("R3 and R8 as the cross-check corrected them: no quoted rehearsal frases, the item-16 sentence, R8 whole", () => {
    expect(entry("R3").do_not_decide).toBe(true);
    expect(entry("R3").note).toContain("A telling in which Ruth asks Naomi a question fills this silence: offer it back gently.");
    expect(entry("R3").note).toContain(ITEM16);
    expect(entry("R8").do_not_decide).toBe(true);
    expect(entry("R9").applies_to).toContain("her name is not said in 3:1-5");
    expect(entry("R9").note).toContain("Naomi calls Ruth \"my daughter\"; Ruth's name is not said in 3:1-5.");
    expect(entry("R12").note).not.toContain("public moment");
  });

  // Her rulings (1) and (3) of 2026-09-29, after the team's session.
  it("2026-09-29 (1): the Scene 1 absence without 'Naomi says \"a resting place\".', in map and MC; the 1:9 words at CB_0014", () => {
    const s1 = (mc.level_2_scenes as { scene_id: string; significant_absence: string }[]).find((s) => s.scene_id === "S1")!;
    expect(s1.significant_absence).toBe(S1_ABSENCE);
    expect(s1.significant_absence).not.toContain(OLD_S1_SENTENCE);
    const mapAbsences = [...rawMap.matchAll(/\*\*Significant Absence\*\*\n([^\n]*)\n/g)].map((m) => m[1]!);
    expect(mapAbsences.length).toBe(2);
    expect(mapAbsences[0]).toBe(S1_ABSENCE);
    expect(mapAbsences.filter((a) => a.includes("resting place"))).toEqual([]);
    expect((mc.level_2_scenes as { significant_absence: string }[]).filter((s) => s.significant_absence.includes("resting place"))).toEqual([]);
    expect(rawMap).toContain(`[[CB_0014-Rest-Menucha]] — מָנוֹחַ / "a resting place"\n- What it is: "a resting place" (manoach), a place of rest\n- Function in scene: in Naomi's question — shall I not seek a resting place for you, that it may be well with you?\n${CB_0014_XREF}`);
    expect(rawMap).not.toContain("- Cross-ref: the rest-word of 1:9 comes again (1:9 menuchah, 3:1 manoach)\n");
    // No register text calls "a resting place" a silence: a clause that names it says "not a silence" or no silence.
    const clauses = audit.flatMap((e) => `${e.applies_to}. ${e.note}`.split(/[.;] /)).filter((c) => /resting place/i.test(c));
    expect(clauses.length).toBeGreaterThan(0);
    expect(clauses.filter((c) => /silence/i.test(c) && !/not a silence/i.test(c))).toEqual([]);
    expect(entry("R2").note).toContain("Naomi says 'a resting place' (3:1): that is the text's word, which the telling keeps; it is not a silence.");
    // R2 and R4 quote the new lines, verbatim.
    expect(entry("R2").source_in_meaning_map).toContain("Significant Absence in Scene 1 ('After \"lie down\" she says only: he will tell you what you shall do.')");
    expect(entry("R2").source_in_meaning_map).not.toContain(OLD_S1_SENTENCE);
    for (const id of ["R2", "R4"]) {
      expect(entry(id).source_in_meaning_map, id).toContain("'the rest-word of 1:9 comes again (1:9 menuchah, 3:1 manoach); at 1:9 Naomi wished each daughter-in-law rest, \"each in the house of her husband\"'");
    }
  });

  it("2026-09-29 (3): R9 (a named Ruth accepted without comment) is do_not_decide, with its item-16 never-sentence", () => {
    expect(entry("R9").do_not_decide).toBe(true);
    expect(entry("R9").note).toContain(R9_NEVER);
    expect(dndNotes).toContain(R9_NEVER);
    const d6 = (cl.compilation_decisions as { decision_id: string; description: string }[]).find((x) => x.decision_id === "P08-D6")!.description;
    expect(d6).toContain("(a), (a), sim — pode seguir com as recomendações");
  });

  it("3:1 and 3:5 give no name for Ruth: Scene 1 'speaks to her', Scene 2 'she said', not רוּת", () => {
    expect(rawMap).not.toContain("[[B9-Ruth]] — רוּת");
    expect(rawMap).toContain("[[B9-Ruth]] — וַתֹּאמֶר / \"she said\"\n");
    expect(rawMap).toContain("- Referential form: \"she\" (3:5)\n");
    expect(rawMap).toContain("[[B9-Ruth]] She says to her: all that you say I will do.");
    expect(rawMap).toContain("[[B3-Naomi]] Naomi her mother-in-law speaks to [[B9-Ruth]] her: my daughter,");
    expect(rawMap).toContain("- Referential form: \"my daughter\" in Naomi's words (3:1)\n");
    // 2:1 — Boaz is a kinsman of Naomi's husband, of the clan of Elimelech.
    expect(rawMap).toContain("[[B13-Boaz]] Boaz is a kinsman of her husband (2:1)");
    expect(rawMap).toContain("- Relationship: of the clan of [[B2-Elimelech]] Elimelech (2:1);");
  });

  it("elements the text does not have: no B2 in the Coordinates' Scene 1, no PL_NAOMIS_DWELLING anywhere", () => {
    const [s1, s2] = mc.level_2_scenes as { beings_in_scene: { entries: { being_id: string }[] }; places_in_scene: { _note?: string; entries: { place_id: string }[] | null } }[];
    expect(s1!.beings_in_scene.entries.map((e) => e.being_id)).not.toContain("B2");
    expect(s1!.places_in_scene.entries!.map((e) => e.place_id)).toEqual(["PL6"]);
    expect(s2!.places_in_scene.entries).toBeNull();
    expect(s2!.places_in_scene._note).toBe("the text names no place in this scene (per meaning map)");
    expect(read(MC)).not.toContain("PL_NAOMIS_DWELLING");
    expect(rawMap).not.toContain("PL_NAOMIS_DWELLING");
    expect(rawMap).toContain("**3B — Places**\n\n- None: the text names no place in this scene.\n");
  });

  it("the figures: FIG_0122 keeps its slug, the pairs are verified, FIG_0113 is not P08's", () => {
    expect(rawMap).toContain("[[FIG_0122-He-Will-Tell-You]]");
    expect(rawMap).not.toContain("Handoff");
    const pairs = cl.cross_pericope_pair_verification.pairs as { fig_id: string; closes_at: string; verification_status: string }[];
    expect(pairs.map((r) => `${r.fig_id}:${r.verification_status}`)).toEqual([
      "FIG_0120:VERIFIED", "FIG_0121:VERIFIED", "FIG_0122:VERIFIED", "FIG_0123:VERIFIED",
    ]);
    expect(pairs.find((r) => r.fig_id === "FIG_0120")!.closes_at).toMatch(/^P08 P1 /);
    const props = mc.level_3_propositions as { prop_id: string; figure_flags: string[] }[];
    expect(props.filter((p) => p.figure_flags.includes("FIG_0113"))).toEqual([]);
  });

  // Ruling D3 (a), (i)–(iv): the approved P07 and P09 lines that pointed at P08 (Marcia 2026-09-29;
  // (iv) rewords her own SC-0086 R17). (v) and (vi) are pinned in the P10 guard; (vii) P02 waits.
  it("D3 (i)–(ii): P07 — FIG_0113 a single occurrence; the season passes in silence", () => {
    const p07map = read("fixtures/meaning-map/P07-Ruth-2-17-23.md");
    const p07mcText = read("fixtures/meaning-coordinates/P07-Ruth-2-17-23-MEANING-COORDINATES.md");
    const p07mc = jsonBlock(p07mcText);
    const p07cl = jsonBlock(read("fixtures/compilation-log/P07-Ruth-2-17-23-COMPILATION-LOG.md"));
    expect(p07map).toContain("- [[FIG_0113-Leftovers-After-Satiety]] — active at Proposition 6 (the leftover she gives Naomi)\n");
    expect(p07mcText).toContain("FIG_0113 single occurrence");
    const row = (p07cl.cross_pericope_pair_verification.pairs as { fig_id: string; closes_at: string; verification_status: string }[]).find((r) => r.fig_id === "FIG_0113")!;
    expect(row.verification_status).toBe("VERIFIED");
    expect(row.closes_at).toBe("P07 P6 (single occurrence)");
    const s4 = (p07mc.level_2_scenes as { scene_id: string; significant_absence: string }[]).find((s) => s.scene_id === "S4")!;
    expect(s4.significant_absence).toMatch(/ The season passes in silence\.$/);
    expect(p07map).toContain(`**Significant Absence**\n${s4.significant_absence}\n`);
    const r14 = (p07cl.high_risk_register_audit as Entry[]).find((e) => e.id === "R14")!;
    expect(r14.do_not_decide).toBe(true);
    expect(r14.note).toContain("The quiet must be preserved. The reconstructor");
    for (const t of [p07map, p07mcText, r14.note]) {
      expect(t).not.toMatch(/pairs forward to P08|the next move waits|Naomi's plan in chapter 3/);
    }
  });

  it("D3 (iii)–(iv): P09 — 'follows Naomi's plan (3:1–5)', the redeemer word 'said now', R17 reworded", () => {
    const p09map = read("fixtures/meaning-map/P09-Ruth-3-6-13.md");
    const p09mc = jsonBlock(read("fixtures/meaning-coordinates/P09-Ruth-3-6-13-MEANING-COORDINATES.md"));
    const p09cl = jsonBlock(read("fixtures/compilation-log/P09-Ruth-3-6-13-COMPILATION-LOG.md"));
    const reg = (id: string) => (p09cl.high_risk_register_audit as Entry[]).find((e) => e.id === id)!;
    expect(p09map).toContain("### 2.2 Context\nThis follows Naomi's plan (3:1–5). ");
    expect(p09map).toContain("The word redeemer, not said in Naomi's plan (at 3:2 she called him \"our kinsman\"), is said now — by Ruth, in the dark, ");
    expect(p09map).toContain("- Relationship: the kinsman Naomi named (3:2); he does not yet know she is there\n");
    expect(p09map).toContain("- Function in scene: said by Ruth, as the reason for her request\n");
    expect(reg("R14").note).toContain("the word redeemer (גֹאֵל), not said in Naomi's plan — at 3:2 she called Boaz 'our kinsman' — is said now by Ruth");
    const IV = "The narrator does not say what Ruth intends beyond the plan. No word is spoken in the whole scene.";
    const s1 = (p09mc.level_2_scenes as { scene_id: string; significant_absence: string }[]).find((s) => s.scene_id === "S1")!;
    expect(s1.significant_absence).toBe(IV);
    expect(p09map).toContain(`**Significant Absence**\n${IV}\n`);
    expect(reg("R17").do_not_decide).toBe(true);
    expect(reg("R17").note).toMatch(/must bring in no danger the text does not give\.$/);
    // (The §5B / cross_ref records of the FIG_0122 and FIG_0123 pairs, "opened at P08 …", stay: D3 lists
    // only these lines, and nothing else in approved passages.)
    for (const t of [p09map.replace(/^---\n[\s\S]*?\n---\n/, ""), JSON.stringify(p09mc), reg("R14").note, reg("R17").note, reg("R17").applies_to]) {
      expect(t).not.toMatch(/P08's plan|P08 called him|the kinsman of P08|carrying-out|withheld through the plan|spoken at last|name the risk|holds its breath|the word the plan withheld/);
    }
  });
});
