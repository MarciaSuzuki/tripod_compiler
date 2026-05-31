# Coverage reconciliation — participant / place / object completeness

> **Status: SHIPPED for P01 (the proving ground).** Built on the offline BHSA frozen extract
> (`docs/SOURCE_AND_SCALING.md`). This is the single highest-value fidelity feature: it's where the
> discipline machinery buys **truth** (does the map match the text?), not just **legality** (is the
> map schema-valid?). Pilot-2 lane.
>
> **Run it:** `tripod coverage P01` (text) · `tripod coverage P01 --out <ledger.md>` (full ledger
> into the audit trail) · `--json` for the structured ledger. Acceptance proven in
> `tests/coverage-p01.test.ts` against the real pinned packet; engine unit tests in
> `tests/coverage.test.ts`.
>
> **Implementation:** the offline extractor `extractor/extract_bhsa.py` freezes R into the pinned
> `_spec/source/ruth/P01.json`; `extractor/build_aliases.py` freezes the entity↔surface bridge into
> `_spec/registry/ruth.aliases.json` (BCD frontmatter + the places NER sheet). The TS engine is
> `src/engine/coverage.ts`; the ledger renderer is `src/audit/coverage-ledger.ts`.
>
> **P01 result:** `47/47 explicit referents accounted for · 5 implied subjects flagged · 0 unanchored
> entities · 15 source nouns to tick` — block-clean.

## The core idea

The participants, places, and objects of a passage are a **finite set fixed by the source
text**. BHSA enumerates that set. So "did we miss anyone? invent anyone? misplace anyone?"
becomes a **set-difference check**, not an act of human vigilance.

- **R** = the source referent set (from BHSA, per verse).
- **M** = the map's entity-mention set (every `B#/PL#/O#/TM#` usage, with verse anchors).
- Report `R \ M` (possible omissions) and `M \ R` (possible additions), reconciled through the
  map's `referential_form` links.

The reviewer then audits a short **exceptions list** instead of re-reading the whole text.

## What BHSA gives us as referents

BHSA marks every referring expression, including ones with nothing on the page to point at:
- **proper nouns** — Elimelech, Naomi, Bethlehem, Moab
- **common nouns** — famine, bread, sandal, field
- **pronouns & pronominal suffixes** — "her husband", "them"
- **implied subjects in verb morphology** — a 3ms verb encodes a "he" actor with no written
  noun. *This is the class a human reviewer most often misses.*

## The asymmetry (hold these as different strengths of claim)

| Question | Check | Confidence |
|---|---|---|
| **Nothing added** (no invented entity) | every `B#/PL#/O#` has ≥1 verse anchor whose BHSA text can host it; an unanchored entity is a red flag | **High — near-mechanical** |
| **No explicit entity missing** | `R \ M` over proper + explicit nouns | **High** |
| **No implied participant missing** | verb-morphology subject with no being in scope → flag | **Medium-high — flagged, not auto-resolved** |
| **Nothing misplaced** | each mention's `verse_anchor` falls in a verse where BHSA has that expression | **High for anchor integrity** (role-correctness is judgment) |
| **Objects/concepts complete** | list every BHSA noun per verse as a checklist; which earn `O#`/`CB_`/figure is interpretive | **Medium — reviewer ticks; tool can't decide** |

> Do not let one green "coverage" light blur these. "Nothing added" is near-airtight;
> "nothing missing" is explicit (airtight) + implied (flagged) + interpretive (checklist).

## The deliverable: a coverage reconciliation ledger (per pericope)

Emitted by the validator using the frozen BHSA packet. A table:

> every BHSA referring expression (verse · surface form · POS · morphology)
> → **the map entity + `referential_form` it resolves to, or `UNMAPPED`**

sorted into three buckets:

- **MATCHED** — source expression ↔ map entity (green).
- **UNMAPPED_SOURCE** — in the text, not in the map → *possible omission*. Sub-tag
  `explicit` (high concern) / `implied_subject` (medium) / `minor` (function words, etc.).
