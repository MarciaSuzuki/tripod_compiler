# SC-0071 — Phase 3 (the triage residue) — calibration sheet

> **Status: RULED + APPLIED 2026-06-20 (compiler + vault pair on branch — Evaluator application-verify +
> Marcia's merge word pending).** Marcia ruled (after the Evaluator's draft-verify): §D1 keep · §D5 keep the
> preserve_form pair as-is · §D6 + the form-side decompose to governed verbs · §D4 resolve-to-form (J03→YHWH,
> P07→NAOMI, J05→YHWH + an explicit `NAMING_SHIFT` note in the J05 CL per §B). See [`SC-0071-APPLY-RECORD.md`](SC-0071-APPLY-RECORD.md).
> The last content-cleanup phase of the sentence-token triage ([[tripod-sentence-token-triage]]). R1
> (SC-0067, surface forms) · R2 (SC-0069, speech words) · the slot-name rename (SC-0070) are MERGED. This
> sheet enumerates the **residue** by value-shape — the **(c) structural `*_form` slots**, the **3 held R1
> values**, and the **action-axis / controlled-verb decompositions** (incl. the two P06 `preserve_form=true`
> clauses) — proposes a disposition per group, and surfaces the boundary calls. After ruling, it lands as one
> compiler+vault pair. After this, only **Phase 4** (the automatable value-shape guard) remains.

> **SC-ID:** SC-0071 (reconfirmed 2026-06-20 vs `SPEC_CHANGES.md` highest = SC-0070, 0 open PRs). The
> oral-pipeline Stage 2 also wants a number — **binding allocation at apply**. **Floor:** compiler main
> `9922038` · vault main `3583f10`.

## 0. The principle for Phase 3

R1/R2/SC-0070 removed prose that had a structural home elsewhere (surface forms → the bare form; speech words
→ the map; role names → event-participant names). Phase 3 is the **residue that has no cleaner phase**: values
that are *structural encodings* (keep — they ARE the supervision) vs *narrated prose clauses* (decompose to a
controlled verb + structured slots) vs *transitions/patterns* (resolve to the form + relocate the observation).
**The `preserve_form=true` gate governs throughout: a value whose element mandates exact wording is KEPT /
relocated to a preserved slot, never normalized away.**

---

## §A — The (c) structural `*_form` slots (12 keys / ~17 occ)

The non-referential `*_form` keys routed to Phase 3 by SC-0067 §10D (the `*referential_form` family is R1-done;
the (a) surface-address forms are R1-done; (b) speech-forms are R2-done). Split by whether the value encodes
**load-bearing structure** (keep) or a **narrated clause** (decompose).

### A1 — KEEP (load-bearing structural encoding; several carry a CL keep-image) — recommend
| key | value | why keep | pericope |
|---|---|---|---|
| `vow_structural_form` | SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL | CL **REQUIRED keep-image** (the six-step ladder); names the structure the 6 components realize | P03 |
| `matched_action_form` (4) | I_WILL_GO · I_WILL_LODGE · I_WILL_DIE · I_WILL_BE_BURIED | **R2 §E already ruled KEEP** (the matched-pairing parallel; CL keep-image) | P03 |
| `binding_indefinite_place_form` (3) | WHERE_YOU_GO · WHERE_YOU_LODGE · WHERE_YOU_DIE | **R2 §E ruled KEEP** (the protasis half of the pairing) | P03 |
| `listing_order_form` | CHILDREN_BEFORE_HUSBAND_REVERSE_NATURAL_ORDER | CL keep-image (the reverse-natural-order is the point, Ruth 1:5) | P01 |
| `report_variation_form` | YOUNG_MEN_NOT_YOUNG_WOMEN | the load-bearing contrast (Boaz said young men; 2:21) — a figure | P07 |
| `duration_form` | THREE_DAYS_AND_THREE_NIGHTS | bounded measure (Jonah 1:17); exact, not prose | J02 |

