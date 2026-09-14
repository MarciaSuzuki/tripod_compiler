# Bead Compare — architecture and module contracts

This file is the agreement between the modules, kept in line with the code as
built. The pure model (`src/model/`) is tested and its signatures are frozen;
everything else is built against the contracts below. Add to a signature only
when a screen truly needs it, and record the addition here.

## Ground rules (from the brief)

- **Plays original audio only.** No synthesis, no vocoder, no render endpoint.
  The only sound the app makes is a slice of a decoded `audio.wav` or a
  consultant's own recorded comment.
- **Local-first.** Everything lives in IndexedDB. No backend, no cloud sync.
  The only network requests are the demo fixtures fetched from the app's own
  public folder.
- **Beads are never shown as numbers.** No U/F values, frame indexes, sample
  counts or hashes anywhere in the UI except inside `<TechnicalDetails>`.
  Time positions (`m:ss.s`), region ordinals and counts, seconds changed and the
  stability percent are allowed because the brief asks for them.
- **UI text in Brazilian Portuguese by default**, English via toggle. Every
  visible string goes through `t()`; components hold no strings and receive
  their labels as props.
- **Calm and uncluttered.** The consultant is listening, not reading.
- **Mock tapes carry a visible badge** wherever a tape is shown.
- Two tapes with different `codebook_hash` are never compared; the UI refuses
  with a clear message. Different frame rates are refused the same way.

## Layout

```
index.html               the single page (lang="pt-BR"); mounts /src/main.tsx
vite.config.ts           base "./", publicDir "fixtures", outDir "dist"
vitest.config.ts         include tests/**/*.test.ts, node environment
playwright.config.ts     e2e: vite build + vite preview on 4173 (never reuses a stale server), headless Chromium
vercel.json              buildCommand npm run build, outputDirectory dist, SPA rewrite
tsconfig.json            src, tests, vite configs (types: vite/client, node)
src/
  main.tsx               mounts <App/> in StrictMode
  App.tsx                shell: header (title, language toggle, settings button), error boundary, routes, footer
  router.tsx             hash router: parseRoute(), routePath(), useRoute(), navigate()
  styles.css             design tokens + every shared style (single stylesheet)
  settings.tsx           Settings persisted in localStorage; SettingsProvider/useSettings
  model/                 pure logic (frozen signatures, see below)
  i18n/
    index.tsx            I18nProvider, useI18n, t(), translate()
    strings/common.ts    strings shared by all screens (header, buttons, kinds, statuses, settings, errors)
    strings/passages.ts  Passage list screen, including the import diagnostics (passages.import.*)
    strings/listen.ts    Listen screen
    strings/compare.ts   Compare screen
    strings/report.ts    Report screen and the Markdown export
  db/
    db.ts                IndexedDB open/upgrade + transaction helpers
    repo.ts              the Repo API used by screens (singleton `repo`)
    recording.ts         parseRecordingFiles(): folder or zip → ParsedRecording; diagnostics
    passageZip.ts        export/import one passage as a zip (fflate)
  audio/
    engine.ts            AudioEngine singleton: decode once, play by sample offset
    recorder.ts          microphone → Blob (MediaRecorder)
    format.ts            formatTime(seconds, lang) → "m:ss.s"; formatRange; frameTime
  components/
    BeadStrip.tsx        the bead strip (SVG) + pure geometry helpers
    Waveform.tsx         thin waveform (canvas)
    TechnicalDetails.tsx the ONLY place tape numbers may appear
    SettingsPanel.tsx    grouping + alignment parameters, language, reset, clear all
    MockBadge.tsx
    LanguageToggle.tsx
    PlayerControls.tsx   play/pause, stop, loop buttons
    CommentEditor.tsx    typed and/or spoken comment for a span
    CommentList.tsx      comments under a strip; tap → play span + read/hear; CommentAudio
  screens/
    PassageList.tsx      #/
    Listen.tsx           #/listen/:versionId        (+ Listen.css, listenLogic.ts)
    Compare.tsx          #/compare/:aId/:bId        (+ Compare.css, compareLogic.ts)
    Report.tsx           #/report/:aId/:bId         (+ Report.css)
    importMessages.ts    translates import diagnostics for the screens
  export/
    download.ts          downloadBlob(), downloadText(), safeFilename()
    report.ts            buildReport(), reportToMarkdown(), reportToJson(), formatting helpers
tests/                   vitest unit tests (node env; fake-indexeddb for db tests) + helpers.ts
e2e/                     Playwright smoke test (smoke.spec.ts, helpers.ts, its own tsconfig.json)
fixtures/                demo recordings; served as Vite publicDir so "Load demo" can fetch them
tools/                   mock_tape.py, units_to_tape.py (acoustemes + WAV → Recording), make_fixtures.py, tape_hash.py (reproduces Version.tape_sha256)
public/                  empty (fixtures/ is the public folder)
```

## Model (`src/model/`, re-exported from `src/model/index.ts`)

Pure, no I/O, no DOM. Signatures are frozen.

