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
  loadLintExceptions,
} from "../src/reader/source-packet.js";
import { reconcile } from "../src/engine/coverage.js";
import { suggestReuse } from "../src/engine/concept-check.js";
import { lintMeaningMap, applyLintExceptions } from "../src/engine/lint.js";
import { checkIdAlignment } from "../src/engine/id-align.js";

/**
 * SC-0044 — J02 graduation: the second Jonah generality anchor (the J01-anchor pattern, SC-0038).
 *
 * J02 (the storm, Jonah 1:4–2:1) is narrative test #2: Marcia ruled the map in four groups (SC-0040)
 * and the L1 closed lists HELD — including three moment-level register shifts, all inside the closed
 * 7. The FOR_MODEL stays a skeleton in `_working/J02/` until its judgment half is authored; the map
 * is the graduated fixture, and this test guards the result.
 *
 * This test also PINS the versification convention (the ruled pre-J03 rider): where English and
 * Hebrew verse numbering diverge (Jonah 2; later Psalms superscriptions etc.), the FOR_MODEL's
 * scene `verse_range` is HEBREW (BHSA-native — what coverage reconciles against the pinned packet),
 * while proposition `verse_anchor`s are ENGLISH (human-facing, like the map's bcv). J02's scene 5
 * is the first divergent case (Eng 1:17–2:1 = Heb 2:1–2); J03/J04 lean on this throughout.
 */

const here = dirname(fileURLToPath(import.meta.url));
const MM_DIR = join(here, "..", "fixtures", "meaning-map");
const MAP = join(MM_DIR, "J02-Jonah-1-4-2-1.md");

const mm = readMeaningMap(MAP);
const { skeleton, gaps } = compileSkeleton(mm);

