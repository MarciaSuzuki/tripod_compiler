#!/usr/bin/env python3
"""Independent verifier for the regenerated ruling sheet (SC-0064 §B prep).

Proves, without sharing the generator's rendering code path:
  1. every justification printed in §B is BYTE-IDENTICAL to a fills.json justification
     for that (axis, value, pericope) — no truncation, no paraphrase;
  2. every fills.json declaration is represented in §B (completeness, both directions);
  3. every drafter remark is byte-identical to the fills.json remark (verbatim at last);
  4. all sections other than §B / remarks are byte-identical to the git-HEAD sheet,
     except §C which differs by exactly one added ⚠ note line.

Exit 0 = all proven; any failure prints and exits 1.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "docs" / "SC-0063-BATCH-RULING-SHEET.md"
ORDER = ["P07", "P09", "P10", "P11", "P12", "P13", "P14",
         "J01", "J02", "J03", "J04", "J05"]

fails = []


def fail(msg):
    fails.append(msg)


def load_fills():
    decls, remarks = set(), {}
    counts = {}
    for pid in ORDER:
        runs = sorted((ROOT / "_working" / pid / "drafts").glob("run-*"))
        data = json.loads((runs[-1] / "fills.json").read_text(encoding="utf-8"))
        remarks[pid] = data["remarks"]
        for fill in data["fills"]:
            for va in fill.get("vocabulary_additions") or []:
                key = (va["axis"], va["value"], pid, va["justification"])
                decls.add(key)
                counts[key] = counts.get(key, 0) + 1
    return decls, counts, remarks


def parse_new_sheet(text):
    """-> printed = set of (axis, value, pericope, justification) reconstructed from §B."""
    b = text[text.index("\n## B "):text.index("\n## Drafter remarks")]
    printed = set()
    axis = None
    value = None
    perilist = None
    pending_multi = False
    for line in b.splitlines():
        m = re.match(r"### Axis `(\w+)`", line)
        if m:
            axis = m.group(1)
            continue
        m = re.match(r"- \[ \] \*\*(\S+)\*\* \(([^)]*)\)(?: — (.*))?$", line)
        if m:
            value, perilist = m.group(1), m.group(2)
            if m.group(3) is not None:
                for pid in perilist.split(", "):
                    printed.add((axis, value, pid, m.group(3)))
                pending_multi = False
            else:
                pending_multi = True
            continue
        m = re.match(r"  - ([A-Z0-9/]+): (.*)$", line)
        if m and pending_multi:
            for pid in m.group(1).split("/"):
                printed.add((axis, value, pid, m.group(2)))
            continue
    return printed


def main():
    text = SHEET.read_text(encoding="utf-8")
    decls, counts, remarks = load_fills()
    printed = parse_new_sheet(text)

    # 1+2: set equality on (axis, value, pericope, justification)
    decl_keys = decls
    missing = decl_keys - printed
    phantom = printed - decl_keys
    for k in sorted(missing):
        fail(f"declared but not printed: {k[0]}/{k[1]} ({k[2]})")
    for k in sorted(phantom):
        fail(f"printed but not in fills: {k[0]}/{k[1]} ({k[2]}) — {k[3][:60]}…")
    print(f"§B fidelity: {len(printed)} printed (axis,value,pericope,justification) tuples "
          f"== {len(decl_keys)} declared — {'EQUAL' if not missing and not phantom else 'MISMATCH'}")

    # 3: remarks verbatim
    rsec = text[text.index("\n## Drafter remarks"):text.index("\n## C ")]
    ok = 0
    for pid in ORDER:
        m = re.search(rf"^- \*\*{pid}:\*\* (.*?)(?=^\- \*\*|\Z)", rsec, re.M | re.S)
        if not m:
            fail(f"remark missing for {pid}")
            continue
        got = m.group(1).strip().replace("\n  ", "\n")
        if got != remarks[pid].strip():
            fail(f"remark for {pid} differs from fills.json")
        else:
            ok += 1
    print(f"remarks verbatim: {ok}/{len(ORDER)}")

    # 4: section invariance vs git HEAD
    old = subprocess.run(["git", "show", "HEAD:docs/SC-0063-BATCH-RULING-SHEET.md"],
                         capture_output=True, text=True, cwd=ROOT).stdout

    def sections(t):
        parts = {}
        bounds = [(m.start(), m.group(1)) for m in re.finditer(r"^(## [A-F].*|# .*|## Drafter.*)$", t, re.M)]
        bounds.append((len(t), "EOF"))
        for (s, name), (e, _) in zip(bounds, bounds[1:]):
            parts[name.split(" — ")[0]] = t[s:e]
        return parts

    old_s, new_s = sections(old), sections(text)
    for name in old_s:
        if name.startswith("## B") or name.startswith("## Drafter"):
            continue  # the regenerated regions
        o, n = old_s[name], new_s.get(name, "")
        if name.startswith("## C"):
            delta = [l for l in n.splitlines() if l not in o.splitlines()]
            if len(delta) == 1 and delta[0].lstrip().startswith("- ⚠ near-twin"):
                print("§C: exactly one added line (the near-twin note) — confirmed")
            else:
                fail(f"§C delta unexpected: {delta}")
        elif o != n:
            fail(f"section {name!r} changed but must be invariant")
    invariant = [k for k in old_s if not k.startswith(("## B", "## Drafter", "## C"))]
    print(f"invariant sections checked: {', '.join(invariant)}")

    if fails:
        print("\nVERIFY FAILED:")
        for f in fails:
            print("  ✗", f)
        sys.exit(1)
    print("\nALL VERIFIED ✓")


if __name__ == "__main__":
    main()
