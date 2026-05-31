import { loadSpecJson } from "../spec/load.js";

/**
 * The Level-3 lint (docs/COVERAGE.md stack: legal · complete · **atomic-bare-plain** · true).
 * A 4th deterministic verifier beside validate/coverage. It flags, in the *content* layers — Level 3
 * propositions and §3C — the four drift classes from `_methodology/level3and3Ccontentdiscipline.md`:
 *   - forbidden grammatical / linguistic vocabulary (R4) — whole-word, in prose only (not slot-names),
 *   - interpretive-label patterns (R3) — "image-rhyme", "triplet", "speech-act of", …,
 *   - conditioning-in-Q&A (R5) — "Register?/Self-form?/Forward-link?" lines (meaning map),
 *   - compound / non-atomic answers (R2) — ';', ' and ' in a Q&A answer,
 *   - §3C that is not an entity (R1) — an object that is really an event / framing / literary pattern.
 * It SURFACES drift; the human judges (and relocates insight, never deletes it).
 */

export type LintRule =
  | "forbidden_vocabulary"
  | "interpretive_label"
  | "conditioning_in_qa"
  | "compound"
  | "section_3c_not_entity";

export interface LintFinding {
  rule: LintRule;
  tier: number; // 1 = high-confidence; 2 = judge-in-context
  location: string;
  match: string;
  context: string;
}

export interface LintReport {
  file: string;
  artifact: string; // "MEANING_MAP" | "FOR_MODEL"
  findings: LintFinding[];
  counts: { tier1: number; tier2: number; byRule: Record<string, number> };
  ok: boolean; // true iff no findings
}

interface Lexicon {
  forbidden_vocabulary: { term: string; category: string; tier: number }[];
  interpretive_labels: string[];
  conditioning_qa: string[];
  compound_markers: string[];
}

let _lex: Lexicon | undefined;
function lexicon(): Lexicon {
  return (_lex ??= loadSpecJson<Lexicon>("lint-lexicon.json"));
}

// §3C R1 signals: an "object" id/label that actually denotes an event, a referential framing, or a
// literary/discourse pattern (which belong to a proposition / referential_form / figure, respectively).
function snake(s: string): string {
  return s.replace(/_/g, " ").toLowerCase();
}

// §3C R1 signals (tested against the snake-normalized id/label): an "object" that actually denotes an
// event, a referential framing, or a literary/discourse pattern (→ a proposition / referential_form / figure).
const R1_NOT_ENTITY = /(death of|taking of|took |died|birth of|return|arriv|framing|husband of|wife of|reference|residue|rhyme|formula|marker|compression|listing|occurrence|phrasing|stripped)/;

/** Scan one prose string for forbidden vocabulary (whole-word) + interpretive labels. */
function scanProse(text: string, location: string): LintFinding[] {
  const lex = lexicon();
  const out: LintFinding[] = [];
  const lc = ` ${snake(text)} `;
  for (const { term, tier } of lex.forbidden_vocabulary) {
    const t = term.toLowerCase();
    const hit = t.includes(" ") || t.includes("-") ? lc.includes(t) : new RegExp(`\\b${t}\\b`).test(lc);
    if (hit) out.push({ rule: "forbidden_vocabulary", tier, location, match: term, context: text.trim().slice(0, 80) });
  }
  for (const label of lex.interpretive_labels) {
    if (lc.includes(label.toLowerCase())) out.push({ rule: "interpretive_label", tier: 1, location, match: label, context: text.trim().slice(0, 80) });
  }
  return out;
}

// ───────────────────────── FOR_MODEL ─────────────────────────

function walkStrings(node: unknown, path: string, visit: (s: string, path: string) => void): void {
  if (typeof node === "string") visit(node, path);
  else if (Array.isArray(node)) node.forEach((x, i) => walkStrings(x, `${path}[${i}]`, visit));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walkStrings(v, path ? `${path}.${k}` : k, visit);
}

