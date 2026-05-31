import { describe, it, expect } from "vitest";
import {
  reconcile,
  extractMentions,
  matchScore,
  consonantal,
  expandVerseRange,
  reduceVerse,
  entityKind,
  isAbstractEntity,
} from "../src/engine/coverage.js";
import type { Referent, SourcePacket, AliasTable, CoarseKind, Concern } from "../src/reader/source-packet.js";

// ───────────────────────── tiny builders ─────────────────────────

let rc = 0;
function ref(partial: Partial<Referent> & { surface: string; verse: string }): Referent {
  rc += 1;
  const cls = partial.referent_class ?? "common_noun";
  const concern: Concern =
    partial.concern ?? (cls === "implied_subject" ? "implied_subject" : cls === "proper_noun" || cls === "common_noun" || cls === "participle_substantival" ? "explicit" : "minor");
  const kinds: CoarseKind[] =
    partial.kind_candidates ??
    (cls === "proper_noun" ? ["PERSON"] : cls === "common_noun" ? ["PERSON", "PLACE", "THING", "TIME"] : ["PERSON", "THING"]);
  return {
    ref_id: partial.ref_id ?? `R${rc}`,
    verse: partial.verse,
    half_verse: partial.half_verse ?? `${partial.verse}a`,
    surface: partial.surface,
    lex: partial.lex ?? "",
    gloss: partial.gloss ?? "",
    pos: partial.pos ?? "subs",
    referent_class: cls,
    kind_candidates: kinds,
    referent_kind: kinds[0]!,
    nametype: partial.nametype ?? null,
    person: partial.person ?? null,
    number: partial.number ?? null,
    gender: partial.gender ?? null,
    is_implied_subject: cls === "implied_subject",
    concern,
    likely_impersonal: partial.likely_impersonal,
  };
}

function packet(referents: Referent[]): SourcePacket {
  return {
    schema: "tripod-source-packet", pericope: "PX", bcv: "Ruth 9:1-2", bhsa_version: "2021",
    extractor_version: "0.1.0", book: "RUTH", referents, verses: [], place_aliases: {}, counts: {},
  };
}

const ALIASES: AliasTable = {
  book: "RUTH",
  entities: {
    B2: { kind: "PERSON", english: "Elimelech", hebrew: "אֱלִימֶלֶךְ", hebrew_cons: "אלימלך", referential_forms: ["UNNAMED_MAN_FROM_BETHLEHEM"], gender: "m" },
    B3: { kind: "PERSON", english: "Naomi", hebrew: "נָעֳמִי", hebrew_cons: "נעמי", referential_forms: ["UNNAMED_WIFE_OF_HEAD"], gender: "f" },
    B5: { kind: "PERSON", english: "Chilion", hebrew: "כִלְיוֹן", hebrew_cons: "כליון", referential_forms: [], gender: "m" },
    PL1: { kind: "PLACE", english: "Bethlehem of Judah", hebrew: "בֵּית לֶחֶם יְהוּדָה", hebrew_cons: "ביתלחםיהודה", referential_forms: [], gender: null },
    O1: { kind: "THING", english: "Famine", hebrew: "רָעָב", hebrew_cons: "רעב", referential_forms: [], gender: null },
  },
};

// ───────────────────────── unit helpers ─────────────────────────

describe("helpers", () => {
  it("strips niqqud/cantillation to bare consonants", () => {
    expect(consonantal("כִלְיֹ֑ון")).toBe("כליון");
    expect(consonantal("בֵּ֧ית לֶ֣חֶם")).toBe("ביתלחם");
  });
  it("expands verse ranges and reduces sub-verse anchors", () => {
    expect(expandVerseRange("1:1-2")).toEqual(["1:1", "1:2"]);
    expect(expandVerseRange("1:3")).toEqual(["1:3"]);
    expect(reduceVerse("1:5b")).toBe("1:5");
  });
  it("derives entity kind + abstractness from id", () => {
    expect(entityKind("B2")).toBe("PERSON");
    expect(entityKind("PL_HA_ARETZ")).toBe("PLACE");
    expect(entityKind("O1")).toBe("THING");
    expect(entityKind("TM_X")).toBe("TIME");
    expect(entityKind("given_name")).toBeNull();
    expect(isAbstractEntity("TH_FOO")).toBe(true);
    expect(isAbstractEntity("CB_0030")).toBe(true);
    expect(isAbstractEntity("O1")).toBe(false);
  });
});

