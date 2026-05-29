# `/_spec` — controlled vocabulary the validator reads

The **single source of truth** for the controlled vocabulary is the locked
`validation-rules.json`, authored and governed in the wiki vault
(`ruth-pilot-b-wiki/_spec/validation-rules.json`). This directory **vendors a pinned copy** of
it; the validator loads that copy and checks every controlled value in a FOR_MODEL / Meaning
Map against it.

## Source of truth: vendor + pin + drift-check (decision A)

- `validation-rules.json` — **vendored, pinned by version + sha256**. Current pin: **`v0.5`**,
  sha256 `a326dbdd2601089851907c2025517a7f3b076a9432d380e00487ee0ec76f1b4a` (see
  [`../SPEC_CHANGES.md`](../SPEC_CHANGES.md)).
- Do **not** hand-edit the vendored copy. Every vocabulary change is made in the wiki's
  canonical file as a **governed edit** recorded in `../SPEC_CHANGES.md`, then re-vendored and
  re-pinned (new version + new hash).
- A **drift-check** (wired up in Slice 1) fails the build if the vendored copy's hash ≠ the
  pin, or if the wiki's canonical copy changed out from under the pin. Schema drift is only
  safe when deliberate, recorded, and versioned (training paper §12).

## What `validation-rules.json` contains

- `closed_lists` — `GENRE_GROUP` (4), `GENRE` (31), `REGISTER` (7), `NARRATIVE_FRAMING`,
  `SPEECH_ACT` (31), plus the verification / figure / confidence / forbidden lists. A value
  outside a closed list is a **BLOCK** (hard error).
- `for_model_schema` — JSON Schema for the FOR_MODEL envelope + structure. It mirrors each
  closed list as a `$defs.*_value` enum; the array and its mirror enum must stay in sync —
  itself a validator invariant.
- `drift_detector.canonical_p01_enumerations` — the L2 **bounded-open** seeds; a value not yet
  present is a **drift warning** (review → add-with-provenance), not a hard error.

The three sibling artifact schemas (`compilation-log`, `bcd-delta`, `verification-input`) live
in the wiki `_spec/` and are vendored/validated the same way as Slice 1 expands.

## Still local to this directory

| Path | Layer | Role |
|---|---|---|
| `registry/<book>.yaml` | L3 profile registry | per-book BCD codes (beings/places/objects/times/…); **propose registry addition** (BCD-delta) |
| `schema/` | — | zod / JSON-schema derived from `for_model_schema` (Slice 1) |

## Superseded & removed (SC-0001 / decision A)

The hand-seeded `layer1.closed.yaml`, `layer2.bounded.yaml`, and `axes.yaml` were an explicit
`complete: false` stopgap. They are **superseded by the vendored `validation-rules.json`** and
have been removed. The Bible-wide Layer-2 vocabulary is seeded in the wiki at
`_spec/tripod-bible-wide-layer-2-vocabulary-seed-v0-1.csv`.
