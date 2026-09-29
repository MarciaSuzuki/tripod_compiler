import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0089 — regression guard for P10 (Ruth 3:14–18) under Marcia's map standard of 2026-09-28
 * («(a), sim, pode seguir com as recomendações», item 16 included), her word to begin
 * («sim, pode começar pela P08 e P10», 2026-09-28) and her SC-0089 rulings of 2026-09-29
 * («(b), (b), (a), sim — pode seguir com as recomendações»).
 *
 * The voice reads the map prose (frontmatter stripped, [[CODE]] only); the Validator reads the map prose,
 * the Coordinates' significant absences and the do_not_decide notes. The standard took out of P10 what
 * 3:14–18 does not say: the answer and reversal links to 1:21 ("the structural turn from emptying to
 * filling"), the readings of the gift ("aimed at Naomi", "for the house", "evidence", "proof", "weighed"),
 * the three readings of "who are you, my daughter?", "kinsman" for the go'el, "home" where the text says
 * "to her mother-in-law", the images ("gray", "sack", "as the dawn parts them", "a held breath"), the
 * pointers ahead ("final", "sets the story down to wait"), denials worded as form orders ("no one is
 * named"), "into the cloak" (3:15 says only that he measured and laid it on her), Naomi's words told as a
 * fact about Boaz, a being (Naomi) the Coordinates' Scene 1 does not have, a place (Naomi's dwelling) the
 * text does not name, and one word ('empty', 3:17) counted twice (CB_0024 beside CB_0044).
 * Ruling D2 (b): the voice tells "he goes into the town" (וַיָּבֹא, her SC-0056 reading); a team telling
 * "she went" is offered back gently with the map's reading and the voice never teaches the other reading
 * (R10). Ruling D3 (a) (v)–(vi): P04 R5 and its FIG_0084 row ("said again at 3:17"), and P10's Scene 2
 * title. Her SC-0087 R-9 words "keep the secret Boaz asked for (3:14)" stay (the P11 guard pins them).
 * A future governed change that re-rules P10 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P10-Ruth-3-14-18.md";
const MC = "fixtures/meaning-coordinates/P10-Ruth-3-14-18-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P10-Ruth-3-14-18-COMPILATION-LOG.md";
// Seen, not changed under SC-0089 (listed for a later title pass): the only place 'home' may stand.
const TITLE = "The nameless dawn: six measures home, and sit still";

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
const entry = (id: string) => audit.find((e) => e.id === id)!;
const dndNotes = audit.filter((e) => e.do_not_decide).map((e) => e.note).join("\n");

const BANNED_IN_MAP_AND_MC = [
  // no answer, reversal or filling (items 3, 6): only the same word 'empty' said again
  "answer", "revers", "filling", "filled", "emptiness", "structural", "now full",
  // no readings of the gift or of the man (items 2, 3, 8)
  "aimed", "for the house", "evidence", "proof", "weighed", "gift", "reads the man", "confidence", "the matter is his",
  "will finish the matter", "will not rest from", "protect", "pledged",
  // no readings of 'who are you, my daughter?' (item 15); no denials worded as form orders (items 11, 16)
  "strange question", "what the night has made", "at the door", "what naomi means", "no one is named", "i am ruth",
  "naming-down", "only \"the man\"", "unseen", "unnamed",
  // no images, no pointers ahead, no place the text does not give (items 1, 6, 8)
  "gray", "sack", "before light", "parts them", "the parting", "held breath", "sets the story down", "final",
  "wait-formula", "decided", "homecoming", "at home", "debrief", "wound", "into the cloak", "carries the gift",
  "until the matter falls", "naomi's dwelling", "alone",
  // SC-0089 review: at 3:14–15 only Boaz speaks (no 'exchange'); at 3:9 Boaz asked only "who are you?" (item 1)
  "respectful exchange", "in the same words boaz",
  // carried rulings: the go'el is 'redeemer', never 'kinsman'; nothing of the gate (P11); no hushed night (P09)
  "kinsman", "gate", "hush", "sleeper", "whisper", "queue", "friend", "p11", "4:1", "levirat", "marr",
  // feelings the text does not give
  "love", "shame", "danger", "risk", "fear", "joy", "relief", "certain", "hope",
];
// R4's never-sentence names the words it forbids ('answer', 'reverse'); it is left out of the check, as
// SC-0088 did for P13 R2 and P14 R6. R1, R2, R6 and R9 name feelings, measures and 'marry' in their
// never-lists, so the list for the rule notes is narrower.
const R4_NEVER = "For the voice only, never to be said: do not say that these words answer, reverse or end Naomi's emptiness, or that she is now full; do not say that YHWH sent the barley; say nothing of whom the barley is for beyond Boaz's words; do not say that the gift shows what Boaz means to do or feels.";
// (R5 keeps "do not give Ruth an answer with her name", so the rule notes ban the answer-link forms only.)
const BANNED_IN_RULE_NOTES = [
  "answers", "answer the", "revers", "filling", "structural", "aimed", "evidence", "proof", "gray", "hush", "sleeper",
  "held breath", "kinsman", "pledged", "protect", "gate", "4:1", "debrief", "wound", "strange question",
];

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

describe("SC-0089 — P10 rulings guard (what the app reads)", () => {
  it("the P10 map, as the voice reads it, carries none of the removed wording; 'home' only in the title", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(voiceText.split(TITLE).join("")).not.toMatch(/\bhome\b|\bnameless\b/i);
    expect(rawMap).toContain(`pericope-title: "${TITLE}"`);
  });

  it("the P10 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(4);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(mcProseText.split(TITLE).join("")).not.toMatch(/\bhome\b|\bnameless\b/i);
  });

  it("the P10 do_not_decide notes carry none of the removed wording", () => {
    expect(dndNotes).toContain(R4_NEVER);
    expect(lowHits(dndNotes.replace(R4_NEVER, ""), BANNED_IN_RULE_NOTES)).toEqual([]);
  });

  it("the register has R1–R13, do_not_decide exactly on R1, R2, R4, R5, R6, R9, R10, every entry traced to the map", () => {
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 13 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R4", "R5", "R6", "R9", "R10"]);
    expect(audit.filter((e) => e.required_in_audit !== true).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => !(e.source_in_meaning_map ?? "").trim()).map((e) => e.id)).toEqual([]);
    expect(audit.filter((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW")).toEqual([]);
    // Every never-rule is do_not_decide from the start (the SC-0088 lesson): no 'never' outside do_not_decide.
    expect(audit.filter((e) => /\bnever\b/i.test(e.note) && !e.do_not_decide).map((e) => e.id)).toEqual([]);
    const missing: string[] = [];
    for (const e of audit) {
      for (const m of (e.source_in_meaning_map ?? "").matchAll(/(?:\(|; |, | )'(.{8,}?)'(?=[;),])/g)) {
        if (!rawMap.includes(m[1]!)) missing.push(`${e.id}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
    expect(read(CL)).not.toMatch(/\[\[\s*\]\]|\[\[CODE\]\]/);
  });

  it("the three gate signals agree (real audit, both checklist flags, sta-status complete)", () => {
    expect(cl.validation_checklist.high_risk_register_complete).toBe(true);
    expect(cl.validation_checklist.every_high_risk_entry_traces_to_meaning_map).toBe(true);
    expect(rawMap).toMatch(/^sta-status: "complete"$/m);
  });

  it("the record: P10-D4 quotes her words of 2026-09-28 and 2026-09-29", () => {
    const d4 = (cl.compilation_decisions as { decision_id: string; description: string }[]).find((x) => x.decision_id === "P10-D4")!.description;
    expect(d4).toContain("sim, pode começar pela P08 e P10");
    expect(d4).toContain("(b), (b), (a), sim — pode seguir com as recomendações");
  });

  // SC-0089 review step (standard item 1; named for her yes/no at the merge word): at 3:14–15 only Boaz
  // speaks, so Scene 1's register line gives Ruth no speech; at 3:9 Boaz asked only "who are you?".
  it("review fixes: Scene 1 CONSULTATIVE 'as in the night at the threshing floor'; Boaz's 3:9 words quoted exactly", () => {
    expect(rawMap).toContain("Scene 1 shifts to CONSULTATIVE at scene level, as in the night at the threshing floor; the dawn is still private — before one person could recognize another, and under Boaz's word that it must not be known that the woman came to the threshing floor (3:14).");
    expect(mc.pericope_classification.register_overrides._note).toContain("Scene 1 shifting to CONSULTATIVE at scene level (at the threshing floor at dawn, as in the night, under Boaz's word of 3:14)");
    expect(entry("R12").note).toContain("Scene 1 (3:14–15) is CONSULTATIVE at scene level, as in the night at the threshing floor; the dawn is still private (3:14).");
    expect(entry("R12").note).not.toContain("exchange");
    expect(rawMap).toContain("Naomi's question, \"who are you, my daughter?\", uses the words Boaz asked at night, \"who are you?\" (3:9).");
    expect(rawMap).toContain("Naomi asks \"who are you, my daughter?\", with the words Boaz asked at night, \"who are you?\" (3:9).");
  });

  // SC-0089 follow-up (standard item 1; builder fix, named for her yes/no at the merge word): 3:12 says only
  // "I am a redeemer" and "there is a redeemer nearer than I" — "of the household" is P09's phrase, not the
  // text's. B13's Relationship in both scenes reads "a redeemer (3:12)"; R13's two source quotes follow.
  it("item-1 fix: B13 is 'a redeemer (3:12)' in Scenes 1 and 2 (not 'of the household'); R13's quotes follow", () => {
    expect(rawMap).toContain("- Relationship: a redeemer (3:12); at night he said: if the nearer redeemer will redeem you, good; if he does not want to redeem you, I will redeem you (3:12–13)\n");
    expect(rawMap).toContain("- Relationship: a redeemer (3:12); in Naomi's words, the man who will not rest unless he has finished the matter today\n");
    expect(rawMap.toLowerCase()).not.toContain("household");
    expect(mcProseText.toLowerCase()).not.toContain("household");
    const r13 = entry("R13").source_in_meaning_map ?? "";
    expect(r13).toContain("Section 3A Scene 1 (B13 'a redeemer (3:12); at night he said: if the nearer redeemer will redeem you, good; if he does not want to redeem you, I will redeem you (3:12–13)')");
    expect(r13).toContain("Section 3A Scene 2 (B13 'a redeemer (3:12); in Naomi's words, the man who will not rest unless he has finished the matter today')");
    expect(read(CL).toLowerCase()).not.toContain("household");
  });

  it("the Coordinates' two scene purposes and absences are the map's 3F and Significant Absence texts", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[];
    expect(scenes.map((s) => s.scene_id)).toEqual(["S1", "S2"]);
    for (const s of scenes) {
      expect(rawMap, `${s.scene_id} purpose`).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
      expect(rawMap, `${s.scene_id} absence`).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    }
    // 3:15: he measures and lays it on her — told in the text's order, not 'into the cloak'.
    expect(scenes[0]!.scene_communicative_purpose).toContain("He says: hold out the cloak that is on you; she holds it, and he measures six measures of barley and lays it on her, and he goes into the town.");
    // The S2 absence says no hidden meaning of the question aloud; that sentence lives only in R5 (cross-check #8).
    expect(scenes[1]!.significant_absence).toBe("To Naomi's question, Ruth tells her all that the man did for her. The narrator does not tell Boaz saying \"do not go empty\" at the threshing floor; it is heard only in Ruth's report.");
  });

  it("D2 (b): the voice tells 'he goes into the town'; a team's 'she went' is offered back gently (R10, do_not_decide)", () => {
    const r10 = entry("R10");
    expect(r10.do_not_decide).toBe(true);
    expect(r10.note).toContain("The voice tells 'he goes into the town' and does not teach another reading (item 15).");
    expect(r10.note).toContain("A team telling 'she went into the town' ('ela foi para a cidade'), as some Bibles read, is offered back gently with the map's reading: he goes into the town (Marcia's ruling D2 (b), 2026-09-29, as at 4:5 in P11 R13).");
    expect(r10.note).toContain("For the voice only, never to be said: do not explain the two readings or say which Bibles have which.");
    expect(rawMap).toContain("And he goes into the [[PL4-The-City]] town.");
    expect(rawMap).toContain("- Role: the one who lies at the place of his feet until the morning, rises before one person could recognize another, and holds the cloak\n");
    expect(rawMap).toContain("- Role: where he goes (3:15)\n");
  });

  it("the cross-check's register corrections: R1 (order, item 16), R5 (a nuance), R7 (canon record only), R9 (both sides)", () => {
    expect(entry("R1").note).toContain("those words come only in Ruth's report (3:17); told at the threshing floor, they move earlier in the telling.");
    expect(entry("R1").note).toContain("Do not announce these silences before the team tells (item 16).");
    expect(entry("R5").note).toContain("A telling 'how did it go, my daughter?' ('como foi, minha filha?') keeps the meaning but not the same words as 3:9: a nuance, named once, not sent back.");
    expect(entry("R5").note).toContain("The text does not say what Naomi means by the question; if asked, the text does not say.");
    expect(entry("R7").note).toBe("Canon record: FIG_0156 opens here (3:18b) and closes at P11 P1 (4:1); VERIFIED in the P11 register (R11).");
    expect(entry("R7").do_not_decide).toBeUndefined();
    expect(entry("R9").note).toContain("he said: if the nearer redeemer will redeem you, good; if he does not want to redeem you, I will redeem you;");
    expect(rawMap).toContain("at night he said: if the nearer redeemer will redeem you, good; if he does not want to redeem you, I will redeem you (3:12–13)");
  });

  it("Naomi's words as she says them (3:18), and her ruled 'keep the secret' (SC-0087 R-9)", () => {
    const s21 = rawMap.match(/### 2\.1 [^\n]*\n([^\n]*)\n/)![1]!;
    expect(s21).toContain("sit still, my daughter, until you know how the matter falls — for the man will not rest unless he has finished the matter today.");
    expect(s21).toContain("Naomi's word to sit still until she knows how the matter falls.");
    expect(rawMap).toContain("To speak this passage is to keep the secret Boaz asked for (3:14)");
    expect(rawMap).toContain("- What it is: the place of his feet\n");
    // Naomi's closing words stay hers: the Role says what is reported, the Relationship gives her words.
    expect(rawMap).toContain("- Role: the one reported on — what he did, what he gave, and what he said\n");
    expect(rawMap).toContain("- Referential form: \"the man\" (3:16, 3:18); \"he\" in Ruth's words (3:17)\n");
  });

  it("elements the text does not have: no B3 in the Coordinates' Scene 1, no PL_NAOMIS_DWELLING, 'empty' counted once", () => {
    const [s1, s2] = mc.level_2_scenes as { beings_in_scene: { entries: { being_id: string; referential_form?: string }[] }; places_in_scene: { _note?: string; entries: { place_id: string }[] | null }; objects_in_scene: { entries: { object_id: string }[] } }[];
    expect(s1!.beings_in_scene.entries.map((e) => e.being_id)).toEqual(["B9", "B13"]);
    expect(s1!.beings_in_scene.entries.find((e) => e.being_id === "B13")!.referential_form).toBeUndefined();
    expect(s2!.places_in_scene.entries).toBeNull();
    expect(s2!.places_in_scene._note).toBe("the text names no place in this scene (per meaning map)");
    expect(read(MC)).not.toContain("PL_NAOMIS_DWELLING");
    expect(rawMap).not.toContain("PL_NAOMIS_DWELLING");
    expect(rawMap).toContain("**3B — Places**\n\n- None: the text names no place in this scene.\n");
    const props = mc.level_3_propositions as { prop_id: string; cb_flags: string[]; event_specific_slots: Record<string, unknown> }[];
    expect(Object.keys(props.find((p) => p.prop_id === "P7")!.event_specific_slots)).not.toContain("where");
    // CB_0024 leaves the Scene 2 objects (CB_0044 carries the one word); it stays a flag at P11 (the P14 form).
    expect(s2!.objects_in_scene.entries.map((e) => e.object_id)).not.toContain("CB_0024");
    expect(props.find((p) => p.prop_id === "P11")!.cb_flags).toContain("CB_0024");
  });

  it("the pairs: FIG_0153 closes here, FIG_0156 mirrors the P11 row, no row for FIG_0139 or FIG_0142", () => {
    const pairs = cl.cross_pericope_pair_verification.pairs as { fig_id: string; closes_at: string; verification_status: string }[];
    expect(pairs.map((r) => `${r.fig_id}:${r.verification_status}`)).toEqual([
      "FIG_0153:VERIFIED", "FIG_0156:VERIFIED", "FIG_0150:VERIFIED", "FIG_0151:VERIFIED", "FIG_0152:VERIFIED", "FIG_0154:VERIFIED", "FIG_0155:VERIFIED",
    ]);
    expect(pairs.find((r) => r.fig_id === "FIG_0153")!.closes_at).toMatch(/^P10 P11 /);
    expect(pairs.find((r) => r.fig_id === "FIG_0156")!.closes_at).toMatch(/^P11 P1 /);
  });

  // Ruling D3 (a), (v)–(vi) (Marcia 2026-09-29). (i)–(iv) are pinned in the P08 guard; (vii) P02 waits.
  it("D3 (v): P04 R5 and its FIG_0084 row say the word is said again at 3:17, not 'the structural answer'", () => {
    const p04 = jsonBlock(read("fixtures/compilation-log/P04-Ruth-1-19-22-COMPILATION-LOG.md"));
    const r5 = (p04.high_risk_register_audit as Entry[]).find((e) => e.id === "R5")!;
    expect(r5.do_not_decide).toBe(true);
    expect(r5.note).toContain("it is said again at 3:17, in Boaz's words as Ruth reports them (P10 R4).");
    expect(r5.note).not.toContain("structural answer");
    const row = (p04.cross_pericope_pair_verification.pairs as { fig_id: string; note: string }[]).find((r) => r.fig_id === "FIG_0084")!;
    expect(row.note).toBe("Full-and-empty antithetical state-word pair; REQUIRED keep-image. The concept (CB_0024, CB_0044) recurs at P10 P11 (3:17); recorded in P10 R4.");
  });

  it("D3 (vi): Scene 2's title is 'To her mother-in-law: …' (3:16 does not say 'home')", () => {
    expect(rawMap).toContain("### Scene 2 — To her mother-in-law: the question, the report, and \"sit still\" (3:16–18)\n");
    expect(rawMap).not.toMatch(/### Scene 2 — Home/);
    // Scene 1's title stays: 'the secrecy word' matches her ruled 'keep the secret'.
    expect(rawMap).toContain("### Scene 1 — The dawn at the floor: the secrecy word and the six measures (3:14–15)\n");
  });

  it("registry labels (items 1 and 10): PL4 'The Town', O19 'The Matter', O16 'Six Measures of Barley'; old names kept as forms", () => {
    const reg = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    const ent = (reg.entities ?? reg.entries ?? reg) as Record<string, { english: string; referential_forms: string[] }>;
    expect(ent.PL4!.english).toBe("The Town");
    expect(ent.PL4!.referential_forms).toContain("The City"); // the approved P07 and the P10 links still bind
    expect(ent.O19!.english).toBe("The Matter");
    expect(ent.O19!.referential_forms).toContain("Word");
    expect(ent.O16!.english).toBe("Six Measures of Barley");
    expect(ent.O16!.referential_forms).toContain("Six Barley");
  });

  // SC-0089 follow-up (builder note 6, in her «sim»): the vault's bcd appears-in edits (vault patch 0002) ship
  // with this re-pin — B13 and B16 appear in P08 (3:2); Naomi's dwelling is named in neither P08 nor P10.
  it("registry appears_in (vault 0002 + the re-pin): B13 and B16 gain P08; PL_NAOMIS_DWELLING loses P08 and P10", () => {
    const reg = JSON.parse(read("_spec/registry/ruth.aliases.json"));
    const ent = reg.entities as Record<string, { appears_in: string[] }>;
    expect(ent.B13!.appears_in).toEqual(["P05", "P06", "P08", "P09", "P10", "P11", "P12", "P13", "P14"]);
    expect(ent.B16!.appears_in).toEqual(["P06", "P07", "P08"]);
    expect(ent.PL_NAOMIS_DWELLING!.appears_in).toEqual(["P05", "P07", "P13"]);
  });
});
