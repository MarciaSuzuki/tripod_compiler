---
type: "compilation-log"
pericope: "P14"
status: "skeleton"
pilot: "pilot-2"
---

# P14 — Ruth 4:18-22 — COMPILATION-LOG (skeleton gap report)

```json
{
  "sta_id": "ruth_pericope_14_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "bcv": "Ruth 4:18-22",
  "pericope_id": "P14",
  "pericope_title": "The generations of Perez: ten names to David",
  "compiled_at": "2026-05-29",
  "review_status": {
    "meaning_map_status": "PARSED_BY_COMPILER",
    "sta_compilation_status": "SKELETON_DETERMINISTIC",
    "community_verified": false,
    "translation_team_verified": false,
    "consultant_review_required": true,
    "production_use": false
  },
  "confidence_overall": "LOW",
  "confidence_overall_note": "Deterministic skeleton from the approved Meaning Map. 4 beings + 0 place codes extracted, 15 flags carried, 47 judgment gaps deferred. Extract-only: no controlled-vocabulary values assigned by the compiler.",
  "compilation_decisions": [
    {
      "decision_id": "P14-D1",
      "decision": "Deterministically compiled a FOR_MODEL skeleton from the approved Meaning Map.",
      "description": "Extracted header/classification, scene + entity IDs + presence, verse-ranges, significant_absence, communicative purpose, proposition anchors/scene-links/cross-refs, and Section-5 concept/figure flags. 47 judgment fields left as typed placeholders for Agent 3. No values invented (extract-only)."
    }
  ],
  "vocabulary_additions": {
    "proposition_kinds": [],
    "scene_kinds": [],
    "presence_values": [],
    "referential_forms": [],
    "other": []
  },
  "proposition_kind_slot_sets": [],
  "high_risk_register_audit": [
    {
      "id": "R1",
      "kind": "SKELETON_PENDING_HIGH_RISK_REVIEW",
      "applies_to": "(whole pericope — high-risk register audit not yet assigned)",
      "note": "Deterministic skeleton: the high-risk register audit (figures to keep, naming shifts, structural absences) is judgment and is deferred to Agent 3 / the READING_QUALITY gate. This is a placeholder so the COMPILATION-LOG is schema-valid; it is not a finding.",
      "required_in_audit": true,
      "source_in_meaning_map": "(skeleton — pending judgment)"
    }
  ],
  "cross_pericope_pair_verification": {
    "pairs": []
  },
  "validation_checklist": {
    "meaning_map_contains_only_story_content": true,
    "for_model_contains_only_inference_signal": false,
    "every_proposition_has_cb_flags_and_figure_flags": false,
    "no_grammatical_frame_slot_names": true,
    "speech_act_present_on_all_component_records": false,
    "speech_act_values_used": [],
    "discourse_threads_tracked_in_audit_only": true,
    "known_limitations_tracked_in_audit_only": true,
    "high_risk_register_complete": false,
    "every_high_risk_entry_traces_to_meaning_map": false,
    "no_content_added_beyond_meaning_map": true,
    "registry_additions_extracted_to_bcd_delta": true,
    "no_reviewer_facing_prompts_in_compilation_log": true
  },
  "known_limitations": [
    "Deterministic skeleton (tripod compile): 47 judgment gaps remain as typed __TODO__ placeholders carrying their source-prose span.",
    "Judgment gaps by field — proposition_kind:10, event_specific_slots:10, inter_proposition_links:10, role_in_scene:4, referential_form:4, book_context_ref:1, register_overrides:1, arc_elements:1, context_elements:1, tone_elements:1, pace_elements:1, communicative_function_elements:1, scene_kind:1, (granularity):1.",
    "Propositions are at MEANING-MAP granularity (10); the FOR_MODEL may decompose multi-event propositions further (judgment, Agent 3).",
    "Controlled-vocabulary tokens (scene_kind, proposition_kind, role/function), event_specific_slots, inter_proposition_links, referential_form, and the L1 element arrays are judgment — deferred to Agent 3 (Slice 4). No values were invented."
  ]
}
```
