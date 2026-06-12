---
type: "sta-for-model"
pericope: "P02"
pericope-title: "The return road begins; Naomi urges her daughters-in-law back; Orpah turns, Ruth clings"
source-meaning-map: [[P02-Ruth-1-6-14]]
status: "draft"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"
---

# P02 — Ruth 1:6-14 — FOR_MODEL (DRAFT — machine-drafted, awaiting review)

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "ruth_pericope_02_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 1:6-14",
    "pericope_title": "The return road begins; Naomi urges her daughters-in-law back; Orpah turns, Ruth clings",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P02-Ruth-1-6-14",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "MM Section 1: whole passage INFORMAL_CASUAL; Scene 1 stays plain; Scenes 2-3 shift to INTIMATE (mother and daughters-in-law, close up, with kiss, weeping, 'my daughters'). No moment-level framing override (no COMMUNITY_MEMORY formula here).",
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
      "moment_level": null
    }
  },
  "level_1": {
    "arc_elements": [
      "NEWS_RECEPTION",
      "RETURN_INITIATED",
      "BLESSING_APPEAL",
      "ARGUED_DISMISSAL",
      "SEPARATION_AND_CHOICE",
      "CLINGING"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "KINSHIP_CONTEXT",
      "PHYSICAL_LOCATION",
      "TRAJECTORY_CONTEXT_ON_RETURN_ROAD",
      "DIVINE_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "TEMPORAL_CONTEXT"
    ],
    "tone_elements": [
      "CHRONICLE",
      "ECONOMICAL",
      "INTIMATE",
      "WEIGHTED",
      "RISING",
      "UNRESOLVED_AT_CLOSE"
    ],
    "pace_elements": [
      "BRISK",
      "SLOWED",
      "NARROWS"
    ],
    "communicative_function_elements": [
      "ESTABLISHES",
      "OPENS",
      "CLOSES",
      "STAGES",
      "PLANTS"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:6-7",
      "scene_kind": "DEPARTURE_SCENE",
      "scene_communicative_purpose": "Names the first explicit act of YHWH in the book and the news that triggers Naomi's return road.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B8",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED (acts off-stage in the land of Judah)"
          },
          {
            "being_id": "B31",
            "role_in_scene": "PEOPLE",
            "presence": "REFERENCED (off-stage in the land of Judah)",
            "referential_form": "HIS_PEOPLE_OF_YHWH"
          },
          {
            "being_id": "B2",
            "role_in_scene": "HUSBAND",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL2"
          },
          {
            "place_id": "PL_LAND_OF_JUDAH"
          },
          {
            "place_id": "PL_HA_DEREKH"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0012"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator never says how Naomi heard the news, or who told her. He never tells us what she felt when she heard it — only what she did. And he does not say God brought Naomi home: what God does is give bread to his people in Judah, and Naomi gets up and goes on her own."
    },
    {
      "scene_id": "S2",
      "verse_range": "1:8-10",
      "scene_kind": "APPEAL_SCENE",
      "scene_communicative_purpose": "Records Naomi's first plea — a command to go home, wrapped in a double blessing — and the daughters-in-law's first out-loud refusal. Names two threads the book will follow: loyal kindness, and rest in a home of one's own.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B8",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B2",
            "role_in_scene": "HUSBAND",
            "presence": "REFERENCED (named in P01; named here only as \"the dead\")",
            "referential_form": "THE_DEAD_HA_METIM"
          },
          {
            "being_id": "B31",
            "role_in_scene": "PEOPLE",
            "presence": "REFERENCED",
            "referential_form": "YOUR_PEOPLE_RELATIONAL"
          },
          {
            "being_id": "B4",
            "role_in_scene": "SON",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B5",
            "role_in_scene": "SON",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_EACH_HER_MOTHERS_HOUSE"
          },
          {
            "place_id": "PL_HA_DEREKH"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0011"
          },
          {
            "object_id": "CB_0008"
          },
          {
            "object_id": "CB_0014"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator never tells us what kindness the daughters-in-law had actually shown the dead and Naomi; it is taken for granted but never spelled out. And he gives us nothing of what Orpah or Ruth felt as they refused — only the two of them together saying \"no.\""
    },
    {
      "scene_id": "S3",
      "verse_range": "1:11-14",
      "scene_kind": "APPEAL_SCENE",
      "scene_communicative_purpose": "Records Naomi's second plea — this time argued: she tells them to turn back, asks the hard questions that leave them no reason to follow, walks through the impossible hope of more sons, and ends by laying her bitterness on God — and then the parting of the two daughters-in-law. Sets Ruth's holding-on as the act that marks her off from Orpah.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW",
            "presence": "PRESENT",
            "referential_form": "HA_CHAMOT_MOTHER_IN_LAW"
          },
          {
            "being_id": "B8",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT_BECOMES_DEPARTS"
          },
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_HA_DEREKH"
          }
        ]
      },
      "objects_in_scene": {
        "entries": []
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator never says what Orpah felt as she turned back — only that she kissed Naomi. He never says what Ruth felt as she held on — only that she held on. He never says where Orpah went; she turns back, and that is the last we see of her, with no scene to send her home to. And he never answers Naomi's charge that God is against her; her speech simply ends, and the company splits."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:6",
      "proposition_kind": "HEARD_REPORT",
      "event_specific_slots": {
        "hearer": "B3",
        "hearing_locus": "PL2",
        "report_content_kind": "DIVINE_PROVISION_OF_BREAD",
        "divine_agent": "B10",
        "divine_action": "PAQAD_COVENANT_VISITED",
        "provision_recipients": "B31",
        "provision_given": "CB_0012",
        "provision_locus": "PL_LAND_OF_JUDAH"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [
        "CB_0016",
        "CB_0012",
        "CB_0017"
      ],
      "figure_flags": [
        "FIG_0013"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "1:6b",
      "proposition_kind": "AROSE_TO_RETURN",
      "event_specific_slots": {
        "riser": "B3",
        "accompanying_household": [
          "B8",
          "B9"
        ],
        "origin": "PL2",
        "purpose": "RETURN",
        "destination": "PL_LAND_OF_JUDAH",
        "departure_locus": "PL2",
        "journey_action": "WALKED",
        "journey_locus": "PL_HA_DEREKH",
        "travelers": "THE_THREE_TOGETHER"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [
        "CB_0017"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P3",
      "scene_link": "S2",
      "verse_anchor": "1:8a",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B8",
          "B9"
        ],
        "directive_components": [
          {
            "action": "DIRECTED",
            "directive_content": "GO",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED",
            "directive_content": "RETURN",
            "speech_act": "DIRECTS_HEARER_TO_RETURN"
          }
        ],
        "return_target": "PL_EACH_HER_MOTHERS_HOUSE",
        "return_target_form": "DISTRIBUTIVE_EACH_TO_MOTHERS_HOUSE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P4"
      },
      "cb_flags": [
        "CB_0017",
        "CB_0013"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P4",
      "scene_link": "S2",
      "verse_anchor": "1:8b",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blesser": "B3",
        "blessing_recipients": [
          "B8",
          "B9"
        ],
        "invoked_divine_agent": "B10",
        "blessing_content_kind": "HESED",
        "blessing_grounding": "PRIOR_HESED_OF_DAUGHTERS",
        "prior_hesed_beneficiaries": [
          "B2",
          "B4",
          "B5",
          "B3"
        ],
        "deceased_referential_form": "THE_DEAD_HA_METIM",
        "speech_act": "WISHES_FOR_HEARER"
      },
      "inter_proposition_links": {
        "forward_link_to": "P5"
      },
      "cb_flags": [
        "CB_0008",
        "CB_0011"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P5",
      "scene_link": "S2",
      "verse_anchor": "1:9a",
      "proposition_kind": "BLESSING",
      "event_specific_slots": {
        "blesser": "B3",
        "blessing_recipients": [
          "B8",
          "B9"
        ],
        "invoked_divine_agent": "B10",
        "blessing_content_kind": "REST_MENUCHA",
        "rest_locus": "HOUSE_OF_HER_HUSBAND_EACH",
        "speech_act": "WISHES_FOR_HEARER"
      },
      "inter_proposition_links": {
        "paired_with": "P4",
        "forward_link_to": "P6"
      },
      "cb_flags": [
        "CB_0008",
        "CB_0014"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P6",
      "scene_link": "S2",
      "verse_anchor": "1:9b",
      "proposition_kind": "KISSED",
      "event_specific_slots": {
        "kisser": "B3",
        "kissed": [
          "B8",
          "B9"
        ],
        "following_action": "WEPT_ALOUD",
        "weepers": [
          "B8",
          "B9"
        ]
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
      "verse_anchor": "1:10",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "speakers": [
          "B8",
          "B9"
        ],
        "addressee": "B3",
        "refusal_target": "DIRECTIVE_TO_RETURN_TO_MOTHERS_HOUSE",
        "counter_action": "RETURN_WITH_NAOMI",
        "counter_destination": "B31",
        "speech_act": "REFUSES_REQUEST_WITH_COUNTER_DECLARATION"
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P8"
      },
      "cb_flags": [
        "CB_0004"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S3",
      "verse_anchor": "1:11",
      "proposition_kind": "APPEAL",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B8",
          "B9"
        ],
        "addressee_form": "MY_DAUGHTERS_INTIMATE",
        "directive_content": "TURN_BACK",
        "dissuasion_components": [
          {
            "question_subject": "DAUGHTERS_GOING_WITH_NAOMI",
            "question_form": "WHY_WOULD_YOU_GO_WITH_ME",
            "speech_act": "ASKS_RHETORICAL_QUESTION_AS_DISSUASION"
          },
          {
            "question_subject": "SONS_IN_NAOMIS_WOMB",
            "question_form": "HAVE_I_YET_SONS",
            "speech_act": "ASKS_RHETORICAL_QUESTION_AS_DISSUASION"
          }
        ],
        "dissuasion_target": "LEVIRATE_REMARRIAGE_THROUGH_NAOMI"
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
      "verse_anchor": "1:12",
      "proposition_kind": "APPEAL",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B8",
          "B9"
        ],
        "directive_components": [
          {
            "action": "DIRECTED",
            "directive_content": "TURN_BACK",
            "speech_act": "DIRECTS_HEARER_TO_RETURN"
          },
          {
            "action": "DIRECTED",
            "directive_content": "GO",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ],
        "impossibility_statement": {
          "content": "NAOMI_TOO_OLD_FOR_HUSBAND",
          "speech_act": "STATES_AS_TRUE"
        },
        "hypothetical_concession": "HUSBAND_TONIGHT_AND_BEARING_SONS"
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
      "verse_anchor": "1:13a",
      "proposition_kind": "APPEAL",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B8",
          "B9"
        ],
        "dissuasion_components": [
          {
            "question_subject": "WAITING_FOR_SONS_TO_GROW",
            "question_form": "WOULD_YOU_WAIT",
            "speech_act": "ASKS_RHETORICAL_QUESTION_AS_DISSUASION"
          },
          {
            "question_subject": "REFRAINING_FROM_MARRIAGE_MEANWHILE",
            "question_form": "WOULD_YOU_SHUT_YOURSELVES_OFF",
            "speech_act": "ASKS_RHETORICAL_QUESTION_AS_DISSUASION"
          }
        ],
        "dissuasion_target": "IMPOSSIBILITY_OF_WAITING_ON_HYPOTHETICAL_SONS"
      },
      "inter_proposition_links": {
        "caused_by": "P9",
        "forward_link_to": "P11"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "1:13d",
      "proposition_kind": "LAMENT",
      "event_specific_slots": {
        "speaker": "B3",
        "addressee_form": "MY_DAUGHTERS_INTIMATE",
        "lament_comparison": "NAOMI_MORE_BITTER_THAN_DAUGHTERS",
        "affliction_attribution": "HAND_OF_YHWH_GONE_OUT_AGAINST_NAOMI",
        "attributed_divine_agent": "B10",
        "speech_act": "ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cb_flags": [
        "CB_0015"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P12",
      "scene_link": "S3",
      "verse_anchor": "1:14a",
      "proposition_kind": "WEPT",
      "event_specific_slots": {
        "weepers": [
          "B8",
          "B9"
        ],
        "weeping_form": "LIFTED_VOICE_AND_WEPT_AGAIN",
        "parallel_with_proposition": "P6"
      },
      "inter_proposition_links": {
        "caused_by": "P11",
        "forward_link_to": "P13",
        "paired_with": "P6"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P13",
      "scene_link": "S3",
      "verse_anchor": "1:14b",
      "proposition_kind": "KISSED",
      "event_specific_slots": {
        "kisser": "B8",
        "kissed": "B3",
        "kissed_referential_form": "HA_CHAMOT_MOTHER_IN_LAW",
        "following_action": "TURNED_BACK",
        "departer": "B8",
        "contrast_with_proposition": "P14"
      },
      "inter_proposition_links": {
        "caused_by": "P11",
        "forward_link_to": "P14"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P14",
      "scene_link": "S3",
      "verse_anchor": "1:14c",
      "proposition_kind": "CLUNG_TO",
      "event_specific_slots": {
        "clinger": "B9",
        "clung_to": "B3",
        "clung_to_referential_form": "HER_MOTHER_IN_LAW",
        "clinging_manner": "CLUNG_FAST_DAVQAH",
        "contrast_with_proposition": "P13"
      },
      "inter_proposition_links": {
        "caused_by": "P11"
      },
      "cb_flags": [
        "CB_0018"
      ],
      "figure_flags": [
        "FIG_0012"
      ]
    }
  ]
}
```