let tmp: string;
let fmPath: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "tripod-j02-"));
  fmPath = join(tmp, "J02-Jonah-1-4-2-1-FOR-MODEL.md");
  const note =
    `---\n` +
    `type: "sta-for-model"\n` +
    `pericope: "J02"\n` +
    `pericope-title: "${(mm.title ?? "").replace(/"/g, "'")}"\n` +
    `source-meaning-map: [[J02-Jonah-1-4-2-1]]\n` +
    `status: "skeleton"\n` +
    `pilot: "pilot-2"\n` +
    `---\n\n` +
    `# J02 — ${mm.bcv ?? ""} — FOR_MODEL (SKELETON — ${gaps.length} judgment gaps)\n\n` +
    "```json\n" +
    JSON.stringify(skeleton, null, 2) +
    "\n```\n";
  writeFileSync(fmPath, note);
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("SC-0044 — J02 (Jonah 1:4–2:1) graduation: the storm anchor", () => {
  it("the graduated map parses as J02 / Jonah 1:4–2:1", () => {
    expect(mm.pericope).toBe("J02");
    expect(mm.bcv).toMatch(/^Jonah 1:4/);
    expect(skeleton.sta_id).toBe("jonah_pericope_02_v2_0");
  });

  it("L1 closed lists HOLD — classification + the three ruled register overrides are members", () => {
    const pc = (skeleton as any).pericope_classification;
    expect(closedList("GENRE_GROUP")).toContain(pc.genre_group);
    expect(closedList("GENRE")).toContain(pc.genre);
    expect(closedList("REGISTER")).toContain(pc.register);
    // the three moment-level shifts Marcia ruled (SC-0040 group A) are closed-list members
    for (const v of ["ELDER_AUTHORITY", "CONSULTATIVE", "RELIGIOUS_WORSHIP"]) {
      expect(closedList("REGISTER")).toContain(v);
    }
  });

  it("the versification convention holds (the ruled pre-J03 pin): scene verse_range = HEBREW, prop verse_anchor = ENGLISH", () => {
    const scenes = (skeleton as any).level_2_scenes;
    const props = (skeleton as any).level_3_propositions;
    // S1–S4: English == Hebrew (chapter 1) — both conventions coincide
    expect(scenes[0].verse_range).toBe("1:4-6");
    expect(scenes[3].verse_range).toBe("1:14-16");
    // S5 is the divergent case: heading "(1:17–2:1; Heb 2:1–2)" → machine range is the HEBREW
    expect(scenes[4].verse_range).toBe("2:1-2");
    // …while the prop anchors stay ENGLISH (human-facing): Eng 1:17 = Heb 2:1, Eng 2:1 = Heb 2:2
    expect(props[21].verse_anchor).toBe("1:17"); // P22 — the appointing
    expect(props[23].verse_anchor).toBe("2:1"); // P24 — the prayer begins
  });

  it("the skeleton's only schema blocks are unfilled judgment fields — ZERO on any closed-list axis", () => {
    const r = validateArtifact(fmPath);
    expect(r.artifact).toBe("FOR_MODEL");
    const blocks = r.findings.filter((f) => f.severity === "block");
    for (const b of blocks) {
      expect(b.location, `closed-list axis blocked: ${JSON.stringify(b)}`).not.toMatch(
        /pericope_classification|genre|register|speech_act/,
      );
    }
    const judgmentField =
      /\/(scene_kind|scene_link|proposition_kind|book_context_ref|event_specific_slots)($|\/)|\/beings_in_scene\/entries($|\/)/;
    for (const b of blocks) {
      expect(b.location, `block outside the judgment-gap inventory: ${JSON.stringify(b)}`).toMatch(judgmentField);
    }
    // the pinned gap state of the unfilled skeleton (54 measured at graduation, SC-0044). If this
    // moves: the spec changed (look), the reader changed (re-derive), or the FM began to be authored.
    expect(blocks.length).toBe(54);
  });

  it("the entity layer anchors: 79/79 explicit · 0 unanchored (frozen BHSA J02 packet)", () => {
    const packet = loadSourcePacket(sourcePacketPath("jonah", "J02"));
    const led = reconcile(packet, skeleton as any, loadAliasTable("jonah"));
    expect(led.ok).toBe(true);
    expect(led.score.explicit_total).toBe(79);
    expect(led.score.proper_unmapped).toBe(0);
    expect(led.score.unanchored).toBe(0);
    expect(led.score.implied_flagged).toBe(36);
  });

  it("map ↔ skeleton entity IDs align against the JONAH alias table (18-entity cast)", () => {
    const r = checkIdAlignment(MAP, fmPath, {
      exceptions: loadIdAlignmentExceptions(),
      noteResolveDirs: [MM_DIR],
      aliases: loadAliasTable("jonah"),
    });
    expect(r.ok).toBe(true);
    expect(r.counts.refErrors).toBe(0);
    expect(r.counts.nameErrors).toBe(0);
    expect(r.counts.misalign).toBe(0);
    expect(r.counts.flagMismatch).toBe(0);
    expect(r.counts.dangling).toBe(0);
    // the TH_ duration is the known unverifiable-by-registry class (accepted, like Ruth's TH_ codes)
    expect(r.unverifiable.every((u) => u.code.startsWith("TH_"))).toBe(true);
  });

  it("the SC-0040 codes are registered canon-globally (Marcia's groups C+D, mechanized)", () => {
    const cb = loadConceptRegistry();
    const fig = loadFigureRegistry();
    for (const code of ["CB_0052", "CB_0053", "CB_0054"]) {
      expect(cb.entries[code], `${code} missing`).toBeDefined();
      expect(cb.entries[code]!.appears_in).toContain("JONAH");
    }
    for (const code of ["FIG_0197", "FIG_0198", "FIG_0199", "FIG_0200", "FIG_0201"]) {
      expect(fig.entries[code], `${code} missing`).toBeDefined();
      expect(fig.entries[code]!.appears_in).toContain("JONAH");
    }
  });

  it("the new-book guard stays quiet for Jonah (Fear-of-YHWH ↔ Hand-of-YHWH is the documented sub-threshold case)", () => {
    expect(suggestReuse(loadConceptRegistry(), "jonah")).toEqual([]);
    expect(suggestReuse(loadFigureRegistry(), "jonah")).toEqual([]);
  });

  it("the graduated map lints to 0 drift with exactly the one signed-off TIME_PAIR", () => {
    const raw = lintMeaningMap(readFileSync(MAP, "utf8"), MAP);
    const rep = applyLintExceptions(raw, loadLintExceptions());
    const unaccepted = rep.findings.filter((f) => !(f as any).accepted);
    const accepted = rep.findings.filter((f) => (f as any).accepted);
    expect(unaccepted).toEqual([]);
    expect(accepted.length).toBe(1);
    expect(accepted[0]!.context).toContain("three days and three nights");
  });
});
