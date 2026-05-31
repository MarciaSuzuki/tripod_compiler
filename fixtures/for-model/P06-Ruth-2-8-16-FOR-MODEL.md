---
type: "sta-for-model"
pericope: "P06"
pericope-title: "Boaz speaks to Ruth in the field: instructions, blessing, meal, and harvester protocol"
source-meaning-map: [[P06-Ruth-2-8-16]]
status: "valid"
pilot: "pilot-2"
---

# P06 — Ruth 2:8–16 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_06_v2_0", 
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 2:8-16",
    "pericope_title": "Boaz speaks to Ruth in the field: instructions, blessing, meal, and harvester protocol",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P06-Ruth-2-8-16",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Scene-level INTIMATE override on S2 (Ruth's bowed question, Boaz's recital, Ruth's response — a relational-close exchange between a foreigner and the field-owner). One moment-level CEREMONIAL override at v.12 for Boaz's formal blessing invoking YHWH the God of Israel.",
      "scene_level": [
        {
          "scene_id": "S2",
          "override_value": "INTIMATE",
          "genre_override": null,
          "genre_group_override": null
        }
      ],
      "moment_level": [
        {
          "verse": "2:12",
          "override_value": "CEREMONIAL",
          "genre_override": null,
          "genre_group_override": null
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "PROTECTIVE_INSTRUCTION",
      "RECOGNITION_EXCHANGE",
      "BLESSING_INVOCATION",
      "MEAL_INCLUSION",
      "HARVESTER_PROTOCOL_EXTENSION"
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
      "WARM",
      "RESTRAINED",
      "WEIGHTED",
      "RELATIONALLY_CLOSE",
      "CEREMONIAL_AT_BLESSING"
    ],
    "pace_elements": [
      "SLOWED_THROUGH_SPEECHES",
      "STEADY_AT_MEAL_AND_PROTOCOL"
    ],
    "communicative_function_elements": [
      "ESTABLISHES_PROTECTIVE_REGIME",
      "RECITES_RUTH_LOYALTY_IN_BOAZ_VOICE",
      "OPENS_WING_OF_REFUGE_CROSS_PERICOPE_PAIR",
      "OPENS_SHIFCHAH_AMAH_CROSS_PERICOPE_PAIR",
      "DISTRIBUTES_THREE_PROHIBITION_CLUSTER",
      "ADVANCES_HARVEST_PROVISION_THREAD_FIRST_MAJOR",
      "ADVANCES_OUTSIDER_INCORPORATION_THREAD",
      "WITHHOLDS_MOAB_NAMING_IN_BOAZ_SPEECH"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "2:8-9",
      "scene_kind": "PROTECTIVE_INSTRUCTION_SCENE",
      "scene_communicative_purpose": "Boaz establishes the protective regime by directives and reported prior command.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER_SPEAKING_PROTECTIVE_INSTRUCTIONS",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER_ADDRESSED_BY_FIELD_OWNER",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B16",
            "role_in_scene": "FEMALE_WORKERS_WITH_WHOM_GLEANER_IS_TO_STAY_CLOSE",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B17",
            "role_in_scene": "MALE_WORKERS_OBJECT_OF_REPORTED_TOUCH_PROHIBITION_AND_WATER_DRAWERS",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "FIELD_WHERE_PROTECTIVE_REGIME_APPLIES"
          },
          {
            "place_id": "PL_OTHER_FIELD",
            "role_in_scene": "HYPOTHETICAL_DANGER_PLACE_OUTSIDE_PROTECTIVE_COVER"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). Kept: gleaning CB_0034 (the institution Ruth works under in Boaz's field; aligned to the map §3C, which retained it). Relocated: the opening 'have you not heard' question → P1; the 'my daughter' address → P1 (address_form); the stay-close (dabaq) directive → P1/P2 (DIRECTED_GLEANER_TO_STAY_CLOSE_WITH_YOUNG_WOMEN); the reported prior touch-prohibition → P3 (REPORTED_OWN_PRIOR_PROHIBITION; FIG_0105); the water-vessels provision → P4 (SPOKE_WATER_PROVISION_INSTRUCTION).",
        "entries": [
          {
            "object_id": "CB_0034",
            "function_in_scene": "GLEANING_INSTITUTION_UNDER_WHICH_RUTH_WORKS_IN_BOAZ_FIELD"
          }
        ]
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous within the harvest day established at P05.",
        "entries": null
      },
      "significant_absence": "Boaz does not name himself to Ruth. Ruth says nothing; the entire scene is Boaz's directives."
    },
    {
      "scene_id": "S2",
      "verse_range": "2:10-13",
      "scene_kind": "RECOGNITION_AND_BLESSING_SCENE",
      "scene_communicative_purpose": "Recognition exchange that names Ruth's loyalty in Boaz's voice and blesses her in YHWH's name.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "FOREIGNER_WHO_BOWS_AND_ASKS_WHY_SHE_IS_RECOGNIZED",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B13",
            "role_in_scene": "SPEAKER_RECITING_AND_BLESSING",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW_REFERENT_OF_RUTHS_LOYALTY",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B?",
            "role_in_scene": "DECEASED_HUSBAND_REFERENT_PAIRING_WITHHELD_PER_P01_D2",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B10",
            "role_in_scene": "INVOKED_AS_REPAYER_AND_REFUGE_GIVER_AT_VERSE_TWELVE",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "LOCUS_OF_BOWING_AND_RECOGNITION_EXCHANGE"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). Kept: favor CB_0033, foreigner/nokhriya CB_0038, wing-of-refuge/kanaph CB_0037, blessing CB_0008 (the concepts Boaz's recognition-and-blessing turns on; aligned to the map §3C, which retained them). Relocated (the events that carry them): the deep bow → P5 (BOWED_DEEP_TO_GROUND); the 'favor in your eyes' question → P6 (FIG_0018); the recognition (nakar) question → P6; the self-designation as foreigner → P6; the full-knowledge recital → P7 (FIG_0100); leaving the land of her birth, Moab unnamed → P8; the 'a people unknown before' idiom → P8; the wish that YHWH repay her → P9; the full-wages wish → P9; the formal blessing utterance at v.12 → P9 (FIG_0011); the 'my lord' deferential address → P10; the heart-reaching speech (dibber al lev) → P11; the shifchah self-naming → P11 (FIG_0132); the 'not as one of your maidservants' → P11.",
        "entries": [
          {
            "object_id": "CB_0033",
            "function_in_scene": "FAVOR_RUTH_ASKS_WHY_SHE_HAS_FOUND_IN_BOAZ_EYES"
          },
          {
            "object_id": "CB_0038",
            "function_in_scene": "FOREIGNER_SELF_DESIGNATION_RUTH_PLACES_IN_HER_OWN_MOUTH"
          },
          {
            "object_id": "CB_0037",
            "function_in_scene": "WING_OF_REFUGE_UNDER_WHICH_RUTH_HAS_COME_TO_SHELTER"
          },
          {
            "object_id": "CB_0008",
            "function_in_scene": "INSTITUTIONAL_BLESSING_BOAZ_PRONOUNCES_AT_VERSE_TWELVE"
          }
        ]
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; continuous within the field day.",
        "entries": null
      },
      "significant_absence": "Moab is not named by Boaz; he uses 'the land of your birth' instead. Ruth's deceased husband is not paired with a specific son; the wife-pairing is withheld per P01-D2. Boaz does not name himself; Ruth still addresses him as 'my lord.'"
    },
    {
      "scene_id": "S3",
      "verse_range": "2:14",
      "scene_kind": "MEAL_INCLUSION_SCENE",
      "scene_communicative_purpose": "Records the moment of concrete bodily welcome; the threefold ate-then-satisfied-then-had-leftover staging the carrying-back to Naomi.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "HOST_INVITING_GLEANER_AND_HANDING_GRAIN",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER_INVITED_TO_SIT_AND_EAT_WITH_HARVESTERS",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B14",
            "role_in_scene": "WORKING_COMMUNITY_GLEANER_SITS_BESIDE",
            "presence": "PRESENT_COLLECTIVE"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "FIELD_LOCATION_OF_MEAL_GLEANER_PLACED_BESIDE_HARVESTERS"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). Kept: bread CB_0012, vinegar O9, roasted grain O10 (the meal Boaz hands Ruth at 2:14). Relocated: the seat beside the harvesters → P13 (SAT_BESIDE_HARVESTERS); the ate-then-satisfied-then-had-leftover sequence → P15 (ATE_WAS_SATISFIED_AND_HAD_LEFTOVER; FIG_0104).",
        "entries": [
          {
            "object_id": "CB_0012",
            "function_in_scene": "BREAD_OF_FIELD_MEAL_CLOSES_BREAD_THREAD_FROM_BETHLEHEM_IN_FAMINE_TO_BOAZ_TABLE"
          },
          {
            "object_id": "O9",
            "function_in_scene": "VINEGAR_FOR_DIPPING_CONCRETE_BODILY_WELCOME_AT_MEAL"
          },
          {
            "object_id": "O10",
            "function_in_scene": "ROASTED_GRAIN_HAND_TO_HAND_PROVISION_FROM_HOST_TO_GLEANER"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_MEALTIME",
            "role_in_scene": "WITHIN_DAY_POINT_AT_WHICH_HOST_INVITES_GLEANER_TO_EAT"
          }
        ]
      },
      "significant_absence": "No conversation is recorded at the meal. Ruth says nothing; the harvesters say nothing."
    },
    {
      "scene_id": "S4",
      "verse_range": "2:15-16",
      "scene_kind": "HARVESTER_PROTOCOL_SCENE",
      "scene_communicative_purpose": "Closes the pericope with extended-gleaning protocol that locks the protective regime into harvester practice.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER_COMMANDING_HARVESTERS_ABOUT_GLEANER",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B17",
            "role_in_scene": "ADDRESSEES_OF_EXTENDED_GLEANING_INSTRUCTIONS",
            "presence": "PRESENT_COLLECTIVE"
          },
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER_RISING_AND_OBJECT_OF_INSTRUCTIONS_NOT_ADDRESSEE",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "LOCUS_OF_EXTENDED_GLEANING_REGIME"
          },
          {
            "place_id": "PL_AMONG_SHEAVES",
            "role_in_scene": "PLACE_GLEANER_NOW_PERMITTED_TO_GLEAN_BEYOND_LEGAL_MINIMUM"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). Kept: gleaning CB_0034 (the gleaning frame extended in Boaz's command), sheaves/bundles O11 (the harvest material the extended regime works around); aligned to the map §3C. Relocated: the permission to glean among the sheaves → P17 (PERMITTED_GLEANING_AMONG_SHEAVES; FIG_0106); the don't-shame-her prohibition → P17; the deliberate-pulling command → P18 (FIG_0101); the leave-them-for-her command → P19; the don't-rebuke-her prohibition → P19 (FIG_0107).",
        "entries": [
          {
            "object_id": "CB_0034",
            "function_in_scene": "GLEANING_FRAME_EXTENDED_IN_BOAZ_COMMAND_BEYOND_LEGAL_MINIMUM"
          },
          {
            "object_id": "O11",
            "function_in_scene": "SHEAVES_AND_BUNDLES_MATERIALS_AROUND_WHICH_EXTENDED_REGIME_WORKS"
          }
        ]
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; continuous within the field day; the rising to glean follows the meal.",
        "entries": null
      },
      "significant_absence": "Ruth is not in the addressee group; the young men are commanded about her, not to her. The narrator does not say Ruth hears the instruction."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "2:8",
      "proposition_kind": "SPOKE_PROTECTIVE_INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "address_form": "MY_DAUGHTER_NON_KIN_ELDER_TO_YOUNG_FOREIGNER",
        "instruction_components": [
          {
            "action": "DIRECTED_GLEANER_TO_STAY_IN_THIS_FIELD",
            "field_to_stay_in": "PL5_BOAZ_PORTION",
            "list_position": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_GLEANER_NOT_TO_GLEAN_IN_ANOTHER_FIELD",
            "alternative_field": "PL_OTHER_FIELD",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          },
          {
            "action": "DIRECTED_GLEANER_NOT_TO_PASS_ON",
            "list_position": "THIRD",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          },
          {
            "action": "DIRECTED_GLEANER_TO_STAY_CLOSE_WITH_YOUNG_WOMEN",
            "companion_group": "B16",
            "list_position": "FOURTH",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ]
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [
        "CB_0034"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "2:9a",
      "proposition_kind": "SPOKE_PROTECTIVE_INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "instruction_components": [
          {
            "action": "DIRECTED_HEARER_TO_KEEP_EYES_ON_REAPED_FIELD",
            "field_to_watch": "PL5_BOAZ_PORTION",
            "list_position": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_HEARER_TO_GO_AFTER_YOUNG_WOMEN",
            "companion_group": "B16",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ]
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
      "verse_anchor": "2:9b",
      "proposition_kind": "REPORTED_OWN_PRIOR_PROHIBITION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "prior_command_giver": "B13",
        "prior_command_addressees": "B17",
        "prior_prohibition_target_party": "B9",
        "prior_prohibited_action": "TOUCH_THE_GLEANER",
        "speech_act": "REPORTS_OWN_PRIOR_PROHIBITION"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cross_ref": "FIG_0105 active here as first member of three-prohibition cluster (distributed: P3/P17/P19)",
      "cb_flags": [],
      "figure_flags": [
        "FIG_0105"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "2:9c",
      "proposition_kind": "SPOKE_WATER_PROVISION_INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "instruction_components": [
          {
            "action": "DIRECTED_HEARER_TO_GO_TO_VESSELS",
            "list_position": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_HEARER_TO_DRINK_FROM_WHAT_YOUNG_MEN_DRAW",
            "water_drawers": "B17",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ]
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
      "verse_anchor": "2:10a",
      "proposition_kind": "BOWED_DEEP_TO_GROUND",
      "event_specific_slots": {
        "bower": "B9",
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
      "verse_anchor": "2:10b",
      "proposition_kind": "ASKED_RECOGNITION_QUESTION_AND_SELF_NAMED_AS_FOREIGNER",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B13",
        "name_known_status": "NAME_NOT_YET_KNOWN_TO_RUTH",
        "exchange_components": [
          {
            "action": "ASKED_WHY_SHE_FOUND_FAVOR_IN_HIS_EYES",
            "list_position": "FIRST",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "action": "ASKED_WHY_HE_RECOGNIZED_HER",
            "list_position": "SECOND",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "action": "STATED_SELF_AS_FOREIGNER",
            "list_position": "THIRD",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P7"
      },
      "cb_flags": [
        "CB_0033",
        "CB_0038"
      ],
      "figure_flags": [
        "FIG_0018"
      ]
    },
    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "2:11a",
      "proposition_kind": "ANSWERED_WITH_FULL_KNOWLEDGE_RECITAL",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "recital_components": [
          {
            "action": "STATED_FULL_KNOWLEDGE_OF_WHAT_SHE_DID",
            "loyalty_act_toward_party": "B3",
            "loyalty_act_toward_referential_form": "YOUR_MOTHER_IN_LAW_KINSHIP_FORM",
            "after_whose_death": "B?",
            "after_whose_death_referential_form": "YOUR_HUSBAND_RELATIONAL_PAIRING_WITHHELD_PER_P01_D2",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P6",
        "forward_link_to": "P8"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0100"
      ]
    },
    {
      "prop_id": "P8",
      "scene_link": "S2",
      "verse_anchor": "2:11b",
      "proposition_kind": "RECITED_RUTH_LEAVING_AND_COMING",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "recital_components": [
          {
            "action": "STATED_RUTH_LEFT_FATHER_AND_MOTHER",
            "left_parties": "PARENTS_OF_ADDRESSEE",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "STATED_RUTH_LEFT_LAND_OF_HER_BIRTH",
            "moab_naming_status": "WITHHELD_IN_BOAZ_SPEECH",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "STATED_COMING_TO_UNKNOWN_PEOPLE",
            "destination_people_form": "PEOPLE_PREVIOUSLY_UNKNOWN_TO_HER",
            "list_position": "THIRD",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P7",
        "forward_link_to": "P9"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0103"
      ]
    },
    {
      "prop_id": "P9",
      "scene_link": "S2",
      "verse_anchor": "2:12",
      "proposition_kind": "PRONOUNCED_FORMAL_BLESSING_UNDER_WINGS_OF_REFUGE",
      "event_specific_slots": {
        "blesser": "B13",
        "blessing_recipient": "B9",
        "invoked_divine_agent": "B10",
        "invoked_divine_agent_referential_form": "YHWH_THE_GOD_OF_ISRAEL",
        "blessing_components": [
          {
            "action": "WISHED_YHWH_TO_REPAY_HER_WORK",
            "list_position": "FIRST",
            "speech_act": "WISHES_FOR_HEARER"
          },
          {
            "action": "WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE",
            "list_position": "SECOND",
            "speech_act": "WISHES_FOR_HEARER"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P8",
        "forward_link_to": "P10"
      },
      "cross_ref": "FIG_0011 opens here; cross-pericope pair closes at P09 (3:9) with FIG_0131 Wing-of-Refuge-Requested",
      "cb_flags": [
        "CB_0008",
        "CB_0037"
      ],
      "figure_flags": [
        "FIG_0011"
      ]
    },
    {
      "prop_id": "P10",
      "scene_link": "S2",
      "verse_anchor": "2:13a",
      "proposition_kind": "RESPONDED_WITH_FAVOR_WISH",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B13",
        "address_form": "MY_LORD_DEFERENTIAL",
        "name_known_status": "NAME_NOT_YET_KNOWN_TO_RUTH",
        "wished_state": "FAVOR_IN_HIS_EYES",
        "speech_act": "STATES_HOPED_FOR_CONDITION"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P11"
      },
      "cb_flags": [
        "CB_0033"
      ],
      "figure_flags": [
        "FIG_0018"
      ]
    },
    {
      "prop_id": "P11",
      "scene_link": "S2",
      "verse_anchor": "2:13b",
      "proposition_kind": "DESCRIBED_BOAZ_EFFECT_AND_LOWER_SELF_NAMED",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B13",
        "response_components": [
          {
            "action": "STATED_THAT_HE_COMFORTED_HER",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT",
            "list_position": "THIRD",
            "speech_act": "STATES_LAMENT_OBSERVATION"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cross_ref": "FIG_0132 opens here at first half (shifchah); cross-pericope pair closes at P09 (3:9) with amah",
      "cb_flags": [],
      "figure_flags": [
        "FIG_0102",
        "FIG_0132"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "2:14a",
      "proposition_kind": "INVITED_TO_MEAL",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "when": "TM_MEALTIME",
        "invitation_components": [
          {
            "action": "DIRECTED_HEARER_TO_COME_HERE",
            "list_position": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_HEARER_TO_EAT_FROM_BREAD",
            "food_item": "CB_0012",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_HEARER_TO_DIP_MORSEL_IN_VINEGAR",
            "dipping_item": "O9",
            "list_position": "THIRD",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P11",
        "forward_link_to": "P13"
      },
      "cb_flags": [
        "CB_0012"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P13",
      "scene_link": "S3",
      "verse_anchor": "2:14b",
      "proposition_kind": "SAT_BESIDE_HARVESTERS",
      "event_specific_slots": {
        "sitter": "B9",
        "sitting_position_relation": "BESIDE_THE_HARVESTERS",
        "alongside_party": "B14",
        "speech_act": "STATES_AS_TRUE"
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
      "scene_link": "S3",
      "verse_anchor": "2:14c",
      "proposition_kind": "HANDED_ROASTED_GRAIN",
      "event_specific_slots": {
        "giver": "B13",
        "given_party": "B9",
        "given_item": "O10",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P13",
        "forward_link_to": "P15"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P15",
      "scene_link": "S3",
      "verse_anchor": "2:14d",
      "proposition_kind": "ATE_WAS_SATISFIED_AND_HAD_LEFTOVER",
      "event_specific_slots": {
        "eater": "B9",
        "triplet_components": [
          {
            "action": "ATE",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "WAS_SATISFIED",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "HAD_LEFTOVER",
            "list_position": "THIRD",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P14",
        "forward_link_to": "P16"
      },
      "cross_ref": "FIG_0104 active here as required keep-image; third action (had leftover) sets up forward link to P07 v.18 (Ruth carrying leftover to Naomi)",
      "cb_flags": [],
      "figure_flags": [
        "FIG_0104"
      ]
    },
    {
      "prop_id": "P16",
      "scene_link": "S4",
      "verse_anchor": "2:15a",
      "proposition_kind": "ROSE_TO_GLEAN",
      "event_specific_slots": {
        "riser": "B9",
        "purpose": "TO_GLEAN",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P15",
        "forward_link_to": "P17"
      },
      "cb_flags": [
        "CB_0034"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P17",
      "scene_link": "S4",
      "verse_anchor": "2:15b",
      "proposition_kind": "COMMANDED_HARVESTERS_PERMISSION_AND_SHAME_PROHIBITION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressees": "B17",
        "about_party": "B9",
        "command_components": [
          {
            "action": "PERMITTED_GLEANING_AMONG_SHEAVES",
            "permitted_location": "PL_AMONG_SHEAVES",
            "material_referent": "O11",
            "list_position": "FIRST",
            "speech_act": "GRANTS_PERMISSION_TO_DO"
          },
          {
            "action": "DIRECTED_HARVESTERS_NOT_TO_SHAME_HER",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P16",
        "forward_link_to": "P18"
      },
      "cross_ref": "FIG_0106 active here as second member of three-prohibition cluster (distributed: P3/P17/P19)",
      "cb_flags": [
        "CB_0034"
      ],
      "figure_flags": [
        "FIG_0106"
      ]
    },
    {
      "prop_id": "P18",
      "scene_link": "S4",
      "verse_anchor": "2:16a",
      "proposition_kind": "COMMANDED_DELIBERATE_PULLING_FROM_BUNDLES",
      "event_specific_slots": {
        "speaker": "B13",
        "addressees": "B17",
        "for_party_to_glean": "B9",
        "material_referent": "O11",
        "manner": "DELIBERATELY_INTENTIONALLY",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P17",
        "forward_link_to": "P19"
      },
      "cb_flags": [
        "CB_0034"
      ],
      "figure_flags": [
        "FIG_0101"
      ]
    },
    {
      "prop_id": "P19",
      "scene_link": "S4",
      "verse_anchor": "2:16b",
      "proposition_kind": "COMMANDED_LEAVING_AND_REBUKE_PROHIBITION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressees": "B17",
        "for_party_to_glean": "B9",
        "command_components": [
          {
            "action": "DIRECTED_HARVESTERS_TO_LEAVE_THEM_FOR_HER",
            "purpose": "FOR_HER_TO_GLEAN",
            "list_position": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED_HARVESTERS_NOT_TO_REBUKE_HER",
            "list_position": "SECOND",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P18"
      },
      "cross_ref": "FIG_0107 active here as third member of three-prohibition cluster (distributed: P3/P17/P19)",
      "cb_flags": [
        "CB_0034"
      ],
      "figure_flags": [
        "FIG_0107"
      ]
    }
  ]
}
```
