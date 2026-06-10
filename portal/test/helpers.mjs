import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { spawnSync } from 'node:child_process';

export const portalDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const buildScript = path.join(portalDir, 'src', 'build.mjs');

/** Create a throwaway synthetic repo tree (fixtures + minimal registries). */
export function mkTree(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-test-'));
  const defaults = {
    '_spec/registry/ruth.aliases.json': JSON.stringify({
      book: 'RUTH',
      entities: {
        B2: { english: 'Elimelech', hebrew: 'אֱלִימֶלֶךְ', kind: 'PERSON' },
      },
    }),
    '_spec/registry/jonah.aliases.json': JSON.stringify({ book: 'JONAH', entities: {} }),
    '_spec/registry/concepts.json': JSON.stringify({
      entries: { CB_0029: { code: 'CB_0029', name_slug: 'Judges-Era', appears_in: ['RUTH'] } },
    }),
    '_spec/registry/figures.json': JSON.stringify({
      entries: { FIG_0007: { code: 'FIG_0007', name_slug: 'Narrator-Frame', appears_in: ['RUTH'] } },
    }),
  };
  for (const [rel, content] of Object.entries({ ...defaults, ...files })) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  return root;
}

export function mkMap(id, { status = 'complete', type = 'pericope', title = 'A test passage', bcv } = {}) {
  return `---
type: "${type}"
pericope-num: "${id}"
pericope-title: "${title}"
bcv: "${bcv ?? 'Ruth 9:1-5'}"
genre-group: "NARRATIVE"
genre: "HISTORICAL_NARRATIVE"
register: "INFORMAL_CASUAL"
status: "${status}"
pilot: "pilot-2"
active-concepts:
  - [[CB_0029-Judges-Era]]
---

# ${id} — test map

## 1. Metadata
A paragraph mentioning [[B2-Elimelech]] and the concept [[CB_0029-Judges-Era]].

## 2. Level 1 — Whole-Passage Movement
See [[${id}-Test-FOR-MODEL]] for the machine file.
`;
}

export function mkForModel(id, { status = 'valid', type = 'sta-for-model' } = {}) {
  return `---
type: "${type}"
pericope: "${id}"
pericope-title: "A test passage"
source-meaning-map: [[${id}-Test]]
status: "${status}"
pilot: "pilot-2"
---

# ${id} — FOR_MODEL

\`\`\`json
{ "sta_id": "test_${id.toLowerCase()}", "header": { "bcv": "Ruth 9:1-5" }, "level_3_propositions": [ { "prop_id": "P1", "cb_flags": ["CB_0029"] } ] }
\`\`\`
`;
}

/** Run the real build binary against a tree; returns {status, stdout, stderr}. */
export function runBuild(root, out, extraArgs = []) {
  const res = spawnSync(
    process.execPath,
    [buildScript, '--root', root, '--out', out, ...extraArgs],
    { encoding: 'utf8' }
  );
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

export function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}
