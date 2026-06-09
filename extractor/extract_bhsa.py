#!/usr/bin/env python3
"""
BHSA → Tripod source-linguistic-packet extractor (offline sidecar).

Implements docs/SOURCE_AND_SCALING.md (frozen, vendored per-pericope packet) and the
R-set ("referring expressions") that docs/COVERAGE.md reconciles against the FOR_MODEL.

FULLY OFFLINE: points Text-Fabric at a LOCAL BHSA feature directory via tf.fabric.Fabric.
It never calls tf.app.use() and never touches GitHub. Resolve the path via --tf-path,
the BHSA_TF_PATH env var, or one of the known local locations below.

Usage:
    python3 extractor/extract_bhsa.py P01 \
        --out _spec/source/ruth/P01.json \
        --tf-path ~/text-fabric-data/github/ETCBC/bhsa/tf/2021 \
        --places-ner ~/Dropbox/Mac/Downloads/bhsa/ner/sheets/places.yaml

Output is deterministic (stable ordering, sorted keys) so the packet can be pinned by
sha256 exactly like the other vendored spec artifacts (_spec/pins.json).
"""
import argparse
import hashlib
import json
import os
import sys

EXTRACTOR_VERSION = "0.1.0"
PACKET_SCHEMA_VERSION = "0.1.0"
BHSA_VERSION = "2021"

# Known local BHSA feature dirs (offline). First existing one wins if --tf-path/env unset.
KNOWN_TF_PATHS = [
    "~/text-fabric-data/github/ETCBC/bhsa/tf/2021",
    "~/Dropbox/Mac/Downloads/bhsa/tf/2021",
    "~/Documents/bhsa-master/tf/2021",
]

# Features the extractor reads. Confirmed present in tf/2021 (116 features).
FEATURES = (
    "otype book chapter verse label "
    "g_word_utf8 voc_lex_utf8 lex gloss sp pdp nametype "
    "gn nu ps vt vs prs prs_gn prs_nu prs_ps function typ rela"
)

# Finite verb tenses encode a subject person/number/gender in morphology.
FINITE_VT = {"perf", "impf", "wayq", "impv", "juss", "coho"}
# "no suffix" sentinels for the prs feature.
NO_SUFFIX = {"absent", "n/a", "", None}
# Pronoun parts-of-speech (independent).
PRONOUN_SP = {"prps", "prde", "prin"}


def resolve_tf_path(cli_path):
    candidates = []
    if cli_path:
        candidates.append(cli_path)
    if os.environ.get("BHSA_TF_PATH"):
        candidates.append(os.environ["BHSA_TF_PATH"])
    candidates.extend(KNOWN_TF_PATHS)
    for c in candidates:
        p = os.path.expanduser(c)
        if os.path.isdir(p) and any(f.endswith(".tf") for f in os.listdir(p)):
            return p
    sys.exit(
        "ERROR: no local BHSA tf/2021 feature dir found. Pass --tf-path or set BHSA_TF_PATH.\n"
        "Tried: " + ", ".join(candidates)
    )


def load_tf(tf_path):
    from tf.fabric import Fabric  # offline; no network
    TF = Fabric(locations=tf_path, silent="deep")
    api = TF.load(FEATURES, silent="deep")
    if not api:
        sys.exit(f"ERROR: Text-Fabric failed to load features from {tf_path}")
    return api


def feat(F, name, node, default=None):
    """Read a feature, normalizing BHSA's 'NA'/'unknown' to None."""
    v = getattr(F, name).v(node)
    if v in ("NA", "unknown", "none", None):
        return default
    return v


def nametype_kinds(nametype):
    """Map a BHSA nametype (comma-set like 'pers,gens,topo') to coarse entity kinds."""
    if not nametype:
        return []
    kinds = []
    for t in nametype.split(","):
        t = t.strip()
        if t in ("pers", "gens"):
            kinds.append("PERSON")
        elif t == "topo":
            kinds.append("PLACE")
    # de-dup, preserve order
    seen = set()
    out = []
    for k in kinds:
        if k not in seen:
            seen.add(k)
            out.append(k)
    return out


