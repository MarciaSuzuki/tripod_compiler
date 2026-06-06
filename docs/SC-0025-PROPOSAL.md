# SC-0025 — action-slot enforcement (the SC-0024 durability step)

> **Status:** BUILT — gate board green (147 tests · 6/6 CLI gates exit 0). Three merge checks green: SC-0007 convergence (invariant **restored**, not silenced), the predicted **8→15** quarantine, and the **gated 79-bare-verb fact**. PR open; merge + vault writeback pending Marcia.
> **Approved scope (Marcia 2026-06-05):** option A — held-7 **quarantined**, seam **as drawn**, build to a green gate. The `collectCodes` parallel (§5) was confirmed clean and the 79-bare-verb fact verified by parsing the JSON (not grep).
> **Deltas from this plan, found during build:** (1) the SC-0007 intake invariant required declaring `action_values` in **all 6 CLs** (Marcia ruled A — precedent-correct; the registry stays CL-reconstructible, no orphaned seeds) → the vault writeback grows to include the 6 CLs; (2) `complog.ts` skeleton **not** touched (both new CL properties are optional; the skeleton emits required-only); (3) the generic quarantine display message made axis-neutral (it mislabeled the action held-7 as "used-once coin-flips").
> **Branch:** `sc-0025-action-enforcement` off `origin/main` `9ababe9`.

---

## 1. What SC-0025 does, in one paragraph

SC-0024 *cleaned* the nested component `action` slot (≈57 sentence-shaped values → a small reusable verb set,
proven by a survival table) but left it **uncontrolled free-text** — nothing stops P07–P14 from re-dirtying it.
SC-0025 makes `action` a **controlled bounded-open axis**: the drift engine now *reaches* and checks every
`action` value, the cleaned verbs are the seeded approved baseline, the 7 held sentence-shaped labels are
**quarantined** (deliberately unsettled, handed to Thread B intact), and the compilation-log gains an
`action_values` intake array so future action verbs can be governed-promoted like every other bounded-open axis.
SC-0025 **also** fixes the `role_in_scene_beings` schema gap (the property every compilation-log has carried
since SC-0022 but the schema forbids). **What SC-0025 does NOT do:** turn on compilation-log validation in the
gate board — that is SC-0026, kept separate (one concern per gate cycle).

## 2. The seam (action-enforcement vs compilation-log-validation)

The governing rule, settled 2026-06-05:

> **SC-0025 changes what the schema *says*. SC-0026 changes whether the gate *checks* compilation-logs against it.**

- **In SC-0025** (schema *says* / write + enforcement side): add the `action_values` property; fix the
  `role_in_scene_beings` property; reclassify `action` to bounded-open; seed + quarantine; teach `promote` and
  the skeleton emitter the new axis. None of this validates a compilation-log.
- **In SC-0026** (gate *checks*): run every compilation-log through `compilation-log.schema.json` as a
  deterministic gate. Does not exist yet; SC-0025 does not touch it.

The `action_values` intake slot is a **schema affordance for action provenance** → SC-0025. `promote` and the
drift-convergence unit test *read* the compilation-log, but that is the **pre-existing promotion mechanism
gaining a thirteenth axis**, not new gate validation (it already reads this object for the twelve current axes).

## 3. The held-7 → quarantine (approved; pre-judges nothing — verified)

The 7 held sentence-shaped labels are the Thread B starter corpus (meaning/form divergence). They are
**quarantined**, not seeded as approved — seeding would re-bless sentence-shaped values into the cleaned slot,
exactly what SC-0024 undid. **Verified that quarantine decides nothing about them:**

- Data shape (`quarantined-vocabulary.json`) is `{ value, first_seen, reason, sc_ref }` — descriptive
  provenance only, **no disposition/verdict field**.
- Engine (`vocabulary.ts` `drift()`): a quarantined value yields a `quarantined` **notice** — never `block`,
  never added to any approved set, never silenced. The future is explicit: "promote **or** collapse."
- `quarantineWatch()` (`report.ts`) only counts distinct pericopes and sets `recurs = pericopes.size >= 2`.
  It decides nothing.

So the held-7 are preserved **exactly as Thread B inherits them** — unsettled, divergence intact. (Their
`reason` will name the divergence, not a fate; their primary resolution is Thread B, with `RECURS` a secondary
signal if P07–P14 reuse one.)

The 7, with `first_seen`: `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` (P04); and from P06 —
`WISHED_YHWH_TO_REPAY_HER_WORK`, `WISHED_FULL_WAGES_FROM_YHWH_UNDER_WHOSE_WINGS_SHE_TOOK_REFUGE`,
`STATED_THAT_HE_COMFORTED_HER`, `STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH`,
`STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT`, `STATED_SELF_AS_FOREIGNER`.

## 4. Seed math

