import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';

import { rmrf } from './helpers.mjs';

// The deploy-visibility mechanism (PR-0, SC-0075 follow-up) replayed offline
// against a scripted fake `gh` — same idiom as the repo's merge-discipline
// self-test: never a silent green. Each scenario spawns the real script with
// the fake gh first on PATH and asserts exactly which gh subcommands ran.

const portalDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const alarmScript = path.join(portalDir, 'ci', 'deploy-alarm.mjs');
const freshnessScript = path.join(portalDir, 'ci', 'check-freshness.mjs');

/** A fake `gh` that logs every invocation and answers `issue list` from a canned file. */
function mkFakeGh(openIssues = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-fake-gh-'));
  const log = path.join(dir, 'gh.log');
  const listFile = path.join(dir, 'issue-list.json');
  fs.writeFileSync(log, '');
  fs.writeFileSync(listFile, JSON.stringify(openIssues.map((n) => ({ number: n }))));
  const bin = path.join(dir, 'gh');
  fs.writeFileSync(
    bin,
    `#!/bin/sh
echo "$@" >> "${log}"
case "$1 $2" in
  "issue list") cat "${listFile}" ;;
  "issue create") echo "https://github.com/fake/fake/issues/99" ;;
esac
`
  );
  fs.chmodSync(bin, 0o755);
  return {
    dir,
    calls: () => fs.readFileSync(log, 'utf8').split('\n').filter(Boolean),
    env: { PATH: `${dir}${path.delimiter}${process.env.PATH}` },
  };
}

function run(script, args, extraEnv) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
  });
}

// ---- deploy-alarm.mjs: raise / clear ----------------------------------------

test('raise with no open alarm creates one labeled + assigned issue', () => {
  const gh = mkFakeGh([]);
  const res = run(alarmScript, ['raise', '--title', 'boom', '--body', 'details'], gh.env);
  assert.equal(res.status, 0, res.stderr);
  const calls = gh.calls();
  assert.ok(calls.some((c) => c.startsWith('label create portal-deploy-alarm')), 'ensures the label first');
  const create = calls.find((c) => c.startsWith('issue create'));
  assert.ok(create, 'creates the issue');
  assert.match(create, /--label portal-deploy-alarm/);
  assert.match(create, /--assignee MarciaSuzuki/);
  assert.ok(!calls.some((c) => c.startsWith('issue comment')), 'no comment when creating');
  rmrf(gh.dir);
});

test('raise with an alarm already open comments on it — never a second open alarm', () => {
  const gh = mkFakeGh([7]);
  const res = run(alarmScript, ['raise', '--title', 'boom', '--body', 'again'], gh.env);
  assert.equal(res.status, 0, res.stderr);
  const calls = gh.calls();
  assert.ok(calls.some((c) => c.startsWith('issue comment 7')), 'comments on the open issue');
  assert.ok(!calls.some((c) => c.startsWith('issue create')), 'does not create a duplicate');
  rmrf(gh.dir);
});

test('clear with an open alarm closes it with the all-clear comment', () => {
  const gh = mkFakeGh([7]);
  const res = run(alarmScript, ['clear', '--body', 'green again'], gh.env);
  assert.equal(res.status, 0, res.stderr);
  const calls = gh.calls();
  const close = calls.find((c) => c.startsWith('issue close 7'));
  assert.ok(close, 'closes the open issue');
  assert.match(close, /--comment green again/);
  rmrf(gh.dir);
});

test('clear with nothing open is a quiet no-op', () => {
  const gh = mkFakeGh([]);
  const res = run(alarmScript, ['clear', '--body', 'green'], gh.env);
  assert.equal(res.status, 0, res.stderr);
  const calls = gh.calls();
  assert.ok(!calls.some((c) => c.startsWith('issue close')), 'nothing to close');
  assert.ok(!calls.some((c) => c.startsWith('issue create')), 'clear never creates');
  rmrf(gh.dir);
});

