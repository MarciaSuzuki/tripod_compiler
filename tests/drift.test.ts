import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { axisClass } from "../src/spec/load.js";
import { driftBaseline, loadApprovedEnumerations, quarantineSets, type ApprovedEnumerations } from "../src/spec/enumerations.js";
import { vocabularyFindings } from "../src/engine/vocabulary.js";
import { validateArtifact } from "../src/engine/validate.js";
import { quarantineWatch } from "../src/engine/report.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { planPromotion, applyPromotion, UNCOVERED_CONVERGENT_AXES } from "../src/compiler/promote.js";

const here = dirname(fileURLToPath(import.meta.url));
const FM = (n: string) => join(here, "..", "fixtures", "for-model", n);
const CL = (n: string) => join(here, "..", "fixtures", "compilation-log", n);
const P02_FM = "P02-Ruth-1-6-14-FOR-MODEL.md";
const P02_CL = "P02-Ruth-1-6-14-COMPILATION-LOG.md";
const P06_FM = "P06-Ruth-2-8-16-FOR-MODEL.md";
const ALL_FM = ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7", "P06-Ruth-2-8-16"];

/** The vendored registry with one pericope's promoted values removed — reconstructs the pre-promotion
 *  baseline so the drift/convergence mechanism stays testable even though P01–P06 have all converged. */
const registryWithout = (pid: string): ApprovedEnumerations => {
  const reg = loadApprovedEnumerations();
  return { ...reg, axes: Object.fromEntries(Object.entries(reg.axes).map(([k, v]) => [k, v.filter((e) => e.approved_in !== pid)])) };
};

describe("axis classification (convergent vs descriptive)", () => {
  it("convergent axes", () => {
    for (const k of ["proposition_kind", "scene_kind", "presence_value", "arc_element", "context_element", "tone_element", "pace_element", "communicative_function_element", "discourse_thread_state", "high_risk_register_kind", "role_in_scene_being"])
      expect(axisClass(k), k).toBe("convergent");
  });
  it("descriptive axes (_examples + referential_form)", () => {
    for (const k of ["object_kind_examples", "referential_form"])
      expect(axisClass(k), k).toBe("descriptive");
  });
});

describe("drift report split (against a pre-P06 baseline)", () => {
  // P01–P06 have all converged on the live registry, so exercise the split against a baseline that
  // lacks P06's promoted values: convergent drift (review-signal) vs descriptive (open) must separate.
  const p06 = readArtifactNote(FM(P06_FM)).json as any;
  const findings = vocabularyFindings(p06, driftBaseline(registryWithout("P06")));
  it("separates convergent drift from descriptive; open axes are never counted as drift", () => {
    expect(findings.some((f) => f.severity === "drift" && f.axis)).toBe(true); // convergent review-signal
    expect(findings.some((f) => f.severity === "descriptive")).toBe(true); // open / informational
    for (const f of findings) {
      if (f.severity === "drift" && f.axis) expect(axisClass(f.axis)).toBe("convergent");
      if (f.severity === "descriptive") expect(axisClass(f.axis!)).toBe("descriptive");
    }
    const driftAxes = new Set(findings.filter((f) => f.severity === "drift" && f.axis).map((f) => f.axis));
    for (const open of ["referential_form"])
      expect(driftAxes.has(open)).toBe(false);
  });
});

describe("accumulation converges drift (P02 promoted into the registry)", () => {
  const p02 = readArtifactNote(FM(P02_FM)).json as any;
  // The registry as it stood BEFORE P02 was promoted (drop P02's entries). Using this keeps the
  // mechanism test robust now that the vendored registry already contains P02 (the routine promotion ran).
  const beforeP02 = () => registryWithout("P02");
  const driftOn = (axis: string, baseline: Record<string, string[]>) =>
    vocabularyFindings(p02, baseline).filter((f) => f.severity === "drift" && f.axis === axis).length;

  it("promoting P02's vocabulary_additions zeroes ALL convergent drift (SC-0007)", () => {
    const base = beforeP02();
    expect(driftOn("proposition_kind", driftBaseline(base))).toBeGreaterThan(0);
    expect(driftOn("tone_element", driftBaseline(base))).toBeGreaterThan(0); // an L1-element axis drifts pre-promotion

    const plan = planPromotion(CL(P02_CL), { status: "ANY", reg: base });
    expect(plan.promote.length).toBeGreaterThan(0);
    const { reg: grown, added } = applyPromotion(base, plan);
    expect(added.length).toBe(plan.promote.length);

    const remaining = vocabularyFindings(p02, driftBaseline(grown)).filter((f) => f.severity === "drift");
    // Every convergent FOR_MODEL axis now has a COMPILATION-LOG intake slot (SC-0007), so promoting
    // P02's complete vocabulary_additions drives residual convergent drift to zero.
    expect(
      remaining,
      `unexpected residual convergent drift: ${remaining.map((f) => `${f.axis}:${f.message}`).join("; ")}`,
    ).toHaveLength(0);
  });

  it("payoff: P02 has zero convergent drift against the live (post-promotion) vendored registry", () => {
    const r = validateArtifact(FM(P02_FM));
    expect(r.counts.drift).toBe(0); // promoted → converged on real vendored data
    expect(r.counts.descriptive).toBeGreaterThan(0); // open axes never converge — still informational
  });

  it("SC-0007: no convergent axis is left without a COMPILATION-LOG promotion slot", () => {
    expect(UNCOVERED_CONVERGENT_AXES).toEqual([]);
  });

  it("the CONFIRMED status gate promotes fewer than ANY", () => {
    const base = beforeP02();
    const confirmed = planPromotion(CL(P02_CL), { status: "CONFIRMED", reg: base });
    const any = planPromotion(CL(P02_CL), { status: "ANY", reg: base });
    expect(confirmed.promote.length).toBeLessThan(any.promote.length);
  });

  it("promotion does not mutate the input registry (pure)", () => {
    const base = beforeP02();
    const before = base.axes["proposition_kind"]!.length;
    applyPromotion(base, planPromotion(CL(P02_CL), { status: "ANY", reg: base }));
    expect(base.axes["proposition_kind"]!.length).toBe(before);
  });
});

