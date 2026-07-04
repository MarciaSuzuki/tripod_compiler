// Tripod Portal Atlas — V1 Book Atlas + V3 registry browser (PR-2, spec §4).
//
// Static destination pages rendered from the atlas data the exporter already
// computed — same canon, zero recomputation, zero client-side JavaScript.
// Every page renders its full content without JS (spec §2.4); the animated
// brain (V2) arrives separately and will absorb V1 as its "Books" mode.
//
// Look: the ruled v4 "luminous brain" treatment (assets/atlas.css), which is
// explicitly NOT the Reading Room's styling — Shema branding appears in the
// HUD text only (spec §6). Reading-Room pages are never touched by this module.

import { escapeHtml, escapeAttr } from '../lib/html.mjs';
import { renderFeedbackButtons } from '../lib/feedback.mjs';
import { deSlug } from '../lib/registry.mjs';

const CAST_KINDS = ['being', 'place', 'object', 'time', 'institution'];
const KIND_LABEL = {
  being: 'People & beings',
  place: 'Places',
  object: 'Objects & phrases',
  time: 'Times',
  institution: 'Institutions',
};

export function atlasPages({ cfg, formCfg, atlas, buildInfo }) {
  const pages = new Map();
  const stats = statsLine(atlas, buildInfo);

  pages.set('atlas/index.html', indexPage({ cfg, formCfg, atlas, buildInfo, stats }));

  for (const book of atlas.books) {
    const shard = atlas.shards.get(book.id);
    pages.set(`atlas/${book.id}.html`, bookPage({ cfg, formCfg, book, shard, atlas, buildInfo, stats }));

    for (const node of shard.nodes.filter((n) => CAST_KINDS.includes(n.kind))) {
      pages.set(
        `atlas/registry/${book.id}/${node.code}.html`,
        entityPage({ cfg, formCfg, book, node, shard, buildInfo, stats })
      );
    }
  }

  for (const kind of ['concept', 'figure']) {
    for (const node of atlas.global.nodes.filter((n) => n.kind === kind)) {
      pages.set(
        `atlas/registry/${kind}/${node.code}.html`,
        conceptFigurePage({ cfg, formCfg, node, atlas, buildInfo, stats })
      );
    }
  }

  return pages;
}

// ---- shared frame --------------------------------------------------------------

function atlasLayout({ cfg, title, relRoot, crumbs, contentHtml, stats }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title ? `${title} · Atlas · ${cfg.siteTitle}` : `Atlas · ${cfg.siteTitle}`)}</title>
<link rel="stylesheet" href="${relRoot}assets/atlas.css">
</head>
<body>
<header class="atlas">
  <div>
    <div class="eyebrow"><b>Shema</b> · Tripod Method · Atlas</div>
    ${crumbs}
  </div>
  <a class="back" href="${relRoot}index.html">← Reading Room</a>
</header>
<main>
${contentHtml}
</main>
<footer class="atlas">
  <p>${escapeHtml(stats)}</p>
  <p>Every fact on this page is generated from <b>approved canon on main</b> — the same gated files the
  Reading Room renders. Nothing here is hand-authored; nothing here can edit anything.</p>
