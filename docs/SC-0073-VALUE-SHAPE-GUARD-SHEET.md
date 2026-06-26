# SC-0073 — the Phase-4 value-shape guard (`value_shape_prose` lint)

> **Status: CALIBRATION SHEET — NOTHING APPLIED.** This proposes the standing lint that makes
> sentence-shaped slot **values** impossible to re-introduce, and gives the census evidence that the
> clean corpus produces **zero** findings. Workflow (the same as SC-0070/SC-0071): **sheet →
> Evaluator draft-verify → Marcia rules the design → Architect applies → Evaluator application-verify
> → Marcia's merge word**. No lint rule, no lexicon edit, no FM touched until Marcia rules §6.

> **SC-ID:** SC-0073 (reconfirmed 2026-06-26 vs the canonical `SPEC_CHANGES.md`, highest live = SC-0072;
> `gh pr list` = 0 open PRs in both repos). The oral-pipeline Stage 2 also wants a number — **binding
> allocation is at apply** (whoever lands first); this sheet reserves SC-0073 for the guard.

> **Floor (verified on a fresh detached worktree at `origin/main`):** compiler main `9f7f64c` (SC-0072,
> #90) · enum **v0.20** (action axis 45) · lint-lexicon `0.3.0` · 0 open PRs · git tag `v0.4.0`. All
> census numbers below were regenerated on `9f7f64c`.

---

## 1. What this is, in plain language

Our fine-tuning seed is built from **slot values** — short ALL-CAPS tokens like `BARLEY_HARVEST`,
`OFFERED_SACRIFICE`, `SIX_MEASURES`. A value is a *label for one thing*, deliberately compact, so the
model learns a clean vocabulary item and not a sentence. The danger the whole sentence-token triage has
been closing is **prose-in-disguise**: a value that is really a whole clause wearing UPPER_SNAKE
clothing, e.g.

> `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE`

That is a sentence, not a label. SC-0067 → SC-0072 hand-cleaned every such value out of the corpus.
**This SC builds the guard that keeps them out** — a deterministic lint that flags a sentence-shaped
value the moment anyone (a future drafter, a hand-edit) writes one. After it merges, the sentence-token
triage is **wholly closed**: the cleanup removed the prose; the guard makes the prose un-reintroducible.

It is the **value** analogue of SC-0070, which did the same for slot **names** (`agent_named` → blocked).
We mirror that lint exactly: a new rule in `src/engine/lint.ts`, its parameters in
`_spec/lint-lexicon.json`, and permanent both-ways bite-tests.

**The hard part — and why it's now tractable.** You can't just say "long values are prose," because
plenty of *legitimate, settled* vocabulary is long: the speech-act `DIRECTS_HEARER_TO_DO` (4 words), the
referring form `HA_ISH_THE_MAN` (4 words), the kept structural form
`SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL` (9 words). Length alone can't separate signal from
prose. **But** every one of those long-but-legitimate values lives on a **governed list or a known slot
family** — so we exempt them by *membership first*, and only *then* apply a length test to whatever is
left over. The SC-0072 cleanup was what made this work: it removed every prose value that wasn't on a
list, so after the cleanup the "leftover, and long" set is **empty**. That is the calibration result in
§4.

---

## 2. The detector (the crux)

Two stages, in order. **Membership-exempt FIRST, then shape-test the remainder.** Scoped to
`event_specific_slots` **values** only (incl. nested `*_components` arrays) — never L2
`objects_in_scene` / `object_id`, never slot KEY names (that is SC-0070's job).

A value is examined only if it is a **multi-word UPPER_SNAKE token** — matches
`^[A-Z0-9]+(?:_[A-Z0-9]+)+$` (no spaces, no lowercase). Single-token values (`STATED`, `GLEANED`) are
never in scope. (This is why the existing `isL3Prose` heuristic at `lint.ts:205` — "a space AND a
lowercase letter" — **cannot** be reused: the triage values have neither. We add a new UPPER_SNAKE-clause
heuristic, exactly as `lint.ts:200-204` already anticipates: *"Sentence-shaped UPPER_SNAKE slot VALUES are
a SEPARATE finding (the post-Jonah triage) … See tripod-sentence-token-triage."*)

### Stage 1 — EXEMPT (never flag). A value is exempt iff ANY of:

| # | Exemption | Test | Covers (e.g.) |
|---|---|---|---|
| E1 | **Approved enumeration** (any axis) | value ∈ `approved-enumerations.json` (all axes) | `OPENS_BOOK`, governed action verbs |
| E2 | **Closed list** | value ∈ any `validation-rules.json` `closed_lists.*` (genre/register/**speech_act**/…) | `DIRECTS_HEARER_TO_DO`, `REFUSES_REQUEST_WITH_COUNTER_DECLARATION` |
| E3 | **Code namespace** | value matches `^(B\d|PL\d|PL_|O\d|O_|TM_|TH_|CB_|FIG_|I\d|D\d)` | `TM_PERIOD_OF_JUDGES`, `PL_LAND_OF_JUDAH`, `TH_THREE_DAYS_AND_THREE_NIGHTS` |
| E4 | **Referential-form family** (slot-key based) | key ends `referential_form` or `referential_form_at_verse`, **or** key ∈ {`address_form`, `divine_address_form`, `blessed_party_form`, `role_form`, `line_form`} | `HA_ISH_THE_MAN`, `RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW` |
| E5 | **Kept structural form** (slot-key based) | key ∈ the 17-slot kept-forms list (below) | `THREE_DAYS_AND_THREE_NIGHTS` (`duration_form`), `SIX_STEP_LADDER_…` (`vow_structural_form`) |
| E6 | **The 4 explicit KEEPs** (value based) | value ∈ {`ACCORDING_TO_WORD_OF_YHWH`, `ET_HACHAYIM_VEET_HAMETIM`, `IDENTITY_RECOGNITION_AND_STANDING`, `THE_ATTESTATION_IN_ISRAEL`} | the 4 Marcia ruled KEEP in SC-0072 |
| E7 | **Preserve-form clauses** | value ∈ `quarantined-vocabulary.json` (any axis) | the 2 Ruth 2:13 load-bearing clauses |

**Kept-forms list (E5), 17 slots:** `vow_structural_form`, `matched_action_form`,
`binding_indefinite_place_form`, `binding_demonstrative_place_form`, `listing_order_form`,
`report_variation_form`, `duration_form`, `acquired_from_form`, `attestation_form`, `compliance_form`,
`question_form`, `nominal_equation_half`, `binding_domain`, `doubled_place_form`, `living_and_dead_form`,
`model_house_form`, `naming_order`.

**Why E6 is value-based and not slot-based (important).** Three of the four KEEPs live in slots that are
**not** kept-form slots: `ACCORDING_TO_WORD_OF_YHWH` is in `compliance_marker`,
`IDENTITY_RECOGNITION_AND_STANDING` in `question_about`, `THE_ATTESTATION_IN_ISRAEL` in
`attestation_name`. A slot-based rule would miss them; they must be exempted **by value**.

**Why E7 keys off `quarantined-vocabulary.json` (and not the fidelity block).** The two clauses
Marcia ruled must be preserved verbatim — `STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH` and
`STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT` (Ruth 2:13) — are each 9-token sentences that a length test
**would** flag. They are recorded two ways in canon: (a) as `preserve_form: true` entries in the FM's
`fidelity.elements` block, and (b) as the two entries in `quarantined-vocabulary.json`'s `action` axis.
I verified these agree exactly — resolving the `preserve_form: true` refs in P06 yields precisely those
two values. We key the exemption off **(b), the governed membership list**, because it is a clean O(1)
value test that does not require the lint to parse the (variably-shaped) fidelity block, and it is already
pinned + governed. (Belt-and-suspenders: if a future preserve_form clause is added, governance adds it to
`quarantined-vocabulary.json` in the same SC, exactly as SC-0069 did.)

### Stage 2 — SHAPE-TEST the non-exempt remainder.

Flag a non-exempt multi-word UPPER_SNAKE value that is **sentence-shaped**. **Recommended line: ≥ 4
underscore-tokens** (i.e. 4+ words). Rationale in §4: post-SC-0072, the non-exempt set has **zero** values
of ≥4 tokens, so the test is silent on the clean corpus while still biting any re-introduced clause (which
are invariably 5+ words). The ~92 deliberately-kept compact values are all 2–3 tokens and sit **below** the
line. An **optional verb-shape refinement** (flag a leading past-tense `*ED`/known-verb token at ≥3 tokens)
is offered for Marcia in §6 but is **not** needed to reach 0-on-clean.

**Finding shape (mirrors `LintFinding`):** rule `value_shape_prose`, **tier 1**, location
`<prop_id>.event_specific_slots/<path>`, match = the value, context = `slot '<key>' value is sentence-
shaped (<n> tokens)`. Like every lint rule it is **downgradable** via `lint-exceptions.json` (a signed-off
finding becomes `accepted`, not drift) — so a future borderline can be accepted on the record rather than
forcing a value rename.

---

## 3. Where the rule and its parameters live

Mirror SC-0070 exactly:

- **`src/engine/lint.ts`** — add `"value_shape_prose"` to the `LintRule` union; add the new block inside
  `lintForModel` (a sibling to the `slot_name_role_vocab` block), walking `event_specific_slots` values.
- **`_spec/lint-lexicon.json`** — add the governed parameters (and bump `schema_version` → `0.4.0`,
  re-pin `pins.json` + the pin table):
  ```jsonc
  "value_shape_prose_min_tokens": 4,
  "value_shape_kept_form_slots": [ /* the 17 E5 slots */ ],
  "value_shape_referential_address_slots": [ "address_form", "divine_address_form",
      "blessed_party_form", "role_form", "line_form" ],
  "value_shape_explicit_keeps": [ "ACCORDING_TO_WORD_OF_YHWH", "ET_HACHAYIM_VEET_HAMETIM",
      "IDENTITY_RECOGNITION_AND_STANDING", "THE_ATTESTATION_IN_ISRAEL" ]
  ```
  E1/E2/E3/E7 derive from existing pinned spec files (`approved-enumerations.json`,
  `validation-rules.json`, `quarantined-vocabulary.json`) — **not** re-listed in the lexicon, so the
  allow-list cannot drift away from canon. Only the four lists that are *guard-specific* (the threshold,
  the kept-form slots, the R1 address slots, the 4 keeps) live in the lexicon.
- **`tests/value-shape-lint.test.ts`** — permanent both-ways bite-tests (§5), templated on
  `tests/slot-name-lint.test.ts`.

`lint-lexicon.json` is **compiler-only** (not vaulted — `check-drift --vault` shows it `vendored:ok`
only). See §7: this SC is almost certainly **compiler-only, no vault half**.

---

## 4. Calibration evidence (regenerated on `9f7f64c`)

Full output: `tripod-eval-artifacts/PHASE4-VALUE-SHAPE-CENSUS-9f7f64c.txt` (script `census3.py`, read-only).
19 FOR_MODEL fixtures. **Guard scope = `event_specific_slots` values.**

**Every multi-word UPPER_SNAKE value in scope, classified by the exemption model:**

| Class | occ |
|---|---|
| E2 closed-list (speech_act &c.) | 268 |
| E4 referential-form family | 60 |
| E3 code namespace | 57 |
| E1 approved enumeration | 25 |
| E5 kept structural form | 24 |
| E6 explicit keep | 4 |
| E7 preserve-form clause | 2 |
| **TRUE_RESIDUAL (non-exempt)** | **103 occ / 92 unique** |

**The residual, bucketed by token count:**

- **2 tokens — 54 unique** (`BARLEY_HARVEST`, `SIX_MEASURES`, `OFFERED_SACRIFICE`, `SAT_DOWN`, …)
- **3 tokens — 46 unique** (`ABOUT_AN_EPHAH`, `BELLY_OF_FISH`, `EAST_OF_CITY`, …)
- **≥4 tokens — 0.**

→ **A ≥4-token test on the non-exempt remainder yields 0 findings on the clean corpus.** ✔

**Cross-check from the other direction** — I took *every* ≥4-token value in scope (72 unique) and asked
which exemption covers each. **All 72 are covered; UNCOVERED = [] (zero would be flagged).** Coverage by
class (unique ≥4-token values): closed-list 55 · referential 29 · code 13 · kept-form 11 · explicit-keep 4
· preserve-clause 2. **This proves each exemption class is load-bearing** — removing any one would create a
false positive (e.g. drop E7 and the two Ruth 2:13 clauses get flagged; drop E5 and
`SIX_STEP_LADDER_…` gets flagged).

### The borderline band — Marcia's eye (§6 decision)

The 3-token residual (46 values) is the band just **under** the ≥4 line. Most are clean compact labels
(`SECOND_NAMED_BRIDE`, `THREE_DAYS_WALK`, `HERD_AND_FLOCK`). A handful read a little **clause-y**:

| value | slot | pericope |
|---|---|---|
| `HEART_WAS_GOOD` | `resulting_disposition` | P09 |
| `FELL_DEEP_ASLEEP` | `subsequent_states` | J02 |
| `CAME_TO_HER` | `consummation_marker` | P13 |
| `SHE_HELD_IT` | `compliance` | P10 |
| `TO_BE_WIFE` | `purpose_role` | P12 |
| `BEGAN_TO_ENTER` | `entry_marker` | J04 |
| `CALLED_A_FAST` | `fast_response` | J04 |
| `TURNED_FROM_EVIL` | `perceived_content` | J04 |
| `REMAINED_IN_BELLY` | `subsequent_state` | J02 |

These are **accepted** by the recommended ≥4 threshold (they're 3 tokens). They are surfaced here only so
Marcia can rule one of: **(a) accept all 3-token values as compact labels** (recommended — they're below
the line and a tiny follow-up SC can pick off any she dislikes later); **(b)** lower the threshold to ≥3 +
verb-shape so just the clause-y ones above flag (would also flag clean 3-token labels unless the
verb-shape filter is tight — riskier); or **(c)** hand-rule a tiny cleanup of just this short-list in a
vault half (then this SC gains FM edits — see §7). My recommendation: **(a)**, keep the guard at ≥4 and
clean seed; the band is small and reviewable, and the guard's job is to stop *clauses*, which all 3-token
values are not.

---

## 5. Bite-test plan (both ways — permanent, gated)

`tests/value-shape-lint.test.ts`, templated on the SC-0070 test. Filter findings to
`rule === "value_shape_prose"`.

**BLOCKS (fires, tier 1):**
1. A planted re-introduced clause:
   `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE` in a plain ess slot → 1 finding.
2. A clause nested inside a `*_components` array → fires (proves the walk descends into components).
3. A 4-token planted prose value in a non-exempt slot → fires (proves the threshold boundary).

**SILENT (no finding):**
4. The 4 explicit KEEPs in their real slots (`compliance_marker`/`question_about`/`attestation_name`/
   `living_and_dead_form`) → 0.
5. The 2 preserve_form clauses (`STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH`,
   `STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT`) → 0.
6. A long speech_act value (`REFUSES_REQUEST_WITH_COUNTER_DECLARATION`) → 0 (E2).
7. A referential form (`RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW` in a `*_referential_form` slot) → 0 (E4).
8. A kept structural form (`SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL` in `vow_structural_form`)
   → 0 (E5).
9. A code value (`TM_PERIOD_OF_JUDGES`, `PL_LAND_OF_JUDAH`) → 0 (E3).
10. A governed action verb (`DREW_OFF_SANDAL`) and a 3-token compact label (`BARLEY_HARVEST`) → 0.
11. **Whole-corpus guard:** linting all 19 fixtures yields **0** `value_shape_prose` findings.

---

## 6. Open design calls — for Marcia to rule

1. **BLOCK vs WARN.** Recommend **BLOCK** (tier 1). The seed must stay clean; the membership allow-list
   keeps the corpus green, so BLOCK costs nothing today and is a hard wall tomorrow. (WARN would let a
   clause merge with a yellow flag — weaker for a seed-freeze gate.)
2. **The shape line.** Recommend **≥ 4 underscore-tokens, no verb-shape refinement.** Calibrated: clean
   corpus = 0, bite-tests fire. (§4 shows ≥4 is the lowest threshold that is silent on the clean corpus;
   ≥3 would flag ~46 kept compact labels.) Verb-shape is available as a future tightening if Marcia later
   wants the clause-y 3-token band caught.
3. **The 3-token borderline band** (§4 table). Recommend **accept** (option (a)). Alternative: a tiny
   follow-up cleanup SC, or fold a hand-ruled short-list into this SC's apply (adds a vault half — §7).
4. **Where the allow-list lives.** Recommend **`_spec/lint-lexicon.json`** (pinned + governed, mirrors
   SC-0070), with E1/E2/E3/E7 *derived* from the existing pinned spec files so the membership exemptions
   can never drift from canon — only the four guard-specific lists (threshold, kept-form slots, R1 address
   slots, 4 keeps) are stored in the lexicon.

---

## 7. Scope: compiler-only (expected), with one exception

`lint-lexicon.json` + `lint.ts` + the test are **compiler-only** (the lexicon is not vaulted;
`check-drift --vault` shows it `vendored:ok` only). The corpus is **already clean** (§4 — 0 findings), so
there are **no FM edits** and therefore **no vault half**. This SC is expected to be a single compiler PR.

**The one exception:** if Marcia rules §6-3 option (c) — a hand-cleanup of any 3-token borderlines — those
edits touch FMs and would add a vault half (compiler+vault pair, like SC-0072). **Confirm with the
Evaluator before assuming compiler-only**, per the risk-tiered-verification rule.

---

## 8. Apply checklist (after Marcia rules — NOT done yet)

1. Allocate SC-0073 in `SPEC_CHANGES.md` (reconfirm next-free + 0 open PRs at apply).
2. Add the `value_shape_prose` rule to `lint.ts`; add params to `lint-lexicon.json`; bump
   `schema_version` → `0.4.0`; re-pin (`pins.json` + pin table + sha).
3. Add `tests/value-shape-lint.test.ts` (the §5 bite-tests, both ways).
4. **Gates (must hold, unchanged):** `validate` 19/19 0-drift · `check-drift` 0 (+`:vault` 0 @ v0.20) ·
   coverage 14/14 · gold-diff unchanged · id-check 19 · lint 38/0 · **whole-corpus `value_shape_prose` =
   0** · board green · `vitest` green incl. the new bite-tests.
5. Append the VOCABULARY_LOG / SC entry; write `docs/SC-0073-APPLY-RECORD.md`.
6. Evaluator application-verify → Marcia's merge word → `tools/merge_pr.py` → merged-main re-verify.
   **Then the sentence-token triage is WHOLLY CLOSED.**
