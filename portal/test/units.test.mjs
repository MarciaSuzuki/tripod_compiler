import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNote, extractFencedJson } from '../src/lib/frontmatter.mjs';
import { classifyTarget, renderWikilink, renderWikilinksIn } from '../src/lib/wikilinks.mjs';
import { buildFeedbackUrl, renderFeedbackButtons, KIND } from '../src/lib/feedback.mjs';
import { renderMarkdown } from '../src/lib/markdown.mjs';
import { renderJsonTree } from '../src/lib/jsontree.mjs';
import { escapeHtml, slugify } from '../src/lib/html.mjs';

// ---- frontmatter ------------------------------------------------------------

test('parseNote unwraps Obsidian wikilink values (single + list)', () => {
  const raw = `---
type: "pericope"
status: "complete"
for-model: [[P01-Ruth-1-1-5-FOR-MODEL]]
active-concepts:
  - [[CB_0029-Judges-Era]]
  - [[CB_0004-Moabite-Outsider]]
---
body here
`;
  const { frontmatter, body } = parseNote(raw, 'x.md');
  assert.equal(frontmatter['for-model'], 'P01-Ruth-1-1-5-FOR-MODEL');
  assert.deepEqual(frontmatter['active-concepts'], ['CB_0029-Judges-Era', 'CB_0004-Moabite-Outsider']);
  assert.equal(body.trim(), 'body here');
});

test('parseNote throws (with the path) when frontmatter is missing', () => {
  assert.throws(() => parseNote('# nope\n', 'bad.md'), /bad\.md.*no YAML frontmatter/);
});

test('extractFencedJson pulls the fenced block and parses it', () => {
  const body = 'intro\n\n```json\n{ "a": 1 }\n```\n';
  assert.deepEqual(extractFencedJson(body, 'x.md'), { a: 1 });
  assert.throws(() => extractFencedJson('no fence', 'x.md'), /no fenced/);
  assert.throws(() => extractFencedJson('```json\n{nope}\n```', 'x.md'), /does not parse/);
});

// ---- wikilinks --------------------------------------------------------------

const registries = {
  entity: (prefix, code) =>
    prefix === 'P' && code === 'B2'
      ? { english: 'Elimelech', hebrew: 'אֱלִימֶלֶךְ', kind: 'PERSON' }
      : null,
  concept: (code) => (code === 'CB_0029' ? { name_slug: 'Judges-Era', appears_in: ['RUTH'] } : null),
  figure: (code) => (code === 'FIG_0007' ? { name_slug: 'Narrator-Frame', appears_in: ['RUTH'] } : null),
};
const ctx = {
  registries,
  bookPrefix: 'P',
  published: new Map([['P01', new Set(['meaning-map', 'for-model'])]]),
  relRoot: '../',
};

test('classifyTarget recognizes every target shape in the corpus', () => {
  assert.equal(classifyTarget('B2-Elimelech').kind, 'entity');
  assert.equal(classifyTarget('PL_LAND_OF_JUDAH').kind, 'entity');
  assert.equal(classifyTarget('TM_PERIOD_OF_JUDGES-In-the-Days').kind, 'entity');
  assert.equal(classifyTarget('TH_TEN_YEARS_APPROXIMATELY-About-Ten-Years').kind, 'entity');
  assert.equal(classifyTarget('CB_0029-Judges-Era').kind, 'concept');
  assert.equal(classifyTarget('FIG_0007-Narrator-Frame').kind, 'figure');
  assert.deepEqual(classifyTarget('P01-Ruth-1-1-5'), { kind: 'artifact', artifact: 'meaning-map', pericope: 'P01' });
  assert.deepEqual(classifyTarget('P01-Ruth-1-1-5-FOR-MODEL'), { kind: 'artifact', artifact: 'for-model', pericope: 'P01' });
  assert.equal(classifyTarget('P01-Ruth-1-1-5-COMPILATION-LOG').artifact, 'compilation-log');
  assert.equal(classifyTarget('P01-Ruth-1-1-5-BCD-DELTA').artifact, 'bcd-delta');
});

test('entity wikilink renders with Hebrew tooltip', () => {
  const html = renderWikilink(ctx, 'B2-Elimelech', null);
  assert.match(html, /wl-entity/);
  assert.match(html, /אֱלִימֶלֶךְ/);
  assert.match(html, /<bdi>Elimelech<\/bdi>/);
});

test('piped display text wins', () => {
  const html = renderWikilink(ctx, 'B2-Elimelech', 'the man from Bethlehem');
  assert.match(html, /<bdi>the man from Bethlehem<\/bdi>/);
});

test('published artifact link becomes a relative href; unpublished degrades to plain text', () => {
  const pub = renderWikilink(ctx, 'P01-Ruth-1-1-5-FOR-MODEL', null);
  assert.match(pub, /href="\.\.\/pericopes\/P01\.html#for-model"/);
  const unpub = renderWikilink(ctx, 'P77-Ruth-9-9-9-FOR-MODEL', null);
  assert.match(unpub, /wl-plain/);
  assert.match(unpub, /Not published/);
  assert.doesNotMatch(unpub, /<a /);
});

