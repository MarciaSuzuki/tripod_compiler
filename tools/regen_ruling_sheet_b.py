#!/usr/bin/env python3
"""Regenerate Section B + the drafter-remarks section of docs/SC-0063-BATCH-RULING-SHEET.md
from the 12 batch pericopes' latest-run fills.json, with FULL (untruncated) justifications.

SC-0064 §B prep, per Marcia's Option-A ruling (2026-06-12): the hand-prepared sheet clipped
32 of 189 justifications and all 12 remarks at a fixed width; the full text lives in each
run's fills.json. This script:
  1. derives every declared mint (axis, value, pericope, justification) from the fills,
  2. ASSERTS identity with the current sheet (value sets per axis, occurrence lists,
     header counts, and prefix-match of every current justification against the full text),
  3. rebuilds §B and the remarks section verbatim-from-fills, adds the four
     evaluator-surfaced margin notes (architect-verified against _spec), and
  4. leaves every other section of the sheet byte-identical (§C gains exactly one note line).

Re-runnable: derives everything from _working/; edits only the two regenerated regions.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "docs" / "SC-0063-BATCH-RULING-SHEET.md"

# Drafting order (Ruth then Jonah) — reproduces the sheet's occurrence-list order.
ORDER = ["P07", "P09", "P10", "P11", "P12", "P13", "P14",
         "J01", "J02", "J03", "J04", "J05"]

# Sheet's axis order (descending by declaration count at SC-0063 close).
AXES = ["proposition_kind", "role_in_scene_being", "arc_element",
        "scene_kind", "action", "tone_element"]

# Evaluator-surfaced, architect-verified margin notes (2026-06-12).
# Keyed by (axis, value); each renders as an indented ⚠ line under the checkbox.
MARGIN_NOTES = {
    ("proposition_kind", "PROPOSED"):
        "⚠ cross-axis (evaluator-surfaced, architect-verified): `PROPOSED` is already an "
        "approved `action` value — ticking here puts the same token on two axes.",
    ("proposition_kind", "RESOLVED"):
        "⚠ cross-axis (evaluator-surfaced, architect-verified): `RESOLVED` is already an "
        "approved `discourse_thread_state` value — ticking here puts the same token on two axes.",
    ("proposition_kind", "LAY_DOWN"):
        "⚠ dual-axis proposal (evaluator-surfaced, architect-verified): `LAY_DOWN` is also "
        "proposed on the `action` axis below (P09) — rule the two checkboxes together.",
    ("action", "LAY_DOWN"):
        "⚠ dual-axis proposal (evaluator-surfaced, architect-verified): `LAY_DOWN` is also "
        "proposed on the `proposition_kind` axis above (P09, P10) — rule the two checkboxes together.",
}

C_NOTE_AFTER_VALUE = "TM_NIGHT_UNTIL_MORNING"
C_NOTE = (
    "  - ⚠ near-twin (evaluator-surfaced, architect-verified): the A-1 ruling (2026-06-12) "
    "minted `TM_NIGHT_TO_MORNING` for P10's 3:14 morning departure — the same threshing-floor "
    "night, adjacent verses. Option: reuse the A-1 code here instead of minting a near-twin."
)


def load_declarations():
    """-> (decls, remarks): decls = [(axis, value, pericope, justification)] in encounter
    order; remarks = {pericope: full remark string}."""
    decls, remarks = [], {}
    for pid in ORDER:
        runs = sorted((ROOT / "_working" / pid / "drafts").glob("run-*"))
        assert runs, f"{pid}: no run dirs"
        data = json.loads((runs[-1] / "fills.json").read_text(encoding="utf-8"))
        remarks[pid] = data["remarks"]
        for fill in data["fills"]:
            for va in fill.get("vocabulary_additions") or []:
                decls.append((va["axis"], va["value"], pid, va["justification"]))
    return decls, remarks


def group(decls):
    """-> {axis: {value: [(pericope, justification), ...]}} preserving encounter order."""
    by = {}
    for axis, value, pid, just in decls:
        by.setdefault(axis, {}).setdefault(value, []).append((pid, just))
    return by


def parse_current_sheet(text):
    """Parse the current §B -> {axis: [(value, perilist, justification_as_printed)]}
    and the axis-header counts {axis: n}."""
    b_start = text.index("\n## B ")
    b_end = text.index("\n## Drafter remarks")
    section = text[b_start:b_end]
    axes, counts = {}, {}
    cur = None
    for line in section.splitlines():
        m = re.match(r"### Axis `(\w+)` — (\d+) proposed value\(s\)", line)
        if m:
            cur = m.group(1)
            counts[cur] = int(m.group(2))
            axes[cur] = []
            continue
        m = re.match(r"- \[ \] \*\*(\S+)\*\* \(([^)]*)\) — (.*)$", line)
        if m and cur:
            axes[cur].append((m.group(1), m.group(2), m.group(3)))
    return axes, counts


def assert_identity(by, sheet_axes, sheet_counts):
    """Every check that proves the derivation matches the sheet's source."""
    problems = []
    assert list(sheet_axes.keys()) == AXES, f"sheet axis order {list(sheet_axes.keys())}"
    derived_axes = set(by.keys())
    assert derived_axes == set(AXES), f"derived axes {derived_axes}"
    total_decl = total_uniq = 0
    for axis in AXES:
        vals = by[axis]
        n_decl = sum(len(v) for v in vals.values())
        total_decl += n_decl
        total_uniq += len(vals)
        # header count == declaration count
        if n_decl != sheet_counts[axis]:
            problems.append(f"{axis}: derived {n_decl} declarations, header says {sheet_counts[axis]}")
        # value set identical + sheet alphabetical
        sheet_vals = [v for v, _, _ in sheet_axes[axis]]
        if sheet_vals != sorted(sheet_vals):
            problems.append(f"{axis}: sheet not alphabetical")
        if sorted(vals.keys()) != sheet_vals:
            missing = set(sheet_vals) - set(vals)
            extra = set(vals) - set(sheet_vals)
            problems.append(f"{axis}: value-set mismatch missing={missing} extra={extra}")
            continue
        for value, perilist, printed_just in sheet_axes[axis]:
            occ = vals[value]
            derived_list = ", ".join(p for p, _ in occ)
            if derived_list != perilist:
                problems.append(f"{axis}/{value}: occurrence list derived ({derived_list}) != sheet ({perilist})")
            # the printed justification must be a prefix of the first occurrence's full text
            full = occ[0][1]
            if not full.startswith(printed_just.rstrip()):
                problems.append(f"{axis}/{value}: printed justification is not a prefix of fills text\n"
                                f"    sheet: {printed_just[:90]}…\n    fills: {full[:90]}…")
    print(f"derived: {total_decl} declarations · {total_uniq} unique values")
    assert total_decl == 232, f"expected 232 declarations, derived {total_decl}"
    assert total_uniq == 189, f"expected 189 unique values, derived {total_uniq}"
    return problems


