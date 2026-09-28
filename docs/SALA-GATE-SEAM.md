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

## Queue state (the SC-0085 program; updated SC-0086, 2026-09-26 and 2026-09-27; SC-0087, 2026-09-27; SC-0088, 2026-09-28)

- P01–P06: real audits, all three signals agree (complete) — open to Sala.
- **P07: completed under the SC-0085 P07 slice** (14 entries ruled by Marcia 2026-08-31).
- P08: skeleton, all three signals agree (incomplete) — closed; next in the queue (P09 was ruled
  ahead of it, sheet decision C). Carried to the P08 slice from the SC-0086 review (seen, not changed;
  each only on Marcia's word): §2.1 "…but with a handoff: he will tell you what to do", and §3C "the
  place where a sleeper's feet lie; to uncover it is to fold the covering back" (the "he sleeps" reading
  ruling 1 of P09 removed). **Resolved under SC-0087 (her ruling R-9 C of 2026-09-27):** the FIG_0122
  slug is now `He-Will-Tell-You` (map frontmatter + §5B, `figures.json` 0.7.2, vault note renamed) and the
  §5B line no longer says "the reverse lands at P09, where she tells him" ("cross-pericope pair opens
  here at 3:4").
- **P09: completed under SC-0086** (18 entries, 10 do_not_decide, ruled by Marcia 2026-09-26 point
  by point, together with the P09 map + Meaning Coordinates corrections). The three signals flipped
  together in the same change; the vault half (map `sta-status` + `stas/` copies) is prepared, not yet
  applied — until it lands, the vault still reads P09 closed (skeleton + `pending`), the safe direction.
  Marcia's word of 2026-09-27 («sim, siga as recomendações») closed two SC-0086 OWED items in the same
  change: (A) B19's book-level name is now "The Nearer Redeemer" (registry `english`, which the app
  uses as B19's coverage label — P11's 4:1 designation no longer reaches the voice's ledger on P09
  turns; the vault note is renamed `B19-The-Nearer-Redeemer.md` and every link to it rewritten), and
  (B) the P09 title reads "The threshing-floor night: the wing asked for, the word redeemer spoken,
  the oath". The vault half carries both.
  App follow-up (Internalize, not canon; one app PR on Marcia's word, before or with the app's
  canon sync to this pin): the coverage matcher's concrete heuristic now takes generic keys from
  two SC-0086 names — "The Nearer Redeemer" gives B19 'resgatador' (so a line about Boaz, 3:9,
  engages B19 in P09 S3 and P11 S1), and "Young Men Ruth Did Not Go After" gives B32 'rute' (any
  line naming Rute engages B32 in P09 S3). Fix in the app: whole-phrase entries used alone
  ("the nearer redeemer" → "resgatador mais próximo" etc.; B32 → rapazes / moços / jovens),
  role nouns out of the proper-noun loop, and coverage tests for both.
- P10: skeleton, all three signals agree (incomplete) — closed; queued (no P10 register was built under
  SC-0087 or SC-0088). **Resolved under SC-0087 (R-9 C):** Scene 1 is now CONSULTATIVE (as P09 Scenes 2–3; map §1 +
  MC scene_level + the MC `_note`, which now describes both scenes), Scene 2 stays INTIMATE; §3C CB_0042
  "the place of his feet"; §2.4 "keep the secret Boaz asked for (3:14)"; every pointer ahead to the
  gate removed from the map (§2.2's closing sentence, §2.3 "the whole legal day" → "the whole day", §2.4
  twice, §3B PL4 "and its gate", §3A Scene 2 B13 and §5B FIG_0155 "his name rests until the gate", §5B
  FIG_0156 "the gate scene fulfills it at P11"). The whole-sentence cut in §2.2, the §2.3 / PL4 / §3A
  edits are builder calls under "any other" pointer, for her yes/no.
