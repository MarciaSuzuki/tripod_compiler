import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkIdAlignment,
  loadSchemaNamespaces,
  assertNoHyphenInCodePatterns,
  parseWikilink,
  slugify,
  extractForModelCodes,
  type IdAlignException,
} from "../src/engine/id-align.js";
import type { AliasTable } from "../src/reader/source-packet.js";

/**
 * SC-0018 — the cross-artifact entity-ID alignment checker. Tests the brief's six required cases on
 * SYNTHETIC fixtures (a stubbed BCD registry, so the tests are hermetic), plus a small integration
 * check that locks the headline real-corpus findings (the P01 TM_/TH_ LIKELY_SAME_REFERENT pair).
 *
 * Namespaces are still DERIVED from the pinned schema (loadSchemaNamespaces) — we never hardcode
 * them — but the registry of valid codes + canonical names is stubbed per-test.
 */

const ns = loadSchemaNamespaces();

/** A minimal stub registry: B2 Elimelech, B3 Naomi, PL1 Bethlehem of Judah, O1 Famine, TM_TEN_YEARS. */
const aliases: AliasTable = {
  book: "ruth",
  entities: {
    B2: { kind: "PERSON", english: "Elimelech", hebrew: "", hebrew_cons: "", referential_forms: [], gender: "m" },
    B3: { kind: "PERSON", english: "Naomi", hebrew: "", hebrew_cons: "", referential_forms: [], gender: "f" },
    PL1: { kind: "PLACE", english: "Bethlehem of Judah", hebrew: "", hebrew_cons: "", referential_forms: [], gender: null },
    O1: { kind: "THING", english: "Famine", hebrew: "", hebrew_cons: "", referential_forms: [], gender: null },
    TM_TEN_YEARS: { kind: "TIME", english: "About Ten Years", hebrew: "", hebrew_cons: "", referential_forms: [], gender: null },
  },
};

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "idalign-"));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// ── fixture builders ──

function writeMap(name: string, scenes: string): string {
  const p = join(dir, `${name}.md`);
  writeFileSync(
    p,
    `---\ntype: "pericope"\npericope-num: "PT"\nbcv: "Ruth 1:1"\n---\n\n# PT\n\n## 3. Level 2 — Scenes\n\n${scenes}\n`,
  );
  return p;
}
function writeFm(name: string, json: unknown): string {
  const p = join(dir, `${name}.md`);
  writeFileSync(p, `---\ntype: "sta-for-model"\npericope: "PT"\n---\n\n# PT FOR_MODEL\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\`\n`);
  return p;
}
/** a 3A-beings + 3B-places + 3C-objects + 3D-times scene block with declared entities. */
function scene(id: number, decls: { beings?: string[]; places?: string[]; objects?: string[]; times?: string[] }): string {
  const blk = (label: string, items?: string[]) =>
    `**${label}**\n` + (items?.length ? items.map((i) => `${i}\n- Role: r`).join("\n") : "- None") + "\n";
  return (
    `### Scene ${id} — Test (v.${id})\n\n` +
    blk("3A — Beings", decls.beings) +
    blk("3B — Places", decls.places) +
    blk("3C — Objects and Elements", decls.objects) +
    blk("3D — Times", decls.times) +
    `**3E — What Happens**\nstuff happens.\n\n**3F — Communicative Purpose**\np.\n\n**Significant Absence**\nnone.\n`
  );
}
const fmScene = (id: number, c: { beings?: string[]; places?: string[]; objects?: string[]; times?: string[] }) => ({
  scene_id: `S${id}`,
  verse_range: `1:${id}`,
  scene_kind: "X",
  scene_communicative_purpose: "p",
  beings_in_scene: { entries: (c.beings ?? []).map((b) => ({ being_id: b, role_in_scene: "R", presence: "PRESENT" })) },
  places_in_scene: { entries: (c.places ?? []).map((p) => ({ place_id: p, role_in_scene: "R" })) || null },
  objects_in_scene: { entries: (c.objects ?? []).map((o) => ({ object_id: o, function_in_scene: "F" })) || null },
  times_in_scene: { entries: (c.times ?? []).map((t) => ({ time_id: t, role_in_scene: "R" })) || null },
  significant_absence: "none",
});

