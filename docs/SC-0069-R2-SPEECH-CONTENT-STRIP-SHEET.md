# SC-0069 — Phase 2 (R2) — speech-content strip calibration sheet

> **Status: CALIBRATION — awaiting Marcia's word. NOTHING APPLIED.** This sheet enumerates every
> word-bearing speech/content slot across the 19 gold FOR_MODELs by **value-shape, not key-name**,
> proposes a disposition per group, and surfaces the boundary calls. After ruling, the changes land
> as **one compiler+vault pair** (FM amendments — drop the word-value, keep `speech_act` + structure;
> coupled CL keep-image/echoes reconciled; per-value count-assert + re-grep; vault byte-identical),
> mirroring the SC-0067 (R1) idiom.

> **SC-ID:** SC-0069 is the next free number (reconfirmed 2026-06-20 vs `SPEC_CHANGES.md` highest =
> SC-0068, `gh pr list` = 0 open). The oral-pipeline Stage 2 also eyes SC-0069 — **binding allocation
> happens at APPLY time** (the `SPEC_CHANGES.md` row is written then, with a re-check); if Stage 2
> lands first, R2 bumps to the next free.

> **This is [[tripod-sentence-token-triage]] Phase 2 (R2).** R1 (SC-0067) — the referential/address
> bare-form strip — is MERGED. R2 = the speech-content strip. Phase 3 (structural `*_form` + the 3 held
> values + controlled-verb decompositions) and Phase 4 (the value-shape guard) remain after this.

---

## 1. The ruling being applied (R2, Marcia, locked)

> **Speech/content slots carry ONLY `speech_act` + structure (the participants).** DROP the
> word-bearing content (the actual words of speech) — the words live in the Meaning Map.

## 2. The R2 safety (the crux — R2 is HIGHER loss-risk than R1)

R1 stripped meta-annotations whose meaning was already carried structurally. **R2 drops WORDS whose
only other home is the map.** So per value, **before any drop**:

1. **CONFIRM the content is in the Meaning Map.** If it isn't, dropping LOSES it → do NOT drop; surface.
2. **CHECK for a load-bearing / `NOT_TO_BE_NORMALIZED` flag.** Exact phrasing that must survive is
   preserved (kept / relocated), never silently dropped → surface.

**Drop ONLY when not-flagged AND confirmed-in-map.**

### 2A — Two safety findings that de-risk R2 (verified, not assumed)

- **`NOT_TO_BE_NORMALIZED` is not a literal flag in pilot-2 data.** `_spec/schema/README.md` itself
  says "confirm the field name." The **realized mechanism is the COMPILATION-LOG (CL) "REQUIRED / PREFERRED
  keep-image" notes** (e.g. P03 *"REQUIRED keep-image. The canonical Hebrew self-curse oath formula…
  Do not soften"*; P06 *"the Hebrew word kanaph must render the same way at 2:12 and 3:9"*). These notes
  live in the **CL, not the FM slot** → dropping the FM word-value does **not** remove the keep-image
  protection. They are the apply-time NOT_TO_BE_NORMALIZED check.
- **The Meaning Map is the architectural preservation home for speech.** The map carries the words
  three ways over — Level-2 scene prose, Level-3 Q&A, and often a `CB_`/`FIG_` anchor **with the Hebrew**
  (`בָּרוּךְ יְהוָה / "blessed be YHWH"`, `רוּת אֲמָתֶךָ / "Ruth your servant"`). The FM slot is a
  redundant copy. **Map-presence held for 100% of the genuine-speech sample checked** (§8).

> **Consequence:** for genuine speech that traces to map narration (the overwhelming majority), R2 is
> safe. The exposure is concentrated in two classes that this sheet surfaces explicitly: the
> **load-bearing formulas** (§D) and the **P03 vow cluster** (§E).

## 3. Method + counts (value-shape, from the fixtures — not memory)

Walked every `event_specific_slots` leaf (incl. nested `*_components[]`) across all 19 FMs. Excluded
structural IDs (`B##`/`PL`/`O`/`TM_`/`TH_`/`CB_`/`FIG_`/`I#`/`S#`/`P#`), the controlled axes
(`speech_act`, `action`, `proposition_kind`), and the R1 `*referential_form*` family. Tagged each value
**speech-context** if its proposition carries a `speech_act`.

