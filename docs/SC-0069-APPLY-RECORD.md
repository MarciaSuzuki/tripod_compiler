# SC-0069 — R2 speech-content strip — APPLY RECORD

**Applied 2026-06-20** (compiler half, on branch `claude/elegant-ptolemy-6ae890`). The ruled drop from
[`SC-0069-R2-SPEECH-CONTENT-STRIP-SHEET.md`](SC-0069-R2-SPEECH-CONTENT-STRIP-SHEET.md). Tier A — reaches
`main` only on the Evaluator's application-verify + Marcia's merge word. **Vault `cp` pending** (second half).

## What was applied

Marcia's rulings (calibration widget, 2026-06-20): **§A speech-content + §B forms + §F-leave APPROVED · §C
commands DROP · §D formulas DROP (sign-off) · §E vow rungs KEEP → Phase 3 · `agent_named` explicit KEEP**.

**Dropped: 202 value-drops across 17 FOR_MODELs** (187 scalar + 15 array-elements). P04 / P14 untouched.

| FM | drops | FM | drops | FM | drops |
|---|---|---|---|---|---|
| J01 | 4 | J05 | 22 | P08 | 16 |
| J02 | 32 | P01 | 1 | P09 | 21 |
| J03 | 17 | P02 | 4 | P10 | 11 |
| J04 | 21 | P03 | 1 | P11 | 24 |
| | | P05 | 3 | P12 | 6 |
| | | P06 | 5 | P13 | 7 |
| | | P07 | 7 | | |

**5 array keys fully dropped** (whole key+array removed): `divine_descriptors` (J02), `creed_attributes`
(J05), `hoped_divine_turning` (J04), `jonah_non_involvement` (J05), `not_cut_off_from` (P12).

**Per-value splits** (apply both rulings per value): `question_form` — dropped the 6 question-words
(`WHO_ARE_YOU`, `WHY_WOULD_YOU_GO_WITH_ME`, `IS_IT_GOOD_THAT_IT_BURNS_*`, `SHOULD_I_NOT_PITY_NINEVEH`),
**kept** the 3 metas (`RHETORICAL_PROMISE_QUESTION`, `RHETORICAL_RECOGNITION_QUESTION`,
`DOUBLED_WHERE_AND_WHERE_WORKED`); `question_subject` — dropped the 6 question-words
(`WHAT_IS_YOUR_WORK`, `WHERE_DO_YOU_COME_FROM`, `WHAT_IS_YOUR_LAND`, `FROM_WHICH_PEOPLE_ARE_YOU`,
`WHOSE_FAULT_THIS_EVIL`, `WHERE_SHE_GLEANED_TODAY`), **kept** the 7 analytic topics (`JONAHS_ANGER`,
`IDENTITY_RECOGNITION_AND_STANDING`, …).

## The mechanism (the SC-0067 idiom)

Surgical line-removal (NOT a JSON re-dump — 6 FMs have hand-tweaked formatting that a re-dump would reflow).
Per FM: walk the parsed JSON to build the expected drop-set → remove the exact `"key": "value"` lines (and
the 5 array blocks) → precise trailing-comma fix (only the structural end-of-line comma before a close
bracket) → `json.loads` validate. **Content-only diff: 6 insertions / 218 deletions across 17 FMs.**

## Per-file assertions (all passed before write)

- **`speech_act` count unchanged** per FM (the structure R2 keeps).
- **`agent_named` count unchanged** (Evaluator's explicit-keep condition).
- **The P03 vow forms unchanged** (`matched_action_form`, `binding_indefinite_place_form`,
  `binding_demonstrative_place_form`, `vow_structural_form`, `binding_domain` — §E kept).
- **No new empty objects** introduced (compared empty-count before/after; J03's pre-existing
  `inter_proposition_links: {}` is original, not from R2).
- **Per-(key,value) count-assert**: every dropped value verified present-before / absent-after; every kept
  split-value (`RHETORICAL_*`, `JONAHS_ANGER`, …) verified surviving.

## Safety (the `preserve_form` gate — Evaluator draft-verify)

The realized NOT_TO_BE_NORMALIZED is the FM **`preserve_form`** flag (SC-0030), seeded on P03/P04/P06. The
only **2 `preserve_form=true`** elements (P06 P11 `response_components` SECOND/THIRD, Ruth 2:13) ride on the
**`action`** axis, which R2 excludes → **no mandated-wording was dropped**. Un-seeded FMs (incl. all §D
formula FMs) fall back to map-presence (held 100%) + the CL keep-image prose, which stays.

## Gates (all green at apply)

`validate` 19/19 valid · 0 block · 0 drift · `lint --corpus` 38 / 0 findings / 10 accepted · `id-check
--corpus` 19 clean · `check-drift` 0 (vendored:ok, sync invariant holds) · `coverage --corpus` 14/14
block-clean (519/519 explicit) · `gold-diff` 100% / 0 divergent (no re-baseline — the dropped speech was
judgment-layer) · **tests 373 passed | 1 skipped** (board unchanged — descriptive-axis change). The
pre-existing `@anthropic-ai/sdk` build error (Slice-4 drafter dep, not installed in this worktree)
reproduces on clean HEAD — unrelated to R2.

## Remaining

**Vault half:** `cp` the 17 FMs to the vault `stas/`, byte-identical, on a vault working branch, push -u.
**Phase 3** (the (c) structural `*_form` + the 3 held R1 values + the action-axis prose decompositions —
incl. the P06 `preserve_form=true` action clauses) · **Phase 4** (the value-shape guard; must read
`preserve_form`).
