import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0088 — regression guard for P14 (Ruth 4:18–22) under Marcia's map standard of 2026-09-28
 * («(a), sim, pode seguir com as recomendações», item 16 included) and her ruling D1 (b) of 2026-09-28
 * («(b), (b), (a), sim — pode seguir com as recomendações»).
 *
 * The voice reads the map prose (frontmatter stripped, [[CODE]] only); the Validator reads the
 * Coordinates' significant absences and the do_not_decide notes. The standard took out of P14 what the
 * text does not say: "the king" / "a king's lineage", "the redeemed child" / "household", "hinge",
 * "destination", "arrival", "claim", the completion and fulfilment frames ("completes", "answers the
 * prologue", "traced in full", "the long consequence of YHWH's gift"), "cradle", "the patriarchs", "the
 * single divine act of the book", the narrator's "vantage", "begot" (the map says "fathered"), and
 * "formal" in a passage that is INFORMAL_CASUAL throughout. The count is fixed (Boaz the seventh name,
 * Obed the eighth). Ruling D1 (b): a team's "King David" is a nuance, named once — «a história dá só o
 * nome dele, Davi» — without a send-back, the same rule and words as P13 R8. A future governed change
 * that re-rules P14 edits this list.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const jsonBlock = (text: string) => JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);

const MAP = "fixtures/meaning-map/P14-Ruth-4-18-22.md";
const MC = "fixtures/meaning-coordinates/P14-Ruth-4-18-22-MEANING-COORDINATES.md";
const CL = "fixtures/compilation-log/P14-Ruth-4-18-22-COMPILATION-LOG.md";

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

type Entry = { id: string; kind: string; note: string; do_not_decide?: boolean; required_in_audit?: boolean; source_in_meaning_map?: string };
const audit = cl.high_risk_register_audit as Entry[];
const note = (id: string) => audit.find((e) => e.id === id)!.note;
const dndNotes = audit.filter((e) => e.do_not_decide).map((e) => e.note).join("\n");

const BANNED_IN_MAP_AND_MC = [
  "redeemed", "hinge", "destination", "arrival", "claim", "the line he served", "traveling", "rescue",
  "completes", "completion", "traced in full", "answers", "fulfil", "prologue", "inclusio", "consequence",
  "yhwh's gift", "the weight", "though the book", "vantage", "cradle", "seated", "patriarch",
  "single divine act", "named only here", "seventh name and", "feared cut off", "begot", "royal",
  // 'neighbor-women' with the hyphen (cross-check); 'the people at the gate and the elders' for 4:11–12
  "neighbor women",
];
// The do_not_decide notes may name what must not be said ("God gave", "YHWH's gift of conception"),
// and R1 lists 'begot' among the accepted words for 'fathered', so their list is narrower.
const BANNED_IN_RULE_NOTES = ["redeemed", "hinge", "destination", "completes", "fulfil", "prologue", "inclusio", "royal", "patriarch"];

// R6's never-list names the word it forbids ('fulfilment'); that one sentence is left out of the ban check.
const R6_NEVER = "For the voice only, never to be said: do not present the list as the answer to the blessing or as its fulfilment.";

const lowHits = (text: string, list: string[]) => list.filter((w) => text.toLowerCase().includes(w));

// The one D1 rule, word for word the same in P13 R8 and P14 R4.
const D1_NEVER = "For the voice only, never to be said: do not call David king, say who he is or will be, or bring in anything from other books; if asked, the text gives only his name.";
const D1_NUANCE = "A team telling 'King David' ('o rei Davi') is a nuance: the voice names it once — 'a história dá só o nome dele, Davi' ('the story gives only his name, David') — without a send-back, and moves on.";