### A2 — BOUNDARY — decompose-or-keep (her call)
| key | value | the question | pericope |
|---|---|---|---|
| `binding_demonstrative_place_form` | THERE_DEMONSTRATIVE_LINKING_TO_DEATH_PLACE | the analytic tail (`_DEMONSTRATIVE_LINKING_TO_DEATH_PLACE`) — bare to `THERE`, or keep as the vow's 6th rung marker? | P03 |
| `acquired_from_form` | FROM_THE_HAND_OF_NAOMI | a participant-ish source (the field acquired from Naomi) — keep, or restructure to a participant slot? | P12 |
| `attestation_form` | SANDAL_DRAWN_OFF | the sandal-custom attestation (Ruth 4:7) — keep as the custom marker, or decompose (it duplicates the `DREW_OFF_SANDAL` action, §C)? | P11 |
| `movement_form` | STAIRCASE_DOWN_THRONE_TO_ASHES | a narrated movement (the king, Jonah 3:6) — **decompose** (recommend) to a movement encoding, or keep? | J04 |
| `tie_form` | RUTH_WAS_WITH_HIS_YOUNG_WOMEN | a narrated state-clause (Ruth 2:23) — **decompose** (recommend) to action + participants, or keep? | P08 |
| `resulting_relation_form` | BECAME_HIS_WIFE | a narrated result-clause (Ruth 4:13) — **decompose** (recommend) to a relation encoding, or keep? | P13 |

