# PROGRESS — continue-here checkpoint

> The live state of `tripod_compiler`. Read this first; it overrides the brief where they differ.
> `CLAUDE.md` is the original scoping handoff and is now partly **stale** — see "Decisions that
> refined CLAUDE.md" below. `main` is green through **PR #10** (P03 promotion). The **P04–P06 batch
> promotion** (`approved-enumerations` v0.4; full Ruth corpus P01–P06 now 0 convergent drift) is on
> branch `claude/friendly-edison-TGdmt`, pending merge.

## How to verify the state
```
npm install && npm run build && npm test     # 97 tests green (was 89; +8 SC-0015/SC-0016 lint + exception)
npx tsx src/cli/tripod.ts check-drift          # 5 schema pins + 10 source pins (6 packets + alias + coverage-exceptions + lint-lexicon + lint-exceptions) + sync invariant
npx tsx src/cli/tripod.ts validate fixtures/for-model/
npx tsx src/cli/tripod.ts gold-diff
npx tsx src/cli/tripod.ts coverage --corpus     # BHSA coverage over P01–P06: 6/6 block-clean · 245/245 explicit · 0 unanchored · 1 accepted (Israel@P06)
npx tsx src/cli/tripod.ts lint --corpus         # SC-0016 DONE: 0 drift (0 tier-1, 0 tier-2) · 6 accepted (signed off) · exit 0 — the operating-test bar
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
- **Coverage reconciliation (`docs/COVERAGE.md`) — SHIPPED for P01.** The fidelity floor: does the map
  match the **text**, not just the schema? Built fully **offline** on a frozen BHSA extract.
  - **Extractor sidecar** (`extractor/*.py`, the Python escape-hatch). `extract_bhsa.py` points
    Text-Fabric at a **local** `tf/2021` dir (`tf.fabric.Fabric`, no GitHub) and freezes the referent
    set **R** — proper/common nouns, substantival participles ("the judges"), pronouns, pronominal
    suffixes, and **implied verb-morphology subjects** (the class a reviewer most often misses;
    `vayhi` existentials flagged `likely_impersonal`) — into the pinned `_spec/source/ruth/P01.json`.
    `build_aliases.py` freezes the entity↔surface bridge (BCD frontmatter + the places NER sheet) into
    the pinned `_spec/registry/ruth.aliases.json`. Both pinned in `_spec/pins.json` → `sources` and
    verified by `check-drift`.
  - **Engine** (`src/engine/coverage.ts`) reconciles R vs the map's entity mentions M into three
    buckets — **MATCHED / UNMAPPED_SOURCE / UNANCHORED_ENTITY** — preserving the doc's confidence
    asymmetry: anchoring ("nothing added") is permissive (kind + gender, near-airtight); mapping
    ("nothing missing") needs evidence (consonantal Hebrew — Kilion↔Chilion — or a whole-word
    `referential_form` keyword); proper-noun omissions and non-abstract hallucinations **block**,
    while the common-noun checklist, implied subjects, pronouns/suffixes, and abstract `TH_`/`CB_`
    overlays **warn** (reviewer ticks). `tripod coverage <P> [--out ledger.md] [--json]`; the ledger
    note (`src/audit/coverage-ledger.ts`) files into the audit trail.
  - **P01 acceptance:** `47/47 explicit referents accounted for · 5 implied subjects flagged ·
    0 unanchored entities · 14 source nouns to tick` — block-clean (`fixtures/coverage/`,
    `tests/coverage-p01.test.ts`; a dropped scene → Orpah/Ruth omission block, an out-of-pericope
    entity → hallucination block).
  - **SC-0009 (same-referent merge):** "the land" (אָרֶץ, 1:1) and "the land of Judah" (1:6–7) are one
    referent — `PL_HA_ARETZ` merged into `PL_LAND_OF_JUDAH`, distinguished by `referential_form`. Added
    `hebrew_aliases` support (BCD `hebrew_aliases` → alias-table `hebrew_cons_aliases` → matcher), so
    "the land" now reconciles MATCHED → `PL_LAND_OF_JUDAH`. **SHIPPED both sides:** wiki PR
    [ruth-pilot-b-wiki#1](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/1) **merged** (`402f5ef`
    on vault `main`); compiler side shipped (alias table re-pinned `0.1.1`; gold-diff P01 43→44); repo
    fixtures + pinned alias table verified identical to the merged canonical BCD. See SPEC_CHANGES SC-0009.
  - **Corpus coverage — full compiled pilot P01–P06.** Packets extracted + pinned for P02–P06 (`_spec/
    source/ruth/`, `_spec/pins.json` → `sources`). `tripod coverage --corpus` (and variadic targets) runs
    all pericopes with a packet + FOR_MODEL and prints a summary; `--out-dir` writes one ledger per
    pericope (`fixtures/coverage/`). **Result: 244/245 explicit accounted · 0 unanchored across the whole
    corpus (zero hallucinated entities) · 1 genuine finding.** Engine fix: a proper-noun **name match is
    authoritative and not vetoed by the heuristic alias gender** (the BCD prose-scan mis-guessed YHWH as
    `f`, which was wrongly blocking YHWH→B10 in P02/P04/P05/P06).
  - **SC-0010 — recorded-exception mechanism + Israel ruling.** Reviewer sign-off is mechanized: a pinned
    `_spec/coverage-exceptions.json` downgrades a matched finding from **block** to **ACCEPTED** (shown in
    the ledger with reason + provenance; `score.accepted`). The P06 "Israel" (2:12) finding is ruled
    **epithet-internal** ("the God of Israel" qualifies the divine name, not a participant) — recorded as
    the first exception. **Corpus is now 6/6 block-clean** (245/245 accounted, 1 by sign-off, 0 unanchored).
  - **SC-0011 — authoritative BCD `gender` field.** Replaced the unreliable prose-scan gender guess (it read
    YHWH/foreman as `f` and mis-gendered three collectives) with an explicit `gender` frontmatter field on all
    31 beings (`null` = collective/mixed). `build_aliases.py` reads it authoritatively; alias table re-pinned
    `0.1.2`. Wiki side merged (vault PR #2). Coverage block status unchanged (proper-noun matches already
    gender-immune); entity gender is now correct data.
  - **SC-0012 — Level-3 / §3C content discipline + `tripod lint` (the drift-guard).** The content layers hold
    only bare/atomic/plain-language **payload**; everything else is conditioning or doesn't belong (R1–R5).
    New deterministic 4th verifier `tripod lint [--corpus]` (pinned `_spec/lint-lexicon.json`) flags forbidden
    grammatical vocabulary, interpretive labels, conditioning-in-Q&A, compounds, and §3C-not-an-entity —
    completing the stack **legal · complete · atomic-bare-plain · true**. Adopted the rule
    (`_methodology/level3and3Ccontentdiscipline.md`) + remediated the meaning-map template (§3C entities-only;
    §6.2 atomic-bare-plain-payload) — wiki PR #3 (merged). **Inventory: ~182 findings across P01–P06** (87 vocab ·
    48 §3C-not-entity · 34 labels · 10 compound · 3 conditioning).
  - **SC-0013 — P01 content remediation (the worked reference).** Applied R1–R5 to P01: §3C ~17 thematic
    entries → **3 true entities**; every event/framing/pattern relocated to its proper layer (propositions /
    referential_forms / figures), insight re-homed not deleted (inline `_note`s). **`tripod lint` P01: 12→0
    clean**; validate 0-block; coverage still clean (abstract overlays 15→2); gold-diff 100% (leaner, 78→56
    placeholders); 88 tests green. BCD unchanged (P01's TH_ codes were never registered). P01 reference **blessed +
    merged** (vault PR #4, repo PR #14).
  - **SC-0013 — P02–P06 roll + corrective second pass.** First roll applied the discipline but over-deleted §3C
    on a false premise ("P02–P05 had no §3C entities"). **Corrective second pass** (this session) brought P02–P06
    to the blessed-P01 standard per the lead's rulings: **restored the real Concept-Bank §3C entities** the first
    pass wrongly removed — P02 (bread/hesed/blessing/rest), P04 (barley-harvest), P05 (chayil/favor/gleaning/
    miqreh/blessing + the within-day duration), P06 (FOR_MODEL additively aligned to the map's CB_ keepers);
    P03 §3C "None" confirmed correct. **Replaced every generic count-note with per-item relocation notes** (item →
    named destination, matching P01) and added the relocation made-real bits (kallah/Moabite/foreman →
    `referential_form`; mother's-house → `PL`). Per-item relocation audit: `docs/SC-0013-RELOCATION-AUDIT.md`
    (proves relocate-never-delete; every removed item → destination, verified). **Corpus lint 19 → 14 (0 tier-1)**
    after SC-0014; validate 6/6; coverage 6/6 block-clean (245/245, 0 unanchored); gold-diff agreement unchanged
    (P01 100·P02 90·P03 100·P04 95·P05 98·P06 96); 89 tests green; check-drift clean. **Residuals surfaced for the
    lead (not decided):** (a) the **§4 Q&A dialogue compounds** (13, each with a proposed atomization in the audit);
    (b) **P04's doubled-divine-name figure** — the YHWH×2/Shaddai×2 pattern has no figure of its own (the four
    invocations survive); a `FIG` is **proposed, not added** (STOP for the lead). Pending blessing — vault PR #5 /
    repo PR #15 (superseded by this pass).
  - **SC-0014 — SPEECH_ACT rename (governed L1).** `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` →
    `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (drops the "AGENT" role-theory jargon, R4; "GOD" not "YHWH" — SPEECH_ACT
    is cross-corpus). `validation-rules.json` **v0.6 → v0.7**, `compilation-log.schema.json` **v0.4 → v0.5**
    (enum kept in sync), both re-pinned; P02/P04 FOR_MODELs (×5) + COMPILATION-LOGs + Agent-3 prompt + Pilot-2
    glossary migrated. Removed the 5 FOR_MODEL `«agent»` lint findings. (Incidentally re-synced the vault `_spec/`
    schemas, which were behind the compiler at v0.3 — missing SC-0007's slots; flagged for a vault-writeback pass.)
  - **SC-0015 — extend the Level-3 lint to the §4 operating test.** The SC-0012 lint was blind on §4: it skipped
    every `cross_ref` line, scanned only answers, and missed meta-questions + comma-compounds + collapsed counts.
    Extended `lintMeaningMap`: new `link_in_level3` (flag inline cross_ref/links) + `meta_question` rules;
    question-side scan incl. same-line `**Q:**…**A:**`; comma compounds with an **entity-list guard**; §4-answer-only
    `answer_labels` (scoped so they never fire on a governed `speech_act` enum or §3C note); `+hifil`; truthful
    per-proposition reporting (location + context in the dedup key). lint-lexicon **0.1.0→0.2.0** re-pinned.
    Corpus lint **14 (collapsed) → 150 (true)**. `lintForModel` untouched (0 FOR_MODEL findings).
  - **SC-0016 — the §4 content sweep (operating test, P01–P06).** Applied Marcia's per-row rulings to the 150
    findings: removed **60 inline cross_refs** (spans kept in §5A/§5B; figure-registry enrichment = deferred vault
    patch), converted **21 meta-questions** to payload (or dropped where redundant), atomized **39 compounds**,
    rephrased **19 jargon** hits, bared **11 §4-answer labels**. **6 genuinely-exegetical keeps** (vocative,
    discourse-opener, oath formula, party-pair, withholding-note) signed off in a new pinned
    `_spec/lint-exceptions.json` (the SC-0010 coverage-exceptions analogue — `tripod lint` shows them `✓ ACCEPTED`,
    excluded from drift). **`lint --corpus` → 0 drift · 7 accepted · exit 0** (the operating-test bar, mechanized;
    the 7th keep "her father and her mother" added at the blessing pass). `validate` 6/6 · `coverage` 6/6 ·
    `gold-diff` (P01 100·P02 90·P03 100·P04 95·P05 98·P06 96) · 97 tests. **BLESSED by Marcia 2026-05-31.**
    Per-proposition relocate-never-delete proof: `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md`.
  - **SC-0016 vault writeback — DONE (2026-05-31).** The deferred canonical sync: vault `pericopes/P01–P06`
    now **byte-identical** to compiler `fixtures/meaning-map/` (faithful §4 transcription, diff-first/no-clobber,
    based on a fresh branch off `origin/main` after verifying the old vault branch held only an empty auto-backup
    commit); figure proposition-spans recorded additively in vault `figures/` (32 files, 96 insertions / 0 del).
    **Task A:** new figure **FIG_0195** (Fourfold Divine Naming in Lament — the pattern, complementing FIG_0006 +
    FIG_0086) wired into vault + fixtures (figure file + P04 BCD-DELTA + map §5B/active-figures + FOR_MODEL
    P4/P5 figure_flags); gold-diff re-baselined (P04 37→38). **Task B:** SC-0014 forward-pointer recorded (old
    value still in the Pilot-3 Layer-2 seed CSV → reconcile at Pilot-3 lock; pointer only). Delivered via a
    reviewed vault PR; vault returns to clean `main` on merge. invariant restored: vault `pericopes/` ≡ fixtures.
  - **SC-0017 — the §3C de-leak (2026-06-01).** Stripped process-commentary (SC-IDs, "per the content
    discipline", "§3C entities only", "X → Proposition N" relocation trails) from the content layers —
    maps §3C **and** FOR_MODEL `objects_in_scene._note` (the leak was in both trees, phrased differently;
    P01's FOR_MODEL used `(SC-0012)` an earlier narrow grep missed). Kept entities + the plain
    considered-absence; removed the stale P04 `- PENDING (doubled-divine-name)` bullet (FIG_0195 now captures
    it). `_note` rule: drop the key where the scene has entries; reduce to minimal where `entries: null`.
    **Zero-grep across both trees** (union `relocat|SC-00\d\d|→ Prop|content discipline|§3C entities only`);
    validate 6/6 · lint 0 drift/7 accepted · coverage 6/6 · gold-diff agreement UNCHANGED (only the
    informational `judgmentPlaceholders` count fell, baseline re-written) · 97 tests · check-drift clean.
    Removal-only (21 ins / 101 del). Record preserved in the SC-0013/SC-0016 audit docs. **SHIPPED + vault-synced
    (both PRs merged 2026-06-01 — compiler #17, vault #7): vault `pericopes/`+`stas/` byte-identical to the
    deleaked fixtures, the template + discipline-doc (R6) hygiene landed in the vault, both branches deleted.
    The §3C / Level-3 content-discipline arc SC-0012 → SC-0017 is closed.**
- **Forward-looking docs** in `docs/`: `COVERAGE.md` (BHSA coverage-reconciliation, fidelity floor —
  now shipped for P01), `READING_QUALITY.md` (human review gate, fidelity ceiling),
  `SOURCE_AND_SCALING.md` (BHSA frozen extract + per-book BCD-by-delta). Gate order:
  conformance → coverage → reading-quality.
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
2. **Coverage ledger + BHSA frozen-extract sidecar — SHIPPED across the compiled corpus P01–P06, 6/6
   block-clean** (see Shipped above; Israel adjudicated as SC-0010, gender hardened as SC-0011). Remaining:
   (a) **extract P07–P14 when those pericopes are compiled** — they have no FOR_MODEL or decided verse ranges
   yet, so coverage can't run on them (the `extractor/pericopes.json` ranges stop at P06); (b) wire coverage
   into the gate order after conformance (conformance → **coverage** → reading-quality).
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
