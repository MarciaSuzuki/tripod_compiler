# SC-0016 — P02–P06 §4 adjudication list (PROPOSED — for Marcia's ruling)

> The operating test applied to every §4 finding the extended lint surfaces. **Mechanical** items I will
> apply on your go-ahead (cross_ref removal → figure-registry relocation). **Exegetical** items are
> *proposals only* — each is yours to rule (Apply / Modify / Keep-as-payload / Drop). Nothing here is
> applied yet. Wordings follow the blessed-P01 granularity ("What happened? → famine"): bare, atomic, plain.
>
> Legend: **[MECH]** = mechanical, I apply. **[EXEG]** = needs your ruling. Each EXEG row: *as-written →
> proposed*. "Conditioning" = the analytic insight is preserved by moving it to the flag/figure layer (it is
> almost always already there in §5), not deleted.
>
> True inventory (per-proposition counts): **60 cross_ref · 21 meta-question · 39 compound · 19 jargon · 11 label = 150** (P01 + 6 FOR_MODELs clean).

---

## Cross-cutting rulings that would resolve many rows at once
Three recurring patterns. One ruling each collapses dozens of rows — please rule these first:

- **(C1) Bracketed analytic glosses in answers** — e.g. `(distributive; hypothetical)`, `(state at return; YHWH as agent)`, `(verb-phrase closing the road)`, `(Moabite collective; Moabite deities)`. **Proposed default:** keep the bare payload, drop the parenthetical gloss (the nuance rides on the existing CB_/FIG_ flag). Applying C1 clears most `compound` and several `forbidden_vocabulary` rows. *Rule once; I apply to all unless you flag exceptions.*
- **(C2) Analytic "What-kind-of-form" questions** — `Construction form?`, `Verb-chain form?`, `Structural form?`, `Form pattern?`, `Attention-marker form?`, `Arrival completion marker?`, `Anah-bi construction?`, `Address form?`, `Question form?`/`Question type?`, `… part?` labels. **Proposed default:** convert each to the *payload* question that elicits the event/word the model says, and move the form-analysis to conditioning. Per-row proposals below.
- **(C3) Entity-list answers** are already exempt (the guard passed them). No action — listed nowhere below. Confirming so you know they were considered and left.

---

## P02 — Ruth 1:6–14  (15 findings: 2 cross_ref · 7 compound · 5 jargon · 1 label)

### Mechanical
- **[MECH]** §4 Prop-block: remove `cross_ref: FIG_0013 … closes here; opened at P01 Proposition 2` → FIG_0013 registry (also in §5B, kept).
- **[MECH]** §4 Prop-block: remove `cross_ref: FIG_0012 … opens here; cross-pericope pair closes at P07 (2:23)` → FIG_0012 registry (also in §5B).

### Exegetical (your ruling)
| # | As-written (§4) | Proposed | Kind |
|---|---|---|---|
| 1 | `**A:** arising and going out` | split → `arising` · `going out` (two atoms) | compound |
| 2 | `**A:** kissing and weeping` | split → `kissing` · `weeping` | compound |
| 3 | `**A:** kissing and turning back` | split → `kissing` · `turning back` | compound |
| 4 | `**A:** repeated directive with age-statement and hypothetical` | this is a *label*, not payload → replace with the atoms actually said: `turn back` · `go` (already at Prop "Directive content?"); move "age-statement / hypothetical" to conditioning | compound + label |
| 5 | `**A:** each in the house of her husband (distributive; hypothetical)` | C1 → `each in the house of her husband`; drop `(distributive; hypothetical)` | compound |
| 6 | `**A:** refusal with counter-declaration` | bare the act → `refusing` (the SPEECH_ACT `REFUSES_REQUEST_WITH_COUNTER_DECLARATION` already carries the type, as conditioning) | label |
| 7 | `**Q:** First rhetorical-question subject? **A:** the daughters' going with Naomi` | C2: drop "rhetorical-question subject?" → `**Q:** What does she ask about first? **A:** the daughters going with her`; "rhetorical" = conditioning | jargon (`subject`) |
| 8 | `**Q:** Second rhetorical-question subject? **A:** sons in Naomi's womb (none)` | → `**Q:** What does she ask about next? **A:** sons in her womb`; keep "(none)" as the significant-absence it encodes, or move to absence-note (your call) | jargon (`subject`) |
| 9 | `**Q:** With what verb? **A:** davqah (dabaq root)` | C2: → `**Q:** What did Ruth do? **A:** clung`; the dabaq root-image is conditioning (CB_0018 / FIG_0012) | jargon (`verb`) |
| 10 | `**A:** turn back; go` | split → `turn back` · `go` | compound |
| 11 | `**Q:** First-question subject? **A:** waiting for the hypothetical sons to grow up` | C2: → `**Q:** What does she ask first? **A:** would you wait for sons to grow up`; "hypothetical" → conditioning | jargon (`subject`) |
| 12 | `**Q:** Second-question subject? **A:** restraining from husbands meanwhile` | C2: → `**Q:** What does she ask next? **A:** would you keep from marrying meanwhile` | jargon (`subject`) |

