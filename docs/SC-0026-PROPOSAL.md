# SC-0026 — COMPILATION-LOG schema gate (CL validation turned on)

> Plan-first proposal (Architect 10, 2026-06-06). **Scope: schema gate only — recommended by Architect 10, confirmed by Marcia in review (2026-06-06).**
> The vault-CL *content* staleness (concern B below) is routed to **SC-0008**, not built here.
> Read with the POST-SC0025 handoff (Part III) and `[[tripod-spec-vault-stale]]` (the sibling stale-vault case).

---

## 1. What SC-0026 does, in one paragraph
Wire the six gold COMPILATION-LOG fixtures (`fixtures/compilation-log/P01–P06`) into the gate so every CL is
validated against `compilation-log.schema.json` (v0.7) on every `npm test` — exactly the way
`tests/validate.test.ts` already gates the six FOR_MODEL fixtures. The validation **machinery already exists**:
`validateArtifact` detects a CL and compiles the CL schema (`src/engine/validate.ts:33-34`, run at `:76`), and
`tripod validate <dir>` already discovers and checks CLs (verified: `validate fixtures/compilation-log/` → 6
valid). SC-0026 adds the missing **gate test** (positive + negative) that makes this existing, unexercised check
load-bearing. It changes **no schema and no data** — no `_spec/` edit, no `pins.json` bump.

## 2. The seam — why this is SC-0026 and not SC-0008 (the seam test, applied)
The handoff's seam test: *does the SC change what the schema SAYS, or whether the gate CHECKS it?* SC-0026 is
purely **gate-checks** — it adds no property and rewrites no CL; it turns on a check against the already-correct
schema. That is the SC-0026 side of the seam by definition. Reconciling the **stale vault CLs** (content, not
shape) is a different artifact tree and a different check → **SC-0008** (§5).

## 3. What I verified (the floor for this proposal)
- **Machinery present, unexercised.** The schema-validation test (`validate.test.ts`) has **0** CL references;
  the only CL it schema-checks today is a *synthetic compiled* one in `compile.test.ts`. The six **gold** CLs are
  gated by nothing.
- **Green now, both trees.** All 6 compiler-copy CLs **and** all 6 vault CLs validate block-clean against
  `compilation-log.schema.json` v0.7. Turning the gate on does **not** fail the board.
- **The stale-vault finding (→ SC-0008, not here).** The vault CLs are a **strict subset** of the compiler
  copies (vault-only keys = 0 across all 6); each is missing `vocabulary_additions.role_in_scene_beings`
  (the SC-0025 add) and 5/6 are missing the `vocabulary_additions.*_elements` breakdown (arc / tone / pace /
  context / communicative_function). 54–242 changed lines per pericope. This is **content staleness**, invisible
  to a schema gate — the 4th unguarded-authoritative-artifact instance, sibling to the stale vault `_spec/`.

## 4. Why ship a check that is green today
Three durable reasons, none requiring a current failure:
1. **Regression guard.** A future build session (or a hand-edit) that emits a malformed CL is caught at
   `npm test` instead of silently entering the corpus labelled "provenance."
2. **P07–P14 born-gated.** Every new pericope's CL is schema-checked from its first commit — the proving-ground
   corpus never accumulates unguarded CLs.
3. **Names the honest state.** Turning the gate on *and recording that it is green because shape ≠ content*
   prevents the false-green that would otherwise read as "CLs are fully clean." They are **shape-clean**; the
   vault copies are **content-stale** (→ SC-0008). This is the handoff's deepest lesson applied to our own gate.

## 5. Concern B routed to SC-0008 (what SC-0008 must now also cover)
SC-0008 was reframed first-class this session (PR #28) as *bulk-reconcile the stale vault `_spec/` + build
`check-drift --vault`*. The vault-CL staleness is the **same pattern on a second artifact tree** (`stas/` CLs).
SC-0008's scope is noted here to extend to: (a) **writeback** the 6 vault CLs to match the merged compiler copies
(diff-first / surgical, per the proven procedure — handoff §V.5); and (b) a **content guardrail** for the `stas/`
artifacts so they cannot silently re-drift (a `validate --vault`-style artifact diff — the CL analogue of
`check-drift --vault`). **Not built in SC-0026.** One concern per cycle.

## 6. File-by-file change list (the build, on approval)
1. **`tests/validate.test.ts`** — add a `describe("COMPILATION-LOG gold fixtures (P01–P06)")` block mirroring the
   FOR_MODEL block: read `fixtures/compilation-log/*-COMPILATION-LOG.md`, assert all six are vendored, and assert
   each `artifact === "COMPILATION-LOG"`, `counts.block === 0`, `ok === true`. Add a **negative** case: drop a
   required top-level field (e.g. `sta_id` or `tagset_version`) from a temp CL copy → expect a located `block`
   finding naming the missing field (mirrors the FOR_MODEL negative cases at `validate.test.ts:50+`).
2. **`docs/SC-0026-PROPOSAL.md`** (this file) — ships as the cycle record.
3. **`SPEC_CHANGES.md`** — append the SC-0026 entry: gate-only, **no spec version bump** (no schema/data changed);
   include the forward-pointer handing concern B to SC-0008.
4. **`docs/PROGRESS.md`** — note CLs are now gate-validated.

No `_spec/` file is edited, so `check-drift` and `pins.json` are untouched; the test count rises only by the new
CL cases. `tripod validate <dir>` already covers CLs, so the CLI needs no change.

## 7. Predictions (falsifiable against the build)
- The CL gate **passes immediately**: 6/6 CLs block-clean; test count rises from **147** by ~8 (6 fixtures +
  a vendored-count check + 1 negative), to ~**155**; all other gates unchanged.
- `check-drift` stays clean (no spec touched).
- The negative case fails with a **located** schema error — a `block` finding naming the dropped required field.
- `validate fixtures/for-model/` output is unchanged (6 valid · 0 block · 0 drift · 15 quarantined).

## 8. Acceptance
`npm test` green with the new CL gate; `tripod validate fixtures/compilation-log/` → 6 valid · 0 block; a
deliberately corrupted CL → precise located error; `check-drift` and `lint / coverage / id-check / gold-diff
--corpus` all unchanged and exit 0. SC-0008's ledger entry updated to own concern B.