describe("matchScore", () => {
  const mention = (id: string, over: Partial<ReturnType<typeof extractMentions>[number]> = {}) =>
    ({ entity_id: id, kind: entityKind(id)!, abstract: isAbstractEntity(id), verses: ["1:1"], referential_forms: [], presences: [], roles: [], sources: [], ...over });

  it("matches a proper noun ONLY to the entity bearing that name (consonantal)", () => {
    const kilion = ref({ surface: "כִלְיֹ֑ון", referent_class: "proper_noun", gender: "m", verse: "1:1" });
    expect(matchScore(kilion, mention("B5"), ALIASES.entities.B5)!.via).toBe("name"); // Kilion ↔ Chilion via כליון
    expect(matchScore(kilion, mention("B2"), ALIASES.entities.B2)).toBeNull(); // not Elimelech
  });
  it("maps an unnamed common noun via a referential_form keyword", () => {
    const man = ref({ surface: "אִישׁ", gloss: "man", gender: "m", verse: "1:1" });
    const s = matchScore(man, mention("B2", { referential_forms: ["UNNAMED_MAN_FROM_BETHLEHEM"] }), ALIASES.entities.B2);
    expect(s!.via).toBe("referential_form");
    expect(s!.score).toBeGreaterThanOrEqual(30);
  });
  it("blocks a gender-contradicting match", () => {
    const man = ref({ surface: "אִישׁ", gloss: "man", gender: "m", verse: "1:1" });
    expect(matchScore(man, mention("B3"), ALIASES.entities.B3)).toBeNull(); // masculine noun ✗ Naomi (f)
  });
  it("matches a common noun to its lexical entity (famine→O1)", () => {
    const famine = ref({ surface: "רָעָב", gloss: "hunger", verse: "1:1" });
    expect(matchScore(famine, mention("O1"), ALIASES.entities.O1)!.via).toBe("lexical");
  });
  it("matches a referent against a surface hebrew alias, not just the primary hebrew (SC-0009)", () => {
    // PL_LAND_OF_JUDAH primary = אֶרֶץ יְהוּדָה; "the land" (אָרֶץ) matches only via the אֶרֶץ alias
    const land = ref({ surface: "אָ֑רֶץ", gloss: "earth", verse: "1:1" });
    const alias = { kind: "PLACE" as const, english: "the land of Judah", hebrew: "אֶרֶץ יְהוּדָה", hebrew_cons: "ארץיהודה", hebrew_cons_aliases: ["ארץ", "הארץ"], referential_forms: ["THE_LAND_AFFLICTED_BY_FAMINE"], gender: null };
    const s = matchScore(land, mention("PL_LAND_OF_JUDAH"), alias);
    expect(s!.via).toBe("lexical");
    expect(s!.score).toBeGreaterThanOrEqual(30);
  });
});

// ───────────────────────── M-extraction ─────────────────────────

describe("extractMentions", () => {
  it("pulls beings/places/objects from scenes (verse-range expanded) and prop slots", () => {
    const fm = {
      level_2_scenes: [
        {
          scene_id: "S1", verse_range: "1:1-2",
          beings_in_scene: { entries: [{ being_id: "B2", referential_form: "UNNAMED_MAN_FROM_BETHLEHEM", presence: "PRESENT" }] },
          places_in_scene: { entries: [{ place_id: "PL1" }] },
          objects_in_scene: { entries: [{ object_id: "O1" }] },
          times_in_scene: { entries: null },
        },
      ],
      level_3_propositions: [
        { prop_id: "P3", verse_anchor: "1:1b", event_specific_slots: { household_head: "B2", accompanying_household: ["B3"], origin: "PL1" } },
      ],
    };
    const m = extractMentions(fm);
    const byId = Object.fromEntries(m.map((x) => [x.entity_id, x]));
    expect(byId.B2.verses.sort()).toEqual(["1:1", "1:2"]);
    expect(byId.B2.referential_forms).toContain("UNNAMED_MAN_FROM_BETHLEHEM");
    expect(byId.B3.verses).toEqual(["1:1"]); // from the proposition anchor only
    expect(byId.O1.kind).toBe("THING");
    expect(m.find((x) => x.entity_id === "given_name")).toBeUndefined(); // non-ids ignored
  });
});

// ───────────────────────── reconcile: the three buckets ─────────────────────────

function fmWith(scenes: any[], props: any[] = []) {
  return { level_2_scenes: scenes, level_3_propositions: props };
}

