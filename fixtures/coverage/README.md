# Coverage ledgers — generated on demand, not committed (SC-0068)

Coverage ledgers (`*-COVERAGE-LEDGER.md`) are a **rendered view** of the coverage reconciliation
(`docs/COVERAGE.md`). They are **generated on demand** and **git-ignored** (`*-COVERAGE-LEDGER.md`) — never committed.

Regenerate any time:

```
npx tsx src/cli/tripod.ts coverage --corpus --out-dir fixtures/coverage
```

**Why not committed (the SC-0068 ruling, Marcia 2026-06-20).** Committed snapshots rot: the prior six ledgers were
stale from **2026-05-30 (SC-0010)** through SC-0067 (`TH_→CB_`, a `B9→B8` reassignment, count drift) and **nothing
caught it — no test pinned them.** Retiring the committed files is rot-proof and loses nothing, because the
**substance is gated live**:

- `tests/coverage-corpus.test.ts` reconciles every P01–P06 FOR_MODEL → asserts **0 unanchored + all six block-clean**.
- `tripod coverage --corpus` prints the same corpus check fresh on every run.

So the reconciliation correctness is always enforced from the current FMs; the ledger files are just a convenience
view you render when you want to read one.
