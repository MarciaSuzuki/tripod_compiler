import { escapeHtml, escapeAttr } from './html.mjs';
import { renderFeedbackButtons } from './feedback.mjs';
import { renderWikilink } from './wikilinks.mjs';

// Page templates. Written for the actual audience: external reviewers who are
// not developers and do not have GitHub accounts. House rule for all copy:
// plain language, every project term glossed on first use, no metaphors.

export function layout({ cfg, title, relRoot, contentHtml, buildInfo }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title ? `${title} · ${cfg.siteTitle}` : cfg.siteTitle)}</title>
<link rel="stylesheet" href="${relRoot}assets/style.css">
</head>
<body>
<header class="site">
  <a class="brand" href="${relRoot}index.html"><img class="logo" src="${relRoot}assets/shema-logo.svg" alt="Shema — Multimodal Bible Translation" height="52"></a>
  <div class="masthead">
    <a class="home" href="${relRoot}index.html">${escapeHtml(cfg.siteTitle)}</a>
    <div class="subtitle">${escapeHtml(cfg.siteSubtitle)}</div>
    <nav class="sitenav"><a href="${relRoot}atlas/index.html">Meaning Mind — the whole seed corpus, connected →</a></nav>
  </div>
</header>
<main>
${contentHtml}
</main>
<footer class="site">
  <p>Read-only. Built automatically from <strong>approved artifacts only</strong> on the project's <code>main</code> branch
  · commit <code>${escapeHtml(buildInfo.commit)}</code> · ${escapeHtml(buildInfo.builtAt)}.</p>
  <p>This site has no server and stores nothing. Feedback goes through the form buttons; suggestions never change a document directly —
  the project team reviews each one.</p>
</footer>
</body>
</html>
`;
}

export function indexPage({ cfg, books, buildInfo, formConfigured }) {
  const bookSections = books
    .map(
      (b) => `
<section class="book">
  <h2>${escapeHtml(b.title)}</h2>
  <ul class="cards">
    ${b.pericopes.map(pericopeCard).join('\n    ')}
  </ul>
</section>`
    )
    .join('\n');

  const formNote = formConfigured
    ? ''
    : `<p class="note">The feedback form is still being connected — the “Ask a question” / “Suggest a change” buttons will go live shortly.</p>`;

  return `
<section class="intro">
  <h1>Reading room for approved Tripod passages</h1>
  <p>This site is a reading room for the Tripod Bible-translation project. Everything here is <strong>read-only</strong>:
  you can read and send feedback, but nothing on this site can edit the documents themselves.
  The site only ever shows <strong>approved</strong> work — it is rebuilt automatically from the project's blessed files,
  and the build refuses to publish anything still in draft.</p>

  <h2>What you're looking at</h2>
  <dl class="gloss">
    <dt>Meaning Map</dt>
    <dd>A human-readable study of one Bible passage: what the passage says — scene by scene, statement by statement —
    and how it says it (its tone, its pace, its level of formality). <strong>This is the main document to review.</strong></dd>
    <dt>FOR_MODEL (also called the STA file)</dt>
    <dd>The same content converted into a strict, machine-readable file — the exact input the translation software will use.
    It is shown as an expandable outline. Most reviewers can skim or skip it.</dd>
    <dt>Compilation Log</dt>
    <dd>The working record kept while the FOR_MODEL was produced from the Meaning Map: what was checked and what was flagged for attention.</dd>
  </dl>

  <h2>How to give feedback</h2>
  <p>Every document has <em>Ask a question</em> and <em>Suggest a change</em> buttons that open a short form with the passage
  and document already filled in. Hebrew words appear throughout — hover over a highlighted name or term to see its Hebrew form.</p>
  ${formNote}
