# SC-0072 — Phase-4 CONTENT cleanup (apply record)

**The residual prose-shaped slot-value cleanup that precedes the Phase-4 value-shape guard.**
Ruled by Marcia 2026-06-26 (the 22 clear ≥5-token clauses + the 28 four-token borderline =
50 distinct values / 51 occurrences). Source of truth: the Evaluator apply-spec
`PHASE4-CLEANUP-RULING-AND-APPLY-SPEC.md`. Floor: compiler `5314907` · vault `818ddcf` · enum
v0.19 · board 380|1.

This is the CONTENT cleanup, **not** the guard. The value-shape lint is the follow-on SC after
this merges; the 4 KEEPS below feed its allow-list.

## What changed — 47 edits across 15 FOR_MODELs (P04, P08, P09, J03 untouched)

**22 DROP** — the slot's meaning is preserved in a sibling slot / `significant_absence` / the
Meaning Map (verified per row). Descriptive slots → **no vocabulary change.**
P11·P4 `elder_designation` · P12·P11 `blessing_content_kind` · P11·P2 `identified_as` · P01·P4
`naming_order` · P03·P5 `narrator_report_components[0].narrator_interior_access_scope` · P06·P6
`name_known_status` · P06·P10 `name_known_status` · P07·P11 `hesed_from` · P02·P9
`dissuasion_target` + `appeal_components[1].question_about` + `[2].question_about` · P02·P11
`dissuasion_target` + `question_components[0].question_about` + `[1].question_about` · P05·P9
`report_components[2].quoted_prior_action` + `[0].epithet_voice_layer` · P03·P4
`oath_conditional_structural_force` · P12·P9 `blessing_content_kind` · P13·P4
`blessing_content_kind` · P07·P8 `blessing_content_kind` · P06·P8
`recital_components[1].moab_naming_status` · P13·P2 `divine_act_marker`.

**18 SHORTEN** — strip the prose tail to the compact token (★ = coined; finalized below).
Descriptive slots → **no vocabulary change.**
P05·P4 `gleaning_position_relation`→`BEHIND_HARVESTERS` · P10·P1 `position`→`MARGELOT` · P10·P2
`timing`→`BEFORE_RECOGNITION`★ · J05·P12 `appointment_timing`→`DAWN_NEXT_DAY`★ · J01·P5
`descent_marker`→`GOING_DOWN` · J02·P2 `vessel_peril`→`NEAR_BREAKING`★ · J02·P5
`destination`→`SHIP_HOLD`★ · J02·P17 `row_effort`→`ROWED_HARD`★ · J02·P21
`worship_acts[0].worship_act`→`FEARED` · J04·P18 `perceived_content`→`TURNED_FROM_EVIL` · J04·P19
`relented_of`→`DISASTER` · J05·P8 `watch_intent`→`SEE_CITY_FATE`★ · P05·P1
`introduction_components[0].kinship_anchor_relation`→`WIDOW` · P11·P1 `ascent`→`WENT_UP` · P13·P8
`placement`→`ON_BOSOM`★ · P14·P10 `begotten_role`→`LINE_TERMINUS` · J04·P19
`non_execution_marker`→`NOT_EXECUTED`★ · P11·P13 `custom_purpose`→`CONFIRMATION`★.

**7 DECOMPOSE** — prose action clauses → governed event-beat verbs (each multi-beat component
carries the mandatory `speech_act: STATES_AS_TRUE`, per the corpus idiom; single-beat objects are
minimal `{action: …}` since the participants are already sibling slots):
- P11·P14 `custom_act` "DREW_OFF_SANDAL_AND_GAVE_TO_FELLOW" → `custom_act_components`
  `[{action: DREW_OFF_SANDAL}, {action: GAVE, given_token: O26, given_to: FELLOW}]` (the prior
  `custom_token: O26` moves into the GAVE beat). **Also collapses the duplicate
  `attestation_form: SANDAL_DRAWN_OFF` on P11·P15** (already encoded by that prop's
  `DREW_OFF_SANDAL` action component → dropped, one encoding).
- P07·P6 `brought_out_first` "BROUGHT_OUT_THEN_GAVE" → `gift_action_components`
  `[{action: BROUGHT_OUT}, {action: GAVE}]` (prop kind already GAVE).
- P11·P3 `compliance` "TURNED_ASIDE_AND_SAT" → `compliance_components`
  `[{action: TURNED_ASIDE}, {action: SAT}]`.
- J02·P3 `subsequent_response` "CRIED_TO_OWN_GODS" → `{action: CRIED}` (crier / addressee already
  sibling slots).
- J05·P8 `post_build_position` "SAT_UNDER_IN_SHADE" → `{action: SAT}` (shelter O13 + purpose SHADE
  already siblings).
- J02·P14 `basis_of_knowledge` "HE_HAD_TOLD_THEM" → `{action: TOLD, teller: B1}` (knowers=B4 = the
  told party; content told = `fled_from` CB_0052 — both already siblings; teller B1=Jonah added so
  no content is lost).
