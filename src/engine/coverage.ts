import type { Referent, SourcePacket, AliasTable, AliasEntry, CoarseKind, Concern } from "../reader/source-packet.js";

/**
 * Coverage reconciliation (docs/COVERAGE.md). Reconciles the BHSA referent set R (the finite
 * set of referring expressions fixed by the source text) against the map's entity-mention set M
 * (every B#/PL#/O#/TM# usage in the FOR_MODEL), into three buckets + an honest score.
 *
 * The asymmetry the doc insists on is preserved in code:
 *   - UNANCHORED_ENTITY ("nothing added") is near-mechanical: each non-abstract map entity must
 *     have ≥1 verse anchor whose BHSA text can *host* it (kind-compatible, gender non-contradicting).
 *     Permissive host rule ⇒ we rarely cry hallucination. Abstract TH_/CB_ overlays are exempt (soft).
 *   - UNMAPPED_SOURCE ("nothing missing") splits by strength of claim: an unmapped *proper noun*
 *     is a real omission (block); an unmapped *common noun/participle* is a reviewer checklist (warn);
 *     *implied subjects* are always surfaced as a flagged checklist; pronouns/suffixes are minor.
 */

// ───────────────────────── entity id → kind / abstractness ─────────────────────────

export function entityKind(id: string): CoarseKind | null {
  if (/^B\d+$/.test(id)) return "PERSON";
  if (/^PL(\d|_)/.test(id)) return "PLACE";
  if (/^O\d+$/.test(id)) return "THING";
  if (/^TH_/.test(id)) return "THING"; // thematic/phrase object (abstract overlay)
  if (/^CB_\d+$/.test(id)) return "THING"; // concept-bank pointer (abstract)
  if (/^TM_/.test(id)) return "TIME";
  if (/^I\d+$/.test(id)) return "INSTITUTION";
  return null;
}

/** Thematic-phrase and concept overlays have no single surface anchor — interpretive, never red. */
export function isAbstractEntity(id: string): boolean {
  return /^(TH_|CB_)/.test(id);
}

// ───────────────────────── Hebrew normalization ─────────────────────────

/** Strip niqqud, cantillation, maqaf and spacing; keep only base Hebrew consonants (U+05D0–U+05EA). */
export function consonantal(hebrew: string | null | undefined): string {
  if (!hebrew) return "";
  let out = "";
  for (const ch of hebrew) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x05d0 && c <= 0x05ea) out += ch;
  }
  return out;
}

