# Bead Compare

## What it is

Bead Compare is a browser app for consultant checking in Oral Bible Translation. A
consultant opens one recorded version of a passage and sees it as a strip of **beads**.
Each bead is one 20 ms slice of the real recording, described by its *O Escriba* tape
(the U and F streams). Touching a bead plays the storyteller's own voice at that spot.
The consultant can play any span, attach a typed or spoken comment to it, line up two
versions of the same passage to see and hear where the newer one differs, and carry each
requested fix forward onto the newer version to confirm it was made. The result is a
report the team can keep.

## What it is not

Bead Compare **never synthesizes audio**. It never calls a vocoder. The only sounds it
makes are slices of the original `audio.wav` and the consultant's own recorded comments.
It does not edit audio, does not dictate onto beads, does not transcribe, and has no
back-translation editor. It has no backend and no cloud sync. Everything stays in the
browser that imported it; a passage leaves that browser only as a zip the consultant
exports on purpose.

## Requirements and how to run

- Node.js 20 or newer, with npm.
- A current browser with Web Audio and IndexedDB (Chrome, Edge, Firefox, Safari).
  Spoken comments need a microphone and a secure page (`https://` or `localhost`).
- Python 3 for the scripts in `tools/` (standard library only).

Run every command inside the `bead-compare/` folder:

```sh
npm install
npm run dev          # development server at http://localhost:5173
npm run build        # typecheck, then a static production build in dist/
npm run preview      # serve dist/ at http://localhost:4173
npm test             # unit tests (vitest, 260 tests)
npm run test:e2e     # Playwright smoke test against the built bundle
npm run typecheck    # tsc only, no build
```

`npm run test:e2e` builds the app and serves `dist/` on port 4173 by itself, then runs
the 12 scenarios of `e2e/smoke.spec.ts` in headless Chromium (about half a minute after
the build). A server already listening on 4173 is never reused, because the build would
rewrite `dist/` underneath it: the run refuses to start and names the port, so stop
`npm run preview` (or a previous run) first. `npx playwright test --repeat-each 2` runs
the suite twice to catch flakes. `@playwright/test` is declared as `^1.56.1` and resolved
to 1.56.1 by `package-lock.json`; a Chromium preinstalled at `/opt/pw-browsers/chromium`
(or the path in `PLAYWRIGHT_CHROMIUM_EXECUTABLE`) is used automatically, otherwise run
`npx playwright install chromium` once.

**Deploying.** `dist/` is a static site with a relative base, so it works from any path.
`vercel.json` in this folder tells Vercel to run `npm run build`, serve `dist/`, and
rewrite every path to `index.html`. Point a Vercel project at the `bead-compare` folder
(the "root directory" setting), or deploy from inside it with the Vercel CLI. Any static host works the same
way: upload the contents of `dist/`. Opening the built app over plain `http://` from
another device on the LAN also works; hashing falls back to a pure-JS SHA-256 when the
browser withholds WebCrypto on an insecure page. Only the microphone needs `https://`.

## Try it in one minute

1. Start `npm run dev` and open <http://localhost:5173>.
2. Press **Carregar passagem de demonstração** (Load demo passage). A passage named
   *Rute 1:1-5 (demonstração)* appears with two versions, *v1 rascunho* and
   *v2 revisão (3 mudanças)*. Both carry the badge **Fita simulada** (Mock tape): the
   voice is synthetic and the tapes were made by `tools/mock_tape.py`.
3. **Listen.** Press **Ouvir** on *v1 rascunho*. Tap a bead: that group of the recording
   plays and becomes the selection. Drag across beads to select more; the selection
   plays. Press **Adicionar comentário** (or the `c` key), type a comment, choose
   **Correção solicitada** as its kind, save it. The comment appears under the strip and
   as a marker on it.
4. **Compare.** Go back with **← Passagens** and press **Comparar A e B**. The three
   facts read **3** (Regiões), **1,8 s** (Alterados) and **92,8%** (Estabilidade). Tap a
   region to hear A, a short gap, then B. Choose a verdict for each region; verdicts are
   saved. Under **Correções solicitadas em A**, the comment from step 3 has been carried
   onto v2 with a link to the region it landed on; once you have heard both, press
   **Marcar como resolvido**. It stays in the list, marked **Resolvido**.
