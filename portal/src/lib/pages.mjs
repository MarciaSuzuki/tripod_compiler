import { escapeHtml, escapeAttr, slugify } from './html.mjs';
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
      <img class="logo" src="${relRoot}assets/shema-mark.png" alt="Shema" height="46">
      <span class="header-title">Tripod Method</span>
    </a>
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
  <h1>A meaning-first approach to Bible translation</h1>
  <p class="lede">A shared home for people who want to understand, develop, review, and use Meaning Maps in translation and ministry.</p>
  <div class="hero-actions" aria-label="Start here">
    <a class="btn btn-primary" href="meaning-maps.html">Read a Meaning Map</a>
    <a class="btn btn-secondary" href="atlas/index.html">Explore the Corpus</a>
    <a class="text-link" href="tripod-method.html">The Tripod Method — three legs, three translation roles →</a>
  </div>
</section>

<section class="portal-paths" aria-labelledby="portal-paths-title">
  <div class="section-intro"><p class="eyebrow">Four ways to use this portal</p><h2 id="portal-paths-title">Start with what you need</h2></div>
  <div class="path-grid">
    <article class="path-card"><span class="path-number">01</span><h3>Learn</h3><p>Understand the Tripod Method, the three roles, and how Meaning Maps fit into the larger work.</p><a href="tripod-method.html">Learn the method →</a><a href="atlas/tours.html">Four guided tours</a></article>
    <article class="path-card"><span class="path-number">02</span><h3>Read</h3><p>Review approved Meaning Maps passage by passage, with the supporting machine-readable records.</p><a href="meaning-maps.html">Browse the library →</a></article>
    <article class="path-card"><span class="path-number">03</span><h3>Contribute</h3><p>Ask questions, suggest changes, and help the team strengthen the shared description of each passage.</p><a href="#using-maps">See how review works →</a></article>
    <article class="path-card"><span class="path-number">04</span><h3>Apply</h3><p>Use the maps as a trustworthy foundation for translation, training, and ministry conversations.</p><a href="#using-maps">Using the maps →</a></article>
  </div>
</section>

<section class="using-maps" id="using-maps" aria-labelledby="using-maps-title">
  <div class="section-intro"><p class="eyebrow">A common language for the work</p><h2 id="using-maps-title">What is a Meaning Map?</h2></div>
  <p>A Meaning Map is a structured description of one biblical passage's semantic, pragmatic, and rhetorical content: what it says, how it works, and how it is expressed. It is used to reconstruct the passage faithfully in another language.</p>
  <div class="artifact-guide">
    <div><strong>Meaning Map</strong><span>Human-readable description for people</span></div>
    <div><strong>Meaning Coordinates</strong><span>Machine-readable structure for the translation system</span></div>
    <div><strong>Compilation Log</strong><span>Trace of what was checked and flagged</span></div>
  </div>
  <p class="review-note">Every published page is read-only. Questions and suggestions go to the OBT Lab for review; they never change an artifact directly.</p>
</section>

<section class="bookshelf" id="passages" aria-labelledby="passages-title">
  <div class="section-intro"><p class="eyebrow">Approved passage descriptions</p><h2 id="passages-title">Meaning Maps by book</h2><a class="section-link" href="meaning-maps.html">Open the library →</a></div>
${bookSections}
</section>

<details class="about">
  <summary>About the portal and its published data</summary>
  <dl class="gloss">
    <dt>Meaning Map</dt>
    <dd>A structured, human-readable description of one Bible passage's semantic, pragmatic, and rhetorical content — what it says,
    how it works, and how it is expressed. <strong>This is the main document to review before reconstruction in another language.</strong></dd>
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

export function meaningMapsPage({ books }) {
  const section = (label, testament) => {
    const group = books.filter((b) => b.testament === testament);
    if (!group.length) return '';
    return `<section class="library-section" aria-labelledby="${testament.toLowerCase()}-books-title">
      <div class="library-section-heading"><p class="eyebrow">${testament === 'OT' ? 'The first collection' : 'The second collection'}</p><h2 id="${testament.toLowerCase()}-books-title">${label}</h2></div>
      <div class="library-grid">${group.map(libraryBookCard).join('\n')}</div>
    </section>`;
  };

  return `<section class="meaning-library">
    <nav class="library-crumbs"><a href="index.html">← Tripod Exegete Portal</a></nav>
    <header class="library-hero">
      <p class="eyebrow">Read the published corpus</p>
      <h1>Meaning Maps</h1>
      <p>A book-by-book library of approved passage descriptions, with the machine-readable files and compilation records that accompany them.</p>
    </header>
    ${section('Old Testament', 'OT')}
    ${section('New Testament', 'NT')}
  </section>`;
}

export function bookPage({ book }) {
  const complete = book.pericopes.filter((p) => p.has.map && p.has.meaningCoordinates && p.has.log).length;
  const pct = book.pericopes.length ? Math.round((complete / book.pericopes.length) * 100) : 0;
  return `<section class="book-page">
    <nav class="library-crumbs"><a href="../meaning-maps.html">← Meaning Maps</a></nav>
    <header class="book-page-header">
      <div><p class="eyebrow">${escapeHtml(book.testament === 'OT' ? 'Old Testament' : 'New Testament')}</p><h1>${escapeHtml(book.title)}</h1></div>
      <div class="book-page-stats"><strong>${book.pericopes.length}</strong><span>passages</span><strong>${pct}%</strong><span>complete artifact sets</span></div>
    </header>
    <div class="book-progress" aria-label="${pct}% of this book has complete artifact sets"><span style="width:${pct}%"></span></div>
    <p class="book-page-intro">Choose a passage to read its Meaning Map and inspect the supporting artifacts.</p>
    <ul class="cards library-pericopes">${book.pericopes.map((p) => pericopeCard(p, '../')).join('\n')}</ul>
  </section>`;
}

function libraryBookCard(book) {
  const complete = book.pericopes.filter((p) => p.has.map && p.has.meaningCoordinates && p.has.log).length;
  const pct = book.pericopes.length ? Math.round((complete / book.pericopes.length) * 100) : 0;
  return `<a class="library-book-card" href="books/${slugify(book.title)}.html">
    <span class="library-book-top"><span class="library-book-number">${escapeHtml(book.testament)}</span><span class="library-book-arrow">→</span></span>
    <h3>${escapeHtml(book.title)}</h3>
    <p>${book.pericopes.length} passage${book.pericopes.length === 1 ? '' : 's'}</p>
    <div class="book-progress"><span style="width:${pct}%"></span></div>
    <small>${pct}% complete artifact sets</small>
  </a>`;
}

function pericopeCard(p, relRoot = '') {
  const badge = (ok, okText, missingText) =>
    ok ? `<span class="badge ok">${okText}</span>` : `<span class="badge off">${missingText}</span>`;
  return `<li class="card">
      <a class="cardlink" href="${relRoot}pericopes/${escapeAttr(p.id)}.html">
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
  <p class="artifact-gloss">The human-readable description of this passage's semantic, pragmatic, and rhetorical content — what it says, how it works, and how it is expressed.</p>
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
