// THE BITE TESTS — acceptance contract item 2.
//
// "The approved-only rule is a BUILD TEST, not a convention: the build FAILS
//  if any rendered artifact lacks the approved status or sits outside
//  fixtures/." Every test here runs the real build binary end-to-end against
// a synthetic tree and asserts the failure is total (exit 2, nothing written).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { mkTree, mkMap, mkForModel, runBuild, rmrf } from './helpers.mjs';
import { checkArtifact } from '../src/lib/gate.mjs';

function freshOut(root) {
  return path.join(root, 'out'); // inside the tmp tree, auto-cleaned
}

test('clean tree of approved artifacts builds (exit 0, pages written)', () => {
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09'),
    'fixtures/for-model/P09-Test-FOR-MODEL.md': mkForModel('P09'),
  });
  const out = freshOut(root);
  const r = runBuild(root, out);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(out, 'index.html')));
  assert.ok(fs.existsSync(path.join(out, 'pericopes', 'P09.html')));
  rmrf(root);
});

test('BITE: a planted draft meaning map fails the whole build — exit 2, nothing written', () => {
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09'),
    'fixtures/meaning-map/P99-Draft.md': mkMap('P99', { status: 'draft' }),
  });
  const out = freshOut(root);
  const r = runBuild(root, out);
  assert.equal(r.status, 2, `expected gate exit 2, got ${r.status}\n${r.stderr}`);
  assert.match(r.stderr, /P99-Draft\.md/);
  assert.match(r.stderr, /NOT APPROVED/);
  // all-or-nothing: the approved P09 page must not have been written either
  assert.ok(!fs.existsSync(out), 'output directory must not exist after a gate failure');
  rmrf(root);
});

test('BITE: a FOR_MODEL without status "valid" fails the build', () => {
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09'),
    'fixtures/for-model/P09-Test-FOR-MODEL.md': mkForModel('P09', { status: 'complete' }),
  });
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /status is "complete" — NOT APPROVED/);
  rmrf(root);
});

test('BITE: a map with NO status field fails the build', () => {
  const map = mkMap('P09').replace(/^status: .*\n/m, '');
  const root = mkTree({ 'fixtures/meaning-map/P09-Test.md': map });
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /NO status field/);
  rmrf(root);
});

test('BITE: wrong artifact type in the expected directory fails the build', () => {
  // a sta-for-model note dropped into fixtures/meaning-map/
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09', { type: 'sta-for-model' }),
  });
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /type is "sta-for-model", expected "pericope"/);
  rmrf(root);
});

test('BITE: a note with unparseable frontmatter fails the build (cannot prove approval)', () => {
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09'),
    'fixtures/meaning-map/P98-NoFM.md': '# no frontmatter at all\n',
  });
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /P98-NoFM\.md.*no YAML frontmatter/);
  rmrf(root);
});

test('BITE: a symlink inside fixtures/ pointing outside (e.g. into _working/) fails the build', (t) => {
  const root = mkTree({
    'fixtures/meaning-map/P09-Test.md': mkMap('P09'),
    // an approved-LOOKING draft parked outside fixtures/
    '_working/P97/P97-Smuggled.md': mkMap('P97'),
  });
  try {
    fs.symlinkSync(
      path.join(root, '_working', 'P97', 'P97-Smuggled.md'),
      path.join(root, 'fixtures', 'meaning-map', 'P97-Smuggled.md')
    );
  } catch {
    t.skip('filesystem does not allow symlinks');
    rmrf(root);
    return;
  }
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /OUTSIDE the approved directory/);
  rmrf(root);
});

test('gate reports EVERY violation, not just the first', () => {
  const root = mkTree({
    'fixtures/meaning-map/P95-A.md': mkMap('P95', { status: 'draft' }),
    'fixtures/meaning-map/P96-B.md': mkMap('P96', { status: 'review' }),
  });
  const r = runBuild(root, freshOut(root));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /P95-A\.md/);
  assert.match(r.stderr, /P96-B\.md/);
  assert.match(r.stderr, /2 violation/);
  rmrf(root);
});

test('unit: checkArtifact flags containment, type and status independently', () => {
  const fixturesRealRoot = '/repo/fixtures';
  const base = {
    classKey: 'meaning-map',
    filePath: 'fixtures/meaning-map/x.md',
    realPath: '/repo/fixtures/meaning-map/x.md',
    fixturesRealRoot,
    frontmatter: { type: 'pericope', status: 'complete' },
  };
  assert.deepEqual(checkArtifact(base), []);
  assert.equal(checkArtifact({ ...base, realPath: '/repo/_working/x.md' }).length, 1);
  assert.equal(checkArtifact({ ...base, frontmatter: { type: 'pericope', status: 'draft' } }).length, 1);
  assert.equal(checkArtifact({ ...base, frontmatter: { status: 'complete' } }).length, 1);
  // a smuggled file can be wrong on all three axes at once
  const all = checkArtifact({
    ...base,
    realPath: '/elsewhere/x.md',
    frontmatter: {},
  });
  assert.equal(all.length, 3);
});
