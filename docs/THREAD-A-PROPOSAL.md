# Thread A — nested `action` / `speech_act` collapse (SC-0024) + the survival table

> **Status: PROPOSAL with Marcia's rulings folded in (2026-06-04, Architect-8).** The §3 decisions
> are ruled; what remains open is the small §6 sub-decisions. No artifact/spec edits until those
> are confirmed. Build order after: edit FOR_MODELs/maps → enforce `speech_act` in compiler → gate
> board → PR (Marcia merges).
>
> **The §5 survival table is the proof artifact.** Marcia's rule: because `action` is free text, the
> gates cannot verify these collapses — so "gates green" is *not* proof. The proof is naming, per
> value, the surviving home (a sibling slot value, or a map §4 Q&A line) where the dropped detail
> lives. **Any candidate with no nameable home is not clean — it is a held value.** The clean set is
> *defined* by this table, not assumed.

## 0. What this is
The SC-0021/0022 triage cleaned the top-level bounded-open slots; it never reached the nested
`action`/`speech_act` inside the proposition `*_components` arrays. Thread A is that collapse.
**REDUCE, not promote:** strip each over-specific value to its bare reusable type and let the gloss
fall away *because it survives elsewhere structured*. Do not mint new values.

## 1. The two slots differ in kind (governs the SC)
| slot | nature | layer | change on collapse |
|---|---|---|---|
| `speech_act` | illocutionary force | **L1 closed list** (`validation-rules.json` → `SPEECH_ACT`, 31) | **governed closed-list edit** (SC-0014 pattern) |
| `action` | per-component verb | **uncontrolled free text** | **content edit only** (no enum/gate) |

The *only* governed L1 change in SC-0024 is the vow `speech_act` (§2/§3). The entire `action` sweep
(§5) is content editing — which is exactly why it needs the by-eye survival table, not gate-green.

## 2. Flagship — the P03 vow (PROVEN, RULED APPROVED)
P03 prop P3 (`VOW`, 1:16b–17a), 6-component ladder. Every dropped binding-domain survives in four
homes: `vow_structural_form: SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL`; per-component
siblings (`binding_indefinite_place_form`, `matched_action_form`, `nominal_equation_half`,
`binding_domain`, `list_position`); map §4 Prop 3 ("First binding? where you go I will go (path)" …
"Sixth? and there I will be buried (burial-place)"); figures FIG_0072/FIG_0074 + CB_0021.

`action` ×6 `VOWED_*_BINDING` → **`VOWED`**. `speech_act` ×6 `VOWS_*_BINDING` → **`VOWS`**. All
`VOWS_*_BINDING` used once, only here → migration contained to P03.

## 3. Rulings folded in (Marcia, 2026-06-04)
- **Vow collapse — APPROVED** (both slots; closed list 31 → 26).
- **`speech_act` suffix-variants — KEEP** (`ASKS_RHETORICAL_QUESTION_AS_DISSUASION`/`_OF_SURPRISED_
  RECOGNITION`/`_AS_PROTEST`; `DIRECTS_HEARER_TO_RETURN`; `REPORTS_PRIOR_*`; `STATES_HOPED_FOR_
  CONDITION`/`STATES_LAMENT_OBSERVATION`). Reason (Marcia): the vow's six are the *same* act (vowing)
  differing only by domain → collapse; the rhetorical-question trio are *different* acts under a
  similar prefix → keep. The suffix there **is** the illocutionary force, the signal the layer exists
  to feed. (So §3 is the inverse of §2, correctly told apart.)
- **Held loaded set — HOLD, route to Thread B/C** (§5c).
- **Names:** `SAW_DETERMINED_RESOLVE → SAW` approved. `RETURNED_BLESSING_WITH_DIVINE_INVOCATION` →
  reduce to `BLESSED` **only if** a home for the divine invocation exists — it does
  (`invoked_divine_agent = B10`), so `BLESSED`.
- **`action`-as-controlled-slot — DEFERRED but ESCALATED** to a named follow-on SC (§7), not a loose
  note: the reduction only *holds* once `action` is enforced against this verb set, else P07–P14
  re-dirty it.

## 4. `speech_act` closed-list delta
Remove the 6 `VOWS_*_BINDING`; add bare `VOWS`. `SPEECH_ACT` 31 → 26. `validation-rules.json`
`v0.10 → v0.11`, re-pin. Migration: P03 only. (4 unused pre-declared values left as-is.)

