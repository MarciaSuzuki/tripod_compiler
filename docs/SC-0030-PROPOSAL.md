# SC-0030 — Level-3 purity: relocate the fidelity apparatus out of the FOR_MODEL supervision target

> **Plan-first (Architect 11, 2026-06-08). NO code until Marcia rules the placement (Decision #2 in §6).**
> Its own SC = **SC-0030** (verified next-free: SC-0028 reserved-unshipped for genre-homing, SC-0029 shipped;
> the only `SC-0030` string in the ledger is a rhetorical mention inside the SC-0008 entry). **One concern —
> do NOT bundle Jonah or SC-0028.** Read with `[[tripod-level3-purity-debt]]`, `docs/SC-0027-PROPOSAL.md`,
> `docs/SC-0029-PROPOSAL.md`. This **fixes a regression introduced by my own SC-0027/0029 work** — owned plainly.

---

## 0. The point, in one paragraph
**Level 3** of the prose meaning map and its FOR_MODEL is *only the inventory of propositions the model translates
at inference* — in training it **is the pairing / supervision target**. SC-0027 (the fidelity model) and SC-0029
(held-7 seeding) attached the fidelity apparatus — the `preserve_meaning`/`preserve_form` flags, the
`fidelity_group`s, the structure-flag, **and a free-text `meaning` field** — *inside* Level-3 content objects.
That puts **English commentary into the supervision target**, which risks training the downstream model to emit
English rationale instead of a target-language translation. SC-0030 restores Level-3 purity: **remove the
commentary, relocate the fidelity flags to a conditioning layer, and build the guard for the vector that let it in.**
The fidelity *model* (the two-axis flag, the groups, every A–F / vow ruling) is **unchanged** — only its **placement**
moves. Nothing about the meaning calls is re-litigated.

## 1. The principle (Marcia's, load-bearing)
> Level 3 (map + FM) is *only the inventory of propositions the model translates at inference* — the supervision
> target. Everything else (Level 1, Level 2, notes, interpretation, the meaning-vs-form rationale) is **conditioning**
> and must live in other layers / the human layer, **not in Level 3.** Commentary in the supervision target trains
> the model to emit rationale, not translation.

## 2. The verified finding (measured 2026-06-08; floor re-checked, not trusted)
- **Floor green on `origin/main`** (post-SC-0029, `6e66c13`): `159 passed | 1 skipped`; `check-drift` clean;
  `validate fixtures/for-model/` → 6 valid · 0 block.
- **19 free-text `meaning` fields** across the corpus — **P03 (10), P04 (1), P06 (8)**; P01/P02/P05 have none.
  Of the 19: **18 are inside Level 3** (component flags, `fidelity_groups`, the `vow_structural_form_fidelity`
  structure-flag) and **1 is the Level-1 register-override fidelity**. (Full inventory + rationale preserved in §9.)
- **Two distinct problems** (see §3): the `meaning` commentary *and* the fidelity *flags themselves* sit in L3.
- **The unguarded vector:** `lintForModel()` (`src/engine/lint.ts:162`) already walks `event_specific_slots`,
  but it scans for **forbidden tokens** (grammatical jargon, interpretive labels), not for **prose-where-none-
  belongs** — so a descriptive `meaning` string without bad tokens passed clean. The SC-0012→0016 de-leak guards
  the **map's** Level-3 prose (§3C/§4), **not the FM JSON**. So `meaning` entered through a real, unwatched gap.
- **What SC-0030 does NOT touch (stays in L3 this cycle):** the **controlled tokens/ids** — `proposition_kind`,
  `action`, `speech_act`, `list_position`, entity codes, `cb_flags`, `figure_flags`, `inter_proposition_links`
  (these ARE the inventory) — **and** the **long sentence-shaped slot values** (e.g. `vow_structural_form:
  SIX_STEP_LADDER_…`). The latter are left **untouched but NOT declared settled-legit**: the legit-token-vs-prose
  line for long `UPPER_SNAKE` slot values is a **separate finding pending its own triage** (post-Jonah — see the
  scope boundary in §4 and `[[tripod-sentence-token-triage]]`). SC-0030 removes **only** `meaning` + relocates the
  fidelity **flags** — nothing else.

## 3. Two diseases (name them precisely — they need different fixes)
- **Disease 1 — commentary in the target.** The `meaning` free-text is English rationale embedded in the
  supervision target. **Fix: remove from the FM; relocate the rationale to the governance layer (§9 table).**
- **Disease 2 — conditioning living in the content object.** Even with `meaning` gone, the fidelity *flags*
  (`preserve_meaning`/`preserve_form` + `fidelity_group` + the structure-flag) are **conditioning** — instructions
  to the Performer, not propositions to translate. They do not belong in the L3 content object. **Fix: relocate
  the flags out of Level 3 — the architecture Decision #2 (§6), Marcia's to rule.**

## 4. Scope
- **SC-0030**, its own cycle. This is a **schema change** → version bump + re-pin + `SPEC_CHANGES.md` + vault
  spec writeback (the SC-0008 ritual). **Do NOT bundle Jonah or SC-0028** (one concern per cycle).
- **Out of scope (defer — Q4, lower priority):** tokenizing the Level-1/Level-2 conditioning free-text
  (`significant_absence`, `scene_communicative_purpose`). Those are conditioning layers that legitimately hold
  load-bearing free-text today; fully tokenizing them is a separate, larger effort. **This cycle is Level-3 purity only.**

> **Scope boundary (Marcia + evaluator, 2026-06-08).** SC-0030 removes the `meaning` field and relocates the
> fidelity flags — **nothing else.** The sentence-shaped slot VALUES (e.g. `narrator_interior_access_scope:
> GIVEN_TO_RUTHS_RESOLVE…`, ~49 corpus-wide) are a **separate finding**: leave them untouched, and do **NOT**
> declare any long slot token (e.g. `SIX_STEP_LADDER…`) "legitimate/settled" — that boundary is pending a later
> triage. The L3 lint must reliably flag the `meaning` field + explicit free-text; it **need not (and cannot
> cleanly) flag sentence-shaped slot values yet** (a legit compound token and a prose clause are both long
> `UPPER_SNAKE`; the lint can't draw the line until the triage defines the legit slot-vocab). The vector is guarded
> for Jonah by **mapping discipline** (the mapper applies the strip-to-type test — no sentence-shaped slot values),
> not by lint. Triage scoping banked in `[[tripod-sentence-token-triage]]` (its own SC, post-Jonah).

## 5. The fix (four parts)
1. **Remove `meaning` from every FM fidelity object** (all 19). Rationale relocated to §9 (relocate-don't-lose).
2. **Relocate the Level-3 fidelity flags out of the content objects** — **Decision #2 (§6), Marcia rules placement.**
3. **Extend `tripod lint`** (`lintForModel`) to flag free-text / commentary in FM Level 3 — the guard for the vector.
4. **Migrate the 3 annotated fixtures** (P03 vow, P04 + P06 held-7) to the chosen structure; **prove no L3
   *content* is lost** (only conditioning relocated + commentary removed); then the **vault writeback** (human-gated,
   verified on the remote).

---

## 6. DECISION #2 (Marcia's, plan-first) — where do the fidelity flags go?
Level 3 must end up holding only the translation inventory. The flags are conditioning; they must leave the L3
content object. Two ways:

> **✅ RULED (Marcia + evaluator, 2026-06-08): Option A.** Sub-points delegated to Architect 11, both confirmed:
> **(i)** move the lone Level-1 override flag into the new parallel layer too (single home; drop its `meaning`
> regardless); **(ii)** reference a component by `{prop_id, slot, list_position}` (reuse the existing
> `list_position`; no new ids). Build proceeds on A.

### Option A — a parallel top-level `fidelity` layer (RECOMMENDED; Marcia's stated lean)
A new top-level object, sibling to `level_3_propositions`, that references back into L3 by id/path and carries all
the flags. **Level 3 reverts to pure inventory — purity becomes a structural guarantee, not a convention.**
```jsonc
// top-level, sibling to level_3_propositions and level_2_scenes
"fidelity": {
  "elements": [
    { "ref": { "prop_id": "P3", "slot": "vow_components", "list_position": "THIRD" },
      "preserve_meaning": true, "preserve_form": false, "group": "people_god_inseparability" }
    // … one per flagged component
  ],
  "groups": [
    { "group_id": "people_god_inseparability",
      "members": [ { "prop_id": "P3", "slot": "vow_components", "list_position": "THIRD" },
                   { "prop_id": "P3", "slot": "vow_components", "list_position": "FOURTH" } ],
      "preserve_meaning": true, "preserve_form": false }
  ],
  "structure_flags": [
    { "ref": { "prop_id": "P3", "field": "vow_structural_form" },
      "preserve_meaning": true, "preserve_form": false }
  ]
}
```
- **Referential-integrity check (new, the same proven pattern as dangling-group-id):** every `ref` must resolve to
  a real L3 proposition + slot + `list_position` (or `field`); a dangling ref **blocks**. The group-membership
  refs and `group` pointers resolve too.
- **No `meaning` anywhere** — the rationale lives only in §9 / the governance docs.
- **Pros:** Level-3 purity is **structural** (enforced by shape — the artifact's *purpose* is guaranteed, not
  honored by good intentions); one guarded home for fidelity; refs are machine-checkable; the training pipeline
  pairs `level_3_propositions` as-is with zero filtering. **Cons:** indirection (flags point at L3 by path); the
  engine fidelity pass is rewritten; one new integrity check (small, modeled on the existing one).

### Option B — keep flags inline, pair only content fields (convention)
Leave the flags in L3; remove only `meaning`; tell the training pipeline to drop fidelity when it builds the
supervision target.
- **Pros:** minimal schema change. **Cons:** Level-3 purity becomes a **pipeline convention, not a structural
  guarantee** — it re-creates exactly the unguarded-vector class this cycle exists to close (nothing stops the next
  field from creeping in), and the lint cannot cleanly tell "allowed inline fidelity flag" from "disallowed
  commentary." It treats the symptom, not the disease.

### Recommendation: **A.** It makes the supervision target pure *by construction*, gives fidelity a single
guarded home, and its new ref-check is the dangling-group-id pattern we already trust. B leaves the door open.

**Two sub-points under your ruling (smaller):**
- **(i) The Level-1 register-override fidelity** (1 of the 19). It is already in a *conditioning* layer (Level 1),
  so it does not threaten L3 purity. Lean: **move it into the parallel `fidelity` layer too** (single source of
  truth for all fidelity) — but keeping it inline-in-L1-minus-`meaning` is also defensible. Minor; your call.
- **(ii) How a ref names a component** — by `{prop_id, slot, list_position}` (reuses existing structure, no new
  ids) vs. minting stable component ids. **Lean: the path form** (no new ids). This is a plumbing detail — I'll
  decide it unless you want to.

---

## 7. File-by-file change list (after Decision #2; written for Option A)
- **`_spec/validation-rules.json`** — remove the `fidelity` `$ref` from `register_override_entry` (if moving L1) and
  remove `fidelity_groups` from `proposition`; drop `meaning` from the `fidelity` `$def`; add a top-level `fidelity`
  layer `$def` (`elements` / `groups` / `structure_flags` with `ref` objects). **Version `v0.13 → v0.14`**, re-`shasum`,
  update `_spec/pins.json`, record in `SPEC_CHANGES.md`.
- **`src/engine/vocabulary.ts`** — rewrite the SC-0027 fidelity pass: walk the top-level `fidelity` layer (not
  `event_specific_slots`); keep the shape check + dangling-group-id check (now within the layer); **add the
  L3-ref-integrity check** (every `ref` resolves to a real proposition/component/field).
- **`src/engine/lint.ts` (`lintForModel`)** — add the **L3 free-text guard**: flag any prose-shaped value / `meaning`
  key inside `level_3_propositions` (the vector). A presence rule, not a token rule.
- **Fixtures** — `fixtures/for-model/P03`, `P04`, `P06`: lift the fidelity apparatus into the parallel layer; delete
  every `meaning`. (P01/P02/P05 unchanged — no fidelity.) **Maps unchanged** (fidelity is FM-only; the SC-0029
  `FIG_0085` map wiring stays).
- **Tests** — migrate the SC-0027/0029 fidelity tests to the new structure; add the new lint-bites + ref-resolves
  (and dangling-ref-blocks) tests. Re-baseline `gold-diff` only if the deterministic compared-layer shifts (it
  should not — fidelity is not on it; verify).
- **Possible:** `compilation-log.schema.json` if it mirrors any fidelity shape (check; likely untouched).
- **Vault writeback** — the **3 FMs** (`stas/P03`, `P04`, `P06`) + the **`_spec/` writeback** (SC-0008 ritual:
  `npm run check-drift:vault` clean; confirm on the remote).

## 8. Acceptance / predictions (the evaluator's adversarial checklist)
- **Lint bites:** a deliberately-inserted `meaning` (or any prose) in FM Level 3 → **flagged** (the vector is now guarded).
- **Refs resolve / dangling blocks:** every parallel-layer `ref` resolves to a real L3 target; a deliberately-dangling
  ref → **BLOCK** (adversarial, real `validate` path).
- **No content lost from Level 3:** diff each proposition's content (tokens/ids/links/flags-of-record) before vs.
  after — the **only** change is fidelity relocated + `meaning` removed; every structured token/id is byte-preserved.
- `validate` stays **6 valid / 0 block**; the held-7 stay **quarantined** (orthogonal axes, unchanged).
- `check-drift` clean against the **new** pins (`v0.14`); spec written back to the vault; `check-drift:vault` clean
  on the **remote**.
- Tests green (migrated fidelity tests + new guard tests); `fixtures ≡ vault` byte-identical on the remote.

## 9. Governance rationale table — the relocated `meaning` content (relocate-don't-lose)
The 19 rationales removed from the FM, preserved here (the human/governance layer). `pm`=`preserve_meaning`,
`pf`=`preserve_form`. Location = where the flag now lives in the parallel layer (Option A) / stays (L1).

| # | Pericope · location | flags | rationale (verbatim from the FM, now relocated here) |
|---|---|---|---|
| 1 | P03 · L1 register_override | pm1 pf0 | the vow scene is elevated POETIC_SUNG / BLESSING at INTIMATE register — the poetic genre + intimate register classification must survive (render as elevated poetry); blessing-dominant, but closes with a CURSE-formula oath (1:17b) and the taxonomy has no exact oath/vow genre |
| 2 | P03 · P3 vow_structural_form (structure-flag) | pm1 pf0 | the six-step escalation (path → lodging → people → God → death → burial), in this order, must survive; since preserve_form is false per rung, the escalating build is preserved explicitly so a re-realization cannot re-order or collapse the rungs |
| 3 | P03 · P3 vow_components/FIRST | pm1 pf0 | Ruth binds herself to go wherever Naomi goes; the commitment survives, the 'where you go, I will go' wording is the target's to re-realize |
| 4 | P03 · P3 vow_components/SECOND | pm1 pf0 | Ruth binds herself to lodge wherever Naomi lodges; the commitment survives, the wording is re-realizable |
| 5 | P03 · P3 vow_components/THIRD | pm1 pf0 · group people_god_inseparability | belonging to Naomi's people becomes Ruth's own; bound to the God-half (see the group) |
| 6 | P03 · P3 vow_components/FOURTH | pm1 pf0 · group people_god_inseparability | belonging to Naomi's God becomes Ruth's own; bound to the people-half (see the group) |
| 7 | P03 · P3 vow_components/FIFTH | pm1 pf0 · group unto_the_end | Ruth binds herself even unto death where Naomi dies; bound to the burial-half (see the group) |
| 8 | P03 · P3 vow_components/SIXTH | pm1 pf0 · group unto_the_end | Ruth binds herself to burial in the same place as Naomi; bound to the death-half (see the group) |
| 9 | P03 · P3 group people_god_inseparability (THIRD+FOURTH) | pm1 pf0 | belonging-to-Naomi's-people and belonging-to-Naomi's-God are inseparable — the binding of the two halves, not either alone, is the theological claim that must survive |
| 10 | P03 · P3 group unto_the_end (FIFTH+SIXTH) | pm1 pf0 | the bond holds unto death and into the same final resting place — death and burial are one binding (the artifact links them via the THERE-demonstrative), not two sequential steps |
| 11 | P04 · P5 lament_components/THIRD | pm1 pf0 | Naomi ascribes her affliction to YHWH in the forensic register of a courtroom verdict spoken against her (anah bi, 'has testified against me'); the legal-accusation claim must survive. preserve_form=false: the courtroom image is preserved by FIG_0085 (Testify-Against-Legal-Image, keep-image PREFERRED), so the Performer may re-voice the exact legal wording while the image is kept |
| 12 | P06 · P6 exchange_components/THIRD | pm1 pf0 | Ruth names herself a foreigner/outsider (nokhriya); the outsider self-designation and the social gap she marks must survive. preserve_form=false: any target word for 'foreigner' carries the claim. NOTE the Hebrew wordplay nokhriya ('foreigner') / hikkirani ('you noticed me'), same n-k-r root at opposite poles — figure DEFERRED (single-verse, no recurrence data; revisit if the recognize/foreign root-play recurs in the held-out books, e.g. Jonah/Genesis) |
| 13 | P06 · P9 blessing_components/FIRST | pm1 pf0 · group blessing_reward_and_refuge | Boaz prays YHWH to repay Ruth's deed; the petition that God reward her loyalty must survive, the wording is re-realizable; bound to the wages/refuge half (see the group) |
| 14 | P06 · P9 blessing_components/SECOND | pm1 pf0 · group blessing_reward_and_refuge | Boaz prays Ruth's wages be full from YHWH under whose wings she took refuge; the refuge-under-God's-wings claim must survive. preserve_form=false: the wing-of-refuge image is preserved by FIG_0011 (Wing-of-Refuge), which opens here and closes at 3:9, so the Performer may re-voice the wording; bound to the repayment half (see the group) |
| 15 | P06 · P9 group blessing_reward_and_refuge (FIRST+SECOND) | pm1 pf0 | Boaz's blessing is one prayer in two movements: the repayment he asks of YHWH IS the full wages realized as refuge under YHWH's wings — reward and refuge are one binding, not two separable wishes |
| 16 | P06 · P11 response_components/FIRST | pm1 pf0 · group ruth_reply_grace_received_in_self_abasement | Ruth says Boaz has comforted her; the claim that he gave her comfort must survive, the wording is re-realizable; bound into the reply (see the group) |
| 17 | P06 · P11 response_components/SECOND | pm1 **pf1** · group ruth_reply_grace_received_in_self_abasement | Ruth says Boaz spoke to the heart of his shifchah (maidservant). PROTECTED WORD = 'shifchah', Ruth's lowest-rank self-designation, the load-bearing self-abasement (preserve_form=true holds the word). The idiom 'spoke to the heart' (dibber al-leb, 'spoke tenderly') is the RE-REALIZABLE part. FIG_0132 (Amah-Vs-Shifchah) registers the status motif. Mixed-fidelity element (preserve-token plus free idiom in one component); the meaning-field carries the split, no token-level schema change now; bound into the reply (see the group) |
| 18 | P06 · P11 response_components/THIRD | pm1 **pf1** · group ruth_reply_grace_received_in_self_abasement | Ruth says she is not even as one of Boaz's shifchot (maidservants) — self-abasement that is load-bearing in both claim and wording; preserve_form=true holds 'shifchah'. The amah-climb (3:9, where she rises to amah) reaches forward and is reinforcing-not-yet-load-bearing (3:9 unauthored); FIG_0132 registers the progression; bound into the reply (see the group) |
| 19 | P06 · P11 group ruth_reply_grace_received_in_self_abasement (FIRST+SECOND+THIRD) | pm1 pf0 | Ruth's reply is one move: she receives Boaz's comfort and kind speech while abasing herself below even his maidservants — the comfort-received and the self-abasement are one bound response, not three separable statements; the binding must survive (the per-element preserve_form values still govern each statement's wording) |

> This table — *plus* the structured flags themselves in the parallel `fidelity` layer — is the complete record.
> The mixed-fidelity flag on #17 and the deferred-figure note on #12 (both recurrence-gated for the held-out books)
> survive here unchanged.

## 10. Honesty notes
- **This fixes my own regression.** SC-0027/0029 (mine) introduced the commentary-in-L3 and the
  conditioning-in-content. The evaluator verified those cycles adversarially but (its own logged lesson) did not
  ask "does this *belong* in the supervision target." Owned.
- **The fidelity model is unchanged** — every A–F and vow ruling, every flag value and grouping, is preserved
  exactly; only the **placement** moves and the **commentary** is removed. No meaning call is re-opened.
- **Nothing is built or locked until Marcia rules Decision #2 (§6).**
