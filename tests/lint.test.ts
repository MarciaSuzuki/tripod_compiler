import { describe, it, expect } from "vitest";
import { lintForModel, lintMeaningMap, applyLintExceptions, type LintException } from "../src/engine/lint.js";

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
  it("FLAGS a cross_ref / inter-proposition-link line in §4 as link_in_level3 (operating test)", () => {
    const md = [
      "## 4. Level 3",
      "",
      "### Proposition 5 — Ruth 1:3 [Scene 2]",
      "- **Q:** What happened? **A:** death",
      "- **cross_ref:** [[FIG_0052-Tishaer-Residual-Rhyme]] opens here (within-pericope image-rhyme pair)",
    ].join("\n");
    const lr = lintMeaningMap(md);
    // the cross_ref line is now FLAGGED (it does not belong inline in a Level-3 block)…
    expect(lr.findings.some((f) => f.rule === "link_in_level3" && f.match === "cross_ref")).toBe(true);
    // …the payload answer "death" stays clean…
    expect(lr.findings.some((f) => f.context.includes("death"))).toBe(false);
    // …and because the link line short-circuits, its FIG_0052 / image-rhyme text is reported
    // exactly once (as the single link finding), never double-counted as an interpretive_label.
    expect(lr.findings.filter((f) => f.context.includes("FIG_0052")).length).toBe(1);
    expect(lr.findings.some((f) => f.match === "image-rhyme")).toBe(false);
  });

  it("flags an analytical meta-question, but not a plain payload question", () => {
    const meta = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 1:1 [Scene 1]", "- **Q:** Construction form? **A:** vayyiqer miqreha"].join("\n"),
    );
    expect(meta.findings.some((f) => f.rule === "meta_question")).toBe(true);
    const plain = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 1:1 [Scene 1]", "- **Q:** What happened? **A:** the famine came"].join("\n"),
    );
    expect(plain.findings.some((f) => f.rule === "meta_question")).toBe(false);
  });

  it("scans the QUESTION side for forbidden vocabulary (not just answers)", () => {
    const r = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 1:1 [Scene 1]", "- **Q:** First verb? **A:** went"].join("\n"),
    );
    expect(r.findings.some((f) => f.rule === "forbidden_vocabulary" && f.match === "verb")).toBe(true);
  });

  it("flags a soft answer-label in a §4 ANSWER (it labels the act instead of stating it)", () => {
    const r = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 7 — Ruth 2:11 [Scene 2]", "- **Q:** What did Boaz do? **A:** Boaz answers with full-knowledge declaration"].join("\n"),
    );
    expect(r.findings.some((f) => f.rule === "interpretive_label" && f.match === "answers with")).toBe(true);
    expect(r.findings.some((f) => f.rule === "interpretive_label" && f.match === "declaration")).toBe(true);
  });

  it("flags a comma compound but exempts an entity-list answer (', ' and ' and ' guards)", () => {
    const compound = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 2:14 [Scene 3]", "- **Q:** What did she do? **A:** she ate, she was satisfied"].join("\n"),
    );
    expect(compound.findings.some((f) => f.rule === "compound")).toBe(true);
    const entityComma = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 1:2 [Scene 1]", "- **Q:** Who arrived? **A:** the family [[B2-Elimelech]] Elimelech, [[B3-Naomi]] Naomi"].join("\n"),
    );
    expect(entityComma.findings.some((f) => f.rule === "compound")).toBe(false);
    const entityAnd = lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 1 — Ruth 1:2 [Scene 1]", "- **Q:** With whom? **A:** his two sons [[B4-Mahlon]] Mahlon and [[B5-Chilion]] Chilion"].join("\n"),
    );
    expect(entityAnd.findings.some((f) => f.rule === "compound")).toBe(false);
  });
});

