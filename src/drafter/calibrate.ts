/**
 * SC-0063 Phase B: judgment-layer calibration — score a DRAFTED MEANING_COORDINATES against its GOLD
 * (hand-made, blessed) counterpart, field by field, at the judgment layer only (the
 * deterministic layer is gold-diff's job and is byte-stable by construction).
 *
 * Alignment is part of the honesty: the gold may have DECOMPOSED a map-granularity
 * proposition (gold-only props) and ADDED prose-only beings. Props align by verse_anchor
 * groups in order; beings align by being_id per scene. Leftovers are REPORTED, never
 * silently dropped, and never counted as divergences of values that were never compared.
 */

export interface Divergence {
  where: string;
  drafted: unknown;
  gold: unknown;
}

export interface FieldScore {
  matched: number;
  divergent: number;
  divergences: Divergence[];
}

export interface ArrayScore {
  exact: boolean;
  shared: string[];
  goldOnly: string[];
  draftOnly: string[];
}

export interface Calibration {
  fields: Record<string, FieldScore>;
  level1: Record<string, ArrayScore>;
  alignment: {
    props: { aligned: number; goldOnly: string[]; draftOnly: string[] };
    beings: { aligned: number; goldOnly: string[]; draftAdded: string[] };
  };
  notes: string[];
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function field(c: Calibration, name: string): FieldScore {
  if (!c.fields[name]) c.fields[name] = { matched: 0, divergent: 0, divergences: [] };
  return c.fields[name];
}

function score(c: Calibration, name: string, where: string, drafted: unknown, gold: unknown): void {
  const f = field(c, name);
  // absent-vs-absent (e.g. unmarked referential_form) is a match
  const d = drafted === undefined ? null : drafted;
  const g = gold === undefined ? null : gold;
  if (deepEqual(d, g)) f.matched++;
  else {
    f.divergent++;
    f.divergences.push({ where, drafted: d, gold: g });
  }
}

function arrayScore(drafted: string[], gold: string[]): ArrayScore {
  const ds = new Set(drafted);
  const gs = new Set(gold);
  return {
    exact: deepEqual(drafted, gold),
    shared: [...ds].filter((x) => gs.has(x)),
    goldOnly: [...gs].filter((x) => !ds.has(x)),
    draftOnly: [...ds].filter((x) => !gs.has(x)),
  };
}

/**
 * Format-noise normalization for register_overrides: `null` ≡ `[]` for each level, `_note`
 * dropped, and explicit-null keys inside entries dropped (gold styles vary: P01 writes
 * `scene_level: null`, P02 writes `moment_level: []`; entries may spell `genre_override: null`
 * or omit it). The JUDGMENT — which scenes/moments carry which override values — is preserved.
 */
export function normalizeOverrides(ro: any): any {
  if (!ro || typeof ro !== "object") return { scene_level: null, moment_level: null };
  const lvl = (v: any) => {
    if (!Array.isArray(v) || v.length === 0) return null;
    return v.map((e: any) => {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(e ?? {})) if (val !== null && val !== undefined) out[k] = val;
      return out;
    });
  };
  return { scene_level: lvl(ro.scene_level), moment_level: lvl(ro.moment_level) };
}

/** Translate a gold links object's prop-id targets into DRAFT numbering via the alignment map. */
function translateLinks(links: any, goldToDraft: Map<string, string>): any {
  if (!links || typeof links !== "object") return links;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(links)) {
    if (typeof v === "string" && /^P\d+$/.test(v)) out[k] = goldToDraft.get(v) ?? `${v}(gold-only)`;
    else out[k] = v;
  }
  return out;
}

/** Pair two proposition lists by verse_anchor groups, preserving order within a group. */
export function alignProps(drafted: any[], gold: any[]): Array<{ d?: any; g?: any }> {
  const out: Array<{ d?: any; g?: any }> = [];
  const used = new Set<number>();
  const byAnchor = new Map<string, number[]>();
  gold.forEach((p, i) => {
    const k = String(p.verse_anchor ?? "");
    if (!byAnchor.has(k)) byAnchor.set(k, []);
    byAnchor.get(k)!.push(i);
  });
  for (const d of drafted) {
    const k = String(d.verse_anchor ?? "");
    const pool = (byAnchor.get(k) ?? []).filter((i) => !used.has(i));
    const gi = pool[0]; // in-order pairing within the anchor group
    if (gi !== undefined) {
      used.add(gi);
      out.push({ d, g: gold[gi] });
    } else out.push({ d });
  }
  gold.forEach((g, i) => {
    if (!used.has(i)) out.push({ g });
  });
  return out;
}

