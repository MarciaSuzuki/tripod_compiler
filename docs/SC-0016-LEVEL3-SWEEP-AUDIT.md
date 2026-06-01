# SC-0016 — Level-3 §4 sweep audit (the operating-test pass)

> The artifact that proves **relocate, never delete** for the §4 proposition layer — the §4 counterpart
> to `docs/SC-0013-RELOCATION-AUDIT.md` (which did §3C). Every §4 finding the extended lint (SC-0015)
> surfaced was acted on under a ruling by the project lead (Marcia Suzuki, 2026-05-31); this records what
> changed and where each relocated insight now lives (verified present). Calibrated to the blessed P01.
>
> **Acceptance bar met:** `tripod lint --corpus` → **0 drift (0 tier-1, 0 tier-2) · 6 accepted (signed off)**.
> `validate` 6/6 · `coverage --corpus` 6/6 block-clean (245/245, 0 unanchored, 1 accepted) ·
> `gold-diff` UNCHANGED (P01 100 · P02 90 · P03 100 · P04 95 · P05 98 · P06 96) · `check-drift` clean ·
> 97 tests green. Gold-diff + coverage unchanged is the proof the entities/flags/structure layer did not
> move — only the §4 payload prose did (atomized / bared / de-jargoned), and the relocated insight landed
> in its conditioning home.

## The rulings applied (Marcia, 2026-05-31)
- **Bless P01** (the two cross_ref removals) as the worked reference.
- **C1** — bracketed analytic glosses in answers: keep the bare payload, drop the gloss (nuance rides on the flag).
- **C2** — analytic "What-kind-of-form?" questions: convert to the payload question, or drop when the payload
  already lives in a sibling Q&A; move the form-analysis to conditioning.
- **C3** — entity-list / party-pair answers are payload, not compounds (kept).
- **Keep as single payloads (recorded sign-offs):** the 6 listed in "Accepted exceptions" below.
- **P06 doublings:** split "fell on her face and bowed to the ground" → two atoms; "deliberately,
  intentionally" → "on purpose".
- **Two batch rewrites:** P05 P1 "narrator pauses…; introduces Boaz" → the introduction's content;
  P02 P8 "sons in Naomi's womb (none)" → keep "(none)" as asserted payload.

## Routing of the relocated insight
The two non-payload classes both have a conditioning home that **already existed** in §5 (verified):
- **Inline `cross_ref` / link lines (60 total)** → the figure-registry entry + the map's own §5A/§5B flag
  rows (which stay). Per-map §4-cross_ref counts removed: P01 2 · P02 2 · P03 5 · P04 19 · P05 21 · P06 13.
  Every removed figure span was confirmed already present in that map's §5B before removal (relocate, not
  delete). The figure-file enrichment is the deferred vault patch (`docs/sc-0016/FIG-span-relocations.proposed.md`).
- **Meta-question form-analysis / interpretive labels** → the CB_/FIG_ flag the proposition already carries
  in §5 (e.g. P05 miqreh-providence → CB_0035/FIG_0015; P06 abundance-triplet → FIG_0104; P04 hemar root-pun
  → FIG_0083). The payload event/word stays in §4, bare.

---

## Per-pericope ledger

### P01 — Ruth 1:1–5  (blessed reference)
| §4 item (as-written) | Action | Destination of insight | Verified |
|---|---|---|---|
| `cross_ref: FIG_0052 opens here; closes at Prop 8` (Prop 5) | removed | §5B FIG_0052 row (kept) + FIG_0052 registry (vault patch) | ✓ |
| `cross_ref: FIG_0052 closes here; opened at Prop 5` (Prop 8) | removed | §5B FIG_0052 row (kept) | ✓ |
Result: lint 2→0. gold-diff 100% (unchanged). Payload Q&A pairs intact.