export function lintForModel(json: any, file = ""): LintReport {
  const findings: LintFinding[] = [];

  // §3C entities-only (R1): an object whose id/function denotes an event/framing/pattern
  for (const scene of json.level_2_scenes ?? []) {
    for (const e of scene?.objects_in_scene?.entries ?? []) {
      const id = String(e?.object_id ?? "");
      const fn = String(e?.function_in_scene ?? "");
      if (R1_NOT_ENTITY.test(snake(id)) || R1_NOT_ENTITY.test(snake(fn))) {
        findings.push({ rule: "section_3c_not_entity", tier: 2, location: `${scene.scene_id}.objects_in_scene/${id}`, match: id, context: `${id} — ${fn}`.slice(0, 90) });
      }
    }
  }

  // forbidden vocab + interpretive labels in the compiled content/prose fields (snake-split)
  const scanField = (s: string, path: string) => {
    // skip the controlled entity-id tokens themselves (B#/PL#/…); scan descriptive labels + prose
    if (/^(B\d+|PL[\w]*|O\d+|TM_[\w]+|CB_\d+|FIG_\d+|I\d+|THE_FAMILY|NONE|B\?)$/.test(s)) return;
    findings.push(...scanProse(s, path));
  };
  for (const scene of json.level_2_scenes ?? []) {
    walkStrings(scene?.objects_in_scene, `${scene.scene_id}.objects_in_scene`, scanField);
    for (const f of ["scene_communicative_purpose", "significant_absence"]) if (scene?.[f]) findings.push(...scanProse(String(scene[f]), `${scene.scene_id}.${f}`));
  }
  for (const prop of json.level_3_propositions ?? []) {
    walkStrings(prop?.event_specific_slots, `${prop.prop_id}.event_specific_slots`, scanField);
    if (prop?.cross_ref) findings.push(...scanProse(String(prop.cross_ref), `${prop.prop_id}.cross_ref`));
  }

  return finalize(findings, file, "FOR_MODEL");
}

// ───────────────────────── meaning map (markdown prose) ─────────────────────────

/** Pull the body of a `## N. <title>` section (until the next `## `). */
function section(md: string, re: RegExp): string {
  const m = md.match(re);
  if (!m) return "";
  const start = m.index! + m[0].length;
  const next = md.slice(start).search(/\n##\s/);
  return next === -1 ? md.slice(start) : md.slice(start, start + next);
}

export function lintMeaningMap(md: string, file = ""): LintReport {
  const findings: LintFinding[] = [];
  const lex = lexicon();

  // §3C "Objects and Elements" blocks + Level 3 proposition Q&A — the authored content layers
  const level3 = section(md, /##\s*4\.\s*Level 3[^\n]*/i);
  const objectsBlocks = [...md.matchAll(/\*\*3C\s*[—-]\s*Objects[^\n]*\*\*([\s\S]*?)(?=\n\*\*3D|\n###|\n##|$)/gi)].map((m) => m[1] ?? "").join("\n");

  const lines = (objectsBlocks + "\n" + level3).split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // conditioning-in-Q&A (R5): meta-question prompts that are steering, not payload
    for (const c of lex.conditioning_qa) {
      if (line.toLowerCase().includes(c.toLowerCase())) findings.push({ rule: "conditioning_in_qa", tier: 1, location: "§3C/§4", match: c, context: line.slice(0, 80) });
    }

    // a Q&A answer line: "- **A:** …" or "**A:** …"
    const ans = line.match(/\*\*A:\*\*\s*(.+)$/);
    if (ans) {
      const a = ans[1]!.trim();
      if (a.includes(";") || /\b and \b/.test(` ${a} `)) findings.push({ rule: "compound", tier: 2, location: "§4 Q&A", match: a.includes(";") ? ";" : "and", context: a.slice(0, 80) });
      findings.push(...scanProse(a, "§4 Q&A answer"));
    } else {
      // §3C entry prose (What it is / Function / Signals)
      findings.push(...scanProse(line, "§3C entry"));
    }
  }
  return finalize(findings, file, "MEANING_MAP");
}

function finalize(findings: LintFinding[], file: string, artifact: string): LintReport {
  // de-dup identical (rule, location, match)
  const seen = new Set<string>();
  const uniq = findings.filter((f) => {
    const k = `${f.rule}|${f.location}|${f.match}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const byRule: Record<string, number> = {};
  for (const f of uniq) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
  return {
    file,
    artifact,
    findings: uniq,
    counts: { tier1: uniq.filter((f) => f.tier === 1).length, tier2: uniq.filter((f) => f.tier === 2).length, byRule },
    ok: uniq.length === 0,
  };
}
