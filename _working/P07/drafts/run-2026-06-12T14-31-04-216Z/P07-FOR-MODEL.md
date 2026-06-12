---
type: "sta-for-model"
pericope: "P07"
pericope-title: "The gleaning brought home and the redeemer named"
source-meaning-map: [[P07-Ruth-2-17-23]]
status: "draft"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"
---

# P07 — Ruth 2:17-23 — FOR_MODEL (DRAFT — machine-drafted, awaiting review)

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "ruth_pericope_07_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 2:17-23",
    "pericope_title": "The gleaning brought home and the redeemer named",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P07-Ruth-2-17-23",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "scene_level": [
        {
          "scene_id": "S3",
          "override_value": "INTIMATE"
        }
      ],
      "moment_level": [
        {
          "verse": "2:20",
          "override_value": "CEREMONIAL"
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "HARVEST_BROUGHT_HOME",
      "BLESSING_INVOCATION",
      "RECOGNITION_EXCHANGE",
      "PROTECTIVE_INSTRUCTION",
      "CLINGING",
      "NARRATOR_FRAMING_CLOSE"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "TEMPORAL_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "DIVINE_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "PRIOR_ACTION_CONTEXT"
    ],
    "tone_elements": [
      "ECONOMICAL",
      "RISING",
      "WARM",
      "STILLED",
      "ANTICIPATORY"
    ],
    "pace_elements": [
      "STEADY",
      "RISES",
      "SETTLES",
      "WIDENS"
    ],
    "communicative_function_elements": [
      "CLOSES",
      "OPENS",
      "REACTIVATES",
      "ADVANCES",
      "STAGES"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "2:17",
      "scene_kind": "GLEANING_SCENE",
      "scene_communicative_purpose": "Records the size of the day's gleaning — a full ephah — as plain proof of how much favor Ruth was shown.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0034"
          },
          {
            "object_id": "CB_0041"
          },
          {
            "object_id": "O12"
          },
          {
            "object_id": "O2"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_EVENING"
          }
        ]
      },
      "significant_absence": "__TODO__"
    },
    {
      "scene_id": "S2",
      "verse_range": "2:18",
      "scene_kind": "HOMECOMING_SCENE",
      "scene_communicative_purpose": "Brings the field's plenty home: the full gleaning seen, and Naomi fed from Ruth's own leftovers.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "NAMED_ONLY_AS_MOTHER_IN_LAW"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          },
          {
            "place_id": "PL_NAOMIS_DWELLING"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O12"
          },
          {
            "object_id": "O10"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator records no word and no reaction from Naomi at the sight — her response is held back until the questions of the next verse."
    },
    {
      "scene_id": "S3",
      "verse_range": "2:19-22",
      "scene_kind": "REDEEMER_RECOGNITION_SCENE",
      "scene_communicative_purpose": "The turn of the passage: at the name \"Boaz,\" Naomi recognizes a redeemer, and the day's food becomes the first sign of rescue — sealed in a blessing that holds the living and the dead together under unbroken hesed.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "ALTERNATES_CHAMOT_AND_NAOMI"
          },
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "RUTH_THE_MOABITESS_NARRATOR_EPITHET"
          },
          {
            "being_id": "B13",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "REFERENCED",
            "referential_form": "THE_MAN_WHO_TOOK_NOTICE_THEN_NAMED"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B18",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "__TODO__: The dead of the household — הַמֵּתִים / \"the dead\"",
            "role_in_scene": "DECEASED_KIN",
            "presence": "REFERENCED",
            "referential_form": "NAMED_ONLY_AS_HA_METIM"
          },
          {
            "being_id": "B17",
            "role_in_scene": "MALE_WORKERS",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B16",
            "role_in_scene": "FEMALE_WORKERS",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DECEASED_KIN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B4",
            "role_in_scene": "DECEASED_KIN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B5",
            "role_in_scene": "DECEASED_KIN",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_NAOMIS_DWELLING"
          },
          {
            "place_id": "PL5_BOAZ_PORTION"
          },
          {
            "place_id": "PL_OTHER_FIELD"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0008"
          },
          {
            "object_id": "CB_0011"
          },
          {
            "object_id": "CB_0039"
          },
          {
            "object_id": "CB_0001"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_TODAY"
          }
        ]
      },
      "significant_absence": "Naomi does not explain to Ruth what a redeemer is or what the nearness could mean for them; she names the role and stops, and the narrator does not say what Ruth understands by it. The dead are named only as \"the dead,\" not as Elimelech, Mahlon, and Chilion. The blessing never says whose hesed has not been forsaken — YHWH's or the man's; the words leave it open."
    },
    {
      "scene_id": "S4",
      "verse_range": "2:23",
      "scene_kind": "NARRATOR_FRAMING_CLOSE_SCENE",
      "scene_communicative_purpose": "Closes the pericope and the season in one quiet line: Ruth holding fast where it is safe, the household provided for, and the two women together — the still floor the next chapter's plan rises from.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B16",
            "role_in_scene": "FEMALE_WORKERS",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION"
          },
          {
            "place_id": "PL_NAOMIS_DWELLING"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0018"
          },
          {
            "object_id": "CB_0026"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_EXTENDED_HARVEST_SPAN"
          }
        ]
      },
      "significant_absence": "Through all the weeks of both harvests, the narrator records no further meeting and no further word between Ruth and Boaz. The season passes in silence; the next move waits for Naomi's plan at 3:1."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "2:17a",
      "proposition_kind": "GLEANED",
      "event_specific_slots": {
        "gleaner": "B9",
        "gleaning_site": "PL5_BOAZ_PORTION",
        "gleaned_until": "TM_EVENING",
        "gleaning_concept": "CB_0034"
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
      "verse_anchor": "2:17b",
      "proposition_kind": "THRESHED",
      "event_specific_slots": {
        "thresher": "B9",
        "threshed_grain": "WHAT_SHE_GLEANED",
        "threshing_method": "BY_HAND_CHAVAT",
        "threshing_concept": "CB_0041"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [
        "CB_0041"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "2:17c",
      "proposition_kind": "MEASURED",
      "event_specific_slots": {
        "measured_grain": "O2",
        "measured_quantity": "O12",
        "quantity_exactness": "APPROXIMATE"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [
        "CB_0040"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P4",
      "scene_link": "S2",
      "verse_anchor": "2:18a",
      "proposition_kind": "ARRIVED_AT",
      "event_specific_slots": {
        "carrier": "B9",
        "carried_grain": "O12",
        "destination": "PL4",
        "prior_action_marker": "LIFTED_THEN_CARRIED"
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
      "proposition_kind": "PERCEIVED",
      "event_specific_slots": {
        "perceiver": "B3",
        "perceiver_referential_form": "HER_MOTHER_IN_LAW",
        "perceived_object": "O12"
      },
      "inter_proposition_links": {
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "2:18c",
      "proposition_kind": "GAVE",
      "event_specific_slots": {
        "giver": "B9",
        "recipient": "B3",
        "gift": "O10",
        "gift_kind": "LEFTOVER_FROM_SATIETY",
        "prior_action_marker": "BROUGHT_OUT"
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P7"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0104",
        "FIG_0113"
      ]
    },
    {
      "prop_id": "P7",
      "scene_link": "S3",
      "verse_anchor": "2:19a",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B3",
        "speaker_referential_form": "HER_MOTHER_IN_LAW",
        "addressee": "B9",
        "question_subject": "WHERE_RUTH_GLEANED_TODAY",
        "question_form": "DOUBLED_WHERE_QUESTION",
        "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P8"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S3",
      "verse_anchor": "2:19b",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blesser": "B3",
        "blesser_referential_form": "HER_MOTHER_IN_LAW",
        "blessing_recipients": "B13",
        "recipient_referential_form": "THE_MAN_WHO_TOOK_NOTICE",
        "blessing_content_kind": "MAY_HE_BE_BLESSED",
        "speech_act": "WISHES_FOR_THIRD_PARTY"
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P9"
      },
      "cb_flags": [
        "CB_0008"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P9",
      "scene_link": "S3",
      "verse_anchor": "2:19c",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B3",
        "named_man": "B13",
        "given_name": "Boaz",
        "reported_content": "WORKED_WITH_BOAZ_TODAY",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P7",
        "paired_with": "P8",
        "forward_link_to": "P10"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P10",
      "scene_link": "S3",
      "verse_anchor": "2:20a",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blesser": "B3",
        "blesser_referential_form": "NAOMI_NAMED",
        "addressee": "B9",
        "addressee_referential_form": "HER_DAUGHTER_IN_LAW",
        "blessing_recipients": "B13",
        "invoked_divine_agent": "B10",
        "blessing_content_kind": "BLESSED_BY_YHWH",
        "speech_act": "WISHES_FOR_THIRD_PARTY"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P11"
      },
      "cb_flags": [
        "CB_0008"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "2:20b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B3",
        "hesed_concept": "CB_0011",
        "hesed_antecedent": "LEFT_OPEN",
        "hesed_extends_to": [
          "THE_LIVING",
          "THE_DEAD"
        ],
        "the_dead_referent": [
          "B2",
          "B4",
          "B5"
        ],
        "living_and_dead_formula": "CB_0039",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cb_flags": [
        "CB_0011",
        "CB_0039"
      ],
      "figure_flags": [
        "FIG_0111",
        "FIG_0110"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "2:20c",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B3",
        "subject": "B13",
        "kinship_nearness": "NEAR_TO_US",
        "role_named": "B18",
        "redeemer_role_kind": "ONE_OF_OUR_REDEEMERS",
        "redeemer_concept": "CB_0001",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P13"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": [
        "FIG_0112"
      ]
    },
    {
      "prop_id": "P13",
      "scene_link": "S3",
      "verse_anchor": "2:21",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B9",
        "speaker_referential_form": "RUTH_THE_MOABITESS_NARRATOR_EPITHET",
        "addressee": "B3",
        "reported_speaker": "B13",
        "reported_workers": "B17",
        "reported_workers_form": "YOUNG_MEN_IN_REPORT",
        "reported_instruction": "STAY_CLOSE_TO_HIS_WORKERS",
        "until_marker": "FINISH_ALL_HARVEST",
        "speech_act": "REPORTS_PRIOR_SPEECH_INSTRUCTION"
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "forward_link_to": "P14"
      },
      "cb_flags": [
        "CB_0004"
      ],
      "figure_flags": [
        "FIG_0001"
      ]
    },
    {
      "prop_id": "P14",
      "scene_link": "S3",
      "verse_anchor": "2:22",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "counselor": "B3",
        "addressee": "B9",
        "address_form": "MY_DAUGHTER_INTIMATE",
        "counseled_action": "GLEAN_WITH_HIS_YOUNG_WOMEN",
        "accompanying_workers": "B16",
        "danger_averted": "HARM_IN_ANOTHER_FIELD",
        "other_field": "PL_OTHER_FIELD",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P13",
        "paired_with": "P13",
        "forward_link_to": "P15"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P15",
      "scene_link": "S4",
      "verse_anchor": "2:23a",
      "proposition_kind": "CLUNG_TO",
      "event_specific_slots": {
        "clinger": "B9",
        "clung_to": "B16",
        "clinging_purpose": "GLEAN",
        "clinging_concept": "CB_0018",
        "gleaning_concept": "CB_0034",
        "duration": "TM_EXTENDED_HARVEST_SPAN",
        "harvest_seasons": "CB_0026"
      },
      "inter_proposition_links": {
        "caused_by": "P14",
        "forward_link_to": "P16"
      },
      "cb_flags": [
        "CB_0034",
        "CB_0018",
        "CB_0026"
      ],
      "figure_flags": [
        "FIG_0012"
      ]
    },
    {
      "prop_id": "P16",
      "scene_link": "S4",
      "verse_anchor": "2:23b",
      "proposition_kind": "DWELT_AT",
      "event_specific_slots": {
        "resident": "B9",
        "dwelt_with": "B3",
        "dwelt_with_referential_form": "HER_MOTHER_IN_LAW",
        "where": "PL_NAOMIS_DWELLING"
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
