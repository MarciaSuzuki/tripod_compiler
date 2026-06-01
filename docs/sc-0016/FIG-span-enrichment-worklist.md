# SC-0016 figure-span enrichment worklist (derived from each map's §5B — ground truth)

Format per figure file (additive only — match the FIG_0052 worked example; touch nothing else):
1. In frontmatter, immediately AFTER the existing `closes-at:` line, add:
   `opens-at-proposition: "<Pxx:Pn>"`
   `closes-at-proposition: "<Pyy:Pm>"`
   (omit a key only if the figure file has no `closes-at:` line to anchor after — then add after `opens-at:`.)
2. In the `## Appearances` section, append ONE bullet capturing the within/cross-pericope proposition span,
   ending with: `(Proposition-level span recorded under SC-0016 from the map's §5B Figure-Flag; the §5B flag is unchanged.)`
3. If `opens-at-proposition`/`closes-at-proposition` already present → SKIP (enrich only what's missing).
4. NEVER alter existing frontmatter values, surface-image, intended-meaning, keep-image, or any prose.

The span values (pericope:proposition), from the authoritative §5B lines:

| Figure file | opens-at-proposition | closes-at-proposition | Appearances note (span) |
|---|---|---|---|
| FIG_0052-Tishaer-Residual-Rhyme | P01:P5 | P01:P8 | DONE (worked example) |
| FIG_0007-Narrator-Frame-from-Later-Time | P01:P1 | P01:P1 | active at P01 Proposition 1 |
| FIG_0013-Bread-house-in-Famine | P01:P1 | P04:P6 | opens P01 Prop 1–2; closes P02 Prop 1; final close P04 Prop 6 (cross-pericope book-frame) |
| FIG_0001-Ruth-the-Moabitess | P01:P6 | (leave existing; multi-pericope arc) | P01 Prop 6; reactivates P04 Prop 6; third-party voice P05 Prop 9 |
| FIG_0012-Clinging-Dabaq-Image-rhyme | P02:P14 | P07 (cross-pericope, 2:23) | opens P02 Prop 14; cross-pericope pair closes at P07 (2:23) |
| FIG_0072-Paired-Path-Lodging-Vow | P03:P3 | P03:P3 | active at P03 Prop 3 (within-pericope pair, v.16b–c) |
| FIG_0074-Death-and-Burial-Shared-Place | P03:P3 | P03:P3 | active at P03 Prop 3 (within-pericope pair, v.17a) |
| FIG_0075-Self-Curse-Oath-Formula | P03:P4 | P03:P4 | active at P03 Prop 4 (within-pericope single) |
| FIG_0006-Shaddai-Divine-Name | P04:P4 | P04:P5 | active at P04 Props 4 and 5 (within-pericope pair, two Shaddai-occurrences) |
| FIG_0082-Naomi-Mara-Name-Substitution | P04:P4 | P04:P4 | active at P04 Prop 4 (within-pericope single) |
| FIG_0083-Mara-Hemar-Root-Pun | P04:P4 | P04:P4 | active at P04 Prop 4 |
| FIG_0084-Full-and-Empty-Antithesis | P04:P5 | P04:P5 | active at P04 Prop 5 (within-pericope single) |
| FIG_0086-Shaddai-Did-Evil-to-Me | P04:P5 | P04:P5 | active at P04 Prop 5 |
| FIG_0088-Empty-Lament-at-Harvest-Arrival | P04:P5 | P05:P5 | opens P04 Props 5–6; cross-pericope close P05 Prop 5 |
| FIG_0090-Ish-Gibbor-Chayil | P05:P1 | P05:P1 | active at P05 Prop 1 (within-pericope single) |
| FIG_0134-Chayil-Pair-Completed | P05:P1 | P09 (3:11) | opens P05 Prop 1; cross-pair closes at P09 (3:11) |
| FIG_0018-Favor-in-Eyes | P05:P2 | P06:P10 | P05 Prop 2; recurs P06 Props 6, 10 |
| FIG_0015-Vayyiqer-Miqreha | P05:P5 | P11 (4:1) | opens P05 Prop 5; cross-pericope close at P11 (4:1) |
| FIG_0092-YHWH-Be-with-You-Greeting | P05:P7 | P05:P7 | active at P05 Prop 7 (within-pericope single) |
| FIG_0093-YHWH-Bless-You-Return-Greeting | P05:P7 | P05:P7 | active at P05 Prop 7 (within-pericope single; pairs with FIG_0092) |
| FIG_0094-Whose-Young-Woman-Belonging-Question | P05:P8 | P05:P8 | active at P05 Prop 8 (within-pericope single) |
| FIG_0091-Nitsav-Al-Haqotsrim-Foreman-Role | P05:P8 | P05:P9 | active at P05 Props 8, 9 (within-pericope pair) |
| FIG_0011-Wing-of-Refuge | P06:P9 | P09 (3:9) | opens P06 Prop 9; cross-pericope pair closes at P09 (3:9, FIG_0131) |
| FIG_0104-Abundance-Triplet | P06:P15 | P07 (2:18) | active at P06 Prop 15; forward link to P07 (2:18) |
| FIG_0105-Touch-Prohibition | P06:P3 | P06:P3 | active at P06 Prop 3 (1st of 3-prohibition cluster) |
| FIG_0106-Shame-Prohibition | P06:P17 | P06:P17 | active at P06 Prop 17 (2nd of 3-prohibition cluster) |
| FIG_0107-Rebuke-Prohibition | P06:P19 | P06:P19 | active at P06 Prop 19 (3rd of 3-prohibition cluster) |
| FIG_0100-Full-Knowledge-Doubling | P06:P7 | P06:P7 | active at P06 Prop 7 |
| FIG_0101-Deliberate-Pulling-Doubling | P06:P18 | P06:P18 | active at P06 Prop 18 |
| FIG_0102-Heart-Reaching-Speech | P06:P11 | P06:P11 | active at P06 Prop 11 |
| FIG_0103-Before-Now-Idiom | P06:P8 | P06:P8 | active at P06 Prop 8 |
| FIG_0132-Amah-Vs-Shifchah | P06:P11 | P09 (3:9) | opens P06 Prop 11; cross-pericope status-shift pair closes at P09 (3:9, AMAH) |

Notes on the cross-pericope close cases (P07/P09/P11): the close point is in a pericope not yet mapped, so
`closes-at-proposition` uses the verse form (e.g. `"P07:2:23"`) — keep it parallel to the existing pericope-level
`closes-at` value already in that figure's frontmatter (do not invent a proposition number for an unmapped pericope).
