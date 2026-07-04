#!/usr/bin/env node
// Tripod Review Portal — deploy alarm: the one loud channel for deploy failures.
//
//   node portal/ci/deploy-alarm.mjs raise --title "<title>" --body "<body>"
//   node portal/ci/deploy-alarm.mjs clear --body "<body>"
//
// The alarm is a single labeled GitHub issue (label: portal-deploy-alarm),
// assigned to the maintainer so every raise produces a real notification:
//
//   raise — if an alarm issue is already open, comment on it (comments notify;
//           never a second open alarm issue); otherwise create it, labeled and
//           assigned (create + assignment both notify).
//   clear — close the open alarm issue with a comment naming the green run;
//           no-op when nothing is open.
//
// Runs inside GitHub Actions with GH_TOKEN + GH_REPO in the environment (see
// ci/portal-watchdog.yml). Talks to the GitHub issue tracker only — reads no
// canon, writes no repo files. Tier B.

import url from 'node:url';
import { execFileSync } from 'node:child_process';

export const ALARM_LABEL = 'portal-deploy-alarm';
const ASSIGNEE = 'MarciaSuzuki';
const LABEL_COLOR = 'B60205';
const LABEL_DESCRIPTION = 'The review-portal deploy is red or the live site is stale — see the open alarm issue.';

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

function openAlarmNumber() {
  const out = gh(['issue', 'list', '--label', ALARM_LABEL, '--state', 'open', '--json', 'number']);
  const issues = JSON.parse(out.trim() || '[]');
  return issues.length > 0 ? issues[0].number : null;
}

export function raise(title, body) {
  // The label must exist before an issue can carry it; --force makes this idempotent.
  gh(['label', 'create', ALARM_LABEL, '--color', LABEL_COLOR, '--description', LABEL_DESCRIPTION, '--force']);
  const open = openAlarmNumber();
  if (open !== null) {
    gh(['issue', 'comment', String(open), '--body', body]);
    console.log(`deploy-alarm: commented on open alarm issue #${open}`);
  } else {
    const created = gh([
      'issue', 'create',
      '--title', title,
      '--body', body,
      '--label', ALARM_LABEL,
      '--assignee', ASSIGNEE,
    ]).trim();
    console.log(`deploy-alarm: created alarm issue ${created}`);
  }
}

export function clear(body) {
  const open = openAlarmNumber();
  if (open === null) {
    console.log('deploy-alarm: no open alarm issue — all clear already');
    return;
  }
  gh(['issue', 'close', String(open), '--comment', body]);
  console.log(`deploy-alarm: closed alarm issue #${open}`);
}

function main() {
  const [mode, ...rest] = process.argv.slice(2);
  const opt = (name) => {
    const i = rest.indexOf(`--${name}`);
    return i !== -1 && rest[i + 1] !== undefined ? rest[i + 1] : null;
  };
  const body = opt('body');
  const title = opt('title');

  if (mode === 'raise') {
    if (!title || !body) throw new Error('raise needs --title and --body');
    raise(title, body);
  } else if (mode === 'clear') {
    if (!body) throw new Error('clear needs --body');
    clear(body);
  } else {
    throw new Error('usage: deploy-alarm.mjs raise --title <t> --body <b> | clear --body <b>');
  }
}

if (process.argv[1] && url.fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (e) {
    console.error(`deploy-alarm failed: ${e.message}`);
    process.exit(1);
  }
}
