---
type: "sta-for-model"
pericope: "J02"
pericope-title: "The storm finds Jonah, and the sea is stilled"
source-meaning-map: [[J02-Jonah-1-4-2-1]]
status: "draft"
pilot: "pilot-2"
drafter: "claude-opus-4-8 · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"
---

# J02 — Jonah 1:4–2:1 — FOR_MODEL (DRAFT — machine-drafted, awaiting review)

> Judgment gaps filled by the SC-0063 drafter (`tripod draft --live`); the merge layer enforced the patch-only contract. NOT canon until ruled.

```json
{
  "sta_id": "jonah_pericope_02_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Jonah 1:4-2:1",
    "pericope_title": "The storm finds Jonah, and the sea is stilled",
    "book_context_ref": "jonah_pilot_BCD_v0_3",
    "source_meaning_map_ref": "J02-Jonah-1-4-2-1",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Three moment-level register shifts inside reported speech per MM Section 1; no scene-level overrides; no NARRATIVE_FRAMING shift. Verses are English numbering.",
      "scene_level": null,
      "moment_level": [
        {
          "verse": "1:6",
          "override_value": "ELDER_AUTHORITY"
        },
        {
          "verse": "1:7",
          "override_value": "CONSULTATIVE"
        },
        {
          "verse": "1:11",
          "override_value": "CONSULTATIVE"
        },
        {
          "verse": "1:14",
          "override_value": "RELIGIOUS_WORSHIP"
        }
      ]
    }
  },
  "level_1": {
    "arc_elements": [
      "DIVINE_PURSUIT_BY_STORM",
      "CREW_CRISIS_RESPONSE",
      "EXPOSURE_BY_LOT",
      "SELF_CONFESSION",
      "SELF_SURRENDER",
      "RESCUE_ATTEMPT_FAILS",
      "HURLING_OVERBOARD",
      "STORM_STILLED",
      "PAGAN_WORSHIP",
      "PROVIDENTIAL_SWALLOWING"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "INSTITUTIONAL_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD",
      "PRIOR_ACTION_CONTEXT",
      "DIVINE_CONTEXT"
    ],
    "tone_elements": [
      "RISING",
      "IRONIC",
      "URGENT",
      "STILLED",
      "QUIET",
      "ANTICIPATORY"
    ],
    "pace_elements": [
      "RISES",
      "BRISK",
      "SETTLES",
      "HOLDS"
    ],
    "communicative_function_elements": [
      "ADVANCES",
      "REACTIVATES",
      "STAGES",
      "WITHHOLDS"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:4-6",
      "scene_kind": "STORM_ONSET_SCENE",
      "scene_communicative_purpose": "Opens the consequence: the storm is YHWH's answer to the flight, and it lands on everyone aboard. Sets the irony — pagans praying, the prophet asleep — and puts the command Jonah fled (\"get up, cry out\") back in his ears from a pagan captain's mouth.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B2",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B4",
            "role_in_scene": "CREW",
            "presence": "PRESENT",
            "referential_form": "THE_SAILORS_HAMMALACHIM"
          },
          {
            "being_id": "B6",
            "role_in_scene": "SHIP_CAPTAIN",
            "presence": "PRESENT",
            "referential_form": "CHIEF_OF_THE_SAILORS"
          },
          {
            "being_id": "B1",
            "role_in_scene": "FUGITIVE",
            "presence": "PRESENT",
            "referential_form": "ADDRESSED_AS_SLEEPER"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O1"
          },
          {
            "object_id": "O3"
          },
          {
            "object_id": "O4"
          },
          {
            "object_id": "O5"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Jonah does not pray — in a scene where every other man aboard is crying to a god, the prophet alone is silent, and he stays prayerless through the whole storm. The narrator never says why he sleeps."
    },
    {
      "scene_id": "S2",
      "verse_range": "1:7-10",
      "scene_kind": "EXPOSURE_AND_CONFESSION_SCENE",
      "scene_communicative_purpose": "Exposes the runaway by his own God's means (the lot) and his own mouth (the confession). The pagans take YHWH more seriously than his prophet does — their fear is great while his flight stands.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B4",
            "role_in_scene": "CREW",
            "presence": "PRESENT",
            "referential_form": "THE_MEN_HAANASHIM"
          },
          {
            "being_id": "B1",
            "role_in_scene": "FUGITIVE",
            "presence": "PRESENT",
            "referential_form": "SELF_NAMED_HEBREW"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          },
          {
            "place_id": "PL5"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O6"
          },
          {
            "object_id": "CB_0053"
          },
          {
            "object_id": "CB_0052"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Asked plainly \"what is your work?\", Jonah never answers it — he gives his people and his God, but not his calling. The narrator lets the word \"prophet\" go entirely unsaid. Jonah confesses that he fears YHWH, yet the narrator records fear in everyone aboard except him."
    },
    {
      "scene_id": "S3",
      "verse_range": "1:11-13",
      "scene_kind": "CRISIS_DELIBERATION_SCENE",
      "scene_communicative_purpose": "Puts the cost in the open: the storm wants its man. The pagans try to save the runaway at their own risk before they will throw him; his counsel is to be thrown, not to turn back.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B4",
            "role_in_scene": "CREW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B1",
            "role_in_scene": "FUGITIVE",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          },
          {
            "place_id": "PL5"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O4"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Jonah never offers to pray, repent, or be taken back to his errand — the one thing that is never said is \"take me to Nineveh.\" He owns the storm (\"on my account\") but never names the flight as wrong; there is no word of sin and no word of sorrow."
    },
    {
      "scene_id": "S4",
      "verse_range": "1:14-16",
      "scene_kind": "HURLING_AND_WORSHIP_SCENE",
      "scene_communicative_purpose": "Closes the storm with its point made: the sea answers to YHWH, and the pagan crew ends the scene doing everything Israel's prophet would not — praying to YHWH, fearing him, sacrificing, vowing. The flight has made worshipers of strangers.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B4",
            "role_in_scene": "CREW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B1",
            "role_in_scene": "FUGITIVE",
            "presence": "PRESENT",
            "referential_form": "THIS_MAN_IN_PRAYER"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0054"
          },
          {
            "object_id": "CB_0053"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "Jonah says nothing from the moment the men row for his life to the moment the water closes over him — no protest, no thanks, no prayer, no farewell. The crew's own fate after the calm is never told; the story leaves them mid-sea, vows in hand, and follows the man overboard."
    },
    {
      "scene_id": "S5",
      "verse_range": "2:1-2",
      "scene_kind": "SWALLOWING_SCENE",
      "scene_communicative_purpose": "Turns judgment into keeping: the man given to the sea is not drowned but held. Ends the pericope at the hinge — the prayer the prophet never prayed on deck begins in the fish, and the psalm (J03) is that prayer.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B2",
            "role_in_scene": "DIVINE_AGENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B7",
            "role_in_scene": "APPOINTED_CREATURE",
            "presence": "PRESENT"
          },
          {
            "being_id": "B1",
            "role_in_scene": "FUGITIVE",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL4"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "TH_THREE_DAYS_AND_THREE_NIGHTS"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "No rescue is announced — the narrator never says \"YHWH saved him\"; there is only a fish, appointed. Nothing is said of the three days — no word, no thought, no fear is recorded inside the fish until the prayer breaks the silence."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:4",
      "proposition_kind": "HURLED",
      "event_specific_slots": {
        "hurler": "B2",
        "hurled_entity": "O3",
        "hurled_at": "PL4",
        "hurl_force_marker": "GREAT"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0199"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "1:4",
      "proposition_kind": "STORM_AROSE",
      "event_specific_slots": {
        "storm": "O4",
        "storm_magnitude": "GREAT",
        "location": "PL4",
        "imperiled_vessel": "O1",
        "vessel_peril": "ABOUT_TO_BREAK_APART"
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
      "verse_anchor": "1:5",
      "proposition_kind": "FEARED",
      "event_specific_slots": {
        "fearers": "B4",
        "fear_object": "STORM",
        "subsequent_response": "CRIED_TO_OWN_GODS",
        "crier": "EACH_MAN",
        "addressee": "OWN_GOD"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0200"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "1:5",
      "proposition_kind": "HURLED",
      "event_specific_slots": {
        "hurlers": "B4",
        "hurled_entity": "O5",
        "hurled_into": "PL4",
        "purpose": "LIGHTEN_SHIP"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P5"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0199"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "S1",
      "verse_anchor": "1:5",
      "proposition_kind": "WENT_DOWN",
      "event_specific_slots": {
        "descender": "B1",
        "destination": "FAR_HOLD_OF_SHIP",
        "subsequent_states": [
          "LAY_DOWN",
          "FELL_DEEP_ASLEEP"
        ],
        "descent_marker": "GOING_DOWN"
      },
      "inter_proposition_links": {
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0198"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S1",
      "verse_anchor": "1:6",
      "proposition_kind": "APPROACHED",
      "event_specific_slots": {
        "approacher": "B6",
        "approached": "B1",
        "subsequent_speech_act_event": "REBUKING_QUESTION",
        "question_content": "WHAT_ARE_YOU_DOING_ASLEEP",
        "speech_act": "ASKS_RHETORICAL_QUESTION_AS_PROTEST"
      },
      "inter_proposition_links": {
        "caused_by": "P5",
        "forward_link_to": "P7"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P7",
      "scene_link": "S1",
      "verse_anchor": "1:6",
      "proposition_kind": "INSTRUCTION",
      "event_specific_slots": {
        "director": "B6",
        "directee": "B1",
        "directed_address_form": "SLEEPER",
        "command_components": [
          {
            "action": "DIRECTED",
            "commanded_step": "ARISE",
            "step_order": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED",
            "commanded_step": "CRY_OUT_TO_YOUR_GOD",
            "step_order": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ],
        "command_rationale": "MAYBE_GOD_WILL_GIVE_THOUGHT_SO_WE_NOT_PERISH"
      },
      "inter_proposition_links": {
        "forward_link_to": "P8"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0201"
      ]
    },
    {
      "prop_id": "P8",
      "scene_link": "S2",
      "verse_anchor": "1:7",
      "proposition_kind": "PROPOSED",
      "event_specific_slots": {
        "proposers": "B4",
        "proposed_to": "ONE_ANOTHER",
        "proposed_action": "CAST_LOTS",
        "lots": "O6",
        "proposal_purpose": "KNOW_ON_WHOSE_ACCOUNT_THIS_EVIL",
        "speech_act": "DIRECTS_HEARER_TO_DO"
      },
      "inter_proposition_links": {
        "forward_link_to": "P9"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P9",
      "scene_link": "S2",
      "verse_anchor": "1:7",
      "proposition_kind": "CAST_LOTS",
      "event_specific_slots": {
        "casters": "B4",
        "lots": "O6",
        "outcome": "LOT_FELL_ON_JONAH",
        "exposed_party": "B1"
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
      "scene_link": "S2",
      "verse_anchor": "1:8",
      "proposition_kind": "INTERROGATED",
      "event_specific_slots": {
        "interrogators": "B4",
        "interrogated": "B1",
        "question_listing": [
          {
            "question_subject": "WHOSE_FAULT_THIS_EVIL",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "question_subject": "WHAT_IS_YOUR_WORK",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "question_subject": "WHERE_DO_YOU_COME_FROM",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "question_subject": "WHAT_IS_YOUR_LAND",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          },
          {
            "question_subject": "FROM_WHICH_PEOPLE_ARE_YOU",
            "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
          }
        ]
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
      "scene_link": "S2",
      "verse_anchor": "1:9",
      "proposition_kind": "DECLARED",
      "event_specific_slots": {
        "declarer": "B1",
        "declared_identity": "HEBREW",
        "identity_kind": "PEOPLE_NOT_CALLING",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P10",
        "forward_link_to": "P12"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P12",
      "scene_link": "S2",
      "verse_anchor": "1:9",
      "proposition_kind": "CONFESSED",
      "event_specific_slots": {
        "confessor": "B1",
        "confessed_divine": "B2",
        "confessed_content": "FEARS_YHWH",
        "divine_descriptors": [
          "GOD_OF_HEAVEN",
          "MAKER_OF_SEA",
          "MAKER_OF_DRY_LAND"
        ],
        "sea": "PL4",
        "dry_land": "PL5",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "forward_link_to": "P13"
      },
      "cb_flags": [
        "CB_0053"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P13",
      "scene_link": "S2",
      "verse_anchor": "1:10",
      "proposition_kind": "FEARED",
      "event_specific_slots": {
        "fearers": "B4",
        "fear_magnitude": "GREAT",
        "subsequent_speech_act_event": "PROTEST_QUESTION",
        "question_content": "WHAT_IS_THIS_YOU_HAVE_DONE",
        "speech_act": "ASKS_RHETORICAL_QUESTION_AS_PROTEST"
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "forward_link_to": "P14",
        "paired_with": "P3"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0200"
      ]
    },
    {
      "prop_id": "P14",
      "scene_link": "S2",
      "verse_anchor": "1:10",
      "proposition_kind": "PERCEIVED",
      "event_specific_slots": {
        "knowers": "B4",
        "known_fact": "JONAH_FLEEING_FROM_BEFORE_YHWH",
        "fled_from": "CB_0052",
        "basis_of_knowledge": "HE_HAD_TOLD_THEM"
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "forward_link_to": "P15"
      },
      "cb_flags": [
        "CB_0052"
      ],
      "figure_flags": [
        "FIG_0197"
      ]
    },
    {
      "prop_id": "P15",
      "scene_link": "S3",
      "verse_anchor": "1:11",
      "proposition_kind": "ASKED",
      "event_specific_slots": {
        "askers": "B4",
        "asked": "B1",
        "question_content": "WHAT_SHALL_WE_DO_TO_YOU",
        "desired_outcome": "SEA_QUIET_FOR_US",
        "sea": "PL4",
        "reason_for_asking": "SEA_KEPT_GROWING_STORMIER",
        "speech_act": "ASKS_INFORMATION_SEEKING_QUESTION"
      },
      "inter_proposition_links": {
        "forward_link_to": "P16"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P16",
      "scene_link": "S3",
      "verse_anchor": "1:12",
      "proposition_kind": "ANSWERED",
      "event_specific_slots": {
        "answerer": "B1",
        "answered_party": "B4",
        "counsel_components": [
          {
            "action": "DIRECTED",
            "commanded_step": "LIFT_ME",
            "step_order": "FIRST",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          },
          {
            "action": "DIRECTED",
            "commanded_step": "HURL_ME_INTO_SEA",
            "step_order": "SECOND",
            "speech_act": "DIRECTS_HEARER_TO_DO"
          }
        ],
        "desired_outcome": "SEA_QUIET_FOR_YOU",
        "storm_ownership_admission": "GREAT_STORM_ON_MY_ACCOUNT",
        "storm": "O4",
        "sea": "PL4"
      },
      "inter_proposition_links": {
        "caused_by": "P15",
        "paired_with": "P15",
        "forward_link_to": "P17"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0199"
      ]
    },
    {
      "prop_id": "P17",
      "scene_link": "S3",
      "verse_anchor": "1:13",
      "proposition_kind": "ROWED",
      "event_specific_slots": {
        "rowers": "B4",
        "row_destination": "PL5",
        "row_effort": "DUG_OARS_IN_HARD",
        "outcome": "COULD_NOT_REACH",
        "reason": "SEA_KEPT_GROWING_STORMIER_AGAINST_THEM"
      },
      "inter_proposition_links": {
        "caused_by": "P16",
        "forward_link_to": "P18"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P18",
      "scene_link": "S4",
      "verse_anchor": "1:14",
      "proposition_kind": "APPEAL",
      "event_specific_slots": {
        "petitioners": "B4",
        "petitioned_divine": "B2",
        "petition_components": [
          {
            "petition": "DO_NOT_LET_US_PERISH_FOR_THIS_MANS_LIFE",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          },
          {
            "petition": "DO_NOT_LAY_INNOCENT_BLOOD_ON_US",
            "innocent_blood": "CB_0054",
            "speech_act": "DIRECTS_HEARER_NOT_TO_DO"
          }
        ],
        "petition_grounds": "YOU_YHWH_HAVE_DONE_AS_YOU_PLEASED",
        "petitioned_subject_referential_form": "THIS_MAN"
      },
      "inter_proposition_links": {
        "caused_by": "P17",
        "forward_link_to": "P19"
      },
      "cb_flags": [
        "CB_0054"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P19",
      "scene_link": "S4",
      "verse_anchor": "1:15",
      "proposition_kind": "HURLED",
      "event_specific_slots": {
        "hurlers": "B4",
        "lifted_party": "B1",
        "hurled_party": "B1",
        "hurled_into": "PL4",
        "action_sequence": [
          "LIFTED",
          "HURLED"
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P18",
        "forward_link_to": "P20"
      },
      "cb_flags": [],
      "figure_flags": [
        "FIG_0199"
      ]
    },
    {
      "prop_id": "P20",
      "scene_link": "S4",
      "verse_anchor": "1:15",
      "proposition_kind": "SEA_STILLED",
      "event_specific_slots": {
        "stilled_entity": "PL4",
        "stilled_from": "ITS_RAGING",
        "stilling_marker": "SUDDEN_CALM"
      },
      "inter_proposition_links": {
        "caused_by": "P19",
        "forward_link_to": "P21"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P21",
      "scene_link": "S4",
      "verse_anchor": "1:16",
      "proposition_kind": "WORSHIPED",
      "event_specific_slots": {
        "worshipers": "B4",
        "fear_object": "B2",
        "fear_magnitude": "GREAT",
        "worship_acts": [
          {
            "worship_act": "FEARED_YHWH_GREAT_FEAR",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "worship_act": "OFFERED_SACRIFICE",
            "to_whom": "B2",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "worship_act": "VOWED_VOWS",
            "to_whom": "B2",
            "speech_act": "VOWS"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P20",
        "forward_link_to": "P22",
        "paired_with": "P13"
      },
      "cb_flags": [
        "CB_0053"
      ],
      "figure_flags": [
        "FIG_0200"
      ]
    },
    {
      "prop_id": "P22",
      "scene_link": "S5",
      "verse_anchor": "1:17",
      "proposition_kind": "APPOINTED",
      "event_specific_slots": {
        "appointer": "B2",
        "appointed_creature": "B7",
        "appointed_purpose": "SWALLOW_JONAH",
        "swallowed_party": "B1"
      },
      "inter_proposition_links": {
        "forward_link_to": "P23"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P23",
      "scene_link": "S5",
      "verse_anchor": "1:17",
      "proposition_kind": "SWALLOWED",
      "event_specific_slots": {
        "swallower": "B7",
        "swallowed_party": "B1",
        "subsequent_state": "REMAINED_IN_BELLY",
        "location": "BELLY_OF_FISH",
        "duration": "TH_THREE_DAYS_AND_THREE_NIGHTS",
        "duration_form": "THREE_DAYS_AND_THREE_NIGHTS"
      },
      "inter_proposition_links": {
        "caused_by": "P22",
        "forward_link_to": "P24"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P24",
      "scene_link": "S5",
      "verse_anchor": "2:1",
      "proposition_kind": "PRAYED",
      "event_specific_slots": {
        "praying_party": "B1",
        "prayed_to": "B2",
        "divine_relation": "YHWH_HIS_GOD",
        "prayer_origin": "BELLY_OF_FISH",
        "fish": "B7"
      },
      "inter_proposition_links": {
        "caused_by": "P23"
      },
      "cb_flags": [],
      "figure_flags": []
    }
  ]
}
```
