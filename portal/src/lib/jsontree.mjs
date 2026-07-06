import { escapeHtml, escapeAttr } from './html.mjs';
import { entityTooltip, deSlug } from './registry.mjs';

// MEANING_COORDINATES / compilation-log JSON → a collapsible outline, rendered entirely
// with native <details>/<summary> — no client-side JavaScript. Registry codes
// inside string values (B2, CB_0029, FIG_0007, TM_PERIOD_OF_JUDGES…) get the
// same hover tooltips as wikilinks in the prose. String values render with
// dir="auto" so any embedded Hebrew lays out right-to-left correctly.

// Only prefixes that are REGISTRY namespaces — deliberately excludes generic
// UPPER_SNAKE vocabulary values (STATES_AS_TRUE etc.), which are not entities.
const CODE_TOKEN_RE = /\b(CB_\d{4}|FIG_\d{4}|(?:B|PL|O|I|TM|TH)\d+|(?:PL|TM|TH|O|I)_[A-Z0-9_]{2,})\b/g;

function annotateCodes(ctx, escapedString) {
  return escapedString.replace(CODE_TOKEN_RE, (code) => {
    let tip = null;
    if (code.startsWith('CB_')) {
      const c = ctx.registries.concept(code);
      if (c) tip = `${code} · Concept Bank · ${deSlug(c.name_slug ?? '')}`;
    } else if (code.startsWith('FIG_')) {
      const f = ctx.registries.figure(code);
      if (f) tip = `${code} · Figure Registry · ${deSlug(f.name_slug ?? '')}`;
    } else {
      const e = ctx.registries.entity(ctx.bookPrefix, code);
      if (e) tip = entityTooltip(code, e);
    }
    if (!tip) return code; // not in a public registry — leave the token alone
    return `<span class="wl wl-entity" title="${escapeAttr(tip)}">${code}</span>`;
  });
}

function renderValue(ctx, value) {
  if (value === null) return `<span class="jval jnull">null</span>`;
  switch (typeof value) {
    case 'string':
      return `<span class="jval jstr" dir="auto">${annotateCodes(ctx, escapeHtml(value))}</span>`;
    case 'number':
    case 'boolean':
      return `<span class="jval jnum">${String(value)}</span>`;
    default:
      return `<span class="jval">${escapeHtml(JSON.stringify(value))}</span>`;
  }
}

function isLeaf(v) {
  return v === null || typeof v !== 'object';
}

function summaryMeta(v) {
  if (Array.isArray(v)) return `[${v.length} item${v.length === 1 ? '' : 's'}]`;
  const n = Object.keys(v).length;
  return `{${n} field${n === 1 ? '' : 's'}}`;
}

function renderNode(ctx, key, value, depth, openDepth) {
  const keyHtml = key === null ? '' : `<span class="jkey">${escapeHtml(key)}</span>`;

  if (isLeaf(value)) {
    return `<div class="jrow">${keyHtml}${renderValue(ctx, value)}</div>`;
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);

  if (entries.length === 0) {
    return `<div class="jrow">${keyHtml}<span class="jval jmeta">${Array.isArray(value) ? '[empty]' : '{empty}'}</span></div>`;
  }

  const open = depth < openDepth ? ' open' : '';
  const children = entries
    .map(([k, v]) => renderNode(ctx, Array.isArray(value) ? `${k}` : k, v, depth + 1, openDepth))
    .join('\n');

  return (
    `<details class="jnode"${open}>` +
    `<summary>${keyHtml}<span class="jmeta">${summaryMeta(value)}</span></summary>` +
    `<div class="jchildren">${children}</div>` +
    `</details>`
  );
}

/**
 * Render a parsed JSON document as a collapsible tree plus a "raw JSON"
 * fallback. openDepth controls how many levels start expanded.
 */
export function renderJsonTree(ctx, doc, { openDepth = 2 } = {}) {
  const tree = renderNode(ctx, null, doc, 0, openDepth);
  const raw = escapeHtml(JSON.stringify(doc, null, 2));
  return (
    `<div class="jsontree">${tree}</div>` +
    `<details class="rawjson"><summary>Raw JSON (exact file content)</summary><pre dir="ltr">${raw}</pre></details>`
  );
}
