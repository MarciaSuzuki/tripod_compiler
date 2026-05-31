# Common-Reader Prose Standard — METHODOLOGY NOTE (DRAFT · HELD)

> **Status:** DRAFT. Register target **blessed by Marcia Suzuki (2026-05-31)**: *"good study-Bible note
> for ordinary readers."* **HELD** — do **not** seed yet. Seed **after** Session 6's P02–P06
> content-discipline second pass merges (both edit `pericopes/*.md`; concurrent edits would conflict and
> muddy review).
> **Eventual home:** vault `_methodology/common-reader-prose-standard.md`.
> **Does NOT touch** the validator / schema / vocabulary / pins — free-text prose + guidance only.

**What it governs:** the *conditioning prose* of the maps — Level 1 (Arc / Context / Tone / Communicative
Function), the scene descriptions (Role / Meaning / Effect / What-it-is / Signals), the significant-absence
notes, and the register-tagging block.
**What it does *not* touch:** the `register` token (the passage's social key), the Level 3 payload (that's
R1–R5), the framework *headings* (Arc, Burden, Tone… stay), and the controlled vocabulary/schemas.

**Target register — the touchstone (BLESSED).** Write the way you'd explain the passage, clearly and
warmly, to an intelligent friend who loves the Bible but never went to seminary — the clarity of a **good
study-Bible note for ordinary readers**. Plain, concrete, exact. *Not* a scholarly essay; *not* a breezy
paraphrase. Dignified, never dumbed-down.

## The four rules
- **S1 — Common-reader register.** Write for the common reader of the Bible, not the scholar.
- **S2 — Concrete over abstract.** Prefer plain, concrete words; name the actual thing, not its category.
- **S3 — Translate the register, keep the substance.** Same precision, same richness — only the *words*
  get plainer. **Plain ≠ flat:** if a rewrite loses a nuance, it's wrong.
- **S4 — Drop the critical apparatus.** No literary-critical / biblical-studies jargon in the prose.
  Keep load-bearing concept words (gloss once).

## Flag-words → plain substitutions

| Academic tell | Write instead |
|---|---|
| contraction / compression | the shrinking; how tightly it's told |
| precipitating (crisis) | the thing that sets it off / triggers it |
| bereaved | grieving; left alone |
| antithetical state-word pair / antithesis | the contrast between X and Y (*name them*) |
| declarative; narratorial; narrator-summary | flat and direct; the narrator steps back / sums up |
| recognition-failure / recognition-question | they can't place her; "is this really Naomi?" |
| chance-construction held open between… | told so you can't tell if it's luck or God's hand |
| ascribes her state to… | she lays her suffering on…; she says God did it |
| reactivates the epithet | calls her "the Moabite" again |
| stages / foregrounds / instantiates / performs | sets up / shows / does |

**Keep (do not over-purge):** load-bearing concept words with no plain equal — *hesed* (gloss once as
"loyal kindness"), *glean/gleaning*, *kinsman-redeemer*, *barley harvest*, *Moabite*. The point is the
common reader's register, not a smaller vocabulary.

## Three before→after pairs (real prose: P01 / P04 / P05)

**1 — Level 1 analysis (abstract → concrete).** P01 §2.1
- *Before:* "The burden is the steady contraction from a complete Israelite household to one bereaved woman alive among foreigners."
- *After:* "What weighs on the passage is the shrinking: a whole family of four narrows down, loss by loss, to one grieving woman, alone in a foreign land."
- *Kept:* the weight, the steady narrowing from fullness to a single woman, the foreignness. *Changed:* only the register.

**2 — Tone (literary-critical jargon → vivid and concrete).** P04 §2.3 — the clearest case that plain is *more* exact, not less:
- *Before:* "Stilled at the arrival; then declarative under Naomi's voice; then narrator-summary at the close. The pace … rises at v.20-21 with the antithetical state-word pair and the divine-name doubling; settles back to chronicle pace at v.22."
- *After:* "The scene goes still as they arrive; then Naomi's own voice takes over, flat and hard; then the narrator steps back to close it. Things slow at v.19 when the women can't place her, lift at v.20–21 as she sets the full life she left against the empty one she's come back to and names God over and over, and settle into plain reporting at v.22."
- *Kept:* the three-beat movement, the slow/rise/settle with verse anchors, the **full↔empty** contrast, the repeated divine name. *Changed:* "declarative / antithetical state-word pair / divine-name doubling / chronicle pace" → words a reader actually pictures.

**3 — Narrative (academic construction → theologically clear).** P05 §2.1
- *Before:* "she goes, gleans, and lands in Boaz's portion through a chance-construction the narrator holds open between coincidence and providence."
- *After:* "she goes out, gleans, and happens to end up in Boaz's field — and the narrator tells it so you can't quite tell whether it was luck or God's quiet hand."
- *Kept:* the action, the landing in Boaz's field, the deliberate luck-or-providence ambiguity. *Changed:* the abstraction becomes something a common reader feels.

**The two-sided guardrail (so "plain" doesn't slide into "flat"):**
- *Too elevated (now):* "…through a chance-construction the narrator holds open between coincidence and providence."
- *Rich plain (TARGET):* "…and the narrator tells it so you can't quite tell whether it was luck or God's quiet hand."
- *Too flat (DON'T):* "…she ends up in Boaz's field by chance." ← grammatically plain, but it **drops the providence nuance** — the whole theological point. That's the failure mode S3 forbids.

## Scope & non-goals (the "doesn't touch the system" guarantee)
Free-text + guidance only. No schema, vocabulary, pin, or validator change. The one mechanical tie: the
FOR_MODEL's two free-text fields (`scene_communicative_purpose`, `significant_absence`) get matched to the
map's new wording, then **re-baseline `gold-diff`** and confirm validate / coverage / tests stay green.

## How it persists + governance
Like the content discipline: the rule lands in the **meaning-map template** (prose-section guidance + a
worked example) and the **agent system-prompts** so P07–P14 and the Slice-4 drafter are born in this
register — and that seeding **rides with the generator-docs cleanup already on the roadmap** (one trip
through the prompts). Record as a methodology note + an **SC** for the P01–P06 prose migration; **no
spec-version bump.** **Sequence after Session 6 lands.**

## Open (for seed time)
- The "after" wordings above are a calibration starting line — final voice is Marcia's, tuned per map.
- Expand the before/after bank to also cover a **scene-description line** and a **significant-absence
  note**, so the build session has a fuller calibration bank.
- Per-map prose rewrite is exegetical/voice work: the session drafts, **Marcia reviews per map** (same
  gating as the content discipline).
