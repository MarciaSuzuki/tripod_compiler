# SC-0029 — Held-7 fidelity seeding (the fidelity model on its designated test corpus)

> Plan-first ruling-gate (Architect 11, 2026-06-07). The continuation of the GOAL: SC-0027 built the
> `preserve_meaning` × `preserve_form` fidelity model and proved it on the Ruth 1:16 vow (P03). The **held-7**
> were quarantined *to be* its first real annotated corpus. This doc applies the model to all 7 and hands
> **every preserve/render and grouping call to Marcia** — exactly as the vow rungs were ruled.
> **Nothing locks until Marcia rules and approves.** Read with `docs/THREAD-B-PROPOSAL.md` (the model),
> the POST-SC0027 handoff (Part IV, the model as built), and `_spec/quarantined-vocabulary.json` (the held-7).
> SC-ID: SC-0028 is reserved-by-proposal for genre-homing (branch `genre-register-homing`); held-7 = **SC-0029**.

---

## 0. The point, in one paragraph
The fidelity model lets the interlingua tell the downstream **Performer** (the model that re-says the meaning
in the target low-resource language) **what must survive translation vs. what is one language's way of saying
it.** The held-7 are 7 `action` labels deliberately *not* collapsed in Thread A (SC-0024) and *not* enforced as
types (SC-0025), precisely because **meaning and form diverge** in them — they carry load-bearing detail a bare
verb would lose. That makes them the model's intended test corpus. SC-0029 annotates each with a `fidelity` flag,
and (where the text binds elements) a `fidelity_group`. **The calls are exegetical — they are Marcia's.**

## 1. What SC-0029 is — and the TWO separable deliverables
This cycle can legitimately produce **two** things, and they must land **separately**, each gate-verified:

1. **Corpus seeding (the main deliverable).** Annotate the held-7 with `fidelity` (and groups where ruled).
   The engine + schema already support this (SC-0027). The clean cases — the P04 lament, the P06 *nokhriya*,
   the P09 blessing pair — seed under the **current single-membership** schema regardless of (2) below.
2. **A possible schema extension (only if 2:13b forces it).** Today an element names **one** `fidelity_group`
   (`fidelity_group` is a single string — `_spec/validation-rules.json` `$defs.fidelity.fidelity_group`;
   engine `src/engine/vocabulary.ts` `checkFidelity`). If Marcia's Ruth 2:13 ruling requires **one element to
   sit in two relationships at once** (the *shifchah* status — see §4F), that is a single→multi-membership
   schema change. It is **its own sub-decision: plan-first, Marcia's approval before any schema is cut, NOT
   bundled into the seeding.** The vow never produced this case; 2:13b is the one that might.

## 2. The model (recap) + the discriminator
A `fidelity` object on an element carries two booleans:
- **`preserve_meaning`** — the claim/content must survive translation.
- **`preserve_form`** — `true` = the exact wording is load-bearing; **`false`** = the Performer may re-realize the
  wording (the "means, not mandate" license — there is no second field that could disagree with it).
- **`meaning`** — free text stating *what* `preserve_meaning` protects.
- **`fidelity_group`** — optional; binds this element to a proposition-level `fidelity_groups` entry whose **own**
  `fidelity` carries the *relationship's* claim (e.g. "these two are inseparable"). The engine checks the
  reference resolves (dangling-group-id check).

**The discriminator (the "different-language test", handoff Part V):** *if a re-realization in another language
can drop X and still carry the claim, X is form → `preserve_form=false`; if dropping X loses the claim, X is
meaning → preserve it.* Applied per label below.

