# SC-0008 — spec-vault reconcile + make `check-drift --vault` actually bite

> Plan-first proposal (Architect 10, 2026-06-07). **Grounded in verification, not the record** — which is wrong
> on the key point. Read with `[[tripod-spec-vault-stale]]` (the landmine), the SC-0008 ledger entry, and
> `docs/SC-0026-PROPOSAL.md` (the sibling CL finding routed here). The blind-spot + gating findings below came
> from the evaluator's review pass and are folded in.

---

## 1. What SC-0008 is (corrected)
The record/handoff/memory all said *"build `check-drift --vault` + reconcile the stale vault spec."* **Verified:
the guardrail is already built and bites** (exits 1 on a differing vault file). So SC-0008 is **not** "build it." It is
four things, whose unifying concern is *make the "vault is canonical" claim TRUE and keep it true*:
1. **Fix a blind spot** in the guardrail (it misses *missing* files).
2. **Make it actually run** (it exists but has never fired).
3. **Reconcile** the stale vault `_spec/` + the 6 stale CLs.
4. **Sweep** the deferred ledger statuses.

## 2. Verified findings (run them yourself)
- **`check-drift --vault <dir>` exists and exits 1** on a differing vault file. `npx tsx src/cli/tripod.ts
  check-drift --vault ~/Github/ruth-pilot-b-wiki/_spec` → 3 `vault:DRIFT`, exit 1. (`src/spec/pins.ts:42-61`.)
- **It is never run.** No test/gate invokes `--vault` (`grep -rn -- '--vault' tests/` is empty); the one
  `checkDrift` test (`validate.test.ts:115`) calls it *without* a vault dir. The guardrail has never fired. **This
  is the gap — not building it.**
- **Blind spot, proven by construction:** an absent canonical schema in the vault is **silently uncaught**.
  `checkDrift`'s `catch { vaultOk = undefined }` is not counted as drift (exit trips only on `vaultOk === false`)
  and prints no marker. Test: a vault dir with 4 schemas matching + `verification-input.schema.json` **absent** →
  **exit 0**, no marker for the missing file. So the guardrail catches "differs" but **not "missing."**
- **`quarantined-vocabulary.json` is uncaught for a *different* reason** than the absent-file path: it's pinned as a
  **source** (`pins.sources`), and `--vault` only compares **schemas** (`pins.schemas`). Sources are never
  vault-compared by design ("no wiki-canonical original"). So reconciling it to the vault means **reclassifying it
  to a schema first**, not just copying it.
- **The actual `_spec/` drift:** stale = `validation-rules` (vault v0.7 / compiler v0.12), `compilation-log`
  (v0.5/v0.7), `approved-enumerations` (v0.1/v0.10); **already matching** = `bcd-delta`, `verification-input`;
  **missing** = `quarantined-vocabulary` (a source today).
- **The CLs:** 6 vault CLs are content-stale strict-subsets of the merged fixtures (the SC-0026 finding).

## 3. Scope — two halves
**Compiler PR (code + governance):**
1. **Fix the blind spot:** an absent vault file for a pinned schema → `vaultOk = false` + display `vault:MISSING`
   + trip exit 1. A unit test asserts absent-schema = drift.
2. **Reclassify `quarantined-vocabulary.json` source → schema** (parity with `approved-enumerations.json` — it's
   governed vocabulary state, not a generated extract). Then it is vault-compared + guarded. *(Sub-call — Marcia's
   to confirm; see §4.)*
3. **Make `--vault` run — Option 3 (Both):** (a) a conditional vitest test that runs `--vault` when a vault path is
   configured (env `TRIPOD_VAULT_SPEC`) and **skips VISIBLY** otherwise (vitest `skipIf` → shows "skipped", never a
   silent pass); (b) an npm script `check-drift:vault` + a mandatory step in the spec-change writeback ritual.
4. **Ledger sweep:** flip SC-0021–0025 status lines to MERGED (deferred from SC-0026).

