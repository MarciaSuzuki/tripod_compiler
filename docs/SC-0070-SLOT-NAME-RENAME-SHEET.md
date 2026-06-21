# SC-0070 — Slot-NAME role-vocabulary rename + the slot-name lint extension

> **Status: CALIBRATION — awaiting the Evaluator's draft-verify, then Marcia's final-name confirmation.**
> Nothing applied. This sheet maps every `event_specific_slots` **key** that leaks banned role-theory
> vocabulary to a proposed non-role-theory name, and specifies the lint extension that makes the leak
> impossible. Mirrors the R1/R2 rhythm: sheet → draft-verify → rule → apply (one compiler+vault pair).

> **The leak ([[tripod-slotname-role-vocab-leak]], Marcia's catch 2026-06-20):** the FM slot **names** —
> not the values — use the project's own banned grammatical/thematic-role terms (`agent_named`,
> `invoked_divine_agent`, `blessing_recipient`, `beneficiary`, …). The principle (CLAUDE.md:176 — *"event-
> participant slot names (giver/blesser/deceased/…), NEVER agent/patient/theme"*; drafter prompt §4;
> `lint-lexicon.json`) is violated **in canon with lint GREEN**, because the forbidden-vocab rule
> (`src/engine/lint.ts:7`) runs **prose-only, not slot-names**. The FMs are the fine-tuning seed — a slot
> NAME teaches the model a frame — so this is a seed-freeze-gate concern. **Distinct from R2** (which
> stripped slot *values*).

> **SC-ID:** SC-0070 (reconfirmed 2026-06-20 vs `SPEC_CHANGES.md` highest = SC-0069, 0 open PRs). The
> oral-pipeline Stage 2 also wants a number — **binding allocation at apply** (whoever lands first).

## 1. The ruling (Marcia, 2026-06-20)

- **RENAME** the role-vocabulary slot-names: Tier-1 (the explicitly-banned `agent`/`recipient`/
  `beneficiary`) + Tier-2 (role-flavored `subject`/`object`/`source`/`locus`/`owner`/`argument`/
  `antecedent`) + the `referent` family. Even theological `invoked_divine_agent` and plain-English
  `question_subject` are renamed. **Final names = her / Architect call** (this sheet proposes).
- **KEEP `speaker` + `addressee`/`addressees`** — communicative-event roles, too fundamental, awkward to
  replace. (16 keys / 106 occ, untouched.)
- **DURABLE FIX:** extend the forbidden-vocab lint to slot-name keys (make-impossible), banning exactly
  `{agent, recipient, beneficiary, subject, object, source, locus, owner, argument, antecedent, referent}`,
  **excluding** speaker/addressee, **scoped to `event_specific_slots` keys** (never the L2
  `objects_in_scene`/`object_id` physical-object namespace). Bite-prove both ways. Fix the drafter-prompt
  self-contradiction (§4 bans `recipient`/`agent`; line 138 endorses `blessing_recipients`/`invoked_divine_agent`).

## 2. Scope reconciliation — 58 ruled (pre-R2) → 55 live (post-R2)

Marcia ruled **58 keys / 108 occ** on the pre-R2 floor (`0831814`). R2 (SC-0069, merged `84d26de`)
incidentally removed **3 of them** (their values were §A speech-content) and trimmed a 4th:

| R2 effect | key | was | now |
|---|---|---|---|
| removed (was §A speech) | `inheritance_locus` | 1 | **gone** |
| removed (was §A speech) | `report_subject` | 1 | **gone** |
| removed (was §A speech) | `violence_locus` | 1 | **gone** |
| trimmed (the per-value split) | `question_subject` | 13 | 7 |

So **SC-0070's live scope = 55 keys / 99 occ**, and 58 = 55 live + 3 R2-removed (coverage bar: all 58
accounted). Verified by enumerating both floors with token-matching (a key leaks iff an
underscore-delimited **token** is in the banned set — so `referential_form` is **not** false-flagged by the
`referent` prefix; `speaker`/`addressee` carry no banned token).

## 3. The rename map (proposed — 55 keys / 99 occ)

**Cascade rule:** rename the leaking token; the trailing `_referential_form` (R1 axis), `_form`,
`_patronymic`, `_restated` suffixes ride along unchanged. **⚠ = flagged for Marcia** (context-dependent /
structural). Bare-key context noted.

### Tier-1 — explicitly banned

