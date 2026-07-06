# Tripod Compiler

[![review-portal](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal.yml/badge.svg)](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal.yml)
[![portal-watchdog](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal-watchdog.yml/badge.svg)](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal-watchdog.yml)

The upstream artifact-production toolchain for the **Tripod Method** of AI-assisted oral
Bible translation (Shema Bible Translation / OBT Lab). It sits beside the
`ruth-pilot-b-wiki` Obsidian vault (the source of truth) and does the repeated, mechanical
work of validating and compiling the machine-facing **STA / Meaning Coordinates** artifacts that the
downstream ML pilot depends on.

> **Read [`CLAUDE.md`](CLAUDE.md) first** — it is the authoritative project brief: the
> verified `TRIPOD_STA_v2_0` schema, the 3-layer / 2-profile vocabulary model, the build
> plan, and the open questions.

## Repo layout

```
_spec/              controlled vocabulary as machine-readable data (source of truth the engine reads)
  layer1.closed.yaml    L1 closed lists  — GENRE_GROUP, GENRE, REGISTER, SPEECH_ACT  (BLOCK on miss)
  layer2.bounded.yaml   L2 bounded-open  — proposition_kind, scene_kind, arc/tone/pace/comm-func  (drift warning)
  axes.yaml             supporting closed/enum axes (presence, component action, register-override values)
  registry/             L3 per-book registry (beings, places, objects, times, CB, FIG) — e.g. ruth.yaml
  schema/               zod / JSON-schema for the Meaning Coordinates envelope + structure
src/
  reader/             parse Obsidian Meaning Coordinates note + Meaning Map .md → typed model
  engine/             3-layer vocabulary guard (block / drift / propose) — profile-aware
  compiler/           MeaningMap → Meaning Coordinates (Slice 2)
  audit/              emit audit report + registry-delta (BCD-delta)
  cli/                tripod validate | compile | check-drift | propose-vocabulary
fixtures/           real gold artifacts pulled from the vault (P01, P02, …) for tests
tests/
CLAUDE.md           project brief & build guide
```

## Status

**Slice 1 (Spec + Validator) — in progress.**

**Slice 1 is implemented** — spec loader + drift-check, Obsidian reader, profile-aware
3-layer validator, and the `tripod` CLI, proven against the P01–P06 gold fixtures.

- **Source of truth:** the four locked schemas are **vendored + pinned** (version + sha256)
  from the wiki vault under [`_spec/`](_spec/README.md), governed by
  [`SPEC_CHANGES.md`](SPEC_CHANGES.md). `tripod check-drift` enforces the pins + the
  closed-list sync invariant. The hand-seeded skeleton YAMLs were superseded and removed
  (decision A / SC-0001).
- **`tripod validate <note|dir>`** — Layer 1 (ajv against the pinned schema: structure +
  closed-list **block**), Layer 2 (bounded-open **drift**), Layer 3 (referential integrity +
  registry references), plus register-critical presence checks.
- **Drift convergence (SC-0006):** L2 drift is split into **convergent** axes (real review-signal —
  `proposition_kind`, `scene_kind`, L1 elements, …) and **descriptive** open axes (`role_in_scene`,
  `function_in_scene`, `referential_form`, … — informational, never drift). The convergent baseline
  is a **growing `approved-enumerations.json`** registry: `tripod promote` accumulates approved
  values (with provenance) from COMPILATION-LOG `vocabulary_additions`, so drift converges across
  pericopes (e.g. P02 = 37 convergent + 49 descriptive; promoting P02 zeroes its proposition/scene
  drift). `tripod propose-vocabulary` lists the candidates.
- **Proof:** P01–P06 MCs validate block-clean (P01 drift 0 as the seed; P02–P06 surface
  bounded-open drift); a corrupted artifact yields precise, located errors. `npm test` (vitest)
  covers all of this.
**Slice 2 is implemented (deterministic half)** — `tripod compile <meaning-map>` parses a
Meaning Map and emits a Meaning Coordinates **skeleton** + **gap report**:

- Deterministically filled: `sta_id`, `header`, `genre_group`/`genre`/`register`, scene IDs +
  verse-ranges, per-scene entity IDs + `presence`, `significant_absence`, `scene_communicative_purpose`,
  proposition IDs/anchors/scene-links/cross-refs, and the Section-5 concept/figure flags.
- Left as `__TODO__` + a recorded **gap** (with MM prose as a hint): the controlled-vocabulary
  tokens (`scene_kind`, `proposition_kind`, `role_in_scene`, …), `event_specific_slots`,
  `inter_proposition_links`, `referential_form`, and the L1 element arrays — the judgment Agent 3
  supplies. The compiler never invents these. It also flags beings named only in scene prose
  (the Meaning Coordinates often adds them as `REFERENCED`) and notes that proposition granularity is judgment.
- `--out <file.md>` writes the skeleton as a draft Meaning Coordinates note (status `skeleton`); `--json`
  prints `{ skeleton, gaps, stats }`. The deterministic fields are cross-checked against the gold
  MCs in the tests.
- **Hardened (slice-2-hardening):** judgment placeholders **carry their source-prose span**
  (`__TODO__: <span>`); the gap report also emits as a **schema-valid COMPILATION-LOG**
  (`--out-log`, validated via Slice 1, gaps in `known_limitations`, extract-only attested); an
  **extract-only trace** check guarantees every emitted token resolves to an MM span (no invented
  values); and **`tripod gold-diff`** reports per-pericope gold agreement (90–100% on the comparable
  layer; P01 100%) with a committed baseline as Slice 4's regression check. Residual gold
  divergences are MM↔Meaning Coordinates coverage differences, not extractor errors.

- Not yet: the deep Layer-2/3 vocabulary passes for COMPILATION-LOG / BCD-DELTA /
  VERIFICATION-INPUT (those validate structurally today; Meaning Coordinates leads per decision E), and
  the **LLM drafter** that fills the skeleton's judgment gaps (Slice 4).

## Stack

TypeScript / Node (ESM), **ajv** consuming the pinned JSON-Schemas (no re-transcription — see
decision A), `commander` CLI, `vitest`. `zod` is reserved for internal report types rather than
re-deriving the canonical schema. Vault I/O over the filesystem. See `CLAUDE.md` §5.

## Usage

```
npm install
npm run build                         # tsc → dist/ (provides the `tripod` bin)
npx tsx src/cli/tripod.ts validate fixtures/meaning-coordinates/     # or: tripod validate <note|dir>
npx tsx src/cli/tripod.ts check-drift [--vault <wiki/_spec>]
npx tsx src/cli/tripod.ts compile fixtures/meaning-map/P01-Ruth-1-1-5.md [--out skel.md] [--out-log log.md] [--json]
npx tsx src/cli/tripod.ts gold-diff [--out fixtures/gold-diff-baseline.json]
npx tsx src/cli/tripod.ts propose-vocabulary fixtures/meaning-coordinates/P02-Ruth-1-6-14-MEANING-COORDINATES.md
npx tsx src/cli/tripod.ts promote fixtures/compilation-log/P02-Ruth-1-6-14-COMPILATION-LOG.md [--status ANY] [--apply]
npm test
```
