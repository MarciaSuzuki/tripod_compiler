---
type: "sta-compilation-log"
pericope: "P07"
pericope-title: "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest"
source-meaning-map: [[P07-Ruth-2-17-23]]
source-for-model: [[P07-Ruth-2-17-23-FOR-MODEL]]
related-bcd-delta: [[P07-Ruth-2-17-23-BCD-DELTA]]
status: "valid"
pilot: "pilot-2"
---

# P07 — Ruth 2:17–23 — COMPILATION-LOG

This page renders the COMPILATION-LOG JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder. Registry promotions for this pericope live in the paired BCD-DELTA page.

```json
{
  "sta_id": "ruth_pericope_07_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "bcv": "Ruth 2:17-23",
  "pericope_id": "P07",
  "pericope_title": "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest",
  "compiled_at": "2026-06-01",
  "review_status": {
    "meaning_map_status": "APPROVED",
    "sta_compilation_status": "PILOT_2_COMPILATION_DRAFTED_FOR_GATE_F",
    "community_verified": false,
    "translation_team_verified": false,
    "consultant_review_required": false,
    "production_use": false
  },
  "confidence_overall": "MEDIUM_HIGH",
  "confidence_overall_note": "P07 compiles cleanly under the corrected v2.0 / v0.3 three-artifact architecture. Sixteen propositions across four scenes. Pericope register INFORMAL_CASUAL with one scene-level INTIMATE override (S3, the home talk vv.19-22) and one moment-level CEREMONIAL override (v.20a, Naomi's blessing on Boaz invoking YHWH). The hesed antecedent at v.20 is held open (YHWH or Boaz) per the blessed map and FIG_0111. 'The dead' stays generic; no structural slot binds Elimelech/Mahlon/Chilion — they surface only via the map's §3A relationship prose, so B2 stands as the referenced anchor for 'the dead' with referential_form THE_DEAD_GENERIC_FORM. Scene 3 spans vv.19-21 as one scene; CB_0043 is NOT fired. id-check map↔FOR_MODEL is clean on coded entities (0 ref-integrity, 0 name-binding, 0 flag-mismatch); two FM-only codes (TM_TODAY at S3, TH_LEFTOVER_FROM_SATIETY_FORM at S2) encode map prose the map left as bare Hebrew. BCD-DELTA registers no new BCD beings/places/times and no new figures (all 7 fired figures already in the registry); it carries the eight active CB flags and one new structural object (the leftover-from-satiety form). Confidence held at MEDIUM_HIGH pending Architect gate-board verification and lead review of the flagged judgment calls.",
  "compilation_decisions": [
    {
      "decision_id": "P07-D1",
      "decision": "Hesed antecedent at v.20 held open (YHWH or Boaz); not bound to either.",
      "description": "Naomi's 'who has not forsaken his hesed toward the living and the dead' has a grammatically ambiguous antecedent — YHWH or Boaz — and the blessed map rules it AMBIGUOUS. P10 encodes hesed_source_antecedent: HELD_OPEN_YHWH_OR_BOAZ and does not place a B-code subject on the forsaking. CB_0011 fires at P10; FIG_0111 (Hesed-Not-Forsaken) opens here with the held-open antecedent. The reconstructor must preserve the ambiguity (R3, do_not_decide)."
    },
    {
      "decision_id": "P07-D2",
      "decision": "'The dead' kept generic; no individual structural slot for Elimelech/Mahlon/Chilion.",
      "description": "At v.20 the living-and-dead formula names הַמֵּתִים only as 'the dead.' The blessed map names Elimelech, Mahlon, and Chilion solely in §3A relationship prose, not in a structural slot. P10's unforsaken_hesed_toward uses THE_LIVING_GENERIC and THE_DEAD_GENERIC; the dead-of-household being is declared in S3 as B2 with referential_form THE_DEAD_GENERIC_FORM and role naming it generic-not-individuated. B2 (Elimelech) is the registered anchor the BCD already carries for the household's dead; using it does NOT individuate the trio in the formula. R2 traces the generic-form constraint."
    },
    {
      "decision_id": "P07-D3",
      "decision": "Scene 3 = vv.19-21 (one scene); CB_0043 not fired.",
      "description": "The questions, the report, the YHWH-blessing, the redeemer-recognition, and Ruth's relay of Boaz's stay-close word are held as one recognition-and-blessing scene (S3, vv.19-21) per the blessed map. CB_0043 (Mother-in-Law Chamot) is NOT fired anywhere in P07; the chamot kinship-word is carried as referential_form HER_MOTHER_IN_LAW_KINSHIP_FORM on B3 (S2/S3 and props P5, P16), not as a concept-bank flag, matching the map's §5A which does not list CB_0043."
    },
    {
      "decision_id": "P07-D4",
      "decision": "Register overrides encoded at scene/moment level, not as a pericope register change.",
      "description": "Per the blessed map's multi-level register tagging: pericope stays INFORMAL_CASUAL. The home talk (vv.19-22) gets a scene-level INTIMATE override on S3. Naomi's v.20 blessing ('Blessed be he of the LORD') gets a moment-level CEREMONIAL override at v.20a. Both use override_value (social-register axis); neither uses framing_override (no NARRATIVE_FRAMING value here). The map flags the override as covering vv.19-22, but S3 spans vv.19-21 and the counsel at v.22 falls in S4; the scene-level INTIMATE override is attached to S3 (where the bulk of the home talk sits) and the v.22 counsel reads as continuous intimate home talk — flagged for the lead (JC-5)."
    },
    {
      "decision_id": "P07-D5",
      "decision": "FIG_0104 abundance triplet closes at 2:18; cross-pericope pair P06→P07 resolved.",
      "description": "FIG_0104 opened at P06 P15 (2:14, ate/was-satisfied/had-leftover triplet, third verb load-bearing). It CLOSES here at P07 P6 (2:18) as the leftover Ruth carries home and gives Naomi. The registry frontmatter confirms opens-at P06 / closes-at P07. The cross-pericope pair is now structurally landed; cross_ref on P6 records the close. P06's COMPILATION-LOG had this pair PENDING; it is VERIFIED here."
    },
    {
      "decision_id": "P07-D6",
      "decision": "Three cross-pericope figure pairs OPEN at v.20 (FIG_0111, FIG_0110, FIG_0112); one image-rhyme pair CLOSES at v.23 (FIG_0012).",
      "description": "FIG_0111 (Hesed-Not-Forsaken) opens P07 → closes P09 (3:10). FIG_0110 (Living-and-Dead) opens P07 → pairs forward to P11 (4:5) and P12 (4:10). FIG_0112 (Close-to-Us) opens P07 → pairs forward to P09 (3:12) and P11 (4:1-6). FIG_0012 (Clinging-Dabaq image-rhyme) CLOSES here at P07 P14 (2:23), having opened at P02 P14 (1:14) — the same davaq root rhyming Ruth's clinging to Naomi forward to her staying-close under Boaz. All four already exist in the Figure Registry, so none is re-added in BCD-DELTA."
    },
    {
      "decision_id": "P07-D7",
      "decision": "FIG_0001 Ruth-the-Moabitess narrator-epithet fires at v.21.",
      "description": "P06-D8 deferred FIG_0001 forward: the narrator-voice epithet 'Ruth the Moabitess' returns at P07 v.21. P12 carries FIG_0001 and CB_0004; B9 in S3 carries referential_form RUTH_THE_MOABITESS_NARRATOR_EPITHET. This reasserts Ruth's outsider standing at the very moment she repeats Boaz's welcome — outsider-incorporation in view as her place in the household grows."
    },
    {
      "decision_id": "P07-D8",
      "decision": "Naomi blesses the man before learning his name (v.19 ordering preserved).",
      "description": "At v.19 Naomi blesses 'the man who took notice of you' BEFORE Ruth names him. P8 (blessing) carries name_known_status: NAME_NOT_YET_KNOWN_TO_NAOMI and blessing_recipient B13 with referential_form THE_MAN_WHO_TOOK_NOTICE_OF_HER; P9 (Ruth reporting the name 'Boaz') follows. The blessing-before-naming sequence is preserved by ordering P8 then P9, mirroring the map's Proposition 8 note ('she blesses him before Ruth names him')."
    },
    {
      "decision_id": "P07-D9",
      "decision": "speech_act on Naomi's two blessings: WISHES_FOR_THIRD_PARTY.",
      "description": "Both Naomi's blessing of the man (P8, 'Blessed be the man…') and her blessing of YHWH (P10, 'Blessed be the LORD…') are barukh-formula third-party blessings — Naomi wishes/declares blessing on a party who is not her addressee Ruth. The closed list has no dedicated BLESSES value; WISHES_FOR_THIRD_PARTY is the closest illocutionary fit and matches the third-party direction (cf. P06 used WISHES_FOR_HEARER for Boaz blessing Ruth directly, his addressee — here the blessed party is a third party, not the addressee). Flagged for the lead (JC-3)."
    },
    {
      "decision_id": "P07-D10",
      "decision": "Ruth's relay of Boaz's stay-close word encoded as REPORTS_PRIOR_SPEECH_INSTRUCTION.",
      "description": "At v.21 Ruth reports what Boaz said to her ('Stay close to my workers until they have finished my whole harvest'). P12 decomposes this into two reported_instruction_components, each carrying REPORTS_PRIOR_SPEECH_INSTRUCTION (the present illocution is Ruth's report, not Boaz's original directive). Parallels P06-D / P3's REPORTS_OWN_PRIOR_PROHIBITION pattern, but here the reporter is the hearer relaying the speaker's instruction, so the cross-corpus REPORTS_PRIOR_SPEECH_INSTRUCTION applies."
    },
    {
      "decision_id": "P07-D11",
      "decision": "Multi-event propositions decomposed into *_components; single-event propositions kept atomic.",
      "description": "Four propositions carry component arrays: P7 (two questions → question_components), P10 (living + dead → unforsaken_hesed_toward), P12 (stay-close + whole-harvest → reported_instruction_components), P13 (it-is-good + warning → counsel_components), P15 (barley + wheat → season_span_components). Each component carries a mandatory speech_act from the closed list. The other eleven propositions are single narrated events kept atomic with a top-level speech_act. Slot names are event-participant terms only (gleaner, beater, carrier, shower, giver, blesser, reporter, recognized_party, counselor/speaker, stayer, dweller); no grammatical-frame names (agent/patient/theme/recipient/beneficiary)."
    },
    {
      "decision_id": "P07-D12",
      "decision": "Two FM-only codes encode map prose the map left as bare Hebrew (TM_TODAY, TH_LEFTOVER_FROM_SATIETY_FORM).",
      "description": "The map's §3D Scene 3 carries 'today' (הַיּוֹם) as bare Hebrew with no [[code]]; the registered TM_TODAY exists in the BCD and is the correct code, so S3 declares it and id-check reports it FM-not-map (expected — the map prose is uncoded, not in conflict). The map's §3C Scene 2 carries 'what she had left over from her satiety' (הַמּוֹתָר מִשָּׂבְעָהּ) as bare Hebrew with no code; this is a load-bearing structural object (the second gift Ruth gives Naomi; the surface anchor of FIG_0113), so it is encoded as TH_LEFTOVER_FROM_SATIETY_FORM and registered in BCD-DELTA to_bcd.objects. TH_ codes are unregistered-by-design (id-check 'unverifiable', expected per SC-0020). Flagged for the lead (JC-1, JC-2)."
    }
  ],
  "vocabulary_additions": {
    "proposition_kinds": [
      { "value": "GLEANED_UNTIL_EVENING", "source": "Proposition 1 (2:17a); map §4 'gleaning … until evening'", "status": "ACCEPTED" },
      { "value": "BEAT_OUT_GLEANING", "source": "Proposition 2 (2:17b); map §4 'beating out'", "status": "ACCEPTED" },
      { "value": "MEASURED_OUT_TO_EPHAH", "source": "Proposition 3 (2:17c); map §4 'measuring out … about an ephah'", "status": "ACCEPTED" },
      { "value": "CARRIED_GRAIN_INTO_TOWN", "source": "Proposition 4 (2:18a); map §4 'carrying … into the town'", "status": "ACCEPTED" },
      { "value": "SHOWED_GLEANING_TO_MOTHER_IN_LAW", "source": "Proposition 5 (2:18b); map §4 'showing … what Ruth had gleaned'", "status": "ACCEPTED" },
      { "value": "GAVE_LEFTOVER_FOOD", "source": "Proposition 6 (2:18c); map §4 'giving … what she had left over from her meal'", "status": "ACCEPTED" },
      { "value": "ASKED_WHERE_SHE_GLEANED", "source": "Proposition 7 (2:19a); map §4 'asking … where she gleaned today / where she worked'", "status": "ACCEPTED" },
      { "value": "BLESSED_THE_MAN_BEFORE_KNOWING_HIM", "source": "Proposition 8 (2:19b); map §4 'blessing … the man who took notice of Ruth … before Ruth names him'", "status": "ACCEPTED" },
      { "value": "REPORTED_NAME_OF_THE_MAN", "source": "Proposition 9 (2:19c); map §4 'reporting … his name was Boaz'", "status": "ACCEPTED" },
      { "value": "BLESSED_YHWH_FOR_UNFORSAKEN_HESED", "source": "Proposition 10 (2:20a); map §4 'blessing … the LORD … had not let go of his hesed … living … dead'", "status": "ACCEPTED" },
      { "value": "RECOGNIZED_MAN_AS_NEAR_REDEEMER", "source": "Proposition 11 (2:20b); map §4 'recognizing … near to us … one of our redeemers'", "status": "ACCEPTED" },
      { "value": "REPORTED_BOAZ_STAY_CLOSE_INSTRUCTION", "source": "Proposition 12 (2:21); map §4 'reporting … stay close to his workers … until they finish his whole harvest'", "status": "ACCEPTED" },
      { "value": "COUNSELED_TO_STAY_WITH_BOAZ_YOUNG_WOMEN", "source": "Proposition 13 (2:22); map §4 'counseling … go out with his young women … warn against … another field'", "status": "ACCEPTED" },
      { "value": "STAYED_CLOSE_TO_GLEAN", "source": "Proposition 14 (2:23a); map §4 'staying close … to glean'", "status": "ACCEPTED" },
      { "value": "GLEANED_THROUGH_BOTH_HARVESTS", "source": "Proposition 15 (2:23b); map §4 'gleaning through the season … barley … wheat'", "status": "ACCEPTED" },
      { "value": "DWELT_WITH_MOTHER_IN_LAW", "source": "Proposition 16 (2:23c); map §4 'dwelling … with her mother-in-law'", "status": "ACCEPTED" }
    ],
    "scene_kinds": [
      { "value": "GLEANING_COMPLETION_SCENE", "source": "Scene 1 (2:17); map §3 'Ruth finishes gleaning; the ephah of barley'", "status": "ACCEPTED" },
      { "value": "HOMECOMING_PROVISION_SCENE", "source": "Scene 2 (2:18); map §3 'Ruth brings it home; the leftover food'", "status": "ACCEPTED" },
      { "value": "RECOGNITION_AND_BLESSING_SCENE", "source": "Scene 3 (2:19-21); map §3 'Naomi's questions, Ruth's report, and the blessing on Boaz'. Reuses the canonical P06 S2 scene_kind.", "status": "ACCEPTED" },
      { "value": "COUNSEL_AND_SEASON_CLOSE_SCENE", "source": "Scene 4 (2:22-23); map §3 'Naomi's counsel; Ruth stays through the harvests'", "status": "ACCEPTED" }
    ],
    "presence_values": [],
    "arc_elements": [
      { "value": "GLEANING_COMPLETED", "source": "map §2.1 'Ruth finishes her gleaning, beats out … a full ephah'", "status": "ACCEPTED" },
      { "value": "HOMECOMING_WITH_PROVISION", "source": "map §2.1 'She carries it into town, shows her mother-in-law … hands her the food left over'", "status": "ACCEPTED" },
      { "value": "RECOGNITION_OF_REDEEMER", "source": "map §2.1 'Naomi recognizes the name: he is a near kinsman, one of their redeemers'", "status": "ACCEPTED" },
      { "value": "HESED_PRONOUNCED_OVER_LIVING_AND_DEAD", "source": "map §2.1 'She blesses the LORD, whose hesed … has not let go of the living or the dead'", "status": "ACCEPTED" },
      { "value": "STAYING_CLOSE_THROUGH_HARVEST", "source": "map §2.1 'Ruth does, gleaning with them to the end of the barley and the wheat harvests'", "status": "ACCEPTED" }
    ],
    "context_elements": [
      { "value": "DIVINE_CONTEXT", "source": "map §2.2 'the hesed word … the LORD … is spoken here'; Naomi blesses YHWH at v.20. Reuses the canonical P06 context value.", "status": "ACCEPTED" },
      { "value": "PRIOR_ACTION_CONTEXT", "source": "map §2.2 'This follows straight on the day in Boaz's field'. Reuses the canonical P06 context value.", "status": "ACCEPTED" }
    ],
    "tone_elements": [
      { "value": "STEADY", "source": "map §2.3 'The field lines at v.17 are plain and busy'. Canonical P01 pace value reused on the tone axis.", "status": "ACCEPTED" },
      { "value": "QUICKENED_AT_RECOGNITION", "source": "map §2.3 'The pace lifts the moment Ruth gets home … fires two short questions in a rush, then breaks into blessing'", "status": "ACCEPTED" },
      { "value": "WARM", "source": "map §2.3 settled, close mother/daughter-in-law exchange. Reuses the canonical P06 tone value.", "status": "ACCEPTED" },
      { "value": "WEIGHTED", "source": "map §2.3 'The high point is her recognition at v.20'. Canonical P01 tone value reused.", "status": "ACCEPTED" },
      { "value": "SETTLED_HOPE", "source": "map §2.3 'The mood by the end is settled hope — no longer empty, with a kinsman now in view'", "status": "ACCEPTED" }
    ],
    "pace_elements": [
      { "value": "STEADY_AT_FIELD", "source": "map §2.3 'The field lines at v.17 are plain and busy — gleaning, beating out, measuring'", "status": "ACCEPTED" },
      { "value": "QUICKENED_AT_HOMECOMING", "source": "map §2.3 'The pace lifts the moment Ruth gets home … two short questions in a rush'", "status": "ACCEPTED" },
      { "value": "STRETCHED_OVER_SEASON_AT_CLOSE", "source": "map §2.3 'v.23 stretches out over weeks of harvest in a single quiet summary'", "status": "ACCEPTED" }
    ],
    "communicative_function_elements": [
      { "value": "CLOSES_HARVEST_PROVISION_THREAD", "source": "map §2.4 'This passage closes the harvest-provision strand the chapter has carried'", "status": "ACCEPTED" },
      { "value": "NAMES_REDEEMER_ROLE_FIRST_IN_BOOK", "source": "map §2.4 'the first time the rescuing role is spoken in the book'", "status": "ACCEPTED" },
      { "value": "RETURNS_HESED_WORD_OVER_LIVING_AND_DEAD", "source": "map §2.4 'It brings back the hesed word … and stretches it over the living and the dead'", "status": "ACCEPTED" },
      { "value": "REASSERTS_RUTH_AS_MOABITE_AT_INCORPORATION", "source": "map §2.4 'It reasserts Ruth as the Moabite at the very moment she repeats Boaz's welcome'", "status": "ACCEPTED" },
      { "value": "CLOSES_CLINGING_IMAGE_RHYME", "source": "map §2.4 'closes Ruth's clinging — the same word used when she first held fast to Naomi'", "status": "ACCEPTED" }
    ],
    "referential_forms": [
      { "value": "HER_MOTHER_IN_LAW_KINSHIP_FORM", "source": "map §3A Scenes 2-3 'her mother-in-law' (חֲמוֹתָהּ); B3 named only by the kinship-word at vv.18-19", "status": "ACCEPTED" },
      { "value": "RUTH_THE_MOABITESS_NARRATOR_EPITHET", "source": "map §3A Scene 3 'the narrator names her the Moabite again as she speaks at v.21'", "status": "ACCEPTED" },
      { "value": "THE_LORD_YHWH", "source": "map §3A Scene 3 B10 'YHWH … the God of Israel'", "status": "ACCEPTED" },
      { "value": "ONE_OF_OUR_REDEEMERS_FORM", "source": "map §3A Scene 3 B18 'one of our redeemers' (גֹּאֲלֵנוּ)", "status": "ACCEPTED" },
      { "value": "THE_DEAD_GENERIC_FORM", "source": "map §3A Scene 3 'the dead … named here only as the dead, not individually'", "status": "ACCEPTED" },
      { "value": "THE_MAN_WHO_TOOK_NOTICE_OF_HER", "source": "map §4 Proposition 8 'the man who took notice of Ruth … before Ruth names him'", "status": "ACCEPTED" }
    ],
    "other": [
      { "category": "PRESENCE", "value": "PRESENT", "source": "canonical P01 presence value reused for B9/B3 across S1-S4", "status": "CONFIRMED", "note": "Not a new value; recorded for completeness. PRESENT and REFERENCED are both canonical-P01." }
    ]
  },
  "proposition_kind_slot_sets": [
    {
      "proposition_kind": "ASKED_WHERE_SHE_GLEANED",
      "slot_set": ["speaker", "addressee", "asked_about_day", "question_components"],
      "component_record_shape": {
        "action": "required",
        "list_position": "required — FIRST / SECOND",
        "speech_act": "required — ASKS_INFORMATION_SEEKING_QUESTION"
      },
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P7"],
      "note": "Naomi's doubled question (where gleaned today / where worked) as two information-seeking components."
    },
    {
      "proposition_kind": "BLESSED_THE_MAN_BEFORE_KNOWING_HIM",
      "slot_set": ["blesser", "blessing_recipient", "blessing_recipient_referential_form", "name_known_status"],
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P8"],
      "note": "Single third-party blessing; speech_act WISHES_FOR_THIRD_PARTY at proposition top level; name_known_status records the blessing precedes the naming."
    },
    {
      "proposition_kind": "BLESSED_YHWH_FOR_UNFORSAKEN_HESED",
      "slot_set": ["blesser", "invoked_divine_agent", "invoked_divine_agent_referential_form", "hesed_source_antecedent", "unforsaken_hesed_toward"],
      "component_record_shape": {
        "toward_party": "THE_LIVING_GENERIC / THE_DEAD_GENERIC (generic, not individuated)",
        "list_position": "required — FIRST / SECOND",
        "speech_act": "required — STATES_AS_TRUE"
      },
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P10"],
      "note": "hesed_source_antecedent HELD_OPEN_YHWH_OR_BOAZ keeps the antecedent ambiguity structural (P07-D1). The two toward-parties are generic per P07-D2."
    },
    {
      "proposition_kind": "RECOGNIZED_MAN_AS_NEAR_REDEEMER",
      "slot_set": ["speaker", "addressee", "recognized_party", "kinship_proximity_form", "named_role", "named_role_referential_form"],
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P11"],
      "note": "named_role is the registry being B18 (The-Redeemer); the 'near to us' nearness is carried in kinship_proximity_form. First naming of the redeemer-role in the book."
    },
    {
      "proposition_kind": "REPORTED_BOAZ_STAY_CLOSE_INSTRUCTION",
      "slot_set": ["reporter", "reporter_referential_form", "addressee", "reported_speaker", "reported_instruction_components"],
      "component_record_shape": {
        "action": "required",
        "list_position": "required — FIRST / SECOND",
        "speech_act": "required — REPORTS_PRIOR_SPEECH_INSTRUCTION"
      },
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P12"],
      "note": "Reported speech: the present illocution is Ruth's report, not Boaz's original directive (P07-D10)."
    },
    {
      "proposition_kind": "COUNSELED_TO_STAY_WITH_BOAZ_YOUNG_WOMEN",
      "slot_set": ["speaker", "addressee", "address_form", "counsel_components"],
      "component_record_shape": {
        "action": "required",
        "list_position": "required — FIRST / SECOND",
        "speech_act": "required — STATES_AS_TRUE"
      },
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P13"],
      "note": "address_form MY_DAUGHTER for Naomi to Ruth at v.22. The 'it is good' statement and the 'another field' warning are two declarative components."
    },
    {
      "proposition_kind": "GLEANED_THROUGH_BOTH_HARVESTS",
      "slot_set": ["gleaner", "duration", "season_span_components"],
      "component_record_shape": {
        "action": "required — GLEANED_TO_END_OF_BARLEY_HARVEST / GLEANED_TO_END_OF_WHEAT_HARVEST",
        "list_position": "required — FIRST / SECOND",
        "speech_act": "required — STATES_AS_TRUE"
      },
      "status": "CONFIRMED",
      "occurrences_in_pericope": ["P15"],
      "note": "The two harvest seasons (barley then wheat) as two span components; duration TM_EXTENDED_HARVEST_SPAN frames the whole."
    }
  ],
  "high_risk_register_audit": [
    {
      "id": "R1",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0104 Abundance Triplet — CLOSES at 2:18 (P07 P6); opened at P06 P15 (2:14)",
      "note": "REQUIRED keep-image. The 'had leftover' third verb of the P06 triplet must land here as the leftover food Ruth gives Naomi, so the abundance-after-famine image is audible across the pericope boundary. Cross-pericope pair closes here.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0104 'cross-pericope pair closes here at 2:18; opened at P06 Proposition 15, 2:14'); Section 3C Scene 2 Objects (the leftover food)"
    },
    {
      "id": "R2",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "Living-and-dead formula at v.20 (P10); 'the dead' kept generic, not individuated",
      "note": "The dead are named only as הַמֵּתִים 'the dead,' never as Elimelech, Mahlon, and Chilion. The reconstructor must keep the dead generic in the formula and must not individuate the three men. The formula stretches the LORD's hesed over the dead husband and sons without naming them.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 3A Scene 3 ('the dead … named here only as the dead, not individually'); Section 3C Scene 3 (CB_0039 'the dead are not dropped from the family's accounting'); Significant Absence in Scene 3"
    },
    {
      "id": "R3",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0111 Hesed-Not-Forsaken at 2:20 (P10); antecedent held open (YHWH or Boaz)",
      "note": "PREFERRED keep-image. Opens here; closes at P09 3:10. The antecedent of 'who has not forsaken his hesed' is grammatically ambiguous — YHWH or Boaz — and must be kept open. The reconstructor must not resolve the antecedent to either party.",
      "required_in_audit": true,
      "do_not_decide": true,
      "carries_forward_to": "P09_audit",
      "source_in_meaning_map": "Section 3C Scene 3 (CB_0011 'the antecedent (the LORD or Boaz) is left open'); Section 5B Figure Flags (FIG_0111 'antecedent of has not forsaken — the LORD or Boaz — held open')"
    },
    {
      "id": "R4",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0110 Living-and-Dead Formula at 2:20 (P10) — theological hinge",
      "note": "REQUIRED keep-image. Opens here; pairs forward to P11 4:5 and P12 4:10. The paired phrase 'the living and the dead' must render as a deliberate pair so the dead remain in the family's covenantal accounting across the book. Theological hinge of the pericope.",
      "required_in_audit": true,
      "do_not_decide": true,
      "carries_forward_to": "P11_audit",
      "source_in_meaning_map": "Section 3C Scene 3 (CB_0039 'pairs forward to 4:5 and 4:10'); Section 5B Figure Flags (FIG_0110 'theological hinge of the pericope')"
    },
    {
      "id": "R5",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0112 Close-to-Us at 2:20 (P11); kinship-nearness that creates obligation",
      "note": "PREFERRED keep-image. Opens here; pairs forward to P09 3:12 and P11 4:1-6. The 'near to us' (קָרוֹב לָנוּ) nearness is what creates the redeemer obligation; it must read as genealogical-clan nearness, not mere acquaintance. Sets up the nearer-redeemer tension of chapters 3-4.",
      "required_in_audit": true,
      "do_not_decide": true,
      "carries_forward_to": "P09_audit",
      "source_in_meaning_map": "Section 3C Scene 3 (CB_0001 'the near to us nearness is what creates the obligation'); Section 5B Figure Flags (FIG_0112 'pairs forward to P09 3:12 and P11 4:1-6')"
    },
    {
      "id": "R6",
      "kind": "CROSS_PERICOPE_PAIRING_FIRST_OCCURRENCE",
      "applies_to": "FIG_0012 Clinging-Dabaq image-rhyme — CLOSES at 2:23 (P07 P14); opened at P02 P14 (1:14)",
      "note": "PREFERRED keep-image. The davaq root that tagged Ruth's clinging to Naomi at 1:14 returns here as her staying-close to Boaz's young women. If the target language can carry the verbal echo, the same clinging/holding-fast word should render at both 1:14 and 2:23 so the image-rhyme links Ruth's first loyalty to her continued footing under Boaz's protection.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 3C Scene 4 (CB_0018 'the same word used when she first clung to Naomi at 1:14, now rhyming her loyalty forward'); Section 5B Figure Flags (FIG_0012 'image-rhyme pair closes here at 2:23; opened at P02 Proposition 14, 1:14')"
    },
    {
      "id": "R7",
      "kind": "NAMING_SHIFT",
      "applies_to": "FIG_0001 Ruth-the-Moabitess narrator-epithet at v.21 (P12)",
      "note": "REQUIRED keep-image. The narrator reasserts 'Ruth the Moabitess' precisely as she repeats Boaz's welcome — the foreigner-marker returns where incorporation is at stake. The epithet must remain visible; it is not decorative repetition but a structural marker of Ruth's outsider standing as her place in the household grows. Book-wide pattern (1:22; 2:6; 2:21; 4:5; 4:10).",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 3A Scene 3 ('the narrator names her the Moabite again as she speaks at v.21'); Section 5B Figure Flags (FIG_0001 'narrator's epithet at 2:21; carry-forward arc opened P01 1:4')"
    },
    {
      "id": "R8",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "CEREMONIAL blessing form at v.20a inside INFORMAL_CASUAL chronicle (P10)",
      "note": "Naomi's v.20 blessing ('Blessed be he of the LORD') carries formal, weighty blessing-shape and names YHWH; declared at moment-level register_overrides at v.20a. The blessing must read as ceremonial against the plain home-talk frame, then the talk settles back to intimate register for the redeemer-recognition and counsel.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 1 Metadata multi-level register tagging ('One line inside that talk lifts higher, to CEREMONIAL: Naomi's blessing on Boaz at v.20')"
    },
    {
      "id": "R9",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "INTIMATE home-talk register across vv.19-22 (S3 and the v.22 counsel)",
      "note": "The talk between the two women back home shifts from the narrator's plain telling to INTIMATE — a mother-in-law and daughter-in-law alone at day's end, the day's surprise spilling out. Declared at scene-level on S3. The exchange should read as close, private, unguarded against the surrounding chronicle frame.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 1 Metadata multi-level register tagging ('The talk between the two women back home (vv.19-22) shifts to INTIMATE'); Section 3 Scene 3 ('Scene-level register override: INTIMATE (vv.19-22)')"
    },
    {
      "id": "R10",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "Blessing-before-naming sequence at v.19 (P8 then P9)",
      "note": "Naomi blesses 'the man who took notice of you' BEFORE she learns his name. The ordering — blessing, then Ruth naming Boaz — must be preserved; Naomi's blessing is not yet attached to a name. The reconstructor must not move the name earlier or fold the two into one beat.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 4 Proposition 8 ('Did she yet know his name? — no — she blesses him before Ruth names him'); Proposition 9 ('his name was Boaz')"
    },
    {
      "id": "R11",
      "kind": "NUMBER_MEASURE_EXACT_RENDERING",
      "applies_to": "About an ephah of barley at v.17 (P3); CB_0040",
      "note": "The day's gleaning comes to about an ephah (≈ a bushel) of barley — a heavy haul for one gleaner in one day, the plain measure of how far Boaz's favor reached. The quantity is approximate ('about an ephah') and must render as a large but inexact measure, not a precise figure.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 3C Scene 1 Objects (O12 'a large measure of grain (about a bushel)'; CB_0040 active at Propositions 3, 6); Section 4 Proposition 3"
    },
    {
      "id": "R12",
      "kind": "DISCOURSE_THREAD_OPENED",
      "applies_to": "T2 redeemer/line thread named-in-full at 2:20; T7 harvest-provision RESOLVED at 2:23; T4 hesed-thread lexeme returns at 2:20",
      "note": "Three threads turn here. T2 (line/redemption): the redeemer-role is named aloud for the first time in the book — the characters now share the redeemer-frame the audience has held since 2:1. T7 (harvest-provision): closes/resolves as Ruth gleans to the end of both harvests. T4 (hesed): the hesed lexeme, kept back through the field scenes, returns on Naomi's lips at v.20 (first hesed lexeme in chapter 2). See the paired BCD-DELTA discourse_thread_events for the full set.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 2.2 Context ('the redeemer-role is named here for the first time in the book'; 'The hesed word … is spoken here for the first time in chapter 2'); Section 2.4 Communicative Function"
    },
    {
      "id": "R13",
      "kind": "STRUCTURAL_ABSENCE_OF_DIVINE_AGENCY",
      "applies_to": "Held-open hesed antecedent and silence on Ruth's understanding (vv.20-21)",
      "note": "Naomi does not explain what a redeemer is or what it could mean for them; she names the role and stops, and the narrator does not say what Ruth understands by it. Combined with the held-open hesed antecedent, the passage leaves the agency of rescue (YHWH's hesed / Boaz's role) and Ruth's grasp of it deliberately unstated. The reconstructor must not fill these silences.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Significant Absence in Scene 3 ('Naomi does not explain to Ruth what a redeemer is … she names the role and stops. The narrator does not say what Ruth understands by it')"
    },
    {
      "id": "R14",
      "kind": "STRUCTURAL_ABSENCE_OF_GRIEF",
      "applies_to": "No further Ruth-Boaz contact through the harvest weeks (v.23 close)",
      "note": "The narrator does not say Ruth and Boaz meet again or speak again through all the weeks of harvest; the season passes with no further contact recorded. The quiet must be preserved — the next move waits for Naomi's plan in chapter 3. The reconstructor must not invent intervening encounters.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Significant Absence in Scene 4 ('The narrator does not say Ruth and Boaz meet again, or speak again … The season passes with no further contact recorded')"
    }
  ],
  "cross_pericope_pair_verification": {
    "pairs": [
      {
        "fig_id": "FIG_0104",
        "opens_at": "P06 P15 (2:14 third verb 'had leftover')",
        "closes_at": "P07 P6 (2:18 leftover food Ruth gives Naomi)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at P07 compilation. P06 opened it (P06 R10) and recorded it PENDING pending P07; the forward link now lands structurally at P07 P6 with cross_ref recording the close. Registry frontmatter confirms opens-at P06 / closes-at P07."
      },
      {
        "fig_id": "FIG_0012",
        "opens_at": "P02 P14 (1:14 Ruth clings to Naomi)",
        "closes_at": "P07 P14 (2:23 Ruth stays close to Boaz's young women)",
        "verification_status": "VERIFIED",
        "note": "Image-rhyme pair closed at P07 compilation. The davaq root opens at P02 1:14 and closes here at 2:23; registry frontmatter confirms opens-at P02 / closes-at P07. Cross_ref on P14 records the close."
      },
      {
        "fig_id": "FIG_0111",
        "opens_at": "P07 P10 (2:20 hesed not forsaken)",
        "closes_at": "P09 3:10 ('you have made this last hesed greater than the first')",
        "verification_status": "PENDING",
        "note": "P09 not yet compiled under Pilot 2. Verification deferred pending P09 compilation. Antecedent held open (YHWH or Boaz) per P07-D1/R3."
      },
      {
        "fig_id": "FIG_0112",
        "opens_at": "P07 P11 (2:20 close to us)",
        "closes_at": "P09 3:12 ('a redeemer nearer than I'); P11 4:1-6",
        "verification_status": "PENDING",
        "note": "P09 and P11 not yet compiled under Pilot 2. Verification deferred. Forward-pair anchor for the nearer-redeemer tension."
      },
      {
        "fig_id": "FIG_0110",
        "opens_at": "P07 P10 (2:20 living and dead)",
        "closes_at": "P11 4:5; P12 4:10",
        "verification_status": "PENDING",
        "note": "P11 and P12 not yet compiled under Pilot 2. Verification deferred. Theological hinge pairing forward to the legal acquisition scenes."
      },
      {
        "fig_id": "FIG_0113",
        "opens_at": "P07 P6 (2:18 leftover after satiety)",
        "closes_at": "P08 (3:1-5)",
        "verification_status": "PENDING",
        "note": "P08 not yet compiled under Pilot 2. Verification deferred. OPTIONAL small abundance-after-famine image."
      },
      {
        "fig_id": "FIG_0001",
        "opens_at": "P01 P6 (1:4 / book-wide foreigner-marker)",
        "closes_at": "P12 4:10 (book-wide pattern: 1:22; 2:6; 2:21; 4:5; 4:10)",
        "verification_status": "PENDING",
        "note": "Book-wide narrator-epithet pattern. Active at P07 2:21 (P12). P06-D8 deferred FIG_0001 forward to here; it now fires. Downstream members (4:5, 4:10) not yet compiled; verification of the full arc deferred."
      }
    ]
  },
  "validation_checklist": {
    "meaning_map_contains_only_story_content": true,
    "for_model_contains_only_inference_signal": true,
    "every_proposition_has_cb_flags_and_figure_flags": true,
    "every_being_in_propositions_declared_in_scenes": true,
    "every_place_in_propositions_declared_in_scenes": true,
    "every_object_in_propositions_declared_in_scenes": true,
    "every_time_in_propositions_declared_in_scenes": true,
    "no_grammatical_frame_slot_names": true,
    "speech_act_present_on_all_component_records": true,
    "speech_act_values_used": [
      "STATES_AS_TRUE",
      "ASKS_INFORMATION_SEEKING_QUESTION",
      "WISHES_FOR_THIRD_PARTY",
      "REPORTS_PRIOR_SPEECH_INSTRUCTION"
    ],
    "negation_not_double_encoded": "N/A — no DIRECTS_HEARER_NOT_TO_DO in P07; Naomi's 'another field' warning is encoded as a positive STATES_AS_TRUE warning component, not a prohibition.",
    "cross_pericope_cross_refs_present_on_correct_propositions": true,
    "empty_slot_rule_applied_to_times_in_scene": true,
    "discourse_threads_tracked_in_audit_only": true,
    "known_limitations_tracked_in_audit_only": true,
    "high_risk_register_complete": true,
    "every_high_risk_entry_traces_to_meaning_map": true,
    "significant_absences_traced_to_meaning_map": true,
    "no_content_added_beyond_meaning_map": true,
    "wife_pairing_withholding_enforced": true,
    "b_codes_match_bcd_version": "All B-codes verified against ruth_pilot_BCD_v0_3 (B2, B3, B9, B10, B13, B16, B18). All places (PL4, PL5, PL5_BOAZ_PORTION, PL_NAOMIS_DWELLING), times (TM_EVENING, TM_TODAY, TM_EXTENDED_HARVEST_SPAN), and objects (O2, O3, O12) verified present in the BCD.",
    "registry_additions_extracted_to_bcd_delta": true,
    "no_reviewer_facing_prompts_in_compilation_log": true
  },
  "known_limitations": [
    "Hesed antecedent at v.20 held open (YHWH or Boaz) per the blessed map and FIG_0111 (P07-D1, R3). The reconstructor must preserve the ambiguity; the FOR_MODEL records it as hesed_source_antecedent: HELD_OPEN_YHWH_OR_BOAZ.",
    "'The dead' kept generic (P07-D2, R2). B2 (Elimelech) is the registered BCD anchor declared in S3 for the dead-of-household, with referential_form THE_DEAD_GENERIC_FORM and a generic-not-individuated role; this does NOT individuate the dead trio in the living-and-dead formula. Flagged for the lead in case a non-being encoding of 'the dead' is preferred.",
    "Two FM-only codes (TM_TODAY at S3; TH_LEFTOVER_FROM_SATIETY_FORM at S2) encode map prose the map left as bare Hebrew without a [[code]] (P07-D12). id-check reports them FM-not-map (expected — uncoded map prose, not in conflict) and TH_LEFTOVER_FROM_SATIETY_FORM as unverifiable (TH_ thematic overlay, expected per SC-0020).",
    "Naomi's two barukh-formula blessings (P8 man, P10 YHWH) encoded as WISHES_FOR_THIRD_PARTY (P07-D9) — the closest closed-list illocution; the closed SPEECH_ACT list has no dedicated BLESSES_THIRD_PARTY value. Flagged for the lead.",
    "Cross-pericope pairs FIG_0111, FIG_0112, FIG_0110, FIG_0113 (and the downstream members of FIG_0001) open here but close in P08/P09/P11/P12, which are not yet compiled under Pilot 2; their verification is deferred.",
    "Scene-level INTIMATE override attached to S3 (vv.19-21); the map marks the override as vv.19-22, but the v.22 counsel falls in S4. The v.22 counsel reads as continuous intimate home talk; flagged for the lead (P07-D4) in case a second scene-level override on S4 is wanted.",
    "validation_checklist.wife_pairing_withholding_enforced is set true vacuously: P07 has no wife-pairing event, so there is no pairing to disclose or withhold. The analogous source-discipline move in P07 is keeping 'the dead' generic (P07-D2).",
    "community_verified and translation_team_verified remain false; this is a pilot compilation drafted for Gate F."
  ]
}
```
