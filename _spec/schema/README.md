# `/_spec/schema` — structural schemas (to be generated in Slice 1)

This folder holds the **structural** schema for artifacts (shape, required fields, types) —
distinct from the **vocabulary** files above (which constrain the *values* of controlled
fields). Implement as `zod` schemas in `/src` and, if useful, export JSON-Schema here for
other tools.

## To build (Slice 1)
- `meaningCoordinates.ts` — `zod` schema for the `TRIPOD_STA_v2_0` MEANING_COORDINATES JSON. Use the verified
  shape in `CLAUDE.md` §3.2. Make it **profile-aware**: `cb_flags` are
  `BIBLICAL_PASSAGE`-only.
- `meaningMap.ts` — schema for the Meaning Map `.md` model (metadata, classification,
  Level 1, Level 2 scenes with 2A–2F, Level 3 propositions, significant absence, registry refs).
- `note.ts` — the Obsidian envelope: YAML frontmatter (`type`, `pericope`,
  `source-meaning-map` wikilink, `status`, `pilot`) + the fenced ```json block extractor.

## Required-field checks the validator must enforce (from the training doc)
These carry register-critical meaning and are easy to drop — fail loudly if missing:
- `referential_form` on beings where the source marks a naming shift.
- `inter_proposition_links` (`paired_with`, `caused_by`, `forward_link_to`,
  `back_reference_to_proposition`).
- `significant_absence` on every scene (free-text, but must be present and non-empty).
- any load-bearing surface phrasing flagged `NOT_TO_BE_NORMALIZED` (confirm the field name
  in pilot-2).

## Cross-field integrity checks (beyond value membership)
- every `scene_link` resolves to a real `scene_id`; every `inter_proposition_links` target
  resolves to a real `prop_id` (or external `[[wikilink]]`/BCV).
- every `being_id` / `place_id` / `object_id` / `time_id` / `cb_flags` / `figure_flags` used
  in scenes & propositions exists in `registry/<book>.yaml` (else → propose registry addition).
- `verse_anchor` / `verse_range` fall within the `header.bcv` span.
- `header.source_meaning_map_ref` matches the frontmatter `source-meaning-map` wikilink.