</footer>
</body>
</html>
`;
}

function statsLine(atlas, buildInfo) {
  const g = atlas.global;
  const books = atlas.books
    .map((b) => `${b.title} ${b.status === 'registry-only' ? 'registry-only' : b.counts.pericopes}`)
    .join(' · ');
  const cast = atlas.books.reduce((n, b) => n + b.counts.entities, 0);
  return (
    `${books} — ${cast} cast · ${g.counts.concepts} concepts · ${g.counts.figures} figures · ` +
    `${g.counts.vocabulary_values} vocabulary values · ${g.counts.sc_rulings} rulings — ` +
    `commit ${buildInfo.commit} · ${buildInfo.builtAt}`
  );
}

const chip = (text, tone = '', href = null, title = null) => {
  const cls = `chip${tone ? ` ${tone}` : ''}`;
  const tip = title ? ` title="${escapeAttr(title)}"` : '';
  return href
    ? `<a class="${cls}" href="${escapeAttr(href)}"${tip}>${escapeHtml(text)}</a>`
    : `<span class="${cls}"${tip}>${escapeHtml(text)}</span>`;
};

const pidOf = (namespacedId) => namespacedId.split('/')[1];

// ---- atlas index ----------------------------------------------------------------

function indexPage({ cfg, formCfg, atlas, buildInfo, stats }) {
  const g = atlas.global;
  const feedback = renderFeedbackButtons(formCfg, {
    pericope: 'Atlas — index',
    artifact: 'The website itself',
  });
  const cards = atlas.books
    .map((b) => {
      const facts =
        b.status === 'registry-only'
          ? `<b>${b.counts.entities}</b> cast in the pinned registry<br>maps in progress — no artifact content yet`
          : `<b>${b.counts.pericopes}</b> pericopes · <b>${b.counts.scenes}</b> scenes · <b>${b.counts.propositions}</b> propositions<br><b>${b.counts.entities}</b> cast · <b>${b.counts.edges}</b> threads`;
      return `<a class="bookcard" href="${escapeAttr(b.id)}.html">
  <div class="bt"><h2>${escapeHtml(b.title)}</h2><span class="status ${escapeAttr(b.status)}">${escapeHtml(b.status.replace('-', ' '))}</span></div>
  <div class="facts">${facts}</div>
</a>`;
    })
    .join('\n');

  const axes = g.vocabulary.axes;
  const l1 = axes.filter((a) => a.layer === 'L1-closed');
  const l2 = axes.filter((a) => a.layer !== 'L1-closed');

  const content = `
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;">
  <h1>The Atlas</h1>
  ${feedback}
</div>
<p>The whole Tripod seed corpus as one connected structure: every book, pericope, scene and
proposition; every person, place and concept; every controlled-vocabulary value with the ruling
that admitted it. These pages are generated from the same approved files as the
<a href="../index.html">Reading Room</a> on every merge — they grow by themselves as the seed grows.</p>

<div class="grp">Books</div>
<div class="books">
${cards}
</div>

<div class="grp">The shared registries (global, cross-book)</div>
<div class="panel">
  <p><span class="dot magenta"></span>&nbsp; <b>${g.counts.concepts}</b> Concept Bank entries ·
     <span class="dot violet"></span>&nbsp; <b>${g.counts.figures}</b> Figure Registry entries ·
     <span class="dot ice"></span>&nbsp; <b>${g.counts.vocabulary_values}</b> vocabulary values across
     ${axes.length} axes (${l1.length} closed · ${l2.length} bounded-open) ·
     <b>${g.counts.sc_rulings}</b> governance rulings</p>
  <p>Concept and figure pages are linked wherever they occur — from book pages, scene drill-downs,
  and the Reading Room's highlighted terms. The interactive graph over this same data is the next
  piece of the Atlas; these pages are its substance, readable today.</p>
</div>`;

  return atlasLayout({
    cfg,
    title: null,
    relRoot: '../',

    crumbs: `<h1 style="margin:.25em 0 0;font-size:21px;">Atlas</h1>`,
    contentHtml: content,
    stats,
  });
}

// ---- V1: book page ----------------------------------------------------------------

function bookPage({ cfg, formCfg, book, shard, atlas, buildInfo, stats }) {
  const nodes = new Map(shard.nodes.map((n) => [n.id, n]));
  const pericopes = shard.nodes.filter((n) => n.kind === 'pericope');
  const feedback = renderFeedbackButtons(formCfg, {
    pericope: `Atlas — ${book.title}`,
    artifact: 'The website itself',
  });

  const registryOnly = book.status === 'registry-only';
  const intro = registryOnly
    ? `<p>${escapeHtml(book.title)} is <b>onboarding</b>: its cast is pinned in the public registry, but its
       Meaning Maps and machine artifacts are still in progress and are not published anywhere — this page
       shows exactly what exists, and nothing more. The pericope spine appears here automatically the day
       the first approved artifacts merge.</p>`
    : `<p>The whole book at once: the pericope spine in reading order, then the threads that run across
       it — who and what spans which passages. Every tile links down into its scenes, statements and
       significant absences, and across to the full documents in the Reading Room.</p>`;

  const spine = registryOnly
    ? ''
    : `<div class="grp">Pericope spine — ${pericopes.length} passages in reading order</div>