// ───────────────────────── the invariant ─────────────────────────

describe("startup invariant — no code pattern admits a hyphen", () => {
  it("derives namespaces from the pinned schema and asserts the no-hyphen invariant", () => {
    expect(() => assertNoHyphenInCodePatterns(ns.byDef)).not.toThrow();
    // every id namespace was found
    for (const def of ["b_code", "place_id", "object_id", "time_id", "cb_id", "figure_id"]) expect(ns.byDef[def]).toBeDefined();
  });
  it("fails loudly if a (hypothetical) pattern admitted a hyphen", () => {
    expect(() => assertNoHyphenInCodePatterns({ bad: { name: "bad", prefixes: ["X"], pattern: "^X[A-Z-]+$" } })).toThrow(/admits a hyphenated code/);
  });
  it("the code = wikilink target up to the first hyphen (codes never contain one)", () => {
    expect(parseWikilink("B2-Elimelech").code).toBe("B2");
    expect(parseWikilink("PL_LAND_OF_JUDAH").code).toBe("PL_LAND_OF_JUDAH"); // underscores are not hyphens
    expect(parseWikilink("TM_TEN_YEARS-About-Ten-Years").code).toBe("TM_TEN_YEARS");
    expect(parseWikilink("B3-Naomi|Naomi").display).toBe("Naomi");
    expect(parseWikilink("B3-Naomi|Naomi").code).toBe("B3");
  });
});

describe("slugify", () => {
  it("trims, collapses whitespace to '-', preserves Title-Case", () => {
    expect(slugify("Bethlehem of Judah")).toBe("Bethlehem-of-Judah");
    expect(slugify("About Ten Years")).toBe("About-Ten-Years");
    expect(slugify("In the Days When the Judges Judged")).toBe("In-the-Days-When-the-Judges-Judged");
  });
});

// ───────────────────────── the six required cases ─────────────────────────

