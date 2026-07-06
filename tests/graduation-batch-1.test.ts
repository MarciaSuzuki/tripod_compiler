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
 * SC-0055 — the visibility cycle: J03 + J04 + J05 + P07 graduate together (Marcia's
 * "P09 then visibility" order, 2026-06-11). Each blessed map moves byte-identical from
 * `_working/<id>/` into fixtures with the declared status flip draft→complete (the
 * SC-0044 J02 pattern); the MEANING_COORDINATES skeletons + COMPILATION-LOGs stay `_working/`
 * until their judgment halves are authored (the SC-0038 J01 Option-1 pattern).
 *
 * One anchor per pericope, the J01/J02 idiom: the L1 closed lists hold, the fresh
 * skeleton's only schema blocks are unfilled judgment fields with the gap signature
 * PINNED (a move means the spec, the reader, or the authoring changed — look), and the
 * frozen packet still reconciles with zero unanchored. J03 additionally re-pins the
 * versification convention on the fully divergent pericope (scene range = Hebrew,
 * prop anchor = English; the SC-0044 pin, exercised throughout chapter 2).
 */

const here = dirname(fileURLToPath(import.meta.url));
const MM_DIR = join(here, "..", "fixtures", "meaning-map");

type Anchor = {
  pid: string;
  file: string;
  book: "jonah" | "ruth";
  staId: string;
  bcvStart: RegExp;
  blocks: number;
  explicit: number;
  implied: number;
  registered: { cb: string[]; fig: string[] };
};

const ANCHORS: Anchor[] = [
  {
    pid: "J03",
    file: "J03-Jonah-2-2-9.md",
    book: "jonah",
    staId: "jonah_pericope_03_v2_0",
    bcvStart: /^Jonah 2:2/,
    blocks: 35,
    explicit: 43,
    implied: 15,
    registered: { cb: ["CB_0011", "CB_0055", "CB_0056"], fig: ["FIG_0198", "FIG_0202", "FIG_0203"] },
  },
  {
    pid: "J04",
    file: "J04-Jonah-2-10-3-10.md",
    book: "jonah",
    staId: "jonah_pericope_04_v2_0",
    bcvStart: /^Jonah 2:10/,
    blocks: 54,
    explicit: 67,
    implied: 25,
    registered: { cb: ["CB_0051", "CB_0057"], fig: ["FIG_0196", "FIG_0204"] },
  },
  {
    pid: "J05",
    file: "J05-Jonah-4-1-11.md",
    book: "jonah",
    staId: "jonah_pericope_05_v2_0",
    bcvStart: /^Jonah 4:1/,
    blocks: 44,
    explicit: 70,
    implied: 26,
    registered: { cb: ["CB_0011", "CB_0057", "CB_0058"], fig: ["FIG_0205", "FIG_0206"] },
  },
  {
    pid: "P07",
    file: "P07-Ruth-2-17-23.md",
    book: "ruth",
    staId: "ruth_pericope_07_v2_0",
    bcvStart: /^Ruth 2:17/,
    // SC-0064 (2026-06-12): 47→44 — O10 (Roasted Grain) coded in the P07 map 3C (the 2:18 leftover =
    // the 2:14 roasted grain); resolving the former __TODO__ placeholder drops its judgment gaps.
    blocks: 44,
    explicit: 40,
    implied: 24,
    registered: { cb: ["CB_0001", "CB_0011", "CB_0039", "CB_0041"], fig: ["FIG_0104", "FIG_0110", "FIG_0111", "FIG_0112"] },
  },
];

const judgmentField =
  /\/(scene_kind|scene_link|proposition_kind|book_context_ref|event_specific_slots)($|\/)|\/(beings_in_scene|objects_in_scene|places_in_scene|times_in_scene)\/entries($|\/)/;

for (const a of ANCHORS) {
  describe(`SC-0055 — ${a.pid} graduation anchor`, () => {
    const mm = readMeaningMap(join(MM_DIR, a.file));
    const { skeleton, gaps } = compileSkeleton(mm);

    it(`the graduated map parses as ${a.pid} and carries status complete`, () => {
      expect(mm.pericope).toBe(a.pid);
      expect(mm.bcv).toMatch(a.bcvStart);
      expect((skeleton as any).sta_id).toBe(a.staId);
      // the declared graduation edit: status draft → complete (the SC-0044 flip, the portal's filter)
      const raw = readFileSync(join(MM_DIR, a.file), "utf8");
      expect(raw).toMatch(/^status: "complete"$/m);
      expect(raw).not.toMatch(/^status: "draft"$/m);
    });

    it("L1 closed lists HOLD on the graduated fixture", () => {
      const pc = (skeleton as any).pericope_classification;
      expect(closedList("GENRE_GROUP")).toContain(pc.genre_group);
      expect(closedList("GENRE")).toContain(pc.genre);
      expect(closedList("REGISTER")).toContain(pc.register);
    });

    it(`the skeleton's only blocks are judgment fields — ZERO closed-axis; gap signature pinned at ${a.blocks}`, () => {
      const tmp = mkdtempSync(join(tmpdir(), `tripod-grad-${a.pid}-`));
      try {
        const mcPath = join(tmp, `${a.pid}-MEANING-COORDINATES.md`);
        const note =
          `---\ntype: "sta-meaning-coordinates"\npericope: "${a.pid}"\nstatus: "skeleton"\npilot: "pilot-2"\n---\n\n` +
          `# ${a.pid} — MEANING_COORDINATES (SKELETON — ${gaps.length} judgment gaps)\n\n` +
          "```json\n" +
          JSON.stringify(skeleton, null, 2) +
          "\n```\n";
        writeFileSync(mcPath, note);
        const r = validateArtifact(mcPath);
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
      const packet = loadSourcePacket(sourcePacketPath(a.book, a.pid));
      const led = reconcile(packet, skeleton as any, loadAliasTable(a.book));
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

describe("SC-0055 — J03 re-pins the versification convention on the fully divergent pericope", () => {
  const mm = readMeaningMap(join(MM_DIR, "J03-Jonah-2-2-9.md"));
  const { skeleton } = compileSkeleton(mm);

  it("scene verse_range is HEBREW; proposition verse_anchor is ENGLISH (the SC-0044 pin)", () => {
    const scenes = (skeleton as any).level_2_scenes;
    const props = (skeleton as any).level_3_propositions;
    // the psalm's scenes run Heb 2:3–2:10 while every prop anchor stays Eng 2:2–2:9
    expect(scenes[0].verse_range.startsWith("2:3")).toBe(true);
    expect(props[0].verse_anchor.startsWith("2:2")).toBe(true);
    const last = props[props.length - 1];
    expect(last.verse_anchor.startsWith("2:9")).toBe(true);
  });
});
