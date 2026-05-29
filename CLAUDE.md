# Tripod Compiler — Project Brief & Build Guide

> **Current state: see [`docs/PROGRESS.md`](docs/PROGRESS.md).** This brief is the original
> scoping handoff and is now partly stale (e.g. it says 2 artifacts — pilot-2 has 4; it suggests
> zod — we consume the pinned JSON-Schemas via ajv). `docs/PROGRESS.md` overrides it on conflict.

> Commit this file as `CLAUDE.md` at the repo root of `marciasuzuki/tripod_compiler`.
> It is the handoff from a scoping session. It captures the verified schema, the
> vocabulary model, the first build slice, and the open questions, so a fresh
> Claude Code session can start productively without re-discovering everything.

---

## 0. One-paragraph summary

The **Tripod Compiler** is the *upstream artifact-production toolchain* for the Tripod
Method of AI-assisted oral Bible translation (Shema Bible Translation / OBT Lab). It sits
**beside** an Obsidian-style wiki vault (`ruth-pilot-b-wiki`, mirrored in Google Drive),
which remains the source of truth. The compiler does the repeated, mechanical work the
human currently does by hand: read Bible text + vault notes → draft/validate a **Meaning
Map** → check it against controlled vocabulary + schema → compile the machine-facing
**STA / FOR_MODEL** artifact → emit an **audit + registry-delta** → route uncertain items
to human review → write approved files back to the vault. The whole downstream ML pilot
(Facilitator → Performer → vocoder → reviewable low-resource-language oral draft) depends
on these artifacts being **schema-valid, version-stable, and drift-controlled at Bible
scale.** That dependency is why this exists.

---

## 1. Why this matters (context from the Tripod training architecture)

The Tripod ML pilot trains a **coordinated model family**, not one opaque translator:

```
Reviewed biblical prose Meaning Map + STA
  → Facilitator (semantic bridge, validation, control packets)
  → adaptive fusion
  → monolingual LRL Performer (acoustic realization from LRL audio)
  → acousteme + pitch manifest → pitch-conditioned vocoder
  → reviewable LRL oral draft
```

The architecture paper (`Tripod_Facilitator_Performer_Training`) **explicitly assumes the
upstream artifact-production workflow already exists.** Key load-bearing requirements it
places on *our* output:

- **Minimum-viable-pilot condition:** *"A stable schema version for STA and a policy for
  adding new tags."* ← the compiler's `/_spec` + vocabulary engine.
- **Named risk — schema drift:** *"Tags become inconsistent across biblical and LRL
  artifacts. Control: versioning, validation scripts, Facilitator governance, periodic
  schema consolidation."* ← the compiler's validator.
- **Dense supervision** for training comes from proposition structure, register, tone,
  figures, significant absences, Concept Bank anchors. If our artifacts are inconsistent,
  the supervision is poisoned.

**Implication for build order:** build the **validator / vocabulary guard FIRST** (Slice 1).
The Meaning Maps already exist as gold data to test it against; a generator would have
nothing to grade.

### Bible scale (the production goal)

