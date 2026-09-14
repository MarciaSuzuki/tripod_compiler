# Bead Compare — architecture and module contracts

This file is the agreement between the modules. The pure model (`src/model/`)
already exists and is tested; everything else is built against these
contracts. Keep public signatures as written here; add to them only when a
screen truly needs it, and record the addition here.

## Ground rules (from the brief)

- **Plays original audio only.** No synthesis, no vocoder, no render endpoint.
  The only sound the app makes is a slice of a decoded `audio.wav` or a
  consultant's own recorded comment.
- **Local-first.** Everything lives in IndexedDB. No backend, no cloud sync.
- **Beads are never shown as numbers.** No U/F values, frame indexes, sample
  counts or hashes anywhere in the UI except inside `<TechnicalDetails>`.
  Time positions (`mm:ss.s`), region counts, seconds changed and the
  stability percent are allowed because the brief asks for them.
- **UI text in Brazilian Portuguese by default**, English via toggle. Every
  visible string goes through `t()`.
- **Calm and uncluttered.** The consultant is listening, not reading.
- **Mock tapes carry a visible badge** wherever a tape is shown.
- Two tapes with different `codebook_hash` are never compared; the UI refuses
  with a clear message.

## Layout

```
src/
  main.tsx                 mounts <App/>
  App.tsx                  shell: header (title, language toggle, settings button), routes
  router.tsx               hash router: useRoute(), navigate()
  styles.css               design tokens + global styles (single stylesheet)
  settings.tsx             Settings persisted in localStorage; SettingsProvider/useSettings
  model/                   pure logic (exists; do not change signatures)
  i18n/
    index.tsx              I18nProvider, useI18n, t()
    strings/common.ts      strings shared by all screens (header, buttons, kinds, statuses)
    strings/passages.ts    Passage list screen
    strings/listen.ts      Listen screen
    strings/compare.ts     Compare screen
    strings/report.ts      Report screen
  db/
    db.ts                  IndexedDB open/upgrade + generic get/put/delete/getAll by index
    repo.ts                the Repo API used by screens (singleton `repo`)
    recording.ts           parseRecordingFiles(): folder or zip → ParsedRecording
    passageZip.ts          export/import one passage as a zip (fflate)
  audio/
    engine.ts              AudioEngine singleton: decode once, play by sample offset
    recorder.ts            microphone → Blob (MediaRecorder)
    format.ts              formatTime(seconds) → "m:ss.s"
  components/
    BeadStrip.tsx          the bead strip (SVG)
    Waveform.tsx           thin waveform (canvas)
    TechnicalDetails.tsx   the ONLY place tape numbers may appear
    SettingsPanel.tsx      grouping + alignment parameters
    MockBadge.tsx
    LanguageToggle.tsx
    PlayerControls.tsx     play / pause / loop buttons
    CommentEditor.tsx      typed and/or spoken comment for a span
    CommentList.tsx        comments under a strip; tap → play span + read/hear
  screens/
    PassageList.tsx        #/
    Listen.tsx             #/listen/:versionId
    Compare.tsx            #/compare/:aId/:bId
    Report.tsx             #/report/:aId/:bId
  export/
    report.ts              buildReport(), reportToMarkdown(), reportToJson(), downloadText()
tests/                     vitest unit tests (node env; fake-indexeddb for db tests)
e2e/                       Playwright smoke test against `vite preview` (npm run test:e2e)
fixtures/                  demo recordings; served as Vite publicDir so "Load demo" can fetch them
tools/                     mock_tape.py, make_fixtures.py
```

## Routes (`src/router.tsx`)

```ts
export type Route =
  | { name: "passages" }
  | { name: "listen"; versionId: string }
  | { name: "compare"; aId: string; bId: string }
  | { name: "report"; aId: string; bId: string };
export function parseRoute(hash: string): Route;      // unknown → passages
export function routePath(r: Route): string;           // "#/listen/abc"
export function useRoute(): Route;                     // subscribes to hashchange
export function navigate(r: Route): void;
```

## Settings (`src/settings.tsx`)

