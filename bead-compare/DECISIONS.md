# Decisions

Every choice the brief left open, one line each. Grouped by area.

## Model and alignment

- A bead is one frame; a cluster is a run-length-encoded run of equal U values, and any run shorter than `min_cluster_frames` (default 3 = 60 ms) merges into its left neighbour.
- Exceptions to "merge left", one per case:
  - a short first run merges into its right neighbour;
  - a short speech run after a pause merges right when the right neighbour is speech, so the start of a phrase is not swallowed by the pause before it;
  - a short speech burst between two pauses is absorbed into the left pause;
  - a tape that is one short run stays one cluster.
- Two adjacent clusters that end up with the same U after merging are not merged again; a cluster is a run of the original tape plus what it absorbed.
- A merged cluster takes the U value of the run that absorbed it.
- Phrases are numbered on speech clusters only; pause clusters carry `phrase: null`; a tape without `pause_unit` is one phrase.
- Alignment is Needleman–Wunsch over cluster sequences on U only: match +2, mismatch −1, gap −1 by default; ties prefer diagonal, then "consume A", then "consume B", which keeps runs of matches contiguous.
- The alignment refuses (AlignmentTooLargeError) instead of allocating when the traceback table would exceed 200 MB; Compare and Report show a message asking for a larger minimum group size, and the app's error boundary catches anything else a screen throws.
- Cluster duration is ignored by the aligner (a 3-frame and a 40-frame cluster with the same U match equally), as the brief asks.
- Memory: one byte of traceback per cell plus two score rows, so a 5-minute recording with ~3000 clusters costs about 9 MB.
- Region kinds: mismatch → substituted, gap in A → inserted (in B), gap in B → deleted (from B), matched clusters whose mean voiced F differs by more than `melody_threshold` (default 3 F units) → melody. Pause clusters and fully unvoiced clusters never produce melody regions.
- Regions separated by fewer than `merge_gap_frames` (default 10 = 200 ms) matched **B** frames merge into one region that also covers the matched material between them.
- A merged group takes the kind of its parts when they agree; otherwise substituted when any part is substituted or when insertions and deletions are both present; otherwise inserted, then deleted, then melody.
- A region with no frames on one side (pure insertion or deletion) is a zero-length point on that side, placed just after the previous cluster on that side.
- Stability score = percent of B frames that lie in matched clusters (melody-only differences still count as matched sound); one decimal.
- An empty B against a non-empty A reads as 100% stable with one deleted region (0 of 0 frames matched); the degenerate case is left as is.
- Changed seconds = sum over regions of the longer side of each region, measured in B's frame rate.
- Verdicts are keyed by a region signature (`kind|a:start-end|b:start-end`) so they survive a re-computation; a verdict whose region disappears after a settings change is simply not shown.
- Comments carry forward through a frame mapper: a frame inside a matched or mismatched cluster maps proportionally into the aligned B cluster; a frame inside a deleted cluster maps to the point just after the last B cluster seen; the end of A maps to the end of B.
- An exclusive span end maps by closing the aligned B cluster, so a comment at the tail of A does not swallow material inserted after it in B.
- Every `fix_requested` comment written on A carries forward, open or resolved (`isCarriedSource`); notes, approvals and copies carried onto A from an earlier version stay where they are.
- Resolving a carried request (on Compare, or on Listen for B) keeps it in the Compare list and in the Report with its status, so the confirmation is not lost from the hand-off; Compare offers "Reabrir" to undo it.
- Each carried request lists the regions it overlaps (`region_indexes`); Compare and the Report link every request to those regions and show their verdicts, which are the record of the check.
- The "no change detected" warning line counts open requests only: a resolved one has been dealt with.
- Carry outcome: "changed here" when the span (on A or on B) overlaps any region, otherwise "no change detected here". A zero-length region side (a pure insertion or deletion point) counts only when it lies strictly inside the span: a cluster that merely borders an inserted or deleted cluster did not change.
- Carried comments are derived on every Compare/Report computation; the alignment is the source of truth.
- They are then persisted onto B as copies with `carried_from` = the source id, one per source; a re-opened Compare updates a copy in place and never duplicates it.
- A copy's status mirrors its source: `carried` while the source is open, `resolved` once it is resolved, `carried` again when it is reopened.
- Listen on B shows the copies with the "carried" label and dashed markers; they cannot be deleted there, and resolving one there resolves the source on A.
- A copy whose source was deleted is removed: right away by `deleteComment`, otherwise on the next sync.
- Two tapes with different frame rates are refused by Compare and Report at the screen level (the model itself aligns on clusters and uses B's rate for seconds, as tested).
- `codebook_hash` is compared as an exact string; a mismatch throws before any alignment.
- Frame ranges are half-open (`start` inclusive, `end` exclusive) everywhere: spans, clusters, regions and play items.

## Import

- Import problems are structured diagnostics (`{ code, vars }`), translated by the passage screen (`passages.import.*`) into one sentence plus an optional detail.
- The sentence never carries the parser's English or the file's numbers: a raw `detail` var (a JSON parse error, a tape.json field check) and the file's sample rate, frame rate and durations (translated `*.detail` templates) go into a collapsed technical-details block under the sentence.
- A Recording is accepted as a folder pick (`webkitdirectory`, or a multi-file pick) or as one `.zip`; the three files are found at any depth by case-insensitive basename, `__MACOSX`, `._*`, `.DS_Store` and directory entries are skipped, and two candidates at the same depth is an error rather than a guess.
- `audio.wav` and `tape.json` are required; `meta.json` is optional and a broken one is ignored with a warning; only its five known string fields are kept.
- The importer reads the WAV `fmt ` and `data` chunks and warns (never refuses) when the audio is not 16 kHz mono 16-bit PCM, when `frame_rate` is not 50, or when audio and tape durations differ by more than 0.5 s.
- Only the first 64 KB of a WAV are read to find its header, so a large file is not loaded twice; a data-chunk size left as 0 or 0xFFFFFFFF by a streaming writer is capped by the file size.
- The version label is `meta.label`, else `v{n}` by position in the passage.
- The demo passage is fetched from the served fixtures and pushed through the same `ParsedRecording` path as a folder import, so it is a real import, not a special case.

## Storage

- Everything lives in one IndexedDB database, `bead-compare` version 1, with four stores (`passages`, `versions`, `comments`, `pairs`); the audio bytes of a version and of a spoken comment are stored as Blobs inside their records, not in separate stores.
- `passage.version_ids` is the ordering source of truth for versions; anything unlisted goes last by import time.
- A transaction awaits only IndexedDB requests; hashing, `Blob.arrayBuffer()` and fetches happen before it opens, so the transaction never auto-commits underneath the code.
- A `versionchange` or `close` from another tab drops the shared connection so the next call reopens cleanly.
- `tape_sha256` is the SHA-256 of the canonical JSON of the parsed tape (`JSON.stringify`, mock flag only when true), not of the file's bytes, so it survives export/import; `audio_sha256` is the hash of the wav bytes.
- The interface labels the former "canonical JSON" everywhere it appears; `sha256sum tape.json` does not reproduce it, `tools/tape_hash.py` does, and `tests/fixtures.test.ts` pins the fixtures' values so the canonical form cannot drift silently.
- SHA-256 uses WebCrypto in a secure context and a pure-JS implementation otherwise, so imports work over plain http on a LAN; only the microphone needs https/localhost.
- Ids are `crypto.randomUUID()` with a Math.random fallback; a pair's id is `${aId}::${bId}`.
- A passage exports as one zip: `passage.json` (the manifest), `versions/<id>/{audio.wav,tape.json,meta.json}` and `comments/<id>.<ext>`; the format is `bead-compare-passage` version 1.
- The manifest keeps the exporter's ids; the importer regenerates every id, remaps `carried_from` and the pair keys, and recomputes the hashes from the bytes it holds.
- Comments and pairs whose versions are not in the zip are dropped on import.
- The spoken-comment file names come from `passageZip.commentAudioExt` (`audio/mp4` → `mp4`); `recorder.extensionForMime` (`audio/mp4` → `m4a`) is a helper the app does not use for file names.
- A passage import keeps the manifest's `created_at` and each version's `imported_at`, falling back to "now"; each label is recomputed as manifest label → `meta.label` → `v{n}`.
- The zip is deflated at level 6, on the main thread; a missing comment audio file inside a zip is a warning, a missing version file an error.
- Deleting a version or a passage cascades to its comments and pairs; deleting a comment also deletes the copies carried from it.
- Settings, language and author name live in localStorage under `bead-compare.settings.v1`, `bead-compare.lang` and `bead-compare.author`; every read and write is guarded, so a browser that blocks storage still runs the app for the session.
- Stored settings are deep-merged over the defaults by key and by primitive type (numbers must be finite), so a field added later gets its default and a corrupt value falls back silently.
- "Clear all local data" empties the four stores, drops every decoded buffer, fires `bead-compare:data-cleared` on `window` so open screens reload, and goes back to the passage list; it needs a confirmation and leaves localStorage alone.

## Audio

- The only sound path from a recording is `AudioBufferSourceNode.start(when, offset, duration)` on the buffer decoded once from `audio.wav`; the only other sound is an `<audio>` element playing the consultant's own recorded comment.
- The audio engine keeps at most 4 decoded versions (LRU; the playing ones are never evicted) and creates its AudioContext at 16 kHz so a decode does not upsample; "clear all local data" and deleting a passage drop the decoded buffers.
- The AudioContext is created lazily on the first decode or play, never at page load, and `resume()` is called inside the tap that starts playback so browsers' autoplay policy is satisfied; concurrent loads of one version share one decode.
- Pause suspends the whole context instead of stopping and remembering a position, so an A–gap–B sequence keeps its timing sample-accurate across a pause; the engine is the only user of the context.
- Loops are scheduled one iteration ahead on the context clock (iteration k+2 is queued when k ends), so repeats are gapless apart from the deliberate gap: 0.3 s between repeats of one item, 0.6 s between A and B and between repeats of the pair.
- Playback is scheduled 0.03 s ahead of the context clock (`LEAD_SECONDS`) so the first source never starts in the past.
- The cursor frame is derived from `ctx.currentTime` on every animation frame, never from a timer, so it cannot drift; subscribers get a state on every frame while playing, once on pause/resume, and `null` once on stop.
- A zero-length or out-of-range item plays nothing; a sequence with nothing to play emits no state at all.
- Tapping a bead plays its whole cluster; a drag plays the snapped span; playing with no selection plays the whole recording; leaving a screen stops playback.
- Toggling loop during a session (playing or paused) restarts the same target with the new flag, on Listen and on Compare alike.
- The waveform is decoration: max-abs peaks per pixel bucket of channel 0, cached per bucket count, drawn on a canvas that is `aria-hidden` and has no pointer handlers; there is no cursor seek anywhere.
- Spoken comments use MediaRecorder with the first supported type among webm/opus, webm, ogg/opus and mp4, with 1 s timeslices; the microphone is released on stop, cancel and unmount, and a stream that arrives after a cancel (the permission prompt was still up) is released at once.
- Decode failures and microphone failures are shown as translated messages on the screen, never thrown to the error boundary.

## UI

- One stylesheet with tokens on `:root` and one small `.css` per screen; plain class names, no CSS-in-JS, no UI library.
- Warm off-white ground, ink text, one teal accent; each area has one primary button (create passage, compare A and B, add comment, save, download Markdown).
- Region colours are three from Okabe–Ito (orange substituted, bluish green inserted, blue melody) plus a muted purple-grey for deleted, so they stay apart for colour-blind readers; a carried comment that landed on a change is steel blue, "no change detected here" is Okabe–Ito vermilion (far from the orange) and is also drawn with a 2 px dashed outline so the one warning on the strip reads without colour.
- Beads are rounded rectangles whose width is proportional to duration, with a 2 px gap and a 1 px minimum; pause clusters draw only a faint dotted baseline; each phrase gets a thin line under its beads; the selection is a translucent overlay; the cursor is a 2 px line; comment markers are 8 px bars under the phrase line, hollow when resolved, dashed when carried.
- The whole recording always fits the strip's width; there is no zoom, so long recordings get dense strips and a dense connector band.
- The connector band draws one light line per matched pair of speech clusters, from cluster centre to cluster centre; a mismatch also gets a dashed line in the region colour; gaps and pauses draw nothing.
- A tap on a highlight wins over the bead under it; a tap on a marker wins over both; a pointer move beyond 4 px turns a tap into a drag.
- Numbers policy: outside `<details class="tech">` the interface shows only time positions (m:ss.s), region ordinals and counts, changed seconds and the stability percent; frame counts, frame rate, U/F series, cluster counts, alignment score and op counts, ids, hashes, the settings JSON and the numbers of an import warning (sample rate, frame rate, durations) live inside technical details, which start closed on every screen (asserted by the e2e suite).
- The U/F series inside technical details is cut at 60 values with an ellipsis (`SERIES_LIMIT`).
- Beads have no visible label; their accessible name is their time position; frame indexes live only in `data-*` attributes.
- Accessible names everywhere: the settings icon button (aria-label, title, aria-haspopup), the language toggle (aria-pressed, full-name titles) and the player buttons (aria-label and title).
- Also named: the A/B radios (per version), the verdict select (screen-reader-only label), the region row (a screen-reader-only "Play region N:" prefix keeps the visible words in the name) and the comment markers ("kind, author, range").
- Roles: the connector SVG is `role="img"`, each strip `role="group"`, the waveform `aria-hidden`.
- Hit areas: a zero-length highlight is hit within 4 px (`HIGHLIGHT_HIT_SLOP_PX`), a point highlight is drawn 3 px wide, and a marker narrower than 6 px is widened to 6 px.
- Heights: the Listen waveform is 36 px over a 64 px strip; the Compare strips are 56 px with a 28 px connector band between them.
- One breakpoint at 720 px collapses the version grid, region rows, report facts and the settings panel, and hides the player button labels except the region player's primary one.
- `prefers-reduced-motion` turns transitions off; `:focus-visible` gets an accent outline; phone width is best-effort.
- The settings panel is a right-side dialog: focus moves into it, Esc closes it, values apply on every usable keystroke (Compare recomputes live), an unusable draft is marked and snaps back on blur, and the panel also carries the language selector, reset and clear-all.
- The settings fields are text fields with `inputmode="decimal"`, not `type="number"`: a number input lets the browser rewrite the draft before the app sees it (Chromium turns "0,5" into 5), so the draft goes to `parseFieldValue` untouched and a comma or a dot is the decimal mark.
- Field rules (`FIELDS`): the bead counts (minimum group size ≥ 1, merging distance ≥ 0) are whole numbers; the match score, both penalties and the melody sensitivity are ≥ 0 and accept decimals; negative values, text and exponents are refused, and an unusable draft leaves the stored value untouched.
- The error boundary wraps only the routed screen and is keyed by the route, so the header and settings stay usable; its fallback offers "reset settings and try again", "try again", the way home, and the error in technical details.
- Downloads go through a blob URL and a temporary `<a download>` revoked after 30 s; file names are ASCII-folded (Chromium drops a name with a non-ASCII character), spaces become `_`, and the report files are `bead-compare-<passage>-<A>-vs-<B>.md|json`, the passage export `<folded title>.zip` (the demo exports as `Rute_1-1-5_(demonstracao).zip`).
- The footer on every screen states that only original recordings are played and nothing is synthesized.

## Screens

- Hash routing (`#/`, `#/listen/:id`, `#/compare/:a/:b`, `#/report/:a/:b`) so the static build works from any path; ids are URI-encoded in the hash; anything unknown or malformed falls back to the passage list.
- Screens take no props and read their ids from the route; the routed element is keyed by the route path, so a change of parameters remounts the screen with fresh state.
- Passage list: passages newest first; the A/B pickers are radios constrained to A before B in version order, defaulting to the previous and the latest version; the Compare button is disabled until two versions exist.
- On the card the A radio is disabled on the last version and the B radio on the first; picking A at or past B pushes B one forward, picking B at or before A pulls A one back.
- "Load demo passage" is a real import of the two served fixtures, titled in the interface language; it creates a new passage every time it is pressed and nothing de-duplicates.
- Listen: a tap selects and plays; a drag selects a cluster-snapped span and plays it; keyboard selection steps move by speech clusters and absorb pauses, so a step always adds or removes something audible and a selection never shrinks below one speech cluster.
- Listen keys: Space play/pause, ←/→ grow, Shift+←/→ shrink, `c` comment, Esc stop and close the editor; keys are left alone on text fields, `<select>`, contentEditable, media elements, and Space on buttons and `<summary>`; chords with Ctrl, Meta or Alt are ignored.
- Keyboard details: with no selection either arrow selects the first speech cluster; Shift+→ drops the first group of the selection and Shift+← the last (the arrow names the direction the boundary moves); Shift+C is not a shortcut.
- The comment editor opens for the current selection only, focuses its text field so typing never triggers shortcuts, defaults to kind "note", and saves only with text or a recording; the author name is remembered per browser with a translated fallback ("Consultor(a)").
- Compare: A above B; tapping a region plays A, a 0.6 s gap, then B; tapping a bead on either strip plays that cluster alone; the verdict select is optimistic and reverts to the stored value when the write fails; the active region is tracked by its key so it survives a settings change.
- Compare's carried list shows each request's status next to its outcome, links it to the region(s) it overlaps with their verdicts (a tap selects and plays the region), and offers "mark as resolved" on an open request and "reopen" on a resolved one.
- Compare and Report refuse a codebook mismatch, a frame-rate mismatch and a pair too large to align with the header, one translated sentence and (on Compare) the two codebooks inside technical details; no strip is drawn.
- A carried request whose span lands nowhere on B (a deleted tail) offers "play on A" with a note, instead of a silent button.
- Report: verdicts are read-only with a link back to Compare; the downloads rebuild the report with a fresh timestamp; full hashes appear in the files and inside technical details only; the JSON carries an `app` block (`name`, `format_version` 1) so a later reader can tell formats apart.
- The report's carried table carries the status and the region(s) with their verdicts (a tap brings the region row into view; no anchor links, the hash belongs to the router); the JSON adds `status` and `region_indexes` to each carried entry, still format 1 (additive).
- The Markdown report puts the two versions' facts, one hash table (short and full), the summary, the regions table, the carried table with the warning line when needed, and a footer with the generation date and the settings used.
- Markdown table cells escape pipes, collapse newlines and strip backticks inside code spans.

## i18n

- Brazilian Portuguese is the default; English is the second language; every visible string goes through `t()`, keys are `screen.section.item`, each screen owns its module and `common.ts` holds what is shared.
- Components hold no strings: labels arrive as props (`labels`, `label`, `summary`), so the strings tests cover every word a component can show.
- A missing key returns the key itself and warns once in dev, never in tests.
- Import diagnostics are codes translated at render time, so switching the language re-translates an import report already on screen.
- `<html lang>` follows the toggle and `index.html` starts as `pt-BR`; the choice persists in localStorage.
- Dates, seconds and percentages are formatted with `Intl` for the active language; time positions use the language's decimal mark for the tenths (`0:03,4` in pt-BR, `0:03.4` in en), like the seconds and the percent.
- Plural forms exist only where a count precedes a noun (`compare.summary.regions_one/other`, `report.summary.regions_one/other`); other counts are label-style.
- The Markdown report is written in the active language; the JSON keeps English identifiers and enum values in both.
- pt-BR word choices: "conta" for bead, "grupo" for cluster, "região", "decisão" for verdict, "Correção solicitada" for fix requested, "Transferido" for carried, "Fita simulada" for mock tape, "trecho" for a span; inclusive "Narrador(a)", "Autor(a)", "Consultor(a)"; gender agreement with "gravação" ("Gravada em", "Importada em"); Brazilian rather than European phrasing ("isso", "salvos neste navegador", "transferida para").
- One word for the settings everywhere: "Configurações" (never "ajustes" or "parâmetros"); "gravação" is the narrator's recording, so the comment editor says "Parar de gravar" and "Descartar áudio" for the spoken note.
- Both dictionaries must define the same keys with the same `{placeholders}`, no empty values and no key in two modules; `tests/i18n.test.ts` enforces it.

## Testing

- Unit tests run under vitest in the node environment from `tests/**/*.test.ts`; db tests use `fake-indexeddb`; nothing needs a browser.
- The model is tested on compact synthetic tapes (`tests/helpers.ts` builds a tape from `[u, frames]` runs) and on the shipped fixtures, which must produce exactly substituted, inserted and melody, in that order, with stability above 85%.
- Carry-forward boundary cases are pinned to the fixtures: v1's clusters 172–186 and 186–196 border the insertion point and read "no change detected", 172–196 across it reads "changed here".
- The i18n test is the guard against string drift; the download test pins the file-name shape the e2e suite relies on.
- The e2e suite (Playwright, 12 scenarios) runs against the production bundle served by `vite preview` on port 4173, one fresh browser context per test, and drives everything through the UI (no writes into IndexedDB from the test; reading localStorage is allowed); persistence is checked with `page.reload()` inside a test.
- A server already on 4173 is never reused (`reuseExistingServer: false`): the build rewrites `dist/` and a stale preview could answer the first request mid-rebuild, so Playwright refuses to start and names the port instead.
- The fake microphone (`--use-fake-device-for-media-stream`) records a real spoken comment in the suite, which follows it onto B, into the report's audio column and into the export zip.
- Headless Chromium is launched with `--autoplay-policy=no-user-gesture-required` and fake media devices; since there is no speaker to assert on, the Listen test proves playback by the pause label and the cursor's `x1` advancing.
- The e2e suite asserts the numbers policy: the main text must not match `codebook`, `sha256` or a 64-hex string on Listen (with a selection), Compare and Report, and every `details.tech` must start closed.
- `@playwright/test` is declared as `^1.56.1` and resolved to 1.56.1 by `package-lock.json`, whose Chromium revision matches the browser preinstalled in the build environment; a preinstalled binary is used when present, so no `playwright install` is needed there.
- `e2e/` has its own tsconfig (DOM + node types) that also checks `playwright.config.ts`; the main tsconfig and vitest never see `e2e/`.
- Test artefacts (`test-results/`, `playwright-report/`, `blob-report/`) are ignored; no test changes git state.

## Build and deployment

- Vite with a relative `base` (`./`), so `dist/` works at a Vercel root, in a sub-folder, or from `file://` for a quick look.
- `fixtures/` is Vite's `publicDir`, so the demo Recordings ship inside `dist/` and "Load demo passage" needs no upload.
- `vercel.json` runs `npm run build`, serves `dist/` and rewrites every path to `index.html`; the hash router needs no server routes.
- `npm run build` typechecks first; the build fails on a type error.
- Dependencies stay minimal: React, ReactDOM and fflate at runtime; no CDN scripts, fonts or analytics.

## Mock scribe (`tools/mock_tape.py`)

- Standard library only, so it runs anywhere Python 3 runs; no numpy.
- Pause = RMS of a centred 40 ms window below −45 dBFS; U = 49 for pauses.
- U for speech comes from the spectral shape, not the pitch: which formant-sized band (7 bands: <250, 250–600, 600–1000, 1000–1600, 1600–2500, 2500–4000, 4000+ Hz) is loudest and which is second, giving 49 speech codes in 1..50 that skip 49.
- F = autocorrelation pitch on the 40 ms window, quantised to 1..31 on a log scale between 70 and 400 Hz; 0 when unvoiced; forced to 0 on pause frames.
- Both U and F are median-smoothed over 5 frames, U only across speech frames.
- Mock tapes carry `"mock": true` and a constant `codebook_hash` (`sha256(bead-compare-mock-codebook-v5)`) so mock tapes compare with each other but never with a real O Escriba tape.
- Any wav sample rate and channel count is accepted (mixed to mono, linearly resampled to 16 kHz); 8-, 16- and 32-bit PCM.
- The output is deterministic (no randomness), about 2 s of work per 6 s of audio; `audio.wav` gets `tape.json` next to it, any other name gets `<name>.tape.json`, and `-o` overrides both.

## Tape hash (`tools/tape_hash.py`)

- Standard library only; prints the SHA-256 of the canonical JSON of a tape.json, the value the app shows as "Hash da fita (JSON canônico)".
- It mirrors `parseTape` + `JSON.stringify`: fixed key order, no spaces, `pause_unit` only when present, `mock` only when true, integral floats written without a fraction.

## Demo fixtures (`tools/make_fixtures.py`)

- The demo voice is synthetic (two stationary formants per "syllable" over a 120 Hz fundamental, noise through a resonator for fricatives), so no person's voice is shipped in the repo.
- v2 carries exactly three edits: a substituted syllable, an inserted syllable, and one phrase spoken about four semitones higher; small timing jitter mimics a re-recording; `tests/fixtures.test.ts` asserts Compare reports exactly those three regions in that order.
- The fixture metadata is Brazilian Portuguese (`Rute 1:1-5`, `v1 rascunho`, `v2 revisão (3 mudanças)`, narrator "Voz sintética (demo)") because the demo is what a pt-BR consultant sees first.
- Fixtures are committed as folders, not zips (the repository ignores `*.zip`); the generator is seeded, so re-running it reproduces the same bytes and hashes.
- `fixtures/` is Vite's `publicDir`, so the app can offer "Load demo passage" with no upload step.
