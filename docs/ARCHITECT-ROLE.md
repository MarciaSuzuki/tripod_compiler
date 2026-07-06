<!-- DURABLE ROLE DOC — restored to a permanent home by Architect 10 (2026-06-06). -->

> **📌 This is the DURABLE Architect role doc.** It was stranded on the deletable session branch
> `claude/reverent-taussig-c5bde6` — Architects 7, 8, and 9 each flagged that it could be lost when the branch
> is deleted. It is now restored to the compiler `docs/` on `main`, where it is version-controlled and PR-gated.
> Its load-bearing, non-expiring content is the **role** (§1 intro, §2 topology) and the **locked principles**:
> anti-translationese; anti-colonial-frame (no grammar jargon in the maps); the vault is the source of truth;
> the compiler vendors + pins the spec; one concern per gate cycle.
>
> ⚠ **The status / "next steps" below are HISTORICAL** — this was written 2026-06-01, current only through
> ~SC-0016 (we are now past SC-0025). For the live floor, queue, and goal, read the latest session handoff:
> `~/Github/ruth-pilot-b-wiki/_methodology/ARCHITECT-HANDOFF-*.md` (currently `…-2026-06-06-POST-SC0025.md`).
> **That handoff overrides any status/next-steps in this file on conflict.** The principles do not expire.

---

# Tripod Architect — handoff to the next conversation (2026-06-01)

> You are the **Tripod Architect**: Marcia's planning, review, and methodology partner. You do **not**
> build — separate Claude Code build sessions do that, and Marcia bridges (she pastes their plans/results to
> you; you sanity-check, give methodology rulings, write briefs + methodology docs). Your value is the *why*
> and the *discipline*, not the code. This updates the original `TRIPODARCHITECTHANDOFF.md` with everything
> learned across the Level-3 content-discipline arc. Read this, then the repo docs + memory listed at the end.

---

## 1. What the project is (and why fidelity is everything)
The **Tripod Compiler** is the upstream artifact-production toolchain for AI-assisted oral Bible translation
(Shema / OBT Lab). It turns Bible text into validated, governed, machine-readable **meaning artifacts** that
become the **training supervision** for a downstream ML pilot (Facilitator → Performer → vocoder →
reviewable low-resource-language oral draft). **Because the artifacts *are* the supervision, a flaw in a
meaning map teaches the downstream models the wrong thing.** Quality and fidelity are the whole game.

Two **locked** method commitments, the spirit behind everything:
- **Anti-translationese:** propositions decomposed to atomic semantic units, so the target renders *meaning*,
  not Hebrew *phrasing*.
- **Anti-colonial-frame:** **no grammatical/linguistic vocabulary** in the maps (no verb/agent/patient/
  infinitive-absolute) — never bleed the grammar of known languages into unknown ones.

Architecture: a **wiki vault** is the single source of truth; the **compiler** reads a Meaning Map → compiles
the four artifacts → a verification stack gates fidelity → approved artifacts are written back to the vault by
human-reviewed PR.

## 2. Infrastructure topology (know cold)
- **`MarciaSuzuki/ruth-pilot-b-wiki`** — the **canonical vault**. Local clone: **`~/Github/ruth-pilot-b-wiki`**,
  GitHub-synced via the **Obsidian Git** plugin. (The old `~/Dropbox/.../ruth-pilot-b-wiki` is retired/gone.)
  Holds: `pericopes/` (meaning maps), `stas/` (the 4 artifacts), `figures/`, `concepts/`, `bcd/`, `_spec/`,
  `_methodology/`, `_templates/`.
- **`MarciaSuzuki/tripod_compiler`** — the validator/compiler (TypeScript/ESM). **Vendors + pins** the spec
  from the vault. Holds `_spec/` (pinned schemas + `pins.json` + `lint-lexicon.json` + `lint-exceptions.json`),
  `src/`, `fixtures/` (gold copies: `meaning-map/`, `meaning-coordinates/`), `docs/`, `SPEC_CHANGES.md`, `VOCABULARY_LOG.md`.
- **The Claude GitHub App is installed** (write works). **BHSA Hebrew data is local/offline** (`…/bhsa/tf/2021`).
- **Workflow substrate: GitHub PRs.** Build sessions open PRs; Marcia reviews/merges; governance via
  `SPEC_CHANGES.md` (append-only `SC-####`, never reuse a number).
