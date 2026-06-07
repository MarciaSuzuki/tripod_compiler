# Thread B — the `preserve_meaning` × `preserve_form` fidelity model (prototype-first)

> Prototype-first proposal (Architect 10, 2026-06-07). **THE GOAL** of the project, not plumbing. Its own SC
> (next free = **SC-0027**, allocated at the schema-commit step — *not* yet). **No schema is committed by this doc.**
> Read with the POST-SC0025 handoff (Part IV), `docs/THREAD-A-PROPOSAL.md` (Thread A produced the held-7 corpus),
> and `docs/SC-0026-PROPOSAL.md` (the seam discipline). Architecture (call ii) from the evaluator's review; the
> two hard cases worked below against the real artifacts.

---

## 0. The point, in one paragraph
The interlingua needs to tell the downstream **Performer** (the model that realizes meaning in the target
low-resource language) **what must survive translation vs. what is one language's way of saying it.** Thread B is a
**two-axis fidelity flag** on structured elements: **`preserve_meaning`** (is this the claim that must survive?) ×
**`preserve_form`** (must the exact wording survive, or may the Performer re-realize it?). The **"means, not
mandate" re-realization license is simply `preserve_form = false`** — one fact, one home. Per the locked rule for
this thread: **prototype first, validate against the hard cases, then commit the schema.** This doc is the prototype.

## 1. The two Thread C calls (gates — both now MADE by Marcia, not guessed)
- **(i) The vow's people/God pairing (Ruth 1:16):** `preserve_meaning = true` (the inseparability of belonging-to-
  the-people and belonging-to-the-God is the theological claim that must survive); **`preserve_form = false`** (the
  parallel "your people = my people, your God = my God" structure is *means* — the Performer may re-realize it in
  the target idiom).
- **(ii) Where the license lives (architecture):** **in the fidelity flag itself**, attached at the **element /
  component** level — not Level-1 (too coarse to point at a vow step), not the figure layer (misses both cases
  below). Level-1 available only as an optional **default-posture** layer (mirrors `register_overrides`). Greenfield:
  `NOT_TO_BE_NORMALIZED` is an unimplemented README note — this *builds* the unified flag, it doesn't merge one.

## 2. The flag shape (prototype — concrete, not yet schema)
A `fidelity` object attachable to any structured element:
```jsonc
"fidelity": {
  "preserve_meaning": true,           // the semantic content/claim must survive translation
  "preserve_form": false,             // false = RENDER_FREELY (re-realizable); true = the wording is load-bearing
  "meaning": "<what preserve_meaning protects — the claim/move that must survive>",
  "_note": "<optional rationale>"
}
```
The **license** is the `preserve_form` pole; there is no separate field that could disagree with it.

## 3. Prototype — CASE 2 (ha-ishah): a single element → CLEAN FIT
`level_2_scenes[].beings_in_scene.entries[]` for B3 (Naomi), Ruth 1:5 (P01:303):
```jsonc
{ "being_id": "B3", "role_in_scene": "WIDOW", "presence": "PRESENT",
  "referential_form": "STRIPPED_TO_HA_ISHAH",
  "fidelity": {
    "preserve_meaning": true,
    "preserve_form": false,
    "meaning": "Naomi is named-DOWN — reduced from the named matriarch to an anonymous generic referent after the deaths; the diminishment-by-anonymization must survive",
    "_note": "preserve_form=false: any target anonymizing referent works; the exact lexeme 'the woman' is not load-bearing — the anonymization (meaning) is."
  } }
```
**Finding:** expresses cleanly, and it **clarifies what `preserve_meaning` protects** — the *semantic move*
(anonymize her), not a specific concept. The binary two-axis flag is sufficient here.

