# SC-0070 — slot-name rename + slot-name lint — APPLY RECORD

**Applied 2026-06-20** (compiler half + vault FM pair, on branch). The ruled change from
[`SC-0070-SLOT-NAME-RENAME-SHEET.md`](SC-0070-SLOT-NAME-RENAME-SHEET.md). Tier A — reaches `main` only on
the Evaluator's application-verify (the bars below) + Marcia's merge word.

## What was applied

Marcia's rulings (2026-06-20): all 55 field-names renamed (the flagged ones as listed + the clean families
as proposed); lint **blocks all** banned field-names; `agent_named → named_doer` stands (the
significant-absence refinement set aside for a later SC).

**1. The rename — 55 keys / 99 key-occurrences across 18 FOR_MODELs** (P14 untouched). Mechanism:
key-anchored token-rename on each FM's JSON block (`"old":` → `"new":`, formatting preserved — a re-dump
would reflow the 6 hand-tweaked FMs). Per-key count-assert; every old name → 0 remaining; post-rename
banned-token sweep over every ess key → **0 leaks**; ess key-count stable (rename, not add/drop).

| family | examples |
|---|---|
| agent (5) | `invoked_divine_agent→invoked_deity` · `agent_named→named_doer` · `agent_of_return_empty→emptied_by` |
| recipient (11) | `blessing_recipient→blessed_party` · `word_recipient→word_came_to` · `report_recipient→reported_to` · `recipient→given_to` |
| beneficiary (1) | `beneficiary→born_for` |
| subject (8) | `question_subject→question_about` · `creed_subject→creed_about` · `subject_child→child` |
| object (5) | `fear_object→feared` · `pity_object`/`pitied_object→pitied` · `shown_object→shown` · `divine_object→deity` |
| source (6) | `drink_source→drink_from` · `word_source→word_from` · `seed_source→seed_from` |
| locus (1) | `proclamation_locus→proclamation_place` |
| owner (4) | `salvation_owner→salvation_belongs_to` · `deceased_owner→deceased_of` |
| argument (1) | `argument_role→comparison_rank` |
| antecedent (1) | `hesed_antecedent→hesed_from` |
| referent (12) | drop the suffix — `bound_to_referent→bound_to` · `clan_referent→clan` · `redeemer_referent→redeemer` |

**Kept:** `speaker` + `addressee`/`addressees` (16 keys / 106 occ, untouched). Two name-collapses verified
collision-free (different objects): `pity_object`+`pitied_object`→`pitied`; `report_subject_referent`+`reported_subject`→`reported_about`.

**2. The lint (make-impossible).** New `slot_name_role_vocab` rule in `src/engine/lint.ts`: walks every
`event_specific_slots` key (incl. nested `*_components`), token-splits on `_`, BLOCKs (tier 1) any key
whose tokens include a banned term, allow-lists `speaker`/`addressee`/`addressees`, scoped to ess only.
Banned tokens pinned in `lint-lexicon.json` (`forbidden_slot_name_tokens`, **0.2.0→0.3.0**, re-pinned).

**3. Drafter-prompt fix.** The §4-ban-vs-line-138-endorse self-contradiction reconciled to the ruled names
(`blessed_party` not `blessing_recipients`; `invoked_deity` not `invoked_divine_agent`; `question_about`),
with the slot-name discipline made explicit. `fm-drafter-0.1.5 → 0.1.6`, re-pinned.

## Bite-proof (the Evaluator's "lint bites both ways" bar) — `tests/slot-name-lint.test.ts`, 7 tests

- BLOCKS a planted `agent_named` (tier 1); BLOCKS a banned key nested in a `*_components` array.
- Flags every banned-token family (9 in one object).
- Stays SILENT on: the keep-list (`speaker`/`addressee`/`addressees`); the renamed names
  (`named_doer`/`invoked_deity`/`blessed_party`/`bound_to`/`comparison_rank`); `referential_form` (the
  `referent` **prefix** must not match — token, not substring); the L2 `objects_in_scene`/`object_id` namespace.

## Gates (all green at apply)

`tests` **380 | 1 skipped** (373 + 7 bite-tests) · `validate` 19/19 · 0 block · 0 drift · `check-drift` 0
@ lint-lexicon **0.3.0** + fm-drafter **0.1.6** · `lint --corpus` 38 / **0 `slot_name_role_vocab`** / 10
accepted · `coverage` 14/14 block-clean · `gold-diff` 100% / 0 divergent (renames in the judgment layer) ·
`id-check` 19 clean · `tsc` clean (only the pre-existing `@anthropic-ai/sdk` Slice-4 dep). **0 banned
slot-names repo-wide.**

## Scope split

- **Compiler:** 18 FMs + `src/engine/lint.ts` + `_spec/lint-lexicon.json` + `_spec/pins.json` +
  `_spec/drafter/fm-drafter-prompt.md` + `tests/slot-name-lint.test.ts` + SPEC_CHANGES + this record.
- **Vault:** the 18 FMs only (byte-identical) — `lint-lexicon`/`pins`/`lint.ts`/the prompt are
  compiler-vendored (the vault has no `_spec/lint-lexicon.json`; `check-drift:vault` shows it `vendored:ok` only).

## Deferred

The `agent_named: NONE` → `significant_absence` refactor (Marcia's deeper option) is **set aside for a
later SC** — `named_doer` carries the `NONE`/B-code as-is for now.
