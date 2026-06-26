import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { lintForModel } from "../src/engine/lint.js";
import { readArtifactNote } from "../src/reader/obsidian.js";

// SC-0073 — the value-SHAPE prose guard. The VALUE analogue of the SC-0070 slot-name guard and the
// make-impossible capstone of the post-Jonah sentence-token triage: a sentence-shaped UPPER_SNAKE VALUE in
// event_specific_slots is prose-in-disguise. The guard exempts by membership FIRST (approved-enum / closed-
// list / code / referential-form family / kept-form slots / the 4 ruled KEEPs / the preserve_form clauses
// via quarantine), THEN applies a ≥4-token shape test to the remainder. Post-SC-0072 the clean corpus has 0
// non-exempt ≥4-token values, so the guard is SILENT on the seed while still BLOCKing a re-introduced clause.
// These tests pin it both ways (the SC-0070 test is the template). Calibration:
// docs/SC-0073-VALUE-SHAPE-GUARD-SHEET.md.
describe("SC-0073 value-shape prose guard", () => {
  const vs = (fm: any) => lintForModel(fm).findings.filter((f) => f.rule === "value_shape_prose");
  const ess = (slots: any) => ({ level_3_propositions: [{ prop_id: "P1", event_specific_slots: slots }] });

  // ── BLOCKS (fires, tier 1) ───────────────────────────────────────────────
  it("BLOCKS a re-introduced clause in a plain ess slot, tier 1", () => {
    const f = vs(ess({ request_content: "WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE" }));
    expect(f.length).toBe(1);
    expect(f[0].match).toBe("WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE");
    expect(f[0].tier).toBe(1);
  });

  it("BLOCKS a clause nested inside a *_components array (the walk descends into components)", () => {
    const f = vs(ess({ response_components: [{ narration: "SHE_WENT_DOWN_TO_THE_THRESHING_FLOOR_THAT_NIGHT", list_position: "FIRST" }] }));
    expect(f.some((x) => x.match === "SHE_WENT_DOWN_TO_THE_THRESHING_FLOOR_THAT_NIGHT")).toBe(true);
  });

  it("BLOCKS exactly at the 4-token boundary (a non-exempt 4-word value)", () => {
    expect(vs(ess({ narrative_detail: "SHE_RAN_TO_FIELD" })).length).toBe(1); // 4 tokens → fires
    expect(vs(ess({ narrative_detail: "RAN_TO_FIELD" })).length).toBe(0); // 3 tokens → below the line
  });

  // ── SILENT (no finding) ──────────────────────────────────────────────────
  it("stays SILENT on the 4 explicit KEEPs in their real slots (incl. the 3 in non-kept-form slots)", () => {
    expect(vs(ess({
      compliance_marker: "ACCORDING_TO_WORD_OF_YHWH",
      question_about: "IDENTITY_RECOGNITION_AND_STANDING",
      attestation_name: "THE_ATTESTATION_IN_ISRAEL",
      living_and_dead_form: "ET_HACHAYIM_VEET_HAMETIM",
    })).length).toBe(0);
  });

  it("stays SILENT on the 2 Ruth 2:13 preserve_form clauses (exempt via quarantined-vocabulary, E7)", () => {
    expect(vs(ess({ response_components: [
      { action: "STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH", speech_act: "STATES_AS_TRUE" },
      { action: "STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT", speech_act: "STATES_LAMENT_OBSERVATION" },
    ] })).length).toBe(0);
  });

  it("stays SILENT on a long closed-list speech_act value (E2)", () => {
    expect(vs(ess({ speaker: "B3", speech_act: "REFUSES_REQUEST_WITH_COUNTER_DECLARATION" })).length).toBe(0);
  });

  it("stays SILENT on a referential form in a *_referential_form slot, and an R1 address slot (E4)", () => {
    expect(vs(ess({
      kissed_referential_form: "RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW",
      address_form: "PELONI_ALMONI_NON_NAME",
    })).length).toBe(0);
  });

  it("stays SILENT on a kept structural form in a kept-form slot (E5)", () => {
    expect(vs(ess({ vow_structural_form: "SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL" })).length).toBe(0);
  });

  it("stays SILENT on code-namespace values and a governed action verb / compact label (E1/E3)", () => {
    expect(vs(ess({
      when: "TM_PERIOD_OF_JUDGES",
      where: "PL_LAND_OF_JUDAH",
      action: "DREW_OFF_SANDAL",
      harvest: "BARLEY_HARVEST",
    })).length).toBe(0);
  });

  // ── corpus-level (the clean-seed guarantee + the anti-drift invariant) ────
  const FM_DIR = "fixtures/for-model";
  const fixtures = readdirSync(FM_DIR).filter((f) => f.endsWith(".md"));

  it("whole-corpus: linting all 19 FOR_MODEL fixtures yields 0 value_shape_prose findings", () => {
    for (const f of fixtures) {
      const json = readArtifactNote(join(FM_DIR, f)).json as any;
      expect(vs(json), `${f} value_shape_prose`).toEqual([]);
    }
  });

  // Anti-drift invariant (Evaluator's hardening): every preserve_form:true value resolved from the FM
  // fidelity block must be exempt — i.e. never appear in that fixture's value_shape_prose findings. Pins
  // E7 to the FM flags themselves, so the guard can't drift from a future-added protected clause.
  it("anti-drift: every preserve_form:true value is on the exempt set (never flagged)", () => {
    let checked = 0;
    for (const f of fixtures) {
      const json = readArtifactNote(join(FM_DIR, f)).json as any;
      const refs = new Set<string>();
      const add = (r: any) => r && refs.add(`${r.prop_id}|${r.slot}|${r.list_position}`);
      const fid = json.fidelity ?? {};
      for (const el of fid.elements ?? []) if (el?.preserve_form) add(el.ref);
      for (const g of fid.groups ?? []) if (g?.preserve_form) for (const m of g.members ?? []) add(m);
      const preserved: string[] = [];
      for (const prop of json.level_3_propositions ?? []) {
        for (const [slot, arr] of Object.entries(prop.event_specific_slots ?? {})) {
          if (Array.isArray(arr)) for (const comp of arr) {
            if (comp && typeof comp === "object" && refs.has(`${prop.prop_id}|${slot}|${(comp as any).list_position}`)) {
              for (const [k, v] of Object.entries(comp)) if (k !== "speech_act" && typeof v === "string") preserved.push(v);
            }
          }
        }
      }
      const flagged = new Set(vs(json).map((x) => x.match));
      for (const v of preserved) {
        checked++;
        expect(flagged.has(v), `${f}: preserve_form value ${v} must be exempt`).toBe(false);
      }
    }
    expect(checked).toBeGreaterThan(0); // the invariant actually exercised ≥1 preserve clause (P06)
  });
});
