---
type: "sta-for-model"
pericope: "P03"
pericope-title: "Naomi's last appeal; Ruth's vow; Naomi's silence"
source-meaning-map: [[P03-Ruth-1-15-18]]
status: "valid"
pilot: "pilot-2"
---

# P03 — Ruth 1:15–18 — FOR_MODEL

This page renders the FOR_MODEL JSON as a wiki-addressable artifact. The canonical JSON file lives in the source folder.

```json
{
  "sta_id": "ruth_pericope_03_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 1:15-18",
    "pericope_title": "Naomi's last appeal; Ruth's vow; Naomi's silence",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P03-Ruth-1-15-18",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "Two scene-level INTIMATE overrides on S1 (Naomi's last appeal) and S2 (Ruth's vow). S3 returns to INFORMAL_CASUAL narrator default. No moment-level overrides.",
      "scene_level": [
        {
          "scene_id": "S1",
          "override_value": "INTIMATE",
          "genre_override": null,
          "genre_group_override": null
        },
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
      "RELEASE_ATTEMPT",
      "REFUSAL_OF_RELEASE",
      "COVENANT_BINDING_BY_VOW",
      "OATH_SEALING",
      "SILENCE_AFTER_VOW"
    ],
    "context_elements": [
      "STORY_WORLD_CONTEXT",
      "KINSHIP_CONTEXT",
      "TRAJECTORY_CONTEXT_ON_RETURN_ROAD",
      "AUDIENCE_KNOWLEDGE_CONTEXT",
      "PRIOR_PERICOPE_CARRY_FORWARD"
    ],
    "tone_elements": [
      "INTIMATE",
      "WEIGHTED",
      "SLOWED",
      "RISING_THROUGH_LADDER",
      "UNSETTLED_AT_CLOSE"
    ],
    "pace_elements": [
      "NARROW",
      "DELIBERATE",
      "PAUSED_AT_SILENCE"
    ],
    "communicative_function_elements": [
      "ESTABLISHES_RUTHS_COVENANT_BINDING_TO_NAOMI",
      "ADVANCES_MOABITE_OUTSIDER_INCORPORATION",
      "PLACES_DIVINE_NAME_ON_MOABITE_OUTSIDER_LIPS",
      "WITHHOLDS_NAOMIS_INTERIOR_RESPONSE",
      "WITHHOLDS_ETHNIC_EPITHET_AT_INCORPORATION_MOMENT"
    ]
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:15",
      "scene_kind": "APPEAL_WITH_EXEMPLAR_POINTING_SCENE",
      "scene_communicative_purpose": "Naomi's final release-attempt presents Orpah's return to her people and her gods as the example Ruth should follow.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "SPEAKER_MAKING_LAST_APPEAL",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "ADDRESSEE_OF_LAST_APPEAL",
            "presence": "PRESENT"
          },
          {
            "being_id": "B8",
            "role_in_scene": "EXEMPLAR_NAMED_BY_KINSHIP_FORM_ONLY",
            "presence": "REFERENCED",
            "referential_form": "KINSHIP_FORM_YEBIMTEKH"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL2",
            "role_in_scene": "REFERENCED_AS_PLACE_OF_RETURN_OF_EXEMPLAR"
          },
          {
            "place_id": "PL_LAND_OF_JUDAH",
            "role_in_scene": "IMPLIED_DESTINATION_OF_ONWARD_ROAD"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "No persistent objects in this scene.",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous with the journey established in P02.",
        "entries": null
      },
      "significant_absence": "Naomi names no proper place; she names Orpah's trajectory only by people and gods. Moabite gods are unnamed at v.15; YHWH is named only at v.17 (Scene 2). The asymmetric naming is structurally significant."
    },
    {
      "scene_id": "S2",
      "verse_range": "1:16-17",
      "scene_kind": "VOW_AND_RATIFICATION_SCENE",
      "scene_communicative_purpose": "Ruth refuses Naomi's directive and binds herself to Naomi in a six-step ladder closed by a self-curse oath invoking YHWH by name.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "SPEAKER_BINDING_HERSELF_BY_VOW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "ADDRESSEE_AND_BINDING_REFERENT",
            "presence": "PRESENT"
          },
          {
            "being_id": "B10",
            "role_in_scene": "INVOKED_AS_OATH_ENFORCER_AT_VERSE_17",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B31",
            "role_in_scene": "COLLECTIVE_BOUND_TO_BY_PEOPLE_BINDING",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "_note": "No proper place is named inside the vow. Ruth uses four indefinite-place constructions across the binding ladder (where you go / where you lodge / where you die / there I will be buried) without naming any PL-coded place. PL_LAND_OF_JUDAH continues as implicit onward destination of the road. No PL-coded place is anchored to a specific binding.",
        "entries": [
          {
            "place_id": "PL_LAND_OF_JUDAH",
            "role_in_scene": "IMPLIED_ONWARD_DESTINATION_OF_BINDING_PATH"
          }
        ]
      },
      "objects_in_scene": {
        "_note": "No persistent objects in this scene.",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame for this scene; time is continuous with the journey.",
        "entries": null
      },
      "significant_absence": "Narrator does not label Ruth with the Moabite epithet (FIG_0001) anywhere in this scene. Ruth does not name Bethlehem or any other proper place inside the vow. Ruth says 'your God' at v.16 without naming YHWH; the divine name appears only inside the self-curse formula at v.17. Ruth gives no reasons for her binding outside the binding itself."
    },
    {
      "scene_id": "S3",
      "verse_range": "1:18",
      "scene_kind": "SEEING_AND_FALLING_SILENT_SCENE",
      "scene_communicative_purpose": "Marks the failure of Naomi's release-attempt and the moment after which the two continue together. Closes the road dialogue.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "PERCEIVER_THEN_SILENT_AFTER_VOW",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "PERCEIVED_AS_DETERMINED",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "_note": "No PL-coded place anchored to this scene. The road continues as a structural object.",
        "entries": null
      },
      "objects_in_scene": {
        "_note": "No persistent objects in this scene.",
        "entries": null
      },
      "times_in_scene": {
        "_note": "No distinct temporal frame; closing moment continuous with the journey.",
        "entries": null
      },
      "significant_absence": "Narrator reports Naomi seeing and stopping speech but does not report her interior state. No agreement, no blessing, no further word from Naomi inside the pericope. The narrator gives interior access only to Ruth's resolve, not to Naomi's response."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:15",
      "proposition_kind": "SPOKE_DISSUASIVE_APPEAL_WITH_EXEMPLAR",
      "event_specific_slots": {
        "speaker": "B3",
        "addressees": [
          "B9"
        ],
        "appeal_components": [
          {
            "action": "STATED_EXEMPLAR_RETURN",
            "speaker": "B3",
            "exemplar_party": "B8",
            "exemplar_referential_form": "KINSHIP_FORM_YEBIMTEKH",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "DIRECTED_HEARER_TO_FOLLOW_EXEMPLAR",
            "speaker": "B3",
            "addressee": "B9",
            "exemplar_party": "B8",
            "exemplar_referential_form": "KINSHIP_FORM_YEBIMTEKH",
            "speech_act": "DIRECTS_HEARER_TO_RETURN"
          }
        ]
      },
      "inter_proposition_links": {
        "forward_link_to": "P2"
      },
      "cb_flags": [
        "CB_0019",
        "CB_0004"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P2",
      "scene_link": "S2",
      "verse_anchor": "1:16a",
      "proposition_kind": "REFUSED_DIRECTIVE_AS_OPENING_OF_VOW",
      "event_specific_slots": {
        "refuser": "B9",
        "addressee": "B3",
        "refused_action": "TURN_BACK_FROM_FOLLOWING_NAOMI",
        "speech_act": "REFUSES_REQUEST_WITH_COUNTER_DECLARATION"
      },
      "inter_proposition_links": {
        "back_reference_to_proposition": "P1",
        "forward_link_to": "P3"
      },
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P3",
      "scene_link": "S2",
      "verse_anchor": "1:16b-17a",
      "proposition_kind": "UTTERED_COVENANT_BINDING_VOW",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B3",
        "vow_structural_form": "SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL",
        "vow_components": [
          {
            "action": "VOWED_PATH_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "binding_indefinite_place_form": "WHERE_YOU_GO",
            "matched_action_form": "I_WILL_GO",
            "list_position": "FIRST",
            "speech_act": "VOWS_ROAD_BINDING"
          },
          {
            "action": "VOWED_LODGING_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "binding_indefinite_place_form": "WHERE_YOU_LODGE",
            "matched_action_form": "I_WILL_LODGE",
            "list_position": "SECOND",
            "speech_act": "VOWS_RESIDENCE_BINDING"
          },
          {
            "action": "VOWED_PEOPLE_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "bound_to_collective": "B31",
            "nominal_equation_half": "PEOPLE_HALF",
            "list_position": "THIRD",
            "speech_act": "VOWS_PEOPLE_BINDING"
          },
          {
            "action": "VOWED_GOD_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "invoked_divine_agent": "B10",
            "referential_form_at_verse": "UNNAMED_DEITY_IN_BINDING_PAIRING",
            "nominal_equation_half": "GOD_HALF",
            "list_position": "FOURTH",
            "speech_act": "VOWS_GOD_BINDING"
          },
          {
            "action": "VOWED_DEATH_PLACE_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "binding_indefinite_place_form": "WHERE_YOU_DIE",
            "matched_action_form": "I_WILL_DIE",
            "binding_domain": "IDENTITY_AT_LIMIT_OF_EXISTENCE",
            "list_position": "FIFTH",
            "speech_act": "VOWS_IDENTITY_BINDING"
          },
          {
            "action": "VOWED_BURIAL_PLACE_BINDING",
            "binder": "B9",
            "bound_to_referent": "B3",
            "binding_demonstrative_place_form": "THERE_DEMONSTRATIVE_LINKING_TO_DEATH_PLACE",
            "matched_action_form": "I_WILL_BE_BURIED",
            "binding_domain": "PLACE_OF_FINAL_REST",
            "list_position": "SIXTH",
            "speech_act": "VOWS_PLACE_OF_BURIAL_BINDING"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P2",
        "forward_link_to": "P4"
      },
      "cb_flags": [
        "CB_0021"
      ],
      "figure_flags": [
        "FIG_0072",
        "FIG_0074"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S2",
      "verse_anchor": "1:17b",
      "proposition_kind": "SEALED_VOW_WITH_SELF_CURSE_OATH",
      "event_specific_slots": {
        "speaker": "B9",
        "addressee": "B3",
        "agent_named": "B10",
        "agent_named_referential_form": "DIVINE_NAME_FIRST_ON_RUTHS_LIPS",
        "oath_conditional_structural_force": "BINDS_BEYOND_DEATH_VIA_INEVITABLE_CONDITION",
        "speech_act": "INVOKES_SELF_CURSE_AS_OATH_ENFORCEMENT"
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "forward_link_to": "P5"
      },
      "cb_flags": [
        "CB_0020"
      ],
      "figure_flags": [
        "FIG_0075"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "S3",
      "verse_anchor": "1:18",
      "proposition_kind": "WITNESSED_RESOLVE_AND_CEASED_SPEECH",
      "event_specific_slots": {
        "narrator_report_components": [
          {
            "action": "SAW_DETERMINED_RESOLVE",
            "perceiver": "B3",
            "perceived": "B9",
            "narrator_interior_access_scope": "GIVEN_TO_RUTHS_RESOLVE_WITHHELD_FROM_NAOMIS_RESPONSE",
            "list_position": "FIRST",
            "speech_act": "STATES_AS_TRUE"
          },
          {
            "action": "CEASED_SPEAKING",
            "ceaser": "B3",
            "ceased_speaking_to": "B9",
            "list_position": "SECOND",
            "speech_act": "STATES_AS_TRUE"
          }
        ]
      },
      "inter_proposition_links": {
        "caused_by": "P3",
        "back_reference_to_proposition": "P4"
      },
      "cb_flags": [],
      "figure_flags": []
    }
  ]
}
```
