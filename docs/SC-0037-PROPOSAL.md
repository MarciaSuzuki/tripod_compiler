# SC-0037 (PROPOSAL — APPROVED 2026-06-09) — Global Concept Bank + Figure Registry

> **APPROVED by Marcia (+ evaluator review) 2026-06-09**, with three amendments folded in (below).
> Builder now builds against this; evaluator verifies against §8 acceptance. Marcia ruled the architecture:
> the **Concept Bank AND the Figure Registry are global / canon-wide** — one code per concept (and per
> figure) across the whole Bible.
>
> **Amendments folded in at approval (evaluator findings):**
> 1. **The migration is a MOVE + renumber, not just an add.** SC-0036 bootstrapped Jonah's registry
>    **compiler-side** (`_spec/registry/jonah-bcd/concepts|figures/`), whereas Ruth's canonical notes are
>    **vault**-side (`concepts/` + `figures/`). So globalizing = **move Jonah's renumbered CB/FIG notes into
>    the vault bank + delete the compiler copies** (one source, no drift) — see §6.
> 2. **The Jonah CAST home is a named deferred item.** Globalizing CB/FIG leaves Jonah's *cast* notes
>    (beings/places/objects, at `_spec/registry/jonah-bcd/`) stranded compiler-side, inconsistent with
>    Ruth's vault-canonical cast. The cast correctly stays **per-book** — but *where it lives* is a parallel
>    reconciliation, **deferred + named** (the same "where does book #2 live in a Ruth-named vault" question
>    as decision §7.3; rule them together).
> 3. **Split compiler-vendored vs vault-notes explicitly.** The JSON registry FILES are compiler-**vendored**
>    (a re-pin; no vault-drift check) ; the canonical NOTES are in the **vault** (a writeback). §6/§8's
>    "vault writeback of the global bank" means **the notes**, not the JSON — keep them distinct so the build
>    doesn't write back the wrong artifact.
> - Grounding correction: Ruth figures are **115 codes with gaps, max `FIG_0195`** (retired slots at
>   8–10, 19–23, …) — *not* contiguous; "continue from the **max**" (FIG_0196) is right and correctly avoids
>   resurrecting retired codes. Bonus confirmed: globalizing **fixes a latent bug** — `id-align` loads the
>   registry with no book arg, so today a Jonah check silently resolves against *Ruth's* registry; one global
>   bank removes the ambiguity.
>
> This is the design, for: evaluator review → Marcia approval → builder build → evaluator verify.
> **Sequencing (load-bearing): this must land BEFORE J01 graduates from `_working/` into the Jonah
> fixtures**, so the fixtures never bake in codes we already know will change. Surfaced by the J01
> bootstrap (SC-0036). Pointers: `[[tripod-global-concept-bank]]`, `[[tripod-sc-id-collisions]]` (SC-0036).

---

## 1. The problem (why this is needed now)

The registries were built per-book and **restart their numbering per book**, so the codes collide and a
recurring concept can't be anchored across books:

| | Ruth (`ruth.*`) | Jonah J01 (`jonah.*`, SC-0036) | Collision |
|---|---|---|---|
| Concept Bank | `CB_0001`–`CB_0050` (50) | `CB_0001` Evil-of-Nineveh, `CB_0002` Before-the-Face-of-YHWH | **`CB_0001` = two different concepts** |
| Figure Registry | `FIG_0001`–`FIG_0195` (115) | `FIG_0001`–`FIG_0003` | **`FIG_0001` = two different figures** |

This breaks the Facilitator's load-bearing requirement that a theological concept (*hesed*, the presence
of God, steadfast love) carry **one consistent code everywhere it appears** in the canon. Per-book codes
make the same concept look different in Ruth vs Jonah.

## 2. The ruling + the key distinction

**Ruled:** the Concept Bank (`CB_`) and the Figure Registry (`FIG_`) are **global / canon-wide** — one
code per concept/figure across the whole Bible; a recurring concept **reuses** its code; a genuinely-new
concept **continues** the global numbering.

**The distinction that scopes this (important):** the Layer-3 registry has two kinds, and only the second
goes global:

- **Per-book CAST** — beings (`B`), places (`PL`), objects (`O`), times (`TM`), institutions (`I`).
  Jonah's cast ≠ Ruth's cast (different people, places). The **alias table stays per-book**
  (`ruth.aliases.json`, `jonah.aliases.json`) — **unchanged by this proposal.**
- **Canon-wide CONCEPTS + FIGURES** — `CB_`/`FIG_`. Theological concepts and literary figures recur
  across books. **These become global.** ← the whole change.

## 3. Proposed model

**One global Concept Bank + one global Figure Registry**, replacing the per-book `*.concepts.json` /
`*.figures.json`:

- **`_spec/registry/concepts.json`** and **`_spec/registry/figures.json`** — a single canon-wide file
  each. Every entry: `{ code, name_slug, aliases[], appears_in: [books] }`. A concept used in both Ruth
  and Jonah is **one entry** with `appears_in: [RUTH, JONAH]`.
- **Ruth is the base — Ruth's codes do NOT change.** Ruth shipped first; its `CB_0001`–`0050` /
  `FIG_0001`–`0195` are in the gold fixtures and 6 merged pericopes. Renumbering Ruth would be enormously
  disruptive for zero benefit. So Ruth's codes become the global base; new books **continue** from the max.
- **A new book's genuinely-new concept/figure continues the global counter; a recurring one reuses the
  existing code.** Reuse-vs-new is a **human (Marcia) exegetical call**; the tool *suggests* (see §5).