describe("reconcile — clean pericope", () => {
  const p = packet([
    ref({ surface: "אֱלִימֶ֡לֶךְ", gloss: "Elimelech", referent_class: "proper_noun", gender: "m", verse: "1:1" }),
    ref({ surface: "נָעֳמִ֜י", gloss: "Naomi", referent_class: "proper_noun", gender: "f", verse: "1:1" }),
    ref({ surface: "אִ֜ישׁ", gloss: "man", gender: "m", verse: "1:1" }),
    ref({ surface: "רָעָ֖ב", gloss: "hunger", verse: "1:1" }),
    ref({ surface: "בֵּ֥ית לֶ֖חֶם", gloss: "Bethlehem", referent_class: "proper_noun", kind_candidates: ["PLACE"], verse: "1:1" }),
  ]);
  const fm = fmWith([
    {
      scene_id: "S1", verse_range: "1:1",
      beings_in_scene: { entries: [
        { being_id: "B2", referential_form: "UNNAMED_MAN_FROM_BETHLEHEM", presence: "PRESENT" },
        { being_id: "B3", referential_form: "UNNAMED_WIFE_OF_HEAD", presence: "PRESENT" },
      ] },
      places_in_scene: { entries: [{ place_id: "PL1" }] },
      objects_in_scene: { entries: [{ object_id: "O1" }] },
      times_in_scene: { entries: null },
    },
  ]);
  const led = reconcile(p, fm, ALIASES);

  it("matches all explicit referents and blocks nothing", () => {
    expect(led.ok).toBe(true);
    expect(led.blockers).toEqual([]);
    expect(led.score.proper_unmapped).toBe(0);
    expect(led.score.unanchored).toBe(0);
    expect(led.score.explicit_matched).toBe(5);
  });
  it("routes each referent to the right entity", () => {
    const by = Object.fromEntries(led.matched.map((m) => [m.gloss, m.entity_id]));
    expect(by.Elimelech).toBe("B2"); // proper via name
    expect(by.Naomi).toBe("B3");
    expect(by.man).toBe("B2"); // common via referential_form keyword
    expect(by.hunger).toBe("O1"); // common via lexical
    expect(by.Bethlehem).toBe("PL1");
  });
});

describe("reconcile — possible omission (proper noun absent from map)", () => {
  const p = packet([
    ref({ surface: "בֹּ֫עַז", gloss: "Boaz", referent_class: "proper_noun", gender: "m", verse: "1:1" }),
    ref({ surface: "נָעֳמִ֜י", gloss: "Naomi", referent_class: "proper_noun", gender: "f", verse: "1:1" }),
  ]);
  // map has Naomi but NOT Boaz, though B2 (a male) is present → Boaz must still be flagged
  const fm = fmWith([
    { scene_id: "S1", verse_range: "1:1", beings_in_scene: { entries: [{ being_id: "B2", presence: "PRESENT" }, { being_id: "B3", presence: "PRESENT" }] } },
  ]);
  const led = reconcile(p, fm, ALIASES);
  it("flags the unmapped named referent as a blocker", () => {
    expect(led.ok).toBe(false);
    expect(led.score.proper_unmapped).toBe(1);
    const boaz = led.unmapped_source.find((u) => u.gloss === "Boaz");
    expect(boaz?.subtag).toBe("proper");
    expect(led.blockers.some((b) => b.includes("Boaz"))).toBe(true);
  });
  it("does not let a present male (B2) silently absorb the name", () => {
    expect(led.matched.find((m) => m.gloss === "Boaz")).toBeUndefined();
  });
});

describe("reconcile — possible hallucination (unanchored entity)", () => {
  const p = packet([ref({ surface: "בֹּ֫עַז", gloss: "Boaz", referent_class: "proper_noun", gender: "m", verse: "1:2" })]);
  // map invents a TIME entity at 1:2 where the only source expression is a person's proper noun
  const fm = fmWith([
    { scene_id: "S1", verse_range: "1:2", times_in_scene: { entries: [{ time_id: "TM_INVENTED" }] }, beings_in_scene: { entries: [{ being_id: "B13", presence: "PRESENT" }] } },
  ]);
  const led = reconcile(p, fm, { book: "RUTH", entities: { ...ALIASES.entities, B13: { kind: "PERSON", english: "Boaz", hebrew: "בֹּעַז", hebrew_cons: "בעז", referential_forms: [], gender: "m" } } });
  it("blocks the TIME entity that nothing in the text can host", () => {
    const un = led.unanchored_entities.find((e) => e.entity_id === "TM_INVENTED");
    expect(un).toBeTruthy();
    expect(led.score.unanchored).toBe(1);
    expect(led.ok).toBe(false);
  });
  it("still anchors the correctly-named person (B13 ↔ Boaz)", () => {
    expect(led.entities.find((e) => e.entity_id === "B13")!.anchored).toBe(true);
  });
});

