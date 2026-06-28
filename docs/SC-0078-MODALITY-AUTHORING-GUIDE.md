# Level-3 modality — one-page authoring guide (SC-0078)

For map authors & reviewers. **The point:** a model reading the FOR_MODEL must never mistake *said /
intended / permitted / conditional* content for *narrated fact*. Tag the non-factual units so it can't.

## The cold-read test
For each Level-3 unit ask: **would reading this cold make the model take said/intended/conditional/permitted
content as something that happened?** If yes, tag it. The default is "no" — an occurred storyline event needs
no tag.

## Decision tree (in order)
1. **Occurred storyline event?** → leave it. `status: ASSERTED` is the unmarked default — **omit it**.
2. **Voiced/written by a participant?** → put it under the speech head with the right **`speech_act`**
   (the closed list — directs / proposes / petitions / asks / prescribes / advises / resolves / alleges / …).
   *Inner speech ("said in his heart")* → the base illocution + set `addressee` = the speaker's own
   being-code (e.g. Haman 6:6 → `speaker: B-haman, addressee: B-haman, speech_act: ASKS_DELIBERATIVE_QUESTION`).
3. **A purpose or a condition?** → a relation **link** (`purpose_of` / `condition_of`) to its head — **not** a
   `status` value (purpose/condition are carried by the links; double-tagging drifts).
4. **Otherwise non-factual** (permitted / foreseen / recalled / counterfactual / standing-law / habitual)?
   → a **`status`** tag (see the list).

## `status` values (bounded-open — a new one surfaces as drift for a ruling, never coin it silently)
| value | use |
|---|---|
| `PERMITTED` | authorized/granted, not asserted to occur — "granted leave to destroy" (8:11) |
| `FORESEEN` | predicted/anticipated future — "the women will despise their husbands" (1:17) |
| `RECALLED` | a past event reported *inside* current speech, ≠ narrative time — the 9:24-25 recap |
| `COUNTERFACTUAL` | contrary to fact — "had we been sold as slaves, I would have kept silent" (7:4) |
| `NORM` | a standing law/rule stated as binding — the inner-court death-law (4:11) |
| `HABITUAL` | iterative/customary/gnomic — "each girl *would* go in" (2:13); the Purim custom |

`status` sits on a **proposition** OR a single **component** (one permitted action among several, e.g. 8:11
assemble / defend / destroy attackers / plunder — each `PERMITTED`). Component overrides proposition overrides
the omitted `ASSERTED` default.

## The 7 new speech-acts (SC-0078) — when to reach for them
| value | when | Esther |
|---|---|---|
| `PROPOSES_COURSE_OF_ACTION` | a plan put to a superior to adopt (not a command) | "let virgins be sought" (2:2) |
| `PETITIONS_FOR_GRANT` | asking a superior to grant a favor (beyond mere leave) | "let my life be given me" (7:3) |
| `ASKS_DELIBERATIVE_QUESTION` | asking what *ought* to be done | "what shall be done to Vashti?" (1:15) |
| `PRESCRIBES_AS_LAW` | enacting a decree as binding law (the speech act; pair with `status: NORM` on the resulting rule) | "let it be written… that it not pass away" (1:19) |
| `ADVISES_COURSE_OF_ACTION` | counsel the hearer may take or leave | Zeresh counsels the gallows (5:14) |
| `RESOLVES_TO_ACT` | declaring one's own settled intent (≠ a vow) | "I will go to the king…" (4:16) |
| `ALLEGES_AGAINST` | accusing a third party to induce action | "there is a certain people…" (3:8) |

> `speech_act` is a **closed** cross-corpus list. A value outside the 33 now **hard-blocks** `validate`
> (SC-0078 A2). A genuinely missing illocution is a finding to bring to a ruling (its own SC) — never invent one.

## Two worked patterns (the cold-read failure becomes impossible)
- **8:11 permitted killing** — head = a *grant* (`PRESCRIBES_AS_LAW`/decree); the killing rides under it as
  components with `status: PERMITTED`. The model reads *"granted the right to destroy attackers,"* never
  *"destroyed children and women."*
- **4:16 "if I perish, I perish"** — head = Esther's *resolve* (`RESOLVES_TO_ACT`, the going-in); the perishing
  is a component linked `condition_of` the going-in. The model reads *a vow under risk*, not *"Esther perished."*
