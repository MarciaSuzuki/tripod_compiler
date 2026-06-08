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
  - **Current state — honest (verified 2026-06-06, during SC-0025).** The above is the *target*, not the
    state, and the gap is wider than the log files: the vault `_spec/` **schema** files are a stale snapshot
    frozen ~SC-0014 — `validation-rules.json` **v0.7** (compiler `v0.12`), `approved-enumerations.json` **v0.1**
    (compiler `v0.10`), `compilation-log.schema.json` **v0.5** (compiler `v0.7`), and `quarantined-vocabulary.json`
    (SC-0023) is **absent entirely**. Every SC from ~SC-0015 onward edited the spec compiler-side and never wrote
    it back, and `check-drift --vault` (the guardrail that would catch this) was never built. **So the de-facto
    canonical spec is the compiler's pinned `_spec/`; the vault `_spec/` is a stale snapshot. Do NOT vendor or
    sync *from* the vault `_spec/`** — that would silently revert ~10 SCs. The bulk reconcile (catch the vault up
    + create the quarantine file) and `check-drift --vault` ship **together** under SC-0008; until they do,
    nothing should treat the vault `_spec/` as canonical. (Same class as the SC-0026 finding: an authoritative
    artifact left unguarded because its check is the unbuilt one.)
- **Bump the spec version** on every shipped change and record the new version + file hash so
  the compiler's vendored-copy drift-check can pin to it.