def render_value_line(value, occ, axis):
    """One checkbox entry. Single distinct justification -> one line; several -> sub-lines
    labeled by pericope (collapsing consecutive identical texts onto one label list)."""
    perilist = ", ".join(p for p, _ in occ)
    distinct = []  # [(label_pids, justification)] preserving order
    for pid, just in occ:
        if distinct and distinct[-1][1] == just:
            distinct[-1][0].append(pid)
        elif any(j == just for _, j in distinct):
            for pids, j in distinct:
                if j == just:
                    pids.append(pid)
                    break
        else:
            distinct.append(([pid], just))
    lines = []
    if len(distinct) == 1:
        lines.append(f"- [ ] **{value}** ({perilist}) — {distinct[0][1]}")
    else:
        lines.append(f"- [ ] **{value}** ({perilist})")
        for pids, just in distinct:
            lines.append(f"  - {'/'.join(dict.fromkeys(pids))}: {just}")
    note = MARGIN_NOTES.get((axis, value))
    if note:
        lines.append(f"  - {note}")
    return lines


def render_section_b(by):
    out = ["## B — Declared L2 mints (the bounded-open growth; tick to promote, rename, or strike)", ""]
    out.append("Total declared mints: 232 declarations · 189 unique values across 6 axes "
               "(the checkboxes = the 189 unique values; a value declared more than once "
               "lists every declaring pericope).")
    out.append("")
    out.append("> Justifications below are verbatim-from-fills (regenerated for SC-0064 §B prep, "
               "2026-06-12 — the original sheet clipped 32 of them and showed only the first "
               "occurrence's text; ⚠ margin notes are evaluator-surfaced, architect-verified). "
               "Source per pericope: `_working/<id>/drafts/run-*/fills.json` (latest run).")
    out.append("")
    for axis in AXES:
        vals = by[axis]
        n_decl = sum(len(v) for v in vals.values())
        out.append(f"### Axis `{axis}` — {n_decl} declaration(s) · {len(vals)} unique value(s)")
        out.append("")
        for value in sorted(vals):
            out.extend(render_value_line(value, vals[value], axis))
        out.append("")
    return "\n".join(out).rstrip() + "\n"


def render_remarks(remarks):
    out = ["## Drafter remarks per pericope (verbatim, for context)", ""]
    for pid in ORDER:
        text = remarks[pid].replace("\n", "\n  ")  # indent any continuation lines
        out.append(f"- **{pid}:** {text}")
    return "\n".join(out) + "\n\n"


def main():
    text = SHEET.read_text(encoding="utf-8")
    decls, remarks = load_declarations()
    by = group(decls)
    sheet_axes, sheet_counts = parse_current_sheet(text)
    problems = assert_identity(by, sheet_axes, sheet_counts)
    if problems:
        print("IDENTITY CHECK FAILED — sheet not rewritten:")
        for p in problems:
            print("  ✗", p)
        sys.exit(1)
    print("identity checks: all passed (value sets, occurrence lists, header counts, "
          "justification prefixes)")

    b_start = text.index("\n## B ") + 1
    remarks_start = text.index("\n## Drafter remarks") + 1
    c_start = text.index("\n## C ") + 1
    new_text = (text[:b_start] + render_section_b(by) + "\n"
                + render_remarks(remarks) + "\n" + text[c_start:])

    # §C margin note (exactly one line, after the named proposal's checkbox)
    lines = new_text.splitlines(keepends=True)
    for i, line in enumerate(lines):
        if line.startswith(f"- [ ] **{C_NOTE_AFTER_VALUE}**"):
            lines.insert(i + 1, C_NOTE + "\n")
            break
    else:
        print(f"✗ §C anchor {C_NOTE_AFTER_VALUE} not found")
        sys.exit(1)
    SHEET.write_text("".join(lines), encoding="utf-8")
    print(f"wrote {SHEET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