```ts
import type { Settings } from "./model";
export const SETTINGS_KEY = "bead-compare.settings.v1";
export function loadSettings(): Settings;              // DEFAULT_SETTINGS merged with stored
export function saveSettings(s: Settings): void;
export function SettingsProvider(props: { children: React.ReactNode }): JSX.Element;
export function useSettings(): { settings: Settings; update(next: Settings): void; reset(): void };
```

## i18n (`src/i18n/index.tsx`)

```ts
export type Lang = "pt-BR" | "en";
export type Dict = Record<string, string>;
export interface StringModule { "pt-BR": Dict; en: Dict }
export const LANG_KEY = "bead-compare.lang";
export function I18nProvider(props: { children: React.ReactNode }): JSX.Element;
export function useI18n(): { lang: Lang; setLang(l: Lang): void; t: T };
export type T = (key: string, vars?: Record<string, string | number>) => string;
export function translate(lang: Lang, key: string, vars?): string;  // for non-React code (report export)
```
- `index.tsx` merges every `strings/*.ts` module. A missing key returns the key
  itself and `console.warn`s in dev.
- Placeholders: `{name}` replaced from `vars`.
- Key naming: `screen.section.item`, e.g. `listen.comment.add`, `common.kind.fix_requested`.
- Each screen owns its strings file. `common.ts` owns: app title, nav, buttons
  (play/pause/loop/stop/save/cancel/delete/export/import/close), comment
  kinds, comment statuses, region kinds, verdicts, carry outcomes, mock badge,
  technical details, settings panel labels, codebook-mismatch message,
  generic errors.

## Database (`src/db/db.ts`, `src/db/repo.ts`)

Database name `bead-compare`, version 1. Stores:
- `passages` keyPath `id`
- `versions` keyPath `id`, index `by_passage` on `passage_id`
- `comments` keyPath `id`, index `by_version` on `span.version_id`
- `pairs` keyPath `id` (= `${a_version_id}::${b_version_id}`), index `by_passage`

```ts
export interface ParsedRecording {
  audio: Blob;            // audio.wav bytes
  tape: Tape;
  meta: Meta;
  warnings: string[];     // e.g. "meta.json missing"
}
export interface Repo {
  listPassages(): Promise<Passage[]>;                       // newest first
  getPassage(id: string): Promise<Passage | undefined>;
  createPassage(title: string): Promise<Passage>;
  renamePassage(id: string, title: string): Promise<void>;
  deletePassage(id: string): Promise<void>;                 // cascades versions, comments, pairs
  listVersions(passageId: string): Promise<Version[]>;      // in passage.version_ids order
  getVersion(id: string): Promise<Version | undefined>;
  addVersion(passageId: string, rec: ParsedRecording, label?: string): Promise<Version>; // computes both sha256; label defaults to meta.label or "v{n}"
  relabelVersion(id: string, label: string): Promise<void>;
  deleteVersion(id: string): Promise<void>;                 // cascades comments and pairs
  listComments(versionId: string): Promise<Comment[]>;      // by created_at
  addComment(c: Omit<Comment, "id" | "created_at">): Promise<Comment>;
  updateComment(id: string, patch: Partial<Omit<Comment, "id">>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  getPair(aId: string, bId: string): Promise<PairRecord | undefined>;
  setVerdict(passageId: string, aId: string, bId: string, regionKey: string, verdict: Verdict): Promise<PairRecord>;
  exportPassage(passageId: string): Promise<Blob>;          // zip, see layout below
  importPassage(zip: Blob | ArrayBuffer): Promise<Passage>; // ids are regenerated to avoid collisions
  clearAll(): Promise<void>;                                // for tests and a hidden "reset" in settings
}
export const repo: Repo;
```
- `getVersion` must be cheap to call repeatedly (it returns the stored record;
  the audio `Blob` is stored inside the version record).
- Import from a `Recording` (`src/db/recording.ts`):
  ```ts
  export function parseRecordingFiles(files: File[]): Promise<{ recording?: ParsedRecording; errors: string[] }>;
  ```
  Accepts either the files of one folder (from `<input webkitdirectory>` or a
  multi-file picker) or a single `.zip`. Finds `audio.wav`, `tape.json`,
  `meta.json` at any depth (a zip may wrap a top-level folder). `tape.json`
  is validated with `parseTape`; every problem becomes an error. Missing
  `meta.json` is a warning. Missing audio or tape is an error.