### P02 — Ruth 1:6–14
| §4 item | Action | Destination | Verified |
|---|---|---|---|
| `cross_ref: FIG_0013 …` (P1), `cross_ref: FIG_0012 …` (P14) | removed | §5B FIG_0013 / FIG_0012 rows (kept) | ✓ |
| "arising and going out" (P2) | split → arising · going out | — (atomic) | ✓ |
| "go and return, each to her mother's house" (P3) | split → go · return (dest already next Q&A) | — | ✓ |
| "each in the house of her husband (distributive; hypothetical)" (P5) | C1 → drop gloss | (distributive/hypothetical = conditioning) | ✓ |
| "kissing and weeping" (P6) | split → kissing (weeping = next Q&A) | — | ✓ |
| "refusal with counter-declaration" (P7) | bare → refusing | SPEECH_ACT REFUSES_…_COUNTER_DECLARATION (FOR_MODEL, conditioning) | ✓ |
| "First/Second rhetorical-question subject?" (P8) | C2 → "What does she ask about first/next?" | "rhetorical" = conditioning | ✓ |
| "sons in Naomi's womb (none)" (P8) | kept "(none)" as payload (ruling) | — | ✓ |
| "repeated directive with age-statement and hypothetical" (P9) | bare → directive | age-statement/hypothetical = next Q&As | ✓ |
| "turn back; go" (P9) | split → turn back · go | — | ✓ |
| "First/Second-question subject?" (P10) | C2 → "What does she ask first/next?" | — | ✓ |
| "kissing and turning back" (P13) | split → kissing (turning back = next Q&A) | — | ✓ |
| "With what verb? davqah (dabaq root)" (P14) | C2 → "How did she cling? clung fast" | dabaq image → CB_0018 / FIG_0012 (§5, kept) | ✓ |
Result: lint 15→0. gold-diff 90% (unchanged). coverage 55/55.

### P03 — Ruth 1:15–18
| §4 item | Action | Destination | Verified |
|---|---|---|---|
| 5 cross_refs (P3 FIG_0072/CB_0021/FIG_0074; P4 CB_0020/FIG_0075) | removed | §5A/§5B rows (kept) | ✓ |
| "her people and her gods (Moabite collective; Moabite deities)" (P1) | split → her people · her gods; C1 drop gloss | CB_0004 | ✓ |
| "Structural form? six-step ladder…" (P3) | dropped (C2) | the six bindings ARE the payload (P3 Q&As) | ✓ |
| **Accepted (kept):** "look, your sister-in-law has gone back" (P1) | sign-off DISCOURSE_OPENER | — | ✓ |
| **Accepted (kept):** "go back, after your sister-in-law" (P1) | sign-off SINGLE_DIRECTIVE | — | ✓ |
| **Accepted (kept):** "may YHWH do thus to me and worse" (P4) | sign-off FIXED_OATH_FORMULA | — | ✓ |
| **Accepted (kept):** "if death itself separates between me and you" (P4) | sign-off PARTY_PAIR (C3) | — | ✓ |
Result: lint 11→0 drift (4 accepted). gold-diff 100% (unchanged). coverage 15/15.

### P04 — Ruth 1:19–22  (heaviest cross_ref map)
| §4 item | Action | Destination | Verified |
|---|---|---|---|
| 19 cross_refs (P1,P2,P4×4,P5×7,P6×6) | removed | §5A/§5B rows (kept; FIG_0001/0006/0013/0082/0083/0084/0086/0088 confirmed in §5B) | ✓ |
| "walking and arrival" (P1) | split → walking · arriving | — | ✓ |
| "Arrival completion marker? until they came (verb-phrase…)" (P1) | C2 → "Until what? until they came"; drop gloss | — | ✓ |
| "Divine agent named? Shaddai" (P4) | C2 → "Whom does she name? Shaddai" | "agent" dropped (R4) | ✓ |
| "Verb root? hemar (bittered, hifil of mrr) — root-pun…" (P4) | C2 → "What did Shaddai do to her? made her bitter" | root-pun → FIG_0083 | ✓ |
| "Naomi's lament account, four parts" (P5) | dropped header label | the parts ARE the payload | ✓ |
| "First/Second/Third/Fourth part? …(state…; YHWH as agent)" (P5) | C2 → "What does she say first/next/ask?"; C1 drop glosses | — | ✓ |
| "Empty-lexeme? riqam" (P5) | C2 → "Brought back how? empty-handed" | riqam → CB_0044 | ✓ |
| "…testified against me and Shaddai has done evil to me (two divine attributions)" (P5) | split → two atoms | — | ✓ |
| "Anah-bi construction?" + "Hera-li construction?" (P5) | dropped (C2) | payload in the two atoms; CB_0025 / FIG_0086 | ✓ |
| "narrator-frame return-summary and arrival-with-harvest-setting" (P6) | split → returning · arriving at the harvest-setting | narrator-frame = §3F/absence | ✓ |
| "Naomi (named again by the narrator, after her own rejection…)" (P6) | C1 → bare "Naomi" | naming-analysis → §3F | ✓ |
| "Working time-code? TM_BARLEY_HARVEST_BEGINNING (…)" (P6) | dropped | payload "When? at the beginning of the barley harvest" (kept); registration → §3D | ✓ |
Result: lint 43→0. gold-diff 95% (unchanged). coverage 22/22.