```ts
// types.ts
export interface Tape { codebook_hash: string; frame_rate: number; u: number[]; f: number[]; pause_unit?: number; mock?: boolean }
export interface Meta { passage?: string; language?: string; narrator?: string; recorded_at?: string; label?: string }
export interface Passage { id: string; title: string; created_at: string; version_ids: string[] }
export interface Version { id: string; passage_id: string; label: string; meta: Meta; tape: Tape; audio: Blob; tape_sha256: string; audio_sha256: string; imported_at: string }
export interface Span { version_id: string; start_frame: number; end_frame: number /* exclusive */ }
export type CommentKind = "note" | "fix_requested" | "approved";
export type CommentStatus = "open" | "resolved" | "carried";
export interface Comment { id: string; span: Span; author: string; text?: string; audio_blob?: Blob; kind: CommentKind; created_at: string; status: CommentStatus; carried_from?: string }
export interface Cluster { index: number; start: number; end: number; u: number; is_pause: boolean; phrase: number | null }
export interface Settings { grouping: { min_cluster_frames: number }; alignment: { match_score: number; mismatch_penalty: number; gap_penalty: number; merge_gap_frames: number; melody_threshold: number } }
export const DEFAULT_SETTINGS: Settings;   // 3; 2, 1, 1, 10, 3
export type AlignOpKind = "match" | "mismatch" | "insert_b" | "delete_b";
export interface AlignOp { kind: AlignOpKind; a: number | null; b: number | null }
export interface Alignment { ops: AlignOp[]; score: number }
export type RegionKind = "substituted" | "inserted" | "deleted" | "melody";
export interface FrameRange { start: number; end: number /* exclusive; == start for a point */ }
export interface Region { index: number; kind: RegionKind; a: FrameRange; b: FrameRange; op_start: number; op_end: number }
export type Verdict = "requested_fix_confirmed" | "unrequested_ok" | "unrequested_problem" | "undecided";
export interface PairRecord { id: string; passage_id: string; a_version_id: string; b_version_id: string; verdicts: Record<string, Verdict>; updated_at: string }
export type CarryOutcome = "changed_here" | "no_change_detected";
export interface CarriedComment { source: Comment; span: Span; outcome: CarryOutcome; region_indexes: number[] /* regions overlapped on A or B; their verdicts are the record of the check */ }
export interface CompareSummary { region_count: number; changed_seconds: number; stability: number; matched_b_frames: number; total_b_frames: number }

// tape.ts
export function checkTape(raw: unknown): { ok: boolean; errors: string[] };
export function parseTape(text: string): { tape?: Tape; errors: string[] };   // keeps `mock` only when true
export function frameToSeconds(frame: number, tape: Pick<Tape, "frame_rate">): number;
export function tapeDurationSeconds(tape: Tape): number;
export function sameCodebook(a: Tape, b: Tape): boolean;

// cluster.ts
export function runLengthEncode(u: number[]): { start: number; end: number; u: number }[];
export function groupClusters(tape: Tape, settings: { min_cluster_frames: number }): Cluster[];
export function clusterFrames(c: Cluster): number;
export function clusterAtFrame(clusters: Cluster[], frame: number): Cluster | null;
export function meanVoicedF(tape: Tape, c: Cluster): number | null;

// align.ts
export const MAX_ALIGNMENT_CELLS = 200_000_000;
export class AlignmentTooLargeError extends Error { clustersA: number; clustersB: number }
export function alignClusters(a: Cluster[], b: Cluster[], settings: Pick<Settings["alignment"], "match_score" | "mismatch_penalty" | "gap_penalty">): Alignment;

// regions.ts
export function classifyOps(alignment, a, b, tapeA, tapeB, settings: { melody_threshold }): (RegionKind | null)[];
export function buildRegions(alignment, a, b, tapeA, tapeB, settings: { merge_gap_frames; melody_threshold }): Region[];
export function regionKey(r: Region): string;                       // "kind|a:start-end|b:start-end"
export function computeSummary(alignment, b, tapeB, regions): CompareSummary;
export function rangesOverlap(x: FrameRange, y: FrameRange): boolean;

// carry.ts
export class FrameMapper { constructor(a, b, alignment, aFrames, bFrames); mapFrame(frame): number; mapEnd(end): number; mapSpan(span, bVersionId): Span }
export function isCarriedSource(c: Comment): boolean;   // fix_requested, written on A (no carried_from), open or resolved
export function carryComments(commentsA: Comment[], mapper: FrameMapper, regions: Region[], bVersionId: string): CarriedComment[];   // every isCarriedSource comment, in order

// compare.ts
export interface CompareResult { clustersA; clustersB; alignment; regions; summary; carried; mapper }
export class CodebookMismatchError extends Error { a: string; b: string }
export function compareTapes(tapeA, tapeB, commentsA, bVersionId, settings): CompareResult;   // throws CodebookMismatchError / AlignmentTooLargeError

// hash.ts
export function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string>;   // WebCrypto, else sha256Sync
export function sha256Sync(input: Uint8Array): Uint8Array;
export function hasWebCrypto(): boolean;
export function shortHash(h: string): string;   // drops "sha256:", first 8 hex chars
export function newId(): string;                // crypto.randomUUID() with a fallback
```

