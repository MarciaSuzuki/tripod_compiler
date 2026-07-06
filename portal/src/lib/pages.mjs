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
    <nav class="modeswitch" aria-label="the two rooms of this site">
      <span class="mode on" aria-current="page">Reading Room</span><a class="mode mind" href="${relRoot}atlas/index.html">Meaning Mind →</a>
    </nav>
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
  // One house, two rooms (Marcia's ruling 2026-07-04): the Reading Room is
  // for reading and commenting on the Meaning Maps; the Meaning Mind is for
  // exploring where everything connects. Books first — each book opens to
  // its passages; the long instructions live collapsed until asked for.
  const bookStatus = (b) => {
    const complete = b.pericopes.every((x) => x.has.map && x.has.meaningCoordinates && x.has.log);
    return complete
      ? 'maps, machine files and logs — complete'
      : 'maps published — machine files in progress';
  };
  const bookSections = books
    .map(
      (b) => `
<details class="book">
  <summary>
    <h3 class="btitle">${escapeHtml(b.title)}</h3>
    <span class="bmeta">${b.pericopes.length} passage${b.pericopes.length === 1 ? '' : 's'} · ${escapeHtml(bookStatus(b))}</span>
  </summary>
  <ul class="cards">
    ${b.pericopes.map(pericopeCard).join('\n    ')}
  </ul>
</details>`
    )
    .join('\n');

  const formNote = formConfigured
    ? ''
    : `<p class="note">The feedback form is still being connected — the “Ask a question” / “Suggest a change” buttons will go live shortly.</p>`;

  return `
<section class="intro">
  <h1>The Reading Room</h1>
</section>

<section class="rooms" aria-label="the two rooms">
  <div class="roomcard here">
    <span class="roomtag">You are here</span>
    <h2>Reading Room</h2>
    <p>Read the approved Meaning Maps, passage by passage — and send questions or suggestions
    straight from any document.</p>
  </div>
  <a class="roomcard mind" href="atlas/index.html">
    <span class="roomtag">The other room</span>
    <h2>Meaning Mind</h2>
    <p>The whole seed corpus, connected — explore and study every passage, person, place and
    concept as one living structure.</p>
    <span class="roomgo">Enter the Mind →</span>
  </a>
</section>
<p class="toursline"><a href="atlas/tours.html">Four guided tours</a> walk the
Meaning Mind step by step — full-screen, arrow keys, no setup.</p>
<p class="toursline"><a href="tripod-method.html">The Tripod Method — three legs, three translation roles →</a></p>

<details class="about">
  <summary>First time here? What you're looking at, and how to comment</summary>
  <dl class="gloss">
    <dt>Meaning Map</dt>
    <dd>A human-readable study of one Bible passage: what the passage says — scene by scene, statement by statement —
    and how it says it (its tone, its pace, its level of formality). <strong>This is the main document to review.</strong></dd>
    <dt>MEANING_COORDINATES (also called the STA file)</dt>
    <dd>The same content converted into a strict, machine-readable file — the exact input the translation software will use.
    It is shown as an expandable outline. Most reviewers can skim or skip it.</dd>
    <dt>Compilation Log</dt>
    <dd>The working record kept while the MEANING_COORDINATES was produced from the Meaning Map: what was checked and what was flagged for attention.</dd>
  </dl>
  <p>Every document has <em>Ask a question</em> and <em>Suggest a change</em> buttons that open a short form with the passage
  and document already filled in. Hebrew words appear throughout — hover over a highlighted name or term to see its Hebrew form.</p>
  ${formNote}
</details>

<section class="bookshelf" aria-label="the books">
  <h2 class="shelfhead">The books</h2>
${bookSections}
</section>`;
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
        ${badge(p.has.meaningCoordinates, 'MEANING_COORDINATES', 'MEANING_COORDINATES not yet authored')}
        ${badge(p.has.log, 'Log', 'Log not yet authored')}
      </span>
    </li>`;
}

export function pericopePage({ cfg, p, formCfg, wikilinkCtx }) {
  const tocItems = [
    `<a href="#meaning-map">Meaning Map</a>`,
    p.meaningCoordinatesHtml ? `<a href="#meaning-coordinates">Meaning Coordinates</a>` : null,
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

  const mcSection = p.meaningCoordinatesHtml
    ? `
<span id="for-model" aria-hidden="true"></span>
<section class="artifact" id="meaning-coordinates">
  <div class="secthead">
    <h2>Meaning Coordinates (STA)</h2>
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Meaning Coordinates (STA)' })}
  </div>
  <p class="artifact-gloss">The machine-readable version of the map — the exact file the translation software will use, shown as an expandable outline.
  Click a line to fold or unfold it.</p>
  ${p.meaningCoordinatesHtml}
</section>`
    : `
<span id="for-model" aria-hidden="true"></span>
<section class="artifact artifact-missing" id="meaning-coordinates">
  <h2>Meaning Coordinates (STA)</h2>
  <p class="artifact-gloss">Not yet authored for this passage — so far, the Meaning Map above is the approved artifact.</p>
</section>`;

  const logSection = p.logHtml
    ? `
<section class="artifact" id="compilation-log">
  <div class="secthead">
    <h2>Compilation Log</h2>
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Compilation Log' })}
  </div>
  <p class="artifact-gloss">The working record of how the MEANING_COORDINATES was produced from the map — what was checked, and what was flagged for attention.</p>
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
${mcSection}
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