describe("corpus convergence (P01–P06 all promoted)", () => {
  it("every gold FOR_MODEL validates with zero convergent drift on the live registry", () => {
    for (const stem of ALL_FM) {
      const r = validateArtifact(FM(`${stem}-FOR-MODEL.md`));
      expect(r.counts.block, stem).toBe(0);
      expect(r.counts.drift, stem).toBe(0); // fully converged — descriptive (open) axes may remain
    }
  });
});

const QUAR_COMM = ["TRANSMITS", "ANSWERS", "PLACES", "ANCHORS", "INTRODUCES", "POSITIONS", "DISTRIBUTES", "RECITES"];

describe("SC-0023 — quarantined vocabulary (un-settled coin-flips; recurrence surfaced, not silently excluded)", () => {
  const QUAR = quarantineSets()["communicative_function_element"]!;
  const approvedComm = () => new Set((loadApprovedEnumerations().axes["communicative_function_element"] ?? []).map((e) => e.value));

  it("the 8 quarantined comm-func verbs are quarantined AND absent from approved-enumerations", () => {
    const approved = approvedComm();
    for (const v of QUAR_COMM) {
      expect(QUAR.has(v), `${v} in quarantine set`).toBe(true);
      expect(approved.has(v), `${v} absent from approved`).toBe(false);
    }
  });

  it("approved and quarantined comm-func sets are disjoint", () => {
    const approved = approvedComm();
    for (const v of QUAR) expect(approved.has(v), v).toBe(false);
  });

  it("a quarantined value validates as a `quarantined` notice, never `drift` (the gate stays 0-drift)", () => {
    let totalQuar = 0;
    for (const stem of ALL_FM) {
      const r = validateArtifact(FM(`${stem}-FOR-MODEL.md`));
      expect(r.counts.drift, stem).toBe(0);
      for (const f of r.findings.filter((f) => f.severity === "quarantined")) {
        expect(f.axis).toBe("communicative_function_element");
        expect(QUAR.has(f.value!), f.value).toBe(true);
      }
      totalQuar += r.counts.quarantined;
    }
    expect(totalQuar).toBe(8); // each of the 8 used exactly once across P01–P06
  });

  it("quarantineWatch parks each value once in P01–P06 (no recurrence yet)", () => {
    const reports = ALL_FM.map((stem) => validateArtifact(FM(`${stem}-FOR-MODEL.md`)));
    const watch = quarantineWatch(reports);
    expect(watch.length).toBe(8);
    expect(watch.every((w) => !w.recurs)).toBe(true);
  });

  it("quarantineWatch flags RECURS the moment a quarantined value appears in a 2nd pericope", () => {
    const p05 = validateArtifact(FM("P05-Ruth-2-1-7-FOR-MODEL.md"));
    const asP08 = { ...p05, file: "P08-Ruth-3-x-FOR-MODEL.md" }; // same quarantined verbs, a new pericope
    const recurring = quarantineWatch([p05, asP08]).filter((w) => w.recurs);
    expect(recurring.length).toBeGreaterThan(0);
    expect(recurring.every((w) => w.pericopes.length >= 2)).toBe(true);
  });

  it("promote never auto-promotes a quarantined value (the skippedByQuarantine guard)", () => {
    for (const stem of ALL_FM) {
      const plan = planPromotion(CL(`${stem}-COMPILATION-LOG.md`), { status: "ANY", reg: loadApprovedEnumerations() });
      for (const c of plan.promote) expect(QUAR.has(c.value), `${stem}: ${c.value}`).toBe(false);
    }
  });
});
