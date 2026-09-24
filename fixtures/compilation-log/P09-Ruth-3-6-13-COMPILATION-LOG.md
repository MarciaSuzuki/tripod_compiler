---
type: "sta-compilation-log"
pericope: "P09"
status: "valid"
pilot: "pilot-2"
---

# P09 — Ruth 3:6-13 — COMPILATION-LOG

```json
{
  "sta_id": "ruth_pericope_09_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  "bcv": "Ruth 3:6-13",
  "pericope_id": "P09",
  "pericope_title": "The threshing-floor night: the wing asked for, the redeemer named, the oath",
  "compiled_at": "2026-05-29",
  "review_status": {
    "meaning_map_status": "PARSED_BY_COMPILER",
    "sta_compilation_status": "MODEL_DRAFTED_REVIEWER_RULED",
    "community_verified": false,
    "translation_team_verified": false,
    "consultant_review_required": true,
    "production_use": false
  },
  "confidence_overall": "MEDIUM",
  "confidence_overall_note": "Judgment half machine-drafted (SC-0063, patch-only contract) and ruled by Marcia axis-by-axis under SC-0064 (§A–§E + arc_element). The graduated MEANING_COORDINATES validates block-clean with 0 convergent drift and is lint-clean. Mechanized log: vocabulary_additions are this pericope's ruled mints; the high-risk register audit was drafted under SC-0086 (proposed) for Marcia's ruling (see P09-D4).",
  "compilation_decisions": [
    {
      "decision_id": "P09-D1",
      "decision": "Deterministically compiled a MEANING_COORDINATES skeleton from the approved Meaning Map.",
      "description": "Extracted header/classification, scene + entity IDs + presence, verse-ranges, significant_absence, communicative purpose, proposition anchors/scene-links/cross-refs, and Section-5 concept/figure flags. 101 judgment fields left as typed placeholders for Agent 3. No values invented (extract-only)."
    },
    {
      "decision_id": "P09-D2",
      "decision": "Judgment gaps filled by the SC-0063 drafter (Slice 4).",
      "description": "claude-opus-4-8 under the pinned fm-drafter prompt; structured-output fills merged by the patch-only layer. Provenance: _working/P09/drafts/run-2026-06-12T15-02-29-206Z/."
    },
    {
      "decision_id": "P09-D3",
      "decision": "Ruled by Marcia under SC-0064 (the batch ruling), axis by axis.",
      "description": "§A–§E + the five §B axes (action+tone, proposition_kind, role_in_scene_being, scene_kind, arc_element) ruled across 2026-06-12→19; 12 vocabulary addition(s) CONFIRMED for promotion for this pericope (per-axis ruling-logs in _working/P09/P09-SC-0064-*-RULING-LOG.md). Renames/collapses applied to the MEANING_COORDINATES as recorded amendments where ruled."
    },
    {
      "decision_id": "P09-D4",
      "decision": "High-risk register drafted for Marcia's ruling under SC-0086 (proposed; the P07–P14 register-completion program opened by SC-0085).",
      "description": "DRAFT of 2026-09-24, not yet ruled. 17 entries drafted from the P09 map (Sections 1, 2, 3A–3F, the three Significant Absence blocks, 4, 5A and 5B) in the P07 pattern: figures and pairs first, then register, naming and threads, and the held-open items last; kinds from the approved high_risk_register_kind list. do_not_decide on the seven entries where the map keeps something open that a retelling could resolve (R1, R4, R7, R9, R15, R16, R17), including the carried-forward items P06 R1 (the wing), P07 R3 (whose hesed at 2:20) and P07 R5 (the nearness, which continues to P11). Pair table: FIG_0011, FIG_0132, FIG_0111, FIG_0134, FIG_0123 and FIG_0122 VERIFIED here; FIG_0112 PENDING (closes at P11). The P03 self-curse forward note is recorded as not borne out (R8; known_limitations). The three Sala gate signals (the real audit, high_risk_register_complete, and the map's sta-status) flip together in this change, which is not to be merged before Marcia's ruling."
    }
  ],
  "vocabulary_additions": {
    "proposition_kinds": [
      {
        "value": "LAY_DOWN",
        "source": "P09-MEANING-COORDINATES + P10-MEANING-COORDINATES · SC-0063 drafter (claude-opus-4-8; P09 run-2026-06-12T15-02-29-206Z req a8b2dd69…) · ruled dual-axis by Marcia 2026-06-13 (proposition_kind Group A)",
        "status": "CONFIRMED",
        "note": "A lying-down event (P09 3:7 'he came to lie down at the end of the grain heap'; P10 3:14 'she lay until the morning'). Its `action` half was promoted in B1; this completes the deferred dual-axis by adding the `proposition_kind` half."
      },
      {
        "value": "WENT_DOWN",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-13 (proposition_kind Group B)",
        "status": "CONFIRMED",
        "note": "The narrative yarad descent (Ruth 3:6 'she went down to the threshing floor'; also J01 1:3 'going down to Joppa', J02 1:5 'gone down into the hold'). Kept distinct (Marcia's B-3 keep) from the psalm's DESCENDED — same root, different register."
      },
      {
        "value": "APPROACHED",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · bulk-tick by Marcia 2026-06-13 (proposition_kind)",
        "status": "CONFIRMED",
        "note": "Clean event-kind mint (proposition_kind bulk — no cross-axis/collapse/prose issue). MM P4: 'she came softly, uncovered the place of his feet, and lay down' — a multi-action approach with no approved proposition_kind fit."
      },
      {
        "value": "REASSURED",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · bulk-tick by Marcia 2026-06-13 (proposition_kind)",
        "status": "CONFIRMED",
        "note": "Clean event-kind mint (proposition_kind bulk — no cross-axis/collapse/prose issue). MM P14: 'do not fear; all that you say I will do for you' — a reassurance/pledge act (FIG_0123/FIG_0136) with no approved proposition_kind fit."
      },
      {
        "value": "TREMBLED",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · bulk-tick by Marcia 2026-06-13 (proposition_kind)",
        "status": "CONFIRMED",
        "note": "Clean event-kind mint (proposition_kind bulk — no cross-axis/collapse/prose issue). MM P5: 'the man trembled and twisted' — the vayyecherad startle, with no approved proposition_kind fit."
      }
    ],
    "scene_kinds": [
      {
        "value": "NIGHT_APPROACH_SCENE",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-13 (scene_kind)",
        "status": "CONFIRMED",
        "note": "Scene-kind (Marcia 2026-06-13 bulk-tick). MM 3F-S1: 'Executes the plan to the letter and sets the night's stage' — a wordless nighttime approach scene with no approved fit (MEAL_SCENE/INSTRUCTION_SCENE miss the staging focus)."
      }
    ],
    "presence_values": [],
    "referential_forms": [],
    "other": [],
    "arc_elements": [
      {
        "value": "NEARER_REDEEMER_DISCLOSURE",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-19 (arc_element)",
        "status": "CONFIRMED",
        "note": "arc_element (Marcia 2026-06-19 bulk-tick): clean reusable arc-type. MM 3:12: 'there is a redeemer nearer than I' turns 2:20's comfort into a legal queue; distinct beat with no approved fit."
      },
      {
        "value": "PLAN_EXECUTION",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-19 (arc_element)",
        "status": "CONFIRMED",
        "note": "arc_element (Marcia 2026-06-19 bulk-tick): clean reusable arc-type. MM 2.1/3F-S1: Ruth 'does all her mother-in-law commanded' — the carrying-out of P08's plan; no approved arc token names execution of a prior plan."
      },
      {
        "value": "WING_PETITION",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-19 (arc_element)",
        "status": "CONFIRMED",
        "note": "arc_element (Marcia 2026-06-19 bulk-tick): clean reusable arc-type. MM 3:9: 'spread your wing over your servant' — the kanaf marriage/protection petition closing the 2:12 image; no approved arc token covers this petition."
      }
    ],
    "action_values": [
      {
        "value": "UNCOVERED_FEET",
        "source": "P09-MEANING-COORDINATES P4@3:7c · SC-0063 drafter run-2026-06-12T15-02-29-206Z (claude-opus-4-8, request a8b2dd692305aee9…) · declared mint (fills.json) · ruled tick by Marcia 2026-06-12 (SC-0064 §B sitting 1, item 5)",
        "status": "CONFIRMED",
        "note": "Uncovered the place of his feet (margelot, CB_0042) — the plan's central act (3:7); no approved action token covers uncovering."
      },
      {
        "value": "LAY_DOWN",
        "source": "P09-MEANING-COORDINATES P4@3:7c · SC-0063 drafter run-2026-06-12T15-02-29-206Z (claude-opus-4-8, request a8b2dd692305aee9…) · declared mint (fills.json) · ruled tick by Marcia 2026-06-12 (SC-0064 §B sitting 1, item 6)",
        "status": "CONFIRMED",
        "note": "And lay down (3:7) — no approved action-axis fit. ACTION half only: the dual-axis proposition_kind LAY_DOWN proposal (P09 P3 + P10 P1) was explicitly DEFERRED by Marcia (sitting-1 item 13) to the proposition_kind sitting."
      }
    ],
    "role_in_scene_beings": [
      {
        "value": "POTENTIAL_SUITORS",
        "source": "P09-MEANING-COORDINATES · SC-0063 drafter run-run-2026-06-12T15-02-29-206Z (claude-opus-4-8, req a8b2dd692305aee9…) · ruled by Marcia 2026-06-13 (role_in_scene_being)",
        "status": "CONFIRMED",
        "note": "Scene role (Principle A, Marcia 2026-06-13). MM 3A-S3: 'the young men of marrying age, poor or rich; none of them chosen' — their scene function is the unchosen marital alternative, with no approved role_in_scene_being fit."
      }
    ]
  },
  "proposition_kind_slot_sets": [],
  "high_risk_register_audit": [
    {
      "id": "R1",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0131 Wing-of-Refuge-Requested at 3:9 (P9) — CLOSES the FIG_0011 Wing-of-Refuge pair opened at P06 P9 (2:12); CB_0037",
      "note": "REQUIRED keep-image. Cross-pericope pair closes here. At 3:9 Ruth asks, 'spread your wing over your servant', with the same word kanaph (כְנָפֶךָ 'your wing') that Boaz used at 2:12 when he blessed her under the wings of YHWH (FIG_0011, P06 R1). The wing must be the same wing at 2:12 and at 3:9, so the request is heard as an answer to the blessing. Ruth makes her request through the wing; the reconstructor must keep the wing and must not replace it with a plainer word for what she asks.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0131 'cross-pericope pair closes here at 3:9; opened at P06 2:12 with [[FIG_0011-Wing-of-Refuge]]'); Section 3C Scene 2 (CB_0037 'the wing as the picture of protective covering — shelter taken under it'; 'the same word Boaz used at 2:12, blessing her under YHWH's wings; the pair closes here as a petition'); Section 2.2 ('at 2:12 he blessed her under the wings (kanaf) of the God of Israel; at 3:9 she says, spread your wing (kanaf) over your servant'); carried forward from P06 R1"
    },
    {
      "id": "R2",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0132 Amah-Vs-Shifchah at 3:9 (P8) — CLOSES at 3:9 with amah; opened at P06 P11 (2:13) with shifchah",
      "note": "PREFERRED keep-image. Cross-pericope pair closes here. Ruth names herself 'Ruth your servant' with amah (אֲמָתֶךָ), the marriageable-servant word — a step up from the shifchah she called herself at 2:13 (P06 R2). If the target language can carry the difference, the servant-word at 3:9 should sound a step higher than the one at 2:13.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0132 'cross-pericope status-shift pair closes here at 3:9; opened at P06 2:13 with shifchah'); Section 3A Scene 2 (B9 referential form: 'then by her own mouth, \"Ruth your servant\" — amah, the marriageable-servant word, a step up from her shifchah of 2:13'); carried forward from P06 R2"
    },
    {
      "id": "R3",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0133 Greater-Hesed-at-End at 3:10 (P12); CB_0011 hesed thread, third station",
      "note": "REQUIRED keep-image. Boaz measures what Ruth has done: 'you have made your last hesed better than the first' (הֵיטַבְתְּ חַסְדֵּךְ הָאַחֲרוֹן מִן הָרִאשׁוֹן). The measure must stay whole — a last hesed and a first, the last the better — and the hesed word should be the one used at 1:8 and 2:20, so the thread's third station is heard. Boaz ties the last hesed to her not going after the young men, poor or rich (3:10c).",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0133 active at Proposition 12); Section 5A Concept Flags (CB_0011 'the thread's third station: 1:8, 2:20, 3:10'); Section 3C Scene 3 (CB_0011 'how Boaz names what Ruth has just done — her last hesed, better than the first'); Section 3E Scene 3 ('You have made your last hesed better than the first — not going after the young men, whether poor or rich')"
    },
    {
      "id": "R4",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0111 Hesed-Not-Forsaken — CLOSES at 3:10 (P12); opened at P07 P11 (2:20); the 2:20 question stays open per P07 R3",
      "note": "PREFERRED keep-image. Cross-pericope pair closes here: the hesed word Naomi spoke at 2:20 ('who has not forsaken his hesed') returns at 3:10, now naming Ruth's own hesed (חַסְדֵּךְ 'your hesed') in Boaz's mouth. At 2:20 the text leaves open whose hesed has not been forsaken — YHWH's or the man's (P07 R3). The reconstructor must not use 3:10 to settle that question: do not say or suggest that the hesed of 2:20 was Boaz's, or that it was YHWH's.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0111 'cross-pericope pair closes here at 3:10; opened at P07 2:20'); Section 5A Concept Flags (CB_0011 'the thread's third station: 1:8, 2:20, 3:10'); Section 3C Scene 3 (CB_0011 'the thread runs 1:8 and 2:20'); carried forward from P07 R3 (P07 map Section 3C Scene 3: 'whether the unforsaken hesed is YHWH's or the man's — is left open by the text, and the blessing's words keep it open')"
    },
    {
      "id": "R5",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0123 Absolute-Assent-Pattern + FIG_0136 All-You-Say-Formula at 3:11 (P14) — CLOSES at 3:11; opened at P08 P9 (3:5) in Ruth's mouth",
      "note": "PREFERRED keep-image. Cross-pericope pair closes here: Ruth's answer to Naomi at 3:5, 'all that you say I will do', comes back in Boaz's mouth at 3:11 — 'all that you say I will do for you' (FIG_0136, Boaz's half of the exchanged assent). If the target language can carry it, the two sayings should sound alike, so the exchanged assent is heard.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0123 'cross-pericope pair closes here at 3:11; opened at P08 3:5 in Ruth's mouth'; FIG_0136 '(Boaz's half of the exchanged assent)'); Section 2.4 ('the assent-pattern opened at 3:5 comes back in Boaz's mouth'); Section 4 Proposition 14 ('all that you say I will do for you')"
    },
    {
      "id": "R6",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0134 Chayil-Pair-Completed at 3:11 (P15) — CLOSES at 3:11 with eshet chayil; opened at P05 P1 (2:1) with ish gibbor chayil (FIG_0090); CB_0032",
      "note": "REQUIRED keep-image. Cross-pericope pair closes here: Boaz, brought into the story at 2:1 as a man of worth (ish gibbor chayil), now calls Ruth a woman of worth (eshet chayil, אֵשֶׁת חַיִל) — what all the gate of his people knows. The worth-word (chayil) must be the same at 2:1 and at 3:11, so the match between the two is heard (P05 R1, R7).",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0134 'cross-pericope pair closes here at 3:11; opened at P05 2:1'); Section 5A Concept Flags (CB_0032 '(the 2:1 pair completed)'); Section 3C Scene 3 (CB_0032 'completes the pair with Boaz's own introduction at 2:1, a man of worth'); Section 2.2 ('His \"woman of worth\" (eshet chayil) completes the pair the narrator opened at 2:1, where Boaz entered as a man of worth (ish gibbor chayil)'); carried forward from P05 R1 and R7"
    },
    {
      "id": "R7",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0138 Nearer-Redeemer-Qualification at 3:12 (P17); FIG_0112 Close-to-Us middle station (opened at P07 P12, 2:20; closes at P11); the nearer redeemer unnamed",
      "note": "REQUIRED keep-image (FIG_0138). After owning the role — 'truly I am a redeemer' — Boaz discloses 'there is a redeemer nearer than I' (גֹּאֵל קָרוֹב מִמֶּנִּי). The nearness is the 2:20 'near to us' come back as the legal queue (FIG_0112, P07 R5): nearer in the queue of redeemers, not nearer in place or in friendship. The nearer redeemer is unnamed here — only 'a redeemer nearer than I'. The reconstructor must not name him, must not give him any name-like label, and must not say who he is.",
      "required_in_audit": true,
      "do_not_decide": true,
      "carries_forward_to": "P11_audit",
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0138 active at Proposition 17; FIG_0112 '(the 2:20 nearness-language returns as the legal queue)'); Section 3A Scene 3 (B19 'the unnamed prior claim — the complication the morning must resolve'; 'nearer in the legal queue than Boaz'; 'unnamed here — only \"a redeemer nearer than I\"'); Significant Absence in Scene 3 ('The nearer redeemer is not named'); carried forward from P07 R5"
    },
    {
      "id": "R8",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0135 Chai-YHWH-Oath-Formula at 3:13 (P20); the P03 self-curse forward note (P03 R4, R11) not borne out",
      "note": "REQUIRED keep-image. Boaz binds the night's promise with the oath 'as YHWH lives' (חַי יְהוָה), naming YHWH. The oath stays INTIMATE, not ceremonial: its weight is carried by the fixed formula and its figure (Section 1, on the P03 precedent). It is not the self-curse formula of 1:17 ('may YHWH do thus to me and worse', FIG_0075): the P03 forward note that the self-curse recurs at 3:13 (P03 R4, R11) is not borne out by this map, and the 3:13 oath must not be turned into the 1:17 formula.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0135 active at Proposition 20); Section 4 Proposition 20 ('By what formula? — as YHWH lives'); Section 1 Metadata multi-level register tagging ('The oath at v.13 (\"as YHWH lives\") stays INTIMATE rather than ceremonial, on the P03 precedent for Ruth's own oath: its weight is carried by the fixed formula and its figure'); Section 2.4 ('It binds the night's promise under the chai-YHWH oath')"
    },
    {
      "id": "R9",
      "kind": "CROSS_PERICOPE_PAIRING_CLOSED_HERE",
      "applies_to": "FIG_0140 Reverse-Pattern-Handoff at 3:13 (P18, P19) — the reverse of P08's FIG_0122 handoff (3:4); Ruth speaks past the plan at 3:9 and the narrator does not mark it",
      "note": "PREFERRED keep-image. Cross-pericope pair closes here: the plan said the man would tell her what to do (3:4, FIG_0122); instead Ruth tells him (3:9) — and now he passes the next move to the morning (3:13). The narrator does not mark the breach — her speech simply takes the plan's place. The reconstructor must not add any comment, praise, or blame on Ruth's speaking past the plan.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0140 '(the mirror of P08's handoff: the plan said he would tell her; she told him — and now he passes the next move to the morning)'); Section 2.4 ('the handoff-pattern reverses — the plan said he would tell her, and she tells him'); Significant Absence in Scene 2 ('Ruth does not wait for the man to tell her what to do, though that is what the plan promised; the narrator does not mark the breach — her speech simply takes the plan's place'); P08 map Section 5B (FIG_0122 'the reverse lands at P09, where she tells him')"
    },
    {
      "id": "R10",
      "kind": "FIGURE_FIRST_OCCURRENCE",
      "applies_to": "FIG_0130 Vayyecherad at 3:8 (P5); FIG_0141 Heart-Good-After-Meal at 3:7 (P2); FIG_0139 Lie-Down-Authority-Transfer at 3:13 (P21)",
      "note": "Three single-pericope keep-images. PREFERRED (FIG_0130): at half of the night the man trembles (וַיֶּחֱרַד) and twists — the startle's force kept whole. OPTIONAL (FIG_0141): 'his heart was good' after eating and drinking, the satisfied-after-eating idiom. PREFERRED (FIG_0139): 'lie down until the morning' (3:13d) stays its own instruction, apart from 'lodge the night' (3:13a); the two are separate moments.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 5B Figure Flags (FIG_0130 '(the startle's force kept whole)'; FIG_0141 '(the satisfied-after-eating idiom; optional keep)'; FIG_0139 active at Proposition 21); Section 4 Propositions 2, 5, 18 and 21"
    },
    {
      "id": "R11",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "CEREMONIAL blessing form at 3:10a (P11) inside the INTIMATE exchange; FIG_0137; CB_0008",
      "note": "Boaz's first word back is a blessing in set, weighty form — 'blessed are you of YHWH, my daughter' (FIG_0137) — declared CEREMONIAL at moment level (3:10a). The night's request is answered first with blessing; the blessing must read as ceremonial against the whispered exchange around it, and then the talk settles back to intimate.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 1 Metadata multi-level register tagging ('One moment inside it lifts to CEREMONIAL: Boaz's blessing at v.10 (\"blessed are you of YHWH, my daughter\") takes the set, weighty blessing form'); Section 3C Scene 3 (CB_0008 'Boaz's first word back — the night's request answered first with blessing; lifts to a ceremonial key'); Section 5B Figure Flags (FIG_0137 active at Proposition 11); MEANING_COORDINATES register_overrides.moment_level (3:10a CEREMONIAL)"
    },
    {
      "id": "R12",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "INTIMATE register across Scenes 2-3 (vv.8-13); the v.13 oath stays INTIMATE",
      "note": "Scenes 2 and 3 shift to INTIMATE: a man and a woman speaking in whispers in the dark, at midnight, alone at the floor — the most private exchange in the book, with no witness to what is asked or answered. Declared at scene level on S2 and S3. The oath at v.13 stays INTIMATE rather than ceremonial. Scene 1 is the narrator's plain telling.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 1 Metadata multi-level register tagging ('Scenes 2 and 3 shift to INTIMATE: a man and a woman speaking in whispers in the dark, midnight, alone at the floor — the most private exchange in the book'); Section 3B Scene 2 (PL6 'total privacy — no witness to what is asked or answered'); Section 3B Scene 3 (PL6 'the privacy that lets the law be spoken gently'); MEANING_COORDINATES register_overrides.scene_level (S2 INTIMATE, S3 INTIMATE)"
    },
    {
      "id": "R13",
      "kind": "NAMING_SHIFT",
      "applies_to": "Boaz 'the man' at 3:8-9 (P5, P7); Ruth 'a woman' (P6) then 'Ruth your servant' by her own mouth (P8); 'my daughter' twice in Boaz's mouth (P11, P14); 'a woman of worth' (P15)",
      "note": "At the startle Boaz is named only 'the man' (הָאִישׁ), and his name rests until his answer; he finds 'a woman' at the place of his feet and has not been told who she is. Ruth names herself — 'Ruth your servant'. In his answer Boaz calls her 'my daughter' twice (3:10, 3:11) — the same address Naomi uses — and 'a woman of worth' before the gate of his people. The shifts should stay audible; the man does not know who she is until she names herself.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 3A Scene 2 (B13 'not yet told who she is; named only \"the man\" at the startle'; '\"the man\" at v.8; Boaz's name rests until his answer'; B9 '\"a woman\" to the startled man; then by her own mouth, \"Ruth your servant\"'); Section 3A Scene 3 (B9 'addressed twice as \"my daughter\" — the same address Naomi uses'; '\"my daughter\" in Boaz's mouth; \"a woman of worth\" (eshet chayil) before the gate of his people'); Section 4 Propositions 5-8, 11, 14 and 15"
    },
    {
      "id": "R14",
      "kind": "DISCOURSE_THREAD_OPENED",
      "applies_to": "T2 line-and-redemption thread: the redeemer word enters Ruth's mouth at 3:9 (P10) and the redeemer queue opens at 3:12 (P16, P17, P19); T4 hesed thread, third station at 3:10 (P12)",
      "note": "Two threads turn here. T2 (line and redemption; P05 R8, P07 R12): the word redeemer (גֹאֵל), withheld through the plan — P08 called Boaz only 'our kinsman' — is spoken at last by Ruth, in the dark, as the reason for her request ('you are a redeemer'). Boaz owns the role ('truly I am a redeemer'), discloses a nearer one, and the redeem-word runs through the morning's protocol, redeem upon redeem. It should stay the redeemer word, not fall back to 'kinsman' or 'relative'. The passage's held breath is the gap between 'you are a redeemer' and 'there is a redeemer nearer than I'; the legal question it opens is handed to the gate. T4 (hesed): the thread's third station (1:8, 2:20, 3:10), where Boaz measures her last hesed against the first.",
      "required_in_audit": true,
      "source_in_meaning_map": "Section 2.2 ('The word redeemer, withheld through the plan (P08 called him only \"our kinsman\"), is spoken at last — by Ruth, in the dark, as a claim'); Section 2.3 ('The held breath of the passage is the gap between \"you are a redeemer\" and \"there is a redeemer nearer than I.\"'); Section 2.4 ('It puts the word redeemer in Ruth's mouth for the first time and immediately complicates it with the nearer redeemer, opening the legal question the gate scene will resolve'); Section 3C Scene 2 (CB_0001 'the word the plan withheld, spoken at last — by Ruth, as the reason for her request'); Section 3C Scene 3 (CB_0001 'the redeem-word then runs through the morning protocol, redeem upon redeem'); Section 5A Concept Flags (CB_0001 'the word enters Ruth's mouth at 3:9; the queue opens at 3:12'; CB_0011 'the thread's third station: 1:8, 2:20, 3:10'); carried forward from P05 R8"
    },
    {
      "id": "R15",
      "kind": "WITHHELD_PAIRING_PER_SOURCE_DISCIPLINE",
      "applies_to": "Boaz's pledge at 3:11-13 (P14, P19, P20) — to the redeeming, not to the marriage; which redeemer the morning will give her left open (P19, both branches)",
      "note": "Boaz does not say yes to the marriage itself — his pledge is to the redeeming, with the queue honored first, and what he wants is never said apart from what is right. The passage leaves open which redeemer the morning will give her: if the nearer redeemer redeems her, good, let him redeem; if he does not want to, Boaz himself will redeem her. The reconstructor must not have Boaz promise to marry her, must not give Boaz wishes or feelings the text does not give, must keep both branches of the morning's protocol, and must not say or hint which redeemer will act.",
      "required_in_audit": true,
      "do_not_decide": true,
      "carries_forward_to": "P11_audit",
      "source_in_meaning_map": "Significant Absence in Scene 3 ('Boaz does not say yes to the marriage itself — his pledge is to the redeeming, with the queue honored first; what he wants is never said apart from what is right'); Section 2.1 ('the question it leaves hanging is which redeemer the morning will give her'); Section 2.4 ('the unresolved queue of redeemers the morning must sort'); Section 3D Scene 3 (TM_NIGHT_UNTIL_MORNING 'the night that holds them, and the morning that will decide'); Section 4 Proposition 19 ('If he redeems her? — good — let him redeem'; 'If he does not want to redeem her? — Boaz himself will redeem her')"
    },
    {
      "id": "R16",
      "kind": "CROSS_OCCURRENCE_INTRA_PERICOPE",
      "applies_to": "CB_0042 Uncover-Feet-Margelot at 3:7 (P4) and 3:8 (P6); the night's modesty (Scene 2 and Scene 3 absences)",
      "note": "The place of his feet (מַרְגְּלֹתָיו) is uncovered at 3:7 — the covering folded back from his feet, softly, while he sleeps — and at 3:8 he finds a woman lying there. What the uncovering and the lying-down mean beyond themselves is never said; the text keeps the night's modesty. No word of love or desire is spoken by either of them, and the narrator marks no touch beyond the uncovering; the night passes in words. The reconstructor must not say or suggest what the uncovering and the lying-down mean beyond the acts themselves, must add no word of love or desire, must add no touch and no act between them beyond those the text tells, and must not add a verdict of its own on what did or did not happen in the dark.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Section 3C Scene 1 (CB_0042 'to uncover it is to fold the covering back from his feet'; 'the act the plan ordered, now done — softly, while he sleeps'); Section 5A Concept Flags (CB_0042 active at Propositions 4 and 6); Significant Absence in Scene 2 ('What the uncovering and the lying-down mean beyond themselves is never said; the text keeps the night's modesty. And no word of love or desire is spoken by either of them'); Significant Absence in Scene 3 ('the narrator marks no touch beyond the uncovering, and the night passes in words')"
    },
    {
      "id": "R17",
      "kind": "STRUCTURAL_FRAMING_DEVICE",
      "applies_to": "Scene 1 (3:6-7, P1-P4) told by the narrator without a word spoken; Ruth's intent beyond the plan and the risk left unsaid",
      "note": "Scene 1 is the narrator's plain telling: Ruth goes down and does all that her mother-in-law commanded; Boaz eats, drinks, and lies down, and does not yet know she is there; she comes softly, uncovers the place of his feet, and lies down. No word is spoken in the whole scene; the night holds its breath. The narrator does not say what Ruth intends beyond the plan and does not name the risk. The reconstructor must add no speech and no inner thoughts to Scene 1, must not state what Ruth intends beyond carrying out the plan, and must not name or describe the risk.",
      "required_in_audit": true,
      "do_not_decide": true,
      "source_in_meaning_map": "Significant Absence in Scene 1 ('The narrator does not say what Ruth intends beyond the plan, and does not name the risk. No word is spoken in the whole scene; the night holds its breath'); Section 1 Metadata ('Scene 1 is the narrator's plain telling'); Section 3A Scene 1 (B13 'he does not yet know she is there'); Section 3F Scene 1 ('the man asleep by his grain, the woman at his feet, and nothing yet said')"
    }
  ],
  "cross_pericope_pair_verification": {
    "pairs": [
      {
        "fig_id": "FIG_0011",
        "opens_at": "P06 P9 (2:12 Boaz blesses her under the wings of YHWH)",
        "closes_at": "P09 P9 (3:9 'spread your wing over your servant'; FIG_0131)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R1). P06 opened it (P06 R1) and recorded the forward link on its P9 cross_ref; it lands at P09 P9, where the MEANING_COORDINATES flags FIG_0131 (the request's own code) with CB_0037. Verified across the two codes: FIG_0011 is the pair, FIG_0131 its second half. Registry frontmatter confirms opens-at P06 / closes-at P09 (P09:3:9)."
      },
      {
        "fig_id": "FIG_0132",
        "opens_at": "P06 P11 (2:13 shifchah)",
        "closes_at": "P09 P8 (3:9 'Ruth your servant' with amah)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R2). P06 opened it (P06 R2); it lands at P09 P8, where the MEANING_COORDINATES flags FIG_0132 with the referential form RUTH_YOUR_SERVANT_AMAH. Registry frontmatter confirms opens-at P06 / closes-at P09 (P09:3:9)."
      },
      {
        "fig_id": "FIG_0111",
        "opens_at": "P07 P11 (2:20 hesed not forsaken)",
        "closes_at": "P09 P12 (3:10 'you have made your last hesed better than the first')",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R4). P07 opened it (P07 R3) and left its row PENDING for this register; it lands at P09 P12, flagged with FIG_0133 and CB_0011. The 2:20 question — whose hesed, YHWH's or the man's — stays open (P07 R3, P09 R4). Registry frontmatter confirms opens-at P07 / closes-at P09."
      },
      {
        "fig_id": "FIG_0134",
        "opens_at": "P05 P1 (2:1 Boaz a man of worth, ish gibbor chayil; FIG_0090, CB_0032)",
        "closes_at": "P09 P15 (3:11 Ruth a woman of worth, eshet chayil)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R6). P05 opened it (P05 R1, R7) and deferred the check to P09; it lands at P09 P15, flagged with CB_0032. Registry frontmatter confirms opens-at P05 / closes-at P09 (P09:3:11). The CB_0032 half is recorded in known_limitations."
      },
      {
        "fig_id": "FIG_0123",
        "opens_at": "P08 P9 (3:5 Ruth to Naomi, 'all that you say I will do')",
        "closes_at": "P09 P14 (3:11 Boaz to Ruth, 'all that you say I will do for you'; FIG_0136)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R5), on the two maps and MEANING_COORDINATES: the P08 MC flags FIG_0123 at P9, the P09 MC flags FIG_0123 and FIG_0136 at P14. P08's own register is still the skeleton, so the opening half has no P08 entry yet."
      },
      {
        "fig_id": "FIG_0122",
        "opens_at": "P08 P8 (3:4 'he will tell you what you shall do')",
        "closes_at": "P09 P18-P19 (3:13 the next move handed to the morning; FIG_0140)",
        "verification_status": "VERIFIED",
        "note": "Pair closed at this register (R9), on the two maps and MEANING_COORDINATES: the P08 MC flags FIG_0122 at P8, the P09 MC flags FIG_0140 at P18 and P19. The FIG_0122 registry note names the reverse 'FIG_0124', which does not exist; the P08 and P09 maps and the FIG_0140 note name FIG_0140, and the maps govern. P08's own register is still the skeleton."
      },
      {
        "fig_id": "FIG_0112",
        "opens_at": "P07 P12 (2:20 close to us)",
        "closes_at": "P11 (4:1-6); middle station at P09 P17 (3:12 'a redeemer nearer than I')",
        "verification_status": "PENDING",
        "note": "Middle station verified here (R7): the P09 MEANING_COORDINATES flags FIG_0112 at P17 with FIG_0138. The pair closes at P11 (registry closes-at P11); full verification lands at P11's register."
      }
    ]
  },
  "validation_checklist": {
    "meaning_map_contains_only_story_content": true,
    "meaning_coordinates_contains_only_inference_signal": true,
    "every_proposition_has_cb_flags_and_figure_flags": true,
    "no_grammatical_frame_slot_names": true,
    "speech_act_present_on_all_component_records": true,
    "speech_act_values_used": [
      "ASKS_INFORMATION_SEEKING_QUESTION",
      "DIRECTS_HEARER_NOT_TO_DO",
      "DIRECTS_HEARER_TO_DO",
      "INVOKES_DIVINE_AS_OATH_GUARANTOR",
      "STATES_AS_TRUE",
      "VOWS",
      "WISHES_FOR_HEARER"
    ],
    "discourse_threads_tracked_in_audit_only": true,
    "known_limitations_tracked_in_audit_only": true,
    "high_risk_register_complete": true,
    "every_high_risk_entry_traces_to_meaning_map": true,
    "no_content_added_beyond_meaning_map": true,
    "registry_additions_extracted_to_bcd_delta": true,
    "no_reviewer_facing_prompts_in_compilation_log": true
  },
  "known_limitations": [
    "Mechanized ruled log (SC-0064 close part 2): the judgment half was machine-drafted (SC-0063) and reviewer-ruled; vocabulary_additions are assembled from this pericope's per-axis ruling-logs.",
    "The high-risk register audit was drafted under SC-0086 (proposed) on 2026-09-24: 17 entries (7 do_not_decide) traced to the P09 map, with the carried-forward held-open items (P06 R1, P07 R3, P07 R5) also citing their source registers and maps; pending Marcia's entry-by-entry ruling (P09-D4).",
    "Propositions stay at meaning-map granularity; multi-event propositions decompose in-slot per the granularity contract.",
    "CB_0032 Chayil cross-pericope pair (opened at P05 2:1; P05 known_limitations and P05-D15 deferred it to P09 3:11) closes here with FIG_0134 at P15 (R6).",
    "CB_0020 / FIG_0075 (the self-curse oath formula): the P03 forward note (P03 R4 and R11, P03 known_limitations, and the P04 and P05 FIG_0075 rows) that the formula recurs at 3:13 is not borne out. The P09 map carries FIG_0135 'as YHWH lives' at 3:13 (P20) and neither FIG_0075 nor CB_0020. Recorded here as not borne out (R8); the P03, P04 and P05 entries are left as they are.",
    "P08's register is still the skeleton: the openers of FIG_0122 (P08 P8) and FIG_0123 (P08 P9) have no P08 entries yet, and P09's register was drafted ahead of P08's. The P09 closes (R5, R9) stand on the two maps and MEANING_COORDINATES.",
    "FIG_0138's registry note names CB_0045 Nearer-Redeemer (CANDIDATE, first appearance P09) as its related concept; the P09 map flags CB_0001 at Proposition 17 and not CB_0045, and the register follows the map.",
    "The P09 MEANING_COORDINATES carries no cross_ref on the pair propositions (P8, P9, P12, P14, P15, P17, P18, P19); adding them waits for Marcia's ruling."
  ]
}
```
