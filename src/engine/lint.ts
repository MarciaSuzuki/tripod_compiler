import { loadSpecJson, loadValidationRules } from "../spec/load.js";
import { loadApprovedEnumerations, loadQuarantinedVocabulary } from "../spec/enumerations.js";

/**
 * The Level-3 lint (docs/COVERAGE.md stack: legal · complete · **atomic-bare-plain** · true).
 * A 4th deterministic verifier beside validate/coverage. It flags, in the *content* layers — Level 3
 * propositions and §3C — the four drift classes from `_methodology/level3and3Ccontentdiscipline.md`:
 *   - forbidden grammatical / linguistic vocabulary (R4) — whole-word, in prose/values (slot KEY names
 *     are guarded separately — see slot-NAME role vocabulary below),
 *   - interpretive-label patterns (R3) — "image-rhyme", "triplet", "speech-act of", …,
 *   - conditioning-in-Q&A (R5) — "Register?/Self-form?/Forward-link?" lines (meaning map),
 *   - compound / non-atomic answers (R2) — ';', ' and ' in a Q&A answer,
 *   - §3C that is not an entity (R1) — an object that is really an event / framing / literary pattern,
 *   - slot-NAME role vocabulary (SC-0070) — an event_specific_slots KEY name carrying grammatical/thematic-role
 *     vocabulary (agent/recipient/subject/…), the WEIRD-priming the method bans; ess-scoped, allow-lists speaker/addressee.
 *   - value-SHAPE prose (SC-0073) — a sentence-shaped UPPER_SNAKE slot VALUE in event_specific_slots: the
 *     value analogue of the slot-name guard, closing the post-Jonah sentence-token triage. Membership-exempt
 *     first (approved-enum/closed-list/code/referential-family/kept-form/4-keeps/preserve-clause), THEN a
 *     ≥N-token shape test on the remainder; the now-clean seed can't drift back into prose.
 * It SURFACES drift; the human judges (and relocates insight, never deletes it).
 */

export type LintRule =
  | "forbidden_vocabulary"
  | "interpretive_label"
  | "conditioning_in_qa"
  | "compound"
  | "section_3c_not_entity"
  | "meta_question"
  | "link_in_level3"
  | "l3_free_text"
  | "slot_name_role_vocab"
  | "value_shape_prose";

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
  // SC-0070: forbidden grammatical/thematic-role TOKENS in event_specific_slots KEY names (the slot-name
  // guard), and the allow-list of fundamental communicative-event roles exempted from it.
  forbidden_slot_name_tokens?: string[];
  slot_name_allow?: string[];
  // SC-0073: the value-SHAPE prose guard's parameters. min_tokens = the underscore-token threshold above
  // which a non-exempt UPPER_SNAKE ess VALUE is sentence-shaped (BLOCK). The other three are the
  // guard-specific allow-lists (the membership exemptions E1/E2/E3/E7 derive live from the pinned
  // approved-enumerations / validation-rules closed_lists / quarantined-vocabulary and are NOT re-listed
  // here, so the allow-list can never drift from canon).
  value_shape_prose_min_tokens?: number;
  value_shape_kept_form_slots?: string[]; // E5: slot KEYS whose values are kept structural forms
  value_shape_referential_address_slots?: string[]; // E4: the R1 address-form slot KEYS (besides *referential_form)
  value_shape_explicit_keeps?: string[]; // E6: the 4 ruled-KEEP VALUES (3 sit in non-kept-form slots)
}

let _lex: Lexicon | undefined;
function lexicon(): Lexicon {
  return (_lex ??= loadSpecJson<Lexicon>("lint-lexicon.json"));
}

/**
 * SC-0073 value-shape guard — the membership exemptions that derive LIVE from the pinned spec files
 * (so they can never drift from canon, unlike a hand-copied list):
 *   - approved : every approved-enumerations value, any axis (E1 — incl. the governed action verbs)
 *   - closed   : every validation-rules closed_list value (E2 — genre/register/speech_act/…)
 *   - quarantined : every quarantined-vocabulary value (E7 — the 2 Ruth 2:13 preserve_form clauses)
 *   - code     : the L3 registry ID namespaces (E3 — B/PL/O/TM/TH/CB/FIG/I/D)
 * The slot-key exemptions (E4 referential family, E5 kept-form slots) and the value-keep list (E6) are
 * guard-specific and live in lint-lexicon.json. Memoized like the lexicon.
 */
