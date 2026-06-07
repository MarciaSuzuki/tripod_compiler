import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "../src/engine/validate.js";
import { checkDrift, closedListSyncIssues } from "../src/spec/pins.js";

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "..", "fixtures", "for-model");
const forModels = readdirSync(FIX).filter((f) => f.endsWith("-FOR-MODEL.md")).sort();
const CL_FIX = join(here, "..", "fixtures", "compilation-log");
const compLogs = readdirSync(CL_FIX).filter((f) => f.endsWith("-COMPILATION-LOG.md")).sort();
const blockMsgs = (r: ReturnType<typeof validateArtifact>) =>
  JSON.stringify(r.findings.filter((f) => f.severity === "block"), null, 2);

describe("FOR_MODEL gold fixtures (P01–P06)", () => {
  it("vendors all six gold fixtures", () => {
    expect(forModels).toHaveLength(6);
  });

  for (const f of forModels) {
    it(`${f} validates block-clean`, () => {
      const r = validateArtifact(join(FIX, f));
      expect(r.artifact).toBe("FOR_MODEL");
      expect(r.counts.block, blockMsgs(r)).toBe(0);
      expect(r.ok).toBe(true);
    });
  }

  it("P01 (the drift seed) has zero drift", () => {
    const r = validateArtifact(join(FIX, "P01-Ruth-1-1-5-FOR-MODEL.md"));
    expect(r.counts.drift).toBe(0);
  });

  it("post-convergence: P06 has zero convergent drift but still surfaces open/descriptive axes", () => {
    // After P01–P06 were all promoted (registry v0.4), convergent drift is 0 corpus-wide. The
    // bounded-open detector still runs: the descriptive/open axes (referential_form, role/function
    // examples) never converge and remain flagged as informational.
    const r = validateArtifact(join(FIX, "P06-Ruth-2-8-16-FOR-MODEL.md"));
    expect(r.counts.drift).toBe(0); // convergent axes fully converged
    expect(r.counts.descriptive).toBeGreaterThan(0); // open axes still surface (informational)
  });

  it("accepts the PL<n>_<DESCRIPTOR> sub-place form (SC-0005)", () => {
    // P05 uses PL5_BOAZ_PORTION; if the widened pattern regressed, P05 would block.
    const r = validateArtifact(join(FIX, "P05-Ruth-2-1-7-FOR-MODEL.md"));
    expect(r.counts.block, blockMsgs(r)).toBe(0);
  });
});

// SC-0026: the six gold COMPILATION-LOGs are now gate-validated against
// compilation-log.schema.json, exactly as the FOR_MODELs above. The validation
// machinery already existed (validateArtifact dispatches the CL schema); this block
// makes the check load-bearing, so a malformed CL fails `npm test` instead of entering
// the corpus as unguarded "provenance". (Vault-CL *content* staleness is SC-0008, not here.)
describe("COMPILATION-LOG gold fixtures (P01–P06)", () => {
  it("vendors all six gold compilation-logs", () => {
    expect(compLogs).toHaveLength(6);
  });

  for (const f of compLogs) {
    it(`${f} validates block-clean against compilation-log.schema.json`, () => {
      const r = validateArtifact(join(CL_FIX, f));
      expect(r.artifact).toBe("COMPILATION-LOG");
      expect(r.counts.block, blockMsgs(r)).toBe(0);
      expect(r.ok).toBe(true);
    });
  }
});