## Routes (`src/router.tsx`)

```ts
export type Route =
  | { name: "passages" }
  | { name: "listen"; versionId: string }
  | { name: "compare"; aId: string; bId: string }
  | { name: "report"; aId: string; bId: string };
export const PASSAGES_ROUTE: Route;
export function parseRoute(hash: string): Route;      // unknown or malformed → passages; segments URI-decoded
export function routePath(r: Route): string;           // "#/listen/abc"; ids URI-encoded
export function useRoute(): Route;                     // subscribes to hashchange
export function navigate(r: Route): void;
```

Screens take **no props**: each reads its parameters from `useRoute()`. `App.tsx`
keys the routed element by `routePath(route)`, so a change of parameters
remounts the screen with fresh state.

## Settings (`src/settings.tsx`)

```ts
import type { Settings } from "./model";
export const SETTINGS_KEY = "bead-compare.settings.v1";
export function mergeSettings(stored: unknown): Settings;   // deep-merge over DEFAULT_SETTINGS; wrong types and non-finite numbers fall back
export function loadSettings(): Settings;                    // a fresh copy every call
export function saveSettings(s: Settings): void;
export interface SettingsApi { settings: Settings; update(next: Settings): void; reset(): void }
export function SettingsProvider(props: { children: React.ReactNode }): JSX.Element;
export function useSettings(): SettingsApi;                  // a no-op fallback outside the provider
```

## i18n (`src/i18n/index.tsx`)

```ts
export type Lang = "pt-BR" | "en";
export type Dict = Record<string, string>;
export interface StringModule { "pt-BR": Dict; en: Dict }
export const LANG_KEY = "bead-compare.lang";
export const DEFAULT_LANG: Lang = "pt-BR";
export const LANGS: readonly Lang[];
export const STRING_MODULES: { common; passages; listen; compare; report };
export const STRINGS: Record<Lang, Dict>;                    // the merged dictionaries
export type Vars = Record<string, string | number>;
export type T = (key: string, vars?: Vars) => string;
export function isLang(x: unknown): x is Lang;
export function interpolate(template: string, vars?: Vars): string;
export function translate(lang: Lang, key: string, vars?: Vars): string;  // for non-React code (report export)
export function readStoredLang(): Lang;
export function writeStoredLang(lang: Lang): void;
export function I18nProvider(props: { children: React.ReactNode }): JSX.Element;
export function useI18n(): { lang: Lang; setLang(l: Lang): void; t: T };
```
- `index.tsx` merges every `strings/*.ts` module. A missing key returns the key
  itself and `console.warn`s once in dev (never under test).
- Placeholders: `{name}` replaced from `vars`; unknown placeholders are left as written.
- Key naming: `screen.section.item`, e.g. `listen.comment.add`, `common.kind.fix_requested`.
- Each screen owns its strings file. `common.ts` owns: app title and subtitle, nav,
  buttons (play/pause/stop/loop/save/cancel/delete/export/import/close/confirm),
  comment kinds and statuses, region kinds, verdicts, carry outcomes, mock badge,
  technical-details summary, settings labels and hints, the refusal messages
  (codebook mismatch, frame-rate mismatch, too large), the error-boundary texts,
  generic states, the footer, the author field and the language names.
- Import diagnostics are keys `passages.import.<code>` in `passages.ts`.
- The provider sets `document.documentElement.lang`; `index.html` starts as `pt-BR`.
- `tests/i18n.test.ts` enforces identical key sets and placeholders in both languages.

## Database (`src/db/db.ts`, `src/db/repo.ts`)

Database name `bead-compare`, version 1. Stores:
- `passages` keyPath `id`
- `versions` keyPath `id`, index `by_passage` on `passage_id`
- `comments` keyPath `id`, index `by_version` on `span.version_id`
- `pairs` keyPath `id` (= `${a_version_id}::${b_version_id}`), index `by_passage`

```ts
// db.ts
export const DB_NAME = "bead-compare"; export const DB_VERSION = 1;
export type StoreName = "passages" | "versions" | "comments" | "pairs"; export const STORE_NAMES: readonly StoreName[];
export type IndexName = "by_passage" | "by_version";
export function openDb(): Promise<IDBDatabase>;   // shared connection; reset on versionchange/close
export function closeDb(): Promise<void>;
export function deleteDb(): Promise<void>;        // tests
export function withTx<T>(stores, mode, fn: (tx) => Promise<T> | T): Promise<T>;   // aborts and rethrows when fn throws
export function getFrom / putIn / deleteFrom / getAllFrom / getAllKeysFrom / deleteByIndex / clearStore;   // transaction-scoped
export function get / put / del / getAll / getAllByIndex;                                                // one transaction each
```
Rule: while a transaction is open, only await IndexedDB requests. Hashing,
`Blob.arrayBuffer()` and `fetch` happen before `withTx()`.

