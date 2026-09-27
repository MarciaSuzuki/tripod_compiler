# The Sala gate seam — the three-signal contract with João's reader

> **Ruled by Marcia, 2026-08-31 (Option A).** Recorded under **SC-0085**. This document is the
> seam contract between the Tripod compiler's artifacts and João's **Sala** (his review
> environment, feeding Refine). João was told the contract in a reply Marcia sent; his side
> switched its second read from sta-status-as-proxy to the checklist flag but KEEPS sta-status
> as a condition. No compiler or vault wiring was needed for the contract itself.

## The contract

João's Sala opens a Ruth pericope **only when it reads THREE agreeing signals**:

| # | Signal | Where it lives |
| --- | --- | --- |
| 1 | A **real** `high_risk_register_audit` array (no `SKELETON_PENDING_HIGH_RISK_REVIEW` entries) | the pericope's COMPILATION-LOG (`fixtures/compilation-log/…`; vault `stas/…`) |
| 2 | `validation_checklist.high_risk_register_complete: true` | the same COMPILATION-LOG |
| 3 | `sta-status: "complete"` | the Meaning Map frontmatter (vault `pericopes/…`; vendored `fixtures/meaning-map/…`) |

**Any divergence among the three = the passage stays closed on João's side, and João alerts
us** — divergence would mean drift on our side, never a partial open.

## The flip-together rule

When a pericope's high-risk register is completed and ruled, all three signals flip **in the
same change** (the same SC slice, the compiler + vault PR pair): the real audit lands, the
checklist flag flips to `true`, and `sta-status` flips to `"complete"` in BOTH the vault map
and the vendored fixture copy. Never flip one signal without the others.

## The guard

`tests/sala-gate-signals.test.ts` (rides the board, `npm test`) walks every COMPILATION-LOG,
derives the three signals, and fails on any disagreement — so the signals **can never diverge
silently** (the SC-0085 rider; fix-hierarchy tier: gate/lint).

**Known pre-existing divergences (frozen 2026-08-31, SC-0085):** all 18 Esther pericopes
(E01–E18) carry `sta-status: "complete"` on their maps while their registers are still
SKELETON with the checklist flag `false`. This predates the contract; on João's side the
divergence reads as *closed*, which is the safe direction. The guard freezes these 18 as a
known list — any NEW divergence fails, and resolving Esther (either completing its registers
or re-flagging its maps) is **future-card work**; burning entries off the frozen list requires
editing the test's list in a governed change.

## Queue state (the SC-0085 program; updated SC-0086, 2026-09-26)

- P01–P06: real audits, all three signals agree (complete) — open to Sala.
- **P07: completed under the SC-0085 P07 slice** (14 entries ruled by Marcia 2026-08-31).
- P08: skeleton, all three signals agree (incomplete) — closed; next in the queue (P09 was ruled
  ahead of it, sheet decision C). Carried to the P08 slice from the SC-0086 review (seen, not changed;
  each only on Marcia's word): map §5B FIG_0122 line "the reverse lands at P09, where she tells him"
  (the reversal/handoff framing ruling 7 removed from P09; a possible rendering: "closes at P09, where in
  the night the request comes from Ruth (3:9)"), the FIG_0122 slug "He-Will-Tell-You-Handoff" the voice
  reads in P08, and §2.1 "…but with a handoff: he will tell you what to do".
- **P09: completed under SC-0086** (18 entries, 10 do_not_decide, ruled by Marcia 2026-09-26 point
  by point, together with the P09 map + Meaning Coordinates corrections). The three signals flipped
  together in the same change; the vault half (map `sta-status` + `stas/` copies) is prepared, not yet
  applied — until it lands, the vault still reads P09 closed (skeleton + `pending`), the safe direction.
- P10–P14: skeletons, all three signals agree (incomplete) — closed, queued in order. Carried from
  the SC-0086 review (seen, not changed; each only on Marcia's word in its own slice):
  - P10: Scene 1 register stays INTIMATE while P09 Scenes 2–3 (the same two, the same night) are now
    CONSULTATIVE — keep, or align? The MC `register_overrides._note` "the two women alone again"
    describes only Scene 2. §3C CB_0042 "the place where the sleeper's feet lie" carries the "he
    sleeps" reading ruling 1 removed from P09 (a possible rendering: "the place of his feet
    (margelot)").
  - P11: map "turns the matter from a night's whisper into the town's record" (ruling 5 removed
    "whispers" from the P09 night) and "redeemer-queue"/"queue" (ruling 9 replaced "queue" in P09 with
    "a redeemer nearer than I, who comes first because he is nearer").
- Jonah J01–J05: skeletons, signals agree (incomplete) — closed; outside the current card.
- Esther E01–E18: the frozen known-divergence set above; outside the current card.
- T13 (Psalm 13): no COMPILATION-LOG yet (its Meaning Coordinates is born at compiler Phase 4)
  — not in the guard's walk until the CL exists.