**AGENT (5 keys / 25 occ)**
| current | → proposed | occ | where | note |
|---|---|---|---|---|
| `invoked_divine_agent` | **`invoked_deity`** | 13 | P02-07/09/12/13 | per the ruling; the deity invoked in a blessing/oath |
| `invoked_divine_agent_referential_form` | **`invoked_deity_referential_form`** | 3 | P04,P06 | cascade |
| `agent_named` | **⚠ `named_doer`** | 7 | P01,P02,P03,P05 | meta-slot (B10 / NONE). **Marcia's deeper option:** move the `NONE` "no-named-doer" cases (P01 famine/deaths reticence) to `significant_absence`, keep a specific event-role where named — her call |
| `agent_named_referential_form` | **`named_doer_referential_form`** | 1 | P03 | cascade |
| `agent_of_return_empty` | **`emptied_by`** | 1 | P04 | who brought Naomi back empty (YHWH) |

**RECIPIENT (11 keys / 15 occ)** — the prompt self-contradiction resolves *against* `recipient`
| current | → proposed | occ | where |
|---|---|---|---|
| `blessing_recipient` | **`blessed_party`** | 2 | P05,P06 |
| `blessing_recipient_form` | **`blessed_party_form`** | 1 | P07 |
| `blessing_recipient_referential_form` | **`blessed_party_referential_form`** | 1 | P12 |
| `seed_recipient` | **`seed_given_to`** | 1 | P12 |
| `word_recipient` | **`word_came_to`** | 2 | J01,J04 |
| `vow_recipient` | **`vowed_to`** | 1 | J03 |
| `report_recipient` | **`reported_to`** | 2 | J04,P10 |
| `permission_recipient` | **`permitted_party`** | 1 | P05 |
| `recipient` | **⚠ `given_to`** | 2 | P11,P13 | bare; confirm vs context (P11 redemption-right / P13 child) |
| `recipient_patronymic` | **⚠ `patronymic`** | 1 | J01 | drop `recipient`; patronymic of the addressed prophet |
| `recipient_referential_form` | **⚠ `addressed_referential_form`** | 1 | J01 | the word's addressee — confirm |

**BENEFICIARY (1 / 1)**
| `beneficiary` | **⚠ `born_for`** | 1 | P13 | the child born for Naomi — or `for_whom`; her call |

### Tier-2 — role-flavored

**SUBJECT (8 / 18)** — split: topic-sense → `_about`; participant-sense → the role
| current | → proposed | occ | where | note |
|---|---|---|---|---|
| `question_subject` | **`question_about`** | 7 | J05,P02,P10 | per the ruling (topic) |
| `creed_subject` | **`creed_about`** | 1 | J05 | the One the creed describes |
| `reported_subject` | **`reported_about`** | 1 | P08 | |
| `subject` | **⚠ `about`** | 4 | P02,P10 | bare topic-slot — confirm |
| `subject_child` | **`child`** | 1 | P13 | drop `subject` |
| `subject_referential_form` | **`about_referential_form`** | 2 | P10 | cascade of `subject`→`about` |
| `petitioned_subject_referential_form` | **⚠ `petitioned_about_referential_form`** | 1 | J02 | confirm |
| `report_subject_referent` | **⚠ `reported_about`** | 1 | P05 | **double-leak** (subject+referent); merge-sense with `reported_subject` |

**OBJECT (5 / 6)** — the thing acted on (NOT the L2 `objects_in_scene`)
| `fear_object` | **`feared`** | 2 | J02 |
| `pity_object` | **`pitied`** | 1 | J05 |
| `pitied_object` | **⚠ `pitied`** | 1 | J05 | near-dup of `pity_object` (both J05 — the plant vs Nineveh); confirm distinct names if both needed |
| `shown_object` | **`shown`** | 1 | P10 |
| `divine_object` | **⚠ `deity`** | 1 | J04 | confirm vs context |

**SOURCE (6 / 6)** → origin sense `_from`
| `drink_source` | **`drink_from`** | 1 | P06 |
| `word_source` | **`word_from`** | 1 | J01 |
| `field_source` | **`field_from`** | 1 | P11 |
| `seed_source` | **`seed_from`** | 1 | P12 |
| `seed_source_referential_form` | **`seed_from_referential_form`** | 1 | P12 |
| `divine_source` | **⚠ `from_deity`** | 1 | J04 | confirm |