```ts
// repo.ts
export function pairId(aId: string, bId: string): string;
export function canonicalTapeJson(tape: Tape): string;    // JSON.stringify(tape); its hash is tape_sha256
export function hashRecording(audio: Blob, tape: Tape): Promise<{ tape_sha256: string; audio_sha256: string }>;
export interface Repo {
  listPassages(): Promise<Passage[]>;                       // newest first
  getPassage(id: string): Promise<Passage | undefined>;
  createPassage(title: string): Promise<Passage>;
  renamePassage(id: string, title: string): Promise<void>;
  deletePassage(id: string): Promise<void>;                 // cascades versions, comments, pairs
  listVersions(passageId: string): Promise<Version[]>;      // in passage.version_ids order; unlisted last by import time
  getVersion(id: string): Promise<Version | undefined>;
  addVersion(passageId: string, rec: ParsedRecording, label?: string): Promise<Version>; // computes both sha256; label defaults to meta.label or "v{n}"
  relabelVersion(id: string, label: string): Promise<void>;
  deleteVersion(id: string): Promise<void>;                 // cascades comments and pairs, removes it from version_ids
  listComments(versionId: string): Promise<Comment[]>;      // by created_at
  addComment(c: Omit<Comment, "id" | "created_at">): Promise<Comment>;
  updateComment(id: string, patch: Partial<Omit<Comment, "id">>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;                 // also removes the copies carried from it
  syncCarriedComments(aId: string, bId: string, carried: ReadonlyArray<Pick<CarriedComment, "source" | "span">>): Promise<Comment[]>; // one copy per source on B, keyed by carried_from, status "carried" or "resolved" as the source; idempotent
  getPair(aId: string, bId: string): Promise<PairRecord | undefined>;
  setVerdict(passageId: string, aId: string, bId: string, regionKey: string, verdict: Verdict): Promise<PairRecord>;
  exportPassage(passageId: string): Promise<Blob>;          // zip, see layout below
  importPassage(zip: Blob | ArrayBuffer): Promise<Passage>; // ids regenerated; carried_from and pairs remapped; hashes recomputed
  clearAll(): Promise<void>;                                // the settings panel's "clear all local data"
}
export const repo: Repo;
```
- `getVersion` is cheap to call repeatedly (it returns the stored record; the
  audio `Blob` is stored inside the version record).
- `syncCarriedComments` keeps each copy's status in step with its source
  (resolved ↔ resolved, open ↔ carried, so a reopened source reopens its copy),
  removes a copy whose source is gone, and never touches copies carried from
  another A.

### Recording import (`src/db/recording.ts`)

```ts
export type ImportDiagnosticCode =
  | "no_files" | "audio_missing" | "tape_missing" | "duplicates" | "not_wav" | "tape_invalid"
  | "meta_missing" | "meta_not_object" | "meta_invalid_json"
  | "wav_format" | "wav_not_pcm" | "duration_mismatch" | "frame_rate_unusual"
  | "zip_unreadable" | "zip_not_passage" | "zip_format_version" | "manifest_invalid" | "zip_file_missing" | "comment_audio_missing";
export interface ImportDiagnostic { code: ImportDiagnosticCode; vars?: Record<string, string | number> }
export class ImportError extends Error { diagnostic: ImportDiagnostic }   // thrown by the passage-zip importer
export interface ParsedRecording { audio: Blob; tape: Tape; meta: Meta; warnings: ImportDiagnostic[] }
export const AUDIO_FILE = "audio.wav", TAPE_FILE = "tape.json", META_FILE = "meta.json";
export const EXPECTED_SAMPLE_RATE = 16000, EXPECTED_CHANNELS = 1, EXPECTED_BITS = 16, EXPECTED_FRAME_RATE = 50, DURATION_TOLERANCE_SECONDS = 0.5;
export interface WavInfo { format: number; channels: number; sampleRate: number; bitsPerSample: number; dataBytes?: number; seconds?: number }
export function isWavHeader(bytes: Uint8Array): boolean;
export function parseWavHeader(bytes: Uint8Array, fileSize?: number): WavInfo | null;   // walks RIFF chunks: fmt (extensible too) + data; bogus data sizes capped by fileSize
export function audioWarnings(info: WavInfo | null, tape: Tape): ImportDiagnostic[];
export function tapeWarnings(tape: Tape): ImportDiagnostic[];
export function normalizeMeta(raw: unknown): Meta;                       // known string fields only
export function parseMetaText(text: string): { meta: Meta; warning?: ImportDiagnostic };
export function tapeErrors(text: string, file?: string): { tape?: Tape; errors: ImportDiagnostic[] };
export function isZipFile(file: File): boolean;
export interface RecordingEntry { path: string; size: number; head(n): Promise<Uint8Array>; text(): Promise<string>; blob(type): Blob }
export function parseRecordingEntries(entries: RecordingEntry[]): Promise<{ recording?: ParsedRecording; errors: ImportDiagnostic[] }>;
export function parseRecordingFiles(files: File[]): Promise<{ recording?: ParsedRecording; errors: ImportDiagnostic[] }>;
```
Accepts either the files of one folder (from `<input webkitdirectory>` or a
multi-file picker) or a single `.zip`. Finds `audio.wav`, `tape.json`,
`meta.json` at any depth, case-insensitively, skipping `__MACOSX`, `._*`,
`.DS_Store` and directory entries (a zip may wrap a top-level folder; two
candidates at the same depth is an error). `tape.json` is validated with
`parseTape`; every problem is an error. Missing `meta.json` is a warning.
Missing audio or tape is an error. Audio that is not 16 kHz mono 16-bit PCM, a
frame rate other than 50, and a duration that disagrees with the tape by more
than 0.5 s are warnings. Errors and warnings are diagnostics;
`screens/importMessages.ts` translates them (`diagnosticLine(t, lang, d)`,
`importErrorLine(t, lang, e)`) into `{ text, detail? }`: one sentence with no
English and none of the file's numbers, plus an optional detail (the raw
`detail` var, or a translated `passages.import.<code>.detail` template for
`wav_format`, `duration_mismatch` and `frame_rate_unusual`) that the passage
card shows inside a collapsed `<TechnicalDetails>`. `*_s` vars are seconds in
the language's notation.

