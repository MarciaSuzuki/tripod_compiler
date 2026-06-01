# Build brief — strip process-commentary from the content artifacts (the "de-leak")

> Ruled by Marcia Suzuki (2026-06-01). **The principle:** the meaning map and the FOR_MODEL describe the
> **passage**, never the **project**. Any reference to the cleanup's own process — `SC-XXXX`, "Relocated per
> the content discipline", "→ Proposition N" as an audit trail — is a worklog leaking into the source
> artifact. It must come out. The relocate-never-delete record already lives, durably, in the SC audit docs.

You are a Tripod Compiler build session. This is a **removal-only** pass (no exegesis, no re-atomization):
delete the process-commentary that SC-0013/SC-0016 left inline in §3C, in both the maps and the FOR_MODELs,
and fix the guidance so new maps are born clean. Lower-risk than the sweeps, but the canonical vault is
touched, so the same safety rails apply.

## Orient
- The record is **already preserved** — confirm `docs/SC-0013-RELOCATION-AUDIT.md` + `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md`
  hold the per-item relocations before you strip anything. (They do. Removing the inline notes loses nothing.)
- Calibration: after this, §3C reads as clean content — entity entries, or a plain considered-absence — with
  zero project/process references.

## The rule (record as the next free SC — check the ledger)
**Content artifacts (maps §3C + the FOR_MODEL `objects_in_scene`) carry no process-commentary.** No SC-IDs, no
"per the content discipline", no relocation enumerations ("X → Proposition N; Y → figure …"). The
relocate-never-delete trail lives in the SC audit doc, never inline.

## Scope — what to STRIP vs KEEP

**STRIP (the leak), in maps *and* FOR_MODELs (+ their fixtures):**
- The §3C blockquote/`_note` text: `> Relocated per the content discipline (SC-XXXX): the taking of wives →
  Proposition 6; … Kept: …` and the bulleted `- None: … Relocated per the content discipline: - X → Prop N; …`
  enumerations. Anywhere "per the content discipline (SC-" / an SC-ID / a relocation audit-trail appears in a
  content layer — remove it.

**KEEP (real content — do NOT touch):**
- Entity entries (`[[O#]]`/`[[CB_]]` with What-it-is / Function / Signals).
- The plain **"None: no persistent objects in this scene."** — the Empty Slot Rule considered-absence stays
  (it's the mapper's judgment, not process). In the FOR_MODEL, the equivalent minimal `_note`
  ("No persistent objects in this scene.") where `entries: null`.
- Every legitimate considered-absence note that describes the **passage**, e.g. `times_in_scene`
  "No distinct temporal frame; time is continuous within the Moabite sojourn", `register_overrides._note`,
  and `significant_absence`. These describe the text, not the cleanup — they are NOT leaks.

## Fix the guidance (so P07–P14 + the Slice-4 drafter are born clean)
- **Meaning-map template** (`_templates/meaning-map-template.md`): §3C = entities or a plain "None: <reason>"
  only; the relocate-never-delete record goes to the SC audit doc, never inline in the map.
- **Discipline doc** (`_methodology/level3and3Ccontentdiscipline.md`): add the principle —
  *the map describes the passage, not the project; no process-commentary in the content layers.*

## Boundaries
- **Removal only.** Do not touch entities, propositions, §4 payload, flags, figures, significant_absence, or
  any passage-describing note. If unsure whether a note is "passage" or "process," it stays — surface it.
- **Maps stay byte-identical to fixtures.** Apply the same strip to vault `pericopes/` and compiler
  `fixtures/meaning-map/`; to vault `stas/*-FOR-MODEL.md` and compiler `fixtures/for-model/`.
- **Diff-first / no clobber:** confirm each file's only change is the note removal.

## Gates
- `lint --corpus` → still **0 drift / 7 accepted** (removing notes shouldn't change findings — confirm).
- `validate` 6/6 · `coverage --corpus` 6/6 · `gold-diff` **unchanged** (the notes aren't in its compared
  layer) · `npm test` green · `check-drift` clean · maps ≡ fixtures byte-identical.

## Delivery (same proven flow)
1. Apply in the compiler **fixtures** (maps + FOR_MODELs) + `SPEC_CHANGES.md` (the new SC) + `docs/PROGRESS.md`;
   gate green; open the compiler PR.
2. **Vault writeback** (the careful flow): **Marcia pauses Obsidian Git auto-backup**; transcribe the deleak to
   vault `pericopes/` + `stas/`, apply the **template + discipline-doc** edits; fresh branch off `origin/main`;
   diff-first; reviewed vault PR. Then merge the pair (compiler first), vault → clean `main`, re-enable
   auto-backup, delete the merged branch.

Hand Marcia: the before/after of a couple of §3C blocks (showing the leak gone, the entities/None intact),
the audit-docs-still-hold-the-record confirmation, and the gate results — for blessing + the Architect review.