<div class="spine">
${pericopes.map((p) => spineTile(p)).join('\n')}
</div>`;

  const lanes = registryOnly ? '' : threadLanes({ book, shard, pericopes, atlas });

  const drill = registryOnly
    ? ''
    : `<div class="grp">Inside each passage — scenes, statements, significant absences</div>
${pericopes.map((p) => drillDown({ p, shard, nodes, atlas, bookId: book.id })).join('\n')}`;

  const cast = castSection({ book, shard, registryOnly });

  const content = `
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;">
  <h1>${escapeHtml(book.title)} <span class="status ${escapeAttr(book.status)}">${escapeHtml(
    registryOnly ? 'maps in progress' : book.status
  )}</span></h1>
  ${feedback}
</div>
${intro}
${spine}
${lanes}
${cast}
${drill}`;

  return atlasLayout({
    cfg,
    title: book.title,
    relRoot: '../',

    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="index.html">Atlas</a> · ${escapeHtml(book.title)}</h1>`,
    contentHtml: content,
    stats,
  });
}

function spineTile(p) {
  const cls = p.classification;
  const l1 = p.level_1 ?? {};
  const capped = (list, tone, cap) => {
    const items = (list ?? []).slice(0, cap).map((v) => chip(v, tone));
    const more = (list ?? []).length - cap;
    return items.join('') + (more > 0 ? chip(`+${more}`, '') : '');
  };
  // The anchor key (scene_id / verse) is optional in the pinned schema; a
  // register-critical override must still render when it's absent — as the
  // bare value, never a literal "undefined".
  const overrides = [];
  for (const o of p.register_overrides?.scene_level ?? []) {
    if (!o.override_value) continue;
    const label = o.scene_id ? `${o.scene_id} → ${o.override_value}` : o.override_value;
    overrides.push(chip(label, 'amber', null, 'register override'));
  }
  for (const o of p.register_overrides?.moment_level ?? []) {
    const v = o.override_value ?? o.framing_override;
    if (!v) continue;
    overrides.push(chip(o.verse ? `${o.verse} → ${v}` : v, 'amber', null, 'moment-level override'));
  }
  return `<div class="tile" id="tile-${escapeAttr(p.code)}">
  <div class="row1"><span class="pid">${escapeHtml(p.code)}</span><span class="bcv">${escapeHtml(p.bcv ?? '')}</span></div>
  <span class="ptitle">${escapeHtml(p.title ?? '')}</span>
  ${cls ? `<div class="cls">${escapeHtml(cls.genre ?? '')} · ${escapeHtml(cls.register ?? '')}</div>` : ''}
  <div>${capped(l1.arc_elements, 'gold', 3)}${capped(l1.tone_elements, '', 3)}${capped(l1.pace_elements, '', 2)}</div>
  ${overrides.length ? `<div style="margin-top:5px;">${overrides.join('')}</div>` : ''}
  <div class="links"><a href="#${escapeAttr(p.code)}">scenes &amp; absences ↓</a><a href="../pericopes/${escapeAttr(p.code)}.html">read the documents ↗</a></div>
</div>`;
}

