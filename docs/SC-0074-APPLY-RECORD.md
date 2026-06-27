# SC-0074 — Esther onboarding, Phase 1: SOURCE (apply record)

**Deliberate seed-expansion: the book of Esther (prefix `E`, E01–E18) enters the source layer.**
Phase 1 of the book-onboarding checklist (source-text ingestion). Division ruled by Marcia
2026-06-26 (Evaluator-verified). Floor: compiler main `b1cdf9d` · enum v0.20 · lint-lexicon
0.4.0 · board 391|1 · tag v0.4.0.

This is the **deterministic, no-LLM, no-meaning-call** half: freeze + pin the BHSA source
packets. It adds **no** controlled-vocabulary value and edits **no** closed/bounded list — the
`validation-rules.json` version is unchanged. Phase 2 (vault BCD + `_spec/registry/esther.aliases.json`)
is the next SC; mapping (Phase 3) and compile/vocab (Phase 4) follow once 1–2 land.

## What changed (3 surfaces, all compiler-side)

1. **`extractor/pericopes.esther.json`** (new) — the pericope → Hebrew-verse-range table the
   extractor reads, mirroring `extractor/pericopes.json` (Ruth) and `extractor/pericopes.jonah.json`.
   `bhsa_book: "Esther"`, 18 pericopes.
2. **`_spec/source/esther/E01.json … E18.json`** (new, 18 files) — the frozen source-linguistic
   packets, generated OFFLINE by `extractor/extract_bhsa.py` from local BHSA tf/2021.
3. **`_spec/pins.json`** — 18 new `sources` entries (`version: extractor-0.1.0/bhsa-2021` + sha256),
   inserted after `source/ruth/P14.json`, before the drafter entry.

## BHSA facts verified (de-risk before extraction)

- **Book name = `Esther`** in the ETCBC tf/2021 `book` feature (probed directly — not the Jonah
  `Jona` gotcha; `Esther` is correct as-is).
- **10 chapters / 167 verses**, chapter totals **22 / 23 / 15 / 17 / 14 / 14 / 10 / 17 / 32 / 3** —
  matches standard English versification.
- **Hebrew & English versification COINCIDE** for Esther (no Jonah-style fish offset), so
  `start`/`end` Hebrew pairs equal the English `bcv` directly.

## The division (18 pericopes; tiles 1:1–10:3, no gaps/overlaps, max unit 14v)

| P | bcv | verses | | P | bcv | verses |
|---|---|---|---|---|---|---|
| E01 | 1:1–9   | 9  | | E10 | 5:1–14  | 14 |
| E02 | 1:10–22 | 13 | | E11 | 6:1–14  | 14 |
| E03 | 2:1–4   | 4  | | E12 | 7:1–10  | 10 |
| E04 | 2:5–18  | 14 | | E13 | 8:1–8   | 8  |
| E05 | 2:19–23 | 5  | | E14 | 8:9–17  | 9  |
| E06 | 3:1–6   | 6  | | E15 | 9:1–10  | 10 |
| E07 | 3:7–15  | 9  | | E16 | 9:11–19 | 9  |
| E08 | 4:1–8   | 8  | | E17 | 9:20–32 | 13 |
| E09 | 4:9–17  | 9  | | E18 | 10:1–3  | 3  |

New seams (within-chapter splits): 1:9│10, 2:4│5, 4:8│9. Mirror pairs to encode in the maps as
cross-pericope figures/cross_ref: **decree E07 ↔ counter-decree E14 · Haman rise E06 ↔ fall E12 ·
reversal fulcrum E11.**

## Extraction recipe (reproducible)

```
PY=python3.11   # the interpreter with text-fabric installed
TF=~/text-fabric-data/github/ETCBC/bhsa/tf/2021
$PY extractor/extract_bhsa.py E01 \
    --pericopes extractor/pericopes.esther.json \
    --out _spec/source/esther/E01.json \
    --tf-path "$TF"
# … repeated E01..E18
```

**Recipe decision — no `--places-ner`.** Esther is extracted WITHOUT the optional places-NER
sheet (matching the most-recent precedent, Jonah → `place_aliases:{}`). The local NER sheet
(`~/Dropbox/Mac/Downloads/bhsa/ner/sheets/places.yaml`) is **un-pinned** and would inject only
four book-irrelevant `Beth-*` places into every packet — a reproducibility risk with no payoff.
Omitting it keeps each packet rebuildable byte-identically from repo + BHSA tf/2021 alone.

**Hash convention (important for re-verify):** the extractor *prints* a sha256 of the JSON body
**before** its trailing newline, but `check-drift` (and the pins) hash the **full file bytes**
(with the trailing newline) — i.e. `shasum -a 256 <file>`. Pin the `shasum` value, not the
extractor's printed value.

## Acceptance — all green (self-verified on branch `sc-0074-esther-source`)

- `npm run check-drift` → **exit 0**; all **18** `source/esther/E*.json` report `vendored:ok`
  (plus the closed-list sync invariant still holds).
- **18 packets** present = 18 pericopes.
- Per-packet `len(verses)` equals the targets above for all 18 (verified programmatically).
- `place_aliases` is empty (`{}`) on all 18 packets.
- `_spec/pins.json` is valid JSON.
- Test board **391 passed | 1 skipped** — unchanged from floor (no regression).

## Out of scope (explicitly deferred)

- No vault writeback (source packets are compiler-vendored, not vaulted — no vault half exists
  for this SC).
- No closed/bounded-list edit, no `approved-enumerations.json` bump.
- Phase 2 (BCD/registry/aliases) and Phases 3–4 (maps, compile, vocab promotes) are separate SCs.