/** Latin-ish token of an English label/gloss, for the secondary match key. */
function latin(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

// ───────────────────────── verse helpers ─────────────────────────

/** "1:1a" → "1:1". */
export function reduceVerse(anchor: string): string {
  const m = anchor.match(/^(\d+:\d+)/);
  return m ? m[1]! : anchor;
}

/** "1:1-2" → ["1:1","1:2"]; "1:3" → ["1:3"]. Same-chapter ranges only (pilot-2 scenes never span chapters). */
export function expandVerseRange(range: string): string[] {
  const m = range.match(/^(\d+):(\d+)\s*-\s*(?:(\d+):)?(\d+)$/);
  if (!m) return [reduceVerse(range)];
  const ch = Number(m[1]);
  const from = Number(m[2]);
  const toCh = m[3] ? Number(m[3]) : ch;
  const to = Number(m[4]);
  if (toCh !== ch) return [`${ch}:${from}`, `${toCh}:${to}`]; // defensive; not expected in pilot-2
  const out: string[] = [];
  for (let v = from; v <= to; v++) out.push(`${ch}:${v}`);
  return out;
}

// ───────────────────────── M: entity mentions from the FOR_MODEL ─────────────────────────

export interface EntityMention {
  entity_id: string;
  kind: CoarseKind;
  abstract: boolean;
  verses: string[]; // verses where the map places this entity
  referential_forms: string[];
  presences: string[];
  roles: string[];
  sources: string[]; // "scene:S1", "prop:P3", ...
}

const SCENE_GROUPS: Array<[string, string]> = [
  ["beings_in_scene", "being_id"],
  ["places_in_scene", "place_id"],
  ["objects_in_scene", "object_id"],
  ["times_in_scene", "time_id"],
];

function pushMention(
  map: Map<string, EntityMention>,
  id: string,
  verses: string[],
  opts: { referential_form?: string | null; presence?: string | null; role?: string | null; source: string },
): void {
  const kind = entityKind(id);
  if (!kind) return;
  let m = map.get(id);
  if (!m) {
    m = { entity_id: id, kind, abstract: isAbstractEntity(id), verses: [], referential_forms: [], presences: [], roles: [], sources: [] };
    map.set(id, m);
  }
  for (const v of verses) if (!m.verses.includes(v)) m.verses.push(v);
  if (opts.referential_form && !m.referential_forms.includes(opts.referential_form)) m.referential_forms.push(opts.referential_form);
  if (opts.presence && !m.presences.includes(opts.presence)) m.presences.push(opts.presence);
  if (opts.role && !m.roles.includes(opts.role)) m.roles.push(opts.role);
  if (!m.sources.includes(opts.source)) m.sources.push(opts.source);
}

/** Walk event_specific_slots collecting every entity-id string (incl. inside arrays/objects). */
function collectSlotEntityIds(node: unknown, acc: Set<string>): void {
  if (typeof node === "string") {
    if (entityKind(node)) acc.add(node);
  } else if (Array.isArray(node)) {
    for (const x of node) collectSlotEntityIds(x, acc);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectSlotEntityIds(v, acc);
  }
}

export function extractMentions(forModel: any): EntityMention[] {
  const map = new Map<string, EntityMention>();

  for (const scene of forModel.level_2_scenes ?? []) {
    const verses = expandVerseRange(String(scene.verse_range ?? ""));
    const sceneSrc = `scene:${scene.scene_id ?? "?"}`;
    for (const [group, idKey] of SCENE_GROUPS) {
      const entries = scene?.[group]?.entries;
      if (!Array.isArray(entries)) continue;
      for (const e of entries) {
        const id = e?.[idKey];
        if (typeof id !== "string") continue;
        pushMention(map, id, verses, {
          referential_form: e.referential_form ?? null,
          presence: e.presence ?? null,
          role: e.role_in_scene ?? e.function_in_scene ?? null,
          source: sceneSrc,
        });
      }
    }
  }

  for (const prop of forModel.level_3_propositions ?? []) {
    const v = reduceVerse(String(prop.verse_anchor ?? ""));
    if (!v) continue;
    const ids = new Set<string>();
    collectSlotEntityIds(prop.event_specific_slots, ids);
    // referential_form hints asserted at this verse (used only to boost lexical matching)
    const rforms = new Set<string>();
    collectReferentialForms(prop.event_specific_slots, rforms);
    for (const id of ids) {
      pushMention(map, id, [v], { source: `prop:${prop.prop_id ?? "?"}` });
      const m = map.get(id);
      if (m) for (const rf of rforms) if (!m.referential_forms.includes(rf)) m.referential_forms.push(rf);
    }
  }

  return [...map.values()];
}

function collectReferentialForms(node: unknown, acc: Set<string>): void {
  if (Array.isArray(node)) {
    for (const x of node) collectReferentialForms(x, acc);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "referential_form" || k === "referential_form_at_verse") && typeof v === "string") acc.add(v);
      else collectReferentialForms(v, acc);
    }
  }
}

// ───────────────────────── matching ─────────────────────────