export function calibrate(drafted: any, gold: any): Calibration {
  const c: Calibration = {
    fields: {},
    level1: {},
    alignment: { props: { aligned: 0, goldOnly: [], draftOnly: [] }, beings: { aligned: 0, goldOnly: [], draftAdded: [] } },
    notes: [],
  };

  // header + classification
  score(c, "book_context_ref", "/header", drafted.header?.book_context_ref, gold.header?.book_context_ref);
  score(
    c,
    "register_overrides",
    "/pericope_classification",
    normalizeOverrides(drafted.pericope_classification?.register_overrides),
    normalizeOverrides(gold.pericope_classification?.register_overrides),
  );

  // level_1 arrays — set comparison (order is prose-order, membership is the judgment)
  for (const k of ["arc_elements", "context_elements", "tone_elements", "pace_elements", "communicative_function_elements"]) {
    c.level1[k] = arrayScore(drafted.level_1?.[k] ?? [], gold.level_1?.[k] ?? []);
  }

  // scenes by scene_id
  const goldScenes = new Map<string, any>((gold.level_2_scenes ?? []).map((s: any) => [s.scene_id, s]));
  for (const ds of drafted.level_2_scenes ?? []) {
    const gs = goldScenes.get(ds.scene_id);
    if (!gs) {
      c.notes.push(`scene ${ds.scene_id} has no gold counterpart — skipped`);
      continue;
    }
    score(c, "scene_kind", `/${ds.scene_id}`, ds.scene_kind, gs.scene_kind);
    const goldBeings = new Map<string, any>((gs.beings_in_scene?.entries ?? []).map((b: any) => [b.being_id, b]));
    const draftIds = new Set<string>();
    for (const db of ds.beings_in_scene?.entries ?? []) {
      draftIds.add(db.being_id);
      const gb = goldBeings.get(db.being_id);
      if (!gb) {
        c.alignment.beings.draftAdded.push(`${ds.scene_id}/${db.being_id}`);
        continue;
      }
      c.alignment.beings.aligned++;
      score(c, "role_in_scene", `/${ds.scene_id}/${db.being_id}`, db.role_in_scene, gb.role_in_scene);
      score(c, "referential_form", `/${ds.scene_id}/${db.being_id}`, db.referential_form, gb.referential_form);
      score(c, "presence", `/${ds.scene_id}/${db.being_id}`, db.presence, gb.presence);
    }
    for (const [id] of goldBeings) if (!draftIds.has(id)) c.alignment.beings.goldOnly.push(`${ds.scene_id}/${id}`);
  }

  // propositions by verse_anchor groups
  const pairs = alignProps(drafted.level_3_propositions ?? [], gold.level_3_propositions ?? []);
  const goldToDraft = new Map<string, string>();
  for (const { d, g } of pairs) if (d && g) goldToDraft.set(String(g.prop_id), String(d.prop_id));
  let countsDiffer = false;
  for (const { d, g } of pairs) {
    if (d && g) {
      c.alignment.props.aligned++;
      const at = `/${d.prop_id}↔${g.prop_id}@${g.verse_anchor}`;
      score(c, "proposition_kind", at, d.proposition_kind, g.proposition_kind);
      score(c, "event_specific_slots", at, d.event_specific_slots, g.event_specific_slots);
      // links compared in DRAFT numbering: gold targets translated through the alignment map,
      // so a gold decomposition's +1 shift doesn't masquerade as a wrong link judgment.
      score(c, "inter_proposition_links", at, d.inter_proposition_links, translateLinks(g.inter_proposition_links, goldToDraft));
    } else if (d) c.alignment.props.draftOnly.push(`${d.prop_id}@${d.verse_anchor}`);
    else if (g) {
      c.alignment.props.goldOnly.push(`${g.prop_id}@${g.verse_anchor}`);
      countsDiffer = true;
    }
  }
  if (countsDiffer)
    c.notes.push(
      "gold decomposed beyond map granularity (gold-only props above) — gold link targets were TRANSLATED into draft numbering before comparison; a target pointing at a gold-only prop reads `Pn(gold-only)`",
    );
  return c;
}

// ---------------------------------------------------------------------------
// Mint audit: every axis-typed token in a merged draft, cross-checked against the approved
// enumerations + the closed lists + the fills' declared vocabulary_additions. Silent minting
// becomes a mechanical finding, not a prompt hope. (SC-0063 Phase B; the L2-generality data.)
// ---------------------------------------------------------------------------