## 5. The `action` survival table (proof artifact)
**Home type:** `SIB` = a sibling slot in the same FM component holds the dropped detail (strong —
detail stays structured in the FM). `MAP` = the only structured home is the paired map's §4 Q&A
(weaker — the detail leaves the FM and lives in the prose half of the training pair). Both satisfy
the rule; the `MAP`-only rows are flagged for D1 (§6).

### 5a. KEEP — already a bare verb (no change)
`ARRIVED_AT`, `WERE_AT`, `KISSED` (×2), `WEPT_ALOUD`, `TURNED_BACK`, `AROSE_TO_RETURN`*, `RETURNED`,
`ATE`, `WAS_SATISFIED`, `HAD_LEFTOVER`, `CEASED_SPEAKING`, `TOOK_AS_WIFE` (×2), `REPEATED_DIRECTIVE`
(×2)†. (*`AROSE_TO_RETURN` — see 5b, optional trim. †`REPEATED_DIRECTIVE` — optional → `DIRECTED`.)

### 5b. REDUCE — home named (the clean set)
| FM loc | `action` now | → | home (type) |
|---|---|---|---|
| P02 P3 dep[1] | WENT_OUT_FROM_PLACE_OF_RESIDENCE | WENT_OUT | `from_place=PL2` (SIB) |
| P02 P3 dep[2] | WALKED_ON_RETURN_ROAD | WALKED | `destination=PL_LAND_OF_JUDAH` + map P02§4-P2 "walking on the road" (SIB) |
| P02 P9 app[1,2] | ASKED_DISSUASIVE_QUESTION (×2) | ASKED | `question_subject`/`question_form` + speech_act …AS_DISSUASION (SIB) |
| P02 P10 app[1] | STATED_PERSONAL_IMPOSSIBILITY | STATED | map P02§4-P9 "Naomi too old for a husband" (MAP) |
| P02 P10 app[2] | GRANTED_HYPOTHETICAL_CONCESSION | STATED‡ | map P02§4-P9 "Naomi having a husband tonight" (MAP) |
| P02 P12 lam[0] | STATED_BITTERNESS_COMPARISON | STATED | `comparison_summary=NAOMI_MORE_BITTER_THAN_DAUGHTERS` (SIB) |
| P02 P12 lam[1] | ASCRIBED_BITTERNESS_TO_YHWH | ASCRIBED | `agent_named=B10`,`ascription_summary=HAND_OF_YHWH_AGAINST_NAOMI` (SIB) |
| P03 P1 app[0] | STATED_EXEMPLAR_RETURN | STATED | `exemplar_party=B8` + map P03§4-P1 "your sister-in-law has gone back" (SIB) |
| P03 P1 app[1] | DIRECTED_HEARER_TO_FOLLOW_EXEMPLAR | DIRECTED | `exemplar_party=B8` + speech_act DIRECTS_HEARER_TO_RETURN (SIB) |
| P03 P3 vow[0–5] | VOWED_*_BINDING (×6) | VOWED | structural_form + per-comp siblings + map + FIG_0072/0074/CB_0021 (SIB) |
| P03 P5 nar[0] | SAW_DETERMINED_RESOLVE | SAW | `narrator_interior_access_scope` + map P03§4-P5 "determined to go with her" (SIB) |
| P04 P4 ren[0] | REFUSED_USE_OF_OWN_NAME | REFUSED | `refused_name=Naomi`,`refused_name_meaning=SWEET` (SIB) |
| P04 P4 ren[1] | PROPOSED_NEW_NAME | PROPOSED | `proposed_name=Mara`,`proposed_name_meaning=BITTER` (SIB) |
| P04 P4 ren[2] | STATED_LAMENT_REASON_BITTERED_BY_YHWH | STATED | `invoked_divine_agent=B12` + speech_act ASCRIBES_AFFLICTION… (SIB) |
| P04 P5 lam[0] | STATED_FULL_EMPTY_ANTITHESIS | STATED | `state_at_departure=FULL`,`state_at_return=EMPTY` (SIB) |
| P04 P5 lam[1] | ASKED_RHETORICAL_QUESTION_AS_PROTEST | ASKED | `question_target_referential_form` + speech_act …AS_PROTEST (SIB) |
| P04 P5 lam[3] | ASCRIBED_HARM_TO_YHWH | ASCRIBED | `invoked_divine_agent=B12` + map "Shaddai has done evil to me" (SIB) — see D3 |
| P05 P1 int[0] | POSITIONED_THROUGH_KINSHIP_ANCHOR | POSITIONED | `kinship_anchor_relation=WIDOW_OF_DECEASED_ANCESTOR`,`deceased_ancestor=B2` (SIB) |
| P05 P1 int[1] | INTRODUCED_AS_PERSON_OF_STANDING | INTRODUCED | `introduction_attribute=PERSON_OF_STANDING`,`chayil_lexeme=CB_0032` (SIB) |
| P05 P1 int[2] | PLACED_IN_LEGAL_RELATIONAL_KIN_GROUP | PLACED | `clan_referent=B29`,`clan_eponym=B2` (SIB) |
| P05 P1 int[3] | NAMED_AT_END_OF_INTRODUCTION | NAMED | `given_name=Boaz` (SIB) |
| P05 P7 gre[0] | GREETED_WITH_DIVINE_INVOCATION | GREETED | `invoked_divine_agent=B10` (SIB) |
| P05 P7 gre[1] | RETURNED_BLESSING_WITH_DIVINE_INVOCATION | BLESSED | `invoked_divine_agent=B10` + `list_position` (reciprocity) (SIB) |
| P05 P9 rep[0] | IDENTIFIED_BY_ETHNIC_EPITHET | IDENTIFIED | `epithet_voice_layer=…COMMUNITY_VOICE…` (SIB) |
| P05 P9 rep[1] | IDENTIFIED_BY_RETURN_WITH_KINSHIP_ANCHOR | IDENTIFIED | `kinship_anchor_being=B3`,`return_origin=PL2` (SIB) |
| P05 P9 rep[2] | REPORTED_PRIOR_REQUEST_QUOTED_SPEECH | REPORTED | `quoted_prior_*` + speech_act REPORTS_PRIOR_SPEECH_REQUEST (SIB) |
| P05 P9 rep[3] | REPORTED_WORK_PATTERN_PERSISTENCE | REPORTED | map P05§4-P9 "continued from morning until now" (MAP) |
| P05 P9 rep[4] | REPORTED_DISPUTED_SHELTER_REST | REPORTED | `shelter_place=…`,`textual_clarity_flag=True` (SIB) |
| P06 P1 ins[0] | DIRECTED_GLEANER_TO_STAY_IN_THIS_FIELD | DIRECTED | `field_to_stay_in=PL5_BOAZ_PORTION` (SIB) |
| P06 P1 ins[1] | DIRECTED_GLEANER_NOT_TO_GLEAN_IN_ANOTHER_FIELD | DIRECTED | `alternative_field=PL_OTHER_FIELD` (SIB) |
| P06 P1 ins[2] | DIRECTED_GLEANER_NOT_TO_PASS_ON | DIRECTED | map P06§4-P1 "pass on from this one" (MAP) |
| P06 P1 ins[3] | DIRECTED_GLEANER_TO_STAY_CLOSE_WITH_YOUNG_WOMEN | DIRECTED | `companion_group=B16` (SIB) |
| P06 P2 ins[0] | DIRECTED_HEARER_TO_KEEP_EYES_ON_REAPED_FIELD | DIRECTED | `field_to_watch=PL5_BOAZ_PORTION` (SIB) |
| P06 P2 ins[1] | DIRECTED_HEARER_TO_GO_AFTER_YOUNG_WOMEN | DIRECTED | `companion_group=B16` (SIB) |
| P06 P4 ins[0] | DIRECTED_HEARER_TO_GO_TO_VESSELS | DIRECTED | map P06§4-P4 "go to the vessels" (MAP) |
| P06 P4 ins[1] | DIRECTED_HEARER_TO_DRINK_FROM_WHAT_YOUNG_MEN_DRAW | DIRECTED | `water_drawers=B17` (SIB) |
| P06 P6 exc[0] | ASKED_WHY_SHE_FOUND_FAVOR_IN_HIS_EYES | ASKED | map P06§4-P6 "why has she found favor in his eyes" (MAP) |
| P06 P6 exc[1] | ASKED_WHY_HE_RECOGNIZED_HER | ASKED | map P06§4-P6 "that he recognized her" (MAP) |
| P06 P7 rec[0] | STATED_FULL_KNOWLEDGE_OF_WHAT_SHE_DID | STATED | `loyalty_act_toward_party=B3`,`after_whose_death=B?` (SIB) |
| P06 P8 rec[0] | STATED_RUTH_LEFT_FATHER_AND_MOTHER | STATED | `left_parties=PARENTS_OF_ADDRESSEE` (SIB) |
| P06 P8 rec[1] | STATED_RUTH_LEFT_LAND_OF_HER_BIRTH | STATED | `moab_naming_status=WITHHELD_IN_BOAZ_SPEECH` (SIB) |
| P06 P8 rec[2] | STATED_COMING_TO_UNKNOWN_PEOPLE | STATED | `destination_people_form=PEOPLE_PREVIOUSLY_UNKNOWN_TO_HER` (SIB) |
| P06 P12 inv[0] | DIRECTED_HEARER_TO_COME_HERE | DIRECTED | map P06§4-P12 "come here" (MAP) |
| P06 P12 inv[1] | DIRECTED_HEARER_TO_EAT_FROM_BREAD | DIRECTED | `food_item=CB_0012` (SIB) |
| P06 P12 inv[2] | DIRECTED_HEARER_TO_DIP_MORSEL_IN_VINEGAR | DIRECTED | `dipping_item=O9` (SIB) |
| P06 P17 cmd[0] | PERMITTED_GLEANING_AMONG_SHEAVES | PERMITTED | `permitted_location=PL_AMONG_SHEAVES`,`material_referent=O11` (SIB) |
| P06 P17 cmd[1] | DIRECTED_HARVESTERS_NOT_TO_SHAME_HER | DIRECTED | map P06§4-P17 "do not shame her" (MAP) |
| P06 P19 cmd[0] | DIRECTED_HARVESTERS_TO_LEAVE_THEM_FOR_HER | DIRECTED | `purpose=FOR_HER_TO_GLEAN` (SIB) |
| P06 P19 cmd[1] | DIRECTED_HARVESTERS_NOT_TO_REBUKE_HER | DIRECTED | map P06§4-P19 "do not rebuke her" (MAP) |

