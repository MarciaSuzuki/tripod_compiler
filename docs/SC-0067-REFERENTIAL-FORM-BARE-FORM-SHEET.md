# SC-0067 — Phase 1 (R1) — `referential_form` bare-form calibration sheet

> **Status: CALIBRATION — awaiting Marcia's word.** Nothing applied yet. This sheet enumerates
> every `*_referential_form` value across the 19 gold FOR_MODELs (FMs), proposes the **bare surface
> form** per R1, and surfaces the boundary calls. After ruling, the changes land as **one
> compiler+vault pair** (FM amendments — string-replace + count assertion + re-grep + `amendments.json`
> record; vault byte-identical), with the coupled COMPILATION-LOG (CL) echoes updated in lockstep.

## The ruling being applied (R1, Marcia, locked)

> `*_referential_form` slots carry the **BARE SURFACE FORM** — the referring expression as it
> appears in the text. **Strip** the analytic/meta annotations (`KINSHIP_FORM`, `DIVINE_NAME`,
> `_OCCURRENCE`, `_NARRATOR_EPITHET`, `_RELATIONAL`, `_THIRD_PARTY_EPITHET`, `WITHHELD_PER_*`, …).
> The annotation's content is **already carried** structurally (B-codes / `B?`) or in a note-home
> (`significant_absence`, CL, lint-exception) — **preserve every blessed device; change ONLY the
> FM slot value.**

## Counts (from the fixtures, not memory)

- **124** FM occurrences of a `*_referential_form` slot, across **75** distinct FM values.
- **19** CL `referential_forms[].value` entries (in P01–P05 CLs only), of which **5** are CL-only
  (no FM counterpart) and the rest echo FM values.
- **80** distinct values total (75 FM + 5 CL-only).
- Two slot families: the scene-being `referential_form` (81 occ.) and the proposition event-slot
  `<participant>_referential_form` (43 occ.).

## Disposition summary

| § | Disposition | Distinct values | FM occ. | Recommendation |
|---|---|---|---|---|
| 1 | **CLEAR STRIP** (R1-named annotation) | 13 | 20 | **Apply as proposed** |
| 2 | **BOUNDARY** (needs her word) | ~19 | ~25 | Per the grouped asks below |
| 3 | **KEEP — `UNNAMED_`/`NON_NAME` family** (blessed) | 10 | 11 | **Keep** (CLAUDE.md §3.3) |
| 4 | **KEEP — already bare** (surface forms / translit-gloss) | ~33 | ~68 | **No change** |
| 5 | CL reconciliation | — | — | echoes track FM; CL-only → her call |

---

## §1 — CLEAR STRIP (recommend: apply as proposed)

R1 names the annotation explicitly, or the analytic tail is unambiguous. Bare form in **bold**.

| # | Current value | → Proposed bare form | FM locations | CL echo |
|---|---|---|---|---|
| 1 | `HER_HUSBAND_RELATIONAL` | **`HER_HUSBAND`** | P01 scene | P01 |
| 2 | `KINSHIP_FORM_YEBIMTEKH` | **`YEBIMTEKH`** | P03 scene + exemplar(×2) | P03 |
| 3 | `RUTH_THE_MOABITESS_NARRATOR_EPITHET` | **`RUTH_THE_MOABITESS`** | P07 scene + reporter | P04* |
| 4 | `RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW_NARRATOR_EPITHET` | **`RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW`** | P04 scene + accompanying | — |
| 5 | `SHADDAI_ARCHAIC_POETIC_DIVINE_NAME_FIRST_OCCURRENCE` | **`SHADDAI`** | P04 invoked_divine_agent | P04 |
| 6 | `SHADDAI_ARCHAIC_POETIC_DIVINE_NAME_SECOND_OCCURRENCE` | **`SHADDAI`** | P04 invoked_divine_agent | P04 |
| 7 | `YOUR_MOTHER_IN_LAW_KINSHIP_FORM` | **`YOUR_MOTHER_IN_LAW`** | P06 loyalty_act_toward | — |
| 8 | `YOUR_HUSBAND_RELATIONAL_PAIRING_WITHHELD_PER_P01_D2` | **`YOUR_HUSBAND`** | P06 after_whose_death | — |

