import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "../src/engine/validate.js";

/**
 * SC-0046 — the genre-aware pericope register (validation-rules v0.16; Marcia's A-ruling on the
 * first real L1 finding of the project).
 *
 * The finding (J03, the psalm): the schema hard-coded pericope_classification.register as
 * `const INFORMAL_CASUAL` — a narrator assumption baked in when every pericope was narrative. The
 * psalm is the first pericope with NO narrator voice (the ruled division: purely the poem), and a
 * prayer addressed to God throughout cannot truthfully carry the narrator's register.
 *
 * The ruling, encoded: a NARRATIVE pericope keeps the narrator constant (register MUST be
 * INFORMAL_CASUAL — the teeth stay); a non-narrative pericope (POETIC_SUNG etc.) carries its true
 * register from the closed seven. Membership is enforced everywhere. Four cases, each one a way
 * this schema can regress.
 */

const here = dirname(fileURLToPath(import.meta.url));
const P01 = join(here, "..", "fixtures", "meaning-coordinates", "P01-Ruth-1-1-5-MEANING-COORDINATES.md");

let tmp: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "tripod-reg-"));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

/** Write a variant of the P01 note with classification fields swapped, and validate it. */
function variant(name: string, edits: Array<[string, string]>) {
  let text = readFileSync(P01, "utf8");
  for (const [from, to] of edits) text = text.replace(from, to);
  const p = join(tmp, `${name}-MEANING-COORDINATES.md`);
  writeFileSync(p, text);
  return validateArtifact(p);
}

const registerBlocks = (r: ReturnType<typeof validateArtifact>) =>
  r.findings.filter(
    (f) => f.severity === "block" && f.location.includes("register") && !f.location.includes("override"),
  );

describe("SC-0046 — genre-aware pericope register (v0.16)", () => {
  it("NARRATIVE + INFORMAL_CASUAL stays green (Ruth as-is — the floor)", () => {
    const r = validateArtifact(P01);
    expect(r.counts.block).toBe(0);
  });

  it("NARRATIVE + RELIGIOUS_WORSHIP blocks (the narrator constant keeps its teeth)", () => {
    const r = variant("narrative-worship", [
      ['"register": "INFORMAL_CASUAL"', '"register": "RELIGIOUS_WORSHIP"'],
    ]);
    expect(registerBlocks(r).length, "a NARRATIVE pericope must keep the narrator register").toBeGreaterThan(0);
  });

  it("POETIC_SUNG + RELIGIOUS_WORSHIP passes the register axis (the psalm's case — the finding, fixed)", () => {
    const r = variant("poetic-worship", [
      ['"genre_group": "NARRATIVE"', '"genre_group": "POETIC_SUNG"'],
      ['"register": "INFORMAL_CASUAL"', '"register": "RELIGIOUS_WORSHIP"'],
    ]);
    expect(registerBlocks(r)).toEqual([]);
  });

  it("POETIC_SUNG + a non-member register still blocks (closed-list membership holds everywhere)", () => {
    const r = variant("poetic-fake", [
      ['"genre_group": "NARRATIVE"', '"genre_group": "POETIC_SUNG"'],
      ['"register": "INFORMAL_CASUAL"', '"register": "FAKE_REGISTER"'],
    ]);
    expect(registerBlocks(r).length, "membership must be enforced for non-narrative too").toBeGreaterThan(0);
  });
});
