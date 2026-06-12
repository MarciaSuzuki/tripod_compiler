import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { alignProps, auditMints, calibrate, normalizeOverrides } from "../src/drafter/calibrate.js";

// SC-0063 Phase B acceptance: the calibration scorer is alignment-aware and smooths nothing.

describe("calibrate — proposition alignment by verse_anchor groups", () => {
  it("pairs in order within an anchor group and reports gold-only decomposition extras", () => {
    const drafted = [
      { prop_id: "P1", verse_anchor: "1:6a" },
      { prop_id: "P2", verse_anchor: "1:7a" },
    ];
    const gold = [
      { prop_id: "P1", verse_anchor: "1:6a" },
      { prop_id: "P2", verse_anchor: "1:6a" }, // gold decomposed 1:6a into two
      { prop_id: "P3", verse_anchor: "1:7a" },
    ];
    const pairs = alignProps(drafted, gold);
    expect(pairs.filter((p) => p.d && p.g)).toHaveLength(2);
    expect(pairs.find((p) => p.d?.prop_id === "P1")!.g.prop_id).toBe("P1");
    expect(pairs.find((p) => p.d?.prop_id === "P2")!.g.prop_id).toBe("P3");
    expect(pairs.filter((p) => !p.d && p.g).map((p) => p.g.prop_id)).toEqual(["P2"]);
  });
});

describe("calibrate — field scoring honesty", () => {
  const mk = (over: any = {}) => ({
    header: { book_context_ref: "ruth_pilot_BCD_v0_3" },
    pericope_classification: { register_overrides: { _note: "x", scene_level: null, moment_level: null } },
    level_1: { arc_elements: ["A", "B"], context_elements: [], tone_elements: [], pace_elements: [], communicative_function_elements: [] },
    level_2_scenes: [
      {
        scene_id: "S1",
        scene_kind: "OPENING_SCENE",
        beings_in_scene: { entries: [{ being_id: "B3", role_in_scene: "PLANNER", presence: "PRESENT" }] },
      },
    ],
    level_3_propositions: [
      {
        prop_id: "P1",
        verse_anchor: "3:1a",
        proposition_kind: "PLAN_PROPOSED",
        event_specific_slots: { planner: "B3" },
        inter_proposition_links: {},
      },
    ],
    ...over,
  });

  it("matches absent-vs-absent referential_form, ignores _note, records divergences verbatim", () => {
    const drafted = mk();
    const gold = mk();
    gold.level_2_scenes[0]!.scene_kind = "PLAN_SCENE";
    gold.pericope_classification.register_overrides._note = "different note text";
    const c = calibrate(drafted, gold);
    expect(c.fields.referential_form).toEqual({ matched: 1, divergent: 0, divergences: [] });
    expect(c.fields.register_overrides!.divergent).toBe(0); // _note ignored
    expect(c.fields.scene_kind!.divergent).toBe(1);
    expect(c.fields.scene_kind!.divergences[0]).toEqual({ where: "/S1", drafted: "OPENING_SCENE", gold: "PLAN_SCENE" });
  });

  it("lists gold-only beings and draft-added beings instead of scoring them", () => {
    const drafted = mk();
    drafted.level_2_scenes[0]!.beings_in_scene.entries.push({ being_id: "B99", role_in_scene: "EXTRA", presence: "REFERENCED" });
    const gold = mk();
    gold.level_2_scenes[0]!.beings_in_scene.entries.push({ being_id: "B7", role_in_scene: "WITNESS", presence: "REFERENCED" });
    const c = calibrate(drafted, gold);
    expect(c.alignment.beings.draftAdded).toEqual(["S1/B99"]);
    expect(c.alignment.beings.goldOnly).toEqual(["S1/B7"]);
    expect(c.alignment.beings.aligned).toBe(1);
  });

  it("set-compares level_1 and flags gold decomposition with a numbering-skew note", () => {
    const drafted = mk();
    const gold = mk({
      level_3_propositions: [
        { prop_id: "P1", verse_anchor: "3:1a", proposition_kind: "PLAN_PROPOSED", event_specific_slots: { planner: "B3" }, inter_proposition_links: {} },
        { prop_id: "P2", verse_anchor: "3:1b", proposition_kind: "REST_NAMED", event_specific_slots: {}, inter_proposition_links: {} },
      ],
    });
    gold.level_1.arc_elements = ["B", "C"];
    const c = calibrate(drafted, gold);
    expect(c.level1.arc_elements).toMatchObject({ exact: false, shared: ["B"], goldOnly: ["C"], draftOnly: ["A"] });
    expect(c.alignment.props.goldOnly).toEqual(["P2@3:1b"]);
    expect(c.notes.join(" ")).toMatch(/TRANSLATED into draft numbering/);
  });
});