**Clear by principle (analytic tail not in the literal seed list, but unambiguous):**

| # | Current value | → Proposed bare form | What is stripped | FM locations | CL echo |
|---|---|---|---|---|---|
| 9 | `CLOSED_BY_KINSHIP_FORM_HER_MOTHER_IN_LAW` | **`HER_MOTHER_IN_LAW`** | discourse-closure prefix + `KINSHIP_FORM` | P02 scene + kissed | P02 |
| 10 | `NAARA_MOABIYAH_THIRD_PARTY_EPITHET` | **`NAARA_MOABIYAH`** | `_THIRD_PARTY_EPITHET` | P05 scene | — |
| 11 | `NAAR_NITSAV_AL_HAQOTSRIM_NAMED_BY_ROLE` | **`NAAR_NITSAV_AL_HAQOTSRIM`** | `_NAMED_BY_ROLE` | P05 scene | P05 |
| 12 | `MY_DAUGHTER_INTIMATE` | **`MY_DAUGHTER`** | `_INTIMATE` (register tag; lives at register-override) | P08, P09, P10 scenes | — |
| 13 | `RUTH_THE_MOABITESS_LEGAL_NAMING_AT_PROCEEDING` | **`RUTH_THE_MOABITESS`** | `_LEGAL_NAMING_AT_PROCEEDING` (setting tail) | P12 scene | — |