import { loadSpecJson } from "../spec/load.js";
import type { DraftOutput } from "./fills.js";

export interface MintRecord {
  axis: string;
  value: string;
  where: string;
  /** "drafter" = the value sits at/under a location the drafter filled; "map" = deterministic carry-through from the Meaning Map. */
  origin: "drafter" | "map";
}

export interface MintAudit {
  checked: number;
  declared: MintRecord[];
  undeclared: MintRecord[];
  closedViolations: MintRecord[];
}

const LEVEL1_AXIS: Record<string, string> = {
  arc_elements: "arc_element",
  context_elements: "context_element",
  tone_elements: "tone_element",
  pace_elements: "pace_element",
  communicative_function_elements: "communicative_function_element",
};

function collectActionsAndSpeechActs(v: unknown, where: string, out: Array<{ key: "action" | "speech_act"; value: string; where: string }>): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => collectActionsAndSpeechActs(x, `${where}/${i}`, out));
    return;
  }
  if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      if ((k === "action" || k === "speech_act") && typeof x === "string") out.push({ key: k, value: x, where: `${where}/${k}` });
      else collectActionsAndSpeechActs(x, `${where}/${k}`, out);
    }
  }
}

/**
 * @param filledLocations the merge's applied gap locations — a finding at/under one of them is
 *   the DRAFTER's writing; anything else is deterministic carry-through from the map (e.g. a
 *   prose-suffixed `Presence:` line, or the reader's `PRESENT → DEPARTS` normalization). The
 *   split matters: only drafter-origin findings are drafter-compliance data; map-origin findings
 *   are upstream content-discipline findings for the reviewer.
 */
export function auditMints(merged: any, fills: DraftOutput, filledLocations: string[] = [], skeleton?: any): MintAudit {
  const ae = loadSpecJson<any>("approved-enumerations.json");
  const approved = new Map<string, Set<string>>();
  for (const [axis, entries] of Object.entries<any>(ae.axes ?? {})) approved.set(axis, new Set((entries as any[]).map((e) => e.value)));
  const rules = loadSpecJson<any>("validation-rules.json");
  const speechActs = new Set<string>(rules.closed_lists?.SPEECH_ACT ?? []);
  const declaredSet = new Set<string>();
  for (const f of fills.fills) for (const v of f.vocabulary_additions ?? []) declaredSet.add(`${v.axis} ${v.value}`);
  // An APPEND gap (…/beings_in_scene) authorizes only entries past the skeleton's original
  // count — pre-existing entries under it stay map-origin (the round-2 misattribution fix).
  const appendBaseline = new Map<string, number>();
  if (skeleton) {
    for (const loc of filledLocations) {
      if (!/\/beings_in_scene$/.test(loc)) continue;
      let cur: any = skeleton;
      for (const part of loc.split("/").filter(Boolean)) cur = cur?.[/^\d+$/.test(part) ? Number(part) : part];
      appendBaseline.set(loc, Array.isArray(cur?.entries) ? cur.entries.length : 0);
    }
  }
  const originOf = (path: string): "drafter" | "map" => {
    for (const loc of filledLocations) {
      if (path !== loc && !path.startsWith(`${loc}/`)) continue;
      const base = appendBaseline.get(loc);
      if (base === undefined) return "drafter"; // ordinary replace-fill location
      const m = path.slice(loc.length).match(/^\/entries\/(\d+)(\/|$)/);
      if (m && Number(m[1]) >= base) return "drafter"; // an appended entry
      // under the append location but within the original entries — not the drafter's writing
    }
    return "map";
  };

  const audit: MintAudit = { checked: 0, declared: [], undeclared: [], closedViolations: [] };
  const check = (axis: string, value: unknown, where: string, path: string) => {
    if (typeof value !== "string" || !value.length) return;
    audit.checked++;
    if (approved.get(axis)?.has(value)) return;
    const rec: MintRecord = { axis, value, where, origin: originOf(path) };
    if (declaredSet.has(`${axis} ${value}`)) audit.declared.push(rec);
    else audit.undeclared.push(rec);
  };

  for (const [field, axis] of Object.entries(LEVEL1_AXIS))
    for (const v of merged.level_1?.[field] ?? []) check(axis, v, `/level_1/${field}`, `/level_1/${field}`);
  (merged.level_2_scenes ?? []).forEach((sc: any, si: number) => {
    const at = `/level_2_scenes/${si}`;
    check("scene_kind", sc.scene_kind, `/${sc.scene_id}/scene_kind`, `${at}/scene_kind`);
    // drafter-appended entries sit under the append gap location (`…/beings_in_scene`), so
    // prefix matching attributes them to the drafter automatically.
    (sc.beings_in_scene?.entries ?? []).forEach((b: any, bi: number) => {
      const bp = `${at}/beings_in_scene/entries/${bi}`;
      check("presence_value", b.presence, `/${sc.scene_id}/${b.being_id}/presence`, `${bp}/presence`);
      check("role_in_scene_being", b.role_in_scene, `/${sc.scene_id}/${b.being_id}/role_in_scene`, `${bp}/role_in_scene`);
    });
  });
  (merged.level_3_propositions ?? []).forEach((p: any, pi: number) => {
    const at = `/level_3_propositions/${pi}`;
    check("proposition_kind", p.proposition_kind, `/${p.prop_id}/proposition_kind`, `${at}/proposition_kind`);
    const hits: Array<{ key: "action" | "speech_act"; value: string; where: string }> = [];
    collectActionsAndSpeechActs(p.event_specific_slots, `/${p.prop_id}/event_specific_slots`, hits);
    for (const h of hits) {
      const path = `${at}/event_specific_slots`;
      if (h.key === "action") check("action", h.value, h.where, path);
      else {
        audit.checked++;
        if (!speechActs.has(h.value))
          audit.closedViolations.push({ axis: "SPEECH_ACT(closed)", value: h.value, where: h.where, origin: originOf(path) });
      }
    }
  });
  return audit;
}

