# SC-0071 — Phase 3 (triage residue) — APPLY RECORD

**Applied 2026-06-20** (compiler + vault pair, on branch). The ruled change from
[`SC-0071-PHASE-3-RESIDUE-SHEET.md`](SC-0071-PHASE-3-RESIDUE-SHEET.md). Tier A — reaches `main` only on the
Evaluator's application-verify + Marcia's merge word. **The last content-cleanup of the sentence-token triage**;
only Phase 4 (the automatable guard) remains.

## What was applied — 11 changes across 8 FOR_MODELs + 1 COMPILATION-LOG

**§C2 — 5 action-axis decompositions to already-governed verbs** (no new verbs minted; all in the 31-verb
SC-0025 seed). Each prose action value stripped to its lead verb; the prose tail was speech (map-homed,
`preserve_form=false`):
| from | → | pericope |
|---|---|---|
| `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` | `ASCRIBED` (matches its sibling lament component) | P04 P5 |
| `STATED_SELF_AS_FOREIGNER` | `STATED` | P06 P6 |
| `STATED_THAT_HE_COMFORTED_HER` | `STATED` | P06 P11 |
| `WISHED_YHWH_TO_REPAY_HER_WORK` | `BLESSED` (a blessing component) | P06 P9 |
| `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE` | `BLESSED` | P06 P9 |

**§A2 — 3 redundant prose-form drops** (each duplicated already-structured slots in its own proposition):
| dropped | redundant with | pericope |
|---|---|---|
| `movement_form: STAIRCASE_DOWN_THRONE_TO_ASHES` | the 4 `descent_components` (AROSE-from-throne … SAT_ON_ASHES-seat) | J04 P12 |
| `tie_form: RUTH_WAS_WITH_HIS_YOUNG_WOMEN` | `named_tie: B16` | P08 P2 |
| `resulting_relation_form: BECAME_HIS_WIFE` | `taker: B13` / `wife_taken: B9` | P13 P1 |

**§B — the 3 held R1 values resolved to the form:**
- `NAMED_THEN_ADDRESSED` → `YHWH` (J03 — no alternation; a clean progression).
- `ALTERNATES_MOTHER_IN_LAW_AND_NAOMI` → `NAOMI` (P07 — `role_in_scene: MOTHER_IN_LAW` already carries the kinship).
- `ELOHIM_TO_YHWH_SHIFT` → `YHWH` (J05) **+ the §B note**: a `NAMING_SHIFT` entry added to the J05 CL
  `high_risk_register_audit` recording the deliberate Elohim→YHWH alternation (Elohim-dominant in the
  appointings, YHWH at the frame), so the feature is explicit, not re-inferred. Completes R1's deferred
  naming-shift placeholder. The per-moment names stay in the appointer/questioner `referential_form` slots.

## KEPT (Marcia + the Evaluator)
- The structural forms (`vow_structural_form`, `listing_order_form`, `report_variation_form`, `duration_form`,
  + the R2 §E vow forms) — load-bearing structure / CL keep-image.
- The already-governed short compounds (`TOOK_AS_WIFE`, `SAT_ON_ASHES`, `DREW_OFF_SANDAL`, `AROSE_TO_RETURN`).
- **The two `preserve_form=true` Ruth 2:13 clauses verbatim** (`STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH`,
  `STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT`) — Marcia ruled keep-as-is; they stay in the quarantine.
- The `question_form` analytic metas + `compliance_form` (low-stakes; left as coarse markers).

## Quarantine + tests
- `quarantined-vocabulary.json` **0.2.0 → 0.3.0**: the 5 decomposed values removed (action-held 7 → 2; the 2
  kept = the preserve_form pair). Re-pinned in `pins.json`. The vault copy is synced (it is vaulted —
  `check-drift:vault` covers it).
- `tests/drift.test.ts` re-baselined: quarantine watch 15 → 10, action-held 7 → 2, and the held-verb example
  switched to a kept value. **No new tests; net board unchanged.**

## Gates (all green)
`tests` **380 | 1 skipped** · `validate` 38/38 valid · 0 block · 0 drift · `check-drift` 0 @
quarantined-vocabulary **0.3.0** · `lint --corpus` 38 / 0 findings / 10 accepted · `coverage` 14/14 ·
`gold-diff` unchanged vs the committed baseline (15 at 100% + the 4 standing MM↔FM coverage divergences —
the action changes are in the judgment layer, not the compared deterministic layer) · `id-check` 19 clean ·
`tsc` clean (only the pre-existing `@anthropic-ai/sdk` Slice-4 dep). Per-value count-assert on every change.

## Scope split
- **Compiler:** 8 FMs + the J05 CL + `quarantined-vocabulary.json` + `pins.json` + `tests/drift.test.ts` +
  SPEC_CHANGES + this record + the sheet status.
- **Vault:** the 8 FMs + the J05 CL + `_spec/quarantined-vocabulary.json` (byte-identical sync — the file is
  vaulted; `pins.json` and the test are compiler-only).