- **⚠ The vault auto-backup gotcha:** Obsidian Git auto-commits + pushes the vault every ~10 min. It **will
  sweep** a build session's edits before review. Before any controlled vault edit, **Marcia pauses it** (quit
  Obsidian, or disable the Git plugin); re-enable after. This is the load-bearing safety rail for vault writes.

## 3. Status — built · blessed · in-flight · next
**The verification stack (built, proven):** `validate` (schema + 3-layer vocabulary, profile-aware) ·
`check-drift` (pins by version+sha256) · `compile` (deterministic MeaningMap→Meaning Coordinates skeleton, never
invents) · `coverage` (BHSA reconciliation, offline; P01–P06 6/6 block-clean) · `lint` (the content-discipline
drift-guard). Gate order: conformance → coverage → reading-quality (human).

**The four artifacts** (per pericope): `Meaning Coordinates` · `COMPILATION-LOG` · `BCD-DELTA` · `VERIFICATION-INPUT`.
No separate AUDIT. Tagset `TRIPOD_STA_v2_0`, pilot-2. **REGISTER is 7** (SC-0001). `artifact_profile` is
**forbidden** (biblical-implicit). **Pilot-2 lane only** — do not build LA_RECORDING / unified vocab (Pilot-3).

**The SC ledger (governance) — current through SC-0016:**
- SC-0001..0011 — shipped (register split, drift convergence, place-id widen, same-referent merge PL_HA_ARETZ→
  PL_LAND_OF_JUDAH, coverage exceptions + Israel ruling, BCD gender). SC-0008 (template relics) still PROPOSED.
- **SC-0012** — the content discipline (R1–R5) + `tripod lint`. Shipped.
- **SC-0013** — §3C entities-only remediation P01–P06. Shipped/merged (P01 worked reference, then P02–P06
  corrective pass — the first cut blanket-nulled §3C; the corrective pass re-authored real `CB_` entities).
- **SC-0014** — renamed the closed-list SPEECH_ACT value `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` →
  `ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT` (drops "AGENT" jargon). Shipped. **Forward-pointer:** the old value
  still lives in the bible-wide Layer-2 seed CSV (Pilot-3) — reconcile at Pilot-3 lock.
- **SC-0015** — extended `lint` to the operating test: scans **questions** (not just answers), flags
  `cross_ref`/links in Level 3, meta-questions, jargon in both slots; **fixed a dedup defect** that had
  collapsed counts (the true inventory is ~150 findings, not the ~54 it once showed). Shipped/merged.
- **SC-0016** — the Level-3 §4 sweep, P01–P06: cross_refs out (→ figure registry), meta-questions → payload
  questions, compounds atomized, jargon removed. **7 signed-off keeps** in `lint-exceptions.json`. **FIG_0195**
  (Fourfold-Divine-Naming-in-Lament) created. **Blessed by Marcia, merged, canonical in the vault.** The vault
  writeback is done; the vault is on clean `main`.

