#!/usr/bin/env python3
"""
adversarial_check.py — evaluator-side adversarial-check helper (SC-0031).

Makes a "break X, expect a block" verification *unfoolable*. It exists because the same
measurement trap fooled the evaluator 4× in one arc (see docs/RECURRING-ERROR-DISCIPLINE.md
and the [[tripod-my-role-is-evaluator]] memory note): prose-grepping output that was already
structured, a shell pipe eating the exit code, BSD `sed` silently no-op'ing a GNU-ism so the
"break" never applied, and a mis-measured DIFFERS that almost blocked a correct merge.

The CLI already emits structured `--json` findings (severity/code/location/message) and clean
exit codes (validate: 0 clean / 1 invalid / 2 error; lint/id-check/coverage similar). So the
fix is thin: capture the exit code by subprocess return value (NEVER a shell pipe), parse the
findings as DATA (NEVER a needle/grep/code-guess), apply adversarial mutations IN PYTHON and
ASSERT the bytes changed before trusting anything (NEVER trust a possibly-no-op edit), and run
the unmutated CONTROL so a false-alarm can't masquerade as a real finding.

Usage:
    python3 tools/adversarial_check.py --self-test     # replay the 4 historical traps + no-op guard
    # or import: from adversarial_check import expect_block, expect_clean
"""

from __future__ import annotations
import json
import os
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoOpMutation(Exception):
    """Raised when an adversarial mutation would not change the bytes — the BSD-`sed` trap.
    We refuse to report PASS/FAIL on an input we never actually broke."""


def run_json(cmd: str, *targets: str) -> tuple[int, list[dict]]:
    """Run `tripod <cmd> --json <targets...>` and return (exit_code, findings).

    Exit code comes from the subprocess return value — no shell, no pipe (closes the
    pipe-exit trap). Findings are parsed from --json as data (closes the needle trap)."""
    proc = subprocess.run(
        ["npx", "tsx", "src/cli/tripod.ts", cmd, "--json", *targets],
        cwd=REPO, capture_output=True, text=True,
    )
    findings: list[dict] = []
    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        # No structured output to trust — surface it as an error, never a silent "clean".
        raise RuntimeError(f"`tripod {cmd} --json` produced no parseable JSON "
                           f"(exit {proc.returncode}); stderr: {proc.stderr.strip()[:200]}")
    for report in (data if isinstance(data, list) else [data]):
        findings.extend(report.get("findings", []) or [])
    return proc.returncode, findings


def _blocks(findings: list[dict]) -> list[dict]:
    return [f for f in findings if f.get("severity") == "block"]


def expect_clean(target: str, cmd: str = "validate") -> tuple[bool, dict]:
    """PASS iff the (unmutated) target validates clean: exit 0 and zero block findings.
    The control that catches a false-alarm (a mis-measured 'DIFFERS')."""
    code, findings = run_json(cmd, target)
    blocks = _blocks(findings)
    return (code == 0 and not blocks), {"exit": code, "blocks": blocks}


def expect_block(target: str, mutate: tuple[str, str], cmd: str = "validate",
                 code: str | None = None, location: str | None = None) -> tuple[bool, dict]:
    """Apply `mutate=(old, new)` to a copy of `target` IN PYTHON, assert the bytes changed,
    run `tripod <cmd> --json` on the copy, and PASS iff it blocks with a finding matching
    `code`/`location` (substring) when given. Raises NoOpMutation if `old` is absent."""
    src = open(target, encoding="utf-8").read()
    old, new = mutate
    if old not in src:
        raise NoOpMutation(f"'{old[:50]}' not present in {os.path.basename(target)} — "
                           f"the mutation is a no-op; refusing to trust a clean/block result")
    mutated = src.replace(old, new, 1)
    assert mutated != src, "mutation produced identical bytes"  # belt-and-suspenders
    fd, path = tempfile.mkstemp(suffix="-MEANING-COORDINATES.md")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(mutated)
        rc, findings = run_json(cmd, path)
        blocks = _blocks(findings)
        hit = [f for f in blocks
               if (code is None or f.get("code") == code)
               and (location is None or location in (f.get("location") or ""))]
        return (rc != 0 and bool(hit)), {"exit": rc, "matched": hit, "all_blocks": blocks}
    finally:
        os.unlink(path)


# ───────────────────────── self-test: the 4 historical traps + the no-op guard ─────────────────────────

def _self_test() -> int:
    P03 = os.path.join(REPO, "fixtures/meaning-coordinates/P03-Ruth-1-15-18-MEANING-COORDINATES.md")
    results: list[tuple[str, bool, str]] = []

    def record(name: str, ok: bool, detail) -> None:
        results.append((name, ok, str(detail)))

    # Trap 1 (needle false-clean): a dangling fidelity_group ref. The old approach grepped for a
    # code string and missed it; parsing findings as data finds it by code+location.
    ok, d = expect_block(P03, ('"group": "people_god_inseparability"', '"group": "ghost_group"'),
                         code="referential-integrity", location="/fidelity/elements")
    record("T1 needle→data: dangling group ref blocks", ok, d)

    # Trap 2 (needle false-clean #2): a malformed flag, now caught by ajv (a DIFFERENT code than the
    # old needle expected). Matching on severity+location, not a guessed code, catches it.
    ok, d = expect_block(P03, ('"preserve_meaning": true', '"preserve_meaning": "yes"'),
                         location="/fidelity")
    record("T2 needle→data: malformed flag blocks (ajv)", ok, d)

    # Trap 3 (pipe-exit false-clean): the exit code must be a real non-zero, captured by the
    # subprocess return value (no shell pipe to eat it).
    rc, _ = run_json("validate", P03)
    record("T3 exit-code without pipe: clean target exits 0", rc == 0, {"exit": rc})

    # Trap 4 (false-alarm): the unmutated control must read CLEAN — a mis-measured DIFFERS must not
    # masquerade as a real finding.
    ok, d = expect_clean(P03)
    record("T4 control: unmutated P03 is clean (no false-alarm)", ok, d)

    # No-op guard (the BSD-`sed` trap): a mutation that does not apply must REFUSE, never silently PASS.
    try:
        expect_block(P03, ('"group": "THIS_STRING_IS_NOT_IN_THE_FILE"', '"group": "x"'))
        record("T5 no-op guard: refuses an unchanged 'broken' input", False, "did NOT refuse")
    except NoOpMutation as e:
        record("T5 no-op guard: refuses an unchanged 'broken' input", True, str(e))

    print("adversarial_check --self-test (SC-0031)\n" + "-" * 60)
    all_ok = True
    for name, ok, detail in results:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}")
        if not ok:
            all_ok = False
            print(f"        detail: {detail}")
    print("-" * 60)
    print("ALL PASS" if all_ok else "SELF-TEST FAILED")
    return 0 if all_ok else 1


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(_self_test())
    print(__doc__)
    sys.exit(0)
