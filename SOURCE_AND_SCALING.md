# Source ingestion & book-scaling decisions

> **Status:** forward-looking architecture record. **Not Slice 1.** These decisions apply when
> the build reaches the Mapper/generator slice and book-scaling beyond Ruth. Both fit the
> existing pilot-2 architecture and change nothing in Slice 1 (Spec + Validator).
> **Stay in the Pilot-2 lane** — the one Pilot-3 boundary is marked explicitly below.

---

## 1. Hebrew source: BHSA via a frozen extract (not a live query)

The Mapper drafts Meaning Maps **from the original text**. For the Old Testament the source is
**BHSA** (the ETCBC database), distributed through the **Text-Fabric** Python library; data
lives on GitHub at `ETCBC/bhsa`:

```python
from tf.app import use
A = use("ETCBC/bhsa", version="2021")   # downloads data to ~/text-fabric-data on first use
```

BHSA exposes what a Mapper needs: Hebrew text, lexemes + glosses, full morphology (stem,
tense, person/number/gender), and **syntax** (phrase / clause / sentence boundaries).

### Decision: extract once, freeze, vendor — do NOT query BHSA live during compilation
- Build a small **Python "BHSA extractor" sidecar** (the Python escape-hatch noted in
  `CLAUDE.md` §5 — the compiler core stays TypeScript). Run it **once per book**.
- It pulls the needed features **per pericope** and emits a **stable, versioned JSON
  "source linguistic packet"** that the Mapper consumes.
- **Pin it** (version + hash), exactly like `validation-rules.json`. A frozen Hebrew source
  means the same input always yields the same map — reproducibility, not ephemeral fetches.
- This matches the existing `ruth_bhsa_full_analysis.md` artifact — formalize that pattern as
  machine-readable data.

### Cloud-network caveat (Claude Code on the web)
Cloud sessions are ephemeral and gated by the environment's network access level. Default
**Trusted** allows package registries (`pip install text-fabric` works) but **blocks general
internet**, so the GitHub data download fails unless you either:
- add `github.com` + `objects.githubusercontent.com` to the environment's **Custom allowed
  domains**, or
- fetch the data in a **setup script** under that allowlist, or
- **(preferred)** run the extractor in an allowlisted/local environment and **commit the
  frozen packet**, so compilation sessions need no BHSA network access at all.

### Source linguistic packet — sketch of the contract
```jsonc
{
  "source": "BHSA",
  "bhsa_version": "2021",
  "extractor_version": "0.1.0",
  "book": "RUTH",
  "pericope": "P01",
  "bcv": "Ruth 1:1-5",
  "verses": [
    { "verse": "1:1", "clauses": [
      { "clause_id": "...", "type": "...", "phrases": [
        { "phrase_id": "...", "function": "...", "words": [
          { "occ": 1, "text": "וַיְהִ֗י", "lex": "HJH[", "gloss": "be",
            "pos": "verb", "stem": "qal", "tense": "wayyiqtol",
            "person": "p3", "number": "sg", "gender": "m" }
        ]}
      ]}
    ]}
  ]
}
```
*(Final field set: pick the minimum the Mapper actually uses; add only on demand.)*

### Licensing check (one-time)
ETCBC/BHSA data is research-licensed (CC BY-NC-SA). Confirm it covers OBT Lab's use before
redistributing extracts. Almost certainly fine for a non-profit translation project, but
verify once and note it here.

---

## 2. Book Context Documents at scale: one per book, grown by delta

**Yes — every book gets its own BCD.** The BCD is **Layer 3**, the per-book registry
(`B#` beings, `PL#` places, `O#` objects, `TM_` times, `I#` institutions, `CB_` concepts,
`FIG_` figures, discourse threads `T#`, and per-being referential forms). Ruth's registry does
not transfer to Genesis.

### But you do NOT hand-author full BCDs up front
- **Seed a minimal book skeleton** (book arc, chapter outline, main participants). The BHSA
  extractor can **auto-propose** the initial participant/place list from proper nouns.
- **Each pericope compilation emits a `BCD-DELTA`** (its new registry entries). Approve it →
  it merges into the book's BCD. **The BCD accretes pericope by pericope.** This is the
  existing pilot-2 mechanism — it's why 39 hand-written OT BCDs are unnecessary.

### What is NOT per-book (do not recreate it)
The **Layer 1 closed lists** (GENRE_GROUP, GENRE, REGISTER, SPEECH_ACT) and **Layer 2
bounded-open lists** (PROPOSITION_KIND, SCENE_KIND, arc/tone/pace/communicative-function) are
**cross-book vocabulary**, governed centrally in `validation-rules.json`. Only Layer 3 is
per-book.

### Pilot-3 boundary (do not cross now)
Pan-biblical recurring entities — YHWH, Bethlehem, etc. — appear across many books. Whether
they get a **shared canonical code** or are **duplicated per book** is a real design choice,
but it belongs to **Pilot-3 / unified vocabulary**. For Pilot-2, registries stay **per-book**.
Revisit only when Pilot-3 is deliberately opened.

---

## Open items (address when these slices arrive — not before)
- [ ] Finalize the source-linguistic-packet field set (minimum the Mapper uses).
- [ ] Decide where frozen BHSA packets live (repo `/source/<book>/` vs vault) and how they're pinned.
- [ ] Decide the network strategy for the extractor (allowlist vs commit-the-packet).
- [ ] Define the **BCD book-skeleton** template + the auto-seed from BHSA proper nouns.
- [ ] Confirm BHSA licensing note above.