- **UNANCHORED_ENTITY** — in the map, no source expression at its anchors → *possible
  hallucination* (red, near-block).

Plus a one-line **coverage score**, e.g.:
```
P01 coverage: 47/47 explicit referents accounted for · 2 implied subjects flagged · 0 unanchored entities
```
That sentence *is* the reviewer's confidence, made specific. Their task shrinks from "verify
everything" to "adjudicate the exceptions."

## Algorithm sketch
1. From the BHSA packet, build `R`: one record per referring expression
   `{verse, surface, pos, morph(person/number/gender), is_implied_subject}`.
2. From the FOR_MODEL, build `M`: one record per entity-mention
   `{entity_id, verse_anchor, referential_form, role}`.
3. **Match** each `R` record to an `M` record by verse + referential_form compatibility +
   morphology agreement (gender/number must not contradict).
4. Emit the three buckets + score. Surface `M`-records whose anchor has no compatible `R`
   record as `UNANCHORED_ENTITY`.
5. Write the ledger into the pericope's audit/COMPILATION-LOG trail.

## Honest limits (keep separate in the reviewer's mind)
- **Coreference attribution.** Coverage can prove *something* maps to "he" at 3:15; not always
  that it's Ruth vs Boaz. Tool flags the ambiguity (record it via `referential_form` +
  held-open-ambiguity); the human resolves. Pronoun-heavy passages: coverage high, *attribution*
  needs a person.
- **Semantic additions.** "No invented *entity*" is strong; "no invented *claim*" (a
  proposition asserting what the text doesn't) is the deeper problem — entity-coverage ≠
  meaning-coverage. That belongs to `READING_QUALITY.md`, the human gate.
- BHSA-feature extraction quality and the place/object/concept boundary are conventional —
  checked against the BCD/spec, not ground truth.

## Open items (when source ingestion lands)
- [x] Define `R`-record extraction from the BHSA packet (which features; how implied subjects are detected).
  → `extractor/extract_bhsa.py`: proper/common nouns (`sp=nmpr/subs`), substantival participles
  (`sp=verb,pdp=subs`, e.g. "the judges") + adjectives, pronouns, pronominal suffixes (`prs`), and
  **implied subjects** = a clause with no `Subj` phrase whose finite predicate verb carries person
  morphology (`vayhi` existentials flagged `likely_impersonal`).
- [x] Define referential_form ↔ surface-form compatibility (the matching key).
  → `src/engine/coverage.ts matchScore()`: proper nouns match **only** their named entity via
  **consonantal Hebrew** (Kilion↔Chilion via כליון) or Latin fallback; unnamed common nouns map via a
  Hebrew lexical hit or a **whole-word** `referential_form`/alias keyword (`UNNAMED_MAN`⊇"man"), under
  gender non-contradiction. Two thresholds: permissive *anchoring* (≥10) vs evidence-based *mapping* (≥30).
- [x] Decide block vs warn thresholds.
  → `UNANCHORED_ENTITY` (non-abstract) blocks; `UNMAPPED_SOURCE` **proper noun** blocks; common-noun
  *checklist*, *implied*, *minor*, and abstract `TH_`/`CB_` overlays warn (interpretive — reviewer ticks).
- [x] Where the ledger is stored and how the reviewer signs off on exceptions.
  → `tripod coverage <P> --out <file>` writes a `type: "coverage-ledger"` wiki note (the three bucket
  tables + score) alongside the COMPILATION-LOG; sign-off on the exceptions list stays human
  (`docs/READING_QUALITY.md`, the fidelity ceiling).
- [ ] **Scale beyond P01:** extract P02–P14 packets (`extractor/extract_bhsa.py P0n`) and run coverage
  across the corpus; add `PL_HA_ARETZ` (and any other map-referenced but BCD-absent codes) to the BCD so
  "the land" stops landing on the tick list.
