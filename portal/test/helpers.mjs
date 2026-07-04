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
        B2: { english: 'Elimelech', hebrew: 'אֱלִימֶלֶךְ', kind: 'PERSON', appears_in: ['P99'], referential_forms: [] },
      },
    }),
    '_spec/registry/jonah.aliases.json': JSON.stringify({ book: 'JONAH', entities: {} }),
    '_spec/registry/esther.aliases.json': JSON.stringify({
      book: 'ESTHER',
      entities: {
        B19: { english: 'Esther', hebrew: 'אֶסְתֵּר', kind: 'PERSON', appears_in: ['E01'], referential_forms: [] },
      },
    }),
    '_spec/registry/concepts.json': JSON.stringify({
      entries: { CB_0029: { code: 'CB_0029', name_slug: 'Judges-Era', appears_in: ['RUTH'] } },
    }),
    '_spec/registry/figures.json': JSON.stringify({
      entries: { FIG_0007: { code: 'FIG_0007', name_slug: 'Narrator-Frame', appears_in: ['RUTH'] } },
    }),
    // Atlas-data sources (spec §2.1) — minimal but real-shaped.
    '_spec/approved-enumerations.json': JSON.stringify({
      version: 'v0-test',
      tagset_version: 'TRIPOD_STA_v2_0',
      axes: {
        proposition_kind: [
          { value: 'TIME_ANCHOR_ESTABLISHED', first_seen: 'P01', approved_in: 'P01', source_artifact: 'P01-Ruth-1-1-5-FOR-MODEL', sc_ref: 'SC-0006' },
        ],
        scene_kind: [],
      },
    }),
    '_spec/validation-rules.json': JSON.stringify({
      version: 'v0-test',
      tagset_version: 'TRIPOD_STA_v2_0',
      closed_lists: {
        GENRE_GROUP: ['NARRATIVE'],
        GENRE: ['HISTORICAL_NARRATIVE'],
        REGISTER: ['INFORMAL_CASUAL', 'INTIMATE'],
        NARRATIVE_FRAMING: ['COMMUNITY_MEMORY'],
        SPEECH_ACT: ['STATES_AS_TRUE'],
      },
    }),
    'SPEC_CHANGES.md': [
      '# SPEC_CHANGES — test ledger',
      '',
      '| SC-ID | Decision (current binding) | Status |',
      '|---|---|---|',
      '| SC-0006 | **Drift convergence + approved-enumerations seed** 2026-05-29 | SHIPPED |',
    ].join('\n'),
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

export function mkLog(id, { status = 'valid', type = 'sta-compilation-log' } = {}) {
  return `---
type: "${type}"
pericope: "${id}"
pericope-title: "A test passage"
status: "${status}"
pilot: "pilot-2"
---

# ${id} — COMPILATION-LOG

\`\`\`json
{ "sta_id": "test_${id.toLowerCase()}", "decisions": [] }
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