- Passage zip layout (`src/db/passageZip.ts`):
  ```
  passage.json                       { format: "bead-compare-passage", format_version: 1,
                                       passage, versions: [{ id, label, meta, tape_sha256, audio_sha256, imported_at }],
                                       comments: [{ ...comment without audio_blob, audio_file: "comments/<id>.webm" | null }],
                                       pairs: [PairRecord] }
  versions/<version_id>/audio.wav
  versions/<version_id>/tape.json
  versions/<version_id>/meta.json
  comments/<comment_id>.<ext>        spoken comment blobs
  ```

## Audio (`src/audio/engine.ts`)

```ts
export interface LoadedAudio {
  buffer: AudioBuffer;
  durationSeconds: number;
  peaks(buckets: number): Float32Array;   // 0..1 max-abs per bucket, cached per bucket count
}
export interface PlayItem { versionId: string; startFrame: number; endFrame: number; frameRate: number }
export interface PlayState { versionId: string; frame: number; playing: boolean; item: PlayItem }
export class AudioEngine {
  static get(): AudioEngine;                                  // singleton; AudioContext created lazily on first play (autoplay policy)
  load(versionId: string, audio: Blob): Promise<LoadedAudio>; // decodes once; cached by versionId
  loaded(versionId: string): LoadedAudio | undefined;
  unload(versionId: string): void;
  play(item: PlayItem, opts?: { loop?: boolean }): void;      // stops anything playing first
  playSequence(items: PlayItem[], opts?: { gapSeconds?: number; loop?: boolean }): void; // A then B with a gap
  stop(): void;
  toggle(): void;                                             // pause/resume the current item
  get state(): PlayState | null;
  subscribe(cb: (s: PlayState | null) => void): () => void;   // called on every animation frame while playing, and once on stop
}
```
- Playback is by **sample offset**: `offset = startFrame / frameRate` seconds,
  `duration = (endFrame - startFrame) / frameRate`, through an
  `AudioBufferSourceNode`. Never through any other API.
- A zero-length item (start === end) plays nothing and resolves immediately.
- `src/audio/recorder.ts`:
  ```ts
  export function canRecord(): boolean;
  export function startRecording(): Promise<{ stop(): Promise<Blob>; cancel(): void }>;
  ```
- `src/audio/format.ts`: `formatTime(seconds: number): string` → `"0:03.4"`;
  `frameTime(frame, frameRate)`.

## Components

```ts
// BeadStrip.tsx — SVG. Width fills its container (ResizeObserver), height default 56.
export interface StripHighlight { range: FrameRange; kind: RegionKind | "carried" | "carried_warning"; id: string; active?: boolean }
export interface StripMarker { range: FrameRange; kind: CommentKind; status: CommentStatus; id: string; active?: boolean; carried?: boolean }
export interface BeadStripProps {
  clusters: Cluster[]; totalFrames: number; frameRate: number;
  height?: number;
  selection?: FrameRange | null;
  cursorFrame?: number | null;
  highlights?: StripHighlight[];
  markers?: StripMarker[];
  onTapCluster?(c: Cluster): void;
  onSelect?(range: FrameRange): void;      // drag across beads; range snaps to cluster bounds
  onTapHighlight?(id: string): void;
  onTapMarker?(id: string): void;
  onWidth?(px: number): void;              // reports the drawn width so Compare can draw connectors
  ariaLabel?: string;
}
export function BeadStrip(props: BeadStripProps): JSX.Element;
export function frameToX(frame: number, totalFrames: number, width: number): number;
```
- Beads: rounded rects, width ∝ duration, 2 px gap; pause clusters are gaps
  (nothing drawn, or a faint dotted baseline). Phrases: a thin line under the
  beads of each phrase. Colours come from CSS variables in `styles.css`
  (`--bead`, `--bead-active`, `--region-substituted`, `--region-inserted`,
  `--region-deleted`, `--region-melody`, `--carried`, `--carried-warning`, …).
