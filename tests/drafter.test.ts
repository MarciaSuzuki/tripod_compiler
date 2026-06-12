import { describe, expect, it } from "vitest";
import { assembleDraftRequest, renderRequest, requestStats } from "../src/drafter/assemble.js";
import { DrafterKeyMissingError, draftViaApi } from "../src/drafter/call.js";
import { approvedAxesDigest, closedListsDigest, registryDigest } from "../src/drafter/digest.js";
import { applyFills, type DraftOutput, type Fill } from "../src/drafter/fills.js";
import type { Gap } from "../src/compiler/skeleton.js";

// SC-0063 Phase A acceptance: the patch-only merge contract, dry-run reproducibility,
// the no-network-without-key guard, and the digest data the prompt's rules point at.

const P08 = "fixtures/meaning-map/P08-Ruth-3-1-5.md";

function fill(location: string, value: unknown, note: string | null = null): Fill {
  return { location, value_json: JSON.stringify(value), note, vocabulary_additions: null };
}

/** A tiny synthetic skeleton exercising every gap kind the real compiler emits. */
function synthetic() {
  const skeleton = {
    header: { book_context_ref: "__TODO__: set the BCD ref" },
    level_1: { arc_elements: [] as string[] },
    level_2_scenes: [
      {
        scene_id: "S1",
        scene_kind: "__TODO__: The plan spoken",
        beings_in_scene: { entries: [{ being_id: "B3", role_in_scene: "__TODO__: the planner", presence: "PRESENT" }] },
      },
    ],
    level_3_propositions: [
      {
        prop_id: "P1",
        proposition_kind: "__TODO__",
        event_specific_slots: { __TODO__: "assign event-participant slots" },
        inter_proposition_links: {},
      },
    ],
  } as Record<string, unknown>;
  const gaps: Gap[] = [
    { location: "/header/book_context_ref", field: "book_context_ref", reason: "set the BCD ref" },
    { location: "/level_1/arc_elements", field: "arc_elements", reason: "tokenize" },
    { location: "/level_2_scenes/0/scene_kind", field: "scene_kind", reason: "assign" },
    { location: "/level_2_scenes/0/beings_in_scene/entries/0/role_in_scene", field: "role_in_scene", reason: "tokenize" },
    { location: "/level_2_scenes/0/beings_in_scene/entries/0/referential_form", field: "referential_form", reason: "assign if marked" },
    { location: "/level_2_scenes/0/beings_in_scene", field: "beings_in_scene", reason: "prose-only beings — append as REFERENCED" },
    { location: "/level_3_propositions/0/proposition_kind", field: "proposition_kind", reason: "assign" },
    { location: "/level_3_propositions/0/event_specific_slots", field: "event_specific_slots", reason: "assign" },
    { location: "/level_3_propositions/0/inter_proposition_links", field: "inter_proposition_links", reason: "assign" },
    { location: "/level_3_propositions", field: "(granularity)", reason: "note-only" },
  ];
  return { skeleton, gaps };
}

function fullFillSet(): DraftOutput {
  return {
    fills: [
      fill("/header/book_context_ref", "ruth_pilot_BCD_v0_3"),
      fill("/level_1/arc_elements", ["PLAN", "CONSENT"]),
      fill("/level_2_scenes/0/scene_kind", "PLAN_SPOKEN_SCENE"),
      fill("/level_2_scenes/0/beings_in_scene/entries/0/role_in_scene", "PLANNER"),
      fill("/level_2_scenes/0/beings_in_scene/entries/0/referential_form", null, "unmarked — narrator uses the bare name"),
      fill("/level_2_scenes/0/beings_in_scene", [{ being_id: "B13", role_in_scene: "PROSPECT", presence: "REFERENCED" }]),
      fill("/level_3_propositions/0/proposition_kind", "PLAN_PROPOSED"),
      fill("/level_3_propositions/0/event_specific_slots", { planner: "B3", plan_target: "B9", speech_act: "DIRECTS_HEARER_TO_DO" }),
      fill("/level_3_propositions/0/inter_proposition_links", { forward_link_to: "P2" }),
      fill("/level_3_propositions", null, "no decomposition needed at this granularity"),
    ],
    remarks: null,
  };
}

