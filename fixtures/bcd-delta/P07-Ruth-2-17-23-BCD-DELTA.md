---
type: "sta-bcd-delta"
pericope: "P07"
pericope-title: "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest"
source-meaning-map: [[P07-Ruth-2-17-23]]
source-compilation-log: [[P07-Ruth-2-17-23-COMPILATION-LOG]]
status: "valid"
pilot: "pilot-2"
---

# P07 — Ruth 2:17–23 — BCD-DELTA

This page renders the BCD-DELTA JSON as a wiki-addressable artifact. Registry promotions for this pericope feed into the Book Character Database, Figure Registry, and Concept Bank via the BCD update tooling.

> **No new BCD beings, places, or times, and no new figures.** id-check confirmed ZERO new entities: all nine beings, all four places, both times, and all three grain/harvest objects already resolve in `ruth_pilot_BCD_v0_3`; all seven fired figures already exist in the Figure Registry (referenced via the FOR_MODEL's `figure_flags`, not re-added). The single registry addition is one structural object — the leftover-from-satiety form (the only entity the map introduces that the BCD does not already carry; it surfaces in the map's §3C Scene 2 as bare Hebrew with no `[[code]]`). The pericope's substantive contribution is the eight active concept-bank flags and the discourse-thread events.

```json
{
  "schema_version": "TRIPOD_BCD_DELTA_V1",
  "tagset_version": "TRIPOD_STA_v2_0",
  "bcd_delta_id": "ruth_bcd_delta_07_v2_0",
  "bcv": "Ruth 2:17-23",
  "pericope_id": "P07",
  "pericope_title": "Ruth brings home the gleaning; Naomi recognizes Boaz as a redeemer; Ruth stays through the harvest",
  "generated_at": "2026-06-01",
  "source_meaning_map_ref": "P07-Ruth-2-17-23.md",
  "source_compilation_log_ref": "P07-Ruth-2-17-23-COMPILATION-LOG.md",
  "to_bcd": {
    "beings": [],
    "places": [],
    "objects": [
      {
        "object_id": "TH_LEFTOVER_FROM_SATIETY_FORM",
        "name_hebrew": "הַמּוֹתָר מִשָּׂבְעָהּ",
        "name_english": "what she had left over from her satiety (food saved from her own meal and brought home)",
        "kind": "LEFTOVER_AFTER_SATIETY_FORM",
        "first_appearance": "2:18",
        "notes": "The food left from Ruth's own field-meal, saved and given to Naomi — a second gift on top of the gleaned grain. Surface anchor of FIG_0113 (Leftovers After Satiety). The map carries it in §3C Scene 2 as bare Hebrew without a code; registered here as a TH_ structural object. New structural element relative to the BCD; flagged in the COMPILATION-LOG (P07-D12)."
      }
    ],
    "times": [],
    "discourse_thread_events": [
      {
        "thread_id": "T7_harvest_provision",
        "state": "RESOLVED",
        "verse_locus": "2:17-23",
        "note": "The harvest-provision thread closes: the day's gleaning comes to a full ephah, and Ruth gleans on to the end of both the barley and the wheat harvests. The hungry household opened at 1:22 now has grain and a season of gathering behind it. Closes the harvest-provision frame the chapter has carried."
      },
      {
        "thread_id": "T2_line_and_inheritance_of_elimelech",
        "state": "ADVANCED",
        "verse_locus": "2:20",
        "note": "The redeemer-role is named aloud for the first time in the book: Naomi recognizes Boaz as 'near to us, one of our redeemers.' The characters now share the redeemer-frame the audience has held since 2:1. Opens the redeemer-thread the rest of the book turns on; the 'near to us' nearness creates the obligation."
      },
      {
        "thread_id": "T4_hesed_answered_with_hesed",
        "state": "ADVANCED",
        "verse_locus": "2:20",
        "note": "The hesed lexeme, kept back through the field scenes, returns on Naomi's lips — the first hesed lexeme in chapter 2 — and is stretched over the living and the dead. The antecedent (YHWH or Boaz) is held open. Hesed enacted-and-named, not only enacted."
      },
      {
        "thread_id": "T1_naomi_security_and_rest",
        "state": "ADVANCED",
        "verse_locus": "2:18-23",
        "note": "Provision reaches Naomi's hand directly: Ruth shows her the full gleaning and feeds her from her own leftovers. The day's bare provision turns toward hope as Naomi sees a kinsman in view; Ruth keeps living with her through the season."
      },
      {
        "thread_id": "T5_moabite_outsider_incorporation",
        "state": "ADVANCED",
        "verse_locus": "2:21",
        "note": "The narrator reasserts 'Ruth the Moabitess' precisely as she repeats Boaz's welcome — the foreigner-marker returns where incorporation is at stake. Ruth's outsider standing stays in view as her place in the household grows."
      },
      {
        "thread_id": "T6_yhwh_at_work",
        "state": "ADVANCED",
        "verse_locus": "2:20",
        "note": "Naomi blesses YHWH for not letting go of his hesed toward the living and the dead — divine-name invocation in a formal blessing form. YHWH's covenant kindness named as the agency behind the day's turn, though the hesed antecedent is held open."
      },
      {
        "thread_id": "T3_ruth_home_husband_rest",
        "state": "ADVANCED",
        "verse_locus": "2:20-23",
        "note": "The first sign that the family's rescue may have a name: a redeemer is recognized, and Ruth stays close under Boaz's protection through both harvests. The question of what will come of this kinship is left hanging for chapter 3."
      }
    ]
  },
  "to_figures_registry": [],
  "to_concept_bank": {
    "cb_flags_active": [
      {
        "cb_id": "CB_0040",
        "first_occurrence_in_book_here": true,
        "occurrences_in_pericope": ["2:17", "2:18"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0034",
        "first_occurrence_in_book_here": false,
        "occurrences_in_pericope": ["2:17", "2:19", "2:23"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0011",
        "first_occurrence_in_book_here": false,
        "occurrences_in_pericope": ["2:20"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0039",
        "first_occurrence_in_book_here": true,
        "occurrences_in_pericope": ["2:20"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0001",
        "first_occurrence_in_book_here": true,
        "occurrences_in_pericope": ["2:20"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0018",
        "first_occurrence_in_book_here": false,
        "occurrences_in_pericope": ["2:23"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0004",
        "first_occurrence_in_book_here": false,
        "occurrences_in_pericope": ["2:21"],
        "surface_form": "NAMED"
      },
      {
        "cb_id": "CB_0026",
        "first_occurrence_in_book_here": false,
        "occurrences_in_pericope": ["2:23"],
        "surface_form": "NAMED"
      }
    ]
  }
}
```
