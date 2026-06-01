import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadValidationRules } from "../spec/load.js";
import {
  loadAliasTable,
  loadConceptRegistry,
  loadFigureRegistry,
  type AliasTable,
  type CodeRegistry,
} from "../reader/source-packet.js";
import { readMeaningMap, type MeaningMap } from "../reader/meaning-map.js";
import { readArtifactNote } from "../reader/obsidian.js";

/**
 * SC-0018 — the cross-artifact entity-ID alignment checker (the 5th deterministic verifier:
 * legal · complete · atomic-bare-plain · **aligned** · true).
 *
 * THE PRINCIPLE (ruled by Marcia, 2026-06-01): the prose Meaning Map and the FOR_MODEL are the
 * two halves of one training pair. An entity named in one must be the SAME canonical code the
 * other uses — verifiable by machine, not by a human's eye. This module is **diagnostic, add-only**
 * tooling: it FIXES NOTHING. It produces the inventory; the human rules it; a later pass aligns.
 *
 * THE LOCKED CONVENTION it enforces:
 *  - Canonical entity ID = the BARE CODE (B2, O1, PL_LAND_OF_JUDAH, CB_0012, TM_*, FIG_*, I*) — what
 *    the FOR_MODEL + BCD use and what the schema patterns enforce.
 *  - Maps carry the code in the wikilink target: [[CODE-Slug]] / [[CODE-Slug|Display]] / [[CODE]].
 *    The code = the wikilink target (before any `|`), up to but NOT including the first hyphen `-`;
 *    if no hyphen, the whole target. Sound because codes never contain a hyphen — asserted from the
 *    pinned schema patterns at startup (`assertNoHyphenInCodePatterns`).
 *
 * The entity-code namespaces are DERIVED from the pinned FOR_MODEL schema `$defs` (being_id/place_id/
 * object_id/time_id + cb/figure ids), never hardcoded — the same drift discipline this tool exists for.
 */

// ───────────────────────── namespaces derived from the pinned schema ─────────────────────────

/** A registry namespace, derived from a pinned schema `$defs` id-pattern. */
export interface Namespace {
  name: string; // e.g. "being_id"
  prefixes: string[]; // the literal code prefixes the pattern admits, e.g. ["B"], ["O","TH_","CB_"]
  pattern: string; // the raw regex source (for the report / invariant assertion)
}

/**
 * Extract the literal code-prefix(es) a `$defs` id-pattern admits, by reading its top-level
 * alternation. Patterns are simple `^(...)$` shapes (b_code `^B(\d+|\?)$`, object_id
 * `^(O\d+|TH_…|CB_…)$`, place_id `^PL(\d+…|_…)$`, time_id `^TM_…$`). We take each alternative's
 * leading literal run of [A-Z0-9_] characters as its prefix. (Used for namespace tagging only;
 * actual code membership uses the compiled regex below.)
 */
function prefixesOfPattern(src: string): string[] {
  const inner = src.replace(/^\^/, "").replace(/\$$/, "");
  // split the OUTERMOST alternation. The patterns here have at most one paren group, so:
  //   B(\d+|\?)         → base "B", group "(\d+|\?)" → prefix "B"
  //   (O\d+|TH_…|CB_…)  → group at start → split its alts
  //   PL(\d+…|_…)       → base "PL", group → prefix "PL"
  //   TM_…              → no group → prefix "TM_"
  const m = inner.match(/^([A-Za-z0-9_]*)\((.*)\)([A-Za-z0-9_*+?\\dDsSwW{},]*)?$/);
  const out = new Set<string>();
  const leadLiteral = (s: string): string => (s.match(/^[A-Z0-9_]+/)?.[0] ?? "");
  if (m && m[1]) {
    // a literal base before the group (B…, PL…): the base IS the single prefix
    out.add(m[1]);
  } else if (m && m[2] !== undefined) {
    // a leading alternation group: each alternative contributes its leading literal
    for (const alt of splitTopAlternation(m[2]!)) {
      const p = leadLiteral(alt);
      if (p) out.add(p);
    }
  } else {
    // no group at all — the whole inner up to the first metachar is the prefix
    const p = leadLiteral(inner);
    if (p) out.add(p);
  }
  return [...out];
}

/** Split a regex alternation body on top-level `|` (no nested groups in our patterns, but be safe). */
function splitTopAlternation(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "|" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts;
}

interface SchemaNamespaces {
  /** by `$defs` name → namespace info. */
  byDef: Record<string, Namespace>;
  /** every distinct code prefix across all id namespaces (longest-first, for matching). */
  allPrefixes: string[];
  /** test whether a bare code matches ANY entity-id namespace. */
  isEntityCode(code: string): boolean;
  /** the matching `$defs` name for a code (first match), or null. */
  namespaceOf(code: string): string | null;
}

const ID_DEFS = ["b_code", "place_id", "object_id", "time_id", "cb_id", "figure_id"] as const;

/**
 * Derive the entity-code namespaces from the pinned validation-rules schema `$defs`. Asserts the
 * no-hyphen invariant on every id pattern (the extraction rule "code = target up to first hyphen"
 * is only sound while codes can never contain `-`); throws loudly otherwise.
 */
export function loadSchemaNamespaces(): SchemaNamespaces {
  const rules = loadValidationRules();
  const defs = (rules.for_model_schema as any)?.["$defs"] ?? {};
  const byDef: Record<string, Namespace> = {};
  const compiled: Array<{ def: string; re: RegExp }> = [];
  for (const def of ID_DEFS) {
    const pat = defs?.[def]?.pattern;
    if (typeof pat !== "string") throw new Error(`id-align: pinned schema $defs.${def}.pattern missing — cannot derive namespaces`);
    byDef[def] = { name: def, prefixes: prefixesOfPattern(pat), pattern: pat };
    compiled.push({ def, re: new RegExp(pat) });
  }
  assertNoHyphenInCodePatterns(byDef);
  const allPrefixes = [...new Set(Object.values(byDef).flatMap((n) => n.prefixes))].sort((a, b) => b.length - a.length);
  return {
    byDef,
    allPrefixes,
    isEntityCode: (code) => compiled.some((c) => c.re.test(code)),
    namespaceOf: (code) => compiled.find((c) => c.re.test(code))?.def ?? null,
  };
}

/**
 * Hard invariant (brief §"locked convention"): no entity-code pattern may admit a hyphen `-`. The
 * map code-extraction rule splits the wikilink target at the FIRST hyphen; if a code could contain
 * one, that rule would silently truncate codes. Fail loudly so a future schema change can't break
 * extraction quietly.
 */
