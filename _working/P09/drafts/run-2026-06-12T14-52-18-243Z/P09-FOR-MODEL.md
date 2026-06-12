---
type: "sta-for-model"
pericope: "P09"
pericope-title: "The threshing-floor night: the wing asked for, the redeemer named, the oath"
source-meaning-map: [[P09-Ruth-3-6-13]]
status: "draft"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"
---

# P09 — Ruth 3:6-13 — FOR_MODEL (DRAFT — machine-drafted, awaiting review)

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "ruth_pericope_09_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 3:6-13",
    "pericope_title": "The threshing-floor night: the wing asked for, the redeemer named, the oath",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P09-Ruth-3-6-13",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Scenes S2-S3 shift to INTIMATE (whispered private exchange at midnight per MM Section 1); Boaz's blessing at 3:10a lifts to CEREMONIAL; the 3:13 oath stays INTIMATE on the P03 precedent.",
      "scene_level": [
        {
          "scene_id": "S2",
          "override_value": "INTIMATE"
        },
        {
          "scene_id": "S3",
          "override_value": "INTIMATE"
        }
      ],
      "moment_level": [
        {
          "verse": "3:10a",
          "override_value": "CEREMONIAL"
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "PLAN_EXECUTION",
      "RECOGNITION_EXCHANGE",
      "WING_PETITION",
      "BLESSING_INVOCATION",
      "REASSURANCE_PLEDGE",
      "NEARER_REDEEMER_DISCLOSURE",
      "OATH_SEALING"
    ],
    "context_elements": [
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "PRIOR_ACTION_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "TEMPORAL_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "DIVINE_CONTEXT",
      "STORY_WORLD_CONTEXT"
    ],
    "tone_elements": [
      "ECONOMICAL",
      "QUIET",
      "INTIMATE",
      "WEIGHTED",
      "UNRESOLVED_AT_CLOSE",
      "STILLED"
    ],
    "pace_elements": [
      "BRISK",
      "RISES",
      "SLOWED",
      "HOLDS",
      "SETTLES"
    ],
    "communicative_function_elements": [
      "ADVANCES",
      "CLOSES",
      "REACTIVATES",
      "OPENS",
      "STAGES"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "3:6-7",
      "scene_kind": "PLAN_EXECUTION_SCENE",
      "scene_communicative_purpose": "Executes the plan to the letter and sets the night's stage: the man asleep by his grain, the woman at his feet, and nothing yet said.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "PLANNER",
            "presence": "REFERENCED",
            "referential_form": "HER_MOTHER_IN_LAW_CHAMOTAH"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL6"
          },
          {
            "place_id": "PL_END_OF_GRAIN_HEAP"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0042"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator does not say what Ruth intends beyond the plan, and does not name the risk. No word is spoken in the whole scene; the night holds its breath."
    },
    {
      "scene_id": "S2",
      "verse_range": "3:8-9",
      "scene_kind": "APPEAL_SCENE",
      "scene_communicative_purpose": "The turn of the night: the plan's script runs out and Ruth speaks past it — name, petition, and the redeemer-claim, in one breath in the dark.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "PRESENT",
            "referential_form": "HA_ISH_THE_MAN"
          },
          {
            "being_id": "B9",
            "role_in_scene": "PETITIONER",
            "presence": "PRESENT",
            "referential_form": "AMAH_RUTH_YOUR_SERVANT"
          },
          {
            "being_id": "B18",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B2",
            "role_in_scene": "ANCESTOR",
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
            "place_id": "PL6"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0037"
          },
          {
            "object_id": "CB_0001"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "__TODO__: בַּחֲצִי הַלַּיְלָה / \"at half of the night\""
          }
        ]
      },
      "significant_absence": "Ruth does not wait for the man to tell her what to do, though that is what the plan promised; the narrator does not mark the breach — her speech simply takes the plan's place. What the uncovering and the lying-down mean beyond themselves is never said; the text keeps the night's modesty. And no word of love or desire is spoken by either of them."
    },
    {
      "scene_id": "S3",
      "verse_range": "3:10-13",
      "scene_kind": "PLEDGE_SCENE",
      "scene_communicative_purpose": "Answers the night's petition with everything at once — blessing, honor, pledge, and law: Ruth is praised and promised, the nearer redeemer is disclosed, and the whole matter is bound under oath and handed to the morning.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "PETITIONER",
            "presence": "PRESENT",
            "referential_form": "MY_DAUGHTER_BITI"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B19",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "REFERENCED",
            "referential_form": "NEARER_REDEEMER_REFERENCED"
          },
          {
            "being_id": "B21",
            "role_in_scene": "TOWNSPEOPLE",
            "presence": "REFERENCED",
            "referential_form": "ALL_THE_GATE_OF_MY_PEOPLE"
          },
          {
            "being_id": "B?",
            "role_in_scene": "FOREGONE_SUITORS",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B2",
            "role_in_scene": "ANCESTOR",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL6"
          },
          {
            "place_id": "PL7"
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
            "object_id": "CB_0032"
          },
          {
            "object_id": "CB_0006"
          },
          {
            "object_id": "CB_0001"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "__TODO__: הַלַּיְלָה … בַבֹּקֶר / \"the night … in the morning\""
          }
        ]
      },
      "significant_absence": "Boaz does not say yes to the marriage itself — his pledge is to the redeeming, with the queue honored first; what he wants is never said apart from what is right. The nearer redeemer is not named. And nothing improper happens in the dark: the narrator marks no touch beyond the uncovering, and the night passes in words."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "3:6",
      "proposition_kind": "WENT_DOWN",
      "event_specific_slots": {
        "descender": "B9",
        "destination": "PL6",
        "compliance_marker": "ALL_THAT_MOTHER_IN_LAW_COMMANDED",
        "instruction_source": "B3"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "3:7a",
      "proposition_kind": "ATE",
      "event_specific_slots": {
        "diner": "B13",
        "ate": true,
        "drank": true,
        "disposition_after_meal": "HEART_WAS_GOOD"
      },
      "inter_proposition_links": {
        "forward_link_to": "P3"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0141"
      ]
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "3:7b",
      "proposition_kind": "LAY_DOWN",
      "event_specific_slots": {
        "one_lying_down": "B13",
        "location": "PL_END_OF_GRAIN_HEAP"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "3:7c",
      "proposition_kind": "UNCOVERED",
      "event_specific_slots": {
        "uncovering_components": [
          {
            "action": "WALKED",
            "approacher": "B9",
            "manner": "BA_LAT_SOFTLY",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "UNCOVERED",
            "uncoverer": "B9",
            "uncovered_place": "MARGELOTAV_PLACE_OF_FEET",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "LAY_DOWN",
            "one_lying_down": "B9",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [
        "CB_0042"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "3:8a",
      "proposition_kind": "TREMBLED",
      "event_specific_slots": {
        "startled_one": "B13",
        "startled_one_referential_form": "HA_ISH_THE_MAN",
        "time": "TM_HALF_OF_THE_NIGHT",
        "startle_components": [
          {
            "action": "TREMBLED",
            "trembler": "B13",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "TWISTED",
            "turner": "B13",
            "manner": "TWISTED_AROUND",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0130"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "3:8b",
      "proposition_kind": "PERCEIVED",
      "event_specific_slots": {
        "perceiver": "B13",
        "perceived": "B9",
        "perceived_as": "A_WOMAN_LYING_AT_HIS_FEET",
        "location": "MARGELOTAV_PLACE_OF_FEET",
        "attention_marker": "HINNEH_BEHOLD"
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P7"
      },
      "cb_flags": [
        "CB_0042"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "3:9a",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "asker": "B13",
        "asker_referential_form": "HA_ISH_THE_MAN",
        "addressee": "B9",
        "question_form": "MI_AT_WHO_ARE_YOU",
        "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
      },
      "inter_proposition_links": {
        "caused_by": "P6",
        "forward_link_to": "P8"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S2",
      "verse_anchor": "3:9b",
      "proposition_kind": "IDENTIFIED",
      "event_specific_slots": {
        "speaker": "B9",
        "self_identification": "RUTH_YOUR_SERVANT",
        "self_designation_form": "AMAH_MARRIAGEABLE_SERVANT",
        "status_shift_from": "SHIFCHAH_AT_2_13",
        "addressee": "B13",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P7",
        "paired_with": "P7",
        "forward_link_to": "P9"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0132"
      ]
    },
    {
      "prop_id": "P9",
      "scene_link": "S2",
      "verse_anchor": "3:9c",
      "proposition_kind": "APPEAL",
      "event_specific_slots": {
        "petitioner": "B9",
        "addressee": "B13",
        "petition_content": "SPREAD_YOUR_WING_OVER_SERVANT",
        "invoked_image": "KANAF_WING_OF_REFUGE",
        "cross_reference_to": "BOAZ_BLESSING_AT_2_12",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P8",
        "forward_link_to": "P10"
      },
      "cb_flags": [
        "CB_0037"
      ],
      "figure_flags": [
        "FIG_0131"
      ]
    },
    {
      "prop_id": "P10",
      "scene_link": "S2",
      "verse_anchor": "3:9d",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B9",
        "declared_ground": "YOU_ARE_A_REDEEMER",
        "redeemer_role": "B18",
        "redeemer_word_first_spoken_by": "B9",
        "addressee": "B13",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "back_reference_to_proposition": "P9",
        "forward_link_to": "P11"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "3:10a",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blessing_speaker": "B13",
        "blessing_recipients": [
          "B9"
        ],
        "invoked_divine_agent": "B10",
        "blessing_content_kind": "BLESSED_OF_YHWH",
        "address_form": "MY_DAUGHTER_BITI",
        "speech_act": "WISHES_FOR_HEARER"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P12"
      },
      "cb_flags": [
        "CB_0008"
      ],
      "figure_flags": [
        "FIG_0137"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "3:10b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "praised_one": "B9",
        "praise_content": "LAST_HESED_BETTER_THAN_FIRST",
        "hesed_thread_reference": "FIRST_AT_1_8_AND_2_20",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P13"
      },
      "cb_flags": [
        "CB_0011"
      ],
      "figure_flags": [
        "FIG_0133",
        "FIG_0111"
      ]
    },
    {
      "prop_id": "P13",
      "scene_link": "S3",
      "verse_anchor": "3:10c",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "praised_one": "B9",
        "commended_restraint": "NOT_GONE_AFTER_YOUNG_MEN",
        "young_men": "B?",
        "scope_form": "WHETHER_POOR_OR_RICH",
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
      "verse_anchor": "3:11a",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "address_form": "MY_DAUGHTER_BITI",
        "reassurance_components": [
          {
            "directed_content": "DO_NOT_FEAR",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          },
          {
            "pledge": "ALL_THAT_YOU_SAY_I_WILL_DO",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P15"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0123",
        "FIG_0136"
      ]
    },
    {
      "prop_id": "P15",
      "scene_link": "S3",
      "verse_anchor": "3:11b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "subject": "B9",
        "public_knowers": "B21",
        "public_venue": "PL7",
        "attested_quality": "ESHET_CHAYIL_WOMAN_OF_WORTH",
        "completes_pair_with": "BOAZ_ISH_GIBBOR_CHAYIL_AT_2_1",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "back_reference_to_proposition": "P14",
        "forward_link_to": "P16"
      },
      "cb_flags": [
        "CB_0032",
        "CB_0006"
      ],
      "figure_flags": [
        "FIG_0134"
      ]
    },
    {
      "prop_id": "P16",
      "scene_link": "S3",
      "verse_anchor": "3:12a",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "owned_claim": "TRULY_I_AM_A_REDEEMER",
        "redeemer_role": "B18",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P17"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P17",
      "scene_link": "S3",
      "verse_anchor": "3:12b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "disclosed_complication": "A_REDEEMER_NEARER_THAN_I",
        "nearer_redeemer": "B19",
        "nearer_redeemer_referential_form": "NEARER_REDEEMER_REFERENCED",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P16",
        "forward_link_to": "P18"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": [
        "FIG_0138",
        "FIG_0112"
      ]
    },
    {
      "prop_id": "P18",
      "scene_link": "S3",
      "verse_anchor": "3:13a",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "action": "DIRECTED",
        "commanded_step": "LODGE_THE_NIGHT",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "forward_link_to": "P19"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0140"
      ]
    },
    {
      "prop_id": "P19",
      "scene_link": "S3",
      "verse_anchor": "3:13b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "protocol_time": "TM_NIGHT_UNTIL_MORNING",
        "nearer_redeemer": "B19",
        "redeemer_role": "B18",
        "protocol_components": [
          {
            "condition": "IF_HE_REDEEMS_YOU",
            "outcome": "GOOD_LET_HIM_REDEEM",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "condition": "IF_HE_DOES_NOT_WANT_TO_REDEEM",
            "outcome": "BOAZ_WILL_REDEEM_HER_HIMSELF",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P17",
        "forward_link_to": "P20"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": [
        "FIG_0140"
      ]
    },
    {
      "prop_id": "P20",
      "scene_link": "S3",
      "verse_anchor": "3:13c",
      "proposition_kind": "VOW",
      "event_specific_slots": {
        "oath_swearer": "B13",
        "oath_formula": "CHAI_YHWH_AS_YHWH_LIVES",
        "oath_guarantor": "B10",
        "speech_act": "INVOKES_DIVINE_AS_OATH_GUARANTOR"
      },
      "inter_proposition_links": {
        "caused_by": "P19",
        "paired_with": "P19",
        "forward_link_to": "P21"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0135"
      ]
    },
    {
      "prop_id": "P21",
      "scene_link": "S3",
      "verse_anchor": "3:13d",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "action": "DIRECTED",
        "commanded_step": "LIE_DOWN_UNTIL_MORNING",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P20",
        "paired_with": "P18"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0139"
      ]
    }
  ]
}
```
