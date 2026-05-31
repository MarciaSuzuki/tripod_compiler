import { describe, it, expect } from "vitest";
import { loadSourcePacket, loadAliasTable, sourcePacketPath } from "../src/reader/source-packet.js";
import { readArtifactNote } from "../src/reader/obsidian.js";
import { reconcile } from "../src/engine/coverage.js";

/**
 * Acceptance test (CLAUDE.md §Slice-1 pattern, applied to coverage): `tripod coverage` on a
 * known-good pilot-2 FOR_MODEL reconciled against the REAL frozen BHSA P01 packet → clean
 * (no blockers); on a deliberately corrupted copy → precise, located blockers.
 *
 * Inputs are the pinned, offline-frozen extracts (extractor/*.py → _spec/source + _spec/registry).
 */

const packet = loadSourcePacket(sourcePacketPath("ruth", "P01"));
const fm = readArtifactNote("fixtures/for-model/P01-Ruth-1-1-5-FOR-MODEL.md").json as any;
const aliases = loadAliasTable("ruth");

describe("coverage acceptance — real P01 (Ruth 1:1-5), known-good FOR_MODEL", () => {
  const led = reconcile(packet, fm, aliases);

  it("is clean: no blockers, no proper-noun omissions, no non-abstract unanchored entities", () => {
    expect(led.ok).toBe(true);
    expect(led.blockers).toEqual([]);
    expect(led.score.proper_unmapped).toBe(0);
    expect(led.score.unanchored).toBe(0);
  });

  it("reproduces the doc's headline: 47/47 explicit accounted for · 5 implied flagged · 0 unanchored", () => {
    expect(led.score.explicit_total).toBe(47);
    expect(led.score.proper_unmapped).toBe(0); // ⇒ 47/47 accounted for
    expect(led.score.implied_flagged).toBe(5);
    expect(led.score_line).toContain("47/47 explicit referents accounted for");
    expect(led.score_line).toContain("5 implied subjects flagged");
    expect(led.score_line).toContain("0 unanchored entities");
  });

  it("anchors every concrete (non-abstract) map entity in the pericope", () => {
    const concreteUnanchored = led.unanchored_entities.filter((e) => !e.abstract);
    expect(concreteUnanchored).toEqual([]);
    // the 9 beings + 3 places + 1 object + 1 time are all hosted
    for (const id of ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "PL1", "PL2", "PL_LAND_OF_JUDAH", "O1", "TM_PERIOD_OF_JUDGES"]) {
      expect(led.entities.find((e) => e.entity_id === id)?.anchored, id).toBe(true);
    }
  });

  it("resolves 'the land' (אָרֶץ, 1:1) to PL_LAND_OF_JUDAH via its אֶרֶץ alias — SC-0009 same-referent merge", () => {
    const land = led.matched.find((m) => m.gloss === "earth" && m.verse === "1:1a");
    expect(land?.entity_id).toBe("PL_LAND_OF_JUDAH");
    expect(land?.via).toBe("lexical");
    // PL_HA_ARETZ is retired — it must not appear anywhere in the reconciliation
    expect(led.entities.find((e) => e.entity_id === "PL_HA_ARETZ")).toBeUndefined();
  });

  it("routes the proper nouns to the right beings/places — incl. Kilion↔Chilion via consonantal Hebrew", () => {
    const by = new Map(led.matched.map((m) => [`${m.gloss}@${m.verse}`, m]));
    expect(by.get("Elimelech@1:2a")?.entity_id).toBe("B2");
    expect(by.get("Naomi@1:2a")?.entity_id).toBe("B3");
    expect(by.get("Mahlon@1:2a")?.entity_id).toBe("B4");
    expect(by.get("Kilion@1:2a")?.entity_id).toBe("B5"); // BHSA "Kilion" ↔ BCD "Chilion"
    expect(by.get("Orpah@1:4a")?.entity_id).toBe("B8");
    expect(by.get("Ruth@1:4a")?.entity_id).toBe("B9");
    expect(by.get("Moab@1:1b")?.entity_id).toBe("PL2");
    for (const [, m] of [...by].filter(([k]) => /Elimelech|Naomi|Mahlon|Kilion|Orpah|Ruth|Moab/.test(k))) {
      expect(m.via).toBe("name");
    }
  });

  it("maps unnamed participants via referential_form and lexical keys, the participle via lexical", () => {
    const m = led.matched;
    expect(m.find((x) => x.gloss === "man" && x.verse === "1:1b")?.entity_id).toBe("B2"); // UNNAMED_MAN
    expect(m.find((x) => x.gloss === "hunger")?.entity_id).toBe("O1"); // famine, lexical
    expect(m.find((x) => x.gloss === "judge")?.entity_id).toBe("B1"); // "the judges" participle
    expect(m.find((x) => x.gloss === "judge")?.referent_class).toBe("participle_substantival");
  });

  it("flags the 5 implied subjects, marking the two vayhi existentials as likely impersonal", () => {
    const implied = led.unmapped_source.filter((u) => u.subtag === "implied_subject");
    expect(implied).toHaveLength(5);
    const impersonal = implied.filter((u) => u.likely_impersonal);
    expect(impersonal).toHaveLength(2); // 1:1 vayhi + 1:2 vayihyu
    expect(impersonal.every((u) => u.gloss === "be")).toBe(true);
  });

  it("treats abstract TH_/CB_ overlays as soft (warn), never blockers", () => {
    expect(led.score.unanchored_abstract).toBeGreaterThan(0);
    expect(led.unanchored_entities.filter((e) => !e.abstract)).toEqual([]);
    expect(led.ok).toBe(true);
  });
});

describe("coverage acceptance — corrupted FOR_MODEL → precise blockers", () => {
  it("possible omission: dropping scene 3 (the marriages) flags Orpah + Ruth as unmapped named referents", () => {
    const tampered = structuredClone(fm);
    tampered.level_2_scenes = tampered.level_2_scenes.filter((s: any) => s.scene_id !== "S3");
    tampered.level_3_propositions = tampered.level_3_propositions.filter((p: any) => !String(p.verse_anchor).startsWith("1:4"));
    const led = reconcile(packet, tampered, aliases);
    expect(led.ok).toBe(false);
    const proper = led.unmapped_source.filter((u) => u.subtag === "proper").map((u) => u.gloss);
    expect(proper).toContain("Orpah");
    expect(proper).toContain("Ruth");
    expect(led.blockers.some((b) => b.includes("Ruth"))).toBe(true);
  });

  it("possible hallucination: a map entity outside the pericope's verses has nothing to host it", () => {
    const tampered = structuredClone(fm);
    tampered.level_2_scenes = [
      ...tampered.level_2_scenes,
      { scene_id: "SX", verse_range: "1:9", times_in_scene: { entries: [{ time_id: "TM_FABRICATED" }] } },
    ];
    const led = reconcile(packet, tampered, aliases);
    expect(led.ok).toBe(false);
    expect(led.score.unanchored).toBeGreaterThanOrEqual(1);
    const un = led.unanchored_entities.find((e) => e.entity_id === "TM_FABRICATED");
    expect(un?.abstract).toBe(false); // a real (TIME) entity, so it blocks
    expect(led.blockers.some((b) => b.includes("TM_FABRICATED"))).toBe(true);
  });
});
