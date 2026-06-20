# SC-0067 — Phase 1 (R1) — apply record

> The mechanical + verification record for the R1 bare-form strip. Dispositions live in
> `SC-0067-REFERENTIAL-FORM-BARE-FORM-SHEET.md` (RULED); this file is the proof-of-application the
> Evaluator's application-verify references. Ruled by Marcia 2026-06-20; applied as one compiler+vault pair.

## What was applied

**Scope:** the `referential_form` family (3 sub-families, 136 occ) + the (a) surface-address family
(`address_form` + kin, 24 occ) — Marcia's Option-A scope extension. **23 artifacts touched** (17 FOR_MODELs +
6 COMPILATION-LOGs); P11/P13 FMs and P07–P14/J CLs unchanged (all keeps).

**Mechanical edits (every one count-asserted + re-grep proven):**
- **67 quote-anchored value renames** — 60 FM + 7 CL `referential_forms[]` array echoes (per-file counts matched).
- **1 FM slot drop** — `referential_form_at_verse: SELF_REFERENCE_REFUSING_OWN_NAME` (P04; redundant with
  `action:REFUSED` + `refused_name:"Naomi"`).
- **1 CL array-entry drop** — the matching `SELF_REFERENCE_REFUSING_OWN_NAME` entry (P04 CL).
- **1 CL dedup** — the two `SHADDAI_…_FIRST/SECOND_OCCURRENCE` entries → one `SHADDAI` entry (P04 CL, source merged).
- **CL prose reconciliations** — every CL citation of a changed FM value bared to match (P02-D / P03-D5 / P03 §93 /
  P03 source_in_meaning_map / P04-D8 / P04 source / P05 ×3 / P06 line 88), with the analytic explanation kept as the note-home.
- **2 divergent CL variants** reconciled to the FM bare form — `HUSBAND_OF_NAOMI_FRAMING`→`HUSBAND_OF_NAOMI` (P01),
  `UNNAMED_DIVINE_AGENT_IN_BINDING_PAIRING`→`UNNAMED_DEITY` (P03; also sheds the "AGENT" jargon SC-0014 removed).

**Held (untouched, 3 occ):** `ELOHIM_TO_YHWH_SHIFT` (a transition, not a form), `NAMED_THEN_ADDRESSED` and
`ALTERNATES_MOTHER_IN_LAW_AND_NAOMI` (patterns) → deferred to Phase 3.

**Out of scope (kept by design):** L3 registry TH_ codes that embed an analytic phrase
(`TH_KINSHIP_FORM_YEBIMTEKH`, `TH_RUTH_THE_MOABITESS_NARRATOR_EPITHET`, `TH_HUSBAND_OF_NAOMI_FRAMING`,
`TH_ADONI_MY_LORD_DEFERENTIAL_FORM`); object_kind rewords (a different, promoted axis); (b) speech-content
`*_form` slots → Phase 2 (R2); (c) structural `*_form` slots → Phase 3.

## Blessed devices verified intact
- **P01-D2 wife-pairing withholding (P06):** `after_whose_death: "B?"` + the `significant_absence` note +
  the meaning-map lint-exception — all untouched; only the FM slot value bared to `YOUR_HUSBAND`.
- **`UNNAMED_*` / `STRIPPED_TO_HA_ISHAH` / `*_PRONOMINAL`** kept (blessed surface devices, CLAUDE.md §3.3).
- **SALMAH/SALMON dual spelling preserved** — only the positional `_SPELLING_AT_4_2x` tail stripped; both spellings stay distinct.

## Verification (fixtures)
- **0 in-scope leaks** — re-grep of every old value across both trees returns only the TH_ codes + the 3 held values.
- `npm test`: **373 passed | 1 skipped** (unchanged from floor — descriptive-axis change, no schema/drift impact).
- `validate`: **19/19 FOR_MODELs + 19/19 COMPILATION-LOGs valid · 0 block · 0 convergent drift · 0 propose.**
- `check-drift` 0 · `lint --corpus` 0 findings / 10 accepted / 38 clean · `coverage --corpus` 14/14 block-clean ·
  `gold-diff` 100% agreement / 0 divergent · `id-check --corpus` 19 clean.

## Verification (vault)
- **23 files copied fixtures → `stas/` (Ruth flat) + `stas/jonah/` (Jonah), all cmp byte-identical, 0 failures.**
- Vault change scope: 23 files, all under `stas/`. `check-drift:vault` 0 (vault `_spec/` untouched).

## Coverage ledgers — SC-0067 has zero effect (Evaluator HOLD resolved; Marcia Option A → SC-0068)

The Evaluator's application-verify found the committed `fixtures/coverage/*-COVERAGE-LEDGER.md` still cite stripped
values. Investigated:
- **SC-0067's contribution to a correct regen = 0 diff lines, all 6** (floor-regen ≡ branch-regen, byte-identical;
  sanity-checked the floor really carried the old forms). The ledger's `referential_forms` column **is** FM-sourced
  (`coverage.ts:139,171`), but for committed P01–P06 in current data it is all `—` (the overlays are now `CB_` codes,
  post-SC-0037, that carry no referential_forms); where it *is* populated (e.g. P09 `ESHET_CHAYIL_WOMAN_OF_WORTH`,
  `NEARER_REDEEMER_UNNAMED`) it holds **kept** values SC-0067 didn't change. The surface keywords matching relies on
  survive the strip (meta-suffixes removed, nouns kept), so reconciliation is unchanged.
- The committed ledgers are **stale since 2026-05-30 (SC-0010)** — 15/44/24/24/30/34 diff lines vs current data
  (`TH_→CB_`, a `B9→B8` entity reassignment, unanchored counts), **none of it SC-0067**. **No test pins them**; the
  coverage gate regenerates fresh, so the snapshots rotted unnoticed.

**Ruling (Marcia 2026-06-20):** merge SC-0067 as-is; refresh the stale ledgers under a **separate SC-0068** (a pure,
auditable regeneration, where the `B8/B9` + `CB_` changes get reviewed on their own merits) **and durably gate or
retire them** so they cannot rot again.

## Follow-on (flagged, not in this pair)
- The vault `_templates/sta-vocabulary*.md` examples still show pre-R1 referential forms (e.g.
  `NAAR_NITSAV_AL_HAQOTSRIM_NAMED_BY_ROLE`) — a methodology-seeding hygiene pass, out of the "fixtures + vault stas" scope.
- Phase 2 (R2): the speech-content strip, incl. the (b) `*_form` slots. Phase 3: the structural (c) `*_form` slots +
  the 3 held pattern/transition values. Phase 4: the automatable value-shape guard (§8 of the sheet).
