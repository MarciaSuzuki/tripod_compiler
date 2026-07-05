// The Tripod Method page (PR-6) — the work-order accept bars. Marcia's
// approved artifact ships byte-identical to the Evaluator's pin plus EXACTLY
// the two ruled insertion blocks (back-link + house feedback buttons), and the
// landing page carries her phrase verbatim as the link.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, runBuild } from './helpers.mjs';
import {
  METHOD_PAGE_SOURCE_SHA256,
  methodPageBlocks,
  renderMethodPage,
} from '../src/lib/method-page.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));
const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');
const sourcePath = path.join(portalDir, 'assets', 'tripod-method-source.html');

test('method page: the vendored source matches the Evaluator pin, byte for byte', () => {
  const bytes = fs.readFileSync(sourcePath);
  const sha = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha, METHOD_PAGE_SOURCE_SHA256, 'vendored source drifted from the pin — do not edit it; re-pin via the work order');
  // Zero external resources, verified here too (the work order's own finding):
  // every fetchable reference must be same-page or relative.
  const src = bytes.toString('utf8');
  assert.doesNotMatch(src, /(?:src|href)="https?:\/\//, 'the source page must stay self-contained');
});

test('method page: rendered output is the pinned bytes plus exactly the two ruled blocks', () => {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const formCfg = JSON.parse(fs.readFileSync(path.join(portalDir, 'portal.config.json'), 'utf8')).feedbackForm;
  const rendered = renderMethodPage(source, formCfg);
  const { backLink, feedback } = methodPageBlocks(formCfg);

  // Each block appears exactly once, at its ruled anchor.
  assert.equal(rendered.split(backLink).length - 1, 1, 'back-link block appears exactly once');
  assert.equal(rendered.split(feedback).length - 1, 1, 'feedback block appears exactly once');
  assert.ok(rendered.startsWith(source.slice(0, source.indexOf('<body>') + '<body>'.length) + backLink),
    'back-link sits immediately after <body>');
  assert.ok(rendered.includes(feedback + '</body>'), 'feedback block sits immediately before </body>');

  // The byte bar itself: strip the two exact blocks and the pinned source remains.
  const stripped = rendered.replace(backLink, '').replace(feedback, '');
  assert.equal(stripped, source, 'no third change anywhere — not a comma');

  // The ruled strings, exactly.
  assert.match(backLink, /← Back to the reading room/);
  assert.match(backLink, /href="index\.html"/);
  assert.match(feedback, /Ask a question/);
  assert.match(feedback, /Suggest a change/);
  assert.match(feedback, /The\+Tripod\+Method\+page/, 'Sheet label prefilled: The Tripod Method page');
  assert.match(feedback, /The\+website\+itself/, 'artifact prefilled: The website itself');

  // The inserted blocks may style only themselves: every selector in the
  // feedback block's scoped style is rooted in the block's own class.
  const styleBody = feedback.match(/<style>([\s\S]*?)<\/style>/)[1];
  for (const sel of styleBody.match(/^\s*\.[^{]+/gm) ?? []) {
    assert.match(sel.trim(), /^\.portal-method-feedback\b/, `scoped selector only: ${sel.trim()}`);
  }
});

test('method page: renderer refuses a drifted source, loudly', () => {
  assert.throws(() => renderMethodPage('<body>tampered</body>', null), /does not match the Evaluator's pin/);
});

test('method page: ships in the real build; landing page links it in Marcia\'s words', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-method-'));
  assert.equal(runBuild(repoRoot, out).status, 0);

  const page = read(out, 'tripod-method.html');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const formCfg = JSON.parse(fs.readFileSync(path.join(portalDir, 'portal.config.json'), 'utf8')).feedbackForm;
  const { backLink, feedback } = methodPageBlocks(formCfg);
  assert.equal(page.replace(backLink, '').replace(feedback, ''), source,
    'the built page holds the byte bar');

  const index = read(out, 'index.html');
  assert.match(index, /<a href="tripod-method\.html">The Tripod Method — three legs, three translation roles →<\/a>/,
    "landing link text is Marcia's phrase verbatim");
});