function threadLanes({ book, shard, pericopes, atlas }) {
  const pids = pericopes.map((p) => p.code);
  const globalById = new Map(atlas.global.nodes.map((n) => [n.id, n]));

  // Entity lanes: real appears_in spans from the registry, widest first.
  const entities = shard.nodes
    .filter((n) => CAST_KINDS.includes(n.kind) && (n.appears_in ?? []).filter((x) => pids.includes(x)).length >= 2)
    .sort((a, b) => b.appears_in.length - a.appears_in.length || a.code.localeCompare(b.code))
    .slice(0, 12);

  // Concept / figure lanes: recurrence computed from per-proposition flags.
  const recurrence = (prefix) => {
    const byCode = new Map();
    for (const e of shard.edges) {
      if (e.kind !== 'flags' || !e.to?.startsWith(prefix)) continue;
      const code = e.to.split('/')[1];
      if (!byCode.has(code)) byCode.set(code, new Set());
      byCode.get(code).add(pidOf(e.from));
    }
    return [...byCode.entries()]
      .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
      .filter(([, set]) => set.size >= 2);
  };
  const cbs = recurrence('concept/').slice(0, 10);
  const figs = recurrence('figure/').slice(0, 8);

  if (entities.length === 0 && cbs.length === 0 && figs.length === 0) return '';

  const header = `<tr><th class="who">thread</th>${pids
    .map((pid) => `<th><a href="#${escapeAttr(pid)}" style="color:inherit;">${escapeHtml(pid)}</a></th>`)
    .join('')}<th>spans</th></tr>`;

  const entityRow = (e) => {
    const cells = pids
      .map((pid) => `<td>${e.appears_in.includes(pid) ? '<span class="dot"></span>' : ''}</td>`)
      .join('');
    const label = `${e.english ?? e.code}`;
    return `<tr><td class="who"><a href="registry/${escapeAttr(book.id)}/${escapeAttr(e.code)}.html">${escapeHtml(label)}</a>${
      e.hebrew ? ` <bdi class="heb">${escapeHtml(e.hebrew)}</bdi>` : ''
    } <span class="n">${escapeHtml(e.code)}</span></td>${cells}<td class="n">${e.appears_in.filter((x) => pids.includes(x)).length}</td></tr>`;
  };
  const flagRow = (kind, tone) => ([code, set]) => {
    const node = globalById.get(`${kind}/${code}`);
    const cells = pids
      .map((pid) => `<td>${set.has(pid) ? `<span class="dot ${tone}"></span>` : ''}</td>`)
      .join('');
    return `<tr class="${tone === 'magenta' ? 'cb' : 'fig'}"><td class="who"><a href="registry/${kind}/${escapeAttr(code)}.html">${escapeHtml(
      node?.name ?? code
    )}</a> <span class="n">${escapeHtml(code)}</span></td>${cells}<td class="n">${set.size}</td></tr>`;
  };

  return `<div class="grp">Threads across the book — real spans, computed from the data</div>
<div class="panel lanes">
<table>
${header}
${entities.map(entityRow).join('\n')}
${cbs.map(flagRow('concept', 'magenta')).join('\n')}
${figs.map(flagRow('figure', 'violet')).join('\n')}
</table>
</div>`;
}

function castSection({ book, shard, registryOnly }) {
  const byKind = new Map();
  for (const n of shard.nodes) {
    if (!CAST_KINDS.includes(n.kind)) continue;
    if (!byKind.has(n.kind)) byKind.set(n.kind, []);
    byKind.get(n.kind).push(n);
  }
  if (byKind.size === 0) return '';
  const groups = CAST_KINDS.filter((k) => byKind.has(k))
    .map((k) => {
      const cards = byKind
        .get(k)
        .map(
          (e) => `<a class="castcard" href="registry/${escapeAttr(book.id)}/${escapeAttr(e.code)}.html">${
            e.hebrew ? `<bdi class="heb">${escapeHtml(e.hebrew)}</bdi>` : ''
          }<span class="en">${escapeHtml(e.english ?? e.code)}</span><span class="code">${escapeHtml(e.code)}${
            e.appears_in?.length ? ` · ${e.appears_in.length} passage${e.appears_in.length > 1 ? 's' : ''}` : ''
          }</span></a>`
        )
        .join('\n');
      return `<div class="grp">${escapeHtml(KIND_LABEL[k])} — ${byKind.get(k).length}</div>\n<div class="cast">\n${cards}\n</div>`;
    })
    .join('\n');
  const heading = registryOnly
    ? `<div class="grp">The pinned cast — ${shard.book.counts.entities} entries, browsable now</div>`
    : `<div class="grp">Cast &amp; registry — ${shard.book.counts.entities} entries</div>`;
  return `${heading}\n${groups}`;
}