/**
 * Two thresholds, because the two questions want different strengths of evidence:
 *  - ANCHOR (entity side): an entity is *hostable* by any kind-compatible, gender-non-contradicting
 *    expression. Permissive ⇒ we rarely cry hallucination ("nothing added" stays near-airtight).
 *  - MAP (referent side): a *source noun* counts as realized by an entity only with real evidence —
 *    a Hebrew lexical match, or a `referential_form` keyword (e.g. "UNNAMED_MAN" ⊇ "man"), or (for
 *    proper nouns) a name match. Mere kind-compatibility is NOT enough, else every generic noun
 *    ("name", "two") trivially absorbs into some present entity and the reviewer checklist vanishes.
 */
const ANCHOR_THRESHOLD = 10;
const MAP_THRESHOLD = 30;

export interface MatchScore {
  score: number;
  via: "name" | "lexical" | "referential_form" | "kind";
}

/** Score how well referent r can realize entity m (with alias info a). null ⇒ incompatible. */
export function matchScore(r: Referent, m: EntityMention, a: AliasEntry | undefined): MatchScore | null {
  // kind gate: the entity's coarse kind must be admissible for this referent class
  const mKind = a?.kind ?? m.kind;
  if (!r.kind_candidates.includes(mKind) && !(mKind === "INSTITUTION" && r.kind_candidates.includes("PERSON"))) {
    return null;
  }

  const rc = consonantal(r.surface);
  // match the referent's consonantal surface against the entity's primary Hebrew OR any surface alias
  // (e.g. "the land" אָרֶץ ↔ PL_LAND_OF_JUDAH via the alias אֶרֶץ, not just the primary אֶרֶץ יְהוּדָה).
  const hebForms = [a?.hebrew_cons ?? "", ...(a?.hebrew_cons_aliases ?? [])].filter(Boolean);
  const hebMatch = !!(rc && hebForms.some((h) => h.includes(rc) || rc.includes(h)));
  const rl = latin(r.gloss);
  const el = latin(a?.english);
  const latinMatch = !!(rl && el && rl.length >= 3 && (el.includes(rl) || rl.includes(el)));

  if (r.referent_class === "proper_noun") {
    // a named referent realizes ONLY the entity bearing that name (specificity). The name match is
    // AUTHORITATIVE and is NOT vetoed by gender: alias gender is a heuristic hint (e.g. YHWH is
    // grammatically masculine in the text, so a mis-guessed alias gender must not block its name match).
    if (hebMatch) return { score: 108, via: "name" };
    if (latinMatch) return { score: 80, via: "name" };
    return null; // named, but no present entity bears this name ⇒ possible omission
  }

  // gender non-contradiction — applies only to UNNAMED referents (disambiguates among present
  // candidates, e.g. "his wife" f vs the men). Both genders must be known to fire.
  if (a?.gender && r.gender && (r.gender === "m" || r.gender === "f") && a.gender !== r.gender) {
    return null;
  }

  // unnamed referent (common noun / participle / pronoun / suffix / implied): any kind- and
  // gender-compatible entity is a *host* (base), strengthened to a *map* by real evidence.
  let score = ANCHOR_THRESHOLD;
  let via: MatchScore["via"] = "kind";
  if (hebMatch) {
    score += 55;
    via = "lexical";
  } else if (a) {
    // WHOLE-WORD keyword match: a gloss "man" maps to UNNAMED_MAN_FROM_BETHLEHEM (token "man"),
    // but a gloss "name" must NOT match "UNnamed" (substring) — that would absorb structural nouns.
    const tokenSet = new Set(
      m.referential_forms.concat(a.referential_forms).join(" ").toLowerCase().split(/[^a-z]+/).filter(Boolean),
    );
    if (rl && rl.length >= 3 && tokenSet.has(rl)) {
      score += 35;
      via = "referential_form";
    }
  }
  if (a?.gender && r.gender && a.gender === r.gender) score += 8; // gender corroboration
  if (m.abstract) score -= 5; // prefer concrete entities on ties
  return { score, via };
}

export type MatchVia = MatchScore["via"];

