# Coverage slice — build plan (adapted to the local BHSA data)

> **Status:** build spec for the Coverage (BHSA source-reconciliation) slice. The *what/why* and
> the confidence model live in `docs/COVERAGE.md`; this is the *how/when*, with the source-data
> path now **resolved** to the real local BHSA dataset. No code is written yet.
>
> **Where to build:** a **local Claude Code session** — the repo, the BHSA data, and the ability to
> run both Python (extractor) and TypeScript (engine) all coexist on the machine, so there's no
> cloud↔local round-trip and no flaky-session risk. `git pull` the latest `tripod_compiler` first.

---

## 0. Goal (unchanged)

Turn "did we miss anyone / invent anyone / misplace anyone?" from human vigilance into a
**set-difference against the frozen source text** → a per-pericope **coverage ledger** + one-line
score, computed from a **pinned BHSA packet**. Reproducible, testable, **no LLM**. This is the
deterministic fidelity floor that lands *before* the LLM drafter and becomes its anti-hallucination
grader on new pericopes (which have no gold FOR_MODEL).

---

## 1. Source data — RESOLVED (this is the adaptation)

The BHSA data is **present locally and complete**, so extraction is **fully offline** — no GitHub
download, no network allowlisting.

**Local layout** (point the extractor here):
```
…/bhsa/
  tf/2021/      ← Text-Fabric feature files (book.tf, chapter.tf, verse.tf, det.tf, code.tf,
                  lex, gloss, sp, pdp, gn, nu, ps, vt, vs, prs, function, rela, g_word_utf8, …)
  app/          ← BHSA Text-Fabric app (display/feature config)
  ner/sheets/   ← places.xlsx + places.yaml  (named-entity sheet — BONUS, see §4 alias table)
```
- **Version: `2021`** (matches `use("ETCBC/bhsa", version="2021")` in the original plan).
- **Loading (offline):** use the low-level Fabric API pointed straight at the local dir —
  `Fabric(locations="…/bhsa/tf/2021")` then `TF.load("<feature list>")`. Do **not** call the
  network `use()` path. (Confirm the exact available features by listing `tf/2021/*.tf` first.)
- **Provenance:** this is packet-provenance **option (c)** from the original plan — local
  extraction — now confirmed feasible fully offline because the complete TF dataset is on disk.

---

## 2. Scope & guardrails (unchanged discipline)

- **In:** Python extractor (`tools/bhsa/extract.py`) → pinned packet; TS coverage engine
  (`R \ M`, `M \ R`); three-bucket ledger; block/warn thresholds; `tripod coverage` CLI; tests.
- **Out:** no LLM; no vault writeback; pilot-2 / biblical lane only. **Coverage proves entity
  presence, not meaning fidelity** — coreference attribution and "no invented *claim*" stay with
  the human `READING_QUALITY.md` gate. Keep that line bright in the ledger wording.

---

## 3. The pinned packet (Phase A output)

- **File:** `_spec/source/ruth/P01.json` (co-located with the other pinned data so `_spec/pins.json`
  governs it uniformly; `tripod check-drift` then guards it by version + sha256).
- **Contract (per referring expression):**
  ```jsonc
  {
    "source": "BHSA", "bhsa_version": "2021", "extractor_version": "0.1.0",
    "book": "Ruth", "pericope": "P01", "bcv": "Ruth 1:1-5",
    "referents": [
      { "verse": "1:1", "surface": "וַיְהִי", "lex": "HJH[", "gloss": "be",
        "sp": "verb", "morph": { "ps": "p3", "gn": "m", "nu": "sg" },
        "is_implied_subject": true,                // verb-encoded subject, no written noun
        "node": 1234 }                              // BHSA node id, for traceability
    ]
  }
  ```
  *(Final field set = the minimum the engine actually consumes; add only on demand.)*

---

## 4. Phase A — the extractor (`tools/bhsa/extract.py`)

Resolves the `COVERAGE.md` open items as concrete code decisions:

- **Features to load** (confirm against `tf/2021/*.tf`): `otype`, `book/chapter/verse` (or the
  section API), `g_word_utf8` (surface), `lex`, `gloss`, `sp` (part of speech), `pdp`, `gn`/`nu`/`ps`
  (morphology), `vt`/`vs` (verb), `prs` (pronominal suffix), `function` (phrase function), `rela`.
- **Pericope → verse-range map** (P01 = Ruth 1:1-5, etc.) lives in the extractor (or a small table);
  iterate the words of each pericope's verses.
- **Build the referent set R** — one record per *referring expression*:
  - **proper nouns** (`sp=nmpr`), **common nouns** (`sp=subs`), **pronouns** (`sp=prps`),
  - **pronominal suffixes** (`prs` present on a word) — these are referents too,
  - **implied verbal subjects** — *the class humans miss*: a finite verb (`sp=verb`) whose clause has
    **no explicit `function=Subj` phrase** encodes its subject in morphology → emit a referent with
    `is_implied_subject:true` carrying the verb's `ps/gn/nu`.