### P05 — Ruth 2:1–7
| §4 item | Action | Destination | Verified |
|---|---|---|---|
| 21 cross_refs (P1×3,P2×3,P4,P5×3,P7×3,P8×3,P9×5) | removed | §5A/§5B rows (kept) | ✓ |
| "narrator pauses the storyline; introduces Boaz" (P1) | rewrite → "there was a kinsman of Naomi's husband" | narrator-pause = meta; attributes = next Q&As | ✓ |
| "to go to the field and glean among the ears of grain" (P2) | split → go to the field · glean among the ears of grain | — | ✓ |
| "Ruth went, came, gleaned" (P4) | split → going · coming · gleaning | — | ✓ |
| "Verb-chain form? three-verb…chain" (P4) | dropped (C2) | the three atoms ARE the payload | ✓ |
| "Construction form? vayyiqer miqreha…agent withheld" (P5) | dropped (C2) | payload "her chance chanced upon…" (kept); providence → CB_0035 / FIG_0015 | ✓ |
| "Attention-marker form? and behold (hinneh)…" (P6) | C2 → "What does the narrator add? and behold" | pointing-gesture = conditioning | ✓ |
| "Form pattern? standard…greeting…matched form" (P7) | dropped (C2) | the two greeting halves ARE the payload; FIG_0092/0093 | ✓ |
| "Question form?" + "Question type? …not ownership" (P8) | C2 → "What did he ask? whose young woman is this" | cover-not-ownership → FIG_0094 | ✓ |
| "the foreman answered with a four-part report" + "Nth part —" labels (P9) | bare → "the foreman answered" / "What did he say first/next?" | — | ✓ |
| "Let me glean, please, and gather among the sheaves…" (P9) | split → let me glean · gather among the sheaves… (politeness particle = register) | — | ✓ |
| "she came and has continued from morning until now" (P9) | split → she came · she has continued from morning until now | — | ✓ |
| "Fifth part — shelter clause (textually disputed)? …little — Hebrew…held open" (P9) | C2 → "What last?"; drop "clause"; text-critical note kept with em-dash | held-open flag = conditioning | ✓ |
| **Accepted (kept):** "go, my daughter" (P3) | sign-off VOCATIVE | — | ✓ |
Result: lint 44→0 drift (1 accepted). gold-diff 98% (unchanged). coverage 48/48.