5. **Report.** Press **Ver relatório**. Download the Markdown or the JSON file.

## The Recording input format

A **Recording** is a folder, or a zip of that folder, holding three files:

| File        | Required | Contents                                                                       |
| ----------- | -------- | ------------------------------------------------------------------------------ |
| `audio.wav` | yes      | the storyteller's voice: 16 kHz, mono, 16-bit PCM WAV                          |
| `tape.json` | yes      | the O Escriba tape, one entry per 20 ms frame (see below)                      |
| `meta.json` | no       | `passage`, `language`, `narrator`, `recorded_at`, `label` — strings, all optional |

`tape.json` looks like this:

```json
{
  "codebook_hash": "sha256:4f87a27d…",
  "frame_rate": 50,
  "u": [49, 49, 18, 18, 18, 12, 12, 49],
  "f": [0, 0, 10, 10, 11, 9, 9, 0],
  "pause_unit": 49,
  "mock": true
}
```

| Field           | Type                    | Rule                                                                    |
| --------------- | ----------------------- | ----------------------------------------------------------------------- |
| `codebook_hash` | non-empty string        | identifies the frozen codebook; two tapes compare only if it is equal  |
| `frame_rate`    | number > 0              | frames per second; 50 is expected (20 ms per bead), anything else warns |
| `u`             | integers 0–99           | the sound unit of each frame                                            |
| `f`             | integers 0–31           | the pitch class of each frame; 0 means unvoiced; same length as `u`     |
| `pause_unit`    | integer ≥ 0, optional   | the `u` value that means silence; runs of it bound the phrases          |
| `mock`          | `true`, optional        | marks a tape that did not come from O Escriba                           |

The importer finds the three files at any depth, matches their names without regard to
case, and skips `__MACOSX`, `._*` and `.DS_Store` entries, so a zip that wraps one folder
is fine. A missing `meta.json` is a warning; a missing `audio.wav` or `tape.json`, a WAV
that is not a WAV, or a `tape.json` that breaks a rule above refuses the import. Audio
that is not 16 kHz mono 16-bit PCM, a frame rate other than 50, and audio and tape
durations more than 0.5 s apart are warnings. Every message appears in the interface
language on the passage card; what the parser itself said, and the file's own numbers,
sit inside a *Detalhes técnicos* block under the message.

### Import a real tape from O Escriba

Export each take from O Escriba as a Recording (the folder above, or a zip of it). Then,
on the passage list:

1. Create a passage with **Criar passagem**, or use an existing one.
2. On its card press **Importar pasta…** and pick the Recording folder, or
   **Importar .zip…** and pick the zip. One Recording is one version.
3. Repeat for the next take. Import the older take first: the passage keeps versions in
   import order, and A must come before B. On the card, the two columns of round
   buttons choose which version is A and which is B (by default the previous one and
   the latest); A must be above B.

The version label comes from `label` in `meta.json`; without it the version is called
`v1`, `v2`, and so on. Narrator and recording date are shown when `meta.json` has them.

**Both versions must share the codebook hash.** If they do not, Compare and Report refuse
before any alignment, with the message *Estas duas gravações usam códigos de som
diferentes e não podem ser comparadas.* Every tape produced by one O Escriba codebook
shares one hash. Mock tapes carry their own fixed hash, so a mock tape never compares
with a real one.

**Telling a mock tape apart.** A real tape has no `mock` field. A mock tape has
`"mock": true`, and the badge **Fita simulada** (Mock tape) appears next to that version
on the passage list, on Listen, on Compare (header and both strips), on Report, and in
the Markdown report as *Fita simulada — não é uma gravação real.*

## Making a mock tape

Without O Escriba, `tools/mock_tape.py` produces a plausible `tape.json` from any WAV:

```sh
python3 tools/mock_tape.py takes/take1/audio.wav              # writes takes/take1/tape.json
python3 tools/mock_tape.py takes/take1/other.wav              # writes takes/take1/other.tape.json
python3 tools/mock_tape.py takes/take1/audio.wav -o out.json  # explicit output path
python3 tools/mock_tape.py takes/take1/audio.wav --silence-db -40   # a stricter pause threshold
```

