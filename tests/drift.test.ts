import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { axisClass } from "../src/spec/load.js";
import { driftBaseline, loadApprovedEnumerations } from "../src/spec/enumerations.js";
import { vocabularyFindings } from "../src/engine/vocabulary.js";
import { validateArtifact } from "../src/engine/validate.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { planPromotion, applyPromotion, UNCOVERED_CONVERGENT_AXES } from "../src/compiler/promote.js";

const here = dirname(fileURLToPath(import.meta.url));
const FM = (n: string) => join(here, "..", "fixtures", "for-model", n);
const CL = (n: string) => join(here, "..", "fixtures", "compilation-log", n);
const P02_FM = "P02-Ruth-1-6-14-FOR-MODEL.md";
const P02_CL = "P02-Ruth-1-6-14-COMPILATION-LOG.md";

describe("axis classification (convergent vs descriptive)", () => {
  it("convergent axes", () => {
    for (const k of ["proposition_kind", "scene_kind", "presence_value", "arc_element", "context_element", "tone_element", "pace_element", "communicative_function_element", "discourse_thread_state", "high_risk_register_kind"])
      expect(axisClass(k), k).toBe("convergent");
  });
  it("descriptive axes (_examples + referential_form)", () => {
    for (const k of ["role_in_scene_examples_being", "role_in_scene_examples_place", "function_in_scene_examples_object", "object_kind_examples", "referential_form"])
      expect(axisClass(k), k).toBe("descriptive");
  });
});

describe("drift report split (P02)", () => {
  const r = validateArtifact(FM(P02_FM));
  it("separates convergent drift from descriptive; open axes are never counted as drift", () => {
    expect(r.counts.drift).toBeGreaterThan(0); // convergent review-signal
    expect(r.counts.descriptive).toBeGreaterThan(0); // open / informational
    for (const f of r.findings) {
      if (f.severity === "drift") expect(axisClass(f.axis!)).toBe("convergent");
      if (f.severity === "descriptive") expect(axisClass(f.axis!)).toBe("descriptive");
    }
    const driftAxes = new Set(r.findings.filter((f) => f.severity === "drift").map((f) => f.axis));
    for (const open of ["role_in_scene_examples_being", "function_in_scene_examples_object", "referential_form"])
      expect(driftAxes.has(open)).toBe(false);
  });
});

describe("accumulation converges drift (promote P02 → re-validate)", () => {
  const p02 = readArtifactNote(FM(P02_FM)).json as any;
  const driftOn = (axis: string, baseline: Record<string, string[]>) =>
    vocabularyFindings(p02, baseline).filter((f) => f.severity === "drift" && f.axis === axis).length;

  it("promoting P02's vocabulary_additions zeroes proposition_kind + scene_kind drift", () => {
    expect(driftOn("proposition_kind", driftBaseline())).toBeGreaterThan(0);

    const plan = planPromotion(CL(P02_CL), { status: "ANY" });
    expect(plan.promote.length).toBeGreaterThan(0);
    const { reg: grown, added } = applyPromotion(loadApprovedEnumerations(), plan);
    expect(added.length).toBe(plan.promote.length);

    const remaining = vocabularyFindings(p02, driftBaseline(grown)).filter((f) => f.severity === "drift");
    expect(remaining.filter((f) => f.axis === "proposition_kind").length).toBe(0);
    expect(remaining.filter((f) => f.axis === "scene_kind").length).toBe(0);
    // whatever convergent drift remains is only on axes the COMPILATION-LOG cannot promote yet
    for (const f of remaining) expect(UNCOVERED_CONVERGENT_AXES, `unexpected residual axis ${f.axis}`).toContain(f.axis);
  });

  it("the CONFIRMED status gate promotes fewer than ANY", () => {
    const confirmed = planPromotion(CL(P02_CL), { status: "CONFIRMED" });
    const any = planPromotion(CL(P02_CL), { status: "ANY" });
    expect(confirmed.promote.length).toBeLessThan(any.promote.length);
  });

  it("promotion does not mutate the loaded registry (pure)", () => {
    const before = loadApprovedEnumerations().axes["proposition_kind"]!.length;
    applyPromotion(loadApprovedEnumerations(), planPromotion(CL(P02_CL), { status: "ANY" }));
    expect(loadApprovedEnumerations().axes["proposition_kind"]!.length).toBe(before);
  });
});
