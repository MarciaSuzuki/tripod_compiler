import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// SC-0033 — wire the SC-0031 measurement-trap helper into the gate so it RUNS, not just exists.
// `tools/adversarial_check.py --self-test` replays the 4 historical measurement traps + the no-op
// guard (T1 dangling-group · T2 ajv-shape · T3 exit-without-pipe · T4 clean-control · T5 no-op-
// refusal). The whole point of SC-0031 was that a check which is only *read* doesn't enforce —
// only one that *runs* does — so this makes `npm test` go red if any trap regresses.
//
// The helper is a Python dev tool. On a host without python3 we skip VISIBLY (the same idiom as the
// SC-0008 vault-drift guard above), never a silent green — so the otherwise-TypeScript gate is not
// hard-broken where python3 is absent.

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOOL = join(REPO, "tools", "adversarial_check.py");

function python3Available(): boolean {
  const probe = spawnSync("python3", ["--version"], { encoding: "utf8" });
  return !probe.error && probe.status === 0;
}

const hasPython3 = python3Available();
if (!hasPython3) {
  console.warn(
    "⚠ SC-0033 adversarial-check self-test SKIPPED — `python3` not found on PATH. " +
      "Install python3 to run `tools/adversarial_check.py --self-test` as part of the gate.",
  );
}

describe("SC-0033 — adversarial_check.py self-test runs in the gate (measurement-trap guard)", () => {
  it.skipIf(!hasPython3)(
    "replays the 4 historical traps + the no-op guard and exits 0 (ALL PASS)",
    () => {
      const res = spawnSync("python3", [TOOL, "--self-test"], { cwd: REPO, encoding: "utf8" });
      const out = `${res.stdout ?? ""}${res.stderr ?? ""}`;
      // Assert on the helper's OWN verdict — its exit code AND its printed summary — so a failure
      // surfaces the located PASS/FAIL table, not a bare non-zero exit.
      expect(out, out).toContain("ALL PASS");
      expect(res.status, out).toBe(0);
    },
    120_000,
  );
});
