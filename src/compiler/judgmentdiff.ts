import { isTodo } from "./skeleton.js";

/**
 * Judgment-layer gold diff (Slice 4). The deterministic `goldDiff` grades the extracted layer and
 * skips `__TODO__`; this grades the fields the *drafter* fills, against the gold FOR_MODEL.
 *
 * Two kinds of disagreement, reported SEPARATELY (the design requirement):
 *  - **token** — on items that align 1:1 with gold, the drafter chose a different controlled token
 *    (scene_kind, proposition_kind, an L1 element, a slot-name set). The drafter's judgment accuracy.
 *  - **granularity** — items that do NOT align 1:1 (a proposition the drafter split/merged vs gold, a
 *    scene id only one side has). Structural, NOT token errors — excluded from the token score.
 *
 * Each divergence carries the candidate location so the diagnostic loop can attach the model's reason.
 * Alignment keys: scenes by `scene_id`; propositions by (`scene_link`,`verse_anchor`). L1 element
 * arrays are unordered sets (Jaccard).
 */
export type DivergenceKind = "token" | "token-extra" | "token-missing" | "granularity";
export interface Divergence {
  axis: string;
  location: string | null; // candidate path (joins to a fill's reason); null for gold-only items
  candidate: unknown;
  gold: unknown;
  kind: DivergenceKind;
  note?: string;
}
export interface AxisScore {
  axis: string;
  matched: number;
  tokenMismatch: number;
}
export interface JudgmentDiff {
  pericope: string | null;
  axes: AxisScore[];
  divergences: Divergence[];
  tokenMatched: number;
  tokenTotal: number;
  tokenAgreementPct: number;
  granularityDivergences: number;
  unresolvedTodo: number;
}

const str = (v: unknown): string => String(v ?? "");
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);
const todoCount = (v: unknown): number =>
  isTodo(v) ? 1 : Array.isArray(v) ? v.reduce((n, x) => n + todoCount(x), 0) : v && typeof v === "object" ? Object.values(v).reduce((n: number, x) => n + todoCount(x), 0) : 0;

