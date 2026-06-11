import { marked } from 'marked';
import { escapeHtml, slugify, textContent } from './html.mjs';
import { renderWikilink, WIKILINK_RE } from './wikilinks.mjs';

// Meaning-map markdown → HTML, in four deliberate steps:
//
//   1. HTML-escape the whole source. The corpus contains no raw HTML today;
//      this guarantees it never can inject any (defense in depth — these pages
//      are world-readable).
//   2. Swap every [[wikilink]] for an inert placeholder token, so the markdown
//      parser can neither mangle a wikilink nor be confused by one inside
//      emphasis/headings. The token is fenced with U+E000 (Private Use Area):
//      markdown gives PUA chars no meaning, and unlike U+0000 no spec requires
//      replacing them.
//   3. Run marked (GFM) on the escaped, placeholder-protected text.
//   4. Restore placeholders with fully-rendered wikilink HTML, then add stable
//      ids (+ optional per-section "ask" links) to h2/h3 headings.

export function renderMarkdown(ctx, source, { headingPrefix = '', sectionAskUrl = null } = {}) {
  const escaped = escapeHtml(source);

  const stash = [];
  const protectedText = escaped.replace(WIKILINK_RE, (_, target, pipe) => {
    stash.push(renderWikilink(ctx, target, pipe));
    return `WL${stash.length - 1}`;
  });

  let html = marked.parse(protectedText, { gfm: true, breaks: false, async: false });

  html = html.replace(/WL(\d+)/g, (_, i) => stash[Number(i)]);

  if (html.includes('')) {
    throw new Error('internal: a wikilink placeholder survived markdown rendering unrestored');
  }

  return addHeadingAnchors(html, { headingPrefix, sectionAskUrl });
}

/**
 * Give every h2/h3 a stable id; optionally append a small "ask about this
 * section" link (the Google-Form prefill, built per section by the caller).
 * Returns { html, sections: [{ level, id, text }] }.
 */
export function addHeadingAnchors(html, { headingPrefix = '', sectionAskUrl = null } = {}) {
  const sections = [];
  const seen = new Map();

  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const text = textContent(inner).trim();
    let id = (headingPrefix ? headingPrefix + '-' : '') + slugify(text);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    sections.push({ level: Number(level), id, text });

    const ask = sectionAskUrl
      ? ` <a class="ask-section" href="${sectionAskUrl(text)}" target="_blank" rel="noopener" title="Ask a question about this section (opens the feedback form)">ask</a>`
      : '';
    return `<h${level} id="${id}">${inner}${ask}</h${level}>`;
  });

  return { html: out, sections };
}
