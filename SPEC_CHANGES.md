# SPEC_CHANGES — governed edit log for the Tripod STA spec

Every change to the **locked spec** (`validation-rules.json` and the controlled vocabulary it
defines) is recorded here, in order, before it ships. This log is the human-readable audit
trail behind the pinned spec version the compiler vendors. It exists for the same reason the
compiler does: schema drift is only safe when it is **deliberate, recorded, and versioned**
(Tripod training paper §12).

## Rules
- **No silent edits.** A change to `validation-rules.json` is not "done" until it has an entry
  here with status `APPROVED` and an implementation note.
- **One entry per decision**, newest at the top. Never rewrite a shipped entry; supersede it
  with a new one.
- **SC IDs are append-only and never reused.** Once allocated, a number is permanently bound to
  one decision. If a decision is abandoned, renamed, or its number was taken in another session,
  give it the **next free** number and mark the old allocation `VOID`/`SUPERSEDED(→SC-YYYY)` in the
  SC-ID allocation ledger below — never silently rebind a live number to a different decision.
- **Canonical home (one sequence, one home).** This log governs the spec, and the canonical spec
  lives in the wiki vault — so the canonical `SPEC_CHANGES.md` (and `VOCABULARY_LOG.md`) live in the
  wiki `_spec/` beside `validation-rules.json`, and the compiler **vendors + pins** them exactly as it
  vendors the schemas. `tripod check-drift --vault` then asserts the compiler's mirror == the wiki
  canonical, so a wiki-side spec edit cannot bypass the log. (Ruling 2026-05-29. The wiki is
  remote-less, so the compiler's pushed mirror is the durable copy — vendor+pin is the durability
  layer, not a convenience.) **Implementation pending** (next governance task, gates SC-0008): add
  both files to `_spec/pins.json` + the pin table and relocate them under `_spec/` so the pin path
  resolves; until then they remain compiler-repo docs and this rule states the target, not the state.
- **Bump the spec version** on every shipped change and record the new version + file hash so
  the compiler's vendored-copy drift-check can pin to it.
- **Migrate artifacts in the same entry.** If a change invalidates existing artifacts
  (e.g. a value moves lists), list the affected pericopes and the migration, so the gold
  fixtures and the spec never disagree.
- **Authority:** content/methodology rulings are made by the project lead (Marcia Suzuki);
  the compiler implements and verifies them.

## Spec version pin (current)
`tagset_version`: `TRIPOD_STA_v2_0`. Vendored + drift-checked in the compiler at `_spec/` (see `_spec/pins.json`; `tripod check-drift` enforces these).

| Schema | Version | sha256 |
| --- | --- | --- |
| `validation-rules.json` | `v0.6` | `80be76213d8a4fb6bd34c87641ac58feccf23e36ee160c2f5c73fe6a7e207bf0` |
| `compilation-log.schema.json` | `v0.4` | `af54950a87b5aeb818a526467e814c2dabbe2ef85fd0386cce213e62789f1400` |
| `bcd-delta.schema.json` | `v0.4` | `b6afeceaef7076ef8693316425a794757f3b0230a2a408957bae23e3806baa04` |
| `verification-input.schema.json` | `v1.1` | `03e51d5aa0363df6512a40779fb5858c4bfe60d58025a72afe8f3320623835d1` |
| `approved-enumerations.json` | `v0.2` | `9cb8ca89435144c8433ebfc9dede69bebdee4bdca67904f1c15a00a6f84de21a` |

Routine vocabulary promotions (growing `approved-enumerations.json`) are logged in [`VOCABULARY_LOG.md`](VOCABULARY_LOG.md), not as a new SC each time (SC-0006 establishes the mechanism); each promotion re-pins the registry above.

---

## SC-ID allocation ledger (canonical)
The authoritative registry of every SC number. IDs are **append-only and never reused** (see Rules).
The chronological entries below carry the detail; this table is the index — one row per number, each
number bound to exactly one decision.

