import type { MeaningMap } from "../reader/meaning-map.js";

/** Sentinel prefix for a field that needs LLM/human judgment (Agent 3's job; Slice 4 fills these). */
export const TODO = "__TODO__";

/** Collapse whitespace + truncate a source-prose span for embedding in a placeholder/hint. */
function oneLine(s: string, max = 160): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
/** A typed judgment placeholder carrying its source-prose span (never null): `__TODO__: <span>`. */
function todo(span?: string | null): string {
  return span && span.trim() ? `${TODO}: ${oneLine(span)}` : TODO;
}
/** True if a value is an unfilled judgment placeholder (string `__TODO__…` or object with a `__TODO__` key). */
export function isTodo(v: unknown): boolean {
  if (typeof v === "string") return v.startsWith(TODO);
  return !!v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, TODO);
}

export interface Gap {
  location: string; // JSON-pointer-ish path in the skeleton
  field: string;
  reason: string;
  hint?: string; // the MM prose span that informs the judgment
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
 * Deterministically compile a Meaning Map into a FOR_MODEL *skeleton*: every field derivable from
 * the MM's machine-readable structure is filled (header, classification, scene + entity IDs/presence,
 * verse-ranges, significant_absence, communicative purpose, proposition anchors/scene-links/cross-refs,
 * Section-5 concept/figure flags). Controlled-vocabulary tokens + event slots — the judgment Agent 3
 * supplies — are left as typed placeholders that **carry their source-prose span** (`__TODO__: <span>`),
 * each also recorded in `gaps`. No LLM, no invented values. The result is the seam Slice 4 fills.
 */