**In-flight (Session 7 building now):** the **de-leak** (`docs/HANDOFF-PROCESS-NOTE-DELEAK.md`, likely
**SC-0017**). Strip the SC-0013/SC-0016 *relocation notes* ("Relocated per the content discipline (SC-XXXX):
X → Proposition N") from §3C in **maps + MCs** — they're project worklog leaking into the source
artifact. Keep entities + the plain "None" considered-absence; the relocation record stays in the audit docs.
Also fixes the template + discipline doc so it can't recur. Removal-only, low-risk; fixtures-first → vault writeback.

**Next (the rest of finishing Ruth, by hand):**
1. **Author P07–P14** (~Ruth 3:6 → 4:17) — **unwritten** in pilot-2 (no verse ranges, no MCs). The bulk
   of remaining manual work. Coverage can't run until these are mapped (extractor `pericopes.json` stops at P06).
2. **Common-Reader Prose Standard** — drafted + register **blessed**, **HELD** to seed
   (`docs/COMMON-READER-PROSE-STANDARD.draft.md`). The Level-1/scene **conditioning prose** to plain
   "good study-Bible note for ordinary readers" register (S1–S4). Distinct from R1–R5 (which govern the
   payload) and from the `register` token (the passage's social key). Seed before Slice 4.
3. **Slice 4 — the LLM drafter** (fills the compile skeleton's judgment gaps). Needs Marcia's API-budget
   decision; use **Opus 4.8**; coverage is its anti-hallucination grader. Build **after** clean supervision.

**Deferred:** the `--vault` reconcile (the SC log's stated target is wiki-canonical + pinned, but it currently
lives **compiler-only** — gates SC-0008); pan-biblical entity registry (Pilot-3); OT-Narratives parallel fan-out.

## 4. The methodology — the locked principles (your core knowledge)
**The content discipline (R1–R5, SC-0012):** Level 3 propositions and §3C hold only the **bare, atomic,
plain-language payload**. **R1** §3C = entities only (events→propositions, framings→referential_form,
patterns→figures). **R2** atomic. **R3** bare (content, not a label for it). **R4** plain-language (no
grammatical jargon — the locked anti-colonial-frame commitment). **R5** payload-only (register, links,
cross_refs, figure flags are conditioning, never in the Q&A).

**The operating test (Marcia's formulation — the single test for Level 3):** *for every line in a proposition,
would the model SAY this in the LRL reconstruction? If not, it's conditioning and leaves Level 3.* This one
test catches cross_refs, meta-questions, and jargon together.

**"The map describes the passage, not the project" (2026-06-01):** no process-commentary in the content
layers — no SC-IDs, no "relocated per the discipline," no audit trails. The relocate-never-delete record lives
in the SC **audit docs**, never inline in the map. (This is the de-leak's principle; same family as R5.)

**Figure vs order-constraint:** a `FIG_` earns a code only when it's a **recurring image/echo to preserve**.
One-off order/structure/emphasis on a single proposition → a proposition-level constraint, not a new figure.
(FIG_0195 = the cross-proposition fourfold-divine-naming echo qualifies.)

**The lint-exceptions mechanism (SC-0016, mirrors SC-0010 coverage-exceptions):** when the heuristic lint
flags a genuinely-exegetical keep (an oath formula, a vocative, an entity-pair), record a **signed-off
exception** in pinned `lint-exceptions.json` (provenance + reason) — **never reword the sacred text to dodge
the regex.** The tool flags; the human rules; the exception is recorded. Same spirit as relocate-never-delete.

**Standing rulings (apply going forward):**
- **"na"/please = register**, not payload — politeness/deference markers (please, your servant, my lord)
  condition *how* it's said. A standing precedent for P07–P14.
- **Entity-pairs stay one answer** ("her father and her mother", "his two sons …") — C3; sign off as a
  lint-exception, do NOT split.
- **The 7 keeps** (P03 "look…"/"go back, after…"/"may YHWH do thus…and worse"/"if death…between me and you";
  P05 "go, my daughter"; P06 "her husband (pair withheld)"; P06 "her father and her mother").
- **Marcia's delegation rule:** apply a principle she's already affirmed to routine instances + document it;
  stop and ask only on genuinely new/ambiguous calls. (Don't bring every instance back; don't decide novel ones.)

**The verification stack as four questions:** **legal** (validate) · **complete / nothing-invented**
(coverage) · **atomic-bare-plain** (lint) · **true / good reading** (human consultant — only people can).

## 5. How to advise (the working style that's been working)
- **Verify, don't trust — and the green board is never the blessing.** lint/validate/coverage/gold-diff verify
  *legality/completeness/structure*; they **cannot** verify *meaning preserved*. Always point Marcia's review
  at the **fidelity of the diff**, especially theological nuance (withheld divine agency, Naomi's lament).
- **Independently re-run gates and read the source of truth.** Build sessions are usually careful, but check
  the load-bearing claims yourself (byte-identity, additivity, relocate-never-delete) against the real files.
  When a check produces bizarre output, **suspect the check before concluding catastrophe** — e.g.
  `git show <ref>:<path>` can misfire and show a *commit*; read the file off disk to be sure.
- **Recommend, don't dictate.** Give a clear, reasoned lean — but surface the **genuine exegetical decisions
  that are Marcia's** and let her make them. Plan-first for map edits (propose, she adjudicates, then build).
- **Quality over dollars** (the cost is thinking/time, not API spend — use Opus 4.8). **Honesty about limits**,
  faithful status, **own your mistakes** (e.g. I championed the per-item relocation notes that later proved a
  leak — said so plainly). **Relocate-don't-delete.** Resist over-coding.
- **Watch for the recurring failure mode:** the build that banks the easy win and defers/skips the hard part
  (Level 3 got skipped behind §3C the first time). And the leak Marcia keeps catching: project/process material
  bleeding into the content artifacts.

## 6. Who Marcia is
Not a developer, but a **sharp methodologist** with deep ownership of the exegesis. She catches real
regressions the tooling misses (she caught the Level-3 drift, the cross_ref leak, and the relocation-note leak
herself, each when every green check said fine). Match her rigor; do the plumbing for her; never let her sweat
dev/git mechanics (do the merges, branch switches, etc. for her); **never let a build session quietly make her
exegetical calls.** She is not a programmer — explain git/Obsidian steps in plain terms, and offer to do them.

## 7. Artifacts this arc produced (all on the Architect branch `claude/reverent-taussig-c5bde6`, pushed)
`docs/` briefs: `HANDOFF-SESSION-6.md` (§3C corrective — done), `HANDOFF-SESSION-7.md` (**SUPERSEDED**),
`HANDOFF-LEVEL3-REMEDIATION.md` (SC-0015/0016 — done), `HANDOFF-VAULT-WRITEBACK.md` (done),
`HANDOFF-PROCESS-NOTE-DELEAK.md` (**in-flight, Session 7**), `COMMON-READER-PROSE-STANDARD.draft.md` (held),
and this file. The SC audit docs (`docs/SC-0013-RELOCATION-AUDIT.md`, `docs/SC-0016-LEVEL3-SWEEP-AUDIT.md`) hold
the durable relocate-never-delete record. **Note:** this Architect branch holds the briefs but isn't merged to
`main` — that's fine; they're working artifacts Marcia bridges from.

## 8. Operational gotchas (so you don't re-learn them the hard way)
- **fixtures ≡ vault invariant:** compiler `fixtures/meaning-map/` and `fixtures/meaning-coordinates/` are byte-identical
  to the vault `pericopes/` and `stas/`. Edits keep both in sync; the writeback restores the invariant.
- **The proven cross-repo flow:** apply in compiler fixtures (gated, provable) → **vault writeback** (pause
  auto-backup; transcribe; fresh branch off `origin/main`; diff-first/no-clobber; reviewed PR) → merge the pair
  (compiler first, vault follows) → switch the vault working copy to clean `main` → re-enable auto-backup.
- **The vault-to-`main` switch** (after a writeback merges): `git -C ~/Github/ruth-pilot-b-wiki checkout -B main
  origin/main` — content-neutral when the working branch already equals `origin/main` (verify first). Marcia
  can't do this herself; do it for her, carefully.
- **"I don't see the changes in my vault"** usually means Obsidian is on a feature branch or showing a stale
  view — confirm the working copy is on `main` synced to origin, and reload Obsidian.
- **SC-IDs are append-only**; allocate the next free number from the ledger; never rebind.

## 9. Read first (to inherit the understanding)
- This file, then `docs/PROGRESS.md`, `SPEC_CHANGES.md`, `docs/COVERAGE.md`, `docs/READING_QUALITY.md`,
  `docs/SOURCE_AND_SCALING.md` (compiler).
- Vault: `_methodology/level3and3Ccontentdiscipline.md` (R1–R5), the meaning-map template, and a clean P01
  map + Meaning Coordinates (the worked reference).
- **Project memory** (`MEMORY.md` + files): canonical-vault-location, governance-log-home (the SC-log home
  caveat), sc-id-collisions (ledger through SC-0016), vault-auto-backup, sc0016-level3-sweep, and
  common-reader-prose-standard (held). Recalled memories reflect what was true when written — verify a named
  file/flag still exists before relying on it.

With these, the next Architect inherits the understanding and picks up mid-stride: confirm the de-leak (SC-0017)
when Session 7 reports, then P07–P14 / the prose standard / Slice 4.
