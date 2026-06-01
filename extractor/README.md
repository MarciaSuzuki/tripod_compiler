# BHSA extractor sidecar (offline)

The Python escape-hatch noted in `CLAUDE.md` §5 / `docs/SOURCE_AND_SCALING.md`. It turns the
Hebrew source (BHSA / ETCBC, 2021) into the frozen, vendored, **pinned** artifacts the
coverage reconciliation (`docs/COVERAGE.md`) consumes. The TypeScript compiler core never
touches Python or BHSA — it reads only the pinned JSON these scripts emit.

**Fully offline.** Both scripts read local files only. `extract_bhsa.py` points Text-Fabric
at a **local** `tf/2021` feature directory via `tf.fabric.Fabric(locations=...)` — it never
calls `tf.app.use()` and never reaches GitHub.

## Outputs (vendored under `_spec/`, pinned in `_spec/pins.json` → `sources`)

| File | Producer | What it is |
|---|---|---|
| `_spec/source/ruth/P01.json` | `extract_bhsa.py` | the **source linguistic packet**: per-verse word checklist + the **R set** (referring expressions — proper/common nouns, pronouns, pronominal suffixes, and **implied verb-morphology subjects**) |
| `_spec/registry/ruth.aliases.json` | `build_aliases.py` | entity→surface **alias table** (consonantal Hebrew + English + referential forms), harvested from the wiki BCD frontmatter, augmented by the ETCBC places NER sheet |
| `_spec/registry/ruth.concepts.json` | `build_concept_figure_registry.py` | **Concept-Bank index** — `{code, name_slug, aliases[]}` per `CB_*`, harvested from the wiki `concepts/CODE-Slug.md` notes (SC-0018 R2: lets `tripod id-check` verify `CB_` reference-integrity + name-binding) |
| `_spec/registry/ruth.figures.json` | `build_concept_figure_registry.py` | **Figure-Registry index** — `{code, name_slug, aliases[]}` per `FIG_*`, harvested from the wiki `figures/CODE-Slug.md` notes (SC-0018 R2: the `FIG_` counterpart) |

## Reproduce (the exact pinned commands)

```bash
pip install -r extractor/requirements.txt   # text-fabric, pyyaml (offline once installed)

# 1) BHSA → source packet (R set). Offline: --tf-path is a LOCAL tf/2021 dir.
python3 extractor/extract_bhsa.py P01 \
  --tf-path ~/text-fabric-data/github/ETCBC/bhsa/tf/2021 \
  --places-ner ~/Dropbox/Mac/Downloads/bhsa/ner/sheets/places.yaml \
  --out _spec/source/ruth/P01.json

# 2) BCD frontmatter (+ NER sheet) → entity alias table
python3 extractor/build_aliases.py \
  --bcd ~/Dropbox/Mac/Downloads/ruth-pilot-b-wiki/bcd \
  --places-ner ~/Dropbox/Mac/Downloads/bhsa/ner/sheets/places.yaml \
  --out _spec/registry/ruth.aliases.json

# 3) Concept + Figure notes → CB/FIG registries (SC-0018 R2). Vault holds concepts/ + figures/.
python3 extractor/build_concept_figure_registry.py \
  --vault ~/Github/ruth-pilot-b-wiki \
  --out-concepts _spec/registry/ruth.concepts.json \
  --out-figures  _spec/registry/ruth.figures.json
```

Each script prints the output's `sha256`; the file hash (incl. trailing newline) is what
`_spec/pins.json` pins and `tripod check-drift` verifies. Output is deterministic (stable
ordering, `sort_keys`), so re-running on the same BHSA version reproduces the same hash.

The TF path is resolved from `--tf-path`, then `$BHSA_TF_PATH`, then a list of known local
locations (see `KNOWN_TF_PATHS` in `extract_bhsa.py`). No path ⇒ a clear error, never a download.

## R-set extraction rules (see `docs/COVERAGE.md` §"What BHSA gives us")

- **proper noun** (`sp=nmpr`) → `proper_noun`, kind from `nametype` (pers/gens→PERSON, topo→PLACE)
- **common noun** (`sp=subs`) → `common_noun` (kind-flexible)
- **substantival adjective** (`sp=adjv, pdp=subs`, e.g. Ephrathite) → `adjective_substantival` (minor)
- **independent pronoun** (`sp=prps/prde/prin`) → `pronoun` (minor; coreference-bound)
- **pronominal suffix** (`prs ∉ {absent,n/a}`) → an extra `suffix` referent (the his/her/their possessor)
- **implied subject** → a clause with **no explicit `Subj` phrase** whose finite predicate verb
  carries person morphology; flagged (`is_implied_subject`), with `likely_impersonal` set for the
  existential *vayhi* ("be") so the reviewer can dismiss it. *This is the class a human most often misses.*

Concern tiers feed the ledger buckets: `explicit` (proper/common nouns — high) ·
`implied_subject` (medium) · `minor` (pronouns, suffixes, substantival adjectives — bound/interpretive).
