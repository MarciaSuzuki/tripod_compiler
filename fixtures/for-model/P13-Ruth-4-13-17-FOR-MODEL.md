---
type: "sta-for-model"
pericope: "P13"
pericope-title: "Obed: the conception YHWH gives, the women's blessing, the child on Naomi's lap"
source-meaning-map: [[P13-Ruth-4-13-17]]
status: "valid"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, ruled by Marcia (SC-0064 batch ruling §A–§E + arc_element, 2026-06-19); MODEL_DRAFTED_REVIEWER_RULED"
---

# P13 — Ruth 4:13-17 — FOR_MODEL

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "ruth_pericope_13_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 4:13-17",
    "pericope_title": "Obed: the conception YHWH gives, the women's blessing, the child on Naomi's lap",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P13-Ruth-4-13-17",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Pericope stays INFORMAL_CASUAL (narrator's telling). MM Section 1 marks two scene-level shifts: S2 (4:14-15) the women's benediction lifts to CEREMONIAL; S3 (4:16-17) the lap/cradle settles to INTIMATE. No moment-level or framing overrides.",
      "scene_level": [
        {
          "scene_id": "S2",
          "override_value": "CEREMONIAL"
        },
        {
          "scene_id": "S3",
          "override_value": "INTIMATE"
        }
      ],
      "moment_level": null
    }
  },
  "level_1": {
    "arc_elements": [
      "MARRIAGE_CONSUMMATED",
      "DIVINE_GIFT_OF_CONCEPTION",
      "BIRTH_OF_HEIR",
      "BLESSING_INVOCATION",
      "EMPTYING_REVERSED",
      "COMMUNAL_NAMING",
      "NARRATOR_FRAMING_CLOSE"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "DIVINE_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "HISTORICAL_ERA_CONTEXT"
    ],
    "tone_elements": [
      "ECONOMICAL",
      "WARM",
      "INTIMATE",
      "STILLED",
      "RISING"
    ],
    "pace_elements": [
      "BRISK",
      "SLOWED",
      "SETTLES",
      "WIDENS"
    ],
    "communicative_function_elements": [
      "CLOSES",
      "ADVANCES",
      "REACTIVATES",
      "OPENS"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "4:13",
      "scene_kind": "BIRTH_SCENE",
      "scene_communicative_purpose": "Resolves the marriage and the waiting in a single swift line, with YHWH's gift of conception at its center — the book's second direct act of God.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "HUSBAND",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "WIFE",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B?",
            "role_in_scene": "SON",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_NAOMIS_DWELLING"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0001"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator gives no wedding, no span of time, no description of the birth — only the bare swift verbs. And the child is not yet named or claimed; the women's word in the next verses does that, and not by the parents."
    },
    {
      "scene_id": "S2",
      "verse_range": "4:14-15",
      "scene_kind": "BLESSING_SCENE",
      "scene_communicative_purpose": "Turns the birth into a word of YHWH's faithfulness to Naomi: the child named her redeemer, restorer, and sustainer, and Ruth measured past a full house.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B24",
            "role_in_scene": "TOWNSWOMEN",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "GRANDMOTHER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B?",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "REFERENCED",
            "referential_form": "REDEEMER_GOEL"
          },
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "REFERENCED",
            "referential_form": "DAUGHTER_IN_LAW_WHO_LOVES_YOU"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_ISRAEL"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0008"
          },
          {
            "object_id": "CB_0001"
          },
          {
            "object_id": "CB_0005"
          },
          {
            "object_id": "CB_0046"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The women bless Naomi, not Ruth and not Boaz — the child is reckoned first to the once-empty grandmother. And though they praise Ruth's love and her bearing, they do not name her — she is \"your daughter-in-law\"; the Moabite label, carried the whole book, is gone here, replaced by love."
    },
    {
      "scene_id": "S3",
      "verse_range": "4:16-17",
      "scene_kind": "NAMING_SCENE",
      "scene_communicative_purpose": "Closes the book's reversal at its tenderest and then its widest: the child against Naomi's chest, named for her by the women, and the names that open onto David.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "GRANDMOTHER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B?",
            "role_in_scene": "SON",
            "presence": "PRESENT"
          },
          {
            "being_id": "B24",
            "role_in_scene": "TOWNSWOMEN",
            "presence": "PRESENT"
          },
          {
            "being_id": "B25",
            "role_in_scene": "ANCESTOR",
            "presence": "PRESENT"
          },
          {
            "being_id": "B26",
            "role_in_scene": "LINEAGE_REFERENT",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_NAOMIS_DWELLING"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0047"
          },
          {
            "object_id": "CB_0048"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Ruth is not in this last scene — the child is on Naomi's lap and reckoned a son to Naomi, the mother stepped out of the closing frame. Boaz, too, is gone from the telling after 4:13. And the narrator names David without a word of who he is or will be — the weight of the name is left for the audience to carry."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "4:13a",
      "proposition_kind": "TOOK",
      "event_specific_slots": {
        "taker": "B13",
        "wife_taken": "B9",
        "consummation_marker": "CAME_TO_HER"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": [
        "FIG_0180",
        "FIG_0188"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "4:13b",
      "proposition_kind": "GAVE",
      "event_specific_slots": {
        "giver": "B10",
        "gift_given": "CONCEPTION",
        "given_to": "B9",
        "divine_act_marker": "SECOND_DIRECT_DIVINE_ACT"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0180",
        "FIG_0194"
      ]
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "4:13c",
      "proposition_kind": "BORE",
      "event_specific_slots": {
        "bearer": "B9",
        "child_borne": "B?",
        "child_sex": "SON"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0180"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S2",
      "verse_anchor": "4:14a",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blessing_speakers": "B24",
        "blessing_addressee": "B3",
        "invoked_deity": "B10",
        "blessing_content_kind": "HAS_NOT_LEFT_WITHOUT_REDEEMER_TODAY",
        "redeemer": "B?",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [
        "CB_0001",
        "CB_0008"
      ],
      "figure_flags": [
        "FIG_0142",
        "FIG_0014",
        "FIG_0187"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "4:14b",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "wish_speakers": "B24",
        "name_bearer": "B?",
        "where": "PL_ISRAEL",
        "speech_act": "WISHES_FOR_THIRD_PARTY"
      },
      "inter_proposition_links": {
        "forward_link_to": "P6"
      },
      "cb_flags": [
        "CB_0005"
      ],
      "figure_flags": [
        "FIG_0184"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "4:15a",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "declared_speakers": "B24",
        "child": "B?",
        "born_for": "B3",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P7"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "4:15b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "declared_speakers": "B24",
        "praised_bearer": "B9",
        "bearer_referential_form": "DAUGHTER_IN_LAW_WHO_LOVES_YOU",
        "child_borne": "B?",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P8"
      },
      "cb_flags": [
        "CB_0046"
      ],
      "figure_flags": [
        "FIG_0183"
      ]
    },
    {
      "prop_id": "P8",
      "scene_link": "S3",
      "verse_anchor": "4:16a",
      "proposition_kind": "TOOK",
      "event_specific_slots": {
        "taker": "B3",
        "child_taken": "B?",
        "placement": "SET_ON_BOSOM_CHEQ"
      },
      "inter_proposition_links": {
        "forward_link_to": "P9"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0185",
        "FIG_0016"
      ]
    },
    {
      "prop_id": "P9",
      "scene_link": "S3",
      "verse_anchor": "4:16b",
      "proposition_kind": "IDENTIFIED",
      "event_specific_slots": {
        "caregiver": "B3",
        "assumed_role": "NURSE_OMENET",
        "for_child": "B?"
      },
      "inter_proposition_links": {
        "caused_by": "P8",
        "forward_link_to": "P10"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0186"
      ]
    },
    {
      "prop_id": "P10",
      "scene_link": "S3",
      "verse_anchor": "4:17a",
      "proposition_kind": "NAMED",
      "event_specific_slots": {
        "naming_speakers": "B24",
        "reckoned_to": "B3",
        "named_child": "B?",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P11"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0181",
        "FIG_0182"
      ]
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "4:17b",
      "proposition_kind": "NAMED",
      "event_specific_slots": {
        "naming_speakers": "B24",
        "name_given": "Obed",
        "named_child": "B25",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cb_flags": [
        "CB_0047"
      ],
      "figure_flags": [
        "FIG_0182"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "4:17c",
      "proposition_kind": "NARRATOR_FRAME",
      "event_specific_slots": {
        "narrator_genealogical_reach": [
          {
            "father": "B25",
            "father_name": "Obed",
            "son_named": "Jesse",
            "son_id": "B26",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "father_named": "Jesse",
            "son_named": "David",
            "son_id": "B26",
            "speech_act": "STATES_AS_TRUE"
          }
        ],
        "narrator_vantage": "LATER_TIME"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0048"
      ],
      "figure_flags": [
        "FIG_0182",
        "FIG_0192",
        "FIG_0189",
        "FIG_0007"
      ]
    }
  ]
}
```