| SC-ID | Decision (current binding) | Status |
| --- | --- | --- |
| SC-0001 | REGISTER 8→7; move COMMUNITY_MEMORY to a NARRATIVE_FRAMING axis | SHIPPED |
| SC-0002 | Propagate the register split into prompts/templates | SHIPPED |
| SC-0003 | Clean residual "elevated register bordering on COMMUNITY_MEMORY" prose | SHIPPED |
| SC-0004 | Deprecate the pre-Wave-3 `_examples/` P01 duplicates | SHIPPED |
| SC-0005 | Widen the `place_id` pattern to `PL<n>_<DESCRIPTOR>` | SHIPPED |
| SC-0006 | Drift convergence: convergent/descriptive split + approved-enumerations registry | SHIPPED |
| SC-0007 | Converge the L1 / discourse / high-risk axes (add a COMPILATION-LOG promotion slot) | SHIPPED |
| SC-0008 | Template relics: retire obsolete for-model/audit templates | PROPOSED |

**Superseded / void allocations (recorded, never rebound):**
- **SC-0006 — "Template relics" (planning-time allocation; never committed to this log) → VOID.**
  Cross-session history shows the template-relics fix was tentatively numbered SC-0006 in an earlier
  planning session, but it was never written into SPEC_CHANGES.md under that number: the committed log
  ran SC-0001→SC-0005 (`84bd95c`), and SC-0006 first appears already bound to "Drift convergence"
  (`9fdef18`, 2026-05-29). That binding is now load-bearing — every seeded value in
  `approved-enumerations.json` carries `sc_ref:"SC-0006"` and `promote.ts` stamps it by default — so
  SC-0006 stays bound to drift convergence. The template-relics decision is reinstated below as
  **SC-0008**. This cross-session collision is why the append-only-IDs rule now exists.
