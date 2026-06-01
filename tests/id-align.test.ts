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
  normalizeSlug,
  isWithheldReferent,
  extractForModelCodes,
  extractForModelFlags,
  harvestMapFlags,
  buildFlagRegistry,
  isKnownPilot2Sibling,
  isFlagCode,
  type IdAlignException,
} from "../src/engine/id-align.js";
import type { AliasTable, CodeRegistry } from "../src/reader/source-packet.js";
import { loadIdAlignmentExceptions } from "../src/reader/source-packet.js";

/**
 * SC-0018 — the cross-artifact entity-ID alignment checker. Tests the brief's required cases on
 * SYNTHETIC fixtures (stubbed BCD + CB/FIG registries, so the tests are hermetic), plus integration
 * checks that lock the headline real-corpus findings (the P01 TM_/TH_ LIKELY_SAME_REFERENT pair).
 *
 * Also covers the SC-0018 refinements: R1 (CB_/FIG_ flags compared as SETS in their real homes —
 * frontmatter active-* + §5 ↔ FM cb/figure_flags), R2 (CB_/FIG_ reference-integrity + name-binding via
 * the vendored concept/figure registries), R3 (note-resolution knows the real pilot-2 sibling suffixes
 * + discourse-thread refs; `-AUDIT` still flags).
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

/** A stub CB/FIG registry mirroring the vendored shape: CB_0030 Sojourn-Gur (alias CB_SOJOURN), FIG_0007. */
const concepts: CodeRegistry = {
  book: "RUTH",
  kind: "CONCEPT",
  entries: {
    CB_0030: { code: "CB_0030", name_slug: "Sojourn-Gur", aliases: ["CB_SOJOURN"] },
    CB_0029: { code: "CB_0029", name_slug: "Judges-Era", aliases: [] },
  },
};
const figures: CodeRegistry = {
  book: "RUTH",
  kind: "FIGURE",
  entries: {
    FIG_0007: { code: "FIG_0007", name_slug: "Narrator-Frame-from-Later-Time", aliases: ["FIG_NARRATOR_FRAME"] },
    FIG_0013: { code: "FIG_0013", name_slug: "Bread-house-in-Famine", aliases: [] },
  },
};
const flagRegistry = buildFlagRegistry(concepts, figures);

/** the standard hermetic option bundle: stub entity aliases + stub flag registry + derived namespaces. */
const hermetic = (extra: Record<string, unknown> = {}) => ({ aliases, flagRegistry, namespaces: ns, noteResolveDirs: [dir], ...extra });

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
/**
 * A fuller map note: frontmatter with `active-concepts`/`active-figures` YAML lists (the flag homes),
 * the §3 scenes, and an optional `## 5. Flags` section — so R1's flag-set harvesting can be exercised.
 */
function writeMapFull(o: { name: string; activeConcepts?: string[]; activeFigures?: string[]; scenes: string; flags5?: string }): string {
  const p = join(dir, `${o.name}.md`);
  const fmList = (key: string, items?: string[]) => (items?.length ? `${key}:\n${items.map((i) => `  - ${i}`).join("\n")}\n` : "");
  const fm =
    `---\ntype: "pericope"\npericope-num: "PT"\nbcv: "Ruth 1:1"\n` +
    fmList("active-concepts", o.activeConcepts) +
    fmList("active-figures", o.activeFigures) +
    `---\n`;
  const flagsSection = o.flags5 ? `\n## 5. Flags\n\n${o.flags5}\n` : "";
  writeFileSync(p, `${fm}\n# PT\n\n## 3. Level 2 — Scenes\n\n${o.scenes}\n${flagsSection}`);
  return p;
}
/** add cb_flags/figure_flags to an FM, carried on a single proposition linked to scene S1. */
const fmWithFlags = (scenes: object[], cb: string[] = [], fig: string[] = []) => ({
  level_2_scenes: scenes,
  level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {}, cb_flags: cb, figure_flags: fig }],
});
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

// ───────────────────────── SC-0020 A1.2 — note-title-safe slug normalization ─────────────────────────

