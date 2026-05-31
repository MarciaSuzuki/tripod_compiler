# SC-0013 — P02–P06 §3C relocation audit (corrective second pass)

> The artifact that proves **relocate, never delete**. One table per pericope: every item removed from
> §3C `objects_in_scene` → its destination, **verified present** at that destination. Calibrated to the
> blessed P01 (`pericopes/P01-Ruth-1-1-5.md`). Destinations use each artifact's own proposition numbering
> (the FOR_MODEL `P#`; the map's `Proposition #` aligns 1:1 for P03–P06, and combines hearing+provision at
> P02 Prop 1 = FOR_MODEL P1+P2).
>
> Legend — destination kinds: **prop** = a Level-3 proposition (the event); **ref** = a being's
> `referential_form` (how a participant is named); **place** = a registered `PL_` place; **fig** = a figure
> (`FIG_`); **kept** = retained as a true §3C entity.
>
> Gate snapshot at hand-off: `validate` 6/6 · `coverage --corpus` 6/6 block-clean (245/245, 0 unanchored) ·
> `lint --corpus` 14 (0 tier-1) · `gold-diff` agreement unchanged (P01 100 · P02 90 · P03 100 · P04 95 ·
> P05 98 · P06 96) · `check-drift` clean · 89 tests green.

---

## P02 — Ruth 1:6–14

**Kept (§3C entities):** bread `CB_0012` (S1); hesed `CB_0011`, blessing `CB_0008`, rest/menucha `CB_0014` (S2).

| Removed §3C item | Scene | Destination | Kind | Verified |
|---|---|---|---|---|
| YHWH's visiting (paqad) | S1 | P2 `VISITED_AND_PROVIDED` (cb `CB_0016`) | prop | ✓ |
| news-hearing | S1 | P1 `HEARD_REPORT` | prop | ✓ |
| arising-and-going-out | S1 | P3 `RETURNED_FROM_FOREIGN_RESIDENCE` | prop | ✓ |
| the return road (locus) | S1 | P3 `WALKED_ON_RETURN_ROAD` | prop | ✓ |
| daughters-in-law naming (kallah) | S1 | B8/B9 `referential_form: KALLAH_DAUGHTER_IN_LAW` (cb `CB_0017`) | ref | ✓ (added) |
| directive to go back | S2 | P4 `SPOKE_DIRECTIVE_TO_RETURN` | prop | ✓ |
| mother's-house destination | S2 | place `PL_EACH_HER_MOTHERS_HOUSE` (cb `CB_0013`) | place | ✓ |
| grounding in prior hesed | S2 | P5 `prior_hesed_targets [B2,B4,B5,B3]` | prop | ✓ |
| Naomi's kiss | S2 | P7 `KISSED_AND_WEPT_FAREWELL` | prop | ✓ |
| first weeping | S2 | P7 `WEPT_ALOUD` | prop | ✓ |
| refusal-with-counter | S2 | P8 `REFUSED_WITH_COUNTER_DECLARATION` | prop | ✓ |
| repeated turn-back directive | S3 | P9 / P10 `REPEATED_DIRECTIVE` | prop | ✓ |
| womb dissuasion-question | S3 | P9 (`SONS_IN_NAOMIS_WOMB`) | prop | ✓ |
| personal-impossibility statement | S3 | P10 `STATED_PERSONAL_IMPOSSIBILITY` | prop | ✓ |
| hypothetical husband-tonight + imagined sons | S3 | P10 `GRANTED_HYPOTHETICAL_CONCESSION` | prop | ✓ |
| twin waiting/restraining questions | S3 | P11 (`WAITING…` / `RESTRAINING…`) | prop | ✓ |
| bitterness comparison | S3 | P12 `STATED_BITTERNESS_COMPARISON` | prop | ✓ |
| hand-of-YHWH attribution | S3 | P12 `ASCRIBED_BITTERNESS_TO_YHWH` (cb `CB_0015`) | prop | ✓ |
| second weeping | S3 | P13 `WEPT_AGAIN` | prop | ✓ |
| Orpah's farewell kiss | S3 | P14 `KISSED_AND_DEPARTED` | prop | ✓ |
| Ruth's clinging (davqah) | S3 | P15 `CLUNG_TO` (cb `CB_0018`; `FIG_0012`) | prop+fig | ✓ |

