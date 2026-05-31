---
type: "sta-for-model"
pericope: "P04"
pericope-title: "Naomi and Ruth arrive in Bethlehem; the women of the town react; Naomi renames herself Mara"
source-meaning-map: [[P04-Ruth-1-19-22]]
status: "valid"
pilot: "pilot-2"
---

# P04 — Ruth 1:19–22 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_04_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 1:19-22",
    "pericope_title": "Naomi and Ruth arrive in Bethlehem; the women of the town react; Naomi renames herself Mara",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P04-Ruth-1-19-22",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "One scene-level INTIMATE override on S2 (Naomi's renaming lament — speaking to women of her own town from her own grief; relational-close register fits the moment better than CEREMONIAL even though renaming and Shaddai-doubling carry institutional weight at form level). S1 and S3 stay at INFORMAL_CASUAL narrator default. No moment-level overrides.",
      "scene_level": [
        {
          "scene_id": "S2",
          "override_value": "INTIMATE",
          "genre_override": null,
          "genre_group_override": null
        }
      ],
      "moment_level": null
    }
  },
  "level_1": {
    "arc_elements": [
      "PUBLIC_ARRIVAL",
      "COMMUNITY_RECOGNITION_FAILURE",
      "PUBLIC_LAMENT",
      "RENAMING_LAMENT",
      "NARRATOR_FRAMING_CLOSE",
      "HARVEST_FRAMING_OPEN"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "TEMPORAL_CONTEXT",
      "DIVINE_CONTEXT",
      "PRIOR_ACTION_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT"
    ],
    "tone_elements": [
      "STILLED_AT_ARRIVAL",
      "WEIGHTED",
      "DECLARATIVE",
      "RESTRAINED_LAMENT",
      "UNRESOLVED_AT_CLOSE"
    ],
    "pace_elements": [
      "NARROWS_AT_RECOGNITION_FAILURE",
      "RISES_THROUGH_LAMENT",
      "SETTLES_AT_NARRATOR_FRAME_CLOSE"
    ],
    "communicative_function_elements": [
      "CLOSES_CHAPTER_ONE_EMPTYING_ARC",
      "ESTABLISHES_PUBLIC_LAMENT_ACCOUNT",
      "REACTIVATES_MOABITE_EPITHET_ON_RUTH_IN_NARRATOR_VOICE",
      "CLOSES_BREAD_HOUSE_IN_FAMINE_CROSS_PERICOPE_FIGURE",
      "OPENS_HARVEST_PROVISION_DISCOURSE_THREAD",
      "STAGES_STRUCTURAL_IRONY_HARVEST_OPENS_AS_EMPTY_LAMENT_ENDS"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:19",
      "scene_kind": "PUBLIC_ARRIVAL_AND_RECOGNITION_SCENE",
      "scene_communicative_purpose": "Stages the public arrival in Bethlehem; community recognition fails; the women's question opens the dialogue Naomi will answer in Scene 2.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "PROTAGONIST_ARRIVING_AT_HOMETOWN",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "ACCOMPANYING_DAUGHTER_IN_LAW_ARRIVING_SILENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B28",
            "role_in_scene": "COLLECTIVE_SUBJECT_OF_COMMUNAL_STIRRING",
            "presence": "PRESENT_COLLECTIVE"
          },
          {
            "being_id": "B24",
            "role_in_scene": "SPEAKING_SUBSET_ASKING_RECOGNITION_QUESTION",
            "presence": "PRESENT_COLLECTIVE"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL1",
            "role_in_scene": "DESTINATION_REACHED_AND_PUBLIC_ARRIVAL_LOCUS"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). No persistent objects. Relocated: the Bethlehem 'house of bread' naming on arrival → FIG_0013 (bread-house-in-famine, active at P1/P2); the arrival → P1 (WALKING_AND_ARRIVAL); the communal stirring of the whole city → P2 (COMMUNAL_STIRRING_AT_ARRIVAL); the women's recognition-question → P3 (ASKED_RHETORICAL_RECOGNITION_QUESTION).",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous with the journey established in P02. The barley-harvest setting is named at v.22 in S3, not here.",
        "entries": null
      },
      "significant_absence": "The narrator does not say why the women cannot recognize Naomi (grief, age, demeanor, appearance — all withheld). The narrator records no specific recognition or reaction toward Ruth at the arrival moment; no one greets either of them."
    },
    {
      "scene_id": "S2",
      "verse_range": "1:20-21",
      "scene_kind": "PUBLIC_LAMENT_AND_RENAMING_SCENE",
      "scene_communicative_purpose": "Establishes Naomi's public account of her state — bitter, brought back empty, testified-against, dealt-evil-to. Refuses her given name and proposes a substitute. Names YHWH twice and Shaddai twice as divine agents of her bitterness.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "SPEAKER_OF_PUBLIC_RENAMING_LAMENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B24",
            "role_in_scene": "SILENT_COLLECTIVE_ADDRESSEE_OF_LAMENT",
            "presence": "PRESENT_COLLECTIVE"
          },
          {
            "being_id": "B10",
            "role_in_scene": "INVOKED_DIVINE_AGENT_OF_RETURN_EMPTY_AND_COURTROOM_TESTIMONY",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B12",
            "role_in_scene": "INVOKED_DIVINE_AGENT_OF_BITTERING_AND_HARM",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "_note": "No proper place is named in the speech; the implicit out/back trajectory between Bethlehem (departure) and Bethlehem (return) brackets the lament-arc but is not a separately named place inside Naomi's speech.",
        "entries": null
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). No persistent objects. Relocated: the refusal of her own name → P4 (REFUSED_USE_OF_OWN_NAME); the proposed renaming to Mara → P4 (PROPOSED_NEW_NAME; B3 referential_form; cb_flag CB_0023; FIG_0082); the Mara/hemar root-pun → FIG_0083; the bittering ascription to Shaddai → P4 (FIG_0006 Shaddai-name); 'I went out full' and the riqam 'empty' → P5 (STATED_FULL_EMPTY_ANTITHESIS; FIG_0084; cb_flags CB_0024, CB_0044); the rhetorical protest-question → P5 (ASKED_RHETORICAL_QUESTION_AS_PROTEST); the anah-bi courtroom testimony → P5 (ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH; cb_flag CB_0025); the Shaddai-did-evil harm → P5 (FIG_0086). PENDING (the lead's ruling): the doubled-divine-name pattern (YHWH twice and Shaddai twice across 1:20–21) has no figure of its own — its four invocations survive at P4/P5 (Shaddai → FIG_0006; YHWH → P5 slots + CB_0025), but the pattern as a figure was dropped in the first pass; a new figure is proposed for it (see handoff). Not added here pending the ruling.",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; the speech occurs at the moment of arrival; time is continuous.",
        "entries": null
      },
      "significant_absence": "The women do not respond to Naomi's lament — no comfort, no blessing, no further question, no acknowledgement of the proposed renaming. Naomi gives no greeting on arrival, does not bless the women, does not introduce Ruth, does not name her dead husband or sons (only 'I went out full' as oblique reference). The narrator gives no assessment of Naomi's account."
    },
    {
      "scene_id": "S3",
      "verse_range": "1:22",
      "scene_kind": "NARRATOR_FRAMING_CLOSE_SCENE",
      "scene_communicative_purpose": "Closes the pericope with a narrator-frame summary that returns the narrator's naming over Naomi's proposed renaming, reactivates the Moabite epithet on Ruth at the public-arrival moment, and opens the harvest-frame against which Naomi's lament has just been spoken.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "RETURNING_PROTAGONIST_NAMED_AGAIN_BY_NARRATOR_AFTER_SELF_REJECTION",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B9",
            "role_in_scene": "ACCOMPANYING_DAUGHTER_IN_LAW_REACTIVATING_NARRATOR_EPITHET_RUTH_THE_MOABITESS",
            "presence": "PRESENT",
            "referential_form": "RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW_NARRATOR_EPITHET"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL1",
            "role_in_scene": "ARRIVAL_POINT_NAMED_AGAIN_AGAINST_HARVEST_FRAME"
          },
          {
            "place_id": "PL2",
            "role_in_scene": "REFERENCED_AS_JOURNEY_ORIGIN_IN_NARRATOR_SUMMARY"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013). Kept: barley-harvest CB_0026 (the harvest-frame opening at v.22). Relocated: the narrator return-summary → P6 (RETURNED); the 'Ruth the Moabitess' epithet → B9 referential_form (FIG_0001; cb_flag CB_0004); the daughter-in-law (kallatah) kinship naming → B9 referential_form (cb_flag CB_0017); the arrival at the harvest-opening → P6 (ARRIVED_AT; time_setting TM_BARLEY_HARVEST_BEGINNING).",
        "entries": [
          {
            "object_id": "CB_0026",
            "function_in_scene": "HARVEST_FRAME_THAT_OPENS_THE_PROVISION_CONTEXT_AGAINST_NAOMIS_EMPTY_LAMENT"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_BARLEY_HARVEST_BEGINNING",
            "role_in_scene": "AGRICULTURAL_SEASON_FRAME_OPENING_THAT_CLOSES_AT_P07"
          }
        ]
      },
      "significant_absence": "The narrator does not preview what the harvest will bring; does not say whether anyone in the city responds further to Naomi after her speech; does not give Ruth any voice or further action at the arrival; does not name Naomi's dead husband or sons in the return-summary. Ruth has been silent through the entire pericope."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:19a",
      "proposition_kind": "WALKING_AND_ARRIVAL",
      "event_specific_slots": {
        "walkers": [
          "B3",
          "B9"
        ],
        "destination": "PL1",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0013"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "1:19b",
      "proposition_kind": "COMMUNAL_STIRRING_AT_ARRIVAL",
      "event_specific_slots": {
        "stirred_collective": "B28",
        "about_whom": [
          "B3",
          "B9"
        ],
        "at_arrival_to": "PL1",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0013"
      ]
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "1:19c",
      "proposition_kind": "ASKED_RHETORICAL_RECOGNITION_QUESTION",
      "event_specific_slots": {
        "question_speakers": "B24",
        "question_addressee_party": [
          "B3"
        ],
        "target_being_in_question": "B3",
        "speech_act": "ASKS_RHETORICAL_QUESTION_OF_SURPRISED_RECOGNITION"
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
      "scene_link": "S2",
      "verse_anchor": "1:20",
      "proposition_kind": "REFUSED_OWN_NAME_AND_PROPOSED_RENAMING",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B24"
        ],
        "renaming_components": [
          {
            "action": "REFUSED_USE_OF_OWN_NAME",
            "refused_name": "Naomi",
            "refused_name_meaning": "SWEET",
            "referential_form_at_verse": "SELF_REFERENCE_REFUSING_OWN_NAME",
            "list_position": "FIRST",
            "speech_act": "REFUSES_USE_OF_OWN_NAME"
          },
          {
            "action": "PROPOSED_NEW_NAME",
            "proposed_name": "Mara",
            "proposed_name_meaning": "BITTER",
            "referential_form_at_verse": "PROPOSED_NEW_NAME_MARA_IN_SELF_SPEECH",
            "list_position": "SECOND",
            "speech_act": "PROPOSES_NEW_NAME_FOR_SELF"
          },
          {
            "action": "STATED_LAMENT_REASON_BITTERED_BY_YHWH",
            "invoked_divine_agent": "B12",
            "invoked_divine_agent_referential_form": "SHADDAI_ARCHAIC_POETIC_DIVINE_NAME_FIRST_OCCURRENCE",
            "list_position": "THIRD",
            "speech_act": "ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT"
          }
        ]
      },
      "inter_proposition_links": {
        "back_reference_to_proposition": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [
        "CB_0023"
      ],
      "figure_flags": [
        "FIG_0082",
        "FIG_0083",
        "FIG_0006"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "1:21",
      "proposition_kind": "SPOKE_LAMENT_WITH_DOUBLED_DIVINE_ATTRIBUTION",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B24"
        ],
        "lament_components": [
          {
            "action": "STATED_FULL_EMPTY_ANTITHESIS",
            "state_at_departure": "FULL",
            "state_at_return": "EMPTY",
            "agent_of_return_empty": "B10",
            "list_position": "FIRST",
            "speech_act": "ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT"
          },
          {
            "action": "ASKED_RHETORICAL_QUESTION_AS_PROTEST",
            "question_target_referential_form": "REFUSED_NAME_NAOMI_IN_RECALL",
            "list_position": "SECOND",
            "speech_act": "ASKS_RHETORICAL_QUESTION_AS_PROTEST"
          },
          {
            "action": "ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH",
            "invoked_divine_agent": "B10",
            "list_position": "THIRD",
            "speech_act": "ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT"
          },
          {
            "action": "ASCRIBED_HARM_TO_YHWH",
            "invoked_divine_agent": "B12",
            "invoked_divine_agent_referential_form": "SHADDAI_ARCHAIC_POETIC_DIVINE_NAME_SECOND_OCCURRENCE",
            "list_position": "FOURTH",
            "speech_act": "ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P6"
      },
      "cb_flags": [
        "CB_0024",
        "CB_0025",
        "CB_0044"
      ],
      "figure_flags": [
        "FIG_0084",
        "FIG_0086",
        "FIG_0006",
        "FIG_0088"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S3",
      "verse_anchor": "1:22",
      "proposition_kind": "NARRATOR_FRAME_RETURN_AND_ARRIVAL_AT_HARVEST_OPENING",
      "event_specific_slots": {
        "return_components": [
          {
            "action": "RETURNED",
            "returned_party": "B3",
            "returned_referential_form": "NAMED",
            "accompanying_household": [
              "B9"
            ],
            "accompanying_referential_form": "RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW_NARRATOR_EPITHET",
            "origin_place": "PL2",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "ARRIVED_AT",
            "arrivers": [
              "B3",
              "B9"
            ],
            "destination": "PL1",
            "time_setting": "TM_BARLEY_HARVEST_BEGINNING",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "paired_with": "P3"
      },
      "cb_flags": [
        "CB_0004",
        "CB_0017",
        "CB_0026"
      ],
      "figure_flags": [
        "FIG_0001",
        "FIG_0013",
        "FIG_0088"
      ]
    }
  ]
}
```
