// Tripod Portal Atlas — V6 emotion-exegesis method page (PR-5, spec §4 V6).
//
// The method content is carried VERBATIM from the ruled sources — Frost's six
// questions and the streamlined method from the thesis (as verified in
// EMOTION-APPRAISAL-PILOT-SPEC.md §1, ruled by Marcia 2026-07-02), and the
// four-way boundary from the same ruling. The withheld-feelings exhibits are
// quoted from canon (scene significant_absence fields matched for inner-state
// withholding) — nothing on this page invents an emotion claim.

import { escapeHtml } from '../lib/html.mjs';
import { renderFeedbackButtons } from '../lib/feedback.mjs';

const SIX_QUESTIONS = [
  'Frame of Mind',
  'Influence of Relationship(s)',
  'Expectation of the Event(s)',
  'Influence of Location(s)',
  'Default Response to Emotion(s)',
  'Underlying Values at Play',
];

const FOUR_STEPS = [
  'Memorize and perform the text.',
  "Identify phrases in marked focus using Runge's resources in Translator's Workplace, as these highlight areas of special emphasis by the biblical author.",
  'Consult one or two technical commentaries on the passage for emotionally relevant information about the text.',
  'Perform the passage again before making final notes used for informing a translation.',
];

export function emotionPage({ cfg, formCfg, atlas, stats, atlasLayout }) {
  // Canon exhibits: absences that withhold inner states, quoted verbatim.
  const withheld = [];
  for (const [bookId, shard] of atlas.shards) {
    for (const s of shard.nodes) {
      if (s.kind !== 'scene' || !s.significant_absence) continue;
      const text = s.significant_absence;
      // A withheld-feelings exhibit needs BOTH an inner-state term AND
      // withholding phrasing — and canon's explicit "No marked absence"
      // sentinel (P07 S1: "...withholds nothing here...") is never one.
      if (/^\s*no marked absence/i.test(text) || /withholds nothing/i.test(text)) continue;
      if (/felt|feel|grief|mourn|emotion|inner/i.test(text) && /never says|not say|no .*(said|word|mention)|withhold/i.test(text)) {
        withheld.push({ bookId, pid: s.id.split('/')[1], scene: s.code, text: s.significant_absence });
      }
    }
  }

  // Attested-emotion exhibits: the lens's own data, quoted with counts.
  const attested = [];
  for (const [bookId, shard] of atlas.shards) {
    for (const p of shard.nodes) {
      if (p.kind !== 'pericope' || !p.emotion_attested) continue;
      attested.push({ bookId, pid: p.code, values: p.emotion_attested });
    }
  }

  const content = `
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;">
  <h1>How emotion is mapped</h1>
  ${renderFeedbackButtons(formCfg, { pericope: 'Meaning Mind — Emotion method', artifact: 'The website itself' })}
</div>
<p><span class="methodbadge">method adopted 2026-07-02 · appraisal block piloting at Psalm 13</span></p>
<p>The Tripod Method treats emotion with the same discipline as everything else: what the text
<b>states</b> is recorded, what the narrator <b>withholds</b> is protected, what must be
<b>inferred</b> is kept separate and marked, and how a community <b>voices</b> feeling is never
written into meaning at all. The exegesis method is adopted from Joshua Cameron Frost's thesis
(cited below); this page shows where each kind of finding lands.</p>

<div class="grp">The four-way boundary — where an emotion finding is allowed to live</div>
<div class="boundary">
  <div class="q"><h3>Stated</h3>
    <p>The text says it: <span class="mono">WEPT_ALOUD</span>, <span class="mono">KISSED</span>,
    <span class="mono">FEARED</span>…</p>
    <p class="dest">→ Level-3 propositions &amp; speech acts (already canon)</p></div>
  <div class="q"><h3>Withheld</h3>
    <p>The narrator deliberately does not say it.</p>
    <p class="dest">→ significant_absence — a hard constraint that <b>trumps everything</b>,
    including any inferred appraisal</p></div>
  <div class="q"><h3>Inferred</h3>
    <p>Exegesis licenses it, but the text does not state it.</p>
    <p class="dest">→ emotion_appraisals (pilot) — with holder, the valued concept, and the
    verse whose wording licenses the inference</p></div>
  <div class="q"><h3>Displayed</h3>
    <p>How a receptor community voices feeling in performance.</p>
    <p class="dest">→ never in meaning-space</p></div>
</div>

<div class="grp">The mapping-time emotion pass — Frost's six questions (thesis §5.5)</div>
<div class="panel"><ol class="frost">
${SIX_QUESTIONS.map((q) => `<li>${escapeHtml(q)}</li>`).join('\n')}
</ol>
<p>Asked per scene, per participant, while the Meaning Map's Levels 1–2 are drafted.</p></div>

<div class="grp">The internalization frame — Frost's streamlined method (thesis p. 154, §7.2.1)</div>
<div class="panel"><ol class="frost">
${FOUR_STEPS.map((q) => `<li>${escapeHtml(q)}</li>`).join('\n')}
</ol>
<p>One honest adaptation: step 2's "marked focus" pass corresponds to this project's
BHSA/discourse pass. Frost's own caveat applies — widely published translation resources
follow the rigorous six-question side, and this seed corpus is such a resource.</p></div>

<div class="grp">What the lens lights today — attested in the text, counted, never invented</div>
<div class="panel">
${attested
  .map(
    (a) => `<p><a class="mono" href="${escapeHtml(a.bookId)}.html#${escapeHtml(a.pid)}">${escapeHtml(a.pid)}</a> —
${Object.entries(a.values)
  .map(([v, c]) => `<span class="chip champagne">${escapeHtml(c > 1 ? `${v} ×${c}` : v)}</span>`)
  .join('')}</p>`
  )
  .join('\n')}
<p>Plus the <span class="mono">INTIMATE</span> register overrides — moments the text marks as
close speech. Everything above is computed from the approved artifacts through one declared
filter; the filter can highlight only values the text already states.</p></div>

<div class="grp">The withheld feelings — protected, senior to every inference</div>
<div class="panel">
${withheld
  .map(
    (w) => `<div class="absence"><span class="k">Deliberately not said — ${escapeHtml(w.pid)} · ${escapeHtml(w.scene)}</span>${escapeHtml(w.text)}
<a class="mono" style="font-size:10px;margin-left:6px;" href="${escapeHtml(w.bookId)}.html#${escapeHtml(w.pid)}">read in place ↗</a></div>`
  )
  .join('\n')}
<p>No appraisal — pilot or otherwise — may assert an inner state these fields mark as withheld.</p></div>

<div class="grp">The pilot (Tier 2 — arrives by itself)</div>
<div class="panel"><p><span class="pilotbadge">PILOT</span> When an approved artifact carries an
<span class="mono">emotion_appraisals</span> block (holder · valued concept · emotion ·
script stage · evidence anchor), its scenes render it here automatically, badged and visually
junior to any absence. Psalm 13 is the pilot; nothing renders until its artifact merges —
absence of the block is absence of any claim.</p></div>

<div class="grp">Sources</div>
<div class="panel"><p>Joshua Cameron Frost, <i>An Emotion Exegesis Method for Bible Translators:
Applied to Luke 24:1-12</i>, MA thesis, Dallas International University, 2025.
<a href="https://www.diu.edu/documents/theses/Frost_Joshua-thesis.pdf">Free PDF</a>.</p>
<p>Frost, Mustin &amp; Beal, "Quality in Oral Bible Translation: the what and how,"
SIL <i>Journal of Translation</i> 20(2), 2024, pp. 21–62.</p></div>`;

  return atlasLayout({
    cfg,
    title: 'Emotion method',
    relRoot: '../',
    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="index.html">Meaning Mind</a> · Emotion</h1>`,
    contentHtml: content,
    stats,
  });
}
