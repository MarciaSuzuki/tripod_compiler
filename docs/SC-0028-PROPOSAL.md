# SC-0028 — Home the canonical genre/register taxonomy in the vault + a sync-invariant guardrail

> Plan-first (Architect 10, 2026-06-07). A **small governance SC, same class as SC-0008**: an authoritative source
> that lacks a vault home + a guardrail. **NOT bundled with SC-0027** (POETIC_SUNG is already a valid closed value,
> so the Thread B work does not wait on this). **Nothing locks until approved.** Independent.

## 1. What SC-0028 is
The closed lists the compiler already vendors — **4 `GENRE_GROUP`s · 31 `GENRE`s · 7 `REGISTER`s** — come from the
authoritative "Gêneros e Registros" field guide, which exists **only as a loose PDF**. The values are correct (no
drift); what's missing is the **canonical home + field-team visibility** and a **guardrail** keeping the doc and the
enums in sync. SC-0028: vendor the field guide into the vault, fix its internal typo, cross-link it with the
compiler `_spec/`, and add a **sync invariant** so the doc and the closed lists can't silently diverge.

## 2. Verified grounding
- Compiler `closed_lists`: **GENRE_GROUP 4 · GENRE 31 · REGISTER 7** (canonical; `check-drift` keeps them pinned).
- **Vault has no canonical taxonomy** — `_methodology/` holds only an empty placeholder stub
  (`high-risk-register-categories.md` = `<!-- to be written by Marcia -->`), which is a *related* (high-risk
  register) note, not the 4/31/7 taxonomy. So Marcia's "no genre/register reference in the vault" holds.
- **The PDF's internal typo:** §4 says "31 genres," the quick-table header says "30." **The compiler's 31 is
  correct** (verified) — the doc is reconciled *to* the compiler, not the reverse.

## 3. Scope
1. **Vendor the field guide → `_methodology/genres-and-registers.md`** (PDF → markdown): the field-team-visible
   descriptive prose (from the PDF) **+ the canonical enum names from the compiler `closed_lists`** (the
   authoritative term list). Bilingual as the guide is — Portuguese prose, the English `GENRE_GROUP`/`GENRE`/
   `REGISTER` enum names as the canonical terms.
2. **Fix the typo first:** use **31** (drop the "30" header); the doc's term list = the compiler's `closed_lists`.
3. **Link both ways:** the vault doc cites the enum names; the compiler `_spec/` (`validation-rules.json` provenance
   + `_spec/schema/README.md`) cites the doc as the source of its closed lists.
4. **Sync invariant (the guardrail):** the vault doc's term list **must equal** the compiler's `closed_lists` —
   divergence is drift, the same class SC-0008 closed for the schemas. Implement as a check that parses the doc's
   enum names and asserts set-equality with `closed_lists.{GENRE_GROUP,GENRE,REGISTER}` (the analogue of
   `closedListSyncIssues()`), run conditionally when the vault is present (the `check-drift --vault` / SC-0008
   pattern — visible-skip when not configured); at minimum, a recorded invariant if a parse-check proves brittle.

## 4. Build notes
- **Needs the source PDF** (for the descriptive prose). The **term list does not** — it comes from the compiler's
  `closed_lists` (authoritative), which is also how the typo gets fixed for free.
- **It must land on the vault *remote*** — the SC-0008 lesson: verify the file reaches `origin/main` (stage new
  files; don't trust local disk alone).
- Optionally cross-link the existing empty `high-risk-register-categories.md` stub (the 7 registers it relates to).
- This is a **vault writeback** (the doc) **+ a compiler change** (the sync check + the `_spec/` provenance link) —
  two halves, like SC-0008; the doc half is human-gated (pause Obsidian), the check half is a normal PR.

## 5. Predictions / acceptance
- The vendored doc's term list set-equals the compiler `closed_lists` (4/31/7); the sync check is green.
- A deliberately-divergent term (e.g., a 30-genre doc) → the sync check fails (drift caught).
- The doc is on the vault **remote**; the compiler `_spec/` references it; `check-drift` unaffected.

## 6. Scope
Own small cycle, plan-first. **NOT bundled** with SC-0027 (independent; POETIC_SUNG already valid). Same
unguarded-authoritative-source class as SC-0008 — the fix is again *home it + guard it*, not *change the values*.