`*` P04's CL echoes the **short** form `RUTH_THE_MOABITESS_NARRATOR_EPITHET`, but P04's FM uses the
**long** form (#4). See §5 — a pre-existing FM↔CL divergence to reconcile.

---

## §2 — BOUNDARY (needs Marcia's word)

Grouped into the families named in the work order plus the prose-in-disguise cases.

### 2A — Address/setting tails (recommend: STRIP to the bare referring expression)

| Current value | → Proposed bare form | Family | FM locations |
|---|---|---|---|
| `JONAH_SON_OF_AMITTAI_NO_TITLE` | **`JONAH_SON_OF_AMITTAI`** | `NO_TITLE` | J01 scene + recipient |
| `ADDRESSED_AS_YHWH` | **`YHWH`** | `ADDRESSED_AS` | J05 scene |
| `ADDRESSED_AS_SLEEPER` | **`SLEEPER`** (or `NIRDAM`?) | `ADDRESSED_AS` | J02 scene |
| `THIS_MAN_IN_PRAYER` | **`THIS_MAN`** | `IN_PRAYER` | J02 scene |

### 2B — The withholding family (recommend: STRIP; device's content already in a note-home)

| Current value | → Proposed bare form | Note-home that carries the content | FM locations |
|---|---|---|---|
| `COLLECTIVE_THE_DEAD_AND_NAOMI_NO_PAIRING_INFERRED` | **`THE_DEAD_AND_NAOMI`** | P02 CL note (line ~648): "without disclosing which daughter-in-law's hesed … pairing withheld per P01-D2" | P02 prior_hesed_targets |

### 2C — Jonah divine-name alternation (THEOLOGICAL — her call)

The J05 CL **explicitly defers** the "naming shifts" high-risk audit (an honest R1 placeholder, not
yet hand-authored). So these slots are currently the **richest record** of the Elohim/YHWH
alternation. Stripping to the bare names **preserves the alternation data** across slots (you can
still read `ELOHIM` at J04 vs `YHWH` at J05) and only drops the editorial commentary. **But this is
a load-bearing literary feature — surfacing before any drop.**

| Current value | → Proposed bare form | What is stripped | FM locations |
|---|---|---|---|
| `ELOHIM_NOT_YHWH` (×4) | **`ELOHIM`** | `_NOT_YHWH` (contrast; recoverable from the bare slots) | J04 scene ×4 |
| `ELOHIM_ALONE` (×3) | **`ELOHIM`** | `_ALONE` | J05 appointer ×2 + questioner |
| `YHWH_ELOHIM_DOUBLED` (×2) | **`YHWH_ELOHIM`** | `_DOUBLED` (the doubling *is* the two-name form) | J05 scene + appointer |
| `ELOHIM_TO_YHWH_SHIFT` | **decompose / her call** | describes a *transition*, not one form — needs the actual name at that slot | J05 scene |

> **Caveat to surface:** if Marcia wants the alternation commentary preserved as prose, we add a
> `significant_absence` / CL note-home **first**, then strip — never silently drop.

### 2D — Prose-in-disguise: sequence / pattern / "named-as" (recommend per-row; some may be Phase 3)

| Current value | → Proposed bare form | Why boundary | FM locations | CL echo |
|---|---|---|---|---|
| `THE_MAN_THEN_NAMED_BOAZ` | **`THE_MAN`** (+ naming noted structurally) | a progression ("the man → Boaz"), not one form | P07 scene | — |
| `NAMED_THEN_ADDRESSED` | **her call** | a progression | J03 scene | — |
| `ALTERNATES_MOTHER_IN_LAW_AND_NAOMI` | **her call** (pick one + note, or Phase 3) | a cross-text *pattern*, not a referring expression | P07 scene | — |
| `NAMED_AS_HUSBAND_OF_RUTH` | **`HUSBAND_OF_RUTH`** | `NAMED_AS_` meta-prefix | P12 scene | — |
| `NAMED_ONLY_AS_MOTHER_IN_LAW` | **`MOTHER_IN_LAW`** | `NAMED_ONLY_AS` (the "only" significance → note) | P07 scene | — |
| `DUAL_SPELLING_SALMAH_AND_SALMON` | **`SALMAH_AND_SALMON`** | `DUAL_SPELLING_` meta-prefix | P14 scene | — |
| `SELF_NAMED_HEBREW` | **`HEBREW`** (or `IVRI`?) | `SELF_NAMED_` meta-prefix | J02 scene | — |
| `BUT_I_CONTRASTIVE` | **`BUT_I`** | `_CONTRASTIVE` (the contrastive *ani* is the surface) | J03 scene | — |
| `DIVINE_NAME_FIRST_ON_RUTHS_LIPS` | **`YHWH`** | `DIVINE_NAME_` prefix + `_FIRST_ON_RUTHS_LIPS` salience (→ note) | P03 agent_named | P03 |
| `REFUSED_NAME_NAOMI_IN_RECALL` | **`NAOMI`** | the refusal is the B3-renaming, audited in P04-D8 + CL | P04 question_target | P04 |

---

## §3 — KEEP: `UNNAMED_` / `NON_NAME` family (recommend: KEEP — blessed surface device)

CLAUDE.md §3.3 lists `UNNAMED_MAN_FROM_BETHLEHEM` and `STRIPPED_TO_HA_ISHAH` as **canonical
referential-form examples**. "Referred to by description, not named" is a legitimate surface
characterization, not analytic creep. **This is the P01-D2 lesson — do not treat a blessed device
as a leak.**

| Value | FM locations | CL echo | Note |
|---|---|---|---|
| `UNNAMED_MAN_FROM_BETHLEHEM` | P01 scene | P01 | blessed in CLAUDE.md §3.3 |
| `UNNAMED_FIRST_SON` | P01 scene | P01 | |
| `UNNAMED_SECOND_SON` | P01 scene | P01 | |
| `UNNAMED_WIFE_OF_HEAD` | P01 scene | P01 | |
| `STRIPPED_TO_HA_ISHAH` | P01 scene | P01 | blessed in CLAUDE.md §3.3 |
| `UNNAMED_KING` | J04 scene | — | |
| `UNNAMED_PRAYING_I` | J03 scene | — | |
| `NEARER_REDEEMER_UNNAMED` (×2) | P09 scene ×2 | — | **boundary:** `UNNAMED` as a *suffix* (others use prefix) — normalize? |
| `THE_DEAD_UNNAMED` | P11 scene | — | suffix form |
| `PELONI_ALMONI_NON_NAME` | P11 scene | — | **boundary:** `peloni almoni` *is* the surface "so-and-so"; keep, or strip `_NON_NAME` → `PELONI_ALMONI`? |

**One small ask:** keep the family, but do you want prefix/suffix normalized (e.g.
`NEARER_REDEEMER_UNNAMED` → `UNNAMED_NEARER_REDEEMER`) for consistency? Recommend: leave as-is
(cosmetic), unless you want uniformity.

---

## §4 — KEEP: already bare (no change)

Surface forms, transliteration+gloss (e.g. `HA_ISH_THE_MAN`, `KALLAH_DAUGHTER_IN_LAW`,
`SHEM_HA_MET_NAME_OF_THE_DEAD`), and surface phrases (e.g. `ONE_OF_OUR_REDEEMERS`,
`DAUGHTER_IN_LAW_WHO_LOVES_YOU`, `OUR_BROTHER_ELIMELECH`). No analytic annotation present.

`NAMED` (16×, P04–P06) · `HA_ISH_THE_MAN` (6×) · `HA_ISHAH_THE_WOMAN` (2×) · `HA_MET_THE_DEAD` ·
`HAMETIM_THE_DEAD` · `THE_MAN_HA_ISH` (2×) · `KALLAH_DAUGHTER_IN_LAW` (2×) · `REDEEMER_GOEL` ·
`OUR_KINSMAN_MODA` (2×) · `HER_MOTHER_IN_LAW_CHAMOT` (2×) · `YOUR_MOTHER_IN_LAW_CHAMOT` ·
`RUTH_YOUR_SERVANT_AMAH` (2×) · `AMAH_SERVANT` · `SHEM_HA_MET_NAME_OF_THE_DEAD` (2×) ·
`THE_SAILORS_HAMMALACHIM` · `THE_MEN_HAANASHIM` · `CHIEF_OF_THE_SAILORS` · `THIS_MAN` ·
`THIS_YOUNG_WOMAN` · `WOMAN_COMING_INTO_HOUSE` (2×) · `DAUGHTER_IN_LAW_WHO_LOVES_YOU` (2×) ·
`ONE_OF_OUR_REDEEMERS` · `OUR_BROTHER_ELIMELECH` (2×) · `NAOMI_HER_MOTHER_IN_LAW` (2×) ·
`THE_MOABITE_WIFE_OF_THE_DEAD` (2×) · `RUTH_THE_MOABITE_WIFE_OF_MAHLON` · `GREATEST_TO_LEAST` ·
`BY_THE_WORD_OF_YHWH` · `YHWH` (2×) · `YHWH_MY_GOD` · `YHWH_THE_GOD_OF_ISRAEL`

**Three minor confirms (recommend keep as-is):**
- `NAMED` (16×) — the baseline "referred to by proper name." Keep as baseline? (Carrying the literal
  name instead — e.g. `NAMED_NAOMI` — would be a bigger scope change, not R1's intent.)
- `NAOMI_WHO_RETURNED_FROM_MOAB` (2×, P11) — descriptive, but it *is* the surface phrasing of
  Ruth 4:3 ("Naomi, who has returned from Moab"). Keep.
- `YELADIM_TENDER_CHILD` (P01) — `yeladim` + a connotation gloss ("tender"). Keep as translit+gloss?

---

## §5 — CL reconciliation (FM ↔ COMPILATION-LOG)

The CL `referential_forms[]` array (P01–P05 only) records what the drafter emitted. Its `source` /
`note` prose **is the note-home** for the stripped commentary (e.g. P04's "narrator returns to
Moabite epithet after withholding"), so stripping the FM value loses nothing.

**Coupled echoes (update in lockstep with the FM):** `HER_HUSBAND_RELATIONAL`→`HER_HUSBAND` (P01) ·
`CLOSED_BY_KINSHIP_FORM_HER_MOTHER_IN_LAW`→`HER_MOTHER_IN_LAW` (P02) ·
`KINSHIP_FORM_YEBIMTEKH`→`YEBIMTEKH` (P03) · `DIVINE_NAME_FIRST_ON_RUTHS_LIPS`→(2C/2D) (P03) ·
`SHADDAI_…_FIRST/SECOND_OCCURRENCE`→`SHADDAI` (P04; **dedup** to one `SHADDAI` entry) ·
`REFUSED_NAME_NAOMI_IN_RECALL`→`NAOMI` (P04) · `NAAR_NITSAV_AL_HAQOTSRIM_NAMED_BY_ROLE`→
`NAAR_NITSAV_AL_HAQOTSRIM` (P05).

**Pre-existing FM↔CL divergence:** P04 CL echoes `RUTH_THE_MOABITESS_NARRATOR_EPITHET` (short) but
P04 FM uses `…HER_DAUGHTER_IN_LAW_NARRATOR_EPITHET` (long). Recommend: set the P04 CL echo to the
FM's bare form `RUTH_THE_MOABITESS_HER_DAUGHTER_IN_LAW` so the two halves agree.

**CL-only records (no FM slot — her call; recommend leave as audit, since `referential_form` is a
descriptive axis that is never promoted):** `SHE_PRONOMINAL` (P01) · `HUSBAND_OF_NAOMI_FRAMING`
(P01) · `UNNAMED_DIVINE_AGENT_IN_BINDING_PAIRING` (P03) · `SELF_REFERENCE_REFUSING_OWN_NAME` (P04) ·
`PROPOSED_NEW_NAME_MARA_IN_SELF_SPEECH` (P04). The last two are the B3-renaming audit and read
correctly as governance prose (SC-0017 scope: the audit layer retains analytic language).

---

## §6 — Blessed devices preserved (verified present; NOT touched)

- **P06 wife-pairing withholding (P01-D2):** `after_whose_death: "B?"` (FM line 508),
  `significant_absence` "…the pairing is withheld per P01-D2…" (FM line 202), the meaning-map
  lint-exception keyed on the map Q&A "her husband (pair withheld; see P01-D2)"
  (`_spec/lint-exceptions.json`), and the P01/J01/P02/P06 CL `decision_id: P01-D2` — **all STAY.**
  Only the FM slot value at line 509 changes (`…WITHHELD_PER_P01_D2` → `YOUR_HUSBAND`).
- **P02 NO_PAIRING_INFERRED:** the withholding content lives in the P02 CL note (~line 648). Only
  the FM slot value changes (`COLLECTIVE_THE_DEAD_AND_NAOMI_NO_PAIRING_INFERRED` → `THE_DEAD_AND_NAOMI`).

---

## §7 — What I need from Marcia (the decisions)

1. **§1 clear strip (13 values / 20 occ.):** apply as proposed? *(recommend: yes)*
2. **§2A address/setting tails:** strip to bare? *(recommend: yes)* — and `ADDRESSED_AS_SLEEPER` →
   `SLEEPER` or `NIRDAM`?
3. **§2C Jonah divine-name alternation:** strip to bare names (`ELOHIM` / `YHWH` / `YHWH_ELOHIM`),
   alternation preserved across slots? And `ELOHIM_TO_YHWH_SHIFT` — decompose to which name, or hold?
   *(recommend: strip the first three; HOLD the SHIFT for decomposition)*
4. **§2D prose-in-disguise (10 values):** take the proposed bare forms? The two genuine *patterns*
   (`ALTERNATES_…`, `NAMED_THEN_ADDRESSED`) — strip to one form + note, or defer to Phase 3?
5. **§3 `UNNAMED_`/`NON_NAME`:** keep the family (recommend) — and normalize prefix/suffix, or leave?
   `PELONI_ALMONI_NON_NAME` — keep or strip `_NON_NAME`?
6. **§5 CL-only records:** leave as audit (recommend), or strip the analytic ones too?