function drillDown({ p, shard, nodes, atlas, bookId }) {
  const scenes = shard.nodes.filter((n) => n.kind === 'scene' && n.id.startsWith(`${p.id}/`));
  const propsOf = (sceneId) =>
    shard.edges
      .filter((e) => e.kind === 'contains' && e.from === sceneId)
      .map((e) => nodes.get(e.to))
      .filter(Boolean);

  const sceneBlock = (s) => {
    const props = propsOf(s.id);
    const propRows = props
      .map(
        (pr) =>
          `<tr><td class="pp">${escapeHtml(pr.code)}</td><td class="pk">${escapeHtml(pr.proposition_kind ?? '')}</td><td class="va">${escapeHtml(pr.verse_anchor ?? '')}</td></tr>`
      )
      .join('\n');
    const participants = shard.edges
      .filter((e) => e.kind === 'participates' && e.from === s.id && e.to)
      .map((e) => {
        const t = nodes.get(e.to);
        if (t) {
          return chip(
            `${t.english ?? t.code}${e.role ? ` · ${e.role}` : ''}`,
            'champagne',
            `registry/${bookId}/${t.code}.html`,
            [e.presence, e.referential_form].filter(Boolean).join(' · ') || null
          );
        }
        const g = atlas.global.nodes.find((n) => n.id === e.to);
        return g ? chip(g.name ?? g.code, g.kind === 'concept' ? 'magenta' : 'violet', `registry/${g.kind}/${g.code}.html`) : '';
      })
      .join('');
    return `<div class="scene">
  <div><span class="sid">${escapeHtml(s.code)}</span><span class="sk">${escapeHtml(s.scene_kind ?? '')}</span> <span class="n mono" style="font-size:10px;color:var(--dimmer);">${escapeHtml(s.verse_range ?? '')}</span></div>
  ${s.purpose ? `<p>${escapeHtml(s.purpose)}</p>` : ''}
  ${participants ? `<div>${participants}</div>` : ''}
  ${s.significant_absence ? `<div class="absence"><span class="k">Deliberately not said</span>${escapeHtml(s.significant_absence)}</div>` : ''}
  ${props.length ? `<details class="props"><summary>${props.length} statement${props.length > 1 ? 's' : ''} (propositions)</summary><table>${propRows}</table></details>` : ''}
</div>`;
  };

  return `<div class="drill" id="${escapeAttr(p.code)}">
  <div class="head"><h3><span class="pid">${escapeHtml(p.code)}</span>${escapeHtml(p.title ?? '')}</h3>
  <span class="bcv mono" style="font-size:10px;color:var(--dimmer);">${escapeHtml(p.bcv ?? '')}</span>
  <a class="mono" style="font-size:10px;" href="../pericopes/${escapeAttr(p.code)}.html">read the documents ↗</a></div>
${scenes.map(sceneBlock).join('\n')}
</div>`;
}

// ---- V3: registry pages -------------------------------------------------------------