Give the WAV with its folder path, or pass `-o`. The script uses the standard library
only and runs at about one third of real time: a 60-second stereo 44.1 kHz file takes
around 20 seconds, a five-minute recording about two minutes. It accepts any sample rate and channel count: the audio is mixed to mono and
resampled to 16 kHz. It reads 8-, 16- or 32-bit PCM. It takes about 2 s for 6 s of audio
in plain Python, so a five-minute recording needs a couple of minutes. The output is
deterministic.

Per 20 ms frame it decides: pause when the energy of a centred 40 ms window is below
−45 dBFS (`u` = 49, `f` = 0); otherwise `u` is a code for the spectral shape (which
formant-sized band is loudest and which is second), so similar sounds get the same code
whatever the pitch; `f` is an autocorrelation pitch quantised to 1–31 between 70 and
400 Hz. Both streams are median-smoothed. The tape is marked `"mock": true` and uses the
constant mock codebook hash. Write `meta.json` by hand and put the three files in one
folder.

### How the fixtures were made

`fixtures/ruth-1-1-5/` holds two mock Recordings of one toy passage, generated by
`python3 tools/make_fixtures.py` (it takes an optional output folder; the default is
`fixtures/`). The voice is synthetic, so no person's voice is in the repository: each
syllable is a harmonic tone with two formants over a 120 Hz fundamental, fricatives are
noise through a resonator, and phrases are separated by longer pauses. The tapes come
from `mock_tape.py`; re-running the script reproduces the same bytes.

`v2` keeps the syllables of `v1` with 10 ms of timing jitter and exactly three edits:

| # | Edit in v2                                                | Region kind                   | In A (v1)          | In B (v2)          |
| - | --------------------------------------------------------- | ----------------------------- | ------------------ | ------------------ |
| 1 | phrase 2, syllable 3 replaced ("to" → "sha")             | Substituído                   | 0:02,3 – 0:02,5    | 0:02,3 – 0:02,5    |
| 2 | phrase 3 gains one syllable ("ve" before "si")           | Inserido                      | aqui, em 0:03,7    | 0:03,7 – 0:04,0    |
| 3 | phrase 4 spoken about four semitones higher (pitch × 1.25) | Mesmos sons, outra melodia  | 0:04,3 – 0:05,6    | 0:04,5 – 0:05,8    |

With the default settings Compare reports exactly these three regions in this order,
1,8 s changed and 92,8% stability; `tests/fixtures.test.ts` asserts the order and a
stability above 85%. `fixtures/` is also Vite's public folder, which is what lets
**Carregar passagem de demonstração** fetch them without an upload.

## The three usefulness tests

These are the checks the brief asks for. The demo passage proves the mechanics; the
tests mean something only with real recordings of a real passage, ideally a few minutes
long. Prepare each take as a Recording (from O Escriba, or a WAV plus `mock_tape.py` and
a hand-written `meta.json`) and import the takes as versions of one passage, older first.

For every test write down:

1. the **stability score** and the **region count** and **changed seconds** from the
   Compare summary (the Report repeats them);
2. the **time taken**, with a stopwatch, from opening Compare to choosing the last
   verdict;
3. whether **every requested fix was found**: on Compare, under *Correções solicitadas
   em A*, each carried request reads **Mudou aqui** (changed here) or **Sem mudança
   detectada aqui** (no change detected here), and links to the region it landed on
   with that region's verdict;
4. the **settings** used, if you changed any (the report footer records them).

A sheet like this is enough:

| Test | Takes (labels) | Stability | Regions / changed s | Time taken | Fixes found | Settings changed |
| ---- | -------------- | --------- | ------------------- | ---------- | ----------- | ---------------- |

### Test 1 — same narrator, no change

Record the passage twice with the same narrator, with no intended change. Import the
takes as versions, then press **Comparar A e B**.

**Expect** a nearly empty diff: few or no regions and a stability score in the high
nineties. (Importing the very same Recording twice gives the trivial case: no regions,
100%.)

**If it lights up**, open the settings (the icon at the top right) and change one value
at a time; Compare recomputes as you type, and *Restaurar padrões* brings the defaults
back:

