# SC-0078 — apply record (Level-3 modality: `status` + SPEECH_ACT growth)

**Tier A · compiler + vault pair · branch `sc-0078-l3-modality` off compiler main `9d0f459`.**
Design: Marcia ruled the L3 modality model (option 1) 2026-06-27; the 3 ⟐ sub-choices + the A2
make-impossible call ruled after the Architect build-spec (`tripod-eval-artifacts/SC-0078-MODALITY-BUILD-SPEC.md`)
+ Evaluator draft-verify (which independently reproduced the speech_act enforcement gap two ways and the
25-⊆-26 zero-regression guarantee).

## What changed

### Schema — `_spec/validation-rules.json` (v0.17 → v0.18; `for_model_schema.$id` v0-10 → v0-11)
- `closed_lists.SPEECH_ACT` **26 → 33**: +`PROPOSES_COURSE_OF_ACTION`, `PETITIONS_FOR_GRANT`,
  `ASKS_DELIBERATIVE_QUESTION`, `PRESCRIBES_AS_LAW`, `ADVISES_COURSE_OF_ACTION`, `RESOLVES_TO_ACT`,
  `ALLEGES_AGAINST`.
- NEW optional `status` field (`$ref #/$defs/upper_token`) on **both** proposition defs (`proposition`
  biblical + `oral_proposition`); not in `required` (the `ASSERTED` default = omit).
- `drift_detector.canonical_p01_enumerations.status` seed = the 6 values (the convergent-axis fallback;
  the live baseline is `approved-enumerations.json axes.status`).
- `supersedes` v0.18 note appended.

### Enum — `_spec/approved-enumerations.json` (v0.20 → v0.21)
- NEW `axes.status` = the 6 seed values, `sc_ref SC-0078`, ruling-seeded (`source_artifact
  SC-0078-MODALITY-SC-SPEC`). `growth_log` v0.21 line appended.
- SPEECH_ACT additions are **not** here (this registry tracks convergent bounded-open axes only;
  closed lists live in validation-rules.json).

### Engine
- `src/engine/vocabulary.ts`: proposition-level `status` drift (beside `proposition_kind`); component-level
  `status` drift + the **A2 `speech_act` closed-list BLOCK** in the `collectCodes` walk (the only place that
  reaches component `speech_act`, since it rides in the permissive `event_specific_slots` ajv never inspects).
- `src/engine/lint.ts`: the SC-0073 `value_shape_prose` guard now also feeds the proposition-level `status`
  through its shape+exemption walk (component-level `status` was already covered via the ess walk).
- `src/engine/structural.ts`: corrected the stale comment that wrongly listed `SPEECH_ACT` among
  schema-enforced enums (it is engine-enforced, not ajv-enforced).

### Pins / tests / docs
- `_spec/pins.json`: validation-rules.json → v0.18 sha `6d36fc11…`; approved-enumerations.json → v0.21 sha
  `b3f6e7cc…`.
- `tests/modality.test.ts` (NEW, 11 tests — status drift both levels · A2 speech_act BLOCK + the 7 new
  values accepted + clean-P01 silent · SPEECH_ACT==33 · born-clean prose-status BLOCK both levels + seed
  silent). `tests/drafter.test.ts` `SPEECH_ACT (26)`→`(33)`. `tests/oral-cardume.test.ts` specVersion
  `v0.17`→`v0.18` (both were hardcoded version/count assertions, not behavior).
- `SPEC_CHANGES.md` SC-0078 row · `VOCABULARY_LOG.md` line · this record · `docs/SC-0078-MODALITY-AUTHORING-GUIDE.md`.

## Decisions (ruled)
- **① links only** (no PURPOSED/CONDITIONAL in status). **② both levels**, precedence component→prop→default.
- **③** the 7 speech_acts as above; `PRESCRIBES_AS_LAW` orthogonal to `status: NORM`; `DELIBERATES_INWARDLY`
  dropped → inner speech = base illocution + `addressee` = the speaker's own being-code.
- **A → A2 make-impossible** (component speech_act BLOCK), guardrail (0 regression on the 19 FMs) met.
- **C** bump `for_model_schema.$id`. **D** component `condition_of`/`purpose_of` stay free annotations.

## Acceptance (all green on the branch)
- **No Ruth/Jonah regression:** validate 19/19 FOR_MODELs · 0 block · 0 drift; fixtures byte-unchanged;
  gold-diff 100% agreement.
- `status` drift fires (member→0, non-member→1 drift not block) at proposition AND component level.
- A2: invented component speech_act BLOCKs; the 7 new values accepted; clean P01 silent.
- Born-clean: prose `status` BLOCKs both levels; the 6 seeds silent (1 token < ≥4-token line).
- check-drift exit 0 @ v0.18/v0.21; closed-list sync invariant holds. lint 19/0 · id-check 0
  ref-integrity/0 name-binding/0 dangling · coverage 14/14 · tsc clean · vitest **406 | 1 skipped**.

## Vault half
`validation-rules.json` (v0.18) + `approved-enumerations.json` (v0.21) copied byte-identical into the vault
`_spec/`; vault PR `--require-merged` after the compiler PR merges. No vault FM/artifact changes (Esther not
yet compiled; Ruth/Jonah retrofit deferred).

## Conscious deferrals (own SCs)
- Component `speech_act` **presence** ("mandatory" per CLAUDE.md) is still unenforced — A2 enforces
  membership, not presence (needs a precise "what is a component" definition).
- Ruth/Jonah `status` retrofit.
- Following SC = **SC-0079** (Esther Phase-4b compile, born modality-aware).