---

## P03 — Ruth 1:15–18  ·  §3C "None" (confirmed correct — no persistent objects)

| Removed §3C item | Scene | Destination | Kind | Verified |
|---|---|---|---|---|
| presentational opener (hinneh) | S1 | P1 `SPOKE_DISSUASIVE_APPEAL_WITH_EXEMPLAR` | prop | ✓ |
| Orpah's return to her people and her gods | S1 | P1 `STATED_EXEMPLAR_RETURN` | prop | ✓ |
| directive to follow the exemplar | S1 | P1 `DIRECTED_HEARER_TO_FOLLOW_EXEMPLAR` (cb `CB_0019` levirate, `CB_0004`) | prop | ✓ |
| sister-in-law naming (yebimtekh) | S1 | B8 `referential_form: KINSHIP_FORM_YEBIMTEKH` | ref | ✓ |
| the return road (locus) | S1/S2/S3 | journey continued (P02) | — | ✓ |
| refusal opening the vow | S2 | P2 `REFUSED_DIRECTIVE_AS_OPENING_OF_VOW` | prop | ✓ |
| indefinite-place form (4 bindings) | S2 | P3 `binding_indefinite_place_form` | prop | ✓ |
| **the six vow bindings** (path, lodging, people, god, death-place, burial-place) | S2 | P3 `vow_components[0..5]` | prop | ✓ |
| people-and-god pairing | S2 | P3 (cb `CB_0021`; `FIG_0072`, `FIG_0074`) | fig | ✓ |
| self-curse oath + death-only conditional | S2 | P4 `SEALED_VOW_WITH_SELF_CURSE_OATH` (cb `CB_0020`; `FIG_0075`) | prop+fig | ✓ |
| Ruth's determined resolve | S3 | P5 `SAW_DETERMINED_RESOLVE` | prop | ✓ |
| Naomi ceasing to speak | S3 | P5 `CEASED_SPEAKING` | prop | ✓ |

---

## P04 — Ruth 1:19–22

**Kept (§3C entity):** barley-harvest `CB_0026` (S3).

| Removed §3C item | Scene | Destination | Kind | Verified |
|---|---|---|---|---|
| Bethlehem "house of bread" naming | S1 | `FIG_0013` (active P1/P2) | fig | ✓ |
| arrival | S1 | P1 `WALKING_AND_ARRIVAL` | prop | ✓ |
| communal stirring of the city | S1 | P2 `COMMUNAL_STIRRING_AT_ARRIVAL` | prop | ✓ |
| women's recognition-question | S1 | P3 `ASKED_RHETORICAL_RECOGNITION_QUESTION` | prop | ✓ |
| refusal of her own name | S2 | P4 `REFUSED_USE_OF_OWN_NAME` | prop | ✓ |
| proposed renaming to Mara | S2 | P4 `PROPOSED_NEW_NAME` + B3 `referential_form` (cb `CB_0023`; `FIG_0082`) | prop+ref+fig | ✓ |
| Mara/hemar root-pun | S2 | `FIG_0083` | fig | ✓ |
| bittering ascription to Shaddai | S2 | P4 (`FIG_0006` Shaddai-name) | prop+fig | ✓ |
| "I went out full" + riqam "empty" | S2 | P5 `STATED_FULL_EMPTY_ANTITHESIS` (cb `CB_0024`,`CB_0044`; `FIG_0084`) | prop+fig | ✓ |
| rhetorical protest-question | S2 | P5 `ASKED_RHETORICAL_QUESTION_AS_PROTEST` | prop | ✓ |
| anah-bi courtroom testimony | S2 | P5 `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` (cb `CB_0025`) | prop | ✓ |
| Shaddai-did-evil harm | S2 | P5 (`FIG_0086`) | prop+fig | ✓ |
| **doubled-divine-name pattern (YHWH×2/Shaddai×2)** | S2 | **PENDING — no figure of its own** (see §STOP below) | fig? | ⚠ |
| narrator return-summary | S3 | P6 `RETURNED` | prop | ✓ |
| "Ruth the Moabitess" epithet | S3 | B9 `referential_form` (`FIG_0001`; cb `CB_0004`) | ref | ✓ |
| daughter-in-law (kallatah) naming | S3 | B9 `referential_form` (cb `CB_0017`) | ref | ✓ (added) |
| arrival at the harvest-opening | S3 | P6 `ARRIVED_AT` (`TM_BARLEY_HARVEST_BEGINNING`) | prop | ✓ |

