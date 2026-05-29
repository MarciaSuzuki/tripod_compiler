# VOCABULARY_LOG — approved-enumerations promotion log

Append-only log of promotions into `_spec/approved-enumerations.json` (the growing registry of
**approved convergent** bounded-open values). The mechanism is established by **SC-0006** in
`SPEC_CHANGES.md`; routine per-pericope promotions are recorded here (not as a new SC each time).

How a promotion works:
1. `tripod validate <FOR_MODEL>` surfaces **convergent** drift (review-signal); `tripod propose-vocabulary`
   lists the values as candidate `vocabulary_additions`.
2. The reviewer approves values in the pericope's **COMPILATION-LOG** `vocabulary_additions`
   (status → `CONFIRMED` at Gate F).
3. `tripod promote <COMPILATION-LOG> --apply` grows the registry (provenance-stamped) and appends a
   line below.
4. **Re-pin** the registry: re-vendor + update the sha256 in `_spec/pins.json` and the pin table in
   `SPEC_CHANGES.md`. `tripod check-drift` then enforces the new pin.

Only convergent axes accumulate. The COMPILATION-LOG currently feeds `proposition_kind`, `scene_kind`,
and `presence_value`; the L1-element / `discourse_thread_state` / `high_risk_register_kind` axes have
no promotion slot yet (see SC-0006 known limitation).

---

## Promotions

- 2026-05-29 — **seed (SC-0006):** `approved-enumerations.json` v0.1 seeded from the convergent axes
  of canonical P01 (`proposition_kind`×10, `scene_kind`×3, `presence_value`×3, `arc_element`×5,
  `context_element`×7, `tone_element`×5, `pace_element`×2, `communicative_function_element`×6,
  `discourse_thread_state`×5, `high_risk_register_kind`×16). All tagged `approved_in: P01`.
