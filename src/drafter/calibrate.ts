/**
 * SC-0063 Phase B: judgment-layer calibration — score a DRAFTED FOR_MODEL against its GOLD
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
  const dro = { ...(drafted.pericope_classification?.register_overrides ?? {}) };
  const gro = { ...(gold.pericope_classification?.register_overrides ?? {}) };
  delete (dro as any)._note;
  delete (gro as any)._note;
  score(c, "register_overrides", "/pericope_classification", dro, gro);

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
  let countsDiffer = false;
  for (const { d, g } of pairs) {
    if (d && g) {
      c.alignment.props.aligned++;
      const at = `/${d.prop_id}↔${g.prop_id}@${g.verse_anchor}`;
      score(c, "proposition_kind", at, d.proposition_kind, g.proposition_kind);
      score(c, "event_specific_slots", at, d.event_specific_slots, g.event_specific_slots);
      score(c, "inter_proposition_links", at, d.inter_proposition_links, g.inter_proposition_links);
    } else if (d) c.alignment.props.draftOnly.push(`${d.prop_id}@${d.verse_anchor}`);
    else if (g) {
      c.alignment.props.goldOnly.push(`${g.prop_id}@${g.verse_anchor}`);
      countsDiffer = true;
    }
  }
  if (countsDiffer)
    c.notes.push(
      "gold decomposed beyond map granularity (gold-only props above) — inter_proposition_links comparisons may carry prop-id numbering skew; read link divergences with that in mind",
    );
  return c;
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
