import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { readMeaningMap } from "../src/reader/meaning-map.js";
import { compileSkeleton } from "../src/compiler/skeleton.js";
import { validateArtifact } from "../src/engine/validate.js";
import { closedList } from "../src/spec/load.js";
import {
  loadSourcePacket,
  sourcePacketPath,
  loadAliasTable,
  loadConceptRegistry,
  loadFigureRegistry,
} from "../src/reader/source-packet.js";
import { reconcile } from "../src/engine/coverage.js";

/**
 * SC-0062 — the Ruth-homestretch visibility batch: P08–P14 graduate together (the SC-0055 idiom,
 * third time through). Each blessed map moves byte-identical from `_working/<id>/` into fixtures with
 * the declared status flip draft→complete; the FOR_MODEL skeletons + COMPILATION-LOGs stay `_working/`
 * until their judgment halves are authored (the SC-0038 J01 Option-1 pattern).
 *
 * One anchor per pericope, the J01/J02/batch-1 idiom: the L1 closed lists HOLD, the fresh skeleton's
 * only schema blocks are unfilled judgment fields with the gap signature PINNED (a move means the spec,
 * the reader, or the authoring changed — look), and the frozen packet still reconciles with zero
 * unanchored. **P14 additionally gates the watch-point: GENEALOGY under NARRATIVE with the narrator
 * constant INFORMAL_CASUAL validates closed-axis clean — the "it holds" made permanent, the way the
 * psalm's finding is gated by tests/register-genre-aware.test.ts.**
 */

const here = dirname(fileURLToPath(import.meta.url));
const MM_DIR = join(here, "..", "fixtures", "meaning-map");

type Anchor = {
  pid: string;
  file: string;
  staId: string;
  bcvStart: RegExp;
  genreGroup: string;
  genre: string;
  register: string;
  blocks: number;
  explicit: number;
  implied: number;
  registered: { cb: string[]; fig: string[] };
};

const ANCHORS: Anchor[] = [
  {
    pid: "P08", file: "P08-Ruth-3-1-5.md", staId: "ruth_pericope_08_v2_0", bcvStart: /^Ruth 3:1/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    blocks: 21, explicit: 16, implied: 18,
    registered: { cb: ["CB_0014", "CB_0042"], fig: ["FIG_0120", "FIG_0123"] },
  },
  {
    pid: "P09", file: "P09-Ruth-3-6-13.md", staId: "ruth_pericope_09_v2_0", bcvStart: /^Ruth 3:6/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    blocks: 52, explicit: 39, implied: 23,
    registered: { cb: ["CB_0001", "CB_0011", "CB_0037"], fig: ["FIG_0131", "FIG_0135"] },
  },
  {
    pid: "P10", file: "P10-Ruth-3-14-18.md", staId: "ruth_pericope_10_v2_0", bcvStart: /^Ruth 3:14/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    // 27→24 (SC-0064 A-1, Marcia 2026-06-12): the O15-under-Times tension re-coded TM_NIGHT_TO_MORNING — its 3-block cascade gone
    blocks: 24, explicit: 23, implied: 22,
    registered: { cb: ["CB_0044", "CB_0024", "CB_0043"], fig: ["FIG_0153", "FIG_0154"] },
  },
  {
    pid: "P11", file: "P11-Ruth-4-1-8.md", staId: "ruth_pericope_11_v2_0", bcvStart: /^Ruth 4:1/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    // 52→49 (SC-0064 A-2, Marcia 2026-06-12): the FIG_0167-under-3C entry dropped — its 3-block cascade gone
    blocks: 49, explicit: 53, implied: 27,
    registered: { cb: ["CB_0001", "CB_0045", "CB_0007"], fig: ["FIG_0162", "FIG_0165"] },
  },
  {
    pid: "P12", file: "P12-Ruth-4-9-12.md", staId: "ruth_pericope_12_v2_0", bcvStart: /^Ruth 4:9/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    blocks: 36, explicit: 50, implied: 4,
    registered: { cb: ["CB_0005", "CB_0049", "CB_0010"], fig: ["FIG_0002", "FIG_0014", "FIG_0172"] },
  },
  {
    pid: "P13", file: "P13-Ruth-4-13-17.md", staId: "ruth_pericope_13_v2_0", bcvStart: /^Ruth 4:13/,
    genreGroup: "NARRATIVE", genre: "HISTORICAL_NARRATIVE", register: "INFORMAL_CASUAL",
    blocks: 38, explicit: 33, implied: 7,
    registered: { cb: ["CB_0046", "CB_0047", "CB_0048"], fig: ["FIG_0183", "FIG_0187", "FIG_0181"] },
  },
  {
    pid: "P14", file: "P14-Ruth-4-18-22.md", staId: "ruth_pericope_14_v2_0", bcvStart: /^Ruth 4:18/,
    genreGroup: "NARRATIVE", genre: "GENEALOGY", register: "INFORMAL_CASUAL",
    blocks: 17, explicit: 20, implied: 0,
    registered: { cb: ["CB_0049", "CB_0047", "CB_0048"], fig: ["FIG_0193", "FIG_0190", "FIG_0191"] },
  },
];