describe("checkIdAlignment — the brief's six cases", () => {
  it("clean pair → 0 findings", () => {
    const map = writeMap("clean-map", scene(1, { beings: ["[[B2-Elimelech]]", "[[B3-Naomi]]"], places: ["[[PL1-Bethlehem-of-Judah]]"], objects: ["[[O1-Famine]]"] }));
    const fm = writeFm("clean-fm", { level_2_scenes: [fmScene(1, { beings: ["B2", "B3"], places: ["PL1"], objects: ["O1"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.ok).toBe(true);
    expect(r.counts).toMatchObject({ refErrors: 0, nameErrors: 0, misalign: 0, dangling: 0 });
  });

  it("typo'd slug → name-binding ERROR", () => {
    const map = writeMap("typo-map", scene(1, { beings: ["[[B2-Elimlech]]"] })); // Elimlech, missing an 'e'
    const fm = writeFm("typo-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.counts.nameErrors).toBe(1);
    expect(r.nameBinding[0]).toMatchObject({ code: "B2", slugFound: "Elimlech", slugExpected: "Elimelech", severity: "ERROR" });
    expect(r.ok).toBe(false);
  });

  it("wrong-code-on-name → name-binding ERROR (B3 with Elimelech's slug)", () => {
    const map = writeMap("wrongcode-map", scene(1, { beings: ["[[B3-Elimelech]]"] })); // B3 is Naomi, not Elimelech
    const fm = writeFm("wrongcode-fm", { level_2_scenes: [fmScene(1, { beings: ["B3"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.nameBinding[0]).toMatchObject({ code: "B3", slugFound: "Elimelech", slugExpected: "Naomi", severity: "ERROR" });
  });

  it("a TM_/TH_-style pair → misalignment tagged LIKELY_SAME_REFERENT", () => {
    const map = writeMap("lsr-map", scene(1, { objects: ["[[TM_TEN_YEARS-About-Ten-Years]]"] }));
    const fm = writeFm("lsr-fm", { level_2_scenes: [fmScene(1, { objects: ["TH_TEN_YEARS_APPROXIMATELY"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    const lsr = r.misalignments.find((m) => m.direction === "MAP_NOT_FM" && m.code === "TM_TEN_YEARS");
    expect(lsr?.likelySameReferent).toMatchObject({ otherCode: "TH_TEN_YEARS_APPROXIMATELY", sharedStem: "TEN_YEARS" });
    expect(r.counts.likelySameReferent).toBe(1);
  });

  it("off-stage PROSE ref → NOT flagged as a misalignment", () => {
    // B3 is declared structurally in the FM scene + map 3A; B2 appears ONLY in a map relationship line
    // (prose). The FM scene does not contain B2. B2 must NOT be reported as a misalignment.
    const beingBlock = "[[B3-Naomi]]\n- Role: widow\n- Relationship: widow of [[B2-Elimelech]] Elimelech";
    const map = writeMap("prose-map", `### Scene 1 — Test (v.1)\n\n**3A — Beings**\n${beingBlock}\n\n**3B — Places**\n- None\n\n**3C — Objects and Elements**\n- None\n\n**3D — Times**\n- None\n\n**3E — What Happens**\nx.\n\n**3F — Communicative Purpose**\np.\n\n**Significant Absence**\nnone.\n`);
    const fm = writeFm("prose-fm", { level_2_scenes: [fmScene(1, { beings: ["B3"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.misalignments.some((m) => m.code === "B2")).toBe(false); // off-stage prose ref, not a scene entity
    expect(r.counts.misalign).toBe(0);
    // and B2 still passes reference-integrity (it resolves) — prose refs are checked by steps 2–3 only
    expect(r.referenceIntegrity.some((f) => f.code === "B2")).toBe(false);
  });

  it("unknown code → reference-integrity ERROR (registered namespace, no BCD entry)", () => {
    const map = writeMap("unknown-map", scene(1, { beings: ["[[B2-Elimelech]]"] }));
    const fm = writeFm("unknown-fm", { level_2_scenes: [fmScene(1, { beings: ["B2", "B99"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    const err = r.referenceIntegrity.find((f) => f.code === "B99");
    expect(err).toMatchObject({ side: "FOR_MODEL", reason: "UNKNOWN_CODE", severity: "ERROR" });
    expect(r.ok).toBe(false);
  });

  it("a seeded exception → downgraded to ✓ ACCEPTED", () => {
    // reuse the typo case, but sign it off as a deliberate variant.
    const map = writeMap("acc-map", scene(1, { beings: ["[[B2-Elimlech]]"] }));
    const fm = writeFm("acc-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const ex: IdAlignException[] = [{ pericope: "acc-map", kind: "NAME_BINDING", code: "B2", reason: "DELIBERATE_VARIANT", accepted_by: "Tester" }];
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir], exceptions: ex });
    expect(r.nameBinding[0]!.severity).toBe("ACCEPTED");
    expect(r.counts.nameErrors).toBe(0);
    expect(r.counts.accepted).toBe(1);
    expect(r.ok).toBe(true); // accepted findings do not fail the run
  });
});

// ───────────────────────── unverifiable namespace handling ─────────────────────────

describe("reference integrity — namespaces the registry does not track", () => {
  it("a CB_/FIG_/TH_ code is UNVERIFIABLE (surfaced), not a reference-integrity ERROR", () => {
    const map = writeMap("uv-map", scene(1, { beings: ["[[B2-Elimelech]]"], objects: ["[[CB_0030-Sojourn]]"] }));
    const fm = writeFm("uv-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B2"], objects: ["CB_0030"] })],
      level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {}, cb_flags: ["CB_0099"], figure_flags: ["FIG_0099"] }],
    });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.referenceIntegrity.length).toBe(0); // CB_/FIG_ never become ref-integrity errors here
    expect(r.unverifiable.some((u) => u.code === "CB_0030")).toBe(true);
    expect(r.unverifiable.some((u) => u.code === "FIG_0099")).toBe(true);
  });
});

// ───────────────────────── dangling note links ─────────────────────────

describe("dangling note links (step 5)", () => {
  it("flags a non-entity [[Note]] that resolves to no file; not when it resolves", () => {
    // put a resolvable note in the dir
    writeFileSync(join(dir, "Real-Note.md"), "x");
    const map = writeMap("note-map", `## 1. Metadata\n- see [[Missing-AUDIT]] and [[Real-Note]]\n\n## 3. Level 2 — Scenes\n\n${scene(1, { beings: ["[[B2-Elimelech]]"] })}`);
    const fm = writeFm("note-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, { aliases, namespaces: ns, noteResolveDirs: [dir] });
    expect(r.danglingNotes.map((d) => d.raw)).toContain("Missing-AUDIT");
    expect(r.danglingNotes.map((d) => d.raw)).not.toContain("Real-Note");
  });
});

// ───────────────────────── FOR_MODEL code extraction ─────────────────────────

describe("extractForModelCodes", () => {
  it("collects scene-container ids, pericope cb/figure flags, and being-codes used as slot VALUES", () => {
    const fm = {
      level_2_scenes: [fmScene(1, { beings: ["B2"], places: ["PL1"] })],
      level_3_propositions: [
        {
          prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K",
          event_specific_slots: { deceased: "B2", referential_form_at_verse: "HUSBAND_OF_NAOMI", where: "PL1", components: [{ kisser: "B3", speech_act: "STATES_AS_TRUE" }] },
          inter_proposition_links: {}, cb_flags: ["CB_0029"], figure_flags: ["FIG_0007"],
        },
      ],
    };
    const codes = extractForModelCodes(fm);
    const bySource = (s: string) => codes.filter((c) => c.source === s).map((c) => c.code);
    expect(bySource("scene_container")).toEqual(expect.arrayContaining(["B2", "PL1"]));
    expect(bySource("pericope_flag")).toEqual(expect.arrayContaining(["CB_0029", "FIG_0007"]));
    expect(bySource("slot_value")).toEqual(expect.arrayContaining(["B2", "B3"])); // being-codes only
    // names / L2 values are NOT codes
    expect(codes.some((c) => c.code === "HUSBAND_OF_NAOMI" || c.code === "STATES_AS_TRUE")).toBe(false);
  });
});

// ───────────────────────── integration: real corpus headline ─────────────────────────

describe("integration — real fixtures (locks the headline findings)", () => {
  it("P01: TM_TEN_YEARS ↔ TH_TEN_YEARS_APPROXIMATELY is the LIKELY_SAME_REFERENT pair; AUDIT link dangles", () => {
    // uses the REAL pinned registry + schema (no stub) — the actual deliverable behaviour.
    const r = checkIdAlignment("fixtures/meaning-map/P01-Ruth-1-1-5.md", "fixtures/for-model/P01-Ruth-1-1-5-FOR-MODEL.md", {
      noteResolveDirs: ["fixtures/meaning-map", "fixtures/for-model"],
    });
    const lsr = r.misalignments.find((m) => m.direction === "MAP_NOT_FM" && m.code === "TM_TEN_YEARS");
    expect(lsr?.likelySameReferent?.otherCode).toBe("TH_TEN_YEARS_APPROXIMATELY");
    expect(r.danglingNotes.some((d) => d.raw === "P01-Ruth-1-1-5-AUDIT")).toBe(true);
    expect(r.counts.refErrors).toBe(0); // P01 has no unknown codes
  });

  it("P06: the unresolved 'B?' slot placeholder is a reference-integrity ERROR", () => {
    const r = checkIdAlignment("fixtures/meaning-map/P06-Ruth-2-8-16.md", "fixtures/for-model/P06-Ruth-2-8-16-FOR-MODEL.md", {
      noteResolveDirs: ["fixtures/meaning-map", "fixtures/for-model"],
    });
    expect(r.referenceIntegrity.some((f) => f.code === "B?" && f.severity === "ERROR")).toBe(true);
  });
});