**⚠ STOP — surfaced for the lead.** The first pass deleted `TH_DOUBLED_DIVINE_NAME_LAMENT_PATTERN` (the object
**and** the `doubled_divine_name_pattern_form` slot on P5). The four divine-name invocations **survive
individually** (Shaddai → `FIG_0006`; YHWH-brought-empty + YHWH-testified → P5 slots + `CB_0025`), but the
**doubling as a literary pattern has no figure**. Per your ruling, a `FIG` is **proposed, not added** —
see the hand-off. The artifacts mark this item PENDING in S2's relocation note.

---

## P05 — Ruth 2:1–7

**Kept (§3C entities):** chayil `CB_0032` (S1); favor `CB_0033`, gleaning `CB_0034` (S2); providence/miqreh
`CB_0035`, blessing `CB_0008` (S3); the within-day "from morning until now" duration (S4, per the P01
`TM_TEN_YEARS` content-duration precedent — restored because the S4 `times_in_scene` note still pointed at it).

| Removed §3C item | Scene | Destination | Kind | Verified |
|---|---|---|---|---|
| kinship-anchor through Naomi's late husband | S1 | P1 `POSITIONED_THROUGH_KINSHIP_ANCHOR` | prop | ✓ |
| clan-of-Elimelech locator | S1 | P1 `PLACED_IN_LEGAL_RELATIONAL_KIN_GROUP` | prop | ✓ |
| delayed naming "Boaz" | S1 | P1 `NAMED_AT_END_OF_INTRODUCTION` | prop | ✓ |
| Ruth's request | S2 | P2 `REQUESTED_PERMISSION_TO_GLEAN` | prop | ✓ |
| Naomi's granting ("my daughter") | S2 | P3 `GRANTED_PERMISSION_TO_GLEAN` | prop | ✓ |
| went-came-gleaned sequence | S3 | P4 `WENT_AND_GLEANED_BEHIND_HARVESTERS` | prop | ✓ |
| gleaning position behind harvesters | S3 | P4 `gleaning_position_relation` | prop | ✓ |
| clan-frame restated at chance-arrival | S3 | P5 `clan_referent_restated B29` | prop | ✓ |
| "behold" Boaz from Bethlehem | S3 | P6 `ARRIVED_AT_FIELD_FROM_HOMETOWN` | prop | ✓ |
| Boaz's belonging-question | S4 | P8 `ASKED_KINSHIP_AND_SOCIAL_COVER_QUESTION` | prop | ✓ |
| foreman-role naming (nitsav al haqotsrim) | S4 | B15 `referential_form: NAAR_NITSAV_AL_HAQOTSRIM…` (cb `CB_0036`) | ref | ✓ |
| third-party Moabite epithet | S4 | B9 `referential_form: NAARA_MOABIYAH_THIRD_PARTY_EPITHET` (cb `CB_0004`) | ref | ✓ (added) |
| return-with-Naomi identification | S4 | P9 `IDENTIFIED_BY_RETURN_WITH_KINSHIP_ANCHOR` | prop | ✓ |
| quoted prior gleaning-request | S4 | P9 `REPORTED_PRIOR_REQUEST_QUOTED_SPEECH` | prop | ✓ |
| work-pattern persistence | S4 | P9 `REPORTED_WORK_PATTERN_PERSISTENCE` | prop | ✓ |
| disputed shelter-rest | S4 | P9 `REPORTED_DISPUTED_SHELTER_REST` | prop | ✓ |