- **Bonus — the `ner/sheets/places.xlsx` sheet:** load it to seed the **place surface↔code alias
  table** (§5 matching), since place names rarely string-match the FOR_MODEL's `PL_*` codes.
- **Licensing note** (resolve the `SOURCE_AND_SCALING.md` open item): record in the doc that BHSA is
  CC BY-NC-SA and OBT Lab's redistribution of derived extracts is covered.
- **Output:** write + pin `_spec/source/ruth/P01.json`; run once per book, freeze, vendor.

---

## 5. Phase B — the TS coverage engine (`src/coverage/`)

Mirror the `src/engine/` style (typed model in → structured findings out). **Build it against the
real P01 packet** (now easy, since the data's local) **plus small synthetic fixtures** for edge cases.

- **Build `M`** (map mentions) from the FOR_MODEL: one record per `B#/PL#/O#/TM#` usage —
  `{ entity_id, verse_anchor, referential_form, role }`.
- **Match `R ↔ M`** — the slice's one real design decision (`COVERAGE.md` flags it open). Start
  **high-recall / conservative** (over-flag for human review, never silently pass):
  - normalize anchors to **verse level** (FOR_MODEL `1:1a` ↔ BHSA per-word/verse);
  - require **morphology non-contradiction** (gender/number/person must not clash);
  - use **`referential_form` + the BCD being-registry + the `places.xlsx` NER sheet** as an
    **alias table** (a *strengthener*, not a hard string match) — since `UNNAMED_MAN_FROM_BETHLEHEM`
    or `PL1` never string-match the Hebrew surface.

---

## 6. Phase C — ledger + CLI

- **Three buckets** (`COVERAGE.md`):
  - `MATCHED` — source ↔ map (green);
  - `UNMAPPED_SOURCE` — in text, not in map → possible omission; sub-tag `explicit` / `implied_subject` / `minor`;
  - `UNANCHORED_ENTITY` — in map, no source expression at its anchors → possible hallucination (red).
- **Score line:** e.g. `P01 coverage: 47/47 explicit referents accounted for · 2 implied subjects flagged · 0 unanchored entities`.
- **Thresholds (exit codes, like `validate`):** `UNANCHORED_ENTITY` **blocks**; `UNMAPPED_SOURCE/explicit` **blocks**; `implied_subject` / `minor` **warn**.
- **CLI:** `tripod coverage <for-model> --packet <packet.json> [--json]`; write the ledger into the
  pericope's COMPILATION-LOG trail (reuse `src/compiler/complog.ts` patterns, kept distinct from the
  methodology log). Keep `coverage` a **separate command** initially (distinct input = the packet);
  can fold into `validate` later.

---

## 7. Tests & acceptance

- New deterministic tests (`tests/coverage.test.ts`); the existing 46 stay green.
- **Acceptance (same bar as Slice 1 — clean on gold, precise on corruption):**
  - **P01 ledger reads clean** (`47/47 … 0 unanchored`) against the pinned real packet;
  - drop a being from the FOR_MODEL → located **`UNMAPPED_SOURCE`**;
  - invent a being with no source expression at its anchor → **`UNANCHORED_ENTITY`**.
- **Bonus validation:** re-run against the gold-diff residuals the compiler surfaced
  (`B10:REFERENCED`, `PL2`, `B13:PRESENT`, …) — coverage now adjudicates each **against the Hebrew**
  rather than against the hand-made gold, which is the whole point.

---

## 8. Build order (local session)

1. `git pull` latest `tripod_compiler`; confirm `tf/2021/*.tf` feature names.
2. **Phase A:** `tools/bhsa/extract.py` → extract + pin real `_spec/source/ruth/P01.json` (offline,
   Fabric pointed at the local `bhsa/tf/2021`); update `_spec/pins.json`.
3. **Phase B:** `src/coverage/` engine (R/M build + matching), tested against the real P01 packet +
   synthetic edge fixtures.
4. **Phase C:** the three-bucket ledger + `tripod coverage` CLI + thresholds.
5. Tests + acceptance (clean P01, corruption cases, gold-diff-residual adjudication).
6. Fold the pre-existing `package-lock.json` `0.1.0 → 0.4.0` version fix into the first commit.
7. Governance: pin the packet in `_spec/pins.json` + the `SPEC_CHANGES.md` pin table; no new SC
   needed unless a schema changes.

---

## 9. Decisions to surface as you build (not blockers)
- Packet storage `_spec/source/<book>/` (uniform pinning) vs a top-level `/source/` — lean: `_spec/source/`.
- The exact surface↔`referential_form`/`PL_*` alias seeding (BCD being-registry + `places.xlsx`).
- Whether `times_in_scene` (`TM_*`) participates in coverage or is **checklist-only** — lean:
  checklist-only at first, like objects/concepts.
- Confirm the precise BHSA feature names + the implied-subject rule against the loaded data before relying on the ledger.

---

## 10. What this unlocks
When the LLM drafter (Slice 4) lands next, **coverage is its automated fidelity grader on new
pericopes that have no gold FOR_MODEL** — the anti-hallucination check, built *before* the
hallucination-capable component. Order preserved: deterministic floor first.