### Passage zip (`src/db/passageZip.ts`)

```ts
export const PASSAGE_ZIP_FORMAT = "bead-compare-passage"; export const PASSAGE_ZIP_FORMAT_VERSION = 1; export const MANIFEST_FILE = "passage.json";
export function commentAudioExt(blob: Pick<Blob, "type">): string;      // webm | ogg | mp4 | wav | bin
export function commentAudioFile(c: Pick<Comment, "id" | "audio_blob">): string | null;
export function exportPassageZip(passage, versions, comments, pairs): Promise<Blob>;   // deflate level 6
export function importPassageZip(bytes: Blob | ArrayBuffer | Uint8Array): Promise<ImportedPassage>;   // throws ImportError
```
```
passage.json                       { format: "bead-compare-passage", format_version: 1,
                                     passage, versions: [{ id, label, meta, tape_sha256, audio_sha256, imported_at }],
                                     comments: [{ ...comment without audio_blob, audio_file: "comments/<id>.<ext>" | null }],
                                     pairs: [PairRecord] }
versions/<version_id>/audio.wav
versions/<version_id>/tape.json
versions/<version_id>/meta.json
comments/<comment_id>.<ext>        spoken comment blobs; <ext> from the blob type
```
The importer tolerates a zip that wraps one folder, re-validates every tape and
WAV, and reports a missing comment audio file as a warning.

## Audio (`src/audio/engine.ts`)

```ts
export interface LoadedAudio { buffer: AudioBuffer; durationSeconds: number; peaks(buckets: number): Float32Array /* 0..1 max-abs per bucket, cached per count */ }
export interface PlayItem { versionId: string; startFrame: number; endFrame: number /* exclusive */; frameRate: number }
export interface PlayState { versionId: string; frame: number; playing: boolean; item: PlayItem }
export const MAX_CACHED_VERSIONS = 4;
export const NATIVE_SAMPLE_RATE = 16000;
export function computePeaks(channel: ArrayLike<number>, buckets: number): Float32Array;   // pure; used by LoadedAudio.peaks
export class AudioEngine {
  static get(): AudioEngine;                                  // singleton; the AudioContext is created lazily on first load/play
  load(versionId: string, audio: Blob): Promise<LoadedAudio>; // decodes once; LRU of MAX_CACHED_VERSIONS by versionId; concurrent calls share one decode
  loaded(versionId: string): LoadedAudio | undefined;
  get cachedVersionIds(): string[];                           // least recently used first
  unload(versionId: string): void;                            // stops it first if playing
  unloadAll(): void;                                          // after "clear all local data"
  play(item: PlayItem, opts?: { loop?: boolean }): void;      // stops anything playing first; 0.3 s between loop repeats
  playSequence(items: PlayItem[], opts?: { gapSeconds?: number; loop?: boolean }): void; // A then B; default gap 0.6 s, also between repeats
  stop(): void;
  toggle(): void;                                             // pause/resume by suspending/resuming the context
  get state(): PlayState | null;
  subscribe(cb: (s: PlayState | null) => void): () => void;   // every animation frame while playing, once on pause/resume, once (null) on stop
}
```
- Playback is by **sample offset**: `offset = startFrame / frameRate` seconds,
  `duration = (endFrame - startFrame) / frameRate`, through
  `AudioBufferSourceNode.start(when, offset, duration)`. Never through any other API.
- The AudioContext is created at the tape's native 16 kHz (falling back to the
  browser default when the option is refused), so decoding does not upsample.
  `playSequence` calls `ctx.resume()` inside the tap that started it.
- A zero-length or out-of-range item plays nothing; a sequence with nothing to
  play emits no state.
- Pause suspends the whole context, so a sequence keeps its timing across a pause;
  loops are scheduled one iteration ahead on the context clock. The cursor frame
  is derived from `ctx.currentTime`, never from a timer.
- `src/audio/recorder.ts`:
  ```ts
  export interface RecordingHandle { stop(): Promise<Blob>; cancel(): void }
  export function canRecord(): boolean;
  export function pickMimeType(candidates?: readonly string[]): string | undefined;  // webm/opus, webm, ogg/opus, mp4
  export function extensionForMime(mime: string): string;
  export function startRecording(): Promise<RecordingHandle>;   // releases the microphone on stop/cancel
  ```
