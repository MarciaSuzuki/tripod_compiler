# VOCABULARY_LOG — approved-enumerations promotion log

Append-only log of promotions into `_spec/approved-enumerations.json` (the growing registry of
**approved convergent** bounded-open values). The mechanism is established by **SC-0006** in
`SPEC_CHANGES.md`; routine per-pericope promotions are recorded here (not as a new SC each time).

How a promotion works:
1. `tripod validate <FOR_MODEL>` surfaces **convergent** drift (review-signal); `tripod propose-vocabulary`
   lists the values as candidate `vocabulary_additions`.
2. **Gate-F review:** the reviewer flips each approved value `PROPOSED → CONFIRMED` in the pericope's
   **COMPILATION-LOG** `vocabulary_additions`. The review *is* the status flip.
3. `tripod promote <COMPILATION-LOG> --apply` (default `--status CONFIRMED`) grows the registry
   (provenance-stamped) with the CONFIRMED values and appends a line below.
4. **Re-pin** the registry: re-vendor + update the sha256 in `_spec/pins.json` and the pin table in
   `SPEC_CHANGES.md`. `tripod check-drift` then enforces the new pin.

### Promotion policy — CONFIRMED-only (from P03 onward)
A value enters `approved-enumerations.json` **only after Gate-F review flips it `PROPOSED → CONFIRMED`** in
its COMPILATION-LOG; `tripod promote --apply` runs at the default `CONFIRMED` gate. `--status ANY` /
`--status PROPOSED` are **not** used to promote (the `promote` command warns if you override the gate).
**P02 is a documented, grandfathered exception** — promoted via `--status ANY` while its COMPILATION-LOG
still recorded `PROPOSED` (see the P02 entry below). It is not re-litigated; the policy applies from P03 onward.

Only convergent axes accumulate. As of **SC-0007** the COMPILATION-LOG feeds **every** convergent axis —
`proposition_kind`, `scene_kind`, `presence_value`, the L1-element axes (arc/context/tone/pace/
communicative_function), `discourse_thread_state`, and `high_risk_register_kind` — so all of them can converge.

---

## Promotions

- 2026-05-29 — **seed (SC-0006):** `approved-enumerations.json` v0.1 seeded from the convergent axes
  of canonical P01 (`proposition_kind`×10, `scene_kind`×3, `presence_value`×3, `arc_element`×5,
  `context_element`×7, `tone_element`×5, `pace_element`×2, `communicative_function_element`×6,
  `discourse_thread_state`×5, `high_risk_register_kind`×16). All tagged `approved_in: P01`.
- 2026-05-30 — **P02 (`P02-Ruth-1-6-14-COMPILATION-LOG`) — grandfathered exception:** promoted **41
  convergent values** at the project lead's direction (`promote --status ANY`; P02's CL recorded them as
  `PROPOSED`). This is the one-time exception to the CONFIRMED-only policy adopted from P03 onward. Registry
  `v0.1 → v0.2`, re-pinned. By axis: `proposition_kind`×14, `scene_kind`×3, `arc_element`×6,
  `tone_element`×4, `pace_element`×2, `communicative_function_element`×7, `high_risk_register_kind`×5.
  All tagged `approved_in: P02`. **Result: P02 FOR_MODEL now validates with 0 convergent drift**
  (was 37) — the SC-0006 + SC-0007 payoff on real vendored data. (`presence_value`, `context_element`,
  `discourse_thread_state`: P02 introduced no new values.)
- 2026-05-30 — **P03 (`P03-Ruth-1-15-18-COMPILATION-LOG`) — first CONFIRMED-only promotion:** Gate-F review
  flipped P03's **27 convergent values** `PROPOSED → CONFIRMED` in its COMPILATION-LOG (L1-element slots
  recorded as CONFIRMED; the gold `proposition_kinds`/`scene_kinds` flipped to CONFIRMED), then
  `promote --apply` at the **default `CONFIRMED` gate** (no `--status` override). Registry `v0.2 → v0.3`,
  re-pinned. By axis: `proposition_kind`×5, `scene_kind`×3, `arc_element`×5, `context_element`×2,
  `tone_element`×4, `pace_element`×3, `communicative_function_element`×5. All tagged `approved_in: P03`.
  **Result: P03 FOR_MODEL now validates with 0 convergent drift** (was 27).