- **548** non-structural slot-values; **436** in speech-context, across **211** distinct keys.
- Proposed partition of the 436 (membership at the boundary is Marcia's to rule):

| Bucket | occ | what it is | §  | recommend |
|---|---|---|---|---|
| Speech-content slots | ~86 | dedicated "words of the utterance" slots | A | **DROP** |
| (b) `*_form` speech forms | 21 | `question_form`/`matched_action_form`/… (SC-0067 §10D) | B | DROP (words-subset) |
| Command/instruction content | ~47 | spoken imperatives (`commanded_step` 34 + kin) | C | **boundary — her call** |
| Load-bearing formulas | ~17 | creed / confession / Hebrew oath / `BARUKH_YHWH` | D | **surface — explicit bless** |
| — of which: the P03 vow cluster | ~14 | the six-step ladder (words **=** structure) | E | **boundary — recommend KEEP** |
| Meta / analytic characterizations | ~43 | `question_subject:JONAHS_ANGER`, `RHETORICAL_*` | F | **OUT of R2 → Phase 3** |
| Structural keep (ordinals/names/classifiers/R1-forms/events) | ~225 | `list_position`/`given_name`/`blessing_content_kind`/`address_form` | G | **KEEP — not touched** |

> The "drop" total lands **~100–155 occ** depending on the §C and §D rulings — most of the 436 is
> structure (ordinals alone = 86: `list_position` 61 + `step_order` 25).

---

## 4. The worked example — what R2 does to a proposition (J02 P18, the sailors' prayer, Jonah 1:14)

**BEFORE** (current):
```jsonc
"proposition_kind": "APPEAL",
"event_specific_slots": {
  "petitioners": "B4", "petitioned_divine": "B2",
  "petition_components": [
    { "petition": "DO_NOT_LET_US_PERISH_FOR_THIS_MANS_LIFE", "speech_act": "DIRECTS_HEARER_NOT_TO_DO" },
    { "petition": "DO_NOT_LAY_INNOCENT_BLOOD_ON_US", "innocent_blood": "CB_0054", "speech_act": "DIRECTS_HEARER_NOT_TO_DO" }
  ],
  "petition_grounds": "YOU_YHWH_HAVE_DONE_AS_YOU_PLEASED",
  "petitioned_subject_referential_form": "THIS_MAN"
}
```
**AFTER R2** (drop the words; keep `speech_act` + every participant/anchor/referential):
```jsonc
"proposition_kind": "APPEAL",
"event_specific_slots": {
  "petitioners": "B4", "petitioned_divine": "B2",
  "petition_components": [
    { "speech_act": "DIRECTS_HEARER_NOT_TO_DO" },
    { "innocent_blood": "CB_0054", "speech_act": "DIRECTS_HEARER_NOT_TO_DO" }
  ],
  "petitioned_subject_referential_form": "THIS_MAN"
}
```
The words ("do not let us perish for this man's life…") are in the map (P01/§8 below); the FM keeps that
**two `DIRECTS_HEARER_NOT_TO_DO` petitions were addressed by B4 to B2, one anchored to `innocent_blood`
CB_0054**. (Open micro-question for §I: when a component reduces to bare `{speech_act}`, keep it as the
structural placeholder, or fold into a count? Recommend **keep** — it preserves the petition-count.)

---

## §A — Speech-content slots (recommend: DROP) — ~71 keys / ~86 occ

The value is unmistakably the words of an utterance, in a dedicated content slot, and the proposition
already records `speech_act` + the speakers/addressees. Representative (not exhaustive — full list in
the apply pass):

| Key | example value(s) | peri | verse |
|---|---|---|---|
| `petition` | DO_NOT_LET_US_PERISH_FOR_THIS_MANS_LIFE · TAKE_MY_LIFE | J02,J05 | 1:14; 4:3 |
| `petition_grounds` | YOU_YHWH_HAVE_DONE_AS_YOU_PLEASED | J02 | 1:14 |
| `petition_content` | SPREAD_YOUR_WING_OVER_SERVANT | P09 | 3:9 |
| `question_content` | WHAT_ARE_YOU_DOING_ASLEEP · WHAT_SHALL_WE_DO_TO_YOU | J02 | 1:6,11 |
| `answer` | IT_IS_GOOD_THAT_IT_BURNS_TO_ME | J05 | 4:9 |
| `prayer_opening` | WAS_THIS_NOT_MY_WORD | J05 | 4:2 |
| `lament_content` | DRIVEN_FROM_BEFORE_YHWH_EYES | J03 | 2:4 |
| `self_identification` | I_AM_RUTH_YOUR_SERVANT | P09 | 3:9 |
| `disclosure` | A_REDEEMER_NEARER_THAN_I | P09 | 3:12 |
| `declared_ground` | YOU_ARE_A_REDEEMER | P09 | 3:9 |
| `assent_content` / `pledge_content` | ALL_THAT_YOU_SAY_I_WILL_DO | P08,P09 | 3:5 |
| `handoff_content` | HE_WILL_TELL_YOU_WHAT_TO_DO | P08 | 3:4 |
| `report_content` | ALL_THE_MAN_DID_FOR_HER | P10 | 3:16 |
| `desired_outcome` | SEA_QUIET_FOR_US | J02 | 1:11 |
| `refusal`/`repeated_reason`/`stated_reason` | CANNOT_REDEEM_FOR_MYSELF · LEST_I_RUIN_MY_OWN_INHERITANCE | P11 | 4:6 |
| `queue_basis`/`queue_position` | NO_ONE_BESIDES_YOU_TO_REDEEM · BOAZ_IS_AFTER_YOU | P11 | 4:4 |
| `selling_status` | FIELD_OFFERED_FOR_SALE | P11 | 4:3 |
| `outcome` | GOOD_LET_HIM_REDEEM · I_WILL_REDEEM_YOU | P09 | 3:13 |
| `oracle_pronouncement`/`oracle_deadline` | NINEVEH_OVERTHROWN · FORTY_DAYS_MORE | J04 | 3:4 |

…and the rest of the dedicated-content family (`command_rationale`, `hoped_outcome`, `confessed_content`,
`declared_identity`, `hope_marker`, `hoped_divine_turning`, `proposal_purpose`, `reason_for_errand`,
`stated_purpose`, `stated_rationale`, `nearness_statement`, `storm_ownership_admission`,
`comparison_summary`, `ascription_summary`, `hesed_comparison`, `matriarch_deed`, `future_role_first/second`,
`plant_lifespan`, `inhabitant_descriptor`, …). **All trace to map narration (§8). Recommend DROP.**

## §B — The (b) `*_form` speech forms (SC-0067 §10D) — 7 keys / 21 occ

Routed to R2 by the R1 sheet. Re-confirmed each is genuinely word-bearing speech, with two refinements:

| Key | values | disposition |
|---|---|---|
| `question_form` | WHO_ARE_YOU · WHY_WOULD_YOU_GO_WITH_ME · IS_IT_GOOD_THAT_IT_BURNS_… · SHOULD_I_NOT_PITY_NINEVEH | **DROP the 6 word-values** |
| `question_form` | RHETORICAL_PROMISE_QUESTION · RHETORICAL_RECOGNITION_QUESTION · DOUBLED_WHERE_AND_WHERE_WORKED | **3 are META (not words) → §F, keep** |
| `witness_summons_form` | YOU_ARE_WITNESSES_TODAY (×2) | DROP (Boaz, 4:9) |
| `response_form` | WE_ARE_WITNESSES | DROP (elders, 4:11) |
| `blessing_form` | BARUKH_YHWH | **load-bearing → §D** |
| `decree_authority_form` | BY_DECREE_OF_KING_AND_NOBLES | DROP (Jonah 3:7); but see §D (formula-ish) |
| `matched_action_form` · `binding_indefinite_place_form` | I_WILL_GO… · WHERE_YOU_GO… | **the P03 vow → §E** |

## §C — Command / instruction content — the big-volume BOUNDARY (~12 keys / ~47 occ)

Spoken imperatives. `commanded_step` alone is 34 (YHWH's commission *get up, go to Nineveh, call out*;
the captain's *get up, cry out*; Naomi's *wash, anoint, put on garments, go down*; Boaz's *buy it,
redeem*). Plus `counseled_action`, `requested_action`, `reported_instruction`, `reported_directive`,
`granted_action`, `refused_action`, `prohibition`, `prior_prohibited_action`, `guarded_against`,
`protected_fact`, `purpose`.

**The decision:** these are literally the words spoken, AND they're in the map (§8: *"get up, go to
Nineveh"* etc.) — so the R2 ruling says drop. But they're terse, near-controlled, and sit adjacent to
the controlled `action` axis, so one could read them as "structure."

> **Recommendation: DROP** (consistent with the ruling — they are the words, and the map carries them;
> keeping them would re-admit prose the seed-freeze is meant to evict). **Marcia rules the boundary.**

## §D — Load-bearing formulas — the NOT_TO_BE_NORMALIZED class (surface; ~10 keys / ~17 occ)

These carry **CL keep-image flags and/or fixed liturgical/confessional phrasing** (often Hebrew). They
are **in the map** (with Hebrew) — so dropping does not lose them — but they are exactly the class the
safety rule says **surface for an explicit bless, never silent**.

| Key | value(s) | load-bearing because | map home |
|---|---|---|---|
| `blessing_form` | BARUKH_YHWH | Hebrew benediction (Ruth 4:14) | P13 `CB_0008` `בָּרוּךְ יְהוָה` ✓ |
| `oath_formula` | AS_YHWH_LIVES | fixed self-curse oath (3:13); CL "do not soften" | P09 prose ✓ |
| `divine_descriptors` | GOD_OF_HEAVEN · MAKER_OF_SEA · MAKER_OF_DRY_LAND | Jonah's confession creed (1:9) | J02 prose + B2 desc ✓ |
| `creed_attributes` | GRACIOUS · COMPASSIONATE · SLOW_TO_ANGER · ABOUNDING_IN_HESED · RELENTING_OF_EVIL | Israel's oldest creed (4:2) | J05 prose ✓ |
| `declared_thesis` | SALVATION_BELONGS_TO_YHWH | the book's thesis line (2:9) | J03 `CB_0056` + prose ✓ |
| `living_and_dead_form` | ET_HACHAYIM_VEET_HAMETIM | Hebrew merism (kept §10C, R1) | (R1-adjacent) |
| `empty_word_echo` | REQAM_NEGATED · `attention_marker` HINNEH | Hebrew echo / discourse marker | maps ✓ |

> **Recommendation: DROP from the FM with explicit bless** (the map + the CL keep-image are the homes;
> the FM slot is redundant) — **OR** keep these specific values as structured anchors if you'd rather the
> machine artifact still carry the formula. Either is safe; this is the class you should consciously rule.

## §E — The P03 vow cluster — the marquee boundary (recommend: KEEP as structure)

Ruth's vow (1:16–17) is the one place where **the words ARE the structure.** P3 has 6 `vow_components`
(the "six-step ladder"); each pairs `binding_indefinite_place_form` (WHERE_YOU_GO/LODGE/DIE) with
`matched_action_form` (I_WILL_GO/LODGE/DIE/BE_BURIED). The CL flags this **REQUIRED keep-image**:
*"both halves of the pair must render with parallel structure so the matched-action mirror is audible…
do not collapse."*

If R2 drops those forms, components 1 and 2 both reduce to `{action:VOWED, binder:B9, bound_to_referent:B3,
list_position:FIRST/SECOND, speech_act:VOWS}` — **structurally near-identical**, with the go-vs-lodge-vs-die
distinction pushed entirely to the map. The laddering survives (`vow_structural_form`, `list_position`,
`binding_domain`, `nominal_equation_half`), but the matched-pairing content does not.

> **Recommendation: KEEP the P03 vow forms** (`matched_action_form`, `binding_indefinite_place_form`) and
> route them to **Phase 3 with the (c) structural forms**, NOT R2 — because here the form **is** the
> load-bearing parallel structure the CL requires, not redundant words. **Marcia rules.** (Alternative if
> she prefers consistency: drop the words but add an explicit structural pairing-marker so the FM doesn't
> lose the mirror.)

## §F — Meta / analytic characterizations — OUT of R2 (→ Phase 3) — ~24 keys / ~43 occ

These **characterize** the speech, they don't quote it (confirmed: `IDENTITY_RECOGNITION_AND_STANDING` is
**not** verbatim in the map, §8). They are [[tripod-sentence-token-triage]] bin-1 clause-commentary —
a different cleanup. `question_subject` (analytic values: JONAHS_ANGER, ANGER_OVER_PLANT,
IDENTITY_RECOGNITION_AND_STANDING, DAUGHTERS_GOING_WITH_NAOMI…), `narrator_interior_access_scope`,
`epithet_voice_layer`, `name_known_status`, `oath_conditional_structural_force`, `quoted_prior_speech_act`,
`subsequent_speech_act_event`, `dissuasion_target`, `moab_naming_status`, `hesed_antecedent`,
`argument_role`, `creed_rhetorical_function`, the `RHETORICAL_*`/`DOUBLED_*` question_form metas.

