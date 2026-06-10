import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// SC-0042 — the PROMOTED merge-discipline rule, gated (Marcia's promotion ruling 2026-06-10; the
// verify-MERGED-before-delete class hit its 2nd instance at SC-0041: a chained
// `gh pr merge && git push --delete` deleted the head branch of a PR whose merge had transiently
// failed, and let the paired vault merge land out of rhythm order). Per the recurring-error
// fix-hierarchy the promotion tier is make-impossible + gate: `tools/merge_pr.py` owns the merge
// rhythm (wait-for-MERGEABLE → merge → re-read until verified MERGED → only then delete; optional
// --require-merged pair-order guard), and this test runs its offline state-machine self-test so
// the gate goes red if the discipline logic ever regresses. Only a check that RUNS enforces
// (the SC-0034 principle).
//
// Same visible-skip idiom as the adversarial-check guard: no python3 → skip LOUDLY, never silent.

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOOL = join(REPO, "tools", "merge_pr.py");

function python3Available(): boolean {
  const probe = spawnSync("python3", ["--version"], { encoding: "utf8" });
  return !probe.error && probe.status === 0;
}

const hasPython3 = python3Available();
if (!hasPython3) {
  console.warn(
    "⚠ SC-0042 merge-discipline self-test SKIPPED — `python3` not found on PATH. " +
      "Install python3 to run `tools/merge_pr.py --self-test` as part of the gate.",
  );
}

describe("SC-0042 — merge_pr.py self-test runs in the gate (the promoted merge-discipline rule)", () => {
  it.skipIf(!hasPython3)(
    "replays the 6 state-machine scenarios (incl. the SC-0041 trap + verify-MERGED-before-delete) and exits 0 (ALL PASS)",
    () => {
      const r = spawnSync("python3", [TOOL, "--self-test"], { encoding: "utf8", timeout: 60_000 });
      expect(r.error, String(r.error)).toBeUndefined();
      expect(r.stdout, r.stdout + r.stderr).toContain("ALL PASS");
      expect(r.status, r.stdout + r.stderr).toBe(0);
    },
  );
});
