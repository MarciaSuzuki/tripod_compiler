# SC-0063 batch-ruling sheet (PREPARED at SC-0063 close — RULED under the follow-on SC)

> **Status: AWAITING MARCIA'S RULING.** Every judgment below was machine-drafted under the SC-0063
> drafter (claude-opus-4-8 · pinned prompts fm-drafter-0.1.2→0.1.5) and gate-checked; nothing here
> is canon until ruled. The follow-on SC applies the rulings: promotions (`tripod promote --sc`),
> map/FM amendments, registry/BCD additions, then graduation per the visibility idiom.
> Provenance per pericope: `_working/<id>/drafts/run-*/` (manifest · fills · raw response · gates).
> Ruling shorthand suggestion: tick = approve as proposed; write a rename beside a value; strike = reject
> (the FM amendment then reuses an approved value or the field returns to the drafter).

## A — Map-side items — **ALL FOUR RULED by Marcia, 2026-06-12; APPLIED on sc-0064-batch-ruling-a (+vault half)**

1. **P10: `O15-Night-and-Morning` sits under 3D Times in the blessed map** — the FM schema requires
   `TM_*` in `time_id`, so the P10 draft is INVALID on exactly this. Options: (a) re-code the map
   entry as a `TM_` id (vault edit + BCD note); (b) keep O15 an object: move it to 3C/objects and give
   S1 `times: null` + `_note`. *The compiler carried it faithfully; the hand-loop never built P10's FM,
   so the tension never surfaced before.*
   **RULED: re-code as a TM time.** Applied: `TM_NIGHT_TO_MORNING` (new bcd/times note; O15 retired in place — its P08 span was a phantom record), map 3D re-linked both trees, aliases rebuilt (diff = exactly the two entities) + re-pinned 0.1.5, FM regenerated → VALID.
2. **P11: `FIG_0167` sits under 3C Objects-and-Concepts in the blessed map** — figures ride
   `figure_flags`, never `objects_in_scene` (schema refuses). Options: (a) drop the 3C entry (the
   figure already fires on the props' flags); (b) re-code as a `TH_`/`CB_` object if you mean a
   *thing*, not a figure.
   **RULED: drop the 3C entry.** Applied: entry removed both trees (the figure still fires via figure_flags; frontmatter declaration kept), FM regenerated → VALID; anchor pin 52→49.
3. **P07 Scene 1 has no Significant Absence block** (scenes 2–4 have theirs). Load-bearing
   downstream (`must_preserve_absences`). Options: (a) author the missing block (vault map edit);
   (b) rule that S1 (one verse of pure action) carries no marked absence and bless an explicit
   "none marked" wording for the FM field.
   **RULED: bless a none-marked wording.** Applied (the offered wording, hers to amend): "No marked absence: the verse is pure action; the narrator withholds nothing here that the telling makes felt." Map S1 block added both trees; FM regenerated (gaps 95→94; the obsolete null fill rejects by design) → VALID.
4. **The uncoded-collective question:** "the dead (of the household)" appears as a code-less being
   in P07/P11/P12 maps. The P07 draft (amended) carries `B?` (withheld). P02 gold rode it on **B2**
   with a referential form. Rule the idiom: `B?` + note, or bind to B2 (or B2+B4+B5 listing)?
   **RULED: bind when the referent set is fixed by the text at that point in the book's own disclosure (named in-verse, or an unambiguous set); where the text withholds, the FOR_MODEL withholds with it.** Applied: P07 2:20 hammetim → B2 (gold idiom; surface withholding preserved; three-entry split = her optional refinement) · P12 4:10 → B4 (named in-verse) · P11 4:5 stays B? (pre-disclosure — the model's fill anticipated the rule).

## B — Declared L2 mints (the bounded-open growth; tick to promote, rename, or strike)

Total declared mints: 232 declarations · 189 unique values across 6 axes (the checkboxes = the 189 unique values; a value declared more than once lists every declaring pericope).

