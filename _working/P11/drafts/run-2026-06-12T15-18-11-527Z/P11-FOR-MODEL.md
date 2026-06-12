---
type: "sta-for-model"
pericope: "P11"
pericope-title: "The gate: the non-name, the field before Ruth, and the sandal"
source-meaning-map: [[P11-Ruth-4-1-8]]
status: "draft"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"
---

# P11 — Ruth 4:1-8 — FOR_MODEL (DRAFT — machine-drafted, awaiting review)

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "ruth_pericope_11_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 4:1-8",
    "pericope_title": "The gate: the non-name, the field before Ruth, and the sandal",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P11-Ruth-4-1-8",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "scene_level": [
        {
          "scene_id": "S2",
          "override_value": "FORMAL_OFFICIAL"
        },
        {
          "scene_id": "S3",
          "override_value": "FORMAL_OFFICIAL"
        },
        {
          "scene_id": "S4",
          "override_value": "FORMAL_OFFICIAL"
        }
      ],
      "moment_level": [
        {
          "verse": "4:7",
          "override_value": "INFORMAL_CASUAL"
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "GATE_COURT_CONVENED",
      "CHANCE_PROVIDENCE_ARRIVAL",
      "REDEMPTION_OFFER",
      "STAGED_DISCLOSURE",
      "REDEMPTION_DECLINED",
      "ATTESTATION_BY_SANDAL"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "HISTORICAL_ERA_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD"
    ],
    "tone_elements": [
      "PROCEDURAL",
      "DECLARATIVE",
      "ECONOMICAL",
      "ANTICIPATORY"
    ],
    "pace_elements": [
      "BRISK",
      "DELIBERATE",
      "SLOWED"
    ],
    "communicative_function_elements": [
      "ADVANCES",
      "STAGES",
      "OPENS",
      "WITHHOLDS",
      "CLOSES",
      "ESTABLISHES"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "4:1-2",
      "scene_kind": "GATE_COURT_CONVENING_SCENE",
      "scene_communicative_purpose": "Convenes the court in three sittings — the redeemer, the elders, the matter — and lets the book's second great coincidence pass without comment: the very man, passing at the very moment.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "CONVENER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B19",
            "role_in_scene": "NEARER_REDEEMER",
            "presence": "PRESENT",
            "referential_form": "PELONI_ALMONI_NON_NAME"
          },
          {
            "being_id": "B20",
            "role_in_scene": "WITNESSING_ELDERS",
            "presence": "PRESENT"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DECEASED_KINSMAN",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL7"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0006"
          },
          {
            "object_id": "CB_0001"
          },
          {
            "object_id": "CB_0045"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The nearer redeemer is given no name — the narrator, who names with care everywhere, hands him only a placeholder. Nothing is said of why he happens to pass at that moment; the chance is told as flatly as the chance of 2:3. Ruth and Naomi are not present, and will not be, through the whole proceeding."
    },
    {
      "scene_id": "S2",
      "verse_range": "4:3-4",
      "scene_kind": "REDEMPTION_OFFER_SCENE",
      "scene_communicative_purpose": "Lays the first stage before the court — the field alone — and draws the confident claim that the second stage will reverse.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "REDEMPTION_OFFEROR",
            "presence": "PRESENT"
          },
          {
            "being_id": "B19",
            "role_in_scene": "NEARER_REDEEMER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B20",
            "role_in_scene": "WITNESSING_ELDERS",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "SELLER",
            "presence": "REFERENCED",
            "referential_form": "NAOMI_WHO_RETURNED_FROM_MOAB"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DECEASED_KINSMAN",
            "presence": "REFERENCED",
            "referential_form": "OUR_BROTHER_ELIMELECH"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL7"
          },
          {
            "place_id": "PL_ELIMELECH_FIELD_PORTION"
          },
          {
            "place_id": "PL2"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0003"
          },
          {
            "object_id": "FIG_0167"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Ruth is not mentioned in the offer — the staging withholds her entirely. How Naomi came to hold the right to sell, and why this is the first the audience hears of a field, the narrator never explains. The dead man is \"our brother\"; his sons are not named."
    },
    {
      "scene_id": "S3",
      "verse_range": "4:5-6",
      "scene_kind": "REDEMPTION_DECLINE_SCENE",
      "scene_communicative_purpose": "Springs the staged second stage: the field carries the widow and the dead man's name, and the confident claim of the first stage reverses into the decline that frees Boaz's way.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "REDEMPTION_OFFEROR",
            "presence": "PRESENT"
          },
          {
            "being_id": "B19",
            "role_in_scene": "NEARER_REDEEMER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "WIDOW",
            "presence": "REFERENCED",
            "referential_form": "THE_MOABITE_WIFE_OF_THE_DEAD"
          },
          {
            "being_id": "B3",
            "role_in_scene": "SELLER",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B?",
            "role_in_scene": "DECEASED_HUSBAND",
            "presence": "REFERENCED",
            "referential_form": "THE_DEAD_UNNAMED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL7"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0005"
          },
          {
            "object_id": "CB_0002"
          },
          {
            "object_id": "CB_0039"
          },
          {
            "object_id": "CB_0003"
          },
          {
            "object_id": "CB_0004"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_DAY_OF_PURCHASE"
          }
        ]
      },
      "significant_absence": "Why redeeming Ruth would ruin the man's inheritance is never explained — the reason is left folded inside his refusal. No one asks Ruth; no one asks Naomi; neither is there. The dead husband is still \"the dead,\" his name one scene away. And the man who will not raise the name gives his refusal — and keeps his own name unspoken too."
    },
    {
      "scene_id": "S4",
      "verse_range": "4:7-8",
      "scene_kind": "RATIFICATION_SCENE",
      "scene_communicative_purpose": "Closes the proceeding with its one physical act, slowed by the narrator's aside so the sandal comes off in full view: the right is Boaz's, attested in the old form.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B19",
            "role_in_scene": "NEARER_REDEEMER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "REDEEMER_KIN",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL7"
          },
          {
            "place_id": "PL_ISRAEL"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O26"
          },
          {
            "object_id": "CB_0007"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_FORMER_TIMES"
          }
        ]
      },
      "significant_absence": "The handing of the sandal to Boaz is not narrated — the drawing-off stands for the whole. No words of parting are given to the nearer redeemer; he leaves the book mid-gesture, nameless. The terms now Boaz's — the field, the widow, the name — are not restated; the attestation scene will say them in full."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "4:1a",
      "proposition_kind": "SAT",
      "event_specific_slots": {
        "convener": "B13",
        "ascended_to": "PL7",
        "ascent": "WENT_UP_TO_GATE",
        "seating_act": "SAT_DOWN",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [
        "CB_0006"
      ],
      "figure_flags": [
        "FIG_0156",
        "FIG_0003"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "4:1b",
      "proposition_kind": "PASSED_BY",
      "event_specific_slots": {
        "passer_by": "B19",
        "passing_location": "PL7",
        "identified_as": "REDEEMER_OF_WHOM_BOAZ_SPOKE",
        "attention_marker": "BEHOLD_HINNEH",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P3"
      },
      "cb_flags": [
        "CB_0001",
        "CB_0045"
      ],
      "figure_flags": [
        "FIG_0015",
        "FIG_0160",
        "FIG_0112"
      ]
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "4:1c",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "summoner": "B13",
        "summoned": "B19",
        "address_form": "PELONI_ALMONI_NON_NAME",
        "directives": [
          {
            "action": "DIRECTED",
            "commanded_step": "TURN_ASIDE",
            "step_order": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED",
            "commanded_step": "SIT_HERE",
            "step_order": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ],
        "compliance": "TURNED_ASIDE_AND_SAT"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0162",
        "FIG_0163",
        "FIG_0164"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "4:2",
      "proposition_kind": "TOOK",
      "event_specific_slots": {
        "convener": "B13",
        "elders_taken": "B20",
        "elder_count": "TEN",
        "elder_designation": "TEN_MEN_OF_TOWN_ELDERS",
        "directive": {
          "action": "DIRECTED",
          "commanded_step": "SIT_HERE",
          "speech_act": "DIRECTS_HEARER_TO_DO"
        },
        "compliance": "THEY_SAT"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "paired_with": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0164"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "4:3",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B19",
        "matter_disclosed": "PL_ELIMELECH_FIELD_PORTION",
        "deceased_owner": "B2",
        "deceased_referential_form": "OUR_BROTHER_ELIMELECH",
        "seller": "B3",
        "seller_referential_form": "NAOMI_WHO_RETURNED_FROM_MOAB",
        "selling_status": "FIELD_OFFERED_FOR_SALE",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0165",
        "FIG_0016"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "4:4a",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B19",
        "disclosure_idiom": "UNCOVER_YOUR_EAR",
        "offer": {
          "action": "DIRECTED",
          "commanded_step": "BUY_THE_FIELD",
          "speech_act": "DIRECTS_HEARER_TO_DO"
        },
        "witnesses_before_whom": "B20",
        "witness_designation": "THOSE_SEATED_AND_ELDERS_OF_MY_PEOPLE"
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P7"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0167"
      ]
    },
    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "4:4b",
      "proposition_kind": "SPOKE",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B19",
        "conditional_terms": [
          {
            "condition": "IF_WILL_REDEEM",
            "directive": "LET_HIM_REDEEM",
            "speech_act": "GRANTS_PERMISSION_TO_DO"
          },
          {
            "condition": "IF_WILL_NOT_REDEEM",
            "directive": "TELL_BOAZ",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ],
        "purpose": "THAT_I_MAY_KNOW",
        "queue_basis": "NO_ONE_BESIDES_YOU_TO_REDEEM",
        "queue_position": "BOAZ_IS_AFTER_YOU"
      },
      "inter_proposition_links": {
        "forward_link_to": "P8"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S2",
      "verse_anchor": "4:4c",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B19",
        "addressee": "B13",
        "claim": "I_WILL_REDEEM",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "paired_with": "P7",
        "forward_link_to": "P9"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P9",
      "scene_link": "S3",
      "verse_anchor": "4:5a",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B13",
        "addressee": "B19",
        "binding_day": "TM_DAY_OF_PURCHASE",
        "field_source": "B3",
        "acquired_party": "B9",
        "acquired_referential_form": "THE_MOABITE_WIFE_OF_THE_DEAD",
        "deceased_husband": "B?",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P8",
        "forward_link_to": "P10"
      },
      "cb_flags": [
        "CB_0002",
        "CB_0004"
      ],
      "figure_flags": [
        "FIG_0165",
        "FIG_0001",
        "FIG_0016"
      ]
    },
    {
      "prop_id": "P10",
      "scene_link": "S3",
      "verse_anchor": "4:5b",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "stated_purpose": "RAISE_UP_NAME_OF_THE_DEAD",
        "name_borne_by": "B?",
        "inheritance_locus": "DEAD_MANS_INHERITANCE",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P11"
      },
      "cb_flags": [
        "CB_0003",
        "CB_0005",
        "CB_0002",
        "CB_0039"
      ],
      "figure_flags": [
        "FIG_0002",
        "FIG_0110"
      ]
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "4:6a",
      "proposition_kind": "DECLINED",
      "event_specific_slots": {
        "speaker": "B19",
        "addressee": "B13",
        "refusal": "CANNOT_REDEEM_FOR_MYSELF",
        "stated_reason": "LEST_I_RUIN_MY_OWN_INHERITANCE",
        "contrast_with_proposition": "P8",
        "speech_act": "REFUSES_REQUEST_WITH_COUNTER_DECLARATION"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cb_flags": [
        "CB_0001",
        "CB_0003"
      ],
      "figure_flags": [
        "FIG_0166",
        "FIG_0168"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "4:6b",
      "proposition_kind": "HANDED",
      "event_specific_slots": {
        "yielder": "B19",
        "recipient": "B13",
        "yielded_right": "RIGHT_OF_REDEMPTION",
        "directive": {
          "action": "DIRECTED",
          "commanded_step": "REDEEM_FOR_YOURSELF",
          "speech_act": "DIRECTS_HEARER_TO_DO"
        },
        "repeated_reason": "I_CANNOT_REDEEM",
        "speech_act": "REFUSES_REQUEST_WITH_COUNTER_DECLARATION"
      },
      "inter_proposition_links": {
        "caused_by": "P11",
        "forward_link_to": "P15"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P13",
      "scene_link": "S4",
      "verse_anchor": "4:7a",
      "proposition_kind": "NARRATOR_FRAME",
      "event_specific_slots": {
        "frame_type": "ANTIQUARIAN_CUSTOM_EXPLANATION",
        "custom_domain": [
          "REDEEMING",
          "EXCHANGING"
        ],
        "custom_purpose": "TO_CONFIRM_EVERY_MATTER",
        "temporal_setting": "TM_FORMER_TIMES",
        "realm": "PL_ISRAEL",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P14"
      },
      "cb_flags": [
        "CB_0007"
      ],
      "figure_flags": [
        "FIG_0014"
      ]
    },
    {
      "prop_id": "P14",
      "scene_link": "S4",
      "verse_anchor": "4:7b",
      "proposition_kind": "NARRATOR_FRAME",
      "event_specific_slots": {
        "frame_type": "CUSTOM_DESCRIPTION",
        "custom_act": "DREW_OFF_SANDAL_AND_GAVE_TO_FELLOW",
        "custom_token": "O26",
        "attestation_name": "THE_ATTESTATION_IN_ISRAEL",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P15"
      },
      "cb_flags": [
        "CB_0007"
      ],
      "figure_flags": [
        "FIG_0005"
      ]
    },
    {
      "prop_id": "P15",
      "scene_link": "S4",
      "verse_anchor": "4:8",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speaker": "B19",
        "addressee": "B13",
        "confirmation_components": [
          {
            "action": "DIRECTED",
            "commanded_step": "BUY_FOR_YOURSELF",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DREW_OFF_SANDAL",
            "attestation_token": "O26",
            "speech_act": "STATES_AS_TRUE"
          }
        ],
        "attestation_form": "SANDAL_DRAWN_OFF"
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "back_reference_to_proposition": "P14"
      },
      "cb_flags": [
        "CB_0001"
      ],
      "figure_flags": [
        "FIG_0005"
      ]
    }
  ]
}
```