def half_verse_label(F, L, w):
    hvs = L.u(w, "half_verse")
    if not hvs:
        return None
    lab = F.label.v(hvs[0])
    return lab.lower() if lab else None


def classify_word_referent(F, w):
    """Return (referent_class, kind_candidates, concern) for a word's own referent, or None."""
    sp = F.sp.v(w)
    pdp = F.pdp.v(w)
    if sp == "nmpr":
        kinds = nametype_kinds(F.nametype.v(w)) or ["PERSON"]
        return ("proper_noun", kinds, "explicit")
    if sp == "subs":
        # common noun: kind-flexible; the engine leans on lexical + morphology evidence.
        return ("common_noun", ["PERSON", "PLACE", "THING", "TIME"], "explicit")
    if sp == "verb" and pdp == "subs":
        # substantival participle functioning as a noun (e.g. הַשֹּׁפְטִים "the judges",
        # הַקֹּצְרִים "the harvesters", הַגֹּאֵל "the redeemer") — a real, on-the-page participant
        # referent the map tracks. NOT the bare infinitive/finite verb (those keep pdp=verb).
        return ("participle_substantival", ["PERSON", "THING"], "explicit")
    if sp == "adjv" and pdp == "subs":
        # substantival adjective (Ephrathite; but also "first/second/other") — interpretive
        # whether a distinct referent, so kept minor (conservative).
        return ("adjective_substantival", ["PERSON", "PLACE", "THING"], "minor")
    if sp in PRONOUN_SP:
        # coreference-bound; visible on the page, lower omission risk → minor.
        return ("pronoun", ["PERSON", "THING"], "minor")
    return None


def build_referents(api, vnodes):
    F, L = api.F, api.L
    referents = []
    rid = 0

    def new_id():
        nonlocal rid
        rid += 1
        return f"R{rid:03d}"

    for v in vnodes:
        ref = f"{F.chapter.v(v)}:{F.verse.v(v)}"
        for w in L.d(v, "word"):
            surface = F.g_word_utf8.v(w)
            lex = F.lex.v(w)
            gloss = F.gloss.v(w)
            hv = half_verse_label(F, L, w)
            hv_ref = f"{ref}{hv}" if hv else ref

            # 1) the word's own referent (proper/common/pronoun/substantival-adj)
            cls = classify_word_referent(F, w)
            if cls:
                rclass, kinds, concern = cls
                referents.append({
                    "ref_id": new_id(),
                    "verse": ref,
                    "half_verse": hv_ref,
                    "surface": surface,
                    "lex": lex,
                    "gloss": gloss,
                    "pos": F.sp.v(w),
                    "referent_class": rclass,
                    "kind_candidates": kinds,
                    "referent_kind": kinds[0] if kinds else "UNKNOWN",
                    "nametype": F.nametype.v(w),
                    "person": feat(F, "ps", w),
                    "number": feat(F, "nu", w),
                    "gender": feat(F, "gn", w),
                    "is_implied_subject": False,
                    "concern": concern,
                    "word_node": w,
                })

            # 2) a pronominal suffix on this word = an additional (possessor/object) referent
            prs = F.prs.v(w)
            if prs not in NO_SUFFIX:
                referents.append({
                    "ref_id": new_id(),
                    "verse": ref,
                    "half_verse": hv_ref,
                    "surface": surface,
                    "lex": lex,
                    "gloss": gloss,
                    "pos": "prs_suffix",
                    "referent_class": "suffix",
                    "kind_candidates": ["PERSON", "THING"],
                    "referent_kind": "PERSON",
                    "nametype": None,
                    "person": feat(F, "prs_ps", w),
                    "number": feat(F, "prs_nu", w),
                    "gender": feat(F, "prs_gn", w),
                    "is_implied_subject": False,
                    "concern": "minor",
                    "host_surface": surface,
                    "word_node": w,
                })

        # 3) implied subjects: a clause with no explicit Subj phrase + a finite predicate verb
        for cl in L.d(v, "clause"):
            funcs = [F.function.v(ph) for ph in L.d(cl, "phrase")]
            if "Subj" in funcs:
                continue
            predverb = None
            for ph in L.d(cl, "phrase"):
                if F.function.v(ph) in ("Pred", "PreC", "PreO", "PtcO"):
                    for w in L.d(ph, "word"):
                        if F.sp.v(w) == "verb":
                            predverb = w
            if predverb is None:
                continue
            vt = F.vt.v(predverb)
            ps = F.ps.v(predverb)
            if vt not in FINITE_VT or ps not in ("p1", "p2", "p3"):
                continue
            hv = half_verse_label(F, L, predverb)
            hv_ref = f"{ref}{hv}" if hv else ref
            lex = F.lex.v(predverb)
            referents.append({
                "ref_id": new_id(),
                "verse": ref,
                "half_verse": hv_ref,
                "surface": F.g_word_utf8.v(predverb),
                "lex": lex,
                "gloss": F.gloss.v(predverb),
                "pos": "verb",
                "referent_class": "implied_subject",
                "kind_candidates": ["PERSON", "THING"],
                "referent_kind": "PERSON",
                "nametype": None,
                "person": feat(F, "ps", predverb),
                "number": feat(F, "nu", predverb),
                "gender": feat(F, "gn", predverb),
                "is_implied_subject": True,
                "concern": "implied_subject",
                # advisory: the impersonal "vayhi/it was" existential takes no participant subject
                "likely_impersonal": lex == "HJH[",
                "clause_type": F.typ.v(cl),
                "word_node": predverb,
            })
    return referents