> Justifications below are verbatim-from-fills (regenerated for SC-0064 §B prep, 2026-06-12 — the original sheet clipped 32 of them and showed only the first occurrence's text; ⚠ margin notes are evaluator-surfaced, architect-verified). Source per pericope: `_working/<id>/drafts/run-*/fills.json` (latest run).

**Sitting B1 RULED (Marcia, 2026-06-12): `action` (7) + `tone_element` (4) + §D's TOOK — all 12 ticked** → promoted via per-pericope ruling logs (`_working/<id>/<id>-SC-0064-B1-RULING-LOG.md`), approved-enumerations **v0.12** re-pinned both trees. The dual-axis `proposition_kind` LAY_DOWN was **DEFERRED** to its axis sitting (B1 item 13). Remaining §B: 178 open checkboxes — proposition_kind (53, incl. the deferred LAY_DOWN) · role_in_scene_being (38) · arc_element (58) · scene_kind (29).

### Axis `proposition_kind` — 72 declaration(s) · 53 unique value(s) — **AXIS COMPLETE (Marcia, 2026-06-13): all 53 unique values ruled — Group A (dual-axis trio + AFFIRMED_RESOLVE) · B (WORD_OF_YHWH_CAME collapse + 6 keeps) · C (NAME_PRESERVED consolidation + 5 keeps) · bulk-tick (34). enum v0.13→v0.16.**

- [x] **ACQUIRED** (P12) — MM P2/P3: 'I have bought all that was Elimelech's... I have bought Ruth' — the redemption-purchase; no existing proposition_kind names a legal acquisition/redemption (TOOK is take-as-wife; DECLARED is the speech frame). Reviewer may prefer a registry REDEEMED if one exists in P11. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **ANGER_KINDLED** (J05) — P1: 'it was evil to Jonah... a great evil... burning anger.' No approved proposition_kind names becoming angry. **RULED keep (Group C glance) → promoted v0.15** — passes strip-to-type (discrete becoming-angry beat).
- [x] **ANSWERED** (J02, J05) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J02: "he answers: lift me and hurl me into the sea" — a response to the crew's question that is itself a directive counsel.
  - J05: P18: 'answering... it is good that it burns to me, even to death' — the one time Jonah answers the question; SPOKE/DECLARED lose the answer-to-question relation.
- [x] **APPOINTED** (J02, J05) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J02: "YHWH appoints a great fish to swallow Jonah" — the manah/appoint verb.
  - J05: P9: 'appointing... a qiqayon plant' — the book's signature verb vayman; recurs at P12 (worm) and P14 (wind).
- [x] **APPROACHED** (P09, J02) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - P09: MM P4: 'she came softly, uncovered the place of his feet, and lay down' — a multi-action approach with no approved proposition_kind fit.
  - J02: "the captain comes to him" and rebukes the sleeper — the captain's approach with a protest question.
- [x] **ASKED** (J02, P09) — "the men ask Jonah: what shall we do to you, so the sea will quiet?" — the crew's question to the exposed man (CONSULTATIVE shift at v.11). **RULED dual-axis (Group A, Marcia 2026-06-13) → promoted to proposition_kind v0.13 (already on action); one promotion covers J02 + P09 and CLOSES the §D-deferred P09 use.**
- [x] **BELIEVED** (J04) — 'The men of Nineveh believe God' (Jonah 3:5). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **BORE** (P13) — MM P3 'bearing' — Ruth bears a son; no approved proposition_kind (DIED, GAVE, TOOK, etc.) covers a birth event. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **BROUGHT_UP** (J03) — P9: 'And you brought my life up from the pit, YHWH my God' — the lift, no approved kind covers it. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **CAST_INTO_DEEP** (J03) — P3: 'You cast me into the deep, into the heart of the seas' — the act attributed to YHWH. **RULED keep (Group C glance) → promoted v0.15** — passes (a casting event, like HURLED).
- [x] **CAST_LOTS** (J02) — "they cast, and the lot falls on Jonah" — the lot-casting that exposes the runaway. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **CONFESSED** (J02) — "I fear YHWH, God of heaven, who made the sea and the dry land" — Jonah's confession of the God he flees. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **CREED_RECITED** (J05) — P4: the five-fold creed (gracious, compassionate, slow to anger, abounding in hesed, relenting of evil) quoted as accusation; CB_0058 active here. **RULED keep (Group C glance) → promoted v0.15** — passes (a recitation act).
- [x] **DECLINED** (P11) — MM P11: 'I cannot redeem it for myself, lest I ruin my own inheritance' — the redeemer declines; no approved kind covers a refusal. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **DESCENDED** (J03) — P8: 'I went down to the roots of the mountains; the earth — her bars were behind me forever' — the descent's lowest point. **RULED keep (Group B-3) → promoted v0.14** — the psalm's descent, distinct from WENT_DOWN.
- [x] **DIVINE_WORD_CAME** (J01) — MM P1: 'a word came / YHWH's / to Jonah' — the prophetic word-event formula; approved SPOKE does not capture the 'word of YHWH came to X' event. **RULED COLLAPSE (Group B-1, Marcia 2026-06-13) → folded into `WORD_OF_YHWH_CAME`; J01 FM amended; NOT promoted.**
- [x] **EMBARKED** (J01) — MM P5: 'paying / going down into it / to sail / with the crew / away from before YHWH' — boarding the vessel to flee; no approved proposition_kind names embarkation. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **ENGULFED** (J03, J03) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J03: P4: 'the flood was all around me; all your breakers and your waves passed over me' — no approved kind covers engulfment.
  - J03: P7: 'The waters closed around me up to the throat; the deep surrounded me; weeds were wrapped around my head' — engulfment again, declared per axis-fill rule.
- [x] **FASTED** (J04) — 'They call a fast and put on sackcloth, from the greatest of them to the least of them.' **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **FATHERED** (P14, P14, P14, P14, P14, P14, P14, P14, P14) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - P14: MM P2–P10: the repeated "X fathered Y" genealogical formula; no approved proposition_kind names a begetting event.
  - P14: MM P3: "a fathering" — begetting event; declared per-fill as required for every minted axis token.
  - P14: MM P4: "a fathering" — begetting event.
  - P14: MM P5: "a fathering" — begetting event.
  - P14: MM P6: "a fathering" — begetting event.
  - P14: MM P7: "a fathering" — begetting event.
  - P14: MM P8: "a fathering" — begetting event.
  - P14: MM P9: "a fathering" — begetting event.
  - P14: MM P10: "a fathering" — begetting event arriving at the terminal name.
- [x] **FEARED** (J02, J02) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J02: "the sailors are afraid; each cries to his own god" — first step of the fear escalation.
  - J02: "the men fear a great fear and say, What is this you have done!" — the escalated fear.
- [x] **FLED** (J01) — MM P3: 'getting up / to flee / to Tarshish / away from before YHWH' — a flight; no approved proposition_kind names fleeing (ROSE and DEPARTED understate the refusal). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **FORSOOK** (J03) — P12: 'Those who hold to vain idols forsake their hesed' — no approved kind covers forsaking. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **GENEALOGY_HEADER** (P14) — MM P1: "the line is named / Whose generations? Perez's" — the toledot-formula header opening the genealogy; no approved proposition_kind names a lineage header. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **HURLED** (J02, J02, J02) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J02: "hurling ... YHWH hurled a great wind at the sea" — the hetil/hurl verb that recurs four times in the pericope.
  - J02: "they hurl the cargo into the sea to lighten the ship" — the second of four hurls.
  - J02: "they lift Jonah and hurl him into the sea" — the climactic hurl of the refrain.
- [x] **INTERROGATED** (J02) — "they press him: tell us — whose fault is this? what is your work? ..." — the rapid-fire questioning of the exposed man. **RULED keep (Group B-2) → promoted v0.14** — rapid-fire, distinct from ASKED/QUESTIONED.
- [x] **LAY_DOWN** (P09, P10) — **RULED dual-axis (Group A, Marcia 2026-06-13) → promoted to proposition_kind v0.13 (action half landed in B1).**
  - P09: MM P3: 'he came to lie down at the end of the grain heap' — a lying-down event with no approved proposition_kind fit.
  - P10: MM P1: 'lying — who lay? she — at the place of his feet, until the morning.' No approved kind covers reclining/lying down (SAT, PROSTRATED, ROSE, REMAINED do not fit).
  - ✓ dual-axis resolved: the `action` half was promoted v0.12 (B1 item 6); the `proposition_kind` half (deferred at B1 item 13) is now promoted v0.13.
- [x] **MADE_SHELTER** (J05) — P8: 'making a booth... sitting under it in the shade.' Jonah builds his own watcher's shade (O13); no approved kind covers constructing a shelter. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **MEASURED** (P07) — MM P3: 'measuring | how much was it? about an ephah | an ephah of what? barley' (CB_0040); no approved proposition_kind for a quantity/measure result. **RULED keep (Group B-4) → promoted v0.14** — quantity result, distinct from MEASURED_OUT.
- [x] **MEASURED_OUT** (P10) — MM P5: 'measuring — measured six measures of barley — laid it on her.' FIG_0152 foregrounds the measuring with the measure-unit deliberately unspecified; GAVE/HANDED would lose the measuring act the text marks. **RULED keep (Group B-4) → promoted v0.14** — portioning act, distinct from MEASURED.
- [x] **NAME_NOT_CUT_OFF** (P12) — MM P5: 'so that the name of the dead is not cut off from his kindred and from the gate of his place' (FIG_0110, living-and-dead formula); distinct negative beat from NAME_RAISED. Fallback DECLARED if registry consolidates. **RULED → consolidated to `NAME_PRESERVED` (Group C option a — the sentence-shaped half failed strip-to-type; Marcia 2026-06-13); P12 FM amended; NOT promoted.**
- [x] **NAME_RAISED** (P12) — MM P4: 'to raise up the name of the dead upon his inheritance' (FIG_0002, the raise-up-the-name formula enacted); no existing proposition_kind covers name-preservation as the act. Fallback DECLARED if registry prefers consolidation. **RULED → consolidated to `NAME_PRESERVED` (Group C option a, Marcia 2026-06-13); P12 FM amended; NOT promoted.**
- [x] **PASSED_BY** (P11) — MM P2: 'the redeemer of whom Boaz had spoken is passing by' — incidental passage with no approved kind. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **PRAYED** (J02, J05) **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
  - J02: "Jonah prays to YHWH his God from the belly of the fish" — the prayer the prophet never prayed on deck.
  - J05: P2: 'praying... to YHWH.' Distinct speech-to-deity act; SPOKE is the only generic near-fit but loses the prayer framing the register override marks.
- [x] **PROPOSED** (J02) — "the men say to one another: come, let us cast lots" — a cohortative proposal among equals (the CONSULTATIVE register shift at v.7). **RULED dual-axis (Group A, Marcia 2026-06-13) → promoted to proposition_kind v0.13 (already on action).**
  - ✓ cross-axis resolved: dual-axis allowed (the established 7-member action↔proposition_kind pattern).
- [x] **QUESTIONED** (J05) — P6: 'asking... is it good that it burns to you?' No approved proposition_kind names a posed question; reused at P17 and P20. **RULED keep (Group B-2) → promoted v0.14** — probing question, distinct from ASKED/INTERROGATED.
- [x] **REASSURED** (P09) — MM P14: 'do not fear; all that you say I will do for you' — a reassurance/pledge act (FIG_0123/FIG_0136) with no approved proposition_kind fit. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **REJOICED** (J05) — P11: 'rejoicing... over the qiqayon, a great joy' — the only joy in the book. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **RELENTED** (J04) — 'God relents of the evil he had said he would do to them, and he does not do it' (Jonah 3:10). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **REMEMBERED** (J03) — P10: 'As my soul fainted within me, I remembered YHWH' — remembering, distinct from PERCEIVED. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **RESOLVED → `AFFIRMED_RESOLVE`** (J03) — P6: 'yet I will look again toward your holy temple' — a forward resolve, distinct from a vow or a plain speech act. **RULED RENAME (Group A option b, Marcia 2026-06-13): renamed to AFFIRMED_RESOLVE → promoted to proposition_kind v0.13; J03 FM amended (amendments.json). RESOLVED stays on discourse_thread_state only.**
  - ✓ cross-axis resolved by rename: `RESOLVED` is the approved `discourse_thread_state` value (a status axis); no token spans status↔event, so the proposition_kind was renamed rather than dual-placed.
- [x] **ROWED** (J02) — "the men dig their oars in to get back to the dry land — and they cannot" — the failed rescue effort. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **SEA_STILLED** (J02) — "the sea stands still from its raging" — the sudden calm that is the storm's verdict. **RULED keep (Group C glance) → promoted v0.15** — passes (discrete stilling beat).
- [x] **SHOWED** (P10) — MM P10: 'showing — what did she show? these six measures of barley.' The gift is laid out as evidence; no approved kind covers displaying/presenting an object as proof (GAVE/HANDED is the original transfer, not the showing). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **STORM_AROSE** (J02) — "a great storm rose on the sea, and the ship was about to break apart." **RULED keep (Group C glance) → promoted v0.15** — passes (discrete storm-onset beat).
- [x] **STRUCK** (J05) — P13: 'striking... the worm struck the qiqayon, and it withered.' Reused at P15 (the sun strikes Jonah's head). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **SWALLOWED** (J02) — "the fish swallows him. Jonah is in the belly of the fish three days and three nights." **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **THRESHED** (P07) — MM P2: 'beating out | who beat it out? Ruth | beat out what? what she had gleaned' (chavat, CB_0041); no approved proposition_kind covers threshing. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **TREMBLED** (P09) — MM P5: 'the man trembled and twisted' — the vayyecherad startle, with no approved proposition_kind fit. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **VOMITED** (J04) — 'it vomits Jonah out onto the dry land' (Jonah 2:10). **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**
- [x] **WENT_DOWN** (P09, J01, J02) **RULED keep (Group B-3) → promoted v0.14** — narrative yarad, distinct from DESCENDED.
  - P09: MM P1: 'she went down (yarad) to the threshing floor and did all her mother-in-law commanded' — a descent-and-compliance event with no approved proposition_kind fit.
  - J01: MM P4: 'going down / to Joppa / finding a ship' — the yarad descent (FIG_0198 Going-Down-Descent); no approved kind captures it.
  - J02: "Jonah has gone down into the far hold, lain down, and fallen fast asleep" — the yarad descent that runs through J01-J02.
- [x] **WORD_OF_YHWH_CAME** (J04) — 'the word of YHWH comes to Jonah a second time' — the recurring word-arrival formula. **RULED COLLAPSE SURVIVOR (Group B-1, Marcia 2026-06-13) → promoted v0.14; absorbs DIVINE_WORD_CAME (J01 1:1 amended + J04 3:1).**
- [x] **WORSHIPED** (J02) — "the men fear YHWH with a great fear, and they offer a sacrifice ... and they vow vows" — the pagan crew's full worship as the storm's outcome. **RULED bulk-tick (Marcia 2026-06-13) → promoted v0.16.**

### Axis `role_in_scene_being` — 60 declaration(s) · 38 unique value(s)

- [ ] **AFFLICTED_ONE** (J05) — MM S3 role prose: 'the shaded one, the rejoicing one, then the struck and fainting one who asks to die.'
- [ ] **ANIMAL_REFERENT** (J05) — MM S4 role prose: 'the book's last word — the animals stand inside the final mercy'; the same beasts of the J04 decree.
- [ ] **APPOINTED_CREATURE** (J02) — "the appointed swallower ... YHWH's creature, doing YHWH's errand without argument" — no approved role for an appointed non-human agent.
- [ ] **APPOINTED_STRIKER** (J05) — MM S3 role prose: 'the appointed striker — it kills the qiqayon at dawn'; God's smallest creature on God's errand.
- [ ] **COMMISSIONED_PROPHET** (J01) — MM 3A: 'the one the word comes to; the prophet who is sent' — the approved role list (Ruth cast) has no prophet/commission role.
- [ ] **COMPLAINANT** (J05) — MM S1 role prose: 'the angry pray-er; the one who asks to die'; 3F: 'turns Israel's oldest praise into a prophet's accusation.'
- [ ] **CONVENER** (P11) — MM S1: Boaz 'takes the gate, calls the redeemer aside, and seats the elders'; no approved role names a convener of a proceeding.
- [ ] **CREATURE_AGENT** (J04) — The fish is 'YHWH's creature, finishing its errand' — a non-human acting on the divine word.
- [ ] **CREW** (J02, J02, J02, J02)
  - J02: "the sailors" / "the men" — the ship's working crew, with no approved maritime collective role in the list.
  - J02: "the men" — the ship's working crew, continued from S1.
  - J02: "the men ... rowing hard for shore to spare him" — continued crew.
  - J02: "the ones who pray, hurl Jonah in, and then fear and worship YHWH".
- [ ] **DECEASED_HOUSEHOLD_HEAD** (P12) — MM 3A: 'the dead head of the line whose holdings Boaz has bought'; no existing token for a deceased estate-holder being named in the purchase.
- [ ] **DECEASED_HUSBAND** (P11) — MM S3: 'the one whose name must be raised upon his inheritance' — Ruth's late husband; no approved role.
- [ ] **DECEASED_KIN** (P07) — MM S3 3A: 'the dead of the household... those the blessing keeps inside the reach of hesed' — Naomi's dead husband and sons, named only as 'the dead'; no approved role fits.
- [ ] **DECEASED_KINSMAN** (P11, P11)
  - P11: MM: Elimelech is the dead kinsman whose line the redeeming serves; no approved role for the deceased ancestor-of-the-matter.
  - P11: MM S2: 'the dead man whose portion is the matter'; the deceased-owner role is not approved.
- [ ] **DECEASED_WHOSE_NAME_RAISED** (P12) — MM 3A: 'the one whose name the purchase raises and keeps from being cut off'; the formulaic 'the dead' referent has no existing role token.
- [ ] **FLEEING_PROPHET** (J01) — MM 3A S2: 'the called one who flees instead of going' — the refusal-in-action role; no approved role token fits.
- [ ] **FUGITIVE** (J02, J02, J02, J02, J02)
  - J02: "the runaway ... the prophet fleeing YHWH" — Jonah's scene function throughout the pericope; no approved fit.
  - J02: "the one the lot falls on; the questioned man; the confessor" — still the runaway, now exposed.
  - J02: "the one who says: lift me and hurl me into the sea" — the runaway who owns the storm.
  - J02: "the man lifted and hurled into the sea" — 'this man' of the crew's prayer.
  - J02: "the swallowed man; at last, the one who prays" — the runaway carried alive.
- [ ] **GRANDMOTHER** (P13, P13)
  - P13: MM Scene 2/3: 'the grandmother' to whom the child is reckoned (the once-empty widow now holding the line's future); no approved role captures the grandmother function central to this scene.
  - P13: MM Scene 3: the grandmother who takes the child to her bosom; reused from S2 (no approved equivalent).
- [ ] **IDOL_KEEPERS** (J03) — Scene 4 role prose: 'the contrast — the ones who forsake their hesed' (those who hold to vain idols).
- [ ] **KING** (J04) — 'the king of Nineveh ... rises, strips, covers, sits in ashes, and decrees.'
- [ ] **LINEAGE_REFERENT** (P13) — MM Scene 3: Jesse and David are 'the names the narrator reaches to past the story' — forward genealogical referents; ANCESTOR is wrong-direction and ERA_REFERENT is time-setting only.
- [ ] **LINE_TERMINUS** (P14) — MM 3A/2.4: B26 is "the line's arrival; David the book's destination" — the terminal name the whole genealogy exists to reach; no approved role_in_scene_being names the endpoint of a descent line.
- [ ] **LIVESTOCK** (J04) — 'man and beast, herd and flock ... covered with sackcloth' — the city's animals made part of its repentance.
- [ ] **NEARER_REDEEMER** (P11, P11, P11, P11)
  - P11: MM S1: 'kinsman of Elimelech's line, nearer in the queue than Boaz (3:12)'; the queue-priority role is distinct from the generic REDEEMER_KIN.
  - P11: MM S2: the nearer kinsman, given first right and taking it; queue-priority role not in approved list.
  - P11: MM S3: the nearer kinsman who reverses and declines.
  - P11: MM S4: the nearer kinsman withdrawing via the sandal.
- [ ] **NOBLES** (J04) — 'by decree of the king and his nobles' — co-issuers of the edict.
- [ ] **PATRONYMIC_REFERENT** (J01, J01)
  - J01: MM 3A: Amittai 'fixes who Jonah is by naming his father'; he functions only as an identity anchor, like the approved ERA_REFERENT but for parentage.
  - J01: Same mint as S1: Amittai functions only as Jonah's identity anchor; re-declared here for the append entry.
- [ ] **POTENTIAL_SUITORS** (P09) — MM 3A-S3: 'the young men of marrying age, poor or rich; none of them chosen' — their scene function is the unchosen marital alternative, with no approved role_in_scene_being fit.
- [ ] **PROPHET** (J04, J04, J04)
  - J04: Jonah's book-spanning function as the one YHWH sends to call out to Nineveh.
  - J04: The once-runaway prophet the word comes to a second time.
  - J04: Jonah carrying out the errand in this scene.
- [ ] **REDEMPTION_OFFEROR** (P11, P11)
  - P11: MM S2: 'the one who lays out the field-matter before the court'; no approved role for the one tendering a redemption offer.
  - P11: MM S3: Boaz states the second binding term — still the offeror function.
- [ ] **RESPONDENT** (J05) — MM S4 role prose: 'the defiant answerer — angry enough to die — then the silent one.'
- [ ] **SELLER** (P11, P11)
  - P11: MM S2: 'the seller — the widow whose hand holds Elimelech's portion'; the seller function is not among approved roles.
  - P11: MM S3: Naomi as the seller-hand the field is acquired from.
- [ ] **SHIP_CAPTAIN** (J02) — "the captain ... rab hachovel, the chief of the sailors" — master of the ship; no approved equivalent.
- [ ] **SHIP_CREW** (J01) — MM 3A S2: 'the people aboard the ship bound for Tarshish' — the crew Jonah joins; no approved role token covers a ship's crew.
- [ ] **SUPPLIANT** (J03, J03, J03)
  - J03: Scene 1 role prose: 'the one praying — he called from his distress and was answered.' No approved role covers a praying suppliant.
  - J03: Scene 2 role prose: 'the one cast into the deep; the banished one who turns toward the temple' — still the praying suppliant.
  - J03: Scene 3 role prose: 'the drowning man — engulfed, wrapped, sunk to the roots; then lifted, remembering, heard.'
- [ ] **TOWNSWOMEN** (P13, P13)
  - P13: MM Scene 2/3 'the women' / 'the neighbor-women' act as the female counterpart to the men's gate-blessing (FIG_0187); approved TOWNSPEOPLE is gender-blind and FEMALE_WORKERS is field-specific.
  - P13: MM Scene 3 'the neighbor-women' (הַשְּׁכֵנוֹת) reused from S2; gender load-bearing for the communal-naming-for-Naomi figure (FIG_0181).
- [ ] **VOWER** (J03) — Scene 4 role prose: 'the one vowing — sacrifice with thanksgiving, payment of what he vowed.'
- [ ] **WATCHER** (J05) — MM S2 role prose: 'the unanswering one — he walks out and sits down to watch'; 3F: 'The watcher's post east of the city stages the lesson.'
- [ ] **WITNESSING_ASSEMBLY** (P12) — MM 3A: 'the wider assembly called to witness alongside the elders'; TOWNSPEOPLE/PEOPLE name the group but not its scene-defining witnessing function ('you are witnesses today').
- [ ] **WITNESSING_ELDERS** (P11, P11, P12)
  - P11: MM S1: 'the seated witnesses who make the gate a court'; no approved role for legal witnesses.
  - P11: MM S2: 'the elders of my people' as the witnesses the buying happens before.
  - P12: MM 3A: 'the seated court, named first among those called to witness'; no existing role_in_scene_being token names the elder court in its witnessing function.

### Axis `arc_element` — 58 declaration(s) · 58 unique value(s)

- [ ] **ANGER_AT_DIVINE_MERCY** (J05) — 2.1: 'The mercy that saved Nineveh lands on Jonah as a great evil, and he burns.'
- [ ] **APPOINTED_OBJECT_LESSON** (J05) — 2.1: 'God's appointings come one a verse: a qiqayon plant... a worm... a cutting east wind' — the staged lesson.
- [ ] **ARGUMENT_FROM_LESSER_TO_GREATER** (J05) — 2.1: 'YHWH's argument from the lesser to the greater: you pitied a plant... and I, should I not pity Nineveh.'
- [ ] **ATTESTATION_BY_SANDAL** (P11) — MM Scene 4: the right transferred and confirmed by the drawn-off sandal, the proceeding's one physical act.
- [ ] **BANISHMENT_AND_TEMPLE_TURN** (J03) — Map 2.1/Scene 2: 'banished from God's eyes yet turning toward his temple' — the prayer's hinge.
- [ ] **BIRTH_OF_HEIR** (P13) — MM 2.1: 'she bears a son' — the line's future delivered; no approved birth/heir arc token exists.
- [ ] **COMMUNAL_NAMING** (P13) — MM 2.4: 'closes the communal-naming the book opened in Naomi's bitter homecoming' — the women name the child for Naomi; no approved naming arc token.
- [ ] **COMMUNITY_WITNESS_ATTESTATION** (P12) — MM 2.1: 'The assembly answers as one: we are witnesses' — the choral attestation; distinct from BLESSING_INVOCATION; no existing token for the witness response.
- [ ] **CREW_CRISIS_RESPONSE** (J02) — "The sailors do everything — pray, jettison, cast lots, interrogate, row."
- [ ] **DEAD_NAME_RAISED** (P12) — MM 2.1/2.4: 'to raise up the name of the dead upon his inheritance, so that the name of the dead is not cut off' — the raise-up-the-name beat, distinct from the declaration and the blessing; no existing token.
- [ ] **DEATH_WISH** (J05) — 2.1: 'He asks to die' (and again at 4:8) — the recurring death-request.
- [ ] **DELIVERANCE_TO_DRY_LAND** (J04) — 'The fish gives Jonah back to the dry land at a word' — the opening release.
- [ ] **DESCENT_INTO_THE_DEEP** (J03) — Map 2.1: 'hurled into the deep, the seas closing' — the casting into the heart of the seas.
- [ ] **DESCENT_TO_THE_BOTTOM** (J03) — Map 2.1: 'down past the weeds, down to the roots of the mountains, the earth's bars shut behind' — the touched bottom.
- [ ] **DIVINE_COMMISSION** (J01) — MM 2.1/2.4: the passage opens with YHWH's word/charge to go to Nineveh — the commission the rest of the book answers; no approved arc token names a divine commissioning.
- [ ] **DIVINE_GIFT_OF_CONCEPTION** (P13) — MM 2.1/2.4: 'YHWH gives her conception' — the book's second direct divine act, a distinct arc beat with no approved equivalent.
- [ ] **DIVINE_PROBING_QUESTION** (J05) — 2.1: 'gets a question instead — is it good that it burns to you?'
- [ ] **DIVINE_PURSUIT_BY_STORM** (J02) — "YHWH hurls a great wind at the sea, and the storm that follows hunts one man" — the storm as divine pursuit opens the arc.
- [ ] **DIVINE_RELENTING** (J04) — 'God sees what they did, and relents of the evil he had spoken, and does not do it.'
- [ ] **EMPTINESS_REVERSED** (P13) — MM 2.1/2.4: 'the turn from death to a living name and from empty to full' — the deliberate reversal of the approved EMPTYING; needs its own token.
- [ ] **EMPTYING_REVERSED** (P10) — MM 2.4 names 'the structural turn from emptying to filling, carried in six measures of barley' — Naomi's 1:21 reqam answered negated. EMPTYING is approved for the loss in P01; its deliberate reversal here has no approved token.
- [ ] **EXPOSURE_BY_LOT** (J02) — "the lot finds Jonah" — the runaway is exposed.
- [ ] **FLIGHT_FROM_PRESENCE** (J01) — MM 2.1: Jonah runs the opposite way 'away from before YHWH' — the flight is the structural turn; approved DEPARTURE connotes ordinary leave-taking, not flight from the divine presence.
- [ ] **GATE_COURT_CONVENED** (P11) — MM 2.1/Scene 1: Boaz takes the gate, seats the redeemer and ten elders — the court is convened; no approved arc token covers a legal convening.
- [ ] **GENEALOGICAL_DESCENT** (P14) — MM 2.1: the passage is "a ten-name line of descent"; no approved arc_element covers an unbroken father-to-son lineage chain.
- [ ] **HURLING_OVERBOARD** (J02) — "Hurled at last into the sea."
- [ ] **LIFT_FROM_THE_PIT** (J03) — Map 2.1: 'and then the lift, you brought my life up from the pit' — the single reversing movement.
- [ ] **LINE_ARRIVAL_AT_DAVID** (P14) — MM 2.1/2.4: the cadence "tilts toward its last word" and "exists to arrive at David" — the arrival at the terminal name is the arc's burden, with no approved element for it.
- [ ] **LOSS_OF_COMFORT** (J05) — 2.1: 'a worm at dawn that kills the plant; a cutting east wind and a hammering sun, until he faints.'
- [ ] **MARRIAGE_CONSUMMATED** (P13) — MM 2.1: 'Boaz takes Ruth, she becomes his wife, he comes to her' — the redemption completed in marriage; no existing arc token covers a consummated marriage.
- [ ] **MASS_REPENTANCE** (J04) — 'the Ninevites believe God, fast, and put on sackcloth from the greatest to the least.'
- [ ] **NEARER_REDEEMER_DISCLOSURE** (P09) — MM 3:12: 'there is a redeemer nearer than I' turns 2:20's comfort into a legal queue; distinct beat with no approved fit.
- [ ] **OBEDIENT_DEPARTURE** (J04) — 'This time Jonah gets up and goes.'
- [ ] **ORACLE_PROCLAMATION** (J04) — 'he carries five words: forty more days and Nineveh is overthrown.'
- [ ] **PAGAN_WORSHIP** (J02) — "the pagan crew worships YHWH" — fear, sacrifice, vows.
- [ ] **PLAN_EXECUTION** (P09) — MM 2.1/3F-S1: Ruth 'does all her mother-in-law commanded' — the carrying-out of P08's plan; no approved arc token names execution of a prior plan.
- [ ] **PROVIDENTIAL_SWALLOWING** (J02) — "YHWH appoints a great fish to swallow the man" — rescue in the shape of judgment closes the arc.
- [ ] **PROVISION_BROUGHT_HOME** (P07) — MM arc: 'The passage moves from the field to home... carries it into town... hands her the food left over' — a day's gleaning brought home as provision; no approved arc token covers this.
- [ ] **PUBLIC_REDEMPTION_DECLARATION** (P12) — MM 2.1: 'Boaz turns... to the whole assembly and declares what he has done... you are witnesses today that I have bought...' — the public legal attestation that completes the redemption; no existing arc token covers a witnessed redemption declaration.
- [ ] **RECOMMISSION** (J04) — 'the word of YHWH comes a second time — the same charge.'
- [ ] **REDEEMER_RECOGNITION** (P07) — MM arc: 'Naomi blesses him by YHWH... and tells Ruth the man is near to them, one of their redeemers' — the redeemer-role recognized for the first time in the book; the central turn, with no approved token for it.
- [ ] **REDEMPTION_DECLINED** (P11) — MM Scene 3: the nearer redeemer reverses his claim and declines; no approved token for a declination.
- [ ] **REDEMPTION_OFFER** (P11) — MM Scene 2: the field-portion laid before the court with first right of redemption offered; no approved token for a redemption offer.
- [ ] **REFUSAL_OF_COMMISSION** (J01) — MM 2.4: 'a prophet who answers it with his heels' — the refusal is the burden of the pericope; no approved token captures a refused charge.
- [ ] **RESCUE_ATTEMPT_FAILS** (J02) — "the men dig their oars in to get back to the dry land — and they cannot."
- [ ] **RESCUE_DECLARED_FIRST** (J03) — Map 2.1/2.4: 'the rescue stated first' — the prayer tells its whole story in the first breath, I called/he answered, before walking the road.
- [ ] **ROYAL_DECREE** (J04) — 'his decree pushes the fast out to the herds and flocks and calls every man to turn.'
- [ ] **SALVATION_THESIS** (J03) — Map 2.1/2.4: 'The last word is the book's thesis... salvation belongs to YHWH.'
- [ ] **SECRECY_INJUNCTION** (P10) — MM 2.1/2.4: Boaz says the night's one rule out loud — 'let it not be known that the woman came to the floor'; the whole scene closes under this rule of secrecy. No approved arc_element names a concealment injunction (PROTECTIVE_INSTRUCTION is about safeguarding a person, not enjoining secrecy).
- [ ] **SELF_CONFESSION** (J02) — "his own mouth confesses the God he is fleeing."
- [ ] **SELF_SURRENDER_COUNSEL** (J02) — "his only counsel is 'hurl me in.'"
- [ ] **STAGED_DISCLOSURE** (P11) — MM 2.1/2.4: the disclosure deliberately staged — field first, Ruth second — the load-bearing shape of the passage.
- [ ] **STORM_STILLED** (J02) — "the storm stops dead" / "the sea stands still from its raging."
- [ ] **THANKSGIVING_VOW** (J03) — Map 2.1/Scene 4: 'the speaker will sacrifice with a voice of thanksgiving and pay what he vowed.'
- [ ] **UNANSWERED_QUESTION_CLOSE** (J05) — 2.1: 'No one answers. The book ends inside the question.'
- [ ] **WING_PETITION** (P09) — MM 3:9: 'spread your wing over your servant' — the kanaf marriage/protection petition closing the 2:12 image; no approved arc token covers this petition.
- [ ] **WITHDRAWAL_TO_WATCH** (J05) — 2.1: 'walks out east of the city to watch what will become of it.'
- [ ] **WITHHELD_MOTIVE_DISCLOSED** (J05) — 2.1: 'His prayer finally says what the story has withheld since the flight: this is why I ran.'

### Axis `scene_kind` — 30 declaration(s) · 29 unique value(s)

- [ ] **ANGRY_PRAYER_SCENE** (J05) — MM S1: Jonah burns and prays a furious, accusatory prayer asking to die (4:1-3); no approved scene_kind covers an angry complaint-prayer.
- [ ] **APPOINTMENT_SCENE** (J05) — MM S3 (4:6-8): YHWH-God appoints plant, worm, and wind in sequence — the book's quiet signature verb building the object lesson.
- [ ] **BIRTH_SCENE** (P13) — MM Scene 1 title 'The marriage, the gift, the birth' and 3F centers on the divine gift of conception and the birth of the son; no approved scene_kind covers a birth/gift resolution.
- [ ] **CLOSING_ARGUMENT_SCENE** (J05) — MM S4 (4:9-11): the sharpened question, Jonah's defiant answer, and YHWH's argument from plant to city left hanging — the book's open end.
- [ ] **COMMISSIONING_SCENE** (J04) — 'The word of YHWH comes to Jonah a second time: get up, go to Nineveh ... call to her' — a divine commissioning.
- [ ] **COMMISSION_SCENE** (J01) — MM Scene 1 / 3F: 'Gives the command that the rest of the pericope answers: the caller, the called, the city, and the reason' — a divine commissioning; no approved scene_kind fits.
- [ ] **CRISIS_DELIBERATION_SCENE** (J02) — "'Hurl me in' — and they row instead" — the crew weighs what to do as the sea rises, trying to spare him before throwing him.
- [ ] **DECREE_SCENE** (J04) — 'He has it proclaimed in Nineveh, by decree of the king and his nobles' — the royal edict.
- [ ] **DELIVERANCE_SCENE** (J03, J04)
  - J03: Scene 3 title/3F: 'Touches bottom so the lift can be measured... you brought my life up from the pit.'
  - J04: 'YHWH speaks to the fish, and it vomits Jonah out onto the dry land' — the rescue completed.
- [ ] **DISTRESS_RECOUNTING_SCENE** (J03) — Scene 2 recounts the casting into the deep and banishment answered by a face turned to the temple.
- [ ] **DIVINE_RELENTING_SCENE** (J04) — 'God relents of the evil he had said he would do to them, and he does not do it.'
- [ ] **EXPOSURE_AND_CONFESSION_SCENE** (J02) — "The lot finds him, and he confesses" — the lot exposes Jonah and his own mouth confesses YHWH.
- [ ] **FLIGHT_SCENE** (J01) — MM Scene 2 / 3F: 'Records the flight: the prophet's refusal, carried out as a journey the opposite way' — no approved scene_kind names a flight.
- [ ] **GATE_COURT_CONVENING_SCENE** (P11) — MM S1 title and 3F: the court convened in three sittings at the gate; no approved scene_kind covers a legal convening.
- [ ] **GENEALOGY_SCENE** (P14) — MM scene title "The generations of Perez" and genre GENEALOGY: the scene is a formal toledot list, a form with no approved scene_kind.
- [ ] **GLEANING_SCENE** (P07) — MM S1: 'Ruth gleans in the field until evening, beats out what she gathered, and it comes to about an ephah' — a narrated gleaning/work scene with no approved scene_kind fit.
- [ ] **HURLING_AND_WORSHIP_SCENE** (J02) — "Overboard: the sea stands still, and the men worship" — the prayer, the hurling, the calm, and the crew's worship in one scene.
- [ ] **NAMING_SCENE** (P13) — MM Scene 3 title 'The child on Naomi's lap; the naming' and 3F center on the communal naming of the child; no approved scene_kind covers a naming event.
- [ ] **NIGHT_APPROACH_SCENE** (P09) — MM 3F-S1: 'Executes the plan to the letter and sets the night's stage' — a wordless nighttime approach scene with no approved fit (MEAL_SCENE/INSTRUCTION_SCENE miss the staging focus).
- [ ] **PROCLAMATION_SCENE** (J04) — 'he cries out: forty more days, and Nineveh is overthrown' — a public oracle proclaimed in the city.
- [ ] **PROVISION_HOMECOMING_SCENE** (P07) — MM S2: 'Ruth lifts the grain and comes into the town. Her mother-in-law sees what she gleaned. Then Ruth brings out and gives her what she had left over' — bringing provision home; no approved fit.
- [ ] **REDEEMER_RECOGNITION_SCENE** (P07) — MM S3 3F: 'The turn of the passage: at the name Boaz, Naomi recognizes a redeemer' — a dialogue scene whose spine is the kinship-role recognition; no approved scene_kind fits.
- [ ] **REDEMPTION_DECLINE_SCENE** (P11) — MM S3: the second stage springs and the claim reverses into the decline that frees Boaz; no approved scene_kind for the declination.
- [ ] **REDEMPTION_OFFER_SCENE** (P11) — MM S2: the first stage — the field offered, the confident claim drawn; no approved scene_kind for a redemption offer.
- [ ] **REPENTANCE_SCENE** (J04) — 'The men of Nineveh believe God. They call a fast and put on sackcloth' — the city's turning enacted.
- [ ] **RESCUE_DECLARATION_SCENE** (J03) — Scene 1 title/3F: 'States the rescue before the road: the answered call is the headline.'
- [ ] **STORM_ONSET_SCENE** (J02) — "The storm hits, and the prophet sleeps" — YHWH hurls the wind, the storm rises, the crew responds while Jonah sleeps.
- [ ] **SWALLOWING_SCENE** (J02) — "The fish: swallowed, three days, and a prayer begins" — YHWH appoints the fish, it swallows Jonah, and the prayer begins.
- [ ] **WATCH_POST_SCENE** (J05) — MM S2 (4:4-5): God's question hangs unanswered while Jonah goes out, builds a booth, and sits to watch the city; no approved scene_kind fits.

### Axis `action` — 8 declaration(s) · 7 unique value(s) — **RULED, sitting B1 (Marcia 2026-06-12): all 7 ticked → promoted v0.12**

- [x] **AROSE** (J04, J04) — **RULED "approve as proposed" (B1 item 1) → promoted v0.12**
  - J04: 'Jonah gets up and goes' — the plain wayyaqom rising, no return sense.
  - J04: 'He rises from his throne' — same rising verb as P5.
- [x] **DONNED_SACKCLOTH** (J04) — 'covers himself with sackcloth.' **RULED tick (B1 item 3) → promoted v0.12**
- [x] **DREW_OFF_SANDAL** (P11) — MM P15/Scene 4: the redeemer 'draws off his sandal' as the attestation act; no approved action covers the sandal-drawing gesture, and HANDED is avoided because the MM marks the handing as not narrated. **RULED tick (B1 item 7) → promoted v0.12**
- [x] **LAY_DOWN** (P09) — MM P4: 'and lay down' — a lying-down action with no approved action-axis fit. **RULED tick (B1 item 6) → promoted v0.12**
  - ⚠ dual-axis (updated at B1): this `action` half is RULED + promoted v0.12; the `proposition_kind` LAY_DOWN proposal above (P09, P10) was **DEFERRED** by Marcia (B1 item 13) — rule it with its axis.
- [x] **REMOVED_ROBE** (J04) — 'puts off his robe.' **RULED "approve as proposed" (B1 item 2) → promoted v0.12**
- [x] **SAT_ON_ASHES** (J04) — 'and sits on the ashes.' **RULED tick (B1 item 4) → promoted v0.12**
- [x] **UNCOVERED_FEET** (P09) — MM P4 / CB_0042 margelot: 'uncovered the place of his feet' — the plan's central act; no approved action token covers uncovering. **RULED tick (B1 item 5) → promoted v0.12**

### Axis `tone_element` — 4 declaration(s) · 4 unique value(s) — **RULED, sitting B1 (Marcia 2026-06-12): all 4 ticked → promoted v0.12**

- [x] **HEATED** (J05) — 2.3: 'The chapter runs on heat. Jonah burns... the sun blazes, the east wind cuts dry.' No approved tone token names this governing heat/anger texture. **RULED tick (B1 item 8) → promoted v0.12**
- [x] **IRONIC** (J02) — "the irony rides on top of it ... the prophet of YHWH is fast asleep below while every pagan aboard is praying" — irony is named as the passage's pervasive tone, with no approved token for it. **RULED tick (B1 item 9) → promoted v0.12**
- [x] **PROCEDURAL** (P11) — MM 2.3: 'Brisk, public, and procedural — the opposite key from the night before'; the legal-transactional texture has no approved tone token. **RULED tick (B1 item 10) → promoted v0.12**
- [x] **WONDER_UNDERSTATED** (J04) — 'the wonder rides on how little resistance there is ... a quiet astonishment the narrator never names.' **RULED tick (B1 item 11) → promoted v0.12**

## Drafter remarks per pericope (verbatim, for context)

- **P07:** Mints declared: arc_element PROVISION_BROUGHT_HOME & REDEEMER_RECOGNITION; scene_kind GLEANING_SCENE, PROVISION_HOMECOMING_SCENE, REDEEMER_RECOGNITION_SCENE; role_in_scene_being DECEASED_KIN; proposition_kind THRESHED & MEASURED. All justified against MM substance with no approved fit. Key judgment flags for the reviewer: (1) S3 scene_kind — chose REDEEMER_RECOGNITION_SCENE over the approved BLESSING_SCENE because the MM frames recognition as the scene's spine; (2) the household dead (S3 entry5) given a proposed descriptive being_id THE_DEAD_HAMETIM since the map keeps the collective uncoded — B2/B4/B5 are also appended individually as REFERENCED; (3) S2 leftover assigned O10 (leftover roasted grain from 2:14, where FIG_0104 closes) — reviewer may want a distinct code; (4) S1 significant_absence left null (MM gives no block; did not invent); (5) referential_form values treated as free-form per the worked pair and not declared as axis mints — marked only where the MM's prose explicitly calls attention (S2/S3 B3, S3 B9/B13/B18/the-dead).
- **P09:** Register: pericope stays INFORMAL_CASUAL (NARRATIVE); S2/S3 INTIMATE and the 3:10 blessing CEREMONIAL encoded as overrides; v.13 oath deliberately left INTIMATE per the map. Mints declared: arc PLAN_EXECUTION/WING_PETITION/NEARER_REDEEMER_DISCLOSURE; scene_kind NIGHT_APPROACH_SCENE; role POTENTIAL_SUITORS; proposition_kind WENT_DOWN/LAY_DOWN/APPROACHED/TREMBLED/REASSURED; action UNCOVERED_FEET/LAY_DOWN — this floor scene's physical verbs are largely outside the Ruth-derived enumeration. Proposed registry IDs (reviewer's call): PL_END_OF_GRAIN_HEAP, TM_MIDDLE_OF_THE_NIGHT, TM_NIGHT_UNTIL_MORNING; the young men carried as B? (uncoded group). Two speech-act forcings flagged in-note: the kanaf petition (P9) and Boaz's blessing (P11) have no exact closed-list act — DIRECTS_HEARER_TO_DO and WISHES_FOR_HEARER chosen as nearest. S3 scene_kind set BLESSING_SCENE but the oath-sealing also runs there; flag if a combined kind is wanted.
- **P10:** Five mints flagged for review: arc_element SECRECY_INJUNCTION and EMPTYING_REVERSED; proposition_kind LAY_DOWN (P1), MEASURED_OUT (P5), SHOWED (P10). Reused SPOKE for P8/P9/P11 (question/report/reported-instruction) with distinguishing speech_acts to avoid further proposition_kind mints — reviewer may prefer dedicated kinds. Pericope-wide naming-down is the dominant register feature: every participant is given a marked unnamed referential_form (HA_ISHAH_THE_WOMAN, HA_ISH_THE_MAN, HER_MOTHER_IN_LAW_CHAMOT, MY_DAUGHTER_INTIMATE) per the MM's explicit 'no names at all' note. S1 scene_kind INSTRUCTION_SCENE has a real near-miss in DEPARTURE_SCENE. B3 appended to S1 as REFERENCED on the gap's hint (the gift's homeward aim).
- **P11:** Register: per the v0.16 genre-aware rule the NARRATIVE pericope stays INFORMAL_CASUAL; the MM's scene-level shift to FORMAL_OFFICIAL (S2-S4) and the v.7 moment-level drop back to the narrator's plain voice are encoded as overrides. Mints concentrate where the book's legal core has no precedent in the Ruth-derived enumerations: a cluster of arc_elements (gate convening, redemption offer, staged disclosure, decline, sandal attestation), the scene_kinds for the three new proceeding scenes, the queue/legal role tokens (NEARER_REDEEMER, WITNESSING_ELDERS, REDEMPTION_OFFEROR, SELLER, CONVENER, DECEASED_KINSMAN, DECEASED_HUSBAND), proposition_kinds PASSED_BY and DECLINED, the action DREW_OFF_SANDAL, and the tone PROCEDURAL (named verbatim by the MM). Two registry proposals (reviewer's call): PL_ELIMELECH_FIELD_PORTION for the field-portion, and TM_DAY_OF_PURCHASE for 'on the day you buy'. The dead husband is coded B? at both the being entry and in slots to preserve the MM's deliberate withholding of the name (he is Mahlon/B4, named at P12 4:10) — following the P01 B? precedent. referential_form mints are treated as free descriptive tokens (no closed axis in the digest); flag if your validator audits that axis.
- **P12:** Register: NARRATIVE pericope stays INFORMAL_CASUAL with two scene-level overrides (S1 FORMAL_OFFICIAL, S2 CEREMONIAL) per MM Section 1. Mints declared: arc_element (PUBLIC_REDEMPTION_DECLARATION, DEAD_NAME_RAISED, COMMUNITY_WITNESS_ATTESTATION); role_in_scene_being (WITNESSING_ELDERS, WITNESSING_ASSEMBLY, DECEASED_HOUSEHOLD_HEAD, DECEASED_WHOSE_NAME_RAISED); proposition_kind (ACQUIRED, NAME_RAISED, NAME_NOT_CUT_OFF). The redemption-purchase kind (ACQUIRED) is my best mint — if P11's compiled FOR_MODEL already introduced a REDEEMED/PURCHASED kind, reviewer should align P2/P3 to it. The 'the dead' entry is set B? (coreferential with Mahlon B4 per the MM gloss) to preserve the formulaic referent; reviewer may merge to B4. referential_form values are filled descriptively (registry form used for Ruth at the proceeding); these are not on a digest-enumerated axis, so not listed as vocabulary_additions, but flagged here for review.
- **P13:** Heavy mint load is concentrated in this closing pericope because the approved enumerations are largely tuned to the earlier Ruth scenes; all mints are map-anchored and declared. The newborn is kept uncoded as B? in S1/S2 and in all slots through P10 to preserve the MM's deliberate 'not yet named' absence, switching to B25 only at the naming (P11–P12). referential_form values (REDEEMER_GOEL, DAUGHTER_IN_LAW_WHO_LOVES_YOU) follow the gold's open descriptive-token convention and are not declared as enumeration mints. Two scene_kind choices (BIRTH_SCENE for S1, NAMING_SCENE for S3) and the GRANDMOTHER/TOWNSWOMEN/LINEAGE_REFERENT role mints are the items most worth reviewer attention.
- **P14:** P14 is a genealogy (genre GENEALOGY, genre_group NARRATIVE) with no speech, ceremony, or register shift, so register_overrides is null at both levels and INFORMAL_CASUAL stands throughout. Four mints proposed, all map-anchored: arc_elements GENEALOGICAL_DESCENT and LINE_ARRIVAL_AT_DAVID; scene_kind GENEALOGY_SCENE; role_in_scene_being LINE_TERMINUS (B26); proposition_kind GENEALOGY_HEADER (P1) and FATHERED (P2–P10). These reflect that the existing tagset was largely built on narrative-action pericopes and lacks genealogy vocabulary — the reviewer may wish to bless a small genealogy cluster. Two judgment calls flagged for review: (1) I chained the propositions with forward_link_to only; the genuine generative dependency (each begotten becomes the next begetter) could additionally justify caused_by on P3–P10 — I left it off to avoid over-marking a list, but it is defensible. (2) The Salmah/Salmon dual spelling is preserved both as B27 referential_form and as begetter/begotten_name_form slots in P6/P7; if downstream prefers a single locus, the slot-level forms are the more precise home. referential_form was treated as an open descriptive field (not in the bounded-axis digest), so no vocabulary_additions were attached to DUAL_SPELLING_SALMAH_AND_SALMON.
- **J01:** Register: encoded the v.2 ELDER_AUTHORITY shift at moment-level (the MM prose calls it 'scene-level' but localizes it to the command while the narrator stays casual) — flagged for the reviewer. Mints declared: arc_element x3 (DIVINE_COMMISSION, REFUSAL_OF_COMMISSION, FLIGHT_FROM_PRESENCE); role_in_scene_being x4 (COMMISSIONED_PROPHET, PATRONYMIC_REFERENT, FLEEING_PROPHET, SHIP_CREW); scene_kind x2 (COMMISSION_SCENE, FLIGHT_SCENE); proposition_kind x4 (DIVINE_WORD_CAME, FLED, WENT_DOWN, EMBARKED). The Jonah cast/geography forced more mints than a Ruth pericope because the approved enumerations are Ruth-derived; all are map-anchored. book_context_ref minted by analogy (jonah_pilot_BCD_v0_3) — reviewer to confirm. B5 (people of Nineveh) given approved TOWNSPEOPLE; consider a dedicated indicted-populace role if the reviewer prefers.
- **J02:** This is a Jonah pericope; the approved bounded-open lists are heavily Ruth-shaped, so the storm narrative required substantial declared mints on arc_element (10), tone_element (IRONIC), role_in_scene_being (CREW, SHIP_CAPTAIN, FUGITIVE, APPOINTED_CREATURE), scene_kind (5), and proposition_kind (HURLED, STORM_AROSE, FEARED, WENT_DOWN, APPROACHED, PROPOSED, CAST_LOTS, INTERROGATED, CONFESSED, ASKED, ANSWERED, ROWED, SEA_STILLED, WORSHIPED, APPOINTED, SWALLOWED, PRAYED). Where an approved value genuinely fit I reused it (DIVINE_AGENT; INSTRUCTION, DECLARED, PERCEIVED, APPEAL on proposition_kind; DIRECTED/VOWED on the action axis; the SPEECH_ACT closed list throughout). Re-declared values (CREW, FUGITIVE, HURLED, FEARED) appear in each fill they occur in per the strict declare-every-mint rule. book_context_ref is a best-guess Jonah analogue and needs the reviewer's canonical ref. Referential_form was marked only where the MM's own prose flags the naming (the hammalachim→ha'anashim shift, 'the chief of the sailors', 'sleeper', self-named 'a Hebrew', 'this man' in the prayer) and left null elsewhere. The English/Hebrew versification note (Eng 1:17–2:1 = Heb 2:1–2) is honored via the MM's English anchors. Significant_absence blocks were left as the deterministic skeleton carried them — they are load-bearing (Jonah's prayerlessness, the unspoken 'prophet', no word of sin, no rescue announced).
- **J03:** Genre group is POETIC_SUNG (PRAYER), so the pericope register stays RELIGIOUS_WORSHIP and the map explicitly disclaims any scene/moment register shift — register_overrides null on both levels. The approved L2 lists are heavily Ruth-shaped; a thanksgiving psalm from the deep required several declared mints on arc_element, scene_kind, role_in_scene_being, and proposition_kind (all justified from the map's own prose). YHWH is mapped to DIVINE_AGENT throughout and Jonah to a minted SUPPLIANT (VOWER in the vow scene). The whole pericope is recounted speech, so each proposition carries a speech_act marking the recounting voice (STATES_AS_TRUE, with STATES_LAMENT_OBSERVATION at P5 and VOWS at P13). FIG_0202's temple-turn pair is encoded as paired_with between P6 and P11. book_context_ref guessed as jonah_pilot_BCD_v0_3 — reviewer to confirm the canonical Jonah BCD ref.
- **J04:** Genre_group NARRATIVE → pericope register INFORMAL_CASUAL held; the three FORMAL_OFFICIAL/ELDER_AUTHORITY lifts are carried as moment-level overrides (3:2, 3:4, 3:7-9), matching the map's tagging. Heavy minting was unavoidable: the approved L2 enumerations are almost entirely Ruth-derived and offered no fit for Jonah's deliverance/recommission/proclamation/repentance/decree/relenting movement. Declared mints: arc_elements (7), tone WONDER_UNDERSTATED, scene_kinds (DELIVERANCE/COMMISSIONING/PROCLAMATION/REPENTANCE/DECREE/DIVINE_RELENTING_SCENE), roles (PROPHET, CREATURE_AGENT, KING, NOBLES, LIVESTOCK), proposition_kinds (VOMITED, WORD_OF_YHWH_CAME, BELIEVED, FASTED, RELENTED), and actions (AROSE, REMOVED_ROBE, DONNED_SACKCLOTH, SAT_ON_ASHES). Two referential-form judgment calls flagged for review: (a) UNNAMED_KING at S5 (the king's anonymity is in significant_absence; I also marked it as a referential form on the Ruth-unnamed-kinsman precedent — drop if the reviewer prefers); (b) the Elohim-vs-YHWH alternation marked as ELOHIM_NOT_YHWH on every B9 entry the map's prose calls attention to, since it is theologically load-bearing in Jonah. The S4 beings append gap hinted B2, but scene-4 prose names only B5 and B9 (already listed) — I appended nothing; please confirm. book_context_ref set to jonah_pilot_BCD_v0_3 by analogy — canonical ref is the reviewer's call.
- **J05:** This pericope is Jonah, not Ruth, so the bounded-open axes (which the digest populates almost entirely from Ruth) required several declared mints: arc_elements (9), one tone_element (HEATED), four scene_kinds, six role_in_scene tokens, and nine proposition_kinds (APPOINTED, QUESTIONED, STRUCK reused across multiple props; each declared at first occurrence). All mints are anchored to MM prose. Two judgment flags for the reviewer: (1) speech-act choices for the two pleas-to-YHWH (P5 DIRECTS_HEARER_TO_DO, P20 ASKS_RHETORICAL_QUESTION_AS_PROTEST) are nearest-fit from the closed 26 but neither is a clean match for a petition/self-justifying divine question; (2) P10 reuses ROSE for a plant's growth, a mild semantic stretch. Marked divine-name shifts (YHWH-Elohim doubled at 4:6, Elohim→YHWH across 4:9-11) are preserved both on being entries and in proposition slots. The closing question is left structurally open (UNANSWERED_QUESTION_CLOSE / UNRESOLVED_AT_CLOSE); the significant_absence blocks carry the unanswered-question constraint forward. book_context_ref is a best guess pending the canonical Jonah BCD slug.


## C — Registry proposals (L3; each needs a BCD note + aliases rebuild on approval) — **ALL RULED + APPLIED (Marcia, 2026-06-12; aliases 0.1.5→0.1.6, both trees)**

- [x] **PL_END_OF_GRAIN_HEAP** (P09 S1) — "at the end of the grain heap" (3:7); proposed place. **RULED mint → bcd/places/PL_END_OF_GRAIN_HEAP-End-of-the-Grain-Heap.md, span [P09], P09 map 3B wikilinked (both trees).**
- [x] **TM_MIDDLE_OF_THE_NIGHT** (P09 S2) — "at half of the night" (3:8). **RULED mint → bcd/times note, span [P09], P09 map 3D wikilinked.**
- [x] **TM_NIGHT_UNTIL_MORNING** (P09 S3) — "the night … in the morning" (3:13). **RULED mint DISTINCT (Marcia: "my map wrote them as two") → bcd/times note, span [P09], P09 map 3D wikilinked.**
  - resolved: NOT a reuse of A-1's `TM_NIGHT_TO_MORNING`. Marcia's map distinguishes them — this is the PROSPECTIVE protocol-frame at 3:13 (הַלַּיְלָה … בַבֹּקֶר); TM_NIGHT_TO_MORNING is the ENACTED span at 3:14 (עַד־הַבֹּקֶר … בְּטֶרֶם). Two Hebrew surfaces, two referents.
- [x] **PL5_ELIMELECH_PORTION** (P11 S2) — "the portion of the field of our brother Elimelech" (4:3). **RULED mint, RENAMED from PL_ELIMELECH_FIELD_PORTION to match the PL5_BOAZ_PORTION pattern → bcd/places note, span [P11], P11 map 3B wikilinked, P11 FM ×2 renamed (amendments.json).**
- [x] **TM_DAY_OF_PURCHASE** (P11 S3) — "on the day you buy" (4:5). **RULED mint (Marcia: "the TM_TODAY overlap isn't real") → bcd/times note, span [P11], P11 map 3D wikilinked.**
- [x] **O10** (P07 S2) appears in the FM but not the map's 3C — id-check FM-not-map. **RULED CONFIRM → O10 added to P07 map 3C (both trees, the 2:18 leftover = the 2:14 roasted grain); O10 registry span extended P06→[P06, P07].**
- **Rider (Marcia, Tier A): two drifted spans corrected** — PL6 Threshing Floor [P08,P10]→**[P08,P09,P10]** (P09 was the threshing-floor night, unbuilt when the note was written); TM_TODAY [P07,P11,P12]→**[P07,P10,P12]** (drop P11 — its 4:5 anchor is now TM_DAY_OF_PURCHASE; add P10 — 3:18 "finished the matter today"). aliases rebuild diff = exactly +5 codes & these 3 span changes.

## D — Undeclared mints the audit caught (drafter contract misses; rule the value anyway)

- [x] **TOOK** as `action` (P07 P4 component) — used without declaration; plausible action-axis value. **RULED tick (sitting B1 item 12, Marcia 2026-06-12) → promoted v0.12 with the undeclared use recorded in the P07 ruling log.**
- [x] **ASKED** as `proposition_kind` (P09 P7) — an axis-crossing. **RESOLVED in the proposition_kind Group A sitting (Marcia 2026-06-13): ASKED promoted dual-axis to proposition_kind v0.13 — the one promotion (J02 + P09) closes this §D-deferred P09 use. No FM amendment needed; the P09 FM's `ASKED` is now an approved value.**

## E — Mechanical conformance amendments already applied (confirm or overrule) — **BOTH CONFIRMED (Marcia, 2026-06-12)**

1. **P07:** drafter's `THE_DEAD_HAMETIM` → **`B?`** (schema's withheld-referent marker; the
   drafter's note preserved in fills.json). Interacts with A-4. **CONFIRMED — the procedure was right; the live FM now reads `B2` per the A-4 disclosure ruling that superseded this spot (surface `HAMETIM_THE_DEAD` preserved).**
2. **J01:** the drafter put `ELDER_AUTHORITY` (a legitimate REGISTER value, YHWH's command at 1:2)
   in the `framing_override` key; moved to **`override_value`** — the model's judgment preserved,
   only the key corrected. **CONFIRMED — live FM clean.**

## F — Gate summary at close (per final run)

VALID: P07(amended) · P09 · P12 · P13 · P14 · J01(amended) · J02 · J03 · J04 · J05 — 10/12.
INVALID pending A-1/A-2: P10 · P11. Lint 12/12 clean · coverage 100% explicit, 0 unanchored,
all 12 · id-check clean modulo C (proposals) and `B?` INFOs. Closed lists: 0 violations across
all 15 paid Phase-C/D calls. J03 (the psalm): POETIC_SUNG · PRAYER · RELIGIOUS_WORSHIP — the
v0.16 genre-aware rule applied by the model unprompted.
