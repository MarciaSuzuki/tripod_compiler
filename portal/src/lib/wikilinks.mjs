import { escapeHtml, escapeAttr } from './html.mjs';
import { deSlug, entityTooltip } from './registry.mjs';

// Obsidian [[wikilink]] resolution.
//
// Target shapes seen in the blessed corpus:
//   [[B2-Elimelech]] [[PL1-Bethlehem-of-Judah]] [[O1-Famine]]        entity code + display slug
//   [[PL_LAND_OF_JUDAH]] [[TM_PERIOD_OF_JUDGES-In-the-Days...]]      symbolic entity codes
//   [[TH_TEN_YEARS_APPROXIMATELY-About-Ten-Years]]
//   [[CB_0029-Judges-Era]] [[FIG_0007-Narrator-Frame...]]            global concept / figure codes
//   [[P01-Ruth-1-1-5]] [[P01-Ruth-1-1-5-MEANING-COORDINATES]]                  cross-artifact note links
//   [[...|Display text]]                                             piped display override
//
// Resolution is best-effort BY DESIGN: an unresolvable link renders as plain
// styled text with an explanatory tooltip. Registry coverage is the pipeline's
// id-check's job, not the portal's; the portal's only hard gate is approved-only.

export const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

const ENTITY_CODE_RE = /^((?:B|PL|O|I|TM|TH)\d+|(?:B|PL|O|I|TM|TH)_[A-Z0-9_]+)(?:-(.+))?$/;
const CONCEPT_RE = /^(CB_\d{4})(?:-(.+))?$/;
const FIGURE_RE = /^(FIG_\d{4})(?:-(.+))?$/;
const PERICOPE_NOTE_RE = /^([A-Z]\d{2})-.+$/;

/** Classify a wikilink target. Pure; no registry access. */
export function classifyTarget(target) {
  const t = target.trim();
  let m;
  if ((m = CONCEPT_RE.exec(t))) return { kind: 'concept', code: m[1], slug: m[2] ?? null };
  if ((m = FIGURE_RE.exec(t))) return { kind: 'figure', code: m[1], slug: m[2] ?? null };
  if ((m = ENTITY_CODE_RE.exec(t))) return { kind: 'entity', code: m[1], slug: m[2] ?? null };
  if ((m = PERICOPE_NOTE_RE.exec(t))) {
    const pericope = m[1];
    if (t.endsWith('-MEANING-COORDINATES')) return { kind: 'artifact', artifact: 'meaning-coordinates', pericope };
    if (t.endsWith('-COMPILATION-LOG')) return { kind: 'artifact', artifact: 'compilation-log', pericope };
    if (t.endsWith('-BCD-DELTA')) return { kind: 'artifact', artifact: 'bcd-delta', pericope };
    return { kind: 'artifact', artifact: 'meaning-map', pericope };
  }
  return { kind: 'unknown' };
}

const ARTIFACT_ANCHOR = {
  'meaning-map': 'meaning-map',
  'meaning-coordinates': 'meaning-coordinates',
  'compilation-log': 'compilation-log',
};

/**
 * Render one wikilink to HTML.
 * ctx: {
 *   registries,            // loadRegistries() result
 *   bookPrefix,            // 'P' | 'J' — the book of the page being rendered
 *   published,             // Map pericopeId → Set of published artifact kinds
 *   relRoot,               // relative prefix to the site root ('' or '../')
 *   atlas,                 // OPTIONAL {bookIdByPrefix: Map} — when present, resolved
 *                          //   entity/concept/figure mentions become links into the
 *                          //   Atlas registry pages (V3 accept bar), same classes +
 *                          //   tooltips. Absent → the original tooltip-only spans.
 * }
 */
export function renderWikilink(ctx, target, pipe) {
  const t = target.trim();
  const cls = classifyTarget(t);
  const display = (pipe ?? '').trim();

  // Same classes, same tooltip, same inner markup — the only delta when an
  // atlas href exists is <span> → <a href>. Keeps the declared byte-change on
  // Reading-Room pages exactly "mentions become navigable", nothing else.
  const resolved = (klass, innerHtml, tip, href) =>
    href
      ? `<a class="wl ${klass}" href="${escapeAttr(href)}" title="${escapeAttr(tip)}">${innerHtml}</a>`
      : `<span class="wl ${klass}" title="${escapeAttr(tip)}">${innerHtml}</span>`;

  switch (cls.kind) {
    case 'entity': {
      const e = ctx.registries.entity(ctx.bookPrefix, cls.code);
      const text = display || (cls.slug ? deSlug(cls.slug) : e?.english || cls.code);
      if (e) {
        const bookId = ctx.atlas?.bookIdByPrefix?.get(ctx.bookPrefix);
        const href = bookId ? `${ctx.relRoot}atlas/registry/${bookId}/${cls.code}.html` : null;
        return resolved('wl-entity', `<bdi>${escapeHtml(text)}</bdi>`, entityTooltip(cls.code, e), href);
      }
      return unresolved(text, `${cls.code} — not in the public registry`);
    }
    case 'concept': {
      const c = ctx.registries.concept(cls.code);
      const text = display || deSlug(cls.slug ?? c?.name_slug ?? cls.code);
      if (c) {
        const tip = `${cls.code} · Concept Bank · ${deSlug(c.name_slug ?? '')}${c.appears_in ? ' · appears in ' + c.appears_in.join(', ') : ''}`;
        const href = ctx.atlas ? `${ctx.relRoot}atlas/registry/concept/${cls.code}.html` : null;
        return resolved('wl-concept', escapeHtml(text), tip, href);
      }
      return unresolved(text, `${cls.code} — not in the public Concept Bank registry`);
    }
    case 'figure': {
      const f = ctx.registries.figure(cls.code);
      const text = display || deSlug(cls.slug ?? f?.name_slug ?? cls.code);
      if (f) {
        const tip = `${cls.code} · Figure Registry · ${deSlug(f.name_slug ?? '')}${f.appears_in ? ' · appears in ' + f.appears_in.join(', ') : ''}`;
        const href = ctx.atlas ? `${ctx.relRoot}atlas/registry/figure/${cls.code}.html` : null;
        return resolved('wl-figure', escapeHtml(text), tip, href);
      }
      return unresolved(text, `${cls.code} — not in the public Figure Registry`);
    }
    case 'artifact': {
      const text = display || t;
      const anchor = ARTIFACT_ANCHOR[cls.artifact];
      const isPublished = anchor && ctx.published.get(cls.pericope)?.has(cls.artifact);
      if (isPublished) {
        const href = `${ctx.relRoot}pericopes/${cls.pericope}.html#${anchor}`;
        return `<a class="wl wl-xref" href="${escapeAttr(href)}">${escapeHtml(text)}</a>`;
      }
      return unresolved(text, 'Not published on this portal (not yet an approved artifact)');
    }
    default:
      return unresolved(display || t, 'Internal vault reference');
  }
}

function unresolved(text, why) {
  return `<span class="wl wl-plain" title="${escapeAttr(why)}">${escapeHtml(text)}</span>`;
}

/** Replace every [[wikilink]] in already-HTML-escaped text. */
export function renderWikilinksIn(ctx, escapedText) {
  return escapedText.replace(WIKILINK_RE, (_, target, pipe) => renderWikilink(ctx, target, pipe));
}