- **Distância para unir regiões** (merge gap; default 10 beads = 200 ms). Raise it to
  20–30 so scattered specks fold into fewer regions.
- **Tamanho mínimo de grupo** (minimum cluster; default 3 beads = 60 ms). Raise it to
  4–6 so one- or two-bead flickers in the tape are absorbed by their neighbours before
  alignment. Fewer, longer groups mean fewer spurious mismatches.
- **Penalidade de divergência** (mismatch penalty; default 1). Lower it to 0.5 (type
  `0,5` or `0.5`), or raise *Pontuação de correspondência*, when the connector lines
  between the strips fan out and the regions come in chains. The aligner then keeps the
  two takes in step. A differing group becomes one substituted spot instead of a run of
  insertions and deletions.
- **Sensibilidade de melodia** (default 3) matters when most regions read *Mesmos sons,
  outra melodia*: the narrator's natural pitch variation between takes is above the
  threshold. Raise it.

Note the values that gave a clean result; the same values should serve Test 2.

### Test 2 — same narrator, three changes

Record a take, then a second take with exactly three known edits: replace one word,
add a short phrase, say one sentence with a different intonation (the demo does the
same in miniature). Before comparing, open Listen on the first take and put a
**Correção solicitada** on each of the three spots you expect to change; a note
elsewhere is a useful control. Then Compare.

**Expect** three regions at the three spots and every carried request marked
**Mudou aqui**; a request on untouched material reads **Sem mudança detectada aqui** in
the warning colour and turns on the warning line above the list. Settle the settings
before choosing verdicts (see the note under Known limits). Tap each region, hear A then
B, and choose *Correção solicitada confirmada* or one of the *Mudança não solicitada*
verdicts. Then press **Marcar como resolvido** on each carried request you have checked:
it stays in the list and in the report, marked **Resolvido**, next to the region link
that shows the verdict.

**Time it.** Start the stopwatch when Compare opens and stop it at the last verdict.
Compare that with the time it takes to listen to both takes in full (at least the sum
of the two durations, more with rewinding). On the 6 s demo there is nothing to gain;
on a passage of a few minutes the difference is the point of the tool.

### Test 3 — different narrator

Import the same passage read by a different narrator as B against the first narrator's
take as A, then Compare. After the import the card picks the second take as A by
default, so use the round A button on the first narrator's take before pressing
**Comparar A e B**.

**Expect** heavy noise: many regions, a low stability score, connector lines everywhere.
The tool aligns sound codes, not words, and two voices produce different codes even where
the words match. This is a baseline, not a supported use: it shows that Tests 1 and 2
measured something real. Write its numbers down beside the others.

## Settings panel

The settings open from the icon at the top right and are saved in this browser.

| Field (pt-BR / en)                                        | Key                            | Default            | What it does                                                                                                  |
| --------------------------------------------------------- | ------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Idioma / Language                                         | `bead-compare.lang`            | Português (Brasil) | interface language; the same as the PT / EN toggle in the header                                              |
| Tamanho mínimo de grupo / Minimum group size              | `grouping.min_cluster_frames`  | 3 beads (60 ms)    | runs of equal `u` shorter than this merge into a neighbour (the left one, or the right one at the start of the recording or after a pause) |
| Pontuação de correspondência / Match score                | `alignment.match_score`        | 2                  | reward for lining up two groups with the same `u`                                                            |
| Penalidade de divergência / Mismatch penalty              | `alignment.mismatch_penalty`   | 1                  | cost of lining up two groups with different `u`                                                              |
| Penalidade de lacuna / Gap penalty                        | `alignment.gap_penalty`        | 1                  | cost of treating a group as inserted or deleted                                                              |
| Distância para unir regiões / Distance for merging regions | `alignment.merge_gap_frames`  | 10 beads (200 ms)  | differences separated by fewer matched beads of B than this become one region                                 |
| Sensibilidade de melodia / Melody sensitivity             | `alignment.melody_threshold`   | 3 (F units)        | matched groups whose mean voiced `f` differs by more than this read *Mesmos sons, outra melodia*              |
| Restaurar padrões / Reset to defaults                     | —                              | —                  | puts every value above back                                                                                   |
| Apagar todos os dados locais / Clear all local data       | —                              | —                  | deletes every passage, version and comment in this browser after a confirmation                               |

