import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readMeaningMap } from "../src/reader/meaning-map.js";
import { compileSkeleton } from "../src/compiler/skeleton.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { mergeFills, fillableLocations, hasResidualTodo } from "../src/drafter/merge.js";
import { judgmentDiff } from "../src/compiler/judgmentdiff.js";
import { validateForModel } from "../src/drafter/draft.js";

const here = dirname(fileURLToPath(import.meta.url));
const MM = (n: string) => join(here, "..", "fixtures", "meaning-map", n);
const FM = (n: string) => join(here, "..", "fixtures", "for-model", n);
const P02_MM = "P02-Ruth-1-6-14.md";
const P02_FM = "P02-Ruth-1-6-14-FOR-MODEL.md";
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const at = (obj: any, location: string): any => {
  let node = obj;
  for (const p of location.split("/").filter(Boolean)) node = node?.[/^\d+$/.test(p) ? Number(p) : p];
  return node;
};

describe("drafter merge — constrained gap-filler", () => {
  const { skeleton, gaps } = compileSkeleton(readMeaningMap(MM(P02_MM)));
  const sceneKindGap = gaps.find((g) => g.field === "scene_kind")!;

  it("applies a fill at a declared gap location", () => {
    const r = mergeFills(skeleton, gaps, [{ location: sceneKindGap.location, value: "OPENING_HEARING_AND_DEPARTURE_SCENE", reason: "S1 hears + departs" }]);
    expect(r.applied).toBe(1);
    expect(at(r.forModel, sceneKindGap.location)).toBe("OPENING_HEARING_AND_DEPARTURE_SCENE");
  });

  it("rejects a fill at a non-gap location — deterministic fields are protected", () => {
    const before = (skeleton as any).sta_id;
    const r = mergeFills(skeleton, gaps, [{ location: "/sta_id", value: "HACKED", reason: "x" }]);
    expect(r.rejected.length).toBe(1);
    expect((r.forModel as any).sta_id).toBe(before);
  });

  it("does not mutate the input skeleton (pure)", () => {
    const snap = JSON.stringify(skeleton);
    mergeFills(skeleton, gaps, [{ location: sceneKindGap.location, value: "X", reason: "x" }]);
    expect(JSON.stringify(skeleton)).toBe(snap);
  });

  it("reports fillable gaps that received no fill; empty fills leave __TODO__ residual", () => {
    const r = mergeFills(skeleton, gaps, []);
    expect(r.unfilled.length).toBe(fillableLocations(gaps).size);
    expect(hasResidualTodo(r.forModel)).toBe(true);
  });

  it("records proposed-new convergent tokens (drift signal)", () => {
    const r = mergeFills(skeleton, gaps, [{ location: sceneKindGap.location, value: "BRAND_NEW_SCENE_KIND", reason: "no fit", is_new_value: true }]);
    expect(r.proposedNew).toContain(sceneKindGap.location);
  });
});

describe("judgment gold-diff — token vs granularity split", () => {
  const gold = readArtifactNote(FM(P02_FM)).json as any;

  it("gold vs itself: 100% token agreement, no token divergences, no unresolved TODO", () => {
    const jd = judgmentDiff(gold, gold, "P02");
    expect(jd.tokenAgreementPct).toBe(100);
    expect(jd.unresolvedTodo).toBe(0);
    expect(jd.divergences.filter((d) => d.kind !== "granularity").length).toBe(0);
  });

  it("a swapped scene_kind is a located TOKEN divergence carrying candidate + gold", () => {
    const cand = clone(gold);
    cand.level_2_scenes[0].scene_kind = "WRONG_SCENE_KIND";
    const jd = judgmentDiff(cand, gold, "P02");
    const d = jd.divergences.find((x) => x.kind === "token" && x.axis === "scene_kind");
    expect(d).toBeTruthy();
    expect(d!.candidate).toBe("WRONG_SCENE_KIND");
    expect(d!.gold).toBe(gold.level_2_scenes[0].scene_kind);
    expect(d!.location).toBe("/level_2_scenes/0/scene_kind");
    expect(jd.tokenAgreementPct).toBeLessThan(100);
  });

  it("a dropped proposition is a GRANULARITY divergence, not a token error", () => {
    const cand = clone(gold);
    cand.level_3_propositions = cand.level_3_propositions.slice(0, -1);
    const jd = judgmentDiff(cand, gold, "P02");
    expect(jd.granularityDivergences).toBeGreaterThan(0);
    expect(jd.divergences.some((d) => d.kind === "granularity")).toBe(true);
  });

  it("an L1 element swap is reported as extra + missing tokens at the array location", () => {
    const cand = clone(gold);
    cand.level_1.tone_elements = [...cand.level_1.tone_elements.slice(1), "INVENTED_TONE"];
    const jd = judgmentDiff(cand, gold, "P02");
    expect(jd.divergences.some((d) => d.kind === "token-extra" && d.axis === "tone_elements" && d.candidate === "INVENTED_TONE")).toBe(true);
    expect(jd.divergences.some((d) => d.kind === "token-missing" && d.axis === "tone_elements")).toBe(true);
  });
});

describe("in-memory FOR_MODEL validation (drafter output gate)", () => {
  const gold = readArtifactNote(FM(P02_FM)).json as any;
  it("gold P02 is block-clean; a closed-list violation blocks", () => {
    expect(validateForModel(gold).ok).toBe(true);
    const bad = clone(gold);
    bad.pericope_classification.register = "BOGUS_REGISTER";
    expect(validateForModel(bad).ok).toBe(false);
  });
});
