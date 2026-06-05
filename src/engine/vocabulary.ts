import type { Finding } from "./report.js";
import { axisClass } from "../spec/load.js";
import { quarantineSets } from "../spec/enumerations.js";

/** Entity-registry code shapes (Layer 3). CB_/FIG_ are handled separately (flag arrays). */
const ENTITY_CODE = /^(B\d+|PL\d+|PL_[A-Z0-9_]+|O\d+|TH_[A-Z0-9_]+|TM_[A-Z0-9_]+|I\d+)$/;

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const sceneEntries = (node: unknown): any[] => asArray((node as any)?.entries) as any[];

/**
 * Layers 2 + 3 + register-critical checks for a FOR_MODEL (the structural/Layer-1 pass is ajv).
 *  - L2 drift: bounded-open values not in the canonical-P01 seed → `drift` (review, don't block).
 *  - referential integrity: entity codes used in propositions must be declared in a scene;
 *    inter-proposition links must target real prop_ids → `block`.
 *  - register-critical: significant_absence present/non-empty; referential_form coverage (info).
 *  - L3 registry: surface the CB/FIG/entity codes referenced (info).
 */
export function vocabularyFindings(json: any, seeds: Record<string, string[]>): Finding[] {
  const findings: Finding[] = [];
  const seedSets: Record<string, Set<string>> = {};
  for (const [k, v] of Object.entries(seeds)) seedSets[k] = new Set(v as string[]);
  const quarantine = quarantineSets();

  const drift = (value: unknown, seedKey: string, location: string) => {
    if (typeof value !== "string") return;
    const set = seedSets[seedKey];
    if (!set || set.has(value)) return;
    // SC-0023: a convergent value that is quarantined is a NOTICE, never a settled approval and never
    // a failing drift. Recurrence across pericopes is surfaced by the corpus quarantineWatch.
    const q = quarantine[seedKey];
    if (q && q.has(value)) {
      findings.push({
        severity: "quarantined",
        code: "quarantined",
        location,
        axis: seedKey,
        value,
        message: `'${value}' is QUARANTINED on ${seedKey} (used-once coin-flip, deliberately unpromoted — this use is the revisit signal, not a settled type; recurrence across pericopes → promote or collapse)`,
      });
      return;
    }
    const convergent = axisClass(seedKey) === "convergent";
    findings.push({
      severity: convergent ? "drift" : "descriptive",
      code: convergent ? "drift" : "descriptive",
      location,
      axis: seedKey,
      value,
      message: convergent
        ? `'${value}' not in the approved ${seedKey} enumeration — convergent axis, review → promote-with-provenance`
        : `'${value}' on open axis ${seedKey} — descriptive (per-pericope; not a review signal)`,
    });
  };

  // ---- Level 1 element arrays ----
  const l1 = json?.level_1 ?? {};
  const l1map: Array<[string, string]> = [
    ["arc_elements", "arc_element"],
    ["context_elements", "context_element"],
    ["tone_elements", "tone_element"],
    ["pace_elements", "pace_element"],
    ["communicative_function_elements", "communicative_function_element"],
  ];
  for (const [field, seedKey] of l1map) {
    asArray(l1[field]).forEach((val, i) => drift(val, seedKey, `/level_1/${field}/${i}`));
  }

  // ---- Level 2 scenes: collect declared entity ids + drift on scene fields ----
  const declared = new Set<string>();
  const scenes = asArray(json?.level_2_scenes) as any[];
  let scenesWithAbsence = 0;
  let referentialFormCount = 0;
  scenes.forEach((sc, si) => {
    const at = `/level_2_scenes/${si}`;
    drift(sc?.scene_kind, "scene_kind", `${at}/scene_kind`);
    sceneEntries(sc?.beings_in_scene).forEach((e, i) => {
      if (typeof e?.being_id === "string") declared.add(e.being_id);
      drift(e?.presence, "presence_value", `${at}/beings_in_scene/entries/${i}/presence`);
      drift(e?.role_in_scene, "role_in_scene_being", `${at}/beings_in_scene/entries/${i}/role_in_scene`);
      if (typeof e?.referential_form === "string") {
        referentialFormCount++;
        drift(e.referential_form, "referential_form", `${at}/beings_in_scene/entries/${i}/referential_form`);
      }
    });
    // SC-0022: place/object/time entries are id-only (role_in_scene/function_in_scene dropped from
    // the schema — their meaning is owned by registry-kind + statement slots + figures/threads).
    // The loops remain to collect declared entity ids for the referential-integrity check below.
    sceneEntries(sc?.places_in_scene).forEach((e) => {
      if (typeof e?.place_id === "string") declared.add(e.place_id);
    });
    sceneEntries(sc?.objects_in_scene).forEach((e) => {
      if (typeof e?.object_id === "string") declared.add(e.object_id);
    });
    sceneEntries(sc?.times_in_scene).forEach((e) => {
      if (typeof e?.time_id === "string") declared.add(e.time_id);
    });
    const absence = sc?.significant_absence;
    if (typeof absence === "string" && absence.trim() !== "") scenesWithAbsence++;
    else
      findings.push({
        severity: "drift",
        code: "register-critical",
        location: `${at}/significant_absence`,
        message: "significant_absence missing/empty — it is load-bearing (becomes must_preserve_absences downstream)",
      });
  });

  // ---- Level 3 propositions: drift + prop-graph + entity refs ----
  const props = asArray(json?.level_3_propositions) as any[];
  const propIds = new Set<string>(props.map((p) => p?.prop_id).filter((x): x is string => typeof x === "string"));
  const usedEntities = new Map<string, string>();
  const registryRefs = new Set<string>();

  const collectCodes = (val: unknown, location: string) => {
    if (typeof val === "string") {
      if (ENTITY_CODE.test(val) && !usedEntities.has(val)) usedEntities.set(val, location);
    } else if (Array.isArray(val)) {
      val.forEach((x, i) => collectCodes(x, `${location}/${i}`));
    } else if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val)) collectCodes(v, `${location}/${k}`);
    }
  };

  props.forEach((p, pi) => {
    const at = `/level_3_propositions/${pi}`;
    drift(p?.proposition_kind, "proposition_kind", `${at}/proposition_kind`);
    collectCodes(p?.event_specific_slots, `${at}/event_specific_slots`);
    const links = p?.inter_proposition_links ?? {};
    for (const key of ["forward_link_to", "caused_by", "paired_with", "back_reference_to_proposition"]) {
      const tgt = links[key];
      for (const t of Array.isArray(tgt) ? tgt : tgt != null ? [tgt] : []) {
        if (typeof t === "string" && !propIds.has(t))
          findings.push({
            severity: "block",
            code: "referential-integrity",
            location: `${at}/inter_proposition_links/${key}`,
            message: `link target '${t}' is not a declared prop_id`,
          });
      }
    }
    for (const f of asArray(p?.cb_flags)) if (typeof f === "string") registryRefs.add(f);
    for (const f of asArray(p?.figure_flags)) if (typeof f === "string") registryRefs.add(f);
  });

  for (const [code, loc] of usedEntities) {
    if (!declared.has(code))
      findings.push({
        severity: "block",
        code: "referential-integrity",
        location: loc,
        message: `entity '${code}' used in a proposition is not declared in any scene`,
      });
  }

  // ---- register-critical + L3 info ----
  if (scenes.length)
    findings.push({
      severity: "info",
      code: "register-critical",
      location: "/level_2_scenes",
      message: `${scenesWithAbsence}/${scenes.length} scenes carry significant_absence; referential_form on ${referentialFormCount} being entr${referentialFormCount === 1 ? "y" : "ies"}`,
    });
  if (registryRefs.size || usedEntities.size) {
    const cb = [...registryRefs].filter((r) => r.startsWith("CB_")).sort();
    const fig = [...registryRefs].filter((r) => r.startsWith("FIG_")).sort();
    findings.push({
      severity: "info",
      code: "registry",
      location: "(artifact)",
      message: `L3 references — ${usedEntities.size} entities, concepts [${cb.join(", ") || "—"}], figures [${fig.join(", ") || "—"}]`,
    });
  }

  return findings;
}