function entityPage({ cfg, formCfg, book, node, shard, buildInfo, stats }) {
  const participations = shard.edges.filter((e) => e.kind === 'participates' && e.to === node.id);
  const rows = participations
    .map((e) => {
      const [, pid, scode] = e.from.split('/');
      return `<tr><td class="mono"><a href="../../${escapeAttr(book.id)}.html#${escapeAttr(pid)}">${escapeHtml(pid)} · ${escapeHtml(scode)}</a></td><td>${escapeHtml(e.role ?? '')}</td><td class="mono">${escapeHtml(e.presence ?? '')}</td><td class="mono">${escapeHtml(e.referential_form ?? '')}</td></tr>`;
    })
    .join('\n');

  // The appears_in fact always renders (canon spelling); the chip links only
  // when that pericope's drill-down actually exists on the book page — a
  // registry-only book keeps plain chips until its maps merge.
  const publishedPids = new Set(shard.nodes.filter((n) => n.kind === 'pericope').map((n) => n.code));
  const spans = (node.appears_in ?? [])
    .map((pid) =>
      publishedPids.has(pid)
        ? chip(pid, 'gold', `../../${book.id}.html#${pid}`)
        : chip(pid, 'amber', null, 'map in progress — not yet published')
    )
    .join('');
  const forms = (node.referential_forms ?? []).map((f) => chip(f, 'champagne')).join('');

  const content = `
<div class="reghead">
  <h1>${escapeHtml(node.english ?? node.code)}</h1>
  ${node.hebrew ? `<span class="heb"><bdi>${escapeHtml(node.hebrew)}</bdi></span>` : ''}
  <span class="code">${escapeHtml(node.code)}</span>
  ${renderFeedbackButtons(formCfg, { pericope: `Atlas — ${node.code} (${node.english ?? node.code})`, artifact: 'The website itself' })}
</div>
<div class="regmeta">${escapeHtml(book.title)} registry · ${escapeHtml(node.kind)}${node.gender ? ` · ${escapeHtml(node.gender)}` : ''}</div>
${forms ? `<div class="grp">Referential forms — how the text names this entity</div><div>${forms}</div>` : ''}
${spans ? `<div class="grp">Appears in</div><div>${spans}</div>` : ''}
<div class="grp">Scene participations — computed backlinks</div>
<div class="panel backlinks">
${
  rows
    ? `<table><tr><th>scene</th><th>role</th><th>presence</th><th>referential form</th></tr>${rows}</table>`
    : `<p>No scene participation recorded yet${book.status === 'registry-only' ? ' — this book’s maps are still in progress' : ''}.</p>`
}
</div>`;

  return atlasLayout({
    cfg,
    title: `${node.code} ${node.english ?? ''}`,
    relRoot: '../../../',

    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="../../index.html">Atlas</a> · <a href="../../${escapeAttr(book.id)}.html">${escapeHtml(book.title)}</a> · ${escapeHtml(node.code)}</h1>`,
    contentHtml: content,
    stats,
  });
}

function conceptFigurePage({ cfg, formCfg, node, atlas, buildInfo, stats }) {
  const tone = node.kind === 'concept' ? 'magenta' : 'violet';
  const registryName = node.kind === 'concept' ? 'Concept Bank' : 'Figure Registry';

  const flagRows = [];
  const stagings = [];
  for (const [bookId, shard] of atlas.shards) {
    for (const e of shard.edges) {
      if (e.to !== node.id) continue;
      if (e.kind === 'flags') {
        const [, pid, , code] = e.from.split('/');
        flagRows.push(
          `<tr><td class="mono"><a href="../../${escapeAttr(bookId)}.html#${escapeAttr(pid)}">${escapeHtml(
            bookId
          )} ${escapeHtml(pid)}</a></td><td class="mono">${escapeHtml(code)}</td><td class="mono">${escapeHtml(
            shard.nodes.find((n) => n.id === e.from)?.proposition_kind ?? ''
          )}</td></tr>`
        );
      } else if (e.kind === 'participates') {
        const [, pid, scode] = e.from.split('/');
        stagings.push(chip(`${bookId} ${pid} · ${scode}`, tone, `../../${bookId}.html#${pid}`));
      }
    }
  }

  const content = `
<div class="reghead">
  <h1>${escapeHtml(node.name ?? node.code)}</h1>
  <span class="code">${escapeHtml(node.code)}</span>
  ${renderFeedbackButtons(formCfg, { pericope: `Atlas — ${node.code} (${node.name ?? node.code})`, artifact: 'The website itself' })}
</div>
<div class="regmeta">${escapeHtml(registryName)} · global${node.books?.length ? ` · appears in ${escapeHtml(node.books.join(', '))}` : ''}</div>
${node.aliases?.length ? `<div class="grp">Also known as</div><div>${node.aliases.map((a) => chip(deSlug(a.replace(/^CB_|^FIG_/, '')), '')).join('')}</div>` : ''}
<div class="grp">Statements that carry this ${node.kind === 'concept' ? 'concept' : 'figure'} — computed backlinks</div>
<div class="panel backlinks">
${
  flagRows.length
    ? `<table><tr><th>passage</th><th>statement</th><th>kind</th></tr>${flagRows.join('\n')}</table>`
    : `<p>Not yet flagged by any published statement.</p>`
}
</div>
${stagings.length ? `<div class="grp">Staged in scenes</div><div>${stagings.join('')}</div>` : ''}`;

  return atlasLayout({
    cfg,
    title: `${node.code} ${node.name ?? ''}`,
    relRoot: '../../../',

    crumbs: `<h1 style="margin:.25em 0 0;font-size:16px;"><a href="../../index.html">Atlas</a> · ${escapeHtml(registryName)} · ${escapeHtml(node.code)}</h1>`,
    contentHtml: content,
    stats,
  });
}
