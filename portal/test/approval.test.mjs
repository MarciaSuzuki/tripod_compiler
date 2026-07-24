// The approval act (Marcia's ruling 2026-07-24): an external reviewer who read
// a Meaning Map and found no problem records that as a first-class act — her
// wording, Meaning Map only, version-pinned to the exact bytes read.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { portalDir, runBuild } from './helpers.mjs';
import { KIND, APPROVAL, renderApprovalButton, buildFeedbackUrl } from '../src/lib/feedback.mjs';

const repoRoot = path.resolve(portalDir, '..');
const haveFixtures = fs.existsSync(path.join(repoRoot, 'fixtures', 'meaning-map'));
const read = (out, rel) => fs.readFileSync(path.join(out, rel), 'utf8');

const FORM = {
  formBase: 'https://docs.google.com/forms/d/e/TEST',
  entries: { pericope: 'entry.1', artifact: 'entry.2', section: 'entry.3', kind: 'entry.4', approval: 'entry.5' },
};

test('approval: the ruled wording as the label; the Form records approval on its own axis', () => {
  assert.equal(APPROVAL.label, 'I read it — I approve it as it is');
  assert.equal(APPROVAL.value, 'Yes');
  assert.deepEqual(Object.keys(KIND), ['question', 'suggestion'], 'approval is not a kind');

  const live = renderApprovalButton(FORM, { pericope: 'P01 — Ruth 1:1-5', artifact: 'Meaning Map', section: 'as built abc1234 · map sha deadbeef0123' });
  assert.match(live, />I read it — I approve it as it is</, 'button label is the ruled sentence');
  assert.match(live, /entry\.5=Yes/, 'the approval question is answered Yes');
  assert.doesNotMatch(live, /entry\.4=/, 'an approval is neither a question nor a suggestion — kind stays empty');
  assert.match(live, /entry\.3=as\+built\+abc1234\+%C2%B7\+map\+sha\+deadbeef0123/, 'the version pin rides the section field');
  assert.match(live, /target="_blank" rel="noopener"/);

  const dead = renderApprovalButton(null, { pericope: 'P01', artifact: 'Meaning Map' });
  assert.match(dead, /btn-disabled/, 'honest placeholder when the form is unconfigured');
  assert.match(dead, /I read it — I approve it as it is/, 'placeholder still carries the ruled words');
});

test('approval: real build — on every published Meaning Map, only there, pinned to the map bytes', { skip: !haveFixtures }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-approve-'));
  assert.equal(runBuild(repoRoot, out).status, 0);

  const cfgEntries = JSON.parse(fs.readFileSync(path.join(portalDir, 'portal.config.json'), 'utf8')).feedbackForm.entries;
  const manifest = JSON.parse(read(out, 'build-manifest.json'));
  const mapShaByPericope = new Map(
    manifest.artifacts.filter((a) => a.class === 'meaning-map').map((a) => [a.pericope, a.sha256])
  );

  const pages = fs.readdirSync(path.join(out, 'pericopes')).filter((f) => f.endsWith('.html'));
  assert.ok(pages.length > 0);
  for (const f of pages) {
    const id = f.replace(/\.html$/, '');
    const html = read(out, path.join('pericopes', f));
    const count = html.split('I read it — I approve it as it is').length - 1;
    const mapSha = mapShaByPericope.get(id);
    if (mapSha) {
      // The ruled sentence appears exactly once as the visible label (the URL
      // prefill carries it percent-encoded), and only inside the map section.
      assert.equal(count, 1, `${f}: approval act present exactly once`);
      assert.match(html, new RegExp(`${cfgEntries.approval.replace('.', '\\.')}=Yes`), `${f}: the approval question arrives answered Yes`);
      const mapSection = html.slice(html.indexOf('id="meaning-map"'), html.indexOf('id="for-model"') !== -1 ? html.indexOf('id="for-model"') : undefined);
      assert.equal(mapSection.split('I read it — I approve it as it is').length - 1, 1,
        `${f}: the approval act lives in the Meaning Map section only`);
      // Version pin carries THIS map's manifest sha (first 12) and the build commit.
      const pin = new RegExp(`map\\+sha\\+${mapSha.slice(0, 12)}`);
      assert.match(html, pin, `${f}: approval is pinned to the map's manifest sha`);
      assert.match(html, new RegExp(`as\\+built\\+${manifest.commit}`), `${f}: approval is pinned to the build commit`);
    } else {
      assert.equal(count, 0, `${f}: no approval act on an unpublished map`);
    }
  }

  // Nowhere else: the act appears on no Mind page and not on the landing page.
  const walk = (d) => fs.readdirSync(d).flatMap((f) => {
    const p2 = path.join(d, f);
    return fs.statSync(p2).isDirectory() ? walk(p2) : f.endsWith('.html') ? [p2] : [];
  });
  for (const page of walk(out)) {
    if (page.includes(`${path.sep}pericopes${path.sep}`)) continue;
    assert.ok(!read(out, path.relative(out, page)).includes('I read it — I approve it as it is'),
      `${path.relative(out, page)}: the approval act is Meaning-Map-only`);
  }
});

test('approval: the pin distinguishes versions — a different map byte, a different pin', () => {
  const shaA = crypto.createHash('sha256').update('map v1').digest('hex').slice(0, 12);
  const shaB = crypto.createHash('sha256').update('map v1 ').digest('hex').slice(0, 12);
  assert.notEqual(shaA, shaB);
  const urlA = buildFeedbackUrl(FORM, { pericope: 'P01', artifact: 'Meaning Map', section: `as built x · map sha ${shaA}`, approval: APPROVAL.value });
  const urlB = buildFeedbackUrl(FORM, { pericope: 'P01', artifact: 'Meaning Map', section: `as built x · map sha ${shaB}`, approval: APPROVAL.value });
  assert.notEqual(urlA, urlB, 'two versions of a map can never share an approval URL');
});
