# VOCABULARY_LOG — approved-enumerations promotion log

Append-only log of promotions into `_spec/approved-enumerations.json` (the growing registry of
**approved convergent** bounded-open values). The mechanism is established by **SC-0006** in
`SPEC_CHANGES.md`; routine per-pericope promotions are recorded here (not as a new SC each time).

How a promotion works:
1. `tripod validate <FOR_MODEL>` surfaces **convergent** drift (review-signal); `tripod propose-vocabulary`
   lists the values as candidate `vocabulary_additions`.
2. The reviewer approves the values. `tripod promote` gates on status (default `CONFIRMED`); when a
   COMPILATION-LOG records its additions as `PROPOSED` (not yet flipped at Gate F), the project lead may
   promote them deliberately with `--status ANY` — that explicit run **is** the approval, recorded here.
3. `tripod promote <COMPILATION-LOG> --apply` grows the registry (provenance-stamped) and appends a
   line below.
4. **Re-pin** the registry: re-vendor + update the sha256 in `_spec/pins.json` and the pin table in
   `SPEC_CHANGES.md`. `tripod check-drift` then enforces the new pin.

Only convergent axes accumulate. As of **SC-0007** the COMPILATION-LOG feeds **every** convergent axis —
`proposition_kind`, `scene_kind`, `presence_value`, the L1-element axes (arc/context/tone/pace/
communicative_function), `discourse_thread_state`, and `high_risk_register_kind` — so all of them can converge.

---

## Promotions

- 2026-05-29 — **seed (SC-0006):** `approved-enumerations.json` v0.1 seeded from the convergent axes
  of canonical P01 (`proposition_kind`×10, `scene_kind`×3, `presence_value`×3, `arc_element`×5,
  `context_element`×7, `tone_element`×5, `pace_element`×2, `communicative_function_element`×6,
  `discourse_thread_state`×5, `high_risk_register_kind`×16). All tagged `approved_in: P01`.
- 2026-05-30 — **P02 (`P02-Ruth-1-6-14-COMPILATION-LOG`):** promoted **41 convergent values** at the
  project lead's direction (`promote --status ANY`; P02's CL recorded them as `PROPOSED`). Registry
  `v0.1 → v0.2`, re-pinned. By axis: `proposition_kind`×14, `scene_kind`×3, `arc_element`×6,
  `tone_element`×4, `pace_element`×2, `communicative_function_element`×7, `high_risk_register_kind`×5.
  All tagged `approved_in: P02`. **Result: P02 FOR_MODEL now validates with 0 convergent drift**
  (was 37) — the SC-0006 + SC-0007 payoff on real vendored data. (`presence_value`, `context_element`,
  `discourse_thread_state`: P02 introduced no new values.)
