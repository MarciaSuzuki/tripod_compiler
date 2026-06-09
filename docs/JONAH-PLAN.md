# Jonah — the held-out generality test (plan-first)

> Plan-first (Architect 11, 2026-06-08). **No build until Marcia signs off §5's decisions.** Jonah is the
> first book the interlingua was **not** shaped around — the real test of whether the enforced + fidelity-flagged
> model generalizes. Read with `[[tripod-level3-purity-debt]]` (the BHSA-for-Jonah extractor pattern + read-by-layer),
> `[[tripod-sentence-token-triage]]` (why L3 stays mapping-disciplined until the post-Jonah triage), `docs/SOURCE_AND_SCALING.md`.

---

## 0. The point + how we read the result
**The question:** does the controlled vocabulary + schema, built and tuned on Ruth, **hold** on Jonah — or does Jonah
force genuine additions? The value is in reading the result **by layer**, because each layer has a different
"pass" condition:

| Layer | What it is | "Holds" (expected) | A real **finding** |
|---|---|---|---|
| **L1 closed** (genre_group · genre · register · speech_act) + **schema structure** | the cross-corpus interlingua | Jonah maps with the existing 4/31/7 + existing speech_acts; the schema shape fits | a value Jonah genuinely needs that isn't in the closed list, or a structural gap → **governed addition, its own SC** (this is the headline result) |
| **L2 bounded-open** (scene_kind · proposition_kind · arc/tone/pace/comm-func) | governed-growth vocab | **grows by design** (drift → review → promote-with-provenance) | nothing — growth here is success, not failure; watch for *near-duplicates* of Ruth values (collapse, don't multiply) |
| **L3** propositions | the supervision target | pure inventory (SC-0030); **mapping discipline** keeps it clean (no sentence-shaped slot values — the auto-lint can't draw that line until `[[tripod-sentence-token-triage]]`) | prose creeping into L3 (caught by the new `l3_free_text` lint) |
| **L3 registry** (B/PL/O/TM/CB/FIG + referential forms) | the BCD | **all new** — Jonah's cast is its own; a fresh BCD is expected work, not a finding | — |

So: **L1 + structure holding = the interlingua generalizes.** L2/registry growth is normal. A forced L1 value or a
structural gap is the prize finding.

## 1. Readiness (verified 2026-06-08)
- **BHSA data reachable** — `tf/2021` present at all three known paths (`~/text-fabric-data/github/ETCBC/bhsa/tf/2021`,
  `~/Dropbox/Mac/Downloads/bhsa/tf/2021`, `~/Documents/bhsa-master/tf/2021`). Extraction is unblocked, offline.
- **The compiler is mostly book-general** — the readers (`loadAliasTable/Concept/Figure(book)`) and the CLI
  (`--book`, default `ruth`) already parameterize the book. **Ruth-hardcodings to generalize (bounded):**
  1. `extractor/extract_bhsa.py` — the `F.book.v(v) != "Ruth"` filter + the default `_spec/source/ruth/` out-path
     (both should derive from the pericope spec's `book`).
  2. `src/compiler/{complog,skeleton}.ts` — `sta_id: "ruth_pericope_…"` → book-derived prefix.
  3. `src/reader/meaning-map.ts` — the `^Ruth\s+` verse-anchor strip → book-general.
  4. (cosmetic) `src/engine/id-align.ts` messages naming `ruth.*.json` → use the book param.
- **⚠ The 5th hardcoding — GOVERNED, schema-side (evaluator finding 2026-06-08; the original plan undercounted at "4 code spots"):** the **schema files themselves** hardcode `ruth` in the id patterns — `validation-rules.json` + `compilation-log.schema.json` `sta_id` = `^ruth_pericope_\d{2}_v\d+_\d+$`, and `bcd-delta.schema.json` `id` = `^ruth_bcd_delta_…`. **`jonah_pericope_01_v2_0` FAILS these → ajv would block every Jonah artifact as invalid** (verified on `origin/main` v0.14). Widening them is a **governed schema change** across **3 pinned, vault-mirrored files** (version bump + re-pin + `SPEC_CHANGES` + **vault writeback**), not a code-only refactor. This corrects §2's Phase-0 framing.
- **+ two minor completeness items:** `extractor/build_aliases.py` + `build_concept_figure_registry.py` also hardcode `"book": "RUTH"` (needed for Phase 1's Jonah registry); and `pericopes.json` is single-book (Jonah needs its own spec entry — Phase 0).
- **Layout to mirror:** `_spec/source/jonah/*.json` (packets) + `_spec/registry/jonah.*` (aliases/concepts/figures)
  + a Jonah BCD, all pinned in `pins.json` — exactly the Ruth shape.
- **⚠ Versification wrinkle (already a generality finding):** Jonah's Hebrew and English verse numbers diverge at the
  fish — **English 1:17 = Hebrew 2:1** (so Heb ch.2 = vv.1–11). The BHSA is Hebrew-versified, so the pericope spec's
  `start`/`end` must be **Hebrew** numbers; the human-facing `bcv` can stay English. Ruth had no such split — so the
  pericope-spec format must carry both. (Small, but it's the first "Jonah isn't Ruth" finding.)

## 2. Phased plan
- **Phase 0 — book-generalize the compiler (builder; its own SC, SC-0032) — a *small GOVERNED schema change*, NOT a pure refactor (corrected per the §1 5th-hardcoding finding).**
  (a) Fix code hardcodings #1–#4 behind the existing `--book` param + add a Hebrew-versified Jonah pericope spec;
  (b) **widen the 3 schema id-patterns** (FOR_MODEL + CL `sta_id`, BCD-DELTA `id`) to a book-general form →
  **version bump + re-pin each + `SPEC_CHANGES` entry + vault writeback** (the SC-0008 ritual; skipping the
  writeback would re-open the v0.12↔v0.14 vault drift SC-0030 just closed). **Safety contract (still holds):** the
  Ruth gate board stays 100% green — a widened pattern still matches `ruth_…` and `--book ruth` artifacts stay
  byte-identical — but the `_spec/` files **do** change (that's the governed part; not "byte-identical `_spec/`").
  Acceptance: Ruth board green · `jonah_pericope_…` now validates · `check-drift` clean against the new pins ·
  `check-drift:vault` exit 0 after the writeback.
- **Phase 1 — extract + scaffold (builder, deterministic).** Run the extractor over Jonah's pericopes → pinned
  `_spec/source/jonah/*.json`; scaffold an empty Jonah BCD + registry files; pin all. Acceptance: `coverage` can run
  on a Jonah pericope (referent set frozen, reproducible).
- **Phase 2 — the pilot pericope, end-to-end (the actual test).** Author **one** Jonah Meaning Map (Marcia + the
  mapping discipline / the meaning-map skill), compile → FOR_MODEL, run the full gate board, and produce the **first
  by-layer read** (§0 rubric). This is where the generality answer first appears. Cheap, and it de-risks the rest.
- **Phase 3 — the rest of Jonah (gated on the pilot).** Roll out the remaining pericopes; consolidate L2 growth;
  promote any L1 finding as its own governed SC. Final deliverable: the **by-layer generality report**.

## 3. Division of labor (the 3-role loop)
- **Builder:** Phase 0/1 (the deterministic infra + extraction + scaffolding + running the gates); compiles the
  skeletons; surfaces the by-layer findings.
- **Marcia:** the **mapping** (the exegetical judgment — genre/register, propositions, fidelity calls) and every
  L1/registry ruling. The maps are hers (with the mapping discipline); the builder never invents semantic content.
- **Evaluator:** verifies each phase (Ruth board still green after Phase 0; packets reproducible; the by-layer read
  is honest — L1 holds vs. forced).

## 4. L3 discipline for Jonah (carry-over, not re-litigated)
Jonah's Level 3 is **born clean**: no `meaning` free-text, no inline fidelity (SC-0030's parallel layer); fidelity
flags (if any) ride the top-level `fidelity` layer; **no sentence-shaped slot values** (mapping discipline —
strip-to-type per the `[[tripod-sentence-token-triage]]` rule). The `l3_free_text` lint guards the prose vector.

## 5. DECISIONS for Marcia (sign-off before any build)
**0. Phase-0 re-scope (the evaluator's finding — rule this first).** Phase 0 widens the 3 `ruth`-hardcoded schema id-patterns as a **governed** change (version bump → re-pin → ledger → **vault writeback**) — re-labeled from "pure refactor / no schema change" to "small governed schema change." **How to widen** (sub-choice):
   - **Fully-general** `^[a-z]+_pericope_…` / `^[a-z]+_bcd_delta_…` *(recommended — Architect 11 + evaluator)*: any book validates; **no future book ever re-touches the schema** — the highest fix-tier (make-it-structurally-impossible) per `[[tripod-recurring-error-discipline]]`.
   - **Enumerate** `^(ruth|jonah)_…`: minimal, but every new book re-edits the schema.
   *Recommendation: fully-general, folded into Phase 0, with the vault writeback planned in (the evaluator verifies it like SC-0030).*

*Then the exegetical calls:*
1. **Pericope division** (exegetical — yours). Proposed (English `bcv`; the extractor will use Hebrew numbers):
   - **J01 1:1-3** call + flight · **J02 1:4-16** storm + sailors · **J03 1:17–2:10** the fish + **Jonah's psalm**
     · **J04 3:1-10** Nineveh repents · **J05 4:1-11** anger + the qiqayon plant.
   - **Sub-call:** the **psalm (2:1-10)** is a POETIC unit inside narrative — the richest generality test (does the
     genre/register-override + poetic-figure machinery, proven on the P03 vow, hold?). Keep it inside J03 with a
     scene-level `POETIC_SUNG`/register override, **or** split it as its own pericope. *Lean: its own pericope* (cleanest test).
2. **Pilot-first vs whole-book.** *Lean: pilot-first* — one pericope end-to-end gives the generality signal cheaply
   before committing to all of Jonah.
3. **Which pilot.** *Lean: J01 (1:1-3)* to prove the pipeline on a clean narrative open (the Ruth-P01 analogue),
   **then** the psalm to stress-test the genre/fidelity machinery. (Alt: start with the psalm if you want the
   hardest test first.)
4. **Mapping pipeline.** Confirm the maps are authored by you + the meaning-map skill/Agent-2 pattern (builder does
   infra + compile + gates), same as the Ruth pilot.

## 6. Honesty notes
- Nothing is built or locked until §5 is ruled. Phase 0 is a **pure refactor** (Ruth board must stay byte-identical
  green) — that's its safety contract.
- Jonah **will** grow L2 and needs a whole new registry — that's expected, not failure. The one result that matters
  for "does it generalize" is **whether L1 + the schema structure hold**; a forced L1 value is a real, governable finding.
- The mapping is the long pole and it's Marcia's; the builder's deterministic work (Phase 0/1) is small and starts now on sign-off.