describe("normalizeSlug (SC-0020) — note-title-safe name-binding comparison", () => {
  it("strips apostrophes so a note-title-safe slug matches an apostrophe'd BCD name", () => {
    // BCD: "Naomi's Dwelling in Bethlehem" → slugify keeps the apostrophe; the map slug can't carry it.
    expect(normalizeSlug(slugify("Naomi's Dwelling in Bethlehem"))).toBe(normalizeSlug("Naomis-Dwelling-in-Bethlehem"));
    expect(normalizeSlug(slugify("Boaz's Portion of the Field"))).toBe(normalizeSlug("Boazs-Portion-of-the-Field"));
  });
  it("collapses '/' (a char a note title can't hold) to the '-' separator, then collapses repeats", () => {
    expect(normalizeSlug(slugify("His People / People of YHWH"))).toBe(normalizeSlug("His-People-People-of-YHWH"));
  });
  it("is a no-op on already-clean slugs (no apostrophe / slash)", () => {
    expect(normalizeSlug("Bethlehem-of-Judah")).toBe("Bethlehem-of-Judah");
    expect(normalizeSlug("About-Ten-Years")).toBe("About-Ten-Years");
  });
  it("name-binding accepts the apostrophe-dropped map slug (no ERROR)", () => {
    const al: AliasTable = { book: "ruth", entities: { PL9: { kind: "PLACE", english: "Naomi's Dwelling in Bethlehem", hebrew: "", hebrew_cons: "", referential_forms: [], gender: null } } };
    const map = writeMap("apos-map", scene(1, { places: ["[[PL9-Naomis-Dwelling-in-Bethlehem]]"] }));
    const fm = writeFm("apos-fm", { level_2_scenes: [fmScene(1, { places: ["PL9"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic({ aliases: al }));
    expect(r.nameBinding.some((f) => f.code === "PL9")).toBe(false);
    expect(r.counts.nameErrors).toBe(0);
  });
});

// ───────────────────────── SC-0020 A1.1 — withheld referent (<NS>?) is INFO, not an error ─────────────────────────

describe("isWithheldReferent + WITHHELD_REFERENT (SC-0020)", () => {
  it("isWithheldReferent: a schema-legal code whose tail is exactly '?' (B?) — not B12, not PL_AMONG_SHEAVES", () => {
    expect(isWithheldReferent("B?", ns)).toBe(true);
    expect(isWithheldReferent("B12", ns)).toBe(false);
    expect(isWithheldReferent("PL_AMONG_SHEAVES", ns)).toBe(false);
    expect(isWithheldReferent("TM_TEN_YEARS", ns)).toBe(false);
    expect(isWithheldReferent("CB_0030", ns)).toBe(false);
    expect(isWithheldReferent("ZZZ?", ns)).toBe(false); // not a schema-legal entity code at all
  });
  it("B? on the FOR_MODEL → WITHHELD_REFERENT INFO, NOT a ref-integrity error, NOT a misalignment", () => {
    // B3 is declared on both sides; B? is an intentional withheld referent in the FM scene only.
    const map = writeMap("wh-map", scene(1, { beings: ["[[B3-Naomi]]"] }));
    const fm = writeFm("wh-fm", { level_2_scenes: [fmScene(1, { beings: ["B3", "B?"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.referenceIntegrity.some((f) => f.code === "B?")).toBe(false); // not an UNKNOWN_CODE
    expect(r.counts.refErrors).toBe(0);
    expect(r.withheldReferents).toHaveLength(1);
    expect(r.withheldReferents[0]).toMatchObject({ side: "FOR_MODEL", code: "B?", reason: "WITHHELD_REFERENT" });
    expect(r.counts.withheld).toBe(1);
    expect(r.misalignments.some((m) => m.code === "B?")).toBe(false); // excluded from the structural diff
    expect(r.counts.misalign).toBe(0);
    expect(r.ok).toBe(true); // INFO never fails the run
  });
  it("B? declared as a scene being AND used as a slot value (the real P06 shape) → one withheld INFO, never an error/misalignment", () => {
    // Mirrors P06: B? is a scene-container being_id (which surfaces the withheld INFO) and also appears
    // as the `wife_taken` slot value. (The slot-value collector keys on concrete `^B\d+$`, so the slot
    // occurrence alone is not separately collected — the scene-container occurrence carries the INFO.)
    const map = writeMap("wh2-map", scene(1, { beings: ["[[B3-Naomi]]"] }));
    const fm = writeFm("wh2-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B3", "B?"] })],
      level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: { wife_taken: "B?" }, inter_proposition_links: {}, cb_flags: [], figure_flags: [] }],
    });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.referenceIntegrity.some((f) => f.code === "B?")).toBe(false);
    expect(r.withheldReferents.filter((w) => w.code === "B?")).toHaveLength(1); // surfaced once
    expect(r.misalignments.some((m) => m.code === "B?")).toBe(false);
    expect(r.ok).toBe(true);
  });
});

// ───────────────────────── the six required cases ─────────────────────────

describe("checkIdAlignment — the brief's six cases", () => {
  it("clean pair → 0 findings", () => {
    const map = writeMap("clean-map", scene(1, { beings: ["[[B2-Elimelech]]", "[[B3-Naomi]]"], places: ["[[PL1-Bethlehem-of-Judah]]"], objects: ["[[O1-Famine]]"] }));
    const fm = writeFm("clean-fm", { level_2_scenes: [fmScene(1, { beings: ["B2", "B3"], places: ["PL1"], objects: ["O1"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.ok).toBe(true);
    expect(r.counts).toMatchObject({ refErrors: 0, nameErrors: 0, misalign: 0, dangling: 0 });
  });

  it("typo'd slug → name-binding ERROR", () => {
    const map = writeMap("typo-map", scene(1, { beings: ["[[B2-Elimlech]]"] })); // Elimlech, missing an 'e'
    const fm = writeFm("typo-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.counts.nameErrors).toBe(1);
    expect(r.nameBinding[0]).toMatchObject({ code: "B2", slugFound: "Elimlech", slugExpected: "Elimelech", severity: "ERROR" });
    expect(r.ok).toBe(false);
  });

  it("wrong-code-on-name → name-binding ERROR (B3 with Elimelech's slug)", () => {
    const map = writeMap("wrongcode-map", scene(1, { beings: ["[[B3-Elimelech]]"] })); // B3 is Naomi, not Elimelech
    const fm = writeFm("wrongcode-fm", { level_2_scenes: [fmScene(1, { beings: ["B3"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.nameBinding[0]).toMatchObject({ code: "B3", slugFound: "Elimelech", slugExpected: "Naomi", severity: "ERROR" });
  });

  it("a TM_/TH_-style pair → misalignment tagged LIKELY_SAME_REFERENT", () => {
    const map = writeMap("lsr-map", scene(1, { objects: ["[[TM_TEN_YEARS-About-Ten-Years]]"] }));
    const fm = writeFm("lsr-fm", { level_2_scenes: [fmScene(1, { objects: ["TH_TEN_YEARS_APPROXIMATELY"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
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
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.misalignments.some((m) => m.code === "B2")).toBe(false); // off-stage prose ref, not a scene entity
    expect(r.counts.misalign).toBe(0);
    // and B2 still passes reference-integrity (it resolves) — prose refs are checked by steps 2–3 only
    expect(r.referenceIntegrity.some((f) => f.code === "B2")).toBe(false);
  });

  it("SC-0020 parity bar: an FM scene-being the map references in THAT scene's §3 prose is ALIGNED (one declares, one narrates)", () => {
    // The FM declares B2 structurally in S1; the map declares B3 in S1's 3A and references B2 only in
    // B3's relationship line (PROSE) within the SAME scene. The two artifacts agree B2 is present in S1 —
    // so B2 must NOT be a misalignment (the lead's ruling), even though the map doesn't declare it in 3A.
    const beingBlock = "[[B3-Naomi]]\n- Role: widow\n- Relationship: widow of [[B2-Elimelech]] Elimelech";
    const map = writeMap("parity-same-map", `### Scene 1 — Test (v.1)\n\n**3A — Beings**\n${beingBlock}\n\n**3B — Places**\n- None\n\n**3C — Objects and Elements**\n- None\n\n**3D — Times**\n- None\n\n**3E — What Happens**\nx.\n\n**3F — Communicative Purpose**\np.\n\n**Significant Absence**\nnone.\n`);
    const fm = writeFm("parity-same-fm", { level_2_scenes: [fmScene(1, { beings: ["B2", "B3"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.misalignments.some((m) => m.code === "B2")).toBe(false); // aligned by same-scene prose, dropped from the diff
    expect(r.counts.misalign).toBe(0);
    expect(r.ok).toBe(true);
  });

  it("SC-0020 parity bar is SCENE-SCOPED: an FM scene-entity the map references only in a DIFFERENT scene is still a misalignment (annotated cross-scene)", () => {
    // The FM declares PL1 in S2; the map declares+narrates PL1 in S1 (a §3E prose wikilink) but references
    // it nowhere in S2. A prose mention in ANOTHER scene must NOT align it in S2 (mirrors the real P05 PL5:
    // FM declares it in S2, but the map's PL5 wikilink lives in S3). S1 here has PL1 in its What-Happens prose.
    const s1 =
      `### Scene 1 — Test (v.1)\n\n**3A — Beings**\n[[B3-Naomi]]\n- Role: r\n\n**3B — Places**\n- None\n\n` +
      `**3C — Objects and Elements**\n- None\n\n**3D — Times**\n- None\n\n` +
      `**3E — What Happens**\nNaomi leaves [[PL1-Bethlehem-of-Judah]] the town.\n\n**3F — Communicative Purpose**\np.\n\n**Significant Absence**\nnone.\n`;
    const map = writeMap("parity-cross-map", s1 + scene(2, { beings: ["[[B2-Elimelech]]"] }));
    // FM: S1 declares B3 (aligns), S2 declares B2 (aligns) + PL1 (the cross-scene gap under test).
    const fm = writeFm("parity-cross-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B3"] }), fmScene(2, { beings: ["B2"], places: ["PL1"] })],
      level_3_propositions: [],
    });
    const r = checkIdAlignment(map, fm, hermetic());
    const s2 = r.misalignments.find((m) => m.code === "PL1" && m.scope === "S2" && m.direction === "FM_NOT_MAP");
    expect(s2).toBeDefined();
    expect(s2!.severity).toBe("MISALIGN"); // not resolved — PL1 is map-referenced only in S1, not S2
    expect(s2!.presentElsewhere).toMatch(/S1/); // scene-accurate: the prose home is labelled with its scene
    expect(r.ok).toBe(false);
  });

  it("unknown code → reference-integrity ERROR (registered namespace, no BCD entry)", () => {
    const map = writeMap("unknown-map", scene(1, { beings: ["[[B2-Elimelech]]"] }));
    const fm = writeFm("unknown-fm", { level_2_scenes: [fmScene(1, { beings: ["B2", "B99"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    const err = r.referenceIntegrity.find((f) => f.code === "B99");
    expect(err).toMatchObject({ side: "FOR_MODEL", reason: "UNKNOWN_CODE", severity: "ERROR" });
    expect(r.ok).toBe(false);
  });

  it("a seeded exception → downgraded to ✓ ACCEPTED", () => {
    // reuse the typo case, but sign it off as a deliberate variant.
    const map = writeMap("acc-map", scene(1, { beings: ["[[B2-Elimlech]]"] }));
    const fm = writeFm("acc-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const ex: IdAlignException[] = [{ pericope: "acc-map", kind: "NAME_BINDING", code: "B2", reason: "DELIBERATE_VARIANT", accepted_by: "Tester" }];
    const r = checkIdAlignment(map, fm, hermetic({ exceptions: ex }));
    expect(r.nameBinding[0]!.severity).toBe("ACCEPTED");
    expect(r.counts.nameErrors).toBe(0);
    expect(r.counts.accepted).toBe(1);
    expect(r.ok).toBe(true); // accepted findings do not fail the run
  });
});

// ───────────────────────── R2: CB_/FIG_ reference-integrity (now verifiable) ─────────────────────────

describe("R2 — CB_/FIG_ reference-integrity via the vendored concept/figure registries", () => {
  it("a CB_/FIG_ code IN the registry resolves; one NOT in it is a reference-integrity ERROR; only TH_ stays unverifiable", () => {
    // CB_0030 (registry) flagged on both sides; CB_0099 + FIG_0099 are NOT in the stub registry; TH_X has no registry.
    const map = writeMapFull({
      name: "r2-ri-map",
      activeConcepts: ["[[CB_0030-Sojourn-Gur]]"],
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"], objects: ["[[TH_X-Thematic]]"] }),
      flags5: "**5A — Concept Bank Flags**\n- [[CB_0030-Sojourn-Gur]] — active at Proposition 1\n",
    });
    const fm = writeFm("r2-ri-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B2"], objects: ["TH_X"] })],
      level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {}, cb_flags: ["CB_0030", "CB_0099"], figure_flags: ["FIG_0099"] }],
    });
    const r = checkIdAlignment(map, fm, hermetic());
    // CB_0099 + FIG_0099 → ref-integrity ERRORs (legal codes, no registry entry)
    expect(r.referenceIntegrity.some((f) => f.code === "CB_0099" && f.severity === "ERROR")).toBe(true);
    expect(r.referenceIntegrity.some((f) => f.code === "FIG_0099" && f.severity === "ERROR")).toBe(true);
    // CB_0030 resolves (no finding for it)
    expect(r.referenceIntegrity.some((f) => f.code === "CB_0030")).toBe(false);
    // only the TH_ thematic code remains unverifiable; CB_/FIG_ are NOT unverifiable any more
    expect(r.unverifiable.some((u) => u.code === "TH_X")).toBe(true);
    expect(r.unverifiable.some((u) => u.code.startsWith("CB_") || u.code.startsWith("FIG_"))).toBe(false);
  });

  it("CB_/FIG_ name-binding: slug must match the registry name_slug or a known alias (else ERROR)", () => {
    const map = writeMapFull({
      name: "r2-nb-map",
      // CB_0030 with a WRONG slug; CB_0029 with the legacy ALIAS is fine; FIG_0007 with the right name_slug is fine.
      activeConcepts: ["[[CB_0030-Wrong-Slug]]", "[[CB_0029-Judges-Era]]"],
      activeFigures: ["[[FIG_0007-Narrator-Frame-from-Later-Time]]"],
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"] }),
      flags5:
        "**5A — Concept Bank Flags**\n- [[CB_0030-Wrong-Slug]] — active at Proposition 1\n- [[CB_0029-Judges-Era]] — active at Proposition 1\n\n" +
        "**5B — Figure Flags**\n- [[FIG_0007-Narrator-Frame-from-Later-Time]] — active at Proposition 1\n",
    });
    const fm = writeFm("r2-nb-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B2"] })],
      level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {}, cb_flags: ["CB_0030", "CB_0029"], figure_flags: ["FIG_0007"] }],
    });
    const r = checkIdAlignment(map, fm, hermetic());
    const cb30 = r.nameBinding.find((f) => f.code === "CB_0030");
    expect(cb30).toMatchObject({ slugFound: "Wrong-Slug", slugExpected: "Sojourn-Gur", severity: "ERROR" });
    // CB_0029 (right name_slug) + FIG_0007 (right name_slug) do NOT produce name-binding findings
    expect(r.nameBinding.some((f) => f.code === "CB_0029")).toBe(false);
    expect(r.nameBinding.some((f) => f.code === "FIG_0007")).toBe(false);
  });

  it("a known legacy alias slug is accepted (not flagged)", () => {
    // CB_0030's registry name_slug is "Sojourn-Gur" but it has alias "CB_SOJOURN"; a map slug equal to the
    // alias must NOT flag. (Mirrors the older-generation named-form tolerance.)
    const map = writeMapFull({
      name: "r2-alias-map",
      activeConcepts: ["[[CB_0030-CB_SOJOURN]]"],
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"] }),
      flags5: "**5A — Concept Bank Flags**\n- [[CB_0030-CB_SOJOURN]] — active at Proposition 1\n",
    });
    const fm = writeFm("r2-alias-fm", {
      level_2_scenes: [fmScene(1, { beings: ["B2"] })],
      level_3_propositions: [{ prop_id: "P1", scene_link: "S1", verse_anchor: "1:1", proposition_kind: "K", event_specific_slots: {}, inter_proposition_links: {}, cb_flags: ["CB_0030"], figure_flags: [] }],
    });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.nameBinding.some((f) => f.code === "CB_0030")).toBe(false);
  });
});

// ───────────────────────── R1: CB_/FIG_ flags compared as SETS in their real homes ─────────────────────────

describe("R1 — CB_/FIG_ flags are compared in their real homes (frontmatter active-* + §5 ↔ FM cb/figure_flags)", () => {
  it("aligned flags do NOT report — even though the FM also carries them as scene objects, not §3 of the map", () => {
    // CB_0030 + FIG_0007 are declared in the map's frontmatter + §5 and in the FM's cb_flags/figure_flags.
    // The FM ALSO carries CB_0030 as a scene-container object (legal object_id) — that used to read as a
    // false "FM-not-map" misalignment. With R1, CB_/FIG_ are flag-compared, so nothing reports.
    const map = writeMapFull({
      name: "r1-aligned-map",
      activeConcepts: ["[[CB_0030-Sojourn-Gur]]"],
      activeFigures: ["[[FIG_0007-Narrator-Frame-from-Later-Time]]"],
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"] }),
      flags5: "**5A — Concept Bank Flags**\n- [[CB_0030-Sojourn-Gur]] — active at Proposition 1\n\n**5B — Figure Flags**\n- [[FIG_0007-Narrator-Frame-from-Later-Time]] — active at Proposition 1\n",
    });
    const fm = writeFm("r1-aligned-fm", fmWithFlags([fmScene(1, { beings: ["B2"], objects: ["CB_0030"] })], ["CB_0030"], ["FIG_0007"]));
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.flagMismatches.length).toBe(0); // flags align
    expect(r.counts.flagMismatch).toBe(0);
    // and the aligned flag never surfaces as a structural misalignment
    expect(r.misalignments.some((m) => m.code === "CB_0030" || m.code === "FIG_0007")).toBe(false);
    expect(r.ok).toBe(true);
  });

  it("a one-sided flag DOES report — concept flagged on the map only, figure on the FM only", () => {
    const map = writeMapFull({
      name: "r1-oneside-map",
      activeConcepts: ["[[CB_0030-Sojourn-Gur]]", "[[CB_0029-Judges-Era]]"], // CB_0029 is map-only
      activeFigures: [], // FIG_0007 will be FM-only
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"] }),
      flags5: "**5A — Concept Bank Flags**\n- [[CB_0030-Sojourn-Gur]] — active at Proposition 1\n- [[CB_0029-Judges-Era]] — active at Proposition 1\n",
    });
    const fm = writeFm("r1-oneside-fm", fmWithFlags([fmScene(1, { beings: ["B2"] })], ["CB_0030"], ["FIG_0007"]));
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.flagMismatches.find((f) => f.code === "CB_0029")).toMatchObject({ kind: "CONCEPT", direction: "MAP_NOT_FM", severity: "MISALIGN" });
    expect(r.flagMismatches.find((f) => f.code === "FIG_0007")).toMatchObject({ kind: "FIGURE", direction: "FM_NOT_MAP", severity: "MISALIGN" });
    expect(r.counts.flagMismatch).toBe(2);
    expect(r.ok).toBe(false);
  });

  it("a CB_/FIG_ wikilink that appears ONLY inside a §5 bullet's narration is NOT counted as a map flag", () => {
    // mirrors P06: a flag bullet for FIG_0007 whose prose parenthetical mentions FIG_0013 as a cross-ref.
    // Only the bullet's FIRST wikilink (FIG_0007) is the declared flag; FIG_0013 is narration, not a flag.
    const map = writeMapFull({
      name: "r1-narration-map",
      activeFigures: ["[[FIG_0007-Narrator-Frame-from-Later-Time]]"],
      scenes: scene(1, { beings: ["[[B2-Elimelech]]"] }),
      flags5: "**5B — Figure Flags**\n- [[FIG_0007-Narrator-Frame-from-Later-Time]] — active at Proposition 1 (pairs cross-pericope with [[FIG_0013-Bread-house-in-Famine]] later)\n",
    });
    const fm = writeFm("r1-narration-fm", fmWithFlags([fmScene(1, { beings: ["B2"] })], [], ["FIG_0007"]));
    const r = checkIdAlignment(map, fm, hermetic());
    // FIG_0013 (narration only) must NOT show up as a map-only flag mismatch
    expect(r.flagMismatches.some((f) => f.code === "FIG_0013")).toBe(false);
    expect(r.flagMismatches.length).toBe(0);
  });
});

describe("harvestMapFlags / extractForModelFlags / isFlagCode (units)", () => {
  it("isFlagCode is true for CB_/FIG_ only", () => {
    expect(isFlagCode("CB_0001")).toBe(true);
    expect(isFlagCode("FIG_0009")).toBe(true);
    expect(isFlagCode("B2")).toBe(false);
    expect(isFlagCode("TH_X")).toBe(false);
    expect(isFlagCode("TM_TEN_YEARS")).toBe(false);
  });
  it("harvestMapFlags reads frontmatter active-* lists + §5 bullet-leads (first wikilink per bullet)", () => {
    const raw =
      `---\ntype: "pericope"\nactive-concepts:\n  - [[CB_0030-Sojourn-Gur]]\nactive-figures:\n  - [[FIG_0007-Frame]]\nstatus: "x"\n---\n` +
      `\n# PT\n\n## 5. Flags\n\n**5A — Concept Bank Flags**\n- [[CB_0029-Judges-Era]] — active at Proposition 1 (see also [[CB_0030-Sojourn-Gur]])\n`;
    const f = harvestMapFlags(raw);
    expect([...f.cb].sort()).toEqual(["CB_0029", "CB_0030"]); // frontmatter CB_0030 + §5 bullet-lead CB_0029
    expect([...f.fig]).toEqual(["FIG_0007"]);
    expect(f.slugByCode.get("CB_0030")).toBe("Sojourn-Gur");
  });
  it("extractForModelFlags reads cb_flags/figure_flags, not cross_ref free-text", () => {
    const fm = {
      level_3_propositions: [
        { cb_flags: ["CB_0030"], figure_flags: ["FIG_0007"], cross_ref: "FIG_0013 mentioned here only" },
      ],
    };
    const f = extractForModelFlags(fm);
    expect([...f.cb]).toEqual(["CB_0030"]);
    expect([...f.fig]).toEqual(["FIG_0007"]);
    expect(f.fig.has("FIG_0013")).toBe(false); // cross_ref text is not a flag
  });
});

// ───────────────────────── R3 / dangling note links ─────────────────────────

describe("R3 — note-resolution knows the real pilot-2 sibling suffixes + discourse-thread refs", () => {
  it("isKnownPilot2Sibling: artifact suffixes + T#-threads resolve; -AUDIT does NOT", () => {
    for (const ok of [
      "P02-Ruth-1-6-14-COMPILATION-LOG",
      "P02-Ruth-1-6-14-BCD-DELTA",
      "P03-Ruth-1-15-18-VERIFICATION-INPUT",
      "P03-Ruth-1-15-18-VERIFICATION-INPUT-en",
      "P01-Ruth-1-1-5-FOR-MODEL",
      "P01-Ruth-1-1-5-COVERAGE-LEDGER",
      "T7-Harvest-Provision",
      "T1-Naomi-Security-and-Rest",
    ]) expect(isKnownPilot2Sibling(ok)).toBe(true);
    for (const no of ["P01-Ruth-1-1-5-AUDIT", "Some-Random-Note", "B2-Elimelech"]) expect(isKnownPilot2Sibling(no)).toBe(false);
  });

  it("the checker resolves sibling-artifact + discourse-thread links, still flags -AUDIT", () => {
    const map = writeMap(
      "r3-map",
      `## 1. Metadata\n- artifacts: [[PT-COMPILATION-LOG]] [[PT-BCD-DELTA]] [[PT-VERIFICATION-INPUT-en]] [[PT-AUDIT]]\n` +
        `- thread: [[T7-Harvest-Provision]]\n\n## 3. Level 2 — Scenes\n\n${scene(1, { beings: ["[[B2-Elimelech]]"] })}`,
    );
    const fm = writeFm("r3-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    const dangling = r.danglingNotes.map((d) => d.raw);
    expect(dangling).toContain("PT-AUDIT"); // the one true relic still flags
    expect(dangling).not.toContain("PT-COMPILATION-LOG");
    expect(dangling).not.toContain("PT-BCD-DELTA");
    expect(dangling).not.toContain("PT-VERIFICATION-INPUT-en");
    expect(dangling).not.toContain("T7-Harvest-Provision");
    expect(r.counts.dangling).toBe(1);
  });

  it("still flags a genuinely unknown non-entity [[Note]]; resolves one that exists on disk", () => {
    writeFileSync(join(dir, "Real-Note.md"), "x");
    const map = writeMap("note-map", `## 1. Metadata\n- see [[Truly-Missing-Note]] and [[Real-Note]]\n\n## 3. Level 2 — Scenes\n\n${scene(1, { beings: ["[[B2-Elimelech]]"] })}`);
    const fm = writeFm("note-fm", { level_2_scenes: [fmScene(1, { beings: ["B2"] })], level_3_propositions: [] });
    const r = checkIdAlignment(map, fm, hermetic());
    expect(r.danglingNotes.map((d) => d.raw)).toContain("Truly-Missing-Note");
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

// ───────────────────────── integration: real corpus headline (post-refinement) ─────────────────────────
// These use the REAL pinned registries (alias + concept + figure) + schema — the actual deliverable
// behaviour after SC-0018 R1/R2/R3. They lock both the surviving SIGNAL and the removed NOISE.

const MM = "fixtures/meaning-map";
const FM = "fixtures/for-model";
// Integration runs mirror the real `tripod id-check`: they load the PINNED id-alignment exceptions, so a
// signed-off coverage difference surfaces as ✓ ACCEPTED (still in the inventory, excluded from the failure
// count) exactly as the CLI reports it.
const idExceptions = loadIdAlignmentExceptions();
const real = (pid: string, bcv: string) =>
  checkIdAlignment(`${MM}/${pid}-${bcv}.md`, `${FM}/${pid}-${bcv}-FOR-MODEL.md`, { noteResolveDirs: [MM, FM], exceptions: idExceptions });

describe("integration — real fixtures (locks the refined headline findings)", () => {
  it("P01 (post-SC-0020): TM_/TH_ now ALIGN (A4 map edit); AUDIT no longer dangles (A5); flags align; no CB/FIG noise", () => {
    const r = real("P01", "Ruth-1-1-5");
    // SC-0020 A4: the map §3C code was aligned TM_TEN_YEARS → TH_TEN_YEARS_APPROXIMATELY, so the
    // former LIKELY_SAME_REFERENT split is resolved — neither side carries the un-paired code now.
    expect(r.misalignments.some((m) => m.code === "TM_TEN_YEARS")).toBe(false);
    expect(r.misalignments.some((m) => m.code === "TH_TEN_YEARS_APPROXIMATELY")).toBe(false);
    expect(r.counts.likelySameReferent).toBe(0);
    // SC-0020 A5: the [[…-AUDIT]] relic was removed from the map frontmatter — no dangling note now.
    expect(r.danglingNotes.length).toBe(0);
    expect(r.counts.refErrors).toBe(0); // P01 has no unknown codes (CB/FIG resolve)
    expect(r.counts.flagMismatch).toBe(0); // P01 CB/FIG flags align map↔FM
    expect(r.flagMismatches.length).toBe(0);
    // R1: no CB_/FIG_ code appears as a structural misalignment
    expect(r.misalignments.some((m) => m.code.startsWith("CB_") || m.code.startsWith("FIG_"))).toBe(false);
    // TH_TEN_YEARS_APPROXIMATELY is now the aligned object code; it stays UNVERIFIABLE (no TH_ registry) — acceptable.
    expect(r.unverifiable.some((u) => u.code === "TH_TEN_YEARS_APPROXIMATELY")).toBe(true);
    expect(r.unverifiable.every((u) => u.code.startsWith("TH_"))).toBe(true);
    // SC-0020 parity bar (the lead's ruling): the former REFERENCED-being-in-§3A-prose gaps (B2/B8/B9 @S4)
    // are now ALIGNED — the FOR_MODEL declares them in S4 and the map references each in S4's own §3A
    // relationship lines (B2 in the sons' "son of …" lines; B8/B9 in Naomi's "mother-in-law of … " line).
    // P01 is fully clean: zero un-accepted misalignments.
    expect(r.misalignments.filter((m) => m.severity === "MISALIGN")).toHaveLength(0);
    expect(r.counts.misalign).toBe(0);
    expect(r.ok).toBe(true);
  });

  it("P03: PL_LAND_OF_JUDAH gap survives; B31 name-binding ERROR survives; T7 thread + artifact siblings resolve", () => {
    const r = real("P03", "Ruth-1-15-18");
    expect(r.misalignments.some((m) => m.code === "PL_LAND_OF_JUDAH")).toBe(true);
    expect(r.nameBinding.some((f) => f.code === "B31" && f.severity === "ERROR")).toBe(true);
    expect(r.danglingNotes.length).toBe(0); // all of P03's note links resolve now
  });

  it("P04: PL1/PL2 map-not-FM gaps + TM_BARLEY_HARVEST_BEGINNING survive; T7-Harvest-Provision no longer dangles", () => {
    const r = real("P04", "Ruth-1-19-22");
    expect(r.misalignments.some((m) => m.code === "PL1" && m.direction === "MAP_NOT_FM")).toBe(true);
    expect(r.misalignments.some((m) => m.code === "PL2" && m.direction === "MAP_NOT_FM")).toBe(true);
    expect(r.misalignments.some((m) => m.code === "TM_BARLEY_HARVEST_BEGINNING")).toBe(true);
    expect(r.danglingNotes.some((d) => d.raw === "T7-Harvest-Provision")).toBe(false); // R3: real discourse-thread note
    expect(r.danglingNotes.length).toBe(0);
  });

  it("P05 (post-SC-0020): PL_NAOMIS_DWELLING + PL5_BOAZ_PORTION name-binding ERRORs are RESOLVED by slug normalization", () => {
    const r = real("P05", "Ruth-2-1-7");
    // SC-0020 A1 slug normalization: the map slugs (note-title-safe: no apostrophe) now match the BCD
    // names ("Naomi's Dwelling…", "Boaz's Portion…") after stripping `'` on both sides — no longer ERRORs.
    expect(r.nameBinding.some((f) => f.code === "PL_NAOMIS_DWELLING")).toBe(false);
    expect(r.nameBinding.some((f) => f.code === "PL5_BOAZ_PORTION")).toBe(false);
    expect(r.counts.nameErrors).toBe(0);
  });

  it("P05 (SC-0020 parity bar): the 3 cross-scene/FM-only gaps are NOT prose-resolved — they survive as signed-off ✓ ACCEPTED, not misalignments", () => {
    const r = real("P05", "Ruth-2-1-7");
    // The parity bar is SCENE-SCOPED: PL5 (FM S2) is map-referenced only in S3, B2 (FM S3 clan_eponym
    // slot) only in S1, TH_WITHIN_DAY (FM S4) never wikilinked — so none is resolved by same-scene prose.
    // All three are ruled ACCEPTED coverage differences (id-alignment-exceptions.json, SC-0020).
    const pl5 = r.misalignments.find((m) => m.code === "PL5" && m.scope === "S2");
    const b2 = r.misalignments.find((m) => m.code === "B2" && m.scope === "S3");
    const th = r.misalignments.find((m) => m.code === "TH_WITHIN_DAY_FROM_MORNING_UNTIL_NOW" && m.scope === "S4");
    expect(pl5?.severity).toBe("ACCEPTED");
    expect(b2?.severity).toBe("ACCEPTED");
    expect(th?.severity).toBe("ACCEPTED");
    // the cross-scene prose home is reported scene-accurately (so the inventory doesn't mislead)
    expect(pl5?.presentElsewhere).toMatch(/S3/);
    expect(b2?.presentElsewhere).toMatch(/S1/);
    expect(th?.presentElsewhere).toBeUndefined(); // never referenced anywhere in the map
    // zero UN-accepted misalignments; the run is clean (the name-binding B31 is P02/P03, not P05)
    expect(r.counts.misalign).toBe(0);
    expect(r.ok).toBe(true);
  });

  it("P06 (post-SC-0020): 'B?' is a WITHHELD_REFERENT (INFO, not ERROR, not a misalignment); PL_AMONG_SHEAVES gap survives; FIG_0131 not a flag mismatch", () => {
    const r = real("P06", "Ruth-2-8-16");
    // SC-0020 A1: B? is an INTENTIONAL withheld referent (the deceased-husband, pair withheld per P01-D2).
    // It is surfaced as INFO, never a ref-integrity ERROR, and never enters the structural symmetric diff.
    expect(r.referenceIntegrity.some((f) => f.code === "B?")).toBe(false);
    expect(r.counts.refErrors).toBe(0);
    expect(r.withheldReferents.some((w) => w.code === "B?" && w.side === "FOR_MODEL" && w.reason === "WITHHELD_REFERENT")).toBe(true);
    expect(r.counts.withheld).toBe(1);
    expect(r.misalignments.some((m) => m.code === "B?")).toBe(false);
    expect(r.misalignments.some((m) => m.code === "PL_AMONG_SHEAVES")).toBe(true);
    // FIG_0131 is mentioned only inside a §5A bullet's parenthetical (cross-pericope ref) and in an FM
    // cross_ref string — not a flag on this pericope on either side, so it must NOT surface as a mismatch.
    expect(r.flagMismatches.some((f) => f.code === "FIG_0131")).toBe(false);
    expect(r.counts.flagMismatch).toBe(0);
  });
});
