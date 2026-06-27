# SC-0076 — Esther onboarding, Phase 2: REGISTRY / BCD (apply record)

**The Esther cast enters the registry.** Phase 2 of the book-onboarding checklist. Marcia
**approved the cast proposal** (`tripod-eval-artifacts/ESTHER-CAST-PROPOSAL-SC0076.md`) 2026-06-26.
Floor: compiler main `4705844` (SC-0074 source landed) · vault main `625c530` · enum v0.20 ·
lint-lexicon 0.4.0 · board 395|1.

Tier-A compiler **+ vault pair**. The vault BCD notes are the canonical source; the compiler's
`_spec/registry/esther.aliases.json` is **derived** from them by `extractor/build_aliases.py`
and pinned. **No closed/bounded-list edit, no enum bump, no CB/FIG re-mint** — pure per-book
Layer-3 registry seeding.

## What changed

**Vault** (`ruth-pilot-b-wiki`, branch `sc-0076-esther-bcd`) — 41 new BCD notes under
`bcd/esther/{beings,places,objects,times,institutions}/`:
- **17 beings (B1–B17):** Mordecai, Esther/Hadassah, Haman, Ahasuerus, Vashti, Zeresh, Hegai,
  Hathach, Shaashgaz, Memucan, Bigthana, Teresh, Harbona, + 4 group beings (the seven eunuchs,
  the seven princes of Persia and Media, the ten sons of Haman, **and the Jews / the Jewish
  people — B17, ruled in by Marcia 2026-06-26**).
- **7 places (PL1–PL7):** Susa (the citadel), India, Cush, Jerusalem, Babylon, Persia, Media.
- **8 objects (TH_*):** the lot (Pur), the signet ring, the gallows, the royal edict (letters),
  the king's horse, the royal robe, the golden scepter, **and the royal annals / book of
  chronicles — TH_ANNALS, ruled in by Marcia 2026-06-26**.
- **4 times (TM_*):** Adar, Nisan, Sivan, Tebeth.
- **5 institutions (I1–I5):** the royal banquet (mishteh), the law of the Medes & Persians (dat),
  Purim, the house of the women (harem), the royal provinces (the 127).

**Compiler** — `_spec/registry/esther.aliases.json` (41 entities; 17 PERSON / 7 PLACE / 8 THING /
4 TIME / 5 INSTITUTION) built from the vault BCD, pinned in `_spec/pins.json`
(`aliases-0.1.6`, sha256 `697569be…`). + SPEC_CHANGES SC-0076 row + this apply-record.

## Grounding & method (why it's trustworthy)

- **Hebrew = BHSA voc_lex** (vocalized lemma) pulled straight from the pinned source packets
  (`_spec/source/esther/E*.json`) — not transcribed or invented. `hebrew_cons` is the
  niqqud-stripped skeleton the coverage matcher uses.
- **`appears_in`:** proper-noun entities use the **computed** lemma-occurrence span (reproducible
  from the packets). Group / common-noun entities (the eunuchs/princes/sons, the harem, the 127
  provinces, the props, banquet, dat) are **hand-anchored** to where the *specific* referent
  occurs — the raw lemma span over/under-counts (e.g. `saris` occurs in 7 pericopes, but "the
  seven eunuchs of 1:10" is only E02).
- **Two-name pair:** Esther = Hadassah is **one being (B2)** with `referential_forms`
  [Hadassah, the queen] + `hebrew_aliases` [הֲדַסָּה] — the load-bearing referential axis.
- **Harbona (B13):** one being, two attested spellings (חַרְבֹונָא 1:10 / חַרְבֹונָה 7:9) via `hebrew_aliases`.
- **Recipe:** `build_aliases.py --book esther --bcd <vault>/bcd/esther` — **no `--places-ner`**
  (matches Jonah → reproducible from BCD alone).

## Judgment calls (proposal defaults applied; flagged for the record)

- **§3d Susa — collapsed to ONE place (PL1).** The proposal offered "two places (city + citadel)
  OR one with a referential note." I took the **one-place** option (citadel/city captured as a
  referential note + `aliases`), because it is the same location and the structurally load-bearing
  contrast in Esther 9 is **Susa (capital) vs. the provinces** — captured by PL1 vs. I5. Split is
  trivially addable later via a BCD-delta if Marcia prefers.