> **Note:** `question_subject` is split — values like `WHAT_IS_YOUR_WORK` / `WHERE_DO_YOU_COME_FROM` ARE
> the question words (→ §A drop), while `JONAHS_ANGER` / `IDENTITY_RECOGNITION_AND_STANDING` are analytic
> topics (→ keep/Phase 3). The apply pass splits per value. **Recommendation: OUT of R2; defer to Phase 3.**

## §G — Structural keep — not touched by R2 (~225 occ)

Ordinals (`list_position` 61, `step_order` 25), proper names (`given_name`, `son_named`, `proposed_name`,
`refused_name`, `father_name/named`), structured classifiers (`blessing_content_kind` HESED/MENUCHA_REST,
`role_in_household`, `nominal_equation_half`, `binding_domain`, `hesed_holds`, `state_at_departure/return`
FULL/EMPTY, `fear_magnitude`, `intensity`), the R1-done (a) address forms (`address_form` 12, etc.), and
narrated-event descriptors (`worship_act`, `custom_act`, `seating_act`, … → Phase 3 if anything). **Not
speech-words. KEEP.**

---

## §8 — Map-presence evidence (the safety sample, verified by grep)

| Value | FM slot | Meaning-Map home (grep hit) | verdict |
|---|---|---|---|
| DO_NOT_LET_US_PERISH… | `petition` J02 | J02 L2 prose + Q&A "do not let us perish for this man's life" | in-map ✓ |
| WHAT_ARE_YOU_DOING_ASLEEP | `question_content` J02 | J02 "What are you doing, sleeper?" + Q&A | in-map ✓ |
| I_AM_RUTH_YOUR_SERVANT | `self_identification` P09 | P09 prose + `B9` desc `רוּת אֲמָתֶךָ` | in-map ✓ |
| SPREAD_YOUR_WING_OVER_SERVANT | `petition_content` P09 | P09 "spread your wing over your servant" (kanaf pair) | in-map ✓ |
| GO_TO_NINEVEH / ARISE | `commanded_step` J04 | J04 "get up, go to Nineveh" + Q&A | in-map ✓ |
| FIELD_OFFERED_FOR_SALE + queue | `selling_status` P11 | P11 "the portion… which Naomi… is selling… I am after you" | in-map ✓ |
| BARUKH_YHWH | `blessing_form` P13 | P13 `CB_0008` `בָּרוּךְ יְהוָה / "blessed be YHWH"` | in-map ✓ |
| GOD_OF_HEAVEN / MAKER_OF_SEA | `divine_descriptors` J02 | J02 "I fear YHWH, who made the sea" + B2 desc | in-map ✓ |
| GRACIOUS / COMPASSIONATE… | `creed_attributes` J05 | J05 "gracious and compassionate, slow to anger, abounding in hesed" | in-map ✓ |
| AS_YHWH_LIVES | `oath_formula` P09 | P09 "seals it with the oath: as YHWH lives" | in-map ✓ |
| SALVATION_BELONGS_TO_YHWH | `declared_thesis` J03 | J03 `CB_0056` + "salvation belongs to YHWH" | in-map ✓ |
| IDENTITY_RECOGNITION_AND_STANDING | `question_subject` P10 | **not verbatim** (analytic topic) | → §F, not a drop |

