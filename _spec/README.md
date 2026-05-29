# `/_spec` — controlled vocabulary as machine-readable data

This directory is the single source of truth the **vocabulary engine** reads. It is the
machine-readable form of the prose STA vocabulary doc. The validator loads these files and
checks every controlled value in a FOR_MODEL / Meaning Map against them.

## STATUS: SKELETON (incomplete by design)

Every list here is seeded **only with values directly observed in real `pilot-2` artifacts**
(Ruth P01 = 1:1–5, P02 = 1:6–14). They are **not complete**. Each list carries
`complete: false` and value-level `observed_in` provenance. **Fill the lists from the
authoritative current (`pilot-2` / `TRIPOD_STA_v2_0`) vocabulary doc** before relying on the
validator — see `CLAUDE.md` §6.

Do **not** treat a seeded list as exhaustive: a value's absence here means "not yet
transcribed", not "invalid".

## The three layers (see `CLAUDE.md` §4)

| File | Layer | Behaviour when a value is missing from the list |
|---|---|---|
| `layer1.closed.yaml` | L1 closed | **BLOCK** (hard error) once `complete: true` |
| `layer2.bounded.yaml` | L2 bounded-open | **drift warning** → review → add-with-provenance |
| `axes.yaml` | supporting closed/enum axes (presence, component `action`, register-override values) — classification TBC |
| `registry/<book>.yaml` | L3 profile registry | **propose registry addition** (BCD-delta) |
| `schema/` | zod / JSON-schema for the FOR_MODEL envelope + structure |

## Suggested loader contract (TypeScript)
```ts
type ListStatus = "SKELETON" | "DRAFT" | "COMPLETE";
interface ControlledList {
  expected_count?: number;
  complete: boolean;
  values: { id: string; observed_in?: string[]; note?: string }[];
}
// engine: if !list.complete -> downgrade BLOCK to WARN for that list, and surface
// "spec incomplete" in the report so results are never falsely authoritative.
```
