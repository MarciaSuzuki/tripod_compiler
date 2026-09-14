/**
 * Core model for Bead Compare.
 *
 * A bead is one tape frame (20 ms at frame_rate 50). Beads are never shown as
 * numbers; they are grouped into clusters for display and alignment.
 */

/** tape.json as produced by O Escriba (protocol 2), plus the optional mock flag. */
export interface Tape {
  codebook_hash: string;
  frame_rate: number;
  u: number[];
  f: number[];
  pause_unit?: number;
  mock?: boolean;
}

/** meta.json. Every field is optional on import; the UI shows what is present. */
export interface Meta {
  passage?: string;
  language?: string;
  narrator?: string;
  recorded_at?: string;
  label?: string;
}

export interface Passage {
  id: string;
  title: string;
  created_at: string;
  version_ids: string[];
}

/** One Recording attached to a Passage. Audio bytes live in the same record. */
export interface Version {
  id: string;
  passage_id: string;
  label: string;
  meta: Meta;
  tape: Tape;
  audio: Blob;
  tape_sha256: string;
  audio_sha256: string;
  imported_at: string;
}

export interface Span {
  version_id: string;
  start_frame: number;
  /** exclusive */
  end_frame: number;
}

export type CommentKind = "note" | "fix_requested" | "approved";
export type CommentStatus = "open" | "resolved" | "carried";

export interface Comment {
  id: string;
  span: Span;
  author: string;
  text?: string;
  audio_blob?: Blob;
  kind: CommentKind;
  created_at: string;
  status: CommentStatus;
  /** Set on a comment that was placed by carry-forward from another version. */
  carried_from?: string;
}

/** A run of consecutive frames grouped for display and alignment. */
export interface Cluster {
  index: number;
  /** inclusive */
  start: number;
  /** exclusive */
  end: number;
  /** The U value that represents this cluster (the absorbing run's value). */
  u: number;
  is_pause: boolean;
  /** Phrase number for speech clusters; null for pause clusters. */
  phrase: number | null;
}

export interface GroupingSettings {
  /** Clusters shorter than this (in frames) merge into a neighbour. */
  min_cluster_frames: number;
}

export interface AlignmentSettings {
  match_score: number;
  mismatch_penalty: number;
  gap_penalty: number;
  /** Difference regions separated by fewer than this many matched frames are merged. */
  merge_gap_frames: number;
  /** Mean-F difference (in F units) above which a matched cluster is "same sounds, different melody". */
  melody_threshold: number;
}

export interface Settings {
  grouping: GroupingSettings;
  alignment: AlignmentSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  grouping: { min_cluster_frames: 3 },
  alignment: {
    match_score: 2,
    mismatch_penalty: 1,
    gap_penalty: 1,
    merge_gap_frames: 10,
    melody_threshold: 3,
  },
};

export type AlignOpKind = "match" | "mismatch" | "insert_b" | "delete_b";

/** One column of the alignment. `a`/`b` are cluster indexes, null for a gap. */
export interface AlignOp {
  kind: AlignOpKind;
  a: number | null;
  b: number | null;
}

export interface Alignment {
  ops: AlignOp[];
  score: number;
}

export type RegionKind = "substituted" | "inserted" | "deleted" | "melody";

export interface FrameRange {
  /** inclusive */
  start: number;
  /** exclusive; equal to start for a zero-length point */
  end: number;
}

/** A difference between A and B, expressed in frames of each version. */
export interface Region {
  index: number;
  kind: RegionKind;
  a: FrameRange;
  b: FrameRange;
  /** Alignment op indexes covered (first..last inclusive). */
  op_start: number;
  op_end: number;
}

export type Verdict =
  | "requested_fix_confirmed"
  | "unrequested_ok"
  | "unrequested_problem"
  | "undecided";

/** Verdicts and decisions stored for one ordered pair (A older, B newer). */
export interface PairRecord {
  id: string;
  passage_id: string;
  a_version_id: string;
  b_version_id: string;
  /** keyed by region signature (see regionKey) so verdicts survive re-computation */
  verdicts: Record<string, Verdict>;
  updated_at: string;
}

export type CarryOutcome = "changed_here" | "no_change_detected";

export interface CarriedComment {
  /** The original comment on A. */
  source: Comment;
  /** Where it lands on B. */
  span: Span;
  outcome: CarryOutcome;
  /** Regions on B that overlap the carried span. */
  region_indexes: number[];
}

export interface CompareSummary {
  region_count: number;
  changed_seconds: number;
  /** Percent of B frames that sit in matched clusters (0–100). "Stability score". */
  stability: number;
  matched_b_frames: number;
  total_b_frames: number;
}