- **Reconcile the vault on every spec change, and prove it (SC-0008).** After editing `_spec/`, write the
  change back to the wiki vault and run `npm run check-drift:vault` (= `check-drift --vault <wiki>/_spec`) —
  it must report all `vault:ok`, exit 0, before the change is "done." A spec edit not written back leaves the
  vault stale (the drift SC-0008 had to repair). **New files must be explicitly staged/committed** — an
  untracked file can be silently skipped by auto-commit, so verify it actually landed on the vault *remote*,
  not just local disk (the guard reads local disk and can't catch a missing-on-remote file). The conditional
  `--vault` test (set `TRIPOD_VAULT_SPEC`) enforces clean-vault on any local `npm test`.
- **Migrate artifacts in the same entry.** If a change invalidates existing artifacts
  (e.g. a value moves lists), list the affected pericopes and the migration, so the gold
  fixtures and the spec never disagree.
- **Authority:** content/methodology rulings are made by the project lead (Marcia Suzuki);
  the compiler implements and verifies them.

## Spec version pin (current)
`tagset_version`: `TRIPOD_STA_v2_0`. Vendored + drift-checked in the compiler at `_spec/` (see `_spec/pins.json`; `tripod check-drift` enforces these).

| Schema | Version | sha256 |
| --- | --- | --- |
| `validation-rules.json` | `v0.13` | `0323662a643822d469db257655fcdf9c1450e07eaf69a557a1191ebf6bc3b745` |
| `compilation-log.schema.json` | `v0.7` | `0d7f17d1dc203ae72b4459857ce0135c2ec8f05e044faaabfbb372bd6ad94161` |
| `bcd-delta.schema.json` | `v0.4` | `b6afeceaef7076ef8693316425a794757f3b0230a2a408957bae23e3806baa04` |
| `verification-input.schema.json` | `v1.1` | `03e51d5aa0363df6512a40779fb5858c4bfe60d58025a72afe8f3320623835d1` |
| `approved-enumerations.json` | `v0.10` | `8c3c64f9eaf49958c8453d169ce231565d6bdefc307f699abaf4188cc813dec6` |

Governance data files pinned in `pins.json` sources (not schemas): `coverage-exceptions.json`, `lint-exceptions.json`, `id-alignment-exceptions.json`, **`quarantined-vocabulary.json` (`0.2.0`, SC-0023 + SC-0025)**.

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
| SC-0008 | Canonical-home: reconcile the stale vault `_spec/` (frozen ~SC-0014) + build `check-drift --vault` (the load-bearing half) + retire obsolete templates (minor half); **extended 2026-06-06 (SC-0026 analysis) to also reconcile the stale vault `stas/` COMPILATION-LOGs** (same unguarded-stale-vault pattern). Guardrail VERIFIED already-built (exits 1); real work = fix blind-spot + run it + reconcile. | **APPLIED (compiler half; reconcile/writeback pending)** |
| SC-0009 | Merge PL_HA_ARETZ → PL_LAND_OF_JUDAH (same-referent principle, Layer-3) | SHIPPED |
| SC-0010 | Coverage recorded-exception mechanism + P06 "Israel" epithet-internal ruling | SHIPPED |
| SC-0011 | BCD `gender` frontmatter field (authoritative; replaces the prose-guess) | SHIPPED |
| SC-0012 | Level-3 / §3C content discipline (R1–R5) + the `tripod lint` drift-guard | SHIPPED (lint + discipline + template); map remediation follows |
| SC-0013 | Map content remediation under SC-0012 — P01 reference + P02–P06 roll | P01 SHIPPED; P02–P06 §3C+plain-language APPLIED (pending blessing); §4 dialogue re-atomizing = lead's exegetical pass |
| SC-0014 | Rename SPEECH_ACT `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` → `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (drop "AGENT" jargon) | APPLIED (pending the lead's blessing) |
| SC-0015 | Extend the Level-3 lint to enforce the operating test: flag cross_ref/inter-proposition-link lines + meta/analytical questions in §4, scan questions (not just answers) incl. same-line Q&A, add comma compounds with an entity-list guard; lint-lexicon v0.1.0→v0.2.0 (re-pinned) | APPLIED |
| SC-0016 | Level-3 §4 content sweep under SC-0012/SC-0013 (remove cross_ref/link lines → relocate figure spans; convert meta-questions to payload; atomize compounds) — P01 reference then P02–P06; + `lint-exceptions.json` recorded sign-off (7 ruled keeps) | SHIPPED (fixtures + vault, blessed + merged 2026-06-01) |
| SC-0017 | De-leak: strip process-commentary (SC-IDs, "per the content discipline", "§3C entities only", "X → Proposition N" relocation trails) from the content layers — maps §3C + FOR_MODEL `objects_in_scene._note` — keeping entities + plain considered-absence; + template/discipline-doc hygiene so P07–P14 are born clean | SHIPPED (fixtures + vault — both PRs merged 2026-06-01); **blessed by Marcia 2026-06-01** |
| SC-0018 | Cross-artifact entity-ID alignment: the locked convention (canonical ID = the bare code; the map carries it in the wikilink target up to the first hyphen) + the `tripod id-check` diagnostic verifier (the 5th deterministic check — aligned) + the empty pinned `id-alignment-exceptions.json`. Diagnostic only; fixes no content. The P01–P06 reconciliation of what it surfaces is a separate later human-gated pass. | PROPOSED |
| SC-0019 | Common-Reader Prose Standard: re-voice the conditioning prose (Level 1, scene descriptions, significant-absence notes, register-tagging block) of P01–P06 to the blessed "good study-Bible note for ordinary readers" register (S1–S4; plain ≠ flat). No spec-version bump (free-text + guidance only). | **SHIPPED 2026-06-01** — P01–P06 prose BLESSED + written back (vault PR #8, squash-merged); methodology note + template + Agent-2/3 prompts seeded so P07–P14 are born in-register |
| SC-0020 | Entity-ID reconciliation under SC-0018: three `id-check` engine refinements (`<NS>?` withheld-referent → INFO; note-title-safe slug normalization; **scene-scoped prose-reference parity bar** — an FM scene-entity the map narrates in that scene's §3 prose is ALIGNED) + the ruled signed-off `id-alignment-exceptions.json` coverage-difference one-siders (now incl. 3 P05 cross-scene/FM-only) + the P01 map TM_→TH_ alignment + AUDIT-relic removal. No spec-version bump (validation-rule tweaks + exceptions data + artifact edits). | **SHIPPED 2026-06-01** — + B31 alias & name-binding engine tweak (beings consult `referential_forms`; canonical preserved) + TM_TEN_YEARS retired (TH_ unverifiable) + written back (vault PR #8); `id-check` **6 clean / 0 findings** |
| SC-0021 | Vocabulary consolidation (corpus-independent triage): promote the 11 cleaned tone/pace bares into `approved-enumerations.json` (tone `RISING/STILLED/URGENT`; pace `BRISK/SLOWED/PAUSED/NARROWS/RISES/SETTLES/HOLDS/WIDENS` — locus-stripped, `NARROW` unified into `NARROWS`), restore `fixtures/for-model ≡ vault` (the tone/pace/`LAMENT_FRAMED` triage), and re-point the COMPILATION-LOG `vocabulary_additions` tone/pace to the bares (SC-0007 intake invariant). `approved-enumerations v0.4 → v0.5`, re-pinned. | **MERGED (PR #23, 2026-06-04)** — gate board green (validate 12/12 · lint 6 clean · coverage 6/6 · check-drift · 136/136 tests); tone/pace convergent drift across P01–P06 = 0 |
| SC-0023 | Quarantined-vocabulary mechanism: un-settle the 8 used-once `communicative_function_element` coin-flips SC-0022 erroneously promoted (`TRANSMITS/ANSWERS/PLACES/ANCHORS/INTRODUCES/POSITIONS/DISTRIBUTES/RECITES`) into a pinned `quarantined-vocabulary.json`; new `quarantined` finding severity + corpus `quarantine watch` that surfaces a RECURRENCE (value in ≥2 pericopes) as an explicit notice (not silent exclusion); `promote` gains a `skippedByQuarantine` guard. `approved-enumerations v0.8→v0.9`, `quarantined-vocabulary 0.1.0`, re-pinned. | **MERGED (PR #25, 2026-06-05)**. UNSETTLED/UNRESOLVED_AT_CLOSE tone-pair unify left as a separate Marcia ruling |
| SC-0022 | Vocabulary consolidation (reuse-dependent triage — the enforcement gate): **promote** 56 cleaned bares (13 `scene_kind` + 27 `proposition_kind` + 16 `communicative_function_element`); **enforce** beings `role_in_scene` descriptive→convergent + seed the 21 ruled relations (controlled slot); **schema-drop** place/object/time `role_in_scene`/`function_in_scene` (entries id-only); **deprecate** 133 orphaned superseded values. `approved-enumerations v0.5→v0.8`, `validation-rules v0.7→v0.9`, re-pinned. | **MERGED (PR #24, 2026-06-04)** |
| SC-0024 | Thread A — nested component `action`/`speech_act` collapse: **closed-list** — collapse the six `VOWS_*_BINDING` SPEECH_ACT values to a single `VOWS` (31→26), synced across `validation-rules.json` + `compilation-log.schema.json`; **content** — reduce ~57 sentence-shaped `action` values across P01–P06 to a small reusable verb set (DIRECTED/STATED/VOWED/ASKED/REPORTED/ASCRIBED/IDENTIFIED + bare verbs), each proven by a per-value survival table (sibling slot or map §4 home); **route** the load-bearing vessels detail to a new `drink_source` sibling slot; **hold** 7 load-bearing labels for Thread B; **migrate** P03 (incl. a P03-D3 supersession note). `action` stays uncontrolled (enforcement = SC-0025). `validation-rules v0.10→v0.11`, `compilation-log.schema v0.5→v0.6`, re-pinned. | **MERGED (PR #26, 2026-06-05)** (gate board green: 142 tests) |
| SC-0025 | Action-slot enforcement (the SC-0024 durability follow-on): reclassify the nested component `action` slot from uncontrolled free-text to a controlled bounded-open axis, seeded with the verb set SC-0024 produced, so P07–P14 cannot re-introduce sentence-shaped action values (drift→review→promote-with-provenance). Clean-then-enforce, the same shape as triage→SC-0022. **SC-0024's `action` cleanup is only durable once this lands.** | **MERGED (PR #27, 2026-06-06)** |
| SC-0026 | COMPILATION-LOG schema gate: wire the 6 gold CLs into the gate (validate against `compilation-log.schema.json`) so a malformed CL fails the board; **finding routed to SC-0008** — the vault `stas/` CLs are content-stale (a strict subset of the fixtures), the same unguarded-stale-vault pattern as `_spec/` | **APPLIED (compiler, gate board green: 155 tests)** 2026-06-06 — MERGED (PR #30, origin/main a6a2d04) |
| SC-0027 | **Thread B fidelity model (THE GOAL):** two-axis fidelity flag (`preserve_meaning` × `preserve_form`; the license = `preserve_form=false`) at element/component level + the (α) shared-group-id (a group entry carries the relationship's own flag) + a dangling-group-id integrity check. `validation-rules v0.12→v0.13` (new `fidelity` + `fidelity_group_entry` defs; `fidelity_groups` on `proposition`, `fidelity` on `register_override_entry`); new engine fidelity pass; **P03 vow re-annotated** (2 groups `people_god_inseparability` + `unto_the_end`; `preserve_form=false` ×6; structure-flag; POETIC_SUNG+BLESSING+INTIMATE as preserve_meaning). Held-7 seeding = follow-up. | **APPLIED (compiler, gate board green: 159 tests + 1 skipped)** 2026-06-07 — PR open; held-7 seeding + P03 vault writeback pending |
| SC-0029 | **Held-7 fidelity seeding** (SC-0027 follow-up; the fidelity model on its designated test corpus — `docs/SC-0029-PROPOSAL.md`): annotate the 7 held `action` labels with `fidelity` + 2 `fidelity_groups`. All 7 `preserve_meaning=true`; `preserve_form=false` on courtroom-lament (A, P04), *nokhriya* (B, P06), both blessing wishes (C, P06), comforted (P06); `preserve_form=true` on the two *shifchah* self-abasement elements (D, P06). Figures: wire orphaned `FIG_0085` (Testify-Against-Legal-Image) into P04 FOR_MODEL **+ map** (closes a pre-existing gap); reference already-wired `FIG_0011` (wings) / `FIG_0132` (Amah-Vs-Shifchah) in `meaning`; B's *nokhriya* figure **DEFERRED** (single-verse, recurrence-gated, e.g. Jonah/Genesis). Two new groups: `blessing_reward_and_refuge` (E), `ruth_reply_grace_received_in_self_abasement` (F). **No schema change** (F single-membership → no spec-version bump). Forward flag: #6 is a *mixed-fidelity element* (preserve-token + free idiom in one component); meaning-field workaround now, token-level refinement recurrence-gated. | **APPLIED (compiler; gate board green: validate 6/6 0-block · held-7 still quarantined · gold-diff P04 38→39 · id-check 6 clean 0-dangling · lint 0/7 · coverage 6/6 · 159 tests + 1 skipped; adversarial dangling-group + fidelity-shape confirmed blocking)** **MERGED (compiler PR #35 + vault PR #10, 2026-06-08)** — `fixtures ≡ vault` byte-identical on origin/main |
| SC-0030 | **Level-3 purity** (`docs/SC-0030-PROPOSAL.md`): the fidelity `meaning` free-text + the fidelity FLAGS (introduced by SC-0027/0029) had crept into the FM **Level-3 supervision target**. Remove `meaning` (rationale → governance §9 table); relocate the flags out of the L3 content objects into a **parallel top-level `fidelity` layer** (Option A — Marcia-ruled) — `elements`/`groups`/`structure_flags`/`register_overrides` that reference L3 by `{prop_id, slot, list_position}` (structure by `{prop_id, field}`; override by `{scene_id\|verse}`); L3 reverts to pure inventory. Removed the old `fidelity` + `fidelity_group_entry` $defs, `proposition.fidelity_groups`, `register_override_entry.fidelity`. Engine: ref-resolution pass (dangling component-ref blocks) + dangling-group-id; ajv validates the layer shape; `lintForModel` gains `l3_free_text` (the guard for the vector). Migrated P03/P04/P06 (19 flags relocated, **no L3 content lost**). The SC-0027 model + all A–F/vow rulings unchanged — only placement. `validation-rules v0.13→v0.14`, re-pinned. **OUT of scope:** the ~49 sentence-shaped slot VALUES (separate post-Jonah triage — `[[tripod-sentence-token-triage]]`). | **APPLIED (compiler; gate board green: validate 6/6 0-block · held-7 still quarantined · gold-diff unchanged · id-check 6 clean · lint 0/7 · coverage 6/6 · 163 tests + 1 skipped; adversarial — dangling-ref, dangling-group, ajv-shape, l3_free_text all confirmed blocking; no L3 content lost vs origin/main)** 2026-06-08 — diff for review; vault writeback (3 FMs + `_spec/` schema) pending |

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

## SC-0030 — Level-3 purity: relocate the fidelity apparatus out of the supervision target
- **Date:** 2026-06-08
- **Decided by:** Marcia Suzuki — **Option A** (parallel fidelity layer) ruled in review; sub-points delegated to Architect 11 ((i) move the L1 override flag into the layer + drop its `meaning`; (ii) ref by `{prop_id, slot, list_position}`). The **scope boundary** (sentence-shaped slot values OUT) set by Marcia + the evaluator. Ruling-gate + the relocated-rationale §9 table: `docs/SC-0030-PROPOSAL.md`.
- **Status:** APPLIED (compiler; gate board green) 2026-06-08 — diff for review; vault writeback (3 FMs + `_spec/` schema, the SC-0008 ritual) pending.
- **Type:** schema-shape (FOR_MODEL) + engine + lint. **Fixes a regression introduced by SC-0027/0029** (commentary + conditioning had entered the Level-3 supervision target).
- **The principle:** Level 3 (map + FM) is *only the inventory of propositions the model translates* — the training supervision target. Commentary/conditioning must not live there (it would train the model to emit rationale, not translation).
- **Spec change (exact):** `validation-rules v0.13→v0.14`. Added a top-level `fidelity` layer (`$defs`: `fidelity_layer`, `fidelity_element`, `fidelity_group`, `fidelity_structure_flag`, `fidelity_register_override`, `l3_component_ref`); removed the old `fidelity` + `fidelity_group_entry` `$defs`, `proposition.fidelity_groups`, and `register_override_entry.fidelity`. The layer is strict (ajv-validated shape; **no `meaning` field**). Re-pinned (sha `4784b390…`).
- **Engine:** rewrote the SC-0027 fidelity pass (`vocabulary.ts`) → resolve every layer ref into Level 3 (a dangling component/field/override ref blocks `referential-integrity`) + the dangling-group-id check (every `element.group` resolves). Shape-validation moved to ajv.
- **Lint:** `lintForModel` gains `l3_free_text` — flags a `meaning` key or any prose-shaped value (a space + a lowercase letter) inside a Level-3 `event_specific_slots`. Deliberately does **not** flag UPPER_SNAKE slot values (the post-Jonah triage).
- **Migration:** P03/P04/P06 — 19 `meaning` removed, fidelity flags moved to the layer (P03: 6 el + 2 grp + 1 sf + 1 ro; P04: 1 el; P06: 6 el + 2 grp). **No Level-3 content lost** (deep-compare vs `origin/main` L3-with-fidelity-stripped — identical; all 19 flags preserved). Maps unchanged.
- **Verification:** validate 6/6 0-block (held-7 still quarantined); check-drift clean (v0.14); gold-diff unchanged (fidelity is not on the compared layer); id-check 6 clean / 0-dangling; lint 0/7; coverage 6/6; **163 tests + 1 skipped**. Adversarial (real validate/lint path): dangling component-ref → block; dangling group → block; non-boolean flag → ajv block; `meaning` re-injected into L3 → `l3_free_text`.
- **OUT of scope (deferred):** the ~49 sentence-shaped slot VALUES (`[[tripod-sentence-token-triage]]` — post-Jonah, its own SC; Jonah meanwhile guarded by mapping discipline).

---

## SC-0029 — Held-7 fidelity seeding (the fidelity model on its designated test corpus)
- **Date:** 2026-06-07
- **Decided by:** Marcia Suzuki — each label's preserve/render + the two grouping calls (A–F) ruled in review; the "figure carries the image, `preserve_form=false` frees the wording" resolution for A/B/C; `preserve_form=true` for D's *shifchah* self-abasement; B's figure DEFERRED; the two groups E/F. Architect 11 did the plumbing + figure verification; the ruling-gate is `docs/SC-0029-PROPOSAL.md` (§9 = the rulings + verification).
- **Status:** APPLIED (compiler; gate board green) 2026-06-07 — **diff for review; vault writeback (P04 map + FM, P06 FM) pending** (human-gated).
- **Type:** content/annotation (FOR_MODEL `fidelity` flags + 2 `fidelity_groups`) + one figure-wiring — **no schema change, no spec-version bump** (SC-0027's model already supports it).
- **Summary:** The 7 held `action` labels (quarantined since SC-0024/0025 because meaning and form diverge — their purpose was to be Thread B's first annotated corpus) are seeded with `fidelity`. All 7 `preserve_meaning=true`. `preserve_form=false` on #1 courtroom-lament (P04 1:21), #2 *nokhriya* (P06 2:10), #3 repay + #4 wings (P06 2:12), #5 comforted (P06 2:13); `preserve_form=true` on #6 + #7 (the two *shifchah* self-abasement elements, P06 2:13). The held-7 **stay quarantined** (fidelity ≠ promotion — orthogonal axes).
- **Figures (Marcia's "keep the image, free the wording" resolution):** A → wire orphaned **FIG_0085** (Testify-Against-Legal-Image; `appears-in: P04`, paired `CB_0025` already wired) into P04 FOR_MODEL `figure_flags` **and** the map (frontmatter + §5B) — closes a pre-existing gap (the figure was in neither artifact). C → reference already-wired **FIG_0011** (Wing-of-Refuge). D → reference already-wired **FIG_0132** (Amah-Vs-Shifchah; registers the *shifchah→amah* progression, which reaches forward to 3:9 — reinforcing, not yet load-bearing). B → figure **DEFERRED** (single-verse *nokhriya/hikkirani* wordplay, no recurrence data; the figure-analogue of quarantine; revisit on recurrence, e.g. Jonah/Genesis).
- **Groups (two new, single-membership):** `blessing_reward_and_refuge` (E — P06 P9, members FIRST+SECOND: Boaz's reward and refuge are one prayer); `ruth_reply_grace_received_in_self_abasement` (F — P06 P11, members FIRST+SECOND+THIRD: Ruth receives grace while self-abasing, one bound response). Each member component carries the `fidelity_group` ref (load-bearing) + each group lists `members` (audit), per the vow pattern. **F as one group settles the single-vs-multi membership question: single suffices → no schema change.**
- **Forward flag:** #6 (`STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH`) is a *mixed-fidelity element* — a preserve-token (*shifchah*) + a re-realizable idiom (*dibber al-leb*) in one component, which one `preserve_form` boolean cannot split. The `meaning` field carries the split now (no schema change); a future token-level refinement is recurrence-gated (watch held-out law/poetry, where mixed-fidelity elements will be common).
- **Verification:** validate 6/6 0-block (held-7 still quarantined); check-drift clean (no spec change); gold-diff P04 38→39 matched (FIG_0085; baseline re-recorded), else unchanged; id-check 6 clean / 0 dangling / 0 flag-mismatch (FIG_0085 aligned in both artifacts); lint 0/7; coverage 6/6; 159 tests + 1 skipped. Adversarial (throwaway copies, real `validate` path): a dangling `fidelity_group` ref → block; a malformed component fidelity → `fidelity-shape` block.

---

## SC-0027 — Thread B fidelity model: `preserve_meaning` × `preserve_form` (first applied to the P03 vow)
- **Date:** 2026-06-07
- **Decided by:** Marcia Suzuki — the two Thread C calls + the per-step vow rulings + the genre/pair-scope rulings (2026-06-07); architecture (α) + scope (Option 1) recommended by Architect 10 + the evaluator, confirmed by Marcia in review.
- **Status:** APPLIED (compiler half — schema + engine + P03 vow; gate board green: 159 tests + 1 skipped; validate 6/6, check-drift clean, lint/coverage/id-check/gold-diff exit 0) 2026-06-07 — PR open; **held-7 seeding + the P03 vault writeback pending**.
- **Type:** schema-shape (FOR_MODEL) + new engine validation pass — **THE GOAL** (the fidelity model the interlingua exists to serve).
- **Summary:** The two-axis fidelity flag — `preserve_meaning` (the claim must survive translation) × `preserve_form` (false = the Performer may re-realize the wording; the "means, not mandate" license). Attached at the element/component level; the (α) shared-group-id mechanism carries relationship-level claims (a group entry's own fidelity) referenced by member elements. First applied to the P03 vow.
- **Spec change (exact):** `validation-rules v0.12→v0.13`. New `$defs`: `fidelity` (required boolean `preserve_meaning`/`preserve_form`; optional `meaning`, `fidelity_group`) and `fidelity_group_entry` (`group_id` + the relationship's `fidelity`; optional `members`). `proposition` gains optional `fidelity_groups`; `register_override_entry` gains optional `fidelity` (both strict). Component-level `fidelity` + the structure-flag ride in the permissive `event_specific_slots`.
- **Validator impact:** new engine fidelity pass (`vocabulary.ts`) — validates fidelity-object shape wherever it appears in the permissive slots, and runs the **dangling-group-id integrity check** (every referenced `fidelity_group` must resolve to a declared group; pericope-wide, since groups bind across propositions). New finding code `fidelity-shape`. Strict-def fidelity (groups, register) is ajv-validated.
- **Artifact migration:** P03 FOR_MODEL re-annotated — the vow: `preserve_form=false` on all six rungs; two `fidelity_groups` (`people_god_inseparability` = rungs 3+4 / `unto_the_end` = 5+6; accompaniment 0+1 ungrouped, per "group iff the text structurally binds, never for symmetry"); a `vow_structural_form_fidelity` structure-flag (`preserve_meaning=true`: the escalation must survive); S2 override → `genre_group_override=POETIC_SUNG` + `genre_override=BLESSING` + `override_value=INTIMATE` carrying `preserve_meaning=true` (genre+register must survive; blessing-dominant + a curse-oath note). `NOT_TO_BE_NORMALIZED` (unimplemented README note) is superseded by the `preserve_form=true` pole.
- **Deferred (own follow-up):** seeding the held-7 with fidelity (each one's preserve/render = Marcia's call); the **P03 vault writeback** (fixture↔vault sync owed — SC-0008 discipline); the single-vs-multi group-membership question (the vow needs only single; revisit if a held-7 case needs two).
- **Version:** `v0.12 → v0.13` (sha256 `0323662a643822d469db257655fcdf9c1450e07eaf69a557a1191ebf6bc3b745`). Re-pinned.
- **Verification:** P03 re-validates block-clean (spec v0.13); the dangling-group-id check fails a broken ref (test) and passes the two real groups; a malformed component fidelity → `fidelity-shape` block (test); 159 tests + 1 skipped; check-drift clean; corpus gates exit 0; gold-diff unchanged (P03 100%).

---

## SC-0026 — COMPILATION-LOG schema gate (turn CL validation on)
- **Date:** 2026-06-06
- **Decided by:** recommended by Architect 10, confirmed by Marcia in review (2026-06-06) — scope: schema gate only; vault-CL staleness → SC-0008
- **Status:** APPLIED (compiler, gate board green: 155 tests · validate 6/6 FOR_MODEL + 6/6 CL · check-drift clean · lint/coverage/id-check/gold-diff exit 0) 2026-06-06 — MERGED (PR #30, origin/main a6a2d04)
- **Type:** gate-checks (test wiring; no schema change)
- **Summary:** Wire the six gold COMPILATION-LOGs (`fixtures/compilation-log/P01–P06`) into the gate so each is validated against `compilation-log.schema.json` (v0.7) on every `npm test`, exactly as the six FOR_MODELs already are. The CL-validation machinery already existed (`validateArtifact` dispatches the CL schema at `src/engine/validate.ts:33-34,76`; `tripod validate <dir>` already discovers CLs) — SC-0026 adds the missing **gate test** (6 positive + a vendored-count check + 1 negative) so a malformed CL fails the board instead of entering the corpus as unguarded "provenance."
- **The seam (why SC-0026, not SC-0008):** SC-0026 only turns a check ON against the already-correct schema (the gate-checks side of the seam test). It changes no schema and no data.
- **Finding surfaced (routed to SC-0008, NOT fixed here):** turning CL validation on is **green** — all 6 CLs are *shape*-clean in both trees. But the vault `stas/` CLs are a **strict subset** of the compiler fixtures (vault-only keys = 0 across all 6; each missing `vocabulary_additions.role_in_scene_beings`, 5/6 also missing the `vocabulary_additions.*_elements` breakdown; 54–242 changed lines per pericope). That is **content** staleness, invisible to a schema gate — the 4th unguarded-authoritative-artifact instance, sibling to the stale vault `_spec/`. **Routed to SC-0008** (writeback the 6 vault CLs + a `stas/` content guardrail). One concern per cycle.
- **Spec change (exact):** none — no `validation-rules.json` / `_spec/` edit, no `pins.json` bump.
- **Artifact migration:** none (no fixture content changed).
- **Validator impact:** none new in the engine; the existing CL structural pass is now exercised by the durable test gate.
- **Version:** no spec-version bump.
- **Verification:** `npm test` 147→155 (6 CL fixtures + vendored-count + 1 negative); `tripod validate fixtures/compilation-log/` → 6 valid · 0 block; the negative case (drop required `sta_id`) → a located `block` schema finding naming `sta_id`; `check-drift` clean; `validate fixtures/for-model/` unchanged (6 valid · 0 block · 0 drift · 15 quarantined); `lint/coverage/id-check/gold-diff --corpus` exit 0.

---

## SC-0024 — Thread A: nested component `action` / `speech_act` collapse (REDUCE, not promote)
- **Date:** 2026-06-04
- **Decided by:** Marcia Suzuki (ruled the whole Thread A set: vow collapse; keep the speech_act suffix-variants — same-act-vs-different-act; hold 7 load-bearing labels for Thread B; D1 split — route the load-bearing vessels detail to a sibling slot, collapse the incidental map-only ones; vessels option (a) descriptive slot + the registry gap flagged for a future BCD-delta; courtroom-lament held on the *ʿanah b-* legal/affliction split; audit-log handling option (a); escalate `action` enforcement to a named SC-0025). The compiler implemented + verified.
- **Status:** MERGED (compiler PR merged; PR#/date in the SC-ID allocation-ledger row above).
- **Type:** closed-list change (`speech_act`) + content edit (`action`, uncontrolled)
- **Summary:** The SC-0021/0022 triage cleaned the top-level bounded-open slots but never reached the `action`/`speech_act` slots **nested inside proposition `*_components` arrays**. SC-0024 collapses them: the six `VOWS_*_BINDING` SPEECH_ACT values → one closed-list `VOWS` (31→26), and ~57 sentence-shaped `action` values across P01–P06 → a small reusable verb set, each reduction proven by a per-value **survival table** (the dropped detail must survive in a named sibling slot or map §4 line, else it is held).
- **Rationale:** A sentence-shaped value is never a reusable type; the nested slots were the last uncollapsed layer. Because `action` is free text, the gates **cannot** verify these collapses — so the proof is the survival table (`docs/THREAD-A-PROPOSAL.md`), not gate-green. The vow's six speech-acts are the *same* act (vowing) differing only by domain → collapse; the rhetorical-question suffix-variants are *different* illocutionary acts → kept. 7 labels where preserve-meaning/preserve-form come apart (courtroom lament; wings-of-refuge blessing; *shifchah/shifchot*; *nokhriya*) are **held** as the Thread B starter corpus.
- **Spec change (exact):**
  - `validation-rules.json` `closed_lists.SPEECH_ACT`: remove `VOWS_IDENTITY_BINDING`, `VOWS_ROAD_BINDING`, `VOWS_RESIDENCE_BINDING`, `VOWS_PEOPLE_BINDING`, `VOWS_GOD_BINDING`, `VOWS_PLACE_OF_BURIAL_BINDING`; add `VOWS`. 31 → 26.
  - `compilation-log.schema.json` `speech_act_value.enum`: same edit (kept in sync — SC-0014 precedent).
  - `action` is **uncontrolled free text** → no enum/schema change; the reductions are content edits. (Making `action` controlled = SC-0025.)
- **Artifact migration:**
  - **P03 FOR_MODEL:** vow `speech_act` ×6 → `VOWS`; vow `action` ×6 → `VOWED`.
  - **P01–P06 FOR_MODELs:** ~57 `action` reductions to the reusable verb set (DIRECTED/STATED/VOWED/ASKED/REPORTED/ASCRIBED/IDENTIFIED/REFUSED/PROPOSED/GREETED/BLESSED/PERMITTED/POSITIONED/INTRODUCED/PLACED/NAMED/SAW/WENT_OUT/WALKED + pre-existing bare verbs). 7 held labels untouched.
  - **P06 P4 FOR_MODEL:** vessels routed to a new `drink_source: WATER_VESSELS` sibling slot (the vessels are an unregistered referent — a registry gap flagged for a future BCD-delta, not in scope here).
  - **P03 COMPILATION-LOG:** `speech_act_values_used` six → `VOWS`; a **supersession note** appended to decision P03-D3 recording that the collapse incurs no loss (FIG_0074 + `vow_structural_form` + `list_position` carry the six-way distinction; verified FIG_0074 fires independently of speech_act values). Original P03-D3 reasoning retained as provenance.
  - The CLs' descriptive `action` gap-hints are a frozen compile-time record (already divergent from the FMs, e.g. `DIVINE_AGENT` vs `YHWH`; nothing validates them against FM actions) — left as historical.
- **Validator impact:** none new — the FM validator already enforces SPEECH_ACT as a closed list; `VOWS` now passes, the six `VOWS_*_BINDING` now block (correct).
- **Version:** `validation-rules.json v0.10 → v0.11` (sha256 `bf25ebb116e4e564a5e546304e38838e0321ac4c6de2403e4b3e69b700ed3179`); `compilation-log.schema.json v0.5 → v0.6` (sha256 `cb9c5c8c1a031b468597dcae601f3334f6e70bea393f19dfb88f4d421e3889e0`). Both re-pinned.
- **Verification:** 142 tests · validate 6/6 (0 block · 0 drift · 8 quarantined unchanged) · lint 0/7 accepted · coverage 6/6 (245/245) · id-check 6 clean · gold-diff baseline (exit 0) · check-drift clean. The `action` slot went from ~50 one-offs to a reusable set with exactly the 7 held labels remaining sentence-shaped (verifiable: `grep '"action"'`).
- **Discovered (pre-existing, OUT OF SCOPE — flagged for a governed follow-on):** all 6 COMPILATION-LOGs carry `vocabulary_additions.role_in_scene_beings`, but `compilation-log.schema.json` (`additionalProperties:false`) lacks that property → every CL is invalid against its own schema. An SC-0022 residue (the role_in_scene_being intake slot was never added to the CL schema); latent because the gate board does not validate CLs. Not touched by SC-0024.

## SC-0025 — Action-slot enforcement (the SC-0024 durability follow-on)
- **Date:** 2026-06-05
- **Decided by:** Marcia Suzuki (approved option A: held-7 **quarantined** not seeded; restore the SC-0007 intake invariant by declaring `action_values` in all 6 CLs; the SC-0025/SC-0026 seam holds — declaring provenance in a CL is *schema-says*, not *gate-checks*). The compiler implemented + verified.
- **Status:** MERGED (compiler PR merged; PR#/date in the SC-ID allocation-ledger row above).
- **Type:** axis reclassification (`action` uncontrolled → bounded-open convergent) + compilation-log schema gap fix (`role_in_scene_beings`)
- **Summary:** Reclassify the nested component `action` slot from uncontrolled free-text to a **controlled bounded-open convergent axis**, seeded with the 31 SC-0024-cleaned verbs; the 7 held sentence-shaped labels are **quarantined** (the Thread B corpus — deliberately unsettled, not seeded as types). The drift engine now reaches the nested `event_specific_slots.*_components[].action` values. Also fixes the `role_in_scene_beings` schema gap SC-0024 flagged. **Does NOT** turn on gate-board CL validation — that stays SC-0026 (one concern per gate cycle).
- **Rationale:** SC-0024 *reduces* `action` but the slot stays uncontrolled, so P07–P14 could re-introduce sentence-shaped values and the slot would re-dirty — enforcement prevents that. The held-7 are quarantined, not seeded, because seeding would re-bless sentence-shaped values into the cleaned slot; quarantine hands them to Thread B intact and **pre-judges nothing** (the reason names the meaning/form divergence, not a fate). Clean-then-enforce, the SC-0021/0022 shape.
- **Spec change (exact):**
  - `validation-rules.json` `drift_detector.canonical_p01_enumerations`: add `action` (P01 seed ARRIVED_AT/TOOK_AS_WIFE/WERE_AT). No closed-list change — `action` is bounded-open. `v0.11 → v0.12`.
  - `approved-enumerations.json`: add the `action` axis (31 verbs, P01–P06; `axisClass` auto-classifies non-`_examples`/non-`referential_form` as convergent). `v0.9 → v0.10`.
  - `quarantined-vocabulary.json`: add the `action` axis (the 7 held). `0.1.0 → 0.2.0`.
  - `compilation-log.schema.json` `vocabulary_additions`: add `action_values` (intake slot) **and** `role_in_scene_beings` (the SC-0024-flagged gap fix). Additive, optional; required set unchanged. `v0.6 → v0.7`.
  - Engine (`vocabulary.ts`): fold the `action` drift check into the existing `event_specific_slots` walk — one walk, one added key-targeted leaf rule, `typeof`-string-guarded. `promote.ts`: map `action_values → action`. Quarantine display message made axis-neutral (it called every quarantined value a "used-once coin-flip" — wrong for the action held-7). Skeleton (`complog.ts`) unchanged — both new CL properties are optional; the skeleton emits required-only.
- **Artifact migration:**
  - **All 6 COMPILATION-LOGs:** declare `action_values` (each pericope's first-introduced verbs, 31 total) to restore the SC-0007 intake invariant — the registry must be reconstructible from the CLs (P01's canonical seed *is* CL-declared, so `action` must be too; precedent SC-0021/0022 re-pointed CLs when adding axes). Surgical insert; **P03's pre-existing `*_elements` divergence left untouched** (SC-0026's).
  - **FOR_MODELs:** none — the 31 seeded approved + 7 quarantined cover the whole corpus → **0 new drift**.
- **Validator impact:** `action` now drift-checked (bounded-open); the 7 held surface as `quarantined` notices (never block, never silently approved); recurrence in P07–P14 flags RECURS.
- **Version:** `validation-rules.json v0.11 → v0.12` (sha `61bcbb3b75b5d5fdd6adf161e89e0bc193764ae081b6606b7aa0cf31727464bc`); `approved-enumerations.json v0.9 → v0.10` (sha `8c3c64f9eaf49958c8453d169ce231565d6bdefc307f699abaf4188cc813dec6`); `quarantined-vocabulary.json 0.1.0 → 0.2.0` (sha `dab5f57ba152d83686181c4d56281c07e5fb5cc9299c54426b3a4522f00eecf8`); `compilation-log.schema.json v0.6 → v0.7` (sha `0d7f17d1dc203ae72b4459857ce0135c2ec8f05e044faaabfbb372bd6ad94161`). All re-pinned.
- **Verification:** 147 tests · validate 6/6 (0 block · 0 drift · **15 quarantined** = 8 comm-func + 7 action) · lint 0/7 · coverage 6/6 (245/245) · id-check 6 clean · gold-diff baseline (exit 0) · check-drift clean. Three merge checks green: the SC-0007 convergence test (invariant **restored** by the CL declarations, not silenced); the predicted 8→15 quarantine count; and the load-bearing bare-verb fact now a **gated** test (79 `action` occurrences, all `^[A-Z_]+$`, parsed not grepped).
- **Vault writeback (pending):** the 6 CLs (FMs unchanged) — same no-clobber discipline as SC-0024's `66c58f1` (diff-first byte-identity, let the cron land it, no manual push to vault `main`); the P03 CL writeback must be surgical (only `action_values`, leave the `*_elements` divergence for SC-0026).

## SC-0023 — Quarantined-vocabulary mechanism: un-settle the 8 used-once comm-func coin-flips (surface recurrence)
- **Date:** 2026-06-04
- **Decided by:** Marcia Suzuki (ruled option (a) — a quarantine exception file that surfaces a recurrence as an explicit notice, not mere exclusion from the drift gate; its own SC; full gate board; leave the `UNSETTLED/UNRESOLVED_AT_CLOSE` tone-pair unify as a separate ruling, not folded in); the compiler implemented + verified.
- **Status:** MERGED (compiler PR merged; PR#/date in the SC-ID allocation-ledger row above).
- **Type:** other (governed exception mechanism + registry correction)
- **Summary:** SC-0022 erroneously promoted **all 16** `communicative_function_element` verbs as settled, including the **8 used-once coin-flips** Marcia had quarantined for the P08–P14 frequency revisit. SC-0023 un-settles those 8 into a pinned `quarantined-vocabulary.json` and adds a `quarantined` finding severity + a corpus `quarantine watch`, so a recurrence is surfaced as an **explicit notice**, not silently excluded.
- **Rationale:** Marking a quarantined coin-flip *approved* defeats the quarantine — a later reuse would not drift, so the revisit signal is lost and the one-off gets cemented by accident. Caught in the post-SC-0022-merge spot-check (the green board hid it; only reading the **raw** promoted list found it — the lesson: gates prove schema consistency, not that the promoted set matches the rulings). The quarantine must be a recorded **third state** — neither approved-and-silent nor a failing drift — that makes recurrence visible.
- **Spec change (exact):**
  - **New pinned `_spec/quarantined-vocabulary.json` (`0.1.0`):** the 8 used-once comm-func verbs — `TRANSMITS`(P01), `ANSWERS`(P02), `PLACES`(P03), `ANCHORS`/`INTRODUCES`/`POSITIONS`(P05), `DISTRIBUTES`/`RECITES`(P06) — each with reason + provenance. Added to `pins.json` sources; `check-drift` verifies it (20 pins now).
  - **`approved-enumerations.json` `v0.8 → v0.9`:** removed those 8 from `communicative_function_element` (16 → **8 recurring**: OPENS/ESTABLISHES/WITHHOLDS/PLANTS/CLOSES/ADVANCES/REACTIVATES/STAGES). Re-pinned.
  - **Engine:** new `quarantined` severity (`report.ts`, + optional `value` on `Finding` for aggregation); `vocabulary.ts` emits a `quarantined` notice (never `drift`, never silently-approved) for a quarantined convergent value; `report.ts` `quarantineWatch()` aggregates across artifacts and flags **RECURS** when a value appears in ≥2 pericopes; the `validate` CLI prints the corpus quarantine watch + a `quarantined` count. `promote.ts` `planPromotion` gains a `skippedByQuarantine` bucket — a quarantined value is **never** auto-promoted regardless of status.
  - **Fixture CL intake:** the 5 CLs' `communicative_function_elements` reduced to the recurring approved values (P02→[CLOSES], P03→[ADVANCES], P04→[REACTIVATES, STAGES], P05→[], P06→[]); the quarantined verbs are no longer listed as promotable.
- **Artifact migration:** **no FOR_MODEL / map change** — the 8 verbs are still *used* in the maps (each once); only their registry status changes approved → quarantined. `fixtures ≡ vault` for FOR_MODELs is unaffected (no FM edit; no vault writeback needed for this SC).
- **Validator impact:** comm-func use of a quarantined value → `quarantined` notice (not drift, not block); the corpus quarantine watch flags a recurrence (≥2 pericopes) as RECURS = the revisit trigger. `validate` 6/6 · **0 drift · 8 quarantined** · 22 descr. The "0 *convergent drift*" gate is unchanged (quarantined ≠ drift).
- **Version:** `approved-enumerations.json` `v0.8 → v0.9` (sha256 `56444d9bc43b00d523461ade1d44db8b8f7204b56465e4f0a30ae3c0000a4610`); new `quarantined-vocabulary.json` `0.1.0` (sha256 `97636c1b18fc0191780683ab3df25249f9d8e0369bc041382dff157328b09783`). `validation-rules.json` unchanged (`v0.10`).
- **Verification:** full gate board green — `vitest` **142/142** (+6 SC-0023 tests: un-settled-and-disjoint · quarantined-not-drift · watch-parks-once · watch-RECURS-on-2nd-pericope · promote-skips-quarantined) · `validate` 6/6 (0 drift · 8 quarantined) · `lint --corpus` 0/7 · `coverage --corpus` 6/6 · `id-check --corpus` 6 clean · `gold-diff` baseline unchanged (comm-func is a judgment field) · `check-drift` 20 pins clean.
- **NOT in scope (separate Marcia ruling):** the `UNSETTLED_AT_CLOSE` / `UNRESOLVED_AT_CLOSE` tone-pair unify-or-distinguish call (both sit in `approved-enumerations` from SC-0006; SC-0023 deliberately left them untouched).

---

## SC-0022 — Vocabulary consolidation: enforce the cleaned interlingua (promote · enforce beings · schema-drop · deprecate)
- **Date:** 2026-06-04
- **Decided by:** Marcia Suzuki (the reuse-dependent triage rulings 2026-06-03/04 — the `scene_kind`/`proposition_kind`/`communicative_function` collapses, the 21 beings relations, the place/object/time role-drop "loses nothing", and the deprecation = **delete** ruling 2026-06-04); the compiler implemented + verified them.
- **Status:** MERGED (compiler PR merged; PR#/date in the SC-ID allocation-ledger row above).
- **Type:** bounded-list change + axis reclassification + schema-shape (one consolidation PR, staged in 5 commits)
- **Summary:** Make the reuse-dependent vocabulary triage real — promote the cleaned values, enforce the beings participant-role as a controlled 21-relation slot, drop the redundant place/object/time role/function fields, and deprecate the orphaned old forms. The slots P07–P14 are measured against become a constraint, not a convention. Sits on top of SC-0021 (#23 merged first; SC-0022's promote list deliberately excludes tone/pace).
- **Rationale:** The vault triage (`tripod_cleanup_log.md`) collapsed the low-reuse one-off bounded-open values into reusable types a model can generalize, reduced the beings role gloss to 21 standing relations, and proved the place/object/time role/function glosses content-free (their meaning is owned by registry-kind + the level-3 statement slots + figures/threads). Until promoted + enforced these were a convention nothing stopped the unwritten pericopes from regenerating; SC-0022 is the gate that makes them enforced.
- **Spec change (exact), staged:**
  - **(1) Promote** — `approved-enumerations.json` += 56 values (`scene_kind`×13, `proposition_kind`×27, `communicative_function_element`×16), `sc_ref: SC-0022`, provenance = first-seen FOR_MODEL; re-derived from live `validate` drift (106 instances). COMPILATION-LOG `vocabulary_additions` re-pointed (SC-0007 intake invariant). `v0.5 → v0.6`.
  - **(2) Enforce beings** — drift-detector seed key `role_in_scene_examples_being → role_in_scene_being` (axisClass keys off the `_examples` suffix → flips descriptive→convergent), reseeded with P01's relations; new `role_in_scene_being` axis in `approved-enumerations.json` seeded with all 21 ruled relations; `vocabulary.ts` drifts beings role against it; `promote.ts` `VA_KEY_TO_AXIS` += `role_in_scene_beings`; each CL declares its `approved_in` roles. `validation-rules v0.7 → v0.8`; `approved-enumerations v0.6 → v0.7`.
  - **(3) Schema-drop** — scene_places/scene_objects/scene_times entry schemas now id-only (`role_in_scene`/`function_in_scene` removed from `required` + `properties`; entries stay `additionalProperties:false` → the fields are forbidden); removed the 3 orphaned drift-detector `_examples` seeds; `vocabulary.ts` drops the 3 drift() calls (loops kept for referential integrity); `skeleton.ts` emits id-only entries. `validation-rules v0.8 → v0.9`.
  - **(4) Deprecate** — removed 133 orphaned superseded values unused by any pericope (scene_kind 33→16 · proposition_kind 89→35 · communicative_function_element 56→16 · tone_element 26→17 · pace_element 24→11; arc/context/presence/role unchanged). `approved-enumerations v0.7 → v0.8`. Old→new mapping preserved in `tripod_cleanup_log.md` + git history (Marcia ruled delete over a deprecated-flag crosswalk).
  - **(5) Seed tidy** — refreshed the inert drift-detector `canonical_p01_enumerations` fallback (scene_kind/proposition_kind/communicative_function_element) to P01's cleaned values so the never-consulted seed no longer names deprecated forms (the live baseline is `approved-enumerations.json`; this fires only if an axis is ever absent there). `validation-rules v0.9 → v0.10`.
- **Artifact migration:** `fixtures/for-model/` P01–P06 synced byte-identical to the triaged vault (cleaned scene/prop/comm-func + the 21 beings relations), then the place/object/time role/function fields stripped (56 fields) — so `fixtures` now intentionally **lead** the vault on the field-drop. COMPILATION-LOGs re-pointed (scene/prop/comm-func + the new `role_in_scene_beings` intake; P02 stays the grandfathered PROPOSED exception). `gold-diff-baseline.json` re-baselined (agreement unchanged — P01 100/P02 90/P03 100/P04 95/P05 98/P06 96; only judgment-placeholder counts fall as the role gaps go). **Vault writeback** (remove the place/object/time fields from the vault `stas/` FOR_MODELs, restoring `fixtures ≡ vault`) is the **human-gated follow-up** — pause Obsidian auto-backup, reviewed vault PR — NOT done here.
- **Validator impact:** beings `role_in_scene` outside the 21 → convergent drift (review signal); place/object/time `role_in_scene`/`function_in_scene` now **BLOCK** (additionalProperties); reusing a deprecated old value → drift. Descriptive (open) findings across P01–P06 fall **158 → 22** (only `referential_form` remains open by design).
- **Version:** `approved-enumerations.json` `v0.5 → v0.8` (sha256 `aa1a62d00b442d5841a3966309a131e50a581f0eba2ba973a7729a38a6e79eee`); `validation-rules.json` `v0.7 → v0.10` (sha256 `2d141a58513fe520e81148fd05f8340003fceececd0f3a05e2df3cc9c937cb4e`). Sibling schemas (compilation-log v0.5, bcd-delta v0.4, verification-input v1.1) unchanged.
- **Verification:** full gate board green at each stage — `validate` 6/6 (0 block · 0 drift) · `lint --corpus` 0 drift / 7 accepted · `coverage --corpus` 6/6 block-clean (245/245) · `id-check --corpus` 6 clean · `gold-diff` baseline match · `check-drift` clean · **`vitest` 136/136**. Promote list independently re-derived from live drift; every removed value asserted unused (no FOR_MODEL, no CL) before deprecation.

---

## SC-0021 — Vocabulary consolidation: promote the cleaned tone/pace bares + restore fixtures ≡ vault
- **Date:** 2026-06-03
- **Decided by:** Marcia Suzuki (the triage rulings — tone/pace locus-strip, the `NARROW`↔`NARROWS` UNIFY, `scene_communicative_purpose` no-op, `LAMENT_FRAMED` removal; 2026-06-02/03); the compiler implemented + verified them.
- **Status:** SHIPPED
- **Type:** bounded-list change (convergent L1-element promotion)
- **Summary:** Promote the 11 corpus-independent triage bares into `approved-enumerations.json` and re-establish the `fixtures ≡ vault` + COMPILATION-LOG intake coherence the triage deferred.
- **Rationale:** The tone/pace triage (vault `tripod_cleanup_log.md`) stripped locus suffixes from the L1 mood axes (`BRISK_CHRONICLE_OPENING → BRISK`, `NARROWS_AT_RECOGNITION_FAILURE → NARROWS`, …), dropped redundancies, and — Marcia's UNIFY ruling — merged the `NARROW`(state)/`NARROWS`(movement) split into one bare `NARROWS` (zero full-14 attestation that the contrast does any work). The cleaned bares were convergent drift pending promotion; this is the single governed consolidation that promotes them, re-pins, and runs the full gate board (deferred per-batch to avoid governance churn).
- **Spec change (exact):** `axes.tone_element` += `RISING`(P03), `STILLED`(P04), `URGENT`(P02); `axes.pace_element` += `BRISK`(P02), `SLOWED`(P02), `PAUSED`(P03), `NARROWS`(P03), `RISES`(P04), `SETTLES`(P04), `HOLDS`(P05), `WIDENS`(P05) — all `sc_ref: SC-0021`, provenance = each value's first-seen FOR_MODEL. `version v0.4 → v0.5`, `date → 2026-06-03`, `growth_log` appended. Old locus values (`BRISK_CHRONICLE_OPENING`, …) left in the registry as orphaned-historical (a deprecation sweep is a separate later pass).
- **Artifact migration:** `fixtures/for-model/` P02–P06 synced byte-identical to the triaged vault (tone/pace + `LAMENT_FRAMED` removal). COMPILATION-LOG `vocabulary_additions` tone/pace re-pointed to the bares (CONFIRMED) so the **SC-0007 intake invariant** holds — each pericope's CL declares exactly its `approved_in` convergent values (`drift.test.ts` guards this). The vault canonical FOR_MODELs were already triaged (vault `main`, per-batch approved); the vault's reduced CLs (tone/pace dropped) + the stale vault `_spec/approved-enumerations.json` `v0.1` are a separate deferred `--vault` reconcile.
- **Validator impact:** none (no rule change). The 11 bares move from convergent-drift → approved; P01–P06 now validate with **0 tone/pace convergent drift**.
- **Version:** `approved-enumerations.json` `v0.4 → v0.5` (sha256 `c7d32fb4e8004913406bab4f8e543e6ca43443911585581c3212431235b94258`). `validation-rules.json` unchanged (`v0.7`).
- **Verification:** full gate board green — `validate` 12/12 (0 block · 0 drift) · `lint` 6 clean · `coverage --corpus` 6/6 block-clean · `check-drift` (19 pins; approved-enumerations pin `v0.5`) · `gold-diff` baseline unchanged · **`vitest` 136/136**.

---

## SC-0020 — Entity-ID reconciliation (under SC-0018): two `id-check` engine tweaks + ruled exceptions + P01 map alignment
- **Date:** 2026-06-01
- **Decided by:** Marcia Suzuki (the rulings — "follow your disposition", 2026-06-01); the compiler implemented + verified them.
- **Status:** **APPLIED (P01 worked reference + engine + exceptions) — pending the lead's blessing.** The two engine
  tweaks, the signed-off exceptions, the P01 map TM_/TH_ alignment, and the P01 AUDIT-relic removal are in the
  compiler fixtures + tooling. **DEFERRED to the post-blessing roll/writeback:** the B31 BCD alias (A2, a vault
  edit), the P02–P06 roll (no other map carries the same issues beyond the deferred B31), and the vault writeback.
- **Type:** validation-rule tweak + registry/exceptions data + artifact (map) edits. **No closed-list / schema-shape
  change. No spec-version bump.** Touches only entity *references* (codes/slugs/links) + the `id-check` engine +
  the pinned exceptions file.
- **Principle (SC-0018 carried forward):** the prose Meaning Map and the FOR_MODEL are two halves of one training
  pair; an entity named in one must be the same canonical code the other uses. SC-0018 surfaced the P01–P06
  inventory; this entry applies the lead's rulings on it and removes two classes of false positive at the engine.
- **A1 — two `src/engine/id-align.ts` tweaks (the standing-gate corrections):**
  1. **`<NS>?` is a legal withheld-referent, not an error.** A schema-legal code whose tail after the namespace
     prefix is exactly `?` (e.g. `B?`, from `b_code` `^B(\d+|\?)$`) is an INTENTIONAL withheld referent — the
     artifact deliberately declines to bind the slot to a registered entity (P06's deceased-husband, the
     SC-0016-blessed "her husband (pair withheld; see P01-D2)"). New predicate `isWithheldReferent` + a new INFO
     finding `WITHHELD_REFERENT` (`WithheldReferentFinding`, `counts.withheld`). It is pulled OUT of
     reference-integrity (no more `UNKNOWN_CODE`) **and** out of the structural symmetric difference (it can never
     align — the other side legitimately lacks it). **No content change to P06.** Resolves the P06 `B?` ref-integrity
     ERROR + its S2 misalignment.
  2. **Note-title-safe slug normalization for name-binding.** Obsidian note titles (hence wikilink slugs) cannot
     carry an apostrophe `'` or a forward slash `/`; the BCD canonical names do ("Naomi's Dwelling…", "His People /
     People of YHWH"). New `normalizeSlug` (strip `'`, collapse `/`→`-`, collapse repeats) applied to **both** the
     found slug and the expected slug in the B/PL/O/TM/I name-binding compare. **No slug/content edit** — editing the
     slug would break the wikilink unless the note were also renamed; this is the right fix. Resolves the
     `PL_NAOMIS_DWELLING` (P05) + `PL5_BOAZ_PORTION` (P05, P06) apostrophe mismatches.
  Both tweaks are covered by new `tests/id-align.test.ts` cases (`normalizeSlug` units + a name-binding-accepts case;
  `isWithheldReferent` units + B?-is-INFO-not-error/not-misalign cases; the real-fixture integration locks for
  P01/P05/P06 updated to the post-tweak behaviour).
- **A2 — B31 name (registry, vault-side): DEFERRED.** Ruled call = add `People-of-YHWH` (and `People of YHWH`) to
  B31's BCD `aliases` (vault `bcd/beings/`) + re-extract/re-pin `ruth.aliases.json`. This is a vault edit; it is
  **out of scope for this fixtures-only chunk** and rides the post-blessing writeback. The interim `id-check --corpus`
  still shows the B31 name-binding (P02 @S1, P03 @S2) — expected and noted.
- **A3 — the place/time one-siders → signed-off exceptions (`_spec/id-alignment-exceptions.json`).** The legitimate
  map↔FOR_MODEL coverage differences (off-stage/contextual referents) ruled ACCEPTED, taken verbatim from the
  `id-check --corpus` output, each with `accepted_by:"Marcia Suzuki"`, `accepted_on:"2026-06-01"`, `sc_ref:"SC-0020"`:
  - `PL_LAND_OF_JUDAH` (P03, **S1 + S2** — two entries, FM_NOT_MAP) — the covenant land they return *to*; referenced, not scene-present.
  - `TM_BARLEY_HARVEST_BEGINNING` (P04, S3, FM_NOT_MAP) — the harvest frame named at the close; FM-structural only.
  - `PL_AMONG_SHEAVES` (P06, S4, FM_NOT_MAP) — the gleaning locus in Boaz's command; FM-structural only.
  - `PL1` (P04, S2, MAP_NOT_FM) + `PL2` (P04, S1, MAP_NOT_FM) — the already-documented MM↔gold coverage difference (the P04 95% gold-diff).
  The file goes **EMPTY → 6 entries**; re-pinned **0.1.0 → 0.2.0** (sha256 `4247b9aa46a813a5fd92a2307048b412e8bfade70e31679cfb6ed78f8f1eafcc`) in `_spec/pins.json`; `check-drift` clean.
- **A4 — the TM_/TH_ same-referent (P01) → align the map to the FOR_MODEL.** P01's "about ten years" was
  `TM_TEN_YEARS` in the map §3C but `TH_TEN_YEARS_APPROXIMATELY` in the FOR_MODEL. Ruled canonical = the
  thematic-object form (the map's own §3C note calls it "a length of time named inside the scene — not the scene's
  time-setting"). Edited the P01 **map** §3C wikilink `[[TM_TEN_YEARS-About-Ten-Years]]` →
  `[[TH_TEN_YEARS_APPROXIMATELY-About-Ten-Years]]` (same §3C placement + "About-Ten-Years" slug; only the code
  aligns). After the edit the pair no longer splits as a LIKELY_SAME_REFERENT; `TH_TEN_YEARS_APPROXIMATELY` stays
  `unverifiable` (no TH_ registry) — acceptable, by design. **Vault-note situation (surfaced for the lead, NOT
  acted on):** `bcd/times/TM_TEN_YEARS-About-Ten-Years.md` EXISTS; `TH_TEN_YEARS_APPROXIMATELY` is unregistered (a
  pericope-local TH_ overlay, correctly unverifiable). After A4, P01 was `TM_TEN_YEARS`'s only structural user (the
  P05 compilation-log/BCD-DELTA cite it only as a *precedent reference* in prose). The `TM_TEN_YEARS` BCD note is
  thus left orphaned-as-a-structural-referent; **relocate-never-delete** — proposed to the lead (retire/rename vs
  keep-as-alias), not unilaterally touched.
- **A5 — the AUDIT relic (P01 map) → removed.** Removed the `[[P01-Ruth-1-1-5-AUDIT]]` frontmatter wikilink (pilot-2
  produces no AUDIT; a dangling relic, same family as SC-0017). Removal only. The P01 dangling-note flag clears.
- **Engine/report code:** `src/engine/id-align.ts` (`isWithheldReferent`, `normalizeSlug`, `WithheldReferentFinding`,
  `withheldReferents`/`counts.withheld`, withheld-exclusion in reference-integrity + the structural diff, slug
  normalization in name-binding). `src/audit/id-align-ledger.ts` (the withheld-referents section in the CLI text +
  the wiki ledger note + counts). `src/cli/tripod.ts` (the `withheld-referent` corpus-summary tally).
  `tests/id-align.test.ts` 29 → **36**.
- **Residual inventory after A1+A3+A4+A5 (SURFACED for the lead — NOT signed off this chunk):** `id-check --corpus`
  is **2 clean (P04, P06) · 4 with findings · 0 ref-integrity · 2 name-binding (the deferred B31, P02+P03) · 8
  un-accepted misalignments · 0 flag · 0 dangling · 6 accepted · 1 withheld INFO**. The 8 un-accepted misalignments
  are the **pre-existing** SC-0018 "REFERENCED-being-declared-in-§3A-prose-not-the-§3A-header" gaps + two P05 ones —
  NOT introduced here, NOT in the four A3 categories the lead ruled: P01 S4 `B2`/`B8`/`B9`; P02 S2 `B4`/`B5`; P05 S2
  `PL5`, S3 `B2`, S4 `TH_WITHIN_DAY_FROM_MORNING_UNTIL_NOW`. The brief's "clean except deferred B31" gate did not
  enumerate these; per "sign off **only** what the lead ruled," they are left surfaced for the lead's disposition
  (accept-as-coverage-difference, align, or rule otherwise) — see the STOP-and-report.
- **Gates:** `npm test` **133 green** (126 prior + 7 new); `check-drift` clean (re-pinned exceptions 0.2.0);
  `validate` 6/6; `lint --corpus` 0 drift / 7 accepted / 12 clean; `coverage --corpus` 6/6 (245/245); `gold-diff`
  **byte-identical** to the committed baseline (A edits the map code-string + FM free-text, neither in the
  gold-compared layer — confirmed across all 6 pericopes).
- **Boundaries:** fixtures-only. No vault edit (vault `git status` clean). No schema/closed-list/vocabulary change.
  No B31 alias, no template/methodology/prompt seeding, no writeback — all deferred to the post-blessing roll.

## SC-0020 (continued) — the parity-bar refinement + the 8 standing misalignments resolved
- **Date:** 2026-06-01 (the combined P01–P06 roll chunk, on `sc-0019-0020-p01`).
- **Decided by:** Marcia Suzuki (the parity-bar ruling); the compiler implemented + verified it.
- **Status:** **APPLIED (compiler-side).** Resolves the 8 standing misalignments the prior entry surfaced for the
  lead's disposition.
- **A6 — scene-scoped prose-reference parity bar (`src/engine/id-align.ts`).** The lead's ruling: a FOR_MODEL
  scene-being/place/object that the map **references in that scene's §3 prose** (any wikilink in the scene's
  narration / role / relationship / What-Happens lines — the PROSE bucket, not just the §3A–3D declared-entity
  header) counts as **ALIGNED** — the two artifacts agree the entity is in the scene; one DECLARES it structurally,
  the other NARRATES it. It is a misalignment **only** if the map never references it in that scene. Implemented as
  `mapProseByScene` (scene → entity codes referenced in that scene's prose) + `proseAlignedInScene(code, scope)`;
  an FM-only code with a same-scene prose match is dropped from the symmetric difference before it can become a
  finding. **Scene-scoped on purpose:** a prose mention in a *different* scene does NOT align it here. Also made the
  "present-elsewhere" annotation scene-accurate (`mapProseByScope` + `presentElsewhereLabel`), so a cross-scene
  prose home is labelled with its scene (e.g. "present on other side as §3B prose **in S3**") and never misreads as
  same-scene.
- **The 8 standing misalignments → 0 un-accepted:**
  - **5 resolved by the parity bar (same-scene prose-reference):** P01 S4 `B2`/`B8`/`B9` (B2 in the sons' "son of
    …" relationship lines; B8/B9 in Naomi's "mother-in-law of … Orpah and … Ruth" line, all in S4 §3A); P02 S2
    `B4`/`B5` (in S2's "[[B2]], [[B4]], [[B5]] — collectively 'the dead'" line). After the bar, **P01 is fully
    clean** and P02's only finding is the deferred B31 name-binding.
  - **3 signed off as exceptions (genuinely not same-scene-prose-referenced):** all P05, all FM_NOT_MAP, added to
    `_spec/id-alignment-exceptions.json` with `accepted_by:"Marcia Suzuki"`, `accepted_on:"2026-06-01"`,
    `sc_ref:"SC-0020"`:
    - `PL5` @S2 (`COVERAGE_DIFFERENCE_CROSS_SCENE_PROSE_ONLY`) — the FM declares PL5 in S2, but the map's S2 names
      the field only generically ("the field", untagged) and reserves the `[[PL5-Field]]` wikilink for S3, where
      Ruth actually arrives.
    - `B2` @S3 (`COVERAGE_DIFFERENCE_FM_SLOT_ONLY`) — the FM carries B2 in S3 only as the `clan_eponym` slot value;
      the map's S3 names the clan as `[[B29-The-Clan-of-Elimelech]]` and references B2 itself only in S1.
    - `TH_WITHIN_DAY_FROM_MORNING_UNTIL_NOW` @S4 (`COVERAGE_DIFFERENCE_FM_STRUCTURAL_ONLY`) — the FM carries it as a
      structural §3C object; the map records the same content in S4 §3C as bare Hebrew+gloss text (no `[[TH_…]]`
      wikilink, following the P01 about-ten-years precedent), so the map genuinely never wikilinks the code. Remains
      `unverifiable` (no TH_ registry) — acceptable.
  - The exceptions file goes **6 → 9 entries**; re-pinned **0.2.0 → 0.3.0** (sha256
    `5b2760572a0cb1fda20ce7c1e188b835a60468813acd88614d6b2af947b5a29a`) in `_spec/pins.json`; `check-drift` clean.
- **Tests:** `tests/id-align.test.ts` 36 → **39** — the P01 integration lock flipped (B2/B8/B9 @S4 now ALIGNED,
  P01 fully clean); a new P05 integration lock (the 3 gaps survive as ✓ ACCEPTED, scene-accurate annotation); two
  new hermetic parity-bar units (same-scene prose → ALIGNED; cross-scene prose → still MISALIGN, annotated). The
  `real()` integration helper now loads the pinned exceptions, mirroring the CLI.
- **`id-check --corpus` after the refinement:** **4 clean (P01, P04, P05, P06) · 2 with findings · 0 ref-integrity
  · 0 misalignment · 0 flag · 0 dangling · 2 name-binding (the deferred B31, P02+P03) · 3 unverifiable (TH_) · 1
  withheld INFO (P06 B?) · 9 accepted**. Clean except the explicitly-deferred B31 + the TH_-unverifiable, exactly
  as the chunk gate required.

## SC-0019 — Common-Reader Prose Standard: P01 conditioning-prose re-voicing (worked reference)
- **Date:** 2026-06-01
- **Decided by:** Marcia Suzuki (the register target, blessed 2026-05-31: "good study-Bible note for ordinary
  readers"); the compiler drafts the per-map voice, **the lead reviews per map** (the SC-0013 cadence).
- **Status:** **P01 worked reference APPLIED — pending the lead's voice blessing.** The standard governs the
  *conditioning prose* only. P01's prose is re-voiced in the compiler fixtures as the worked reference. **DEFERRED
  to the post-blessing roll:** P02–P06 prose, the methodology/template/agent-prompt seeding (born-clean machinery),
  and the vault writeback.
- **Type:** free-text + guidance only. **No schema / closed-list / vocabulary change. No spec-version bump.** Does
  **not** touch the `register` token, the Level-3 payload (R1–R6), the framework headings, or any pin/schema.
- **The standard (read `docs/COMMON-READER-PROSE-STANDARD.draft.md`):** four rules — **S1** common-reader register,
  **S2** concrete over abstract, **S3** translate the register / keep the substance (**plain ≠ flat**: if a rewrite
  drops a nuance, it's wrong), **S4** drop the critical apparatus (keep load-bearing concept words; gloss once) —
  plus a flag-word→plain table. Touchstone: explain the passage clearly and warmly to an intelligent friend who
  loves the Bible but never went to seminary.
- **B1 — the two missing calibration examples (PROPOSED for the lead's voice sign-off, not final):** drafted from
  real P01 prose — one **scene-description line** (P01 §3C O1 Function: *"precipitating crisis that drives the
  departure"* → *"the thing that sets the whole story off and drives the family out"*) and one **significant-absence
  note** (P01 S1: *"The narrator does not name YHWH … without any explicit divine action."* → *"The narrator never
  says YHWH sent the famine or drove the family out. The book opens with no word of God doing anything."*). These
  complete the draft's calibration bank (it had Level-1 / tone / narrative pairs but no scene-line or absence-note
  pair); they are **proposals** — the final voice is the lead's.
- **B3-P01 — P01 conditioning prose re-voiced** in `fixtures/meaning-map/P01-Ruth-1-1-5.md`: Level 1 (Arc/Burden,
  Context, Tone/Pace, Communicative Function), the §3A–3D scene descriptions (Role/Type/Meaning/Effect/What-it-is/
  Function/Signals), the four significant-absence notes, and the multi-level register-tagging block. The §3F
  "Communicative Purpose" lines were already plain and left unchanged (so the FM `scene_communicative_purpose`
  mirror is untouched). **Plain ≠ flat honoured** — every nuance preserved (e.g. the §2.3 narrator-withholding +
  weight-by-compression; the §3B PL_LAND_OF_JUDAH referential-form `THE_LAND_AFFLICTED_BY_FAMINE` + the 1:6–7
  cross-reference; "about" ten years as narrator restraint). Load-bearing concept words kept + glossed once (hesed →
  "loyal, covenant kindness"; sojourning).
- **Mechanical tie (the FM free-text):** the four `significant_absence` fields in
  `fixtures/for-model/P01-Ruth-1-1-5-FOR-MODEL.md` were matched to the new map wording (in the FM's terser register).
  `scene_communicative_purpose` unchanged (the §3F lines did not move). **gold-diff** re-baselined
  (`--out fixtures/gold-diff-baseline.json`) and confirmed **byte-identical** to the committed baseline — gold-diff
  compares header/classification/scene-IDs/entity-sets/flag-sets, **not** the free-text fields, so the prose +
  significant_absence edits move the file text (a git diff) but **no gold-diff number**. Exactly as the brief
  required ("only those free-text lines moved").
- **Gates:** `validate` 6/6 · `lint --corpus` **0 drift** / 7 accepted / 12 clean (the re-voicing introduced no
  forbidden vocabulary — R4 and S4 aligned) · `coverage --corpus` 6/6 · `gold-diff` re-baselined (byte-identical) ·
  `npm test` 133 green.
- **Boundaries:** fixtures-only; P01 only. No P02–P06 prose, no seeding, no vault edit. Drafts are PROPOSALS for the
  lead's voice sign-off.

## SC-0019 (continued) — P02–P06 conditioning-prose roll (matching the blessed P01 register)
- **Date:** 2026-06-01 (the combined P01–P06 roll chunk, on `sc-0019-0020-p01`).
- **Decided by:** Marcia Suzuki blessed the P01 worked reference (voice + structure) as the calibration anchor; the
  compiler drafts the per-map voice for P02–P06, **the lead reviews per map** (the SC-0013 cadence).
- **Status:** **APPLIED compiler-side — a PROPOSAL pending the lead's per-map voice blessing.** Do not treat as
  final; do not roll into the writeback until blessed.
- **B3-P02..P06 — conditioning prose re-voiced** in `fixtures/meaning-map/P02..P06`, matching the blessed P01
  register ("held-in and plain"): the multi-level register-tagging block, Level 1 (Arc / Context / Tone / Pace /
  Communicative Function), the §3A–3D scene descriptions (Role / Type / Meaning / Effect / What-it-is / Function /
  Signals), and the significant-absence notes. **Not touched:** the `register` token, the Level-3 §4 payload (the
  Q/A inventory), the framework headings, the §3 entity codes/wikilinks/presence tokens, schemas/vocabulary.
- **Plain ≠ flat — the load-bearing nuances kept (the lead's flagged cases):**
  - **P02:** hesed glossed once as "loyal, covenant kindness" (matching P01); the two-wave road argument; the
    womb/husband/hand-of-YHWH grounding; Orpah's kiss vs Ruth's holding-on.
  - **P03:** the six-step binding vow and the self-curse oath (kept the binding ladder + "calls down a curse on
    herself"); the unnamed-gods (v.15) vs YHWH-named (v.17) contrast; the withheld Moabite epithet at the binding;
    the four open "where" places.
  - **P04 (lament / fourfold naming):** §2.3 uses the lead's blessed calibration "after" verbatim ("…sets the full
    life she left against the empty one she's come back to and names God over and over…"); the **full↔empty**
    antithesis kept throughout (the "out full / back empty" bracket, Mara = "bitter" vs Naomi = "sweet"); the
    **fourfold divine naming** kept precise (Shaddai ×2, YHWH ×2 — "named twice … named twice"); the Moabite epithet
    returning in narrator voice; the narrator passing no verdict on Naomi's God-claim.
  - **P05 (miqreh):** §2.1 uses the lead's blessed calibration "after" verbatim ("…happens to end up in Boaz's field
    — and the narrator tells it so you can't quite tell whether it was luck or God's quiet hand"); the luck-vs-
    providence ambiguity kept at every occurrence (§2.1, §2.3, §2.4, §3C miqreh, S3 absence — never collapsed to
    plain "by chance"); the chayil "worth" thread; the textually-disputed v.7b shelter ("read different ways across
    the major commentaries").
  - **P06:** the wing-of-refuge image (kept "take refuge under his wings", "like a bird sheltering its young");
    the amah/shifchah status-shift (kept "from a lowly servant-girl here to something nearer at 3:9"); the three
    "do not" commands (touch / shame / rebuke); the abundance triplet (eat / be satisfied / have leftover → carry
    back to Naomi); the SC-0016-blessed "her husband (pair withheld; see P01-D2)" note left intact.
- **Mechanical tie (the FM free-text):** in `fixtures/for-model/P02..P06`, the `scene_communicative_purpose` and
  `significant_absence` fields that mirror the map's §3F / absence prose were matched to the new wording (in the
  FM's terser "Narrator…" register), preserving load-bearing parentheticals (e.g. P03 `(FIG_0001)`, P06 "per
  P01-D2"). **gold-diff re-confirmed byte-identical** to the committed baseline: gold-diff compares
  header/classification/scene-IDs/entity-sets/flag-sets, **not** the free-text fields, so the prose + matched
  free-text edits move the file text (a git diff) but **no gold-diff number**. (One incidental edit to a §3A
  `Presence:` parenthetical — which *does* feed the comparable layer via the `being:presence` key — was reverted to
  keep the structural layer truly untouched; the gold-diff baseline did not need re-writing.)
- **Gates:** `validate` 6/6 (0 drift) · `lint --corpus` **0 drift / 7 accepted / 12 clean** (the re-voicing
  introduced NO forbidden vocabulary — R4/S4 aligned) · `coverage --corpus` 6/6 (245/245) · `gold-diff`
  byte-identical · `id-check --corpus` clean except deferred · `npm test` **136 green**.
- **Boundaries:** fixtures-only. **No vault edit (vault `git status` clean).** No seeding (methodology/template/
  agent-prompt) — DEFERRED to the post-blessing writeback. Drafts are PROPOSALS for the lead's per-map voice sign-off.

---

## SC-0018 — Cross-artifact entity-ID alignment: the locked convention + the `tripod id-check` checker
- **Date:** 2026-06-01
- **Decided by:** Marcia Suzuki (the convention + the diagnostic mandate, 2026-06-01); the compiler implemented + verified it.
- **Status:** **PROPOSED.** The convention is recorded and enforced by a new deterministic verifier; the
  **reconciliation** of whatever the checker surfaces over P01–P06 is a **separate, later, human-gated pass**
  (it rides with the SC-0019 prose-standard pass — not this entry). Add-only tooling: no content/schema/vocab
  edit; the one spec-side change is a new empty pinned exceptions file.
- **Type:** verifier / tooling + a locked methodology convention (the canonical entity-ID form). No spec-version bump.
- **The principle:** the prose Meaning Map and the FOR_MODEL are the two halves of **one training pair**. An
  entity named in one must be the **same canonical code** the other uses — verifiable by machine, not by a
  human's eye. Today the map writes `[[B2-Elimelech]]` and the FOR_MODEL writes `B2` (recoverable), but in
  places it is a genuine mismatch (P01's "about ten years" is `TM_TEN_YEARS` in the map's §3C but
  `TH_TEN_YEARS_APPROXIMATELY` in the FOR_MODEL — different code *and* namespace). This SC makes the alignment
  mechanical. It is **diagnostic only** — it fixes nothing; it produces the inventory, Marcia rules it, a later
  pass aligns.
- **The locked convention (recorded; the checker enforces it):**
  - **Canonical entity ID = the bare code** (`B2`, `O1`, `PL_LAND_OF_JUDAH`, `CB_0012`, `TM_*`, `FIG_*`, `I*`) —
    what the FOR_MODEL + BCD use and what the schema *patterns* enforce (`being_id` = `^B(\d+|\?)$`, etc.; a name
    like `B2-Elimelech` is schema-illegal in a FOR_MODEL).
  - **Maps carry the code in the wikilink target:** `[[CODE-Slug]]`, `[[CODE-Slug|Display]]`, or `[[CODE]]`. **The
    code = the wikilink target (the part before any `|`), taken up to but NOT including the first hyphen `-`; if
    there is no hyphen, the whole target is the code.** Sound because **codes never contain a hyphen** (the schema
    id patterns are `[A-Z0-9_]`-only). The checker **asserts this invariant from the pinned schema patterns at
    startup** (`assertNoHyphenInCodePatterns`) and fails loudly if any future pattern admits a `-`.
- **The checker (`tripod id-check [paths… | --corpus] [--json] [--out <ledger.md>] [--out-dir <dir>]`):** per
  pericope (the map + its paired FOR_MODEL), runs five steps. The entity-code **namespaces are derived from the
  pinned validation-rules schema `$defs`** (`b_code`/`place_id`/`object_id`/`time_id`/`cb_id`/`figure_id`), never
  hardcoded; map wikilink→code parsing reuses the reader's rule.
  1. **Extract.** MAP: every `[[…]]` whose code matches an entity namespace, tagged **STRUCTURAL** (declared in a
     §3A–§3D per-scene entity block — confirmed section labels `**3A — Beings**`/`**3B — Places**`/`**3C — Objects
     and Elements**/`**3D — Times**`) vs **PROSE** (a relationship/role bullet, §3E "What Happens", §4, §5, or
     frontmatter). A code on a `- Relationship:`/`- Role:` bullet is PROSE, exactly as the reader declares an entry
     only on a non-bullet, wikilink-led line. A wikilink whose code matches no namespace is a **note link** (kept
     for step 5). FOR_MODEL: scene-container ids + pericope `cb_flags`/`figure_flags`; secondary, being-codes used
     as `event_specific_slots` *values* (`^B\d+$`); excludes referential_form / role / function / action / speech_act.
  2. **Reference integrity (both sides).** Every code must resolve to a real BCD entry — consumes the pinned
     `_spec/registry/ruth.aliases.json`. Unknown code in a **tracked namespace** (B/PL/O/TM/I) ⇒ **ERROR**.
  3. **Name-binding (map slugs).** The slug must equal `slugify(BCD canonical name)`, where **slugify = trim ·
     collapse internal whitespace to a single `-` · preserve the source Title-Case (no lowercasing) · drop a
     leading/trailing `-`** (e.g. `Bethlehem of Judah`→`Bethlehem-of-Judah`, `About Ten Years`→`About-Ten-Years`,
     `In the Days When the Judges Judged`→`In-the-Days-When-the-Judges-Judged`). Mismatch ⇒ **ERROR** (catches a
     typo'd slug and a right-name-wrong-code).
  4. **Cross-artifact alignment (the core).** Per scene where scene IDs align (map §3 scene ↔ FOR_MODEL
     `level_2_scenes[].scene_id`, both `S1`/`S2`…), else per pericope: `MAP_STRUCTURAL` (structural codes) vs
     `FM_STRUCTURAL` (scene-container codes + pericope cb/figure flags); report the **symmetric difference**
     (map-not-FM, FM-not-map). Where an unmatched map code and FM code **share a stem**, tag them
     **LIKELY_SAME_REFERENT** (the highest-value finding — the `TM_/TH_` class). PROSE-only mentions are NOT
     required in the FOR_MODEL (checked by steps 2–3 only).
  5. **Dangling note links (secondary).** A map non-entity `[[Note-Title]]` resolving to no existing note ⇒ flag
     (catches stale `[[…-AUDIT]]`/`[[…-COMPILATION-LOG]]`/`[[…-BCD-DELTA]]` links; pilot-2 has no AUDIT). Reported
     separately.
- **Namespaces the vendored registry does not track (decision, flagged for review):** `ruth.aliases.json` covers
  only the concrete coverage namespaces **B/PL/O/TM/I** — it has **no `CB_`/`FIG_`/`TH_` entries** (those live in
  the Concept Bank / Figure Registry / are thematic overlays, not vendored here). Applying "unknown ⇒ ERROR"
  literally to them would flood the inventory with dozens of false errors for schema-legal codes. So
  reference-integrity (step 2) and name-binding (step 3) run **only** for tracked namespaces; a schema-legal code
  in an untracked namespace is surfaced separately as **UNVERIFIABLE_NO_REGISTRY** (shown, not errored). Each
  cross-artifact finding also records whether the code is **present on the other artifact non-structurally**
  (map: frontmatter/§5-flag/prose; FM: a proposition slot) — so "absent" is distinguished from "present, not in
  the structural block".
- **Exceptions (recorded sign-off, the SC-0010 mechanism):** new pinned **`_spec/id-alignment-exceptions.json`**
  (**0.1.0**, **EMPTY**), added to `_spec/pins.json` → `sources`, covered by `check-drift`. Same shape/mechanism
  as `coverage-exceptions.json` / `lint-exceptions.json`: a signed-off entry (keyed by pericope stem · kind ∈
  {REFERENCE_INTEGRITY, NAME_BINDING, MISALIGNMENT, DANGLING_NOTE} · code | note_title | scope/direction)
  downgrades a finding to **✓ ACCEPTED** (shown with reason, excluded from the failure count). **No exceptions
  added in this build** — the first run is the raw, complete inventory.
- **Spec change (exact):** no closed-list / schema-shape change. One new vendored+pinned governed file
  `_spec/id-alignment-exceptions.json` (**0.1.0**, sha256
  `7197ca55ce3bf0940555c011682d904be7bde478003d32ac06f6e4809132a412`), added to `_spec/pins.json` → `sources` and
  verified by `check-drift`.
- **Code:** `src/engine/id-align.ts` (namespace derivation + invariant + the five-step checker),
  `src/audit/id-align-ledger.ts` (CLI text + wiki ledger note), `id-check` CLI verb, `loadIdAlignmentExceptions()`,
  `tests/id-align.test.ts` (16 tests: the invariant; slugify; the six required cases — clean→0, typo'd slug→ERROR,
  wrong-code→ERROR, TM_/TH_→LIKELY_SAME_REFERENT, off-stage PROSE→not-flagged, unknown→ERROR, seeded exception→
  ACCEPTED; the unverifiable-namespace rule; dangling-note resolution; FM code extraction; + a real-fixture
  integration lock on P01's TM_/TH_ pair and P06's `B?` placeholder).
- **First-run inventory (P01–P06, the deliverable Marcia rules):** 6/6 pericopes have findings · **1
  reference-integrity ERROR** (P06 FOR_MODEL `B?` — an unresolved `wife_taken` slot placeholder; legal per
  `^B(\d+|\?)$`, no BCD entry) · **5 name-binding ERRORs** (`B31` slug `People-of-YHWH` vs BCD `His People /
  People of YHWH` in P02+P03; `PL5_BOAZ_PORTION` slug `Boazs-…` vs `Boaz's-…` in P05+P06; `PL_NAOMIS_DWELLING`
  slug `Naomis-…` vs `Naomi's-…` in P05) · **87 cross-artifact misalignments** of which the **1
  LIKELY_SAME_REFERENT** is P01 `TM_TEN_YEARS` ↔ `TH_TEN_YEARS_APPROXIMATELY` (the headline) — the rest are
  largely cb/figure flags that sit in the map's frontmatter/§5 (not §3 structural) and REFERENCED scene-beings the
  map declares in prose but not §3A · **16 dangling note links** (stale `[[…-AUDIT]]`/`[[…-COMPILATION-LOG]]`/
  `[[…-BCD-DELTA]]`/`[[…-VERIFICATION-INPUT-en]]` frontmatter links + P04's `[[T7-Harvest-Provision]]`, a
  non-namespace code that is neither a valid entity nor a real note — a likely typo) · 157 unverifiable
  (CB_/FIG_/TH_). The reconciliation is the later SC-0019-rider pass.
- **Boundaries:** touched no map / FOR_MODEL / BCD / schema / vocabulary / pin content **except** adding the empty
  exceptions file. No `|Display` additions, no code reconciliation, no template/methodology edit, no vault touch.
- **Gates:** `npm test` **113 green** (97 prior + 16 new); `check-drift` clean (the new exceptions file pinned at
  0.1.0); `validate` 6/6 · `lint --corpus` 0 drift / 7 accepted · `coverage --corpus` 6/6 (245/245) · `gold-diff`
  agreement **UNCHANGED** — confirmed (no content touched).
- **Delivery:** compiler PR only (no vault). Marcia receives the P01–P06 inventory to rule.

### SC-0018 refinement (2026-06-01) — low-noise standing gate (R1/R2/R3)
- **Status:** **PROPOSED** (rides with SC-0018). The v1 checker was GOOD — it found every genuine issue — but
  over-reported from three scoping limits. This refinement removes the noise **without losing any genuine
  finding**. Still **diagnostic / add-only**: no map / FOR_MODEL / BCD / schema / vocabulary content touched; the
  `id-alignment-exceptions.json` stays **EMPTY** (unchanged, same pin). The clean inventory is the deliverable.
- **R1 — CB_/FIG_ codes are FLAGS; compare them in their real homes.** v1 looked for codes only in the map's §3
  entity blocks, so every `CB_`/`FIG_` code (which the map carries in **frontmatter `active-concepts`/`active-figures`
  + the §5 Flags section**, NOT §3) read as a false "FM-not-map" misalignment. Now `CB_`/`FIG_` codes are pulled
  out of the §3-block ↔ scene-container structural diff and compared as **flag SETS**: the map's flag set (the
  frontmatter `active-*` list items + the **first wikilink on each §5 bullet**, mirroring the reader's `applyFlags`
  rule) vs the FOR_MODEL's `cb_flags` + `figure_flags`. Aligned flags never report; only a genuinely one-sided flag
  does (new finding type `FlagMismatchFinding`, kind ∈ {CONCEPT, FIGURE}). A `CB_`/`FIG_` wikilink that appears only
  inside a §5 bullet's *narration* (e.g. P06 §5A's parenthetical cross-pericope ref to `FIG_0131`) is **not** a flag —
  matched by the FOR_MODEL keeping such a code in `cross_ref` free-text, not in `figure_flags`. **Removes ~70 false
  misalignments** (the P01–P06 CB/FIG placement noise → 0 flag mismatches).
- **R2 — vendor + pin a Concept-Bank and Figure-Registry index so `CB_`/`FIG_` are verifiable.** v1 had no `CB_`/`FIG_`
  registry (the alias table covers only B/PL/O/TM/I), so 157 legal codes were "UNVERIFIABLE." New offline extractor
  **`extractor/build_concept_figure_registry.py`** harvests the wiki `concepts/*.md` (frontmatter `cb-code:`, optional
  `aliases:`) — 50 files — and `figures/*.md` (frontmatter `fig-code:`, optional `aliases:`) — 115 files — into two
  vendored, pinned registries, each entry `{code, name_slug (= filename minus the `CODE-` prefix), aliases[]}`:
  - `_spec/registry/ruth.concepts.json` (**registry-0.1.0**, sha256 `788d2f10bda81ac6b1a12e9d7cfc2904a3e42d65e744affd92bb48ff3ce817ff`) — 50 entries.
  - `_spec/registry/ruth.figures.json` (**registry-0.1.0**, sha256 `56ebf4d450099ca1ed58ef2771cfec783d192b1dca8a8b1738a9aae34e9d3803`) — 115 entries.
  Both added to `_spec/pins.json` → `sources` and covered by `tripod check-drift` (the same vendor+pin discipline as
  `ruth.aliases.json`). Reference-integrity + name-binding now apply to `CB_`/`FIG_`: a `CB_`/`FIG_` code with no
  registry entry ⇒ **ERROR**; a map slug matching neither the `name_slug` nor any `alias` ⇒ **name-binding ERROR**.
  Over P01–P06 this surfaces **no new genuine CB/FIG findings** (every map/FM flag code resolves; every map CB/FIG
  slug matches its `name_slug`) — but the machinery is now in place and `unverifiable` drops 157 → 2 (only the two
  `TH_` thematic-overlay codes remain, by design — `TH_` has no registry).
- **R3 — note-resolution knows the real pilot-2 artifact suffixes + discourse-thread refs.** v1 flagged
  `COMPILATION-LOG`/`BCD-DELTA`/`VERIFICATION-INPUT[-en]` links and `[[T7-Harvest-Provision]]` as "dangling" only
  because they live in the vault (`stas/`, `bcd/discourse-threads/`), not the compiler fixtures dir — 15 false flags.
  Now `-FOR-MODEL`/`-COMPILATION-LOG`/`-BCD-DELTA`/`-VERIFICATION-INPUT`/`-VERIFICATION-INPUT-en`/`-COVERAGE-LEDGER`
  are recognized as **valid pilot-2 sibling-artifact suffixes that resolve**, and `T#-…` **discourse-thread** refs
  resolve (a documented biblical-only namespace whose notes live in `bcd/discourse-threads/`; `[[T7-Harvest-Provision]]`
  was a real note, NOT the typo the v1 note guessed). **`-AUDIT` is deliberately NOT a valid pilot-2 artifact** → it
  still flags. **Dangling drops 16 → 1** (only P01's `[[…-AUDIT]]`, the one true relic).
- **Refined inventory (P01–P06):** **1 ref-integrity** (P06 `B?`) · **5 name-binding** (`B31` P02+P03;
  `PL5_BOAZ_PORTION` P05+P06; `PL_NAOMIS_DWELLING` P05) · **17 cross-artifact misalignments** (the genuine entity
  gaps only — the P01 `TM_TEN_YEARS`↔`TH_TEN_YEARS_APPROXIMATELY` **LIKELY_SAME_REFERENT**; place/time gaps
  `PL_LAND_OF_JUDAH` P03, `TM_BARLEY_HARVEST_BEGINNING` P04, `PL_AMONG_SHEAVES` P06, P04 `PL1`/`PL2`; REFERENCED
  scene-beings the map declares in §3A-prose but not the §3A header; P05 `TH_WITHIN_DAY…`; P06 `B?`) · **0 flag
  mismatches** (all CB/FIG flags align) · **1 dangling** (P01 AUDIT) · **2 unverifiable** (`TH_` only). Was
  1/5/87(1 LSR)/16/157; now 1/5/17(1 LSR)/0-flag/1/2. Every genuine v1 finding survives; the ~70 CB/FIG placement
  misalignments + 15 false danglings are gone.
- **Code (refinement):** `src/engine/id-align.ts` — `isFlagCode`, `harvestMapFlags` (map flag-set), `extractForModelFlags`
  (FM flag-set), `buildFlagRegistry` + `loadConceptRegistry`/`loadFigureRegistry` (R2), `FlagMismatchFinding` + the
  flag-set comparison step (R1), `isKnownPilot2Sibling` + the refined dangling resolution (R3), CB/FIG branches in
  reference-integrity + name-binding (R2). `src/reader/source-packet.ts` — `CodeRegistry` types + loaders.
  `src/audit/id-align-ledger.ts` — the flag-mismatch section + updated counts/labels. `id-check` CLI summary gains
  `flag-mismatch`. `extractor/build_concept_figure_registry.py` + `extractor/README.md`. `tests/id-align.test.ts`
  grows 16 → **29** (R1 flag-set comparison incl. the §5-narration exclusion; R2 CB/FIG ref-integrity + name-binding
  + alias tolerance; R3 suffix/thread resolve + AUDIT-still-flags; unit tests for the new helpers; + the refined
  real-fixture integration locks across P01/P03/P04/P05/P06).
- **Note (exceptions `_doc`):** a new exception **kind `FLAG_MISMATCH`** is supported by the engine for signing off a
  one-sided flag; the `id-alignment-exceptions.json` `_doc` comment still lists only the original four kinds. The file
  is left **byte-for-byte unchanged** (still EMPTY, pin intact) per the add-only mandate — re-pinning it is out of scope.
- **Gates (refinement):** `npm test` **126 green** (113 prior + 13 new); `check-drift` clean **incl. the two new
  registry pins**; `validate` 6/6 · `lint --corpus` 0 drift / 7 accepted / 12 clean · `coverage --corpus` 6/6
  (245/245) · `gold-diff` agreement **UNCHANGED** (95/98/96% — no content touched).

---

## SC-0017 — De-leak: strip process-commentary from the content layers
- **Date:** 2026-06-01
- **Decided by:** Marcia Suzuki (the principle + scope); the compiler applied + verified it.
- **Status:** **SHIPPED — BLESSED by Marcia 2026-06-01.** Fixtures applied + Architect-verified, then the
  **vault writeback DONE** (both PRs merged 2026-06-01 — compiler #17 `ebe7847`, vault #7 `6210b3b`). Vault
  `pericopes/` + `stas/` are byte-identical to the deleaked fixtures; the template + discipline-doc (R6) edits
  landed in the vault. See the vault-writeback record at the end of this entry.
- **Type:** artifact remediation + docs/template hygiene (no schema/spec change; no closed-list change).
- **Principle:** a meaning map and a FOR_MODEL describe the **passage**, never the **project**. The
  relocation audit-trail SC-0013/SC-0016 left inline in §3C (`SC-XXXX`, "Relocated per the content
  discipline", "§3C entities only", "X → Proposition N") is a worklog leaking into the source artifact. It
  comes out. The relocate-never-delete record already lives, durably, in `docs/SC-0013-RELOCATION-AUDIT.md`
  + `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md` (confirmed present before stripping) — removing the inline notes
  loses nothing.
- **Verified scope — the leak was in BOTH trees, phrased differently:**
  - **Maps** (`fixtures/meaning-map/P0*.md`): §3C blockquotes (`> §3C lists entities only … Relocated per the
    content discipline: …`) and `- None: … Relocated per the content discipline[ (SC-XXXX)]: X → Proposition N; …`
    trails (single- or multi-line bulleted). Stripped to the bare considered-absence / the header above the entities.
  - **FOR_MODELs** (`fixtures/for-model/P0*-FOR-MODEL.md`): inside `objects_in_scene._note` as
    `"§3C entities only (SC-00XX). [No persistent objects.] Relocated: … → P# (…); … → B# referential_form; …"`.
    A literal-string grep for the map phrasing finds nothing here — this is the trap; targeted by pattern.
    **P01's FOR_MODEL used `(SC-0012)` phrasing** an earlier narrower grep had missed; caught + stripped.
- **Strip vs keep (the cut boundary):** STRIP every span matching the union pattern (case-insensitive)
  `relocat` · `SC-00[0-9][0-9]` · `→ Prop`/`→ Proposition` · `content discipline` · `§3C entities only`.
  KEEP: entity entries (`[[O#]]`/`[[CB_]]`/`[[TM_]]` + What-it-is/Function/Signals; FOR_MODEL `entries[]`);
  the plain considered-absence (`- None: no persistent objects in this scene.` / `_note: "No persistent
  objects in this scene."` where `entries: null`); and every passage-describing note (`times_in_scene`
  "No distinct temporal frame…", `register_overrides._note`, `significant_absence`, and the §3C reasoning that
  the about-ten-years/within-day duration is content carried in §3C — these describe the *text*, not the cleanup).
- **`_note` handling rule (FOR_MODEL):** if a scene has real `objects_in_scene.entries`, the whole `_note`
  was scaffolding → **remove the `_note` key** (the entities carry the content; `_note` is optional, stays
  schema-legal). If `entries: null`, reduce `_note` to the minimal considered-absence
  `"No persistent objects in this scene."`. (10 keys removed; 7 reduced to minimal across P01–P06.)
- **Also removed (ruled by the lead, 2026-06-01):** a stale **`- PENDING (the lead's ruling): the
  doubled-divine-name pattern …`** bullet in P04 §3C — process-commentary that is now false: FIG_0195 captures
  that pattern and is flagged at P04 §5B + active-figures + FOR_MODEL P4/P5 `figure_flags` (SC-0016), so nothing
  is lost. (Its FOR_MODEL twin was already cleaned by the `_note` rule.)
- **Guidance fix (vault-only, in the writeback pass):** the meaning-map template
  (`_templates/meaning-map-template.md`) — §3C = entities or a plain "None: <reason>" only, the
  relocate-never-delete record goes to the SC audit doc, never inline; and the discipline doc
  (`_methodology/level3and3Ccontentdiscipline.md`) — add the principle (the map describes the passage, not
  the project; no process-commentary in the content layers; same family as R5). Neither file exists in the
  compiler repo, so these land in the vault writeback.
- **Verification (achieved):** **zero-grep across both trees** — the union pattern returns 0 matches in
  `fixtures/meaning-map/` and `fixtures/for-model/`. `validate` 6/6 (confirms the `_note`-key removals are
  schema-legal) · `lint --corpus` **0 drift / 7 accepted** (second-order gate held: the 7 §4 keeps resolve by
  `(pericope, rule, match, context_prefix)`, not line number, so the §3C strip did not orphan them) ·
  `coverage --corpus` 6/6 block-clean (245/245, 0 unanchored) · `gold-diff` **agreement layer UNCHANGED**
  (matched/divergent/agreementPct byte-identical pre/post; only the informational `judgmentPlaceholders`
  count fell — the removed §3C prose carried skeleton `__TODO__` spans the compiler enumerated, not a fidelity
  measure — baseline re-written) · `npm test` **97 green** · `check-drift` clean. Removal-only: 21 insertions
  (all minimal-note normalizations) / 101 deletions; no entity, proposition, §4, flag, figure, or
  significant_absence touched.

### SC-0017 vault writeback (2026-06-01) — DONE
The blessed §3C/`_note` de-leak was propagated to the canonical vault (`ruth-pilot-b-wiki`), and the guidance
edits (which don't exist in the compiler repo — the meaning-map template + the discipline doc's new **R6**)
landed there too. Delivered on vault branch `sc-0017-deleak-vault` via **reviewed vault PR #7**, merged to vault
`main` (`6210b3b`); compiler **PR #17** merged to compiler `main` (`ebe7847`). **Architect-verified after
merge:** vault `pericopes/P01–P06` + `stas/*-FOR-MODEL` are **byte-identical** (`cmp`, 12/12) to the deleaked
compiler `fixtures/`; **zero-grep clean** across both trees; `validate` 6/6 · `lint --corpus` 0 drift / 7
accepted · `coverage --corpus` 6/6 · `gold-diff` agreement unchanged · `check-drift` clean · 97 tests green.
The vault working copy was returned to clean `main` and both merged branches deleted. **Process artifacts
intentionally retained provenance** — P04's BCD-DELTA `audit_note` (`SC-0016`) and the COMPILATION-LOG
compilation prose are the audit/governance layer, deliberately out of the content-only scope. This closes the
§3C / Level-3 content-discipline arc (SC-0012 → SC-0017).

---

## SC-0016 — Level-3 §4 content sweep (operating test) under SC-0012/SC-0013
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki (per-row rulings 2026-05-31; the compiler applied + verified them)
- **Status:** **SHIPPED + VAULT-SYNCED — BLESSED by Marcia Suzuki 2026-05-31.** Fixtures shipped after an
  Architect fidelity pass (relocate-never-delete verified on the high-stakes drops: P04 lament divine-agency
  atoms "YHWH has testified against me" / "Shaddai has done evil to me" survive; P05 miqreh + verb-chain +
  working-time-code payloads survive; gold-diff independently UNCHANGED). **Vault writeback DONE** (2026-05-31,
  vault branch `sc-0016-vault-writeback`): vault `pericopes/P01–P06` now **byte-identical** to compiler
  `fixtures/meaning-map/` (the §4 sweep), and the figure spans are recorded in the vault `figures/` registry
  (additive proposition-span enrichment, 32 files, 96 insertions / 0 deletions). See the vault-writeback record
  at the end of this entry.
- **Type:** artifact remediation (no schema/spec change) + a new pinned reviewer-sign-off ledger (governed).
- **Summary:** The §4-proposition counterpart to SC-0013's §3C sweep. SC-0015 made the lint *see* the §4 blind
  spots; this acted on the full true inventory (**150 findings** across P01–P06). For every finding, the
  operating test was applied (*would the model SAY this in the translation? if no, it is conditioning and
  leaves §4*): (a) **60 inline `cross_ref`/link lines** removed (P01 2 · P02 2 · P03 5 · P04 19 · P05 21 ·
  P06 13) — the figure span survives in each map's §5A/§5B flags (verified present before removal) and is
  enriched into the figure registry by the deferred vault patch; (b) **21 meta/analytical questions**
  converted to payload questions or dropped where the payload already lived in a sibling Q&A (form-analysis →
  the CB_/FIG_ flag); (c) **39 compound answers** atomized one-act-per-pair; (d) **19 question/answer-side
  forbidden-vocabulary** hits rephrased in plain language; (e) **11 §4-answer interpretive labels** bared to
  the act. Per-proposition ledger + relocate-never-delete verification: `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md`.
- **Rulings applied (Marcia):** bless P01; **C1** drop bracketed glosses (nuance rides on the flag); **C2**
  form-questions → payload (or drop when redundant); **C3** entity-list/party-pairs are payload; split the P06
  prostration doubling, "deliberately, intentionally" → "on purpose"; two batch rewrites (P05 P1 narrator-pause
  → introduction content; P02 P8 keep "(none)" as asserted payload).
- **Recorded reviewer sign-off (the analogue of SC-0010 coverage-exceptions):** **7** §4 lines were ruled
  **KEEP** — genuinely-exegetical false-positives for the compound heuristic (a vocative, a discourse opener, a
  single directive, a fixed oath formula, a me/you party-pair, a withholding-note, and an entity-pair "her
  father and her mother"). Rather than reword the text to dodge the regex, they are signed off in a new pinned
  **`_spec/lint-exceptions.json`** (provenance per entry): `tripod lint` downgrades a matched finding to
  **ACCEPTED** (shown `✓` with reason, excluded from the drift count). New code: `applyLintExceptions()` +
  `recount()` + `loadLintExceptions()` + CLI wiring + tests; the engine stays pure (always surfaces the
  finding; acceptance is a recorded downgrade).
- **Blessing-pass rulings (Marcia, 2026-05-31):** (a) **"her father and her mother"** ruled KEEP as one (an
  entity-pair, like "his two sons Mahlon and Chilion"; an earlier cut wrongly split it) → un-split + recorded as
  the **7th** sign-off (`ENTITY_PAIR`); lint-exceptions re-pinned **0.1.0 → 0.1.1**. (b) **Politeness particles
  ("na"/please) = register, not payload** — confirmed as a **standing precedent** for deference markers
  ("please / your servant / my lord") through P07–P14 (so e.g. P05's "let me glean, please" → atom "let me
  glean", the particle conditioning).
- **Spec change (exact):** no closed-list / schema-shape change. New vendored+pinned governed file
  `_spec/lint-exceptions.json` (**v0.1.1**, sha256 `2d756b6c0374e54598a6084b3fcb4b3c7fa74f56c656d6b0eae79f28533f4279`),
  added to `_spec/pins.json` → `sources` and verified by `check-drift`.
- **Artifact migration:** `fixtures/meaning-map/P01–P06` §4 swept (this repo). The **vault** `pericopes/*.md`
  + `figures/FIG_*.md` writeback is **deferred** per the lead's routing ruling — recorded as a patch in
  `docs/sc-0016/FIG-span-relocations.proposed.md`. No FOR_MODEL / §3C / Levels 1–2 / §5-flag content touched.
- **Verification (achieved, at blessing):** `tripod lint --corpus` → **0 drift (0 tier-1, 0 tier-2) · 7
  accepted (signed off) · exit 0** — the operating-test bar, mechanized. `validate` 6/6 · `coverage --corpus`
  6/6 block-clean (245/245, 0 unanchored, 1 accepted) · `gold-diff` **UNCHANGED at blessing** (P01 100 · P02 90 ·
  P03 100 · P04 95 · P05 98 · P06 96 — proof the entities/flags/structure layer did not move) · `check-drift`
  clean (15 pins) · **97 tests green**.

### SC-0016 vault writeback (2026-05-31) — the deferred canonical sync
The blessed §4 sweep + figure spans were propagated from the compiler fixtures into the canonical vault
(`ruth-pilot-b-wiki`), on a fresh branch `sc-0016-vault-writeback` off `origin/main`. **Faithful transcription,
not authoring** — no §4 answer re-edited.
- **Branch hygiene (verified, not assumed):** the vault working copy's prior branch
  `claude/p02-p06-content-remediation` was **1 empty auto-backup commit** ahead of `origin/main` (`git diff`
  empty); all substantive content (SC-0013 `636feba`) was already merged via PR #5 (`e2fc80f` = origin/main).
  Nothing substantive stranded → based the writeback on `origin/main`.
- **§4 transcription (diff-first, no clobber):** for each P01–P06, confirmed the ONLY delta vs the blessed
  `fixtures/meaning-map/` was inside §4 (frontmatter + §1–3 + §5 Flags byte-identical before edit; §3C already
  shared from SC-0013), then synced. Vault `pericopes/P01–P06` now **byte-identical (`cmp`)** to the fixtures.
- **Figure spans (additive):** each figure that carried a §4 cross_ref span now records it in its own entry —
  `opens-at-proposition`/`closes-at-proposition` frontmatter + one Appearances bullet, from the §5B Figure-Flag.
  32 figure files, 96 insertions, **0 deletions** (verified purely additive). §5B flags + FOR_MODEL cross_ref
  fields unchanged. (Worklist: `docs/sc-0016/FIG-span-enrichment-worklist.md`.)
- **Safety rail:** Marcia paused the Obsidian Git auto-backup for the duration (re-enabled after merge), so the
  edits could not be swept onto the branch before review.
- **Folded-in ruled tasks (separate commits):** **Task A** — created figure **FIG_0195** (Fourfold Divine
  Naming in Lament; the pattern complementing FIG_0006 + FIG_0086) in both vault + fixtures: figure file +
  P04 BCD-DELTA `to_figures_registry` + map §5B/active-figures + FOR_MODEL P4/P5 `figure_flags`; gold-diff
  re-baselined (P04 matched 37→38, the only line changed). **Task B** — this entry's SC-0014 forward-pointer
  (above): the old value still in the Pilot-3 Layer-2 seed CSV, to reconcile at Pilot-3 lock (pointer only,
  no CSV edit).
- **Delivered via** a reviewed vault PR (`sc-0016-vault-writeback` → vault `main`); on merge the vault working
  copy returns to clean `main`, the auto-backup is re-enabled tracking `main`, and the stale
  `claude/p02-p06-content-remediation` branch is removed.

---

## SC-0015 — Extend the Level-3 lint (operating test on §4 blocks)
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **APPLIED** (repo PR for the lint engine + lexicon + tests; no vault artifact touched).
- **Type:** tooling / drift-guard (no closed-list change; no schema-shape change).
- **Summary:** The SC-0013 relocation audit found the SC-0012 `lintMeaningMap` was **blind in three ways** on
  the Level-3 §4 layer, so the operating test (*a Level-3 block contains ONLY payload Q&A pairs — flag every
  line that isn't one*) was only half-enforced. This extends the lint with **six** changes:
  1. **`link_in_level3` (new rule, tier-1).** The old code `continue`d past every line matching `cross_ref`
     (and `[[FIG_…]]` pointer lines), so inline cross_refs/inter-proposition links in §4 were never flagged.
     That skip is **removed**; such lines are now FLAGGED via a new `link_markers` lexicon list
     (`cross_ref`, `caused_by`, `paired_with`, `forward_link[-]`, `back_reference[-]`,
     `back_reference_to_proposition`). The link rule short-circuits the line, so a `[[FIG_…]]` cross_ref is
     reported **once** (as the link), never double-counted as an interpretive_label.
  2. **Question-side scanning.** The old code looked only at `**A:**` answers. The loop now splits each line
     into `{q, a}` (new `qaParts`, handles same-line `**Q:** … **A:** …` and split forms) and runs the
     forbidden-vocabulary / interpretive-label scan over the **question** too (this is what surfaces
     `«verb»`/`«agent»`/`«lexeme»`/`«clause»`/`«subject»` in analytical prompts).
  3. **`meta_question` (new rule, tier-2).** A new `meta_questions` lexicon list (regex sources:
     `construction`, `verb[- ]chain`, `pattern?`, `stylistic`, `texture?`, `effect?`, `closure label`,
     `root?`, `…-marker`/`marker?`, ordinal `… part?`, `…-form?`) flags analytical/meta questions about
     form/structure/style that aren't payload.
  4. **Comma compounds + entity-list guard.** `compound_markers` gains `", "`; the compound check moves into a
     new `compoundMarker(a)` helper that, for `, ` / ` and `, first strips wikilinks, entity-id tokens and
     proper names, so an answer that merely **names** several entities ("his two sons [[B4]] Mahlon and [[B5]]
     Chilion"; "the family [[B2]] Elimelech, [[B3]] Naomi") is **not** flagged — only a connector still
     joining two word-groups after stripping (two acts/clauses) is.
  5. **Conditioning bleed on the question side** (new `conditioning_qa` values `tone?`, `pace?`, `genre?`,
     `scene-kind?`, `proposition-kind?`) is matched as a whitespace-bounded substring on the question (and on
     stray non-Q&A lines), not a naïve whole-line `includes`.
  6. **More §4-answer labels (scoped, not shared).** The softer dialogue-paraphrase labels the SC-0013 audit
     listed (`declaration`, `full[- ]knowledge`, `instruction about`, `further command`/`further instruction`,
     `reports a`, `recites`/`recital`, `answers with`) go in a **new `answer_labels` lexicon list applied to
     meaning-map §4 ANSWERS ONLY** — deliberately *not* added to the shared `interpretive_labels` (which
     `scanProse` also runs over FOR_MODEL fields and §3C notes). This keeps them from false-positiving on a
     governed closed-list `speech_act` value (e.g. `REFUSES_REQUEST_WITH_COUNTER_DECLARATION` contains
     "DECLARATION") or a §3C relocation `_note` — both **out of scope** for the §4 content sweep and not
     fixable by it. (A first cut merged them into `interpretive_labels`; that surfaced 6 FOR_MODEL findings on
     exactly those governed enums/notes and was corrected to the scoped list.) Also added the **`hifil`**
     spelling to `forbidden_vocabulary` (the list had `hiphil` only; R4 names "hifil/qal/piel").
  7. **Truthful per-proposition reporting.** The finding `location` now carries the current Level-3 block
     (`§4 Prop 5 · A`, etc.) and `finalize`'s de-dup key includes `context`, so distinct lines that share a
     rule+match (e.g. 21 inline cross_refs in P05, each its own relocation) are counted **separately** instead
     of collapsing to one. A genuine re-scan of the identical string (FOR_MODEL `walkStrings`) still collapses.
     This makes `lint --corpus` the true §4 inventory the sweep is measured against, not a coarse undercount.
  `lintForModel`, `scanProse`, `walkStrings`, `section`, `R1_NOT_ENTITY`, `snake` are unchanged
  (FOR_MODEL `cross_ref`/link fields are intentionally left alone), so **no FOR_MODEL finding count changes**.
- **Files touched:** `src/engine/lint.ts` (rule union + `Lexicon` fields incl. `answer_labels` +
  `qaParts`/`compoundMarker` helpers + rewritten `lintMeaningMap` per-line loop, answer_labels applied
  answer-side only); `_spec/lint-lexicon.json` (`schema_version` 0.1.0→0.2.0; `+link_markers`,
  `+meta_questions`, `+answer_labels` (10, §4-answers-only), `+hifil`, `compound_markers += ", "`,
  `conditioning_qa +=` 5, `interpretive_labels` left at its original 15, `_doc` refreshed); `tests/lint.test.ts`
  (rewrote the old "exempts cross_ref" test to assert the new FLAG behavior + once-not-twice count; added
  meta-question, question-side-jargon, comma-compound + entity-list-guard, answer-label-in-§4, and a
  FOR_MODEL scope-guard test proving a soft label inside a closed-list `speech_act`/§3C note is NOT flagged);
  `_spec/pins.json` (re-pin, below); this log.
- **Lexicon re-pin:** `lint-lexicon.json` **0.1.0 → 0.2.0**;
  sha256 `15a67a5fe1a9e646b76efc7195fa1bdbaf8fe6e6079d186b56e269d841b7b825` →
  `5bfa0e3fa9afdb8b90912865185a95c8596a7e1c3c58f90000ed748e2f3bb8f2`. `tripod check-drift` green at the new pin.
- **Relation to SC-0012/SC-0013:** completes SC-0012's drift-guard by closing the cross_ref-skip and
  answer-only blind spots the SC-0013 audit found; it does **not** touch artifact content — the content sweep
  those findings call for is reserved as **SC-0016** (human-gated).
- **Validator impact (corpus lint, before → after):** `tripod lint --corpus` **14 → 150** findings
  (**0 → 62 tier-1**, 88 tier-2); **7 artifacts clean** (P01 meaning-map after its cross_ref removal under
  SC-0016, + all six FOR_MODELs — unchanged from baseline). All newly-surfaced findings are in the
  previously-invisible meaning-map §4/§3C layer; the true per-rule corpus tally is **60 `link_in_level3`**
  (inline cross_refs: P02 2 · P03 5 · P04 19 · P05 21 · P06 13), **21 `meta_question`** (P03 1 · P04 9 ·
  P05 9 · P06 2), **39 `compound`** (P02 7 · P03 5 · P04 8 · P05 10 · P06 9), **19 question/answer-side
  `forbidden_vocabulary`** (`verb`/`agent`/`lexeme`/`clause`/`subject`/`hifil`: P02 5 · P04 7 · P05 4 · P06 3),
  **11 §4-answer `interpretive_label`** (P02 1 · P06 10). (The pre-truthful-reporting view collapsed these to
  54 by de-duping per coarse location.) No FOR_MODEL count changed (lintForModel untouched; answer_labels are
  §4-answer-scoped).
- **Verification:** `npm test` 94/94 green (lint.test.ts 14/14); `tripod check-drift` clean incl.
  lint-lexicon at v0.2.0 + the closed-list sync invariant; `tripod validate fixtures/for-model/` 6/6 valid;
  `tripod gold-diff` unchanged (P01 100 · P02 90 · P03 100 · P04 95 · P05 98 · P06 96);
  `tripod coverage --corpus` 6/6 block-clean (245/245). No fixture content edited.

---

## SC-0014 — Rename SPEECH_ACT `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` → `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **APPLIED — pending the project lead's blessing** (vault PR for P02–P06 / repo PR for the spec + fixtures).
- **Type:** closed-list change (L1 SPEECH_ACT) + artifact migration.
- **Summary:** `tripod lint` surfaced that the closed SPEECH_ACT list carried
  `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` — "AGENT" is role-theory jargon (R4), in a Layer-1 closed-list
  value, so it cannot be fixed by content edits. **Ruling:** rename it to **`ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`**
  — drops the "AGENT" jargon; uses **GOD** (not YHWH) because SPEECH_ACT is the cross-corpus interlanguage
  (it must read for the LA_RECORDING profile too). The new value carries no forbidden-vocabulary token.
- **Spec change (exact):**
  - `validation-rules.json` `closed_lists.SPEECH_ACT`: `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` →
    `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (one value; no other list touched). Version **v0.6 → v0.7**,
    `$id` + `for_model_schema.$id` bumped, `sibling_schemas.compilation_log` → `v0.5`, `supersedes` appended.
  - `compilation-log.schema.json` `$defs…speech_act` enum: same rename (kept in sync). Version **v0.4 → v0.5**,
    `$id` bumped, `supersedes` appended. (No structural change — additive-only history preserved.)
  - There is **no** `for_model_schema.$defs.speech_act_value` enum (SPEECH_ACT is enforced by the L1
    closed-list block, not an ajv enum), so the closed-list **sync invariant** — which covers
    REGISTER / GENRE / NARRATIVE_FRAMING — is unaffected.
- **Artifact migration (done):** the value occurs as a structured `speech_act` in **P02 FOR_MODEL (×1, P12)**
  and **P04 FOR_MODEL (×4, P4+P5)**; migrated in vault `stas/` + compiler `fixtures/for-model/`. The P02/P04
  **COMPILATION-LOG**s (structured values + audit prose) migrated in vault + compiler fixtures. Propagated to
  `_spec/agent-3-system-prompt.md` (the Agent-3 prompt that emits the value) and the Pilot-2 usage glossary
  `_templates/sta-vocabulary.md`. **Deliberately NOT touched** (out of Pilot-2 scope): `_pilot-3-design/`, the
  bible-wide Layer-2 seed (`tripod-bible-wide-layer-2-vocabulary-seed-*` + `.csv`, `sta-vocabulary-general.md`)
  where it is a `PENDING_PILOT3_LOCK` candidate, and `_archive/` + `_working/` (historical audit trail).
- **⚠ FORWARD-POINTER (Pilot-3 lock) — added under SC-0016 vault writeback (2026-05-31):** the **old**
  `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` value still lives in the bible-wide Layer-2 **seed CSV** (×2 rows,
  Pilot-3 lane) as a `PENDING_PILOT3_LOCK` candidate. It was intentionally left there (no CSV edit — Pilot-3 is
  out of this lane's scope). **At Pilot-3 lock this must be reconciled** to the renamed `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`,
  or SC-0014's de-jargoning is silently reversed when the seed is promoted. Recorded as a pointer only; do not
  cross into Pilot-3 to fix it now.
- **Validator impact:** `tripod validate` blocks the old value (no longer in the closed list) and accepts the
  new one. The 5 FOR_MODEL `[forbidden_vocabulary] «agent»` lint findings disappear (corpus lint **19 → 14**,
  the residual 14 being the §4 Q&A dialogue reserved for the lead).
- **Version:** `validation-rules.json` **v0.6 → v0.7** (sha256 `8c436b261178517108cb44e39408bca2c99dfd8674fb4954ccf2e72197cadcbe`);
  `compilation-log.schema.json` **v0.4 → v0.5** (sha256 `f009b32781f8a0e4d4d40e4f7500dd64396bdeeb06e3fe16d9ff2214033c36ca`).
  Both re-pinned in `_spec/pins.json` + the pin table above.
- **Note (pre-existing drift observed, flagged):** the vault `_spec/compilation-log.schema.json` was at **v0.3**
  and lacked SC-0007's promotion slots — i.e. SC-0007 had shipped to the compiler's vendored/pinned copy but was
  never written back to the vault canonical. Applying SC-0014, the vault `_spec/` schemas were re-synced to the
  pinned compiler copies (v0.7 / v0.5), incidentally closing that drift. Vault COMPILATION-LOG **artifacts** were
  not back-filled with SC-0007 convergent values (out of scope); flagged for a future vault-writeback pass.
- **Verification:** `tripod check-drift` green against the new pins + the closed-list sync invariant;
  `tripod validate fixtures/for-model/` 6/6 valid; `tripod validate fixtures/compilation-log/` 6/6 valid
  (P02/P04 against the renamed v0.5 enum); `tripod lint --corpus` 14 findings (0 tier-1), the 5 `«agent»`
  findings gone; `npm test` green.

---

## SC-0013 — Map content remediation (SC-0012): P01 reference + P02–P06 roll
- **Corrective second pass — P02–P06 brought to the blessed-P01 standard (2026-05-31):** the first roll
  (below) was sound on the plain-language (R4) fixes, the dialogue intact, and P06's keepers — but it
  over-deleted §3C on a **false premise** ("P02–P05 had zero §3C entities"). Per the lead's rulings, those
  pericopes **do** reference real Concept-Bank entities that belong in §3C (R1, per blessed P01/P06). Restored
  as proper §3C entities (map: Hebrew header + What-it-is/Function/Signals; FOR_MODEL: `objects_in_scene`
  `object_id: CB_00xx` + `function_in_scene`), BCD unchanged (these CB_ were already registered):
  - **P02** — bread `CB_0012` (S1); hesed `CB_0011`, blessing `CB_0008`, rest/menucha `CB_0014` (S2).
    Relocations made real: daughter-in-law (kallah) → B8/B9 `referential_form` (`CB_0017`); mother's-house →
    place `PL_EACH_HER_MOTHERS_HOUSE` (`CB_0013`); paqad / news-hearing / departure verbs → P1–P3.
  - **P03** — §3C "None" confirmed correct; the six vow bindings verified surviving in P3 `vow_components`;
    pairing `CB_0021` + `FIG_0072`/`FIG_0074` and levirate `CB_0019` verified as flags.
  - **P04** — barley-harvest `CB_0026` (S3). Mara `CB_0023` (→ P4 renaming + B3 `referential_form` + `FIG_0082`),
    full/empty `CB_0024`+`CB_0044` (→ `FIG_0084` + P5 payload), testify-against `CB_0025` (→ P5), Moabite
    `CB_0004` + daughter-in-law `CB_0017` (→ B9 `referential_form`) all verified. **STOP / surfaced for the
    lead:** the **doubled-divine-name pattern** (YHWH×2 / Shaddai×2, 1:20–21) has **no figure of its own** —
    its four invocations survive (Shaddai→`FIG_0006`; YHWH→P5+`CB_0025`) but the pattern-as-figure was dropped;
    a new `FIG` is proposed (handoff), not added pending the ruling.
  - **P05** — chayil `CB_0032` (S1); favor `CB_0033`, gleaning `CB_0034` (S2); providence/miqreh `CB_0035`,
    blessing `CB_0008` (S3); foreman-role `CB_0036` verified in B15 `referential_form`, Moabite `CB_0004` added
    to B9 `referential_form`. The within-day "from morning until now" duration restored to §3C (it was a
    content-duration the map's §3D note still pointed at, per the P01 `TM_TEN_YEARS` precedent).
  - **P06** — keepers unchanged; the FOR_MODEL was additively aligned to the map, which retained `CB_0034`
    (S1/S4) and `CB_0033`/`CB_0038`/`CB_0037`/`CB_0008` (S2) as §3C entities the FOR_MODEL had dropped.
- **Per-item relocation notes (both artifacts) replace the first pass's generic per-scene counts** ("N thematic
  items relocated…"), matching P01's item→named-destination standard; a per-pericope relocation audit table
  proves relocate-never-delete. The deleted `*_form` slots were re-verified (grammatical-pattern labels; the
  events survive in `proposition_kind`/components).
- **Result (corrected):** corpus lint **19 → 14** (0 tier-1; the 14 are §4 Q&A dialogue + were 19 before SC-0014
  removed the 5 `«agent»`); validate 6/6; coverage 6/6 block-clean (245/245, 0 unanchored); gold-diff agreement
  unchanged; tests green.
- **Residuals (by design, surfaced for the lead):** (a) the **§4 Q&A dialogue compounds** (re-atomizing is the
  lead's exegetical pass — each surfaced with a proposed atomization, not decided); (b) the **P04 doubled-divine-name
  figure** (above).

### First roll (2026-05-31, superseded above)
- **P02–P06 roll:** applied R1/R3/R4/R5 across P02–P06 (vault + fixtures). **§3C → entities
  only:** 116 thematic objects (events/speech-acts/framings/patterns — *_form/_verb/_formula/_directive/
  _question/_declaration) removed from `objects_in_scene`, with their orphaned `*_form` slots (R5
  conditioning) and the mirrored map §3C entries; only true O#/CB_ entities kept (~~P02–P05 had none~~ —
  **corrected above**; P06 keeps O9/O10/O11 + CB_*). Plain-language fixes (R4): action/referential values
  "DIVINE_AGENT"→"YHWH", significant_absence "agent/verb" prose, P06's marquee items ("speech-act of directive
  instruction"→"telling", "abundance triplet — three verbs"→"she ate · she was satisfied · she had leftover",
  "infinitive-absolute doubling"→plain). P06 conditioning-Q&A (Register?/Self-form?/Forward-link?) removed (R5).
- **Result:** corpus lint **~182 findings (56 tier-1) → 19 (0 tier-1)**; validate 6/6 clean; coverage 6/6
  block-clean (leaner abstract overlays); gold-diff agreement unchanged (leaner placeholders); 88 tests green.
- **Pending the lead's blessing** (vault PR #5 / repo PR #15, superseded by the corrective pass).

---

## SC-0013 — Map content remediation (SC-0012): P01 worked reference
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **P01 APPLIED — pending the project lead's blessing** (vault PR for P01 map + FOR_MODEL);
  P02–P06 roll once P01 is blessed. The worked reference calibrates the rest.
- **Type:** artifact remediation (no schema/spec change).
- **Summary:** Apply R1–R5 to P01's §3C + Level 3. §3C shrinks from ~17 thematic entries to **3 true
  entities** (O1 famine · CB_0030 sojourn · the about-ten-years duration). Every relocated item's insight
  is re-homed (never deleted), documented inline in `_note`s:
  - **events → propositions:** death of Elimelech→P7, taking of wives→P9, deaths of both sons→P12, prior-death-referenced→P13 link;
  - **framings → referential_forms:** "husband of Naomi"→B2@P7, "the woman"→B3@P13, "her children" (yeladim)→B4·B5@P13, "for themselves"→P9 OWN_INITIATIVE, Ephrathite identity→being B6;
  - **patterns → figures / inherent / order-constraint:** vayhi formula→FIG_0007, residual "she remained"→FIG_0052, "both of them"→inherent in deceased[B4,B5], cumulative listing→P13 listing_order_form (no new figures, per the lead's call).
  - **plain-language (R4):** significant_absence "agent of the famine" → "the one who sent the famine".
- **Artifact migration:** **P01.** Vault `stas/P01-…-FOR-MODEL.md` (objects_in_scene + slot cleanups) and
  `pericopes/P01-…md` (§3C) — mirrored to `fixtures/`. **BCD unchanged** (P01's TH_ codes were never registered).
- **Verification:** `tripod lint` P01 **12 findings → 0 (clean)**; `validate` 0-block; `coverage` P01 still
  block-clean (abstract overlays 15→2); `gold-diff` P01 **100%**, leaner (78→56 placeholders); 88 tests green.

---

## SC-0012 — Level-3 / §3C content discipline (R1–R5) + the `tripod lint` drift-guard
- **Date:** 2026-05-31
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** (the rule, the lint, and the template remediation); the **map remediation is a
  gated follow-on** (P01 first). Wiki side: vault PR [ruth-pilot-b-wiki#3](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/3).
- **Type:** methodology + tooling — **no `validation-rules.json` change**.
- **Summary:** The content layers — Level 3 propositions and §3C — must hold only the **bare, atomic,
  plain-language payload**; everything else (interpretation, classification, grammatical analysis,
  register, links, figures, cross-refs) is **conditioning** (its own field/layer) or doesn't belong.
  Five rules: **R1** §3C = entities only (events→propositions, framings→`referential_form`,
  patterns→figures); **R2** atomic; **R3** bare (content, not a label for it); **R4** plain-language (no
  grammatical/linguistic jargon — *the locked anti-colonial-frame commitment*: a map that says
  "wayyiqtol" or "patient" teaches downstream models the source grammar and imposes it on unknown target
  languages); **R5** payload-only (conditioning separated).
- **Spec change (exact):** new vendored **`_spec/lint-lexicon.json`** (forbidden vocabulary tiered,
  interpretive labels, conditioning-Q&A patterns, compound markers, substitutions — sourced from the
  methodology doc), pinned in `_spec/pins.json` → `sources`. New engine `src/engine/lint.ts` + CLI
  `tripod lint [paths…] [--corpus] [--tier1]`. Wiki: `_methodology/level3and3Ccontentdiscipline.md` (the
  rule) + `_templates/meaning-map-template.md` remediated (§3C entities-only; §6.2 atomic-bare-plain-payload).
- **Validator impact:** a **4th deterministic verifier** beside validate/coverage — it *surfaces* drift
  (the human judges + relocates insight, never deletes). Completes the stack: **legal (validate) ·
  complete (coverage) · atomic-bare-plain (lint) · true (human review).**
- **Inventory (drives the map remediation):** `tripod lint --corpus` over P01–P06 ⇒ **~182 findings** —
  87 forbidden-vocabulary, 48 §3C-not-an-entity (TH_ objects that are events/framings/patterns), 34
  interpretive labels, 10 compounds, 3 conditioning-in-Q&A. None block; all are review signal.
- **Version:** no spec-version bump; `lint-lexicon.json` pinned `0.1.0`.
- **Verification:** 88 tests green (+8 lint: whole-word discipline so "verb"⊄"adverb" and controlled
  slot-names aren't flagged; R1/label/conditioning/compound detection); `check-drift` ok.
- **Follow-on (gated):** remediate the agent system-prompts + spec vocab prose; then the **map remediation**
  (P01–P06 §3C + Level 3) — exegetical, the project lead adjudicates; P01 first → confirm leaner & truer →
  roll P02–P06; re-validate + re-baseline gold-diff/coverage; **before Slice 4** (clean supervision in, clean drafts out).

---

## SC-0011 — BCD `gender` frontmatter field (authoritative; retires the prose-guess)
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** — wiki side **merged** (vault PR [MarciaSuzuki/ruth-pilot-b-wiki#2](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/2), rebased on `main`); compiler side shipped.
- **Type:** registry/BCD (Layer 3) — **no `validation-rules.json` change**.
- **Summary:** The coverage matcher used entity gender to disambiguate unnamed referents, but the only
  source was a **prose-scan guess** in `build_aliases.py` (count kinship terms in the BCD entry). It was
  unreliable — it read **YHWH** and **the field-foreman** as feminine (off surrounding pronouns) and three
  collectives (whole-city, clan, people-of-YHWH) as single-gendered — and a wrong gender can veto a correct
  match (it was wrongly flagging YHWH as missing until the corpus pass made proper-noun **name** matches
  gender-immune, SC-0010's sibling fix). Replace the guess with an **authoritative `gender` frontmatter
  field** on every being.
- **Spec change (exact):** BCD — add `gender: "m" | "f" | null` to all 31 being notes (after `b-code`).
  `null` = collective / mixed / office (do not guess). `build_aliases.py` reads it authoritatively (explicit
  `null` ⇒ no gender); the prose guess survives only as a fallback for a being lacking the field. Alias table
  re-pinned `aliases-0.1.1 → 0.1.2` (9 gender corrections; all non-gender fields byte-identical).
- **Artifact migration:** none (frontmatter-only; no FOR_MODEL/map/prose changes).
- **Validator impact:** none to block status — the corpus stays 6/6 clean (the proper-noun name match is
  already authoritative). Entity gender is now correct data for unnamed-referent disambiguation.
- **Version:** no spec-version bump; alias-table source re-pinned `0.1.2`.
- **Verification:** 80 tests green; `check-drift` ok; `tripod coverage --corpus` 6/6 clean; B10 (YHWH) gender = `m`.

---

## SC-0010 — Coverage recorded-exception mechanism + the P06 "Israel" epithet-internal ruling
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED**
- **Type:** tooling/spec (coverage) + a registry ruling — **no `validation-rules.json` change**.
- **Summary:** Coverage's "nothing missing" check blocks on a named referent the map omits. Some findings
  are *legitimately* not entities — the reviewer must be able to **sign off** so the block is recorded as
  accepted rather than silently suppressed (the open item in `docs/COVERAGE.md`: "how the reviewer signs off
  on exceptions"). Add a pinned `_spec/coverage-exceptions.json`; `tripod coverage` downgrades any matched
  finding to **ACCEPTED** (still shown in the ledger, with the reason + provenance), so it no longer fails
  the run. **First exception:** P06 — "Israel" (יִשְׂרָאֵל, 2:12) occurs inside the divine title "the God of
  Israel"; it qualifies the divine name, not a separately-tracked participant, so no `PL_ISRAEL` entity is
  warranted there. Ruling: **EPITHET_INTERNAL**.
- **Spec change (exact):** new vendored artifact `_spec/coverage-exceptions.json` (pinned in
  `_spec/pins.json` → `sources`). Match keys: `UNMAPPED_SOURCE` → (pericope, gloss, verse-prefix);
  `UNANCHORED_ENTITY` → (pericope, entity_id). Each entry carries `reason` + `accepted_by`/`accepted_on`/`sc_ref`.
- **Artifact migration:** none (no FOR_MODEL/map edits — the map intentionally does **not** tag Israel at 2:12).
- **Validator impact:** `reconcile()` gains an `exceptions` arg; accepted findings are excluded from the
  block counts and tallied as `score.accepted`; `ok` ignores accepted findings. Ledger + CLI show an
  "accepted exceptions" section and `· N accepted` in the score line. **Result: the full P01–P06 corpus is
  6/6 block-clean** (245/245 explicit accounted, 1 by this sign-off, 0 unanchored).
- **Version:** no spec-version bump; `coverage-exceptions.json` pinned at `0.1.0`.
- **Verification:** 80 tests green (raw P06 still flags Israel; the sign-off downgrades it to accepted;
  synthetic accept tests for both finding kinds); `check-drift` ok.

---

## SC-0009 — Merge PL_HA_ARETZ into PL_LAND_OF_JUDAH (the same-referent principle)
- **Date:** 2026-05-30
- **Decided by:** Marcia Suzuki
- **Status:** **SHIPPED** — wiki side **merged** (vault PR [MarciaSuzuki/ruth-pilot-b-wiki#1](https://github.com/MarciaSuzuki/ruth-pilot-b-wiki/pull/1), approved by the project lead, rebased as `402f5ef` on `main`); compiler side shipped. Repo fixtures + pinned alias table confirmed identical to the merged canonical BCD.
- **Type:** registry/BCD (Layer 3) — **no `validation-rules.json` change**.
- **Summary:** "the land" (הָאָרֶץ, Ruth 1:1) and "the land of Judah" (אֶרֶץ יְהוּדָה, 1:6–7) are the
  **same geographic referent** (the covenant territory) seen at two moments — the famine that empties it
  and the bread/return that fills it. The P01 working code `PL_HA_ARETZ` is **merged into the existing
  `PL_LAND_OF_JUDAH`** and retired; the two moments are distinguished by **referential_form**, not by a
  second PL-code. (Closes the item `PL_LAND_OF_JUDAH` had flagged: *"pending formal PL-code assignment,
  parallel to P01's PL_HA_ARETZ handling."*)
- **Same-referent principle (new, reusable — the reason this is logged):** when the source text refers to
  one place / being / object under different surface forms across the book, it gets **one** Layer-3 code;
  the load-bearing surface distinctions are carried by `referential_form` (and per-scene `role_in_scene`),
  **never** by minting a second code. Splitting one referent across two codes is **registry drift** — the
  same failure class the compiler exists to prevent (training paper §12), now stated for Layer 3.
- **Spec change (exact):** none to `validation-rules.json`. **BCD `PL_LAND_OF_JUDAH`:** add
  `hebrew_aliases: [הָאָרֶץ, אֶרֶץ]`; `aliases` (referential forms) → `[THE_LAND_AFFLICTED_BY_FAMINE` (1:1)`,
  LAND_OF_RETURN_AND_PROVISION` (1:6–7)`]`; `first-appearance P02→P01`; `appears-in [P02,P03]→[P01,P02,P03]`.
  **`PL_HA_ARETZ`** retired (it never had a BCD file — a P01 working code only).
- **Artifact migration:** **P01.** Vault `stas/P01-…-FOR-MODEL.md`: `PL_HA_ARETZ → PL_LAND_OF_JUDAH` in
  scene S1 `places_in_scene` and proposition P2 `afflicted_place` (`role_in_scene: LAND_AFFLICTED_BY_FAMINE`
  carries the 1:1 referential sense — the schema's `scene_places_container` is `additionalProperties:false`,
  so places take no `referential_form` field; only beings do). Vault `pericopes/P01-…md`: scene-1 "the land"
  → `[[PL_LAND_OF_JUDAH]]`. Mirrored into `fixtures/` (kept byte-identical to the vault). No other pericope
  references `PL_HA_ARETZ` as a live code.
- **Validator / tooling impact:** the FOR_MODEL re-validates **0-block** (`PL_LAND_OF_JUDAH` matches the
  `place_id` pattern). `extractor/build_aliases.py` now reads `hebrew_aliases` → `hebrew_cons_aliases`;
  `src/engine/coverage.ts matchScore()` tests the referent against the entity's primary Hebrew **plus** any
  surface alias. `gold-diff` P01: 43→44 matched (the now-coded place extracts deterministically). `tripod
  coverage P01`: "the land" (אָרֶץ, 1:1) now **MATCHED → PL_LAND_OF_JUDAH** (`via lexical`), where it was
  previously on the reviewer tick-list because `PL_HA_ARETZ` had no BCD entry.
- **Version:** **no spec-version bump** (`validation-rules.json` stays `v0.6`). Layer-3 source re-pinned:
  `_spec/registry/ruth.aliases.json` `aliases-0.1.0 → 0.1.1` (sha `9eba86f6…`).
- **Verification:** 73 tests green (incl. a synthetic `hebrew_cons_aliases` match test + the P01 acceptance
  assertion that "the land" → `PL_LAND_OF_JUDAH` and `PL_HA_ARETZ` is gone); `check-drift` ok; coverage P01
  block-clean (`47/47 explicit · 5 implied · 0 unanchored · 14 ticks`).

---

## SC-0008 — Canonical-home: spec-vault reconcile + `check-drift --vault` guardrail (folds in template-relics retirement)
- **Date:** 2026-05-29 (reinstated as SC-0008)
- **Decided by:** Marcia Suzuki (compiler-half build recommended by Architect 10, confirmed by Marcia in review 2026-06-07)
- **Status:** APPLIED (compiler half — see the **Build** note below; gate board green; the **vault writeback / reconcile is PENDING**). PR open.
- **Type:** governance infrastructure — build the `check-drift --vault` guardrail + reconcile the stale vault spec (the **load-bearing** half); folds in the original template-relics docs hygiene (the minor half)
- **ID note:** Tentatively numbered SC-0006 in an earlier planning session but never committed to this
  log under that number (SC-0006 shipped as drift convergence, `9fdef18`); later surfaced as SC-0007 in
  `docs/PROGRESS.md` open-thread (c), colliding with the L1-axis item now at SC-0007. Reinstated here
  under its own permanent ID — see the allocation ledger.
- **Summary:** Two pre-Wave-3 template files survive in the wiki vault `_templates/`:
  `for-model-template.md` still documents `discourse_threads_active` as a FOR_MODEL field (now
  BCD-DELTA-only), and `audit-template-schema.json` is the schema for the obsolete AUDIT artifact.
  Retire/redirect both.
- **Spec-vault reconcile + `check-drift --vault` — the PRIMARY, load-bearing half of SC-0008 (scoped 2026-06-06, found during SC-0025); the template-relics retirement above is the minor original half.** SC-0008 is the missing guardrail behind a now-verified drift, not an incidental cleanup: the vault `_spec/` schema files are a stale snapshot frozen ~SC-0014 (`validation-rules.json` v0.7 vs compiler v0.12; `approved-enumerations.json` v0.1 vs v0.10; `compilation-log.schema.json` v0.5 vs v0.7; `quarantined-vocabulary.json` **absent**), because every SC since ~SC-0015 edited the spec compiler-side and `check-drift --vault` — the check that would catch it — was never built. SC-0008 has sat **PROPOSED since before SC-0014 with no owner** while ~10 SCs of spec edits accrued unwritten-back; if it stays parked, the same finding recurs at SC-0030 with the spec eleven versions stale. **Scope bound here:** the bulk spec-vault reconcile (catch all four files up + create the quarantine file) ships **together** with `check-drift --vault` (so it can't silently re-drift), as its **own gate cycle** — one concern per cycle; it does **not** ride on SC-0026 (CL gate-validation — different artifact, different check) or Thread B. Interim, per the Canonical-home rule's "Current state": the compiler's pinned `_spec/` is canonical; the vault `_spec/` is a stale snapshot and must not be synced *from*.
- **Build (compiler half — Architect 10, 2026-06-07; PR pending Marcia):** ⚠ verification corrected the framing above — `check-drift --vault` was **NOT "never built"**: it exists and **exits 1** on a differing file. The real gaps were (i) it is **never run** (no gate invokes it; the vault isn't in CI) and (ii) an **absent** canonical file was **silently uncaught** (`vaultOk=undefined`, ignored by the exit). This PR (compiler half): **fixes the blind spot** (absent → `vault:MISSING`, trips exit 1, + a unit test); **reclassifies `quarantined-vocabulary.json` source→schema** (Marcia's call) so it is vault-guarded; adds a **conditional `--vault` vitest test** (runs when `TRIPOD_VAULT_SPEC` is set, **skips visibly** otherwise) + a `check-drift:vault` npm script; folds in a one-line **schema-vs-source criterion**; and **sweeps SC-0021–0025 ledger statuses to MERGED**. The **reconcile** (writeback the 3 stale schemas + the now-schema quarantine file + the 6 stale CLs to the vault) is the **second half — vault writeback, PENDING**; until it lands the conditional test is *correctly red when the vault is configured* (catching real drift, not a regression). `check-drift --vault` now reports **4** drift items (3 stale + quarantine MISSING), up from 3 — the blind-spot fix working.
- **Scope extended (2026-06-06, found during SC-0026; recommended by Architect 10, confirmed by Marcia in review):** SC-0008 also reconciles the stale vault `stas/` **COMPILATION-LOGs**, not just `_spec/`. Verified during SC-0026: all 6 vault CLs are a strict subset of the merged compiler fixtures (vault-only keys = 0; each missing `vocabulary_additions.role_in_scene_beings`, 5/6 also missing the `vocabulary_additions.*_elements` breakdown; 54–242 changed lines each) — the same unguarded-stale-vault class as `_spec/`, an authoritative artifact left adrift because its *content* check is the unbuilt one. SC-0008's deliverable accordingly grows to: (a) **writeback** the 6 vault CLs to match the merged compiler copies (diff-first / surgical, handoff §V.5), and (b) a **`stas/` content guardrail** (the CL analogue of `check-drift --vault`). SC-0026 (the CL **schema** gate) is the separate, already-shipped half — it cannot see content staleness.
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