export function compileSkeleton(mm: MeaningMap): CompileResult {
  const gaps: Gap[] = [];
  const gap = (location: string, field: string, reason: string, hint?: string) =>
    gaps.push(hint ? { location, field, reason, hint } : { location, field, reason });

  const num = (mm.pericope ?? "P00").replace(/\D/g, "").padStart(2, "0");
  const bcv = (mm.bcv ?? "").replace(/[–—]/g, "-");
  const book = (bcv.split(/\s+/)[0] || "ruth").toLowerCase(); // SC-0032: book-general sta_id prefix; "Ruth …" → ruth (byte-identical)
  const mmRef = mm.path.split("/").pop()?.replace(/\.md$/, "") ?? null;

  // ---- header ----
  const header: Record<string, unknown> = {
    bcv: bcv || todo(),
    pericope_title: mm.title ?? todo(),
    book_context_ref: todo("set the BCD ref, e.g. ruth_pilot_BCD_v0_3"),
    source_meaning_map_ref: mmRef ?? todo(),
    source_language: "Biblical Hebrew",
  };
  if (!bcv) gap("/header/bcv", "bcv", "missing in frontmatter");
  if (!mm.title) gap("/header/pericope_title", "pericope_title", "missing in frontmatter");
  gap("/header/book_context_ref", "book_context_ref", "not in the meaning map — set the BCD ref (e.g. ruth_pilot_BCD_v0_3)");

  // ---- pericope_classification ----
  const classification: Record<string, unknown> = {
    genre_group: mm.genreGroup ?? todo(),
    genre: mm.genre ?? todo(),
    register: mm.register ?? todo(),
    register_overrides: { _note: "scaffold — confirm against the MM's multi-level register tagging", scene_level: null, moment_level: null },
  };
  if (!mm.genreGroup) gap("/pericope_classification/genre_group", "genre_group", "missing in frontmatter");
  if (!mm.genre) gap("/pericope_classification/genre", "genre", "missing in frontmatter");
  if (!mm.register) gap("/pericope_classification/register", "register", "missing in frontmatter");
  gap("/pericope_classification/register_overrides", "register_overrides", "MM Section 1 may mark scene/moment register or NARRATIVE_FRAMING shifts in prose — encode structurally if present");

  // ---- level_1 (all judgment: Section 2 is prose; the gap carries the Section-2 span) ----
  const level_1: Record<string, unknown[]> = {};
  const l1span: Record<string, string | null> = {
    arc_elements: mm.level1Prose.arc,
    context_elements: mm.level1Prose.context,
    tone_elements: mm.level1Prose.tonePace,
    pace_elements: mm.level1Prose.tonePace,
    communicative_function_elements: mm.level1Prose.commFunc,
  };
  for (const f of ["arc_elements", "context_elements", "tone_elements", "pace_elements", "communicative_function_elements"]) {
    level_1[f] = [];
    gap(`/level_1/${f}`, f, "Section 2 prose — tokenize to L1 elements (judgment)", l1span[f] ?? undefined);
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
      // SC-0063: a code-less being (the uncoded-entity idiom — P13's child, "the dead") previously
      // left a __TODO__ with NO gap entry, unreachable through the patch contract. Mirror the
      // place/object rule: gap it so the drafter judges the code (assign registry / propose / note).
      if (!b.code)
        gap(`${at}/beings_in_scene/entries/${i}/being_id`, "being_id", "no wikilink in MM — assign a registry B code or propose one (the map may keep the entity deliberately uncoded; judge + note)", b.label);
      return { being_id: b.code ?? todo(b.label), role_in_scene: todo(b.roleProse ?? b.label), presence: b.presence ?? todo() };
    });
    // SC-0022: place/object/time scene entries are id-only (role_in_scene/function_in_scene dropped
    // from the schema). The skeleton still gaps a missing place/object code; times carry no judgment gap.
    const placeEntries = sc.places.map((p, i) => {
      if (!p.code) gap(`${at}/places_in_scene/entries/${i}/place_id`, "place_id", "no wikilink in MM — assign/register a PL code", p.label);
      return { place_id: p.code ?? todo(p.label) };
    });
    const objectEntries = sc.objects.map((o, i) => {
      if (!o.code) gap(`${at}/objects_in_scene/entries/${i}/object_id`, "object_id", "no wikilink in MM — assign an O#/TH_ code (FOR_MODEL coding may differ from MM)", o.label);
      return { object_id: o.code ?? todo(o.label) };
    });
    const times =
      sc.times === null
        ? { _note: "no distinct temporal frame for this scene (per meaning map)", entries: null }
        : {
            entries: sc.times.map((t, i) => {
              // SC-0063: a code-less time previously left a __TODO__ with no gap (the SC-0022
              // "times carry no judgment gap" predates the drafter). Mirror places/objects:
              // the drafter assigns a TM_ token (a registry PROPOSAL — gold P04 minted its own).
              if (!t.code)
                gap(`${at}/times_in_scene/entries/${i}/time_id`, "time_id", "no wikilink in MM — assign a TM_ code (registry proposal; judgment)", t.label);
              return { time_id: t.code ?? todo(t.label) };
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
      verse_range: sc.verseRange ?? todo(),
      scene_kind: todo(sc.title),
      scene_communicative_purpose: sc.communicativePurpose ?? todo(),
      beings_in_scene: { entries: beingEntries },
      places_in_scene: { entries: placeEntries },
      objects_in_scene: { entries: objectEntries },
      times_in_scene: times,
      significant_absence: sc.significantAbsence ?? todo(),
    };
  });

  // ---- level_3_propositions (MM granularity → renumbered P1..PN; judgment fields are span-carrying placeholders) ----
  let flagsCarried = 0;
  const level_3_propositions = mm.propositions.map((p, pi) => {
    const at = `/level_3_propositions/${pi}`;
    flagsCarried += p.cbFlags.length + p.figFlags.length;
    const qa = p.qa.join(" | ");
    gap(`${at}/proposition_kind`, "proposition_kind", "assign controlled proposition_kind (judgment)", p.qa[0] ?? undefined);
    gap(`${at}/event_specific_slots`, "event_specific_slots", "assign event-participant slots from the MM Q/A (judgment)", qa || undefined);
    gap(`${at}/inter_proposition_links`, "inter_proposition_links", "assign forward_link_to / caused_by / paired_with (judgment)");
    if (!p.sceneLink) gap(`${at}/scene_link`, "scene_link", "no [Scene N] tag on the proposition heading");
    if (!p.verseAnchor) gap(`${at}/verse_anchor`, "verse_anchor", "no verse anchor on the proposition heading");
    const out: Record<string, unknown> = {
      prop_id: `P${pi + 1}`,
      scene_link: p.sceneLink ?? todo(),
      verse_anchor: p.verseAnchor ?? todo(),
      proposition_kind: todo(p.qa[0]),
      event_specific_slots: qa ? { [TODO]: oneLine(qa) } : { [TODO]: "assign event-participant slots (judgment)" },
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
    sta_id: `${book}_pericope_${num}_v2_0`,
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
