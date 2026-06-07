# SC-0027 — Thread B schema-commit: the `fidelity` model, first applied to the P03 vow

> Plan-first (Architect 10, 2026-06-07). The schema-commit step of **Thread B (THE GOAL)**. Builds on
> `docs/THREAD-B-PROPOSAL.md` (prototype + the two Thread C calls + pair-scope (α) ruled). **Encodes Marcia's vow
> rulings (2026-06-07) exactly** — the evaluator will verify it does. **Nothing locks until this plan is approved.**
> Its own cycle — **NOT bundled** with SC-0028 (genre/register vault-homing) or anything else.

## 1. What SC-0027 commits (= Marcia's rulings)
- A **`fidelity` object** — `preserve_meaning` × `preserve_form` — attachable to a structured element. The
  **"means, not mandate" license is `preserve_form = false`** (one field, no second place to disagree).
- **Two `fidelity_group`s** (the (α) shared-group-id mechanism): **`people_god_inseparability`** (rungs 2+3) and
  **`unto_the_end`** (rungs 4+5). Each group entry carries the **relationship's own** flag.
- **accompaniment (rungs 0+1): NO group** — sequential. **Principle (Marcia): group iff the text structurally
  binds; never add a group for symmetry.** (people/God ← the PEOPLE_HALF/GOD_HALF nominal equation; death/burial ←
  burial's `THERE_DEMONSTRATIVE_LINKING_TO_DEATH_PLACE`; path/lodging has *no* binding field, only juxtaposition.)
- **`preserve_form = false` on all six rungs** (no exceptions).
- **Structure-flag: `preserve_meaning = true` on `vow_structural_form`** — the six-step escalation/order must
  survive (because freeing per-rung form would otherwise let a Performer re-order/collapse the ladder).
- **Genre: scene-level `genre_group_override = POETIC_SUNG` + `genre_override = BLESSING`** on the vow scene (S2),
  carrying `preserve_meaning = true` (the poetic classification must survive = the "render as elevated poetry"
  demand). **`genre_override = BLESSING` RULED (Marcia, 2026-06-07): blessing-dominant, mark-dominant-and-note** —
  a note records the closing CURSE-formula oath (1:17b) and that the taxonomy has no exact oath/vow genre (so
  BLESSING is the dominant approximation). **Existing mechanism, existing closed values — no new vocabulary** (the
  withdrawn "literary-quality tone value" is *not* added).
- **A dangling-`fidelity_group` integrity check** (the `id-check` pattern), covering both groups.

## 2. Verified grounding
- `POETIC_SUNG` ∈ `GENRE_GROUP` (`NARRATIVE, POETIC_SUNG, INSTRUCTIONAL_REGULATORY, ORAL_DISCOURSE`). ✓
- **`genre_group_override` is ALREADY closed-list-enforced:** `register_override_entry.genre_group_override =
  anyOf[null, enum[…4 groups…]]`, `genre_override = anyOf[null, genre_value]`. **Your build-note is resolved — the
  validator already enforces the closed list on the override fields; SC-0027 adds none there.** ✓
- `GENRE` = **31** (compiler correct; the field-guide "30" is SC-0028's typo). ✓
- The six rungs exist in P03 `vow_components`; death↔burial already linked by the `THERE`-demonstrative. ✓

## 3. Schema additions
**(a) `fidelity` object** (optional, on a `vow_components[]` entry / being-in-scene entry / etc.):
```jsonc
"fidelity": { "preserve_meaning": bool, "preserve_form": bool,   // false = RENDER_FREELY (the license)
              "meaning": "<what preserve_meaning protects>",
              "fidelity_group": "<group-id>" /* optional — the relationship this element belongs to */ }
```
**(b) `fidelity_groups`** (proposition-level array — the (α) home where the *relationship's* flag lives):
```jsonc
"fidelity_groups": [
  { "group_id": "people_god_inseparability", "members": [<PEOPLE_HALF>, <GOD_HALF>],
    "fidelity": { "preserve_meaning": true, "preserve_form": false,
                  "meaning": "belonging-to-the-people and belonging-to-the-God are inseparable" } },
  { "group_id": "unto_the_end", "members": [<death>, <burial>],
    "fidelity": { "preserve_meaning": true, "preserve_form": false,
                  "meaning": "the bond holds unto death and into the same final resting place" } } ]
```
**(c) structure-flag:** a `fidelity` on `vow_structural_form` (`preserve_meaning=true`: the escalating order).
**(d) genre-override fidelity:** the S2 `genre_group_override = POETIC_SUNG` carries `preserve_meaning = true`.
**(e) integrity check:** every element's `fidelity_group` must resolve to a declared group; every group's members
must exist — a dangling ref is an error.

## 4. The P03 vow, encoded (for the evaluator to check against the rulings)
| rung | `fidelity.preserve_form` | `fidelity_group` |
|---|---|---|
| 0 path / 1 lodging | **false** (each) | **none (sequential)** |
| 2 people / 3 God | **false** (each) | **`people_god_inseparability`** |
| 4 death / 5 burial | **false** (each) | **`unto_the_end`** |
| `vow_structural_form` | — | structure-flag `preserve_meaning=true` |
| S2 scene | — | `genre_group_override=POETIC_SUNG` + `genre_override=BLESSING` (blessing-dominant + curse-oath note), `preserve_meaning=true` |

→ **two** groups (not three), `preserve_form=false` ×6, the ladder flag, POETIC_SUNG-as-preserved-meaning.

## 5. Migration + build
- **P03 gold fixture edit** (genre override + fidelity flags/groups/structure-flag) — a **gated content edit**;
  must re-validate clean, then write back to vault P03 (SC-0008 ritual: `check-drift --vault` clean; **confirm it
  lands on the remote**).
- **Seed the held-7** as the first broader annotated corpus — Marcia rules each one's preserve/render.
- **Fold in `NOT_TO_BE_NORMALIZED`**: it becomes the `preserve_form = true` pole; the README note is superseded.
- **`genre_override` exact value — RULED (Marcia, 2026-06-07): `BLESSING`, blessing-dominant (mark-dominant-and-note).**
  At P03 re-annotation, write `genre_override = BLESSING` + a note recording the closing CURSE-formula oath (1:17b)
  and the no-exact-oath/vow-genre gap. The genre classification carries `preserve_meaning = true` (the BLESSING
  reading must survive).
- **Versions:** `validation-rules` bump (new defs) → re-pin → SPEC_CHANGES entry; the optional Level-1
  default-posture layer deferred unless wanted.

## 6. Predictions / acceptance
- P03 re-validates clean with the override + fidelity + 2 groups + structure-flag.
- The dangling-group-id check fails a broken ref, passes the 2 real groups.
- `check-drift` clean post re-pin; gate board green; existing artifacts stay valid (fidelity is additive/optional).
- The encoding matches the rulings **exactly** (2 groups, `preserve_form=false` ×6, ladder flag, POETIC_SUNG).

## 7. Scope
Own cycle, plan-first, nothing locked until approved. **NOT bundled** with SC-0028 (POETIC_SUNG already valid, so
SC-0027 doesn't wait on the vault-homing). The `cross_ref`→group-id generalization stays out (one concern per cycle).
