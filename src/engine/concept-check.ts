/**
 * SC-0037 — the cross-canon consistency check for the GLOBAL Concept Bank + Figure Registry.
 *
 * The Concept Bank and Figure Registry are canon-wide: one code per concept/figure across the whole
 * Bible, so the Facilitator anchors a concept (hesed, the presence of God, …) consistently everywhere.
 * Two failure modes this guards (a sibling of `id-check`):
 *   1. UNREGISTERED — a map uses a `CB_`/`FIG_` code absent from the global bank. (Reference-integrity:
 *      `tripod id-check` already enforces this against the global registry.)
 *   2. SILENT DUPLICATE — a NEW book introduces a concept/figure that is really one the bank already has
 *      under another book's code, but minted as a fresh code. This is the **new-book guard**: when a book
 *      introduces an entry, surface the closest existing entry from another book as a *suggested reuse*.
 *      Diagnostic only — it SUGGESTS; the human (Marcia) rules reuse-vs-genuinely-distinct.
 */
import { type CodeRegistry, type CodeRegistryEntry } from "../reader/source-packet.js";

const STOP = new Set(["of", "the", "a", "an", "and", "in", "to", "from", "at", "on", "for", "with"]);

/** name_slug + aliases → a normalized token set (lowercased, hyphen/underscore-split, stopwords dropped). */
function tokenize(entry: CodeRegistryEntry): Set<string> {
  const out = new Set<string>();
  for (const s of [entry.name_slug, ...(entry.aliases ?? [])]) {
    for (const t of String(s).toLowerCase().split(/[-_\s]+/)) {
      if (t.length > 1 && !STOP.has(t)) out.add(t);
    }
  }
  return out;
}

/** Jaccard similarity of two token sets (0..1). */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / new Set([...a, ...b]).size;
}

const booksOf = (e: CodeRegistryEntry): string[] => (e.appears_in ?? []).map((b) => b.toUpperCase());

export interface ReuseSuggestion {
  candidate: string; // the new book's code
  candidateSlug: string;
  match: string; // an existing code that resembles it
  matchSlug: string;
  matchBooks: string[];
  score: number; // 0..1, rounded to 2dp
}

/**
 * For a `book`, suggest reuses: each entry **introduced by** `book` (appears only in it) is compared to
 * every entry that exists in some **other** book; matches at/above `threshold` are surfaced (highest first).
 * Default threshold 0.34 keeps genuinely-distinct concepts quiet (e.g. "Before-the-Face-of-YHWH" vs
 * "Hand-of-YHWH" ≈ 0.25) while catching real near-duplicates (a shared head noun ⇒ ≥ 0.5).
 */
export function suggestReuse(reg: CodeRegistry, book: string, threshold = 0.34): ReuseSuggestion[] {
  const B = book.toUpperCase();
  const entries = Object.values(reg.entries);
  const introduced = entries.filter((e) => booksOf(e).length > 0 && booksOf(e).every((bk) => bk === B));
  const elsewhere = entries.filter((e) => booksOf(e).some((bk) => bk !== B));
  const out: ReuseSuggestion[] = [];
  for (const c of introduced) {
    const tc = tokenize(c);
    for (const o of elsewhere) {
      if (o.code === c.code) continue;
      const s = jaccard(tc, tokenize(o));
      if (s >= threshold) {
        out.push({
          candidate: c.code, candidateSlug: c.name_slug,
          match: o.code, matchSlug: o.name_slug, matchBooks: booksOf(o),
          score: Math.round(s * 100) / 100,
        });
      }
    }
  }
  return out.sort((a, b) => b.score - a.score || a.candidate.localeCompare(b.candidate));
}