- 2026-05-30 — **P04–P06 batch (CONFIRMED-only):** Gate-F review recorded each pericope's convergent
  values as `CONFIRMED` in its COMPILATION-LOG (P06's log had none recorded — all added), then
  `promote --apply` at the **default `CONFIRMED` gate**, one pericope at a time:
  - **P04** (`P04-Ruth-1-19-22`): 31 promoted (prop ×6, scene ×3, presence ×1, arc ×6, context ×2, tone ×4, pace ×3, comm-func ×6).
  - **P05** (`P05-Ruth-2-1-7`): 33 promoted (3 already approved — shared with P04).
  - **P06** (`P06-Ruth-2-8-16`): 40 promoted (3 already approved).
  Registry `v0.3 → v0.4`, re-pinned. **Result: the full Ruth pilot corpus (P01–P06) now validates with
  0 convergent drift** — controlled-vocabulary convergence complete for the pilot. (Descriptive/open
  axes remain per-pericope, by design.)
- 2026-06-03 — **SC-0021 vocabulary consolidation (tone/pace triage promotion):** the corpus-independent
  triage (vault `tripod_cleanup_log.md`) locus-stripped the L1 mood axes and unified `NARROW → NARROWS`;
  this promotes the 11 resulting convergent bares. By axis: `tone_element`×3 (`RISING` P03, `STILLED` P04,
  `URGENT` P02), `pace_element`×8 (`BRISK` P02, `SLOWED` P02, `PAUSED` P03, `NARROWS` P03, `RISES` P04,
  `SETTLES` P04, `HOLDS` P05, `WIDENS` P05). All `sc_ref: SC-0021`; `approved_in` = each value's first-seen
  pericope. Registry `v0.4 → v0.5`, re-pinned. COMPILATION-LOG `vocabulary_additions` tone/pace re-pointed
  to the bares (SC-0007 intake invariant — each CL declares exactly its `approved_in` set). **Result:
  P01–P06 validate with 0 tone/pace convergent drift.** (Old locus values left as orphaned-historical in
  the registry; a deprecation sweep is a separate later pass — done in SC-0022 below.)
- 2026-06-04 — **SC-0022 consolidation — promote (reuse-dependent triage):** promoted **56 cleaned
  bounded-open values** (the collapsed reusable types from the scene_kind/proposition_kind/
  communicative_function triage). By axis: `scene_kind`×13, `proposition_kind`×27,
  `communicative_function_element`×16. All `sc_ref: SC-0022`; `approved_in` = each value's first-seen
  pericope; provenance = FOR_MODEL (mirrors SC-0021). Re-derived from live `validate` drift (106 instances).
  COMPILATION-LOG `vocabulary_additions` scene/prop/comm-func re-pointed to the cleaned values (SC-0007
  intake invariant; P02 stays the grandfathered PROPOSED exception). Registry `v0.5 → v0.6`, re-pinned.
  **Result: P01–P06 validate with 0 scene/prop/comm-func convergent drift.**
- 2026-06-04 — **SC-0022 consolidation — enforce beings `role_in_scene` (axis reclassification):** added the
  new **convergent** axis `role_in_scene_being`, seeded with the **21 ruled relations** (kinship HUSBAND/WIFE/
  WIDOW/MOTHER_IN_LAW/SON/DAUGHTER_IN_LAW/KINSMAN/ANCESTOR/CLAN/REDEEMER_KIN/PEOPLE; DIVINE_AGENT; activity
  GLEANER/FIELD_OWNER/FOREMAN/HARVESTERS/FEMALE_WORKERS/MALE_WORKERS/TOWNSPEOPLE; referenced SOURCE_GROUP/
  ERA_REFERENT). `sc_ref: SC-0022`; `approved_in` = first-seen pericope. The participant-role slot is now
  ENFORCED — a 22nd relation drifts (review signal). New CL intake `role_in_scene_beings`. Registry
  `v0.6 → v0.7` (+ `validation-rules v0.7 → v0.8`, seed-key rename), re-pinned. Governed axis change —
  recorded as SC-0022 in SPEC_CHANGES.md, not a routine promotion.
- 2026-06-04 — **SC-0022 consolidation — deprecate (delete orphaned values):** removed **133 superseded
  values** unused by any pericope — `scene_kind` 33→16, `proposition_kind` 89→35,
  `communicative_function_element` 56→16, `tone_element` 26→17, `pace_element` 24→11 (the locus-stripped
  tone/pace forms SC-0021 left, incl. `NARROW` unified into `NARROWS`). Each verified unused (no FOR_MODEL,
  no COMPILATION-LOG) before removal. Registry `v0.7 → v0.8`, re-pinned. The registry is now exactly the
  cleaned canonical set; the old→new mapping lives in `tripod_cleanup_log.md` + git history (Marcia ruled
  delete over a deprecated-flag crosswalk). **Result: reusing a deprecated old form now drifts.**
- 2026-06-04 — **SC-0023 un-settle (quarantine correction):** **removed 8** `communicative_function_element`
  values from the approved set — the used-once coin-flips `TRANSMITS`/`ANSWERS`/`PLACES`/`ANCHORS`/
  `INTRODUCES`/`POSITIONS`/`DISTRIBUTES`/`RECITES` that SC-0022 erroneously promoted as settled. They move
  to the new pinned `quarantined-vocabulary.json` (`0.1.0`). Registry `v0.8 → v0.9` (comm-func approved 16 → 8
  recurring), re-pinned. The validator now surfaces each use as a `quarantined` notice and a recurrence (≥2
  pericopes) as an explicit RECURS in the corpus quarantine watch; `promote` skips quarantined values. **A
  quarantined value is no longer a settled type — its recurrence in P07–P14 is the revisit signal.** (Lifting
  a value OUT of quarantine — promote or collapse — is a future governed decision, logged here when it happens.)
- P08-COMPILATION-LOG: promoted 6 value(s) [scene_kind:CONSENT_SCENE, role_in_scene_being:PLANNER, arc_element:REST_SEEKING_INITIATIVE, arc_element:NIGHT_PLAN_INSTRUCTION, arc_element:INITIATIVE_HANDOFF, arc_element:TOTAL_CONSENT] → _spec/approved-enumerations.json (SC-0063)
- P07-SC-0064-B1-RULING-LOG: promoted 1 value(s) [action:TOOK] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-B1-RULING-LOG: promoted 2 value(s) [action:UNCOVERED_FEET, action:LAY_DOWN] → _spec/approved-enumerations.json (SC-0064)
- P11-SC-0064-B1-RULING-LOG: promoted 2 value(s) [action:DREW_OFF_SANDAL, tone_element:PROCEDURAL] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-B1-RULING-LOG: promoted 1 value(s) [tone_element:IRONIC] → _spec/approved-enumerations.json (SC-0064)
- J04-SC-0064-B1-RULING-LOG: promoted 5 value(s) [action:AROSE, action:REMOVED_ROBE, action:DONNED_SACKCLOTH, action:SAT_ON_ASHES, tone_element:WONDER_UNDERSTATED] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-B1-RULING-LOG: promoted 1 value(s) [tone_element:HEATED] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-PROPKIND-A-RULING-LOG: promoted 2 value(s) [proposition_kind:ASKED, proposition_kind:PROPOSED] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-PROPKIND-A-RULING-LOG: promoted 1 value(s) [proposition_kind:LAY_DOWN] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-PROPKIND-A-RULING-LOG: promoted 1 value(s) [proposition_kind:AFFIRMED_RESOLVE] → _spec/approved-enumerations.json (SC-0064)
- J01-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:WORD_OF_YHWH_CAME] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:QUESTIONED] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:INTERROGATED] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:WENT_DOWN] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:DESCENDED] → _spec/approved-enumerations.json (SC-0064)
- P07-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:MEASURED] → _spec/approved-enumerations.json (SC-0064)
- P10-SC-0064-PROPKIND-B-RULING-LOG: promoted 1 value(s) [proposition_kind:MEASURED_OUT] → _spec/approved-enumerations.json (SC-0064)
- P12-SC-0064-PROPKIND-C-RULING-LOG: promoted 1 value(s) [proposition_kind:NAME_PRESERVED] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-PROPKIND-C-RULING-LOG: promoted 2 value(s) [proposition_kind:ANGER_KINDLED, proposition_kind:CREED_RECITED] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-PROPKIND-C-RULING-LOG: promoted 2 value(s) [proposition_kind:SEA_STILLED, proposition_kind:STORM_AROSE] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-PROPKIND-C-RULING-LOG: promoted 1 value(s) [proposition_kind:CAST_INTO_DEEP] → _spec/approved-enumerations.json (SC-0064)
- P07-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 1 value(s) [proposition_kind:THRESHED] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 3 value(s) [proposition_kind:APPROACHED, proposition_kind:REASSURED, proposition_kind:TREMBLED] → _spec/approved-enumerations.json (SC-0064)
- P10-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 1 value(s) [proposition_kind:SHOWED] → _spec/approved-enumerations.json (SC-0064)
- P11-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 2 value(s) [proposition_kind:DECLINED, proposition_kind:PASSED_BY] → _spec/approved-enumerations.json (SC-0064)
- P12-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 1 value(s) [proposition_kind:ACQUIRED] → _spec/approved-enumerations.json (SC-0064)
- P13-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 1 value(s) [proposition_kind:BORE] → _spec/approved-enumerations.json (SC-0064)
- P14-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 2 value(s) [proposition_kind:FATHERED, proposition_kind:GENEALOGY_HEADER] → _spec/approved-enumerations.json (SC-0064)
- J01-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 2 value(s) [proposition_kind:EMBARKED, proposition_kind:FLED] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 10 value(s) [proposition_kind:ANSWERED, proposition_kind:APPOINTED, proposition_kind:CAST_LOTS, proposition_kind:CONFESSED, proposition_kind:FEARED, proposition_kind:HURLED, proposition_kind:PRAYED, proposition_kind:ROWED, proposition_kind:SWALLOWED, proposition_kind:WORSHIPED] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 4 value(s) [proposition_kind:BROUGHT_UP, proposition_kind:ENGULFED, proposition_kind:FORSOOK, proposition_kind:REMEMBERED] → _spec/approved-enumerations.json (SC-0064)
- J04-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 4 value(s) [proposition_kind:BELIEVED, proposition_kind:FASTED, proposition_kind:RELENTED, proposition_kind:VOMITED] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-PROPKIND-BULK-RULING-LOG: promoted 3 value(s) [proposition_kind:MADE_SHELTER, proposition_kind:REJOICED, proposition_kind:STRUCK] → _spec/approved-enumerations.json (SC-0064)
- P07-SC-0064-ROLE-RULING-LOG: promoted 1 value(s) [role_in_scene_being:DECEASED_KIN] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-ROLE-RULING-LOG: promoted 1 value(s) [role_in_scene_being:POTENTIAL_SUITORS] → _spec/approved-enumerations.json (SC-0064)
- P11-SC-0064-ROLE-RULING-LOG: promoted 5 value(s) [role_in_scene_being:WITNESSING_ELDERS, role_in_scene_being:CONVENER, role_in_scene_being:NEARER_REDEEMER, role_in_scene_being:REDEMPTION_OFFEROR, role_in_scene_being:SELLER] → _spec/approved-enumerations.json (SC-0064)
- P12-SC-0064-ROLE-RULING-LOG: promoted 1 value(s) [role_in_scene_being:WITNESSING_ASSEMBLY] → _spec/approved-enumerations.json (SC-0064)
- P13-SC-0064-ROLE-RULING-LOG: promoted 3 value(s) [role_in_scene_being:GRANDMOTHER, role_in_scene_being:LINEAGE_REFERENT, role_in_scene_being:TOWNSWOMEN] → _spec/approved-enumerations.json (SC-0064)
- P14-SC-0064-ROLE-RULING-LOG: promoted 1 value(s) [role_in_scene_being:LINE_TERMINUS] → _spec/approved-enumerations.json (SC-0064)
- J01-SC-0064-ROLE-RULING-LOG: promoted 1 value(s) [role_in_scene_being:PATRONYMIC_REFERENT] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-ROLE-RULING-LOG: promoted 4 value(s) [role_in_scene_being:FUGITIVE, role_in_scene_being:APPOINTED_CREATURE, role_in_scene_being:CREW, role_in_scene_being:SHIP_CAPTAIN] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-ROLE-RULING-LOG: promoted 3 value(s) [role_in_scene_being:SUPPLIANT, role_in_scene_being:VOWER, role_in_scene_being:IDOL_KEEPERS] → _spec/approved-enumerations.json (SC-0064)
- J04-SC-0064-ROLE-RULING-LOG: promoted 4 value(s) [role_in_scene_being:PROPHET, role_in_scene_being:KING, role_in_scene_being:LIVESTOCK, role_in_scene_being:NOBLES] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-ROLE-RULING-LOG: promoted 3 value(s) [role_in_scene_being:COMPLAINANT, role_in_scene_being:WATCHER, role_in_scene_being:ANIMAL_REFERENT] → _spec/approved-enumerations.json (SC-0064)
- P07-SC-0064-SCENEKIND-RULING-LOG: promoted 3 value(s) [scene_kind:GLEANING_SCENE, scene_kind:PROVISION_HOMECOMING_SCENE, scene_kind:REDEEMER_RECOGNITION_SCENE] → _spec/approved-enumerations.json (SC-0064)
- P09-SC-0064-SCENEKIND-RULING-LOG: promoted 1 value(s) [scene_kind:NIGHT_APPROACH_SCENE] → _spec/approved-enumerations.json (SC-0064)
- P11-SC-0064-SCENEKIND-RULING-LOG: promoted 3 value(s) [scene_kind:GATE_COURT_CONVENING_SCENE, scene_kind:REDEMPTION_DECLINE_SCENE, scene_kind:REDEMPTION_OFFER_SCENE] → _spec/approved-enumerations.json (SC-0064)
- P13-SC-0064-SCENEKIND-RULING-LOG: promoted 2 value(s) [scene_kind:BIRTH_SCENE, scene_kind:NAMING_SCENE] → _spec/approved-enumerations.json (SC-0064)
- P14-SC-0064-SCENEKIND-RULING-LOG: promoted 1 value(s) [scene_kind:GENEALOGY_SCENE] → _spec/approved-enumerations.json (SC-0064)
- J01-SC-0064-SCENEKIND-RULING-LOG: promoted 1 value(s) [scene_kind:FLIGHT_SCENE] → _spec/approved-enumerations.json (SC-0064)
- J02-SC-0064-SCENEKIND-RULING-LOG: promoted 5 value(s) [scene_kind:CRISIS_DELIBERATION_SCENE, scene_kind:EXPOSURE_AND_CONFESSION_SCENE, scene_kind:HURLING_AND_WORSHIP_SCENE, scene_kind:STORM_ONSET_SCENE, scene_kind:SWALLOWING_SCENE] → _spec/approved-enumerations.json (SC-0064)
- J03-SC-0064-SCENEKIND-RULING-LOG: promoted 3 value(s) [scene_kind:DELIVERANCE_SCENE, scene_kind:DISTRESS_RECOUNTING_SCENE, scene_kind:RESCUE_DECLARATION_SCENE] → _spec/approved-enumerations.json (SC-0064)
- J04-SC-0064-SCENEKIND-RULING-LOG: promoted 5 value(s) [scene_kind:COMMISSIONING_SCENE, scene_kind:DECREE_SCENE, scene_kind:DIVINE_RELENTING_SCENE, scene_kind:PROCLAMATION_SCENE, scene_kind:REPENTANCE_SCENE] → _spec/approved-enumerations.json (SC-0064)
- J05-SC-0064-SCENEKIND-RULING-LOG: promoted 4 value(s) [scene_kind:ANGRY_PRAYER_SCENE, scene_kind:APPOINTMENT_SCENE, scene_kind:CLOSING_ARGUMENT_SCENE, scene_kind:WATCH_POST_SCENE] → _spec/approved-enumerations.json (SC-0064)