describe("reconcile — implied subjects + abstract overlays", () => {
  const p = packet([
    ref({ surface: "יְהִ֗י", gloss: "be", referent_class: "implied_subject", person: "p3", number: "sg", gender: "m", verse: "1:1", likely_impersonal: true }),
    ref({ surface: "יָּבֹ֥אוּ", gloss: "come", referent_class: "implied_subject", person: "p3", number: "pl", gender: "m", verse: "1:1" }),
    ref({ surface: "רָעָ֖ב", gloss: "hunger", verse: "1:1" }),
  ]);
  const fm = fmWith([
    {
      scene_id: "S1", verse_range: "1:1",
      beings_in_scene: { entries: [{ being_id: "B2", presence: "PRESENT" }] },
      objects_in_scene: { entries: [{ object_id: "O1" }, { object_id: "TH_WAYHI_FORMULA" }, { object_id: "CB_0030" }] },
    },
  ]);
  const led = reconcile(p, fm, ALIASES);
  it("always flags implied subjects (with the impersonal hint) and never blocks on them", () => {
    expect(led.score.implied_flagged).toBe(2);
    const vayhi = led.unmapped_source.find((u) => u.gloss === "be");
    expect(vayhi?.subtag).toBe("implied_subject");
    expect(vayhi?.likely_impersonal).toBe(true);
  });
  it("does not block on unanchored ABSTRACT overlays (TH_/CB_)", () => {
    // TH_WAYHI_FORMULA and CB_0030 have no concrete host, but are interpretive ⇒ soft
    expect(led.score.unanchored).toBe(0); // non-abstract only
    expect(led.score.unanchored_abstract).toBeGreaterThanOrEqual(1);
    expect(led.ok).toBe(true);
  });
});

describe("reconcile — reviewer-accepted exceptions downgrade blockers", () => {
  it("accepts an UNMAPPED_SOURCE proper-noun omission by (gloss, verse-prefix)", () => {
    // "man" hosts+maps B2 (so B2 isn't unanchored); Boaz is the one omission blocker.
    const p = packet([
      ref({ surface: "אִ֜ישׁ", gloss: "man", gender: "m", verse: "1:1" }),
      ref({ surface: "בֹּ֫עַז", gloss: "Boaz", referent_class: "proper_noun", gender: "m", verse: "1:1" }),
    ]);
    const fm = { level_2_scenes: [{ scene_id: "S1", verse_range: "1:1", beings_in_scene: { entries: [{ being_id: "B2", referential_form: "UNNAMED_MAN_FROM_BETHLEHEM" }] } }], level_3_propositions: [] };
    const blocked = reconcile(p, fm, ALIASES, []);
    expect(blocked.ok).toBe(false);
    expect(blocked.blockers).toHaveLength(1); // only Boaz
    const accepted = reconcile(p, fm, ALIASES, [
      { pericope: "PX", kind: "UNMAPPED_SOURCE", gloss: "Boaz", verse: "1:1", reason: "EPITHET_INTERNAL", accepted_by: "tester" },
    ]);
    expect(accepted.ok).toBe(true);
    expect(accepted.score.accepted).toBe(1);
    expect(accepted.score.proper_unmapped).toBe(0);
    expect(accepted.unmapped_source.find((u) => u.gloss === "Boaz")?.accepted?.reason).toBe("EPITHET_INTERNAL");
  });

  it("accepts an UNANCHORED_ENTITY by entity_id, and ignores a non-matching exception", () => {
    // a pronoun (minor, can't host a TIME entity, never itself a blocker) leaves TM_INVENTED as the lone blocker
    const p = packet([ref({ surface: "ה֥וּא", gloss: "he", referent_class: "pronoun", verse: "1:2" })]);
    const fm = { level_2_scenes: [{ scene_id: "S1", verse_range: "1:2", times_in_scene: { entries: [{ time_id: "TM_INVENTED" }] } }], level_3_propositions: [] };
    expect(reconcile(p, fm, ALIASES, []).ok).toBe(false);
    expect(reconcile(p, fm, ALIASES, [{ pericope: "PX", kind: "UNANCHORED_ENTITY", entity_id: "TM_OTHER", reason: "x" }]).ok).toBe(false); // wrong id
    const accepted = reconcile(p, fm, ALIASES, [{ pericope: "PX", kind: "UNANCHORED_ENTITY", entity_id: "TM_INVENTED", reason: "ACCEPTED_SETTING" }]);
    expect(accepted.ok).toBe(true);
    expect(accepted.unanchored_entities.find((e) => e.entity_id === "TM_INVENTED")?.accepted?.reason).toBe("ACCEPTED_SETTING");
  });
});
