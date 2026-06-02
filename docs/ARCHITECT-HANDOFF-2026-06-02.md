# Tripod Architect 5 — session handoff (2026-06-02)

> Read `docs/ARCHITECT-HANDOFF.md` (role + standing principles) first if you're new to the seat, then
> `MEMORY.md` + its linked memories, then this. This file is the continuity note: where we are, what I
> understand, and the live decisions. Written by Architect 4 at ~90% context.

## 0. The one thing that matters: THREE workstreams are open at once

Don't tunnel on the active one and drop the other two. In priority/attention order:

1. **Vocabulary triage (ACTIVE).** Cleaning the controlled-vocab *values* in the FOR_MODELs, per
   Marcia's brief + `Tripod_Vocabulary_Triage_Worklist.docx`. Batch A (conformance) + `tone_elements`
   are DONE. `pace_elements` is NEXT. One thing is **held for Marcia's confirm** (LAMENT_FRAMED relocation,
   §2). This is where the conversation is live.
2. **P07 build (PARKED, pending Marcia).** First born-clean pericope — 4 artifacts drafted, gate-verified,
   exegesis-blessed; sitting in vault `_working/P07/*-DRAFT.md` + compiler branch `p07-wip` (`eb4bdee`).
   **Waiting on Marcia's fidelity read of the FOR_MODEL → then the controlled writeback.** See
   [[tripod-p07-build]]. Do not let this rot — nudge her after the triage settles.
3. **Compiler consolidation (DEFERRED, yours to run).** The triage's governance half: the vault FOR_MODELs
   are being edited directly; the compiler `fixtures/` are NOT yet synced and the cleaned bare values aren't
   yet promoted to `approved-enumerations`. **One compiler PR after the corpus-independent batches** restores
   `fixtures ≡ vault`, promotes the cleaned core, re-pins, runs the full gate board. (§3.)

Nothing is broken; nothing is half-written. Each workstream is at a clean pause.

## 1. The role (what doesn't change)

You plan / dispatch / verify / rule-the-plumbing; **Marcia makes every meaning/exegetical/linguistic call.**
She is the methodologist with deep ownership — she catches real things the tooling misses (this session alone:
the small-sample problem, the system-tag-vs-display-label distinction, the four-operations-in-tone insight).
Match her rigor; surface, don't guess; **relay a tool's RAW finding, never an agent's gloss.**

**Operating mode (proven repeatedly):** dispatch substantial build work to **background `Agent` tasks**, then
**re-run the gates yourself and read the diff before anything reaches Marcia.** The agents' "all clean /
passes checks" claims were WRONG twice this session (Agent-2's P07 map had 8 lint violations; Agent-3's P07
FM had 5). Verification is load-bearing, not ceremonial. Distill signal from a green-but-noisy report; surface
only genuine decisions.

**The compiler-routed mechanism.** The FOR_MODELs are also compiler `fixtures/` (`fixtures ≡ vault` is the
load-bearing invariant), and the bounded-open slots are compiler-GOVERNED (drift engine, `approved-enumerations`,
the validate/lint gates, the paired COMPILATION-LOGs). A value change is never a vault-only edit — it must keep
all of that consistent. That's why the triage has a compiler-consolidation half.

## 2. The vocabulary triage — the understanding (this is the live work)

**What it is.** Collapse the low-reuse controlled-vocab values so the model can learn the bounded-open slots as
a near-closed set. Frozen Collector slots (`genre_group`/`genre`/`register`) get a conformance check only (never
triaged). Tripod-owned bounded-open slots (proposition_kind, scene_kind, tone, pace, communicative_function,
scene_communicative_purpose) get triaged.

**Marcia's partition — internalize this, it's the spine of the whole job:**
- **TWO diseases, sort by disease not by "now vs hold":**
  - *Corpus-size-independent* (run now): conformance (Batch A), tone/pace suffix-stripping, scene_communicative_purpose
    whole-slot removal. Correctness/shape facts — sample size is irrelevant.
  - *Reuse-test-dependent* (treat conservatively): proposition_kind, scene_kind, communicative_function_elements.
    A P01–P06 one-off may recur in P08–P14. Judge against **full 14-pericope frequencies** (the consolidated
    vocab records per-value pericope usage), **apply confident collapses, quarantine genuine coin-flips** to a
    "revisit after P08–P14" list. Don't hold the whole batch.
- **Shape beats frequency:** a *sentence-shaped* value (`SETS_DAYS_LABOR_AND_SURPLUS_..._AS_PHYSICAL_EVIDENCE_OF_GRACE`)
  is never a type no matter the corpus — collapse it now. The reuse test is only for genuinely borderline single-word-ish values.
- **FOUR/FIVE operations per value, not one:** strip / keep-whole / drop-redundant / collapse-to-existing / relocate-to-another-slot.
  **Flag per-value; never mechanically force one rule.** (tone proved this; pace will too.)
- **Conform against the SYSTEM TAG, not the display label.** The taxonomy is bilingual Pt/En: tag
  `informal_casual`/`historical_narrative`/`narrative`, NOT label "Informal / Casual" / "Narrativa histórica".
  The maps are upstream of the future crosswalk, so the locked map values *are* the canonical keys.
