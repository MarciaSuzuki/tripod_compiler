---
type: "sta-for-model"
pericope: "P07"
pericope-title: "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest"
source-meaning-map: [[P07-Ruth-2-17-23]]
status: "valid"
pilot: "pilot-2"
---

# P07 — Ruth 2:17–23 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_07_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 2:17-23",
    "pericope_title": "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P07-Ruth-2-17-23",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Scene-level INTIMATE override on S3 (the home talk between Naomi and Ruth, vv.19-22 — mother-in-law and daughter-in-law alone at day's end, the day's surprise spilling out). One moment-level CEREMONIAL override at v.20a for Naomi's formal, weighty blessing on Boaz invoking YHWH ('Blessed be he of the LORD'). The narrator's framing voice at v.17, v.18a, and v.23 stays in the plain everyday telling.",
      "scene_level": [
        {
          "scene_id": "S3",
          "override_value": "INTIMATE",
          "genre_override": null,
          "genre_group_override": null
        }
      ],
      "moment_level": [
        {
          "verse": "2:20a",
          "override_value": "CEREMONIAL",
          "genre_override": null,
          "genre_group_override": null
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "GLEANING_COMPLETED",
      "HOMECOMING_WITH_PROVISION",
      "RECOGNITION_OF_REDEEMER",
      "HESED_PRONOUNCED_OVER_LIVING_AND_DEAD",
      "STAYING_CLOSE_THROUGH_HARVEST"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "DIVINE_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "PRIOR_ACTION_CONTEXT"
    ],
    "tone_elements": [
      "STEADY",
      "QUICKENED_AT_RECOGNITION",
      "WARM",
      "WEIGHTED",
      "SETTLED_HOPE"
    ],
    "pace_elements": [
      "STEADY_AT_FIELD",
      "QUICKENED_AT_HOMECOMING",
      "STRETCHED_OVER_SEASON_AT_CLOSE"
    ],
    "communicative_function_elements": [
      "CLOSES_HARVEST_PROVISION_THREAD",
      "NAMES_REDEEMER_ROLE_FIRST_IN_BOOK",
      "RETURNS_HESED_WORD_OVER_LIVING_AND_DEAD",
      "REASSERTS_RUTH_AS_MOABITE_AT_INCORPORATION",
      "CLOSES_CLINGING_IMAGE_RHYME"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "2:17",
      "scene_kind": "GLEANING_COMPLETION_SCENE",
      "scene_communicative_purpose": "Records the size of the day's gleaning — a full ephah — as the plain proof of how much favor Ruth was shown.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER_FINISHING_DAYS_WORK_AND_BEATING_OUT_GRAIN",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "FIELD_WHERE_GLEANING_IS_FINISHED_BEFORE_HOMECOMING"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0034",
            "function_in_scene": "GLEANING_INSTITUTION_NAMING_RUTHS_WORK_THROUGH_TO_END_OF_DAY"
          },
          {
            "object_id": "O12",
            "function_in_scene": "EPHAH_MEASURE_OF_DAYS_GATHERING_NAMED_EXACTLY"
          },
          {
            "object_id": "O2",
            "function_in_scene": "BARLEY_THE_GRAIN_THE_EPHAH_IS_MADE_OF"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_EVENING",
            "role_in_scene": "END_OF_WORKING_DAY_RUTH_GLEANS_UP_TO"
          }
        ]
      },
      "significant_absence": "The narrator gives no reaction, no word, and no one watching as Ruth works the day out alone; only the bare measure of the gleaning is reported."
    },
    {
      "scene_id": "S2",
      "verse_range": "2:18",
      "scene_kind": "HOMECOMING_PROVISION_SCENE",
      "scene_communicative_purpose": "Brings the field's plenty home: Ruth shows the full gleaning and feeds Naomi from her own leftovers, closing the abundance-after-famine image.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "CARRIER_OF_GRAIN_TO_TOWN_SHOWING_IT_AND_GIVING_LEFTOVER_FOOD",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW_WHO_SEES_THE_GLEANING_AND_RECEIVES_LEFTOVER_FOOD",
            "presence": "PRESENT",
            "referential_form": "HER_MOTHER_IN_LAW_KINSHIP_FORM"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4",
            "role_in_scene": "TOWN_RUTH_CARRIES_THE_GRAIN_INTO"
          },
          {
            "place_id": "PL_NAOMIS_DWELLING",
            "role_in_scene": "HOUSEHOLD_INTERIOR_WHERE_GRAIN_IS_SHOWN_AND_FOOD_HANDED_OVER"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O12",
            "function_in_scene": "GLEANED_BARLEY_NOW_CARRIED_HOME_AND_SHOWN_THE_DAYS_WHOLE_TAKE"
          },
          {
            "object_id": "TH_LEFTOVER_FROM_SATIETY_FORM",
            "function_in_scene": "FOOD_LEFT_FROM_RUTHS_OWN_MEAL_BROUGHT_BACK_AND_GIVEN_TO_NAOMI"
          }
        ]
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time runs on from the evening of Scene 1 into the homecoming.",
        "entries": null
      },
      "significant_absence": "The narrator does not record Naomi's first reaction to the sight, or any word between them, until her questions in the next verse. The amount is shown; the response is held back a beat."
    },
    {
      "scene_id": "S3",
      "verse_range": "2:19-21",
      "scene_kind": "RECOGNITION_AND_BLESSING_SCENE",
      "scene_communicative_purpose": "The turn of the passage: at the name 'Boaz,' Naomi recognizes a redeemer and blesses the LORD's hesed over the living and the dead — the day's food becomes the first sign of rescue.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "QUESTIONER_WHO_BLESSES_THE_MAN_THEN_BLESSES_THE_LORD_AND_NAMES_BOAZ_A_REDEEMER",
            "presence": "PRESENT",
            "referential_form": "HER_MOTHER_IN_LAW_KINSHIP_FORM"
          },
          {
            "being_id": "B9",
            "role_in_scene": "REPORTER_WHO_NAMES_THE_MAN_BOAZ_AND_REPEATS_HIS_WORDS_ABOUT_STAYING_CLOSE",
            "presence": "PRESENT",
            "referential_form": "RUTH_THE_MOABITESS_NARRATOR_EPITHET"
          },
          {
            "being_id": "B13",
            "role_in_scene": "MAN_RUTH_WORKED_BESIDE_BLESSED_THEN_RECOGNIZED_AS_NEAR_KINSMAN_AND_REDEEMER",
            "presence": "REFERENCED",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B10",
            "role_in_scene": "ONE_NAOMI_BLESSES_FOR_NOT_LETTING_GO_OF_HESED_TOWARD_LIVING_AND_DEAD",
            "presence": "REFERENCED",
            "referential_form": "THE_LORD_YHWH"
          },
          {
            "being_id": "B18",
            "role_in_scene": "KINSMAN_REDEEMER_ROLE_NAOMI_RECOGNIZES_BOAZ_AS_STANDING_IN_FIRST_NAMING_IN_BOOK",
            "presence": "REFERENCED",
            "referential_form": "ONE_OF_OUR_REDEEMERS_FORM"
          },
          {
            "being_id": "B?",
            "role_in_scene": "DEAD_OF_HOUSEHOLD_INCLUDED_IN_REACH_OF_HESED_GENERIC_THE_DEAD_NOT_INDIVIDUATED",
            "presence": "REFERENCED",
            "referential_form": "THE_DEAD_GENERIC_FORM"
          },
          {
            "being_id": "B16",
            "role_in_scene": "WORKERS_BOAZ_TOLD_RUTH_TO_KEEP_CLOSE_TO_AS_SHE_REPORTS_HIS_WORDS",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_NAOMIS_DWELLING",
            "role_in_scene": "HOME_WHERE_QUESTIONS_REPORT_AND_BLESSING_PASS_BETWEEN_THE_TWO_WOMEN"
          },
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "FIELD_NAOMI_ASKS_ABOUT_WHOSE_OWNER_LETS_HER_RECOGNIZE_BOAZ"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0011",
            "function_in_scene": "HESED_NAOMI_SAYS_THE_LORD_HAS_NOT_LET_GO_OF_TOWARD_LIVING_AND_DEAD_ANTECEDENT_HELD_OPEN"
          },
          {
            "object_id": "CB_0039",
            "function_in_scene": "LIVING_AND_DEAD_FORMULA_STRETCHING_KINDNESS_OVER_DEAD_HUSBAND_AND_SONS_NOT_ONLY_THE_LIVING"
          },
          {
            "object_id": "CB_0001",
            "function_in_scene": "KINSMAN_REDEEMER_ROLE_NAOMI_RECOGNIZES_BOAZ_AS_FILLING_NEAR_TO_US_NEARNESS_CREATES_OBLIGATION"
          },
          {
            "object_id": "CB_0034",
            "function_in_scene": "GLEANING_FRAME_FOR_BOAZ_WORD_THAT_RUTH_STAY_CLOSE_TO_HIS_WORKERS_AS_SHE_GATHERS"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_TODAY",
            "role_in_scene": "CONTENT_TIME_INSIDE_THE_TALK_THE_ONE_DAYS_WORK_NAOMI_ASKS_ABOUT"
          }
        ]
      },
      "significant_absence": "Naomi does not explain to Ruth what a redeemer is or what it could mean for them; she names the role and stops. The narrator does not say what Ruth understands by it. The dead are named only as 'the dead,' not as Elimelech, Mahlon, and Chilion."
    },
    {
      "scene_id": "S4",
      "verse_range": "2:22-23",
      "scene_kind": "COUNSEL_AND_SEASON_CLOSE_SCENE",
      "scene_communicative_purpose": "Closes the pericope and the harvest season: Ruth keeps close to Boaz's workers through both harvests — the same holding-fast she first showed Naomi — and stays in the household.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "COUNSELOR_TELLING_RUTH_IT_IS_GOOD_TO_GO_OUT_WITH_BOAZ_YOUNG_WOMEN",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B9",
            "role_in_scene": "ONE_TOLD_TO_KEEP_CLOSE_WHO_GLEANS_TO_END_OF_BOTH_HARVESTS_AND_KEEPS_LIVING_WITH_NAOMI",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B16",
            "role_in_scene": "BOAZ_YOUNG_WOMEN_RUTH_IS_TO_GO_OUT_AND_STAY_CLOSE_TO",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER_WHOSE_YOUNG_WOMEN_RUTH_KEEPS_CLOSE_TO_THROUGH_THE_HARVEST",
            "presence": "REFERENCED",
            "referential_form": "NAMED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "FIELD_RUTH_KEEPS_GLEANING_IN_WITH_THE_YOUNG_WOMEN_UNDER_BOAZ_COVER"
          },
          {
            "place_id": "PL5",
            "role_in_scene": "ANOTHER_FIELD_OUTSIDE_BOAZ_PROTECTION_NAOMI_WARNS_AGAINST"
          },
          {
            "place_id": "PL_NAOMIS_DWELLING",
            "role_in_scene": "HOME_RUTH_KEEPS_LIVING_IN_THROUGH_THE_HARVEST_SEASON"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0018",
            "function_in_scene": "DEVEK_CLINGING_HOW_RUTH_KEEPS_TO_BOAZ_YOUNG_WOMEN_THROUGH_THE_HARVEST"
          },
          {
            "object_id": "CB_0026",
            "function_in_scene": "BARLEY_AND_WHEAT_HARVEST_FRAME_THE_STRETCH_OF_TIME_RUTH_KEEPS_WORKING_AND_STAYING_CLOSE"
          },
          {
            "object_id": "O2",
            "function_in_scene": "BARLEY_THE_FIRST_OF_THE_TWO_HARVESTS_RUTH_GLEANS_THROUGH"
          },
          {
            "object_id": "O3",
            "function_in_scene": "WHEAT_THE_SECOND_OF_THE_TWO_HARVESTS_RUTH_GLEANS_THROUGH"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_EXTENDED_HARVEST_SPAN",
            "role_in_scene": "WHOLE_SPAN_OF_BOTH_HARVEST_SEASONS_RUTHS_STAYING_CLOSE_RUNS_ACROSS"
          }
        ]
      },
      "significant_absence": "The narrator does not say Ruth and Boaz meet again, or speak again, through all the weeks of harvest. The season passes with no further contact recorded; the next move waits for Naomi's plan in chapter 3."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "2:17a",
      "proposition_kind": "GLEANED_UNTIL_EVENING",
      "event_specific_slots": {
        "gleaner": "B9",
        "where": "PL5_BOAZ_PORTION",
        "until_when": "TM_EVENING",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": ["CB_0034"],
      "figure_flags": []
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "2:17b",
      "proposition_kind": "BEAT_OUT_GLEANING",
      "event_specific_slots": {
        "beater": "B9",
        "beaten_out": "O2",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "2:17c",
      "proposition_kind": "MEASURED_OUT_TO_EPHAH",
      "event_specific_slots": {
        "measured_yield": "O12",
        "grain_kind": "O2",
        "quantity_exactness": "ABOUT_AN_EPHAH",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": ["CB_0040"],
      "figure_flags": []
    },
    {
      "prop_id": "P4",
      "scene_link": "S2",
      "verse_anchor": "2:18a",
      "proposition_kind": "CARRIED_GRAIN_INTO_TOWN",
      "event_specific_slots": {
        "carrier": "B9",
        "carried_item": "O12",
        "destination": "PL4",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "2:18b",
      "proposition_kind": "SHOWED_GLEANING_TO_MOTHER_IN_LAW",
      "event_specific_slots": {
        "shower": "B9",
        "seer": "B3",
        "seer_referential_form": "HER_MOTHER_IN_LAW_KINSHIP_FORM",
        "shown_item": "O12",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "2:18c",
      "proposition_kind": "GAVE_LEFTOVER_FOOD",
      "event_specific_slots": {
        "giver": "B9",
        "given_party": "B3",
        "given_item": "TH_LEFTOVER_FROM_SATIETY_FORM",
        "given_item_source": "RUTHS_OWN_MEAL_IN_THE_FIELD",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P5"
      },
      "cross_ref": "FIG_0104 closes here at 2:18 (opened at P06 2:14; the 'had leftover' lands as the leftover Ruth gives Naomi); FIG_0113 opens here at 2:18 (closes at P08 3:1-5)",
      "cb_flags": ["CB_0040"],
      "figure_flags": ["FIG_0104", "FIG_0113"]
    },
    {
      "prop_id": "P7",
      "scene_link": "S3",
      "verse_anchor": "2:19a",
      "proposition_kind": "ASKED_WHERE_SHE_GLEANED",
      "event_specific_slots": {
        "speaker": "B3",
        "addressee": "B9",
        "asked_about_day": "TM_TODAY",
        "question_components": [
          {
            "action": "ASKED_WHERE_SHE_GLEANED_TODAY",
            "list_position": "FIRST",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "action": "ASKED_WHERE_SHE_WORKED",
            "list_position": "SECOND",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          }
        ]
      },
      "inter_proposition_links": {
        "forward_link_to": "P8"
      },
      "cb_flags": ["CB_0034"],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S3",
      "verse_anchor": "2:19b",
      "proposition_kind": "BLESSED_THE_MAN_BEFORE_KNOWING_HIM",
      "event_specific_slots": {
        "blesser": "B3",
        "blessing_recipient": "B13",
        "blessing_recipient_referential_form": "THE_MAN_WHO_TOOK_NOTICE_OF_HER",
        "name_known_status": "NAME_NOT_YET_KNOWN_TO_NAOMI",
        "speech_act": "WISHES_FOR_THIRD_PARTY"
      },
      "inter_proposition_links": {
        "caused_by": "P7",
        "forward_link_to": "P9"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P9",
      "scene_link": "S3",
      "verse_anchor": "2:19c",
      "proposition_kind": "REPORTED_NAME_OF_THE_MAN",
      "event_specific_slots": {
        "reporter": "B9",
        "addressee": "B3",
        "reported_party": "B13",
        "reported_name": "Boaz",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P8",
        "forward_link_to": "P10"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P10",
      "scene_link": "S3",
      "verse_anchor": "2:20a",
      "proposition_kind": "BLESSED_YHWH_FOR_UNFORSAKEN_HESED",
      "event_specific_slots": {
        "blesser": "B3",
        "invoked_divine_agent": "B10",
        "invoked_divine_agent_referential_form": "THE_LORD_YHWH",
        "hesed_source_antecedent": "HELD_OPEN_YHWH_OR_BOAZ",
        "unforsaken_hesed_toward": [
          {
            "toward_party": "THE_LIVING_GENERIC",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "toward_party": "THE_DEAD_GENERIC",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ],
        "speech_act": "WISHES_FOR_THIRD_PARTY"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P11"
      },
      "cross_ref": "FIG_0111 hesed-not-forsaken opens here at 2:20 (antecedent of 'has not forsaken' — YHWH or Boaz — held open; closes at P09 3:10); FIG_0110 living-and-dead formula opens here at 2:20 (theological hinge; pairs forward to P11 4:5 and P12 4:10)",
      "cb_flags": ["CB_0011", "CB_0039"],
      "figure_flags": ["FIG_0111", "FIG_0110"]
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "2:20b",
      "proposition_kind": "RECOGNIZED_MAN_AS_NEAR_REDEEMER",
      "event_specific_slots": {
        "speaker": "B3",
        "addressee": "B9",
        "recognized_party": "B13",
        "kinship_proximity_form": "NEAR_TO_US",
        "named_role": "B18",
        "named_role_referential_form": "ONE_OF_OUR_REDEEMERS_FORM",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cross_ref": "FIG_0112 close-to-us opens here at 2:20 (kinship-nearness that creates obligation; pairs forward to P09 3:12 and P11 4:1-6); first naming of the redeemer-role in the book",
      "cb_flags": ["CB_0001"],
      "figure_flags": ["FIG_0112"]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "2:21",
      "proposition_kind": "REPORTED_BOAZ_STAY_CLOSE_INSTRUCTION",
      "event_specific_slots": {
        "reporter": "B9",
        "reporter_referential_form": "RUTH_THE_MOABITESS_NARRATOR_EPITHET",
        "addressee": "B3",
        "reported_speaker": "B13",
        "reported_instruction_components": [
          {
            "action": "REPORTED_BOAZ_DIRECTED_HER_TO_STAY_CLOSE_TO_HIS_WORKERS",
            "stay_close_to_party": "B16",
            "list_position": "FIRST",
            "speech_act": "REPORTS_PRIOR_SPEECH_INSTRUCTION"
          },
          {
            "action": "REPORTED_UNTIL_THEY_FINISH_HIS_WHOLE_HARVEST",
            "totality_marker": "HIS_WHOLE_HARVEST",
            "list_position": "SECOND",
            "speech_act": "REPORTS_PRIOR_SPEECH_INSTRUCTION"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P11",
        "forward_link_to": "P13"
      },
      "cross_ref": "FIG_0001 Ruth-the-Moabitess narrator-epithet at 2:21 (book-wide foreigner-marker returning where incorporation is at stake; arc 1:22 / 2:6 / 2:21 / 4:5 / 4:10)",
      "cb_flags": ["CB_0034", "CB_0004"],
      "figure_flags": ["FIG_0001"]
    },
    {
      "prop_id": "P13",
      "scene_link": "S4",
      "verse_anchor": "2:22",
      "proposition_kind": "COUNSELED_TO_STAY_WITH_BOAZ_YOUNG_WOMEN",
      "event_specific_slots": {
        "speaker": "B3",
        "addressee": "B9",
        "address_form": "MY_DAUGHTER",
        "counsel_components": [
          {
            "action": "STATED_IT_IS_GOOD_TO_GO_OUT_WITH_HIS_YOUNG_WOMEN",
            "companion_group": "B16",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "WARNED_AGAINST_BEING_HARMED_IN_ANOTHER_FIELD",
            "danger_place": "PL5",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "forward_link_to": "P14"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P14",
      "scene_link": "S4",
      "verse_anchor": "2:23a",
      "proposition_kind": "STAYED_CLOSE_TO_GLEAN",
      "event_specific_slots": {
        "stayer": "B9",
        "stay_close_to_party": "B16",
        "purpose": "TO_GLEAN",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P13",
        "paired_with": "P12",
        "forward_link_to": "P15"
      },
      "cross_ref": "FIG_0012 closes here at 2:23 (Ruth's clinging here echoes her clinging to Naomi at 1:14, P02; opened at P02 P14)",
      "cb_flags": ["CB_0034", "CB_0018"],
      "figure_flags": ["FIG_0012"]
    },
    {
      "prop_id": "P15",
      "scene_link": "S4",
      "verse_anchor": "2:23b",
      "proposition_kind": "GLEANED_THROUGH_BOTH_HARVESTS",
      "event_specific_slots": {
        "gleaner": "B9",
        "duration": "TM_EXTENDED_HARVEST_SPAN",
        "season_span_components": [
          {
            "action": "GLEANED_TO_END_OF_BARLEY_HARVEST",
            "harvest_referent": "O2",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "GLEANED_TO_END_OF_WHEAT_HARVEST",
            "harvest_referent": "O3",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P14",
        "forward_link_to": "P16"
      },
      "cb_flags": ["CB_0026"],
      "figure_flags": []
    },
    {
      "prop_id": "P16",
      "scene_link": "S4",
      "verse_anchor": "2:23c",
      "proposition_kind": "DWELT_WITH_MOTHER_IN_LAW",
      "event_specific_slots": {
        "dweller": "B9",
        "dwelt_with": "B3",
        "dwelt_with_referential_form": "HER_MOTHER_IN_LAW_KINSHIP_FORM",
        "where": "PL_NAOMIS_DWELLING",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P15"
      },
      "cb_flags": [],
      "figure_flags": []
    }
  ]
}
```