- **Patronyms / genealogy NOT registered** (Hammedatha, Abihail, Jair, Shimei, Kish, Jehoiachin,
  Nebuchadnezzar) — proposal §1c default; they remain genealogical mentions.
- **God: no divine being** — Esther never names God; the absence is the theological signature,
  carried in the maps as `significant_absence`, not as a cast member.

## Adversarial-verification corrections + Marcia rulings (post-build)

A 5-lens adversarial workflow (each lens re-deriving from the BHSA packets) ran against the
first 39-entity build. Lens A (Hebrew) and Lens D (format/reproducibility) were 100% clean; 0
findings refuted. Four confirmed items, resolved as follows:

- **B16 — `appears_in` under-count (FIXED).** The ten sons of Haman omitted **E17** (9:25, "they
  hanged him and his sons on the tree"). Decisive proof: the gallows *was* credited E17 for the
  same verse, so the build dropped the co-located sons referent. → added E17 → `[E15,E16,E17]`.
- **B1 — missing referential form (FIXED).** Mordecai lacked the epithet **"the Jew"**
  (הַיְּהוּדִי, 6×), while B2 Esther carried the parallel "the queen" — an asymmetry on the two
  protagonists. The proposal §1a had tagged it. → added `referential_forms:["the Jew"]` +
  `hebrew_aliases:[הַיְּהוּדִי]`.
- **B17 — the Jews (RULED IN by Marcia).** The corporate protagonist (44 plural occurrences;
  grammatical subject of the deliverance verbs 9:2, 9:5) was unregistered. Marcia ruled it in →
  group being **B17**, יְהוּדִים, `appears_in` = the 11 plural-collective pericopes
  `[E06–E09, E11, E13–E18]` (the singular-only E04/E10 are the "Mordecai the Jew" epithet,
  correctly excluded). `gender: null` (a people).
- **TH_ANNALS — the royal annals (RULED IN by Marcia).** The book of chronicles (the 6:1
  peripeteia device; recurs 2:23 / 6:1 / 10:2) was unregistered. Marcia ruled it in → object
  **TH_ANNALS**, סֵפֶר דִּבְרֵי הַיָּמִים (alias סֵפֶר הַזִּכְרֹנוֹת), `appears_in` `[E05,E11,E18]`.

## Acceptance — verified

- `npm run check-drift` → **exit 0**; `registry/esther.aliases.json vendored:ok`.
- **Byte-identical rebuild:** re-running `build_aliases.py` reproduces the pinned file exactly.
- **No CB/FIG re-mint:** `registry/concepts.json` / `figures.json` untouched (`vendored:ok`).
- **id-check:** 0 ref-integrity · 0 name-binding · 0 dangling (unchanged baseline; Esther has no
  FMs yet).
- Board **395 | 1 skipped** (unchanged).

## Verification (adversarial workflow)

5 independent lenses (Hebrew fidelity · `appears_in` accuracy · cast completeness vs the approved
proposal · format/schema/reproducibility · completeness-critic), each re-deriving from the 18
pinned BHSA packets and prompted to **find errors**; every material finding then independently
verified (refute-biased). Result: **0 findings refuted as false; Hebrew + format lenses 100%
clean.** Confirmed items → 2 objective fixes (B16, B1) + 2 cast expansions ruled in by Marcia
(B17, TH_ANNALS), all listed above. Re-verified after the fixes: 41 entities, all gates green
(check-drift exit 0 · byte-identical rebuild · no CB/FIG re-mint · id-check 0 ref-integrity/
name-binding/dangling · board 395|1).

Surfaced (recorded, not defects): **I2 (dat)** `appears_in` is the full `דָּת` lemma span, which
includes a few generic "custom" senses (1:8, 2:12) alongside the irrevocable Medo-Persian decree
— an acceptable over-inclusive seed span, refinable per-scene during mapping. **§3d Susa** kept as
one place (above). **I3 Purim / TH_PUR_LOT** legitimately share the BHSA lemma `פּוּר` (the
festival is named from the lot) — not a collision.

## Out of scope

- No maps (Phase 3) and no FOR_MODEL compile / vocabulary promotes (Phase 4) — separate SCs.
- The cast is a **seed**; it accretes pericope-by-pericope via BCD-deltas during mapping.