- J02·P17 `reason` "SEA_KEPT_GROWING_STORMIER_AGAINST_THEM" → **`SEA_GROWING_STORMIER`** — a compact
  descriptive token, **not** an action verb. `reason` is a causal/descriptive slot, not an
  action-component; the apply-spec explicitly licensed "a governed storm verb **OR** a compact
  token" here. Architect's call: token, so no storm verb is minted. (Evaluator verifies.)

**4 KEEP → the Phase-4 guard's allow-list (NOT edited here):** J04·P5 `compliance_marker`
`ACCORDING_TO_WORD_OF_YHWH` · P07·P11 `living_and_dead_form` `ET_HACHAYIM_VEET_HAMETIM` · P10·P8
`question_about` `IDENTITY_RECOGNITION_AND_STANDING` · P11·P14 `attestation_name`
`THE_ATTESTATION_IN_ISRAEL`. Verified present and untouched.

## Governance — the action-verb PROMOTE (surfaced for Marcia's merge-word ruling)

The 7 decomposes land on the governed `action` axis (the validator drift-checks any `action`-keyed
string at any depth — `src/engine/vocabulary.ts:128`). Checked vs the 39 approved verbs:
`DREW_OFF_SANDAL` was already approved. The **6 NEW verbs** — `GAVE`, `BROUGHT_OUT`,
`TURNED_ASIDE`, `SAT`, `CRIED`, `TOLD` — are PROMOTED into `_spec/approved-enumerations.json`
(`action` 39→45, sc_ref `SC-0072`), bumping the enum **v0.19→v0.20** + re-pinned in
`_spec/pins.json` (sha `d3069ba6…`) + a `VOCABULARY_LOG.md` line. They are clean event-beat verbs
of the kind the axis holds. The J02 `reason` token (above) means the promote is **6 verbs, not 7**.
**The drift test pins the action seed by provenance** (`sc_ref === "SC-0025"` length === 31), not
total count → **no test re-baseline** (the 6 new entries carry sc_ref SC-0072). Quarantine
unchanged (still the 2 `preserve_form=true` held values).

`approved-enumerations.json` is vaulted → this SC has a **vault half** for the enum (byte-identical)
plus the 15 FM copies; `pins.json` / `VOCABULARY_LOG.md` are compiler-only.

## Safety anchors — verified untouched
- The **2 `preserve_form=true` Ruth 2:13 clauses** (P06 / P11 response_components SECOND/THIRD) —
  present (×2 in P06), not in any diff.
- The **`significant_absence` anchors** (P03·S3, P06·S1, P06·S2, P07·S3) — present, not in any diff.
- Siblings, `speech_act`, participants, `cb_flags`, `figure_flags` of every edited prop — untouched.

## Method
Structural editing (json.loads → dict op → json.dumps(indent=2) byte-identical except the change)
for the 10 round-trip FMs; **surgical line-removal** (per-value count-assert, comma-aware) for the 5
hand-formatted FMs (P01/P02/P03/P05/P06). Per-value count-assert + **grep every surface**: all 47
old values now **0 across `fixtures/for-model/`**. Vault FM copies byte-identical to compiler.

## Gates (on the branch)
Board **380 | 1 skipped** · validate **19/19 FM 0-drift** (0 block · 10 quarantined unchanged) ·
check-drift **0** + check-drift:vault **0** (`approved-enumerations` v0.20 vault:ok) · lint **38 / 0
findings / 10 accepted** · coverage **14/14** · gold-diff **unchanged vs floor** (the touched
`event_specific_slots` cells are not gold-tracked; P07–P14 100%, the standing P01–P06 MM-coverage
divergences identical to floor) · id-check **19 clean** · vault **15/15 FMs + enum byte-identical**.
(Pre-existing: `npm run build` fails on the `@anthropic-ai/sdk` Slice-4 dep — reproduces on clean
HEAD; the board runs via vitest.)

## Riders for Marcia / the Evaluator (NOT applied — out of the FM-scoped ruling)
1. **Stale COMPILATION-LOG prose references** to 3 dropped values: P03 CL (`high_risk_register_audit`
   description mentions `oath_conditional_structural_force BINDS_BEYOND_DEATH_VIA_INEVITABLE_CONDITION`)
   and P06 CL (2 notes mention `name_known_status: NAME_NOT_YET_KNOWN_TO_RUTH`; 1 mentions
   `moab_naming_status: WITHHELD_IN_BOAZ_SPEECH`). These are audit-prose references to slots this SC
   dropped from the FMs. R2 (SC-0069) precedent left CL prose untouched; the ruling spec is FM-scoped.
   Recommend a light CL reconciliation (past-tense / drop the dropped-slot mention) as a quick
   follow-up or an approved sub-step — Marcia's call.
2. **Possible un-ruled siblings of the same shape** (below the census' clause threshold, so not in
   the 50): P01 `naming_order: PARALLEL_TWO_BRIDES` (a second naming_order on a different prop) ·
   P11·P4 `compliance: THEY_SAT`. Left as-is (the ruling named only the listed props). Flag for a
   consistency call when the guard is built.

## Instruments
Source of truth: `~/Dropbox/Mac/Downloads/tripod-eval-artifacts/PHASE4-CLEANUP-RULING-AND-APPLY-SPEC.md`.
This record + the SPEC_CHANGES SC-0072 row. After merge → the Phase-4 value-shape guard is the next
(and final) SC of the sentence-token triage.