describe("SC-0088 — P14 rulings guard (what the app reads)", () => {
  it("the P14 map, as the voice reads it, carries none of the removed wording (never 'king', never 'formal')", () => {
    expect(lowHits(voiceText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(voiceText).not.toMatch(/\bking\b|\bkings\b|\bformal\b/i);
  });

  it("the P14 Meaning Coordinates' prose carries none of the removed wording", () => {
    expect(mcProse.length).toBeGreaterThan(2);
    expect(lowHits(mcProseText, BANNED_IN_MAP_AND_MC)).toEqual([]);
    expect(mcProseText).not.toMatch(/\bking\b/i);
  });

  it("the P14 do_not_decide notes carry none of the removed wording", () => {
    expect(dndNotes).toContain(R6_NEVER);
    expect(lowHits(dndNotes.replace(R6_NEVER, ""), BANNED_IN_RULE_NOTES)).toEqual([]);
  });

  it("the register has R1–R11, do_not_decide exactly on R1–R6, every entry traced to the map", () => {
    // Marcia 2026-09-28, after the session: «Pode passar as regras do tipo nunca para o validador» (P14-D6).
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 11 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R3", "R4", "R5", "R6"]);
    expect(audit.filter((e) => /never to be said/.test(e.note) && !e.do_not_decide).map((e) => e.id)).toEqual([]);
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

  it("the Coordinates' scene purpose and absence are the map's 3F and Significant Absence texts", () => {
    const scenes = mc.level_2_scenes as { scene_id: string; scene_communicative_purpose: string; significant_absence: string }[];
    expect(scenes.map((s) => s.scene_id)).toEqual(["S1"]);
    const s = scenes[0]!;
    expect(rawMap).toContain(`**3F — Communicative Purpose**\n${s.scene_communicative_purpose}\n`);
    expect(rawMap).toContain(`**Significant Absence**\n${s.significant_absence}\n`);
    expect(s.significant_absence).toBe(
      "The list names no woman — not Tamar, not Ruth, not Naomi; it names only fathers and sons. It does not name God. It adds no comment on David; the list stops at his name.",
    );
  });

  it("D1 (b): 'King David' is a nuance named once — P14 R4 carries the same rule, word for word, as P13 R8", () => {
    const r4 = audit.find((e) => e.id === "R4")!;
    expect(r4.do_not_decide).toBe(true);
    expect(r4.note).toContain(D1_NEVER);
    expect(r4.note).toContain(D1_NUANCE);
    expect(r4.note).not.toMatch(/offered back|told again/);
  });

  it("the list as the text tells it: ten names in order, 'X fathered Y' nine times, Boaz seventh and Obed eighth", () => {
    const e3 = rawMap.match(/\*\*3E — What Happens\*\*\n([^\n]*)\n/)![1]!
      .replace(/\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]\s*/g, "");
    expect(e3).toBe(
      "These are the generations of Perez. Perez fathered Hezron, and Hezron fathered Ram, and Ram fathered Amminadab, and Amminadab fathered Nahshon, and Nahshon fathered Salmon, and Salmon fathered Boaz, and Boaz fathered Obed, and Obed fathered Jesse, and Jesse fathered David.",
    );
    expect(e3.split(" fathered ").length - 1).toBe(9);
    expect(rawMap).toContain("- Role: the seventh name — the Boaz of the story, here one name in the line");
    expect(rawMap).toContain("- Role: the eighth name — the child named Obed at 4:17; Boaz before him, Jesse and David after");
    expect(note("R1")).toContain("A telling that leaves a name out is offered back gently as a missing detail.");
    expect(note("R2")).toContain("A team telling that recalls Perez as the son Tamar bore to Judah (4:12), or Obed as the son Ruth bore (4:13), is correct; accept it without comment.");
  });

  it("looks back only through the same names; 4:17's closing line is the narrator's", () => {
    expect(rawMap).toContain("the neighbor-women named the child Obed, and the narrator added: \"he is the father of Jesse, the father of David\" (4:17).");
    expect(rawMap).toContain("- Relationship: the line from Perez down to Salmon, Boaz's father\n");
    expect(rawMap).toContain("- Relationship: son of Boaz; father of Jesse\n");
    expect(rawMap).toContain("- [[FIG_0189-Book-Closing-Inclusio-with-Prologue]] — active at Proposition 10 (David, the last word of the book)");
    expect(rawMap).toContain("- [[FIG_0194-Divine-Gift-Consequences-Enumerated]] — active at Propositions 8, 9, and 10 (Boaz fathered Obed, Obed fathered Jesse, Jesse fathered David)");
  });

  it("coverage fix: the MC Scene 1 objects are only CB_0049; CB_0005, CB_0047, CB_0048 stay concept flags", () => {
    const s1 = (mc.level_2_scenes as { objects_in_scene: { entries: { object_id: string }[] } }[])[0]!;
    expect(s1.objects_in_scene.entries.map((e) => e.object_id)).toEqual(["CB_0049"]);
    const flags = new Set((mc.level_3_propositions as { cb_flags: string[] }[]).flatMap((p) => p.cb_flags));
    for (const cb of ["CB_0005", "CB_0047", "CB_0048", "CB_0049"]) expect(flags.has(cb), cb).toBe(true);
    expect(rawMap.split("[[B27-Perez-and-His-Descendants]]").length - 1).toBe(3);
  });

  it("the pairs close here, all VERIFIED: FIG_0191 (P12), FIG_0192, FIG_0189, FIG_0194 (P13), FIG_0193, FIG_0190", () => {
    const pairs = cl.cross_pericope_pair_verification.pairs as { fig_id: string; verification_status: string }[];
    expect(pairs.map((r) => `${r.fig_id}:${r.verification_status}`)).toEqual([
      "FIG_0191:VERIFIED", "FIG_0192:VERIFIED", "FIG_0189:VERIFIED", "FIG_0194:VERIFIED", "FIG_0193:VERIFIED", "FIG_0190:VERIFIED",
    ]);
  });
});
