// Small shared HTML helpers. Everything rendered into a page goes through
// escapeHtml/escapeAttr; source markdown is additionally pre-escaped before
// the markdown parser ever sees it (see markdown.mjs), so no author-supplied
// byte can become markup.

export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function escapeAttr(s) {
  return escapeHtml(s).replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/** Stable, readable anchor ids from heading text ("2.1 Prose Arc / Shape" → "2-1-prose-arc-shape"). */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'section';
}

/** Strip tags from a rendered HTML fragment (for slugging heading text). */
export function textContent(html) {
  return String(html).replace(/<[^>]*>/g, '');
}