---

## P06 — Ruth 2:8–16

**Kept (§3C entities):** gleaning `CB_0034` (S1 & S4); favor `CB_0033`, foreigner/nokhriya `CB_0038`,
wing-of-refuge/kanaph `CB_0037`, blessing `CB_0008` (S2); bread `CB_0012`, vinegar `O9`, roasted-grain `O10`
(S3); sheaves/bundles `O11` (S4). **Note:** the map retained all of these as §3C entities; the FOR_MODEL
had them only as cb_flags in S1/S2/S4 — the FOR_MODEL was **additively aligned to the map** (the one place
this pass touched P06's keeper set; see hand-off).

| Removed §3C item | Scene | Destination | Kind | Verified |
|---|---|---|---|---|
| opening "have you not heard" question | S1 | P1 | prop | ✓ |
| "my daughter" address | S1 | P1 `address_form` | prop | ✓ |
| stay-close (dabaq) directive | S1 | P1 / P2 `DIRECTED_GLEANER_TO_STAY_CLOSE…` | prop | ✓ |
| reported prior touch-prohibition | S1 | P3 `REPORTED_OWN_PRIOR_PROHIBITION` (`FIG_0105`) | prop+fig | ✓ |
| water-vessels provision | S1 | P4 `SPOKE_WATER_PROVISION_INSTRUCTION` | prop | ✓ |
| deep bow | S2 | P5 `BOWED_DEEP_TO_GROUND` | prop | ✓ |
| "favor in your eyes" question | S2 | P6 (`FIG_0018`) | prop+fig | ✓ |
| recognition (nakar) question | S2 | P6 | prop | ✓ |
| self-designation as foreigner | S2 | P6 `STATED_SELF_AS_FOREIGNER` | prop | ✓ |
| full-knowledge recital | S2 | P7 (`FIG_0100`) | prop+fig | ✓ |
| leaving the land of her birth (Moab unnamed) | S2 | P8 `STATED_RUTH_LEFT_LAND_OF_HER_BIRTH` | prop | ✓ |
| "a people unknown before" idiom | S2 | P8 `STATED_COMING_TO_UNKNOWN_PEOPLE` | prop | ✓ |
| wish that YHWH repay her | S2 | P9 `WISHED_YHWH_TO_REPAY_HER_WORK` | prop | ✓ |
| full-wages wish | S2 | P9 `WISHED_FULL_WAGES_FROM_YHWH…` | prop | ✓ |
| formal blessing utterance (v.12) | S2 | P9 `PRONOUNCED_FORMAL_BLESSING…` (`FIG_0011`) | prop+fig | ✓ |
| "my lord" deferential address | S2 | P10 `address_form` | prop | ✓ |
| heart-reaching speech (dibber al lev) | S2 | P11 `STATED_THAT_HE_COMFORTED_HER` | prop | ✓ |
| shifchah self-naming | S2 | P11 `…SPOKE_TO_HEART_OF_HIS_SHIFCHAH` (`FIG_0132`) | prop+fig | ✓ |
| "not as one of your maidservants" | S2 | P11 `STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT` | prop | ✓ |
| seat beside the harvesters | S3 | P13 `SAT_BESIDE_HARVESTERS` | prop | ✓ |
| ate-then-satisfied-then-had-leftover sequence | S3 | P15 `ATE_WAS_SATISFIED_AND_HAD_LEFTOVER` (`FIG_0104`) | prop+fig | ✓ |
| permission to glean among sheaves | S4 | P17 `PERMITTED_GLEANING_AMONG_SHEAVES` (`FIG_0106`) | prop+fig | ✓ |
| don't-shame-her prohibition | S4 | P17 `DIRECTED_HARVESTERS_NOT_TO_SHAME_HER` | prop | ✓ |
| deliberate-pulling command | S4 | P18 `COMMANDED_DELIBERATE_PULLING…` (`FIG_0101`) | prop+fig | ✓ |
| leave-them-for-her command | S4 | P19 `DIRECTED_HARVESTERS_TO_LEAVE_THEM_FOR_HER` | prop | ✓ |
| don't-rebuke-her prohibition | S4 | P19 `DIRECTED_HARVESTERS_NOT_TO_REBUKE_HER` (`FIG_0107`) | prop+fig | ✓ |

---

## Deleted-slot verification (defect #3)

Every `*_form` proposition slot the first pass deleted was re-checked: each was a **grammatical-pattern label**
(`TH_*_FORM` / `_VERB` / `_FORMULA` / `_PAIR` / `_PARTICIPLE`) whose **event survives** in the proposition's
`proposition_kind` + components (and, where applicable, its cb/figure flags). No event or load-bearing content
was lost to a slot deletion. The one case where bare slots had dropped *content* — P05's within-day duration,
referenced by an orphaned `times_in_scene` note — is **restored** (above), not left dangling.

## §4 Q&A dialogue residuals — for the lead's exegetical pass (NOT decided here)

`tripod lint --corpus` surfaces 14 tier-2 findings, all in meaning-map §4 Q&A **answers** — the dialogue
re-atomizing the discipline reserves for you. Each is surfaced with a **proposed** atomization (yours to rule):

| Pericope | §4 answer (as written) | Proposed atomization (for your ruling) |
|---|---|---|
| P02 | "arising **and** going out" | split → `arising` · `going out` (two acts) |
| P02 | "each in the house of her husband **(distributive; hypothetical)**" | keep payload `in the house of her husband`; move "distributive/hypothetical" to conditioning |
| P03 | "her people **and** her gods **(Moabite collective; Moabite deities)**" | split → `her people` · `her gods`; drop the parenthetical gloss |
| P03 | "may YHWH do thus to me **and** worse" | keep as one oath formula, **or** split `do thus to me` · `and worse` — exegetical |
| P04 | "walking **and** arrival" | split → `walking` · `arrival` |
| P04 | ""until they came" **(verb-phrase closing the road)**" | keep payload `until they came`; drop the "verb-phrase" gloss (R4) |
| P04 | ""and YHWH brought me back empty" **(state at return; YHWH as agent)**" | keep `YHWH brought me back empty`; drop "(state…; YHWH as agent)" gloss (R4 "agent") |
| P05 | "narrator pauses the storyline**;** introduces Boaz" | split → `narrator pauses the storyline` · `introduces Boaz` |
| P05 | "to go to the field **and** glean among the ears of grain" | split → `go to the field` · `glean among the ears of grain` |
| P05 | "three-**verb** arrival-and-gleaning chain (went, came, gleaned)" | replace label with the atoms `went` · `came` · `gleaned` (R4 "verb") |
| P05 | "vayyiqer miqreha — double-cognate chance-providence construction; **agent** withheld" | keep `her chance chanced upon…`; the chance-construction is conditioning (CB_0035/FIG_0015); drop "agent" (R4) |
| P06 | "glean in another field**;** pass on from this one" | split → `glean in another field` · `pass on from this one` |
| P06 | "go to the vessels **and** drink from what the young men draw" | split → `go to the vessels` · `drink from what the young men draw` |

*(13 rows; the lint reports 14 because P04's "and YHWH brought me back empty" trips both the `;`/compound and
the `agent`/vocabulary rules on the same answer.)*
