#!/usr/bin/env python3
"""SC-0042 — the merge-discipline tool (the promoted verify-MERGED-before-delete rule).

The recurrence class this makes structurally impossible (2 instances, promoted by Marcia's ruling
2026-06-10; see SPEC_CHANGES SC-0042 + the memory tally):
  - 2026-06-01: a branch was deleted before its PR was verified MERGED.
  - 2026-06-10 (SC-0041): `gh pr merge && git push --delete` chained in ONE command — the merge
    transiently failed ("not mergeable" while GitHub recomputed mergeability seconds after a push)
    but the delete ran anyway, closing the open PR; the paired vault merge also proceeded out of
    rhythm order (vault landed before compiler).

The rule, made impossible to violate here:
  1. After any push, WAIT for mergeability (UNKNOWN -> retry; CONFLICTING -> abort) before merging.
  2. NEVER pass --delete-branch to gh; this tool owns deletion, and it deletes ONLY after it has
     re-read the PR and verified state == MERGED (with the merge sha in hand).
  3. The pair rhythm is checkable: --require-merged <owner/repo#N> aborts before ANY action if the
     prerequisite PR (compiler-first) is not already MERGED.

Usage:
  python3 tools/merge_pr.py 49                                  # PR in the current repo
  python3 tools/merge_pr.py MarciaSuzuki/ruth-pilot-b-wiki#17 \
      --require-merged MarciaSuzuki/tripod_compiler#49 \
      --delete-branch                                           # the vault half of a pair
  python3 tools/merge_pr.py --self-test                         # the gated state-machine check

Exit: 0 merged (and branch deleted if asked) · 1 aborted safely (no side effects past the abort
point) · 2 usage / pair-order violation. The self-test exercises the state machine with a fake gh
runner (offline, no network) and prints ALL PASS on success.
"""

import argparse
import json
import re
import subprocess
import sys
import time

POLL_TRIES = 10
POLL_SLEEP = 3.0  # seconds between mergeability / merged-state polls


def parse_ref(ref: str):
    """'49' -> (None, '49'); 'owner/repo#49' -> ('owner/repo', '49')."""
    m = re.fullmatch(r"(?:([\w.-]+/[\w.-]+)#)?(\d+)", ref.strip())
    if not m:
        sys.exit(f"ERROR: bad PR ref {ref!r} (want '<number>' or 'owner/repo#<number>')")
    return m.group(1), m.group(2)


class GhRunner:
    """Thin wrapper so the self-test can inject a scripted fake."""

    def run(self, args):
        p = subprocess.run(["gh", *args], capture_output=True, text=True)
        return p.returncode, p.stdout.strip(), p.stderr.strip()


def gh_json(runner, repo, pr, fields):
    args = ["pr", "view", pr, "--json", fields]
    if repo:
        args = ["-R", repo, *args]
    code, out, err = runner.run(args)
    if code != 0:
        return None, err
    try:
        return json.loads(out), None
    except json.JSONDecodeError as e:
        return None, f"unparseable gh output: {e}"