- Selection: a translucent overlay; cursor: a 2 px vertical line.
- Keyboard focusability is handled by the screen, not the strip.

```ts
// Waveform.tsx — canvas. Same width as the strip beneath it.
export function Waveform(props: { peaks: Float32Array | null; totalFrames: number; cursorFrame?: number | null; selection?: FrameRange | null; height?: number }): JSX.Element;
// TechnicalDetails.tsx — <details> collapsed by default; children may show numbers.
export function TechnicalDetails(props: { children: React.ReactNode; summary?: string }): JSX.Element;
// SettingsPanel.tsx — dialog; edits every field of Settings via useSettings.
export function SettingsPanel(props: { open: boolean; onClose(): void }): JSX.Element;
export function MockBadge(props: { tape: Pick<Tape, "mock"> }): JSX.Element | null;
export function LanguageToggle(): JSX.Element;
export function PlayerControls(props: { playing: boolean; loop: boolean; onPlay(): void; onPause(): void; onStop(): void; onToggleLoop(): void; disabled?: boolean }): JSX.Element;
export function CommentEditor(props: { span: Span; author: string; onSave(c: Omit<Comment, "id" | "created_at">): void; onCancel(): void }): JSX.Element;
export function CommentList(props: { comments: Comment[]; frameRate: number; activeId?: string | null; onTap(c: Comment): void; onResolve?(c: Comment): void; onDelete?(c: Comment): void }): JSX.Element;
```

## Screens

- **PassageList (`#/`)**: create passage (title), list passages newest first;
  each passage card shows its versions in order with label, date, narrator,
  short hashes inside a TechnicalDetails; buttons: import Recording (folder or
  zip) as a new version, open Listen, pick A and B → Compare, export passage
  zip, import passage zip, delete. A "Load demo passage" button fetches the
  two fixtures from `./ruth-1-1-5/v1|v2/{audio.wav,tape.json,meta.json}`
  (Vite `publicDir` is `fixtures/`).
- **Listen (`#/listen/:versionId`)**: as in the brief. Author name is a small
  text field remembered in localStorage (`bead-compare.author`).
- **Compare (`#/compare/:aId/:bId`)**: as in the brief; verdicts via
  `repo.setVerdict`; carried comments derived with `compareTapes` each time.
  A carried comment offers "mark resolved" on the original (status →
  resolved). Link to Report.
- **Report (`#/report/:aId/:bId`)**: renders the report and offers
  Markdown / JSON downloads via `downloadText`.

## Report (`src/export/report.ts`)

```ts
export interface ReportRegion { index: number; kind: RegionKind; a_start_s: number; a_end_s: number; b_start_s: number; b_end_s: number; verdict: Verdict }
export interface ReportCarried { comment_id: string; author: string; kind: CommentKind; text?: string; has_audio: boolean; a_start_s: number; a_end_s: number; b_start_s: number; b_end_s: number; outcome: CarryOutcome }
export interface ReportData {
  generated_at: string; passage: string; a: { label: string; tape_sha256: string; audio_sha256: string; mock: boolean; narrator?: string; recorded_at?: string };
  b: { …same }; codebook_hash: string; stability: number; region_count: number; changed_seconds: number;
  regions: ReportRegion[]; carried: ReportCarried[]; settings: Settings;
}
export function buildReport(input: { passage: Passage; a: Version; b: Version; result: CompareResult; pair?: PairRecord; settings: Settings; generated_at: string }): ReportData;
export function reportToMarkdown(r: ReportData, lang: Lang): string;
export function reportToJson(r: ReportData): string;
export function downloadText(filename: string, text: string, mime: string): void;   // blob URL + <a download>
```

## Styling

One stylesheet `src/styles.css` with tokens on `:root` (warm off-white
ground, ink text, one accent, four region colours that remain distinguishable
for colour-blind users, a warning colour for "no change detected here").
Components use class names, no CSS-in-JS, no UI library. Must work at
tablet width; phone width is best-effort.
