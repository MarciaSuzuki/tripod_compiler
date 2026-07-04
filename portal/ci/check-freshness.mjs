#!/usr/bin/env node
// Tripod Review Portal — freshness watchdog: the live portal must show what
// main has (the freshness contract, SC-0075 follow-up).
//
// Compares the deployed build-manifest.json commit stamp against HEAD of the
// checkout it runs in (the watchdog workflow checks out main). Three outcomes:
//
//   fresh  — live commit == HEAD → exit 0 (and close any open alarm issue:
//            fresh means the latest main deployed, so an open alarm is stale news);
//   grace  — mismatch but HEAD is younger than GRACE_SECONDS → a deploy is
//            plausibly still in flight → exit 0, say so, alarm nothing;
//   stale  — mismatch beyond grace, or the live manifest cannot be read at all
//            → raise the alarm issue and exit 1 (a red watchdog run, loudly).
//
// This catches the failure classes an in-run alert cannot see: the deploy
// workflow not running at all (broken file, Actions disabled), a "green" run
// whose site never updated, and a dead/404 Pages site.
//
// Environment (all optional; defaults are production):
//   MANIFEST_URL     live manifest URL (default: the GitHub Pages URL)
//   MANIFEST_FILE    read the manifest from a file instead of fetching (tests)
//   REPO_DIR         git repo to compare against (default: cwd)
//   GRACE_SECONDS    mismatch younger than this is "in flight" (default 2700)
//   FRESHNESS_NOW    epoch-seconds clock override (tests)
//   ALARM_RUN_URL    this watchdog run's URL, quoted in alarm/all-clear bodies
//
// Tier B: reads the public live site + git metadata; writes only via the
// deploy-alarm issue channel.

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { raise, clear } from './deploy-alarm.mjs';

const MANIFEST_URL =
  process.env.MANIFEST_URL ?? 'https://marciasuzuki.github.io/tripod_compiler/build-manifest.json';
const REPO_DIR = process.env.REPO_DIR ?? process.cwd();
const GRACE_SECONDS = Number(process.env.GRACE_SECONDS ?? 2700);
const RUN_URL = process.env.ALARM_RUN_URL ?? '(run URL not set)';

function git(args) {
  return execFileSync('git', args, { cwd: REPO_DIR, encoding: 'utf8' }).trim();
}

async function readManifest() {
  if (process.env.MANIFEST_FILE) {
    return JSON.parse(fs.readFileSync(process.env.MANIFEST_FILE, 'utf8'));
  }
  // Cache-buster query: GitHub Pages' CDN keys on the full URL, so a unique
  // query sidesteps a stale cached copy masking a stale site (or vice versa).
  const target = `${MANIFEST_URL}?watchdog=${Date.now()}`;
  const res = await fetch(target, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`GET ${MANIFEST_URL} → HTTP ${res.status}`);
  return await res.json();
}

async function main() {
  const head = git(['rev-parse', 'HEAD']);
  const head7 = head.slice(0, 7);
  const headTime = Number(git(['show', '-s', '--format=%ct', 'HEAD']));
  const now = process.env.FRESHNESS_NOW ? Number(process.env.FRESHNESS_NOW) : Math.floor(Date.now() / 1000);

  let manifest;
  try {
    manifest = await readManifest();
  } catch (e) {
    raise(
      'Portal alarm: the live site’s build manifest is unreadable',
      [
        'The freshness watchdog could not read the live portal’s `build-manifest.json` — the site may be down, never deployed, or GitHub Pages may be misconfigured.',
        '',
        `- Error: ${e.message}`,
        `- Expected at: ${MANIFEST_URL}`,
        `- main is at: \`${head7}\``,
        `- Watchdog run: ${RUN_URL}`,
        '',
        'Until this is fixed the portal is not serving current approved artifacts. This issue closes itself on the next green signal.',
      ].join('\n')
    );
    process.exit(1);
  }

  const live = String(manifest.commit ?? '').slice(0, 7);

  if (live === head7) {
    console.log(`freshness: live portal matches main (@${head7}) — fresh`);
    clear(
      `Freshness watchdog: the live portal now matches \`main\` (@\`${head7}\`) — all clear. (${RUN_URL})`
    );
    return;
  }

  const age = now - headTime;
  if (age < GRACE_SECONDS) {
    console.log(
      `freshness: live @${live} ≠ main @${head7}, but HEAD is only ${age}s old (< ${GRACE_SECONDS}s grace) — deploy plausibly in flight, not alarming`
    );
    return;
  }

  raise(
    'Portal alarm: the live site is stale (does not match main)',
    [
      'The freshness watchdog found the deployed portal behind `main` — a deploy failed, never ran, or silently did not take. **The live site is still serving an older approved state** (fail-closed is by design), but reviewers are not seeing current canon.',
      '',
      `- Live site built from: \`${live}\``,
      `- main is at: \`${head7}\` (${Math.floor(age / 60)} minutes old)`,
      `- Live manifest: ${MANIFEST_URL}`,
      `- Watchdog run: ${RUN_URL}`,
      '',
      'Triage: open the latest `review-portal` run in the Actions tab. A test/gate failure (exit 2) means an artifact in `fixtures/` failed the approved-only gate — fix the artifact drift upstream, never the gate. If no run exists for the latest merge, the workflow itself did not fire.',
      '',
      'This issue closes itself on the next green run / fresh check.',
    ].join('\n')
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(`check-freshness failed: ${e.message}`);
  process.exit(1);
});