- **SC-0007 — double-booked in `docs/PROGRESS.md`** between L1-axis convergence (Next #1) and template
  relics (open-thread (c): "pick one"). Reconciled: **SC-0007 = L1-axis convergence** (it closes
  SC-0006's flagged known limitation), **SC-0008 = template relics**.

---

## Entry template
```
## SC-XXXX — <short title>
- Date: YYYY-MM-DD
- Decided by: <name>
- Status: PROPOSED | APPROVED | SHIPPED | SUPERSEDED(→SC-YYYY)
- Type: closed-list change | bounded-list change | registry/BCD | schema-shape | axis reclassification | other
- Summary: <one line>
- Rationale: <why; link to discussion/doc>
- Spec change (exact): <fields/lists added, removed, moved; before → after>
- Artifact migration: <affected pericopes + what changes in each; or "none">
- Validator impact: <new/changed rule behaviour>
- Version: <old spec version> → <new spec version> (sha256 <hash>)
- Verification: <how we confirmed: fixtures re-validate clean, etc.>
```

---

## SC-0008 — Template relics: retire obsolete for-model/audit templates
- **Date:** 2026-05-29 (reinstated as SC-0008)
- **Decided by:** Marcia Suzuki
- **Status:** PROPOSED
- **Type:** docs/templates hygiene (no schema change)
- **ID note:** Tentatively numbered SC-0006 in an earlier planning session but never committed to this
  log under that number (SC-0006 shipped as drift convergence, `9fdef18`); later surfaced as SC-0007 in
  `docs/PROGRESS.md` open-thread (c), colliding with the L1-axis item now at SC-0007. Reinstated here
  under its own permanent ID — see the allocation ledger.
- **Summary:** Two pre-Wave-3 template files survive in the wiki vault `_templates/`:
  `for-model-template.md` still documents `discourse_threads_active` as a FOR_MODEL field (now
  BCD-DELTA-only), and `audit-template-schema.json` is the schema for the obsolete AUDIT artifact.
  Retire/redirect both.
- **Rationale:** Stale templates re-introduce retired fields; a future author copying the
  template would re-add `discourse_threads_active` to a FOR_MODEL.
- **Spec change (exact):** no `validation-rules.json` change; wiki-vault `_templates/` edits only.
- **Artifact migration:** none (templates are not validated artifacts).
- **Validator impact:** none.
- **Version:** no spec-version bump.
- **Verification:** grep clean; `_templates/` no longer references retired fields.

---

## SC-0007 — Converge the L1 / discourse / high-risk axes (add a COMPILATION-LOG promotion slot)
- **Date:** 2026-05-30 (shipped)
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-30)
- **Type:** schema-shape (COMPILATION-LOG) + promotion mechanism
- **Summary:** Closes the SC-0006 known limitation. The COMPILATION-LOG `vocabulary_additions` only
  carried `proposition_kinds`/`scene_kinds`/`presence_values`, so the remaining convergent axes — the
  L1 element axes (arc/context/tone/pace/communicative_function), `discourse_thread_state`, and
  `high_risk_register_kind` — had no promotion slot and kept drifting. Added intake slots so
  `tripod promote` can converge them into `approved-enumerations.json`.
- **Rationale:** Those axes are already classified convergent (SC-0006) and already keyed in the
  registry, but with no intake slot they never accumulated; their drift was permanent noise, not signal.
- **Spec change (exact):**
  - `compilation-log.schema.json` `$defs.vocabulary_additions.properties` gains seven OPTIONAL arrays
    (each `array` of `vocabulary_addition_entry`): `arc_elements`, `context_elements`, `tone_elements`,
    `pace_elements`, `communicative_function_elements`, `discourse_thread_states`,
    `high_risk_register_kinds`. The `required` set is **unchanged**, so v0.3 logs stay valid (additive).
    `version` v0.3 → v0.4, `$id` `…compilation-log-v0-3` → `-v0-4`, `date_locked` → 2026-05-30, `supersedes` appended.
  - `validation-rules.json` `sibling_schemas.compilation_log` pointer `"…v0.3"` → `"…v0.4"`
    (pointer-accuracy only — **no rule change**, so its `version` stays **v0.6**, re-pinned by hash).
  - `src/compiler/promote.ts`: `VA_KEY_TO_AXIS` gains the seven `…s → singular` mappings;
    `UNCOVERED_CONVERGENT_AXES` shrinks to `[]`.
  - `src/cli/tripod.ts`: `promote` prints "all convergent axes are promotable (SC-0007)" when the
    uncovered set is empty.
- **Scope note (honest):** the five **L1-element** axes surface as FOR_MODEL drift, so promoting them
  measurably zeroes drift (proven below). `discourse_thread_state` and `high_risk_register_kind` are
  **not FOR_MODEL fields** (they live in the BCD-DELTA discourse threads and this log's
  `high_risk_register_audit[].kind`); the FOR_MODEL drift detector does not scan them. Their new slots
  make them **promotable / keep the registry complete**, but drift-*detection-from-source* for those two
  is out of scope here (future work — the validator would scan the COMPILATION-LOG / BCD-DELTA, not the FOR_MODEL).
- **Artifact migration:** `fixtures/compilation-log/P02-Ruth-1-6-14-COMPILATION-LOG.md` populated with
  P02's convergent values (arc ×6, tone ×4, pace ×2, communicative_function ×7, all `PROPOSED`) plus
  its five genuinely-new `high_risk_register_kind` values (R1/R2/R3/R11/R15). P01 + P03–P06 unchanged
  (slots optional; they may add the new lists as values are approved).
- **Registry growth — deferred (decision):** SC-0007 ships the **mechanism only**. The vendored
  `approved-enumerations.json` is **not** grown here (stays v0.1); the real P02 promotion is a routine
  `tripod promote --apply` action for a later session (logged in `VOCABULARY_LOG.md`, re-pins the
  registry). The mechanism is proven in tests without mutating the vendored registry.
- **Validator impact:** every convergent axis is now promotable; once a value is promoted into the
  registry it stops drift-warning (the detection side was already wired via `driftBaseline()`).
- **Version:** `compilation-log.schema.json` v0.3 → **v0.4**
  (sha256 `af54950a87b5aeb818a526467e814c2dabbe2ef85fd0386cce213e62789f1400`);
  `validation-rules.json` **v0.6 unchanged**, re-pinned (sha256
  `80be76213d8a4fb6bd34c87641ac58feccf23e36ee160c2f5c73fe6a7e207bf0`). Both re-pinned in `_spec/pins.json` + the table above.
- **Verification:** `npm test` 44/44 green; `tripod check-drift` green against the new pins + closed-list
  sync invariant; `tripod validate fixtures/for-model/` → 6/6 block-clean; `tripod validate
  fixtures/compilation-log/` → 6/6 valid (P02 against v0.4 with the new slots); `tripod promote
  fixtures/compilation-log/P02-…-COMPILATION-LOG.md --status ANY` lists 41 values across all convergent
  axes ("all convergent axes are promotable"); the drift test confirms promoting P02's
  `vocabulary_additions` drives residual convergent FOR_MODEL drift to **zero** (was non-zero on the L1
  axes before).

---

## SC-0006 — Establish drift convergence: convergent/descriptive split + growing approved-enumerations registry
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** axis reclassification + schema-shape (new registry file) + validator mechanism
- **Summary:** Two linked changes so drift becomes a real, converging review signal instead of
  per-pericope noise. (1) **Split** the drift detector's axes into *convergent* (review-signal)
  vs *descriptive* (open, never converge); (2) replace the frozen P01-only baseline with a
  **growing `approved-enumerations.json` registry** that accumulates approved convergent values
  with provenance, so a value approved in one pericope stops drifting in the next.
- **(1) Convergent vs descriptive (rule-based):** an axis whose seed key contains `_examples`
  (`role_in_scene_examples_*`, `function_in_scene_examples_object`, `*_kind_examples`) or equals
  `referential_form` is **descriptive** — per-pericope by nature, surfaced as severity `descriptive`
  (informational), never as drift. Everything else (`proposition_kind`, `scene_kind`,
  `presence_value`, the L1 element axes incl. `context_element`, `discourse_thread_state`,
  `high_risk_register_kind`) is **convergent** → severity `drift`. Example: P02 drops from 86
  lumped "drift" to **37 convergent + 49 descriptive**.
- **(2) Growing registry:** new `_spec/approved-enumerations.json` (v0.1), seeded from the
  convergent axes of `drift_detector.canonical_p01_enumerations` (each value tagged
  `first_seen`/`approved_in`/`source_artifact`/`sc_ref`). The validator reads it as the live drift
  baseline for convergent axes (descriptive axes still use the P01 seed for the informational note).
  `drift_detector.canonical_p01_enumerations` is retained as the documented seed.
- **Promotion-with-provenance:** `tripod promote <COMPILATION-LOG>` reads the log's
  `vocabulary_additions` (the Gate-F-approved values), gates on `status` (default `CONFIRMED`),
  and grows the registry; `tripod propose-vocabulary <FOR_MODEL>` lists convergent-drift values as
  candidate additions. Promotions append to `VOCABULARY_LOG.md` and re-pin the registry — no new SC
  per promotion (this entry establishes the policy).
- **Known limitation (flagged):** the COMPILATION-LOG `vocabulary_additions` only carries
  `proposition_kinds` / `scene_kinds` / `presence_values`, so those converge; the L1-element axes
  (arc/context/tone/pace/communicative_function), `discourse_thread_state`, and
  `high_risk_register_kind` have **no promotion slot** in the COMPILATION-LOG schema yet and will
  keep drifting until that schema gains one (a future SC). `tripod promote` prints these uncovered axes.
- **Version:** new `approved-enumerations.json v0.1`
  (sha256 `3623630868562083bb0c7d35a177db0416bd3a983e43f22808d66bea96a7a282`); pinned in `_spec/pins.json`.
  No change to `validation-rules.json` (the canonical_p01_enumerations seed is unchanged).
- **Verification:** `tripod validate` P01–P06 still block-clean; P02 splits 37 convergent / 49
  descriptive; promoting P02's `vocabulary_additions` zeroes its `proposition_kind`+`scene_kind`
  drift on re-validate, with residual convergent drift only on the uncovered axes. 22 tests green.

---

## SC-0005 — Widen the `place_id` pattern to allow `PL<n>_<DESCRIPTOR>` sub-place codes
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** schema-shape (closed pattern; affects 3 schemas)
- **Summary:** The locked `place_id` pattern `^PL(\d+|_[A-Z][A-Z0-9_]*)$` accepted `PL5` or
  `PL_BOAZ_PORTION` but **not** the hybrid sub-place form `PL5_BOAZ_PORTION` — which the BCD
  itself registers (`bcd/places/PL5_BOAZ_PORTION-…md`) and P05/P06 use. Widen the pattern to
  permit an optional `_<DESCRIPTOR>` after the number. **Surfaced by the Slice 1 validator on
  its first run against the gold fixtures** — the drift-control payoff in action.
- **Spec change (exact):** pattern `^PL(\d+|_[A-Z][A-Z0-9_]*)$` → `^PL(\d+(_[A-Z][A-Z0-9_]*)?|_[A-Z][A-Z0-9_]*)$`
  in all three schemas that carry it:
  - `validation-rules.json` (`$defs.place_id`) → version **v0.5 → v0.6**, `$id` + `for_model_schema.$id` bumped, `sibling_schemas` refs updated.
  - `bcd-delta.schema.json` (`$defs.…place_id`) → version **v0.3 → v0.4**, `$id` bumped.
  - `verification-input.schema.json` (`place_id`) → version **v1.0 → v1.1**.
  - `compilation-log.schema.json` — unchanged (no `place_id` field).
- **Artifact migration:** none. P05/P06 (and the BCD) already use `PL5_BOAZ_PORTION`; the widen
  makes the spec match existing artifacts. No `PL` code anywhere needs renaming.
- **Validator impact:** `place_id` now accepts `PL<n>`, `PL_<DESCRIPTOR>`, and `PL<n>_<DESCRIPTOR>`.
  After the widen, all six gold FOR_MODELs (P01–P06) validate block-clean.
- **Version:** `validation-rules.json v0.5 → v0.6`
  (sha256 `b024e0ea40771ba4a169b936ce57f05686e5333485d937cbed97a80e0d14de3a`); siblings re-pinned
  (see pin table above + `_spec/pins.json`).
- **Verification:** `tripod validate fixtures/for-model/` → 6/6 block-clean (P01 drift 0; P02–P06
  bounded-open drift only); `tripod check-drift` green against the new pins; the closed-list sync
  invariant holds. A reverted (narrow) pattern re-blocks P05/P06 (regression guard in the test suite).

---

## SC-0004 — Deprecate the pre-Wave-3 `_examples/` P01 duplicates; redirect to canonical P01
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (examples/docs consistency; **no spec change** — pin/hash unchanged)
- **Summary:** Resolves the examples refresh flagged under SC-0003. The three
  `_examples/{meaning-map,audit,for-model}-P01-worked-example.md` files were pre-Wave-3 **full
  duplicates** of P01 carrying forbidden/obsolete content. Rather than maintain parallel copies (a
  drift vector), they are **deprecated and redirected** to the canonical P01 reference.
- **Spec change (exact):** none.
- **Artifact edits (wiki):** each `_examples/` file replaced with a short deprecation stub
  (`status: deprecated`, `superseded-by`) pointing to the live canonical artifact:
  - `meaning-map-…` → `[[P01-Ruth-1-1-5]]` (was `CONSULTATIVE`; treated COMMUNITY_MEMORY as a register).
  - `for-model-…` → `[[P01-Ruth-1-1-5-FOR-MODEL]]` (was `TRIPOD_STA_v1_0`; had `artifact_profile`,
    a `discourse_threads_active` block in the FOR_MODEL, `CONSULTATIVE`).
  - `audit-…` → `[[P01-Ruth-1-1-5-COMPILATION-LOG]]` + `[[P01-Ruth-1-1-5-BCD-DELTA]]` (the monolithic
    AUDIT artifact type no longer exists; it used `registry_additions` + the combined audit model).
- **Rationale:** `CLAUDE.md` already designates the live `pericopes/` + `stas/` + `verification/` P01
  artifacts as the structural reference for every artifact. Maintaining duplicate worked examples
  would re-introduce drift. Single source of truth.
- **Supersedes:** the "recommend a separate full examples refresh" note in SC-0003 (resolved here by
  deprecation rather than regeneration).
- **Validator impact:** none.
- **Version:** unchanged — `validation-rules.json v0.5` (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** post-edit sweep — no live (non-archive, non-working) artifact carries a structured
  `"register": "CONSULTATIVE"`, `artifact_profile`, `discourse_threads_active`, or an AUDIT artifact;
  the `_examples/` stubs contain only deprecation prose + canonical redirects.

---

## SC-0003 — Clean residual "elevated register bordering on COMMUNITY_MEMORY" prose from live artifacts
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (artifact-prose consistency; **no spec change** — pin/hash unchanged)
- **Summary:** Resolves the residual prose flagged under SC-0002. Live artifacts described the
  *wayhi bi-yemei* opening as an "elevated register bordering on COMMUNITY_MEMORY" — post-SC-0001 a
  category error, since `COMMUNITY_MEMORY` is a `NARRATIVE_FRAMING` value, not a register.
- **Spec change (exact):** none (no `validation-rules.json` edit; closed lists untouched).
- **Artifact edits (wiki):**
  - `pericopes/P01-Ruth-1-1-5.md` (canonical meaning map — §1 register tagging + the Level-2 figure
    note): the v.1 *wayhi* formula now reads "elevated narrative framing — COMMUNITY_MEMORY (a
    NARRATIVE_FRAMING value, not a register)," and the register is stated to stay `INFORMAL_CASUAL` throughout.
  - `concepts/CB_0029-Judges-Era.md` (Rendering concern, ×2): same reframe.
  - `figures/FIG_0050-Wayhi-Bimei-Chronicle-Formula.md` (intended-meaning, ×3): "elevated narrative
    register" → "elevated narrative framing."
- **Deliberately NOT changed:**
  - Correct uses of "elevated register" — the P01/P03/P04/P05 COMPILATION-LOGs' "…carried by figure
    flags, not by elevated register"; the Pilot-3 draft's own category-error analysis; agent
    style-guidance ("high-register filler").
  - `_examples/{meaning-map,audit,for-model}-P01-worked-example.md` are **pre-Wave-3** (pericope
    register `CONSULTATIVE`; obsolete 2-artifact AUDIT model). The phrase persists in the meaning-map
    example; a one-line patch would leave it incoherent. **Recommend a separate full examples refresh**
    (regenerate from canonical P01). This is the only remaining live occurrence.
- **Validator impact:** none.
- **Version:** unchanged — `validation-rules.json v0.5` (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** vault sweep confirms no "elevated register bordering on COMMUNITY_MEMORY" or
  "elevated narrative register" remains in any live (non-archive, non-working, non-`_examples`) file.

---

## SC-0002 — Propagate the `COMMUNITY_MEMORY` reclassification into prompts, templates, and the worked example
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** other (downstream consistency; **no closed-list change** — SC-0001 pin/hash still current)
- **Summary:** SC-0001 moved `COMMUNITY_MEMORY` off REGISTER onto the `NARRATIVE_FRAMING` axis and
  added `framing_override`. This entry propagates that into the human-facing locked-spec prompts,
  the FOR_MODEL template, and the P01 worked example so future runs (P07+) don't regenerate invalid
  register overrides.
- **Spec change (exact):** no change to `validation-rules.json` (closed lists untouched). Edits (all in the wiki):
  - `_spec/agent-2-system-prompt.md`: moment-level shift note now says the *wayhi* formula carries
    `COMMUNITY_MEMORY` as a `NARRATIVE_FRAMING` value (downstream `framing_override`), not a register.
  - `_spec/agent-3-system-prompt.md`: moment-level guidance now splits `override_value` (REGISTER) vs
    `framing_override` (NARRATIVE_FRAMING), with the at-least-one rule.
  - `_templates/for-model-template.md`: register value list corrected to the 7 (had listed
    `COMMUNITY_MEMORY`); `register_overrides.moment_level` field list now includes `framing_override`.
  - `_examples/for-model-P01-worked-example.md`: 1:1a `override_value: COMMUNITY_MEMORY` → `framing_override` (targeted).
- **Verified-correct, deliberately NOT changed (genre/token positions):**
  - `agent-1…:237` and `agent-2…:113` — `COMMUNITY_MEMORY` in the **GENRE** list (correct; stays the 31st genre).
  - `agent-2…` register list (L116–126) — already the correct 7.
  - `_templates/sta-vocabulary.md:837` — flat alphabetical token glossary; token still valid (genre + framing).
    `_templates/sta-vocabulary-general.md:72` — genre-position (correct).
- **Out of scope, FLAGGED for separate follow-up:**
  - Descriptive prose "register bordering on COMMUNITY_MEMORY" in `concepts/CB_0029-Judges-Era.md` (L21,44)
    and `pericopes/P01-Ruth-1-1-5.md` (L37,114) — exegetical, non-validated, non-blocking.
  - `_examples/for-model-P01-worked-example.md` and its siblings (`meaning-map-…`, `audit-…`) are
    **pre-Wave-3** (pericope register `CONSULTATIVE`, old 2-artifact AUDIT model). SC-0002 fixed only the
    `COMMUNITY_MEMORY` field; a full examples refresh is recommended as its own task.
  - `_archive/*`, `_working/P01-smoke-test/*` — historical / audit trail; untouched by policy.
- **Validator impact:** none beyond SC-0001 (no list change). Keeps agents + templates from re-introducing the drift.
- **Version:** unchanged — `validation-rules.json v0.5`
  (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`); SC-0002 touches no closed list.
- **Verification:** post-edit vault sweep confirms no remaining `COMMUNITY_MEMORY` in a register/override-value
  position in any active (non-archive, non-working) artifact, prompt, or template; genre-position and glossary
  occurrences intentionally retained.

---

## SC-0001 — REGISTER reduced 8 → 7; `COMMUNITY_MEMORY` reclassified as a framing value
- **Date:** 2026-05-29
- **Decided by:** Marcia Suzuki
- **Status:** SHIPPED (2026-05-29)
- **Type:** closed-list change + axis reclassification (+ artifact migration)
- **Summary:** `COMMUNITY_MEMORY` is not a social register. Remove it from the closed
  `REGISTER` list (8 → 7) and move it onto a separate narrative-framing / voice axis.
- **Rationale:** The 7 social registers are speaker-relationship keys (INTIMATE,
  INFORMAL_CASUAL, CONSULTATIVE, FORMAL_OFFICIAL, CEREMONIAL, ELDER_AUTHORITY,
  RELIGIOUS_WORSHIP). `COMMUNITY_MEMORY` appears in P01 only as a **moment-level override at
  Ruth 1:1a** framing the *wayhi* opening — narrator-voice/framing, not a register. The
  locked file (8) contradicted the prose docs + training paper §10 (7); ruling resolves it
  in favour of 7. This is the tool's first detected spec-vs-prose drift, now reconciled.
- **Spec change (exact, as implemented):** edited **both** representations of each closed
  list — the `closed_lists.*` arrays and the mirror `for_model_schema.$defs.*_value` enums —
  keeping them in sync.
  - `closed_lists.REGISTER` + `$defs/register_value`: **removed** `COMMUNITY_MEMORY` → 7 values:
    `INTIMATE, INFORMAL_CASUAL, CONSULTATIVE, FORMAL_OFFICIAL, CEREMONIAL, ELDER_AUTHORITY, RELIGIOUS_WORSHIP`.
  - **Added** axis **`NARRATIVE_FRAMING`** (name **confirmed**) as `closed_lists.NARRATIVE_FRAMING`
    + `$defs/narrative_framing_value`, value set `["COMMUNITY_MEMORY"]` (only framing value the
    spec currently implies; extensible).
  - `register_overrides` handling = **(b) distinct `framing_override` field** (chosen). In
    `$defs/register_override_entry`: `override_value` is no longer `required`; sibling
    `framing_override` (→ `narrative_framing_value`) added, parallel to `genre_override`;
    an `anyOf` now requires **at least one** of `override_value` / `framing_override`.
  - **GENRE left unchanged (ruling).** Discovery: `COMMUNITY_MEMORY` was *also* the 31st `GENRE`
    (in `closed_lists.GENRE` + `$defs/genre_value`). Decision: keep it as a genre — so `GENRE`
    stays 31 and `COMMUNITY_MEMORY` now legitimately lives on two axes (GENRE + NARRATIVE_FRAMING).
    Only its REGISTER membership was the error.
  - Left `PERICOPE_LEVEL_REGISTER` (narrator-voice = INFORMAL_CASUAL) unchanged.
  - Bumped `version` v0.4 → v0.5, `date_locked` → 2026-05-29, the `$id` / `for_model_schema.$id`
    version strings, and appended a `supersedes` note.
- **Artifact migration (done):**
  - **P01 (Ruth 1:1–5) FOR_MODEL:** 1:1a `moment_level` entry changed from
    `"override_value": "COMMUNITY_MEMORY"` → `"framing_override": "COMMUNITY_MEMORY"`
    (`_note` updated). P01 FOR_MODEL re-validates clean against v0.5.
  - **P02–P06 FOR_MODEL:** scanned — no `COMMUNITY_MEMORY` in any register/override position; nothing to migrate.
  - **Residual prose (NOT migrated, flagged):** P01 meaning map (`pericopes/P01-Ruth-1-1-5.md`
    ~L37 & L114) says "elevated register bordering on COMMUNITY_MEMORY"; P01 COMPILATION-LOG
    (P01-D1) mentions the override descriptively. Exegetical/descriptive prose, not validated
    structured fields — does not trip the validator. Left as-is pending Marcia's copy-edit call.
- **Validator impact:** SHIPPED — the Slice 1 validator must **BLOCK** `COMMUNITY_MEMORY` in any
  `REGISTER` / `override_value` position (closed-list violation) and **accept** it only as a
  `framing_override` (`NARRATIVE_FRAMING`) value. The closed-list **sync invariant**
  (`closed_lists.X` == `$defs/x_value.enum`) is itself a validator check.
- **Version:** `TRIPOD_STA_v2_0`, validation-rules `v0.4` → `v0.5`
  (sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a`).
- **Verification:** deterministic check (no LLM) passed — REGISTER==7 and ==`register_value`;
  NARRATIVE_FRAMING==`[COMMUNITY_MEMORY]` and ==`narrative_framing_value`; GENRE==31 (unchanged);
  `override_value` optional + `framing_override` + `anyOf` present; **P01 FOR_MODEL validates
  clean against the v0.5 `for_model_schema`** (python `jsonschema`); P01–P06 carry no
  `COMMUNITY_MEMORY` in a register position. Full P01–P06 re-validation through the Slice 1
  `tripod validate` CLI lands with that slice and will reconfirm against this pinned hash.