‡ `GRANTED_HYPOTHETICAL_CONCESSION → STATED` (not `GRANTED`, which would collide with the permission
sense). See D2.

### 5c. HELD — load-bearing meaning, routed to Thread B/C (NOT collapsed)
Each has a home (so none is homeless) but the dropped content is a meaning call — `MAP`-only and/or
theologically loaded. Held whole-unit to keep each proposition coherent.
- **P04 P5 lam[2]** `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` — the legal-witness reading of עָנָה bᵉ
  ("YHWH has testified against me"); adds a reading the speech_act doesn't carry. (Marcia-named.)
- **P06 P9 blessing[0,1]** `WISHED_YHWH_TO_REPAY_HER_WORK` + `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_
  WINGS_SHE_TOOK_REFUGE` — the wages/wings-of-refuge blessing, held as a unit. (Wings Marcia-named.)
- **P06 P11 response[0,1,2]** `STATED_THAT_HE_COMFORTED_HER` + `…SPOKE_TO_HEART_OF_HIS_SHIFCHAH` +
  `…SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT` — the *shifchah/shifchot* status terms, held as a unit.
  (Shifchah Marcia-named.)
- **P06 P6 exc[2]** `STATED_SELF_AS_FOREIGNER` (nokhriya) — borderline; a loaded outsider-status term
  like *shifchah*. See D4.