## 4. Prototype — CASE 1 (people/God): two components → SURFACES THE ONE REFINEMENT
The pairing is **two** entries in `level_3_propositions[].event_specific_slots.vow_components[]` (P03:293–311):
`PEOPLE_HALF` (`bound_to_collective: B31`) and `GOD_HALF` (`invoked_divine_agent: B10`).
- Marcia's call: `preserve_meaning = true`, `preserve_form = false`.
- **The protected meaning is the *binding between the two halves*** (people-belonging and God-belonging are
  inseparable) — a property of the **pair**, not of either half alone.
- **The risk this exposes:** with `preserve_form = false`, a Performer free on form could re-realize the two halves
  as **two separate statements** and *lose the binding* — unless the flag protects the **relationship**, not just
  each element. A per-element flag (`meaning: "this half's belonging"` on each) does **not** capture "the two are
  inseparable."
- **This is the prototype's load-bearing finding:** the element-level flag handles single elements (Case 2) but a
  claim that spans a **relationship between elements** (Case 1) needs a way to scope the pair. Three options to
  resolve **before** schema-commit:
  - **(α) shared group-id:** flag each half `preserve_meaning=true` + `fidelity_group:"people_god_inseparability"`
    with the binding stated once on the group. Minimal; reuses the per-element attachment.
  - **(β) pair-scoped flag:** one `fidelity` on a small grouping node over the two halves. Cleanest semantically;
    needs a grouping construct the schema doesn't have yet.
  - **(γ) ride the existing pairing:** `nominal_equation_half` already links the halves; attach the flag there with
    `meaning="the two halves are inseparable"`. Least new structure; relies on a field that exists for another reason.
  - *Lean: (α)* — smallest schema reach, and group-ids generalize to other multi-element claims. **Marcia's call at
    commit time; not decided here.**

## 5. Findings → what the prototype proved
1. The **two-axis flag at element level expresses single-element fidelity cleanly** (Case 2) — architecture (c) holds.
2. **`preserve_meaning` protects the semantic *move*** (clarified by ha-ishah), which makes `preserve_form=false`
   safe there (any anonymizing word works).