def build_verses(api, vnodes):
    """Per-verse word checklist + clause structure (satisfies the SOURCE_AND_SCALING packet)."""
    F, L, T = api.F, api.L, api.T
    out = []
    for v in vnodes:
        ref = f"{F.chapter.v(v)}:{F.verse.v(v)}"
        words = []
        for w in L.d(v, "word"):
            words.append({
                "occ": w,
                "surface": F.g_word_utf8.v(w),
                "lex": F.lex.v(w),
                "voc_lex": F.voc_lex_utf8.v(w),
                "gloss": F.gloss.v(w),
                "sp": F.sp.v(w),
                "pdp": F.pdp.v(w),
                "nametype": F.nametype.v(w),
                "person": feat(F, "ps", w),
                "number": feat(F, "nu", w),
                "gender": feat(F, "gn", w),
                "vt": feat(F, "vt", w),
                "vs": feat(F, "vs", w),
                "prs": None if F.prs.v(w) in NO_SUFFIX else F.prs.v(w),
                "function": F.function.v(L.u(w, "phrase")[0]) if L.u(w, "phrase") else None,
                "half_verse": (lambda h: f"{ref}{h}" if h else ref)(half_verse_label(F, L, w)),
            })
        out.append({
            "verse": ref,
            "text": T.text(v).strip(),
            "words": words,
        })
    return out


