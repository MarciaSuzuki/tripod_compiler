# SC-0075 — note-`type` envelope guard + the 13 mislabeled COMPILATION-LOG envelopes — APPLY RECORD

**Applied 2026-06-26** (compiler + vault pair, on branch `sc-0075-cl-type-fix` / vault `sc-0075-cl-type-fix`).
Tier A — reaches `main` only on the Evaluator's application-verify (the bars below) + Marcia's merge word.
**Independent of SC-0074** (Esther source, PR #92) — its own branch + SC.

## The problem (Evaluator-diagnosed)

The Review Portal (marciasuzuki.github.io/tripod_compiler) was **frozen at `626b8b7` (June 19)**, showing
only **6 of 19** pericopes' STA, with P07–P14 + Jonah as "not yet authored." On current main all 19 STA
exist and are `status: "valid"`, but the portal had **not redeployed**:

- The `review-portal` workflow (`.github/workflows/portal.yml`) runs `npm test` **before** `npm run build`.
- `npm test` includes `portal/test/smoke-real-tree.test.mjs`, which itself runs the portal build and asserts
  it exits 0. It exited **2** = the **approved-only gate** (`portal/src/lib/gate.mjs`) aborted.
- Gate reason: **13 compilation-logs carried frontmatter `type: "compilation-log"`, but the canonical
  envelope is `"sta-compilation-log"`** (the gate, line 74, requires the exact per-class value). The 6
  hand-built CLs (P01–P06) and all 19 FMs were correct; the 13 **SC-0064-mechanized** CLs dropped the
  `sta-` prefix.
- The compiler **validator checks the JSON body, not the note `type` envelope**, so `validate` stayed
  19/19 green and never caught the drift. Only the portal's stricter gate saw it — and it had been
  CI-red, silently, on every merge since June 20.

## What was applied

### 1. Data fix — the 13 envelopes (Tier A pair, byte-identical)

Normalized frontmatter `type: "compilation-log"` → `"sta-compilation-log"`, one line each, nothing else:

| | files |
|---|---|
| **Jonah** | `J01 J02 J03 J04 J05` — vault `stas/jonah/`, compiler `fixtures/compilation-log/` |
| **Ruth** | `P07 P08 P09 P10 P11 P12 P13 P14` — vault `stas/`, compiler `fixtures/compilation-log/` |

All 13 compiler↔vault byte-identical after the edit (`diff -q` clean). Zero-grep proof: no
`^type: "compilation-log"$` remains anywhere in `fixtures/` or the vault `stas/`; all 19 CLs now read
`"sta-compilation-log"`.

### 2. Root-cause fix — the CLI generator

`src/cli/tripod.ts` (the `tripod compile … --out-log` path) emitted `type: "compilation-log"` — this is
what minted the drifted envelope on the 13 mechanized CLs. Corrected to `"sta-compilation-log"`.

### 3. Durable fix (make-impossible) — the `note-type` validator BLOCK

`src/engine/validate.ts`:
- New exported `CANONICAL_NOTE_TYPE` map: `FOR_MODEL → sta-for-model`, `COMPILATION-LOG → sta-compilation-log`,
  `BCD-DELTA → bcd-delta`, `VERIFICATION-INPUT → verification-input`.
- After `detectArtifact`, when a note carries a `type` envelope that **mismatches its detected class**,
  validate now pushes a `severity: "block"`, `code: "note-type"`, `location: "frontmatter.type"` finding.
  Fires **only when a `type` envelope is present** — oral raw-`.json` STA (detected by body signature) carry
  none and are exempt.
- `detectArtifact` line 20 updated to recognize the canonical `"sta-compilation-log"` (was the now-retired
  `"compilation-log"`); filename detection (`*-COMPILATION-LOG.md`) remains the safety net, so a drifted
  file is still detected as its class and then hard-blocked by the envelope check.
- `src/engine/report.ts`: added `"note-type"` to the `FindingCode` union.

**Why this is the make-impossible layer:** the drift recurred because the *only* check that saw the envelope
was the portal gate, which runs late and silently in CI. Moving the check into `validate` means any future
envelope drift hard-blocks at `npm test` / `tripod validate`, beside every other Tier-A artifact gate.

### 4. Unmasked latent staleness — the portal smoke assertion

`portal/test/smoke-real-tree.test.mjs` line 36 asserted the J01 page shows "Not yet authored for this
passage" — the **day-one map-only state**. Once the gate-fix lets the build complete, execution reaches that
assertion, which now fails because J01 (and all 19) are fully authored. Corrected to assert J01 renders its
FOR_MODEL + compilation-log (`id="for-model"` / `id="compilation-log"`, and **not** the placeholder). The
placeholder branch (`portal/src/lib/pages.mjs`) is retained for future genuinely-absent artifacts; it is
simply no longer triggered by the real tree.

### Tests

`tests/validate.test.ts` — new `note-type envelope guard (SC-0075)` block, 4 tests:
1. the gold corpus (all 19 CLs) surfaces **no** `note-type` finding;
2. a CL whose envelope dropped the `sta-` prefix (the exact portal-blocker drift) → **BLOCK** at
   `frontmatter.type`, message names `expected "sta-compilation-log"`;
3. a FOR_MODEL carrying a `sta-compilation-log` envelope (cross-class mislabel) → **BLOCK**;
4. a clean CL → **SILENT**.

`tests/compile.test.ts` — the Slice-2 gap-report test's hand-written note envelope updated to the canonical
value (it previously hard-coded the old `"compilation-log"`, which the new guard correctly blocked).

## What this does NOT change

No `validation-rules.json`, no `approved-enumerations.json`, no schema-version pin — this is a code-level
validator rule plus an envelope-data normalization. No `_spec/` re-pin. `lint-lexicon` unchanged (0.4.0).

## Verification (the bars for the Evaluator)

- Compiler board: **395 passed + 1 skipped** (391 floor + 4 note-type bite-tests).
- `validate` corpus-wide (19 FM + 19 CL = 38): **0 block · 0 drift · 0 `note-type` findings · 0 failing**.
- `check-drift`: all `vendored:ok`, closed-list sync invariant holds, @ lint-lexicon 0.4.0.
- Portal: `npm ci && npm test` → **25 pass / 0 fail**; `npm run build` → **exit 0**, manifest =
  **19 pericopes / 19 for-model / 19 compilation-log** (57 approved artifacts), every pericope renders
  map + for-model + log.
- Vault: 13 CL envelopes only; all 13 compiler↔vault byte-identical.

## Post-merge

The fix-merge to compiler `main` re-runs `review-portal` → `npm test` + build both green → GitHub Pages
auto-deploys → all 19 Ruth + Jonah STA show. (Or `workflow_dispatch` the `review-portal` workflow.) The
Evaluator confirms the live `build-manifest.json` commit == current main.

## Follow-up (out of scope here — Portal Builder)

Fix-spec hardening item 2: **make portal deploy-failure visible** — it was CI-red for a week unseen. Surface
it (e.g. the freshness contract alarms when the live `build-manifest.json` commit ≠ main, or portal-CI
failure notifies). Assigned to the Portal Builder; not part of this canon SC.
