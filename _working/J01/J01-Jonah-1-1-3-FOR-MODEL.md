---
type: "sta-for-model"
pericope: "J01"
pericope-title: "The word comes to Jonah, and Jonah flees"
source-meaning-map: [[J01-Jonah-1-1-3]]
status: "skeleton"
pilot: "pilot-2"
---

# J01 — Jonah 1:1–3 — FOR_MODEL (SKELETON — 45 judgment gaps)

> Deterministic skeleton compiled from the Meaning Map (`tripod compile`). Fields set to `__TODO__` need the drafter/LLM (Slice 4); see the gap report (`--json`).

```json
{
  "sta_id": "jonah_pericope_01_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Jonah 1:1-3",
    "pericope_title": "The word comes to Jonah, and Jonah flees",
    "book_context_ref": "__TODO__: set the BCD ref, e.g. ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "J01-Jonah-1-1-3",
    "source_language": "Biblical Hebrew"
  },
  "pericope_classification": {
    "genre_group": "NARRATIVE",
    "genre": "HISTORICAL_NARRATIVE",
    "register": "INFORMAL_CASUAL",
    "register_overrides": {
      "_note": "scaffold — confirm against the MM's multi-level register tagging",
      "scene_level": null,
      "moment_level": null
    }
  },
  "level_1": {
    "arc_elements": [],
    "context_elements": [],
    "tone_elements": [],
    "pace_elements": [],
    "communicative_function_elements": []
  },
  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:1-2",
      "scene_kind": "__TODO__: The word of YHWH comes to Jonah",
      "scene_communicative_purpose": "Gives the command that the rest of the pericope answers: the caller, the called, the city, and the reason.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B1",
            "role_in_scene": "__TODO__: the one the word comes to; the prophet who is sent",
            "presence": "PRESENT"
          },
          {
            "being_id": "B2",
            "role_in_scene": "__TODO__: the one whose word comes; the one who sends",
            "presence": "PRESENT"
          },
          {
            "being_id": "B3",
            "role_in_scene": "__TODO__: fixes who Jonah is by naming his father",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B5",
            "role_in_scene": "__TODO__: the ones whose evil is the reason for the errand",
            "presence": "REFERENCED"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL1"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0001"
          },
          {
            "object_id": "CB_0002"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator names \"their evil\" but never says what it is — the wrongdoing is asserted, not described. Nothing is told of who Jonah is or why he is the one sent."
    },
    {
      "scene_id": "S2",
      "verse_range": "1:3",
      "scene_kind": "__TODO__: Jonah flees toward Tarshish",
      "scene_communicative_purpose": "Records the flight: the prophet's refusal, carried out as a journey the opposite way.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B1",
            "role_in_scene": "__TODO__: the called one who flees instead of going",
            "presence": "PRESENT"
          },
          {
            "being_id": "B2",
            "role_in_scene": "__TODO__: the one Jonah flees away from",
            "presence": "REFERENCED"
          },
          {
            "being_id": "B4",
            "role_in_scene": "__TODO__: the ones Jonah means to sail away with",
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
            "place_id": "PL3"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "O1"
          },
          {
            "object_id": "O2"
          },
          {
            "object_id": "CB_0002"
          }
        ]
      },
      "times_in_scene": {
        "_note": "no distinct temporal frame for this scene (per meaning map)",
        "entries": null
      },
      "significant_absence": "The narrator gives no reason for the flight. Jonah says nothing — no refusal, no argument, no prayer. Why he runs is left entirely unsaid."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "__TODO__",
      "verse_anchor": "Jonah",
      "proposition_kind": "__TODO__: Q: What happened? A: a word came",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: a word came | Q: Whose word? A: [[B2-YHWH]] YHWH's | Q: To whom? A: [[B1-Jonah]] Jonah | Q: Jonah who? A: son of [[B3-Amittai]] Amittai"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0001"
      ]
    },
    {
      "prop_id": "P2",
      "scene_link": "__TODO__",
      "verse_anchor": "Jonah",
      "proposition_kind": "__TODO__: Q: What happened? A: telling",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: telling | Q: Who told? A: [[B2-YHWH]] YHWH | Q: Told whom? A: [[B1-Jonah]] Jonah | Q: To do what? A: get up | Q: And? A: go | Q: Go where?…"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0001",
        "CB_0002"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P3",
      "scene_link": "__TODO__",
      "verse_anchor": "Jonah",
      "proposition_kind": "__TODO__: Q: What happened? A: getting up",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: getting up | Q: Who got up? A: [[B1-Jonah]] Jonah | Q: To do what? A: to flee | Q: Flee where? A: [[PL2-Tarshish]] Tarshish | Q: Away from…"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0002"
      ],
      "figure_flags": [
        "FIG_0002"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "__TODO__",
      "verse_anchor": "Jonah",
      "proposition_kind": "__TODO__: Q: What happened? A: going down",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: going down | Q: Who went down? A: [[B1-Jonah]] Jonah | Q: Down to where? A: [[PL3-Joppa]] Joppa | Q: What happened next? A: finding | Q: F…"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0003"
      ]
    },
    {
      "prop_id": "P5",
      "scene_link": "__TODO__",
      "verse_anchor": "Jonah",
      "proposition_kind": "__TODO__: Q: What happened? A: paying",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: paying | Q: Who paid? A: [[B1-Jonah]] Jonah | Q: Paid what? A: its [[O2-Fare]] fare | Q: What happened next? A: going down | Q: Down into …"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0002"
      ],
      "figure_flags": [
        "FIG_0002",
        "FIG_0003"
      ]
    }
  ]
}
```
