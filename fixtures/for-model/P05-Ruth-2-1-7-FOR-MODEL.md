---
type: "sta-for-model"
pericope: "P05"
pericope-title: "Boaz introduced as kinsman; Ruth's gleaning initiative; her chance arrival in Boaz's portion; the foreman's report"
source-meaning-map: [[P05-Ruth-2-1-7]]
status: "valid"
pilot: "pilot-2"
---

# P05 — Ruth 2:1–7 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_05_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 2:1-7",
    "pericope_title": "Boaz introduced as kinsman; Ruth's gleaning initiative; her chance arrival in Boaz's portion; the foreman's report",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P05-Ruth-2-1-7",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "One scene-level INTIMATE override on S2 (Ruth-Naomi interior dialogue inside their dwelling — relational-close register fits the moment better than INFORMAL_CASUAL even though the speech is a request-and-release exchange; mirroring P02 S2/S3, P03 S1-S2, P04 S2 pattern). S1, S3, S4 stay at INFORMAL_CASUAL narrator default. No moment-level overrides.",
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
      "NARRATOR_PARENTHETICAL_INTRODUCTION",
      "INITIATIVE_OF_OUTSIDER_DAUGHTER_IN_LAW",
      "CHANCE_PROVIDENCE_ARRIVAL",
      "FIELD_COMMUNITY_GREETING",
      "PUBLIC_IDENTIFICATION_OF_OUTSIDER"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "PHYSICAL_LOCATION",
      "KINSHIP_CONTEXT",
      "INSTITUTIONAL_CONTEXT",
      "TEMPORAL_CONTEXT",
      "DIVINE_CONTEXT",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "PRIOR_ACTION_CONTEXT"
    ],
    "tone_elements": [
      "QUIET",
      "ECONOMICAL",
      "ANTICIPATORY",
      "RESTRAINED",
      "CHRONICLE"
    ],
    "pace_elements": [
      "NARROWS_AT_NARRATOR_PARENTHETICAL",
      "HOLDS_AT_INTERIOR_DIALOGUE",
      "WIDENS_AT_CHANCE_PROVIDENCE_FRAMING",
      "SETTLES_AT_CHRONICLE_REPORT"
    ],
    "communicative_function_elements": [
      "OPENS_CHAPTER_TWO",
      "INTRODUCES_SECOND_MALE_PROTAGONIST_BEFORE_ACTION",
      "ANCHORS_KINSMAN_REDEEMER_FRAME_AT_AUDIENCE_LEVEL",
      "POSITIONS_RUTH_AND_BOAZ_IN_SAME_FIELD_THROUGH_CHANCE_CONSTRUCTION",
      "OPENS_CHAYIL_CROSS_PERICOPE_PAIR",
      "REACTIVATES_MOABITE_EPITHET_IN_THIRD_PARTY_VOICE",
      "STAGES_GLEANING_INSTITUTION_AS_LEGAL_CUSTOMARY_FRAME",
      "WITHHOLDS_DIVINE_AGENCY_BEHIND_MIQREH_CONSTRUCTION"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "2:1",
      "scene_kind": "NARRATOR_PARENTHETICAL_INTRODUCTION_SCENE",
      "scene_communicative_purpose": "Introduces Boaz to the audience before he enters the storyline. Anchors him in the kin-network through Naomi's relation to her dead husband and through the clan-frame.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "KINSMAN_INTRODUCED_BY_NARRATOR_BEFORE_ACTION",
            "presence": "REFERENCED",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "KINSHIP_ANCHOR_THROUGH_WHOM_KINSMAN_IS_POSITIONED",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B2",
            "role_in_scene": "DECEASED_ANCESTOR_FRAME_FOR_KINSHIP_AND_CLAN",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B29",
            "role_in_scene": "LEGAL_RELATIONAL_KIN_GROUP_OF_THE_DECEASED_ANCESTOR",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "_note": "No distinct place anchored in the narrator-parenthetical; the introduction is given outside the storyline.",
        "entries": null
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013): 4 thematic item(s) relocated to their proper layers (events to propositions; speech-acts and framings to referential_forms; patterns to figures).",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; the narrator-parenthetical is given outside the storyline's time-flow.",
        "entries": null
      },
      "significant_absence": "Narrator does not say where Boaz is or what he is doing. No interior state given — no motive, no inclination toward the women, no awareness of their return."
    },
    {
      "scene_id": "S2",
      "verse_range": "2:2",
      "scene_kind": "INTERIOR_INITIATIVE_AND_RELEASE_SCENE",
      "scene_communicative_purpose": "Establishes that the gleaning move comes from Ruth's own initiative, not Naomi's. Naomi releases without amending the proposal. The exchange is short, intimate, and consequential.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "DAUGHTER_IN_LAW_PROPOSING_GLEANING_INITIATIVE",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "MOTHER_IN_LAW_GRANTING_PERMISSION",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL_NAOMIS_DWELLING",
            "role_in_scene": "PRIVATE_INTERIOR_SETTING_OF_INITIATIVE_AND_RELEASE_DIALOGUE"
          },
          {
            "place_id": "PL5",
            "role_in_scene": "REFERENCED_PROPOSED_DESTINATION_OF_GLEANING_INITIATIVE"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013): 4 thematic item(s) relocated to their proper layers (events to propositions; speech-acts and framings to referential_forms; patterns to figures).",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous with the previous pericope's arrival.",
        "entries": null
      },
      "significant_absence": "Naomi does not name Boaz to Ruth even though the narrator has just named Boaz to the audience at v.1. Naomi does not name a specific field, does not bless Ruth, does not warn of any danger, does not suggest a kinsman. Audience-knows-character-doesn't gap is structurally meaningful."
    },
    {
      "scene_id": "S3",
      "verse_range": "2:3-4",
      "scene_kind": "FIELD_ARRIVAL_CHANCE_PROVIDENCE_AND_GREETING_SCENE",
      "scene_communicative_purpose": "Lands Ruth in Boaz's portion through the chance-providence construction the narrator deliberately holds open. Stages Boaz's arrival from Bethlehem. Establishes the covenant-blessing register of the field-community through the greeting exchange. Restates the clan-frame at the moment of chance-arrival.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "GLEANER_ARRIVING_THROUGH_CHANCE_CONSTRUCTION",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER_ARRIVING_FROM_HOMETOWN_AT_MID_SCENE",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B14",
            "role_in_scene": "FIELD_WORKING_COMMUNITY_GLEANER_FOLLOWS_AND_OWNER_GREETS",
            "presence": "PRESENT_COLLECTIVE"
          },
          {
            "being_id": "B10",
            "role_in_scene": "INVOKED_DIVINE_AGENT_OF_GREETING_AND_RETURN_BLESSING",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B29",
            "role_in_scene": "LEGAL_RELATIONAL_KIN_GROUP_RESTATED_AT_CHANCE_ARRIVAL_MOMENT",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5",
            "role_in_scene": "AGRICULTURAL_FIELD_HARVEST_LOCUS_GENERAL"
          },
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "OWNED_PORTION_REACHED_THROUGH_CHANCE_CONSTRUCTION"
          },
          {
            "place_id": "PL1",
            "role_in_scene": "HOMETOWN_FROM_WHICH_FIELD_OWNER_ARRIVES"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013): 7 thematic item(s) relocated to their proper layers (events to propositions; speech-acts and framings to referential_forms; patterns to figures).",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; the barley-harvest setting from P04 v.22 is the active frame and is not lexically named here.",
        "entries": null
      },
      "significant_absence": "Narrator does not say YHWH led Ruth to Boaz's portion; the miqreh-construction deliberately withholds the one who led her. Narrator does not say Boaz notices Ruth on arrival. Ruth says nothing in this scene. Naomi is offstage and is not mentioned by anyone in the scene."
    },
    {
      "scene_id": "S4",
      "verse_range": "2:5-7",
      "scene_kind": "FIELD_OWNER_FOREMAN_REPORT_SCENE",
      "scene_communicative_purpose": "Stages the first public identification of the outsider gleaner in the field-community. Field owner asks under whose cover this young woman is; foreman reports ethnic identity, relation to mother-in-law, quoted gleaning-request, and work-pattern from morning until now.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B13",
            "role_in_scene": "FIELD_OWNER_ASKING_KINSHIP_BELONGING_QUESTION",
            "presence": "PRESENT",
            "referential_form": "NAMED"
          },
          {
            "being_id": "B15",
            "role_in_scene": "FOREMAN_ANSWERING_WITH_IDENTITY_AND_WORK_PATTERN_REPORT",
            "presence": "PRESENT",
            "referential_form": "NAAR_NITSAV_AL_HAQOTSRIM_NAMED_BY_ROLE"
          },
          {
            "being_id": "B9",
            "role_in_scene": "REFERENT_OF_QUESTION_AND_REPORT_IDENTIFIED_BY_ETHNIC_EPITHET_AND_KIN_RELATION",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B3",
            "role_in_scene": "KINSHIP_ANCHOR_THROUGH_WHOM_GLEANER_IS_IDENTIFIED_IN_FOREMAN_REPORT",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B14",
            "role_in_scene": "FIELD_WORKING_COMMUNITY_POSITION_ANCHOR_FOR_FOREMAN_ROLE_NAMING",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL5_BOAZ_PORTION",
            "role_in_scene": "OWNED_PORTION_CONTINUING_FROM_PREVIOUS_SCENE"
          },
          {
            "place_id": "PL2",
            "role_in_scene": "FOREIGN_LAND_NAMED_AS_ORIGIN_IN_FOREMAN_REPORT"
          },
          {
            "place_id": "PL_HA_BAYIT_FIELD_SHELTER",
            "role_in_scene": "FIELD_SHELTER_NAMED_IN_FOREMAN_REPORT_WITH_TEXTUAL_UNCERTAINTY"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "§3C entities only (SC-0013): 8 thematic item(s) relocated to their proper layers (events to propositions; speech-acts and framings to referential_forms; patterns to figures).",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; the within-day duration 'from morning until now' is a content element inside the foreman's quoted report, encoded in objects_in_scene, not as a scene-setting time frame. Follows P01 TM_TEN_YEARS approximate-duration precedent.",
        "entries": null
      },
      "significant_absence": "Foreman does not give Ruth's personal name; identification is by ethnic-epithet, by relation to Naomi, by work-pattern. Narrator does not give Boaz's interior at the question — no surprise, no recognition, no inclination is attributed. No marked emotional weight on the question itself."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "2:1",
      "proposition_kind": "NARRATOR_INTRODUCES_KINSMAN_BEFORE_ACTION",
      "event_specific_slots": {
        "introduction_components": [
          {
            "action": "POSITIONED_THROUGH_KINSHIP_ANCHOR",
            "kinsman": "B13",
            "kinship_anchor_being": "B3",
            "kinship_anchor_relation": "WIDOW_OF_DECEASED_ANCESTOR",
            "deceased_ancestor": "B2",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "INTRODUCED_AS_PERSON_OF_STANDING",
            "introduced_party": "B13",
            "introduction_attribute": "PERSON_OF_STANDING",
            "chayil_lexeme": "CB_0032",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "PLACED_IN_LEGAL_RELATIONAL_KIN_GROUP",
            "placed_party": "B13",
            "clan_referent": "B29",
            "clan_eponym": "B2",
            "list_position": "THIRD",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "NAMED_AT_END_OF_INTRODUCTION",
            "named_party": "B13",
            "given_name": "Boaz",
            "list_position": "FOURTH",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": ["CB_0032"],
      "figure_flags": ["FIG_0090", "FIG_0134"]
    },
    {
      "prop_id": "P2",
      "scene_link": "S2",
      "verse_anchor": "2:2a",
      "proposition_kind": "REQUESTED_PERMISSION_TO_GLEAN",
      "event_specific_slots": {
        "requester": "B9",
        "addressee": "B3",
        "requested_action": "GLEAN_AMONG_EARS_OF_GRAIN_IN_FIELD",
        "destination": "PL5",
        "qualification": "AFTER_ONE_IN_WHOSE_EYES_FAVOR_IS_FOUND",
        "speech_act": "REQUESTS_PERMISSION_TO_DO"
      },
      "inter_proposition_links": {
        "forward_link_to": "P3"
      },
      "cb_flags": ["CB_0033", "CB_0034", "CB_0004"],
      "figure_flags": ["FIG_0001", "FIG_0018"]
    },
    {
      "prop_id": "P3",
      "scene_link": "S2",
      "verse_anchor": "2:2b",
      "proposition_kind": "GRANTED_PERMISSION_TO_GLEAN",
      "event_specific_slots": {
        "permission_granter": "B3",
        "permission_recipient": "B9",
        "addressed_form": "DAUGHTER_FORM_OF_ADDRESS",
        "granted_action": "GO_AND_GLEAN_AS_REQUESTED",
        "speech_act": "GRANTS_PERMISSION_TO_DO"
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
      "scene_link": "S3",
      "verse_anchor": "2:3a",
      "proposition_kind": "WENT_AND_GLEANED_BEHIND_HARVESTERS",
      "event_specific_slots": {
        "gleaner": "B9",
        "destination": "PL5",
        "gleaning_position_relation": "BEHIND_HARVESTERS_IN_INSTITUTIONAL_GLEANING_POSITION",
        "harvesters_referent": "B14",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": ["CB_0034"],
      "figure_flags": []
    },
    {
      "prop_id": "P5",
      "scene_link": "S3",
      "verse_anchor": "2:3b",
      "proposition_kind": "CHANCE_ARRIVED_AT_KINSMAN_PORTION_WITH_CLAN_FRAME_RESTATED",
      "event_specific_slots": {
        "gleaner": "B9",
        "arrived_at_portion": "PL5_BOAZ_PORTION",
        "portion_owner": "B13",
        "clan_referent_restated": "B29",
        "clan_eponym": "B2",
        "agent_named": "NONE",
        "speech_act": "STATES_AS_TRUE"
      },
      "inter_proposition_links": {
        "caused_by": "P4",
        "forward_link_to": "P6"
      },
      "cross_ref": "FIG_0088 closes here; opened at P04 P5-P6 (Naomi's empty-lament at v.21 / harvest-setting at v.22)",
      "cb_flags": ["CB_0035"],
      "figure_flags": ["FIG_0015", "FIG_0088"]
    },
    {
      "prop_id": "P6",
      "scene_link": "S3",
      "verse_anchor": "2:4a",
      "proposition_kind": "ARRIVED_AT_FIELD_FROM_HOMETOWN",
      "event_specific_slots": {
        "arriver": "B13",
        "origin": "PL1",
        "destination": "PL5_BOAZ_PORTION",
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
      "scene_link": "S3",
      "verse_anchor": "2:4b",
      "proposition_kind": "EXCHANGED_GREETING_AND_RETURN_BLESSING",
      "event_specific_slots": {
        "greeting_components": [
          {
            "action": "GREETED_WITH_DIVINE_INVOCATION",
            "greeter": "B13",
            "greeted_party": "B14",
            "invoked_divine_agent": "B10",
            "list_position": "FIRST",
            "speech_act": "WISHES_FOR_HEARER"
          },
          {
            "action": "RETURNED_BLESSING_WITH_DIVINE_INVOCATION",
            "blesser": "B14",
            "blessing_recipient": "B13",
            "invoked_divine_agent": "B10",
            "list_position": "SECOND",
            "speech_act": "WISHES_FOR_HEARER"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P6",
        "forward_link_to": "P8"
      },
      "cb_flags": ["CB_0008"],
      "figure_flags": ["FIG_0092", "FIG_0093"]
    },
    {
      "prop_id": "P8",
      "scene_link": "S4",
      "verse_anchor": "2:5",
      "proposition_kind": "ASKED_KINSHIP_AND_SOCIAL_COVER_QUESTION",
      "event_specific_slots": {
        "question_asker": "B13",
        "question_addressee": "B15",
        "question_target_referent": "B9",
        "speech_act": "ASKS_KINSHIP_BELONGING_QUESTION"
      },
      "inter_proposition_links": {
        "forward_link_to": "P9"
      },
      "cb_flags": ["CB_0036"],
      "figure_flags": ["FIG_0091", "FIG_0094"]
    },
    {
      "prop_id": "P9",
      "scene_link": "S4",
      "verse_anchor": "2:6-7",
      "proposition_kind": "FOREMAN_REPORTED_IDENTITY_AND_WORK_PATTERN",
      "event_specific_slots": {
        "reporter": "B15",
        "report_addressee": "B13",
        "report_subject_referent": "B9",
        "report_components": [
          {
            "action": "IDENTIFIED_BY_ETHNIC_EPITHET",
            "identified_party": "B9",
            "epithet_voice_layer": "THIRD_PARTY_FIELD_COMMUNITY_VOICE_FIRST_OCCURRENCE_IN_BETHLEHEM",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "IDENTIFIED_BY_RETURN_WITH_KINSHIP_ANCHOR",
            "identified_party": "B9",
            "kinship_anchor_being": "B3",
            "return_origin": "PL2",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "REPORTED_PRIOR_REQUEST_QUOTED_SPEECH",
            "quoted_prior_speaker": "B9",
            "quoted_prior_speech_act": "REQUESTS_PERMISSION_TO_DO",
            "quoted_prior_action": "GLEAN_AND_GATHER_AMONG_SHEAVES_AFTER_REAPERS",
            "list_position": "THIRD",
            "speech_act": "REPORTS_PRIOR_SPEECH_REQUEST"
          },
          {
            "action": "REPORTED_WORK_PATTERN_PERSISTENCE",
            "list_position": "FOURTH",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "REPORTED_DISPUTED_SHELTER_REST",
            "shelter_place": "PL_HA_BAYIT_FIELD_SHELTER",
            "textual_clarity_flag": true,
            "list_position": "FIFTH",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P8"
      },
      "cross_ref": "FIG_0001 third-party-voice reactivation at v.6 (carry-forward arc: opened P01 v.4 narrator → withheld P02-P03 → narrator-voice P04 v.22 → narrator-epithet P05 v.2 → third-party-voice P05 v.6)",
      "cb_flags": ["CB_0004", "CB_0034", "CB_0036"],
      "figure_flags": ["FIG_0001", "FIG_0091"]
    }
  ]
}
```
