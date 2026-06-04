# VOCABULARY_LOG — approved-enumerations promotion log

Append-only log of promotions into `_spec/approved-enumerations.json` (the growing registry of
**approved convergent** bounded-open values). The mechanism is established by **SC-0006** in
`SPEC_CHANGES.md`; routine per-pericope promotions are recorded here (not as a new SC each time).

How a promotion works:
1. `tripod validate <FOR_MODEL>` surfaces **convergent** drift (review-signal); `tripod propose-vocabulary`
   lists the values as candidate `vocabulary_additions`.
2. **Gate-F review:** the reviewer flips each approved value `PROPOSED → CONFIRMED` in the pericope's
   **COMPILATION-LOG** `vocabulary_additions`. The review *is* the status flip.
3. `tripod promote <COMPILATION-LOG> --apply` (default `--status CONFIRMED`) grows the registry
   (provenance-stamped) with the CONFIRMED values and appends a line below.
4. **Re-pin** the registry: re-vendor + update the sha256 in `_spec/pins.json` and the pin table in
   `SPEC_CHANGES.md`. `tripod check-drift` then enforces the new pin.

### Promotion policy — CONFIRMED-only (from P03 onward)
A value enters `approved-enumerations.json` **only after Gate-F review flips it `PROPOSED → CONFIRMED`** in
its COMPILATION-LOG; `tripod promote --apply` runs at the default `CONFIRMED` gate. `--status ANY` /
`--status PROPOSED` are **not** used to promote (the `promote` command warns if you override the gate).
**P02 is a documented, grandfathered exception** — promoted via `--status ANY` while its COMPILATION-LOG
still recorded `PROPOSED` (see the P02 entry below). It is not re-litigated; the policy applies from P03 onward.

Only convergent axes accumulate. As of **SC-0007** the COMPILATION-LOG feeds **every** convergent axis —
`proposition_kind`, `scene_kind`, `presence_value`, the L1-element axes (arc/context/tone/pace/
communicative_function), `discourse_thread_state`, and `high_risk_register_kind` — so all of them can converge.

---

## Promotions

- 2026-05-29 — **seed (SC-0006):** `approved-enumerations.json` v0.1 seeded from the convergent axes
  of canonical P01 (`proposition_kind`×10, `scene_kind`×3, `presence_value`×3, `arc_element`×5,
  `context_element`×7, `tone_element`×5, `pace_element`×2, `communicative_function_element`×6,
  `discourse_thread_state`×5, `high_risk_register_kind`×16). All tagged `approved_in: P01`.
- 2026-05-30 — **P02 (`P02-Ruth-1-6-14-COMPILATION-LOG`) — grandfathered exception:** promoted **41
  convergent values** at the project lead's direction (`promote --status ANY`; P02's CL recorded them as
  `PROPOSED`). This is the one-time exception to the CONFIRMED-only policy adopted from P03 onward. Registry
  `v0.1 → v0.2`, re-pinned. By axis: `proposition_kind`×14, `scene_kind`×3, `arc_element`×6,
  `tone_element`×4, `pace_element`×2, `communicative_function_element`×7, `high_risk_register_kind`×5.
  All tagged `approved_in: P02`. **Result: P02 FOR_MODEL now validates with 0 convergent drift**
  (was 37) — the SC-0006 + SC-0007 payoff on real vendored data. (`presence_value`, `context_element`,
  `discourse_thread_state`: P02 introduced no new values.)
- 2026-05-30 — **P03 (`P03-Ruth-1-15-18-COMPILATION-LOG`) — first CONFIRMED-only promotion:** Gate-F review
  flipped P03's **27 convergent values** `PROPOSED → CONFIRMED` in its COMPILATION-LOG (L1-element slots
  recorded as CONFIRMED; the gold `proposition_kinds`/`scene_kinds` flipped to CONFIRMED), then
  `promote --apply` at the **default `CONFIRMED` gate** (no `--status` override). Registry `v0.2 → v0.3`,
  re-pinned. By axis: `proposition_kind`×5, `scene_kind`×3, `arc_element`×5, `context_element`×2,
  `tone_element`×4, `pace_element`×3, `communicative_function_element`×5. All tagged `approved_in: P03`.
  **Result: P03 FOR_MODEL now validates with 0 convergent drift** (was 27).
- 2026-05-30 — **P04–P06 batch (CONFIRMED-only):** Gate-F review recorded each pericope's convergent
  values as `CONFIRMED` in its COMPILATION-LOG (P06's log had none recorded — all added), then
  `promote --apply` at the **default `CONFIRMED` gate**, one pericope at a time:
  - **P04** (`P04-Ruth-1-19-22`): 31 promoted (prop ×6, scene ×3, presence ×1, arc ×6, context ×2, tone ×4, pace ×3, comm-func ×6).
  - **P05** (`P05-Ruth-2-1-7`): 33 promoted (3 already approved — shared with P04).
  - **P06** (`P06-Ruth-2-8-16`): 40 promoted (3 already approved).
  Registry `v0.3 → v0.4`, re-pinned. **Result: the full Ruth pilot corpus (P01–P06) now validates with
  0 convergent drift** — controlled-vocabulary convergence complete for the pilot. (Descriptive/open
  axes remain per-pericope, by design.)
- 2026-06-03 — **SC-0021 vocabulary consolidation (tone/pace triage promotion):** the corpus-independent
  triage (vault `tripod_cleanup_log.md`) locus-stripped the L1 mood axes and unified `NARROW → NARROWS`;
  this promotes the 11 resulting convergent bares. By axis: `tone_element`×3 (`RISING` P03, `STILLED` P04,
  `URGENT` P02), `pace_element`×8 (`BRISK` P02, `SLOWED` P02, `PAUSED` P03, `NARROWS` P03, `RISES` P04,
  `SETTLES` P04, `HOLDS` P05, `WIDENS` P05). All `sc_ref: SC-0021`; `approved_in` = each value's first-seen
  pericope. Registry `v0.4 → v0.5`, re-pinned. COMPILATION-LOG `vocabulary_additions` tone/pace re-pointed
  to the bares (SC-0007 intake invariant — each CL declares exactly its `approved_in` set). **Result:
  P01–P06 validate with 0 tone/pace convergent drift.** (Old locus values left as orphaned-historical in
  the registry; a deprecation sweep is a separate later pass.)
