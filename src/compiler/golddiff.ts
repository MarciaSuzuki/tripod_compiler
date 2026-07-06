import type { MeaningMap } from "../reader/meaning-map.js";
import { isTodo } from "./skeleton.js";

/**
 * Gold diff (item 1): compare the skeleton's *deterministic, gold-comparable* fields against the
 * matching gold MEANING_COORDINATES and report, per pericope:
 *  - `matched`     — comparable fields equal to the gold;
 *  - `divergent`   — comparable fields where the skeleton (faithful to the MM) differs from the gold.
 *                    These are MM↔MEANING_COORDINATES *coverage divergences* (e.g. the MM scene lists an
 *                    off-stage referent the gold omits), NOT extractor errors — a preview of
 *                    COVERAGE.md's signal;
 *  - `agreementPct`— matched / (matched + divergent) over the comparable layer;
 *  - `judgmentPlaceholders` — count of `__TODO__` fields deferred to Agent 3.
 * Comparable layer: header, classification, scene IDs + verse-ranges, per-scene entity sets
 * (being_id:presence / place_id / time_id), and pericope-level concept/figure flag sets. L3
 * propositions are not field-diffed (their granularity differs from the gold by design). The
 * committed baseline of these numbers is Slice 4's regression check.
 */
export interface GoldDiff {
  pericope: string | null;
  matched: number;
  divergent: number;
  agreementPct: number;
  judgmentPlaceholders: number;
  divergences: { field: string; note: string }[];
}

const dash = (s: unknown): string => String(s ?? "").replace(/[–—]/g, "-").trim();
const str = (v: unknown): string => String(v ?? "");

export function goldDiff(mm: MeaningMap, skeleton: any, gold: any): GoldDiff {
  let matched = 0;
  let divergent = 0;
  const divergences: { field: string; note: string }[] = [];
  const hit = (field: string, ok: boolean, note = "") => {
    if (ok) matched++;
    else {
      divergent++;
      divergences.push({ field, note });
    }
  };
  const eq = (field: string, a: string, b: string) => hit(field, a === b, `'${a}' != gold '${b}'`);

  eq("header.bcv", dash(skeleton.header?.bcv), dash(gold.header?.bcv));
  eq("header.pericope_title", str(skeleton.header?.pericope_title), str(gold.header?.pericope_title));
  for (const k of ["genre_group", "genre", "register"])
    eq(`classification.${k}`, str(skeleton.pericope_classification?.[k]), str(gold.pericope_classification?.[k]));

  const skScenes: any[] = skeleton.level_2_scenes ?? [];
  const gdScenes: any[] = gold.level_2_scenes ?? [];
  const gdById = new Map<string, any>(gdScenes.map((s) => [s.scene_id, s]));
  eq("scene_ids", JSON.stringify(skScenes.map((s) => s.scene_id)), JSON.stringify(gdScenes.map((s) => s.scene_id)));
  for (const s of skScenes) {
    const g = gdById.get(s.scene_id);
    if (!g) {
      hit(`scene/${s.scene_id}`, false, "scene_id absent in gold");
      continue;
    }
    eq(`${s.scene_id}.verse_range`, str(s.verse_range), str(g.verse_range));
    const gB = new Set((g.beings_in_scene?.entries ?? []).map((e: any) => `${e.being_id}:${e.presence}`));
    for (const e of s.beings_in_scene?.entries ?? []) {
      if (isTodo(e.being_id) || isTodo(e.presence)) continue;
      hit(`${s.scene_id}/being/${e.being_id}`, gB.has(`${e.being_id}:${e.presence}`), `${e.being_id}:${e.presence} not in gold`);
    }
    const gP = new Set((g.places_in_scene?.entries ?? []).map((e: any) => e.place_id));
    for (const e of s.places_in_scene?.entries ?? []) {
      if (isTodo(e.place_id)) continue;
      hit(`${s.scene_id}/place/${e.place_id}`, gP.has(e.place_id), `${e.place_id} not in gold`);
    }
    const gT = new Set((g.times_in_scene?.entries ?? []).map((e: any) => e.time_id));
    for (const e of s.times_in_scene?.entries ?? []) {
      if (!e?.time_id || isTodo(e.time_id)) continue;
      hit(`${s.scene_id}/time/${e.time_id}`, gT.has(e.time_id), `${e.time_id} not in gold`);
    }
  }

  const union = (props: any[], key: string) => new Set(props.flatMap((p) => (p[key] as string[]) ?? []));
  const skProps: any[] = skeleton.level_3_propositions ?? [];
  const gdProps: any[] = gold.level_3_propositions ?? [];
  for (const c of union(skProps, "cb_flags")) hit(`flag/cb/${c}`, union(gdProps, "cb_flags").has(c), `${c} not in gold cb_flags`);
  for (const f of union(skProps, "figure_flags")) hit(`flag/fig/${f}`, union(gdProps, "figure_flags").has(f), `${f} not in gold figure_flags`);

  let judgmentPlaceholders = 0;
  const walk = (v: any) => {
    if (isTodo(v)) judgmentPlaceholders++;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(skeleton);

  return {
    pericope: mm.pericope,
    matched,
    divergent,
    agreementPct: matched + divergent ? Math.round((100 * matched) / (matched + divergent)) : 100,
    judgmentPlaceholders,
    divergences,
  };
}