// ---- check-freshness.mjs: live manifest vs main HEAD ------------------------

/** A throwaway git repo whose single commit has a controlled committer date. */
function mkRepoAt(epochSeconds) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-fresh-repo-'));
  const git = (args, env = {}) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...process.env, ...env } }).trim();
  git(['init', '-q']);
  git(['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '--allow-empty', '-m', 'seed', '-q'], {
    GIT_AUTHOR_DATE: `@${epochSeconds} +0000`,
    GIT_COMMITTER_DATE: `@${epochSeconds} +0000`,
  });
  return { dir, head7: git(['rev-parse', 'HEAD']).slice(0, 7) };
}

function mkManifest(dir, commit) {
  const p = path.join(dir, 'build-manifest.json');
  fs.writeFileSync(p, JSON.stringify({ commit, approvedOnly: true }));
  return p;
}

const NOW = 1_800_000_000;

test('freshness: live == main → exit 0, no alarm raised (and any open alarm is cleared)', () => {
  const gh = mkFakeGh([7]);
  const repo = mkRepoAt(NOW - 86_400);
  const res = run(freshnessScript, [], {
    ...gh.env,
    MANIFEST_FILE: mkManifest(repo.dir, repo.head7),
    REPO_DIR: repo.dir,
    FRESHNESS_NOW: String(NOW),
  });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /fresh/);
  const calls = gh.calls();
  assert.ok(!calls.some((c) => c.startsWith('issue create')), 'fresh never raises');
  assert.ok(calls.some((c) => c.startsWith('issue close 7')), 'fresh clears the stale alarm');
  rmrf(gh.dir);
  rmrf(repo.dir);
});

test('freshness: stale beyond grace → raises the alarm and exits 1 (a red watchdog run)', () => {
  const gh = mkFakeGh([]);
  const repo = mkRepoAt(NOW - 7200); // HEAD is 2h old, far past the 45-min grace
  const res = run(freshnessScript, [], {
    ...gh.env,
    MANIFEST_FILE: mkManifest(repo.dir, 'abc1234'),
    REPO_DIR: repo.dir,
    FRESHNESS_NOW: String(NOW),
  });
  assert.equal(res.status, 1, 'stale must be a loud (red) run');
  const create = gh.calls().find((c) => c.startsWith('issue create'));
  assert.ok(create, 'stale raises the alarm');
  assert.match(create, /stale/);
  rmrf(gh.dir);
  rmrf(repo.dir);
});

test('freshness: mismatch inside the grace window → deploy in flight, exit 0, no alarm', () => {
  const gh = mkFakeGh([]);
  const repo = mkRepoAt(NOW - 120); // HEAD is 2 minutes old
  const res = run(freshnessScript, [], {
    ...gh.env,
    MANIFEST_FILE: mkManifest(repo.dir, 'abc1234'),
    REPO_DIR: repo.dir,
    FRESHNESS_NOW: String(NOW),
  });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /grace/);
  assert.equal(gh.calls().length, 0, 'grace touches gh not at all');
  rmrf(gh.dir);
  rmrf(repo.dir);
});

test('freshness: unreadable live manifest → raises the alarm and exits 1', () => {
  const gh = mkFakeGh([]);
  const repo = mkRepoAt(NOW - 86_400);
  const res = run(freshnessScript, [], {
    ...gh.env,
    MANIFEST_FILE: path.join(repo.dir, 'does-not-exist.json'),
    REPO_DIR: repo.dir,
    FRESHNESS_NOW: String(NOW),
  });
  assert.equal(res.status, 1, 'unreadable site must be a loud (red) run');
  const create = gh.calls().find((c) => c.startsWith('issue create'));
  assert.ok(create, 'unreadable manifest raises the alarm');
  assert.match(create, /unreadable/);
  rmrf(gh.dir);
  rmrf(repo.dir);
});