def merge_one(runner, repo, pr, delete_branch, require_merged, sleeper=time.sleep, log=print):
    where = f"{repo + '#' if repo else 'PR #'}{pr}"

    # 0. the pair-order guard (compiler first, vault follows)
    if require_merged:
        rrepo, rpr = parse_ref(require_merged)
        data, err = gh_json(runner, rrepo, rpr, "state")
        if err or not data:
            log(f"✗ pair-order: cannot read prerequisite {require_merged}: {err}")
            return 2
        if data.get("state") != "MERGED":
            log(f"✗ pair-order: prerequisite {require_merged} is {data.get('state')}, not MERGED — "
                f"nothing done to {where} (the rhythm: compiler first, vault follows)")
            return 2
        log(f"✓ pair-order: {require_merged} is MERGED")

    # 1. wait for mergeability (the SC-0041 transient: UNKNOWN right after a push)
    for attempt in range(POLL_TRIES):
        data, err = gh_json(runner, repo, pr, "state,mergeable")
        if err or not data:
            log(f"✗ cannot read {where}: {err}")
            return 1
        state, mergeable = data.get("state"), data.get("mergeable")
        if state != "OPEN":
            log(f"✗ {where} is {state}, not OPEN — aborting (nothing done)")
            return 1
        if mergeable == "MERGEABLE":
            break
        if mergeable == "CONFLICTING":
            log(f"✗ {where} is CONFLICTING — resolve conflicts first (nothing done)")
            return 1
        log(f"… {where} mergeability {mergeable or 'UNKNOWN'} (GitHub recomputing) — waiting")
        sleeper(POLL_SLEEP)
    else:
        log(f"✗ {where} never reached MERGEABLE after {POLL_TRIES} polls — aborting (nothing done)")
        return 1

    # 2. merge (NEVER with gh's --delete-branch: deletion is gated on verified MERGED below)
    args = ["pr", "merge", pr, "--merge"]
    if repo:
        args = ["-R", repo, *args]
    code, _out, err = runner.run(args)
    if code != 0:
        log(f"✗ merge command failed for {where}: {err} — NO branch deletion attempted")
        return 1

    # 3. verify MERGED (the load-bearing step: re-read the PR; do not trust the merge command)
    sha = None
    for attempt in range(POLL_TRIES):
        data, err = gh_json(runner, repo, pr, "state,mergeCommit,headRefName")
        if data and data.get("state") == "MERGED":
            sha = (data.get("mergeCommit") or {}).get("oid")
            head = data.get("headRefName")
            log(f"✓ {where} MERGED — merge commit {sha}")
            break
        sleeper(POLL_SLEEP)
    else:
        log(f"✗ {where} did not reach MERGED state after the merge command — "
            f"NO branch deletion attempted; investigate before retrying")
        return 1

    # 4. only now: delete the head branch, if asked
    if delete_branch:
        repo_path = repo
        if not repo_path:
            code, out, _ = runner.run(["repo", "view", "--json", "nameWithOwner"])
            repo_path = json.loads(out).get("nameWithOwner") if code == 0 else None
        if not repo_path or not head:
            log("✗ cannot resolve repo/branch for deletion — branch left in place (merge already verified)")
            return 1
        code, _out, err = runner.run(["api", "-X", "DELETE", f"repos/{repo_path}/git/refs/heads/{head}"])
        if code != 0:
            log(f"✗ branch delete failed ({err}) — merge is verified; delete by hand when ready")
            return 1
        log(f"✓ head branch {head} deleted (after verified MERGED)")
    return 0


# ───────────────────────────── self-test (offline; a scripted fake gh) ─────────────────────────────

class FakeGh:
    def __init__(self, script):
        self.script = list(script)  # [(match_substring, (code, stdout, stderr)), …]
        self.calls = []

    def run(self, args):
        joined = " ".join(args)
        self.calls.append(joined)
        for i, (needle, resp) in enumerate(self.script):
            if needle in joined:
                self.script.pop(i)
                return resp
        raise AssertionError(f"unexpected gh call: {joined}")