export function judgmentDiff(candidate: any, gold: any, pericope: string | null = null): JudgmentDiff {
  const axes: AxisScore[] = [];
  const divergences: Divergence[] = [];
  let granularityDivergences = 0;

  // ---- Level 1 element arrays (unordered sets) ----
  const l1 = candidate?.level_1 ?? {};
  const gl1 = gold?.level_1 ?? {};
  for (const field of ["arc_elements", "context_elements", "tone_elements", "pace_elements", "communicative_function_elements"]) {
    const loc = `/level_1/${field}`;
    const c = new Set(arr(l1[field]).map(str).filter((s) => s && !s.startsWith("__TODO__")));
    const g = new Set(arr(gl1[field]).map(str));
    let matched = 0;
    for (const v of c) if (g.has(v)) matched++;
    const extra = [...c].filter((v) => !g.has(v));
    const missing = [...g].filter((v) => !c.has(v));
    for (const v of extra) divergences.push({ axis: field, location: loc, candidate: v, gold: null, kind: "token-extra" });
    for (const v of missing) divergences.push({ axis: field, location: loc, candidate: null, gold: v, kind: "token-missing" });
    axes.push({ axis: field, matched, tokenMismatch: extra.length + missing.length });
  }

  // ---- scene_kind (align by scene_id) ----
  const cScenes = arr(candidate?.level_2_scenes);
  const gScenes = arr(gold?.level_2_scenes);
  const gSceneById = new Map<string, any>(gScenes.map((s) => [str(s?.scene_id), s]));
  const cSceneIds = new Set(cScenes.map((s) => str(s?.scene_id)));
  let skMatched = 0;
  let skMismatch = 0;
  cScenes.forEach((s, i) => {
    const g = gSceneById.get(str(s?.scene_id));
    if (!g) {
      granularityDivergences++;
      divergences.push({ axis: "scene_kind", location: `/level_2_scenes/${i}/scene_kind`, candidate: str(s?.scene_id), gold: null, kind: "granularity", note: "scene id not in gold" });
      return;
    }
    if (isTodo(s?.scene_kind)) return;
    if (str(s?.scene_kind) === str(g?.scene_kind)) skMatched++;
    else {
      skMismatch++;
      divergences.push({ axis: "scene_kind", location: `/level_2_scenes/${i}/scene_kind`, candidate: str(s?.scene_kind), gold: str(g?.scene_kind), kind: "token" });
    }
  });
  for (const g of gScenes) if (!cSceneIds.has(str(g?.scene_id))) { granularityDivergences++; divergences.push({ axis: "scene_kind", location: null, candidate: null, gold: str(g?.scene_id), kind: "granularity", note: "gold scene absent in draft" }); }
  axes.push({ axis: "scene_kind", matched: skMatched, tokenMismatch: skMismatch });

  // ---- proposition_kind + event_specific_slots (align by scene_link + verse_anchor) ----
  const cProps = arr(candidate?.level_3_propositions);
  const gProps = arr(gold?.level_3_propositions);
  const key = (p: any) => `${str(p?.scene_link)}|${str(p?.verse_anchor)}`;
  const gByKey = new Map<string, any[]>();
  for (const p of gProps) (gByKey.get(key(p)) ?? gByKey.set(key(p), []).get(key(p))!).push(p);
  const cByKey = new Map<string, any[]>();
  for (const p of cProps) (cByKey.get(key(p)) ?? cByKey.set(key(p), []).get(key(p))!).push(p);

  let pkMatched = 0;
  let pkMismatch = 0;
  let slotMatched = 0;
  let slotMismatch = 0;
  cProps.forEach((c, i) => {
    const k = key(c);
    const cs = cByKey.get(k) ?? [];
    const gs = gByKey.get(k) ?? [];
    if (cs.length !== 1 || gs.length !== 1) {
      granularityDivergences++;
      divergences.push({ axis: "proposition_kind", location: `/level_3_propositions/${i}/proposition_kind`, candidate: `${k} (draft×${cs.length})`, gold: `gold×${gs.length}`, kind: "granularity", note: "proposition not 1:1 with gold" });
      return;
    }
    const g = gs[0];
    if (!isTodo(c?.proposition_kind)) {
      if (str(c?.proposition_kind) === str(g?.proposition_kind)) pkMatched++;
      else { pkMismatch++; divergences.push({ axis: "proposition_kind", location: `/level_3_propositions/${i}/proposition_kind`, candidate: str(c?.proposition_kind), gold: str(g?.proposition_kind), kind: "token" }); }
    }
    const cSlots = slotNames(c?.event_specific_slots);
    const gSlots = slotNames(g?.event_specific_slots);
    if (cSlots !== null) {
      const inter = cSlots.filter((s) => gSlots?.includes(s)).length;
      const union = new Set([...cSlots, ...(gSlots ?? [])]).size;
      if (union === 0 || inter === union) slotMatched++;
      else { slotMismatch++; divergences.push({ axis: "event_specific_slots", location: `/level_3_propositions/${i}/event_specific_slots`, candidate: cSlots.join(","), gold: (gSlots ?? []).join(","), kind: "token", note: "slot-name set differs" }); }
    }
  });
  for (const [k, gs] of gByKey) if (!(cByKey.get(k)?.length)) { granularityDivergences++; divergences.push({ axis: "proposition_kind", location: null, candidate: null, gold: `${k} (gold×${gs.length})`, kind: "granularity", note: "gold proposition absent in draft" }); }
  axes.push({ axis: "proposition_kind", matched: pkMatched, tokenMismatch: pkMismatch });
  axes.push({ axis: "event_specific_slots(slot-names)", matched: slotMatched, tokenMismatch: slotMismatch });

  const tokenMatched = axes.reduce((n, a) => n + a.matched, 0);
  const tokenTotal = axes.reduce((n, a) => n + a.matched + a.tokenMismatch, 0);
  return {
    pericope,
    axes,
    divergences,
    tokenMatched,
    tokenTotal,
    tokenAgreementPct: tokenTotal ? Math.round((100 * tokenMatched) / tokenTotal) : 100,
    granularityDivergences,
    unresolvedTodo: todoCount(candidate?.level_1) + todoCount(candidate?.level_2_scenes) + todoCount(candidate?.level_3_propositions),
  };
}

/** Slot-name set: top-level keys, plus component action names if a *_components array is present. Null when the field is __TODO__. */
function slotNames(slots: unknown): string[] | null {
  if (slots == null || isTodo(slots) || typeof slots !== "object") return null;
  const names = new Set<string>();
  for (const [k, v] of Object.entries(slots as Record<string, unknown>)) {
    if (k.startsWith("__TODO__")) return null;
    names.add(k);
    if (k.endsWith("_components") && Array.isArray(v)) for (const comp of v) if (comp && typeof comp === "object" && "action" in comp) names.add(`action:${str((comp as any).action)}`);
  }
  return [...names];
}