Group sizes and distances are counted in beads (20 ms each). Numbers accept a comma or
a dot as the decimal mark: the fields are plain text fields, so the browser cannot
rewrite what you type (a `type="number"` field would turn `0,5` into `5`). A value the
field cannot use — text, a negative number, a fraction in a bead count — is marked and
snaps back when you leave it.

## Keyboard shortcuts

On the Listen screen:

| Key                | Action                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| `Space`            | play or pause the selection (the whole recording when nothing is selected) |
| `←` / `→`          | grow the selection by one speech group on that side (pauses are absorbed) |
| `Shift + ←` / `→`  | shrink the selection by one speech group: `Shift + →` drops its first group, `Shift + ←` its last (the arrow names the direction the boundary moves) |
| `c`                | open the comment editor for the selection                               |
| `Esc`              | stop playback and close the editor                                      |

Every key is left alone while a text field or a spoken comment's player has the
focus, so typing a comment never starts playback; `Space` is also left to a focused
button or "Detalhes técnicos" summary, where it is a click. In the settings panel,
`Esc` closes the panel.

## Where data lives

Everything is stored in the browser, per browser profile and per site address:

- **IndexedDB**, database `bead-compare` (version 1), with four stores: `passages`,
  `versions` (the tape, the metadata, both hashes and the audio bytes), `comments`
  (typed text and spoken audio) and `pairs` (the verdicts of one A–B pair).
- **localStorage**: `bead-compare.settings.v1` (the settings panel),
  `bead-compare.lang` (the interface language) and `bead-compare.author` (the author name
  typed on Listen).

Nothing is sent anywhere. Clearing the site data in the browser deletes it all, so
export what matters.

**Export a passage.** On its card press **Exportar passagem (.zip)**. The file is named
after the passage title with accents removed and spaces as underscores, for example
`Rute_1-1-5_(demonstracao).zip`. It holds `passage.json` (the manifest), `versions/<id>/audio.wav`,
`tape.json` and `meta.json` for every version, and `comments/<id>.<ext>` for every
spoken comment. Verdicts and carried comments travel with it.

**Import a passage.** Press **Importar passagem (.zip)** in the toolbar of the passage
list and pick a file exported by Bead Compare. It becomes a new passage with new
internal ids, so importing the same zip twice never collides; hashes are recomputed
from the bytes in the zip.

**Hashes.** Each version records two SHA-256 hashes. `audio_sha256` is the hash of the
`audio.wav` bytes (`sha256sum audio.wav` reproduces it). `tape_sha256` is the hash of
the tape's canonical JSON (the parsed tape re-serialised with `JSON.stringify`), not of
the file's bytes, so it survives export, import and re-formatting. `sha256sum tape.json`
therefore does **not** reproduce it; `python3 tools/tape_hash.py path/to/tape.json`
does (standard library only). The interface labels it *Hash da fita (JSON canônico)*.
Hashes are shown only inside *Detalhes técnicos* and in the downloaded reports.

## Language toggle

The header has a **PT / EN** toggle; the settings panel has the same choice as a list.
Brazilian Portuguese is the default. The choice is saved in `bead-compare.lang` and sets
the page's `lang` attribute. Dates, seconds, percentages and time positions follow the
language: `0:03,4`, `1,8 s` and `92,8%` in Portuguese, `0:03.4`, `1.8 s` and `92.8%` in
English. The Markdown report is written in the language that is active when you press
the download button; the JSON report uses fixed English identifiers in both languages.
Both dictionaries live in `src/i18n/strings/`, and `tests/i18n.test.ts` fails when they
drift apart.

## Known limits

- **Mock tapes are a stand-in.** `mock_tape.py` codes the spectral shape and an
  autocorrelation pitch with coarse heuristics. Two real takes through it show more
  noise than O Escriba tapes would, and a mock tape never compares with a real one.
- **Alignment is on U only.** F never enters the alignment; it only labels matched
  groups as *same sounds, different melody*. Group durations are ignored too, so a
  3-bead and a 40-bead group with the same `u` match equally. Two tapes with different
  frame rates are refused. The alignment is global, so a take of a different passage,
  or one with material moved around, gives nonsense rather than an error.
