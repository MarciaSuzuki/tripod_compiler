import { readFileSync } from "node:fs";

/**
 * Reader for a pilot-2 Meaning Map note (`pericopes/P##-….md`): YAML frontmatter + the
 * five-section prose body (Metadata, L1 movement, L2 scenes, L3 propositions, Flags).
 *
 * It extracts the *machine-readable* structure — entity wikilink codes, presence, scene
 * verse-ranges, proposition anchors/scene-links, cross-refs, and the per-proposition
 * concept/figure flags from Section 5. The prose (roles, Q/A, tone) is captured verbatim as
 * hints; turning it into controlled-vocabulary tokens is judgment (the compiler leaves those
 * as gaps). See `src/compiler/skeleton.ts`.
 */
export class MeaningMapError extends Error {}

export interface MMEntity {
  /** registry code (B2, PL1, PL_HA_ARETZ, TM_PERIOD_OF_JUDGES, …) or null when the MM gives no wikilink. */
  code: string | null;
  /** the raw entry label line (Hebrew / gloss). */
  label: string;
  /** beings only: PRESENT | REFERENCED | PRESENT_BECOMES_DECEASED | … */
  presence?: string | null;
  /** the prose "Role:"/"Function in scene:" line — a hint for the judgment token. */
  roleProse?: string | null;
}

export interface MMScene {
  sceneId: string;
  title: string;
  verseRange: string | null;
  beings: MMEntity[];
  places: MMEntity[];
  objects: MMEntity[];
  times: MMEntity[] | null; // null when the MM says "None"
  significantAbsence: string | null;
  communicativePurpose: string | null;
  /** B-codes that appear in the scene's prose but are NOT in its 3A list — the FOR_MODEL often
   *  adds these as REFERENCED. A judgment gap, surfaced by the compiler. */
  beingsInProseOnly: string[];
}

export interface MMProposition {
  propId: string; // MM granularity, e.g. MM_P1
  verseAnchor: string | null;
  sceneLink: string | null; // S1…
  qa: string[]; // raw Q/A lines (hints for event_specific_slots)
  crossRef: string | null;
  cbFlags: string[];
  figFlags: string[];
}

export interface MeaningMap {
  path: string;
  pericope: string | null;
  title: string | null;
  bcv: string | null;
  chapter: string | null;
  genreGroup: string | null;
  genre: string | null;
  register: string | null;
  /** Section-2 prose per Level-1 axis group (the source spans the L1 element tokens derive from). */
  level1Prose: { arc: string | null; context: string | null; tonePace: string | null; commFunc: string | null };
  scenes: MMScene[];
  propositions: MMProposition[];
}

/** Registry code = the wikilink target up to the first hyphen (codes never contain hyphens). */
function codeFromWikilink(target: string): string {
  const i = target.indexOf("-");
  return i === -1 ? target : target.slice(0, i);
}
const firstWikilink = (line: string): string | null => line.match(/\[\[([^\]]+)\]\]/)?.[1] ?? null;
/** Normalize a presence transition `X → Y` to `X_BECOMES_Y` faithfully (e.g. PRESENT → DECEASED →
 *  PRESENT_BECOMES_DECEASED; PRESENT → DEPARTS → PRESENT_BECOMES_DEPARTS) — never assume "deceased". */
const normPresence = (p: string): string => {
  const m = p.match(/^(.*?)\s*(?:→|->)\s*(.*)$/);
  return m ? `${m[1]} BECOMES ${m[2]}`.trim().toUpperCase().replace(/\s+/g, "_") : p.trim();
};

function parseFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm: Record<string, string> = {};
  if (!m) return { fm, body: raw };
  for (const line of (m[1] ?? "").split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.+?)\s*$/);
    if (kv) fm[kv[1]!] = (kv[2] ?? "").replace(/^["']|["']$/g, "");
  }
  return { fm, body: raw.slice(m[0].length) };
}

/** Split a markdown body into [heading, lines] groups at a given ATX level (## or ###). */
function splitSections(lines: string[], level: 2 | 3): Array<{ heading: string; body: string[] }> {
  const marker = "#".repeat(level) + " ";
  const out: Array<{ heading: string; body: string[] }> = [];
  let cur: { heading: string; body: string[] } | null = null;
  for (const line of lines) {
    if (line.startsWith(marker) && !line.startsWith(marker + "#")) {
      cur = { heading: line.slice(marker.length).trim(), body: [] };
      out.push(cur);
    } else if (cur) cur.body.push(line);
  }
  return out;
}

