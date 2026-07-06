import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { loadSourcePacket, loadAliasTable, sourcePacketPath, loadCoverageExceptions } from "../src/reader/source-packet.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { reconcile, type CoverageLedger } from "../src/engine/coverage.js";

/**
 * Corpus-wide coverage acceptance over the full compiled Ruth pilot (P01–P06). Reconciles every
 * gold MEANING_COORDINATES against its pinned BHSA packet, applying the pinned reviewer sign-offs
 * (coverage-exceptions.json) exactly as `tripod coverage` does. (P07–P14 are not yet compiled — no
 * MEANING_COORDINATES — so they are out of scope until those pericopes are mapped.)
 */

const MC_DIR = "fixtures/meaning-coordinates";
const aliases = loadAliasTable("ruth");
const exceptions = loadCoverageExceptions();

function ledgerFor(pericope: string, exc = exceptions): CoverageLedger {
  const mc = readdirSync(MC_DIR).find((f) => f.startsWith(pericope) && f.endsWith(".md"))!;
  const packet = loadSourcePacket(sourcePacketPath("ruth", pericope));
  return reconcile(packet, readArtifactNote(join(MC_DIR, mc)).json as any, aliases, exc);
}

const PERICOPES = ["P01", "P02", "P03", "P04", "P05", "P06"];
const ledgers = Object.fromEntries(PERICOPES.map((p) => [p, ledgerFor(p)])) as Record<string, CoverageLedger>;

describe("corpus coverage — Ruth pilot P01–P06", () => {
  it("invents nothing across the whole corpus: 0 non-abstract unanchored entities anywhere", () => {
    for (const p of PERICOPES) {
      expect(ledgers[p]!.score.unanchored, `${p} unanchored`).toBe(0);
    }
  });

  it("all six pericopes are block-clean (every named referent accounted for or signed off)", () => {
    for (const p of PERICOPES) {
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

  it("the P06 'Israel' finding is REAL (raw run flags it) and ACCEPTED via the signed-off exception", () => {
    // raw (no exceptions): the text names Israel at 2:12 but the map tags no Israel entity → a block
    const raw = ledgerFor("P06", []);
    expect(raw.ok).toBe(false);
    const rawProper = raw.unmapped_source.filter((u) => u.subtag === "proper");
    expect(rawProper).toHaveLength(1);
    expect(rawProper[0]!.gloss).toBe("Israel");

    // with the pinned coverage-exceptions sign-off: downgraded to ACCEPTED, no longer blocking
    const p06 = ledgers.P06!;
    expect(p06.ok).toBe(true);
    expect(p06.score.accepted).toBe(1);
    const israel = p06.unmapped_source.find((u) => u.gloss === "Israel");
    expect(israel?.accepted?.reason).toBe("EPITHET_INTERNAL");
    expect(israel?.accepted?.accepted_by).toBe("Marcia Suzuki");
    expect(p06.blockers).toEqual([]);
  });

  it("corpus aggregate: 245 explicit referents, 245 accounted for (1 by exception), 0 hallucinations", () => {
    let total = 0, accounted = 0, unanchored = 0, accepted = 0;
    for (const p of PERICOPES) {
      const s = ledgers[p]!.score;
      total += s.explicit_total;
      accounted += s.explicit_total - s.proper_unmapped;
      unanchored += s.unanchored;
      accepted += s.accepted;
    }
    expect(total).toBe(245);
    expect(accounted).toBe(245); // Israel signed off ⇒ all accounted
    expect(unanchored).toBe(0);
    expect(accepted).toBe(1);
  });
});
