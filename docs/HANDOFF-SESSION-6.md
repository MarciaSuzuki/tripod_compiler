# Session 6 build brief — P02–P06 content-discipline SECOND PASS (SC-0013) + SC-0014

> Authored by the Tripod Architect session; all judgment calls below were **ruled by Marcia Suzuki
> (2026-05-31)**. This brief is **execute-only** — apply the rulings; do not relitigate them.

You are a **Tripod Compiler build session**. Your job is a **corrective second pass** on the P02–P06
content-discipline remediation (SC-0013). A prior session did a first pass now sitting in **vault PR #5**
+ **repo PR #15** — **do not merge it; do not treat it as done.** It is sound in parts and over-broad in
others; you are bringing it to the blessed-P01 standard.

## Repos & canonical paths
- **Vault (source of truth):** `~/Github/ruth-pilot-b-wiki` — branch `claude/p02-p06-content-remediation`.
  (The Dropbox copy is retired — never read/write it.)
- **Compiler:** `MarciaSuzuki/tripod_compiler` — vendors/pins the spec; `fixtures/` mirror the vault FOR_MODELs.
- Claude GitHub App is installed (write works). BHSA is local/offline.

## Orient first (read these)
- `tripod_compiler/docs/PROGRESS.md`, `SPEC_CHANGES.md` (esp. SC-0012, SC-0013).
- Vault `_methodology/level3and3Ccontentdiscipline.md` — R1–R5, the rule you enforce.
- **The standard:** the blessed **P01** — `pericopes/P01-Ruth-1-1-5.md` + `stas/P01-Ruth-1-1-5-FOR-MODEL.md`.
  Calibrate granularity, §3C scope, and note-style against P01.

## What the first pass got RIGHT — preserve, do not regress
Hesed survives correctly in P02 (proposition content + flags); the `DIVINE_AGENT → YHWH` / `→ DEITY`
plain-language fixes are correct; P02/P06 dialogue is intact with `referential_form` slots kept; P06's
§3C keepers were preserved; metrics were real (validate 6/6, coverage 6/6, lint tier-1 = 0, tests green).
Keep all of this.

## Why a second pass is needed (the three defects to fix)
1. §3C was blanket-nulled to "None" on P02/P03/P04/P05 on the false premise "zero §3C entities" — but
   these pericopes referenced real `CB_` concepts that, per R1 and the blessed P01/P06, **belong in §3C**.
2. Relocation notes are generic per-scene counts ("6 thematic items relocated…") — **not auditable**.
   P01's standard is **per-item**: *"the death → P7; 'husband of Naomi' → B2 referential_form;
   'she remained' → FIG_0052."*
3. Some proposition `*_form` slots were deleted as "orphaned." Mostly fine (grammatical-pattern labels;
   the events survive) — but each deletion must be **verified**, not assumed.

## THE DECIDED §3C RULINGS — execute exactly (Marcia's calls)

| Pericope | Keep as §3C entities | Relocate (destination) |
|---|---|---|
| **P02** (1:6–14) | **bread CB_0012, hesed CB_0011, blessing CB_0008, rest/menucha CB_0014** | paqad-verb → proposition; daughter-in-law CB_0017 → referential_form; mother's-house CB_0013 → place(PL); news-hearing / departure verbs → propositions |
| **P03** (1:15–18) | **— ("None" is correct)** | verify the six vow bindings survive as propositions; pairing patterns CB_0021 / FIG_0072 / FIG_0074 → figures; **verify CB_0019 (levirate) survives as a flag** |
| **P04** (1:19–22) | **barley-harvest CB_0026** | Mara CB_0023 → renaming proposition + B3 referential_form + FIG_0082; full/empty CB_0024 + CB_0044 → FIG_0084 + payload; testify-against CB_0025 → proposition; Moabite CB_0004 / daughter-in-law CB_0017 → referential_form; **verify the doubled-divine-name pattern (YHWH×2 / Shaddai×2) survives as a figure — if dropped, propose a FIG and STOP for Marcia** |
| **P05** (2:1–7) | **gleaning CB_0034, favor CB_0033, blessing CB_0008, chayil CB_0032, providence/miqreh CB_0035** | foreman-role CB_0036 → foreman's referential_form; Moabite CB_0004 → Ruth's referential_form; clan-framings & verb-sequences → propositions / referential_form |
| **P06** (2:8–16) | (already kept: O9/O10/O11, CB_0034/0033/0008/0037/0038/0012) | **verify only — no change**; confirm the conditioning-Q&A removal + marquee-jargon fixes are sound |