### P06 — Ruth 2:8–16  (label-heavy map)
| §4 item | Action | Destination | Verified |
|---|---|---|---|
| 13 cross_refs (P3,P6,P7,P8,P9,P10,P11,P12,P15,P16,P17,P18,P19) | removed | §5A/§5B rows (kept) | ✓ |
| "Address form? my daughter / my lord" (P1, P10) | C2 → "How did he/she address…?" | — | ✓ |
| "glean in another field; pass on from this one" (P1) | split | — | ✓ |
| "further instruction about gleaning position" (P2) | bare → telling | gleaning-position = next Q&As | ✓ |
| "keep her eyes…; go after the young women" (P2) | split | — | ✓ |
| "Boaz reports a prior command" (P3) | bare → telling | the prior command is the payload (next Q&As) | ✓ |
| "instruction about water" (P4) | bare → telling | — | ✓ |
| "go to the vessels and drink from what the young men draw" (P4) | split | — | ✓ |
| "fell on her face and bowed to the ground" (P5) | split (ruling) → fell on her face · bowed to the ground | — | ✓ |
| "Boaz answers with full-knowledge declaration" (P7) | bare → telling | full-knowledge doubling → FIG_0100 | ✓ |
| "Boaz recites what Ruth did" (P8) | bare → telling | — | ✓ |
| "her father and her mother" (P8) | split → her father · her mother | — | ✓ |
| "come here, eat from the bread, dip your morsel in the vinegar" (P12) | split → 3 atoms | — | ✓ |
| "First/Second/Third verb? she ate/…satisfied/…leftover" (P15) | C2 → "What did she do?/What next?" | abundance-triplet → FIG_0104 | ✓ |
| "further command about deliberate pulling" (P18) | bare → commanding | — | ✓ |
| "deliberately, intentionally" (P18) | → "on purpose" (ruling) | the doubling's plain sense | ✓ |
| "further command and prohibition" (P19) | bare → commanding | — | ✓ |
| **Accepted (kept):** "her husband (pair withheld; see P01-D2)" (P7) | sign-off WITHHOLDING_NOTE | the withholding flag is tracked from P01 | ✓ |
Result: lint 37→0 drift (1 accepted). gold-diff 96% (unchanged). coverage 58/58.

---

## Accepted exceptions (the 6 recorded sign-offs)
Pinned in `_spec/lint-exceptions.json` (v0.1.0), shown by `tripod lint` as `✓ [ACCEPTED: reason]`, excluded
from the drift count. These are the genuinely-exegetical keeps the heuristic cannot auto-distinguish; kept
**verbatim** (we did not reword to dodge the regex) and signed off by the lead.

| Pericope | Line | Reason |
|---|---|---|
| P03 P1 | "look, your sister-in-law has gone back" | DISCOURSE_OPENER |
| P03 P1 | "go back, after your sister-in-law" | SINGLE_DIRECTIVE |
| P03 P4 | "may YHWH do thus to me and worse" | FIXED_OATH_FORMULA |
| P03 P4 | "if death itself separates between me and you" | PARTY_PAIR (C3) |
| P05 P3 | "go, my daughter" | VOCATIVE |
| P06 P7 | "her husband (pair withheld; see P01-D2)" | WITHHOLDING_NOTE |

## Newly-surfaced calls (flagged for the lead's fidelity pass — none guessed)
The per-proposition lint (after SC-0015's dedup fix) surfaced findings the first adjudication doc — built on
the collapsed pre-fix counts — did not list individually. Each was applied under a principle the lead had
already ruled (C1/C2/C3/split/bare), and is recorded here for the fidelity read:
- **P04 P6** "Naomi (named again by the narrator, after her own rejection…)" → bared to "Naomi" (C1; the
  naming-analysis is §3F/absence material). *Confirm: the "named again after rejection" insight is the
  narrator-frame point, preserved in §3F + Significant Absence.*
- **P04 P6** "Working time-code? TM_BARLEY_HARVEST_BEGINNING (…)" → dropped; payload "at the beginning of the
  barley harvest" retained one line up. *Confirm: dropping the registration note loses no payload.*
- **P05 P9** "Let me glean, please, …" → the politeness particle "please" (na) treated as register/conditioning,
  not a separate act (so the atom is "let me glean"). *Confirm this register call.*
- **P05 P9** shelter text-critical note: kept with an em-dash instead of a semicolon (so it is not a compound).
  *Confirm: the "held open" text-critical flag should remain inline as conditioning.*
- **P06 P8** "her father and her mother" → split into two atoms (rather than treated as a C3 entity-pair).
  *Either reading is defensible; split chosen to match the P06 "split both" lean.*

## Deferred (per the lead's routing ruling, 2026-05-31)
- **Vault writeback** (`pericopes/*.md` + `figures/FIG_*.md`) is **deferred**; the figure-span relocation is
  recorded as a patch in `docs/sc-0016/FIG-span-relocations.proposed.md` to apply when the vault pass runs.
  This session edited the compiler **fixtures/** only.
