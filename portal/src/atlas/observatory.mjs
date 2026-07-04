// Tripod Portal Atlas — V4 Vocabulary Observatory (PR-4, spec §4).
//
// How the controlled vocabulary grows, told entirely from computed data:
// current size per axis, per-value provenance cards (which SC admitted a
// value, from which pericope, where it is used), the growth timeline of
// admitting rulings (SC-0001 → today, with each ruling's own bolded headline
// facts carried verbatim from SPEC_CHANGES.md), and the three-layer
// explainer. Static, zero client-side JS, same treatment as the other
// Atlas destination pages.

import { escapeHtml, escapeAttr } from '../lib/html.mjs';
import { renderFeedbackButtons } from '../lib/feedback.mjs';

export function observatoryPage({ cfg, formCfg, atlas, stats, atlasLayout }) {
  const g = atlas.global;
  const axes = g.vocabulary.axes;
  const vocabNodes = g.nodes.filter((n) => n.kind === 'vocabulary-value');
  const scNodes = g.nodes.filter((n) => n.kind === 'sc-ruling');
  const scById = new Map(scNodes.map((n) => [n.sc, n]));

  // Where each value is attested: pericope chips from the shards' uses-value edges.
  const usedIn = new Map(); // vocab node id → [{book, pid}]
  for (const [bookId, shard] of atlas.shards) {
    for (const e of shard.edges) {
      if (e.kind !== 'uses-value') continue;
      if (!usedIn.has(e.to)) usedIn.set(e.to, []);
      usedIn.get(e.to).push({ book: bookId, pid: e.from.split('/')[1] });
    }
  }

  // Which values each SC admitted (reverse of introduced-by).
  const admitted = new Map(); // sc id (SC-XXXX) → vocab nodes
  for (const e of g.edges) {
    if (e.kind !== 'introduced-by') continue;
    const sc = e.to.replace('sc/', '');
    if (!admitted.has(sc)) admitted.set(sc, []);
    const node = vocabNodes.find((n) => n.id === e.from);
    if (node) admitted.get(sc).push(node);
  }

  const chip = (text, tone = '', href = null, title = null) => {
    const cls = `chip${tone ? ` ${tone}` : ''}`;
    const tip = title ? ` title="${escapeAttr(title)}"` : '';
    return href
      ? `<a class="${cls}" href="${escapeAttr(href)}"${tip}>${escapeHtml(text)}</a>`
      : `<span class="${cls}"${tip}>${escapeHtml(text)}</span>`;
  };

  const valueCard = (v) => {
    const uses = usedIn.get(v.id) ?? [];
    const useChips = uses
      .map((u) => chip(u.pid, 'gold', `./${u.book}.html#${u.pid}`))
      .join('');
    let provenance = '';
    if (v.layer === 'L2-bounded-open') {
      provenance = v.sc_ref
        ? `<span class="prov">first seen ${escapeHtml(v.first_seen ?? '—')} · approved in ${escapeHtml(v.approved_in ?? '—')} · admitted by <a href="#${escapeAttr(v.sc_ref)}">${escapeHtml(v.sc_ref)}</a></span>`
        : `<span class="prov">provenance not recorded</span>`;
    } else if (v.layer === 'L1-closed') {
      provenance = `<span class="prov">pinned closed list — changes only by ruling</span>`;
    } else {
      provenance = `<span class="prov drift">attested in the corpus — awaiting a ruling (visible drift)</span>`;
    }
    return `<div class="vcard${v.layer === 'attested-only' ? ' drifted' : ''}" id="${escapeAttr(v.id)}">
  <span class="chip ${v.layer === 'attested-only' ? 'amber' : v.layer === 'L1-closed' ? 'ebl' : 'gold'}">${escapeHtml(v.value)}</span>
  ${provenance}
  ${useChips ? `<span class="uses">used in ${useChips}</span>` : ''}
</div>`;
  };

  const axisSection = (ax) => {
    const values = vocabNodes.filter((n) => n.axis === ax.axis);
    const layerChip =
      ax.layer === 'L1-closed'
        ? chip('L1 · closed', 'ebl', null, 'a value outside this list is a hard error')
        : chip('L2 · bounded-open', 'gold', null, 'new values arrive as drift → review → ruling');
    const driftNote = ax.attested_only
      ? ` ${chip(`${ax.attested_only} attested, awaiting ruling`, 'amber')}`
      : '';
    return `<div class="panel" id="${escapeAttr(ax.axis)}">
  <h3 class="mono" style="margin-top:0;">${escapeHtml(ax.axis)} — ${ax.approved} approved ${layerChip}${driftNote}</h3>
  <details>
    <summary class="mono" style="cursor:pointer;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);">every value, with its provenance</summary>
    <div class="vgrid">
${values.map(valueCard).join('\n')}
    </div>
  </details>
</div>`;
  };

  // Growth timeline: only rulings that actually admitted vocabulary, in date order.
  const admittingScs = [...admitted.keys()]
    .map((sc) => scById.get(sc))
    .filter(Boolean)
    .sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')));

  const timelineCard = (sc) => {
    const values = admitted.get(sc.sc) ?? [];
    const byAxis = new Map();
    for (const v of values) {
      if (!byAxis.has(v.axis)) byAxis.set(v.axis, []);
      byAxis.get(v.axis).push(v);
    }
    const groups = [...byAxis.entries()]
      .map(
        ([axis, vs]) =>
          `<div class="grp">${escapeHtml(axis)} +${vs.length}</div><div>${vs
            .map((v) => chip(v.value, 'gold', `#${v.id}`))
            .join('')}</div>`
      )
      .join('\n');
    const highlights = (sc.highlights ?? [])
      .map((h) => `<li>${escapeHtml(h)}</li>`)
      .join('');
    return `<div class="panel" id="${escapeAttr(sc.sc)}">
  <h3 style="margin-top:0;"><span class="mono" style="color:var(--gold);letter-spacing:.1em;">${escapeHtml(sc.sc)}</span>
    <span class="mono" style="font-size:10px;color:var(--dimmer);">${escapeHtml(sc.date ?? '')} · ${escapeHtml(sc.status ?? '')}</span></h3>
  <p>${escapeHtml(sc.title ?? '')}</p>
  ${highlights ? `<ul class="hl">${highlights}</ul>` : ''}
  ${groups}
</div>`;
  };

  const ledgerRow = (sc) =>
    `<tr><td class="mono"><a href="${admitted.has(sc.sc) ? `#${escapeAttr(sc.sc)}` : '#'}" ${admitted.has(sc.sc) ? '' : 'style="color:var(--dim);pointer-events:none;text-decoration:none;"'}>${escapeHtml(sc.sc)}</a></td><td class="mono">${escapeHtml(sc.date ?? '—')}</td><td>${escapeHtml(sc.title ?? '')}</td><td class="mono">${escapeHtml(sc.status ?? '')}</td></tr>`;

  const l1 = axes.filter((a) => a.layer === 'L1-closed');
  const l2 = axes.filter((a) => a.layer !== 'L1-closed');
  const totalCast = atlas.books.reduce((n, b) => n + b.counts.entities, 0);

  const content = `
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;">
  <h1>Vocabulary Observatory</h1>
  ${renderFeedbackButtons(formCfg, { pericope: 'Atlas — Vocabulary Observatory', artifact: 'The website itself' })}
</div>
<p>The controlled vocabulary is the interlanguage every book speaks — and it grows only under
governance. This page is generated from the pinned spec files
(<span class="mono">enumerations ${escapeHtml(g.vocabulary.enumerations_version ?? '')}</span> ·
<span class="mono">rules ${escapeHtml(g.vocabulary.validation_rules_version ?? '')}</span> ·
<span class="mono">${escapeHtml(g.vocabulary.tagset_version ?? '')}</span>) and the
<span class="mono">SPEC_CHANGES.md</span> ledger: every count is computed, and every approved
bounded-open value carries the ruling that admitted it.</p>

<div class="grp">The three layers — how a value is allowed to exist</div>
<div class="books">
  <div class="bookcard"><div class="bt"><h2 style="font-size:16px;color:var(--ebl);">L1 — closed</h2></div>
    <div class="facts">${l1.map((a) => `<b>${a.approved}</b> ${escapeHtml(a.axis)}`).join(' · ')}<br>
    A value outside these lists is a <b>hard error</b> — the cross-corpus interlanguage.</div></div>
  <div class="bookcard"><div class="bt"><h2 style="font-size:16px;color:var(--gold);">L2 — bounded-open</h2></div>
    <div class="facts"><b>${l2.reduce((n, a) => n + a.approved, 0)}</b> approved values across <b>${l2.length}</b> axes<br>
    New values surface as <b>drift</b>, get reviewed, and enter only by ruling — with provenance.</div></div>
  <div class="bookcard"><div class="bt"><h2 style="font-size:16px;color:var(--champagne);">L3 — registry</h2></div>
    <div class="facts"><b>${totalCast}</b> cast entities · <b>${g.counts.concepts}</b> concepts · <b>${g.counts.figures}</b> figures<br>
    Per-book casts and the global banks — browsable in the <a href="index.html">Atlas</a> registry pages.</div></div>
</div>

<div class="grp">Current size per axis — ${axes.length} axes · ${g.counts.vocabulary_values} values</div>
${[...l1, ...l2].map(axisSection).join('\n')}

<div class="grp" id="timeline">The growth timeline — the rulings that admitted vocabulary</div>
<p>${admittingScs.length} of the ${g.counts.sc_rulings} recorded rulings admitted bounded-open
vocabulary; each card lists exactly what it let in. Bulleted lines are the ruling's own
bolded headline facts, verbatim from the ledger.</p>
${admittingScs.map(timelineCard).join('\n')}

<div class="grp">The full ledger — ${g.counts.sc_rulings} rulings</div>
<div class="panel backlinks tablewrap">
<details><summary class="mono" style="cursor:pointer;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);">every recorded ruling</summary>
<table><tr><th>ruling</th><th>date</th><th>decision</th><th>status</th></tr>
${scNodes.map(ledgerRow).join('\n')}
</table></details>
</div>`;

  return atlasLayout({
    cfg,
    title: 'Vocabulary Observatory',
    relRoot: '../',
    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="index.html">Atlas</a> · Vocabulary Observatory</h1>`,
    contentHtml: content,
    stats,
  });
}