test('unknown registry code degrades to plain styled text, never breaks', () => {
  const html = renderWikilink(ctx, 'B99-Nobody', null);
  assert.match(html, /wl-plain/);
  assert.match(html, /Nobody/);
});

test('renderWikilinksIn replaces all links in running text', () => {
  const out = renderWikilinksIn(ctx, 'see [[B2-Elimelech]] and [[CB_0029-Judges-Era]].');
  assert.doesNotMatch(out, /\[\[/);
  assert.match(out, /wl-entity/);
  assert.match(out, /wl-concept/);
});

// ---- markdown ---------------------------------------------------------------

test('renderMarkdown: wikilinks survive emphasis/headings; raw HTML in source is neutralized', () => {
  const src = `## 2. Level 1 — Whole-Passage Movement

**bold [[B2-Elimelech]]** and a <script>alert(1)</script> attempt.
`;
  const { html, sections } = renderMarkdown(ctx, src, { headingPrefix: 'map' });
  assert.match(html, /wl-entity/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(sections[0].id, 'map-2-level-1-whole-passage-movement');
  assert.match(html, /<h2 id="map-2-level-1-whole-passage-movement">/);
});

test('renderMarkdown: section ask-links appended when a URL factory is given', () => {
  const { html } = renderMarkdown(ctx, '## 5. Flags\ntext', {
    headingPrefix: 'map',
    sectionAskUrl: (text) => `https://example.test/form?section=${encodeURIComponent(text)}`,
  });
  assert.match(html, /class="ask-section"/);
  assert.match(html, /section=5\.%20Flags/);
});

// ---- JSON tree ----------------------------------------------------------------

test('renderJsonTree: collapsible details, entity-code tooltips, RTL-safe strings, raw fallback', () => {
  const doc = {
    header: { bcv: 'Ruth 1:1-5', source_language: 'Biblical Hebrew' },
    level_3_propositions: [
      { prop_id: 'P1', cb_flags: ['CB_0029'], note: 'B2 dies; שדה appears', speech_act: 'STATES_AS_TRUE' },
    ],
  };
  const html = renderJsonTree(ctx, doc, { openDepth: 2 });
  assert.match(html, /<details class="jnode" open>/);
  assert.match(html, /class="wl wl-entity" title="CB_0029[^"]*Judges Era/);
  // generic UPPER_SNAKE vocabulary must NOT be annotated as an entity
  assert.doesNotMatch(html, /title="[^"]*STATES_AS_TRUE/);
  assert.match(html, /dir="auto"/);
  assert.match(html, /Raw JSON/);
});

// ---- feedback ----------------------------------------------------------------

const formCfg = {
  formBase: 'https://docs.google.com/forms/d/e/FAKE123',
  entries: { pericope: 'entry.11', artifact: 'entry.22', section: 'entry.33', kind: 'entry.44' },
};

test('buildFeedbackUrl: null when unconfigured, prefilled when configured', () => {
  assert.equal(buildFeedbackUrl(null, { pericope: 'P01' }), null);
  assert.equal(buildFeedbackUrl({ formBase: null }, { pericope: 'P01' }), null);
  const url = buildFeedbackUrl(formCfg, {
    pericope: 'P01 — Ruth 1:1–5',
    artifact: 'Meaning Map',
    section: '5. Flags',
    kind: KIND.question,
  });
  assert.match(url, /^https:\/\/docs\.google\.com\/forms\/d\/e\/FAKE123\/viewform\?usp=pp_url/);
  assert.match(url, /entry\.11=P01/);
  assert.match(url, /entry\.22=Meaning\+Map/);
  assert.match(url, /entry\.33=5\.\+Flags/);
  assert.match(url, /entry\.44=I\+have\+a\+question/);
});

test('feedback buttons: live links when configured, visibly disabled otherwise', () => {
  const live = renderFeedbackButtons(formCfg, { pericope: 'P01', artifact: 'Meaning Map' });
  assert.match(live, /<a class="btn"/);
  assert.match(live, /Ask a question/);
  assert.match(live, /Suggest a change/);
  const dead = renderFeedbackButtons({ formBase: null }, { pericope: 'P01', artifact: 'Meaning Map' });
  assert.doesNotMatch(dead, /<a /);
  assert.match(dead, /btn-disabled/);
});

// ---- html utils ----------------------------------------------------------------

test('escapeHtml + slugify behave', () => {
  assert.equal(escapeHtml('<a & b>'), '&lt;a &amp; b&gt;');
  assert.equal(slugify('2.1 Prose Arc / Shape / Argument'), '2-1-prose-arc-shape-argument');
  assert.equal(slugify('Scene 1 — Famine and exile (v.1–2)'), 'scene-1-famine-and-exile-v-1-2');
});
