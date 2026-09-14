# Decisions

Every choice the brief left open, one line each. Grouped by area.

## Model and alignment

- A bead is one frame; a cluster is a run-length-encoded run of equal U values, and any run shorter than `min_cluster_frames` (default 3 = 60 ms) merges into its left neighbour.
- Exceptions to "merge left": a short first run merges into its right neighbour; a short speech run whose left neighbour is a pause merges right when the right neighbour is speech, so short speech is never hidden inside a pause; a tape that is one short run stays one cluster.
- A merged cluster takes the U value of the run that absorbed it.
- Phrases are numbered on speech clusters only; pause clusters carry `phrase: null`; a tape without `pause_unit` is one phrase.
- Alignment is Needleman–Wunsch over cluster sequences on U only: match +2, mismatch −1, gap −1 by default; ties prefer diagonal, then "consume A", then "consume B", which keeps runs of matches contiguous.
- Cluster duration is ignored by the aligner (a 3-frame and a 40-frame cluster with the same U match equally), as the brief asks.
- Memory: one byte of traceback per cell plus two score rows, so a 5-minute recording with ~3000 clusters costs about 9 MB.
- Region kinds: mismatch → substituted, gap in A → inserted (in B), gap in B → deleted (from B), matched clusters whose mean voiced F differs by more than `melody_threshold` (default 3 F units) → melody. Pause clusters and fully unvoiced clusters never produce melody regions.
- Regions separated by fewer than `merge_gap_frames` (default 10 = 200 ms) matched **B** frames merge into one region that also covers the matched material between them.
- A merged region of mixed kinds is "substituted", unless every part is melody-only; insert+delete together also read as substituted.
- A region with no frames on one side (pure insertion or deletion) is a zero-length point on that side, placed just after the previous cluster on that side.
- Stability score = percent of B frames that lie in matched clusters (melody-only differences still count as matched sound); one decimal.
- Changed seconds = sum over regions of the longer side of each region, measured in B's frame rate.
- Verdicts are keyed by a region signature (`kind|a:start-end|b:start-end`) so they survive a re-computation; a verdict whose region disappears after a settings change is simply not shown.
- Comments carry forward through a frame mapper: a frame inside a matched or mismatched cluster maps proportionally into the aligned B cluster; a frame inside a deleted cluster maps to the point just after the last B cluster seen; the end of A maps to the end of B.
- An exclusive span end maps by closing the aligned B cluster, so a comment at the tail of A does not swallow material inserted after it in B.
- Only open `fix_requested` comments carry forward; notes, approvals and resolved comments stay on A.
- Carry outcome: "changed here" when the span (on A or on B) overlaps any region, otherwise "no change detected here".
- Carried comments are derived on every Compare/Report computation, not persisted on B; marking one resolved updates the original comment on A.
- `codebook_hash` is compared as an exact string; a mismatch throws before any alignment.

## Mock scribe (`tools/mock_tape.py`)

- Standard library only, so it runs anywhere Python 3 runs; no numpy.
- Pause = RMS of a centred 40 ms window below −45 dBFS; U = 49 for pauses.
- U for speech comes from the spectral shape, not the pitch: which formant-sized band (7 bands: <250, 250–600, 600–1000, 1000–1600, 1600–2500, 2500–4000, 4000+ Hz) is loudest and which is second, giving 49 speech codes in 1..50 that skip 49.
- F = autocorrelation pitch on the 40 ms window, quantised to 1..31 on a log scale between 70 and 400 Hz; 0 when unvoiced; forced to 0 on pause frames.
- Both U and F are median-smoothed over 5 frames, U only across speech frames.
- Mock tapes carry `"mock": true` and a constant `codebook_hash` (`sha256(bead-compare-mock-codebook-v5)`) so mock tapes compare with each other but never with a real O Escriba tape.
- Any wav sample rate and channel count is accepted (mixed to mono, linearly resampled to 16 kHz); 8-, 16- and 32-bit PCM.

## Demo fixtures (`tools/make_fixtures.py`)

- The demo voice is synthetic (two stationary formants per "syllable" over a 120 Hz fundamental, noise through a resonator for fricatives), so no person's voice is shipped in the repo.
- v2 carries exactly three edits: a substituted syllable, an inserted syllable, and one phrase spoken about four semitones higher; small timing jitter mimics a re-recording; `tests/fixtures.test.ts` asserts Compare reports exactly those three regions in that order.
- Fixtures are committed as folders, not zips (the repository ignores `*.zip`).
- `fixtures/` is Vite's `publicDir`, so the app can offer "Load demo passage" with no upload step.
