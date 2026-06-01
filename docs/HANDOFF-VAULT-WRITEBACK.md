# Build brief — SC-0016 vault writeback (the deferred canonical sync)

> Blessed by Marcia Suzuki (2026-05-31). This propagates the **blessed** SC-0016 §4 sweep + figure-span
> enrichments from the compiler fixtures into the **canonical vault**, and gets the vault back onto `main`.
> It is a **faithful transcription — NOT authoring.** The §4 content is already ruled and blessed; do not
> re-edit, re-atomize, or re-word a single answer. The job is to make the canonical vault match the proven
> fixtures, cleanly and reviewably.

You are a build session with filesystem access to **both** repos. **Prerequisite:** SC-0016 is **SHIPPED**
on the compiler side — `fixtures/meaning-map/*` + the lint + `lint-exceptions.json` (incl. the un-split
"her father and her mother" + its 7th signed-off keep) are merged to `tripod_compiler` `main`. Those
merged fixtures are the **source of truth** for this transcription.

## What this closes
The "I don't see the changes in my vault" gap. SC-0016 was applied **fixtures-only** (vault deferred per
Marcia's routing ruling). This writes the blessed §4 state into the canonical vault and restores two
invariants: vault `pericopes/` ≡ compiler `fixtures/meaning-map/`, and the vault back on clean `main`.

## Scope — exactly two artifact sets (nothing else)
1. **Vault `pericopes/P01–P06.md` §4** → bring to match the blessed `fixtures/meaning-map/P01–P06.md`
   (the sweep: cross_ref/link lines removed, meta-questions → payload questions, compounds atomized,
   jargon re-worded; the **7 signed-off keeps left verbatim**).
2. **Vault `figures/FIG_*.md`** → the proposition-span enrichments per
   `docs/sc-0016/FIG-span-relocations.proposed.md` (additive; "enrich only what's missing"; P01 FIG_0052
   is the worked example: opens P5, closes P8).

**NOT in scope:** the vault `stas/*-FOR-MODEL.md` (SC-0016 did not change them — the FOR_MODEL cross_ref
fields are conditioning, left in place; the schema split is a separate future step), §3C / Levels 1–2 /
§5 Flags (already correct in the vault from SC-0013), and any new exegesis.

## ⚠ Safety rail 1 — pause the auto-backup FIRST (Marcia's hand)
The vault's Obsidian Git plugin auto-commits + pushes every ~10 min. It **will** sweep these edits onto the
branch before review and defeat the gate. **Before any edit:** Marcia disables the Obsidian Git
auto-commit/auto-push (or closes Obsidian) for the duration. Re-enable at the end (Step 5). Do not proceed
while it's live.

## Steps
0. **(Marcia)** Pause the Obsidian Git auto-backup.
1. **(build) Branch hygiene — verify, don't assume.** The vault working copy is on
   `claude/p02-p06-content-remediation` (PR #5 merged; the branch has drifted ahead of `origin/main`
   `e2fc80f` with auto-backup commits). Run `git -C ~/Github/ruth-pilot-b-wiki log --oneline origin/main..HEAD`
   and diff — **confirm everything ahead of `origin/main` is auto-backup noise (no un-merged substantive
   content).** If anything substantive is only on that branch, **STOP and surface it.** Otherwise base the
   writeback on a **fresh branch off `origin/main`**.
2. **(build) Transcribe §4 — diff-first, no clobber.** For each P01–P06: make vault `pericopes/P*.md`
   match `fixtures/meaning-map/P*.md`. **Diff each pair first** and confirm the *only* delta is the §4
   sweep (§3C is already shared from SC-0013; everything else must be identical). If a pericope shows any
   unexpected vault-only content, **STOP and surface — never overwrite blindly.**
3. **(build) Figure spans.** Apply `docs/sc-0016/FIG-span-relocations.proposed.md` to vault `figures/FIG_*.md`
   — additive enrichment of each figure's own entry; enrich only what's missing; touch nothing else in the file.
4. **(build) Verify.** vault `pericopes/P01–P06.md` **byte-identical** to `fixtures/meaning-map/P01–P06.md`;
   figure spans present; run `lint`/`validate`/`gold-diff` against the synced state → must match the blessed
   gate (**lint 0 drift / 7 accepted · validate 6/6 · gold-diff unchanged**).
5. **(build → Marcia) Reviewed PR.** Open a vault PR (fresh branch → `main`). Marcia reviews the
   transcription (faithful, no clobber) and merges. Then switch the vault working copy to `main`, pull,
   **re-enable the Obsidian Git auto-backup** (now tracking clean `main`), and delete the stale
   `claude/p02-p06-content-remediation` branch once confirmed redundant.

## Additional ruled tasks folded into this pass (Marcia, 2026-05-31)
Two separately-ruled items ride this pass because they touch the same files. **Keep each as its own commit** —
they are NOT part of the byte-identical §4 transcription, so review stays clean.

**A. Create the doubled-divine-name figure** (Marcia ruled "create the flag"). This *is* authoring a registry
entry — distinct from the transcription. Full spec in `docs/HANDOFF-SESSION-7.md` Task 1; one correction: the
figure registry runs to **FIG_0194** (not the ~134 that brief assumed), so allocate the next free code (mind gaps).
- The figure: the doubled/fourfold divine naming in Naomi's lament — Shaddai (1:20b) · YHWH (1:21a) · YHWH
  (1:21c) · Shaddai (1:21d) — a doubled-Shaddai / doubled-YHWH bracketing that hammers her emptying onto God.
  Complements FIG_0006 (Shaddai-name) + FIG_0086 (Shaddai-did-evil), which mark single invocations; this marks
  the *pattern*. Keep: **PREFERRED** (confirm at review).
- Wire into **both** vault and fixtures so the invariant holds: figure file + a **BCD-DELTA** (vault `figures/`);
  the flag on **P04 P4 and P5** in the map (§5B + active-figures) **and** the FOR_MODEL `figure_flags`.
- **Re-baseline gold-diff** (figure_flags are in its compared layer) and re-gate. Lint trap: if the name
  contains "Doubling", reference it by **bare code** in any scanned prose, not a wikilink.

**B. SC-0014 forward-pointer.** One line on the SC-0014 entry in `SPEC_CHANGES.md`: the old
`ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` still lives in the bible-wide Layer-2 seed CSV (×2, Pilot-3 lane) —
**reconcile at Pilot-3 lock** so SC-0014's de-jargoning isn't silently reversed. No CSV edit (don't cross into
Pilot-3); just the recorded pointer.

## Boundaries
- **Transcription, not authoring.** The §4 must end **byte-identical** to the blessed fixtures. No re-editing.
  *(The two ruled tasks above are the explicit exceptions — separately committed.)*
- **No clobber.** Diff-first per pericope; STOP on any unexpected vault-only delta.
- **Figure enrichment is additive** (spans only); never alter existing figure content.
- Leave `stas/`, §3C, Levels 1–2, §5 flags untouched.

## Acceptance
vault `pericopes/` ≡ `fixtures/meaning-map/` (byte-identical) · figure spans recorded · gates match the
blessed result · vault on clean `main`, synced to origin, auto-backup re-enabled · stale branch removed.

## Delivery
Reviewed vault PR merged to `main`; vault working copy on clean `main`; the "changes not in my vault" gap
closed. Record the vault-side writeback in `SPEC_CHANGES.md` (SC-0016 vault writeback) + `docs/PROGRESS.md`.
Hand Marcia the PR + the byte-identical confirmation for the final blessing.
