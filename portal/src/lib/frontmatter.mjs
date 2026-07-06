import YAML from 'yaml';

// The vault notes are Obsidian markdown: a YAML frontmatter block, then the body.
// Obsidian wikilink values (`meaning-coordinates: [[P01-...-MEANING-COORDINATES]]`) happen to parse as
// nested single-element arrays in standard YAML; unwrap() folds them back to the
// bare note name so callers see plain strings.

function isWikilinkBox(v) {
  return (
    Array.isArray(v) && v.length === 1 &&
    Array.isArray(v[0]) && v[0].length === 1 &&
    (typeof v[0][0] === 'string' || typeof v[0][0] === 'number')
  );
}

function unwrap(v) {
  if (isWikilinkBox(v)) return String(v[0][0]);
  if (Array.isArray(v)) return v.map(unwrap);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, unwrap(val)]));
  }
  return v;
}

/**
 * Split an Obsidian note into { frontmatter, body }.
 * Throws (with the file path in the message) when the note has no frontmatter
 * or the frontmatter is not a YAML mapping — an artifact we cannot classify
 * must never slip past the approval gate by being unreadable.
 */
export function parseNote(raw, filePath = '(unknown file)') {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) {
    throw new Error(`${filePath}: no YAML frontmatter block — cannot determine artifact type/status`);
  }
  let fm;
  try {
    fm = YAML.parse(m[1]);
  } catch (e) {
    throw new Error(`${filePath}: frontmatter is not valid YAML — ${e.message}`);
  }
  if (!fm || typeof fm !== 'object' || Array.isArray(fm)) {
    throw new Error(`${filePath}: frontmatter is not a key/value mapping`);
  }
  return { frontmatter: unwrap(fm), body: raw.slice(m[0].length) };
}

/** Extract the first fenced ```json block from a note body (MEANING_COORDINATES / compilation log). */
export function extractFencedJson(body, filePath = '(unknown file)') {
  const m = /^```json\s*\r?\n([\s\S]*?)\r?\n```\s*$/m.exec(body);
  if (!m) {
    throw new Error(`${filePath}: no fenced \`\`\`json block found`);
  }
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`${filePath}: fenced JSON does not parse — ${e.message}`);
  }
}