**Affirmed principle being applied to routine cases (Marcia's vow rulings):** a theological claim whose specific
wording is re-realizable = `preserve_meaning=true`, `preserve_form=false`; **group iff the text structurally
binds — never add a group for symmetry.** Per the delegation rule, the routine instances take this default
(documented); the genuinely-open calls (§4) STOP for Marcia.

## 3. The gate — all 7 held labels (DRAFT calls; Marcia rules each)
Locations verified against the fixtures (1 in P04, 6 in P06). Draft = my recommendation via §2; **not decided.**

| # | Verse | Label (`action`) | Plain content | Draft `preserve_meaning` | Draft `preserve_form` | Group candidate |
|---|---|---|---|---|---|---|
| 1 | 1:21 (P04, P5) | `ASCRIBED_COURTROOM_TESTIMONY_TO_YHWH` | "YHWH has testified against me" (*ʿanah bi*, legal idiom) | **true** | **OPEN — §4A** | none new (FIG_0195 already carries the fourfold-naming relationship) |
| 2 | 2:10 (P06, P6) | `STATED_SELF_AS_FOREIGNER` | "and I a foreigner" (*nokhriya*) | true | **OPEN — §4B** | none |
| 3 | 2:12 (P06, P9) | `WISHED_YHWH_TO_REPAY_HER_WORK` | "may YHWH repay your deed" | true | false (lean) | **§4E: blessing pair?** |
| 4 | 2:12 (P06, P9) | `WISHED_FULL_WAGES…WINGS_OF_REFUGE` | "may your wages be full from YHWH, under whose wings you took refuge" (*kanaf*) | true | **OPEN — §4C** | **§4E: blessing pair?** |
| 5 | 2:13 (P06, P11) | `STATED_THAT_HE_COMFORTED_HER` | "you have comforted me" (*nihamtani*) | true | false (lean) | **§4F: 2:13 triple?** |
| 6 | 2:13 (P06, P11) | `STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH` | "spoke to the heart of your maidservant" (*dibber ʿal-leb*; *shifchah*) | true | **OPEN — §4D** | **§4F: 2:13 triple + multi-membership?** |
| 7 | 2:13 (P06, P11) | `STATED_SHE_IS_NOT_AS_ONE_OF_HIS_SHIFCHOT` | "though I am not as one of your maidservants" (*shifchot*) | true | **OPEN — §4D** | **§4F: 2:13 triple + multi-membership?** |

Draft default where not flagged OPEN: `preserve_meaning=true`, `preserve_form=false` (claim survives, wording re-realizable).

## 4. The genuinely-open calls (STOP — Marcia's exegetical rulings)
Each is a real meaning call the vow's affirmed default does **not** settle. My lean is given for transparency, not as a decision.

- **(A) P04 courtroom register.** Is the *forensic* framing ("testified against me", as a courtroom verdict —
  not merely "afflicted me") load-bearing **form** (`preserve_form=true`)? Or re-realizable, with the
  legal-accusation sense protected in `meaning` (`preserve_form=false`)? *This label was held precisely because
  the courtroom detail is not reducible to bare "ASCRIBED" (its siblings collapsed; it did not).* Lean: `false`
  with `meaning`="Naomi accuses God of testifying against her as in a lawsuit" — **but if you judge the forensic
  register itself untranslatable-if-dropped, it is `true`.**
- **(B) P06 *nokhriya* wordplay.** Same verse pairs *hikkirani* ("you noticed me") with *nokhriya* ("foreigner")
  — same n-k-r root, opposite poles. Is that wordplay load-bearing (→ `preserve_form=true`, or better a
  **figure**), or do we let the "foreigner" claim travel in any word (`preserve_form=false`)? Lean: `false`;
  capture the wordplay as a figure/cross-ref if you want it preserved, not as form on this element.
- **(C) P06 *kanaf* / wings of refuge.** The wing-of-refuge image echoes Boaz's own "spread your wing over your
  servant" in 3:9 (a book-level echo: Ruth later asks Boaz to *be* the kanaf he here invokes of YHWH). Is the
  wing image load-bearing **form** here, or is the protection-claim what survives (`preserve_form=false`) with
  the 3:9 echo carried as a **figure / cross-pericope binding**? Lean: `false` + figure for the echo (it spans
  pericopes — exactly what (α) group-ids / figures are for).
- **(D) P06 *shifchah* status-word.** Ruth calls herself Boaz's *shifchah* (lowest maidservant rank), then says
  she is "not even as one of his *shifchot*." In 3:9 she upgrades to *amah* (higher rank) — a deliberate
  progression. Is *shifchah* here load-bearing **form** (the low rung of that progression, → `preserve_form=true`
  or a cross-pericope binding to 3:9), or a re-realizable "servant" (`preserve_form=false`)? **Your call.**
- **(E) P09 grouping — blessing pair.** Are the two wishes **one binding** (Boaz's single blessing: the reward
  IS the refuge-under-YHWH's-wings → a `fidelity_group`) or **two sequential wishes** (no group)? The artifact
  already co-locates them (one proposition, one `speech_act`, one invoked agent). Same shape as the vow's
  accompaniment(0+1) / unto-the-end(4+5) calls — **inseparable, or merely sequential?**
- **(F) P11 grouping — the 2:13 triple, and the multi-membership question.** Do the three statements
  (comforted / spoke-to-heart-of-his-*shifchah* / not-as-one-of-his-*shifchot*) bind into a group (Ruth
  receiving grace while abasing herself, as one move)? **And** — the load-bearing case — the *shifchah*
  status-word appears in **two** of the three (#6, #7). If you rule that (i) the triple binds **and** (ii) the
  two *shifchah* statements bind to each other (claim-and-disclaim) **and/or** (iii) *shifchah* binds across
  pericopes to 3:9's *amah*, then **one element would need to belong to more than one group at once** — which
  the current schema cannot express. That triggers the §1(2) / §5 schema sub-decision. **If instead one group
  suffices, no schema change is needed.**

## 5. The schema sub-decision (single→multi membership) — plan-first, only if §4F needs it
If 2:13b requires multi-membership: change `fidelity.fidelity_group` from a single string to **either** a single
string **or** an array of strings (additive, backward-compatible — every existing single-string ref stays valid),
and update the engine's `checkFidelity` to collect each id in the array for the dangling-group-id check. Small,
contained, adversarially testable (a dangling id inside an array must still block). **But it is a change to the
fidelity model's shape, so: a separate plan, Marcia's approval, its own gate — never folded silently into the
seeding.** If §4F resolves to single-membership, this section is dropped.

## 6. Plan / sequence (nothing built before Marcia rules §4)
1. **This gate → Marcia rules** the §4 calls (A–F) and confirms the §3 defaults.
2. **Seed the clean cases** (whatever resolves to single-membership) into `fixtures/for-model/P04…` and
   `…P06…`: add the `fidelity` objects + any ruled single-membership `fidelity_groups`. Re-validate.
3. **If §4F needs multi-membership:** stop, write the §5 schema mini-plan, get approval, cut it as a separate
   step (spec version bump + pins + `SPEC_CHANGES.md`), *then* seed the 2:13 group.
4. **Gate-verify** (below). Show Marcia the diff.
5. **Vault writeback** (human-gated: Marcia pauses Obsidian Git; I transcribe to `stas/`; the cron pushes;
   confirm it reaches the vault **remote** — the SC-0008 lesson). Then PR pair (compiler + vault), Marcia merges.

## 7. Predictions / acceptance
- After seeding: `validate fixtures/for-model/` stays **6 valid · 0 block · 0 drift**; the seeded held labels
  still appear as **quarantined** (fidelity annotation does not promote them to types — orthogonal axes).
- `check-drift` clean (no spec change) **unless** §5 fires, in which case the version bump + re-pin is recorded
  and `check-drift` stays clean against the new pins.
- The dangling-group-id check **bites**: every `fidelity_group` referenced by a held label resolves to a
  declared `fidelity_groups` entry (adversarial test: a deliberately-dangling ref blocks).
- `fidelity-shape` check bites: a held `fidelity` missing a boolean blocks.
- Tests rise by the new fixture assertions; existing 159 stay green; the 1 vault-guard skip unchanged.

## 8. Honesty notes
- **Nothing is committed/locked.** This is a ruling-gate; no fixture or schema edit until §4 is ruled.
- **The form-questions (§4A–D) and grouping (§4E–F) are Marcia's**, not mine — leans are shown for transparency.
- The held-7 are **quarantined and intact**; seeding them with fidelity does **not** un-quarantine them
  (quarantine = "no frequency data, revisit at P07–P14"; fidelity = "preserve vs render"). Orthogonal; both stay.
- Whether §5 (multi-membership) is needed is **unknown until 2:13b is ruled** — it may not be. Better surfaced now.

---

## 9. RULINGS (Marcia, 2026-06-07) + figure verification (Architect 11) — supersedes the OPEN items in §3–§5

**Marcia's rulings:**
- **All 7:** `preserve_meaning = true`.
- **(A) 1:21 courtroom** — `preserve_form = false` **+ figure** (keep the legal image, free the wording). NOT
  `preserve_form=true` (that would mandate the exact legal phrasing; the figure keeps the courtroom image while
  the Performer re-voices it). Makes **A/B/C a consistent triad** (false + figure).
- **(B) 2:10 *nokhriya*** — `preserve_form = false` **+ figure if kept** (may need creating).
- **(C) 2:12 wings** — `preserve_form = false` **+ figure** (existing).
- **(D) 2:13 *shifchah*** — `preserve_form = true` on the in-corpus self-abasement (the *word* preserved). The
  amah-climb rationale **reaches forward** (3:9 unauthored) → *reinforcing, not yet load-bearing*; the existing
  Amah-Vs-Shifchah figure registers the progression (belt-and-suspenders).
- **(E) blessing pair + (F) reply triple** — **two new `fidelity_groups`**, same shape as the vow's pairs;
  **NO schema change.** Each element sits in **one** group → the §1(2)/§5 single→multi-membership extension is
  **NOT triggered**. SC-0029 is **pure seeding + figure-wiring; no spec version bump.**

**Figure verification (Architect 11, vs `_spec/registry/ruth.figures.json` + vault `figures/`):**
- **A → `FIG_0085` Testify-Against-Legal-Image — EXISTS** (the exact name given). Canonical file: `hebrew: יהוה ענה
  בי`; `intended-meaning: "Naomi reading her life as a verdict spoken against her; the legal frame is
  significant"`; `appears-in: [P04]`; `keep-image: PREFERRED`; related `CB_0025-Testify-Against-Anah-Bi`.
  **Home confirmed = P04 1:21.** Currently wired into **no** proposition's `figure_flags` (pre-existing gap),
  though `CB_0025` *is* already in P04 P5 `cb_flags`. **Action: wire `FIG_0085` → P04 P5 `figure_flags`** (closes the gap; completes the concept/figure pair).
- **C → `FIG_0011` Wing-of-Refuge — ALREADY wired** to P06 P9, `cross_ref` already notes the 3:9 closure. **No figure-wiring needed — just the element flag.**
- **D → `FIG_0132` Amah-Vs-Shifchah — ALREADY wired** to P06 P11, `cross_ref` "opens here at first half (shifchah)." **No figure-wiring needed — just the element flag.**
- **B → no matching figure** (`FIG_0080` Is-This-Naomi-Recognition-Question, `FIG_0150`
  Before-One-Could-Recognize-His-Neighbor are *different* recognition motifs). **Net-new if created.**

**Resolved build shape (no schema change):** annotate the 7 components with `fidelity`; `preserve_form=false`
on all except D's two *shifchah* elements (`true`); wire `FIG_0085`→P04 P5; reference the already-wired
`FIG_0011` (C) / `FIG_0132` (D) in the `meaning`; add two proposition-level `fidelity_groups` (E over the two
blessing wishes, F over the three reply statements), each group's own `fidelity` carrying the relationship claim.

**Two micro-items still open (small; surfaced before any write):**
1. **B's figure — create / reference / defer.** Figure bar = "a FIG earns a code only for a *recurring* image to
   preserve"; against that, the n-k-r "recognize" root already has a registered motif family (`FIG_0080`,
   `FIG_0150`) and *nokhriya/hikkirani* is one pole of it. (i) create a new FIG; (ii) reference an existing
   recognition FIG; (iii) **defer** — `preserve_form=false` alone, wordplay recorded in `meaning`, revisit on
   recurrence. *Lean: (iii)* (single-verse, no recurrence data; matches the quarantine discipline). Registry
   addition = Marcia's call.
2. **D — element granularity on #6** (`STATED_THAT_HE_SPOKE_TO_HEART_OF_HIS_SHIFCHAH`). Bundles a re-realizable
   idiom (*dibber ʿal-leb*, "spoke tenderly") **and** the load-bearing *shifchah* self-designation. (a) **form=true
   on #6 + #7**, `meaning` naming *shifchah* as the protected token (idiom rides along); (b) **#7 true, #6 false**
   + `FIG_0132` carries the *shifchah* token (frees the idiom — parallels A/C). *Lean: (a)* (fidelity to "the word
   preserved"). #5 (`COMFORTED_HER`) stays the routine default `false`.

**RESOLVED (Marcia, 2026-06-07):** (1) **B → defer (iii)** — figure-analogue of quarantine; wordplay recorded in
`meaning`; flagged for held-out recurrence (Jonah/Genesis). (2) **D #6 → (a)** `preserve_form=true` with a precise
`meaning` naming *shifchah* as the protected token and the *dibber ʿal-leb* idiom as re-realizable; #6 logged as a
**mixed-fidelity element** (token-level refinement recurrence-gated, no schema change now). **Built + gate-verified
2026-06-07** (validate 6/6 0-block · held-7 still quarantined · gold-diff P04 38→39 · id-check 6 clean/0-dangling ·
lint 0/7 · coverage 6/6 · 159 tests +1 skipped; adversarial dangling-group + fidelity-shape confirmed blocking).
**No schema change.** Vault writeback (P04 map+FM, P06 FM) pending (human-gated).
