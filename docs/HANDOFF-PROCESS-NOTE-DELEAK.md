# Build brief — strip process-commentary from the content artifacts (the "de-leak") — SC-0017

> **SHARPENED v2 (2026-06-01, Architect).** Supersedes the original de-leak brief. Same ruling and principle;
> this version adds the **verified scope** (the leak is in the FOR_MODELs too, phrased differently), a
> **pattern-based target + zero-grep gate** (a literal-string grep misses the FOR_MODELs), two **worked
> before/after** examples, the **`_note` handling rule**, and two **second-order gates** a careless pass would
> trip. Hand *this* file to the build session.

> Ruled by Marcia Suzuki (2026-06-01). **The principle:** the meaning map and the FOR_MODEL describe the
> **passage**, never the **project**. Any reference to the cleanup's own process — `SC-XXXX`, "Relocated per
> the content discipline", "→ Proposition N" as an audit trail — is a worklog leaking into the source
> artifact. It must come out. The relocate-never-delete record already lives, durably, in the SC audit docs.

You are a Tripod Compiler build session. This is a **removal-only** pass (no exegesis, no re-atomization):
delete the process-commentary that SC-0013/SC-0016 left inline in §3C, in both the maps and the FOR_MODELs,
and fix the guidance so new maps are born clean. Lower-risk than the sweeps, but the canonical vault is
touched, so the same safety rails apply.

## SC-ID
**This is SC-0017** — verified next-free (the ledger in `SPEC_CHANGES.md` runs through SC-0016; SC-0008 is the
only open/PROPOSED gap and is a different decision). Append-only; do not reuse. Write the SC-0017 entry as
part of your PR (Type: artifact remediation + docs/template hygiene; no schema/spec change).

## Orient
- The record is **already preserved** — confirmed: `docs/SC-0013-RELOCATION-AUDIT.md` and
  `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md` hold the per-item relocations. Removing the inline notes loses nothing.
- A stale **`sc-0017-deleak`** branch exists but is **empty** (no commits ahead of `main`). Ignore it / start
  fresh off `origin/main`; don't assume any work is there.
- Calibration: after this, §3C reads as clean content — entity entries, or a plain considered-absence — with
  **zero** project/process references, in maps *and* FOR_MODELs.

## Verified scope — the leak is in BOTH trees, phrased differently (this is the trap)
A grep for the map's literal phrase finds **nothing** in the FOR_MODELs. They carry the same audit trail under
different wording. **Do not declare done on the maps alone.**