- `src/audio/format.ts`:
  ```ts
  export function decimalMark(lang?: Lang): string;                        // "," for pt-BR, "." otherwise
  export function formatTime(seconds: number, lang?: Lang): string;         // "0:03.4" (en) / "0:03,4" (pt-BR)
  export function frameTime(frame: number, frameRate: number): number;
  export function formatRange(startFrame, endFrame, frameRate, lang?): string;   // "0:03,4 – 0:04,1"
  ```

## Components

Components hold no strings: every visible label comes from the screen through a
`labels` prop (or `label`), already translated.

```ts
// BeadStrip.tsx — SVG. Width fills its container (ResizeObserver), height default 56.
export interface StripHighlight { range: FrameRange; kind: RegionKind | "carried" | "carried_warning"; id: string; active?: boolean }
export interface StripMarker { range: FrameRange; kind: CommentKind; status: CommentStatus; id: string; active?: boolean; carried?: boolean; ariaLabel?: string }
export interface BeadStripProps {
  clusters: Cluster[]; totalFrames: number; frameRate: number;
  height?: number;
  selection?: FrameRange | null;
  cursorFrame?: number | null;
  highlights?: StripHighlight[];
  markers?: StripMarker[];
  onTapCluster?(c: Cluster): void;
  onSelect?(range: FrameRange): void;      // drag across beads; range snaps to cluster bounds
  onTapHighlight?(id: string): void;       // a tap on a highlight wins over the bead under it
  onTapMarker?(id: string): void;
  onWidth?(px: number): void;              // reports the drawn width so Compare can draw connectors
  ariaLabel?: string;
  lang?: Lang;                             // decimal mark of the bead names (time positions)
}
export function BeadStrip(props: BeadStripProps): JSX.Element;
export const FALLBACK_WIDTH = 800; export const DEFAULT_HEIGHT = 56;
export function frameToX(frame: number, totalFrames: number, width: number): number;
export function xToFrame(x: number, totalFrames: number, width: number): number;
export function snapPixelToCluster(x: number, width: number, totalFrames: number, clusters: Cluster[]): Cluster | null;
export function snapRange(a: Cluster, b: Cluster): FrameRange;
export function hitHighlight(highlights: StripHighlight[], frame: number, x: number, totalFrames: number, width: number): StripHighlight | null;
```
- Beads: rounded rects, width ∝ duration, 2 px gap; pause clusters draw only a
  faint dotted baseline. Phrases: a thin line under the beads of each phrase.
  Colours come from CSS variables in `styles.css` (`--bead`, `--bead-active`,
  `--region-substituted`, `--region-inserted`, `--region-deleted`,
  `--region-melody`, `--carried`, `--carried-warning`, `--comment-*`).
- Each bead is a `role="button"` whose accessible name is its time position
  only; `data-cluster` carries the index for tests and is never visible.
- Selection: a translucent overlay; cursor: a 2 px vertical line. Markers: 8 px
  bars under the phrase line, hollow when resolved, dashed when carried.
  A `carried_warning` highlight gets a 2 px dashed outline.
- Keyboard focusability is handled by the screen, not the strip.

```ts
// Waveform.tsx — canvas, aria-hidden. Same width as the strip beneath it.
export function Waveform(props: { peaks: Float32Array | null; totalFrames: number; cursorFrame?: number | null; selection?: FrameRange | null; height?: number }): JSX.Element;
// TechnicalDetails.tsx — <details class="tech"> collapsed by default; children may show numbers.
export function TechnicalDetails(props: { children: React.ReactNode; summary?: string }): JSX.Element;   // screens pass t("common.tech.summary")
// SettingsPanel.tsx — right-side dialog; edits every field of Settings via useSettings, plus language, reset and clear-all.
// The fields are <input type="text" inputmode="decimal">, never type="number" (Chromium would rewrite "0,5" as 5 before React sees it).
export const DATA_CLEARED_EVENT = "bead-compare:data-cleared";   // dispatched on window after repo.clearAll()
export const FIELDS: readonly Field[];   // { group, name, min, integer } per settings field, in panel order
export function parseFieldValue(f: { min: number; integer: boolean }, draft: string): number | null;   // "," or "." as decimal mark; null for text, exponents, values below min, fractions in integer fields
export function SettingsPanel(props: { open: boolean; onClose(): void }): JSX.Element;
export function MockBadge(props: { tape: Pick<Tape, "mock">; label: string }): JSX.Element | null;   // label = t("common.mock.badge")
export function LanguageToggle(): JSX.Element;   // PT / EN buttons with aria-pressed
export interface PlayerLabels { play: string; pause: string; stop: string; loop: string }
export function PlayerControls(props: { playing: boolean; loop: boolean; onPlay(): void; onPause(): void; onStop(): void; onToggleLoop(): void; disabled?: boolean; labels: PlayerLabels }): JSX.Element;
export interface CommentEditorLabels { text; kind; kinds: Record<CommentKind, string>; record; stopRecording; recording; discardRecording; recordUnavailable; recordFailed; save; cancel }
export function CommentEditor(props: { span: Span; author: string; onSave(c: Omit<Comment, "id" | "created_at">): void; onCancel(): void; labels: CommentEditorLabels; initialKind?: CommentKind }): JSX.Element;
export interface CommentListLabels { kinds: Record<CommentKind, string>; statuses: Record<CommentStatus, string>; resolve; delete; play; audio; carried?: string }
export function CommentList(props: { comments: Comment[]; frameRate: number; activeId?: string | null; onTap(c: Comment): void; onResolve?(c: Comment): void; onDelete?(c: Comment): void; labels: CommentListLabels; lang?: Lang }): JSX.Element;   // a carried copy (carried_from) has no delete button
export function CommentAudio(props: { blob: Blob; label: string }): JSX.Element | null;   // <audio controls> on an object URL revoked on cleanup
```
- `CommentEditor` focuses its textarea on mount (the `c` shortcut opens it), can
  save with text and/or a recording, and releases the microphone on cancel,
  unmount, or when a permission prompt resolves after a cancel.

