// Tripod Portal Atlas — V5 guided tours (PR-5, spec §4 V5).
//
// Four keyboard-stepped, full-screen tours over the LIVE views (never
// screenshots), for partner meetings. The tour prose below is a DRAFT held
// to the Common-Reader Prose Standard — per the spec's content gate it is
// worded and approved by Marcia BEFORE this can merge; the Evaluator carries
// it to her one tour at a time.
//
// Progressive (§2.4): this page renders every tour as a plain readable
// article without JavaScript — the prose IS the fallback. With JS, the
// vendored atlas-tours.js turns each article into a stepped overlay that
// drives the real pages (and the living mind, via its documented handle).

import { escapeHtml, escapeAttr } from '../lib/html.mjs';
import { renderFeedbackButtons } from '../lib/feedback.mjs';

// step: { url, mind (optional engine action), title, prose }
const TOURS = [
  {
    id: 'meaning-map',
    title: 'What is a Meaning Map?',
    sub: 'One passage — the opening of Ruth — from prose study to protected silences.',
    steps: [
      {
        url: '../pericopes/P01.html#meaning-map',
        title: 'The map itself',
        prose:
          'This is a Meaning Map: a plain-language study of one Bible passage — here, the opening of Ruth. It records what the passage says and how it says it, before any translation begins.',
      },
      {
        url: '../pericopes/P01.html#meaning-map',
        title: 'Scene by scene',
        prose:
          'The map walks the passage scene by scene, in the order the text tells it. Every claim comes from the Hebrew text; nothing is added to it.',
      },
      {
        url: './ruth.html#P01',
        title: 'The same passage, as structure',
        prose:
          'The Atlas shows the same passage as structure: four scenes, each with the people and places that take part in it.',
      },
      {
        url: './ruth.html#P01',
        title: 'Statements you can check',
        prose:
          'Each scene breaks into numbered statements — small, checkable pieces of what the text says. The opening of Ruth holds thirteen of them.',
      },
      {
        url: './ruth.html#P01',
        title: 'What the text does not say',
        prose:
          'The map also records what the narrator deliberately does not say. Ruth’s opening never says that God sent the famine. That silence is written down and protected — no later stage of the work is allowed to fill it.',
      },
    ],
  },
  {
    id: 'map-to-machine',
    title: 'From Map to Machine (STA)',
    sub: 'How the human study becomes a file a computer can verify.',
    steps: [
      {
        url: '../pericopes/P01.html#meaning-map',
        title: 'People read this…',
        prose:
          'A translation team reads the Meaning Map. The translation software cannot — it needs the same meaning in a strict, checkable format.',
      },
      {
        url: '../pericopes/P01.html#for-model',
        title: '…the machine reads this',
        prose:
          'This is the FOR_MODEL file: the machine-facing version of the same map. Same scenes, same statements — now as labeled fields that software can verify piece by piece.',
      },
      {
        url: '../pericopes/P01.html#compilation-log',
        title: 'The working record',
        prose:
          'The Compilation Log is the record kept while the machine file was produced: what was checked, and what was flagged for a person to review.',
      },
      {
        url: './vocabulary.html',
        title: 'No invented labels',
        prose:
          'Every label in the machine file comes from a controlled vocabulary. No one — human or machine — may invent a new label silently.',
      },
      {
        url: './ruth.html#P01',
        title: 'And the Atlas reads it back',
        prose:
          'The Atlas is built directly from those machine files: what you see here is the FOR_MODEL, rendered as living structure.',
      },
    ],
  },
  {
    id: 'vocabulary',
    title: 'How the vocabulary grows',
    sub: 'Three layers, one ledger, and a real ruling read end to end.',
    steps: [
      {
        url: './vocabulary.html',
        title: 'One shared vocabulary',
        prose:
          'Both books — and every book to come — speak one controlled vocabulary. This page watches it grow.',
      },
      {
        url: './vocabulary.html',
        title: 'Three layers',
        prose:
          'Three layers keep it safe: closed lists that never change silently, open lists that grow only by recorded ruling, and the registry of people, places and shared concepts.',
      },
      {
        url: './vocabulary.html#proposition_kind',
        title: 'Every value has a history',
        prose:
          'Every approved value carries its provenance: the passage where it was first seen, and the ruling that admitted it.',
      },
      {
        url: './vocabulary.html#SC-0078',
        title: 'One real ruling',
        prose:
          'One real story: ruling SC-0078, June 27. The speech-act list grew from 26 to 33 values, and a new six-value axis was admitted. Every word of that is in the ledger.',
      },
      {
        url: './vocabulary.html#communicative_function_element',
        title: 'Drift stays visible',
        prose:
          'And when a value is used but not yet approved, it shows as visible drift — never silently accepted, never hidden.',
      },
    ],
  },
  {
    id: 'growing-mind',
    title: 'The growing mind',
    sub: 'The whole seed corpus as one living structure — and how it grows by itself.',
    steps: [
      {
        url: './index.html',
        title: 'The Meaning Mind',
        prose:
          'This is the seed corpus as one living structure. Every point of light is approved canon — nothing else is allowed in.',
      },
      {
        url: './index.html',
        mind: 'mode:Concepts',
        title: 'Concepts bridge the books',
        prose:
          'Shared concepts connect the books: hesed — covenant kindness — is flagged in Ruth and in Jonah. One idea, one node, both books.',
      },
      {
        url: './index.html',
        mind: 'select-ghost',
        title: 'Esther is arriving',
        prose:
          'Esther is already arriving: her fifty-one cast entries are pinned in the registry. The dashed ring becomes a full spine by itself, the day her first approved artifacts merge.',
      },
      {
        url: './index.html',
        mind: 'mode:Growth',
        title: 'Watch it grow',
        prose:
          'This is the seed being built — passage by passage, in order, each one named as it arrives.',
      },
      {
        url: './index.html',
        mind: 'mode:Mind',
        title: 'The trajectory',
        prose:
          'Nineteen passages today. The same structure — the same vocabulary, the same rules — holds at whole-Bible scale. That is what this pipeline is for.',
      },
    ],
  },
];