export interface MatchedRow {
  ref_id: string;
  verse: string;
  surface: string;
  gloss: string;
  referent_class: string;
  concern: Concern;
  entity_id: string;
  entity_kind: CoarseKind;
  via: MatchVia;
}

export type UnmappedSubtag = "proper" | "checklist" | "implied_subject" | "minor";

export interface UnmappedRow {
  ref_id: string;
  verse: string;
  surface: string;
  gloss: string;
  referent_class: string;
  concern: Concern;
  subtag: UnmappedSubtag;
  likely_impersonal?: boolean;
  best_guess_entity?: string; // for implied subjects / pronouns: closest compatible entity at the verse
}

export interface EntityRow {
  entity_id: string;
  kind: CoarseKind;
  abstract: boolean;
  verses: string[];
  referential_forms: string[];
  presences: string[];
  anchored: boolean;
  host_refs: string[]; // ref_ids that can host it
}

export interface CoverageLedger {
  pericope: string;
  bcv: string;
  bhsa_version: string;
  ok: boolean;
  blockers: string[];
  score: {
    explicit_total: number;
    explicit_matched: number;
    proper_unmapped: number; // high-concern omissions (block)
    checklist: number; // common/participle source nouns to tick (warn)
    implied_flagged: number;
    minor: number;
    entities_total: number;
    entities_anchored: number;
    unanchored: number; // non-abstract (block)
    unanchored_abstract: number; // interpretive (warn)
  };
  score_line: string;
  matched: MatchedRow[];
  unmapped_source: UnmappedRow[];
  unanchored_entities: EntityRow[];
  entities: EntityRow[];
}

function bestEntityFor(
  r: Referent,
  mentionsAtVerse: EntityMention[],
  aliases: AliasTable,
  minScore = 0,
): { m: EntityMention; via: MatchVia; score: number } | null {
  let best: { m: EntityMention; via: MatchVia; score: number } | null = null;
  for (const m of mentionsAtVerse) {
    const s = matchScore(r, m, aliases.entities[m.entity_id]);
    if (!s || s.score < minScore) continue;
    if (!best || s.score > best.score || (s.score === best.score && m.entity_id < best.m.entity_id)) {
      best = { m, via: s.via, score: s.score };
    }
  }
  return best;
}