## 5d. D1 resolution — the `MAP`-only split (Marcia's method: route load-bearing, collapse incidental)
Marcia's test on each `MAP`-only row: *does the detail name a provision / named entity / tracked
object / place the book treats as load-bearing?* If yes → reduce the verb **but route the detail to a
sibling slot** (keep it in the structured hard-constraint channel); if no → collapse to bare verb
(map is a fine home). **Verified against the registry, not guessed:**

| `MAP`-only value | load-bearing? | disposition | basis |
|---|---|---|---|
| P02 P10 STATED_PERSONAL_IMPOSSIBILITY → STATED | no (argument step) | **collapse** | not a provision/entity/object/place; map P02§4-P9 |
| P02 P10 GRANTED_HYPOTHETICAL_CONCESSION → STATED | no (argument step) | **collapse** | map P02§4-P9 |
| P05 P9 REPORTED_WORK_PATTERN_PERSISTENCE → REPORTED | no (characterization) | **collapse** | map P05§4-P9 |
| P06 P1 DIRECTED_GLEANER_NOT_TO_PASS_ON → DIRECTED | no | **collapse** | the field PL5 is already structured next door (`field_to_stay_in`) |
| P06 P6 ASKED_WHY_SHE_FOUND_FAVOR_IN_HIS_EYES → ASKED | concept, but **already structured** | **collapse** | favor flagged on the prop: `CB_0033 Hen-Favor` + `FIG_0018 Favor-in-Eyes` |
| P06 P6 ASKED_WHY_HE_RECOGNIZED_HER → ASKED | concept, but **already structured** | **collapse** | recognition/foreigner flagged: `CB_0038 Nokhriya-Foreigner` |
| P06 P12 DIRECTED_HEARER_TO_COME_HERE → DIRECTED | no (scene phrasing) | **collapse** | map P06§4-P12 |
| P06 P17 DIRECTED_HARVESTERS_NOT_TO_SHAME_HER → DIRECTED | no (manner; protection carried by the NOT_TO_DO cluster + the structured touch-prohibition at P06 P3) | **collapse** | map P06§4-P17 |
| P06 P19 DIRECTED_HARVESTERS_NOT_TO_REBUKE_HER → DIRECTED | no (manner) | **collapse** | map P06§4-P19 |
| **P06 P4 DIRECTED_HEARER_TO_GO_TO_VESSELS → DIRECTED** | **YES** (tracked object — Boaz's water provision) | **route → sibling, but FLAG (see D1)** | the vessels are **codeless**: no `object_id`, no registered code; map lists "the vessels" as a bare (un-wikilinked) entity; `TH_WATER_VESSELS_FORM` is only a coverage abstract-overlay |

**Net: exactly one load-bearing route — the vessels — and it has no registered slot to land in.** All
other `MAP`-only values collapse cleanly (favor/recognition are already carried by proposition flags).

## 6. All rulings RESOLVED (Marcia, 2026-06-04)
- **D2 naming** — `GRANTED_HYPOTHETICAL_CONCESSION → STATED`, `REPEATED_DIRECTIVE → DIRECTED`,
  `AROSE_TO_RETURN` kept.
- **D4** — `STATED_SELF_AS_FOREIGNER` (nokhriya) **HELD** (outsider-status term, Thread B/C).
- **D3** — reduce `ASCRIBED_HARM_TO_YHWH → ASCRIBED`; **HOLD** `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH`.
  Comfort confirmed: *ʿanah b-* (Ruth 1:21) carries the legal "testify against" sense (Exod 20:16)
  *alongside* "afflict"; English versions split. The courtroom layer is **lost meaning, not a gloss**
  (the bare `ASCRIBED` + the affliction speech_act carry only the affliction layer) → HOLD, route to
  Thread B as a sharp preserve-meaning test case.
- **D1 vessels — option (a):** reduce action → `DIRECTED`, land the detail in a **newly-introduced**
  descriptive sibling slot `drink_source: WATER_VESSELS`. The survival table must record both that the
  detail landed in `drink_source` **and that the slot is new** (created, not pre-existing) — that is a
  different claim than moving to an existing sibling. Pure content edit (no enum/gate).
- **D1 vessels — option (b) reframed as a flagged registry gap (NOT a Thread-A item):** the vessels
  are a load-bearing provision-of-welcome (Boaz extending the workers' water to a foreigner — a small
  act of *hesed*) with **no registered referent anywhere** (no `object_id`, not even a map wikilink).
  That is a real registry gap surfaced by this test. Recorded here for a **future BCD-delta decision**
  (promote the vessels to a first-class tracked object) when next in the registry — flagged, not
  "optional," so it is not forgotten.

### Held set = the Thread B starter corpus (7 labels, 4 thematic units)
Assembled as a byproduct of doing Thread A carefully — the cases where preserve-meaning and
preserve-form come apart:
1. `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` (P04 P5) — the *ʿanah b-* legal/affliction split.
2–3. `WISHED_YHWH_TO_REPAY_HER_WORK` + `WISHED_FULL_WAGES…UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE` (P06 P9)
  — the wages / wings-of-refuge blessing.
4–6. `STATED_THAT_HE_COMFORTED_HER` + `…SPOKE_TO_HEART_OF_HIS_SHIFCHAH` + `…SHE_IS_NOT_AS_ONE_OF_HIS_
  SHIFCHOT` (P06 P11) — the *shifchah/shifchot* status terms.
7. `STATED_SELF_AS_FOREIGNER` (P06 P6) — *nokhriya*.
> Count note: 7 by this table. Marcia referenced "8 (the original 7 plus nokhriya)" — surfacing the
> exact membership so the corpus is unambiguous; flag if an 8th was intended (e.g. holding the
> courtroom's partner `ASCRIBED_HARM_TO_YHWH` too — currently ruled *reduce*).

## 7. Follow-on — SC-0025 (action-slot enforcement; what makes SC-0024 durable)
SC-0024 *reduces* `action` but the slot stays uncontrolled, so P07–P14 could re-introduce
sentence-shaped values — the slot would re-dirty, the exact failure enforcement exists to prevent.
**SC-0025 (PROPOSED): promote the SC-0024 verb set to a controlled `action` axis** (bounded-open,
drift-detected), the clean-then-enforce shape of triage → SC-0022. SC-0024's `action` cleanup is
**only durable once SC-0025 lands** — flag this in the handoff so the next architect treats the clean
`action` set as load-bearing. (Allocate SC-0025 PROPOSED in the SPEC_CHANGES ledger.)