</section>
${bookSections}`;
}

function pericopeCard(p) {
  const badge = (ok, okText, missingText) =>
    ok ? `<span class="badge ok">${okText}</span>` : `<span class="badge off">${missingText}</span>`;
  return `<li class="card">
      <a class="cardlink" href="pericopes/${escapeAttr(p.id)}.html">
        <span class="pid">${escapeHtml(p.id)}</span>
        <span class="bcv">${escapeHtml(p.bcv)}</span>
        <span class="ptitle">${escapeHtml(p.title)}</span>
      </a>
      <span class="badges">
        ${badge(p.has.map, 'Meaning Map', 'Map —')}
        ${badge(p.has.forModel, 'FOR_MODEL', 'FOR_MODEL not yet authored')}
        ${badge(p.has.log, 'Log', 'Log not yet authored')}
      </span>
    </li>`;
}

export function pericopePage({ cfg, p, formCfg, wikilinkCtx }) {
  const tocItems = [
    `<a href="#meaning-map">Meaning Map</a>`,
    p.forModelHtml ? `<a href="#for-model">FOR_MODEL</a>` : null,
    p.logHtml ? `<a href="#compilation-log">Compilation Log</a>` : null,
  ].filter(Boolean);

  const chips = renderClassificationChips(p, wikilinkCtx);

  const mapSection = `
<section class="artifact" id="meaning-map">
  <div class="secthead">
    <h2>Meaning Map</h2>
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Meaning Map' })}
  </div>
  <p class="artifact-gloss">The human-readable study of this passage — what it says, scene by scene and statement by statement, and how it says it.</p>
  ${chips}
  <article class="map prose">
${p.mapHtml}
  </article>
</section>`;

  const fmSection = p.forModelHtml
    ? `
<section class="artifact" id="for-model">
  <div class="secthead">
    <h2>FOR_MODEL (STA)</h2>
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'FOR_MODEL (STA)' })}
  </div>
  <p class="artifact-gloss">The machine-readable version of the map — the exact file the translation software will use, shown as an expandable outline.
  Click a line to fold or unfold it.</p>
  ${p.forModelHtml}
</section>`
    : `
<section class="artifact artifact-missing" id="for-model">
  <h2>FOR_MODEL (STA)</h2>
  <p class="artifact-gloss">Not yet authored for this passage — so far, the Meaning Map above is the approved artifact.</p>
</section>`;

  const logSection = p.logHtml
    ? `
<section class="artifact" id="compilation-log">
  <div class="secthead">
    <h2>Compilation Log</h2>
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Compilation Log' })}
  </div>
  <p class="artifact-gloss">The working record of how the FOR_MODEL was produced from the map — what was checked, and what was flagged for attention.</p>
  ${p.logHtml}
</section>`
    : '';

  return `
<nav class="crumbs"><a href="../index.html">← All passages</a><span class="toc">${tocItems.join(' · ')}</span></nav>
<header class="pericope">
  <h1><span class="pid">${escapeHtml(p.id)}</span> ${escapeHtml(p.bcv)}</h1>
  <p class="ptitle">${escapeHtml(p.title)}</p>
</header>
${mapSection}
${fmSection}
${logSection}`;
}

function renderClassificationChips(p, ctx) {
  const fm = p.mapFrontmatter;
  const chip = (label, value) =>
    value ? `<span class="chip"><span class="chiplabel">${escapeHtml(label)}</span> ${escapeHtml(value)}</span>` : '';

  const linkChips = (label, list) => {
    if (!Array.isArray(list) || list.length === 0) return '';
    const items = list.map((t) => renderWikilink(ctx, String(t), null)).join(' ');
    return `<div class="chiprow"><span class="chiplabel">${escapeHtml(label)}</span> ${items}</div>`;
  };

  return `<div class="classification">
    <div class="chiprow">
      ${chip('Genre group', fm['genre-group'])}
      ${chip('Genre', fm['genre'])}
      ${chip('Register', fm['register'])}
    </div>
    ${linkChips('Concepts in play', fm['active-concepts'])}
    ${linkChips('Figures of speech in play', fm['active-figures'])}
  </div>`;
}