38 distinct `action` values across P01–P06, minus the 7 held = **31 approved verbs** seeded into
`approved-enumerations.json` (`DIRECTED`, `STATED`, `VOWED`, `ASKED`, `REPORTED`, `KISSED`, `IDENTIFIED`,
`ASCRIBED`, `ARRIVED_AT`, `TOOK_AS_WIFE`, … down to the single-use clean verbs `SAW`/`ATE`/`BLESSED`/…).
The `canonical_p01_enumerations` fallback for `action` = P01's three (`ARRIVED_AT`, `TOOK_AS_WIFE`, `WERE_AT`).
**Gate-impact prediction:** zero new drift on the existing corpus (all 31 are seeded approved); the quarantine
count rises 8 → 15 (the 8 comm-func + the 7 held action). That is the expected, correct signal.

## 5. The `collectCodes` parallel — THE thing to check (Marcia's flag)

**Claim: the `action` walk mirrors `collectCodes` cleanly; "contained" holds.**

`collectCodes` (`vocabulary.ts:115-123`) is a generic recursive walk of `event_specific_slots` — it descends
arrays and objects to every depth (so it already traverses the 23 distinct `*_components[]` nests) and, at each
**string leaf**, tests the value against `ENTITY_CODE` and collects matches. It is **already invoked** on
`event_specific_slots` at `vocabulary.ts:128`.

The `action` walk needs the **same traversal** with **one added rule**: when an object key is `action` and its
value is a string, call `drift(value, "action", loc)`. Concretely, SC-0025 **folds this into the existing pass**
— one walk of `event_specific_slots` that does both jobs (collect entity codes *and* drift-check `action`).

| | `collectCodes` (today) | `action` walk (SC-0025) |
|---|---|---|
| Traversal | recursive over `event_specific_slots`, arrays + objects, any depth | **identical** (same subtree, already walked at :128) |
| Collection predicate | value matches `ENTITY_CODE` regex (key-agnostic) | key is `action` + value is string (**key-targeted**) |
| Reachability | all `*_components[]` to any depth | **same** — no path it can't reach |

**The one honest difference:** the predicate is *key-targeted* (`action`) rather than *value-pattern* (regex).
That is a different "what do I collect," not a different walk — and `action` is always a direct string under an
`"action"` key (verified: all 79 occurrences are `"action": "VERB"`; no `action` key holds a non-verb), so the
key-targeted rule catches every case with no false positives. **No new traversal, no unreachable shape, no
separate machinery.** If this reads as a clean mirror to you, the "contained" estimate holds and the test burden
is the one below. If you see a case it must handle that `collectCodes` doesn't, that's the larger-burden signal
to surface now — I don't.

`axisClass("action")` returns `convergent` automatically (`load.ts:71` — everything that isn't `*_examples` or
`referential_form`), so no axis-list edit; `driftBaseline()` will include `action` once it is a key in
`canonical_p01_enumerations`.

## 6. File-by-file change list (the build)

**Spec (write side / "what the schema says"):**
1. `_spec/validation-rules.json` (v0.11 → **v0.12**): add `action` to `drift_detector.canonical_p01_enumerations`
   (P01's three). *(No closed-list change — `action` is bounded-open, not closed.)*
2. `_spec/approved-enumerations.json` (v0.9 → **v0.10**): add the `action` axis with the 31 approved verbs +
   provenance (`sc_ref: SC-0025`).
3. `_spec/quarantined-vocabulary.json` (0.1.0 → **0.2.0**): add the `action` axis with the 7 held (provenance
   names the divergence, not a fate).
4. `_spec/compilation-log.schema.json` (v0.6 → **v0.7**): add `action_values` **and** `role_in_scene_beings`
   to `vocabulary_additions.properties` (both `array` of `vocabulary_addition_entry`; additive — required set
   unchanged). This is the `role_in_scene_beings` gap fix.
5. `_spec/pins.json`: re-pin the four files above (new `shasum -a 256`).

**Engine / compiler:**
6. `src/engine/vocabulary.ts`: fold the `action` drift check into the `event_specific_slots` walk (§5).
7. `src/compiler/promote.ts`: handle `vocabulary_additions.action_values` (parallel to the existing axes).
8. `src/compiler/complog.ts`: skeleton emits `action_values: []` (and `role_in_scene_beings: []`).

**Tests + governance:**
9. `tests/`: action drift surfaces on an unseeded verb; a held-7 value → `quarantined` not `drift`/`block`;
   `promote` of `action_values` zeroes action drift (the convergence invariant, extended to the 13th axis).
10. `SPEC_CHANGES.md`: SC-0025 entry. Append-only SC-ID.

## 7. Acceptance

Green gate: `npm run build && npx vitest run` (≥142, plus the new action cases) and the six CLI gates
(`validate`/`lint`/`coverage`/`id-check`/`gold-diff`/`check-drift`) — `validate` shows **0 new block, 0 new
drift, quarantine 8 → 15**; `gold-diff` stable; `check-drift` re-pinned (now 4 bumped files). The
`role_in_scene_beings` fix is *latent* until SC-0026 turns on CL validation — SC-0025 makes the schema correct
so SC-0026 is a clean switch-flip.