def load_place_aliases(path):
    """Bonus: fold the ETCBC places NER sheet into a surface-form alias table."""
    if not path:
        return {}
    path = os.path.expanduser(path)
    if not os.path.isfile(path):
        return {}
    try:
        import yaml  # type: ignore
    except ImportError:
        return {"_note": f"places NER sheet at {path} not loaded (pyyaml unavailable)"}
    with open(path, encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    aliases = {}
    for key, entry in data.items():
        if not isinstance(entry, dict):
            continue
        aliases[key] = {
            "name": entry.get("name"),
            "kind": entry.get("kind"),
            "occSpecs": entry.get("occSpecs", []),
        }
    return aliases


def verse_nodes_for(api, start, end, bhsa_book):
    F = api.F
    sc, sv = start
    ec, ev = end
    out = []
    for v in F.otype.s("verse"):
        if F.book.v(v) != bhsa_book:
            continue
        c, n = F.chapter.v(v), F.verse.v(v)
        if (c, n) >= (sc, sv) and (c, n) <= (ec, ev):
            out.append(v)
    return sorted(out)


def main():
    ap = argparse.ArgumentParser(description="Offline BHSA → Tripod source packet extractor")
    ap.add_argument("pericope", help="e.g. P01")
    ap.add_argument("--out", help="output JSON path (default: _spec/source/ruth/<P>.json)")
    ap.add_argument("--tf-path", help="local BHSA tf/2021 dir (offline). Else BHSA_TF_PATH / known paths.")
    ap.add_argument("--places-ner", help="optional ETCBC places NER sheet (yaml) for the alias table")
    ap.add_argument("--pericopes", default=os.path.join(os.path.dirname(__file__), "pericopes.json"))
    args = ap.parse_args()

    with open(args.pericopes, encoding="utf-8") as fh:
        peri = json.load(fh)
    if args.pericope not in peri["pericopes"]:
        sys.exit(f"ERROR: unknown pericope {args.pericope}. Known: {list(peri['pericopes'])}")
    pdef = peri["pericopes"][args.pericope]
    bhsa_book = peri.get("bhsa_book") or peri["book"].title()  # SC-0032: BHSA book name; "RUTH" → "Ruth"

    tf_path = resolve_tf_path(args.tf_path)
    sys.stderr.write(f"[extract] loading BHSA {BHSA_VERSION} offline from {tf_path}\n")
    api = load_tf(tf_path)

    vnodes = verse_nodes_for(api, pdef["start"], pdef["end"], bhsa_book)
    if not vnodes:
        sys.exit(f"ERROR: no verses found for {args.pericope} ({pdef['bcv']})")

    referents = build_referents(api, vnodes)
    verses = build_verses(api, vnodes)
    place_aliases = load_place_aliases(args.places_ner)

    counts = {
        "referents": len(referents),
        "explicit": sum(1 for r in referents if r["concern"] == "explicit"),
        "implied_subject": sum(1 for r in referents if r["concern"] == "implied_subject"),
        "minor": sum(1 for r in referents if r["concern"] == "minor"),
        "by_class": {},
    }
    for r in referents:
        counts["by_class"][r["referent_class"]] = counts["by_class"].get(r["referent_class"], 0) + 1

    packet = {
        "schema": "tripod-source-packet",
        "schema_version": PACKET_SCHEMA_VERSION,
        "source": "BHSA",
        "bhsa_version": BHSA_VERSION,
        "extractor_version": EXTRACTOR_VERSION,
        "book": peri["book"],
        "pericope": args.pericope,
        "bcv": pdef["bcv"],
        "generated_offline": True,
        # portable source label (NOT the absolute local path) so the pinned packet is machine-independent
        "tf_source": "ETCBC/bhsa tf/2021 (local, offline)",
        "counts": counts,
        "referents": referents,
        "verses": verses,
        "place_aliases": place_aliases,
    }

    body = json.dumps(packet, ensure_ascii=False, indent=2, sort_keys=True)
    sha = hashlib.sha256(body.encode("utf-8")).hexdigest()

    out_path = args.out or os.path.join("_spec", "source", peri["book"].lower(), f"{args.pericope}.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(body + "\n")

    sys.stderr.write(
        f"[extract] {args.pericope} {pdef['bcv']}: {counts['referents']} referents "
        f"({counts['explicit']} explicit, {counts['implied_subject']} implied, {counts['minor']} minor)\n"
        f"[extract] wrote {out_path}\n[extract] sha256: {sha}\n"
    )
    print(sha)


if __name__ == "__main__":
    main()
