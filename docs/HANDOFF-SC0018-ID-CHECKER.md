# Build brief — SC-0018: cross-artifact entity-ID alignment checker

> Ruled by Marcia Suzuki (2026-06-01). **The principle:** the prose map and the FOR_MODEL are the two halves
> of one training pair — an entity named in one must be the *same code* the other uses, verifiable by machine,
> not by a human's eye. Today the map writes `[[B2-Elimelech]]` and the FOR_MODEL writes `B2` (recoverable),
> but in places it's a genuine mismatch: P01's "about ten years" is `TM_TEN_YEARS` in the map and
> `TH_TEN_YEARS_APPROXIMATELY` in the FOR_MODEL — different code *and* namespace. This brief builds the
> **checker that makes the alignment mechanical**. It is **diagnostic only** — it fixes no content; it produces
> the inventory, Marcia rules it, a later pass aligns.

You are a Tripod Compiler build session. **Add-only tooling**: a new deterministic verifier + CLI + tests + one
empty pinned exceptions file. **No content edits**, no schema/vocab/pin change (beyond the new exceptions file),
no vault changes. Same family as `lint`/`coverage`: the tool *surfaces*; the human rules.

## SC
**SC-0018** — verified next-free (the `SPEC_CHANGES.md` ledger runs through SC-0017). Type: verifier/tooling +
the locked ID convention (methodology). No spec-version bump. Write the SC-0018 entry (Status PROPOSED →
the convention + the checker). The P01–P06 *reconciliation* of whatever this surfaces is a **separate, later,
human-gated pass** (it rides with the SC-0019 prose-standard pass) — not this brief.

## The locked convention (record it; the checker enforces it)
- **Canonical entity ID = the bare code** (`B2`, `O1`, `PL_LAND_OF_JUDAH`, `CB_0012`, `TM_*`, `FIG_*`, `I*`).
  It's what the FOR_MODEL + BCD use and what the schema *patterns* enforce (`being_id` = `^B(\d+|\?)$`, etc.;
  a name like `B2-Elimelech` is schema-illegal in a FOR_MODEL).
- **Maps carry the code in the wikilink target:** `[[CODE-Slug]]`, `[[CODE-Slug|Display]]`, or `[[CODE]]`.
  **The code = the wikilink target (the part before any `|`), taken up to but NOT including the first hyphen
  `-`; if there is no hyphen, the whole target is the code.** This is sound because **codes never contain a
  hyphen** (schema patterns are `[A-Z0-9_]`-only). **Assert that invariant from the pinned schemas** at startup
  — if any code pattern ever admits a `-`, fail loudly (the extraction rule would silently break).

## What the checker does — per pericope (the map + its paired FOR_MODEL)
**Derive the entity-code namespaces FROM the pinned schemas** (`_spec/…validation-rules` / the FOR_MODEL
schema's `being_id`/`object_id`/`place_id`/`time_id` + the `cb_flags`/`figure_flags`/institution patterns).
Do **not** hardcode them from memory (project discipline — the same drift this tool exists to prevent).
The compiler's `compile`/reader already parses map wikilinks into codes — **reuse that extractor**, don't
re-implement it.

**Step 1 — extract codes.**
- **MAP:** every `[[…]]` whose extracted code matches an entity namespace. Record each with `{code, slug,
  display?, section, scene}`. A wikilink whose code matches **no** namespace is a **note link**
  (`[[P01-Ruth-1-1-5-FOR-MODEL]]`, `[[P01-…-AUDIT]]`) — exclude from entity sets, keep for Step 5.
  Tag each entity ref as **STRUCTURAL** (it sits in a §3 per-scene declared-entity block — beings / places /
  objects / times, the "3A–3D"-style sections) or **PROSE** (a relationship line, the "What Happens"
  narration, etc.). Confirm the exact section labels from the meaning-map template.
- **FOR_MODEL:** codes from the scene containers (`level_2_scenes[].{beings,places,objects,times}_in_scene.
  entries[].*_id`), plus pericope-level `cb_flags[]` / `figure_flags[]`. **Secondary:** being-codes used as
  `event_specific_slots` *values* (a value matching `^B\d+$`). **Exclude** `referential_form`, `role_in_scene`,
  `function_in_scene`, `action`, `speech_act` — those are names / L2 tokens, NOT codes.

**Step 2 — reference integrity (both sides).** Every extracted code must resolve to a real BCD entry. Consume
the pinned `_spec/registry/ruth.aliases.json` (and/or the BCD) as the registry of valid codes + canonical
names. A code with no BCD entry ⇒ **ERROR** (unknown / dangling code).

**Step 3 — name-binding (map slugs).** For each map entity wikilink, the **slug must match the BCD canonical
name** for that code under a defined normalization: compare `slug` to `slugify(BCD_name)` where `slugify` =
spaces→`-`, preserving the source's Title-Case (observed: `Bethlehem-of-Judah`, `Fields-of-Moab`,
`About-Ten-Years`). Mismatch ⇒ **ERROR** — this is what catches `[[B2-Elimlech]]` (typo) and `[[B3-Elimelech]]`
(right name, wrong code). A deliberate surface variant ⇒ a signed-off exception (Step 6). Specify the exact
`slugify` in the SC entry so it's reproducible.

