# SC-0063 (PROPOSAL — awaiting Marcia's ruling) — The FOR_MODEL drafter (Slice 4, phase 1: harness → calibration → pilot → batch)

> **Status: PROPOSAL.** Marcia opened this front 2026-06-12 (her pick from the three candidates).
> This is the plan-first half: nothing here spends money or writes canon. The one decision that
> gates the build is **the API-budget word** (§7). Pointers: [[tripod-seed-corpus-strategy]] ·
> `docs/JONAH-GENERALITY-REPORT.md` §5 (the deferred L2 experiment) · vault
> `_spec/agent-3-system-prompt.md` (the role this automates — STALE as spec, discipline-language
> raw material only; see §3.2) · `docs/PROGRESS.md` "In-flight" (the seam, defined at Slice 2).

---

## 1. The problem (why now)

The seed corpus trains on **triples**: Hebrew source packet → Meaning Map → FOR_MODEL. All 19
pericopes have packets and blessed maps; only **6 of 19** (P01–P06) have complete FOR_MODELs.
The other **13** (J01–J05, P07–P14) have *deterministic skeletons* in `_working/<id>/` — every
mechanical field compiled from the map, every interpretive field a typed `__TODO__` placeholder.
The skeletons self-report **1,025 judgment gaps** (40–115 per pericope; counts include the empty
Level-1 element arrays). Per Marcia's stated strategy (2026-06-11), authoring these is the
**seed's critical path** — and it is also the **L2-generality experiment** the Jonah report
deferred: can a model fill `scene_kind` / `proposition_kind` / event slots *from the bounded-open
vocabulary* instead of minting freely?

## 2. The seam (already built — Slice 2, deliberately stopped here)

`tripod compile <map> --json` emits `{ skeleton, gaps[], stats }` where each gap carries
`{ location, field, reason, hint }` — `hint` being the map's own source-prose span that informs
the judgment (`src/compiler/skeleton.ts`). PROGRESS.md: *"the seam is defined: `compile` emits
the skeleton + the per-field gap (with source-prose span) that the drafter fills, then the result
re-validates via Slice 1."* This SC builds the filler against that seam. Nothing upstream changes.

## 3. The design

