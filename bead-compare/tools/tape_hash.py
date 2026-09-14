#!/usr/bin/env python3
"""Reproduce Bead Compare's tape hash (Version.tape_sha256) for a tape.json.

Bead Compare does not hash the bytes of tape.json. It parses the file and
hashes the *canonical JSON* of the parsed tape, so the hash survives export,
import and re-formatting. The canonical form is what JavaScript's
JSON.stringify gives for an object built in this order:

    codebook_hash, frame_rate, u, f, pause_unit (when present), mock (only when true)

with no spaces and no trailing newline. `sha256sum tape.json` therefore does
not match the value shown in "Detalhes técnicos" and in the report files;
this script does. The audio hash needs no script: `sha256sum audio.wav`.

Usage:
    python3 tools/tape_hash.py path/to/tape.json [more tape.json ...]

Prints one line per file: the hex digest, a space, and the path.
Standard library only.
"""

import hashlib
import json
import math
import sys


def _number(value):
    """A JSON number the way JSON.stringify writes it (an integral float is written without a fraction)."""
    if isinstance(value, bool):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            return None  # JSON.stringify writes NaN and Infinity as null
        if value.is_integer() and abs(value) < 1e21:
            return int(value)
    return value


def canonical_tape(raw):
    """The parsed tape in Bead Compare's key order; unknown fields are dropped."""
    out = {}
    out["codebook_hash"] = raw["codebook_hash"]
    out["frame_rate"] = _number(raw["frame_rate"])
    out["u"] = [_number(v) for v in raw["u"]]
    out["f"] = [_number(v) for v in raw["f"]]
    if "pause_unit" in raw and raw["pause_unit"] is not None:
        out["pause_unit"] = _number(raw["pause_unit"])
    if raw.get("mock") is True:
        out["mock"] = True
    return out


def canonical_json(raw):
    return json.dumps(canonical_tape(raw), separators=(",", ":"), ensure_ascii=False)


def tape_hash(raw):
    return hashlib.sha256(canonical_json(raw).encode("utf-8")).hexdigest()


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    for path in argv[1:]:
        with open(path, "r", encoding="utf-8") as fh:
            raw = json.load(fh)
        print(f"{tape_hash(raw)}  {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
