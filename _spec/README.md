# `/_spec` — controlled vocabulary the validator reads

The **single source of truth** for the controlled vocabulary is the locked
`validation-rules.json`, authored and governed in the wiki vault
(`ruth-pilot-b-wiki/_spec/validation-rules.json`). This directory **vendors a pinned copy** of
it; the validator loads that copy and checks every controlled value in a Meaning Coordinates / Meaning
Map against it.

## Source of truth: vendor + pin + drift-check (decision A)

- `validation-rules.json` — **vendored, pinned by version + sha256**. Current pin: **`v0.6`**,
  sha256 `b024e0ea40771ba4a169b936ce57f05686e5333485d937cbed97a80e0d14de3a`. All four schema pins
  live in [`pins.json`](pins.json); the full table + rationale is in
  [`../SPEC_CHANGES.md`](../SPEC_CHANGES.md).
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
- `meaning_coordinates_schema` — JSON Schema for the Meaning Coordinates envelope + structure. It mirrors each
  closed list as a `$defs.*_value` enum; the array and its mirror enum must stay in sync —
  itself a validator invariant.
- `drift_detector.canonical_p01_enumerations` — the documented L2 **bounded-open** seed (retained
  for provenance). The *live* drift baseline now comes from `approved-enumerations.json` (below).

## `approved-enumerations.json` — the growing drift baseline (SC-0006)

Bounded-open axes split two ways (rule: a seed key containing `_examples` or equal to
`referential_form` is **descriptive**; else **convergent**):

- **convergent** axes (`proposition_kind`, `scene_kind`, `presence_value`, the L1 element axes,
  `discourse_thread_state`, `high_risk_register_kind`) are expected to stabilize — an unseen value is
  a real **drift** review-signal. Their approved values accumulate **with provenance** in
  `approved-enumerations.json` (pinned, v0.1, seeded from P01), grown by `tripod promote` from
  COMPILATION-LOG `vocabulary_additions`. So drift **converges** across pericopes.
- **descriptive** axes (`role_in_scene_*`, `function_in_scene_*`, `*_kind_examples`,
  `referential_form`) are open by nature; unseen values are reported as `descriptive`
  (informational), never drift, and are **not** tracked in the registry.

See `../SPEC_CHANGES.md` (SC-0006) + `../VOCABULARY_LOG.md`.

The three sibling artifact schemas (`compilation-log`, `bcd-delta`, `verification-input`) live
in the wiki `_spec/` and are vendored/validated the same way as Slice 1 expands.

## Still local to this directory

| Path | Layer | Role |
|---|---|---|
| `registry/<book>.yaml` | L3 profile registry | per-book BCD codes (beings/places/objects/times/…); **propose registry addition** (BCD-delta) |
| `schema/` | — | zod / JSON-schema derived from `meaning_coordinates_schema` (Slice 1) |

## Superseded & removed (SC-0001 / decision A)

The hand-seeded `layer1.closed.yaml`, `layer2.bounded.yaml`, and `axes.yaml` were an explicit
`complete: false` stopgap. They are **superseded by the vendored `validation-rules.json`** and
have been removed. The Bible-wide Layer-2 vocabulary is seeded in the wiki at
`_spec/tripod-bible-wide-layer-2-vocabulary-seed-v0-1.csv`.