/** Parse an entity sub-block (3A/3B/3C/3D). Wikilink-led lines start entries; `- Role/…:` and `- Presence:` attach. */
function parseEntities(blockLines: string[]): MMEntity[] {
  const entries: MMEntity[] = [];
  let cur: MMEntity | null = null;
  for (const raw of blockLines) {
    const line = raw.trim();
    if (!line) continue;
    const presence = line.match(/^-\s*Presence:\s*(.+)$/i);
    const role = line.match(/^-\s*(?:Role|Function(?: in scene)?):\s*(.+)$/i);
    if (presence && cur) {
      cur.presence = normPresence(presence[1]!);
      continue;
    }
    if (role && cur) {
      cur.roleProse = role[1]!.trim();
      continue;
    }
    if (line.startsWith("-")) continue; // other bullet (Relationship/Type/Meaning/Signals/…)
    if (line.startsWith("None") || line.startsWith("- None")) continue;
    // a new entry line (wikilink-led or bare Hebrew/gloss)
    const wl = firstWikilink(line);
    cur = { code: wl ? codeFromWikilink(wl) : null, label: line };
    entries.push(cur);
  }
  return entries;
}

function parseScene(heading: string, body: string[], chapter: string | null): MMScene {
  // Heading range forms: the verse-only "(v.1–2)" (chapter from the pericope bcv — the Ruth
  // idiom; a pericope inside one chapter), and the chapter-qualified "(1:4–6)" / "(1:17–2:1)"
  // (required once a pericope — or a single scene — crosses a chapter; first hit: Jonah J02 S5).
  // Where English and Hebrew versification diverge (Jonah 2; Psalms superscriptions), the heading
  // adds an explicit "; Heb c:v–v" qualifier — the human-facing range stays English, but the
  // MACHINE range (verse_range, which coverage reconciles against the Hebrew-versified BHSA
  // packet) is taken from the Heb qualifier when present.
  const hm = heading.match(
    /Scene\s+(\d+)\s*[—–-]\s*(.*?)\s*\(\s*(?:vv?\.?\s*(\d+)(?:\s*[–-]\s*(\d+))?|(\d+):(\d+)(?:\s*[–-]\s*(?:(\d+):)?(\d+))?)\s*(?:;\s*Heb\.?\s+(\d+):(\d+)(?:\s*[–-]\s*(?:(\d+):)?(\d+))?)?\s*\)/i,
  );
  const idx = hm ? Number(hm[1]) : NaN;
  const sceneId = Number.isFinite(idx) ? `S${idx}` : "S?";
  const title = hm ? hm[2]!.trim() : heading;
  let verseRange: string | null = null;
  if (hm && hm[9]) {
    // explicit Hebrew override: (…; Heb c:v), (…; Heb c:v–v), (…; Heb c:v–c:v)
    verseRange = `${hm[9]}:${hm[10]}` + (hm[12] ? `-${hm[11] ? `${hm[11]}:` : ""}${hm[12]}` : "");
  } else if (hm && hm[5]) {
    // chapter-qualified: (c:v), (c:v–v), (c:v–c:v)
    verseRange = `${hm[5]}:${hm[6]}` + (hm[8] ? `-${hm[7] ? `${hm[7]}:` : ""}${hm[8]}` : "");
  } else if (hm && hm[3] && chapter) {
    verseRange = `${chapter}:${hm[3]}` + (hm[4] ? `-${hm[4]}` : "");
  }

  // sub-blocks keyed by their bold marker
  const blocks: Record<string, string[]> = {};
  let key: string | null = null;
  for (const line of body) {
    const bm = line.match(/^\*\*(3[A-F]\s*[—–-].*?|Significant Absence)\*\*\s*$/);
    if (bm) {
      key = bm[1]!.replace(/\s+/g, " ").trim();
      blocks[key] = [];
    } else if (key) blocks[key]!.push(line);
  }
  const block = (prefix: string): string[] => {
    const k = Object.keys(blocks).find((x) => x.startsWith(prefix));
    return k ? blocks[k]! : [];
  };
  const prose = (lines: string[]): string | null => {
    const t = lines.map((l) => l.trim()).filter(Boolean).join(" ").trim();
    return t || null;
  };
  const timesBlock = block("3D");
  const timesNone = timesBlock.some((l) => /^-?\s*None/i.test(l.trim()));
  const beings = parseEntities(block("3A"));

  // beings named anywhere in the scene's prose but not in the 3A list (likely REFERENCED in the FOR_MODEL)
  const listed = new Set(beings.map((b) => b.code).filter(Boolean));
  const mentioned = new Set<string>();
  for (const line of body) for (const m of line.matchAll(/\[\[(B\d+)[^\]]*\]\]/g)) mentioned.add(m[1]!);
  const beingsInProseOnly = [...mentioned].filter((c) => !listed.has(c)).sort();

  return {
    sceneId,
    title,
    verseRange,
    beings,
    places: parseEntities(block("3B")),
    objects: parseEntities(block("3C")),
    times: timesNone ? null : parseEntities(timesBlock),
    significantAbsence: prose(block("Significant Absence")),
    communicativePurpose: prose(block("3F")),
    beingsInProseOnly,
  };
}