---

## P03 — Ruth 1:15–18  (11 findings: 5 cross_ref · 5 compound · 1 meta-question)

### Mechanical
- **[MECH]** remove 5 §4 cross_ref/link lines → registry: `FIG_0072` (path-lodging vow), `FIG_0074` (death-burial), `FIG_0075` (self-curse oath); `CB_0021` (people-and-god pairing) and `CB_0020` (oath self-curse) relocate to §5A concept semantics (both already in §5A). All also present in §5A/§5B (kept).

### Exegetical (your ruling)
| # | As-written (§4) | Proposed | Kind |
|---|---|---|---|
| 1 | `**A:** look, your sister-in-law has gone back` | `look,` is a discourse opener, not a 2-act compound — **propose KEEP** as one payload (the comma rule is tier-2/over-broad here). Or split `look` · `your sister-in-law has gone back` if you want the presentational *hinneh* atomized | compound (likely false-positive) |
| 2 | `**A:** her people and her gods (Moabite collective; Moabite deities)` | split → `her people` · `her gods`; C1 drop `(Moabite collective; Moabite deities)` (rides on CB_0004) | compound |
| 3 | `**A:** go back, after your sister-in-law` | bare → `go back` (the "after your sister-in-law" is the exemplar already in the prop); or keep as one — your call | compound |
| 4 | `**Q:** Structural form? **A:** six-step ladder from movement to identity to mortality` | C2: this whole Q&A is analysis, not payload — the six vow bindings ARE the payload (path/lodging/people/god/death/burial, already atomized in the FOR_MODEL `vow_components`). **Propose: drop this meta-Q&A entirely**; the "six-step ladder" insight → conditioning (FIG_0072/0074 + the prop's components) | meta-question |
| 5 | `**A:** may YHWH do thus to me and worse` | oath formula — **propose KEEP** as one unit (splitting "do thus to me" / "and worse" breaks the fixed self-curse formula); the `and` here is formulaic, not two acts. Your call | compound (formula) |

---

## P04 — Ruth 1:19–22  (43 findings: 19 cross_ref · 9 meta-question · 8 compound · 7 jargon)

### Mechanical
- **[MECH]** remove all 19 §4 cross_ref/link lines → registry. Figures: FIG_0013, FIG_0082, FIG_0083, FIG_0006, FIG_0084, FIG_0086, FIG_0088, FIG_0001. Concept pointers (CB_0023/0024/0044/0025/0017/0004/0026) → §5A. **Every one is already in §5A/§5B (verified).**

### Exegetical (your ruling)
| # | As-written (§4) | Proposed | Kind |
|---|---|---|---|
| 1 | `**A:** walking and arrival` | split → `walking` · `arrival` (or `arriving`) | compound |
| 2 | `**Q:** Arrival completion marker? **A:** "until they came" (verb-phrase closing the road)` | C2: → `**Q:** Until what? **A:** until they came`; drop `(verb-phrase closing the road)` (R4 jargon) | meta-q + compound + `verb` |
| 3 | `**Q:** Divine agent named? **A:** Shaddai (first occurrence in book)` | → `**Q:** Whom does she name? **A:** Shaddai`; drop "agent" (R4); "(first occurrence)" → conditioning (FIG_0006) | jargon (`agent`) |
| 4 | `**Q:** Verb root? **A:** hemar (bittered, hifil of mrr) — root-pun with the proposed name Mara` | C2: → `**Q:** What did Shaddai do to her? **A:** made her bitter`; the hemar/Mara root-pun is conditioning (FIG_0083); drop "hifil"/"verb root" (R4) | meta-q + `verb` + `hifil` + compound |
| 5 | `**A:** Naomi's lament account, four parts` | label, not payload → drop this header-Q&A; the four parts ARE the payload (rows 6–9) | (header) |
| 6 | `**Q:** First part? **A:** "I went out full" (state at departure)` | C2: → `**Q:** What does she say first? **A:** I went out full`; drop `(state at departure)` | meta-q (`… part?`) |
| 7 | `**Q:** Second part? **A:** "and YHWH brought me back empty" (state at return; YHWH as agent)` | → `**Q:** What next? **A:** YHWH brought me back empty`; C1 drop `(state…; YHWH as agent)` (R4 "agent") | meta-q + compound + `agent` |
| 8 | `**Q:** Empty-lexeme? **A:** riqam (empty-handed)` | C2: → `**Q:** Brought back how? **A:** empty-handed`; drop "lexeme" (R4); riqam → conditioning (CB_0044) | jargon (`lexeme`) |
| 9 | `**Q:** Third part? **A:** "Why do you call me Naomi?" (rhetorical recall…)` | → `**Q:** What does she ask? **A:** why do you call me Naomi`; drop the "(rhetorical recall)" gloss | meta-q |
| 10 | `**Q:** Fourth part? **A:** "when YHWH has testified against me and Shaddai has done evil to me" (two divine attributions)` | → split into two atoms: `YHWH has testified against me` · `Shaddai has done evil to me`; drop "(two divine attributions)" | meta-q + compound |
| 11 | `**Q:** Anah-bi construction? **A:** courtroom-legal "testified against me" (YHWH as adversarial witness)` | C2: this is analysis of row 10's first atom — **propose drop** (the payload "testified against me" is already in row 10); courtroom-witness nuance → conditioning (CB_0025) | meta-q (`construction`) |
| 12 | `**Q:** Hera-li construction? **A:** "Shaddai has done evil to me" …` | C2: same — **propose drop** (payload already in row 10); → conditioning (FIG_0086) | meta-q (`construction`, confirmed flagged) |
| 13 | `**Q:** Working time-code? **A:** TM_BARLEY_HARVEST_BEGINNING (no formal TM_ …)` | this is a registration note, not payload → move the whole note to a §3D/registration comment; payload is `**Q:** When? **A:** at the start of the barley harvest` | (registration meta) |

---

## P05 — Ruth 2:1–7  (44 findings: 21 cross_ref · 10 compound · 9 meta-question · 4 jargon)

### Mechanical
- **[MECH]** remove all 21 §4 cross_ref/link lines → registry. Figures: FIG_0090, FIG_0134, FIG_0018, FIG_0015, FIG_0088, FIG_0092, FIG_0093, FIG_0094, FIG_0091, FIG_0001. Concept pointers (CB_0032/0034/0033/0035/0008/0036/0004) → §5A. **All already in §5A/§5B.**

### Exegetical (your ruling)
| # | As-written (§4) | Proposed | Kind |
|---|---|---|---|
| 1 | `**A:** narrator pauses the storyline; introduces Boaz` | split → `narrator pauses the storyline` · `introduces Boaz`; or, since "narrator pauses" is meta-narration: payload = `introduces Boaz`, the pause → conditioning. Your call | compound |
| 2 | `**A:** to go to the field and glean among the ears of grain` | split → `go to the field` · `glean among the ears of grain` | compound |
| 3 | `**A:** "go, my daughter"` | `go, my daughter` — vocative, not 2 acts → **propose KEEP** as one payload (comma false-positive) | compound (likely false-positive) |
| 4 | `**Q:** Verb-chain form? **A:** three-verb arrival-and-gleaning chain (went, came, gleaned)` | C2: → replace the label with the atoms `went` · `came` · `gleaned` (already at "Ruth went, came, gleaned"); drop "three-verb chain" (R4) | meta-q + `verb` |
| 5 | `**Q:** Construction form? **A:** vayyiqer miqreha — double-cognate chance-providence construction; agent withheld` | C2: → `**Q:** What happened? **A:** her chance chanced upon Boaz's field` (or `she happened upon Boaz's portion`); the double-cognate providence + withheld-subject → conditioning (CB_0035/FIG_0015); drop "construction"/"agent" (R4) | meta-q + `agent` + compound |
| 6 | `**Q:** Attention-marker form? **A:** "and behold" (hinneh) — narrator's pointing gesture` | C2: → `**Q:** Then what? **A:** and behold`; the *hinneh* pointing-gesture → conditioning | meta-q |
| 7 | `**Q:** Form pattern? **A:** standard Israelite greeting and return-blessing in matched form` | C2: → the payload is the greeting itself (the "YHWH be with you" / "YHWH bless you" exchange — already in FIG_0092/0093); **propose drop** this analytic Q&A, or replace with `**Q:** What is said? **A:** YHWH be with you` · `YHWH bless you` | meta-q + compound |
| 8 | `**Q:** Question form? **A:** "whose young woman is this?"` | C2: → `**Q:** What does Boaz ask? **A:** whose young woman is this` | meta-q (`… form?`) |
| 9 | `**Q:** Question type? **A:** kinship-and-social-cover question … not ownership` | C2: this is analysis of row 8 → **propose drop**; the "cover not ownership" reading → conditioning (FIG_0094) | meta-q |
| 10 | `**Q:** Third part — quoted prior request? **A:** "…Let me glean, please, and gather among the sheaves…"` | keep the quoted speech as payload but atomize the inner compound: `let me glean` · `and gather among the sheaves after the reapers`; drop "Third part —" label | meta-q + compound |
| 11 | `**Q:** Fourth part — work-pattern? **A:** "she came and has continued from morning until now"` | → `she came` · `has continued from morning until now`; drop "Fourth part — work-pattern" | meta-q + compound |
| 12 | `**Q:** Fifth part — shelter clause (textually disputed)? **A:** "…the shelter has been only a little" — Hebrew … held open` | C2: → `**Q:** Fifth thing reported? **A:** her resting in the shelter has been only a little`; drop "clause" (R4); keep the "textually disputed / held open" as a conditioning note (it's a real text-critical flag) | meta-q + `clause` |

---

## P06 — Ruth 2:8–16  (37 findings: 13 cross_ref · 10 label · 9 compound · 2 meta-question · 3 jargon)

### Mechanical
- **[MECH]** remove all 13 §4 cross_ref/link lines → registry. Figures: FIG_0105, FIG_0100, FIG_0103, FIG_0011, FIG_0132, FIG_0102, FIG_0104, FIG_0106, FIG_0101, FIG_0107, FIG_0018. Concepts (CB_0033/0038/0037/0008/0012/0034) → §5A. **All already in §5A/§5B.**

### Exegetical (your ruling) — P06 is the interpretive-label-heavy one
| # | As-written (§4) | Proposed | Kind |
|---|---|---|---|
| 1 | `**A:** glean in another field; pass on from this one` | split → `glean in another field` (negated — "do not") · `pass on from this one` (negated) | compound |
| 2 | `**A:** further instruction about gleaning position` | label, not payload → replace with the act said: `keep your eyes on the field being reaped` · `go after the young women` (already the next Q&A) → **propose drop** this label-row | label (`instruction about`, `further instruction`) |
| 3 | `**A:** Boaz reports a prior command` | label → bare the act: `I have ordered the young men not to touch you` (the reported prohibition); drop "reports a" framing | label (`reports a`) |
| 4 | `**A:** instruction about water` | label → replace with the act: `go to the vessels` · `drink what the young men draw` (next Q&A) → **propose drop** the label-row | label (`instruction about`) — *note: not currently lint-flagged but same R3 class; your call* |
| 5 | `**A:** go to the vessels and drink from what the young men draw` | split → `go to the vessels` · `drink from what the young men draw` | compound |
| 6 | `**A:** Boaz answers with full-knowledge declaration` | label-stack → bare: `it has been fully told to me, all you did for your mother-in-law` (the recital itself); drop "answers with / full-knowledge / declaration" | label (`answers with`, `full-knowledge`, `declaration`) |
| 7 | `**A:** Boaz recites what Ruth did` | label → the recital atoms are the payload (rows below: "her husband's death", "left her father and mother", "came to an unknown people"); drop "recites" framing | label (`recites`) |
| 8 | `**A:** come here, eat from the bread, dip your morsel in the vinegar` | split → `come here` · `eat from the bread` · `dip your morsel in the vinegar` (three atoms — the brief's example) | compound |
| 9 | `**A:** further command about deliberate pulling` | label → bare: `pull out some from the bundles for her` + `Manner? deliberately` (already next Q&A); drop "further command about" | label (`further command`) |
| 10 | `**A:** further command and prohibition` | label → bare the acts: `leave them for her to glean` · `do not rebuke her`; drop the label | label + compound (`and`) |
| 11 | `**Q:** Address form? **A:** "my daughter"` | C2: → `**Q:** How does he address her? **A:** my daughter` | meta-q (`… form?`) |
| 12 | `**Q:** Address form? **A:** "my lord" …` | C2: → `**Q:** How does she address him? **A:** my lord` | meta-q (`… form?`) |
| 13 | `**Q:** First verb? / Second verb? / Third verb? **A:** she ate / she was satisfied / she had leftover` | C2: → `**Q:** What happened? **A:** she ate` · `she was satisfied` · `she had leftover` (drop "First/Second/Third verb?"; the triplet is conditioning FIG_0104) | jargon (`verb`) |

---

## What I will do on your go-ahead
1. Apply every **[MECH]** cross_ref removal (P02–P06) + the FIG span relocations per `FIG-span-relocations.proposed.md` (fixtures now; vault patch deferred per your ruling).
2. Apply the **[EXEG]** rows **exactly as you rule them** (Apply / Modify / Keep / Drop per row, and your C1/C2 defaults).
3. Re-run the full gate: `lint --corpus` → target **0** §4 findings; `validate` 6/6 · `coverage` 6/6 · `gold-diff` unchanged · `npm test` green · `check-drift` clean.
4. Record SC-0016 APPLIED with a per-proposition log (mirroring the SC-0013 relocation audit), and hand you the vault patch + gate results for blessing + Architect review.
