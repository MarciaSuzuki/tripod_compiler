#!/usr/bin/env python3
"""
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


def harvest(coll_dir, code_key):
    """Harvest one flat note collection into { CODE: {code, name_slug, aliases[]} }."""
    table = {}
    for fn in sorted(os.listdir(coll_dir)):
        if not fn.endswith(".md"):
            continue
        path = os.path.join(coll_dir, fn)
        with open(path, encoding="utf-8") as fh:
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
        }
    return table


def write_registry(table, out_path, kind, schema, book):
    out = {
        "schema": schema,
        "schema_version": REGISTRY_SCHEMA_VERSION,
        "book": book.upper(),
        "kind": kind,
        "source": f"{book.lower()}-pilot-b-wiki/{kind.lower()}s frontmatter (code + name_slug + aliases)",
        "counts": {"entries": len(table)},
        "entries": table,
    }
    body = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    # sha of the FILE bytes (incl. the trailing newline) — this is what `_spec/pins.json` pins and
    # what `tripod check-drift` (sha256OfFile) verifies. Match it exactly.
    sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(body)
    sys.stderr.write(f"[reg] {len(table)} {kind} entries → {out_path}\n[reg] sha256 (file): {sha}\n")
    return sha


def main():
    ap = argparse.ArgumentParser(description="Harvest concepts/ + figures/ → vendored CB/FIG registries")
    ap.add_argument("--book", default="ruth",
                    help="book key (lowercase) → output book label + default out-paths. Default: ruth.")
    ap.add_argument("--vault",
                    help="path to the book's wiki vault (holds concepts/ + figures/). Omit to scaffold EMPTY "
                         "registries for a book without a Concept Bank / Figure Registry yet (SC-0033, Jonah Phase 1).")
    ap.add_argument("--out-concepts", help="default: _spec/registry/<book>.concepts.json")
    ap.add_argument("--out-figures", help="default: _spec/registry/<book>.figures.json")
    args = ap.parse_args()

    book = args.book.lower()
    out_paths = {
        "concepts": args.out_concepts or os.path.join("_spec", "registry", f"{book}.concepts.json"),
        "figures": args.out_figures or os.path.join("_spec", "registry", f"{book}.figures.json"),
    }

    vault = os.path.expanduser(args.vault) if args.vault else None
    if vault and not os.path.isdir(vault):
        sys.exit(f"ERROR: vault dir not found: {vault}")  # explicit path must be valid (typo guard)

    shas = {}
    for sub, (code_key, kind, schema) in COLLECTIONS.items():
        d = os.path.join(vault, sub) if vault else None
        if d and os.path.isdir(d):
            table = harvest(d, code_key)
        else:
            reason = f"no {sub}/ dir in vault" if vault else "no --vault given"
            sys.stderr.write(f"[reg] {reason}: scaffolding an EMPTY {kind} registry for book '{book}'\n")
            table = {}
        shas[sub] = write_registry(table, out_paths[sub], kind, schema, book)

    # print both shas (concepts then figures), one per line, for the pin step
    print(shas["concepts"])
    print(shas["figures"])


if __name__ == "__main__":
    main()
