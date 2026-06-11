---
type: "sta-for-model"
pericope: "P10"
pericope-title: "The nameless dawn: six measures home, and sit still"
source-meaning-map: [[P10-Ruth-3-14-18]]
status: "skeleton"
pilot: "pilot-2"
---

# P10 — Ruth 3:14-18 — FOR_MODEL (SKELETON — 60 judgment gaps)

> Deterministic skeleton compiled from the Meaning Map (`tripod compile`). Fields set to `__TODO__` need the drafter/LLM (Slice 4); see the gap report (`--json`).

```json
{
  "sta_id": "ruth_pericope_10_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "header": {
    "bcv": "Ruth 3:14-18",
    "pericope_title": "The nameless dawn: six measures home, and sit still",
    "book_context_ref": "__TODO__: set the BCD ref, e.g. ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P10-Ruth-3-14-18",
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
      "verse_range": "3:14-15",
      "scene_kind": "__TODO__: The dawn at the floor: the secrecy word and the six measures",
      "scene_communicative_purpose": "Closes the night under its rule — unseen, unnamed — and sends its meaning home as a weighed gift.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B9",
            "role_in_scene": "__TODO__: the one who lies until morning, rises before light, holds out the cloak, and carries the gift to town",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "__TODO__: the one who sets the secrecy rule, measures the six measures, and goes into the town",
            "presence": "PRESENT"
          }
        ]
      },
      "places_in_scene": {
        "entries": [
          {
            "place_id": "PL6"
          },
          {
            "place_id": "PL4"
          }
        ]
      },
      "objects_in_scene": {
        "entries": [
          {
            "object_id": "CB_0042"
          },
          {
            "object_id": "O13"
          },
          {
            "object_id": "O16"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "O15"
          }
        ]
      },
      "significant_absence": "No farewell is recorded, and no word about what the gift means is spoken at the floor — the do-not-go-empty reason surfaces only later, in Ruth's report. The measure-unit of the six measures is never named; the text leaves \"six of barley\" standing open. And no one is named: he is \"he,\" she is \"the woman.\""
    },
    {
      "scene_id": "S2",
      "verse_range": "3:16-18",
      "scene_kind": "__TODO__: Home: the question, the report, and \"sit still\"",
      "scene_communicative_purpose": "Brings the night's meaning home — the question, the full report, the gift with its aimed word — and sets the story down to wait on the man and the day.",
      "beings_in_scene": {
        "entries": [
          {
            "being_id": "B3",
            "role_in_scene": "__TODO__: the one who asks the morning's strange question, hears the report, and reads the man in the gift",
            "presence": "PRESENT"
          },
          {
            "being_id": "B9",
            "role_in_scene": "__TODO__: the one questioned, the reporter of all the man did, the bearer of the six measures",
            "presence": "PRESENT"
          },
          {
            "being_id": "B13",
            "role_in_scene": "__TODO__: the one reported on — what he did, what he gave, what he said, and what he will not rest from",
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
            "object_id": "O16"
          },
          {
            "object_id": "CB_0044"
          },
          {
            "object_id": "CB_0024"
          },
          {
            "object_id": "CB_0043"
          },
          {
            "object_id": "O19"
          }
        ]
      },
      "times_in_scene": {
        "entries": [
          {
            "time_id": "TM_TODAY"
          }
        ]
      },
      "significant_absence": "Naomi's question gets no direct answer — no name, no \"I am Ruth\"; the report stands where the answer would be, and the words keep open whether she asks who it is at the door, or what the night has made of her. Boaz's \"do not go empty\" is heard only through Ruth — the narrator never showed him saying it at the floor. And the whole exchange passes without one personal name: the man, the woman, my daughter, your mother-in-law."
    }
  ],
  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "3:14a",
      "proposition_kind": "__TODO__: Q: What happened? A: lying",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: lying | Q: Who lay? A: [[B9-Ruth]] she — the woman | Q: Where? A: at the place of his feet | Q: Until when? A: until the morning"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0042"
      ],
      "figure_flags": []
    },
    {
      "prop_id": "P2",
      "scene_link": "S1",
      "verse_anchor": "3:14b",
      "proposition_kind": "__TODO__: Q: What happened? A: rising",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: rising | Q: Who rose? A: [[B9-Ruth]] she | Q: When? A: before one person could recognize another"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0150"
      ]
    },
    {
      "prop_id": "P3",
      "scene_link": "S1",
      "verse_anchor": "3:14c",
      "proposition_kind": "__TODO__: Q: What happened? A: instructing",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: instructing | Q: Who spoke? A: [[B13-Boaz]] he | Q: What did he say? A: let it not be known | Q: What must not be known? A: that the woman…"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0151"
      ]
    },
    {
      "prop_id": "P4",
      "scene_link": "S1",
      "verse_anchor": "3:15a",
      "proposition_kind": "__TODO__: Q: What happened? A: instructing",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: instructing | Q: What did he tell her? A: hold out the cloak that is on you | Q: What did she do? A: she held it"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P5",
      "scene_link": "S1",
      "verse_anchor": "3:15b",
      "proposition_kind": "__TODO__: Q: What happened? A: measuring",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: measuring | Q: Who measured? A: [[B13-Boaz]] he | Q: Measured what? A: six measures of barley | Q: What did he do with it? A: laid it on h…"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0152"
      ]
    },
    {
      "prop_id": "P6",
      "scene_link": "S1",
      "verse_anchor": "3:15c",
      "proposition_kind": "__TODO__: Q: What happened? A: going",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: going | Q: Who went? A: he | Q: Where? A: into the town"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P7",
      "scene_link": "S2",
      "verse_anchor": "3:16a",
      "proposition_kind": "__TODO__: Q: What happened? A: coming home",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: coming home | Q: Who came? A: [[B9-Ruth]] Ruth | Q: To whom? A: [[B3-Naomi]] her mother-in-law"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P8",
      "scene_link": "S2",
      "verse_anchor": "3:16b",
      "proposition_kind": "__TODO__: Q: What happened? A: asking",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: asking | Q: Who asked? A: [[B3-Naomi]] her mother-in-law | Q: What did she ask? A: who are you | Q: How did she address her? A: my daughter"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0154"
      ]
    },
    {
      "prop_id": "P9",
      "scene_link": "S2",
      "verse_anchor": "3:16c",
      "proposition_kind": "__TODO__: Q: What happened? A: reporting",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: reporting | Q: Who reported? A: [[B9-Ruth]] Ruth | Q: What did she tell? A: all that the man did for her"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0155"
      ]
    },
    {
      "prop_id": "P10",
      "scene_link": "S2",
      "verse_anchor": "3:17a",
      "proposition_kind": "__TODO__: Q: What happened? A: showing",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: showing | Q: What did she show? A: these six measures of barley | Q: Who gave them? A: [[B13-Boaz]] the man"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0152"
      ]
    },
    {
      "prop_id": "P11",
      "scene_link": "S2",
      "verse_anchor": "3:17b",
      "proposition_kind": "__TODO__: Q: What did she report he said? A: do not go empty to your mother-in-law",
      "event_specific_slots": {
        "__TODO__": "Q: What did she report he said? A: do not go empty to your mother-in-law"
      },
      "inter_proposition_links": {},
      "cb_flags": [
        "CB_0044",
        "CB_0024",
        "CB_0043"
      ],
      "figure_flags": [
        "FIG_0153"
      ]
    },
    {
      "prop_id": "P12",
      "scene_link": "S2",
      "verse_anchor": "3:18a",
      "proposition_kind": "__TODO__: Q: What happened? A: counseling",
      "event_specific_slots": {
        "__TODO__": "Q: What happened? A: counseling | Q: Who spoke? A: [[B3-Naomi]] Naomi | Q: How did she address her? A: my daughter | Q: What did she tell her to do? A: sit sti…"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": []
    },
    {
      "prop_id": "P13",
      "scene_link": "S2",
      "verse_anchor": "3:18b",
      "proposition_kind": "__TODO__: Q: What reason did she give? A: the man will not rest",
      "event_specific_slots": {
        "__TODO__": "Q: What reason did she give? A: the man will not rest | Q: Unless what? A: he has finished the matter today"
      },
      "inter_proposition_links": {},
      "cb_flags": [],
      "figure_flags": [
        "FIG_0155",
        "FIG_0156"
      ]
    }
  ]
}
```
