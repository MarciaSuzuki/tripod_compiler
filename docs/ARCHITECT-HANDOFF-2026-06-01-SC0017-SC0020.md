# Tripod Architect — session handoff (2026-06-01): the SC-0017 → SC-0020 arc

> Supplements `docs/ARCHITECT-HANDOFF.md` (the role + standing principles — read that first if you're new to the
> seat). This file is the **continuity note for the next Architect**: where we are, what was decided, how I
> worked, and the one action that remains. Read this, then `MEMORY.md` + the linked memories, then PR #21.

---

## 0. Where we are *right now* (the one thing that matters)

**Everything through SC-0020 is done and blessed except the final vault writeback.** Concretely:
- **SC-0017** (the §3C "de-leak") — **SHIPPED + merged**, both repos.
- **SC-0018** (the entity-ID alignment checker, `tripod id-check`) — **SHIPPED + merged** (built, then refined).
- **SC-0019 + SC-0020** (the Common-Reader Prose Standard + the entity-ID reconciliation) — **authored, built,
  and BLESSED by Marcia across P01–P06**, sitting on **compiler PR #21** (gates-green, Architect-verified).
  **Only the vault writeback remains.**

**Your immediate job:** execute the writeback (the exact steps are in the [[tripod-id-alignment]] memory). Then
the road is clear for **P07–P14 authoring** — and those maps will be *born clean* in register and ID-alignment,
because this arc seeds both conventions into the template + agent prompts.

This was handed off because **the prior Architect's context filled** — not because anything is half-done. PR #21
is a coherent, complete, blessed unit; nothing is stranded.

---

## 1. What this session produced

