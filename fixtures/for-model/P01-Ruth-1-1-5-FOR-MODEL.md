---
type: "sta-for-model"
pericope: "P01"
pericope-title: "The famine, the family's sojourn, and the emptying of the household"
source-meaning-map: [[P01-Ruth-1-1-5]]
status: "valid"
pilot: "pilot-2"
---

# P01 — Ruth 1:1–5 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_01_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",

  "header": {
    "bcv": "Ruth 1:1-5",
    "pericope_title": "The famine, the family's sojourn, and the emptying of the household",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P01-Ruth-1-1-5",
    "source_language": "Biblical Hebrew"
  },

  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "One moment-level framing override at v.1 (NARRATIVE_FRAMING axis). No scene-level overrides.",
      "scene_level": null,
      "moment_level": [
        {
          "verse": "1:1a",
          "framing_override": "COMMUNITY_MEMORY",
          "genre_override": null,
          "genre_group_override": null
        }
      ]
    }
  },

  "level_1": {
    "arc_elements": [
      "AFFLICTION",
      "DEPARTURE",
      "FOREIGN_RESIDENCE",
      "FAMILY_LOSS",
      "EMPTYING"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "TEMPORAL_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "HISTORICAL_ERA_CONTEXT"
    ],
    "tone_elements": [
      "RESTRAINED",
      "WEIGHTED",
      "CHRONICLE",
      "SOBER",
      "QUIETLY_ACCELERATING"
    ],
    "pace_elements": [
      "STEADY",
      "QUIETLY_ACCELERATING"
    ],
    "communicative_function_elements": [
      "OPENS_BOOK",
      "ESTABLISHES_PARTICIPANTS",
      "ESTABLISHES_CONDITION",
      "PLANTS_OPEN_QUESTION",
      "TRANSMITS_COMMUNITY_MEMORY",
      "WITHHOLDS_DIVINE_AGENCY"
    ]
  },

  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:1-2",
      "scene_kind": "OPENING_CHRONICLE_SCENE",
      "scene_communicative_purpose": "Establishes era, family, homeland, and famine-driven exile.",

      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B2",
            "role_in_scene": "HOUSEHOLD_HEAD_LEADING_DEPARTURE",
            "presence": "PRESENT",
            "referential_form": "UNNAMED_MAN_FROM_BETHLEHEM"
          },
          {
            "being_id": "B3",
            "role_in_scene": "WIFE_ACCOMPANYING_HEAD",
            "presence": "PRESENT",
            "referential_form": "UNNAMED_WIFE_OF_HEAD"
          },
          {
            "being_id": "B4",
            "role_in_scene": "ELDER_SON_ACCOMPANYING_FAMILY",
            "presence": "PRESENT",
            "referential_form": "UNNAMED_FIRST_SON"
          },
          {
            "being_id": "B5",
            "role_in_scene": "YOUNGER_SON_ACCOMPANYING_FAMILY",
            "presence": "PRESENT",
            "referential_form": "UNNAMED_SECOND_SON"
          },
          {
            "being_id": "B1",
            "role_in_scene": "ERA_ANCHOR_REFERENT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B6",
            "role_in_scene": "CLAN_IDENTITY_OF_HOUSEHOLD",
            "presence": "REFERENCED"
          }
        ]
      },

      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_LAND_OF_JUDAH",
            "role_in_scene": "LAND_AFFLICTED_BY_FAMINE"
          },
          {
            "place_id": "PL1",
            "role_in_scene": "HOMETOWN_DEPARTED_FROM"
          },
          {
            "place_id": "PL2",
            "role_in_scene": "FOREIGN_DESTINATION_OF_SOJOURN"
          }
        ]
      },

      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O1",
            "function_in_scene": "AFFLICTION_THAT_TRIGGERS_DEPARTURE"
          },
          {
            "object_id": "TH_WAYHI_BIMEI_FORMULA",
            "function_in_scene": "CHRONICLE_OPENING_FORMULA_ANCHORING_ERA"
          },
          {
            "object_id": "CB_0030",
            "function_in_scene": "FRAMES_DEPARTURE_AS_INTENDED_TEMPORARY"
          },
          {
            "object_id": "TH_EPHRATHITE_CLAN_IDENTIFIER",
            "function_in_scene": "ANCHORS_FAMILY_IN_BETHLEHEM_FOUNDING_STOCK"
          }
        ]
      },

      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_PERIOD_OF_JUDGES",
            "role_in_scene": "HISTORICAL_ERA_ANCHOR"
          }
        ]
      },

      "significant_absence": "YHWH not named as agent of the famine or of the family's departure."
    },

    {
      "scene_id": "S2",
      "verse_range": "1:3",
      "scene_kind": "BEREAVEMENT_SCENE",
      "scene_communicative_purpose": "Records the first family loss in foreign exile.",

      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B2",
            "role_in_scene": "DECEASED_HOUSEHOLD_HEAD",
            "presence": "PRESENT_BECOMES_DECEASED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "WIDOW_REMAINING_AS_RESIDUE",
            "presence": "PRESENT"
          },
          {
            "being_id": "B4",
            "role_in_scene": "SURVIVING_SON_WITH_MOTHER",
            "presence": "PRESENT"
          },
          {
            "being_id": "B5",
            "role_in_scene": "SURVIVING_SON_WITH_MOTHER",
            "presence": "PRESENT"
          }
        ]
      },

      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL2",
            "role_in_scene": "FOREIGN_LAND_WHERE_FIRST_DEATH_OCCURS"
          }
        ]
      },

      "objects_in_scene": {
        "entries": [
          {
            "object_id": "TH_DEATH_OF_ELIMELECH",
            "function_in_scene": "REMOVES_HUSBAND_AND_FATHER_FROM_HOUSEHOLD"
          },
          {
            "object_id": "TH_HUSBAND_OF_NAOMI_FRAMING",
            "function_in_scene": "PIVOTS_NARRATIVE_FRAMING_ONTO_NAOMI_AT_HEADS_DEATH"
          },
          {
            "object_id": "TH_TISHAER_REMAINING_RESIDUE",
            "function_in_scene": "FIRST_OCCURRENCE_OF_RESIDUAL_SURVIVAL_VERB"
          }
        ]
      },

      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous within the Moabite sojourn established in S1.",
        "entries": null
      },

      "significant_absence": "Narrator names no agent for the death. No grief described. No mourning ritual recorded."
    },

    {
      "scene_id": "S3",
      "verse_range": "1:4",
      "scene_kind": "FOREIGN_MARRIAGE_AND_EXTENDED_RESIDENCE_SCENE",
      "scene_communicative_purpose": "Extends the family in foreign territory across a decade.",

      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B4",
            "role_in_scene": "SON_TAKING_FOREIGN_WIFE",
            "presence": "PRESENT"
          },
          {
            "being_id": "B5",
            "role_in_scene": "SON_TAKING_FOREIGN_WIFE",
            "presence": "PRESENT"
          },
          {
            "being_id": "B7",
            "role_in_scene": "SOURCE_POOL_FROM_WHICH_WIVES_ARE_TAKEN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B8",
            "role_in_scene": "FOREIGN_BRIDE_INCORPORATED_INTO_HOUSEHOLD",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "FOREIGN_BRIDE_INCORPORATED_INTO_HOUSEHOLD",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MATRIARCH_OF_EXTENDED_HOUSEHOLD",
            "presence": "PRESENT"
          }
        ]
      },

      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL2",
            "role_in_scene": "FOREIGN_LAND_OF_MARRIAGES_AND_DECADE_OF_DWELLING"
          }
        ]
      },

      "objects_in_scene": {
        "entries": [
          {
            "object_id": "TH_TAKING_OF_WIVES",
            "function_in_scene": "EXTENDS_FAMILY_WITH_TWO_FOREIGN_BORN_MEMBERS"
          },
          {
            "object_id": "TH_TOOK_WIVES_FOR_THEMSELVES_PHRASING",
            "function_in_scene": "MARKS_MARRIAGES_AS_SONS_OWN_INITIATIVE"
          },
          {
            "object_id": "TH_TEN_YEARS_APPROXIMATELY",
            "function_in_scene": "DURATION_OF_FOREIGN_DWELLING_COMPRESSED_AS_CONTENT_ELEMENT"
          }
        ]
      },

      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; temporal setting is the continued Moabite sojourn. The duration about ten years is a content element carried in objects_in_scene, not a scene-setting frame.",
        "entries": null
      },

      "significant_absence": "No children born to either marriage during ten years of dwelling."
    },

    {
      "scene_id": "S4",
      "verse_range": "1:5",
      "scene_kind": "BEREAVEMENT_SCENE",
      "scene_communicative_purpose": "Records the catastrophic emptying that closes the opening pericope.",

      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B4",
            "role_in_scene": "DECEASED_SON",
            "presence": "PRESENT_BECOMES_DECEASED"
          },
          {
            "being_id": "B5",
            "role_in_scene": "DECEASED_SON",
            "presence": "PRESENT_BECOMES_DECEASED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "DOUBLY_BEREAVED_WIDOW_REDUCED_TO_RESIDUE",
            "presence": "PRESENT",
            "referential_form": "STRIPPED_TO_HA_ISHAH"
          },
          {
            "being_id": "B2",
            "role_in_scene": "PREVIOUSLY_DECEASED_HUSBAND_INVOKED_IN_CUMULATIVE_LOSS",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B8",
            "role_in_scene": "FOREIGN_DAUGHTER_IN_LAW_NOW_ALSO_BEREAVED",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B9",
            "role_in_scene": "FOREIGN_DAUGHTER_IN_LAW_NOW_ALSO_BEREAVED",
            "presence": "REFERENCED"
          }
        ]
      },

      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL2",
            "role_in_scene": "FOREIGN_LAND_THAT_HAS_CONSUMED_ENTIRE_MALE_LINE"
          }
        ]
      },

      "objects_in_scene": {
        "entries": [
          {
            "object_id": "TH_DEATH_OF_BOTH_SONS",
            "function_in_scene": "REMOVES_BOTH_SONS_FROM_HOUSEHOLD"
          },
          {
            "object_id": "TH_BOTH_OF_THEM",
            "function_in_scene": "TOTALITY_MARKER_NOTHING_REMAINS_OF_SONS"
          },
          {
            "object_id": "TH_TISHAER_REMAINING_RESIDUE",
            "function_in_scene": "SECOND_OCCURRENCE_IMAGE_RHYME_WITH_1_3"
          },
          {
            "object_id": "TH_HA_ISHAH_STRIPPED_REFERENCE",
            "function_in_scene": "NAMING_DOWN_OF_PROTAGONIST_SIGNALING_REDUCTION"
          },
          {
            "object_id": "TH_YELADIM_TENDER_CHILD_FORM",
            "function_in_scene": "REFRAMES_LOSS_AS_LOSS_OF_CHILDREN_NOT_HEIRS"
          },
          {
            "object_id": "TH_CUMULATIVE_LOSS_LISTING",
            "function_in_scene": "SINGLE_PHRASE_COMPRESSION_TALLYING_ALL_THREE_LOSSES"
          },
          {
            "object_id": "TH_DEATH_OF_ELIMELECH_REFERENCED",
            "function_in_scene": "PRIOR_LOSS_SUMMED_INTO_CUMULATIVE_BEREAVEMENT_PHRASE"
          }
        ]
      },

      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous within the Moabite sojourn.",
        "entries": null
      },

      "significant_absence": "Narrator records no grief, no mourning rituals, no successor, and no divine action. The losses are reported and the line stops there."
    }
  ],

  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:1a",
      "proposition_kind": "TIME_ANCHOR_ESTABLISHED",
      "event_specific_slots": {
        "era_anchor_being": "B1",
        "era_time_id": "TM_PERIOD_OF_JUDGES",
        "activity_invoked_by_era_name": "JUDGING",
        "anchor_form": "TH_WAYHI_BIMEI_FORMULA"
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": ["CB_0029"],
      "figure_flags": ["FIG_0007"]
    },

    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "1:1a",
      "proposition_kind": "FAMINE_OCCURRED",
      "event_specific_slots": {
        "afflicted_place": "PL_LAND_OF_JUDAH",
        "afflicting_event": "O1",
        "agent_named": "NONE"
      },
      "inter_proposition_links": {
        "caused_by": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": ["CB_0028"],
      "figure_flags": ["FIG_0013"]
    },

    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "1:1b",
      "proposition_kind": "MIGRATED",
      "event_specific_slots": {
        "household_head": "B2",
        "accompanying_household": ["B3", "B4", "B5"],
        "origin": "PL1",
        "destination": "PL2",
        "purpose": "SOJOURN",
        "departure_intent_marker": "CB_0030"
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": ["CB_0030", "CB_0004"],
      "figure_flags": ["FIG_0013"]
    },

    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "1:2a",
      "proposition_kind": "NAMED",
      "event_specific_slots": {
        "naming_order": "PARALLEL_PARENTS_THEN_TWO_SONS",
        "naming_components": [
          {
            "named_party": "B2",
            "given_name": "Elimelech",
            "role_in_household": "HUSBAND_AND_FATHER",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "named_party": "B3",
            "given_name": "Naomi",
            "role_in_household": "WIFE_AND_MOTHER",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "named_party": "B4",
            "given_name": "Mahlon",
            "role_in_household": "FIRST_SON",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "named_party": "B5",
            "given_name": "Chilion",
            "role_in_household": "SECOND_SON",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "forward_link_to": "P5"
      },
      "cb_flags": [],
      "figure_flags": []
    },

    {
      "prop_id": "P5",
      "scene_link": "S1",
      "verse_anchor": "1:2a",
      "proposition_kind": "IDENTIFIED_AS_CLAN_MEMBERS",
      "event_specific_slots": {
        "identified_household": ["B2", "B3", "B4", "B5"],
        "clan_referent": "B6",
        "clan_anchor_place": "PL1",
        "clan_identifier_form": "TH_EPHRATHITE_CLAN_IDENTIFIER"
      },
      "inter_proposition_links": {
        "forward_link_to": "P6"
      },
      "cb_flags": [],
      "figure_flags": []
    },

    {
      "prop_id": "P6",
      "scene_link": "S1",
      "verse_anchor": "1:2b",
      "proposition_kind": "ARRIVED_AT_AND_BEGAN_DWELLING",
      "event_specific_slots": {
        "arrival_components": [
          {
            "action": "ARRIVED_AT",
            "arriver": "THE_FAMILY",
            "destination": "PL2",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "WERE_AT",
            "residents": "THE_FAMILY",
            "where": "PL2",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P3"
      },
      "cb_flags": [],
      "figure_flags": []
    },

    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "1:3",
      "proposition_kind": "DIED",
      "event_specific_slots": {
        "deceased": "B2",
        "referential_form_at_verse": "TH_HUSBAND_OF_NAOMI_FRAMING",
        "where": "PL2",
        "agent_named": "NONE"
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
      "verse_anchor": "1:3",
      "proposition_kind": "LEFT_AS_RESIDUAL",
      "event_specific_slots": {
        "residual": "B3",
        "referential_form_at_verse": "SHE_PRONOMINAL",
        "remaining_with": ["B4", "B5"],
        "residual_verb_form": "TH_TISHAER_REMAINING_RESIDUE"
      },
      "inter_proposition_links": {
        "caused_by": "P7",
        "paired_with": "P13"
      },
      "cross_ref": "FIG_0052 opens here; closes at Proposition P13",
      "cb_flags": [],
      "figure_flags": ["FIG_0052"]
    },

    {
      "prop_id": "P9",
      "scene_link": "S3",
      "verse_anchor": "1:4a",
      "proposition_kind": "TOOK_AS_WIFE",
      "event_specific_slots": {
        "marriage_components": [
          {
            "action": "TOOK_AS_WIFE",
            "taker": "B4",
            "wife_taken": "B?",
            "wife_origin_pool": "B7",
            "for_self_marker": "OWN_INITIATIVE",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "TOOK_AS_WIFE",
            "taker": "B5",
            "wife_taken": "B?",
            "wife_origin_pool": "B7",
            "for_self_marker": "OWN_INITIATIVE",
            "speech_act": "STATES_AS_TRUE"
          }
        ],
        "marriage_phrasing_form": "TH_TOOK_WIVES_FOR_THEMSELVES_PHRASING",
        "where": "PL2"
      },
      "inter_proposition_links": {
        "forward_link_to": "P10"
      },
      "cb_flags": ["CB_0004"],
      "figure_flags": []
    },

    {
      "prop_id": "P10",
      "scene_link": "S3",
      "verse_anchor": "1:4a",
      "proposition_kind": "NAMED",
      "event_specific_slots": {
        "naming_order": "PARALLEL_TWO_BRIDES",
        "naming_components": [
          {
            "named_party": "B8",
            "given_name": "Orpah",
            "role_in_household": "FIRST_NAMED_BRIDE",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "named_party": "B9",
            "given_name": "Ruth",
            "role_in_household": "SECOND_NAMED_BRIDE",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "paired_with": "P4"
      },
      "cb_flags": [],
      "figure_flags": ["FIG_0001"]
    },

    {
      "prop_id": "P11",
      "scene_link": "S3",
      "verse_anchor": "1:4b",
      "proposition_kind": "DWELT_AT",
      "event_specific_slots": {
        "residents": "THE_FAMILY",
        "where": "PL2",
        "duration": "TH_TEN_YEARS_APPROXIMATELY",
        "duration_exactness": "APPROXIMATE"
      },
      "inter_proposition_links": {
        "caused_by": "P6"
      },
      "cb_flags": [],
      "figure_flags": []
    },

    {
      "prop_id": "P12",
      "scene_link": "S4",
      "verse_anchor": "1:5a",
      "proposition_kind": "DIED",
      "event_specific_slots": {
        "deceased": ["B4", "B5"],
        "totality_marker": "TH_BOTH_OF_THEM",
        "where": "PL2",
        "agent_named": "NONE"
      },
      "inter_proposition_links": {
        "paired_with": "P7",
        "forward_link_to": "P13"
      },
      "cb_flags": [],
      "figure_flags": []
    },

    {
      "prop_id": "P13",
      "scene_link": "S4",
      "verse_anchor": "1:5b",
      "proposition_kind": "LEFT_AS_RESIDUAL",
      "event_specific_slots": {
        "residual": "B3",
        "referential_form_at_verse": "STRIPPED_TO_HA_ISHAH",
        "naming_down_form": "TH_HA_ISHAH_STRIPPED_REFERENCE",
        "residual_verb_form": "TH_TISHAER_REMAINING_RESIDUE",
        "bereft_of_listing": [
          {
            "loss_target": ["B4", "B5"],
            "referential_form": "TH_YELADIM_TENDER_CHILD_FORM",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "loss_target": "B2",
            "referential_form": "HER_HUSBAND_RELATIONAL",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ],
        "listing_order_form": "CHILDREN_BEFORE_HUSBAND_REVERSE_NATURAL_ORDER",
        "compression_form": "TH_CUMULATIVE_LOSS_LISTING"
      },
      "inter_proposition_links": {
        "caused_by": "P12",
        "paired_with": "P8"
      },
      "cross_ref": "FIG_0052 closes here; opened at Proposition P8",
      "cb_flags": [],
      "figure_flags": ["FIG_0052"]
    }
  ]
}
```
