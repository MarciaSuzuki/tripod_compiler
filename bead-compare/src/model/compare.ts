import { alignClusters } from "./align";
import { FrameMapper, carryComments } from "./carry";
import { groupClusters } from "./cluster";
import { buildRegions, computeSummary } from "./regions";
import { sameCodebook } from "./tape";
import type {
  Alignment,
  CarriedComment,
  Cluster,
  Comment,
  CompareSummary,
  Region,
  Settings,
  Tape,
} from "./types";

export interface CompareResult {
  clustersA: Cluster[];
  clustersB: Cluster[];
  alignment: Alignment;
  regions: Region[];
  summary: CompareSummary;
  carried: CarriedComment[];
  mapper: FrameMapper;
}

export class CodebookMismatchError extends Error {
  constructor(
    public a: string,
    public b: string,
  ) {
    super(`codebook mismatch: ${a} vs ${b}`);
  }
}

/** The whole Compare pipeline in one call. Pure; no I/O. */
export function compareTapes(
  tapeA: Tape,
  tapeB: Tape,
  commentsA: Comment[],
  bVersionId: string,
  settings: Settings,
): CompareResult {
  if (!sameCodebook(tapeA, tapeB)) throw new CodebookMismatchError(tapeA.codebook_hash, tapeB.codebook_hash);
  const clustersA = groupClusters(tapeA, settings.grouping);
  const clustersB = groupClusters(tapeB, settings.grouping);
  const alignment = alignClusters(clustersA, clustersB, settings.alignment);
  const regions = buildRegions(alignment, clustersA, clustersB, tapeA, tapeB, settings.alignment);
  const summary = computeSummary(alignment, clustersB, tapeB, regions);
  const mapper = new FrameMapper(clustersA, clustersB, alignment, tapeA.u.length, tapeB.u.length);
  const carried = carryComments(commentsA, mapper, regions, bVersionId);
  return { clustersA, clustersB, alignment, regions, summary, carried, mapper };
}
