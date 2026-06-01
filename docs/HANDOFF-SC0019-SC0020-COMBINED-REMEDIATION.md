# Build brief — combined P01–P06 remediation: prose standard (SC-0019) + entity-ID reconciliation (SC-0020)

> Ruled by Marcia Suzuki (2026-06-01). Two governed decisions land in **one pass over the same six maps** — so
> the conditioning prose and the entity references are touched once, reviewed once, written back once. After
> this, both conventions are baked into the template + agent prompts, and **P07–P14 are authored born-clean**
> in register *and* ID-alignment.

You are a Tripod Compiler build session. This pass has a **mechanical half (Part A — ID reconciliation)** and an
**exegetical half (Part B — the prose re-voicing, per-map, Marcia-gated)**. Do **Part A first** (it closes
`id-check` to clean — a stable foundation), then **Part B P01 as a worked reference → Marcia blesses → roll
P02–P06**. Deliver as one compiler PR + one vault PR (one writeback). The same safety rails as every vault pass.

## SC allocation (verified next-free; ledger runs through SC-0018)
- **SC-0019** — Common-Reader Prose Standard: seed the methodology + template/prompts, migrate P01–P06 conditioning prose. **No spec-version bump** (free-text + guidance only).
- **SC-0020** — Entity-ID reconciliation: apply the ruled dispositions + two `id-check` engine tweaks. **No spec-version bump** (a validation-rule tweak + registry/exceptions data + artifact edits).

Write both entries in `SPEC_CHANGES.md`. One decision per SC; both execute here.

---

# PART A — Entity-ID reconciliation (SC-0020)

Marcia's rulings (2026-06-01, "follow your disposition") — apply each, then re-run `tripod id-check --corpus`
until it is **0 findings, or only signed-off ✓ ACCEPTED**.

### A1 — two `id-check` engine tweaks (in `src/engine/id-align.ts`)
- **`<NS>?` is a legal withheld-referent, not an error.** A schema-legal code ending in `?` (e.g. `B?`,
  pattern `^B(\d+|\?)$`) is an *intentional* withheld referent. Stop reporting it as a ref-integrity
  `UNKNOWN_CODE`; surface it as **INFO** (`WITHHELD_REFERENT`). (Resolves P06 `B?` — the deliberate withheld
  deceased-husband, = the SC-0016-blessed "her husband (pair withheld; see P01-D2)". **No content change to P06.**)
