#!/usr/bin/env python3
"""
SC-0037 — GLOBAL / canon-wide. Harvests the vault's canon-wide concepts/ + figures/ notes into ONE
`_spec/registry/concepts.json` + `figures.json` (codes unique across the whole Bible; per-entry
`appears_in` derived from each note's `appears-in` pericope list, mapped to books via PERICOPE_BOOK).
One code per concept/figure canon-wide, so the Facilitator anchors them consistently everywhere they
appear. The pinned global registries are reproducible from these notes (verified byte-identical).
(`build_aliases.py` — the per-book CAST: beings/places/objects — is separate and stays per-book.)

Build the vendored, pinned Concept-Bank and Figure-Registry indices for the SC-0018
cross-artifact ID-alignment checker (`tripod id-check`).

The entity alias table (`ruth.aliases.json`, from `build_aliases.py`) covers only the concrete
coverage namespaces B/PL/O/TM/I — it has NO `CB_`/`FIG_` entries. So in v1, every `CB_`/`FIG_`
code the checker saw was "UNVERIFIABLE_NO_REGISTRY". This script vendors the two missing registries
so reference-integrity + name-binding can apply to `CB_`/`FIG_` too (SC-0018 refinement R2).

Harvests, from the wiki vault, two flat note collections:

    concepts/CODE-Slug.md   frontmatter `cb-code:`,  optional `aliases:` list  → ruth.concepts.json
    figures/CODE-Slug.md    frontmatter `fig-code:`, optional `aliases:` list  → ruth.figures.json

Per entry:  { "code", "name_slug" (= filename minus the "CODE-" prefix), "aliases": [...] }

The map writes a `CB_`/`FIG_` wikilink as `[[CODE-Slug]]` / `[[CODE-Slug|Display]]`; the canonical
code is the bare `CODE` (before the first hyphen). The `name_slug` is the rest of the filename — the
slug the map is expected to carry. The frontmatter `aliases:` are the legacy named forms (e.g.
`CB_GATE_LEGAL_VENUE`) that an older-generation map slug might still match — kept so name-binding
accepts a known historical alias rather than false-flagging it.

Offline: reads local markdown only. Output is deterministic (stable ordering, `sort_keys`) for
pinning by sha256 — same vendor+pin discipline as `build_aliases.py` / `ruth.aliases.json`.

Book-general (SC-0033): `--book` (default ruth) sets the output book label + default out-paths.
Omit `--vault` (or a missing concepts//figures/ subdir) to scaffold EMPTY registries for a book
whose Concept Bank / Figure Registry doesn't exist yet.

Usage:
    # Ruth (byte-identical to the pinned registries):
    python3 extractor/build_concept_figure_registry.py --book ruth \
        --vault ~/Github/ruth-pilot-b-wiki \
        --out-concepts _spec/registry/ruth.concepts.json \
        --out-figures  _spec/registry/ruth.figures.json
    # A fresh book before its registries exist (empty scaffolds → _spec/registry/<book>.{concepts,figures}.json):
    python3 extractor/build_concept_figure_registry.py --book jonah
"""
import argparse
import hashlib
import json
import os
import sys

REGISTRY_SCHEMA_VERSION = "0.1.0"

# collection subfolder → (frontmatter code key, the registry "kind" label)
COLLECTIONS = {
    "concepts": ("cb-code", "CONCEPT", "tripod-concept-bank"),
    "figures": ("fig-code", "FIGURE", "tripod-figure-registry"),
}


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


# Pericope-prefix → book. The `appears-in` field lists pericopes (e.g. P07, J01); the GLOBAL bank's
# appears_in is canon-wide (book-level). Extend this map as each new book is added.
PERICOPE_BOOK = {"P": "RUTH", "J": "JONAH", "E": "ESTHER", "T": "PSALMS"}


def books_from_appears_in(fm):
    """Map a note's `appears-in` pericope list (e.g. [P07, J01]) to its canon-wide book tags (SC-0037)."""
    out = []
    for p in fm.get("appears-in") or []:
        bk = PERICOPE_BOOK.get(str(p).strip()[:1].upper())
        if bk and bk not in out:
            out.append(bk)
    return sorted(out)


def harvest(coll_dir, code_key):
    """Harvest one canon-wide note collection into { CODE: {code, name_slug, aliases[], appears_in[]} }."""
    table = {}
    for fn in sorted(os.listdir(coll_dir)):
        if not fn.endswith(".md"):
            continue
        with open(os.path.join(coll_dir, fn), encoding="utf-8") as fh:
            text = fh.read()
        fm = parse_frontmatter(text)
        if not fm:
            continue
        code = fm.get(code_key)
        if not code:
            continue
        code = str(code)
        base = fn[:-3]  # strip ".md"
        # name_slug = filename minus the "CODE-" prefix (the slug the map carries after the code).
        prefix = code + "-"
        name_slug = base[len(prefix):] if base.startswith(prefix) else base
        aliases = fm.get("aliases") or []
        if not isinstance(aliases, list):
            aliases = [aliases]
        aliases = [str(a) for a in aliases if a is not None and str(a).strip()]
        if code in table:
            sys.stderr.write(f"[reg] WARNING: duplicate code {code} ({fn}) — keeping first\n")
            continue
        table[code] = {
            "code": code,
            "name_slug": name_slug,
            "aliases": aliases,
            "appears_in": books_from_appears_in(fm),
        }
    return table


def write_global(table, out_path, kind, schema):
    """Write ONE canon-wide registry (SC-0037): global codes, per-entry appears_in (book tags)."""
    by_book = {}
    for e in table.values():
        for b in e["appears_in"]:
            by_book[b] = by_book.get(b, 0) + 1
    out = {
        "schema": schema,
        "schema_version": "0.2.0",
        "scope": "canon-wide",
        "kind": kind,
        "source": "global Bible-wide bank (per-book concept/figure notes, canon-numbered; SC-0037)",
        "counts": {"entries": len(table), "by_book": by_book},
        "entries": table,
    }
    body = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    # sha of the FILE bytes (incl. trailing newline) — what `_spec/pins.json` pins + `check-drift` verifies.
    sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(body)
    sys.stderr.write(f"[reg] {len(table)} {kind} entries ({by_book}) → {out_path}\n[reg] sha256 (file): {sha}\n")
    return sha


def main():
    ap = argparse.ArgumentParser(
        description="Harvest the canon-wide concepts/ + figures/ notes → the GLOBAL CB/FIG registries (SC-0037)")
    ap.add_argument("--vault", required=True,
                    help="path to the wiki vault holding the canon-wide concepts/ + figures/ notes")
    ap.add_argument("--out-concepts", default=os.path.join("_spec", "registry", "concepts.json"))
    ap.add_argument("--out-figures", default=os.path.join("_spec", "registry", "figures.json"))
    args = ap.parse_args()

    vault = os.path.expanduser(args.vault)
    if not os.path.isdir(vault):
        sys.exit(f"ERROR: vault dir not found: {vault}")

    shas = {}
    for sub, (code_key, kind, schema) in COLLECTIONS.items():
        d = os.path.join(vault, sub)
        if not os.path.isdir(d):
            sys.exit(f"ERROR: collection dir not found: {d}")
        table = harvest(d, code_key)
        out_path = args.out_concepts if sub == "concepts" else args.out_figures
        shas[sub] = write_global(table, out_path, kind, schema)

    # print both shas (concepts then figures), one per line, for the pin step
    print(shas["concepts"])
    print(shas["figures"])


if __name__ == "__main__":
    main()