describe("drafter merge — the patch-only contract", () => {
  it("fills every gap kind and leaves zero __TODO__", () => {
    const { skeleton, gaps } = synthetic();
    const r = applyFills(skeleton, gaps, fullFillSet());
    expect(r.rejected).toEqual([]);
    expect(r.unfilled).toEqual([]);
    expect(r.leftovers).toEqual([]);
    expect(r.applied).toHaveLength(8);
    expect(r.noteOnly).toEqual(["/level_2_scenes/0/beings_in_scene/entries/0/referential_form", "/level_3_propositions"]);
    const m: any = r.merged;
    expect(m.header.book_context_ref).toBe("ruth_pilot_BCD_v0_3");
    expect(m.level_1.arc_elements).toEqual(["PLAN", "CONSENT"]);
    expect(m.level_2_scenes[0].scene_kind).toBe("PLAN_SPOKEN_SCENE");
    expect(m.level_2_scenes[0].beings_in_scene.entries).toHaveLength(2); // append, not replace
    expect(m.level_2_scenes[0].beings_in_scene.entries[1].being_id).toBe("B13");
    expect(m.level_3_propositions[0].event_specific_slots.planner).toBe("B3");
    // the input skeleton is not mutated
    expect((skeleton as any).level_1.arc_elements).toEqual([]);
  });

  it("rejects a fill at a non-gap location (the write-authorization rule)", () => {
    const { skeleton, gaps } = synthetic();
    const out: DraftOutput = { fills: [fill("/level_3_propositions/0/cb_flags", ["CB_0001"])], remarks: null };
    const r = applyFills(skeleton, gaps, out);
    expect(r.applied).toEqual([]);
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].reason).toMatch(/not a gap location/);
    expect((r.merged as any).level_3_propositions[0].cb_flags).toBeUndefined();
  });

  it("rejects duplicates, bad JSON, a non-null granularity fill, and a malformed being append", () => {
    const { skeleton, gaps } = synthetic();
    const out: DraftOutput = {
      fills: [
        fill("/level_2_scenes/0/scene_kind", "A"),
        fill("/level_2_scenes/0/scene_kind", "B"),
        { location: "/header/book_context_ref", value_json: "{not json", note: null, vocabulary_additions: null },
        fill("/level_3_propositions", { decompose: true }),
        fill("/level_2_scenes/0/beings_in_scene", [{ being_id: "B13" }]),
      ],
      remarks: null,
    };
    const r = applyFills(skeleton, gaps, out);
    expect(r.applied).toEqual(["/level_2_scenes/0/scene_kind"]);
    expect(r.rejected.map((x) => x.reason)).toEqual([
      expect.stringMatching(/duplicate/),
      expect.stringMatching(/not valid JSON/),
      expect.stringMatching(/note-only/),
      expect.stringMatching(/being_id \/ role_in_scene \/ presence/),
    ]);
  });

  it("reports gaps the model skipped as unfilled", () => {
    const { skeleton, gaps } = synthetic();
    const r = applyFills(skeleton, gaps, { fills: [fill("/level_2_scenes/0/scene_kind", "X")], remarks: null });
    expect(r.unfilled.map((g) => g.location)).toContain("/header/book_context_ref");
    expect(r.leftovers.length).toBeGreaterThan(0);
  });
});

describe("drafter assembly — dry-run reproducibility", () => {
  it("same inputs → byte-identical request (sha-stable)", () => {
    const a = requestStats(assembleDraftRequest(P08));
    const b = requestStats(assembleDraftRequest(P08));
    expect(a.sha256).toBe(b.sha256);
    expect(a.gaps).toBeGreaterThan(0);
    expect(a.gaps).toBe(assembleDraftRequest(P08).compile.stats.gaps);
  });

  it("carries the pinned prompt, the digests, the worked P01 pair, and the pericope blocks", () => {
    const req = assembleDraftRequest(P08);
    const text = renderRequest(req);
    expect(req.system).toMatch(/FOR_MODEL Drafter — system prompt/);
    expect(req.system).toMatch(/fm-drafter-0\.1\.0/);
    expect(text).toMatch(/L1 closed lists/);
    expect(text).toMatch(/WORKED EXAMPLE — the blessed P01 pair/);
    expect(text).toMatch(/REGISTRY DIGEST — ruth/);
    expect(text).toMatch(/THE SKELETON \+ GAP REPORT/);
    expect(req.book).toBe("ruth");
  });
});

describe("drafter paid edge — locked without the key", () => {
  it("throws DrafterKeyMissingError before any network when ANTHROPIC_API_KEY is unset", async () => {
    const saved = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    process.env.TRIPOD_DRAFTER_NO_DOTENV = "1"; // isolate the guard from a real .env on disk
    try {
      const req = assembleDraftRequest(P08);
      await expect(draftViaApi(req)).rejects.toBeInstanceOf(DrafterKeyMissingError);
    } finally {
      delete process.env.TRIPOD_DRAFTER_NO_DOTENV;
      if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
    }
  });
});

describe("drafter digests — the data the prompt's rules point at", () => {
  it("closed-lists digest carries the 7 registers, the genre-aware rule, and the forbidden names", () => {
    const d = closedListsDigest();
    expect(d).toMatch(/REGISTER \(7\)/);
    expect(d).toMatch(/RELIGIOUS_WORSHIP/);
    expect(d).toMatch(/genre_group NARRATIVE → pericope register is INFORMAL_CASUAL/);
    expect(d).toMatch(/agent · patient · theme/);
    expect(d).toMatch(/SPEECH_ACT \(26\)/);
  });
  it("axes digest renders every L2 axis with its approved values", () => {
    const d = approvedAxesDigest();
    expect(d).toMatch(/scene_kind \(\d+\): OPENING_CHRONICLE_SCENE/);
    expect(d).toMatch(/proposition_kind \(\d+\)/);
    expect(d).toMatch(/role_in_scene_being/);
  });
  it("registry digest renders cast + canon banks per book", () => {
    const r = registryDigest("ruth");
    expect(r).toMatch(/CB_0001 · Kinsman-Redeemer/);
    expect(r).toMatch(/### Cast \(ruth\)/);
    const j = registryDigest("jonah");
    expect(j).toMatch(/### Cast \(jonah\)/);
  });
});