- **P11: completed under SC-0087** (14 entries, 8 do_not_decide — R1–R7 and R10 — ruled by Marcia
  2026-09-27, nine rulings, her word «(a), sim, pode seguir com as recomendações», together with the
  P11 map + Meaning Coordinates corrections). The three signals flipped together in the same change; the
  vault half (map `sta-status` + `stas/` copies + the CB_0002 / FIG_0122 note renames) is prepared, not
  yet applied — until it lands, the vault still reads P11 closed (skeleton + `pending`), the safe
  direction. The map says "So-and-so" without "friend" (R-2); "whisper" and "queue" are gone (R-7);
  FIG_0015 is no longer flagged at 4:1 (the 2:3 pair lives in the canon record only, R-4); B2 left the
  MC Scene 1 beings (R-9 B). Forward links to P12/P13 live only in the P11 register (R14) and pair table.
  Carried to the P12/P13 slices (seen, not changed): FIG_0003 — the vault note lists closes-at P12 but
  neither the P12 map nor the P12 MC flags it; FIG_0014 — the P12 map says it closes at 4:11, the vault
  note says P13 and the P13 MC flags it again at 4:14a; FIG_0016 — the vault note's appears-in lists P12,
  which does not flag it; the vault FIG_0015 note still lists closes-at P11 (P11:4:1). P12 map CB_0002
  "the family-duty shadow — the widow taken so the dead line continues" / "the duty … the nearer
  redeemer would not" (R-3 says "cannot"), the Tamar line "levirate-style right", and §2 "the gate
  scene the sandal sealed" — each for her word in the P12 slice. **Resolved under SC-0088** (her standard of
  2026-09-28): the P12 CB_0002 lines now read "the widow bought, so that the name of the dead is raised up upon
  his inheritance" / "what Boaz says buying Ruth is for"; the levirate line and "the gate scene the sandal
  sealed" are out; FIG_0003 is flagged at P12 Proposition 5 (4:10 "the gate of his place") and closes there;
  FIG_0014 closes at P13 (4:14), with P12 (4:11) as its middle station; FIG_0016 closes at P13 with no P12
  flag (ruling D2). The P11 pair rows themselves are not edited (approved passage; OWED 9 of SC-0088).
- **P12, P13, P14: completed under SC-0088** (Marcia's map standard of 2026-09-28 and her four SC-0088
  rulings of 2026-09-28, «(b), (b), (a), sim — pode seguir com as recomendações», together with the P12–P14
  map + Meaning Coordinates corrections). P12: 12 entries, 4 do_not_decide (R2, R3, R5, R6); P13: 12
  entries, 7 do_not_decide (R1, R3, R5, R7, R8, R9, R10); P14: 11 entries, 5 do_not_decide (R1–R5). The
  three signals flipped together for each in the same change; the vault half (map `sta-status` + `stas/`
  copies + the B24 / PL1 / B27 `bcd/` notes) is prepared, not yet applied — until it lands, the vault still
  reads P12–P14 closed (skeleton + `pending`), the safe direction. Ruling D1: the voice never says "king";
  a team's «o rei Davi» is named once («a história dá só o nome dele, Davi») without a send-back (P13 R8,
  P14 R4). Ruling D2: in 4:9–12 the map says only "Neither Ruth nor Naomi speaks." and the voice never says
  whether they are at the gate (P12 R3, P13 R10). Ruling D3: "do worthily" keeps the worth-word (CB_0032,
  P12 R9). Forward links from P12 and P13 live only in their registers and pair tables.
- **After SC-0088 the complete-agreeing Ruth set is P01–P07, P09, P11–P14 — 12 of the 14 pericopes.** P08
  and P10 are still skeletons (closed, agreeing) and are the queue's last two Ruth slices; the guard pins
  both sets exactly.
- Jonah J01–J05: skeletons, signals agree (incomplete) — closed; outside the current card.
- Esther E01–E18: the frozen known-divergence set above; outside the current card.
- T13 (Psalm 13): no COMPILATION-LOG yet (its Meaning Coordinates is born at compiler Phase 4)
  — not in the guard's walk until the CL exists.
