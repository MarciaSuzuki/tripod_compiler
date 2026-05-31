# PROGRESS — continue-here checkpoint

> The live state of `tripod_compiler`. Read this first; it overrides the brief where they differ.
> `CLAUDE.md` is the original scoping handoff and is now partly **stale** — see "Decisions that
> refined CLAUDE.md" below. `main` is green through **PR #11** (full Ruth corpus P01–P06 at 0 convergent
> drift, `approved-enumerations` v0.4). **Slice 4 (the LLM drafter) is in-flight** on branch
> `claude/friendly-edison-TGdmt`: the deterministic seam is built + tested (56 tests green), but the
> P02 diagnostic RUN is **pending an `ANTHROPIC_API_KEY`** (not set in this env). See
> [`docs/SLICE4_PROGRESS.md`](SLICE4_PROGRESS.md) to resume.

## How to verify the state
```
npm install && npm run build && npm test     # 46 tests green
npx tsx src/cli/tripod.ts check-drift          # 5 pins + closed-list sync invariant
npx tsx src/cli/tripod.ts validate fixtures/for-model/
npx tsx src/cli/tripod.ts gold-diff
```

## Shipped (on `main`)
- **Slice 1 — validator.** TS/Node (ESM). `tripod validate <note|dir>` over the **pinned** locked
  schemas: Layer 1 = ajv structure + closed-list **block**; Layer 2 = bounded-open **drift**;
  Layer 3 = referential integrity + registry refs; register-critical presence. `tripod check-drift`
  enforces the pins + the closed-list sync invariant. Proven on P01–P06 (block-clean).
- **Source of truth (decision A).** The four locked schemas + the `approved-enumerations` registry
  are **vendored + pinned by version+sha256** under `_spec/` (`_spec/pins.json`), governed by
  `SPEC_CHANGES.md`. The canonical originals live in the wiki vault (`ruth-pilot-b-wiki/_spec/`).
  **Validation consumes the pinned JSON-Schemas via ajv — NOT re-transcribed to zod** (zod is
  reserved for internal report types). The hand-seeded skeleton YAMLs were removed (SC-0001).
- **Spec is `validation-rules.json` v0.6** (+ `bcd-delta` v0.4, `verification-input` v1.1,
  `compilation-log` v0.4, `approved-enumerations` v0.4). Governed edits **SC-0001 → SC-0007**:
  - SC-0001 REGISTER 8→7; `COMMUNITY_MEMORY` → new `NARRATIVE_FRAMING` axis + `framing_override`
    (it stays the 31st GENRE, per ruling).
  - SC-0002 propagate that into agent prompts / templates / worked example.
  - SC-0003 clean residual "elevated register bordering on COMMUNITY_MEMORY" prose.
  - SC-0004 deprecate the pre-Wave-3 `_examples/` P01 duplicates → redirect to canonical P01.
  - SC-0005 widen the `place_id` pattern to allow `PL<n>_<DESCRIPTOR>` (3 schemas).
  - SC-0006 drift convergence (below).
  - SC-0007 converge the L1-element / discourse / high-risk axes: COMPILATION-LOG schema v0.4 gains
    optional promotion slots for those axes, mapped in `promote.ts` (`UNCOVERED_CONVERGENT_AXES` now
    empty). validation-rules re-pinned by hash at v0.6 (sibling-pointer only). **Mechanism only —
    vendored `approved-enumerations.json` not grown (decision); real promotion is routine, deferred.**
- **Drift convergence (SC-0006).** L2 drift split into **convergent** axes (review-signal:
  proposition_kind, scene_kind, presence_value, the L1 element axes, discourse_thread_state,
  high_risk_register_kind) vs **descriptive/open** axes (the `_examples` axes + `referential_form` —
  informational, never drift). Rule: a seed key containing `_examples` or `== referential_form` is
  descriptive. The convergent baseline is the **growing `_spec/approved-enumerations.json`**
  (seeded from P01); `tripod promote <COMPILATION-LOG>` accumulates approved values
  (provenance-stamped, status-gated) from `vocabulary_additions`; `tripod propose-vocabulary
  <FOR_MODEL>` lists candidates; promotions append to `VOCABULARY_LOG.md` + re-pin. So drift
  converges across pericopes (e.g. P02: 86 lumped → 37 convergent + 49 descriptive).
- **Slice 2 — deterministic MeaningMap→FOR_MODEL skeleton compiler + hardening.**
  `tripod compile <meaning-map>` parses the MM and emits a FOR_MODEL **skeleton + gap report**:
  - **Extracted deterministically:** sta_id/header/classification, scene IDs + verse-ranges,
    per-scene entity IDs + presence, significant_absence, communicative purpose, proposition
    IDs/anchors/scene-links/cross-refs, Section-5 concept/figure flags.
  - **Judgment fields** (scene_kind, proposition_kind, role/function tokens, event_specific_slots,
    inter_proposition_links, referential_form, L1 element arrays) are **typed placeholders carrying
    their source-prose span** (`__TODO__: <span>`), each recorded in `gaps`. **Extract-only —
    no invented values** (`traceCheck()` guarantees every emitted token resolves to an MM span).
  - **Gap report also emits as a schema-valid COMPILATION-LOG** (`compile --out-log`, validated via
    Slice 1; gaps in `known_limitations`, extract-only attested).
  - **`tripod gold-diff`** diffs each skeleton vs its gold FOR_MODEL on the comparable deterministic
    layer; committed `fixtures/gold-diff-baseline.json` is the regression baseline. Gold agreement:
    P01/P03 **100%**, P05 98%, P04/P06 95–96%, P02 90%. Residual divergences are **MM↔FOR_MODEL
    coverage differences** (the MM scene lists off-stage referents the gold omits), not extractor errors.