## Screens

All four screens are rendered without props (`<PassageList/>`, `<Listen/>`,
`<Compare/>`, `<Report/>`) and read their ids from `useRoute()`.

- **PassageList (`#/`)**: create passage (title), list passages newest first;
  each passage card shows its versions in order with label, mock badge,
  recording date, narrator and language, and hashes, frame count, frame rate,
  import date and id inside a TechnicalDetails; buttons: import a Recording
  (folder via `webkitdirectory`, or zip) as a new version, open Listen, pick A
  and B (radios constrained to A before B; defaults previous/latest) → Compare,
  export passage zip, delete (confirm; cascades and unloads decoded audio).
  The toolbar has "Load demo passage" (fetches
  `./ruth-1-1-5/v1|v2/{audio.wav,tape.json,meta.json}` from Vite's `publicDir`
  and names the passage `passages.demo.passage_title`) and "Import passage
  (.zip)". Import errors and warnings are diagnostics translated at render time.
  Exports: `demoUrl(path)`, `formatDate(iso, lang)`.
- **Listen (`#/listen/:versionId`)**: waveform above the strip; tap a bead →
  select and play that cluster; drag → cluster-snapped span, played; play with no
  selection plays the whole recording with a moving cursor; play/pause/stop/loop;
  comments on the selection (typed and/or recorded, kind note | fix_requested |
  approved, status open), markers under the strip (tap → select, play, read/hear),
  resolve and delete; carried copies (`carried_from`) show the carried label and
  dashed markers, cannot be deleted, and resolving one resolves its source.
  Keyboard (`listenLogic.ts`): Space play/pause, ←/→ grow by one speech cluster,
  Shift+←/→ shrink, `c` comment, Esc stop + close editor; keys are ignored on
  text fields, media elements, buttons and summaries. Author name is a small text
  field remembered in localStorage (`bead-compare.author`). Playback stops when
  the screen unmounts.
- **Compare (`#/compare/:aId/:bId`)**: A (older) above B (newer); three summary
  facts (regions, changed seconds, stability); a 28 px connector band between the
  strips with one light line per matched pair of speech clusters (mismatches
  dashed in the region colour; gaps and pauses draw nothing); regions highlighted
  on both strips; tap a region (strip or list) → A, 0.6 s gap, B; buttons play A,
  play B, play both, pause, stop, loop (loop toggled during a session restarts
  it with the new flag); tap a bead on either strip → that cluster alone;
  per-region verdict select saved through `repo.setVerdict` (optimistic, reverts
  on failure); the active region is tracked by `regionKey` so it survives a
  settings change. Carried comments (open and resolved fix requests on A) are
  derived with `compareTapes` on every computation and persisted onto B with
  `repo.syncCarriedComments`; each row shows the request's status next to its
  outcome, links to the region(s) it overlaps with their verdicts (a tap
  selects and plays the region), and offers "play on B" (or "play on A" when
  nothing lands on B), "mark as resolved" on an open request and "reopen" on a
  resolved one; the warning line counts open requests only. Refuses a codebook
  mismatch, a frame-rate mismatch,
  and a pair too large to align (`AlignmentTooLargeError`), each with the header,
  a translated sentence and a TechnicalDetails, before any strip is drawn. Link
  to Report. Pure helpers live in `compareLogic.ts` (connectors, highlight and
  marker builders, highlight-id round trip, `describeSide`, `verdictOf`,
  `regionPlayItems`, `carriedPlayTarget`, `opCounts`, `formatSeconds`,
  `formatPercent`).
- **Report (`#/report/:aId/:bId`)**: the same computation rendered read-only:
  downloads first, the two versions' facts, the three numbers, the regions table
  with verdicts (link back to Compare to change them), the carried fix requests
  with their outcome, status and the region(s) they landed on with their
  verdicts (a tap brings the region row into view), the generation date, and
  full hashes plus the settings used inside a TechnicalDetails. Same refusals
  as Compare. Downloads rebuild the
  report with a fresh timestamp and are named
  `bead-compare-<passage>-<A label>-vs-<B label>.md|json` through `safeFilename`.

