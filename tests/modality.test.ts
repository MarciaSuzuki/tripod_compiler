import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "../src/engine/validate.js";
import { lintForModel } from "../src/engine/lint.js";
import { closedList } from "../src/spec/load.js";

// SC-0078 — Level-3 modality (Marcia ruled the model, option 1).
//  (1) a NEW bounded-open `status` realis axis on a proposition AND a component (drifts like
//      proposition_kind; seed PERMITTED/FORESEEN/RECALLED/COUNTERFACTUAL/NORM/HABITUAL; ASSERTED = omit).
//  (2) the closed SPEECH_ACT list grows 26 → 33, and (A2 make-impossible) a component speech_act outside
//      the closed list is now a hard BLOCK — enforced in the engine because speech_act rides in the
//      permissive event_specific_slots that ajv never inspects.
//  (3) the born-clean value-shape guard (SC-0073) covers `status` at BOTH levels.
// Pinned both ways; the no-regression guarantee (the 19 Ruth/Jonah FMs) lives in validate.test.ts.

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "..", "fixtures", "for-model");
const P01 = readFileSync(join(FIX, "P01-Ruth-1-1-5-FOR-MODEL.md"), "utf8");
const tmp = mkdtempSync(join(tmpdir(), "tripod-sc0078-"));
const write = (name: string, body: string) => {
  const f = join(tmp, name);
  writeFileSync(f, body);
  return f;
};
const driftOn = (r: ReturnType<typeof validateArtifact>, axis: string) =>
  r.findings.filter((f) => f.severity === "drift" && f.axis === axis);
const speechActBlocks = (r: ReturnType<typeof validateArtifact>) =>
  r.findings.filter((f) => f.severity === "block" && f.code === "closed-list" && f.axis === "speech_act");

describe("SC-0078 — the closed SPEECH_ACT list grows to 33", () => {
  const sa = closedList("SPEECH_ACT");
  it("has exactly 33 values", () => expect(sa).toHaveLength(33));
  it("carries the 7 ruled additions and keeps the 26", () => {
    for (const v of [
      "PROPOSES_COURSE_OF_ACTION", "PETITIONS_FOR_GRANT", "ASKS_DELIBERATIVE_QUESTION",
      "PRESCRIBES_AS_LAW", "ADVISES_COURSE_OF_ACTION", "RESOLVES_TO_ACT", "ALLEGES_AGAINST",
    ]) expect(sa).toContain(v);
    expect(sa).toContain("STATES_AS_TRUE"); // a representative pre-existing value survives
    expect(new Set(sa).size).toBe(33); // no duplicates
  });
});

describe("SC-0078 — `status` realis axis (bounded-open, drifts like proposition_kind)", () => {
  it("accepts a seed status on a proposition with zero drift", () => {
    const r = validateArtifact(write("status-ok-FOR-MODEL.md",
      P01.replace('"proposition_kind": "TIME_ANCHOR_ESTABLISHED",', '"proposition_kind": "TIME_ANCHOR_ESTABLISHED",\n      "status": "PERMITTED",')));
    expect(r.counts.block).toBe(0);
    expect(driftOn(r, "status")).toHaveLength(0);
  });

  it("surfaces an unseen proposition-level status as DRIFT (review signal, not a block)", () => {
    const r = validateArtifact(write("status-drift-FOR-MODEL.md",
      P01.replace('"proposition_kind": "TIME_ANCHOR_ESTABLISHED",', '"proposition_kind": "TIME_ANCHOR_ESTABLISHED",\n      "status": "INVENTED_MODE",')));
    expect(driftOn(r, "status")).toHaveLength(1);
    expect(driftOn(r, "status")[0].value).toBe("INVENTED_MODE");
    expect(r.counts.block).toBe(0); // bounded-open → drift, never block
  });

  it("surfaces an unseen COMPONENT-level status as DRIFT (the ess walk reaches it)", () => {
    const r = validateArtifact(write("status-comp-drift-FOR-MODEL.md",
      P01.replace('"speech_act": "STATES_AS_TRUE"', '"speech_act": "STATES_AS_TRUE", "status": "INVENTED_MODE"')));
    expect(driftOn(r, "status").some((f) => f.value === "INVENTED_MODE")).toBe(true);
    expect(r.counts.block).toBe(0);
  });
});

describe("SC-0078 (A2) — component speech_act is a CLOSED list, enforced in the engine", () => {
  it("BLOCKS an invented component speech_act (the gap A2 closes)", () => {
    const r = validateArtifact(write("bad-speechact-FOR-MODEL.md",
      P01.replace('"speech_act": "STATES_AS_TRUE"', '"speech_act": "BOGUS_INVENTED_SPEECH_ACT"')));
    expect(r.ok).toBe(false);
    expect(speechActBlocks(r)).toHaveLength(1);
    expect(speechActBlocks(r)[0].value).toBe("BOGUS_INVENTED_SPEECH_ACT");
  });

  it("ACCEPTS one of the 7 new speech_act values on a component", () => {
    const r = validateArtifact(write("new-speechact-FOR-MODEL.md",
      P01.replace('"speech_act": "STATES_AS_TRUE"', '"speech_act": "PETITIONS_FOR_GRANT"')));
    expect(speechActBlocks(r)).toHaveLength(0);
    expect(r.counts.block).toBe(0);
  });

  it("the clean P01 has no speech_act block", () => {
    const r = validateArtifact(join(FIX, "P01-Ruth-1-1-5-FOR-MODEL.md"));
    expect(speechActBlocks(r)).toHaveLength(0);
  });
});

describe("SC-0078 — born-clean value-shape guard (SC-0073) covers `status` at both levels", () => {
  const vs = (fm: any) => lintForModel(fm).findings.filter((f) => f.rule === "value_shape_prose");
  it("BLOCKS a prose-shaped proposition-level status", () => {
    const f = vs({ level_3_propositions: [{ prop_id: "P1", status: "CONTENT_THAT_THE_KING_GRANTED_LEAVE_TO_DESTROY" }] });
    expect(f.some((x) => x.match === "CONTENT_THAT_THE_KING_GRANTED_LEAVE_TO_DESTROY")).toBe(true);
  });
  it("BLOCKS a prose-shaped component-level status (rides inside ess)", () => {
    const f = vs({ level_3_propositions: [{ prop_id: "P1", event_specific_slots: { grant_components: [{ status: "CONTENT_THAT_THE_KING_GRANTED_LEAVE_TO_DESTROY", list_position: "FIRST" }] } }] });
    expect(f.some((x) => x.match === "CONTENT_THAT_THE_KING_GRANTED_LEAVE_TO_DESTROY")).toBe(true);
  });
  it("stays SILENT on the 1-token seed values at both levels (below the ≥4-token line)", () => {
    const propLevel = vs({ level_3_propositions: [{ prop_id: "P1", status: "PERMITTED" }] });
    const compLevel = vs({ level_3_propositions: [{ prop_id: "P1", event_specific_slots: { grant_components: [{ status: "NORM", list_position: "FIRST" }] } }] });
    expect(propLevel).toHaveLength(0);
    expect(compLevel).toHaveLength(0);
  });
});