def self_test():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(f"  {'✓' if cond else '✗'} {name}")
        ok = ok and cond

    V = lambda obj: (0, json.dumps(obj), "")
    nosleep = lambda _s: None

    # T1 happy path: mergeable → merge → MERGED → delete called exactly once, AFTER the verify
    gh = FakeGh([
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "MERGEABLE"})),
        ("pr merge 49 --merge", (0, "", "")),
        ("pr view 49 --json state,mergeCommit,headRefName",
         V({"state": "MERGED", "mergeCommit": {"oid": "abc123"}, "headRefName": "feat"})),
        ("repo view --json nameWithOwner", V({"nameWithOwner": "o/r"})),
        ("api -X DELETE repos/o/r/git/refs/heads/feat", (0, "", "")),
    ])
    rc = merge_one(gh, None, "49", True, None, nosleep, lambda *_: None)
    check("T1 happy path: exit 0, delete after verified MERGED",
          rc == 0 and sum("DELETE" in c for c in gh.calls) == 1
          and gh.calls.index(next(c for c in gh.calls if "DELETE" in c))
          > gh.calls.index(next(c for c in gh.calls if "mergeCommit" in c)))

    # T2 the SC-0041 trap: merge command fails → nonzero, delete NEVER called
    gh = FakeGh([
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "MERGEABLE"})),
        ("pr merge 49 --merge", (1, "", "GraphQL: Pull Request is not mergeable")),
    ])
    rc = merge_one(gh, None, "49", True, None, nosleep, lambda *_: None)
    check("T2 merge fails → abort, NO delete", rc == 1 and not any("DELETE" in c for c in gh.calls))

    # T3 mergeability UNKNOWN (recompute) → waits, then proceeds
    gh = FakeGh([
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "UNKNOWN"})),
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "UNKNOWN"})),
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "MERGEABLE"})),
        ("pr merge 49 --merge", (0, "", "")),
        ("pr view 49 --json state,mergeCommit,headRefName",
         V({"state": "MERGED", "mergeCommit": {"oid": "abc"}, "headRefName": "f"})),
    ])
    rc = merge_one(gh, None, "49", False, None, nosleep, lambda *_: None)
    check("T3 UNKNOWN → wait for recompute, then merge", rc == 0)

    # T4 CONFLICTING → abort before any merge attempt
    gh = FakeGh([
        ("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "CONFLICTING"})),
    ])
    rc = merge_one(gh, None, "49", True, None, nosleep, lambda *_: None)
    check("T4 CONFLICTING → abort, no merge, no delete",
          rc == 1 and not any("pr merge" in c or "DELETE" in c for c in gh.calls))

    # T5 pair-order: prerequisite OPEN → abort before ANY action on the target
    gh = FakeGh([
        ("-R o/c pr view 7 --json state", V({"state": "OPEN"})),
    ])
    rc = merge_one(gh, "o/v", "17", True, "o/c#7", nosleep, lambda *_: None)
    check("T5 pair-order guard: prerequisite not MERGED → exit 2, target untouched",
          rc == 2 and not any("pr merge" in c for c in gh.calls))

    # T6 merge command 'succeeds' but the PR never reads MERGED → nonzero, NO delete
    gh = FakeGh(
        [("pr view 49 --json state,mergeable", V({"state": "OPEN", "mergeable": "MERGEABLE"})),
         ("pr merge 49 --merge", (0, "", ""))]
        + [("pr view 49 --json state,mergeCommit,headRefName", V({"state": "OPEN"}))] * POLL_TRIES
    )
    rc = merge_one(gh, None, "49", True, None, nosleep, lambda *_: None)
    check("T6 verify-MERGED fails → abort, NO delete (the core rule)",
          rc == 1 and not any("DELETE" in c for c in gh.calls))

    print("ALL PASS" if ok else "SELF-TEST FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="merge a PR with the promoted merge discipline")
    ap.add_argument("ref", nargs="?", help="PR: '<number>' (current repo) or 'owner/repo#<number>'")
    ap.add_argument("--delete-branch", action="store_true",
                    help="delete the head branch — ONLY after verified MERGED")
    ap.add_argument("--require-merged", metavar="owner/repo#N",
                    help="pair-order guard: abort unless this PR is already MERGED (compiler first)")
    ap.add_argument("--self-test", action="store_true", help="run the offline state-machine check")
    args = ap.parse_args()

    if args.self_test:
        sys.exit(self_test())
    if not args.ref:
        ap.error("a PR ref is required (or --self-test)")
    repo, pr = parse_ref(args.ref)
    sys.exit(merge_one(GhRunner(), repo, pr, args.delete_branch, args.require_merged))


if __name__ == "__main__":
    main()
