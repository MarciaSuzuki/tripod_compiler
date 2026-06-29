---
type: "sta-compilation-log"
pericope: "E16"
status: "skeleton"
pilot: "pilot-2"
---

# E16 — Esther 9:11–19 — COMPILATION-LOG (skeleton gap report)

```json
{
  "sta_id": "esther_pericope_16_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "bcv": "Esther 9:11-19",
  "pericope_id": "P16",
  "pericope_title": "The Susa toll, Esther's second request, and the two days of feasting",
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
  "confidence_overall_note": "Deterministic skeleton from the approved Meaning Map. 12 beings + 4 place codes extracted, 0 flags carried, 72 judgment gaps deferred. Extract-only: no controlled-vocabulary values assigned by the compiler.",
  "compilation_decisions": [
    {
      "decision_id": "P16-D1",
      "decision": "Deterministically compiled a FOR_MODEL skeleton from the approved Meaning Map.",
      "description": "Extracted header/classification, scene + entity IDs + presence, verse-ranges, significant_absence, communicative purpose, proposition anchors/scene-links/cross-refs, and Section-5 concept/figure flags. 72 judgment fields left as typed placeholders for Agent 3. No values invented (extract-only)."
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
    "Deterministic skeleton (tripod compile): 72 judgment gaps remain as typed __TODO__ placeholders carrying their source-prose span.",
    "Judgment gaps by field — role_in_scene:12, referential_form:12, proposition_kind:9, event_specific_slots:9, inter_proposition_links:9, being_id:3, object_id:3, scene_kind:3, time_id:2, book_context_ref:1, register_overrides:1, arc_elements:1, context_elements:1, tone_elements:1, pace_elements:1, communicative_function_elements:1, beings_in_scene:1, place_id:1, (granularity):1.",
    "Propositions are at MEANING-MAP granularity (9); the FOR_MODEL may decompose multi-event propositions further (judgment, Agent 3).",
    "Controlled-vocabulary tokens (scene_kind, proposition_kind, role/function), event_specific_slots, inter_proposition_links, referential_form, and the L1 element arrays are judgment — deferred to Agent 3 (Slice 4). No values were invented."
  ]
}
```