export function assertNoHyphenInCodePatterns(byDef: Record<string, Namespace>): void {
  for (const [def, ns] of Object.entries(byDef)) {
    const re = new RegExp(ns.pattern);
    // Behavioural probe (the sound check): no code containing a hyphen may EVER match the pattern.
    // (A structural scan of the source is unreliable — a char-class range like [A-Z] contains a
    // hyphen that is an operator, not a literal admitted character.) We probe a spread of shapes that
    // would tell us a hyphen slipped through: prefixed, numbered, snake-bodied, and embedded.
    const probes = ns.prefixes.flatMap((p) => [`${p}-X`, `${p}1-X`, `${p}_A-B`, `${p}X-Y`, `${p}1-2`]);
    probes.push("A-B", "FOR-MODEL", "PL-X", "B-1");
    for (const probe of probes) {
      if (re.test(probe)) {
        throw new Error(
          `id-align invariant violated: schema $defs.${def} pattern ${ns.pattern} admits a hyphenated code ('${probe}') — ` +
            `the map code-extraction rule (split the wikilink target at the first '-') would silently truncate codes`,
        );
      }
    }
  }
}

// ───────────────────────── map code extraction (reuses the reader's rule) ─────────────────────────

/**
 * Registry code from a wikilink target: the part before any `|`, up to but NOT including the first
 * hyphen `-`; if no hyphen, the whole target. Identical rule to the meaning-map reader's
 * `codeFromWikilink` (re-stated here so this module is self-contained and the slug is also recovered).
 */
export function parseWikilink(target: string): { code: string; slug: string | null; display: string | null } {
  const pipe = target.indexOf("|");
  const display = pipe === -1 ? null : target.slice(pipe + 1).trim();
  const linkPart = (pipe === -1 ? target : target.slice(0, pipe)).trim();
  const hy = linkPart.indexOf("-");
  const code = hy === -1 ? linkPart : linkPart.slice(0, hy);
  const slug = hy === -1 ? null : linkPart.slice(hy + 1);
  return { code, slug, display };
}

export type MapRefKind = "STRUCTURAL" | "PROSE";

export interface MapWikilink {
  raw: string; // the inner wikilink text, e.g. "B2-Elimelech"
  code: string; // "B2"
  slug: string | null; // "Elimelech"
  display: string | null; // pipe display, if any
  isEntity: boolean; // code matches an entity namespace
  section: string; // "3A" | "3B" | "3C" | "3D" | "3E" | "frontmatter" | "L3" | "flags" | "metadata" | "other"
  scene: string | null; // "S1"… when inside a scene block, else null
  refKind: MapRefKind; // STRUCTURAL (3A-3D declared block) vs PROSE (everything else)
}

/**
 * Classify the map's markdown lines into (scene, section, refKind) regions and harvest every
 * wikilink with its region. STRUCTURAL = a §3A/3B/3C/3D declared-entity block; PROSE = §3E
 * "What Happens", relationship/role lines, §4 propositions, §5 flags, frontmatter, metadata.
 *
 * Section labels confirmed against the real fixtures (all 6 maps, uniform): the per-scene blocks are
 *   **3A — Beings** · **3B — Places** · **3C — Objects and Elements** · **3D — Times**
 *   **3E — What Happens** · **3F — Communicative Purpose** · **Significant Absence**
 * (`tripod` reader, `parseScene`). The structural declared-entity blocks are 3A–3D.
 */