- **Verify-then-DELETE is the default.** For a removed value: open the paired map (`source_meaning_map_ref`),
  check the meaning is already in the prose (scene_communicative_purpose→3F; role/place→3A/3B/3E;
  tone/pace loci→§2.3 + Significant-Absence). If yes (the common case) just DELETE + log
  `"deleted — already in map at [loc]"`. Only WRITE prose if the meaning is genuinely absent, and only with
  Marcia's sign-off. PROMOTE goes to a typed slot SHE chooses — never free prose into a map.

**The worklist is a STALE SNAPSHOT — this is the biggest trap.** `Tripod_Vocabulary_Triage_Worklist.docx`
(in `~/Dropbox/Mac/Downloads/`, extracted to `/tmp/triage_worklist.txt`) was "derived from the 14-pericope
consolidated vocabulary" — an OLDER generation. Its specific value-tables do **not** match the current blessed
FOR_MODELs (only P01–P06 exist + a P07 draft). Its predicted conformance violations (`INTIMATE_FAMILIAL`,
`OATH`-as-genre) **weren't even present** — already cleaned. So **apply the PRINCIPLE per-value against the
actual files; never apply the worklist's table blindly.** BUT the worklist still has a live forward job: the
cleaned core is the authoring spec that stops P08–P14 from regenerating the mess.

**Inventory (the discrepancy you must hold):** there are **7** FOR_MODELs, not the ~14 the worklist assumes —
`stas/P01..P06-FOR-MODEL.md` (6, blessed) + `_working/P07/...-FOR-MODEL-DRAFT.md` (1). P08–P14 are unwritten.
So the triage touches only the values actually present in P01–P06 (and, carefully, the P07 draft).

**STILL OPEN before the reuse-dependent batches:** the **consolidated-vocab doc is not pinned down.** Candidates:
`~/Dropbox/.../Ruth Pilot Organization for Claude Code/ruth_pilot_archive/book_level/vocabulary_final.md`,
`.../03_vocabulary_method.md`, or vault `_templates/sta-vocabulary*.md`. You NEED it for the full-14 frequency
check. **Get Marcia to name the canonical one before starting proposition_kind / scene_kind / communicative_function.**

### 2a. Triage STATE (the cleanup log is `vault/tripod_cleanup_log.md` — the source of truth)
- **Batch A (conformance): DONE, clean, no edits.** P01–P06 frozen slots conform (system-tag match). `informal_casual` confirmed conformant.
- **tone_elements: DONE.** 8 changes applied to the vault FOR_MODELs (4 strip / 2 drop-redundant / 2 collapse),
  all 4 validate. KEPT the two `_AT_CLOSE` tones (they're tonal-arc *positions*, a real type — the next
  pericope opens against them) + `QUIETLY_ACCELERATING`. Logged.
- **LAMENT_FRAMED (P02): HELD — needs Marcia's confirm before you write it.** It's *bounded* (Naomi's lament
  at 1:13, `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`), so it RELOCATES from `tone_elements` to a
  `register_overrides.moment_level` entry `{verse, genre_override:"LAMENT", genre_group_override:"POETIC_SUNG", override_value:null}`.
  Open: (a) verse `1:13` vs the whole second plea `1:11-13`; (b) shift `genre_group_override` to `POETIC_SUNG` or leave null.
  On her confirm: remove `LAMENT_FRAMED` from tone_elements, add the override, log.
- **pace_elements: NEXT** (same per-value show-before-write; expect the same 4–5 operations, not just stripping).
- **Then:** scene_communicative_purpose (whole-slot, 0% reuse → 3F-or-delete per verify-then-delete) → the
  reuse-dependent batches (need the consolidated doc) → the PROMOTE pile (schema changes = governed spec edits).
- **Vocabulary-consistency list (in the log):** `UNSETTLED_AT_CLOSE` vs `UNRESOLVED_AT_CLOSE` — near-synonyms;
  Marcia decides unify-or-distinguish later. Do NOT unify without her.

### 2b. Triage MECHANISM (how I'm executing)
- **Edit the VAULT FOR_MODELs directly** with a **block-replace** (regex-find the whole `"slot": [ ... ]` block,
  rebuild it preserving the exact indentation). **Do NOT `json.loads`→`json.dumps`** — it reformats, and the
  brief forbids reformatting/reordering. (`/tmp/apply_tone.py` is the working pattern.)
- **Validate on the vault paths directly** (`tripod validate ~/Github/.../stas/PNN-...-FOR-MODEL.md`) — works fine.
- **Per-batch:** one slot-type only; show-before-write; Marcia's explicit yes is the gate; log every change.
- The compiler `fixtures/` are intentionally NOT synced yet → `fixtures ≠ vault` during the triage (known;
  restored at the consolidation, §3). COMPILATION-LOGs do NOT record tone values (checked) — no ripple for tone;
  re-check per slot.

