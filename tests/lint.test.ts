import { describe, it, expect } from "vitest";
import { lintForModel, lintMeaningMap } from "../src/engine/lint.js";

/**
 * The Level-3 / §3C content-discipline lint (drift-guard). Tests the four drift classes from
 * `_methodology/level3and3Ccontentdiscipline.md`, and the whole-word discipline that keeps it from
 * firing on legitimate content (it must not flag "adverb" for "verb", nor controlled slot-names).
 */

describe("lint — forbidden vocabulary (R4)", () => {
  it("flags grammatical jargon whole-word in §3C prose", () => {
    const md = `## 4. Level 3\n\n**3C — Objects and Elements**\n- What it is: hithpael participle marking resolve\n`;
    const r = lintMeaningMap(md);
    expect(r.findings.some((f) => f.rule === "forbidden_vocabulary" && f.match === "participle")).toBe(true);
  });
  it("does NOT flag a substring (verb ⊄ adverb) or a plain content word", () => {
    const md = `## 4. Level 3\n\n**3C — Objects and Elements**\n- What it is: she answered adverbially? no — she simply spoke softly\n`;
    const r = lintMeaningMap(md);
    expect(r.findings.some((f) => f.match === "verb")).toBe(false);
  });
});

describe("lint — interpretive labels (R3) + conditioning-in-Q&A (R5) + compound (R2)", () => {
  const md = [
    "## 4. Level 3",
    "",
    "**3C — Objects and Elements**",
    'וַתֹּאכַל / "she ate" — abundance triplet — three verbs',
    "- Signals: image-rhyme pair with v.3",
    "",
    "### Proposition 9 — Ruth 2:14 [Scene 3]",
    "- **Q:** What happened? **A:** speech-act of directive instruction",
    "- **Q:** Register? **A:** CEREMONIAL",
    "- **Q:** What did she do? **A:** she ate; she was satisfied",
  ].join("\n");
  const r = lintMeaningMap(md);
  it("flags interpretive labels (triplet, image-rhyme, speech-act of)", () => {
    for (const m of ["triplet", "image-rhyme", "speech-act of"]) expect(r.findings.some((f) => f.rule === "interpretive_label" && f.match === m), m).toBe(true);
  });
  it("flags a conditioning Q&A (Register?) as not-payload", () => {
    expect(r.findings.some((f) => f.rule === "conditioning_in_qa" && f.match === "register?")).toBe(true);
  });
  it("flags a compound (';' or 'and') answer as non-atomic", () => {
    expect(r.findings.some((f) => f.rule === "compound")).toBe(true);
  });
});

describe("lint — FOR_MODEL", () => {
  const fm = {
    level_2_scenes: [
      {
        scene_id: "S1",
        significant_absence: "no grief named",
        objects_in_scene: { entries: [
          { object_id: "TH_DEATH_OF_ELIMELECH", function_in_scene: "REMOVES_HUSBAND_FROM_HOUSEHOLD" },
          { object_id: "O1", function_in_scene: "AFFLICTION_THAT_TRIGGERS_DEPARTURE" },
        ] },
      },
    ],
    level_3_propositions: [
      // forbidden vocab lives in the VALUE (the compiled content), not the slot-name (spec's domain)
      { prop_id: "P9", event_specific_slots: { residual_form: "FIRST_OCCURRENCE_OF_SURVIVAL_VERB", action: "DWELT" } },
    ],
  };
  const r = lintForModel(fm);
  it("flags §3C objects that are really events/framings/patterns (R1)", () => {
    expect(r.findings.some((f) => f.rule === "section_3c_not_entity" && f.match === "TH_DEATH_OF_ELIMELECH")).toBe(true);
  });
  it("flags forbidden vocab inside a snake_case VALUE (…_VERB) but not the controlled id O1", () => {
    expect(r.findings.some((f) => f.rule === "forbidden_vocabulary" && f.match === "verb")).toBe(true);
    expect(r.findings.some((f) => f.context.includes("O1") && f.rule === "forbidden_vocabulary")).toBe(false);
  });
  it("a clean FOR_MODEL has no findings", () => {
    const clean = { level_2_scenes: [{ scene_id: "S1", objects_in_scene: { entries: [{ object_id: "O1", function_in_scene: "AFFLICTION" }] } }], level_3_propositions: [] };
    expect(lintForModel(clean).ok).toBe(true);
  });
});
