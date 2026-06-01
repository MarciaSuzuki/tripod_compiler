import { join } from "node:path";
import { SPEC_DIR, loadSpecJson } from "../spec/load.js";
import type { LintException } from "../engine/lint.js";

/**
 * Readers + types for the frozen, pinned BHSA artifacts the coverage reconciliation consumes
 * (docs/COVERAGE.md, docs/SOURCE_AND_SCALING.md). Produced offline by `extractor/*.py`:
 *   - the source linguistic packet (`_spec/source/<book>/<P>.json`) — the R set.
 *   - the entity alias table (`_spec/registry/<book>.aliases.json`) — entity↔surface bridge.
 */

export type CoarseKind = "PERSON" | "PLACE" | "THING" | "TIME" | "INSTITUTION" | "UNKNOWN";
export type Concern = "explicit" | "implied_subject" | "minor";

/** One BHSA referring expression (a row of R). */
export interface Referent {
  ref_id: string;
  verse: string; // "1:1"
  half_verse: string; // "1:1a"
  surface: string; // pointed Hebrew
  lex: string;
  gloss: string;
  pos: string;
  referent_class: string; // proper_noun | common_noun | participle_substantival | pronoun | suffix | implied_subject | adjective_substantival
  kind_candidates: CoarseKind[];
  referent_kind: CoarseKind;
  nametype: string | null;
  person: string | null;
  number: string | null;
  gender: string | null;
  is_implied_subject: boolean;
  concern: Concern;
  likely_impersonal?: boolean;
}

export interface SourcePacket {
  schema: string;
  pericope: string;
  bcv: string;
  bhsa_version: string;
  extractor_version: string;
  book: string;
  referents: Referent[];
  verses: { verse: string; text: string; words: Record<string, unknown>[] }[];
  place_aliases: Record<string, unknown>;
  counts: Record<string, unknown>;
}

export interface AliasEntry {
  kind: CoarseKind;
  english: string | null;
  hebrew: string;
  hebrew_cons: string;
  /** consonantal skeletons of any surface `hebrew_aliases` (e.g. הָאָרֶץ/אֶרֶץ for PL_LAND_OF_JUDAH). */
  hebrew_cons_aliases?: string[];
  referential_forms: string[];
  gender: string | null;
}

export interface AliasTable {
  book: string;
  entities: Record<string, AliasEntry>;
}

/** Load a pinned source packet by its path relative to `_spec/` (e.g. "source/ruth/P01.json"). */
export function loadSourcePacket(specRelPath: string): SourcePacket {
  return loadSpecJson<SourcePacket>(specRelPath);
}

/** Convention path for a book/pericope packet. */
export function sourcePacketPath(book: string, pericope: string): string {
  return join("source", book.toLowerCase(), `${pericope}.json`);
}

export function loadAliasTable(book = "ruth"): AliasTable {
  return loadSpecJson<AliasTable>(join("registry", `${book.toLowerCase()}.aliases.json`));
}

/** A reviewer-signed-off coverage exception: downgrades a matched finding from BLOCK to ACCEPTED. */
export interface CoverageException {
  pericope: string;
  kind: "UNMAPPED_SOURCE" | "UNANCHORED_ENTITY";
  gloss?: string; // UNMAPPED_SOURCE match key
  verse?: string; // UNMAPPED_SOURCE match key (prefix, e.g. "2:12")
  entity_id?: string; // UNANCHORED_ENTITY match key
  reason: string;
  note?: string;
  accepted_by?: string;
  accepted_on?: string;
  sc_ref?: string;
}

export interface CoverageExceptions {
  book: string;
  exceptions: CoverageException[];
}

/** Load the pinned coverage-exceptions ledger (empty list if absent). */
export function loadCoverageExceptions(): CoverageException[] {
  try {
    return loadSpecJson<CoverageExceptions>("coverage-exceptions.json").exceptions ?? [];
  } catch {
    return [];
  }
}

/** Load the pinned lint-exceptions ledger (reviewer sign-offs on lint findings; empty list if absent). */
export function loadLintExceptions(): LintException[] {
  try {
    return loadSpecJson<{ exceptions: LintException[] }>("lint-exceptions.json").exceptions ?? [];
  } catch {
    return [];
  }
}

export { SPEC_DIR };
