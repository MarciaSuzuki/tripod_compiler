# Session 7 build brief — doubled-divine-name figure + §4 fixes + SC-0014 forward-pointer

> **⚠ SUPERSEDED (2026-05-31) — do not execute as-is.** Task 2 (the §4 atomizations) was done in the SC-0016
> sweep. Task 1 (the doubled-divine-name figure) + Task 3 (the SC-0014 forward-pointer) are folded into
> `docs/HANDOFF-VAULT-WRITEBACK.md` (which corrects the FIG-code estimate: the registry runs to FIG_0194).
> Kept only for the figure spec in Task 1, referenced by the writeback brief.

> Authored by the Tripod Architect session; all judgment calls **ruled by Marcia Suzuki (2026-05-31)**.
> Small, well-scoped follow-up to the **merged** SC-0013 corrective pass (now on `main`, both repos).
> Execute the rulings; surface anything genuinely new.

You are a **Tripod Compiler build session**. The SC-0013 corrective pass (P02–P06 §3C + SC-0014) is
**merged**. This is a short follow-up: create one approved figure, apply three §4 wording fixes, and add a
governance forward-pointer. New branch + paired PRs; **human-gated** (Marcia blesses before merge).

## Orient
- Read `docs/SC-0013-RELOCATION-AUDIT.md` (the §4 items + the PENDING figure are recorded there).
- Calibrate the figure against an existing figure file (e.g. `figures/FIG_0006-Shaddai-Divine-Name.md`,
  `figures/FIG_0052-*Residual-Rhyme*.md`) for frontmatter/structure.
- Canonical vault: `~/Github/ruth-pilot-b-wiki`. Compiler `fixtures/` mirror the vault artifacts.

## Task 1 — Create the doubled-divine-name figure (Marcia approved)
A registry addition (Layer-3). The four divine-name invocations survive individually in P04's propositions,
but the **doubling-as-pattern** has no figure — this preserves it.
- **Allocate the next free FIG code** (scan `figures/`; highest seen is `FIG_0134`; mind gaps).
- **Name:** `Doubled-Divine-Name-Lament` (adjust if a clearer name fits the registry conventions).
- **Surface:** Naomi names God **four times** across Ruth 1:20–21 — Shaddai (v.20b), YHWH (v.21a, "brought
  me back empty"), YHWH (v.21c, "testified against me"), Shaddai (v.21d, "done evil to me") — a bracketing
  **doubled-Shaddai / doubled-YHWH** structure.
- **Meaning:** the relentless, repeated attribution of her emptying and bitterness to God; the doubling is
  the rhetorical force (she pins it on God, over and over). The *content* already lives in the propositions;
  this flag preserves the *repetition*.
- **Scope:** P04 (Ruth 1:19–22); active at propositions **P4 and P5**.
- **Keep-level:** **PREFERRED** (preserve the repetition/relentlessness; underlying attribution survives in
  the propositions if exact doubling can't be replicated). *Confirm with Marcia at PR review — she may lift
  to REQUIRED.*
- **Complements** `FIG_0006` (Shaddai name) and `FIG_0086` (Shaddai-did-evil), which mark individual
  invocations; this marks the doubling.
- **Wire it in:** create the figure file; record it as a **BCD-DELTA** (registry addition) on P04; add the
  figure flag to **P4 and P5 in both the map (§5B + active-figures) and the FOR_MODEL** (`figure_flags`);
  **update the PENDING markers** (the P04 §3C relocation note + the audit's ⚠ row) to point at the new code.
- **Mind the lint trap:** if the figure name contains a flagged label (e.g. "Doubling"), reference it by
  **bare code** in any scanned §3C/prose lines (as P06 does for `FIG_0100/0101`), not a wikilink.

## Task 2 — §4 wording fixes (Marcia ruled all four)
Map §4 Q&A only (`pericopes/`); mirror to fixtures. None affect gold-diff (§4 prose isn't in its compared set).
1. **P02** — the §4 answer **"arising and going out"** → split into two atoms: `arising` · `going out`.
2. **P04:270** — `(state at return; YHWH as agent)` → `(state at return; YHWH as the one who caused it)`.
3. **P04:275** — `(Shaddai as agent of harm)` → `(Shaddai as the one who caused the harm)`.
4. **P05:344** — `…chance-providence construction; agent withheld` → `…; the one who caused it, withheld`.

*(The other ~10 §4 atomizations in the audit remain **pending Marcia's per-item rulings** — do NOT touch
them. The Level-1 prose "agent"s — P04:60/134/174, P05:183 — belong to the separate Common-Reader Prose
Standard pass, not this one.)*

## Task 3 — SC-0014 forward-pointer (governance hygiene)
The old value `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` is still **live** in the Pilot-3 / bible-wide seed
`_spec/tripod-bible-wide-layer-2-vocabulary-seed-v0-1.csv` (lines 247, 267) — correctly left out of the
Pilot-2 SC-0014 scope, but it will resurrect the jargon at Pilot-3 lock. **Add one line to the SC-0014 entry
in `SPEC_CHANGES.md`:** *"Out-of-scope residue: the old value persists in the bible-wide Layer-2 seed CSV
(Pilot-3); reconcile at Pilot-3 lock so the rename isn't silently undone."* No CSV edit (don't cross into Pilot-3).

## Boundaries
- Don't touch the other §4 atomizations (pending Marcia) or anything Pilot-3 beyond the Task-3 note.
- Keep-level + figure name are Marcia's to confirm at review — flag, don't force.
- Anything genuinely new/ambiguous → STOP and surface it.

## Gates (all must pass)
- `validate` 6/6 · `coverage --corpus` 6/6 block-clean (figure adds no entity) ·
- `lint --corpus` should **drop** (the 3 §4 "agent" + 1 compound removed; tier-1 stays 0) ·
- `gold-diff` **re-baseline** (the new P04 figure flag changes the figure-flag union) — agreement should hold ·
- `npm test` green; `check-drift` clean (no pinned spec file changes — figure + BCD-DELTA aren't pinned).

## Delivery
New branch; paired PRs (compiler fixtures + vault). Hand Marcia: the figure (file + BCD-DELTA + flags), the
§4 diffs, the SC-0014 note, and the gate results — for her blessing and the Architect review. After this
lands, the **Common-Reader Prose Standard** (`docs/COMMON-READER-PROSE-STANDARD.draft.md`) is next.