interface ValueShapeExemptSets { approved: Set<string>; closed: Set<string>; quarantined: Set<string>; code: RegExp; }
let _vsExempt: ValueShapeExemptSets | undefined;
function valueShapeExemptSets(): ValueShapeExemptSets {
  if (_vsExempt) return _vsExempt;
  const approved = new Set<string>();
  for (const vals of Object.values(loadApprovedEnumerations().axes ?? {})) for (const e of vals) approved.add(e.value);
  const closed = new Set<string>();
  for (const [k, v] of Object.entries(loadValidationRules().closed_lists)) if (!k.startsWith("FORBIDDEN") && Array.isArray(v)) for (const s of v) closed.add(s);
  const quarantined = new Set<string>();
  for (const vals of Object.values(loadQuarantinedVocabulary().axes ?? {})) for (const e of vals) quarantined.add(e.value);
  return (_vsExempt = { approved, closed, quarantined, code: /^(?:B\d|PL\d|PL_|O\d|O_|TM_|TH_|CB_|FIG_|I\d|D\d)/ });
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

  // SC-0030 (Level-3 purity): guard the vector that let the fidelity `meaning` field into the supervision
  // target. Flag a `meaning` key, or any prose-shaped value (a space AND a lowercase letter — natural
  // language, not an UPPER_SNAKE token or an id) inside a Level-3 proposition's event_specific_slots.
  // Sentence-shaped UPPER_SNAKE slot VALUES are a SEPARATE finding (the post-Jonah triage) and are
  // deliberately NOT flagged here — the lint can't cleanly draw that line yet. See tripod-sentence-token-triage.
  const isL3Prose = (s: string) => /\s/.test(s) && /[a-z]/.test(s);
  for (const prop of json.level_3_propositions ?? []) {
    const walkL3 = (val: unknown, path: string): void => {
      if (Array.isArray(val)) val.forEach((v, i) => walkL3(v, `${path}/${i}`));
      else if (val && typeof val === "object")
        for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
          if (k === "meaning") { findings.push({ rule: "l3_free_text", tier: 1, location: `${prop.prop_id}.${path}/meaning`, match: "meaning", context: String(v).slice(0, 90) }); continue; }
          walkL3(v, `${path}/${k}`);
        }
      else if (typeof val === "string" && isL3Prose(val))
        findings.push({ rule: "l3_free_text", tier: 1, location: `${prop.prop_id}.${path}`, match: val.slice(0, 40), context: val.slice(0, 90) });
    };
    walkL3(prop?.event_specific_slots, "event_specific_slots");
  }

  // SC-0070: the slot-NAME role-vocabulary guard. scanProse (R4) runs on prose/values only, so slot KEY
  // names carrying banned grammatical/thematic-role vocabulary slipped through with lint green (Marcia's
  // catch). Walk every event_specific_slots key (incl. nested *_components), token-split on "_", and BLOCK
  // any key whose tokens include a banned role term. Allow-list the fundamental communicative roles
  // (speaker/addressee). Scoped to event_specific_slots ONLY — never the L2 objects_in_scene/object_id namespace.
  {
    const lex = lexicon();
    const banned = new Set((lex.forbidden_slot_name_tokens ?? []).map((t) => t.toLowerCase()));
    const allow = new Set((lex.slot_name_allow ?? []).map((t) => t.toLowerCase()));
    if (banned.size) {
      for (const prop of json.level_3_propositions ?? []) {
        const walkKeys = (val: unknown, path: string): void => {
          if (Array.isArray(val)) val.forEach((v, i) => walkKeys(v, `${path}/${i}`));
          else if (val && typeof val === "object")
            for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
              if (!allow.has(k.toLowerCase())) {
                const tok = k.toLowerCase().split("_").find((t) => banned.has(t));
                if (tok) findings.push({ rule: "slot_name_role_vocab", tier: 1, location: `${prop.prop_id}.${path}/${k}`, match: k, context: `slot name '${k}' carries role token '${tok}'` });
              }
              walkKeys(v, `${path}/${k}`);
            }
        };
        walkKeys(prop?.event_specific_slots, "event_specific_slots");
      }
    }
  }

  // SC-0073: the value-SHAPE prose guard (the value analogue of SC-0070; closes the sentence-token triage).
  // A sentence-shaped UPPER_SNAKE VALUE in event_specific_slots is prose-in-disguise (e.g.
  // WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE). Length alone can't separate it from
  // settled long vocabulary (DIRECTS_HEARER_TO_DO, HA_ISH_THE_MAN, SIX_STEP_LADDER_…), so we EXEMPT BY
  // MEMBERSHIP FIRST, then apply a ≥N-token shape test to the remainder. Post-SC-0072 the non-exempt
  // remainder has 0 values of ≥4 tokens (calibration: docs/SC-0073-VALUE-SHAPE-GUARD-SHEET.md §4), so the
  // guard is silent on the clean corpus while still BLOCKing a re-introduced clause. ess-scoped, BLOCK.
  {
    const lex = lexicon();
    const minTokens = lex.value_shape_prose_min_tokens ?? 4;
    const keptFormSlots = new Set(lex.value_shape_kept_form_slots ?? []);
    const addressSlots = new Set(lex.value_shape_referential_address_slots ?? []);
    const explicitKeeps = new Set(lex.value_shape_explicit_keeps ?? []);
    if (minTokens > 0) {
      const ex = valueShapeExemptSets(); // E1/E2/E3/E7 — derived live from the pinned spec files
      const isMultiwordUpperSnake = (s: string) => /^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(s);
      // E4: the referential-form family is keyed off the slot KEY (a descriptive referring expression),
      // matching validate's axisClass: any key ending referential_form / referential_form_at_verse, plus
      // the ruled R1 address slots (address_form / divine_address_form / …).
      const isReferentialKey = (k: string) =>
        k.endsWith("referential_form") || k.endsWith("referential_form_at_verse") || addressSlots.has(k);
      const exempt = (key: string, val: string): boolean =>
        ex.code.test(val) || ex.approved.has(val) || ex.closed.has(val) || ex.quarantined.has(val) ||
        explicitKeeps.has(val) || isReferentialKey(key) || keptFormSlots.has(key);
      for (const prop of json.level_3_propositions ?? []) {
        // walk every ess value (incl. nested *_components), tracking the value's immediate slot KEY
        const walkVals = (node: unknown, key: string, path: string): void => {
          if (typeof node === "string") {
            if (isMultiwordUpperSnake(node) && !exempt(key, node)) {
              const n = node.split("_").length;
              if (n >= minTokens)
                findings.push({ rule: "value_shape_prose", tier: 1, location: `${prop.prop_id}.${path}`, match: node, context: `slot '${key}' value is sentence-shaped (${n} tokens)` });
            }
          } else if (Array.isArray(node)) node.forEach((v, i) => walkVals(v, key, `${path}[${i}]`));
          else if (node && typeof node === "object")
            for (const [k, v] of Object.entries(node as Record<string, unknown>)) walkVals(v, k, `${path}/${k}`);
        };
        walkVals(prop?.event_specific_slots, "event_specific_slots", "event_specific_slots");
        // SC-0078: the proposition-level `status` (realis modality) is a sibling of event_specific_slots,
        // so the ess walk above never reaches it — feed it through the same shape+exemption logic so a
        // prose-shaped status (e.g. CONTENT_THAT_THE_KING_GRANTED_LEAVE) BLOCKs at the proposition level too
        // (component-level status rides inside ess and is already covered). The 6 seed values are 1 token →
        // below the ≥4-token line → never fire.
        walkVals(prop?.status, "status", "status");
      }
    }
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