**Vault writeback (human-gated, cron-landed, compiler→vault — the safe direction):**
5. Reconcile the 3 stale schemas + add `quarantined-vocabulary.json` to the vault `_spec/`.
6. Reconcile the 6 content-stale CLs to match the merged fixtures (diff-first; clean-copy). **Wording corrected
   2026-06-07 during the writeback:** the vault CLs are *not* a byte-level strict subset — they diverge by array
   **order** + the `source` provenance-text *format* (vault's redundant `"(triage …)"` vs the fixtures' `"P3 …"`
   anchors). But at the **value level** the fixtures are a clean superset: verified vault-only = empty across all 6
   for `vocabulary_additions` value-sets **and** `proposition_kind_slot_sets`. So clean-copy loses no value/slot/
   status (SC-0007 intake invariant preserved); each vault CL becomes byte-identical to its gate-validated fixture.

## 4. The gating decision — adopting Option 3 (conceding my earlier rec)
I'd recommended Option 1 (runbook + script). **The evaluator's counter is right and I'm adopting it:** the vault
drifted *because* ~10 spec-changes skipped the writeback step — a discipline lapse. Fixing a discipline lapse with
*more discipline* (Option 1 alone) is fragile against the exact failure mode. The load-bearing fix is the
**conditional test**: it fires on any local `npm test` when the vault is configured, and builder/architect sessions
always have `~/Github/ruth-pilot-b-wiki` checked out → caught essentially every session, **no discipline required.**
Option 3 keeps the runbook step as a cheap belt that also catches it at writeback time. **Refinement folded in: the
skip must be VISIBLE** (logged "vault check SKIPPED — vault not configured" / vitest "1 skipped"), never a silent
green — that silent-green is the same false-green this whole bug class is about.

## 5. Why this is still one concern (one cycle)
Everything serves *the vault canonical-home claim, made true and kept true*: reconcile makes it true now; the
blind-spot fix + reclassification + conditional test keep it true; the CL reconcile is the same pattern on the
second artifact tree (your earlier ruling folded it in); the ledger sweep is a trivial tagalong in the same file
(your ruling). It rides on neither SC-0026 (closed) nor Thread B.

## 6. Predictions (falsifiable against the build)
- After the blind-spot fix: the verification-input-absent probe → exit 1 (was 0); a unit test asserts absent = drift.
- After reclassification: `check-drift --vault` over today's vault → **4** DRIFT/MISSING (3 stale + quarantine
  missing), not 3.
- The conditional test: `TRIPOD_VAULT_SPEC` → live (drifted) vault → **FAILS** (catches it); unset → **shows
  "skipped"** (visible), suite otherwise green.
- After the vault writeback: `check-drift --vault <vault>` → all schemas `vault:ok`, exit 0; the 6 CLs byte-match the
  fixtures.
- Test count rises by the new unit + conditional tests; no regression elsewhere; `check-drift` (no `--vault`) stays
  clean. Reclassification moves `quarantined-vocabulary.json` between pin categories but does **not** change its
  content/sha (confirm whether `pins.json`'s own structure change needs any bump — expected: none).

## 7. Acceptance
`check-drift --vault` over the reconciled vault → all `vault:ok`, exit 0; an absent canonical schema → caught
(exit 1, `vault:MISSING`); the conditional test fails on drift and skips **visibly** when unconfigured;
SC-0021–0026 ledger statuses read MERGED; the 6 vault CLs match the fixtures. No LLM, no generator; deterministic.

## 8. Open sub-calls for Marcia (flagged, not assumed)
- **(a) Reclassify `quarantined-vocabulary.json` source → schema?** I recommend yes (parity with
  `approved-enumerations`; brings it under the guard). If no, drop "quarantine missing" from the reconcile — it'd be
  legitimately compiler-only and the record's "create it in the vault" would be the thing that's wrong.
- **(b) The other `sources` (`coverage-exceptions`, `lint-lexicon`, `lint-exceptions`, `id-alignment-exceptions`)**
  are governed config too, also not vault-canonical. **Out of scope here** (would balloon the cycle); flagging as a
  future question, not folding in.
