---
type: "sta-for-model"
pericope: "P09"
pericope-title: "The threshing-floor night: the wing asked for, the redeemer named, the oath"
source-meaning-map: [[P09-Ruth-3-6-13]]
status: "valid"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, ruled by Marcia (SC-0064 batch ruling §A–§E + arc_element, 2026-06-19); MODEL_DRAFTED_REVIEWER_RULED"
---

# P09 — Ruth 3:6-13 — FOR_MODEL

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
      "_note": "Scenes 2-3 shift to INTIMATE (the whispered exchange in the dark at midnight); one moment at 3:10 lifts to CEREMONIAL (Boaz's blessing form). The v.13 chai-YHWH oath stays INTIMATE per the P03 precedent. Scene 1 is the narrator's plain INFORMAL_CASUAL telling.",
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
      "NEARER_REDEEMER_DISCLOSURE",
      "OATH_SEALING"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "DIVINE_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT"
    ],
    "tone_elements": [
      "QUIET",
      "ECONOMICAL",
      "INTIMATE",
      "ANTICIPATORY",
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
      "scene_kind": "NIGHT_APPROACH_SCENE",
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
            "role_in_scene": "REDEEMER_KIN",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "PLANNER",
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
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "RUTH_YOUR_SERVANT_AMAH"
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
            "time_id": "TM_MIDDLE_OF_THE_NIGHT"
          }
        ]
      },
      "significant_absence": "Ruth does not wait for the man to tell her what to do, though that is what the plan promised; the narrator does not mark the breach — her speech simply takes the plan's place. What the uncovering and the lying-down mean beyond themselves is never said; the text keeps the night's modesty. And no word of love or desire is spoken by either of them."
    },
    {
      "scene_id": "S3",
      "verse_range": "3:10-13",
      "scene_kind": "BLESSING_SCENE",
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
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "MY_DAUGHTER"
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
            "referential_form": "NEARER_REDEEMER_UNNAMED"
          },
          {
            "being_id": "B21",
            "role_in_scene": "TOWNSPEOPLE",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B?",
            "role_in_scene": "POTENTIAL_SUITORS",
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
            "time_id": "TM_NIGHT_UNTIL_MORNING"
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
        "compliance_form": "ALL_AS_COMMANDED",
        "commanding_party": "B3"
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
        "resulting_disposition": "HEART_WAS_GOOD"
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
      "proposition_kind": "APPROACHED",
      "event_specific_slots": {
        "approach_components": [
          {
            "action": "WALKED",
            "approacher": "B9",
            "manner": "SOFTLY",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "UNCOVERED_FEET",
            "uncoverer": "B9",
            "uncovered_place": "CB_0042",
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
        "one_who_trembled": "B13",
        "time_of_startle": "TM_MIDDLE_OF_THE_NIGHT",
        "follow_motion": "TWISTED_AROUND",
        "referential_form_at_verse": "HA_ISH_THE_MAN"
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
        "perceived_being": "B9",
        "perceived_as": "A_WOMAN",
        "location": "CB_0042"
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
      "proposition_kind": "ASKED",
      "event_specific_slots": {
        "asker": "B13",
        "addressee": "B9",
        "referential_form_at_verse": "HA_ISH_THE_MAN",
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
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B13",
        "self_referential_form": "RUTH_YOUR_SERVANT_AMAH",
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
        "petitioned": "B13",
        "invoked_image": "CB_0037",
        "self_referential_form": "AMAH_SERVANT",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
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
        "declarer": "B9",
        "addressee": "B13",
        "redeemer_role": "B18",
        "redeemer_concept": "CB_0001",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "paired_with": "P9",
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
        "blessing_recipients": "B9",
        "invoked_deity": "B10",
        "address_form": "MY_DAUGHTER",
        "blessing_content_kind": "BLESSED_OF_YHWH",
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
        "declarer": "B13",
        "praised_party": "B9",
        "hesed_concept": "CB_0011",
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
        "declarer": "B13",
        "about_party": "B9",
        "young_men": "B?",
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
      "proposition_kind": "REASSURED",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B9",
        "address_form": "MY_DAUGHTER",
        "reassurance_components": [
          {
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          },
          {
            "speech_act": "VOWS"
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
        "declarer": "B13",
        "knowing_public": "B21",
        "public_venue": "PL7",
        "gate_concept": "CB_0006",
        "worth_concept": "CB_0032",
        "about_party": "B9",
        "referential_form_at_verse": "ESHET_CHAYIL_WOMAN_OF_WORTH",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P14",
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
        "declarer": "B13",
        "redeemer_concept": "CB_0001",
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
        "declarer": "B13",
        "disclosed_party": "B19",
        "redeemer_concept": "CB_0001",
        "referential_form": "NEARER_REDEEMER_UNNAMED",
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
        "instructor": "B13",
        "instructed": "B9",
        "action": "DIRECTED",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P17",
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
        "protocol_components": [
          {
            "redeemer": "B19",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "self_redeemer": "B13",
            "speech_act": "VOWS"
          }
        ],
        "redeemer_concept": "CB_0001"
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
        "swearer": "B13",
        "invoked_divine_witness": "B10",
        "speech_act": "INVOKES_DIVINE_AS_OATH_GUARANTOR"
      },
      "inter_proposition_links": {
        "caused_by": "P19",
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
        "instructor": "B13",
        "instructed": "B9",
        "action": "DIRECTED",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "caused_by": "P20"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0139"
      ]
    }
  ]
}
```