export function formatMintAudit(a: MintAudit): string {
  const tag = (m: MintRecord) => (m.origin === "map" ? "map-borne" : "DRAFTER");
  const L: string[] = [
    `mint audit: ${a.checked} axis tokens checked · ${a.declared.length} declared mint(s) · ${a.undeclared.length} undeclared (${a.undeclared.filter((m) => m.origin === "drafter").length} drafter / ${a.undeclared.filter((m) => m.origin === "map").length} map-borne) · ${a.closedViolations.length} closed-list violation(s)`,
  ];
  for (const m of a.declared) L.push(`   ◆ declared [${tag(m)}]  ${m.axis} · ${m.value}  @ ${m.where}`);
  for (const m of a.undeclared) L.push(`   ✗ undeclared [${tag(m)}]  ${m.axis} · ${m.value}  @ ${m.where}`);
  for (const m of a.closedViolations) L.push(`   ‼ CLOSED [${tag(m)}]  ${m.axis} · ${m.value}  @ ${m.where}`);
  return L.join("\n");
}

export function formatCalibration(c: Calibration, label: string): string {
  const L: string[] = [`— calibration: ${label} (judgment layer, drafted vs gold) —`, ""];
  let matched = 0;
  let divergent = 0;
  for (const [name, f] of Object.entries(c.fields)) {
    matched += f.matched;
    divergent += f.divergent;
    L.push(`${name}: ${f.matched} matched · ${f.divergent} divergent`);
    for (const d of f.divergences) L.push(`   ✗ ${d.where}\n     drafted: ${JSON.stringify(d.drafted)}\n     gold:    ${JSON.stringify(d.gold)}`);
  }
  L.push("");
  for (const [k, a] of Object.entries(c.level1)) {
    L.push(`level_1.${k}: ${a.exact ? "EXACT" : "differs"} · shared ${a.shared.length} · gold-only [${a.goldOnly.join(", ")}] · draft-only [${a.draftOnly.join(", ")}]`);
  }
  L.push("");
  L.push(
    `alignment: props aligned ${c.alignment.props.aligned} · gold-only [${c.alignment.props.goldOnly.join(", ")}] · draft-only [${c.alignment.props.draftOnly.join(", ")}]`,
  );
  L.push(
    `beings aligned ${c.alignment.beings.aligned} · gold-only [${c.alignment.beings.goldOnly.join(", ")}] · draft-added [${c.alignment.beings.draftAdded.join(", ")}]`,
  );
  for (const n of c.notes) L.push(`note: ${n}`);
  const pct = matched + divergent ? Math.round((100 * matched) / (matched + divergent)) : 100;
  L.push("", `scalar-field agreement: ${matched}/${matched + divergent} (${pct}%) — set-valued level_1 reported above, alignment leftovers listed, nothing smoothed`);
  return L.join("\n");
}