describe("calibrate — link de-skew and format normalization", () => {
  it("translates gold link targets into draft numbering before comparing", () => {
    const base = (props: any[]) => ({
      header: {},
      pericope_classification: {},
      level_1: { arc_elements: [], context_elements: [], tone_elements: [], pace_elements: [], communicative_function_elements: [] },
      level_2_scenes: [],
      level_3_propositions: props,
    });
    const drafted = base([
      { prop_id: "P1", verse_anchor: "1:1a", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {} },
      { prop_id: "P2", verse_anchor: "1:1b", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: { caused_by: "P1" } },
    ]);
    const gold = base([
      { prop_id: "P1", verse_anchor: "1:1a", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {} },
      { prop_id: "P2", verse_anchor: "1:1a", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {} }, // gold-only
      { prop_id: "P3", verse_anchor: "1:1b", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: { caused_by: "P1" } },
    ]);
    const c = calibrate(drafted, gold);
    // drafted P2 ↔ gold P3; gold's caused_by P1 translates to draft P1 — a MATCH despite the skew
    expect(c.fields.inter_proposition_links).toMatchObject({ matched: 2, divergent: 0 });
  });

  it("normalizeOverrides: null ≡ [] ≡ absent, explicit-null entry keys dropped, judgment preserved", () => {
    expect(normalizeOverrides({ _note: "x", scene_level: null, moment_level: [] })).toEqual({ scene_level: null, moment_level: null });
    expect(
      normalizeOverrides({ scene_level: [{ scene_id: "S2", override_value: "INTIMATE", genre_override: null }], moment_level: null }),
    ).toEqual({ scene_level: [{ scene_id: "S2", override_value: "INTIMATE" }], moment_level: null });
  });
});

describe("auditMints — silent minting becomes mechanical findings", () => {
  it("classifies approved / declared / undeclared / closed-violation tokens", () => {
    const merged = {
      level_1: { arc_elements: ["AFFLICTION", "TOTALLY_NEW_ARC"] },
      level_2_scenes: [
        {
          scene_id: "S1",
          scene_kind: "OPENING_CHRONICLE_SCENE",
          beings_in_scene: { entries: [{ being_id: "B1", presence: "REFERENCED (off-stage)", role_in_scene: "CLAN" }] },
        },
      ],
      level_3_propositions: [
        {
          prop_id: "P1",
          proposition_kind: "MIGRATED",
          event_specific_slots: {
            action: "ARRIVED_AT",
            speech_act: "STATES_AS_TRUE",
            parts: [{ action: "NEVER_SEEN_ACTION", speech_act: "IMPERATIVE" }],
          },
        },
      ],
    };
    const fills = {
      fills: [{ location: "/level_1/arc_elements", value_json: "[]", note: null, vocabulary_additions: [{ axis: "arc_element", value: "TOTALLY_NEW_ARC", justification: "j" }] }],
      remarks: null,
    };
    const filled = ["/level_1/arc_elements", "/level_3_propositions/0/event_specific_slots"];
    const a = auditMints(merged, fills as any, filled);
    expect(a.declared.map((m) => m.value)).toEqual(["TOTALLY_NEW_ARC"]);
    expect(a.undeclared.map((m) => m.value).sort()).toEqual(["NEVER_SEEN_ACTION", "REFERENCED (off-stage)"]);
    expect(a.closedViolations.map((m) => m.value)).toEqual(["IMPERATIVE"]);
    // origin split: drafter-filled locations vs deterministic carry-through from the map
    const byValue = Object.fromEntries([...a.declared, ...a.undeclared, ...a.closedViolations].map((m) => [m.value, m.origin]));
    expect(byValue).toEqual({
      TOTALLY_NEW_ARC: "drafter",
      NEVER_SEEN_ACTION: "drafter",
      IMPERATIVE: "drafter",
      "REFERENCED (off-stage)": "map",
    });
  });
});

describe("calibrate — gold against itself is perfect", () => {
  it("real P02 gold vs P02 gold: zero divergences, exact arrays, full alignment", () => {
    const note = readFileSync("fixtures/for-model/P02-Ruth-1-6-14-FOR-MODEL.md", "utf8");
    const gold = JSON.parse(note.match(/```json\n([\s\S]*?)\n```/)![1]!);
    const c = calibrate(gold, gold);
    for (const [name, f] of Object.entries(c.fields)) expect({ name, divergent: f.divergent }).toEqual({ name, divergent: 0 });
    for (const a of Object.values(c.level1)) expect(a.exact).toBe(true);
    expect(c.alignment.props.goldOnly).toEqual([]);
    expect(c.alignment.props.draftOnly).toEqual([]);
    expect(c.alignment.beings.goldOnly).toEqual([]);
    expect(c.alignment.beings.draftAdded).toEqual([]);
  });
});
