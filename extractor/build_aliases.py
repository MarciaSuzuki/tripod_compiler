#!/usr/bin/env python3
"""
Build the vendored, pinned entity alias table for the coverage matcher.

Harvests the Book Context Document (BCD) frontmatter (beings / places / objects / times /
institutions) into a single machine-readable table keyed by entity id:

    { "B2": { "kind": "PERSON", "english": "Elimelech",
              "hebrew": "אֱלִימֶלֶךְ", "hebrew_cons": "אלימלך",
              "referential_forms": [...], "gender": "m" }, ... }

The coverage engine matches a BHSA proper/common noun to a map entity by CONSONANTAL
Hebrew (vowel/cantillation-stripped) — so "Kilion" (BHSA) ↔ "Chilion" (BCD) resolves via
כליון, immune to transliteration and niqqud differences. Latin english is a secondary key.

The ETCBC places NER sheet (bonus) contributes extra place surface spellings (occSpecs).

Offline: reads local markdown only. Output is deterministic for pinning by sha256.

Usage:
    python3 extractor/build_aliases.py \
        --bcd ~/Dropbox/Mac/Downloads/ruth-pilot-b-wiki/bcd \
        --places-ner ~/Dropbox/Mac/Downloads/bhsa/ner/sheets/places.yaml \
        --out _spec/registry/ruth.aliases.json
"""
import argparse
import hashlib
import json
import os
import re
import sys

ALIAS_SCHEMA_VERSION = "0.1.0"

# BCD subfolder → (code frontmatter key, coarse entity kind)
SECTIONS = {
    "beings": ("b-code", "PERSON"),
    "places": ("pl-code", "PLACE"),
    "objects": ("o-code", "THING"),
    "times": ("tm-code", "TIME"),
    "institutions": ("i-code", "INSTITUTION"),
}

HEBREW_LETTERS = re.compile(r"[א-ת]")  # bare consonants only
FEMALE_HINTS = ("wife", "woman", "women", "mother", "widow", "daughter", "bride", " she ", "her ")
MALE_HINTS = ("husband", "man ", "father", "son", "sons", " he ", "his ")


def consonantal(hebrew):
    """Strip niqqud + cantillation + spacing; keep only base Hebrew consonants."""
    if not hebrew:
        return ""
    return "".join(HEBREW_LETTERS.findall(hebrew))


def parse_frontmatter(text):
    """Return the YAML frontmatter dict from a markdown note (between the first two ---)."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end]
    import yaml  # type: ignore
    try:
        return yaml.safe_load(block) or {}
    except yaml.YAMLError:
        return None


def guess_gender(text):
    low = text.lower()
    f = sum(low.count(h) for h in FEMALE_HINTS)
    m = sum(low.count(h) for h in MALE_HINTS)
    if f > m and f > 0:
        return "f"
    if m > f and m > 0:
        return "m"
    return None


def resolve_gender(fm, text, kind):
    """Authoritative frontmatter `gender` if present (even explicit null ⇒ no gender); else a
    best-effort prose guess for PERSON entities. The prose guess is unreliable (it mis-read divine
    entities like YHWH as feminine off Naomi's pronouns) — an explicit `gender` field overrides it (SC-0011)."""
    if "gender" in fm:
        g = fm.get("gender")
        return g if g in ("m", "f") else None
    return guess_gender(text) if kind == "PERSON" else None


def harvest_bcd(bcd_dir):
    table = {}
    for sub, (code_key, kind) in SECTIONS.items():
        d = os.path.join(bcd_dir, sub)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if not fn.endswith(".md"):
                continue
            with open(os.path.join(d, fn), encoding="utf-8") as fh:
                text = fh.read()
            fm = parse_frontmatter(text)
            if not fm:
                continue
            code = fm.get(code_key)
            if not code:
                continue
            hebrew = fm.get("hebrew") or ""
            aliases = fm.get("aliases") or []
            if not isinstance(aliases, list):
                aliases = [aliases]
            heb_aliases = fm.get("hebrew_aliases") or []
            if not isinstance(heb_aliases, list):
                heb_aliases = [heb_aliases]
            heb_cons_aliases = sorted({c for c in (consonantal(h) for h in heb_aliases) if c})
            entry = {
                "kind": kind,
                "english": fm.get("english"),
                "hebrew": hebrew,
                "hebrew_cons": consonantal(hebrew),
                "referential_forms": [str(a) for a in aliases],
                "gender": resolve_gender(fm, text, kind),
                "appears_in": fm.get("appears-in") or [],
            }
            if heb_cons_aliases:
                entry["hebrew_cons_aliases"] = heb_cons_aliases
            table[str(code)] = entry
    return table


def fold_places_ner(table, ner_path):
    """Bonus: add ETCBC NER place occSpecs as extra consonantal spellings for PLACE matching."""
    if not ner_path:
        return {"loaded": False}
    ner_path = os.path.expanduser(ner_path)
    if not os.path.isfile(ner_path):
        return {"loaded": False}
    import yaml  # type: ignore
    with open(ner_path, encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    # index NER place spellings by consonantal skeleton
    ner_cons = {}
    for key, entry in data.items():
        if not isinstance(entry, dict):
            continue
        forms = [entry.get("name", "")] + list(entry.get("occSpecs", []))
        for f in forms:
            c = consonantal(f.replace("_", ""))
            if c:
                ner_cons.setdefault(c, key)
    # attach matching spellings to PLACE entities sharing a consonantal skeleton
    attached = 0
    for code, entry in table.items():
        if entry["kind"] != "PLACE" or not entry["hebrew_cons"]:
            continue
        extra = sorted({c for c in ner_cons if c and c in entry["hebrew_cons"]})
        if extra:
            entry.setdefault("ner_cons_aliases", []).extend(extra)
            attached += 1
    return {"loaded": True, "ner_place_spellings": len(ner_cons), "places_augmented": attached}


def main():
    ap = argparse.ArgumentParser(description="Harvest BCD frontmatter → vendored alias table")
    ap.add_argument("--bcd", required=True, help="path to ruth-pilot-b-wiki/bcd")
    ap.add_argument("--places-ner", help="optional ETCBC places NER sheet (yaml)")
    ap.add_argument("--out", default=os.path.join("_spec", "registry", "ruth.aliases.json"))
    args = ap.parse_args()

    bcd = os.path.expanduser(args.bcd)
    if not os.path.isdir(bcd):
        sys.exit(f"ERROR: BCD dir not found: {bcd}")

    table = harvest_bcd(bcd)
    ner_info = fold_places_ner(table, args.places_ner)

    out = {
        "schema": "tripod-entity-aliases",
        "schema_version": ALIAS_SCHEMA_VERSION,
        "book": "RUTH",
        "source": "ruth-pilot-b-wiki/bcd frontmatter (+ ETCBC places NER sheet)",
        "places_ner": ner_info,
        "counts": {
            "entities": len(table),
            "by_kind": {},
        },
        "entities": table,
    }
    for e in table.values():
        out["counts"]["by_kind"][e["kind"]] = out["counts"]["by_kind"].get(e["kind"], 0) + 1

    body = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True)
    sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(body + "\n")
    sys.stderr.write(
        f"[aliases] {len(table)} entities ({out['counts']['by_kind']}) → {args.out}\n"
        f"[aliases] places NER: {ner_info}\n[aliases] sha256: {sha}\n"
    )
    print(sha)


if __name__ == "__main__":
    main()