**SC-0017 — de-leak (SHIPPED).** Stripped process-commentary (SC-IDs, "Relocated per the content discipline",
"§3C entities only", "X → Proposition N" trails) from the content layers — maps §3C **and** FOR_MODEL
`objects_in_scene._note`. The leak was in *both* trees, phrased differently (the trap; P01's FOR_MODEL used
`(SC-0012)` a narrow grep missed). Added **R6** to the discipline doc ("the map describes the passage, not the
project"). Merged: compiler #17 + vault #7 + governance-note #19. See [[tripod-sc0017-deleak]].

**SC-0018 — `tripod id-check` (SHIPPED).** The 5th deterministic gate: it verifies the two halves of a training
pair (the prose map and the FOR_MODEL) refer to the **same entity codes** — mechanically, not by eye. Canonical
ID = the **bare code** (schema-enforced). v1 over-reported; a refinement pass fixed three scoping limits (CB/FIG
compared in their real flag-location; vendored+pinned **concepts/figures registries** so those codes verify;
note-resolution knows the real pilot-2 artifact suffixes). Merged: PR #20. See [[tripod-id-alignment]].

**SC-0019 + SC-0020 — combined P01–P06 remediation (BLESSED, on PR #21, writeback pending).**
- **SC-0019 (prose):** the **Common-Reader Prose Standard** — the map's *conditioning prose* (Level 1, scene
  descriptions, significant-absence notes, register block) re-voiced to a "good study-Bible note for ordinary
  readers" register. Blessed register; **plain ≠ flat** is the guardrail (a rewrite that drops a nuance is wrong).
  P01 was the worked reference (blessed), then P02–P06 rolled. Nuances verified surviving (P04 full↔empty +
  fourfold-naming, P05 miqreh luck-vs-providence, hesed glossed once).
- **SC-0020 (IDs):** applied Marcia's ID-reconciliation rulings — the parity-bar engine refinement, the
  TM_TEN_YEARS→TH_ alignment, the signed-off coverage exceptions, the AUDIT-relic removal, `B?` as a legal
  withheld-referent. id-check is now **4 clean / 0 misalignment** (only the deferred-to-writeback B31 +
  TH_-registration remain).

---

## 2. The remaining action — the vault writeback (your next move)

Full steps are in [[tripod-id-alignment]]; in brief:
1. **Marcia pauses Obsidian Git auto-backup** — the load-bearing rail before any vault edit ([[tripod-vault-auto-backup]]).
2. Transcribe the 6 maps + FMs from PR #21 fixtures → vault `pericopes/` + `stas/` (byte-identical), and land
   the deferred vault pieces: **B31 BCD alias**; **TM_TEN_YEARS → TH_TEN_YEARS_APPROXIMATELY** vault-note rename
   + **register TH_** (re-pin); **template + methodology + agent-prompt seeding** (the born-clean machinery).
   Fresh branch off vault `origin/main`; diff-first; reviewed vault PR.
3. **Merge the pair: compiler PR #21 first, then the vault PR.** Verify each is `MERGED` **before** any branch
   cleanup (the hard-won lesson — see §6). Switch the vault working copy to clean `main`; Marcia re-enables
   auto-backup; delete the merged branches.
4. Verify post-merge: `fixtures ≡ vault` byte-identical; all gates green on main. At merge, **drop the incidental
   `package-lock.json` churn** in PR #21.

This is dispatchable to a build agent (see §5), but it needs Marcia's live Obsidian-pause and a careful merge —
do it with context headroom.

---

## 3. Decisions made this session (don't re-litigate)

- **Canonical entity ID = the bare code** (`B2`, `PL_LAND_OF_JUDAH`, `CB_0012`…); the FOR_MODEL schema enforces it.
  Maps carry it as a **decorated wikilink** `[[CODE-Slug]]`; the code = the part before the first hyphen
  (codes never contain a hyphen). Marcia chose "decorated + checked" over byte-identical renames.
- **Parity bar (sets the P07–P14 standard):** a FOR_MODEL scene-being the map references **in that scene's prose**
  counts as ALIGNED (one declares, one narrates); a misalignment only if the map never references it in that
  scene. **Scene-scoped**, not pericope-wide (Marcia accepted; it's the more rigorous reading).
- **Prose standard register: BLESSED** ("held-in and plain"; keep vivid concreteness like "bitterly"; gloss
  `hesed` once as "loyal, covenant kindness"). §3E narration is in-scope for plaining.
- **TM_TEN_YEARS → rename to TH_TEN_YEARS_APPROXIMATELY** (register the TH_ overlay). **B31** → add a
  "People-of-YHWH" BCD alias. **`B?`** (P06) = a *deliberate* withheld deceased-husband referent (schema-legal;
  the SC-0016-blessed withholding) — NOT a bug. Apostrophe slugs → a slugify-normalization, not slug edits.

---

## 4. The verification stack (now five deterministic gates)

**legal** (`validate` — schema + 3-layer vocabulary) · **complete / nothing-invented** (`coverage` — BHSA
reconciliation) · **atomic-bare-plain** (`lint` — the content discipline) · **aligned** (`id-check` — the new
SC-0018 cross-artifact ID gate) · **true / good reading** (the human consultant — only people can). Plus
`check-drift` (pins) and `gold-diff` (the deterministic compile vs gold FOR_MODEL). The green board verifies
legality/completeness/structure/alignment — it **cannot** verify meaning preserved. Point Marcia's review at the
fidelity of the diff (especially theological nuance); that's the whole game.

---

## 5. How I worked (the operational mode — this evolved)

The original handoff describes "separate Claude Code build sessions, Marcia bridges by pasting." **In this
session I dispatched the build work myself** — as **background `Agent` tasks in isolated git worktrees** — and
**verified each result** before it reached Marcia. The de-leak, the SC-0018 checker (+ refinement), and the
P01-then-P02–P06 prose rolls were all done this way. Same role split (I plan/dispatch/verify/rule + do the
git+governance plumbing; the agent does the keystrokes), but Marcia doesn't have to copy-paste between windows.
It worked cleanly four times. You can keep doing this, or hand a brief to a standalone session — Marcia's
preference. Either way: **you are the backstop; verify before it reaches her, and never let an agent make her
exegetical calls.**

Pattern that worked: **write a self-contained brief → dispatch (background, worktree isolation) → re-run the
gates yourself + read the diff → distill signal from noise → surface only the genuine decisions to Marcia.**
The briefs live on their own branches (`sc-0019-0020-brief`, `sc-0018-id-checker-brief`, etc.).

---

## 6. Process lessons (own these — they cost real cycles)

- **Verify a PR is `MERGED` before deleting its branch.** I once chained a branch-delete after a merge that had
  silently failed on GitHub's async `mergeable: UNKNOWN`, which closed the PR and orphaned the commit (recovered
  from reflog → a fresh PR). Rule: after a push, poll `gh pr view --json mergeable` until `MERGEABLE`, merge,
  confirm `state=MERGED`, *then* clean up.
- **Build agents editorialize beyond the tool's raw finding.** An agent called `T7-Harvest-Provision` a "typo"
  (it's a real discourse-thread note) and labeled `B?` a "wife_taken" slot (no such slot — it's the withheld
  husband). The checker's *raw* output was right both times; the agent's *gloss* wasn't, and I relayed the
  "wife_taken" gloss to Marcia before checking. **Relay the tool's raw finding; verify any agent interpretation
  against the artifact first.** Marcia caught it by reading the source — match that rigor.
- **Verify-don't-trust paid off repeatedly.** Re-running gates myself caught that SC-0018's "87 misalignments /
  157 unverifiable" was ~90% scoping noise (3 fixable limits), so Marcia ruled a ~dozen-item real list, not 260.
  Distilling signal from a green-but-noisy report is the core of the value here.

---

## 7. Infrastructure / gotchas (unchanged but load-bearing)

- Vault = `~/Github/ruth-pilot-b-wiki` (GitHub-synced via Obsidian Git). Compiler = `MarciaSuzuki/tripod_compiler`.
  `fixtures ≡ vault` is the invariant (compiler `fixtures/` byte-identical to vault `pericopes/`+`stas/`).
- **Obsidian auto-backup** auto-commits+pushes the vault every ~10 min — **pause it before any controlled vault
  edit** ([[tripod-vault-auto-backup]]). This is the writeback's first step.
- SC-IDs are **append-only**; the ledger runs through **SC-0020** ([[tripod-sc-id-collisions]]). SC-0008
  (template relics) is still PROPOSED. Pilot-2 lane only — do not build LA_RECORDING / Pilot-3.
- The four pilot-2 artifacts: FOR_MODEL · COMPILATION-LOG · BCD-DELTA · VERIFICATION-INPUT (no AUDIT). REGISTER
  is 7. `artifact_profile` is forbidden.

---

## 8. The road ahead

1. **The writeback** (§2) — finishes SC-0019/SC-0020; seeds the conventions.
2. **P07–P14 authoring** (~Ruth 3:6 → 4:17) — the bulk of finishing Ruth; the unwritten pericopes. Now born
   clean (prose register + ID-alignment baked into the template + prompts). Coverage can't run on them until
   they're mapped (the extractor's `pericopes.json` stops at P06).
3. **Slice 4 — the LLM drafter** — fills the compile skeleton's judgment gaps; coverage is its anti-hallucination
   grader; build on clean, consistently-voiced supervision. Needs Marcia's API-budget call; use Opus.

---

## 9. Read first (to inherit the understanding)

`docs/ARCHITECT-HANDOFF.md` (role + standing principles) · this file · `MEMORY.md` and the memories it indexes —
especially [[tripod-id-alignment]] (the writeback steps + every SC-0018/0019/0020 decision), [[tripod-sc0017-deleak]],
[[tripod-sc-id-collisions]] (the ledger through SC-0020), [[tripod-vault-auto-backup]],
[[tripod-canonical-vault-location]], [[tripod-common-reader-prose-standard]]. Then **compiler PR #21** (the
blessed combined remediation you're about to write back) and the briefs on their branches.

Marcia is a sharp methodologist with deep ownership of the exegesis — she catches real regressions the tooling
misses (she caught the "wife_taken" mislabel this session). Match her rigor; do the plumbing for her; verify
before anything reaches her; never let a build session quietly make her calls.
