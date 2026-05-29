import type { MeaningMap } from "../reader/meaning-map.js";
import { isTodo } from "./skeleton.js";

/**
 * Extract-only guarantee (item 4): every value the skeleton emits that is *not* a derived envelope
 * field and *not* a `__TODO__` placeholder must trace to a Meaning-Map span — no invented values.
 *  - entity codes (being/place/object/time _id) ← MM wikilink codes
 *  - cb_flags / figure_flags ← MM Section-5 flag codes
 *  - genre_group / genre / register ← MM frontmatter
 *  - bcv / pericope_title ← MM frontmatter (exact, modulo dash normalization)
 * Derived/constant fields (sta_id, tagset_version, source_language, scene_id, prop_id, scene_link,
 * verse_anchor, verse_range, …) and MM-prose fields (significant_absence, scene_communicative_purpose,
 * cross_ref — copied verbatim by construction) are not re-checked here.
 */
export interface TraceViolation {
  location: string;
  key: string;
  value: string;
  why: string;
}
export interface TraceResult {
  traced: number;
  todo: number;
  violations: TraceViolation[];
}

const TRACEABLE_ENTITY = new Set(["being_id", "place_id", "object_id", "time_id"]);
const TRACEABLE_CLASS = new Set(["genre_group", "genre", "register"]);
const dashNorm = (s: unknown): string => String(s ?? "").replace(/[–—]/g, "-").trim();

export function traceCheck(mm: MeaningMap, skeleton: any): TraceResult {
  const entityCodes = new Set<string>();
  for (const s of mm.scenes)
    for (const arr of [s.beings, s.places, s.objects, s.times ?? []]) for (const e of arr) if (e.code) entityCodes.add(e.code);
  const flagCodes = new Set<string>();
  for (const p of mm.propositions) {
    for (const c of p.cbFlags) flagCodes.add(c);
    for (const f of p.figFlags) flagCodes.add(f);
  }
  const classVals = new Set([mm.genreGroup, mm.genre, mm.register].filter((x): x is string => !!x));

  const violations: TraceViolation[] = [];
  let traced = 0;
  let todo = 0;

  const walk = (v: unknown, path: string, key: string) => {
    if (isTodo(v)) {
      todo++;
      return;
    }
    if (typeof v === "string") {
      if (TRACEABLE_ENTITY.has(key)) {
        if (entityCodes.has(v)) traced++;
        else violations.push({ location: path, key, value: v, why: "entity code not in any MM wikilink" });
      } else if (TRACEABLE_CLASS.has(key)) {
        if (classVals.has(v)) traced++;
        else violations.push({ location: path, key, value: v, why: "classification value not in MM frontmatter" });
      }
      return;
    }
    if (Array.isArray(v)) {
      if (key === "cb_flags" || key === "figure_flags") {
        for (const el of v)
          if (typeof el === "string") {
            if (flagCodes.has(el)) traced++;
            else violations.push({ location: path, key, value: el, why: "flag not present in MM Section 5" });
          }
        return;
      }
      v.forEach((x, i) => walk(x, `${path}/${i}`, key));
      return;
    }
    if (v && typeof v === "object") {
      for (const [k, val] of Object.entries(v)) walk(val, `${path}/${k}`, k);
    }
  };
  walk(skeleton, "", "");

  const header = (skeleton as any)?.header ?? {};
  if (!isTodo(header.bcv) && dashNorm(header.bcv) !== dashNorm(mm.bcv))
    violations.push({ location: "/header/bcv", key: "bcv", value: String(header.bcv), why: "does not match MM bcv" });
  if (!isTodo(header.pericope_title) && header.pericope_title !== mm.title)
    violations.push({ location: "/header/pericope_title", key: "pericope_title", value: String(header.pericope_title), why: "does not match MM title" });

  return { traced, todo, violations };
}