export function toursPage({ cfg, formCfg, atlas, stats, atlasLayout }) {
  const tourArticle = (t, i) => `
<article class="tour" id="tour-${escapeAttr(t.id)}" data-tour>
  <h2><span class="mono" style="color:var(--gold);">${i + 1}</span> · ${escapeHtml(t.title)}</h2>
  <p class="tsub">${escapeHtml(t.sub)}</p>
  <button class="tstart" hidden data-start="${escapeAttr(t.id)}">Start the full-screen tour ▸</button>
${t.steps
  .map(
    (s, j) => `  <section class="tstep" data-url="${escapeAttr(s.url)}"${s.mind ? ` data-mind="${escapeAttr(s.mind)}"` : ''}>
    <h3><span class="mono" style="font-size:10px;color:var(--dimmer);">step ${j + 1}</span> ${escapeHtml(s.title)}</h3>
    <p>${escapeHtml(s.prose)}</p>
    <p class="mono" style="font-size:10px;"><a href="${escapeAttr(s.url)}">open this view ↗</a></p>
  </section>`
  )
  .join('\n')}
</article>`;

  const content = `
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;">
  <h1>Guided tours</h1>
  ${renderFeedbackButtons(formCfg, { pericope: 'Atlas — Guided tours', artifact: 'The website itself' })}
</div>
<p>Four short, presenter-friendly walks through the living views — for partners meeting the
Tripod Method for the first time. With JavaScript on, each tour runs full-screen over the real
pages, stepped with the arrow keys (Esc leaves). Without it, every tour reads below in full.</p>
${TOURS.map(tourArticle).join('\n')}`;

  return atlasLayout({
    cfg,
    title: 'Guided tours',
    relRoot: '../',
    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="index.html">Atlas</a> · Guided tours</h1>`,
    contentHtml: content,
    stats,
    scriptHtml: `<script src="../assets/atlas-tours.js" defer></script>`,
  });
}
