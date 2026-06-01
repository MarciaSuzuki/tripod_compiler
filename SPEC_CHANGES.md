# SPEC_CHANGES — governed edit log for the Tripod STA spec

Every change to the **locked spec** (`validation-rules.json` and the controlled vocabulary it
defines) is recorded here, in order, before it ships. This log is the human-readable audit
trail behind the pinned spec version the compiler vendors. It exists for the same reason the
compiler does: schema drift is only safe when it is **deliberate, recorded, and versioned**
(Tripod training paper §12).

## Rules
- **No silent edits.** A change to `validation-rules.json` is not "done" until it has an entry
  here with status `APPROVED` and an implementation note.
- **One entry per decision**, newest at the top. Never rewrite a shipped entry; supersede it
  with a new one.
- **SC IDs are append-only and never reused.** Once allocated, a number is permanently bound to
  one decision. If a decision is abandoned, renamed, or its number was taken in another session,
  give it the **next free** number and mark the old allocation `VOID`/`SUPERSEDED(→SC-YYYY)` in the
  SC-ID allocation ledger below — never silently rebind a live number to a different decision.
- **Canonical home (one sequence, one home).** This log governs the spec, and the canonical spec
  lives in the wiki vault — so the canonical `SPEC_CHANGES.md` (and `VOCABULARY_LOG.md`) live in the
  wiki `_spec/` beside `validation-rules.json`, and the compiler **vendors + pins** them exactly as it
  vendors the schemas. `tripod check-drift --vault` then asserts the compiler's mirror == the wiki
  canonical, so a wiki-side spec edit cannot bypass the log. (Ruling 2026-05-29. The wiki is
  remote-less, so the compiler's pushed mirror is the durable copy — vendor+pin is the durability
  layer, not a convenience.) **Implementation pending** (next governance task, gates SC-0008): add
  both files to `_spec/pins.json` + the pin table and relocate them under `_spec/` so the pin path
  resolves; until then they remain compiler-repo docs and this rule states the target, not the state.
- **Bump the spec version** on every shipped change and record the new version + file hash so
  the compiler's vendored-copy drift-check can pin to it.
- **Migrate artifacts in the same entry.** If a change invalidates existing artifacts
  (e.g. a value moves lists), list the affected pericopes and the migration, so the gold
  fixtures and the spec never disagree.
- **Authority:** content/methodology rulings are made by the project lead (Marcia Suzuki);
  the compiler implements and verifies them.

## Spec version pin (current)
`tagset_version`: `TRIPOD_STA_v2_0`. Vendored + drift-checked in the compiler at `_spec/` (see `_spec/pins.json`; `tripod check-drift` enforces these).

| Schema | Version | sha256 |
| --- | --- | --- |
| `validation-rules.json` | `v0.7` | `8c436b261178517108cb44e39408bca2c99dfd8674fb4954ccf2e72197cadcbe` |
| `compilation-log.schema.json` | `v0.5` | `f009b32781f8a0e4d4d40e4f7500dd64396bdeeb06e3fe16d9ff2214033c36ca` |
| `bcd-delta.schema.json` | `v0.4` | `b6afeceaef7076ef8693316425a794757f3b0230a2a408957bae23e3806baa04` |
| `verification-input.schema.json` | `v1.1` | `03e51d5aa0363df6512a40779fb5858c4bfe60d58025a72afe8f3320623835d1` |
| `approved-enumerations.json` | `v0.4` | `309e5fa71e170b5df52b33c982b630e0fe6eaabb416d0ee12fb317903e9e4de1` |

Routine vocabulary promotions (growing `approved-enumerations.json`) are logged in [`VOCABULARY_LOG.md`](VOCABULARY_LOG.md), not as a new SC each time (SC-0006 establishes the mechanism); each promotion re-pins the registry above.

---

## SC-ID allocation ledger (canonical)
The authoritative registry of every SC number. IDs are **append-only and never reused** (see Rules).
The chronological entries below carry the detail; this table is the index — one row per number, each
number bound to exactly one decision.