**3.1 The patch-only contract (the don't-invent rule, made mechanical).** The model never emits
a whole FOR_MODEL. It receives the skeleton + the gap list and returns **only gap-fills**, keyed
by gap location, via structured outputs (a JSON schema the API enforces):

```jsonc
{ "fills": [ { "location": "/level_2_scenes/0/scene_kind",
               "value": "PLAN_SPOKEN_SCENE",
               "vocabulary_addition": null,     // or {value, axis, justification} when minting L2
               "note": null } ] }               // optional honest remark for the COMPILATION-LOG
```

The harness merges fills into the skeleton **deterministically** and refuses any location not in
the gap report — the deterministic half stays byte-identical to what `compile` produced. This is
the Facilitator's "don't invent semantic content" contract enforced at the merge layer, not by
prompt hope.

**3.2 The prompt — authored FRESH against the current pinned spec.** The vault's
`agent-3-system-prompt.md` v0.3 is **stale** (evaluator-confirmed 2026-06-12, architect-verified:
locked to validation-rules **v0.4** — current is **v0.16** — and its line 183 mandates the
pre-SC-0046 register constant, *"Pericope-level `register` is always `INFORMAL_CASUAL` for
biblical narrator voice"*, the exact falsehood the psalm finding fixed). Deriving from it would
re-import a fixed bug. So the drafter prompt is **written new** against the compiler `_spec/`
(the de-facto canonical: validation-rules v0.16 with the genre-aware register rule, the current
closed lists, the skeleton gap-report shape); the old Agent-3 prompt serves as **raw material for
the discipline language only** (the approved map controls story content; event-participant slot
names, never agent/patient; mint a bounded-open value only when the map requires it and record
it; closed lists never expand). It carries the pinned conventions the hand-runs learned: the
versification convention (scene range = Hebrew, prop anchor = English; SC-0044), the
register-usage rules (`_methodology/register-usage-rules.md`, SC-0058 — born-clean discipline),
lexeme discipline on flags (flag where the word/image is). Stored as a **new pinned spec file**
`_spec/drafter/fm-drafter-prompt.md` under the same pin discipline as every other spec file
(check-drift covers it; prompt changes are visible diffs, not silent drift).

**3.3 The context assembled per call** (stable prefix first, for prompt caching):

| Block | Content | ~Size |
|---|---|---|
| stable | drafter system prompt (3.2) | ~15 KB |
| stable | L1 closed lists + L2 approved enumerations, compact rendering | ~25 KB |
| stable | registry digest: concepts + figures (code → name → one-liner) + the book's cast | ~25 KB |
| stable | ONE worked gold example: P01 map §4–§5 excerpts beside its gold FM Level 2/3 | ~25 KB |
| per-pericope | the blessed map (fixtures copy) | 13–45 KB |
| per-pericope | the skeleton + gap report (compiled fresh from the map at run time) | 10–25 KB |

**3.4 Provenance (reproducible-from-artifacts, like everything else).** Each run archives under
`_working/<id>/drafts/`: the request manifest (model id, prompt pin, params, input file hashes),
the raw API response, and the merged FM. The COMPILATION-LOG records the drafter identity + any
`vocabulary_additions` (the existing SC-0006/0007 intake slots — the promote pipeline already
exists). The FM note carries `status: "draft"` and an honest "machine-drafted, unruled" banner
until Marcia rules it.

**3.5 The gates are the experiment.** After merge, the standard board runs on the drafted FM:
`validate` (closed-axis = the L1 invariant), `lint`, `coverage`, `id-check`. L2 drift warnings
are not failures — they are **the generality data**: how often did the drafter reuse the
bounded-open vocabulary vs. mint? Tabulated per pericope, reported honestly.

**3.6 Engine.** TypeScript in-repo: `src/drafter/` + `tripod draft <ID>` CLI.
`@anthropic-ai/sdk`; model **`claude-opus-4-8`** (her earlier word: use Opus; $5/$25 per MTok);
adaptive thinking; streaming; prompt caching on the stable prefix (reads ≈ 0.1× input price).
The key comes from `ANTHROPIC_API_KEY` in the environment — never committed, never pasted into
chat, never echoed by the tool. Without the key, only `--dry-run` works.

## 4. The phases (her word between each; nothing paid before Phase B)

| Phase | What | API calls | Deliverable |
|---|---|---|---|
| **A** | Harness + prompt + `--dry-run` (assembles the exact prompt, no call) + a `count_tokens` measurement (free endpoint) | 0 paid | the **measured** cost table replacing §5's estimate |
| **B** | **Calibration on gold:** draft P02 (its gold FM exists) and judgment-diff vs gold (extend `gold-diff` with a judgment-layer mode) | ~2 | a quantified agreement baseline *before any unknown pericope* |
| **C** | **Pilot:** P08 (smallest real skeleton, 50 gaps) → gates → report with ruling groups, like a map report | 1 | her quality ruling on a real drafted FM |
| **D** | **The batch:** remaining 12, one at a time, board after each | 12 | 13/13 drafted FMs in `_working/`, the L2 tabulation, chronological PR |

## 5. Cost estimate (list prices; Phase A replaces this with measurement)

Per call ≈ 35–45k tokens in (≈ 90 KB stable + 25–70 KB per-pericope) + ~10k out (fills + thinking).
13 final calls + ~8 calibration/iteration calls ≈ **0.9M in + 0.2M out ≈ $9.50 list**; caching on
the stable prefix cuts input ~25–35%. **Realistic total $8–15. Proposed hard ceiling: $25** — if
spend approaches it, stop and report. (The Batch API's 50% discount is available for Phase D, but
sequential calls are recommended: gate-after-each, and the cache makes the saving marginal at
this scale.)

**§5a — Phase A MEASURED (2026-06-12, byte-estimate; count_tokens lands once the key is in env):**
per-call input 25.4k–37.9k tokens (J01 smallest, J02 largest); the shared cacheable prefix is
**≈ 17.8k tokens** (64.3 KB Ruth / 61.1 KB Jonah — the registry digest differs by book); all 14
targets (13 skeletons + the P02 calibration) ≈ **459k input tokens naive**. At list prices with
sequential caching: input ≈ $1.30, output (est. ~9k/call incl. thinking) ≈ $3.15 → **≈ $4.50–5.50
per full pass; $6–9 for the whole front including calibration iterations** — the original §5
estimate refined DOWN. The ceiling stays $25.

## 6. What this does NOT touch

No vault writes. No closed-list changes (any L1 violation is a hard validate error = a finding,
not a fix-in-place). No registry edits (proposed additions flow through COMPILATION-LOG →
her ruling → `promote`, the existing pipeline). Drafted FMs stay `_working/` with honest draft
status until she rules them — graduation is a later visibility cycle (the SC-0038/0055/0062
idiom). No schema change; the drafter prompt is **additive** (one new pinned file).

## 7. Ruling points

1. **THE BUDGET WORD (the one decision):** approve the build + her `ANTHROPIC_API_KEY` in the
   environment + the **$25 ceiling**? Phases B–D pause for her word regardless; A is free.
2. Stated recommendations (hers to overrule, no re-ask needed): **calibrate on gold P02 first**
   (≈ $1 buys a measured baseline) · **pilot = P08** (smallest, typical narrative, freshly
   blessed) · **patch-only contract** (3.1 — the architecture the seam was built for).

## 8. Acceptance (for the evaluator)

- **A:** `--dry-run` reproducible (same inputs → byte-identical prompt); prompt pinned +
  check-drift covers it; no network call possible without key + explicit non-dry-run.
- **B:** judgment-layer agreement vs P02 gold reported with honest numbers (matched / divergent /
  per-field), the divergences listed, none silently smoothed.
- **C:** P08 drafted FM passes the 4 gates or failures tabled verbatim; the report uses the map
  ruling format (groups + numbered divergences); her ruling recorded in the ledger row.
- **D:** 13/13 drafted; the board green after each (or findings tabled); **closed lists
  byte-unchanged end to end** (the L1 invariant re-proven); the L2 mint-vs-reuse tabulation
  published — that table *is* the generality result.
