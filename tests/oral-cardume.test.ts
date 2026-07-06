import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "../src/engine/validate.js";

/**
 * SC-0065 — the ORAL PROFILE validation slice. The gold Cardume oral STA
 * (cardume_passage_01_v0_1, TRIPOD_STA_GENERAL_v0_1, source_domain=oral_archive) must validate
 * under the SAME machinery that validates the biblical MCs — the convergence the seam
 * note promises. It arrives as a raw .json (no Obsidian envelope): the reader falls back to
 * whole-file JSON, detectArtifact recognises it by signature, the top-level if/then/else routes
 * source_domain=oral_archive to the oral branch, and the oral bead-span pass runs.
 *
 * The biblical byte-identical guarantee is held by the rest of the suite (validate.test.ts +
 * the graduation anchors): every Ruth+Jonah artifact still validates exactly as before.
 */
const here = dirname(fileURLToPath(import.meta.url));
const ORAL = join(here, "..", "fixtures", "oral", "cardume-P01-sta.json");
const raw = readFileSync(ORAL, "utf8");
const blockMsgs = (r: ReturnType<typeof validateArtifact>) =>
  JSON.stringify(r.findings.filter((f) => f.severity === "block"), null, 2);

describe("oral profile — gold Cardume STA (SC-0065)", () => {
  it("is detected as a MEANING_COORDINATES and validates block-clean", () => {
    const r = validateArtifact(ORAL);
    expect(r.artifact).toBe("MEANING_COORDINATES");
    expect(r.specVersion).toBe("v0.19");
    expect(r.counts.block, blockMsgs(r)).toBe(0);
    expect(r.ok).toBe(true);
  });

  it("surfaces the oral NEW_VALUE candidates as drift (flagged for ruling, not coined)", () => {
    // PINNED pre-ruling count (the graduation-anchor idiom): a move means the spec, the approved
    // enumerations, or the artifact changed — look. Marcia's Stage-2 promotions will lower this.
    const r = validateArtifact(ORAL);
    expect(r.counts.drift).toBe(14);
    const drifted = new Set(r.findings.filter((f) => f.severity === "drift").map((f) => f.value));
    for (const v of [
      "CONTENTMENT_BASELINE_SCENE",            // scene_kind
      "OPENING_BASELINE_OF_UNSELFCONSCIOUS_BELONGING", // arc_element
      "ESTABLISHED_CONDITION",                 // proposition_kind
      "ESTABLISHED_DEFINING_NATURE",           // action (sentence-shaped — strip-to-type candidate)
    ]) {
      expect(drifted.has(v), `expected '${v}' surfaced as drift`).toBe(true);
    }
  });

  it("reads emptied exegetical fields as valid (cb/figure flags present-but-empty)", () => {
    const r = validateArtifact(ORAL);
    // no block about missing cb_flags / figure_flags — emptied-but-present is expected for oral
    expect(r.findings.some((f) => f.severity === "block" && /cb_flags|figure_flags/.test(f.message))).toBe(false);
  });

  it("the bead-span pass is clean on the gold (scenes tile, propositions nest)", () => {
    const r = validateArtifact(ORAL);
    expect(r.findings.filter((f) => f.code === "bead-span")).toHaveLength(0);
  });
});

describe("oral profile — negative cases (located, precise errors)", () => {
  const tmp = mkdtempSync(join(tmpdir(), "tripod-oral-"));
  const write = (name: string, body: string) => {
    const f = join(tmp, name);
    writeFileSync(f, body);
    return f;
  };

  it("a non-oral source_domain routes to the biblical branch and is rejected (discriminator works)", () => {
    const r = validateArtifact(write("bad-domain-sta.json", raw.replace('"source_domain": "oral_archive"', '"source_domain": "bogus_domain"')));
    expect(r.ok).toBe(false); // falls to the biblical else-branch, which has none of the oral shape
  });

  it("enforces the listener-not-author standard (speaker_role)", () => {
    const r = validateArtifact(write("bad-speaker-sta.json", raw.replace('"speaker_role": "LISTENER_NOT_STORYTELLER"', '"speaker_role": "THE_STORYTELLER"')));
    expect(r.ok).toBe(false);
    expect(r.findings.some((f) => f.severity === "block" && f.location.includes("speaker_role"))).toBe(true);
  });

  it("pins the oral tagset_version (TRIPOD_STA_GENERAL_v0_1)", () => {
    const r = validateArtifact(write("bad-tagset-sta.json", raw.replace('"tagset_version": "TRIPOD_STA_GENERAL_v0_1"', '"tagset_version": "TRIPOD_STA_v2_0"')));
    expect(r.ok).toBe(false);
    expect(r.findings.some((f) => f.severity === "block" && f.location.includes("tagset_version"))).toBe(true);
  });

  it("pins the oral header profile (artifact_profile = LA_RECORDING)", () => {
    const r = validateArtifact(write("bad-profile-sta.json", raw.replace('"artifact_profile": "LA_RECORDING"', '"artifact_profile": "BIBLICAL_PASSAGE"')));
    expect(r.ok).toBe(false);
  });

  it("blocks a bead-span containment violation (proposition spilling past its scene)", () => {
    const r = validateArtifact(write("bad-bead-sta.json", raw.replace('"start_bead": 36, "end_bead": 47', '"start_bead": 36, "end_bead": 99')));
    expect(r.ok).toBe(false);
    expect(r.findings.some((f) => f.code === "bead-span")).toBe(true);
  });
});

// SC-0066 — the source Prose Meaning Map committed beside its STA. No oral map reader exists yet
// (a fuller map↔STA derivation-consistency check is future Evaluator work); this keeps the pairing
// load-bearing so the map can't be silently dropped/renamed and the STA can't lose its provenance.
describe("oral profile — map↔STA fixture pairing (SC-0066)", () => {
  const MAP = join(here, "..", "fixtures", "oral", "cardume-P01-meaning-map.md");

  it("the source Prose Meaning Map is committed beside its STA", () => {
    expect(existsSync(MAP), `expected the oral map fixture at ${MAP}`).toBe(true);
  });

  it("the STA's compilation_log.compiled_from names the map fixture (provenance is load-bearing)", () => {
    const sta = JSON.parse(raw) as { compilation_log?: { compiled_from?: string } };
    expect(sta.compilation_log?.compiled_from).toContain("cardume-P01-meaning-map.md");
  });
});