describe("negative cases (located, precise errors)", () => {
  const tmp = mkdtempSync(join(tmpdir(), "tripod-"));
  const p01 = readFileSync(join(FIX, "P01-Ruth-1-1-5-FOR-MODEL.md"), "utf8");
  const write = (name: string, body: string) => {
    const f = join(tmp, name);
    writeFileSync(f, body);
    return f;
  };

  it("blocks a closed-list (L1) violation — bad genre_group", () => {
    const r = validateArtifact(write("bad-genre-FOR-MODEL.md", p01.replace('"genre_group": "NARRATIVE"', '"genre_group": "BOGUS_GROUP"')));
    expect(r.ok).toBe(false);
    expect(r.findings.some((x) => x.code === "closed-list" && x.location.includes("genre_group"))).toBe(true);
  });

  it("blocks a dangling proposition link — referential integrity", () => {
    const r = validateArtifact(write("bad-link-FOR-MODEL.md", p01.replace('"forward_link_to": "P2"', '"forward_link_to": "P999"')));
    expect(r.ok).toBe(false);
    expect(r.findings.some((x) => x.code === "referential-integrity" && x.message.includes("P999"))).toBe(true);
  });

  it("blocks a malformed place_id", () => {
    const r = validateArtifact(write("bad-place-FOR-MODEL.md", p01.replace('"place_id": "PL1"', '"place_id": "lowercase_bad"')));
    expect(r.ok).toBe(false);
  });

  it("blocks an artifact whose JSON body is missing", () => {
    const r = validateArtifact(write("no-json-FOR-MODEL.md", "---\ntype: sta-for-model\n---\n# no fenced block here\n"));
    expect(r.ok).toBe(false);
  });

  it("blocks a COMPILATION-LOG missing a required top-level field (sta_id) — SC-0026", () => {
    const cl = readFileSync(join(CL_FIX, "P01-Ruth-1-1-5-COMPILATION-LOG.md"), "utf8");
    const broken = cl.replace(/^\s*"sta_id":\s*"[^"]*",\n/m, "");
    const r = validateArtifact(write("missing-staid-COMPILATION-LOG.md", broken));
    expect(r.artifact).toBe("COMPILATION-LOG");
    expect(r.ok).toBe(false);
    expect(r.findings.some((x) => x.severity === "block" && x.code === "schema" && x.message.includes("sta_id"))).toBe(true);
  });
});

describe("Thread B fidelity model — SC-0027 (P03 vow)", () => {
  const P03 = join(FIX, "P03-Ruth-1-15-18-FOR-MODEL.md");
  const p03 = readFileSync(P03, "utf8");
  const tmp = mkdtempSync(join(tmpdir(), "tripod-tb-"));
  const write = (name: string, body: string) => {
    const f = join(tmp, name);
    writeFileSync(f, body);
    return f;
  };

  it("P03 validates block-clean with the fidelity model, and both groups are declared", () => {
    const r = validateArtifact(P03);
    expect(r.counts.block, blockMsgs(r)).toBe(0);
    expect(p03.includes('"group_id": "people_god_inseparability"')).toBe(true);
    expect(p03.includes('"group_id": "unto_the_end"')).toBe(true);
  });

  it("blocks a dangling fidelity_group reference (SC-0027 dangling-group-id check)", () => {
    const broken = p03.replace('"fidelity_group": "people_god_inseparability"', '"fidelity_group": "no_such_group"');
    const r = validateArtifact(write("bad-fidelity-group-FOR-MODEL.md", broken));
    expect(r.ok).toBe(false);
    expect(r.findings.some((x) => x.code === "referential-integrity" && x.message.includes("no_such_group"))).toBe(true);
  });

  it("blocks a malformed component fidelity (non-boolean preserve_meaning)", () => {
    const broken = p03.replace('"fidelity": { "preserve_meaning": true, "preserve_form": false, "meaning": "Ruth binds herself to go', '"fidelity": { "preserve_meaning": "yes", "preserve_form": false, "meaning": "Ruth binds herself to go');
    const r = validateArtifact(write("bad-fidelity-shape-FOR-MODEL.md", broken));
    expect(r.ok).toBe(false);
    expect(r.findings.some((x) => x.code === "fidelity-shape")).toBe(true);
  });
});

describe("spec integrity", () => {
  it("vendored schemas match their pins", () => {
    for (const d of checkDrift()) expect(d.vendoredOk, `${d.file} drifted from pin`).toBe(true);
  });

  it("closed-list sync invariant holds (closed_lists.X == $defs.x_value.enum)", () => {
    expect(closedListSyncIssues()).toEqual([]);
  });
});