**Step 4 — cross-artifact alignment (the core check).** Per scene where the scene IDs align (map §3 scene ↔
FOR_MODEL `level_2_scenes[].scene_id` — both use `S1`/`S2`…), else per pericope:
- `MAP_STRUCTURAL` = the **STRUCTURAL** entity codes for that scene.
- `FM_STRUCTURAL` = the FOR_MODEL scene-container codes (+ pericope `cb_flags`/`figure_flags`).
- Report the **symmetric difference**: `map-not-FM` and `FM-not-map`. Where an unmatched map code and an
  unmatched FM code **share a stem** (e.g. both contain `TEN_YEARS`), tag them **LIKELY_SAME_REFERENT** — that
  is the `TM_/TH_` class, the highest-value finding.
- **PROSE-only mentions are NOT required to be in the FOR_MODEL** — they're checked by Steps 2–3 only (resolve
  + name). (A being's relationship line may name an off-stage relative; that's not a scene entity.)

**Step 5 — dangling note links (secondary).** A map `[[Note-Title]]` (non-entity) that resolves to no existing
note/artifact ⇒ flag (catches the stale `[[…-AUDIT]]` links — pilot-2 has no AUDIT artifact). Report separately;
lower priority than the entity checks.

**Step 6 — exceptions.** New pinned `_spec/id-alignment-exceptions.json` — **empty at first**, same shape +
mechanism as `coverage-exceptions.json` / `lint-exceptions.json`: a signed-off entry `{pericope, kind, code(s),
reason, accepted_by, accepted_on, sc_ref}` downgrades a finding to **✓ ACCEPTED** (still shown, excluded from
the failure count). It exists for the *legitimate* "map declares an off-stage referent the FOR_MODEL omits"
cases (which `gold-diff` already documents as coverage differences). **Add NO exceptions in this build** — the
first run must be the raw, complete inventory.

## Output — the inventory (this IS the deliverable)
CLI `tripod id-check [paths… | --corpus] [--json] [--out <ledger.md>]`. Per pericope, sectioned:
reference-integrity errors · name-binding errors · cross-artifact misalignments (each with its
`LIKELY_SAME_REFERENT` tag where detected) · dangling-note flags · accepted (none yet) — plus a corpus summary
line (counts per category). **Run it on P01–P06 and hand back the full inventory. Fix NOTHING.**

## Scope / boundaries
- **Diagnostic only.** Touch no map, FOR_MODEL, BCD, schema, vocabulary, or pin — *except* adding the empty
  `id-alignment-exceptions.json` (pin it in `_spec/pins.json`; `check-drift` covers it).
- No `|Display` pipe additions, no code reconciliation, no template/methodology edit, no vault touch — those
  are the later combined SC-0018-application + SC-0019 prose pass.
- The locked convention is recorded in the SC-0018 entry now; **seeding it into the vault template/prompts
  rides with the combined pass**, not here.

## Tests + gates
- Synthetic fixtures: clean pair → 0 findings · typo'd slug → name-binding ERROR · `TM_/TH_`-style pair →
  misalignment tagged `LIKELY_SAME_REFERENT` · off-stage PROSE ref → NOT flagged as misalignment · unknown code
  → reference-integrity ERROR · a seeded exception → downgraded to ✓ ACCEPTED.
- `npm test` green · `check-drift` clean (new exceptions file pinned at `0.1.0`) · `validate` / `lint` /
  `coverage` / `gold-diff` **UNCHANGED** (no content touched).
- Add `tripod id-check` to the verification-stack docs — the 5th deterministic check:
  **legal (validate) · complete (coverage) · atomic-bare-plain (lint) · aligned (id-check) · true (human).**

## Delivery
**Compiler PR only** (no vault). Hand Marcia: (1) the **P01–P06 inventory** — the mismatch list to rule,
`LIKELY_SAME_REFERENT` pairs called out; (2) the new `tripod id-check` CLI; (3) the gate results. The
reconciliation of whatever it surfaces — and the `|Display` / prose cleanup — comes **after** Marcia rules the
inventory, in the combined SC-0018-application + SC-0019 prose-standard pass over P01–P06 (then template/prompts,
then author P07–P14 born clean).