## Report (`src/export/report.ts`)

```ts
export const REPORT_APP_NAME = "Bead Compare"; export const REPORT_FORMAT_VERSION = 1;
export interface ReportRegion { index: number /* 0-based; shown as index + 1 */; kind: RegionKind; a_start_s: number; a_end_s: number; b_start_s: number; b_end_s: number; verdict: Verdict }
export interface ReportCarried { comment_id: string; author: string; kind: CommentKind; status: "open" | "resolved"; text?: string; has_audio: boolean; a_start_s: number; a_end_s: number; b_start_s: number; b_end_s: number; outcome: CarryOutcome; region_indexes: number[] /* 0-based, as ReportRegion.index */ }
export interface ReportVersion { label: string; tape_sha256: string; audio_sha256: string; mock: boolean; narrator?: string; recorded_at?: string; language?: string }
export interface ReportData {
  generated_at: string; passage: string; a: ReportVersion; b: ReportVersion; codebook_hash: string;
  stability: number; region_count: number; changed_seconds: number;
  regions: ReportRegion[]; carried: ReportCarried[]; settings: Settings;
  app: { name: string; format_version: number };
}
export interface BuildReportInput { passage: Passage; a: Version; b: Version; result: CompareResult; pair?: PairRecord; settings: Settings; generated_at: string }
export function buildReport(input: BuildReportInput): ReportData;     // seconds from frames with each tape's own frame rate; missing verdict → "undecided"
export function reportHasWarning(r: Pick<ReportData, "carried">): boolean;   // an OPEN request on unchanged material
export function carriedRegionLabels(r: Pick<ReportData, "regions">, c: Pick<ReportCarried, "region_indexes">, lang: Lang): string[];   // "Região 2 — <verdict>" per region
export function reportToMarkdown(r: ReportData, lang: Lang): string;   // headings and tables in the language; pipes escaped, newlines collapsed; carried table has status and region columns
export function reportToJson(r: ReportData): string;
export function formatSeconds(value: number, lang: Lang): string;      // "1,8" / "1.8"
export function formatPercent(value: number, lang: Lang): string;      // "92,8%" / "92.8%"
export function formatReportDate(value: string | undefined, lang: Lang): string | undefined;   // Intl medium date + short time; bare dates as written
export function describeSpan(startSeconds: number, endSeconds: number, lang: Lang): string;    // "0:00,6 – 0:01,0" or "em 0:01,4" for a point
export { downloadText } from "./download";
```

```ts
// src/export/download.ts
export function downloadBlob(filename: string, blob: Blob): void;                 // blob URL + temporary <a download>, revoked after 30 s
export function downloadText(filename: string, text: string, mime: string): void;
export function safeFilename(title: string, fallback?: string): string;            // ASCII-only (accents folded), reserved chars → "-", spaces → "_", max 120
```

## Error boundary

`App.tsx` wraps the routed screen in an error boundary keyed by the route; the
header and the settings panel stay outside it. The fallback shows a translated
message (`common.error.too_large` for `AlignmentTooLargeError`, otherwise
`common.error.screen_failed`), "reset settings and try again", "try again" and
the way back to the passages, with the error text inside technical details.

## Styling

One stylesheet `src/styles.css` with tokens on `:root` (warm off-white ground,
ink text, one teal accent, three region colours from the Okabe–Ito palette plus
a muted purple-grey for deleted, all distinguishable for colour-blind users, a
steel blue for a carried comment that landed on a change and the Okabe–Ito
vermilion for "no change detected here"),
plus one small `.css` per screen for screen-only rules. Components use class
names, no CSS-in-JS, no UI library. `:focus-visible` outlines, an `.sr-only`
helper, `prefers-reduced-motion` and one breakpoint at 720 px. Must work at
tablet width; phone width is best-effort.

## Tests

- `npm test` — vitest, node environment, `tests/**/*.test.ts` (db tests import
  `fake-indexeddb/auto`). Covers the model (grouping, alignment, regions,
  carry-forward, hashing), the fixtures, the db and the passage zip, the
  Recording parser, the report, the router, the settings, i18n parity, the
  strip geometry, the screen logic modules and the download names.
- `npm run test:e2e` — Playwright (`playwright.config.ts`): builds and serves the
  production bundle on port 4173 (a server already there is refused, never
  reused), headless Chromium with `--autoplay-policy=no-user-gesture-required`
  and fake media devices, a fresh context per test. `e2e/smoke.spec.ts` (12
  scenarios) walks the four screens through the UI: keys, markers and playback
  on Listen, region playback and verdicts on Compare, carry-forward with resolve
  and the report, downloads, the language toggle, the codebook refusal on
  Compare and Report, export/import, import refusals with their technical
  detail, the numbers policy (no codebook, sha256 or 64-hex string outside a
  closed `details.tech`), the settings panel (live recompute, comma decimal,
  reset) and a spoken comment recorded with the fake microphone.
  `e2e/tsconfig.json` type-checks the suite and the config
  (`npx tsc -p e2e/tsconfig.json --noEmit`); the main tsconfig and vitest never
  see `e2e/`.