**LOCUS (1 / 1)** | `proclamation_locus` | **`proclamation_place`** | 1 | J04 |

**OWNER (4 / 4)** → possession sense `_belongs_to`
| `salvation_owner` | **`salvation_belongs_to`** | 1 | J03 |
| `waters_owner` | **`waters_belong_to`** | 1 | J03 |
| `portion_owner` | **`portion_belongs_to`** | 1 | P05 |
| `deceased_owner` | **⚠ `deceased_of`** | 1 | P11 | whose dead — confirm |

**ARGUMENT (1 / 2)** | `argument_role` | **`comparison_rank`** | 2 | J05 | per the ruling (qal-vaḥomer LESSER/GREATER_TERM) |

**ANTECEDENT (1 / 1)** | `hesed_antecedent` | **⚠ `hesed_from`** | 1 | P07 | the source left open (YHWH or the man) — confirm |

### REFERENT (12 / 20) — drop the suffix (it names the thing, not a role)
| `bound_to_referent` | **`bound_to`** (6, P03) · `clan_referent` | **`clan`** (2) · `clan_referent_restated` | **`clan_restated`** (1) · `divine_presence_referent` | **`divine_presence`** (1) · `evil_referent` | **`evil`** (1) · `gate_referent` | **`gate`** (1) · `harvesters_referent` | **`harvesters`** (1) · `material_referent` | **`material`** (2) · `matter_referent` | **`matter`** (2) · `question_target_referent` | **`question_target`** (1) · `redeemer_referent` | **`redeemer`** (1) · `reported_worker_referent` | **`reported_worker`** (1) |

## 4. KEEP (untouched — Marcia's ruling)

`speaker` (9 keys / 63 occ) · `addressee` + `addressees` (7 / 43) = **16 keys / 106 occ**. Carry no banned
token, so the lint never flags them; the explicit keep is for safety.

## 5. The slot-name lint extension (the make-impossible fix)

`src/engine/lint.ts` R4 today: forbidden-vocab, **prose-only**. Extend with a **slot-name rule** on the
FOR_MODEL path (`lintForModel`):

- **Walk every `event_specific_slots` key** (incl. nested `*_components[]`), token-split on `_`.
- **BLOCK (tier-1) / FLAG (tier-2)** if any token ∈ `{agent, recipient, beneficiary, subject, object,
  source, locus, owner, argument, antecedent, referent}`.
- **Allow-list** `speaker`, `addressee`, `addressees`.
- **Scope:** `event_specific_slots` keys ONLY — never `objects_in_scene` / `object_id` / `place_id` /
  the L2 scene namespaces (so the sanctioned physical-object axis is never false-flagged).
- New finding code `slot-name-role-vocab`; pin the banned list in `_spec/lint-lexicon.json` (new
  `forbidden_slot_name_tokens`) so it's governed, not hardcoded.
- **Bite-prove both ways:** plant `agent_named` on a clean FM → BLOCK; the post-rename corpus → silent
  (0 findings); a control with `objects_in_scene.object_id` → NOT flagged (scope proof);
  `speaker`/`addressee` → NOT flagged (allow-list proof).

## 6. Drafter-prompt self-contradiction (fix in this SC)

`_spec/drafter/fm-drafter-prompt.md`: §4 (lines 98-101) bans `recipient`/`agent`/… as hard lint errors,
but **line 138 instructs** *"use `blessing_recipients` … `invoked_divine_agent`."* Reconcile line 138 to
the ruled names (`blessed_party` / `invoked_deity`) so the drafter stops minting the leak. Re-pin the prompt.

## 7. What I need from Marcia

1. The **⚠-flagged names** (§3): `agent_named`→`named_doer` (+ the NONE→`significant_absence` option),
   `recipient`/`recipient_*`, `beneficiary`, the `subject`/`object`/`source` context cases, `deceased_of`,
   `hesed_from`, and the `report_subject_referent`/`reported_subject` merge. Confirm or amend.
2. The clean families (referent drop-suffix · source→`_from` · owner→`_belongs_to` · blessing→`blessed_party`):
   take as proposed?
3. Lint severity: tier-1 (`agent`/`recipient`/`beneficiary`) = **BLOCK**, tier-2 = BLOCK or FLAG?
   *(recommend BLOCK all — the seed must be clean, and the corpus is post-rename so it stays green.)*