- **Normalize `slugify` for note-title-safe punctuation.** Obsidian note titles (hence wikilink slugs) drop
  apostrophes; the BCD canonical names keep them. Make name-binding compare on a normalized form that **strips
  `'` and collapses `/`** (and any char a note title can't carry) on *both* sides, so `Naomis-Dwelling…` matches
  BCD "Naomi's Dwelling…" and `Boazs-Portion…` matches "Boaz's Portion…". **No slug/content edit** — this is the
  right fix (editing the slug would break the wikilink unless the note were also renamed). Resolves
  `PL_NAOMIS_DWELLING` (P05) + `PL5_BOAZ_PORTION` (P05, P06). Update `tests/id-align.test.ts` for both tweaks.

### A2 — B31 name (registry, vault-side) — your ruled call
The map uses the short "People-of-YHWH"; the BCD canonical is "His People / People of YHWH". **Add
`People-of-YHWH` (and `People of YHWH`) to B31's BCD `aliases`** (vault `bcd/beings/`), re-extract + re-pin
`_spec/registry/ruth.aliases.json`. Name-binding then accepts the map slug via alias — no map edit, canonical
name preserved. (Alternative, if you prefer a cleaner registry at review: set the canonical name to "People of
YHWH" and keep "His People" as the alias. Default to the alias-add — least invasive.)

### A3 — the place/time one-siders → signed-off exceptions (`_spec/id-alignment-exceptions.json`)
These are legitimate map↔FOR_MODEL coverage differences (off-stage/contextual referents), ruled ACCEPTED. Add
one signed-off entry each (`{pericope, kind, code, scene, reason, accepted_by: "Marcia Suzuki", accepted_on:
"2026-06-01", sc_ref: "SC-0020"}`), re-pin the file:
- `PL_LAND_OF_JUDAH` (P03, S1 + S2) — the covenant land they are returning *to*; referenced, not scene-present.
- `TM_BARLEY_HARVEST_BEGINNING` (P04) — the harvest frame named at the close; FM-structural only.
- `PL_AMONG_SHEAVES` (P06) — the gleaning locus in Boaz's command; FM-structural only.
- `PL1` / `PL2` (P04) — the **already-documented** MM↔gold coverage difference (the P04 95% gold-diff); map
  declares them, the gold FOR_MODEL omits them.
Take the exact codes/scenes from the current `id-check --corpus` output; sign off only those Marcia ruled.

### A4 — the TM_/TH_ same-referent (P01) — your ruled call: **align the map to the FOR_MODEL**
P01's "about ten years" is `TM_TEN_YEARS` in the map but `TH_TEN_YEARS_APPROXIMATELY` in the FOR_MODEL — ruled
canonical = the **thematic-object** form (the map's own §3C note calls it *"a duration mentioned inside the
scene; not the temporal setting"*). Edit the P01 **map** §3C wikilink `[[TM_TEN_YEARS-About-Ten-Years]]` →
`[[TH_TEN_YEARS_APPROXIMATELY-About-Ten-Years]]` (same §3C placement, same "About-Ten-Years" slug; only the code
changes). **Surface, do not guess, the vault-note situation:** check `bcd/times/` for a `TM_TEN_YEARS` note and
whether a `TH_TEN_YEARS_APPROXIMATELY` note exists; `TH_` is likely an unregistered pericope-local overlay (it
shows `unverifiable` — no TH_ registry, which is fine). Propose any note retire/rename for Marcia's review;
don't unilaterally delete a BCD note. After the edit, `id-check` should show the pair **aligned** (no longer a
split LIKELY_SAME_REFERENT); it remains `unverifiable` (no TH_ registry) — acceptable.

### A5 — the AUDIT relic (P01 map) → remove
Remove the `[[P01-Ruth-1-1-5-AUDIT]]` wikilink from the P01 map (pilot-2 produces no AUDIT artifact; it's a
dangling relic — same family as the SC-0017 de-leak). Removal only.

**Part A gate:** `tripod id-check --corpus` → **0 findings / only ✓ ACCEPTED**; `npm test` green (with the two
tweak tests); `check-drift` clean (re-pinned aliases + exceptions); `validate`/`lint`/`coverage` unchanged;
`gold-diff` unchanged by A (the A4 code-string change is in the map, not the gold-compared FOR_MODEL layer —
confirm).

---

# PART B — Common-Reader Prose Standard (SC-0019)

**The standard is drafted + register-blessed**; read it: `git show
claude/reverent-taussig-c5bde6:docs/COMMON-READER-PROSE-STANDARD.draft.md` (the four rules S1–S4, the
flag-word→plain table, three before→after pairs, the **plain ≠ flat** guardrail). It governs the *conditioning
prose* — Level 1 (Arc/Context/Tone/Communicative-Function), the scene descriptions (Role/Meaning/Effect/
What-it-is/Signals), the significant-absence notes, the register-tagging block. It does **NOT** touch: the
`register` token, the Level-3 payload (R1–R5/R6 govern that), the framework headings, or any schema/vocabulary.

### B1 — finalize the standard (the draft's open item)
Draft the **two missing calibration examples** — one **scene-description line** and one **significant-absence
note** (before→after, from real P01–P06 prose) — so the bank covers every prose type. These are **proposed for
Marcia's voice sign-off** (the final voice is hers); don't treat your drafts as final.

### B2 — seed it (vault, born-clean machinery)
- `_methodology/common-reader-prose-standard.md` — promote the blessed standard from the draft.
- `_templates/meaning-map-template.md` — add the prose-section guidance + a worked in-register example.
- The agent system-prompts (`_spec/agent-*-prompt*`) — so P07–P14 + the Slice-4 drafter are born in-register.

### B3 — migrate P01–P06 conditioning prose (P01 first, then roll)
Re-voice the conditioning prose to the standard — **P01 as the worked reference first → hand Marcia the
before/after → she blesses → roll P02–P06** (the SC-0013 cadence). This is exegetical voice work: you draft,
**Marcia reviews per map**. Honor the **plain ≠ flat** rule — if a rewrite drops a nuance (e.g. the
luck-vs-providence ambiguity), it's wrong. **Mechanical tie:** where the FOR_MODEL's two free-text fields
(`scene_communicative_purpose`, `significant_absence`) mirror the map's prose, match the new wording, then
**re-baseline `gold-diff`** (`gold-diff --out fixtures/gold-diff-baseline.json`) and confirm only the expected
free-text lines moved.

**Part B gate:** `validate` 6/6 · `lint --corpus` 0 drift / 7 accepted (the prose re-voicing must not introduce
forbidden vocabulary — R4 and S4 are aligned) · `coverage --corpus` 6/6 · `gold-diff` re-baselined (only the
matched free-text fields move) · `npm test` green.

---

## Boundaries (hard, both parts)
- **No schema / closed-list / vocabulary change.** No spec-version bump. The `register` token and the Level-3
  payload are untouched. Part A edits only entity *references* (codes/slugs/links) + tooling + registry/exception
  data; Part B edits only *conditioning prose* (+ the matched FOR_MODEL free-text fields).
- **Relocate-never-delete / surface-don't-guess:** the A4 vault-note question and any prose nuance you're unsure
  of → surface for Marcia, don't decide.
- **fixtures ≡ vault** stays the invariant: every map/FOR_MODEL edit lands in both compiler `fixtures/` and vault
  (`pericopes/`, `stas/`), byte-identical.

## Delivery (the proven two-repo flow)
1. **Compiler PR:** Part A (engine tweaks + exceptions + aliases re-pin + P01 map code/relic edits) and Part B
   (prose in `fixtures/meaning-map/` + matched FOR_MODEL free-text + gold-diff re-baseline) + the SC-0019 &
   SC-0020 entries + `docs/PROGRESS.md`. Gate green.
2. **Vault writeback** (Marcia pauses Obsidian Git auto-backup): transcribe the prose + the P01 map edits to
   `pericopes/` + `stas/`; apply the B31 BCD alias (`bcd/beings/`), the prose-standard methodology note +
   template + prompt seeding; fresh branch off `origin/main`; diff-first; reviewed vault PR. Merge the pair
   (compiler first), switch the vault to clean `main`, re-enable auto-backup, delete the merged branches.

## Hand Marcia (for blessing + the Architect review)
The P01 prose before/after (then each of P02–P06 as you roll); the `id-check --corpus` **clean** result; the
signed-off exception list (A3); the A4 before/after + the vault-note proposal; the gate results (incl. the
gold-diff re-baseline showing only free-text moved); and confirmation `fixtures ≡ vault` byte-identical.
