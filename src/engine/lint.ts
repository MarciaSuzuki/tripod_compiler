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
  | "section_3c_not_entity"
  | "meta_question"
  | "link_in_level3";

/** A reviewer-accepted lint exception attached to a finding (downgrades it from drift to accepted). */
export interface AcceptedLintException {
  reason: string;
  note?: string;
  accepted_by?: string;
}

export interface LintFinding {
  rule: LintRule;
  tier: number; // 1 = high-confidence; 2 = judge-in-context
  location: string;
  match: string;
  context: string;
  accepted?: AcceptedLintException; // reviewer signed off (lint-exceptions.json) ⇒ not drift
}

export interface LintReport {
  file: string;
  artifact: string; // "MEANING_MAP" | "FOR_MODEL"
  findings: LintFinding[];
  counts: { tier1: number; tier2: number; accepted: number; byRule: Record<string, number> };
  ok: boolean; // true iff no UN-ACCEPTED findings (reviewer-signed-off exceptions don't count as drift)
}

/** A reviewer sign-off keyed to one specific lint finding (mirrors coverage-exceptions, SC-0010). */
export interface LintException {
  pericope: string; // map basename stem, e.g. "P05-Ruth-2-1-7"
  rule: LintRule;
  match: string;
  context_prefix: string; // a prefix of the finding's context, enough to pin the exact line
  reason: string;
  note?: string;
  accepted_by?: string;
  accepted_on?: string;
  sc_ref?: string;
}

/**
 * Apply reviewer sign-offs to a report: a finding whose (pericope, rule, match, context-prefix) matches
 * an exception is tagged `accepted` (kept in the ledger, with reason) and excluded from the drift count.
 * The engine itself stays pure — it always surfaces every finding; acceptance is a recorded downgrade,
 * exactly as `tripod coverage` applies coverage-exceptions.json. `pericope` is derived from the file stem.
 */
export function applyLintExceptions(report: LintReport, exceptions: LintException[]): LintReport {
  if (!exceptions.length) return report;
  const stem = report.file.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const findings = report.findings.map((f) => {
    const ex = exceptions.find(
      (e) => e.pericope === stem && e.rule === f.rule && e.match === f.match && f.context.startsWith(e.context_prefix),
    );
    return ex ? { ...f, accepted: { reason: ex.reason, note: ex.note, accepted_by: ex.accepted_by } } : f;
  });
  return recount({ ...report, findings });
}

