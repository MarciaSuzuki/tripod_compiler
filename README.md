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

- `_spec/` exists but the controlled lists are **SKELETON**: seeded only with values
  observed in real `pilot-2` artifacts (Ruth P01 = 1:1–5, P02 = 1:6–14), each carrying
  `complete: false` and value-level `observed_in` provenance. They must be filled from the
  authoritative `pilot-2` / `TRIPOD_STA_v2_0` vocabulary doc before the validator is
  treated as authoritative. See [`_spec/README.md`](_spec/README.md).
- `src/`, `fixtures/`, `tests/` are scaffolded but empty.
- No reader, vocabulary engine, or `tripod validate` CLI yet. No LLM / generator — those
  are later slices.

## Stack (planned)

TypeScript / Node, `zod` for schema-as-types-and-validator, a small CLI runner. Vault I/O
over the filesystem. See `CLAUDE.md` §5.