- **Long recordings.** The whole recording always fits the width of the strip; there is
  no zoom. Beyond a few minutes the beads become narrower than their gap and overlap,
  and the connector band between the two strips becomes a dense mesh. Playback redraws
  the strips on every animation frame, every keystroke in the settings panel recomputes
  the alignment, and exporting a passage compresses the audio on the main thread, so a
  multi-minute WAV makes the page pause for a moment. Two very long tapes with a
  minimum group size of 1 can exceed the aligner's 200 MB budget; the screen then asks
  for a larger minimum group size instead of crashing.
- **Sound needs a tap.** Browsers block audio until the page receives a gesture; the app
  starts its audio context inside your first tap. In headless Chromium (the e2e suite)
  it is launched with `--autoplay-policy=no-user-gesture-required` and fake media
  devices; there is no speaker to assert on, so the tests check that the cursor moves.
- **No cursor seek.** The moving cursor is a display. You cannot drag it or click the
  waveform to start from a point; tap a bead or select a span instead. Playing the whole
  recording always starts at the beginning.
- **Carry-forward covers fix requests only.** Notes and approvals stay on A. A fix
  request carries whether it is open or resolved: marking it resolved (on Compare, or
  on Listen for B) keeps it in the Compare list and in the Report with the status
  *Resolvido*, and *Reabrir* on Compare undoes that. The warning line counts open
  requests only.
- **Verdicts belong to the settings in force.** A verdict is stored under the region
  computed with the current settings; change a grouping or alignment setting and the
  regions, and with them the verdicts, disappear until the setting is restored (they
  are not deleted). The Report always uses the current settings, so settle the settings
  before choosing verdicts and before downloading.
- **Degenerate pairs.** An empty B against a non-empty A reports one *deleted* region
  and 100% stability, because there are no B beads to count.
- **Spoken comments** depend on the browser's recorder: the file is WebM or Ogg with
  Opus in Chromium and Firefox and MP4 in Safari, and the microphone needs `https://`
  or `localhost`.
- **Layout** is made for a laptop or a tablet; phone width works but is best-effort.

## Project layout

```
bead-compare/
  index.html              the single page (lang="pt-BR")
  vite.config.ts          relative base; fixtures/ served as the public folder
  vitest.config.ts        unit tests: tests/**/*.test.ts, node environment
  playwright.config.ts    e2e: builds, serves dist/ on 4173, headless Chromium
  vercel.json             build command, output folder, SPA rewrite
  tsconfig.json           main typecheck (src, tests, vite configs)
  README.md               this file
  DECISIONS.md            every choice the brief left open, one line each
  docs/ARCHITECTURE.md    module contracts and public signatures
  src/
    main.tsx              mounts <App/> in StrictMode
    App.tsx               header, language toggle, settings button, error boundary, routes
    router.tsx            hash router: #/, #/listen/:id, #/compare/:a/:b, #/report/:a/:b
    settings.tsx          settings in localStorage; SettingsProvider / useSettings
    styles.css            design tokens and every shared style
    model/                pure logic: tape, cluster, align, regions, carry, compare, hash
    db/                   IndexedDB (db.ts, repo.ts), Recording parser, passage zip
    audio/                AudioEngine (decode once, play by offset), recorder, time format
    components/           BeadStrip, Waveform, TechnicalDetails, SettingsPanel, MockBadge,
                          LanguageToggle, PlayerControls, CommentEditor, CommentList
    screens/              PassageList, Listen, Compare, Report (+ .css, *Logic.ts, importMessages.ts)
    i18n/                 I18nProvider, t(); strings/{common,passages,listen,compare,report}.ts
    export/               download.ts (blob downloads, safe file names), report.ts (Markdown, JSON)
  tests/                  vitest unit tests (21 files) and helpers.ts
  e2e/                    Playwright smoke test (smoke.spec.ts, 12 scenarios; helpers.ts, tsconfig.json)
  fixtures/ruth-1-1-5/    the demo Recordings v1 and v2, plus a README
  tools/                  mock_tape.py (WAV → mock tape), make_fixtures.py (the demo),
                          tape_hash.py (reproduces a version's tape hash from tape.json)
  public/                 empty; fixtures/ is the public folder
```
