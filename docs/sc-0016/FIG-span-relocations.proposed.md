# SC-0016 — Figure-registry span relocations (PROPOSED — vault patch, not applied)

> Where each §4 `cross_ref` "opens at P#, closes at P#" insight re-homes. Per Marcia's 2026-05-31
> ruling the vault writeback is **deferred** — this is the patch to apply to `ruth-pilot-b-wiki/figures/`
> when the vault pass runs. **Relocate, never delete:** every span below already survives in the map's
> §5B Figure-Flags (which stay); this records it in the figure's *own* canonical home as well, so removing
> the inline §4 cross_ref is de-duplication, not loss. The §5B flag and the FOR_MODEL `cross_ref` field
> are conditioning, correctly placed, and are **not** touched.

## P01 — FIG_0052 (Tishaer Residual Rhyme) — the worked reference
Frontmatter currently: `opens-at: "P01"`, `closes-at: "P01"`, `appears-in: [P01]` (pericope-level only).
The **proposition-level** span lived only in P01 §4's two cross_ref lines (now removed) + §5B (kept).
Enrich FIG_0052 with the proposition span:

- Frontmatter: add `opens-at-proposition: "P01:P5"`, `closes-at-proposition: "P01:P8"`.
- Body "## Appearances": add the within-pericope span note:
  `- Within P01: opens at Proposition 5 (1:3, Elimelech's death — "and she was left"), closes at Proposition 8 (1:5, the sons' death — "and the woman was left"); within-pericope image-rhyme pair building the contraction motif v.3→v.5.`
- `keep-image: PREFERRED` is already set — no change.

## P02–P06 — the inline §4 cross_refs to relocate (targets confirmed to exist)
Each row: the §4 cross_ref line(s) → the figure file whose entry records the span. The CB_/“active here”
pointer lines are concept-bank conditioning and relocate to §5A semantics / the FOR_MODEL flags, not a figure.

| Map | §4 figure cross_ref (span) | Figure file (relocate into) |
|---|---|---|
| P02 | FIG_0013 closes (opened P01 Prop2) | figures/FIG_0013-Bread-house-in-Famine.md |
| P02 | FIG_0012 opens; cross-pericope pair closes P07 (2:23) | figures/FIG_0012-Clinging-Dabaq-Image-rhyme.md |
| P03 | FIG_0072 opens+closes (v.16b–c) | figures/FIG_0072-Paired-Path-Lodging-Vow.md |
| P03 | FIG_0074 opens+closes (v.17a) | figures/FIG_0074-Death-and-Burial-Shared-Place.md |
| P03 | FIG_0075 opens+closes (self-curse oath) | figures/FIG_0075-Self-Curse-Oath-Formula.md |
| P04 | FIG_0013 active (first Bethlehem naming P04) | figures/FIG_0013-Bread-house-in-Famine.md |
| P04 | FIG_0082 / FIG_0083 / FIG_0006 open (Mara/hemar/Shaddai) | figures/FIG_0082-*, FIG_0083-*, FIG_0006-* |
| P04 | FIG_0084 / FIG_0086 open+close; FIG_0088 opens→P06 | figures/FIG_0084-*, FIG_0086-*, FIG_0088-* |
| P04 | FIG_0001 reactivates; FIG_0013 final close | figures/FIG_0001-*, FIG_0013-* |
| P05 | FIG_0090 opens; FIG_0134 opens (closes P09 3:11) | figures/FIG_0090-Ish-Gibbor-Chayil.md, FIG_0134-* |
| P05 | FIG_0018 active; FIG_0015 opens (closes P11 4:1) | figures/FIG_0018-*, FIG_0015-* |
| P05 | FIG_0088 closes; FIG_0092/0093/0094/0091 open+close | figures/FIG_0088-*, FIG_0092-*, FIG_0093-*, FIG_0094-*, FIG_0091-* |
| P05 | FIG_0001 third-party voice (carry-forward arc) | figures/FIG_0001-Ruth-the-Moabitess.md |
| P06 | FIG_0105 active (1st of 3-prohibition cluster) | figures/FIG_0105-Touch-Prohibition.md |
| P06 | FIG_0100/0103/0011/0132/0102 active/open | figures/FIG_0100-*, FIG_0103-*, FIG_0011-*, FIG_0132-*, FIG_0102-* |
| P06 | FIG_0104 (abundance triplet, required keep-image) | figures/FIG_0104-Abundance-Triplet.md |
| P06 | FIG_0106 / FIG_0101 / FIG_0107 (cluster members) | figures/FIG_0106-*, FIG_0101-*, FIG_0107-* |

**Note:** the span data already exists in each map's §5B Figure-Flags (verified — those lines carry the
exact "opens at … closes at …" spans). The figure-file enrichment makes the figure's own entry authoritative;
several of these figures may already record the span (to verify during the vault pass — enrich only what's missing).
