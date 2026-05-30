# Slice 4 (LLM drafter) — in-progress notes (resume here)

> Working notes for the Slice 4 build on branch `claude/friendly-edison-TGdmt`. NOT yet committed
> as of this writing. Read this to resume.

## What Slice 4 is (agreed design)
The **drafter** = a *constrained gap-filler*. `compileSkeleton` (Slice 2) produces the FOR_MODEL skeleton +
gaps; the LLM fills ONLY the judgment-gap locations; we deterministically merge fills back (never touching
extracted/deterministic fields), then validate (Slice 1) + grade vs gold. Extract-only preserved by construction.

## User's locked decisions (latest first)
- **Opus 4.8 only for the pilot** (`claude-opus-4-8`). Sonnet A/B **deferred** to future-scale notes; not in the pilot.
- **First cut = a DIAGNOSTIC LEARNING LOOP on P02**: drafter emits a one-sentence `reason` per fill; the grader
  surfaces EVERY divergence from gold paired with the model's reasoning (not just a score) → calibrate the prompt.
- Then test the calibrated prompt on **P03–P04** with human review.
- **Keep prompt caching** (reproducibility).
- **P01 is the worked example** in the cached prefix; **P02 is the held-out test target** (P01 would leak).
- **Separate granularity from token errors** in the metric.
- **Surface errors** if still unclean after ONE repair round (don't loop).

## Critical API facts (from claude-api skill)
- Opus 4.8 **rejects** `temperature`/`top_p`/`top_k` (400). Do NOT send them. Determinism via `effort` + tool schema.
- Adaptive thinking: `thinking: {type:"adaptive"}`. Forced `tool_choice` is incompatible with thinking → client
  retries with thinking off + forced tool if the model doesn't call the tool under auto.
- Pricing (per 1M): Opus 4.8 $5 in / $25 out; Sonnet 4.6 $3/$15. Cache read 0.1x, write 1.25x (5-min).
- Min cacheable prefix: Opus 4.8 = 4096 tokens (our prefix ~34K, fine). cache_control on LAST system block.
- Stream for max_tokens > 16K. SDK `@anthropic-ai/sdk@^0.100.1` installed.

## Environment
- `ANTHROPIC_API_KEY` is **NOT set** → cannot RUN the P02 diagnostic loop here. Code is built to run the moment
  the key is present. `api.anthropic.com` IS reachable (probe returned 401). npm registry works.
- **Tool I/O in this session became corrupted** (emits "result result..." noise on large/Unicode output).
  Use ASCII-only, small outputs, exit codes. Console strings in CLI use ·✓✗ (fine at runtime, garbles the harness display).

## Files written (all NEW unless noted)
- `src/drafter/merge.ts` — `Fill {location,value,reason?,is_new_value?}`, `mergeFills` (only fills declared
  gap locations; rejects others; pure), `fillableLocations` (excludes `(granularity)` + `beings_in_scene`), `hasResidualTodo`.
- `src/drafter/prompt.ts` — `buildSystem()` (cached prefix: instructions + closed lists + approved-enumerations +
  FOR_MODEL schema + P01 worked example; cache_control on last block), `buildUserTurn()`, `SUBMIT_FILLS_TOOL`
  (requires location/value/reason).
- `src/drafter/client.ts` — `callDrafter()` (adaptive thinking + submit_fills tool, stream, forced-tool retry),
  `requireApiKey()`, `DrafterError`, `estimateCostUsd()`, `Usage`. **NOTE: imports `@anthropic-ai/sdk` at module top.**
- `src/drafter/draft.ts` — `draft()` orchestrator (skeleton→call→merge→traceCheck→validate→1 repair→surface),
  `validateForModel()` (in-memory Slice-1 validation), returns `fills` (with reasons) + DraftResult.
- `src/compiler/judgmentdiff.ts` — `judgmentDiff(candidate, gold)` → `divergences: Divergence[]`
  ({axis,location,candidate,gold,kind: token|token-extra|token-missing|granularity}) + axis scores +
  tokenAgreementPct + granularityDivergences (SEPARATED) + unresolvedTodo.
- `src/cli/tripod.ts` — added imports + `draft` command: `--model` (default opus), `--effort`, `--grade <gold>`,
  `--diagnose` (learning loop), `--out`. Helpers `printJudgment` + `printDiagnostic` (joins divergences to fill reasons).
  NO `--ab` (Sonnet deferred). Graceful DrafterError → exit 2.
- `tests/drafter.test.ts` — 10 deterministic tests (merge protects deterministic fields; judgmentDiff token vs
  granularity split; in-memory validation). NO API needed.
- `package.json` — added `@anthropic-ai/sdk@^0.100.1` dependency (+ package-lock churn).

## Verified state
- `npm run build` = exit 0 (clean). `npm test` = exit 0, **56 tests passed** (46 prior + 10 drafter), 4 files.
- CLI confirmed: diagnose=2, printDiagnostic=2, granularityNotes=0, a.details=0, "--ab"=0.

## OPEN ISSUE (resolve before commit)
- `npx tsx src/cli/tripod.ts check-drift` exited **2** (a crash, not 0/1). Tests pass (same import chain via
  vitest), so the likely cause is the **top-level `@anthropic-ai/sdk` import in client.ts** crashing under `tsx`
  for every CLI command. **FIX: make the SDK import lazy** — `const Anthropic = (await import("@anthropic-ai/sdk")).default`
  inside `callDrafter`, remove the top import. Then re-verify `check-drift` = 0 and `validate fixtures/for-model/` works.
  (If check-drift was just garbled output and is actually fine, still prefer the lazy import — it keeps the SDK off
  the hot path of non-draft commands.)

## Remaining TODO to finish Slice 4
1. Apply the lazy-import fix; re-verify build/test/check-drift/validate all green.
2. Update `docs/PROGRESS.md` (Slice 4 in-flight: drafter built, deterministic seam tested; P02 diagnostic run
   PENDING on ANTHROPIC_API_KEY) and note Sonnet A/B deferred.
3. Commit + push to `claude/friendly-edison-TGdmt`. (Do NOT open a PR unless asked.)
4. When the user provides ANTHROPIC_API_KEY: run
   `npx tsx src/cli/tripod.ts draft fixtures/meaning-map/P02-Ruth-1-6-14.md --grade fixtures/for-model/P02-Ruth-1-6-14-FOR-MODEL.md --diagnose`
   → read the per-divergence reasons → calibrate `SYSTEM_INSTRUCTIONS` in prompt.ts → re-run → then P03/P04 for human review.
- Cost (corrected, Opus $5/$25): first cut P02 ~ a few cents–$1; whole Ruth pilot < ~$8. Negligible.
