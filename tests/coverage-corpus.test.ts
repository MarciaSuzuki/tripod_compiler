import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { loadSourcePacket, loadAliasTable, sourcePacketPath } from "../src/reader/source-packet.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { reconcile, type CoverageLedger } from "../src/engine/coverage.js";

/**
 * Corpus-wide coverage acceptance over the full compiled Ruth pilot (P01–P06). Reconciles every
 * gold FOR_MODEL against its pinned BHSA packet. (P07–P14 are not yet compiled — no FOR_MODEL — so
 * they are out of scope until those pericopes are mapped.)
 */

const FM_DIR = "fixtures/for-model";
const aliases = loadAliasTable("ruth");

function ledgerFor(pericope: string): CoverageLedger {
  const fm = readdirSync(FM_DIR).find((f) => f.startsWith(pericope) && f.endsWith(".md"))!;
  const packet = loadSourcePacket(sourcePacketPath("ruth", pericope));
  return reconcile(packet, readArtifactNote(join(FM_DIR, fm)).json as any, aliases);
}

const PERICOPES = ["P01", "P02", "P03", "P04", "P05", "P06"];
const ledgers = Object.fromEntries(PERICOPES.map((p) => [p, ledgerFor(p)])) as Record<string, CoverageLedger>;

describe("corpus coverage — Ruth pilot P01–P06", () => {
  it("invents nothing across the whole corpus: 0 non-abstract unanchored entities anywhere", () => {
    for (const p of PERICOPES) {
      expect(ledgers[p]!.score.unanchored, `${p} unanchored`).toBe(0);
    }
  });

  it("P01–P05 are block-clean (every explicit/named referent accounted for)", () => {
    for (const p of ["P01", "P02", "P03", "P04", "P05"]) {
      expect(ledgers[p]!.ok, `${p} ok`).toBe(true);
      expect(ledgers[p]!.score.proper_unmapped, `${p} proper_unmapped`).toBe(0);
      expect(ledgers[p]!.blockers, `${p} blockers`).toEqual([]);
    }
  });

  it("proper-noun name match is authoritative — YHWH resolves to B10 despite a mis-guessed alias gender", () => {
    // regression for the gender-veto bug: B10's heuristic alias gender is wrong ('f'), but a
    // consonantal name match (יהוה) must still bind YHWH → B10, not flag it as an omission.
    for (const p of ["P02", "P04", "P05", "P06"]) {
      const yhwh = ledgers[p]!.matched.filter((m) => m.gloss === "YHWH");
      expect(yhwh.length, `${p} YHWH matched`).toBeGreaterThan(0);
      expect(yhwh.every((m) => m.entity_id === "B10" && m.via === "name"), `${p} YHWH→B10 via name`).toBe(true);
      expect(ledgers[p]!.unmapped_source.some((u) => u.gloss === "YHWH" && u.subtag === "proper")).toBe(false);
    }
  });

  it("surfaces the one genuine corpus finding: 'Israel' (2:12) is named in the text but absent from the P06 map", () => {
    // KNOWN, SURFACED finding pending the project lead's ruling (tag PL_ISRAEL at 2:12, or rule the
    // 'God of Israel' epithet needs no separate entity). Update this assertion once resolved.
    const p06 = ledgers.P06!;
    expect(p06.ok).toBe(false);
    const proper = p06.unmapped_source.filter((u) => u.subtag === "proper");
    expect(proper).toHaveLength(1);
    expect(proper[0]!.gloss).toBe("Israel");
    expect(p06.blockers).toHaveLength(1);
  });

  it("corpus aggregate: 245 explicit referents, 244 accounted for, 0 hallucinations", () => {
    let total = 0, accounted = 0, unanchored = 0;
    for (const p of PERICOPES) {
      const s = ledgers[p]!.score;
      total += s.explicit_total;
      accounted += s.explicit_total - s.proper_unmapped;
      unanchored += s.unanchored;
    }
    expect(total).toBe(245);
    expect(accounted).toBe(244); // only 'Israel' in P06 unaccounted
    expect(unanchored).toBe(0);
  });
});
