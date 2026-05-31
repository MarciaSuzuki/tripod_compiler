# Build brief — Level 3 payload-purity remediation (lint fix + the sweep)

> Authored by the Tripod Architect; principle + scope **ruled by Marcia Suzuki (2026-05-31)**.
> This is the **front of the queue** — ahead of the figure follow-up (Session 7) and the prose standard.
> Two steps, in order: (1) fix the lint, (2) sweep Level 3 in P01–P06. Human-gated; plan-first.

You are a **Tripod Compiler build session**. An audit found that the content discipline was fully
*written* but only *partially implemented* in Level 3: §3C (R1) and conditioning-questions (R5b) were
done, but **cross_ref was never removed from the Q&A (all six maps, including P01)**, and **atomicity /
bare-payload / no-jargon (R2/R3/R4) were applied unevenly — clean in P01–P03, drifted in P04–P06.**

## THE OPERATING TEST (the acceptance bar for everything below)

> **Level 3 is exactly what the model surfaces in the LRL reconstruction — the text being translated.
> Everything else (Levels 1–2, flags, links, cross_refs) is conditioning that steers *how*.**
>
> For **every line in a proposition**, ask: *would the model SAY this in the translation?*
> If **no**, it is conditioning and **must leave Level 3.**

This one test catches all of it: `cross_ref` ("the residue-rhyme opens here" — never spoken), meta-questions
("Construction form?"), grammatical jargon ("First verb?"), interpretive labels ("speech-act of directive
instruction"), and compounds. After the sweep, a Level 3 block contains **only payload Q&A pairs.**

## Orient
- The rule: `_methodology/level3and3Ccontentdiscipline.md` (R1–R5) — the doc this completes.
- The audit: `docs/SC-0013-RELOCATION-AUDIT.md`.
- **Granularity reference:** P01's §4 ("What happened? → famine") — the target shape. *(But re-do P01's
  cross_ref: it still has 2 cross_ref lines that must go.)*
- The lint engine `src/engine/lint.ts` + pinned `_spec/lint-lexicon.json`.

---

## STEP 1 — Fix the lint (the drift-guard was blind here)

The lint scans **answers, not questions**, and ignores `cross_ref`-in-Level-3 — which is why all of this
passed green. Extend it to enforce the operating test on Level 3 blocks. It must flag:
1. **`cross_ref` / inter-proposition-link lines inside a proposition** (`cross_ref:`, `caused_by`,
   `paired_with`, `forward_link`, `back_reference`).
2. **Conditioning questions** (`Register?`, `Self-form?`, `Forward-link?`) — currently only partly caught.
3. **Meta / analytical questions** — questions about *form/structure/style* rather than payload:
   `*form?`, `*-marker?`, `Construction…`, `Verb-chain…`, `Pattern?`, `Stylistic note?`, `Texture?`,
   `Effect?`, structural `Nth part?`, `Closure label?`, `… root?`.
4. **Forbidden grammatical vocabulary in BOTH questions and answers** (verb, noun, clause, participle,
   hifil/qal/piel, infinitive, wayyiqtol… — the R4 list), whole-word.
5. **Interpretive labels in answers** (`speech-act of`, `declaration`, `triplet`, `doubling`,
   `abundance`, `full-knowledge`, `instruction about`, `further command/instruction`, `reports a`,
   `recites`, `answers with`).
6. **Compound answers** — `;` / `, ` / ` and ` joining multiple acts. **Handle the same-line Q&A format**
   (many maps put `**Q:** … **A:** …` on one line — the earlier answer-scan missed these).

Organizing principle in the engine: *a Level 3 block should contain only payload Q&A pairs; flag every
line that isn't one.* Add patterns to `lint-lexicon.json`, **re-pin**, add tests. **Allocate the next free
SC** from the `SPEC_CHANGES.md` ledger (SC-0008 is still PROPOSED → confirm the next free number) and record
it. Then **run `tripod lint --corpus`** to produce the true Level 3 inventory — that drives Step 2.

---

## STEP 2 — Level 3 sweep, P01–P06 (P01 first as the worked example)

Apply the operating test to every proposition. **Plan-first: do the mechanical part, *propose* the
exegetical part, and STOP for Marcia per pericope — do not guess her calls.**

**Mechanical (you do it):**
- **Remove every `cross_ref` / link line from §4.** Relocate the figure-span insight to the **Figure
  Registry entry** (the figure's own `figures/FIG_*.md` records "opens at P#, closes at P#" + the
  keep-image guidance). The **§5B figure flag stays** (conditioning, correctly placed). This is
  de-duplication — the linkage survives where it belongs; **never just delete the insight.**
- Strip grammatical jargon; flag every meta-question and compound for conversion.

**Exegetical (Marcia adjudicates — present proposals, don't apply unreviewed):**
- **Convert each meta-question into a payload question** — elicit the *event the model says*, move the
  analysis to conditioning (e.g. "Construction form? → vayyiqer miqreha…" becomes a payload question for
  the chance-arrival; the providence nuance already rides on `CB_0035`/`FIG_0015`).
- **Atomize dialogue compounds** ("come here, eat from the bread, dip your morsel in the vinegar" → three
  atoms) and **choose the plain-language wordings.**
- Decide **payload-vs-drop** for anything ambiguous.

**Sequence:** clean **P01 first** (its cross_ref + confirm its §4 is the reference shape) → present the
P01 result + the per-proposition proposals → **Marcia confirms** → roll **P02–P06** (heaviest residue:
P04/P05 meta-questions, P06 interpretive labels). Surface each pericope's adjudication list before applying.

---

## Boundaries
- **Only Level 3 (§4)** + the figure-registry span relocations. **Do not touch** §3C, Levels 1–2, or the
  §5 Flags (those are conditioning, correctly placed).
- The **FOR_MODEL's** `cross_ref`/links are structured conditioning *fields* (outside the payload slots) —
  **leave them**; the schema payload/conditioning split is a **separate** step (handled before Slice 4),
  not this brief.
- Do **not** fold in the figure follow-up, the prose standard, or the schema change.
- **Relocate, never delete.** Surface exegetical calls; don't guess them.

## Gates / acceptance
- **The extended lint passes on Level 3 across P01–P06** — 0 cross_ref/links in §4, 0 meta-questions, 0
  jargon, 0 interpretive labels, 0 compounds, 0 conditioning-questions. *This is the acceptance bar (the
  operating test, mechanized).*
- `validate` 6/6 · `coverage --corpus` 6/6 (Level 3 wording doesn't change entities) ·
- `gold-diff` — re-baseline; expect little/no movement (its compared layer is flags/IDs/structure, not §4
  prose) but confirm, and keep map↔FOR_MODEL consistent · `npm test` green · `check-drift` clean (re-pin
  `lint-lexicon`).

## Governance & delivery
Record **two SCs** (per the ledger): the lint extension (Step 1) and the Level 3 remediation (Step 2 —
link it to SC-0013, whose Level-3 scope this completes). New branch; paired PRs. Hand Marcia: the per-
proposition adjudication lists, the figure-registry span relocations, and the gate results — for her
adjudication, blessing, and the Architect review.