**100% of genuine-speech sample is in the map.** The one not-in-map value is analytic (§F), correctly
not a drop. The full per-value map-presence check is an **apply-time gate** (every dropped value re-grepped).

## §9 — What I need from Marcia (the decisions)

1. **§A speech-content slots (~86 occ):** drop the words, keep `speech_act` + structure? *(recommend: yes)*
2. **§B (b) `*_form` speech forms:** drop the word-values (`question_form` words, `witness_summons_form`,
   `response_form`)? — the 3 `RHETORICAL_*`/`DOUBLED_*` metas go to §F (keep). *(recommend: yes)*
3. **§C command/instruction content (~47 occ, incl. `commanded_step` ×34):** drop as speech, or keep as
   structured directive payload? *(recommend: drop — they are the words and they're in the map)*
4. **§D load-bearing formulas (~17 occ — creed, confession, `AS_YHWH_LIVES`, `BARUKH_YHWH`,
   `SALVATION_BELONGS_TO_YHWH`):** drop-with-explicit-bless (map + CL keep-image are the homes), or keep
   these specific values in the FM as structured anchors? *(recommend: drop-with-bless; either is safe)*
5. **§E the P03 vow cluster:** KEEP the matched/binding forms as load-bearing structure (route to Phase 3),
   or drop the words like the rest? *(recommend: KEEP — the form is the REQUIRED-keep-image parallel structure)*
6. **§F meta/analytic (~43 occ):** confirm OUT of R2 → defer to Phase 3? *(recommend: yes)*
7. **Bare-component micro-rule (§4):** when a `*_components[]` entry reduces to `{speech_act}` only,
   keep it as the structural placeholder (preserves the count)? *(recommend: keep)*

## §10 — Phase-4 guard scope (recorded so it isn't lost)

The value-shape guard (SC-0067 §8) widens to flag **word-bearing content in any speech/content slot**:
a multi-word `UPPER_SNAKE` value rendering an utterance under a content key, in a proposition carrying a
`speech_act`. Allow-list the structural classifiers/ordinals/names and the kept formulas (§D/§G) and the
kept vow forms (§E) per Marcia's rulings. Bin-1 analytic commentary (§F) gets its own Phase-3 rule.
