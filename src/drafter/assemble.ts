import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileSkeleton, type CompileResult } from "../compiler/skeleton.js";
import { readMeaningMap, type MeaningMap } from "../reader/meaning-map.js";
import { SPEC_DIR } from "../spec/load.js";
import { approvedAxesDigest, closedListsDigest, registryDigest } from "./digest.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(ROOT, "fixtures");

/** The blessed structural reference pair shown to the drafter (map beside its gold MEANING_COORDINATES). */
const WORKED_MAP = join(FIXTURES, "meaning-map", "P01-Ruth-1-1-5.md");
const WORKED_MC = join(FIXTURES, "meaning-coordinates", "P01-Ruth-1-1-5-MEANING-COORDINATES.md");

export interface DraftRequest {
  /** the pinned drafter system prompt, verbatim */
  system: string;
  /** byte-stable context blocks shared across calls (cache prefix): spec digests · worked example · book registry */
  stableBlocks: string[];
  /** per-pericope blocks: the map note · the skeleton + gap report */
  variableBlocks: string[];
  mm: MeaningMap;
  compile: CompileResult;
  book: string;
}

export function sha256OfString(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** ~bytes per token for this corpus (English prose + UPPER_SNAKE JSON); used only when no API key is present. */
export function estimateTokensFromBytes(bytes: number): number {
  return Math.round(bytes / 3.7);
}

export function bookOf(mm: MeaningMap): string {
  return ((mm.bcv ?? "").split(/\s+/)[0] || "ruth").toLowerCase();
}

/**
 * Assemble the full drafter request for one pericope. Deterministic: every block renders from
 * pinned spec files and canon fixtures in fixed order — same inputs, byte-identical request
 * (the Phase-A reproducibility guarantee, and the prompt-cache prefix).
 */
export function assembleDraftRequest(mmPath: string): DraftRequest {
  const mm = readMeaningMap(mmPath);
  const compile = compileSkeleton(mm);
  const book = bookOf(mm);

  const system = readFileSync(join(SPEC_DIR, "drafter", "mc-drafter-prompt.md"), "utf8");

  const worked =
    "## WORKED EXAMPLE — the blessed P01 pair (structural reference: shape, slot-naming, token style)\n\n" +
    "### P01 Meaning Map\n\n" +
    readFileSync(WORKED_MAP, "utf8") +
    "\n\n### P01 gold MEANING_COORDINATES\n\n" +
    readFileSync(WORKED_MC, "utf8");

  const stableBlocks = [closedListsDigest(), approvedAxesDigest(), worked, registryDigest(book)];

  const mapBlock = `## THE PERICOPE — approved Meaning Map (${mm.pericope ?? "?"})\n\n` + readFileSync(mmPath, "utf8");
  const gapBlock =
    `## THE SKELETON + GAP REPORT (${compile.stats.gaps} gaps — fill exactly these locations)\n\n` +
    "```json\n" +
    JSON.stringify({ skeleton: compile.skeleton, gaps: compile.gaps }, null, 1) +
    "\n```";

  return { system, stableBlocks, variableBlocks: [mapBlock, gapBlock], mm, compile, book };
}

/** Flat rendering of the whole request (dry-run artifact; also the reproducibility hash input). */
export function renderRequest(req: DraftRequest): string {
  return ["### SYSTEM", req.system, ...req.stableBlocks, ...req.variableBlocks].join("\n\n---\n\n");
}

export interface RequestStats {
  systemBytes: number;
  stableBytes: number;
  variableBytes: number;
  totalBytes: number;
  estTokens: number;
  sha256: string;
  gaps: number;
}

export function requestStats(req: DraftRequest): RequestStats {
  const systemBytes = Buffer.byteLength(req.system);
  const stableBytes = req.stableBlocks.reduce((n, b) => n + Buffer.byteLength(b), 0);
  const variableBytes = req.variableBlocks.reduce((n, b) => n + Buffer.byteLength(b), 0);
  const totalBytes = systemBytes + stableBytes + variableBytes;
  return {
    systemBytes,
    stableBytes,
    variableBytes,
    totalBytes,
    estTokens: estimateTokensFromBytes(totalBytes),
    sha256: sha256OfString(renderRequest(req)),
    gaps: req.compile.stats.gaps,
  };
}