### A3 — the two `question_form` analytic metas + `compliance_form` (bin-1 commentary boundary)
`question_form`: DOUBLED_WHERE_AND_WHERE_WORKED · RHETORICAL_PROMISE_QUESTION · RHETORICAL_RECOGNITION_QUESTION
(P07/P08) — R2 KEPT these as §F analytic (not speech words). `compliance_form`: ALL_AS_COMMANDED (P09, narration
"she did all as commanded"). **These characterize/narrate rather than encode structure** → relocate to a CL note
or keep as a coarse marker. Recommend: **relocate the question_form metas to a note** (they describe the
question's form, not its content); **keep `compliance_form`** (a clean compliance marker). Her call.

---

## §B — The 3 held R1 values (transitions / patterns, not single forms)

R1 (SC-0067 §2C/§2D) HELD these — each describes a *transition* or a *cross-text pattern*, not one referring
expression. Located at the scene level (`beings_in_scene.referential_form`).

| value | pericope | what it is | proposed disposition |
|---|---|---|---|
| `ELOHIM_TO_YHWH_SHIFT` | J05 | a divine-name **transition** (Elohim→YHWH across Jonah 4) | **decompose** — the alternation is already recorded across the slots that hold `ELOHIM`/`YHWH` (`appointer_referential_form`, `questioner_referential_form`); put the **actual name** at this slot and relocate the "shift" observation to the CL / `significant_absence`. *(boundary — or keep as a transition marker)* |
| `NAMED_THEN_ADDRESSED` | J03 | a **progression** (named, then addressed) | **resolve** to the form + note the progression; or keep |
| `ALTERNATES_MOTHER_IN_LAW_AND_NAOMI` | P07 | a cross-text **pattern** (alternates "her mother-in-law" / "Naomi") | **relocate** the pattern to a discourse-thread CL note; put the actual form at the slot. *(boundary)* |

> All three: the surface form they should carry already exists in the text; the held value is an *analysis* of
> how the naming moves. Recommend **resolve to the form + relocate the analysis to a note** — but each is a
> genuine boundary (keep-as-structural-marker is defensible), so they're surfaced, not auto-applied.

---

## §C — Action-axis / controlled-verb decompositions (~11 occ)

The `action` axis is **controlled** (SC-0024/0025), but several values are sentence-shaped clauses that slipped
the controlled-verb discipline (the triage's flagged "possible gap"; they sit in the validate **quarantine
watch** today, parked single-pericope). Decompose each to a **controlled verb + structured slots**.

### C1 — ⚠ THE CRUX: the two P06 `preserve_form=true` clauses (Ruth 2:13) — MUST preserve wording
| value | fidelity | disposition |
|---|---|---|
| `STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH` (P06 P11) | **`preserve_form=true`** | exact wording is mandated → **do NOT normalize away.** Either KEEP as-is, or decompose to `action: STATED` + a **preserved** content slot carrying the wording (with its `preserve_form=true` fidelity). **Surface — her call.** |
| `STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT` (P06 P11) | **`preserve_form=true`** | same — keep the wording |

> These are the load-bearing pair the Evaluator flagged in the R2 verify (the only two `preserve_form=true` in
> the corpus, on the action axis R2 excluded). Phase 3 is where they're handled — **preserving the wording is
> the hard constraint.** Recommend KEEP-as-is unless Marcia wants the action/content split.

### C2 — decompose (`preserve_form=false` — re-rendering licensed; words live in the map)
| value | → controlled verb + slots | pericope (verse) |
|---|---|---|
| `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE` | `action: WISHED` + the wage/refuge content (map-homed; drop per R2) | P06 (2:12) |
| `WISHED_YHWH_TO_REPAY_HER_WORK` | `action: WISHED` + structure | P06 (2:12) |
| `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` | `action: ASCRIBED` + the testimony structure | P04 (1:21) |
| `STATED_SELF_AS_FOREIGNER` | `action: STATED` + (self-id content map-homed) | P06 (2:10) |
| `STATED_THAT_HE_COMFORTED_HER` | `action: COMFORTED` (or STATED + content) | P06 (2:13) |

### C3 — BOUNDARY: short narrated compounds (keep as a clean action, or decompose?)
`TOOK_AS_WIFE` (P01) · `AROSE_TO_RETURN` (P02) · `SAT_ON_ASHES` (J04) · `DREW_OFF_SANDAL` (P11). Each is a
verb + a tight modifier. Recommend **keep** `TOOK_AS_WIFE` (a clean compound); **decompose** `AROSE_TO_RETURN`
(→ `AROSE` + purpose), `SAT_ON_ASHES` (→ `SAT` + place), `DREW_OFF_SANDAL` (→ `DREW_OFF` + object — and note it
duplicates `attestation_form: SANDAL_DRAWN_OFF`, §A2). Her call — this is the fuzziest boundary.

> **Drift-guard note:** decomposing to controlled verbs must land each new verb on the governed action axis
> (`approved-enumerations`) — i.e. the decomposition either reuses an approved verb or proposes one (a governed
> add), not a fresh prose token. The Phase-4 guard (below) then flags any future sentence-shaped action value.

---

## §D — What I need from Marcia

1. **§A1 keep** (vow forms, `listing_order_form`, `report_variation_form`, `duration_form`): confirm KEEP? *(recommend yes — structural / CL keep-image)*
2. **§A2 boundary** (`movement_form`/`tie_form`/`resulting_relation_form` decompose; `binding_demonstrative_place_form`/`acquired_from_form`/`attestation_form` keep-or-decompose): rule each.
3. **§A3** the `question_form` metas (relocate to a note?) + `compliance_form` (keep?).
4. **§B the 3 held values:** resolve-to-form + relocate-the-analysis (recommend), or keep as structural markers?
5. **§C1 the two `preserve_form=true` clauses:** KEEP as-is (recommend), or decompose to `action: STATED` + a preserved content slot?
6. **§C2 decompositions:** take the proposed controlled-verb decompositions?
7. **§C3 short compounds:** keep `TOOK_AS_WIFE`; decompose the other three?

## §E — Phase 4 (recorded; the next & final phase)

After Phase 3, the only remaining triage work is **Phase 4 — the automatable value-shape guard**: extend the
lint to flag a sentence-shaped `UPPER_SNAKE` value in any non-referential slot (the action-axis prose, the
narrated-clause forms), with the blessed allow-list (the kept structural forms, the `preserve_form=true` slots).
It reads the FM `preserve_form` flag (never flags a mandated-wording value) and the settled vocabulary this
triage defines. Built last, bite-proven — the make-impossible close of the whole triage.
