import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "../src/engine/validate.js";

/**
 * SC-0064 close — the FOR_MODEL graduation (the SC-0055/0062 visibility idiom, applied to FOR_MODELs).
 * The 13 machine-drafted, reviewer-ruled FOR_MODELs (P07–P14 + J01–J05) graduate from `_working/` into
 * `fixtures/for-model/` now that their judgment halves are ruled (SC-0064 §A–§E + arc_element). One
 * anchor per pericope:
 *   - status flipped draft → valid (the graduation act),
 *   - validates block-clean with ZERO convergent drift — the payoff of the batch ruling: every L2 axis
 *     value the FM uses (arc_element, scene_kind, proposition_kind, role, action, tone) is now approved,
 *   - the L1 closed lists HOLD, including the two watch-points: J03 the psalm
 *     (POETIC_SUNG/PRAYER/RELIGIOUS_WORSHIP — self-classified, generalized off Ruth) and P14 the
 *     genealogy (GENEALOGY under NARRATIVE with the narrator constant).
 * Bite-proven: a status regression and a closed-list violation both fire.
 */
type Anchor = [file: string, staId: string, genreGroup: string, genre: string, register: string];
const ANCHORS: Record<string, Anchor> = {
  P07: ["P07-Ruth-2-17-23-FOR-MODEL.md", "ruth_pericope_07_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P08: ["P08-Ruth-3-1-5-FOR-MODEL.md", "ruth_pericope_08_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P09: ["P09-Ruth-3-6-13-FOR-MODEL.md", "ruth_pericope_09_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P10: ["P10-Ruth-3-14-18-FOR-MODEL.md", "ruth_pericope_10_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P11: ["P11-Ruth-4-1-8-FOR-MODEL.md", "ruth_pericope_11_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P12: ["P12-Ruth-4-9-12-FOR-MODEL.md", "ruth_pericope_12_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P13: ["P13-Ruth-4-13-17-FOR-MODEL.md", "ruth_pericope_13_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  P14: ["P14-Ruth-4-18-22-FOR-MODEL.md", "ruth_pericope_14_v2_0", "NARRATIVE", "GENEALOGY", "INFORMAL_CASUAL"],
  J01: ["J01-Jonah-1-1-3-FOR-MODEL.md", "jonah_pericope_01_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  J02: ["J02-Jonah-1-4-2-1-FOR-MODEL.md", "jonah_pericope_02_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  J03: ["J03-Jonah-2-2-9-FOR-MODEL.md", "jonah_pericope_03_v2_0", "POETIC_SUNG", "PRAYER", "RELIGIOUS_WORSHIP"],
  J04: ["J04-Jonah-2-10-3-10-FOR-MODEL.md", "jonah_pericope_04_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
  J05: ["J05-Jonah-4-1-11-FOR-MODEL.md", "jonah_pericope_05_v2_0", "NARRATIVE", "HISTORICAL_NARRATIVE", "INFORMAL_CASUAL"],
};

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "..", "fixtures", "for-model");
const statusOf = (text: string) => text.match(/^status:\s*"([^"]+)"/m)?.[1];
const jsonOf = (text: string) => JSON.parse(text.match(/```json\s*(\{[\s\S]*\})\s*```/)![1]);

describe("SC-0064 close — FOR_MODEL graduation (13 ruled FMs become visible)", () => {
  for (const [pid, [file, staId, gg, genre, reg]] of Object.entries(ANCHORS)) {
    describe(pid, () => {
      const path = join(FIX, file);
      const text = readFileSync(path, "utf8");

      it("graduated: status flipped draft → valid", () => {
        expect(statusOf(text)).toBe("valid");
      });

      it("validates block-clean with ZERO convergent drift (the batch-ruling payoff)", () => {
        const r = validateArtifact(path);
        expect(r.artifact).toBe("FOR_MODEL");
        expect(r.counts.block, JSON.stringify(r.findings.filter((f) => f.severity === "block"), null, 2)).toBe(0);
        expect(r.counts.drift).toBe(0);
        expect(r.ok).toBe(true);
      });

      it("L1 closed lists HOLD + sta_id", () => {
        const j = jsonOf(text);
        expect(j.sta_id).toBe(staId);
        const c = j.pericope_classification;
        expect([c.genre_group, c.genre, c.register]).toEqual([gg, genre, reg]);
      });
    });
  }

  // adversarial: the graduation guards must fire
  describe("bite-proof", () => {
    const tmp = mkdtempSync(join(tmpdir(), "tripod-grad3-"));
    const j03 = readFileSync(join(FIX, "J03-Jonah-2-2-9-FOR-MODEL.md"), "utf8");

    it("a status regression valid → draft is caught by the status pin", () => {
      expect(statusOf(j03)).toBe("valid");
      expect(statusOf(j03.replace('status: "valid"', 'status: "draft"'))).toBe("draft");
    });

    it("a closed-list (register) violation blocks", () => {
      const f = join(tmp, "bad-register-FOR-MODEL.md");
      writeFileSync(f, j03.replace('"register": "RELIGIOUS_WORSHIP"', '"register": "BOGUS_REGISTER"'));
      const r = validateArtifact(f);
      expect(r.ok).toBe(false);
      expect(r.counts.block).toBeGreaterThan(0);
    });
  });
});
