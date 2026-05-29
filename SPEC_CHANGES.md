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
- **Bump the spec version** on every shipped change and record the new version + file hash so
  the compiler's vendored-copy drift-check can pin to it.
- **Migrate artifacts in the same entry.** If a change invalidates existing artifacts
  (e.g. a value moves lists), list the affected pericopes and the migration, so the gold
  fixtures and the spec never disagree.
- **Authority:** content/methodology rulings are made by the project lead (Marcia Suzuki);
  the compiler implements and verifies them.

## Spec version pin (current)
| Field | Value |
| --- | --- |
| `tagset_version` | `TRIPOD_STA_v2_0` |
| `validation-rules.json` version | `v0.5` |
| `validation-rules.json` sha256 | `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a` |
| Vendored into compiler at | `_spec/validation-rules.json` (pinned; drift-checked) |

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