const judgmentField =
  /\/(scene_kind|scene_link|proposition_kind|book_context_ref|event_specific_slots)($|\/)|\/(beings_in_scene|objects_in_scene|places_in_scene|times_in_scene)\/entries($|\/)/;

for (const a of ANCHORS) {
  describe(`SC-0062 — ${a.pid} graduation anchor`, () => {
    const mm = readMeaningMap(join(MM_DIR, a.file));
    const { skeleton, gaps } = compileSkeleton(mm);

    it(`the graduated map parses as ${a.pid} and carries status complete`, () => {
      expect(mm.pericope).toBe(a.pid);
      expect(mm.bcv).toMatch(a.bcvStart);
      expect((skeleton as any).sta_id).toBe(a.staId);
      const raw = readFileSync(join(MM_DIR, a.file), "utf8");
      expect(raw).toMatch(/^status: "complete"$/m);
      expect(raw).not.toMatch(/^status: "draft"$/m);
    });

    it(`L1 closed lists HOLD: ${a.genreGroup} / ${a.genre} / ${a.register}`, () => {
      const pc = (skeleton as any).pericope_classification;
      expect(closedList("GENRE_GROUP")).toContain(pc.genre_group);
      expect(closedList("GENRE")).toContain(pc.genre);
      expect(closedList("REGISTER")).toContain(pc.register);
      expect(pc.genre_group).toBe(a.genreGroup);
      expect(pc.genre).toBe(a.genre);
      expect(pc.register).toBe(a.register);
    });

    it(`the skeleton's only blocks are judgment fields — ZERO closed-axis; gap signature pinned at ${a.blocks}`, () => {
      const tmp = mkdtempSync(join(tmpdir(), `tripod-grad2-${a.pid}-`));
      try {
        const fmPath = join(tmp, `${a.pid}-FOR-MODEL.md`);
        const note =
          `---\ntype: "sta-for-model"\npericope: "${a.pid}"\nstatus: "skeleton"\npilot: "pilot-2"\n---\n\n` +
          `# ${a.pid} — FOR_MODEL (SKELETON — ${gaps.length} judgment gaps)\n\n` +
          "```json\n" + JSON.stringify(skeleton, null, 2) + "\n```\n";
        writeFileSync(fmPath, note);
        const r = validateArtifact(fmPath);
        const blocks = r.findings.filter((f) => f.severity === "block");
        for (const b of blocks) {
          expect(b.location, `closed-list axis blocked: ${JSON.stringify(b)}`).not.toMatch(
            /pericope_classification|genre|register|speech_act/,
          );
          expect(b.location, `block outside the judgment-gap inventory: ${JSON.stringify(b)}`).toMatch(judgmentField);
        }
        expect(blocks.length).toBe(a.blocks);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    });

    it(`the frozen packet still reconciles: ${a.explicit}/${a.explicit} explicit · 0 unanchored`, () => {
      const packet = loadSourcePacket(sourcePacketPath("ruth", a.pid));
      const led = reconcile(packet, skeleton as any, loadAliasTable("ruth"));
      expect(led.ok).toBe(true);
      expect(led.score.explicit_total).toBe(a.explicit);
      expect(led.score.proper_unmapped).toBe(0);
      expect(led.score.unanchored).toBe(0);
      expect(led.score.implied_flagged).toBe(a.implied);
    });

    it("the map's flag codes are registered canon-globally", () => {
      const cb = loadConceptRegistry();
      const fig = loadFigureRegistry();
      for (const code of a.registered.cb) expect(cb.entries[code], `${code} missing`).toBeDefined();
      for (const code of a.registered.fig) expect(fig.entries[code], `${code} missing`).toBeDefined();
    });
  });
}

describe("SC-0062 — the GENEALOGY watch-point is permanently gated", () => {
  const mm = readMeaningMap(join(MM_DIR, "P14-Ruth-4-18-22.md"));
  const { skeleton } = compileSkeleton(mm);

  it("P14 is GENEALOGY under NARRATIVE with the narrator constant — and validates closed-axis clean (a HOLD, not a finding)", () => {
    const pc = (skeleton as any).pericope_classification;
    // the watch-point's claim, made permanent: GENEALOGY is a NARRATIVE-group genre, and the
    // v0.16 narrator-register constant FITS it (the genealogy is narrator-recited, unlike the psalm).
    expect(pc.genre).toBe("GENEALOGY");
    expect(pc.genre_group).toBe("NARRATIVE");
    expect(pc.register).toBe("INFORMAL_CASUAL");
    const tmp = mkdtempSync(join(tmpdir(), "tripod-p14-watchpoint-"));
    try {
      const fmPath = join(tmp, "P14-FOR-MODEL.md");
      writeFileSync(
        fmPath,
        `---\ntype: "sta-for-model"\npericope: "P14"\nstatus: "skeleton"\npilot: "pilot-2"\n---\n\n` +
          "```json\n" + JSON.stringify(skeleton, null, 2) + "\n```\n",
      );
      const blocks = validateArtifact(fmPath).findings.filter((f) => f.severity === "block");
      // ZERO closed-axis blocks: the narrative-narrator rule did not bite the genealogy.
      for (const b of blocks) {
        expect(b.location).not.toMatch(/pericope_classification|genre|register|speech_act/);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
