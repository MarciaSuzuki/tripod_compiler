# The Jonah Generality Report — the held-out test, written up

> The final deliverable named in `docs/JONAH-PLAN.md` (§2, Phase 3). Drafted by the Architect
> (SC-0049) for Marcia's blessing; the evaluator verifies every number against the merged mains.
> Status at drafting: compiler `main` `691dea2` · vault `main` `d440d75` · all five Jonah pericopes
> mapped, ruled, and applied (SC-0032 → SC-0048, 2026-06-08 → 2026-06-10).

## 1. The question, and how it was tested

The Tripod interlingua — the controlled vocabulary and schema every Meaning Map and FOR_MODEL is
built from — was designed, built, and enforced entirely on **Ruth** (six pericopes, P01–P06). The
question this test was built to answer: **does that vocabulary describe Scripture, or does it
merely describe Ruth?** If the closed lists only fit the book they were tuned on, they are not an
interlingua; they are a Ruth-shaped vocabulary, and the whole training architecture inherits that
bias.

The method was a held-out test, the standard instrument for exactly this risk: take a book the
vocabulary was never shaped around — **Jonah** — and map all of it under the same enforced
discipline, reading the result **by layer**, because each layer has a different pass condition
(JONAH-PLAN §0): the closed lists must **hold**, the bounded-open lists may **grow**, the
registry **fills** (a new book's cast is its own), and Level 3 must stay **born clean**. A value
the closed lists genuinely lack — or a structural assumption that blocks honest tagging — is not
a failure of the test but its **prize finding**: caught now, governed, and fixed before Bible scale.

Jonah was chosen deliberately: same broad genre family as Ruth (so the comparison is fair) but
with stressors Ruth never poses — poetry embedded in narrative (the psalm), divergent
English/Hebrew versification, a divine-name pattern with theological load, and a book that ends
on an unanswered question.

## 2. The verdict, by layer

| Layer | Pass condition | Result on Jonah |
|---|---|---|
| **L1 closed** (genre group · genre · register · speech-act) | HOLD — no forced or invented value | **HELD. Zero values added, zero changed — the closed lists are byte-for-byte what they were when Ruth finished.** Every value Jonah needed already existed: `NARRATIVE`/`HISTORICAL_NARRATIVE`/`INFORMAL_CASUAL` for four pericopes; `POETIC_SUNG`/`PRAYER`/`RELIGIOUS_WORSHIP` for the psalm; the register shifts (ELDER_AUTHORITY, CONSULTATIVE, FORMAL_OFFICIAL, RELIGIOUS_WORSHIP) all members of the closed seven. |
| **Schema structure** | fits, or a located governed gap | **One structural finding — the prize.** The schema hard-coded the pericope-level register as the constant `INFORMAL_CASUAL`: a narrator assumption, invisible across eight narrative pericopes, exposed by the first pericope with **no narrator voice** (the psalm, ruled "purely the poem"). Fixed by Marcia's ruling as a governed change (validation-rules v0.15 → v0.16, SC-0046): genre-aware — NARRATIVE keeps the narrator constant, non-narrative opens to the closed seven. Four-case permanent gate (`tests/register-genre-aware.test.ts`). |
| **L2 bounded-open** (scene kinds, proposition kinds, the L1 element arrays) | grows by design | **Deliberately not yet exercised** — see Honest limits (§5). Jonah's FOR_MODELs are deterministic skeletons whose judgment fields await the Slice-4 drafter; the L2 vocabulary's growth pattern on Jonah is the next experiment, not this one. |
| **L3 discipline** (atomic · bare · plain · payload-only) | born clean, by discipline not lint-crutch | **Born clean five for five.** Every Jonah map lints 0 under the operating-test bar that took Ruth a multi-cycle remediation (SC-0012→0017) to reach. Two findings total across the book, both resolved honestly: one ruled TIME_PAIR (signed off, the Ruth precedent), one a rendering artifact (an English number-word "and" the Hebrew lacks — reworded, not excepted). |
| **L3 registry** (cast + canon banks) | fills; reuse over duplication | **Filled exactly as designed.** Cast: 34 Jonah entities, vault-sourced, alias table reproducible byte-identically. Canon banks: +8 concepts, +11 figures, all Marcia-confirmed genuinely new (the near-duplicate guard quiet throughout, including its documented calibration case). **Reuse worked at every scale it was built for** — within-book (CB_0052 across J01/J02; FIG_0198's descent traced to its bottom; CB_0057 minted at J04, completed in Jonah's own mouth at J05) and **across books: CB_0011 Hesed, minted for Ruth, recurs in the psalm and the creed — its pericope list now runs P02 → J05, one concept anchored from Naomi's blessing to the prophet's accusation.** |

## 3. The numbers (every one re-runnable on the merged mains)

- **Text:** 5 pericopes tiling all **48/48 verses** of the Masoretic book — verified from the
  extracted packets (union exact, zero overlaps), not the plan.
- **Faithfulness floor:** coverage reconciliation against the frozen BHSA referent sets:
  **279/279 explicit referents accounted for · 0 unanchored entities across the entire book**
  (J01 20 · J02 79 · J03 43 · J04 67 · J05 70) — the maps say nothing the Hebrew does not.
- **The board:** 166 tests at the arc's open → **189 + 1 visible-skip** at its close; every
  addition a regression anchor (the J01/J02 graduation anchors with proven bite, the
  genre-aware register gate, the flag-pointer gate, the merge-discipline gate).
- **Pins:** `jonah.aliases.json` 0.1.0 (empty scaffold) → **0.1.6** (34 entities); the canon
  banks 0.2.0 → **0.6.0** (58 concepts / 126 figures); `validation-rules.json` v0.15 → **v0.16**
  (the one governed schema change). Every pinned artifact rebuilds **byte-identically** from the
  vault notes — the wiki Marcia reads is the source the machine consumes.
- **Versification:** English and Hebrew diverge on every verse of Jonah 2 (Eng 1:17–2:10 = Heb
  2:1–11). The pinned convention (SC-0044) holds machine ranges Hebrew and human anchors English,
  exercised across all of J02–J04's seams with coverage block-clean throughout.

## 4. What the held-out text caught (the second result)

Beyond the vocabulary verdict, the test earned its cost a second way: **drafting on a book the
pipeline had never seen flushed out five real defects no amount of Ruth-side testing could have
found**, each fixed with a bite-proven test in the permanent gate:

1. The proposition-anchor parser stripped only the word "Ruth" — Jonah anchors silently read
   "Jonah" and scene links were lost (latent since J01's first compile).
2. Scene headings could not express a cross-chapter range (Ruth never crossed one; J02's last
   scene does).
3. Nothing could express the English/Hebrew versification split (the `; Heb` heading qualifier
   and the range/anchor convention now exist and are pinned).
4. Pairing-by-filename-prefix grabbed the wrong artifact in mixed directories — twice, in two
   commands (coverage, then id-check): the same defect class, now suffix-filtered in both.
5. The §5 flag-pointer parser read proposition numbers inside parentheticals — a cross-pericope
   note ("pair with J01 Proposition 1") aimed a figure flag at the wrong proposition: a wrong
   supervision signal, headed for training data, caught by a one-digit discrepancy in compile
   output ("flags carried 4" against 3 declared).

The pattern is the report's second thesis: **the plan predicted none of these; the held-out text
found all of them.** For a pipeline whose product is training supervision, generality testing is
defect testing.

## 5. Honest limits — what this test does not claim

- **The judgment half is untested on Jonah.** The five FOR_MODELs are deterministic skeletons;
  their interpretive fields (scene kinds, proposition kinds, event slots, speech acts) await the
  Slice-4 drafter or hand-authoring. The L2 vocabulary's behavior on Jonah — and the speech-act
  closed list under real fill — is therefore the **next** experiment. The L1/structure verdict
  stands regardless: classification, registers, schema shape, coverage, and discipline were all
  fully exercised.
- **One judge.** Every exegetical ruling (divisions, registers, cast, reuse-vs-new) is Marcia's;
  the maps encode a single expert's judgment, machine-checked for faithfulness but not
  inter-rater agreement.
- **Two of four genre groups exercised.** NARRATIVE and POETIC_SUNG are now proven in use;
  INSTRUCTIONAL_REGULATORY and ORAL_DISCOURSE await books that contain them (law, prophetic
  discourse). The held-out test generalizes the claim from "fits Ruth" to "fits books like
  these" — Bible scale will repeat this test per genre family.
- **Jonah is short.** 48 verses is a complete book but a small sample; the Ruth remainder
  (P07–P14) and book three will grow the evidence.

## 6. The verdict

**The interlingua holds.** Across two books, five held-out pericopes, three genres in use,
narrative and poetry, two versification systems, and the richest divine-name patterning the
corpus has yet seen, the closed vocabulary needed **zero new values** — and the one structural
assumption it carried (a narrator's register baked in as a constant) was surfaced by exactly the
text designed to surface it, ruled by the project lead, fixed as a governed change, and gated
permanently. The registry architecture did what it was built for, including the first
cross-book concept anchor. The discipline that took six pericopes of remediation to establish on
Ruth produced **born-clean artifacts five times in a row** on a book it had never seen.

The supervision the downstream models will train on is, on this evidence, **schema-valid,
version-stable, and drift-controlled on held-out Scripture** — which is the property the whole
compiler exists to guarantee.

*— Drafted by the Architect (SC-0049), 2026-06-10, for Marcia's blessing; every number
re-runnable via the verify commands in `SPEC_CHANGES.md` SC-0032 → SC-0048.*