Restore each kept concept as a proper §3C **entity entry** in the map (Hebrew header + What-it-is /
Function / Signals, per template) **and** as an `objects_in_scene` entry in the FOR_MODEL
(`object_id: "CB_00xx"` + `function_in_scene`). **BCD unchanged** — these CB_ are already registered.

## STRUCTURAL FIXES (all of P02–P06)
- Replace every generic count-note with **per-item relocation notes** (item → named destination), matching P01.
- For every relocated item, **verify the insight is present at its destination** (event in a proposition,
  framing in a `referential_form`, pattern in a figure). Relocate-never-delete is the rule; the note must be true.
- Maintain both **map (`pericopes/`) and FOR_MODEL (`stas/`)**, and mirror FOR_MODEL changes into the
  compiler **`fixtures/`**.

## SC-0014 (governed Layer-1 change — Marcia ruled the rename)
Rename the closed-list `SPEECH_ACT` value `ASCRIBES_TO_DIVINE_AGENT_LAMENT_FRAME` →
**`ASCRIBES_AFFLICTION_TO_GOD_IN_LAMENT`** (drops the "AGENT" jargon; "GOD" not "YHWH" because SPEECH_ACT
is cross-corpus). Mechanics: edit `validation-rules.json`, **bump version + re-pin** (`_spec/pins.json`),
**migrate the P02/P04 artifacts** off the old value, **propagate** to agent prompts / templates /
lint-lexicon if referenced, and **write the SC-0014 entry** in `SPEC_CHANGES.md` (Type: closed-list
change; list affected artifacts).

## BOUNDARIES — do NOT
- **Do not reuse the first pass's blanket-null scripts.** Work **per-item / surgically** — the blanket
  approach is what caused defect #1.
- **Do not decide the ~19 residual §4 Q&A dialogue compounds** (e.g. *"glean in another field; pass on
  from this one"*). Re-atomizing dialogue is Marcia's exegetical pass. **Surface each with a proposed
  atomization for her to rule — do not guess.**
- **Do not merge.** Output is human-gated; Marcia blesses fidelity before merge.
- Routine applications of the rulings above: apply + document. **Any genuinely new exegetical question:
  STOP and surface it** (don't decide it).

## VERIFICATION GATES (all must pass before handing back)
- `tripod validate` — 6/6 clean.
- `tripod coverage --corpus` — 6/6 block-clean (245/245, 0 unanchored).
- `tripod lint --corpus` — tier-1 stays **0**; §3C-not-entity findings drop **only** by genuine
  relocation, never by deleting a real entity.
- `tripod gold-diff` — re-baseline; agreement holds (leaner is fine).
- **New audit:** a per-item relocation table per pericope (every removed §3C item → destination, verified
  present). This is the artifact that proves "relocate, never delete."
- `npm test` green; `check-drift` clean; re-pin anything changed.

## DELIVERY
Update vault PR #5 + repo PR #15 (amend/supersede). Update `SPEC_CHANGES.md` (SC-0013 → P02–P06 done to
standard; add SC-0014) and `docs/PROGRESS.md`. Hand back to Marcia: the per-item relocation tables, the
SC-0014 diff, and the gate results — **for her fidelity blessing**, and so she can bring it to the
Architect session for review.
