import type { MeaningMap, MMEntity, MMScene } from "../reader/meaning-map.js";

/** Sentinel for a field that needs LLM/human judgment (Agent 3's job; Slice 4 fills these). */
export const TODO = "__TODO__";

export interface Gap {
  location: string; // JSON-pointer-ish path in the skeleton
  field: string;
  reason: string;
  hint?: string; // the MM prose that informs the judgment
}

export interface CompileResult {
  skeleton: Record<string, unknown>;
  gaps: Gap[];
  stats: {
    scenes: number;
    propositions: number;
    beings: number;
    placesWithCode: number;
    flagsCarried: number;
    gaps: number;
  };
}

/**
 * Deterministically compile a Meaning Map into a FOR_MODEL *skeleton*: every field derivable
 * from the MM's machine-readable structure is filled (header, classification, scene + entity
 * IDs/presence, verse-ranges, significant_absence, communicative purpose, proposition
 * anchors/scene-links/cross-refs, and the Section-5 concept/figure flags). Controlled-vocabulary
 * tokens and event slots — the judgment Agent 3 supplies — are left as `__TODO__` and recorded
 * in `gaps` (with the MM prose as a hint). No LLM. The result is the seam Slice 4 fills.
 */
export function compileSkeleton(mm: MeaningMap): CompileResult {
  const gaps: Gap[] = [];
  const gap = (location: string, field: string, reason: string, hint?: string) =>
    gaps.push(hint ? { location, field, reason, hint } : { location, field, reason });

  const num = (mm.pericope ?? "P00").replace(/\D/g, "").padStart(2, "0");
  const bcv = (mm.bcv ?? "").replace(/[–—]/g, "-");
  const mmRef = mm.path.split("/").pop()?.replace(/\.md$/, "") ?? null;

  // ---- header ----
  const header: Record<string, unknown> = {
    bcv: bcv || TODO,
    pericope_title: mm.title ?? TODO,
    book_context_ref: TODO,
    source_meaning_map_ref: mmRef ?? TODO,
    source_language: "Biblical Hebrew",
  };
  if (!bcv) gap("/header/bcv", "bcv", "missing in frontmatter");
  if (!mm.title) gap("/header/pericope_title", "pericope_title", "missing in frontmatter");
  gap("/header/book_context_ref", "book_context_ref", "not in the meaning map — set the BCD ref (e.g. ruth_pilot_BCD_v0_3)");

  // ---- pericope_classification ----
  const classification: Record<string, unknown> = {
    genre_group: mm.genreGroup ?? TODO,
    genre: mm.genre ?? TODO,
    register: mm.register ?? TODO,
    register_overrides: { _note: "scaffold — confirm against the MM's multi-level register tagging", scene_level: null, moment_level: null },
  };
  if (!mm.genreGroup) gap("/pericope_classification/genre_group", "genre_group", "missing in frontmatter");
  if (!mm.genre) gap("/pericope_classification/genre", "genre", "missing in frontmatter");
  if (!mm.register) gap("/pericope_classification/register", "register", "missing in frontmatter");
  gap("/pericope_classification/register_overrides", "register_overrides", "MM Section 1 may mark scene/moment register or NARRATIVE_FRAMING shifts in prose — encode structurally if present");

  // ---- level_1 (all judgment: Section 2 is prose) ----
  const level_1: Record<string, unknown[]> = {};
  for (const f of ["arc_elements", "context_elements", "tone_elements", "pace_elements", "communicative_function_elements"]) {
    level_1[f] = [];
    gap(`/level_1/${f}`, f, "Section 2 prose — tokenize to L2 elements (judgment)");
  }

  // ---- level_2_scenes ----
  let beings = 0;
  let placesWithCode = 0;
  const level_2_scenes = mm.scenes.map((sc, si) => {
    const at = `/level_2_scenes/${si}`;
    beings += sc.beings.length;
    placesWithCode += sc.places.filter((p) => p.code).length;

    const beingEntries = sc.beings.map((b, i) => {
      gap(`${at}/beings_in_scene/entries/${i}/role_in_scene`, "role_in_scene", "tokenize from MM role prose (judgment)", b.roleProse ?? b.label);
      gap(`${at}/beings_in_scene/entries/${i}/referential_form`, "referential_form", "not in MM — assign if the narrator uses a marked reference (judgment)");
      if (!b.presence) gap(`${at}/beings_in_scene/entries/${i}/presence`, "presence", "no Presence line in MM", b.label);
      return { being_id: b.code ?? TODO, role_in_scene: TODO, presence: b.presence ?? TODO };
    });
    const placeEntries = sc.places.map((p, i) => {
      if (!p.code) gap(`${at}/places_in_scene/entries/${i}/place_id`, "place_id", "no wikilink in MM — assign/register a PL code", p.label);
      gap(`${at}/places_in_scene/entries/${i}/role_in_scene`, "role_in_scene", "tokenize from MM role prose (judgment)", p.roleProse ?? p.label);
      return { place_id: p.code ?? TODO, role_in_scene: TODO };
    });
    const objectEntries = sc.objects.map((o, i) => {
      if (!o.code) gap(`${at}/objects_in_scene/entries/${i}/object_id`, "object_id", "no wikilink in MM — assign an O#/TH_ code (FOR_MODEL coding may differ from MM)", o.label);
      gap(`${at}/objects_in_scene/entries/${i}/function_in_scene`, "function_in_scene", "tokenize from MM prose (judgment)", o.roleProse ?? o.label);
      return { object_id: o.code ?? TODO, function_in_scene: TODO };
    });
    const times =
      sc.times === null
        ? { _note: "no distinct temporal frame for this scene (per meaning map)", entries: null }
        : {
            entries: sc.times.map((t, i) => {
              gap(`${at}/times_in_scene/entries/${i}/role_in_scene`, "role_in_scene", "tokenize from MM prose (judgment)", t.roleProse ?? t.label);
              return { time_id: t.code ?? TODO, role_in_scene: TODO };
            }),
          };

    gap(`${at}/scene_kind`, "scene_kind", "assign controlled scene_kind (judgment)", sc.title);
    if (sc.beingsInProseOnly.length)
      gap(
        `${at}/beings_in_scene`,
        "beings_in_scene",
        "being(s) named in scene prose but not in the 3A list — the FOR_MODEL often adds these as REFERENCED (judgment)",
        sc.beingsInProseOnly.join(", "),
      );
    if (!sc.verseRange) gap(`${at}/verse_range`, "verse_range", "could not parse a (v.X–Y) range from the scene heading");
    if (!sc.communicativePurpose) gap(`${at}/scene_communicative_purpose`, "scene_communicative_purpose", "no 3F Communicative Purpose block in MM");
    if (!sc.significantAbsence) gap(`${at}/significant_absence`, "significant_absence", "no Significant Absence block in MM (LOAD-BEARING)");

    return {
      scene_id: sc.sceneId,
      verse_range: sc.verseRange ?? TODO,
      scene_kind: TODO,
      scene_communicative_purpose: sc.communicativePurpose ?? TODO,
      beings_in_scene: { entries: beingEntries },
      places_in_scene: { entries: placeEntries },
      objects_in_scene: { entries: objectEntries },
      times_in_scene: times,
      significant_absence: sc.significantAbsence ?? TODO,
    };
  });

  // ---- level_3_propositions (MM granularity → renumbered P1..PN; judgment fields TODO) ----
  let flagsCarried = 0;
  const level_3_propositions = mm.propositions.map((p, pi) => {
    const at = `/level_3_propositions/${pi}`;
    flagsCarried += p.cbFlags.length + p.figFlags.length;
    gap(`${at}/proposition_kind`, "proposition_kind", "assign controlled proposition_kind (judgment)", p.qa[0] ?? undefined);
    gap(`${at}/event_specific_slots`, "event_specific_slots", "assign event-participant slots from the MM Q/A (judgment)", p.qa.join(" | ") || undefined);
    gap(`${at}/inter_proposition_links`, "inter_proposition_links", "assign forward_link_to / caused_by / paired_with (judgment)");
    if (!p.sceneLink) gap(`${at}/scene_link`, "scene_link", "no [Scene N] tag on the proposition heading");
    if (!p.verseAnchor) gap(`${at}/verse_anchor`, "verse_anchor", "no verse anchor on the proposition heading");
    const out: Record<string, unknown> = {
      prop_id: `P${pi + 1}`,
      scene_link: p.sceneLink ?? TODO,
      verse_anchor: p.verseAnchor ?? TODO,
      proposition_kind: TODO,
      event_specific_slots: {},
      inter_proposition_links: {},
      cb_flags: p.cbFlags,
      figure_flags: p.figFlags,
    };
    if (p.crossRef) out["cross_ref"] = p.crossRef;
    return out;
  });
  gap(
    "/level_3_propositions",
    "(granularity)",
    `extracted ${mm.propositions.length} propositions at MEANING-MAP granularity; the FOR_MODEL may decompose multi-event propositions further (judgment) and re-anchor flags by verse`,
  );

  const skeleton: Record<string, unknown> = {
    sta_id: `ruth_pericope_${num}_v2_0`,
    tagset_version: "TRIPOD_STA_v2_0",
    header,
    pericope_classification: classification,
    level_1,
    level_2_scenes,
    level_3_propositions,
  };

  return {
    skeleton,
    gaps,
    stats: {
      scenes: mm.scenes.length,
      propositions: mm.propositions.length,
      beings,
      placesWithCode,
      flagsCarried,
      gaps: gaps.length,
    },
  };
}
