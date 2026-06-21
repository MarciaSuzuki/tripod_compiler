import { describe, it, expect } from "vitest";
import { lintForModel } from "../src/engine/lint.js";

// SC-0070 — the slot-NAME role-vocabulary guard. The forbidden-vocab rule ran prose-only, so banned
// grammatical/thematic-role terms in event_specific_slots KEY names slipped through (Marcia's catch).
// This proves the guard bites both ways: it BLOCKS a planted banned slot-name, and stays SILENT where it
// must (the renamed names, the ruled keep-list speaker/addressee, referential_form, and the L2 namespace).
describe("SC-0070 slot-name role-vocabulary guard", () => {
  const slot = (fm: any) => lintForModel(fm).findings.filter((f) => f.rule === "slot_name_role_vocab");

  it("BLOCKS a planted banned slot-name in event_specific_slots (agent_named), tier 1", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: { agent_named: "B10", action: "PROVIDED" } }] };
    const f = slot(fm);
    expect(f.length).toBe(1);
    expect(f[0].match).toBe("agent_named");
    expect(f[0].tier).toBe(1);
  });

  it("BLOCKS a banned slot-name nested inside a *_components array", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: { vow_components: [{ recipient: "B3", speech_act: "VOWS" }] } }] };
    expect(slot(fm).some((f) => f.match === "recipient")).toBe(true);
  });

  it("flags every banned-token family (subject/object/source/locus/owner/argument/antecedent/referent/beneficiary)", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: {
      creed_subject: "x", fear_object: "x", drink_source: "x", proclamation_locus: "x",
      salvation_owner: "x", argument_role: "x", hesed_antecedent: "x", clan_referent: "x", beneficiary: "B3",
    } }] };
    expect(slot(fm).length).toBe(9);
  });

  it("stays SILENT on the ruled keep-list (speaker / addressee / addressees)", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: { speaker: "B3", addressee: "B9", addressees: ["B8", "B9"] } }] };
    expect(slot(fm).length).toBe(0);
  });

  it("stays SILENT on the SC-0070 renamed names (named_doer / invoked_deity / blessed_party / bound_to / comparison_rank)", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: { named_doer: "B10", invoked_deity: "B10", blessed_party: "B3", bound_to: "B3", comparison_rank: "GREATER_TERM" } }] };
    expect(slot(fm).length).toBe(0);
  });

  it("does NOT false-flag referential_form via the 'referent' prefix (token match, not substring)", () => {
    const fm = { level_3_propositions: [{ prop_id: "P1", event_specific_slots: { referential_form: "HA_ISH", invoked_deity_referential_form: "YHWH" } }] };
    expect(slot(fm).length).toBe(0);
  });

  it("is scoped to event_specific_slots — never the sanctioned L2 objects_in_scene / object_id namespace", () => {
    const fm = { level_2_scenes: [{ scene_id: "S1", objects_in_scene: { entries: [{ object_id: "O1", function_in_scene: "AFFLICTION" }] } }], level_3_propositions: [] };
    expect(slot(fm).length).toBe(0);
  });
});
