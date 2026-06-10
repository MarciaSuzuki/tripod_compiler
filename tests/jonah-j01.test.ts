import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  loadIdAlignmentExceptions,
} from "../src/reader/source-packet.js";
import { reconcile } from "../src/engine/coverage.js";
import { suggestReuse } from "../src/engine/concept-check.js";
import { lintMeaningMap } from "../src/engine/lint.js";
import { checkIdAlignment } from "../src/engine/id-align.js";

/**
 * SC-0038 — J01 graduation: the generality regression anchor.
 *
 * Jonah 1:1-3 is the first pericope of the first book the interlingua was NOT shaped around, and
 * "the L1 closed lists held on it" is the headline result of the Jonah arc (SC-0033–0037). J01's
 * FOR_MODEL is still a deterministic SKELETON (its judgment fields are unfilled `__TODO__`s awaiting
 * the Slice-4 drafter), so the graduated fixture is the MAP; this test is what guards the result —
 * it must BITE on a true generality regression (a J01 classification value falling out of the closed
 * lists, or a schema block landing on a closed-list axis) while staying quiet on the expected,
 * pinned judgment gaps. When the J01 FOR_MODEL is authored and graduates, the gap-inventory
 * assertions here are superseded deliberately (not silently).
 */

const here = dirname(fileURLToPath(import.meta.url));
const MM_DIR = join(here, "..", "fixtures", "meaning-map");
const MAP = join(MM_DIR, "J01-Jonah-1-1-3.md");

const mm = readMeaningMap(MAP);
const { skeleton, gaps } = compileSkeleton(mm);

// render the skeleton as a FOR_MODEL note (the exact `tripod compile --out` envelope) so the
// validator and the id-checker exercise the same artifact surface the CLI produces.
let tmp: string;
let fmPath: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "tripod-j01-"));
  fmPath = join(tmp, "J01-Jonah-1-1-3-FOR-MODEL.md");
  const note =
    `---\n` +
    `type: "sta-for-model"\n` +
    `pericope: "J01"\n` +
    `pericope-title: "${(mm.title ?? "").replace(/"/g, "'")}"\n` +
    `source-meaning-map: [[J01-Jonah-1-1-3]]\n` +
    `status: "skeleton"\n` +
    `pilot: "pilot-2"\n` +
    `---\n\n` +
    `# J01 — ${mm.bcv ?? ""} — FOR_MODEL (SKELETON — ${gaps.length} judgment gaps)\n\n` +
    "```json\n" +
    JSON.stringify(skeleton, null, 2) +
    "\n```\n";
  writeFileSync(fmPath, note);
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("SC-0038 — J01 (Jonah 1:1-3) graduation: the generality anchor", () => {
  it("the graduated map parses as J01 / Jonah 1:1–3", () => {
    expect(mm.pericope).toBe("J01");
    expect(mm.bcv).toMatch(/^Jonah 1:1/);
    expect(skeleton.sta_id).toBe("jonah_pericope_01_v2_0");
  });

  it("L1 closed lists HOLD — J01's classification uses only existing members (the headline invariant)", () => {
    const pc = (skeleton as any).pericope_classification;
    expect(closedList("GENRE_GROUP")).toContain(pc.genre_group);
    expect(closedList("GENRE")).toContain(pc.genre);
    expect(closedList("REGISTER")).toContain(pc.register);
  });

  it("the skeleton's only schema blocks are unfilled judgment fields — ZERO on any closed-list axis", () => {
    const r = validateArtifact(fmPath);
    expect(r.artifact).toBe("FOR_MODEL");
    const blocks = r.findings.filter((f) => f.severity === "block");

    // a TRUE generality regression: a block on the classification / speech_act axes.
    for (const b of blocks) {
      expect(b.location, `closed-list axis blocked: ${JSON.stringify(b)}`).not.toMatch(
        /pericope_classification|genre|register|speech_act/,
      );
    }

    // the expected gaps: every block lands on a known judgment field of the unfilled skeleton.
    const judgmentField =
      /\/(scene_kind|scene_link|proposition_kind|book_context_ref|event_specific_slots)($|\/)|\/beings_in_scene\/entries($|\/)/;
    for (const b of blocks) {
      expect(b.location, `block outside the known judgment-gap inventory: ${JSON.stringify(b)}`).toMatch(
        judgmentField,
      );
    }

    // the pinned gap state of the unfilled skeleton (23 measured at graduation, SC-0038). If this
    // moves, either the spec changed (look) or the FOR_MODEL began to be authored (graduate it).
    expect(blocks.length).toBe(23);
  });

  it("the entity layer anchors: 20/20 explicit referents accounted · 0 unanchored (frozen BHSA J01 packet)", () => {
    const packet = loadSourcePacket(sourcePacketPath("jonah", "J01"));
    const led = reconcile(packet, skeleton as any, loadAliasTable("jonah"));
    expect(led.ok).toBe(true);
    expect(led.score.explicit_total).toBe(20);
    expect(led.score.proper_unmapped).toBe(0); // ⇒ 20/20 accounted for
    expect(led.score.unanchored).toBe(0);
    expect(led.score.implied_flagged).toBe(7);
  });

  it("map ↔ skeleton entity IDs align against the JONAH alias table (book-aware id-check)", () => {
    const r = checkIdAlignment(MAP, fmPath, {
      exceptions: loadIdAlignmentExceptions(),
      noteResolveDirs: [MM_DIR],
      aliases: loadAliasTable("jonah"),
    });
    expect(r.ok).toBe(true);
    expect(r.counts.refErrors).toBe(0);
    expect(r.counts.nameErrors).toBe(0); // the 4 cast-note names aligned to the map's slugs (SC-0038)
    expect(r.counts.misalign).toBe(0);
    expect(r.counts.flagMismatch).toBe(0);
    expect(r.counts.dangling).toBe(0);
  });

  it("the five settled codes are registered canon-globally (Marcia's confirm 2026-06-09, mechanized)", () => {
    const cb = loadConceptRegistry();
    const fig = loadFigureRegistry();
    for (const code of ["CB_0051", "CB_0052"]) {
      expect(cb.entries[code], `${code} missing from the global Concept Bank`).toBeDefined();
      expect(cb.entries[code]!.appears_in).toContain("JONAH");
    }
    for (const code of ["FIG_0196", "FIG_0197", "FIG_0198"]) {
      expect(fig.entries[code], `${code} missing from the global Figure Registry`).toBeDefined();
      expect(fig.entries[code]!.appears_in).toContain("JONAH");
    }
  });

  it("the new-book guard stays quiet: Jonah introduces no near-duplicate of a canon concept/figure", () => {
    expect(suggestReuse(loadConceptRegistry(), "jonah")).toEqual([]);
    expect(suggestReuse(loadFigureRegistry(), "jonah")).toEqual([]);
  });

  it("the graduated map lints clean (Level-3 content discipline)", () => {
    const rep = lintMeaningMap(readFileSync(MAP, "utf8"), MAP);
    expect(rep.findings).toEqual([]);
  });
});