## 3. The compiler consolidation (DEFERRED — yours to run, one PR)
After the corpus-independent batches (tone done, pace + scene_communicative_purpose to go), run ONE compiler PR:
- **Promote the cleaned-core bares** to `_spec/approved-enumerations.json` with provenance. tone already produced
  3 convergent-drift values awaiting promotion: **`URGENT`, `RISING`, `STILLED`** (pace + the rest will add more).
- **Sync `fixtures/for-model/` to the triaged vault** (`cp` + `diff -q` byte-identical), restoring `fixtures ≡ vault`.
- **Re-pin** `pins.json` (approved-enumerations is pinned) and run the **full gate board** (validate/lint/coverage/
  id-check/gold-diff/check-drift/tests) green.
- Governance: SPEC_CHANGES entry + a vault PR if you branched the vault. (I edited vault on `main` via auto-backup
  + per-batch approval + the log as the control; if Marcia wants a reviewed vault PR instead, branch it.)

## 4. Decisions made — don't re-litigate
- Conform against the **system tag**; `informal_casual` stays (no crosswalk exists yet — maps are the canonical key).
- tone rulings (§2a) are Marcia's, final. The `_AT_CLOSE` family is a TYPE, not a locus to strip.
- Verify-then-DELETE is the default; PROMOTE → typed slot Marcia picks.
- P07 exegesis is LOCKED (hesed held open; "the dead" generic = `B?`; Scene 3 = vv.19-21; CB_0043 unfired) — see [[tripod-p07-build]].

## 5. Process lessons / traps (own these)
- **The worklist's value-tables are stale** — verify against the actual files (§2).
- **Agents editorialize + overclaim "clean"** — re-run the gates yourself.
- **JSON edits:** block-replace preserving format; never round-trip JSON.
- **Pin the FILE sha** (`shasum -a 256`), not the extractor/build script's stdout sha (that's the body without the trailing newline — it WILL mismatch `check-drift`).
- **Verify a PR is `MERGED` before deleting its branch.**
- **The seeding gap (P07):** the meaning-map template + Agent-2/3 prompts don't yet say "figures live ONLY in
  frontmatter `active-figures:` + §5B — never as `cross_ref` in §3C/§4 or interpretive labels in the FM cross_ref."
  Both agents repeated this miss. Patch it (bundle with the P07 writeback). See [[tripod-p07-build]].
- **map-codeless ↔ FM-coded pattern (P07):** Agent-3 codes referents the map left as bare prose → id-check
  misalignments → Marcia rules each.

## 6. Infrastructure / gotchas (unchanged, load-bearing)
- Vault = `~/Github/ruth-pilot-b-wiki` (GitHub-synced; **Obsidian Git auto-backup commits+pushes ~every 10 min** —
  [[tripod-vault-auto-backup]]; pause it before a *controlled* vault writeback, but the multi-batch triage rides
  the auto-backup with per-batch approval as the control). Compiler = `MarciaSuzuki/tripod_compiler`, worktree at
  the Dropbox path.
- **text-fabric IS installed**; BHSA-2021 data local at `~/text-fabric-data/github/ETCBC/bhsa`. Per-pericope
  extraction recipe in [[tripod-p07-build]].
- Triage reference docs: worklist `~/Dropbox/.../Tripod_Vocabulary_Triage_Worklist.docx` (→ /tmp/triage_worklist.txt);
  taxonomy `~/Dropbox/.../generos_registros_equipes_de_campo.docx.pdf` (→ /tmp/taxonomy.txt via `pypdf`; 7 registers
  + 31 genres/4 groups; `ceremonial_speech` + `dialogue` are real genres). Consolidated-vocab = TBD (§2).
- Branches: `p07-wip` (P07 WIP, pushed). No triage branch yet (vault edits on main; compiler consolidation will
  want its own branch off `origin/main`).
- Pilot-2 lane only. REGISTER is 7. `artifact_profile` forbidden. Four artifacts: FOR_MODEL · COMPILATION-LOG ·
  BCD-DELTA · VERIFICATION-INPUT (no AUDIT). SC-IDs append-only, ledger through SC-0020 ([[tripod-sc-id-collisions]]).

## 7. The verification stack (five deterministic gates + the human)
`validate` (schema + 3-layer vocab) · `coverage` (BHSA reconciliation — nothing invented/missing) · `lint`
(content discipline) · `id-check` (cross-artifact ID alignment) · `gold-diff` / `check-drift` (pins). Green
verifies legality/completeness/structure/alignment — it **cannot** verify meaning. That's Marcia. Point her at
the fidelity of the diff.

## 8. Read first
`docs/ARCHITECT-HANDOFF.md` · this file · `MEMORY.md` + memories — especially [[tripod-vocab-triage]] (the live
triage state), [[tripod-p07-build]] (the parked pericope + the reusable pipeline), [[tripod-id-alignment]],
[[tripod-vault-auto-backup]], [[tripod-canonical-vault-location]]. Then `vault/tripod_cleanup_log.md` (the
triage's source of truth) and the worklist. Then talk to Marcia — she's mid-thought on the triage.