3. **One refinement is required, not optional:** a claim spanning a *relationship* (Case 1's inseparability) needs
   **pair/group scope** — without it, `preserve_form=false` can silently break the binding. Better found now than
   after a schema lock.
4. **Reach confirmed:** the flag rides at the **component** level — one level deeper than `cb_flags`/`figure_flags`
   (whole-proposition). This is the real schema work and the reason Thread B is its own cautious cycle.

## 6. Plan (prototype-first; nothing locked here) — *superseded by §9 (pair-scope ruled (α))*
1. **This prototype** → Marcia + evaluator review: confirm the flag shape, the Case-2 fit, and **rule the Case-1
   pair-scope option (α/β/γ).**
2. **Then SC-0027 (schema-commit), its own cycle, plan-first:** add the `fidelity` object to the FOR_MODEL schema at
   the element/component level (+ the chosen pair-scope), seed the held-7 as the first annotated corpus, fold
   `NOT_TO_BE_NORMALIZED` into it, add a Level-1 default-posture layer if wanted. **DO NOT bundle** with anything.
3. **Then roll out** to P01–P06 + author P07–P14 with fidelity from birth.
- **Per-element `preserve`/`render` assignments remain Marcia's** (meaning calls); the architecture just gives the
  precision to state them. The held-7 (quarantined, intact) are the starter corpus.

## 7. Honesty notes
- **Nothing is committed.** No schema, no artifact edits — this is a worked prototype on two real cases.
- `NOT_TO_BE_NORMALIZED` is **greenfield** (unimplemented README note); "unify" = build the flag fresh.
- The Case-1 refinement means the architecture (c) is **right but incomplete as a pure single-element flag** — it
  needs pair-scope. That correction *is* the prototype doing its job before the schema locks.

---

## 8. Round 2 — pair-scope RULED (α), and the whole-vow prototype (the next gate)

**Decision (Marcia + evaluator, 2026-06-07): adopt (α) shared group-id.** Verified against the structure: `nominal_equation_half` is a per-component **label, not a link** — so **(γ) is ruled out** (nothing binds the halves; you'd assert "inseparable" twice with no single home). **(β) pair-node is too invasive** (breaks the flat `list_position` list + the engine's component-walk) and **less general** (a node groups adjacent/contained items; Scripture's bindings — merisms, inclusios, figures opening in one proposition and closing in another — span **non-adjacent** elements). **(α) is additive, fits the existing recursive walk, and binds elements anywhere.** Two specifics carried into SC-0027:
1. **The group entry carries the *relationship's* own flag** (`preserve_meaning = true` on the inseparability itself) — a **third thing**, distinct from the two per-half element flags.
2. **A dangling-`fidelity_group` integrity check** (analogous to `id-check` for entity codes) so a group-id can't point at nothing. Scoped into SC-0027.

**Whole-vow prototype (all six rungs — proving the model beyond its hardest sub-part):**

| # | rung (P03 `vow_components`) | per-rung fidelity (Marcia rules) | candidate group (Marcia rules) |
|---|---|---|---|
| 0 | path — "where you go, I will go" | meaning: Ruth goes wherever Naomi goes; `preserve_form`? | **accompaniment (0+1)?** |
| 1 | lodging — "where you lodge, I will lodge" | meaning: …stays wherever Naomi stays; `preserve_form`? | accompaniment (0+1)? |
| 2 | **people** (`PEOPLE_HALF`, `bound_to_collective B31`) | **`preserve_meaning=true`, `preserve_form=false` — RULED** | **`people_god_inseparability` (2+3) — RULED a group** |
| 3 | **God** (`GOD_HALF`, `invoked_divine_agent B10`) | **`preserve_meaning=true`, `preserve_form=false` — RULED** | `people_god_inseparability` (2+3) — RULED |
| 4 | death — "where you die, I will die" | meaning: …unto death; `preserve_form`? | **unto-the-end (4+5)?** |
| 5 | burial — "there I will be buried" | meaning: …same final resting place; `preserve_form`? | unto-the-end (4+5)? — artifact already links them via burial's `THERE_DEMONSTRATIVE_LINKING_TO_DEATH_PLACE` |

**Plus a whole-ladder question:** `vow_structural_form: SIX_STEP_LADDER_PATH_LODGING_PEOPLE_GOD_DEATH_BURIAL` names an **escalation** (travel → union → death). Is the **ladder/escalation itself** a `preserve_meaning` claim (the totality/intensification must survive) with the six-step *form* re-realizable, or just descriptive scaffolding?

**The per-step questions for you (THE NEXT GATE, before SC-0027) — your meaning calls, not guessed:**
- The `preserve_meaning` content + `preserve_form` value for each unruled rung (0, 1, 4, 5).
- Which candidate groups are **inseparable groups** vs merely **sequential steps**: **accompaniment (0+1)?** **unto-the-end (4+5)?** (the `THERE`-demonstrative is the artifact's own evidence for 4+5). people/God (2+3) is already ruled a group.
- The whole-ladder claim above.

**Generalization (noted, kept OUT of this cycle):** because an (α) group-id binds across propositions, it could later replace the free-text `cross_ref` ("FIG opens here, closes at P13") with a *structured* binding. Real, but **do not bundle** — one concern per cycle.

## 9. Plan (updated — supersedes §6)
1. **This extended prototype** → you rule the §8 per-step + grouping questions.
2. **SC-0027 (schema-commit), plan-first, its own cycle:** add the `fidelity` object at the component level + the (α) group-id mechanism (group entry carries the relationship flag) + the dangling-group-id check; seed the held-7 + the ruled vow groups as the first annotated corpus; fold in `NOT_TO_BE_NORMALIZED`; add the optional Level-1 default-posture layer if wanted.
3. **Roll out** to P01–P06 + author P07–P14 with fidelity from birth.
Nothing is locked until SC-0027.
