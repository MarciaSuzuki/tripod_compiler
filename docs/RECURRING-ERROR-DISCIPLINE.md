# Recurring-Error Discipline

> **Durable, version-controlled copy of the `tripod-recurring-error-discipline` memory note** (SC-0031).
> The memory note is auto-recalled by the agents; this is the team-visible repo home (the evaluator cannot
> repo-write, so the builder commits it). The body below is byte-faithful to the note; `[[double-bracket]]`
> names refer to project memory notes.

---

**The discipline (Marcia + evaluator, 2026-06-08):** escalate recurring *process* errors the same way the project escalates recurring *vocabulary* — by recurrence. Apply the recurrence-watch to ourselves: a process error that recurs **≥2–3×** is promoted from "documented" to "enforced." Documenting an error *reduces* it; gating it *ends* it. (Proof: `COMMON-MISTAKES-REGISTER` M2.1 — "no prose in structured sections" — was written down, yet the same error recurred in the MC as SC-0027's `meaning` field, because a register that's *read* doesn't enforce; only a check that *runs* does.)

**Fix hierarchy — always reach for the highest that fits:**
1. **Make it structurally impossible** (e.g. SC-0030's parallel fidelity layer makes Level-3 purity structural, not convention).
2. **Gate / lint / hook it** (machine-run, deterministic — `check-drift`, the L3 lint, the integrity checks). Doesn't rely on anyone remembering. This is the real "run it every turn."
3. **Short, *triggered* note** (the lesson recalled at the relevant action — memory notes).
4. **AVOID a long every-turn checklist** — fatigue (check 30 things → check none well); most items are irrelevant to any given turn.

**The 3-role loop (NO separate agent — fits the existing two + Marcia):**
- **Evaluator — observe + tally + flag.** Each verification pass: note recurrences, keep a running count, and at ≥2–3× *recommend* a promotion (name the fix-tier). Does NOT build it (role boundary).
- **Builder — implement.** Build the promoted gate/lint/tool; atomize the human-facing register. A periodic "harness-hardening" SC.
- **Marcia — rule** which errors get promoted.

**The only new machinery = a recurrence tally + a retrospective ritual (not an agent):** the atomic lesson-notes ARE the register (each a row); track a recurrence count on each. At each handoff — or when a count crosses the threshold — a short **retrospective** (run by the evaluator, which holds the cross-cycle view) reviews the tally and recommends promotions.

**Where each kind lives:**
- Mechanizable checks → the **compiler** (lints/gates/hooks).
- Agent-process / judgment lessons → **memory** (auto-recalled, cross-linked) — e.g. [[tripod-my-role-is-evaluator]] (the measurement-trap: recurred **4×** despite the note → the standing #1 candidate for promotion to a *tool*, not a 5th note), [[tripod-grep-to-prove-complete]].
- Human-annotator mistakes → **vault** methodology — atomize `COMMON-MISTAKES-REGISTER.md` into wiki-notes for the future consultant team; wire each gateable one into a lint.
- **This process definition** → here (memory, auto-recalled) **+ a durable copy the builder should commit to compiler `docs/`** (version-controlled, team-visible; the evaluator can't repo-write).

**A 3rd agent (a process/QA steward owning lints + register + onboarding + inter-annotator-agreement) earns its place at consultant-TEAM scale — not now.** At 2 agents + Marcia the work is bursty and fits the loop; a dedicated agent would idle and add handoff cost.

See [[tripod-two-claude-roles]], [[tripod-reporting-style]], [[tripod-level3-purity-debt]].

---

*First committed SC-0031 (2026-06-08). The measurement-trap — the standing #1 promotion candidate above — is
enforced this same cycle by `tools/adversarial_check.py` (the helper that makes a "break X, expect a block"
check unfoolable by capturing exit codes without a pipe, parsing `--json` findings as data, and asserting an
adversarial mutation actually changed the bytes before trusting the result).*
