# SC-0077 — Esther registry-delta: the map-surfaced cast (apply record)

**Phase-4 opening step: register the cast that Phase-3 mapping surfaced.** The 18 Esther Meaning Maps
(drafted, embedding-clean, Marcia-approved) flagged recurring beings/places/objects the seed registry
(41 entities, SC-0076) didn't hold. **Marcia ruled the registry-delta** (the recommendations + the eunuchs
call) 2026-06-26/27; the Evaluator vetted the spans + gave 3 citation fixes. This SC registers them.
Floor: compiler main `ec32413` · vault main `b77b42e` · enum v0.20 · board 395|1.

Tier-A compiler **+ vault pair**. **No closed/bounded-list edit, no enum bump, no CB/FIG re-mint** —
per-book Layer-3 registry growth only. Entity count **41 → 51**.

## What changed

**Vault** (`ruth-pilot-b-wiki`, branch `sc-0077-esther-registry-delta`) — 10 new BCD notes + 4 patched:
- **7 new group beings (B18–B24):** the king's servants (avadim/ne'arim) · the empire's officials
  (satraps/governors/provincial princes) · the enemies of the Jews (oyvim/son'im) · the royal scribes ·
  the royal couriers · Haman's friends · **the king's eunuchs (sarisim — Marcia ruled their own group
  being 2026-06-27)**.
- **1 new place (PL8):** the king's gate (Mordecai's recurring post; sub-location of Susa).
- **2 new objects (TH_*):** the royal crown · the royal throne.
- **4 referential-form additions** (patched existing notes): **B3 Haman** += the Agagite / son of
  Hammedatha / the enemy of the Jews (צֹרֵר הַיְּהוּדִים) · **B16 ten sons** += the 10 personal names ·
  **B17 the Jews** += a certain people (עַם אֶחָד) / the seed of the Jews / the Jews of Susa / the Jews of
  the open towns · **TM_ADAR** += the 13th / 14th / 15th of Adar.

**Compiler** — `_spec/registry/esther.aliases.json` regenerated (51 entities: 24 PERSON / 8 PLACE /
10 THING / 4 TIME / 5 INSTITUTION) + re-pinned (`aliases-0.1.6`, sha `1051718e…`) + SPEC_CHANGES SC-0077
row + this apply-record.

## Grounding (BHSA-vetted spans; Evaluator citation-fixes applied)
Every `hebrew` = BHSA voc_lex; every `appears_in` computed/anchored from the pinned packets:
- **B18** span = the union of `eved`∪`na'ar` pericopes = **E01·E03·E04·E06·E07·E09·E10·E11·E12** (the
  Evaluator's corrected span — the prior E02/E05/E08 were *eunuchs*, now B24).
- **TH_ROYAL_CROWN** = `keter` at **E02·E04·E11** (the citation-fix "drop E06" confirmed — `keter` never
  occurs at E06).
- **TH_THRONE** = the king's throne `kisse` at **E01·E10** (the citation-fix "drop E05" confirmed —
  `kisse` never occurs at E05; the E06 occurrence is *Haman's* seat of honour, a distinct referent, left
  descriptive).
- **B24 eunuchs** = `saris` class span E02·E03·E04·E05·E08·E11·E12 (distinct from the seven of 1:10 = B14
  and the named individuals B7/B8/B9/B11/B12/B13).
- **B23 Haman's friends** = E10·E11 (the E04 `ahav` is "love" generically — correctly excluded).

## Acceptance — all green
- `check-drift` exit 0 — `registry/esther.aliases.json vendored:ok` (pin sha `1051718e…`).
- **Byte-identical rebuild** from the vault BCD.
- **No CB/FIG re-mint** (concepts/figures `vendored:ok`, untouched).
- `id-check` unchanged baseline (Esther has no FMs yet); board **395 | 1 skipped**.
- 51 BCD notes present.

## Out of scope (next: SC-0078)
Committing the 18 maps to vault `pericopes/esther/` + `fixtures/meaning-map/` (resolving the now-registered
candidate refs), then compiling maps → FOR_MODELs + CLs, `validate` → vocabulary promotes (Marcia rules) →
enum bump, full gate suite.