The aim is to map the **entire Bible** into Meaning Maps + STA artifacts. The controlled
vocabulary is sized accordingly: **4 genre groups, 31 genres, 7 registers** (per the
training doc's Language-Archive scoping). The Ruth pilot (14 pericopes, P01–P14) is the
proving ground.

---

## 2. CRITICAL: schema version skew (read before touching anything)

There are **at least two artifact generations** in circulation. **Target `pilot-2` / `TRIPOD_STA_v2_0`.**

| Aspect | `v0.2 / v0.3` (older "test" artifacts in Drive) | **`pilot-2` / `TRIPOD_STA_v2_0` (CURRENT — target this)** |
|---|---|---|
| `sta_id` | `ruth_pericope_10_v0_2` | `ruth_pericope_01_v2_0` |
| Concept flags | named: `CB_GATE_LEGAL_VENUE` | numeric: `CB_0029`, `CB_0004` |
| Figure flags | named: `FIG_SHOE_DRAWING_ATTESTATION` | numeric: `FIG_0007`, `FIG_0052` |
| Scene objects | `things_in_scene` / `thing_id` | `objects_in_scene` / `object_id` |
| `speech_act` | generic (`DIRECTS_HEARER_TO_DO`) | granular (`DIRECTS_HEARER_TO_RETURN`, `REFUSES_REQUEST_WITH_COUNTER_DECLARATION`) |
| Register count | 6 observed | **7** (per training doc) — resolve against the authoritative list |
| File form | bare `.md` / `.json` | Obsidian note: YAML frontmatter + `[[wikilink]]` + fenced ```json block, `status: valid` |
| FOR_MODEL/AUDIT | split at "stage_4" | uploaded samples are single FOR_MODEL notes; confirm whether a separate AUDIT exists in pilot-2 |

> **The closed lists themselves drifted between versions.** Do NOT hardcode vocabulary from
> memory or from the older docs. **Step 1 is to obtain the authoritative current vocabulary
> spec** (see §6 "What to get from the user") and derive `/_spec` from it.

Even the training-doc appendices still reference `TRIPOD_STA_v0_2` in places — version skew
is real across the project's own materials. This is the problem we're solving.

---

## 3. Verified current schema (`TRIPOD_STA_v2_0`, from real P01 & P02 FOR_MODEL files)

This is transcribed from two **real, valid** pilot-2 FOR_MODEL artifacts (Ruth 1:1–5 and
1:6–14). Treat as the authoritative *structure*; verify *vocabulary values* against the spec doc.

### 3.1 File envelope (Obsidian note)
```
---
type: "sta-for-model"
pericope: "P01"
pericope-title: "..."
source-meaning-map: [[P01-Ruth-1-1-5]]   # wikilink to the Meaning Map note
status: "valid"
pilot: "pilot-2"
---
# P01 — Ruth 1:1–5 — FOR_MODEL
(prose line)
```json
{ ...the canonical FOR_MODEL JSON... }
```
```
The parser must extract the fenced ```json block; the frontmatter carries routing metadata.

### 3.2 FOR_MODEL JSON shape
```jsonc
{
  "sta_id": "ruth_pericope_01_v2_0",
  "tagset_version": "TRIPOD_STA_v2_0",
  // NOTE: pilot-2 samples omit artifact_profile; the schema defines
  // artifact_profile ∈ {BIBLICAL_PASSAGE, LA_RECORDING}. Confirm whether it is
  // implicit-by-context or should be present. The validator must be profile-aware.

  "header": {
    "bcv": "Ruth 1:1-5",
    "pericope_title": "...",
    "book_context_ref": "ruth_pilot_BCD_v0_3",
    "source_meaning_map_ref": "P01-Ruth-1-1-5",
    "source_language": "Biblical Hebrew"
  },

  "pericope_classification": {
    "genre_group": "NARRATIVE",            // L1 closed list
    "genre": "HISTORICAL_NARRATIVE",       // L1 closed list
    "register": "INFORMAL_CASUAL",         // L1 closed list
    "register_overrides": {
      "_note": "...",
      "scene_level": [ { "scene_id": "S2", "override_value": "INTIMATE",
                         "genre_override": null, "genre_group_override": null } ] | null,
      "moment_level": [ { "verse": "1:1a", "override_value": "COMMUNITY_MEMORY",
                          "genre_override": null, "genre_group_override": null } ]
      // NB: override_value "COMMUNITY_MEMORY" is not in the 6 registers the explorer saw —
      // confirm the override value list (may be a superset or a separate list).
    }
  },

  "level_1": {                              // all arrays = L2 bounded-open lists
    "arc_elements": ["AFFLICTION","DEPARTURE","FOREIGN_RESIDENCE","FAMILY_LOSS","EMPTYING"],
    "context_elements": ["STORY_WORLD_CONTEXT","PHYSICAL_LOCATION","KINSHIP_CONTEXT", ...],
    "tone_elements": ["RESTRAINED","WEIGHTED","CHRONICLE","SOBER","QUIETLY_ACCELERATING"],
    "pace_elements": ["STEADY","QUIETLY_ACCELERATING"],
    "communicative_function_elements": ["OPENS_BOOK","ESTABLISHES_PARTICIPANTS", ...]
  },

  "level_2_scenes": [
    {
      "scene_id": "S1",
      "verse_range": "1:1-2",
      "scene_kind": "OPENING_CHRONICLE_SCENE",      // L2 bounded-open
      "scene_communicative_purpose": "...",
      "beings_in_scene":  { "entries": [ { "being_id": "B2", "role_in_scene": "...",
                              "presence": "PRESENT|REFERENCED|IMPLIED|PRESENT_BECOMES_DECEASED",
                              "referential_form": "UNNAMED_MAN_FROM_BETHLEHEM" /* optional */ } ] },
      "places_in_scene":  { "entries": [ { "place_id": "PL1|PL_HA_ARETZ", "role_in_scene": "..." } ] },
      "objects_in_scene": { "entries": [ { "object_id": "O1|TH_*|CB_0030", "function_in_scene": "..." } ] },
      "times_in_scene":   { "entries": [ { "time_id": "TM_PERIOD_OF_JUDGES", "role_in_scene": "..." } ] | null,
                            "_note": "..." /* when null */ },
      "significant_absence": "free-text, but LOAD-BEARING (see §4)"
    }
  ],

  "level_3_propositions": [
    {
      "prop_id": "P1",
      "scene_link": "S1",
      "verse_anchor": "1:1a",
      "proposition_kind": "TIME_ANCHOR_ESTABLISHED",  // L2 bounded-open
      "event_specific_slots": {
        // event-participant slot names (giver/blesser/deceased/...), NEVER agent/patient/theme.
        // Multi-event propositions decompose into a *_components: [] array; EACH component
        // carries a mandatory "speech_act" (L1 closed). Example component:
        // { "action":"KISSED", "kisser":"B3", "kissed":["B8","B9"], "speech_act":"STATES_AS_TRUE" }
      },
      "inter_proposition_links": { "forward_link_to": "P2", "caused_by": "P1", "paired_with": "P13" },
      "cross_ref": "FIG_0052 opens here; closes at P13",   // optional free-text
      "cb_flags": ["CB_0029"],         // numeric Concept Bank pointers (BIBLICAL_PASSAGE only)
      "figure_flags": ["FIG_0007"]     // numeric Figure Registry pointers
    }
  ]
}
```

### 3.3 ID namespaces (Layer 3 registry; lives in the BCD)
`B##` beings · `PL##` / `PL_*` places · `O##` objects · `TH_*` thematic/phrase objects ·
`TM_*` times · `I#` institutions · `CB_####` concept-bank · `FIG_####` figures. Each being
also has **referential forms** (e.g. `UNNAMED_MAN_FROM_BETHLEHEM`, `STRIPPED_TO_HA_ISHAH`)
tracked across the book in the BCD.

---

## 4. Vocabulary model — the three layers / one schema, two profiles

The validator's core. **One STA schema** carries an `artifact_profile`:
`BIBLICAL_PASSAGE` (Scripture) or `LA_RECORDING` (Language-Archive / LRL audio). Both share
**Layer 1**; profile-specific machinery (BCD, Figure Registry, Concept Bank, discourse
threads) is **biblical-only**.

| Layer | Lists | Behaviour on a value not in the list | Shared across profiles? |
|---|---|---|---|
| **L1 — closed** | `GENRE_GROUP` (4), `GENRE` (31), `REGISTER` (7), `SPEECH_ACT` | **BLOCK** — hard error | **Yes** (the cross-corpus "interlanguage") |
| **L2 — bounded-open** | `PROPOSITION_KIND`, `SCENE_KIND`, `arc/tone/pace/communicative_function` elements | **drift warning** → review → add-with-provenance | Mostly yes |
| **L3 — profile registry** | `B/PL/O/TM/I/CB/FIG` codes + referential forms (the **BCD**) | **propose registry addition** (a BCD-delta to approve) | **No** — biblical only |

**Three register-critical things the validator must confirm are present** (the training doc
flags these as easily lost): the **`referential_form`** axis, the **cross-proposition links**
(`paired_with`, `caused_by`, `back_reference_to_proposition`/`forward_link_to`), and any
**load-bearing surface phrasing** carrying a `NOT_TO_BE_NORMALIZED`-style flag.
**`significant_absence` is a hard constraint, not decoration** — it becomes
`must_preserve_absences` in the downstream control packet.

---

## 5. Build plan

### Stack
**TypeScript / Node.** `zod` for schema-as-types-and-validator. CLI via a small runner
(e.g. `commander`/`clipanion`). Vault I/O over the filesystem (the vault is plain
markdown/JSON files). Optional Python sidecar **only** if BHSA/Text-Fabric Hebrew ingestion
is added later.

### Repo layout (proposed)
```
/_spec/              # controlled vocabulary as machine-readable YAML/JSON + zod schemas
  layer1.closed.yaml     # GENRE_GROUP, GENRE, REGISTER, SPEECH_ACT (+ register-override values)
  layer2.bounded.yaml    # PROPOSITION_KIND, SCENE_KIND, arc/tone/pace/comm-func elements
  registry/              # L3 per-book: beings, places, objects, times, institutions, CB, FIG
  schema/                # zod/JSON-schema for MeaningMap, FOR_MODEL (per profile)
/src/
  reader/   # parse Obsidian FOR_MODEL note + Meaning Map .md → typed model
  engine/   # 3-layer vocabulary guard (block / drift / propose) — profile-aware
  compiler/ # MeaningMap → FOR_MODEL (Slice 2)
  audit/    # emit audit report + registry-delta (BCD-delta) — Slice 1 emits the report
  cli/      # tripod validate | compile | check-drift | propose-vocabulary
/fixtures/  # real gold artifacts pulled from the vault (P01, P02, ...) for tests
/tests/
CLAUDE.md   # this file
```

### Slice 1 — Spec + Validator (FIRST; no LLM, fully deterministic, testable)
**Deliverables**
1. `/_spec` — transcribe the authoritative **current (pilot-2)** vocabulary into YAML; write
   `zod` schemas for the FOR_MODEL envelope + JSON.
2. **Reader** — parse a FOR_MODEL Obsidian note (frontmatter + fenced JSON) and a Meaning Map
   `.md` into a typed model.
3. **Vocabulary engine** — the L1/L2/L3 rules, profile-aware.
4. **`tripod validate <fixture>`** — emits a structured report: schema errors (block),
   vocabulary drift (review), proposed registry additions (BCD-delta), and missing
   register-critical fields (referential_form / links / absences).
5. **Proof:** run against the gold fixtures (P01, P02, and more once gathered). The report
   should re-derive the kind of "Registry Additions / Known Limits" the human writes by hand.

**Acceptance:** `tripod validate` on a known-good pilot-2 FOR_MODEL → clean (or only expected
drift); on a deliberately corrupted copy → precise, located errors.

### Later slices
- **Slice 2:** `MeaningMap → FOR_MODEL` compiler (+ audit). Verify the AUDIT artifact shape
  against a real pilot-2 AUDIT first (confirm it still exists).
- **Slice 3:** review report + approved **BCD-delta writeback** to the vault (human-gated;
  never automatic).
- **Slice 4:** agent orchestration (Mapper / Vocabulary Guard / STA Compiler / Validator /
  Adjudicator); the **LLM drafter is built last**.
- **Slice 5:** Bible-wide dashboard (Next.js) — pericope status, drift queue, registry
  browser, FOR_MODEL validator, progress tracker.

### Downstream contract to preserve
`forja-de-cordel` (the cordel-poetry app) already consumes Meaning Map Level 1 → plan,
Level 2 → vocabulary, Level 3 → propositions, with a hard "don't invent semantic content"
rule. If the compiler emits FOR_MODEL from shared TS types, that contract becomes
compiler-checked. The Facilitator (ML pilot) is the other consumer.

---

## 6. What to get from the user at the start of the new session

The new session likely has the **same Google Drive MCP** connected. If so, pull these. If
not, ask the user to re-upload them. **Get the authoritative current (pilot-2) versions.**

1. **The current STA vocabulary spec** — the closed + bounded lists (the older one is
   `tripod_sta_vocabulary_v0_2.md`, Drive id `1NuqhG3WpF0jq4jDu6uCio5RgsMKD2Szk`; ask whether
   a pilot-2 / v2_0 vocabulary doc supersedes it). **This blocks `/_spec`.**
2. **The BCD** (book context / registry) — current version. (`ruth_pilot_BCD_v0_3.md`,
   id `1J7RkQAgtlgfQIR9PjfywSiy7uCBeJpgw`.)
3. **3–5 gold FOR_MODEL notes + their source Meaning Maps**, pilot-2. (Two are already in
   hand: P01 Ruth 1:1–5, P02 Ruth 1:6–14.)
4. **Confirm:** does pilot-2 still produce a separate **AUDIT** artifact? What is its shape?
5. **Confirm:** the **7th register** (explorer saw 6) and the **register-override value list**
   (e.g., is `COMMUNITY_MEMORY` a register or a separate axis?).
6. **Confirm:** is `artifact_profile` written into pilot-2 FOR_MODEL, or implied?

### Useful Drive coordinates (from the scoping session)
- Main vault folder "Ruth Meaning Maps and TSA Files": `1GztktSGn0zWHEbL430OoHUZ5zgXyDaxC`
- STA methodology folder: `1EhrW-On6xm-NBbWYS-1PBv1GD9Ozf5Yi`
- Per-pericope STA subfolders under "Ruth STA files": `1sSe8Q6JV9NzwLyibMt5dsU1kZ8MHBg8e`
- ⚠️ Many Drive files are the **older v0.2/v0.3** generation. Prefer the user's pilot-2 uploads.

---

## 7. Open questions to resolve early
1. Authoritative pilot-2 vocabulary source? (blocks `/_spec`)
2. Does pilot-2 keep the FOR_MODEL **+ AUDIT** split, or fold audit elsewhere?
3. Register list (6 vs 7) and the override-value list.
4. `artifact_profile` presence/derivation.
5. Vault access during build: pull gold files into `/fixtures` (recommended) vs operate on a
   live vault path. **Writeback to the real vault stays human-gated and out of scope until Slice 3.**
6. Naming normalization: the vault mixes `ruth pericope 01 sta` / `ruth_pericope_01_sta` /
   `P01` / `1_1_5`. Pick a canonical scheme; the reader should tolerate the variants.

---

## 8. Suggested opening prompt for the new session

> I'm building the Tripod Compiler (TypeScript). Read `CLAUDE.md` at the repo root — it has
> the verified `TRIPOD_STA_v2_0` schema, the 3-layer/2-profile vocabulary model, and the
> Slice 1 plan. Before writing code: pull (from Google Drive, or I'll upload) the
> **current pilot-2 STA vocabulary doc** and **3–5 gold FOR_MODEL notes + their Meaning
> Maps**, and confirm the open questions in §7. Then build **Slice 1 (Spec + Validator)**:
> `/_spec` from the real vocabulary, a reader for the Obsidian FOR_MODEL notes, the
> profile-aware 3-layer vocabulary engine, and `tripod validate` proven against the gold
> fixtures. No LLM, no generator yet, no writeback.