describe("lint — reviewer sign-off (lint-exceptions, SC-0010 pattern)", () => {
  const mk = () =>
    lintMeaningMap(
      ["## 4. Level 3", "", "### Proposition 3 — Ruth 2:2b [Scene 2]", '- **Q:** What did she say? **A:** "go, my daughter"'].join("\n"),
      "fixtures/meaning-map/P05-Ruth-2-1-7.md",
    );
  const ex: LintException[] = [
    { pericope: "P05-Ruth-2-1-7", rule: "compound", match: ",", context_prefix: '"go, my daughter"', reason: "VOCATIVE", accepted_by: "Marcia Suzuki" },
  ];
  it("surfaces the finding as drift before sign-off (engine stays pure)", () => {
    const r = mk();
    expect(r.ok).toBe(false);
    expect(r.findings.some((f) => f.rule === "compound" && !f.accepted)).toBe(true);
  });
  it("downgrades a matched finding to accepted (kept in report, excluded from drift)", () => {
    const r = applyLintExceptions(mk(), ex);
    expect(r.ok).toBe(true); // no un-accepted drift
    expect(r.counts.accepted).toBe(1);
    expect(r.counts.tier2).toBe(0);
    const f = r.findings.find((x) => x.rule === "compound");
    expect(f?.accepted?.reason).toBe("VOCATIVE");
  });
  it("does NOT downgrade when pericope or context_prefix doesn't match (no over-broad suppression)", () => {
    const wrongPericope = applyLintExceptions(mk(), [{ ...ex[0]!, pericope: "P02-Ruth-1-6-14" }]);
    expect(wrongPericope.ok).toBe(false);
    const wrongContext = applyLintExceptions(mk(), [{ ...ex[0]!, context_prefix: "some other line" }]);
    expect(wrongContext.ok).toBe(false);
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
  it("does NOT flag a soft answer-label inside a closed-list speech_act value (out of scope)", () => {
    // The §4-answer labels (declaration/recital/…) must never fire on a governed FOR_MODEL enum
    // value or a §3C relocation note — only on a meaning-map §4 answer. Guards the scope boundary.
    const fm = {
      level_2_scenes: [{ scene_id: "S1", objects_in_scene: { entries: [{ object_id: "CB_0011", function_in_scene: "HESED" }], _note: "§3C entities only (SC-0013): full-knowledge recital relocated to P7." } }],
      level_3_propositions: [{ prop_id: "P8", event_specific_slots: { speech_act: "REFUSES_REQUEST_WITH_COUNTER_DECLARATION" } }],
    };
    const r = lintForModel(fm);
    expect(r.findings.some((f) => f.rule === "interpretive_label")).toBe(false);
    expect(r.ok).toBe(true);
  });
  it("SC-0030: flags a `meaning` key or prose-shaped value in Level-3 event_specific_slots (the relocated vector)", () => {
    const withMeaning = { level_2_scenes: [], level_3_propositions: [
      { prop_id: "P1", event_specific_slots: { components: [{ action: "VOWED", list_position: "FIRST", meaning: "she binds herself to go" }] } },
    ] };
    expect(lintForModel(withMeaning).findings.some((f) => f.rule === "l3_free_text" && f.match === "meaning")).toBe(true);
    const withProse = { level_2_scenes: [], level_3_propositions: [
      { prop_id: "P1", event_specific_slots: { note: "this is a prose clause" } },
    ] };
    expect(lintForModel(withProse).findings.some((f) => f.rule === "l3_free_text")).toBe(true);
  });
  it("SC-0030: does NOT flag UPPER_SNAKE slot values (the sentence-token triage is a separate cycle)", () => {
    const fm = { level_2_scenes: [], level_3_propositions: [
      { prop_id: "P1", event_specific_slots: { vow_structural_form: "SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL", components: [{ action: "VOWED", list_position: "FIRST" }] } },
    ] };
    expect(lintForModel(fm).findings.some((f) => f.rule === "l3_free_text")).toBe(false);
  });
});