function parseProposition(heading: string, body: string[]): MMProposition {
  // The anchor may carry a leading book name ("Ruth 1:1", "Jonah 1:4") — strip ANY alphabetic book
  // word, book-generally (the old form stripped only "Ruth", so a Jonah map's anchors captured the
  // word "Jonah" instead of the verse — visible in the J01 skeleton's verse_anchor fields).
  const hm = heading.match(/Proposition\s+(\d+)\s*[—–-]\s*(?:[A-Za-z]+\s+)?(\d[\w:]*)?\s*(?:\[Scene\s+(\d+)\])?/i);
  const idx = hm ? Number(hm[1]) : NaN;
  const qa: string[] = [];
  let crossRef: string | null = null;
  for (const raw of body) {
    const line = raw.trim();
    if (!line) continue;
    const cr = line.match(/cross_ref:\**\s*(.+)$/i);
    if (cr) crossRef = cr[1]!.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1").trim();
    else if (/^-\s*\*\*Q/i.test(line) || /^-\s*Q/i.test(line)) qa.push(line.replace(/\*\*/g, "").replace(/^-\s*/, ""));
  }
  return {
    propId: `MM_P${Number.isFinite(idx) ? idx : "?"}`,
    verseAnchor: hm?.[2]?.replace(/^[A-Za-z]+\s+/, "") ?? null,
    sceneLink: hm?.[3] ? `S${hm[3]}` : null,
    qa,
    crossRef,
    cbFlags: [],
    figFlags: [],
  };
}

/** Attach Section-5 flags to propositions by the MM proposition numbers they cite. */
function applyFlags(flagsBody: string[], props: MMProposition[]): void {
  for (const raw of flagsBody) {
    const line = raw.trim();
    const wl = firstWikilink(line);
    if (!wl) continue;
    const code = codeFromWikilink(wl);
    const nums = [...line.matchAll(/Proposition[s]?\s+([\d,\s and]+)/gi)].flatMap((m) =>
      (m[1] ?? "").split(/[,\s]+|and/).map((s) => s.trim()).filter((s) => /^\d+$/.test(s)),
    );
    for (const n of nums) {
      const p = props.find((x) => x.propId === `MM_P${n}`);
      if (!p) continue;
      if (code.startsWith("CB_") && !p.cbFlags.includes(code)) p.cbFlags.push(code);
      if (code.startsWith("FIG_") && !p.figFlags.includes(code)) p.figFlags.push(code);
    }
  }
}

export function readMeaningMap(path: string): MeaningMap {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    throw new MeaningMapError(`cannot read ${path}: ${(e as Error).message}`);
  }
  const { fm, body } = parseFrontmatter(raw);
  const bcv = fm["bcv"] ?? null;
  const chapter = bcv?.match(/(\d+):/)?.[1] ?? null;

  const top = splitSections(body.split(/\r?\n/), 2);
  const section = (n: string) => top.find((s) => s.heading.startsWith(n))?.body ?? [];

  const scenes = splitSections(section("3."), 3).map((s) => parseScene(s.heading, s.body, chapter));
  const propositions = splitSections(section("4."), 3).map((s) => parseProposition(s.heading, s.body));
  applyFlags(section("5."), propositions);

  // Section-2 prose per L1 axis group (the spans the L1 element tokens derive from).
  const l2subs = splitSections(section("2."), 3);
  const subProse = (prefix: string): string | null => {
    const b = l2subs.find((s) => s.heading.startsWith(prefix))?.body ?? [];
    const t = b.map((l) => l.trim()).filter(Boolean).join(" ").trim();
    return t || null;
  };

  return {
    path,
    pericope: fm["pericope-num"] ?? null,
    title: fm["pericope-title"] ?? null,
    bcv,
    chapter,
    genreGroup: fm["genre-group"] ?? null,
    genre: fm["genre"] ?? null,
    register: fm["register"] ?? null,
    level1Prose: {
      arc: subProse("2.1"),
      context: subProse("2.2"),
      tonePace: subProse("2.3"),
      commFunc: subProse("2.4"),
    },
    scenes,
    propositions,
  };
}