export function reconcile(packet: SourcePacket, forModel: any, aliases: AliasTable): CoverageLedger {
  const mentions = extractMentions(forModel);
  const byVerse = new Map<string, EntityMention[]>();
  for (const m of mentions) for (const v of m.verses) (byVerse.get(v) ?? byVerse.set(v, []).get(v)!).push(m);

  const matched: MatchedRow[] = [];
  const unmapped: UnmappedRow[] = [];
  const hostsByEntity = new Map<string, string[]>(); // entity_id → ref_ids that can host it (ANCHOR_THRESHOLD)

  // pass 1: anchoring — every referent that can host an entity records that (permissive)
  for (const r of packet.referents) {
    for (const m of byVerse.get(r.verse) ?? []) {
      const s = matchScore(r, m, aliases.entities[m.entity_id]);
      if (s && s.score >= ANCHOR_THRESHOLD) (hostsByEntity.get(m.entity_id) ?? hostsByEntity.set(m.entity_id, []).get(m.entity_id)!).push(r.ref_id);
    }
  }

  // pass 2: referent → best entity (many-to-one). Implied subjects are always a flagged checklist.
  for (const r of packet.referents) {
    const atVerse = byVerse.get(r.verse) ?? [];

    if (r.concern === "implied_subject") {
      const guess = bestEntityFor(r, atVerse, aliases); // closest compatible entity, any score
      unmapped.push({
        ref_id: r.ref_id, verse: r.half_verse, surface: r.surface, gloss: r.gloss,
        referent_class: r.referent_class, concern: r.concern, subtag: "implied_subject",
        likely_impersonal: r.likely_impersonal, best_guess_entity: guess?.m.entity_id,
      });
      continue;
    }

    const best = bestEntityFor(r, atVerse, aliases, MAP_THRESHOLD); // mapping needs real evidence
    if (best) {
      matched.push({
        ref_id: r.ref_id, verse: r.half_verse, surface: r.surface, gloss: r.gloss,
        referent_class: r.referent_class, concern: r.concern,
        entity_id: best.m.entity_id, entity_kind: best.m.kind, via: best.via,
      });
      continue;
    }
    // unmapped — classify the strength of the concern
    let subtag: UnmappedSubtag;
    if (r.concern === "minor") subtag = "minor";
    else if (r.referent_class === "proper_noun") subtag = "proper"; // real omission risk
    else subtag = "checklist"; // common noun / participle: reviewer ticks
    unmapped.push({
      ref_id: r.ref_id, verse: r.half_verse, surface: r.surface, gloss: r.gloss,
      referent_class: r.referent_class, concern: r.concern, subtag,
    });
  }

  // entity rows + anchoring status
  const entities: EntityRow[] = mentions
    .map((m) => {
      const host_refs = hostsByEntity.get(m.entity_id) ?? [];
      return {
        entity_id: m.entity_id, kind: m.kind, abstract: m.abstract, verses: [...m.verses].sort(),
        referential_forms: m.referential_forms, presences: m.presences,
        anchored: host_refs.length > 0, host_refs,
      };
    })
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  const unanchored_entities = entities.filter((e) => !e.anchored);

  // scoring
  const explicit = packet.referents.filter((r) => r.concern === "explicit");
  const explicitMatched = matched.filter((m) => m.concern === "explicit").length;
  const properUnmapped = unmapped.filter((u) => u.subtag === "proper").length;
  const checklist = unmapped.filter((u) => u.subtag === "checklist").length;
  const impliedFlagged = unmapped.filter((u) => u.subtag === "implied_subject").length;
  const minor = unmapped.filter((u) => u.subtag === "minor").length;
  const nonAbstractUnanchored = unanchored_entities.filter((e) => !e.abstract);
  const abstractUnanchored = unanchored_entities.filter((e) => e.abstract);

  const blockers: string[] = [];
  for (const e of nonAbstractUnanchored) blockers.push(`UNANCHORED_ENTITY ${e.entity_id} (${e.kind}) at ${e.verses.join(",")} — no source expression can host it`);
  for (const u of unmapped.filter((x) => x.subtag === "proper")) blockers.push(`UNMAPPED_SOURCE proper noun '${u.surface}' (${u.gloss}) at ${u.verse} — named referent absent from the map`);

  const accountedFor = explicit.length - properUnmapped; // everything but genuine proper-noun omissions
  const score = {
    explicit_total: explicit.length,
    explicit_matched: explicitMatched,
    proper_unmapped: properUnmapped,
    checklist,
    implied_flagged: impliedFlagged,
    minor,
    entities_total: entities.length,
    entities_anchored: entities.filter((e) => e.anchored).length,
    unanchored: nonAbstractUnanchored.length,
    unanchored_abstract: abstractUnanchored.length,
  };
  const score_line =
    `${packet.pericope} coverage: ${accountedFor}/${explicit.length} explicit referents accounted for · ` +
    `${impliedFlagged} implied subject${impliedFlagged === 1 ? "" : "s"} flagged · ` +
    `${nonAbstractUnanchored.length} unanchored entit${nonAbstractUnanchored.length === 1 ? "y" : "ies"}` +
    (checklist ? ` · ${checklist} source noun${checklist === 1 ? "" : "s"} to tick` : "");

  return {
    pericope: packet.pericope, bcv: packet.bcv, bhsa_version: packet.bhsa_version,
    ok: blockers.length === 0, blockers,
    score, score_line,
    matched, unmapped_source: unmapped, unanchored_entities, entities,
  };
}
