# Reading-quality gate — the human ceiling on fidelity

> **Status:** a **human review gate**, deliberately kept **separate from the validator**.
> Not automatable, not auto-passed. It is the counterweight to all the conformance machinery.
> Pairs with `COVERAGE.md`: coverage is the mechanizable floor (did we get the *entities*
> right?); reading-quality is the human ceiling (is it a *good, faithful reading*?).

## Why this is a separate gate

Three different questions, easily confused:
1. **Conformance** — schema-valid, vocabulary-legal, drift-free. *The validator. Automatable.*
2. **Coverage** — every participant/place/object accounted for, nothing invented. *`COVERAGE.md`.
   Largely mechanizable against BHSA.*
3. **Reading quality** — does the map carry the *burden* of the passage? *This document. Human judgment.*

**The risk this gate exists to prevent:** "schema-valid" quietly becoming the goal. A map can
pass every validator check and the full coverage ledger and still be a flat, or wrong, reading.
If the team optimizes for the green checkmark, you scale consistent mediocrity efficiently.
So reading-quality is scored **separately, by a person, and is never auto-passed.**

## The calibration reference

The **gold maps (P01–P06)** are the quality bar. Score new maps *against* them — not against an
abstract ideal. When a dimension is unclear, ask: "how did the gold map for a comparable
passage handle this?"

## The rubric (reviewer scores each dimension; judgment, not arithmetic)

For each pericope, the reviewer records `PASS / NEEDS-WORK / FAIL` + a one-line note per
dimension. Any `FAIL` blocks approval; `NEEDS-WORK` returns to the Mapper.

1. **Burden / argument** — Does Level 1 capture what the passage is *doing* to its hearer
   (its concern, its weight), not just *what happens*?
2. **Arc & movement** — Does the shape (opening → turn → close) match the text's actual
   movement, with the right emphases and pace?
3. **Significant absences are the *right* ones** — Coverage proves entities are present; this
   asks whether the *meaningful silences* (no grief named, no divine cause stated, a voice
   withheld) are correctly identified — and none invented.
4. **Register & tone reading** — Is the register (and any scene/moment override) a faithful
   read of the social key, not a default? Does tone match?
5. **Figures that matter are kept** — Are the load-bearing figures/idioms flagged with the
   right keep-image level, and is nothing flattened that should be preserved
   (`NOT_TO_BE_NORMALIZED`)?
6. **Communicative function** — Does the map name *why* this pericope exists in the book's
   argument, and how it stages what follows?
7. **No semantic addition** — Does every proposition assert only what the text asserts? (The
   half coverage can't check: invented *claims*, not invented *entities*.)
8. **Held-open ambiguity honored** — Where the text is genuinely ambiguous, is the ambiguity
   preserved rather than falsely resolved?

## Relationship to the other gates

```
validator (conformance)  →  coverage ledger (entities)  →  reading-quality gate (the reading)
   legal?                      complete & nothing added?      faithful & good?
   automatable                 largely mechanizable           human, calibrated to gold
```

Coverage is a **precondition**, not a substitute: pass coverage first (the entities are right),
*then* judge the reading. A map should not reach the reading-quality gate with unresolved
`UNANCHORED_ENTITY` or `UNMAPPED_SOURCE/explicit` flags.

## Where it lives in the workflow
- A **review record** distinct from the COMPILATION-LOG (which is methodology decisions) and the
  coverage ledger (which is entities). Recommend attaching it to the pericope's review step
  (near VERIFICATION-INPUT), with the 8 dimensions + notes + an overall `APPROVED / RETURNED`.
- **Never** fold these dimensions into the validator. Keep "is it sound?" and "is it good?"
  visibly different questions, answered by different actors.

## Open items
- [ ] Confirm the 8 dimensions against how the gold maps actually read (add/cut to match practice).
- [ ] Decide the record location/format and who signs off.
- [ ] Optional later: an *assistive* (non-gating) check that drafts reviewer questions per
      dimension — help the human, never replace the judgment.