- **Forward-looking docs** in `docs/`: `COVERAGE.md` (BHSA coverage-reconciliation, fidelity floor),
  `READING_QUALITY.md` (human review gate, fidelity ceiling), `SOURCE_AND_SCALING.md` (BHSA frozen
  extract + per-book BCD-by-delta). Gate order: conformance → coverage → reading-quality.
- **Git:** PRs #1–#8 merged; `main` is the single coherent branch. The wiki vault is **local-only
  git** (no remote); governed spec edits are committed there locally (SC-0001/0003/0004/0005/0006).

## Decisions that refined CLAUDE.md (a fresh session must NOT follow the stale brief)
- **Pilot-2 has FOUR artifacts**, not two: FOR_MODEL + COMPILATION-LOG + BCD-DELTA + VERIFICATION-INPUT.
  There is **no AUDIT** (the brief's "FOR_MODEL + AUDIT" is wrong; AUDIT was split into COMPILATION-LOG
  + BCD-DELTA in v0.3).
- **Validate by consuming the pinned JSON-Schemas (ajv), do NOT re-transcribe to zod** (brief §5).
  This is decision A; re-transcription would recreate the drift the tool exists to prevent.
- **`/_spec` is not "obtain the vocabulary doc first" (brief §6) — it already exists** as the locked
  `validation-rules.json` in the wiki, vendored + pinned here.
- **Pilot-2 lane only (decision D):** do NOT build the LA_RECORDING profile / unified vocabulary
  (that's Pilot-3, "do not act"). Profile-awareness is limited to what pilot-2 literally requires.
- **`artifact_profile` is FORBIDDEN (decision C)** — the validator blocks it; biblical profile is
  implicit-by-context.
- **REGISTER is 7** (not the brief's "6 vs 7" or the locked file's stale 8); `COMMUNITY_MEMORY` is a
  `NARRATIVE_FRAMING` value (and still the 31st GENRE), never a register (SC-0001).
- **Gold fixtures are P01–P06** (brief assumed only P01–P02).

## In-flight (exact Slice 2 state)
- Slice 2's **deterministic half is complete and merged** (skeleton + gap report + COMPILATION-LOG
  emit + gold-diff + extract-only trace). What remains is the **judgment half**: turning the
  `__TODO__` placeholders into real controlled-vocabulary tokens / event slots — that is the **LLM
  drafter (Slice 4)**, deliberately not built yet (deterministic-first discipline). The seam is
  defined: `compile` emits the skeleton + the per-field gap (with source-prose span) that the drafter
  fills, then the result re-validates via Slice 1.
- Nothing is uncommitted; no open PRs.

## Next (recommended)
> SC-0007 (the previous #1 — L1/discourse/high-risk convergence) is **DONE** on
> `claude/friendly-edison-TGdmt`; see SPEC_CHANGES.
1. **Slice 4 — the LLM drafter** that fills the skeleton's judgment gaps into a complete,
   validate-clean FOR_MODEL (Claude API; needs a key + cost). This is the "judgment half."
2. **Coverage ledger (`docs/COVERAGE.md`)** + the **BHSA frozen-extract sidecar** (`docs/SOURCE_AND_SCALING.md`)
   — the highest-value fidelity feature; lands with source ingestion (needs the vault / BHSA).
3. **Registry growth — COMPLETE for the pilot.** **P01–P06 all promoted** (registry v0.4): P02
   grandfathered (`--status ANY`), P03–P06 via the **CONFIRMED-only default gate**. The full Ruth pilot
   corpus now validates at **0 convergent drift** (descriptive/open axes remain per-pericope, by design).
   The convergence machinery (SC-0006 + SC-0007) is proven end-to-end on real vendored data.

## Open threads
- (a) **L2 drift split + accumulation registry — DONE** (SC-0006, PR #4). Not an open thread; do not redo.
- (b) **Slice 2 hardening (gold-diff, typed placeholders w/ source-prose, gap-report-as-COMPILATION-LOG,
  extract-only) — DONE** (PR #6). Not an open thread; do not redo.
- (c) **Template relics — OPEN.** Two pre-Wave-3 stragglers a sweep found:
  `_templates/for-model-template.md` still documents `discourse_threads_active` as a FOR_MODEL field
  (now BCD-DELTA-only), and `_templates/audit-template-schema.json` is the schema for the obsolete
  AUDIT artifact. Fix as a governed edit — **this is SC-0008** (reconciled 2026-05-29: SC-0006 shipped
  as drift convergence; SC-0007 is the L1-axis convergence in Next #1; see SPEC_CHANGES.md allocation ledger).
- **L1-axis promotion gap** (was Next #1 / SC-0007) — **RESOLVED** (SC-0007): COMPILATION-LOG v0.4 has
  the intake slots and `promote.ts` maps them, so every convergent axis is promotable. Note: `discourse_thread_state`
  + `high_risk_register_kind` are now *promotable* but are not FOR_MODEL fields, so their drift-detection-from-source
  is still future work. Vendored-registry growth: **P01–P06 all promoted** (registry v0.4); pilot corpus fully converged.
- **Coreference attribution & semantic additions** stay human (per `docs/COVERAGE.md` / `READING_QUALITY.md`) — not mechanizable.
- **Two `.docx`** reference files were left in the working tree; now gitignored (`*.docx`).
