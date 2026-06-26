# SC-0073 — the value-shape prose guard — APPLY RECORD

**Applied 2026-06-26** (compiler-only, on branch `sc-0073-phase4-guard`). The ruled design from
[`SC-0073-VALUE-SHAPE-GUARD-SHEET.md`](SC-0073-VALUE-SHAPE-GUARD-SHEET.md). Tier A — reaches `main` only on
the Evaluator's application-verify (the bars below) + Marcia's merge word.

## What Marcia ruled (2026-06-26)

All four §6 design calls as recommended (Architect + Evaluator concurred):
1. **BLOCK** (tier 1) — not warn.
2. **≥ 4 underscore-tokens, no verb-shape refinement** — the line.
3. **Accept the 9 gloss-y 3-token borderlines** — they're labels, below the line.
4. **Allow-list in `_spec/lint-lexicon.json`**, with the settled lists (E1/E2/E3/E7) derived live from the
   pinned spec files so they can't drift from canon.

## What was applied

**The guard makes the now-clean seed un-reintroducible** — the make-impossible capstone of the
sentence-token triage (the four content phases SC-0067 → SC-0072 removed the prose; this stops it coming
back). The VALUE analogue of SC-0070 (which guarded slot NAMES).

**1. The rule (`src/engine/lint.ts`).** New `value_shape_prose` lint rule inside `lintForModel`, a sibling
to the SC-0070 `slot_name_role_vocab` block. Walks every `event_specific_slots` VALUE (incl. nested
`*_components`), tracking each value's immediate slot KEY. A value is in scope iff it is a multi-word
`UPPER_SNAKE` token (`^[A-Z0-9]+(?:_[A-Z0-9]+)+$`). **Membership-exempt FIRST, then a ≥4-token shape test
on the remainder; tier-1 BLOCK.** A new UPPER_SNAKE-clause heuristic — NOT the existing `isL3Prose`
(space + lowercase), which the triage values never trigger (no space, no lowercase).

Exemptions:

| | exemption | basis |
|---|---|---|
| E1 | approved-enumerations value, any axis | derived live from the pinned `approved-enumerations.json` |
| E2 | validation-rules `closed_lists` value (genre/register/speech_act/…) | derived live from `validation-rules.json` |
| E3 | code namespace `B/PL/O/TM/TH/CB/FIG/I/D` | regex |
| E4 | referential-form family — slot KEY ends `referential_form`/`referential_form_at_verse`, or ∈ the 5 R1 address slots | lexicon `value_shape_referential_address_slots` + suffix test |
| E5 | kept structural-form slot KEY (17) | lexicon `value_shape_kept_form_slots` |
| E6 | the 4 ruled KEEPs **by value** (3 sit in non-kept-form slots) | lexicon `value_shape_explicit_keeps` |
| E7 | the 2 Ruth 2:13 `preserve_form=true` clauses | derived live from `quarantined-vocabulary.json` membership |

E1/E2/E3/E7 are built once by a memoized `valueShapeExemptSets()` reading the pinned spec files, so the
membership allow-list can never drift from canon — only the four guard-specific lists live in the lexicon.

**2. The lexicon (`_spec/lint-lexicon.json`, `0.3.0 → 0.4.0`, re-pinned sha `4a7ecddd…`).** Added
`value_shape_prose_min_tokens: 4`, `value_shape_kept_form_slots` (17), `value_shape_referential_address_slots`
(5), `value_shape_explicit_keeps` (4), and a `_value_shape_doc`. `pins.json` sources entry bumped to
`0.4.0` + the new sha; the SC-0073 row in `SPEC_CHANGES.md` carries the pin-table record. (`lint-lexicon.json`
is compiler-vendored, NOT vaulted — `check-drift --vault` shows it `vendored:ok` only.)

**3. The bite-tests (`tests/value-shape-lint.test.ts`, 11 tests, permanent + gated).** Both ways:
- **BLOCK** — a planted clause in a plain slot; a clause nested in a `*_components` array; a non-exempt
  value exactly at the 4-token boundary (and silent at 3).
- **SILENT** — the 4 explicit KEEPs in their real slots; the 2 preserve_form clauses; a long closed-list
  `speech_act`; a referential form + an R1 address slot; a kept structural form; code values + a governed
  action verb + a compact label.
- **corpus** — linting all 19 FOR_MODEL fixtures yields 0 `value_shape_prose` findings; and the anti-drift
  invariant (Evaluator's hardening) — every `preserve_form=true` value resolved from the FM fidelity block
  is exempt (never flagged), so the guard can't drift from a future-added protected clause.

## No vault half

Compiler-only. The corpus is already clean (SC-0072), so there are **no FM edits**; `lint-lexicon.json`,
`lint.ts`, the test, `pins.json`, and the two governance docs are all compiler-repo files. Nothing to write
back to the wiki vault.

## Verification bars (the Evaluator's application-verify)

| gate | result |
|---|---|
| `value_shape_prose` on the 19-FM corpus | **0 findings** |
| `tripod lint --corpus` | 38 artifacts · 0 findings · 10 accepted |
| `tripod validate fixtures/for-model` | 19/19 VALID · 0 block · 0 drift |
| `tripod check-drift` | 0 — lint-lexicon `0.4.0` `vendored:ok` |
| `tripod coverage --corpus` | 14/14 |
| `tripod gold-diff` | unchanged vs floor |
| `tripod id-check` | 19 clean |
| `vitest run` | **391 passed + 1 skipped** (380 + 11 new bite-tests) |
| `tsc --noEmit` | clean |

**After merge the sentence-token triage is WHOLLY CLOSED** — the cleanup removed the prose; the guard makes
it un-reintroducible.
