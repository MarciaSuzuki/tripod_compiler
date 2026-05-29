# Tripod Compiler

The upstream artifact-production toolchain for the **Tripod Method** of AI-assisted oral
Bible translation (Shema Bible Translation / OBT Lab). It sits beside the
`ruth-pilot-b-wiki` Obsidian vault (the source of truth) and does the repeated, mechanical
work of validating and compiling the machine-facing **STA / FOR_MODEL** artifacts that the
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
  schema/               zod / JSON-schema for the FOR_MODEL envelope + structure
src/
  reader/             parse Obsidian FOR_MODEL note + Meaning Map .md → typed model
  engine/             3-layer vocabulary guard (block / drift / propose) — profile-aware
  compiler/           MeaningMap → FOR_MODEL (Slice 2)
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
  closed-list **block**), Layer 2 (bounded-open **drift** vs the canonical-P01 seed), Layer 3
  (referential integrity + registry references), plus register-critical presence checks.
- **Proof:** P01–P06 FOR_MODELs validate block-clean (P01 drift 0 as the seed; P02–P06 surface
  bounded-open drift); a corrupted artifact yields precise, located errors. `npm test` (vitest)
  covers all of this.
- Not yet: the deep Layer-2/3 vocabulary passes for COMPILATION-LOG / BCD-DELTA /
  VERIFICATION-INPUT (those validate structurally today; FOR_MODEL leads per decision E), and
  the compiler / LLM generator (later slices).

## Stack

TypeScript / Node (ESM), **ajv** consuming the pinned JSON-Schemas (no re-transcription — see
decision A), `commander` CLI, `vitest`. `zod` is reserved for internal report types rather than
re-deriving the canonical schema. Vault I/O over the filesystem. See `CLAUDE.md` §5.

## Usage

```
npm install
npm run build                         # tsc → dist/ (provides the `tripod` bin)
npx tsx src/cli/tripod.ts validate fixtures/for-model/     # or: tripod validate <note|dir>
npx tsx src/cli/tripod.ts check-drift [--vault <wiki/_spec>]
npm test
```