| SC-ID | Decision (current binding) | Status |
| --- | --- | --- |
| SC-0001 | REGISTER 8→7; move COMMUNITY_MEMORY to a NARRATIVE_FRAMING axis | SHIPPED |
| SC-0002 | Propagate the register split into prompts/templates | SHIPPED |
| SC-0003 | Clean residual "elevated register bordering on COMMUNITY_MEMORY" prose | SHIPPED |
| SC-0004 | Deprecate the pre-Wave-3 `_examples/` P01 duplicates | SHIPPED |
| SC-0005 | Widen the `place_id` pattern to `PL<n>_<DESCRIPTOR>` | SHIPPED |
| SC-0006 | Drift convergence: convergent/descriptive split + approved-enumerations registry | SHIPPED |
| SC-0007 | Converge the L1 / discourse / high-risk axes (add a COMPILATION-LOG promotion slot) | SHIPPED |
| SC-0008 | Template relics: retire obsolete for-model/audit templates | PROPOSED |
| SC-0009 | Merge PL_HA_ARETZ → PL_LAND_OF_JUDAH (same-referent principle, Layer-3) | SHIPPED |
| SC-0010 | Coverage recorded-exception mechanism + P06 "Israel" epithet-internal ruling | SHIPPED |
| SC-0011 | BCD `gender` frontmatter field (authoritative; replaces the prose-guess) | SHIPPED |
| SC-0012 | Level-3 / §3C content discipline (R1–R5) + the `tripod lint` drift-guard | SHIPPED (lint + discipline + template); map remediation follows |
| SC-0013 | Map content remediation under SC-0012 — P01 reference + P02–P06 roll | P01 SHIPPED; P02–P06 §3C+plain-language APPLIED (pending blessing); §4 dialogue re-atomizing = lead's exegetical pass |
| SC-0014 | Rename SPEECH_ACT `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` → `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (drop "AGENT" jargon) | APPLIED (pending the lead's blessing) |
| SC-0015 | Extend the Level-3 lint to enforce the operating test: flag cross_ref/inter-proposition-link lines + meta/analytical questions in §4, scan questions (not just answers) incl. same-line Q&A, add comma compounds with an entity-list guard; lint-lexicon v0.1.0→v0.2.0 (re-pinned) | APPLIED |
| SC-0016 | Level-3 §4 content sweep under SC-0012/SC-0013 (remove cross_ref/link lines → relocate figure spans; convert meta-questions to payload; atomize compounds) — P01 reference then P02–P06 | PROPOSED |

**Superseded / void allocations (recorded, never rebound):**
- **SC-0006 — "Template relics" (planning-time allocation; never committed to this log) → VOID.**
  Cross-session history shows the template-relics fix was tentatively numbered SC-0006 in an earlier
  planning session, but it was never written into SPEC_CHANGES.md under that number: the committed log
  ran SC-0001→SC-0005 (`84bd95c`), and SC-0006 first appears already bound to "Drift convergence"
  (`9fdef18`, 2026-05-29). That binding is now load-bearing — every seeded value in
  `approved-enumerations.json` carries `sc_ref:"SC-0006"` and `promote.ts` stamps it by default — so
  SC-0006 stays bound to drift convergence. The template-relics decision is reinstated below as
  **SC-0008**. This cross-session collision is why the append-only-IDs rule now exists.
- **SC-0007 — double-booked in `docs/PROGRESS.md`** between L1-axis convergence (Next #1) and template
  relics (open-thread (c): "pick one"). Reconciled: **SC-0007 = L1-axis convergence** (it closes
  SC-0006's flagged known limitation), **SC-0008 = template relics**.

---

## Entry template
```
## SC-XXXX — <short title>
- Date: YYYY-MM-DD
- Decided by: <name>
- Status: PROPOSED | APPROVED | SHIPPED | SUPERSEDED(→SC-YYYY)
- Type: closed-list change | bounded-list change | registry/BCD | schema-shape | axis reclassification | other
- Summary: <one line>
- Rationale: <why; link to discussion/doc>
- Spec change (exact): <fields/lists added, removed, moved; before → after>
- Artifact migration: <affected pericopes + what changes in each; or "none">
- Validator impact: <new/changed rule behaviour>
- Version: <old spec version> → <new spec version> (sha256 <hash>)
- Verification: <how we confirmed: fixtures re-validate clean, etc.>
```

---

## SC-0016 — Level-3 §4 content sweep (operating test) under SC-0012/SC-0013
- **Date:** 2026-05-31
- **Decided by:** (pending — Marcia Suzuki)
- **Status:** **PROPOSED** — human-gated, exegetical, **not performed here.**
- **Type:** artifact remediation (no schema/spec change).
- **Summary:** SC-0015 made the lint *see* the §4 blind spots; this entry is the **content** follow-up that
  acts on what it now surfaces — the §4-proposition layer counterpart to SC-0013's §3C sweep. Scope (per the
  SC-0015 inventory): (a) the inline **`cross_ref` / inter-proposition-link lines** that don't belong in a
  Level-3 payload block (exactly 1 per map across P01–P06) → relocate the figure span into the figure-registry
  entry (`figures/FIG_*.md`: "opens at P#, closes at P#" + keep-image guidance), de-duplicating not deleting;
  (b) the **meta/analytical questions** ("Construction form?", "Verb root?",
  "Arrival completion marker?", …) → rewrite as payload Q or move the analysis to conditioning; (c) the
  **compound / non-atomic answers** → atomize into one-act-per-pair; (d) the residual question/answer-side
  **forbidden vocabulary** ("verb", "agent", "lexeme", "clause", "subject") the question-scan now catches.
- **Why deferred:** every one of these is an exegetical judgment (where an insight re-homes, how a clause
  atomizes) that is the project lead's call, exactly as SC-0013's §4-dialogue re-atomizing was reserved. The
  lint **surfaces**; the human **relocates (never deletes)**. The order mirrors SC-0013: **P01 worked reference
  first**, then the P02–P06 roll calibrated to it.
- **Spec change (exact):** none. (`tripod lint` already enforces the test as of SC-0015.)
- **Artifact migration:** pending — P01 then P02–P06 `fixtures/meaning-map/*` + the mirrored vault maps; out of
  scope for SC-0015 (which is tooling only and touches **no** fixture content).
- **Verification (target):** after the sweep, `tripod lint --corpus` reaches the operating-test bar on §4
  across P01–P06 — **0 cross_ref/links, 0 meta-questions, 0 jargon, 0 interpretive labels, 0 compounds, 0
  conditioning-questions** (the few genuinely-exegetical residuals are resolved by the lead's ruling, not left
  as drift); `validate` 6/6, `coverage` 6/6, `gold-diff` unchanged still hold.

---

## SC-0015 — Extend the Level-3 lint (operating test on §4 blocks)
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **APPLIED** (repo PR for the lint engine + lexicon + tests; no vault artifact touched).
- **Type:** tooling / drift-guard (no closed-list change; no schema-shape change).
- **Summary:** The SC-0013 relocation audit found the SC-0012 `lintMeaningMap` was **blind in three ways** on
  the Level-3 §4 layer, so the operating test (*a Level-3 block contains ONLY payload Q&A pairs — flag every
  line that isn't one*) was only half-enforced. This extends the lint with **six** changes:
  1. **`link_in_level3` (new rule, tier-1).** The old code `continue`d past every line matching `cross_ref`
     (and `[[FIG_…]]` pointer lines), so inline cross_refs/inter-proposition links in §4 were never flagged.
     That skip is **removed**; such lines are now FLAGGED via a new `link_markers` lexicon list
     (`cross_ref`, `caused_by`, `paired_with`, `forward_link[-]`, `back_reference[-]`,
     `back_reference_to_proposition`). The link rule short-circuits the line, so a `[[FIG_…]]` cross_ref is
     reported **once** (as the link), never double-counted as an interpretive_label.
  2. **Question-side scanning.** The old code looked only at `**A:**` answers. The loop now splits each line
     into `{q, a}` (new `qaParts`, handles same-line `**Q:** … **A:** …` and split forms) and runs the
     forbidden-vocabulary / interpretive-label scan over the **question** too (this is what surfaces
     `«verb»`/`«agent»`/`«lexeme»`/`«clause»`/`«subject»` in analytical prompts).
  3. **`meta_question` (new rule, tier-2).** A new `meta_questions` lexicon list (regex sources:
     `construction`, `verb[- ]chain`, `pattern?`, `stylistic`, `texture?`, `effect?`, `closure label`,
     `root?`, `…-marker`/`marker?`, ordinal `… part?`, `…-form?`) flags analytical/meta questions about
     form/structure/style that aren't payload.
  4. **Comma compounds + entity-list guard.** `compound_markers` gains `", "`; the compound check moves into a
     new `compoundMarker(a)` helper that, for `, ` / ` and `, first strips wikilinks, entity-id tokens and
     proper names, so an answer that merely **names** several entities ("his two sons [[B4]] Mahlon and [[B5]]
     Chilion"; "the family [[B2]] Elimelech, [[B3]] Naomi") is **not** flagged — only a connector still
     joining two word-groups after stripping (two acts/clauses) is.
  5. **Conditioning bleed on the question side** (new `conditioning_qa` values `tone?`, `pace?`, `genre?`,
     `scene-kind?`, `proposition-kind?`) is matched as a whitespace-bounded substring on the question (and on
     stray non-Q&A lines), not a naïve whole-line `includes`.
  6. **More §4-answer labels (scoped, not shared).** The softer dialogue-paraphrase labels the SC-0013 audit
     listed (`declaration`, `full[- ]knowledge`, `instruction about`, `further command`/`further instruction`,
     `reports a`, `recites`/`recital`, `answers with`) go in a **new `answer_labels` lexicon list applied to
     meaning-map §4 ANSWERS ONLY** — deliberately *not* added to the shared `interpretive_labels` (which
     `scanProse` also runs over FOR_MODEL fields and §3C notes). This keeps them from false-positiving on a
     governed closed-list `speech_act` value (e.g. `REFUSES_REQUEST_WITH_COUNTER_DECLARATION` contains
     "DECLARATION") or a §3C relocation `_note` — both **out of scope** for the §4 content sweep and not
     fixable by it. (A first cut merged them into `interpretive_labels`; that surfaced 6 FOR_MODEL findings on
     exactly those governed enums/notes and was corrected to the scoped list.) Also added the **`hifil`**
     spelling to `forbidden_vocabulary` (the list had `hiphil` only; R4 names "hifil/qal/piel").
  7. **Truthful per-proposition reporting.** The finding `location` now carries the current Level-3 block
     (`§4 Prop 5 · A`, etc.) and `finalize`'s de-dup key includes `context`, so distinct lines that share a
     rule+match (e.g. 21 inline cross_refs in P05, each its own relocation) are counted **separately** instead
     of collapsing to one. A genuine re-scan of the identical string (FOR_MODEL `walkStrings`) still collapses.
     This makes `lint --corpus` the true §4 inventory the sweep is measured against, not a coarse undercount.
  `lintForModel`, `scanProse`, `walkStrings`, `section`, `R1_NOT_ENTITY`, `snake` are unchanged
  (FOR_MODEL `cross_ref`/link fields are intentionally left alone), so **no FOR_MODEL finding count changes**.
- **Files touched:** `src/engine/lint.ts` (rule union + `Lexicon` fields incl. `answer_labels` +
  `qaParts`/`compoundMarker` helpers + rewritten `lintMeaningMap` per-line loop, answer_labels applied
  answer-side only); `_spec/lint-lexicon.json` (`schema_version` 0.1.0→0.2.0; `+link_markers`,
  `+meta_questions`, `+answer_labels` (10, §4-answers-only), `+hifil`, `compound_markers += ", "`,
  `conditioning_qa +=` 5, `interpretive_labels` left at its original 15, `_doc` refreshed); `tests/lint.test.ts`
  (rewrote the old "exempts cross_ref" test to assert the new FLAG behavior + once-not-twice count; added
  meta-question, question-side-jargon, comma-compound + entity-list-guard, answer-label-in-§4, and a
  FOR_MODEL scope-guard test proving a soft label inside a closed-list `speech_act`/§3C note is NOT flagged);
  `_spec/pins.json` (re-pin, below); this log.
- **Lexicon re-pin:** `lint-lexicon.json` **0.1.0 → 0.2.0**;
  sha256 `15a67a5fe1a9e646b76efc7195fa1bdbaf8fe6e6079d186b56e269d841b7b825` →
  `5bfa0e3fa9afdb8b90912865185a95c8596a7e1c3c58f90000ed748e2f3bb8f2`. `tripod check-drift` green at the new pin.
- **Relation to SC-0012/SC-0013:** completes SC-0012's drift-guard by closing the cross_ref-skip and
  answer-only blind spots the SC-0013 audit found; it does **not** touch artifact content — the content sweep
  those findings call for is reserved as **SC-0016** (human-gated).
- **Validator impact (corpus lint, before → after):** `tripod lint --corpus` **14 → 150** findings
  (**0 → 62 tier-1**, 88 tier-2); **7 artifacts clean** (P01 meaning-map after its cross_ref removal under
  SC-0016, + all six FOR_MODELs — unchanged from baseline). All newly-surfaced findings are in the
  previously-invisible meaning-map §4/§3C layer; the true per-rule corpus tally is **60 `link_in_level3`**
  (inline cross_refs: P02 2 · P03 5 · P04 19 · P05 21 · P06 13), **21 `meta_question`** (P03 1 · P04 9 ·
  P05 9 · P06 2), **39 `compound`** (P02 7 · P03 5 · P04 8 · P05 10 · P06 9), **19 question/answer-side
  `forbidden_vocabulary`** (`verb`/`agent`/`lexeme`/`clause`/`subject`/`hifil`: P02 5 · P04 7 · P05 4 · P06 3),
  **11 §4-answer `interpretive_label`** (P02 1 · P06 10). (The pre-truthful-reporting view collapsed these to
  54 by de-duping per coarse location.) No FOR_MODEL count changed (lintForModel untouched; answer_labels are
  §4-answer-scoped).
- **Verification:** `npm test` 94/94 green (lint.test.ts 14/14); `tripod check-drift` clean incl.
  lint-lexicon at v0.2.0 + the closed-list sync invariant; `tripod validate fixtures/for-model/` 6/6 valid;
  `tripod gold-diff` unchanged (P01 100 · P02 90 · P03 100 · P04 95 · P05 98 · P06 96);
  `tripod coverage --corpus` 6/6 block-clean (245/245). No fixture content edited.

---

## SC-0014 — Rename SPEECH_ACT `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` → `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **APPLIED — pending the project lead's blessing** (vault PR for P02–P06 / repo PR for the spec + fixtures).
- **Type:** closed-list change (L1 SPEECH_ACT) + artifact migration.
- **Summary:** `tripod lint` surfaced that the closed SPEECH_ACT list carried
  `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` — "AGENT" is role-theory jargon (R4), in a Layer-1 closed-list
  value, so it cannot be fixed by content edits. **Ruling:** rename it to **`ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`**
  — drops the "AGENT" jargon; uses **GOD** (not YHWH) because SPEECH_ACT is the cross-corpus interlanguage
  (it must read for the LA_RECORDING profile too). The new value carries no forbidden-vocabulary token.
- **Spec change (exact):**
  - `validation-rules.json` `closed_lists.SPEECH_ACT`: `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` →
    `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (one value; no other list touched). Version **v0.6 → v0.7**,
    `$id` + `for_model_schema.$id` bumped, `sibling_schemas.compilation_log` → `v0.5`, `supersedes` appended.
  - `compilation-log.schema.json` `$defs…speech_act` enum: same rename (kept in sync). Version **v0.4 → v0.5**,
    `$id` bumped, `supersedes` appended. (No structural change — additive-only history preserved.)
  - There is **no** `for_model_schema.$defs.speech_act_value` enum (SPEECH_ACT is enforced by the L1
    closed-list block, not an ajv enum), so the closed-list **sync invariant** — which covers
    REGISTER / GENRE / NARRATIVE_FRAMING — is unaffected.
- **Artifact migration (done):** the value occurs as a structured `speech_act` in **P02 FOR_MODEL (×1, P12)**
  and **P04 FOR_MODEL (×4, P4+P5)**; migrated in vault `stas/` + compiler `fixtures/for-model/`. The P02/P04
  **COMPILATION-LOG**s (structured values + audit prose) migrated in vault + compiler fixtures. Propagated to
  `_spec/agent-3-system-prompt.md` (the Agent-3 prompt that emits the value) and the Pilot-2 usage glossary
  `_templates/sta-vocabulary.md`. **Deliberately NOT touched** (out of Pilot-2 scope): `_pilot-3-design/`, the
  bible-wide Layer-2 seed (`tripod-bible-wide-layer-2-vocabulary-seed-*` + `.csv`, `sta-vocabulary-general.md`)
  where it is a `PENDING_PILOT3_LOCK` candidate, and `_archive/` + `_working/` (historical audit trail).
- **Validator impact:** `tripod validate` blocks the old value (no longer in the closed list) and accepts the
  new one. The 5 FOR_MODEL `[forbidden_vocabulary] «agent»` lint findings disappear (corpus lint **19 → 14**,
  the residual 14 being the §4 Q&A dialogue reserved for the lead).
- **Version:** `validation-rules.json` **v0.6 → v0.7** (sha256 `8c436b261178517108cb44e39408bca2c99dfd8674fb4954ccf2e72197cadcbe`);
  `compilation-log.schema.json` **v0.4 → v0.5** (sha256 `f009b32781f8a0e4d4d40e4f7500dd64396bdeeb06e3fe16d9ff2214033c36ca`).
  Both re-pinned in `_spec/pins.json` + the pin table above.
- **Note (pre-existing drift observed, flagged):** the vault `_spec/compilation-log.schema.json` was at **v0.3**
  and lacked SC-0007's promotion slots — i.e. SC-0007 had shipped to the compiler's vendored/pinned copy but was
  never written back to the vault canonical. Applying SC-0014, the vault `_spec/` schemas were re-synced to the
  pinned compiler copies (v0.7 / v0.5), incidentally closing that drift. Vault COMPILATION-LOG **artifacts** were
  not back-filled with SC-0007 convergent values (out of scope); flagged for a future vault-writeback pass.
- **Verification:** `tripod check-drift` green against the new pins + the closed-list sync invariant;
  `tripod validate fixtures/for-model/` 6/6 valid; `tripod validate fixtures/compilation-log/` 6/6 valid
  (P02/P04 against the renamed v0.5 enum); `tripod lint --corpus` 14 findings (0 tier-1), the 5 `«agent»`
  findings gone; `npm test` green.

---

## SC-0013 — Map content remediation (SC-0012): P01 reference + P02–P06 roll
- **Corrective second pass — P02–P06 brought to the blessed-P01 standard (2026-05-31):** the first roll
  (below) was sound on the plain-language (R4) fixes, the dialogue intact, and P06's keepers — but it
  over-deleted §3C on a **false premise** ("P02–P05 had zero §3C entities"). Per the lead's rulings, those
  pericopes **do** reference real Concept-Bank entities that belong in §3C (R1, per blessed P01/P06). Restored
  as proper §3C entities (map: Hebrew header + What-it-is/Function/Signals; FOR_MODEL: `objects_in_scene`
  `object_id: CB_00xx` + `function_in_scene`), BCD unchanged (these CB_ were already registered):
  - **P02** — bread `CB_0012` (S1); hesed `CB_0011`, blessing `CB_0008`, rest/menucha `CB_0014` (S2).
    Relocations made real: daughter-in-law (kallah) → B8/B9 `referential_form` (`CB_0017`); mother's-house →
    place `PL_EACH_HER_MOTHERS_HOUSE` (`CB_0013`); paqad / news-hearing / departure verbs → P1–P3.
  - **P03** — §3C "None" confirmed correct; the six vow bindings verified surviving in P3 `vow_components`;
    pairing `CB_0021` + `FIG_0072`/`FIG_0074` and levirate `CB_0019` verified as flags.
  - **P04** — barley-harvest `CB_0026` (S3). Mara `CB_0023` (→ P4 renaming + B3 `referential_form` + `FIG_0082`),
    full/empty `CB_0024`+`CB_0044` (→ `FIG_0084` + P5 payload), testify-against `CB_0025` (→ P5), Moabite
    `CB_0004` + daughter-in-law `CB_0017` (→ B9 `referential_form`) all verified. **STOP / surfaced for the
    lead:** the **doubled-divine-name pattern** (YHWH×2 / Shaddai×2, 1:20–21) has **no figure of its own** —
    its four invocations survive (Shaddai→`FIG_0006`; YHWH→P5+`CB_0025`) but the pattern-as-figure was dropped;
    a new `FIG` is proposed (handoff), not added pending the ruling.
  - **P05** — chayil `CB_0032` (S1); favor `CB_0033`, gleaning `CB_0034` (S2); providence/miqreh `CB_0035`,
    blessing `CB_0008` (S3); foreman-role `CB_0036` verified in B15 `referential_form`, Moabite `CB_0004` added
    to B9 `referential_form`. The within-day "from morning until now" duration restored to §3C (it was a
    content-duration the map's §3D note still pointed at, per the P01 `TM_TEN_YEARS` precedent).
  - **P06** — keepers unchanged; the FOR_MODEL was additively aligned to the map, which retained `CB_0034`
    (S1/S4) and `CB_0033`/`CB_0038`/`CB_0037`/`CB_0008` (S2) as §3C entities the FOR_MODEL had dropped.
- **Per-item relocation notes (both artifacts) replace the first pass's generic per-scene counts** ("N thematic
  items relocated…"), matching P01's item→named-destination standard; a per-pericope relocation audit table
  proves relocate-never-delete. The deleted `*_form` slots were re-verified (grammatical-pattern labels; the
  events survive in `proposition_kind`/components).
- **Result (corrected):** corpus lint **19 → 14** (0 tier-1; the 14 are §4 Q&A dialogue + were 19 before SC-0014
  removed the 5 `«agent»`); validate 6/6; coverage 6/6 block-clean (245/245, 0 unanchored); gold-diff agreement
  unchanged; tests green.
- **Residuals (by design, surfaced for the lead):** (a) the **§4 Q&A dialogue compounds** (re-atomizing is the
  lead's exegetical pass — each surfaced with a proposed atomization, not decided); (b) the **P04 doubled-divine-name
  figure** (above).

### First roll (2026-05-31, superseded above)
- **P02–P06 roll:** applied R1/R3/R4/R5 across P02–P06 (vault + fixtures). **§3C → entities
  only:** 116 thematic objects (events/speech-acts/framings/patterns — *_form/_verb/_formula/_directive/
  _question/_declaration) removed from `objects_in_scene`, with their orphaned `*_form` slots (R5
  conditioning) and the mirrored map §3C entries; only true O#/CB_ entities kept (~~P02–P05 had none~~ —
  **corrected above**; P06 keeps O9/O10/O11 + CB_*). Plain-language fixes (R4): action/referential values
  "DIVINE_AGENT"→"YHWH", significant_absence "agent/verb" prose, P06's marquee items ("speech-act of directive
  instruction"→"telling", "abundance triplet — three verbs"→"she ate · she was satisfied · she had leftover",
  "infinitive-absolute doubling"→plain). P06 conditioning-Q&A (Register?/Self-form?/Forward-link?) removed (R5).
- **Result:** corpus lint **~182 findings (56 tier-1) → 19 (0 tier-1)**; validate 6/6 clean; coverage 6/6
  block-clean (leaner abstract overlays); gold-diff agreement unchanged (leaner placeholders); 88 tests green.
- **Pending the lead's blessing** (vault PR #5 / repo PR #15, superseded by the corrective pass).

---

## SC-0013 — Map content remediation (SC-0012): P01 worked reference
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **P01 APPLIED — pending the project lead's blessing** (vault PR for P01 map + FOR_MODEL);
  P02–P06 roll once P01 is blessed. The worked reference calibrates the rest.
- **Type:** artifact remediation (no schema/spec change).
- **Summary:** Apply R1–R5 to P01's §3C + Level 3. §3C shrinks from ~17 thematic entries to **3 true
  entities** (O1 famine · CB_0030 sojourn · the about-ten-years duration). Every relocated item's insight
  is re-homed (never deleted), documented inline in `_note`s:
  - **events → propositions:** death of Elimelech→P7, taking of wives→P9, deaths of both sons→P12, prior-death-referenced→P13 link;
  - **framings → referential_forms:** "husband of Naomi"→B2@P7, "the woman"→B3@P13, "her children" (yeladim)→B4·B5@P13, "for themselves"→P9 OWN_INITIATIVE, Ephrathite identity→being B6;
  - **patterns → figures / inherent / order-constraint:** vayhi formula→FIG_0007, residual "she remained"→FIG_0052, "both of them"→inherent in deceased[B4,B5], cumulative listing→P13 listing_order_form (no new figures, per the lead's call).
  - **plain-language (R4):** significant_absence "agent of the famine" → "the one who sent the famine".
- **Artifact migration:** **P01.** Vault `stas/P01-…-FOR-MODEL.md` (objects_in_scene + slot cleanups) and
  `pericopes/P01-…md` (§3C) — mirrored to `fixtures/`. **BCD unchanged** (P01's TH_ codes were never registered).
- **Verification:** `tripod lint` P01 **12 findings → 0 (clean)**; `validate` 0-block; `coverage` P01 still
  block-clean (abstract overlays 15→2); `gold-diff` P01 **100%**, leaner (78→56 placeholders); 88 tests green.

---

## SC-0012 — Level-3 / §3C content discipline (R1–R5) + the `tripod lint` drift-guard
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** (the rule, the lint, and the template remediation); the **map remediation is a
  gated follow-on** (P01 first). Wiki side: vault PR [ruth-pilot-b-wiki#3](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/3).
- **Type:** methodology + tooling — **no `validation-rules.json` change**.
- **Summary:** The content layers — Level 3 propositions and §3C — must hold only the **bare, atomic,
  plain-language payload**; everything else (interpretation, classification, grammatical analysis,
  register, links, figures, cross-refs) is **conditioning** (its own field/layer) or doesn't belong.
  Five rules: **R1** §3C = entities only (events→propositions, framings→`referential_form`,
  patterns→figures); **R2** atomic; **R3** bare (content, not a label for it); **R4** plain-language (no
  grammatical/linguistic jargon — *the locked anti-colonial-frame commitment*: a map that says
  "wayyiqtol" or "patient" teaches downstream models the source grammar and imposes it on unknown target
  languages); **R5** payload-only (conditioning separated).
- **Spec change (exact):** new vendored **`_spec/lint-lexicon.json`** (forbidden vocabulary tiered,
  interpretive labels, conditioning-Q&A patterns, compound markers, substitutions — sourced from the
  methodology doc), pinned in `_spec/pins.json` → `sources`. New engine `src/engine/lint.ts` + CLI
  `tripod lint [paths…] [--corpus] [--tier1]`. Wiki: `_methodology/level3and3Ccontentdiscipline.md` (the
  rule) + `_templates/meaning-map-template.md` remediated (§3C entities-only; §6.2 atomic-bare-plain-payload).
- **Validator impact:** a **4th deterministic verifier** beside validate/coverage — it *surfaces* drift
  (the human judges + relocates insight, never deletes). Completes the stack: **legal (validate) ·
  complete (coverage) · atomic-bare-plain (lint) · true (human review).**
- **Inventory (drives the map remediation):** `tripod lint --corpus` over P01–P06 ⇒ **~182 findings** —
  87 forbidden-vocabulary, 48 §3C-not-an-entity (TH_ objects that are events/framings/patterns), 34
  interpretive labels, 10 compounds, 3 conditioning-in-Q&A. None block; all are review signal.
- **Version:** no spec-version bump; `lint-lexicon.json` pinned `0.1.0`.
- **Verification:** 88 tests green (+8 lint: whole-word discipline so "verb"⊄"adverb" and controlled
  slot-names aren't flagged; R1/label/conditioning/compound detection); `check-drift` ok.
- **Follow-on (gated):** remediate the agent system-prompts + spec vocab prose; then the **map remediation**
  (P01–P06 §3C + Level 3) — exegetical, the project lead adjudicates; P01 first → confirm leaner & truer →
  roll P02–P06; re-validate + re-baseline gold-diff/coverage; **before Slice 4** (clean supervision in, clean drafts out).

---

## SC-0011 — BCD `gender` frontmatter field (authoritative; retires the prose-guess)
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** — wiki side **merged** (vault PR [MarciaSuzuki/ruth-pilot-b-wiki#2](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/2), rebased on `main`); compiler side shipped.
- **Type:** registry/BCD (Layer 3) — **no `validation-rules.json` change**.
- **Summary:** The coverage matcher used entity gender to disambiguate unnamed referents, but the only
  source was a **prose-scan guess** in `build_aliases.py` (count kinship terms in the BCD entry). It was
  unreliable — it read **YHWH** and **the field-foreman** as feminine (off surrounding pronouns) and three
  collectives (whole-city, clan, people-of-YHWH) as single-gendered — and a wrong gender can veto a correct
  match (it was wrongly flagging YHWH as missing until the corpus pass made proper-noun **name** matches
  gender-immune, SC-0010's sibling fix). Replace the guess with an **authoritative `gender` frontmatter
  field** on every being.
- **Spec change (exact):** BCD — add `gender: "m" | "f" | null` to all 31 being notes (after `b-code`).
  `null` = collective / mixed / office (do not guess). `build_aliases.py` reads it authoritatively (explicit
  `null` ⇒ no gender); the prose guess survives only as a fallback for a being lacking the field. Alias table
  re-pinned `aliases-0.1.1 → 0.1.2` (9 gender corrections; all non-gender fields byte-identical).
- **Artifact migration:** none (frontmatter-only; no FOR_MODEL/map/prose changes).
- **Validator impact:** none to block status — the corpus stays 6/6 clean (the proper-noun name match is
  already authoritative). Entity gender is now correct data for unnamed-referent disambiguation.
- **Version:** no spec-version bump; alias-table source re-pinned `0.1.2`.
- **Verification:** 80 tests green; `check-drift` ok; `tripod coverage --corpus` 6/6 clean; B10 (YHWH) gender = `m`.

---

## SC-0010 — Coverage recorded-exception mechanism + the P06 "Israel" epithet-internal ruling
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED**
- **Type:** tooling/spec (coverage) + a registry ruling — **no `validation-rules.json` change**.
- **Summary:** Coverage's "nothing missing" check blocks on a named referent the map omits. Some findings
  are *legitimately* not entities — the reviewer must be able to **sign off** so the block is recorded as
  accepted rather than silently suppressed (the open item in `docs/COVERAGE.md`: "how the reviewer signs off
  on exceptions"). Add a pinned `_spec/coverage-exceptions.json`; `tripod coverage` downgrades any matched
  finding to **ACCEPTED** (still shown in the ledger, with the reason + provenance), so it no longer fails
  the run. **First exception:** P06 — "Israel" (יִשְׂרָאֵל, 2:12) occurs inside the divine title "the God of
  Israel"; it qualifies the divine name, not a separately-tracked participant, so no `PL_ISRAEL` entity is
  warranted there. Ruling: **EPITHET_INTERNAL**.
- **Spec change (exact):** new vendored artifact `_spec/coverage-exceptions.json` (pinned in
  `_spec/pins.json` → `sources`). Match keys: `UNMAPPED_SOURCE` → (pericope, gloss, verse-prefix);
  `UNANCHORED_ENTITY` → (pericope, entity_id). Each entry carries `reason` + `accepted_by`/`accepted_on`/`sc_ref`.
- **Artifact migration:** none (no FOR_MODEL/map edits — the map intentionally does **not** tag Israel at 2:12).
- **Validator impact:** `reconcile()` gains an `exceptions` arg; accepted findings are excluded from the
  block counts and tallied as `score.accepted`; `ok` ignores accepted findings. Ledger + CLI show an
  "accepted exceptions" section and `· N accepted` in the score line. **Result: the full P01–P06 corpus is
  6/6 block-clean** (245/245 explicit accounted, 1 by this sign-off, 0 unanchored).
- **Version:** no spec-version bump; `coverage-exceptions.json` pinned at `0.1.0`.
- **Verification:** 80 tests green (raw P06 still flags Israel; the sign-off downgrades it to accepted;
  synthetic accept tests for both finding kinds); `check-drift` ok.

---

## SC-0009 — Merge PL_HA_ARETZ into PL_LAND_OF_JUDAH (the same-referent principle)
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** — wiki side **merged** (vault PR [MarciaSuzuki/ruth-pilot-b-wiki#1](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/1), approved by the project lead, rebased as `402f5ef` on `main`); compiler side shipped. Repo fixtures + pinned alias table confirmed identical to the merged canonical BCD.
- **Type:** registry/BCD (Layer 3) — **no `validation-rules.json` change**.
- **Summary:** "the land" (הָאָרֶץ, Ruth 1:1) and "the land of Judah" (אֶרֶץ יְהוּדָה, 1:6–7) are the
  **same geographic referent** (the covenant territory) seen at two moments — the famine that empties it
  and the bread/return that fills it. The P01 working code `PL_HA_ARETZ` is **merged into the existing
  `PL_LAND_OF_JUDAH`** and retired; the two moments are distinguished by **referential_form**, not by a
  second PL-code. (Closes the item `PL_LAND_OF_JUDAH` had flagged: *"pending formal PL-code assignment,
  parallel to P01's PL_HA_ARETZ handling."*)
- **Same-referent principle (new, reusable — the reason this is logged):** when the source text refers to
  one place / being / object under different surface forms across the book, it gets **one** Layer-3 code;
  the load-bearing surface distinctions are carried by `referential_form` (and per-scene `role_in_scene`),
  **never** by minting a second code. Splitting one referent across two codes is **registry drift** — the
  same failure class the compiler exists to prevent (training paper §12), now stated for Layer 3.
- **Spec change (exact):** none to `validation-rules.json`. **BCD `PL_LAND_OF_JUDAH`:** add
  `hebrew_aliases: [הָאָרֶץ, אֶרֶץ]`; `aliases` (referential forms) → `[THE_LAND_AFFLICTED_BY_FAMINE` (1:1)`,
  LAND_OF_RETURN_AND_PROVISION` (1:6–7)`]`; `first-appearance P02→P01`; `appears-in [P02,P03]→[P01,P02,P03]`.
  **`PL_HA_ARETZ`** retired (it never had a BCD file — a P01 working code only).
- **Artifact migration:** **P01.** Vault `stas/P01-…-FOR-MODEL.md`: `PL_HA_ARETZ → PL_LAND_OF_JUDAH` in
  scene S1 `places_in_scene` and proposition P2 `afflicted_place` (`role_in_scene: LAND_AFFLICTED_BY_FAMINE`
  carries the 1:1 referential sense — the schema's `scene_places_container` is `additionalProperties:false`,
  so places take no `referential_form` field; only beings do). Vault `pericopes/P01-…md`: scene-1 "the land"
  → `[[PL_LAND_OF_JUDAH]]`. Mirrored into `fixtures/` (kept byte-identical to the vault). No other pericope
  references `PL_HA_ARETZ` as a live code.
- **Validator / tooling impact:** the FOR_MODEL re-validates **0-block** (`PL_LAND_OF_JUDAH` matches the
  `place_id` pattern). `extractor/build_aliases.py` now reads `hebrew_aliases` → `hebrew_cons_aliases`;
  `src/engine/coverage.ts matchScore()` tests the referent against the entity's primary Hebrew **plus** any
  surface alias. `gold-diff` P01: 43→44 matched (the now-coded place extracts deterministically). `tripod
  coverage P01`: "the land" (אָרֶץ, 1:1) now **MATCHED → PL_LAND_OF_JUDAH** (`via lexical`), where it was
  previously on the reviewer tick-list because `PL_HA_ARETZ` had no BCD entry.
- **Version:** **no spec-version bump** (`validation-rules.json` stays `v0.6`). Layer-3 source re-pinned:
  `_spec/registry/ruth.aliases.json` `aliases-0.1.0 → 0.1.1` (sha `9eba86f6…`).
- **Verification:** 73 tests green (incl. a synthetic `hebrew_cons_aliases` match test + the P01 acceptance
  assertion that "the land" → `PL_LAND_OF_JUDAH` and `PL_HA_ARETZ` is gone); `check-drift` ok; coverage P01
  block-clean (`47/47 explicit · 5 implied · 0 unanchored · 14 ticks`).

---

## SC-0008 — Template relics: retire obsolete for-model/audit templates
- **Date:** 2026-05-29 (reinstated as SC-0008)
- **Decided by:** Marcia Suzuki
- **Status:** PROPOSED
- **Type:** docs/templates hygiene (no schema change)
- **ID note:** Tentatively numbered SC-0006 in an earlier planning session but never committed to this
  log under that number (SC-0006 shipped as drift convergence, `9fdef18`); later surfaced as SC-0007 in
  `docs/PROGRESS.md` open-thread (c), colliding with the L1-axis item now at SC-0007. Reinstated here
  under its own permanent ID — see the allocation ledger.
- **Summary:** Two pre-Wave-3 template files survive in the wiki vault `_templates/`:
  `for-model-template.md` still documents `discourse_threads_active` as a FOR_MODEL field (now
  BCD-DELTA-only), and `audit-template-schema.json` is the schema for the obsolete AUDIT artifact.
  Retire/redirect both.
- **Rationale:** Stale templates re-introduce retired fields; a future author copying the
  template would re-add `discourse_threads_active` to a FOR_MODEL.
- **Spec change (exact):** no `validation-rules.json` change; wiki-vault `_templates/` edits only.
- **Artifact migration:** none (templates are not validated artifacts).
- **Validator impact:** none.
- **Version:** no spec-version bump.
- **Verification:** grep clean; `_templates/` no longer references retired fields.

---

## SC-0007 — Converge the L1 / discourse / high-risk axes (add a COMPILATION-LOG promotion slot)
- **Date:** 2026-05-30 (shipped)
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-30)
- **Type:** schema-shape (COMPILATION-LOG) + promotion mechanism
- **Summary:** Closes the SC-0006 known limitation. The COMPILATION-LOG `vocabulary_additions` only
  carried `proposition_kinds`/`scene_kinds`/`presence_values`, so the remaining convergent axes — the
  L1 element axes (arc/context/tone/pace/communicative_function), `discourse_thread_state`, and
  `high_risk_register_kind` — had no promotion slot and kept drifting. Added intake slots so
  `tripod promote` can converge them into `approved-enumerations.json`.
- **Rationale:** Those axes are already classified convergent (SC-0006) and already keyed in the
  registry, but with no intake slot they never accumulated; their drift was permanent noise, not signal.
- **Spec change (exact):**
  - `compilation-log.schema.json` `$defs.vocabulary_additions.properties` gains seven OPTIONAL arrays
    (each `array` of `vocabulary_addition_entry`): `arc_elements`, `context_elements`, `tone_elements`,
    `pace_elements`, `communicative_function_elements`, `discourse_thread_states`,
    `high_risk_register_kinds`. The `required` set is **unchanged**, so v0.3 logs stay valid (additive).
    `version` v0.3 → v0.4, `$id` `…compilation-log-v0-3` → `-v0-4`, `date_locked` → 2026-05-30, `supersedes` appended.
  - `validation-rules.json` `sibling_schemas.compilation_log` pointer `"…v0.3"` → `"…v0.4"`
    (pointer-accuracy only — **no rule change**, so its `version` stays **v0.6**, re-pinned by hash).
  - `src/compiler/promote.ts`: `VA_KEY_TO_AXIS` gains the seven `…s → singular` mappings;
    `UNCOVERED_CONVERGENT_AXES` shrinks to `[]`.
  - `src/cli/tripod.ts`: `promote` prints "all convergent axes are promotable (SC-0007)" when the
    uncovered set is empty.
- **Scope note (honest):** the five **L1-element** axes surface as FOR_MODEL drift, so promoting them
  measurably zeroes drift (proven below). `discourse_thread_state` and `high_risk_register_kind` are
  **not FOR_MODEL fields** (they live in the BCD-DELTA discourse threads and this log's
  `high_risk_register_audit[].kind`); the FOR_MODEL drift detector does not scan them. Their new slots
  make them **promotable / keep the registry complete**, but drift-*detection-from-source* for those two
  is out of scope here (future work — the validator would scan the COMPILATION-LOG / BCD-DELTA, not the FOR_MODEL).
- **Artifact migration:** `fixtures/compilation-log/P02-Ruth-1-6-14-COMPILATION-LOG.md` populated with
  P02's convergent values (arc ×6, tone ×4, pace ×2, communicative_function ×7, all `PROPOSED`) plus
  its five genuinely-new `high_risk_register_kind` values (R1/R2/R3/R11/R15). P01 + P03–P06 unchanged
  (slots optional; they may add the new lists as values are approved).
- **Registry growth — deferred (decision):** SC-0007 ships the **mechanism only**. The vendored
  `approved-enumerations.json` is **not** grown here (stays v0.1); the real P02 promotion is a routine
  `tripod promote --apply` action for a later session (logged in `VOCABULARY_LOG.md`, re-pins the
  registry). The mechanism is proven in tests without mutating the vendored registry.
- **Validator impact:** every convergent axis is now promotable; once a value is promoted into the
  registry it stops drift-warning (the detection side was already wired via `driftBaseline()`).
- **Version:** `compilation-log.schema.json` v0.3 → **v0.4**
  (sha256 `af54950a87b5aeb818a526467e814c2dabbe2ef85fd0386cce213e62789f1400`);
  `validation-rules.json` **v0.6 unchanged**, re-pinned (sha256
  `80be76213d8a4fb6bd34c87641ac58feccf23e36ee160c2f5c73fe6a7e207bf0`). Both re-pinned in `_spec/pins.json` + the table above.
- **Verification:** `npm test` 44/44 green; `tripod check-drift` green against the new pins + closed-list
  sync invariant; `tripod validate fixtures/for-model/` → 6/6 block-clean; `tripod validate
  fixtures/compilation-log/` → 6/6 valid (P02 against v0.4 with the new slots); `tripod promote
  fixtures/compilation-log/P02-…-COMPILATION-LOG.md --status ANY` lists 41 values across all convergent
  axes ("all convergent axes are promotable"); the drift test confirms promoting P02's
  `vocabulary_additions` drives residual convergent FOR_MODEL drift to **zero** (was non-zero on the L1
  axes before).

---

## SC-0006 — Establish drift convergence: convergent/descriptive split + growing approved-enumerations registry
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** axis reclassification + schema-shape (new registry file) + validator mechanism
- **Summary:** Two linked changes so drift becomes a real, converging review signal instead of
  per-pericope noise. (1) **Split** the drift detector's axes into *convergent* (review-signal)
  vs *descriptive* (open, never converge); (2) replace the frozen P01-only baseline with a
  **growing `approved-enumerations.json` registry** that accumulates approved convergent values
  with provenance, so a value approved in one pericope stops drifting in the next.
- **(1) Convergent vs descriptive (rule-based):** an axis whose seed key contains `_examples`
  (`role_in_scene_examples_*`, `function_in_scene_examples_object`, `*_kind_examples`) or equals
  `referential_form` is **descriptive** — per-pericope by nature, surfaced as severity `descriptive`
  (informational), never as drift. Everything else (`proposition_kind`, `scene_kind`,
  `presence_value`, the L1 element axes incl. `context_element`, `discourse_thread_state`,
  `high_risk_register_kind`) is **convergent** → severity `drift`. Example: P02 drops from 86
  lumped "drift" to **37 convergent + 49 descriptive**.
- **(2) Growing registry:** new `_spec/approved-enumerations.json` (v0.1), seeded from the
  convergent axes of `drift_detector.canonical_p01_enumerations` (each value tagged
  `first_seen`/`approved_in`/`source_artifact`/`sc_ref`). The validator reads it as the live drift
  baseline for convergent axes (descriptive axes still use the P01 seed for the informational note).
  `drift_detector.canonical_p01_enumerations` is retained as the documented seed.
- **Promotion-with-provenance:** `tripod promote <COMPILATION-LOG>` reads the log's
  `vocabulary_additions` (the Gate-F-approved values), gates on `status` (default `CONFIRMED`),
  and grows the registry; `tripod propose-vocabulary <FOR_MODEL>` lists convergent-drift values as
  candidate additions. Promotions append to `VOCABULARY_LOG.md` and re-pin the registry — no new SC
  per promotion (this entry establishes the policy).
- **Known limitation (flagged):** the COMPILATION-LOG `vocabulary_additions` only carries
  `proposition_kinds` / `scene_kinds` / `presence_values`, so those converge; the L1-element axes
  (arc/context/tone/pace/communicative_function), `discourse_thread_state`, and
  `high_risk_register_kind` have **no promotion slot** in the COMPILATION-LOG schema yet and will
  keep drifting until that schema gains one (a future SC). `tripod promote` prints these uncovered axes.
- **Version:** new `approved-enumerations.json v0.1`
  (sha256 `3623630868562083bb0c7d35a177db0416bd3a983e43f22808d66bea96a7a282`); pinned in `_spec/pins.json`.
  No change to `validation-rules.json` (the canonical_p01_enumerations seed is unchanged).
- **Verification:** `tripod validate` P01–P06 still block-clean; P02 splits 37 convergent / 49
  descriptive; promoting P02's `vocabulary_additions` zeroes its `proposition_kind`+`scene_kind`
  drift on re-validate, with residual convergent drift only on the uncovered axes. 22 tests green.

---

## SC-0005 — Widen the `place_id` pattern to allow `PL<n>_<DESCRIPTOR>` sub-place codes
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** schema-shape (closed pattern; affects 3 schemas)
- **Summary:** The locked `place_id` pattern `^PL(\d+|_[A-Z][A-Z0-9_]*)$` accepted `PL5` or
  `PL_BOAZ_PORTION` but **not** the hybrid sub-place form `PL5_BOAZ_PORTION` — which the BCD
  itself registers (`bcd/places/PL5_BOAZ_PORTION-…md`) and P05/P06 use. Widen the pattern to
  permit an optional `_<DESCRIPTOR>` after the number. **Surfaced by the Slice 1 validator on
  its first run against the gold fixtures** — the drift-control payoff in action.
- **Spec change (exact):** pattern `^PL(\d+|_[A-Z][A-Z0-9_]*)$` → `^PL(\d+(_[A-Z][A-Z0-9_]*)?|_[A-Z][A-Z0-9_]*)$`
  in all three schemas that carry it:
  - `validation-rules.json` (`$defs.place_id`) → version **v0.5 → v0.6**, `$id` + `for_model_schema.$id` bumped, `sibling_schemas` refs updated.
  - `bcd-delta.schema.json` (`$defs.…place_id`) → version **v0.3 → v0.4**, `$id` bumped.
  - `verification-input.schema.json` (`place_id`) → version **v1.0 → v1.1**.
  - `compilation-log.schema.json` — unchanged (no `place_id` field).
- **Artifact migration:** none. P05/P06 (and the BCD) already use `PL5_BOAZ_PORTION`; the widen
  makes the spec match existing artifacts. No `PL` code anywhere needs renaming.
- **Validator impact:** `place_id` now accepts `PL<n>`, `PL_<DESCRIPTOR>`, and `PL<n>_<DESCRIPTOR>`.
  After the widen, all six gold FOR_MODELs (P01–P06) validate block-clean.
- **Version:** `validation-rules.json v0.5 → v0.6`
  (sha256 `b024e0ea40771ba4a169b936ce57f05686e5333485d937cbed97a80e0d14de3a`); siblings re-pinned
  (see pin table above + `_spec/pins.json`).
- **Verification:** `tripod validate fixtures/for-model/` → 6/6 block-clean (P01 drift 0; P02–P06
  bounded-open drift only); `tripod check-drift` green against the new pins; the closed-list sync
  invariant holds. A reverted (narrow) pattern re-blocks P05/P06 (regression guard in the test suite).

---

## SC-0004 — Deprecate the pre-Wave-3 `_examples/` P01 duplicates; redirect to canonical P01
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (examples/docs consistency; **no spec change** — pin/hash unchanged)
- **Summary:** Resolves the examples refresh flagged under SC-0003. The three
  `_examples/{meaning-map,audit,for-model}-P01-worked-example.md` files were pre-Wave-3 **full
  duplicates** of P01 carrying forbidden/obsolete content. Rather than maintain parallel copies (a
  drift vector), they are **deprecated and redirected** to the canonical P01 reference.
- **Spec change (exact):** none.
- **Artifact edits (wiki):** each `_examples/` file replaced with a short deprecation stub
  (`status: deprecated`, `superseded-by`) pointing to the live canonical artifact:
  - `meaning-map-…` → `[[P01-Ruth-1-1-5]]` (was `CONSULTATIVE`; treated COMMUNITY_MEMORY as a register).
  - `for-model-…` → `[[P01-Ruth-1-1-5-FOR-MODEL]]` (was `TRIPOD_STA_v1_0`; had `artifact_profile`,
    a `discourse_threads_active` block in the FOR_MODEL, `CONSULTATIVE`).
  - `audit-…` → `[[P01-Ruth-1-1-5-COMPILATION-LOG]]` + `[[P01-Ruth-1-1-5-BCD-DELTA]]` (the monolithic
    AUDIT artifact type no longer exists; it used `registry_additions` + the combined audit model).
- **Rationale:** `CLAUDE.md` already designates the live `pericopes/` + `stas/` + `verification/` P01
  artifacts as the structural reference for every artifact. Maintaining duplicate worked examples
  would re-introduce drift. Single source of truth.
- **Supersedes:** the "recommend a separate full examples refresh" note in SC-0003 (resolved here by
  deprecation rather than regeneration).
- **Validator impact:** none.
- **Version:** unchanged — `validation-rules.json v0.5` (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** post-edit sweep — no live (non-archive, non-working) artifact carries a structured
  `"register": "CONSULTATIVE"`, `artifact_profile`, `discourse_threads_active`, or an AUDIT artifact;
  the `_examples/` stubs contain only deprecation prose + canonical redirects.

---

## SC-0003 — Clean residual "elevated register bordering on COMMUNITY_MEMORY" prose from live artifacts
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (artifact-prose consistency; **no spec change** — pin/hash unchanged)
- **Summary:** Resolves the residual prose flagged under SC-0002. Live artifacts described the
  *wayhi bi-yemei* opening as an "elevated register bordering on COMMUNITY_MEMORY" — post-SC-0001 a
  category error, since `COMMUNITY_MEMORY` is a `NARRATIVE_FRAMING` value, not a register.
- **Spec change (exact):** none (no `validation-rules.json` edit; closed lists untouched).
- **Artifact edits (wiki):**
  - `pericopes/P01-Ruth-1-1-5.md` (canonical meaning map — §1 register tagging + the Level-2 figure
    note): the v.1 *wayhi* formula now reads "elevated narrative framing — COMMUNITY_MEMORY (a
    NARRATIVE_FRAMING value, not a register)," and the register is stated to stay `INFORMAL_CASUAL` throughout.
  - `concepts/CB_0029-Judges-Era.md` (Rendering concern, ×2): same reframe.
  - `figures/FIG_0050-Wayhi-Bimei-Chronicle-Formula.md` (intended-meaning, ×3): "elevated narrative
    register" → "elevated narrative framing."
- **Deliberately NOT changed:**
  - Correct uses of "elevated register" — the P01/P03/P04/P05 COMPILATION-LOGs' "…carried by figure
    flags, not by elevated register"; the Pilot-3 draft's own category-error analysis; agent
    style-guidance ("high-register filler").
  - `_examples/{meaning-map,audit,for-model}-P01-worked-example.md` are **pre-Wave-3** (pericope
    register `CONSULTATIVE`; obsolete 2-artifact AUDIT model). The phrase persists in the meaning-map
    example; a one-line patch would leave it incoherent. **Recommend a separate full examples refresh**
    (regenerate from canonical P01). This is the only remaining live occurrence.
- **Validator impact:** none.
- **Version:** unchanged — `validation-rules.json v0.5` (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** vault sweep confirms no "elevated register bordering on COMMUNITY_MEMORY" or
  "elevated narrative register" remains in any live (non-archive, non-working, non-`_examples`) file.

---

## SC-0002 — Propagate the `COMMUNITY_MEMORY` reclassification into prompts, templates, and the worked example
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (downstream consistency; **no closed-list change** — SC-0001 pin/hash still current)
- **Summary:** SC-0001 moved `COMMUNITY_MEMORY` off REGISTER onto the `NARRATIVE_FRAMING` axis and
  added `framing_override`. This entry propagates that into the human-facing locked-spec prompts,
  the FOR_MODEL template, and the P01 worked example so future runs (P07+) don't regenerate invalid
  register overrides.
- **Spec change (exact):** no change to `validation-rules.json` (closed lists untouched). Edits (all in the wiki):
  - `_spec/agent-2-system-prompt.md`: moment-level shift note now says the *wayhi* formula carries
    `COMMUNITY_MEMORY` as a `NARRATIVE_FRAMING` value (downstream `framing_override`), not a register.
  - `_spec/agent-3-system-prompt.md`: moment-level guidance now splits `override_value` (REGISTER) vs
    `framing_override` (NARRATIVE_FRAMING), with the at-least-one rule.
  - `_templates/for-model-template.md`: register value list corrected to the 7 (had listed
    `COMMUNITY_MEMORY`); `register_overrides.moment_level` field list now includes `framing_override`.
  - `_examples/for-model-P01-worked-example.md`: 1:1a `override_value: COMMUNITY_MEMORY` → `framing_override` (targeted).
- **Verified-correct, deliberately NOT changed (genre/token positions):**
  - `agent-1…:237` and `agent-2…:113` — `COMMUNITY_MEMORY` in the **GENRE** list (correct; stays the 31st genre).
  - `agent-2…` register list (L116–126) — already the correct 7.
  - `_templates/sta-vocabulary.md:837` — flat alphabetical token glossary; token still valid (genre + framing).
    `_templates/sta-vocabulary-general.md:72` — genre-position (correct).
- **Out of scope, FLAGGED for separate follow-up:**
  - Descriptive prose "register bordering on COMMUNITY_MEMORY" in `concepts/CB_0029-Judges-Era.md` (L21,44)
    and `pericopes/P01-Ruth-1-1-5.md` (L37,114) — exegetical, non-validated, non-blocking.
  - `_examples/for-model-P01-worked-example.md` and its siblings (`meaning-map-…`, `audit-…`) are
    **pre-Wave-3** (pericope register `CONSULTATIVE`, old 2-artifact AUDIT model). SC-0002 fixed only the
    `COMMUNITY_MEMORY` field; a full examples refresh is recommended as its own task.
  - `_archive/*`, `_working/P01-smoke-test/*` — historical / audit trail; untouched by policy.
- **Validator impact:** none beyond SC-0001 (no list change). Keeps agents + templates from re-introducing the drift.
- **Version:** unchanged — `validation-rules.json v0.5`
  (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`); SC-0002 touches no closed list.
- **Verification:** post-edit vault sweep confirms no remaining `COMMUNITY_MEMORY` in a register/override-value
  position in any active (non-archive, non-working) artifact, prompt, or template; genre-position and glossary
  occurrences intentionally retained.

---

## SC-0001 — REGISTER reduced 8 → 7; `COMMUNITY_MEMORY` reclassified as a framing value
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** closed-list change + axis reclassification (+ artifact migration)
- **Summary:** `COMMUNITY_MEMORY` is not a social register. Remove it from the closed
  `REGISTER` list (8 → 7) and move it onto a separate narrative-framing / voice axis.
- **Rationale:** The 7 social registers are speaker-relationship keys (INTIMATE,
  INFORMAL_CASUAL, CONSULTATIVE, FORMAL_OFFICIAL, CEREMONIAL, ELDER_AUTHORITY,
  RELIGIOUS_WORSHIP). `COMMUNITY_MEMORY` appears in P01 only as a **moment-level override at
  Ruth 1:1a** framing the *wayhi* opening — narrator-voice/framing, not a register. The
  locked file (8) contradicted the prose docs + training paper §10 (7); ruling resolves it
  in favour of 7. This is the tool's first detected spec-vs-prose drift, now reconciled.
- **Spec change (exact, as implemented):** edited **both** representations of each closed
  list — the `closed_lists.*` arrays and the mirror `for_model_schema.$defs.*_value` enums —
  keeping them in sync.
  - `closed_lists.REGISTER` + `$defs/register_value`: **removed** `COMMUNITY_MEMORY` → 7 values:
    `INTIMATE, INFORMAL_CASUAL, CONSULTATIVE, FORMAL_OFFICIAL, CEREMONIAL, ELDER_AUTHORITY, RELIGIOUS_WORSHIP`.
  - **Added** axis **`NARRATIVE_FRAMING`** (name **confirmed**) as `closed_lists.NARRATIVE_FRAMING`
    + `$defs/narrative_framing_value`, value set `["COMMUNITY_MEMORY"]` (only framing value the
    spec currently implies; extensible).
  - `register_overrides` handling = **(b) distinct `framing_override` field** (chosen). In
    `$defs/register_override_entry`: `override_value` is no longer `required`; sibling
    `framing_override` (→ `narrative_framing_value`) added, parallel to `genre_override`;
    an `anyOf` now requires **at least one** of `override_value` / `framing_override`.
  - **GENRE left unchanged (ruling).** Discovery: `COMMUNITY_MEMORY` was *also* the 31st `GENRE`
    (in `closed_lists.GENRE` + `$defs/genre_value`). Decision: keep it as a genre — so `GENRE`
    stays 31 and `COMMUNITY_MEMORY` now legitimately lives on two axes (GENRE + NARRATIVE_FRAMING).
    Only its REGISTER membership was the error.
  - Left `PERICOPE_LEVEL_REGISTER` (narrator-voice = INFORMAL_CASUAL) unchanged.
  - Bumped `version` v0.4 → v0.5, `date_locked` → 2026-05-29, the `$id` / `for_model_schema.$id`
    version strings, and appended a `supersedes` note.
- **Artifact migration (done):**
  - **P01 (Ruth 1:1–5) FOR_MODEL:** 1:1a `moment_level` entry changed from
    `"override_value": "COMMUNITY_MEMORY"` → `"framing_override": "COMMUNITY_MEMORY"`
    (`_note` updated). P01 FOR_MODEL re-validates clean against v0.5.
  - **P02–P06 FOR_MODEL:** scanned — no `COMMUNITY_MEMORY` in any register/override position; nothing to migrate.
  - **Residual prose (NOT migrated, flagged):** P01 meaning map (`pericopes/P01-Ruth-1-1-5.md`
    ~L37 & L114) says "elevated register bordering on COMMUNITY_MEMORY"; P01 COMPILATION-LOG
    (P01-D1) mentions the override descriptively. Exegetical/descriptive prose, not validated
    structured fields — does not trip the validator. Left as-is pending Marcia's copy-edit call.
- **Validator impact:** SHIPPED — the Slice 1 validator must **BLOCK** `COMMUNITY_MEMORY` in any
  `REGISTER` / `override_value` position (closed-list violation) and **accept** it only as a
  `framing_override` (`NARRATIVE_FRAMING`) value. The closed-list **sync invariant**
  (`closed_lists.X` == `$defs/x_value.enum`) is itself a validator check.
- **Version:** `TRIPOD_STA_v2_0`, validation-rules `v0.4` → `v0.5`
  (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** deterministic check (no LLM) passed — REGISTER==7 and ==`register_value`;
  NARRATIVE_FRAMING==`[COMMUNITY_MEMORY]` and ==`narrative_framing_value`; GENRE==31 (unchanged);
  `override_value` optional + `framing_override` + `anyOf` present; **P01 FOR_MODEL validates
  clean against the v0.5 `for_model_schema`** (python `jsonschema`); P01–P06 carry no
  `COMMUNITY_MEMORY` in a register position. Full P01–P06 re-validation through the Slice 1
  `tripod validate` CLI lands with that slice and will reconfirm against this pinned hash.