interface Lexicon {
  forbidden_vocabulary: { term: string; category: string; tier: number }[];
  interpretive_labels: string[];
  conditioning_qa: string[];
  compound_markers: string[];
  link_markers?: string[];
  meta_questions?: string[];
  // Softer interpretive phrasings ("declaration", "recites", …) that are drift ONLY in a §4 Q&A
  // answer. Deliberately NOT in scanProse (which also runs on FOR_MODEL fields + §3C notes), so they
  // never fire on a closed-list speech_act value or a relocation note — both out of scope for the sweep.
  answer_labels?: string[];
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

/** Split a §4 / §3C line into its question and answer parts (handles same-line and split formats). */
function qaParts(line: string): { q?: string; a?: string } {
  const aMatch = line.match(/\*\*A:\*\*\s*(.+)$/);
  const a = aMatch ? aMatch[1]!.trim() : undefined;
  const qMatch = line.match(/\*\*Q:\*\*\s*(.+?)(?:\s*\*\*A:\*\*|$)/);
  const q = qMatch ? qMatch[1]!.trim() : undefined;
  return { q, a };
}

/**
 * Compound-of-acts (R2). `;` always counts. For ' and ' / ', ' first strip wikilinks, entity-id
 * tokens and proper names, so an answer that merely NAMES several entities ("his two sons [[B4]]
 * Mahlon and [[B5]] Chilion", "the family A, B, C") is NOT flagged — only a connector still joining
 * word-groups after stripping (two acts/clauses) is.
 */
function compoundMarker(a: string): string | null {
  if (a.includes(";")) return ";";
  const stripped = a
    .replace(/\[\[[^\]]+\]\]/g, " ")
    .replace(/\b(?:B\d+|PL[\w]*|O\d+|TM_[\w]+|CB_\d+|FIG_\d+|I\d+)\b/g, " ")
    .replace(/\b[A-Z][a-z]+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // The connector must still JOIN two non-empty word-groups after stripping. A dangling
  // connector left by a removed entity ("his two sons … and" → "his two sons and") does NOT
  // count, so an answer that merely names several entities is not flagged.
  if (/\S+\s+and\s+\S+/.test(stripped)) return "and";
  if (/[a-z],\s+[a-z]/i.test(stripped)) return ",";
  return null;
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

  // §3C "Objects and Elements" blocks + Level 3 proposition Q&A — the authored content layers.
  // Operating test: a Level-3 block must contain ONLY payload Q&A pairs (+ §3C entities); flag
  // every line that isn't one. We inspect BOTH question and answer sides, and FLAG (not skip)
  // cross_ref / inter-proposition-link lines and analytical meta-questions.
  const level3 = section(md, /##\s*4\.\s*Level 3[^\n]*/i);
  const objectsBlocks = [...md.matchAll(/\*\*3C\s*[—-]\s*Objects[^\n]*\*\*([\s\S]*?)(?=\n\*\*3D|\n###|\n##|$)/gi)].map((m) => m[1] ?? "").join("\n");

  const metaRes = (lex.meta_questions ?? []).map((p) => new RegExp(p, "i"));
  const linkRes = (lex.link_markers ?? []).map((m) => ({ m, re: new RegExp(`\\b${m}\\b`, "i") }));

  // Track the current Level-3 block so each finding's location names its proposition. Without this,
  // de-dup by (rule, location, match) would collapse every same-type finding in a map to ONE line
  // (e.g. 21 inline cross_refs → "1"), under-reporting the true inventory the sweep must clear.
  let block = "§3C";
  const lines = (objectsBlocks + "\n" + level3).split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Heading → switch block (e.g. "### Proposition 5 — Ruth 1:3 [Scene 2]" ⇒ "§4 Prop 5").
    const head = line.match(/^#{1,6}\s*Proposition\s+(\S+)/i);
    if (head) { block = `§4 Prop ${head[1]}`; continue; }

    // 1) Inter-proposition-link / cross_ref lines do not belong inline in a Level-3 block —
    //    they are FOR_MODEL structural fields. Flag and move on (one finding/line).
    const link = linkRes.find(({ re }) => re.test(line));
    if (link) {
      findings.push({ rule: "link_in_level3", tier: 1, location: block, match: link.m, context: line.slice(0, 90) });
      continue;
    }

    const { q, a } = qaParts(line);

    // 2) Question side — conditioning bleed, analytical meta-questions, forbidden vocab.
    if (q !== undefined) {
      const ql = ` ${q.toLowerCase()} `;
      const cond = lex.conditioning_qa.find((c) => ql.includes(` ${c.toLowerCase()} `));
      if (cond) findings.push({ rule: "conditioning_in_qa", tier: 1, location: `${block} · Q`, match: cond, context: q.slice(0, 90) });
      metaRes.forEach((re, i) => {
        if (re.test(q)) findings.push({ rule: "meta_question", tier: 2, location: `${block} · Q`, match: lex.meta_questions![i]!, context: q.slice(0, 90) });
      });
      findings.push(...scanProse(q, `${block} · Q`));
    }

    // 3) Answer side — compounds (entity-list-aware) + forbidden vocab / labels. The softer
    //    answer_labels apply HERE ONLY (a label is drift when it stands in for the act in an answer;
    //    the same word in a governed speech_act value or a §3C note is not in scope).
    if (a !== undefined) {
      const cm = compoundMarker(a);
      if (cm) findings.push({ rule: "compound", tier: 2, location: `${block} · A`, match: cm, context: a.slice(0, 90) });
      findings.push(...scanProse(a, `${block} · A`));
      const al = ` ${snake(a)} `;
      for (const label of lex.answer_labels ?? []) {
        if (al.includes(label.toLowerCase())) findings.push({ rule: "interpretive_label", tier: 2, location: `${block} · A`, match: label, context: a.trim().slice(0, 80) });
      }
    }

    // 4) Lines that are neither a question nor an answer (a §3C entry, or stray prose in §4):
    //    conditioning bleed on the whole line + scan §3C entry prose.
    if (q === undefined && a === undefined) {
      const ll = ` ${line.toLowerCase()} `;
      const cond = lex.conditioning_qa.find((c) => ll.includes(` ${c.toLowerCase()} `));
      if (cond) findings.push({ rule: "conditioning_in_qa", tier: 1, location: block === "§3C" ? "§3C entry" : block, match: cond, context: line.slice(0, 90) });
      findings.push(...scanProse(line, block === "§3C" ? "§3C entry" : block));
    }
  }
  return finalize(findings, file, "MEANING_MAP");
}

function finalize(findings: LintFinding[], file: string, artifact: string): LintReport {
  // de-dup identical (rule, location, match, context). Context is in the key so that distinct
  // lines sharing a rule+location+match — e.g. several inline cross_refs in one proposition, each a
  // separate relocation — are counted separately (the true inventory), while a genuine re-scan of
  // the exact same string (FOR_MODEL walkStrings) still collapses to one.
  const seen = new Set<string>();
  const uniq = findings.filter((f) => {
    const k = `${f.rule}|${f.location}|${f.match}|${f.context}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return recount({ file, artifact, findings: uniq, counts: { tier1: 0, tier2: 0, accepted: 0, byRule: {} }, ok: true });
}

/** (Re)compute a report's counts + ok flag from its findings. Accepted (signed-off) findings are
 *  tallied separately and excluded from the tier counts + the ok flag — they are not drift. */
function recount(report: LintReport): LintReport {
  const byRule: Record<string, number> = {};
  let tier1 = 0, tier2 = 0, accepted = 0;
  for (const f of report.findings) {
    if (f.accepted) { accepted++; continue; }
    byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
    if (f.tier === 1) tier1++; else tier2++;
  }
  return { ...report, counts: { tier1, tier2, accepted, byRule }, ok: tier1 + tier2 === 0 };
}
