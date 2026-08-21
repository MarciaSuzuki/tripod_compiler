import { escapeHtml, escapeAttr } from './html.mjs';
import { renderFeedbackButtons, renderApprovalButton } from './feedback.mjs';
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
  <div class="sitebar">
    <a class="brand" href="${relRoot}index.html">
      <span class="logo-mark" aria-hidden="true"><img class="logo" src="${relRoot}assets/shema-logo.svg" alt="" height="46"></span>
      <span class="sr-only">${escapeHtml(cfg.siteTitle)}</span>
    </a>
    <nav class="primary-nav" aria-label="Portal navigation">
      <a href="${relRoot}index.html#passages">Meaning Maps</a>
      <a href="${relRoot}atlas/index.html">Explore the Corpus</a>
      <a href="${relRoot}tripod-method.html">The Tripod Method</a>
      <a href="${relRoot}index.html#using-maps">Using the Maps</a>
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
  // The portal home is task-oriented: learn, read, contribute, and apply.
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
<section class="hero">
  <p class="eyebrow">The Exegete Portal · OBT Lab</p>
  <h1>Biblical meaning, made reviewable.</h1>
  <p class="lede">A shared home for people who want to understand, develop, review, and use Meaning Maps in translation and ministry.</p>
  <div class="hero-actions" aria-label="Start here">
    <a class="btn btn-primary" href="#passages">Read a Meaning Map</a>
    <a class="btn btn-secondary" href="atlas/index.html">Explore the Corpus</a>
    <a class="text-link" href="tripod-method.html">The Tripod Method — three legs, three translation roles →</a>
  </div>
</section>

<section class="portal-paths" aria-labelledby="portal-paths-title">
  <div class="section-intro"><p class="eyebrow">Four ways to use this portal</p><h2 id="portal-paths-title">Start with what you need</h2></div>
  <div class="path-grid">
    <article class="path-card"><span class="path-number">01</span><h3>Learn</h3><p>Understand the Tripod Method, the three roles, and how Meaning Maps fit into the larger work.</p><a href="tripod-method.html">Learn the method →</a><a href="atlas/tours.html">Four guided tours</a></article>
    <article class="path-card"><span class="path-number">02</span><h3>Read</h3><p>Review approved Meaning Maps passage by passage, with the supporting machine-readable records.</p><a href="#passages">Browse the passages →</a></article>
    <article class="path-card"><span class="path-number">03</span><h3>Contribute</h3><p>Ask questions, suggest changes, and help the team strengthen the shared study of each passage.</p><a href="#using-maps">See how review works →</a></article>
    <article class="path-card"><span class="path-number">04</span><h3>Apply</h3><p>Use the maps as a trustworthy foundation for translation, training, and ministry conversations.</p><a href="#using-maps">Using the maps →</a></article>
  </div>
</section>

<section class="using-maps" id="using-maps" aria-labelledby="using-maps-title">
  <div class="section-intro"><p class="eyebrow">A common language for the work</p><h2 id="using-maps-title">What is a Meaning Map?</h2></div>
  <p>A Meaning Map is a human-readable study of one biblical passage: what it says, scene by scene and statement by statement, and how it says it. It is the main document to read and review before translation begins.</p>
  <div class="artifact-guide">
    <div><strong>Meaning Map</strong><span>Human-readable study for people</span></div>
    <div><strong>Meaning Coordinates</strong><span>Machine-readable structure for the translation system</span></div>
    <div><strong>Compilation Log</strong><span>Trace of what was checked and flagged</span></div>
  </div>
  <p class="review-note">Every published page is read-only. Questions and suggestions go to the OBT Lab for review; they never change an artifact directly.</p>
</section>

<section class="bookshelf" id="passages" aria-labelledby="passages-title">
  <div class="section-intro"><p class="eyebrow">Approved passage studies</p><h2 id="passages-title">Meaning Maps by book</h2></div>
${bookSections}
</section>

<details class="about">
  <summary>About the portal and its published data</summary>
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
`;
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

  // Copy serves the readable text (what you see is what you paste); Download
  // serves the blessed source file itself, byte-identical — the file a reviewer
  // keeps hashes to the same sha the manifest records and the approval pin names.
  // The copy button needs the clipboard API, so it ships hidden and JS reveals
  // it: the no-JS page shows no dead control.
  const mapTools = p.mapFile
    ? `<span class="btns">` +
      `<button class="btn" id="copymap" type="button" aria-live="polite" hidden>Copy the map text</button>` +
      `<a class="btn" href="${escapeAttr(p.mapFile)}" download="${escapeAttr(p.id)}-meaning-map.md" rel="nofollow">Download the map</a>` +
      `</span>`
    : '';
  const mapToolsScript = p.mapFile
    ? `
<script>
(function () {
  var b = document.getElementById('copymap');
  if (!b || !navigator.clipboard) return;
  b.hidden = false;
  var idle = b.textContent, busy = false;
  b.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    var art = document.querySelector('article.map'), t;
    art.classList.add('copying');
    try { t = art.innerText; } finally { art.classList.remove('copying'); }
    var flash = function (msg) {
      b.textContent = msg;
      setTimeout(function () { b.textContent = idle; busy = false; }, 1600);
    };
    navigator.clipboard.writeText(t).then(
      function () { flash('Copied.'); },
      function () { flash('Copy failed — use Download.'); }
    );
  });
})();
</script>`
    : '';

  const mapSection = `
<section class="artifact" id="meaning-map">
  <div class="secthead">
    <h2>Meaning Map</h2>
    ${mapTools}
    ${renderFeedbackButtons(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Meaning Map' })}
  </div>${mapToolsScript}
  <p class="artifact-gloss">The human-readable study of this passage — what it says, scene by scene and statement by statement, and how it says it.</p>
  ${chips}
  <article class="map prose">
${p.mapHtml}
  </article>
  ${p.approvalPin ? `<p class="approve-row">${renderApprovalButton(formCfg, { pericope: `${p.id} — ${p.bcv}`, artifact: 'Meaning Map', section: p.approvalPin })}</p>` : ''}
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
