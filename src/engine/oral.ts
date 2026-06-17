import type { Finding } from "./report.js";

/**
 * SC-0065 — oral-only structural checks. The audio-bead analogue of the biblical scene-tiling /
 * verse-coverage invariants (oral field-app invariant 4). Bead positions are speaker-set by ear,
 * so a violation is a real authoring error, not vocabulary drift → block.
 *
 *   - every scene + proposition carries a well-formed bead_span (start ≤ end);
 *   - scenes TILE the header (passage) span: contiguous, no gaps, no overlaps, covering it end to end;
 *   - each proposition NESTS: the scene whose bead_span contains the prop's bead_span is exactly the
 *     scene its scene_link names.
 *
 * Bead spans are inclusive — end_bead is the last bead in the span — so contiguity means the next
 * scene starts one bead after the previous ends. Runs only for oral artifacts (source_domain =
 * oral_archive); biblical artifacts have no bead_span and never reach here.
 */
type Span = { s: number; e: number };
const asArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);
const span = (n: any): Span | null =>
  n && Number.isInteger(n.start_bead) && Number.isInteger(n.end_bead) ? { s: n.start_bead, e: n.end_bead } : null;

export function oralFindings(json: any): Finding[] {
  const out: Finding[] = [];
  const block = (location: string, message: string) =>
    out.push({ severity: "block", code: "bead-span", location, message });

  const header = span(json?.header?.bead_span);
  const scenes = asArray(json?.level_2_scenes);

  // per-scene well-formedness
  const sceneSpans = scenes.map((sc, i) => ({
    id: typeof sc?.scene_id === "string" ? sc.scene_id : `#${i}`,
    at: `/level_2_scenes/${i}/bead_span`,
    sp: span(sc?.bead_span),
  }));
  for (const s of sceneSpans) {
    if (!s.sp) block(s.at, `scene ${s.id} has no well-formed bead_span (integer start_bead/end_bead)`);
    else if (s.sp.e < s.sp.s) block(s.at, `scene ${s.id} bead_span end (${s.sp.e}) precedes start (${s.sp.s})`);
  }

  // tiling: contiguous, no gaps, no overlaps, covering the header span
  const ordered = sceneSpans.filter((s) => s.sp && s.sp.e >= s.sp.s).sort((a, b) => a.sp!.s - b.sp!.s);
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]!.sp!, cur = ordered[i]!.sp!;
    if (cur.s > prev.e + 1)
      block(ordered[i]!.at, `bead gap between scene ${ordered[i - 1]!.id} (…${prev.e}) and ${ordered[i]!.id} (${cur.s}…) — scenes must tile the passage with no gaps`);
    else if (cur.s <= prev.e)
      block(ordered[i]!.at, `bead overlap between scene ${ordered[i - 1]!.id} (…${prev.e}) and ${ordered[i]!.id} (${cur.s}…) — scenes must not overlap`);
  }
  if (header && ordered.length) {
    if (ordered[0]!.sp!.s !== header.s)
      block("/level_2_scenes/0/bead_span", `scenes start at bead ${ordered[0]!.sp!.s} but the passage (header bead_span) starts at ${header.s} — scenes must cover the whole passage`);
    if (ordered[ordered.length - 1]!.sp!.e !== header.e)
      block("/header/bead_span", `scenes end at bead ${ordered[ordered.length - 1]!.sp!.e} but the passage (header bead_span) ends at ${header.e} — scenes must cover the whole passage`);
  }

  // nesting (invariant 4): the scene containing a prop's bead_span must be the one its scene_link names
  const containing = (p: Span) => ordered.filter((s) => s.sp!.s <= p.s && p.e <= s.sp!.e);
  asArray(json?.level_3_propositions).forEach((p, pi) => {
    const at = `/level_3_propositions/${pi}/bead_span`;
    const ps = span(p?.bead_span);
    if (!ps) return void block(at, `proposition ${p?.prop_id ?? `#${pi}`} has no well-formed bead_span`);
    if (ps.e < ps.s) return void block(at, `proposition ${p?.prop_id ?? `#${pi}`} bead_span end (${ps.e}) precedes start (${ps.s})`);
    const hosts = containing(ps);
    if (hosts.length === 0)
      return void block(at, `proposition ${p?.prop_id ?? `#${pi}`} bead_span (${ps.s}–${ps.e}) is not contained in any scene`);
    const link = typeof p?.scene_link === "string" ? p.scene_link : null;
    if (link && !hosts.some((h) => h.id === link))
      block(`/level_3_propositions/${pi}/scene_link`, `proposition ${p?.prop_id ?? `#${pi}`} bead_span (${ps.s}–${ps.e}) sits in scene ${hosts.map((h) => h.id).join("/")}, but scene_link names ${link}`);
  });

  return out;
}