- **Maps/FOR_MODELs reference the global codes;** a pericope's `active-concepts` / `active-figures`
  frontmatter just lists which global codes that pericope uses (the per-book "view" = a filter on `appears_in`).

*(Alternative considered — keep per-book files but enforce globally-unique codes — rejected: it can't
cleanly represent a recurring concept (which book's file owns *hesed* if it's in both?), so reuse breaks.
The single global bank is the only model that supports reuse, the whole point of the ruling.)*

## 4. The renumber (Jonah J01)

Continue after Ruth's maxima (`CB_0050`, `FIG_0195`):

| J01 code (provisional) | Concept / figure | Proposed global code | Reuse-or-new |
|---|---|---|---|
| `CB_0001` | Evil-of-Nineveh | **`CB_0051`** | new (no Ruth equivalent) |
| `CB_0002` | Before-the-Face-of-YHWH | **`CB_0052`** | new (Ruth has Divine-Name/Hand-of-YHWH, not "the presence/face") |
| `FIG_0001` | Word-of-YHWH-Came-Formula | **`FIG_0196`** | new (distinct from Ruth's `FIG_0050` Wayhi-Bimei chronicle formula) |
| `FIG_0002` | Away-from-Before-YHWH-Refrain | **`FIG_0197`** | new |
| `FIG_0003` | Going-Down-Descent | **`FIG_0198`** | new |

**The builder's read is "all 5 new"** (no Ruth duplicate on inspection) — but the reuse-vs-new call per
code is **Marcia's** (§7 decision). The renumber touches: the J01 map (`active-concepts`/`figures` + §5
flags + the §3C/§4 references), its FOR_MODEL, the Jonah BCD notes, and the global bank entries.

## 5. The cross-canon consistency check (a new verifier — the `id-check` sibling)

A deterministic check (the "Facilitator keeps concepts consistent canon-wide" requirement, made real):

1. **Registered?** every `CB_`/`FIG_` a map uses resolves to an entry in the global bank (else ERROR) —
   extends the existing reference-integrity check from per-book to global.
2. **Suggest-reuse (the new-book guard):** when a new book introduces a concept/figure, compare its
   `name_slug` / `aliases` against the global bank and **surface a likely match** ("`Before-the-Face-of-YHWH`
   resembles `CB_00xx Hand-of-YHWH` — reuse, or genuinely distinct?") so the human reuses rather than
   silently duplicates. Diagnostic only — it suggests; Marcia rules.
3. **Local variation:** where a book genuinely diverges from a shared concept, record the divergence
   (a referential/`appears_in`-scoped note) rather than minting a near-duplicate code.

## 6. Migration — what changes (build, readers, pins, vault)

- **Builder** (`extractor/build_concept_figure_registry.py`): drop the per-book `--book` split for CB/FIG;
  harvest a **canon-wide** `concepts/` + `figures/` note collection into the two global files. (The BCD /
  alias builder for the per-book cast is untouched.)
- **Readers** (`src/reader/source-packet.ts`): `loadConceptRegistry(book)` / `loadFigureRegistry(book)` →
  `loadConceptRegistry()` / `loadFigureRegistry()` (global, no book param). `src/engine/id-align.ts`
  `buildFlagRegistry(...)` consumes the global. ~handful of call-sites.
- **Pins** (`_spec/pins.json`): `registry/ruth.concepts.json` + `registry/jonah.concepts.json` →
  one `registry/concepts.json` (+ `figures.json`); re-pin. Delete the per-book CB/FIG pins.
- **Vault structure:** the canon-wide `concepts/` + `figures/` notes — currently in `ruth-pilot-b-wiki/`.
  Decision §7: do they stay in that folder (which simply becomes the canon bank, the vault name historical),
  or move to a canon-level home? Lightest = keep the folders, add Jonah's `CB_0051+`/`FIG_0196+` notes there.
- **`tripod` CLI:** a new subcommand (e.g. `tripod concept-check` or fold into `id-check`) for §5.

## 7. Decisions for Marcia / the evaluator

1. **Ruth as the immutable base** (no Ruth renumber; new books continue from the max) — confirm. *(Strongly recommended.)*
2. **Reuse-vs-new for J01's 5 codes** — the builder's read is all-new (→ `CB_0051/0052`, `FIG_0196/0197/0198`). Confirm, or flag any as a reuse of an existing Ruth code.
3. **Vault home for the global bank** — keep the existing `concepts/`+`figures/` folders as the canon bank (lightest), or a canon-level relocation? (Ties to the still-open "where does a 2nd book live in a Ruth-named vault" question.)
4. **The suggest-reuse heuristic (§5.2)** — name/slug similarity is the v1; is that sufficient, or should it also key on Hebrew lemma / a concept gloss?
5. **Scope confirm:** CB **and** FIG both go global (ruled); the per-book cast (B/PL/O/TM/I) stays per-book (unchanged). Confirm the split.

## 8. Sequencing + acceptance

- **Before J01 graduates** from `_working/` → fixtures (so fixtures carry final codes). Jonah's codes stay provisional until this lands.
- **Acceptance:** one global `concepts.json` + `figures.json`, codes canon-unique (Ruth base + Jonah continued); J01 renumbered + still lint-0 / coverage-anchoring / closed-lists-holding; the consistency check green on Ruth + J01 and demonstrably *suggests* a reuse on a planted near-duplicate; Ruth board byte-identical green (Ruth codes unchanged); `check-drift` clean on the new pins; vault writeback of the global bank.

---

*Net: one bank, one code per concept/figure, canon-wide — so the Facilitator anchors meaning consistently
across the whole Bible. Surfaced at book two, which is exactly when it should be solved.*
