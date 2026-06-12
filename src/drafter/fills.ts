import type { Gap } from "../compiler/skeleton.js";
import { isTodo } from "../compiler/skeleton.js";

/**
 * The patch-only contract (SC-0063 §3.1): the model returns gap-fills keyed by gap location;
 * this layer merges them into the skeleton DETERMINISTICALLY and refuses anything else.
 * The deterministic half of the artifact cannot be touched — the gap report is the sole
 * write-authorization. The Facilitator's "don't invent semantic content" rule, enforced at
 * the merge layer rather than by prompt hope.
 */

export interface VocabularyAddition {
  axis: string;
  value: string;
  justification: string;
}

export interface Fill {
  location: string;
  /** JSON-serialized value for the location; "null" = note-only / no write. */
  value_json: string;
  note: string | null;
  vocabulary_additions: VocabularyAddition[] | null;
}

export interface DraftOutput {
  fills: Fill[];
  remarks: string | null;
}

/** Structured-output schema the API enforces on the drafter's response (strict: all keys required, no extras). */
export const DRAFT_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fills", "remarks"],
  properties: {
    fills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["location", "value_json", "note", "vocabulary_additions"],
        properties: {
          location: { type: "string", description: "a gap location from the gap report, verbatim" },
          value_json: { type: "string", description: 'the JSON-serialized value; "null" for note-only' },
          note: { anyOf: [{ type: "null" }, { type: "string" }] },
          vocabulary_additions: {
            anyOf: [
              { type: "null" },
              {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["axis", "value", "justification"],
                  properties: {
                    axis: { type: "string" },
                    value: { type: "string" },
                    justification: { type: "string" },
                  },
                },
              },
            ],
          },
        },
      },
    },
    remarks: { anyOf: [{ type: "null" }, { type: "string" }] },
  },
} as const;

export interface MergeResult {
  merged: Record<string, unknown>;
  /** locations written */
  applied: string[];
  /** locations whose fill was null-valued (note-only / inapplicable) */
  noteOnly: string[];
  /** fills refused, with reasons — any entry here is a contract violation to surface */
  rejected: Array<{ location: string; reason: string }>;
  /** gaps that received no fill at all */
  unfilled: Gap[];
  /** paths still carrying __TODO__ after the merge (should be ∅ when every gap is filled) */
  leftovers: string[];
}

function walk(obj: unknown, pointer: string): { parent: any; key: string | number } | null {
  const parts = pointer.split("/").filter((p) => p.length);
  const last = parts[parts.length - 1];
  if (last === undefined) return null;
  let cur: any = obj;
  for (const part of parts.slice(0, -1)) {
    const k: string | number = /^\d+$/.test(part) ? Number(part) : part;
    if (cur == null || typeof cur !== "object") return null;
    cur = cur[k];
  }
  if (cur == null || typeof cur !== "object") return null;
  return { parent: cur, key: /^\d+$/.test(last) ? Number(last) : last };
}

function findLeftovers(v: unknown, path: string, out: string[]): void {
  if (isTodo(v)) {
    out.push(path || "/");
    return;
  }
  if (Array.isArray(v)) v.forEach((x, i) => findLeftovers(x, `${path}/${i}`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) findLeftovers(x, `${path}/${k}`, out);
}

/** Apply drafter fills to a skeleton. Pure: the input skeleton is not mutated. */
export function applyFills(skeleton: Record<string, unknown>, gaps: Gap[], output: DraftOutput): MergeResult {
  const merged = JSON.parse(JSON.stringify(skeleton)) as Record<string, unknown>;
  const gapByLoc = new Map(gaps.map((g) => [g.location, g]));
  const applied: string[] = [];
  const noteOnly: string[] = [];
  const rejected: Array<{ location: string; reason: string }> = [];
  const seen = new Set<string>();

  for (const fill of output.fills) {
    const loc = fill.location;
    if (seen.has(loc)) {
      rejected.push({ location: loc, reason: "duplicate fill for this location" });
      continue;
    }
    seen.add(loc);
    if (!gapByLoc.has(loc)) {
      rejected.push({ location: loc, reason: "not a gap location — the gap report is the sole write-authorization" });
      continue;
    }
    let value: unknown;
    try {
      value = JSON.parse(fill.value_json);
    } catch {
      rejected.push({ location: loc, reason: "value_json is not valid JSON" });
      continue;
    }

    // The granularity gap is note-only by contract: structural decomposition happens inside
    // event_specific_slots components, never by rewriting the proposition list.
    if (loc === "/level_3_propositions") {
      if (value !== null) {
        rejected.push({ location: loc, reason: "granularity gap is note-only (value must be null)" });
        continue;
      }
      noteOnly.push(loc);
      continue;
    }

    if (value === null) {
      noteOnly.push(loc); // inapplicable field (e.g. unmarked referential_form) — honest no-write
      continue;
    }

    // Scene-level beings gap = constrained APPEND of REFERENCED entries (never replacement).
    if (/^\/level_2_scenes\/\d+\/beings_in_scene$/.test(loc)) {
      if (!Array.isArray(value)) {
        rejected.push({ location: loc, reason: "beings_in_scene append gap takes an ARRAY of entries" });
        continue;
      }
      const bad = (value as any[]).find(
        (e) => !e || typeof e !== "object" || typeof e.being_id !== "string" || typeof e.role_in_scene !== "string" || typeof e.presence !== "string",
      );
      if (bad !== undefined) {
        rejected.push({ location: loc, reason: "each appended being entry needs string being_id / role_in_scene / presence" });
        continue;
      }
      const at = walk(merged, `${loc}/entries`);
      if (!at || !Array.isArray(at.parent[at.key])) {
        rejected.push({ location: loc, reason: "skeleton has no entries array at this location" });
        continue;
      }
      (at.parent[at.key] as unknown[]).push(...(value as unknown[]));
      applied.push(loc);
      continue;
    }

    const at = walk(merged, loc);
    if (!at) {
      rejected.push({ location: loc, reason: "location does not resolve in the skeleton" });
      continue;
    }
    at.parent[at.key] = value;
    applied.push(loc);
  }

  const unfilled = gaps.filter((g) => !seen.has(g.location));
  const leftovers: string[] = [];
  findLeftovers(merged, "", leftovers);
  return { merged, applied, noteOnly, rejected, unfilled, leftovers };
}
