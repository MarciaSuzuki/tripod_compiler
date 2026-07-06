import path from 'node:path';

// THE APPROVED-ONLY GATE.
//
// Acceptance contract items 1 + 2: the portal renders ONLY blessed artifacts —
// meaning maps with status "complete", MCs and compilation logs with
// status "valid" — and only from their expected directories under fixtures/.
// This is a build test, not a convention: ANY artifact that fails these checks
// aborts the whole build (exit code 2) before a single page is written.
//
// Deliberate strictness: a non-approved .md sitting in a fixtures artifact
// directory does not get silently skipped — it kills the build. Everything in
// fixtures/ is supposed to be blessed; a draft in there is itself an anomaly
// the portal must refuse to build on.

export const ARTIFACT_CLASSES = {
  'meaning-map': {
    dir: 'meaning-map',
    type: 'pericope',
    requiredStatus: 'complete',
    label: 'Meaning Map',
  },
  'meaning-coordinates': {
    dir: 'meaning-coordinates',
    type: 'sta-meaning-coordinates',
    requiredStatus: 'valid',
    label: 'MEANING_COORDINATES (STA)',
  },
  'compilation-log': {
    dir: 'compilation-log',
    type: 'sta-compilation-log',
    requiredStatus: 'valid',
    label: 'Compilation Log',
  },
};

export class GateError extends Error {
  constructor(violations) {
    super(
      `APPROVED-ONLY GATE: ${violations.length} violation(s) — nothing was built.\n` +
        violations.map((v) => `  ✗ ${v}`).join('\n')
    );
    this.name = 'GateError';
    this.violations = violations;
  }
}

/**
 * Check one artifact against the approved-only rules.
 * @param {object} a
 * @param {string} a.classKey       key into ARTIFACT_CLASSES
 * @param {string} a.filePath       path as collected (for messages)
 * @param {string} a.realPath      fully resolved path (symlinks followed)
 * @param {string} a.fixturesRealRoot fully resolved fixtures/ root
 * @param {object} a.frontmatter    parsed frontmatter
 * @returns {string[]} human-readable violations (empty = approved)
 */
export function checkArtifact({ classKey, filePath, realPath, fixturesRealRoot, frontmatter }) {
  const cls = ARTIFACT_CLASSES[classKey];
  if (!cls) throw new Error(`unknown artifact class: ${classKey}`);
  const violations = [];

  // 1. Containment: the file's REAL location (after resolving any symlink)
  //    must be inside fixtures/<class-dir>/. A symlink in fixtures pointing at
  //    _working/ or anywhere else is a violation.
  const allowedDir = path.join(fixturesRealRoot, cls.dir) + path.sep;
  if (!realPath.startsWith(allowedDir)) {
    violations.push(
      `${filePath}: resolves to ${realPath}, which is OUTSIDE the approved directory ${allowedDir} — refusing to render content from outside fixtures/${cls.dir}/`
    );
  }

  // 2. Type: the frontmatter must declare the expected artifact type.
  if (frontmatter.type !== cls.type) {
    violations.push(
      `${filePath}: frontmatter type is ${JSON.stringify(frontmatter.type ?? null)}, expected "${cls.type}" for a ${cls.label}`
    );
  }

  // 3. Approval status: the one rule that matters.
  if (frontmatter.status === undefined || frontmatter.status === null) {
    violations.push(
      `${filePath}: has NO status field — cannot prove approval (a ${cls.label} must carry status: "${cls.requiredStatus}")`
    );
  } else if (frontmatter.status !== cls.requiredStatus) {
    violations.push(
      `${filePath}: status is ${JSON.stringify(frontmatter.status)} — NOT APPROVED (a ${cls.label} renders only with status: "${cls.requiredStatus}")`
    );
  }

  return violations;
}

/**
 * Gate a whole collected set. Throws GateError listing EVERY violation
 * (not just the first) so a failed CI run reads as a complete diagnosis.
 */
export function assertAllApproved(artifacts) {
  const violations = artifacts.flatMap((a) => checkArtifact(a));
  if (violations.length > 0) throw new GateError(violations);
}