function harvestMapWikilinks(raw: string, ns: SchemaNamespaces): MapWikilink[] {
  const out: MapWikilink[] = [];
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = fmMatch?.[1] ?? "";
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  const emit = (inner: string, section: string, scene: string | null, structural: boolean) => {
    const { code, slug, display } = parseWikilink(inner);
    const isEntity = ns.isEntityCode(code);
    // STRUCTURAL = an entity code on a DECLARED-ENTITY line within a 3A–3D block. A code that only
    // appears inside a `- Relationship:`/`- Role:`/`- Meaning:` bullet is PROSE (narration about the
    // entry), exactly as the reader's `parseEntities` declares an entry only on a non-bullet,
    // wikilink-led line. Everything else (§3E "What Happens", §4, §5, frontmatter) is PROSE.
    const refKind: MapRefKind = isEntity && structural ? "STRUCTURAL" : "PROSE";
    out.push({ raw: inner, code, slug, display, isEntity, section, scene, refKind });
  };

  // frontmatter links (active-concepts, active-figures, for-model, audit, source-meaning-map…)
  for (const m of fm.matchAll(/\[\[([^\]]+)\]\]/g)) emit(m[1]!, "frontmatter", null, false);

  // body: walk top-level (##) sections; within "3." walk per-scene (###) blocks + their bold sub-blocks.
  const lines = body.split(/\r?\n/);
  let topSection: "metadata" | "L1" | "L2" | "L3" | "flags" | "other" = "other";
  let scene: string | null = null;
  let sub: string = ""; // current bold sub-block key: "3A".."3F" | "Significant Absence" | ""
  for (const line of lines) {
    const h2 = line.match(/^##\s+(\d+)\./);
    if (h2) {
      const n = h2[1];
      topSection = n === "1" ? "metadata" : n === "2" ? "L1" : n === "3" ? "L2" : n === "4" ? "L3" : n === "5" ? "flags" : "other";
      scene = null;
      sub = "";
    }
    const h3 = line.match(/^###\s+Scene\s+(\d+)/i);
    if (h3 && topSection === "L2") {
      scene = `S${h3[1]}`;
      sub = "";
    }
    const h3p = line.match(/^###\s+Proposition/i);
    if (h3p && topSection === "L3") sub = "";
    const bold = line.match(/^\*\*(3[A-F]|Significant Absence)/);
    if (bold && topSection === "L2") sub = bold[1]!;

    const trimmed = line.trim();
    const inDeclaredBlock = topSection === "L2" && /^3[ABCD]$/.test(sub);
    // A declared-entity line: inside 3A–3D, not a `-` bullet, and wikilink-led (the entry header).
    const isDeclLine = inDeclaredBlock && !trimmed.startsWith("-") && /^\[\[/.test(trimmed);

    for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) {
      let section: string;
      if (topSection === "L2") section = /^3[A-F]$/.test(sub) ? sub : sub === "Significant Absence" ? "absence" : "scene-other";
      else if (topSection === "L3") section = "L3";
      else if (topSection === "flags") section = "flags";
      else if (topSection === "metadata") section = "metadata";
      else if (topSection === "L1") section = "L1";
      else section = "other";
      // structural only for the FIRST wikilink on a declared-entity line (the declared code itself;
      // any later link on that header line, e.g. an inline gloss, is narration → PROSE).
      const isFirstOnLine = m.index === line.indexOf("[[");
      emit(m[1]!, section, topSection === "L2" ? scene : null, isDeclLine && isFirstOnLine);
    }
  }
  return out;
}

// ───────────────────────── FOR_MODEL code extraction ─────────────────────────

export interface FmCode {
  code: string;
  scene: string | null; // scene container codes; null = pericope-level (cb/figure flags) or prop slot
  source: "scene_container" | "pericope_flag" | "slot_value";
}

const SCENE_GROUPS: Array<[string, string]> = [
  ["beings_in_scene", "being_id"],
  ["places_in_scene", "place_id"],
  ["objects_in_scene", "object_id"],
  ["times_in_scene", "time_id"],
];

/**
 * FOR_MODEL codes: the scene-container entity ids (`level_2_scenes[].{…}_in_scene.entries[].*_id`),
 * the pericope-level `cb_flags[]` / `figure_flags[]` (attached per-scene via the proposition's
 * scene_link), and — secondary — being-codes used as `event_specific_slots` *values* (`^B\d+$`).
 * Excludes referential_form, role/function tokens, action, speech_act (names / L2 values, not codes).
 */
export function extractForModelCodes(forModel: any): FmCode[] {
  const out: FmCode[] = [];
  const beingRe = /^B\d+$/;

  for (const scene of forModel.level_2_scenes ?? []) {
    const sceneId = typeof scene.scene_id === "string" ? scene.scene_id : null;
    for (const [group, idKey] of SCENE_GROUPS) {
      const entries = scene?.[group]?.entries;
      if (!Array.isArray(entries)) continue;
      for (const e of entries) {
        const id = e?.[idKey];
        if (typeof id === "string") out.push({ code: id, scene: sceneId, source: "scene_container" });
      }
    }
  }

  // pericope-level cb_flags / figure_flags, carried on propositions. Attribute each to its scene
  // (via scene_link) so the per-scene alignment can see them; also recorded pericope-wide.
  for (const prop of forModel.level_3_propositions ?? []) {
    const scene = typeof prop.scene_link === "string" ? prop.scene_link : null;
    for (const f of prop.cb_flags ?? []) if (typeof f === "string") out.push({ code: f, scene, source: "pericope_flag" });
    for (const f of prop.figure_flags ?? []) if (typeof f === "string") out.push({ code: f, scene, source: "pericope_flag" });
    // secondary: being-codes appearing as event_specific_slots VALUES
    const slotVals = new Set<string>();
    collectBeingSlotValues(prop.event_specific_slots, slotVals, beingRe);
    for (const v of slotVals) out.push({ code: v, scene, source: "slot_value" });
  }
  return out;
}

/**
 * The FOR_MODEL's declared flag set — the real home of CB_/FIG_ codes on the machine side
 * (SC-0018 R1): the union of every proposition's `cb_flags[]` / `figure_flags[]`. NOT scene-container
 * `object_id`s and NOT `cross_ref` free-text (a CB_/FIG_ code mentioned only in a `cross_ref` string —
 * e.g. P06's "…closes at P09 with FIG_0131…" — is a cross-reference, not a flag on this pericope).
 */
export function extractForModelFlags(forModel: any): { cb: Set<string>; fig: Set<string> } {
  const cb = new Set<string>();
  const fig = new Set<string>();
  for (const prop of forModel.level_3_propositions ?? []) {
    for (const f of prop.cb_flags ?? []) if (typeof f === "string") cb.add(f);
    for (const f of prop.figure_flags ?? []) if (typeof f === "string") fig.add(f);
  }
  return { cb, fig };
}

function collectBeingSlotValues(node: unknown, acc: Set<string>, beingRe: RegExp): void {
  if (typeof node === "string") {
    if (beingRe.test(node)) acc.add(node);
  } else if (Array.isArray(node)) {
    for (const x of node) collectBeingSlotValues(x, acc, beingRe);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectBeingSlotValues(v, acc, beingRe);
  }
}

// ───────────────────────── name-binding (slugify) ─────────────────────────

/**
 * slugify(BCD canonical name): trim, collapse internal whitespace to single `-`, preserving the
 * source Title-Case and the casing of every word (no lowercasing). Drops a leading/trailing hyphen.
 * Observed gold slugs this reproduces: "Bethlehem of Judah"→"Bethlehem-of-Judah",
 * "Fields of Moab"→"Fields-of-Moab", "About Ten Years"→"About-Ten-Years",
 * "In the Days When the Judges Judged"→"In-the-Days-When-the-Judges-Judged".
 * (Punctuation in a name is preserved verbatim — the note-title-safe normalization for name-binding
 * lives in `normalizeSlug`, applied to BOTH sides of the comparison, not here.)
 */
export function slugify(name: string): string {
  return name.trim().replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * SC-0020 — note-title-safe slug normalization for name-binding. Obsidian note titles (hence the
 * wikilink slug a map can carry) cannot contain an apostrophe `'` or a forward slash `/`; the BCD
 * canonical English names DO ("Naomi's Dwelling in Bethlehem", "His People / People of YHWH"). So a
 * map slug is a legitimate match for a canonical name when they agree AFTER dropping the chars a note
 * title can't hold. Comparing on this normalized form (applied to BOTH the found slug and the
 * expected slug) accepts `Naomis-Dwelling-in-Bethlehem` ↔ "Naomi's Dwelling…" and
 * `Boazs-Portion-of-the-Field` ↔ "Boaz's Portion…" without any slug/content edit — the right fix,
 * since editing the slug would break the wikilink unless the note were also renamed.
 *
 * Rules (the chars a note title can't carry):
 *  - strip apostrophes `'` outright (so "Naomi's"→"Naomis", matching the title-safe slug);
 *  - collapse `/` to the same `-` word-separator slugify uses, then collapse any run of `-` to one
 *    and trim leading/trailing `-` (so "His-People-/-People…" normalizes the same as a title-safe
 *    "His-People-People…" would).
 */
export function normalizeSlug(slug: string): string {
  return slug
    .replace(/'/g, "")
    .replace(/\//g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ───────────────────────── flag codes (CB_/FIG_) — registry + identity ─────────────────────────

/**
 * CB_/FIG_ codes are FLAGS, not §3 structural entities (SC-0018 R1). They live in the map's
 * frontmatter `active-concepts`/`active-figures` + the §5 Flags section, and in the FOR_MODEL's
 * `cb_flags`/`figure_flags` — NOT in the §3 entity blocks / scene containers. So they are pulled out
 * of the structural symmetric-difference and compared as flag SETS (map flag-set ↔ FM flag-set).
 */
export function isFlagCode(code: string): boolean {
  return code.startsWith("CB_") || code.startsWith("FIG_");
}

/**
 * SC-0020 — a schema-legal entity code whose numeric part is the withheld marker `?` (e.g. `B?` from
 * the `b_code` pattern `^B(\d+|\?)$`) is an INTENTIONAL withheld referent, not an error: the artifact
 * is deliberately declining to bind this slot to a registered being (P06's deceased-husband, the
 * SC-0016-blessed "her husband (pair withheld; see P01-D2)"). It can never resolve in a registry (it
 * names no specific entity) and can never align across artifacts (the other side intentionally lacks
 * it), so it is pulled OUT of reference-integrity and the structural symmetric difference and surfaced
 * as INFO (`WITHHELD_REFERENT`) instead. A code counts as withheld when its tail after the namespace
 * prefix is exactly `?` (so `B?` qualifies; `B12` does not; `PL_AMONG_SHEAVES` does not).
 */
export function isWithheldReferent(code: string, ns: SchemaNamespaces): boolean {
  if (!ns.isEntityCode(code)) return false;
  const def = ns.namespaceOf(code);
  if (!def) return false;
  const prefix = ns.byDef[def]!.prefixes.find((p) => code.startsWith(p));
  if (prefix === undefined) return false;
  return code.slice(prefix.length) === "?";
}

/**
 * The vendored Concept-Bank + Figure-Registry indices, merged into one lookup keyed by bare code
 * (SC-0018 R2). Each value carries the canonical `name_slug` (the slug the map should write after the
 * code) and the legacy frontmatter `aliases` a slug may also legitimately match.
 */
export interface FlagRegistry {
  byCode: Record<string, { code: string; name_slug: string; aliases: string[]; kind: "CONCEPT" | "FIGURE" }>;
  has(code: string): boolean;
}

export function buildFlagRegistry(concepts: CodeRegistry, figures: CodeRegistry): FlagRegistry {
  const byCode: FlagRegistry["byCode"] = {};
  for (const reg of [concepts, figures]) {
    for (const [code, e] of Object.entries(reg.entries)) {
      byCode[code] = { code: e.code, name_slug: e.name_slug, aliases: e.aliases ?? [], kind: reg.kind };
    }
  }
  return { byCode, has: (code) => byCode[code] !== undefined };
}

// ───────────────────────── map flag-set harvesting (frontmatter active-* + §5) ─────────────────────────

export interface MapFlagSet {
  /** every CB_ flag declared on this pericope (frontmatter active-concepts + §5 bullet leads). */
  cb: Set<string>;
  /** every FIG_ flag declared on this pericope (frontmatter active-figures + §5 bullet leads). */
  fig: Set<string>;
  /** code → the slug the map wrote for it (first occurrence), for CB_/FIG_ name-binding. null = bare [[CODE]]. */
  slugByCode: Map<string, string | null>;
  /** code → a representative location label ("frontmatter" | "§5 flags"), for the report. */
  whereByCode: Map<string, string>;
}

/**
 * Harvest the map's declared flag set — the real home of CB_/FIG_ codes (SC-0018 R1). A code counts
 * as flagged when it is:
 *   - a list item under frontmatter `active-concepts:` / `active-figures:`, or
 *   - the FIRST wikilink on a `- …` bullet in the §5 Flags section.
 * This mirrors the meaning-map reader's flag rule (`applyFlags` uses the bullet's first wikilink), so
 * a CB_/FIG_ wikilink that only appears inside a flag bullet's *narration* (e.g. P06 §5A's parenthetical
 * "…closes at P09 where [[FIG_0131-…]] fires") is NOT counted — it is a cross-reference, not a flag,
 * exactly as the FOR_MODEL keeps it in `cross_ref` free-text, not in `figure_flags`.
 */
export function harvestMapFlags(raw: string): MapFlagSet {
  const cb = new Set<string>();
  const fig = new Set<string>();
  const slugByCode = new Map<string, string | null>();
  const whereByCode = new Map<string, string>();

  const add = (inner: string, where: string) => {
    const { code, slug } = parseWikilink(inner);
    if (!isFlagCode(code)) return;
    (code.startsWith("CB_") ? cb : fig).add(code);
    if (!slugByCode.has(code)) slugByCode.set(code, slug);
    if (!whereByCode.has(code)) whereByCode.set(code, where);
  };
  const firstWl = (line: string): string | null => line.match(/\[\[([^\]]+)\]\]/)?.[1] ?? null;

  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = fmMatch?.[1] ?? "";
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  // frontmatter: only the active-concepts / active-figures YAML lists (one wikilink per list item).
  let inList = false;
  for (const line of fm.split(/\r?\n/)) {
    if (/^(active-concepts|active-figures)\s*:/.test(line)) {
      inList = true;
      continue;
    }
    if (/^\S/.test(line) && !/^\s*-/.test(line)) inList = false; // a new top-level key closes the list
    if (inList) {
      const wl = firstWl(line);
      if (wl) add(wl, "frontmatter");
    }
  }

  // §5 Flags: the first wikilink on each bullet line (the declared flag; later links are narration).
  let inFlags = false;
  for (const line of body.split(/\r?\n/)) {
    const h2 = line.match(/^##\s+(\d+)\./);
    if (h2) inFlags = h2[1] === "5";
    if (!inFlags || !/^\s*-/.test(line)) continue;
    const wl = firstWl(line);
    if (wl) add(wl, "§5 flags");
  }

  return { cb, fig, slugByCode, whereByCode };
}

// ───────────────────────── the report ─────────────────────────

export type Severity = "ERROR" | "MISALIGN" | "FLAG" | "ACCEPTED";

export interface RefIntegrityFinding {
  side: "MAP" | "FOR_MODEL";
  code: string;
  where: string; // scene/section context
  severity: "ERROR" | "ACCEPTED";
  reason: string; // UNKNOWN_CODE
  detail: string;
  accepted?: AcceptedIdException;
}

export interface UnverifiableFinding {
  side: "MAP" | "FOR_MODEL";
  code: string;
  where: string;
  reason: string; // UNVERIFIABLE_NO_REGISTRY
  detail: string;
}

/**
 * SC-0020 — an INTENTIONAL withheld-referent code (`<NS>?`, e.g. `B?`). INFO, never an error: the
 * artifact deliberately declines to bind the slot to a registered entity. Surfaced for the inventory,
 * counted nowhere in the failure totals, and excluded from the structural misalignment diff.
 */
export interface WithheldReferentFinding {
  side: "MAP" | "FOR_MODEL";
  code: string;
  where: string;
  reason: "WITHHELD_REFERENT";
  detail: string;
}

export interface NameBindingFinding {
  code: string;
  where: string;
  slugFound: string | null;
  slugExpected: string;
  canonicalName: string;
  severity: "ERROR" | "ACCEPTED";
  accepted?: AcceptedIdException;
}

export interface MisalignFinding {
  scope: string; // "S1" | "pericope"
  direction: "MAP_NOT_FM" | "FM_NOT_MAP";
  code: string;
  likelySameReferent?: { otherCode: string; sharedStem: string }; // the highest-value finding
  /** the code IS present on the OTHER artifact, just not in its structural set (map: as frontmatter/
   *  §5-flag/prose; FM: as a proposition slot value) — context that softens "absent" to "non-structural". */
  presentElsewhere?: string;
  severity: "MISALIGN" | "ACCEPTED";
  accepted?: AcceptedIdException;
}

/**
 * A CB_/FIG_ flag present on one artifact but not the other (SC-0018 R1). Flags are compared in their
 * real homes — the map's frontmatter+§5 flag set vs the FOR_MODEL's cb_flags+figure_flags — so an
 * aligned flag never reports; only a genuine one-sided flag does.
 */
export interface FlagMismatchFinding {
  kind: "CONCEPT" | "FIGURE";
  direction: "MAP_NOT_FM" | "FM_NOT_MAP";
  code: string;
  severity: "MISALIGN" | "ACCEPTED";
  accepted?: AcceptedIdException;
}

export interface DanglingNoteFinding {
  raw: string; // the note title (wikilink inner, before any |)
  where: string;
  detail: string;
  severity: "FLAG" | "ACCEPTED";
  accepted?: AcceptedIdException;
}

export interface AcceptedIdException {
  reason: string;
  note?: string;
  accepted_by?: string;
}

export interface IdAlignReport {
  pericope: string;
  mapPath: string;
  fmPath: string;
  referenceIntegrity: RefIntegrityFinding[];
  unverifiable: UnverifiableFinding[]; // codes in namespaces no vendored registry tracks (now: TH_ only)
  withheldReferents: WithheldReferentFinding[]; // SC-0020: intentional `<NS>?` withheld referents (INFO)
  nameBinding: NameBindingFinding[];
  misalignments: MisalignFinding[]; // structural entity symmetric difference (B/PL/O/TM/I/TH)
  flagMismatches: FlagMismatchFinding[]; // CB_/FIG_ flag-set symmetric difference (R1)
  danglingNotes: DanglingNoteFinding[];
  counts: {
    refErrors: number; // un-accepted
    nameErrors: number; // un-accepted
    misalign: number; // un-accepted (structural)
    flagMismatch: number; // un-accepted (CB_/FIG_ flag-set)
    likelySameReferent: number;
    dangling: number; // un-accepted
    unverifiable: number;
    withheld: number; // SC-0020: intentional withheld referents (INFO, never a failure)
    accepted: number;
  };
  ok: boolean; // no un-accepted ERROR/MISALIGN/FLAG findings
}

/** A reviewer sign-off keyed to one id-align finding (mirrors coverage/lint exceptions, SC-0010). */
export interface IdAlignException {
  pericope: string; // map basename stem, e.g. "P01-Ruth-1-1-5"
  kind: "REFERENCE_INTEGRITY" | "NAME_BINDING" | "MISALIGNMENT" | "FLAG_MISMATCH" | "DANGLING_NOTE";
  code?: string; // the entity/flag code (ref-integrity / name-binding / misalignment / flag-mismatch)
  note_title?: string; // the dangling note title (DANGLING_NOTE)
  scope?: string; // scene scope for a misalignment ("S1" | "pericope")
  direction?: MisalignFinding["direction"]; // MISALIGNMENT / FLAG_MISMATCH direction
  reason: string;
  note?: string;
  accepted_by?: string;
  accepted_on?: string;
  sc_ref?: string;
}

// ───────────────────────── stem sharing (LIKELY_SAME_REFERENT) ─────────────────────────

/** Strip a known namespace prefix to expose the descriptive stem (TM_TEN_YEARS → TEN_YEARS). */
function stemOf(code: string, prefixes: string[]): string {
  for (const p of prefixes) {
    if (code.startsWith(p)) {
      let rest = code.slice(p.length);
      rest = rest.replace(/^_+/, ""); // PL_LAND… → LAND…
      // for numbered codes (B2, O1) the rest is digits → no descriptive stem
      if (/^\d+$/.test(rest)) return "";
      return rest;
    }
  }
  return code;
}

/**
 * Two unmatched codes "share a stem" when one descriptive stem contains the other (case-sensitive
 * UPPER_SNAKE tokens), and the shared run is a whole-token span ≥ 2 tokens OR a long single token.
 * This catches the TM_TEN_YEARS ↔ TH_TEN_YEARS_APPROXIMATELY class (shared "TEN_YEARS").
 */
function sharedStem(a: string, b: string, prefixes: string[]): string | null {
  const sa = stemOf(a, prefixes);
  const sb = stemOf(b, prefixes);
  if (!sa || !sb) return null;
  const ta = sa.split("_").filter(Boolean);
  const tb = sb.split("_").filter(Boolean);
  // longest common contiguous token run
  let best = "";
  for (let i = 0; i < ta.length; i++) {
    for (let j = 0; j < tb.length; j++) {
      let k = 0;
      while (i + k < ta.length && j + k < tb.length && ta[i + k] === tb[j + k]) k++;
      if (k > 0) {
        const run = ta.slice(i, i + k).join("_");
        if (run.length > best.length) best = run;
      }
    }
  }
  if (!best) return null;
  const tokens = best.split("_").length;
  if (tokens >= 2 || best.length >= 5) return best; // ≥2 tokens, or one substantial token (≥5 chars)
  return null;
}

// ───────────────────────── the checker ─────────────────────────

/**
 * Valid pilot-2 sibling-artifact suffixes (SC-0018 R3). A map note-link ending in one of these names a
 * real pilot-2 artifact that lives in the vault `stas/` (not the compiler fixtures dir), so it resolves
 * and is NOT flagged. Order longest-first so `-VERIFICATION-INPUT-en` is tried before `-VERIFICATION-INPUT`.
 * **`-AUDIT` is deliberately ABSENT** — pilot-2 produces no AUDIT, so a `[[…-AUDIT]]` link is a true relic
 * and must still flag. (`-COVERAGE-LEDGER` is a real pilot-2 artifact too; kept resolvable.)
 */
const PILOT2_ARTIFACT_SUFFIXES = [
  "-VERIFICATION-INPUT-en",
  "-VERIFICATION-INPUT",
  "-FOR-MODEL",
  "-COMPILATION-LOG",
  "-BCD-DELTA",
  "-COVERAGE-LEDGER",
] as const;

/** The discourse-thread namespace (`T#-Slug`, frontmatter `dt-code`) — notes live in the vault
 *  `bcd/discourse-threads/`. A biblical-only namespace the entity-id schema doesn't track; a map
 *  reference to one is a real vault note, not a dangling link (SC-0018 R3). `T#` ≠ `TM_`/`TH_`. */
const DISCOURSE_THREAD_RE = /^T\d+-/;

/** `-AUDIT` (case-insensitive) — the one artifact suffix pilot-2 does NOT produce; must still flag. */
const AUDIT_SUFFIX_RE = /-AUDIT$/i;

/**
 * A map note-link names a real pilot-2 sibling artifact (resolves, don't flag) when its title ends in a
 * known pilot-2 artifact suffix, OR is a discourse-thread reference. `-AUDIT` is excluded by construction.
 */
export function isKnownPilot2Sibling(title: string): boolean {
  if (DISCOURSE_THREAD_RE.test(title)) return true;
  const upper = title.toUpperCase();
  return PILOT2_ARTIFACT_SUFFIXES.some((suf) => upper.endsWith(suf.toUpperCase()));
}

export interface CheckOpts {
  /** dir(s) to resolve a map note-link target to an existing file (for dangling-note detection). */
  noteResolveDirs?: string[];
  exceptions?: IdAlignException[];
  /** override the namespace derivation (tests) */
  namespaces?: SchemaNamespaces;
  /** override the entity registry (tests) */
  aliases?: AliasTable;
  /** override the CB_/FIG_ flag registry (tests). Default: the pinned concept + figure registries. */
  flagRegistry?: FlagRegistry;
}

/**
 * Run the full SC-0018 alignment check for one pericope (a map + its paired FOR_MODEL). Diagnostic
 * only — returns the inventory; mutates nothing.
 */
export function checkIdAlignment(mapPath: string, fmPath: string, opts: CheckOpts = {}): IdAlignReport {
  const ns = opts.namespaces ?? loadSchemaNamespaces();
  const aliases = opts.aliases ?? loadAliasTable();
  const flagReg = opts.flagRegistry ?? buildFlagRegistry(loadConceptRegistry(), loadFigureRegistry());
  const exceptions = opts.exceptions ?? [];

  const rawMap = readFileSync(mapPath, "utf8");
  const mm: MeaningMap = readMeaningMap(mapPath);
  const fm = readArtifactNote(fmPath).json as any;

  const pericope = mm.pericope ?? mapBasenameStem(mapPath);
  const stem = mapBasenameStem(mapPath);

  // namespaces the registry actually tracks (so CB_/FIG_/TH_, which it doesn't, aren't false errors)
  const registeredPrefixes = new Set<string>();
  for (const code of Object.keys(aliases.entities)) {
    const ns0 = ns.namespaceOf(code);
    if (ns0) for (const p of ns.byDef[ns0]!.prefixes) if (code.startsWith(p)) registeredPrefixes.add(p);
  }
  const prefixOf = (code: string): string | null => {
    const def = ns.namespaceOf(code);
    if (!def) return null;
    return ns.byDef[def]!.prefixes.find((p) => code.startsWith(p)) ?? null;
  };
  const isRegisteredNs = (code: string): boolean => {
    const p = prefixOf(code);
    return p !== null && registeredPrefixes.has(p);
  };

  // ── Step 1: extract ──
  const mapLinks = harvestMapWikilinks(rawMap, ns);
  // Structural/prose ENTITY refs exclude CB_/FIG_ flag codes — those are compared as flag SETS (R1),
  // not in the §3-block ↔ scene-container symmetric difference.
  const mapEntityRefs = mapLinks.filter((l) => l.isEntity && !isFlagCode(l.code));
  const fmCodes = extractForModelCodes(fm).filter((c) => !isFlagCode(c.code));
  // CB_/FIG_ flag sets in their real homes (R1): map frontmatter active-* + §5; FM cb_flags/figure_flags.
  const mapFlags = harvestMapFlags(rawMap);
  const fmFlags = extractForModelFlags(fm);

  // ── exception matching helper ──
  const exMatch = (kind: IdAlignException["kind"], keys: { code?: string; note_title?: string; scope?: string; direction?: string }): AcceptedIdException | undefined => {
    const e = exceptions.find(
      (x) =>
        x.pericope === stem &&
        x.kind === kind &&
        (keys.code === undefined || x.code === keys.code) &&
        (keys.note_title === undefined || x.note_title === keys.note_title) &&
        (keys.scope === undefined || x.scope === keys.scope) &&
        (keys.direction === undefined || x.direction === keys.direction),
    );
    return e ? { reason: e.reason, note: e.note, accepted_by: e.accepted_by } : undefined;
  };

  // ── Step 2: reference integrity (both sides) ──
  // B/PL/O/TM/I resolve via the entity alias table; CB_/FIG_ now resolve via the vendored Concept-Bank
  // + Figure-Registry indices (SC-0018 R2). A legal code in neither (today: TH_ thematic overlay) is
  // surfaced as UNVERIFIABLE, not errored.
  const referenceIntegrity: RefIntegrityFinding[] = [];
  const unverifiable: UnverifiableFinding[] = [];
  const withheldReferents: WithheldReferentFinding[] = [];
  const seenRi = new Set<string>();
  const seenWithheld = new Set<string>();
  const checkRef = (code: string, side: "MAP" | "FOR_MODEL", where: string) => {
    const key = `${side}|${code}`;
    if (seenRi.has(key)) return;
    seenRi.add(key);
    // SC-0020: a `<NS>?` withheld referent (e.g. B?) is INTENTIONAL — INFO, not UNKNOWN_CODE.
    if (isWithheldReferent(code, ns)) {
      if (!seenWithheld.has(key)) {
        seenWithheld.add(key);
        withheldReferents.push({
          side, code, where, reason: "WITHHELD_REFERENT",
          detail: `intentional withheld referent — the ${prefixOf(code) ?? "?"}? marker declines to bind this slot to a registered entity (a deliberate gap, not a missing code)`,
        });
      }
      return;
    }
    if (isFlagCode(code)) {
      if (flagReg.has(code)) return; // resolves in the CB/FIG registry — fine
      const acc = exMatch("REFERENCE_INTEGRITY", { code });
      referenceIntegrity.push({
        side, code, where, reason: "UNKNOWN_CODE",
        detail: `no registry entry in ruth.${code.startsWith("CB_") ? "concepts" : "figures"}.json (the ${code.startsWith("CB_") ? "Concept Bank" : "Figure Registry"} is vendored)`,
        severity: acc ? "ACCEPTED" : "ERROR", accepted: acc,
      });
      return;
    }
    if (aliases.entities[code]) return; // resolves — fine
    if (isRegisteredNs(code)) {
      const acc = exMatch("REFERENCE_INTEGRITY", { code });
      referenceIntegrity.push({
        side, code, where, reason: "UNKNOWN_CODE",
        detail: `no registry entry in ruth.aliases.json (${prefixOf(code)} namespace is tracked)`,
        severity: acc ? "ACCEPTED" : "ERROR", accepted: acc,
      });
    } else if (ns.isEntityCode(code)) {
      // legal entity code in a namespace no vendored registry tracks (TH_ thematic overlay)
      unverifiable.push({
        side, code, where, reason: "UNVERIFIABLE_NO_REGISTRY",
        detail: `${prefixOf(code) ?? "?"} namespace is schema-legal but vendored in no registry (thematic overlay TH_ is not vendored)`,
      });
    }
  };
  for (const l of mapEntityRefs) checkRef(l.code, "MAP", `${l.scene ?? l.section}`);
  for (const c of fmCodes) checkRef(c.code, "FOR_MODEL", c.scene ?? c.source);
  // CB_/FIG_ flag codes also flow from the map's flag homes (frontmatter active-* + §5) and the FM's
  // cb_flags/figure_flags — reference-integrity covers those too.
  for (const code of [...mapFlags.cb, ...mapFlags.fig]) checkRef(code, "MAP", mapFlags.whereByCode.get(code) ?? "flags");
  for (const code of [...fmFlags.cb, ...fmFlags.fig]) checkRef(code, "FOR_MODEL", "cb/figure flag");

  // ── Step 3: name-binding (map slugs) ──
  const nameBinding: NameBindingFinding[] = [];
  const seenNb = new Set<string>();
  // (a) B/PL/O/TM/I — the slug must equal slugify(BCD canonical English name).
  for (const l of mapEntityRefs) {
    if (l.slug === null) continue; // bare [[CODE]] — no slug to bind
    const entry = aliases.entities[l.code];
    if (!entry || !entry.english) continue; // unknown / unnamed code handled by ref-integrity
    const expected = slugify(entry.english);
    // SC-0020: compare on the note-title-safe normalized form (strip `'`, collapse `/`) on BOTH
    // sides — a map slug can't carry chars a note title forbids, but the BCD name keeps them.
    if (normalizeSlug(l.slug) === normalizeSlug(expected)) continue;
    const key = `${l.code}|${l.slug}`;
    if (seenNb.has(key)) continue;
    seenNb.add(key);
    const acc = exMatch("NAME_BINDING", { code: l.code });
    nameBinding.push({
      code: l.code, where: `${l.scene ?? l.section}`,
      slugFound: l.slug, slugExpected: expected, canonicalName: entry.english,
      severity: acc ? "ACCEPTED" : "ERROR", accepted: acc,
    });
  }
  // (b) CB_/FIG_ — the map slug must match the registry `name_slug` OR a frontmatter alias (R2). The
  //     map writes the slug after the code in the wikilink ([[CB_0030-Sojourn-Gur]] → "Sojourn-Gur");
  //     it should equal the note's name_slug, but a known legacy alias is also accepted (not flagged).
  for (const [code, slug] of mapFlags.slugByCode) {
    if (slug === null) continue; // bare [[CODE]] — no slug to bind
    const entry = flagReg.byCode[code];
    if (!entry) continue; // unknown code handled by ref-integrity
    if (slug === entry.name_slug || entry.aliases.includes(slug)) continue;
    const key = `${code}|${slug}`;
    if (seenNb.has(key)) continue;
    seenNb.add(key);
    const acc = exMatch("NAME_BINDING", { code });
    nameBinding.push({
      code, where: mapFlags.whereByCode.get(code) ?? "flags",
      slugFound: slug, slugExpected: entry.name_slug, canonicalName: entry.name_slug.replace(/-/g, " "),
      severity: acc ? "ACCEPTED" : "ERROR", accepted: acc,
    });
  }

  // ── Step 4: cross-artifact alignment ──
  const misalignments: MisalignFinding[] = [];
  // SC-0020: a `<NS>?` withheld referent (B?) is an intentional gap — surfaced as INFO above, never a
  // misalignment. Exclude it from BOTH the map and FM working sets so it can't enter the symmetric
  // difference (the other side legitimately lacks it; that is the point of withholding).
  const isWithheld = (code: string) => isWithheldReferent(code, ns);
  const mapRefsAligned = mapEntityRefs.filter((l) => !isWithheld(l.code));
  const fmCodesAligned = fmCodes.filter((c) => !isWithheld(c.code));
  // scene scopes present in BOTH artifacts → per-scene; everything else folds into a pericope scope.
  const mapScenes = new Set(mapRefsAligned.map((l) => l.scene).filter((s): s is string => !!s));
  const fmScenes = new Set(fmCodesAligned.map((c) => c.scene).filter((s): s is string => !!s));
  const alignedScenes = [...mapScenes].filter((s) => fmScenes.has(s)).sort(numericScene);

  // "present-elsewhere" context: a code flagged map-not-FM (resp. FM-not-map) may still appear on the
  // OTHER artifact, just not in its STRUCTURAL set. We record where, so the inventory distinguishes
  // "truly absent" from "present, non-structurally" (the latter is the common, easily-ruled case).
  const mapProseCodes = new Map<string, string>(); // code → a representative non-structural map section
  for (const l of mapRefsAligned) if (l.refKind === "PROSE" && !mapProseCodes.has(l.code)) mapProseCodes.set(l.code, l.section === "frontmatter" ? "frontmatter" : l.section === "flags" ? "§5 flags" : l.section.startsWith("3") ? `§${l.section} prose` : l.section);
  const fmSourceByCode = new Map<string, string>(); // code → its FM source (slot/flag) when not a scene container
  for (const c of fmCodesAligned) if (c.source !== "scene_container" && !fmSourceByCode.has(c.code)) fmSourceByCode.set(c.code, c.source === "pericope_flag" ? "cb/figure flag" : "proposition slot");

  const addMisalign = (scope: string, mapSet: Set<string>, fmSet: Set<string>) => {
    const mapOnly = [...mapSet].filter((c) => !fmSet.has(c)).sort();
    const fmOnly = [...fmSet].filter((c) => !mapSet.has(c)).sort();
    // pair up likely-same-referent across the symmetric difference
    const pairedFm = new Set<string>();
    for (const mc of mapOnly) {
      let best: { fc: string; stem: string } | null = null;
      for (const fc of fmOnly) {
        if (pairedFm.has(fc)) continue;
        const st = sharedStem(mc, fc, ns.allPrefixes);
        if (st && (!best || st.length > best.stem.length)) best = { fc, stem: st };
      }
      const acc = exMatch("MISALIGNMENT", { code: mc, scope, direction: "MAP_NOT_FM" });
      misalignments.push({
        scope, direction: "MAP_NOT_FM", code: mc,
        likelySameReferent: best ? { otherCode: best.fc, sharedStem: best.stem } : undefined,
        presentElsewhere: fmSourceByCode.get(mc), // in the FM as a slot/flag, just not a scene container
        severity: acc ? "ACCEPTED" : "MISALIGN", accepted: acc,
      });
      if (best) pairedFm.add(best.fc);
    }
    for (const fc of fmOnly) {
      const partner = misalignments.find((m) => m.scope === scope && m.likelySameReferent?.otherCode === fc);
      const acc = exMatch("MISALIGNMENT", { code: fc, scope, direction: "FM_NOT_MAP" });
      misalignments.push({
        scope, direction: "FM_NOT_MAP", code: fc,
        likelySameReferent: partner ? { otherCode: partner.code, sharedStem: partner.likelySameReferent!.sharedStem } : undefined,
        presentElsewhere: mapProseCodes.get(fc), // in the map, just not in a §3A–3D structural block
        severity: acc ? "ACCEPTED" : "MISALIGN", accepted: acc,
      });
    }
  };

  if (alignedScenes.length > 0) {
    for (const s of alignedScenes) {
      const mapSet = new Set(mapRefsAligned.filter((l) => l.refKind === "STRUCTURAL" && l.scene === s).map((l) => l.code));
      const fmSet = new Set(fmCodesAligned.filter((c) => c.scene === s).map((c) => c.code));
      addMisalign(s, mapSet, fmSet);
    }
    // codes outside any aligned scene (e.g. map structural refs in a scene the FM lacks) → pericope bucket
    const mapInAligned = new Set(alignedScenes);
    const leftoverMap = new Set(mapRefsAligned.filter((l) => l.refKind === "STRUCTURAL" && (!l.scene || !mapInAligned.has(l.scene))).map((l) => l.code));
    const leftoverFm = new Set(fmCodesAligned.filter((c) => !c.scene || !mapInAligned.has(c.scene)).map((c) => c.code));
    if (leftoverMap.size || leftoverFm.size) addMisalign("pericope", leftoverMap, leftoverFm);
  } else {
    const mapSet = new Set(mapRefsAligned.filter((l) => l.refKind === "STRUCTURAL").map((l) => l.code));
    const fmSet = new Set(fmCodesAligned.map((c) => c.code));
    addMisalign("pericope", mapSet, fmSet);
  }

  // ── Step 4b: CB_/FIG_ flag-set alignment (R1) ──
  // Flags are pericope-level on both sides, so they are compared as sets in their real homes — NOT in
  // the §3-block ↔ scene-container structural diff. An aligned flag never reports; a one-sided flag does.
  const flagMismatches: FlagMismatchFinding[] = [];
  const addFlagDiff = (kind: "CONCEPT" | "FIGURE", mapSet: Set<string>, fmSet: Set<string>) => {
    for (const code of [...mapSet].filter((c) => !fmSet.has(c)).sort()) {
      const acc = exMatch("FLAG_MISMATCH", { code, direction: "MAP_NOT_FM" });
      flagMismatches.push({ kind, direction: "MAP_NOT_FM", code, severity: acc ? "ACCEPTED" : "MISALIGN", accepted: acc });
    }
    for (const code of [...fmSet].filter((c) => !mapSet.has(c)).sort()) {
      const acc = exMatch("FLAG_MISMATCH", { code, direction: "FM_NOT_MAP" });
      flagMismatches.push({ kind, direction: "FM_NOT_MAP", code, severity: acc ? "ACCEPTED" : "MISALIGN", accepted: acc });
    }
  };
  addFlagDiff("CONCEPT", mapFlags.cb, fmFlags.cb);
  addFlagDiff("FIGURE", mapFlags.fig, fmFlags.fig);

  // ── Step 5: dangling note links (non-entity map wikilinks that resolve to no file) ──
  const danglingNotes: DanglingNoteFinding[] = [];
  const resolveDirs = opts.noteResolveDirs ?? defaultNoteDirs(mapPath, fmPath);
  const seenNote = new Set<string>();
  for (const l of mapLinks) {
    if (l.isEntity) continue;
    // a note link is the whole target-before-pipe (notes have hyphens, so parseWikilink's "code" is partial)
    const noteTitle = l.raw.split("|")[0]!.trim();
    if (seenNote.has(noteTitle)) continue;
    seenNote.add(noteTitle);
    if (resolvesToFile(noteTitle, resolveDirs)) continue; // a real file in the resolve dirs
    if (isKnownPilot2Sibling(noteTitle)) continue; // a real pilot-2 sibling (vault stas/ or discourse-threads/) — R3
    const acc = exMatch("DANGLING_NOTE", { note_title: noteTitle });
    danglingNotes.push({
      raw: noteTitle, where: l.scene ?? l.section,
      detail: AUDIT_SUFFIX_RE.test(noteTitle)
        ? "no such artifact note — pilot-2 produces no AUDIT (true relic)"
        : "no such note found in the resolve dirs, and not a known pilot-2 sibling artifact",
      severity: acc ? "ACCEPTED" : "FLAG", accepted: acc,
    });
  }

  // ── counts + ok ──
  const refErrors = referenceIntegrity.filter((f) => f.severity === "ERROR").length;
  const nameErrors = nameBinding.filter((f) => f.severity === "ERROR").length;
  const misalign = misalignments.filter((f) => f.severity === "MISALIGN").length;
  const flagMismatch = flagMismatches.filter((f) => f.severity === "MISALIGN").length;
  const likelySameReferent = misalignments.filter((f) => f.severity !== "ACCEPTED" && f.direction === "MAP_NOT_FM" && f.likelySameReferent).length;
  const dangling = danglingNotes.filter((f) => f.severity === "FLAG").length;
  const accepted =
    referenceIntegrity.filter((f) => f.severity === "ACCEPTED").length +
    nameBinding.filter((f) => f.severity === "ACCEPTED").length +
    misalignments.filter((f) => f.severity === "ACCEPTED").length +
    flagMismatches.filter((f) => f.severity === "ACCEPTED").length +
    danglingNotes.filter((f) => f.severity === "ACCEPTED").length;

  return {
    pericope, mapPath, fmPath,
    referenceIntegrity, unverifiable, withheldReferents, nameBinding, misalignments, flagMismatches, danglingNotes,
    counts: { refErrors, nameErrors, misalign, flagMismatch, likelySameReferent, dangling, unverifiable: unverifiable.length, withheld: withheldReferents.length, accepted },
    ok: refErrors + nameErrors + misalign + flagMismatch + dangling === 0,
  };
}

// ───────────────────────── helpers ─────────────────────────

function mapBasenameStem(p: string): string {
  return (p.split("/").pop() ?? p).replace(/\.md$/, "");
}
function numericScene(a: string, b: string): number {
  return (Number(a.replace(/\D/g, "")) || 0) - (Number(b.replace(/\D/g, "")) || 0);
}
function defaultNoteDirs(mapPath: string, fmPath: string): string[] {
  return [...new Set([dirname(mapPath), dirname(fmPath)])];
}
/**
 * Does a wikilink note-title resolve to an existing `.md` file in any resolve dir? Obsidian note
 * links are by basename (no path, no extension), so we test `<dir>/<title>.md`.
 */
function resolvesToFile(title: string, dirs: string[]): boolean {
  for (const d of dirs) if (existsSync(join(d, `${title}.md`))) return true;
  return false;
}
