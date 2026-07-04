# Tripod Review Portal

[![review-portal](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal.yml/badge.svg)](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal.yml)
[![portal-watchdog](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal-watchdog.yml/badge.svg)](https://github.com/MarciaSuzuki/tripod_compiler/actions/workflows/portal-watchdog.yml)

A read-only static site where **external reviewers — who do not have GitHub
accounts — can read every approved pericope artifact, ask questions, and
suggest changes without any ability to edit** (Marcia's ruling, 2026-06-10).

Live site (once Pages is enabled): `https://marciasuzuki.github.io/tripod_compiler/`

This directory is **Tier B** under risk-tiered verification: it *consumes*
canon (the blessed fixtures and the public registry JSONs) and can never
write it. Nothing in `portal/` is read by the compiler, the validator, the
gates, or any canon pipeline.

---

## The one rule that matters: approved-only is a BUILD TEST

The build renders **only**:

| Artifact | Source directory | Required frontmatter |
|---|---|---|
| Meaning Map | `fixtures/meaning-map/*.md` | `type: "pericope"` + `status: "complete"` |
| FOR_MODEL (STA) | `fixtures/for-model/*.md` | `type: "sta-for-model"` + `status: "valid"` |
| Compilation Log | `fixtures/compilation-log/*.md` | `type: "sta-compilation-log"` + `status: "valid"` |

Any `.md` in those directories that lacks the right type or approved status —
or whose real path resolves outside them (symlink smuggling) — **fails the
whole build with exit code 2 and nothing is written**. A draft in `fixtures/`
is an anomaly the portal refuses to build on, not something it skips.
`_working/`, branches, and the private vault are never read.

The gate lives in [src/lib/gate.mjs](src/lib/gate.mjs); the end-to-end bite
tests (planted draft → build dies) live in [test/gate.test.mjs](test/gate.test.mjs).
To watch it bite by hand: drop any `status: "draft"` note into
`fixtures/meaning-map/` on a throwaway branch and run the build.

Because the site rebuilds **only on push to `main`**
([ci/portal.yml](ci/portal.yml)), it can never show unmerged work. New
approved pericopes (e.g. J02 when its graduation PR merges) appear
automatically on the next push — no portal change needed.

> **One-time activation:** the workflow ships at `portal/ci/portal.yml`
> because the local git/gh tokens lack the `workflow` OAuth scope GitHub
> requires for pushing workflow files. Copy it to
> `.github/workflows/portal.yml` once via the GitHub web UI (Add file →
> Create new file → paste → commit to main); full steps are in the file's
> header comment. Until then the portal does not auto-deploy.

## Deploy failures are loud (the watchdog + alarm)

A deploy failure is often the approved-only gate **working** — but it must
never be silent: in June 2026 the deploy was CI-red for a week unseen while
the live site sat frozen (SC-0075). The watchdog
([ci/portal-watchdog.yml](ci/portal-watchdog.yml); same one-time activation
path as above, to `.github/workflows/portal-watchdog.yml`) makes every
failure visible through two detectors feeding one alarm:

1. **Run status** — on every completed `review-portal` run: a red run raises
   the alarm the moment it happens; a green run closes it.
2. **Freshness** — twice daily (and on manual dispatch): the live site's
   `build-manifest.json` commit stamp must match `main` HEAD (45-minute grace
   for a deploy in flight). This catches what run status cannot see: the
   workflow not firing at all, a "green" deploy that never took, a dead site.

The alarm is a single GitHub issue labeled `portal-deploy-alarm`, assigned to
the maintainer (creation, comments, and assignment all trigger GitHub
notifications). Repeat failures comment on the open issue — never a second
alarm; recovery closes it with the green run linked. A stale or unreadable
site also turns the watchdog run itself red, and the badges at the top of
this file (also on the repo README) show both workflows' state at a glance.

The alarm logic lives in [ci/deploy-alarm.mjs](ci/deploy-alarm.mjs) and
[ci/check-freshness.mjs](ci/check-freshness.mjs), proven offline against a
scripted fake `gh` in [test/deploy-alarm.test.mjs](test/deploy-alarm.test.mjs)
— never a silent green, including for the alarm itself.

## Running locally

```bash
cd portal
npm ci
npm test          # the full suite, including the bite tests (never a silent green)
npm run build     # → portal/dist (open dist/index.html in a browser)
```

`node src/build.mjs --root <repo> --out <dir>` builds an arbitrary tree
(that's how the bite tests work). Exit codes: `0` built · `2` approved-only
gate violation (nothing written) · `1` other error.

## What the build does

1. Collects the three artifact classes from `fixtures/` and **gates every
   file** (status + type + real-path containment, all-or-nothing).
2. Resolves Obsidian `[[wikilinks]]` against the public registries
   (`_spec/registry/<book>.aliases.json`, `concepts.json`, `figures.json`):
   entity links get hover tooltips with code · Hebrew · English · kind;
   unresolvable links degrade to plain styled text (registry coverage is the
   pipeline id-check's job, not the portal's).
3. Renders each pericope page: the Meaning Map as prose (markdown, with all
   source HTML neutralized), the FOR_MODEL and Compilation Log as collapsible
   `<details>` outlines (plus a raw-JSON fallback). String values render with
   `dir="auto"` so embedded Hebrew lays out correctly. Zero client-side
   JavaScript anywhere.
4. Writes `build-manifest.json` recording every source file with its status
   and sha256 — the provenance record for any later audit.
5. Exports the **Atlas data** (below) into `dist/atlas/`.

Adding a future book = one row in `portal.config.json` (`books`: prefix,
title, registry aliases file). An unknown pericope prefix fails the build
with instructions, so a new book cannot appear silently half-wired — and the
book's Atlas shard, status, and cast appear from its registry automatically.

## Atlas data (`dist/atlas/*.json`)

The build also projects the same approved canon into graph shards the Atlas
views consume ([src/atlas/export.mjs](src/atlas/export.mjs)): one
`atlas/<book>.json` per configured book (nodes: book · pericope · scene ·
proposition · being · place · object · time · institution; edges: contains ·
participates · appears_in · flags · prop-link · uses-value) plus
`atlas/global.json` (concept bank, figure registry, vocabulary values with
per-value provenance, SC-ruling timeline, and the book index). Facts to know:

- **Ids are fully namespaced** — `ruth/P13` the pericope is a different node
  from `ruth/P01/prop/P13` the proposition; labels keep canon spelling.
- **Statuses are data-derived** (complete / compile-pending / registry-only),
  computed from what exists in `fixtures/` + the registries — a book flips
  states the day its artifacts merge, with zero Atlas code changes.
- **Sources are exactly the governance-approved set**: the gated fixtures,
  `_spec/registry/*.json`, `_spec/approved-enumerations.json`,
  `_spec/validation-rules.json`, `SPEC_CHANGES.md`, `portal.config.json`.
  Every read is realpath-verified inside the repo and never under
  `_working/` — a smuggled source is a build-killing gate violation (exit 2),
  bitten in [test/atlas.test.mjs](test/atlas.test.mjs).
- **Every shard is listed in `build-manifest.json`** with its sha256 and its
  sources' shas, same provenance discipline as the pages.
- A canon ref that doesn't resolve (e.g. the deliberate `B?` unknown-being
  marker) is kept as an `unresolved` edge with the raw ref — honest, never
  silently dropped.

## Atlas pages (`dist/atlas/*.html`)

The same data renders as static Atlas pages ([src/atlas/pages.mjs](src/atlas/pages.mjs),
[assets/atlas.css](assets/atlas.css) — the approved v4 "luminous brain" treatment,
never loaded by a Reading-Room page): an Atlas index, one Book Atlas page per book
(pericope spine · computed thread lanes · scene/absence drill-downs; a registry-only
book renders its cast with a "maps in progress" badge and no artifact content), and
one registry page per entity, concept and figure with computed backlinks. **Zero
client-side JavaScript** — every page renders complete without JS. The only
Reading-Room changes the Atlas makes (both declared, spec §0.1/§8.7): the header's
Atlas nav link, and resolved `[[wikilink]]` mentions upgrading from tooltip spans to
tooltip **links** into the registry pages — same classes, same tooltips, same look.
Acceptance bars are held in [test/atlas-pages.test.mjs](test/atlas-pages.test.mjs).

## Connecting the Google Form (Marcia's 5-minute step)

The feedback buttons ship **visibly disabled** until the Form exists. To go
live:

1. Create a Google Form in your Workspace with the fields listed below.
2. Click ⋮ → **Get pre-filled link**. Fill the four prefill-able fields with
   recognizable sample values (e.g. pericope `SAMPLE-PERICOPE`, artifact
   `Meaning Map`, section `SAMPLE-SECTION`, kind `I have a question`), click
   **Get link**, and copy the URL.
3. From that URL, take:
   - everything before `/viewform` → `feedbackForm.formBase` in
     [portal.config.json](portal.config.json)
   - the four `entry.NNNNNNN` parameter names → `feedbackForm.entries.{pericope,artifact,section,kind}`
4. Merge the config change (Tier B). The next deploy turns every button live.

### Suggested field list

| # | Field | Type | Prefilled by the portal? |
|---|---|---|---|
| 1 | Your name | short answer, **optional** | no |
| 2 | Organization / role | short answer, **optional** | no |
| 3 | Email, if you'd like a reply | short answer, **optional** | no |
| 4 | Which passage? | short answer | **yes** — e.g. `P03 — Ruth 1:15–18` |
| 5 | Which document? | multiple choice: `Meaning Map` / `FOR_MODEL (STA)` / `Compilation Log` / `The whole passage` / `The website itself` | **yes** |
| 6 | Which part? (section or verse) | short answer, optional | **yes** when asked from a section's "ask" link |
| 7 | Question or suggestion? | multiple choice: `I have a question` / `I suggest a change` | **yes** |
| 8 | Your question or suggestion | paragraph, **required** | no |
| 9 | If suggesting a change: what should it say instead? | paragraph, optional | no |

(Field 5 and 7 choices must match the portal's strings exactly — they are the
values the buttons prefill. Link the responses to a Sheet for triage.
Suggestions never touch artifacts: accepted ones flow through the normal
ruling → Architect → gates pipeline.)

## Known limits (deliberate)

- Hover tooltips (entity Hebrew, code glosses) don't show on touch devices;
  the visible text is always readable without them.
- Concept/figure links render as glossed text, not separate registry pages —
  a registry browser is a later slice if reviewers ask for it.
- giscus (GitHub Discussions) as a secondary channel for account-holders was
  considered and deferred — form-primary keeps day one simple.