- **Maps** (`fixtures/meaning-map/P0*.md` + vault `pericopes/`): `"Relocated per the content discipline
  [(SC-XXXX)]: … → Proposition N; …"`, appended to a §3C `- None: …` considered-absence (and sometimes after
  entity entries). Sometimes one line, sometimes a multi-line bulleted list — phrasing is inconsistent
  file-to-file (some carry the SC-ID inline, P01/P02 sometimes don't).
- **FOR_MODELs** (`fixtures/for-model/P0*-FOR-MODEL.md` + vault `stas/`): inside `objects_in_scene._note` as
  `"§3C entities only (SC-00XX). [No persistent objects.] Relocated: … → P1 (…); … → B8 referential_form; …"`.

Marker-line counts (the blocks span multiple lines — **counts are orientation, the gate is what matters**):
maps P01 7 · P02 12 · P03 13 · P04 14 · P05 4 · P06 4; FOR_MODELs P01 4 · P02 3 · P03 3 · P04 3 · P05 4 · P06 4.

**Target by pattern, not by literal string.** Sweep both trees for the union (case-insensitive):
`relocat` · `SC-00[0-9][0-9]` · `→ Prop` / `-> Prop` / `→ Proposition` · `content discipline` ·
`§3C entities only`.

## The rule (the SC-0017 decision)
**Content artifacts (maps §3C + the FOR_MODEL `objects_in_scene`) carry no process-commentary.** No SC-IDs, no
"per the content discipline", no "§3C entities only" methodology label, no relocation enumerations
("X → Proposition N; Y → figure …"). The relocate-never-delete trail lives in the SC audit doc, never inline.

## Scope — what to STRIP vs KEEP, with the exact cut boundary

**STRIP (the leak), in maps *and* FOR_MODELs (+ their fixtures):** every span matching the union pattern above —
the `Relocated…` audit trail, inline `SC-XXXX` references, the "per the content discipline" phrase, and the
"§3C entities only" methodology label.

**KEEP (real content — do NOT touch):**
- Entity entries (`[[O#]]`/`[[CB_]]` with What-it-is / Function / Signals; FOR_MODEL `entries[]`).
- The plain **considered-absence** — map `- None: no persistent objects in this scene.` (the Empty Slot Rule
  judgment, which describes the passage) and its FOR_MODEL equivalent `_note: "No persistent objects in this
  scene."` where `entries: null`.
- Every legitimate considered-absence note that describes the **passage**: `times_in_scene` "No distinct
  temporal frame…", `register_overrides._note`, `significant_absence`. These describe the text, not the
  cleanup — **NOT leaks**.

### Worked example — MAP (P03 §3C, multi-line form)
Before:
```
**3C — Objects and Elements**
- None: no persistent objects in this scene. Relocated per the content discipline (SC-0013):
  - the presentational opener (hinneh / "look") → Proposition 1;
  - Orpah's return to her people and to her gods → Proposition 1;
  - the directive to follow the exemplar → Proposition 1 ([[CB_0019-Yebimtekh…]], [[CB_0004-Moabite…]]);
  - the sister-in-law kinship naming (yebimtekh) → [[B8-Orpah]] referential form;
  ...
```
After:
```
**3C — Objects and Elements**
- None: no persistent objects in this scene.
```

### Worked example — FOR_MODEL `objects_in_scene._note`
Case A — **considered-absence scene (`entries: null`)**, P03: reduce the `_note` to the passage-describing
remainder; drop the `(SC-XXXX)` and the whole `Relocated: …` trail.
```
Before: "_note": "§3C entities only (SC-0013). No persistent objects. Relocated: the presentational opener
                  (hinneh) → P1 (…); … → B8 referential_form; the return-road locus → continuing from P02."
After:  "_note": "No persistent objects in this scene."
```
Case B — **scene WITH entities + a pure-process `_note`**, P01: the entire `_note` is scaffolding (the entries
carry the content), so **remove the `_note` key** — `_note` is optional in the schema, so this stays valid.
```
Before: "objects_in_scene": { "_note": "§3C entities only (SC-0012). Relocated: the opening 'vayhi bimei'
                  formula → FIG_0007 …; the Ephrathite clan identity → being B6 …", "entries": [ {O1…} ] }
After:  "objects_in_scene": { "entries": [ {O1…} ] }
```
> If after stripping a `_note` nothing passage-describing remains, **remove the key**. Don't invent a
> replacement, and don't blank it to `""`. `validate` (below) confirms the shape stays legal.

## Fix the guidance (so P07–P14 + the Slice-4 drafter are born clean)
- **Meaning-map template** (`_templates/meaning-map-template.md`): §3C = entities or a plain "None: <reason>"
  only; the relocate-never-delete record goes to the SC audit doc, never inline in the map.
- **Discipline doc** (`_methodology/level3and3Ccontentdiscipline.md`): add the principle —
  *the map describes the passage, not the project; no process-commentary in the content layers* (same family
  as R5).

## Boundaries
- **Removal only.** Do not touch entities, propositions, §4 payload, flags, figures, significant_absence, or
  any passage-describing note. The FOR_MODEL edit is **surgical inside `_note`** — strip the process spans,
  keep/reduce to the passage remainder. If unsure whether a note is "passage" or "process," it **stays** —
  surface it for the Architect, don't guess.
- **Maps stay byte-identical to fixtures.** Apply the same strip to vault `pericopes/` and compiler
  `fixtures/meaning-map/`; to vault `stas/*-FOR-MODEL.md` and compiler `fixtures/for-model/`.
- **Diff-first / no clobber:** confirm each file's *only* change is the note removal.

## Gates (all must hold)
- **Zero-grep, both trees:** the union pattern above returns **0 matches** across `fixtures/meaning-map/`
  **and** `fixtures/for-model/` (and the vault twins). This is the completion test — not a line count.
- `validate` 6/6 (confirms the `_note`-key removals are schema-legal) · `coverage --corpus` 6/6 ·
  `gold-diff` **unchanged** (the notes aren't in its compared layer) · `npm test` green · `check-drift` clean ·
  maps ≡ fixtures byte-identical.
- **lint --corpus watch (second-order):** expect **0 drift / 7 accepted** maintained. Removal can only *lower*
  findings, never add — so:
  - If a finding **drops**, fine (a leak note was also tripping lint); note it.
  - If drift **rises to 7** (or the 7 ✓ accepted become drift), **STOP**: the lint-exceptions are §4 keeps,
    and if they match by line number the §3C strip shifted those lines and orphaned them. Re-confirm the 7
    exceptions still resolve before proceeding.

## Delivery (the proven cross-repo flow)
1. Apply in the compiler **fixtures** (maps + FOR_MODELs) + the **SC-0017** entry in `SPEC_CHANGES.md` +
   the `docs/PROGRESS.md` checkpoint; gate green; open the compiler PR.
2. **Vault writeback** (the careful flow): **Marcia pauses Obsidian Git auto-backup**; transcribe the de-leak
   to vault `pericopes/` + `stas/`, apply the **template + discipline-doc** edits; fresh branch off
   `origin/main`; diff-first; reviewed vault PR. Then merge the pair (compiler first), switch the vault working
   copy to clean `main`, re-enable auto-backup, delete the merged branch.

**Hand Marcia (for blessing + the Architect review):** the before/after of one map §3C block and one FOR_MODEL
`_note` (showing the leak gone, entities/None intact); the zero-grep result across both trees; the
audit-docs-still-hold-the-record confirmation; and the full gate results including the `lint --corpus`
7-accepted check.
