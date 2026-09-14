import { describe, expect, it } from "vitest";
import {
  buildReport,
  describeSpan,
  formatPercent,
  formatReportDate,
  formatSeconds,
  reportToJson,
  reportToMarkdown,
  type ReportData,
} from "../src/export/report";
import { LANGS, translate, type Lang } from "../src/i18n";
import { compareTapes, regionKey, type Comment, type PairRecord, type Passage, type Tape, type Verdict, type Version } from "../src/model";
import { comment, settings, tape } from "./helpers";

// A: speech 0..20 (u1), pause 20..30, speech 30..50 (u2), speech 50..70 (u3)
// B: speech 0..20 (u1), pause 20..30, speech 30..50 (u9), speech 50..70 (u3), speech 70..90 (u4)
// → regions: 0 = substituted (a 30..50, b 30..50); 1 = inserted (a point 70, b 70..90)
// → stability: 50 matched B frames of 90 = 55.6 %
const tapeA = tape([
  [1, 20],
  [49, 10],
  [2, 20],
  [3, 20],
]);
const tapeB = tape([
  [1, 20],
  [49, 10],
  [9, 20],
  [3, 20],
  [4, 20],
]);

const hex = (seed: string) => seed.repeat(64).slice(0, 64);

function version(id: string, label: string, t: Tape, extra: Partial<Version> = {}): Version {
  return {
    id,
    passage_id: "p1",
    label,
    meta: {},
    tape: t,
    audio: new Blob([]),
    tape_sha256: hex(id.toLowerCase() + "1"),
    audio_sha256: hex(id.toLowerCase() + "2"),
    imported_at: "2026-01-02T00:00:00Z",
    ...extra,
  };
}

const passage: Passage = { id: "p1", title: "Ruth 1:1-5", created_at: "2026-01-01T00:00:00Z", version_ids: ["A", "B"] };
const a = version("A", "v1", tapeA, {
  meta: { narrator: "Ana", recorded_at: "2026-03-04T10:30:00Z", language: "Kaingang" },
  tape: { ...tapeA, mock: true },
});
const b = version("B", "v2 (revisão)", tapeB, { meta: { narrator: "Bento" } });

const changed: Comment = { ...comment("A", 30, 50), id: "c-changed", text: "Trocar | esta palavra" };
const untouched: Comment = { ...comment("A", 0, 10), id: "c-untouched", text: "Repetir\ncom calma" };
const spoken: Comment = { ...comment("A", 50, 60), id: "c-spoken", text: undefined, audio_blob: new Blob(["x"]) };
const note: Comment = { ...comment("A", 0, 10, "note"), id: "c-note" };
const commentsA = [changed, untouched, spoken, note];

const result = compareTapes(tapeA, tapeB, commentsA, "B", settings);
const GENERATED_AT = "2026-09-14T07:00:00.000Z";

function build(pair?: PairRecord): ReportData {
  return buildReport({ passage, a, b, result, pair, settings, generated_at: GENERATED_AT });
}

describe("fixture sanity", () => {
  it("has the expected regions and carried comments", () => {
    expect(result.regions.map((r) => r.kind)).toEqual(["substituted", "inserted"]);
    expect(result.carried.map((c) => c.outcome)).toEqual(["changed_here", "no_change_detected", "no_change_detected"]);
    expect(result.summary.stability).toBe(55.6);
  });
});

describe("buildReport", () => {
  const r = build();

  it("carries the passage, both versions and the app block", () => {
    expect(r.generated_at).toBe(GENERATED_AT);
    expect(r.passage).toBe("Ruth 1:1-5");
    expect(r.a).toEqual({
      label: "v1",
      tape_sha256: a.tape_sha256,
      audio_sha256: a.audio_sha256,
      mock: true,
      narrator: "Ana",
      recorded_at: "2026-03-04T10:30:00Z",
      language: "Kaingang",
    });
    expect(r.b).toEqual({
      label: "v2 (revisão)",
      tape_sha256: b.tape_sha256,
      audio_sha256: b.audio_sha256,
      mock: false,
      narrator: "Bento",
    });
    expect(r.codebook_hash).toBe(tapeA.codebook_hash);
    expect(r.app).toEqual({ name: "Bead Compare", format_version: 1 });
  });

  it("copies the summary numbers and the settings", () => {
    expect(r.stability).toBe(55.6);
    expect(r.region_count).toBe(2);
    expect(r.changed_seconds).toBeCloseTo(0.8, 9);
    expect(r.settings).toEqual(settings);
    expect(r.settings).not.toBe(settings);
  });

  it("turns region frames into seconds with each tape's frame rate", () => {
    expect(r.regions).toHaveLength(2);
    expect(r.regions[0]).toEqual({
      index: 0,
      kind: "substituted",
      a_start_s: 0.6,
      a_end_s: 1,
      b_start_s: 0.6,
      b_end_s: 1,
      verdict: "undecided",
    });
    expect(r.regions[1].index).toBe(1);
    expect(r.regions[1].kind).toBe("inserted");
    expect(r.regions[1].a_start_s).toBeCloseTo(1.4, 9);
    expect(r.regions[1].a_end_s).toBeCloseTo(1.4, 9);
    expect(r.regions[1].b_start_s).toBeCloseTo(1.4, 9);
    expect(r.regions[1].b_end_s).toBeCloseTo(1.8, 9);
  });

  it("uses B's own frame rate for the B side", () => {
    const tapeB100 = tape(
      [
        [1, 20],
        [49, 10],
        [9, 20],
        [3, 20],
        [4, 20],
      ],
      { frame_rate: 100 },
    );
    const b100 = version("B", "v2", tapeB100);
    const res = compareTapes(tapeA, tapeB100, [changed], "B", settings);
    const rep = buildReport({ passage, a, b: b100, result: res, settings, generated_at: GENERATED_AT });
    expect(rep.regions[0].a_start_s).toBe(0.6);
    expect(rep.regions[0].b_start_s).toBe(0.3);
    expect(rep.regions[0].b_end_s).toBe(0.5);
    expect(rep.carried[0].a_start_s).toBe(0.6);
    expect(rep.carried[0].b_start_s).toBe(0.3);
  });

  it("defaults the verdict to undecided and picks up stored verdicts by region key", () => {
    const pair: PairRecord = {
      id: "A::B",
      passage_id: "p1",
      a_version_id: "A",
      b_version_id: "B",
      verdicts: {
        [regionKey(result.regions[1])]: "unrequested_problem",
        [regionKey(result.regions[0])]: "bogus" as Verdict,
      },
      updated_at: GENERATED_AT,
    };
    const withPair = build(pair);
    expect(withPair.regions.map((x) => x.verdict)).toEqual(["undecided", "unrequested_problem"]);
    expect(build().regions.map((x) => x.verdict)).toEqual(["undecided", "undecided"]);
    expect(build({ ...pair, verdicts: {} }).regions.map((x) => x.verdict)).toEqual(["undecided", "undecided"]);
  });

  it("lists the carried fix requests with their outcome, audio flag and both spans", () => {
    expect(r.carried).toHaveLength(3);
    expect(r.carried[0]).toEqual({
      comment_id: "c-changed",
      author: "test",
      kind: "fix_requested",
      text: "Trocar | esta palavra",
      has_audio: false,
      a_start_s: 0.6,
      a_end_s: 1,
      b_start_s: 0.6,
      b_end_s: 1,
      outcome: "changed_here",
    });
    expect(r.carried[1].comment_id).toBe("c-untouched");
    expect(r.carried[1].outcome).toBe("no_change_detected");
    expect(r.carried[1].a_start_s).toBe(0);
    expect(r.carried[1].a_end_s).toBe(0.2);
    expect(r.carried[2].comment_id).toBe("c-spoken");
    expect(r.carried[2].has_audio).toBe(true);
    expect(r.carried[2].text).toBeUndefined();
    expect("text" in r.carried[2]).toBe(false);
    // the note is not a fix request and is not carried
    expect(r.carried.map((c) => c.comment_id)).not.toContain("c-note");
  });
});

describe("reportToMarkdown", () => {
  const r = build({
    id: "A::B",
    passage_id: "p1",
    a_version_id: "A",
    b_version_id: "B",
    verdicts: { [regionKey(result.regions[0])]: "requested_fix_confirmed" },
    updated_at: GENERATED_AT,
  });

  it.each(LANGS as readonly Lang[])("%s: renders every part of the report", (lang) => {
    const md = reportToMarkdown(r, lang);
    const lines = md.split("\n");

    expect(lines[0]).toBe("# Bead Compare — Ruth 1:1-5");
    expect(md).toContain("v1");
    expect(md).toContain("v2 (revisão)");
    expect(md).toContain("Ana");
    expect(md).toContain("Bento");
    expect(md).toContain(formatPercent(55.6, lang));
    expect(md).not.toContain("undefined");
    expect(md).not.toContain("null");

    // headings are translated
    expect(md).toContain(`## ${translate(lang, "report.facts.title")}`);
    expect(md).toContain(`## ${translate(lang, "report.summary.title")}`);
    expect(md).toContain(`## ${translate(lang, "report.regions.title")}`);
    expect(md).toContain(`## ${translate(lang, "report.carried.title")}`);
    expect(md).toContain(`## ${translate(lang, "report.footer.title")}`);

    // one row per region, numbered from 1, with kind and verdict
    const regionRows = lines.filter((l) => /^\| \d+ \|/.test(l));
    expect(regionRows).toHaveLength(2);
    expect(regionRows[0]).toContain(translate(lang, "common.region.substituted"));
    expect(regionRows[0]).toContain(translate(lang, "common.verdict.requested_fix_confirmed"));
    expect(regionRows[0]).toContain("0:00.6 – 0:01.0");
    expect(regionRows[1]).toContain(translate(lang, "common.region.inserted"));
    expect(regionRows[1]).toContain(translate(lang, "common.verdict.undecided"));
    expect(regionRows[1]).toContain(translate(lang, "report.regions.point", { time: "0:01.4" }));
    expect(regionRows[1]).toContain("0:01.4 – 0:01.8");

    // one row per carried comment, with the outcome and the audio flag
    const carriedRows = lines.filter((l) => l.startsWith("| test |"));
    expect(carriedRows).toHaveLength(3);
    expect(carriedRows[0]).toContain(translate(lang, "common.carry.changed_here"));
    expect(carriedRows[1]).toContain(translate(lang, "common.carry.no_change_detected"));
    expect(carriedRows[2]).toContain(`| ${translate(lang, "report.carried.audio_yes")} |`);
    expect(carriedRows[0]).toContain(`| ${translate(lang, "report.carried.audio_no")} |`);
    expect(md).toContain(translate(lang, "report.carried.warning"));

    // hashes, short and full; the mock note; the settings used
    expect(md).toContain(a.tape_sha256.slice(0, 8));
    expect(md).toContain(a.tape_sha256);
    expect(md).toContain(b.audio_sha256);
    expect(md).toContain(tapeA.codebook_hash);
    expect(md).toContain(translate(lang, "report.facts.mock"));
    expect(md).toContain(translate(lang, "common.settings.min_cluster_frames"));
    expect(md).toContain(translate(lang, "common.settings.melody_threshold"));
  });

  it("escapes pipes and collapses newlines inside table cells", () => {
    const md = reportToMarkdown(r, "pt-BR");
    expect(md).toContain("Trocar \\| esta palavra");
    expect(md).not.toContain("Trocar | esta");
    expect(md).toContain("| Repetir com calma |");
    // every table row has the same number of cells as its header
    const rows = md.split("\n").filter((l) => l.startsWith("|"));
    const cellsOf = (l: string) => l.replace(/\\\|/g, " ").split("|").length;
    let width = 0;
    for (const row of rows) {
      if (/^\| --- /.test(row)) continue;
      const n = cellsOf(row);
      if (row.startsWith("| #") || row.startsWith("| Autor") || row.startsWith("| Versão")) width = n;
      expect(n, row).toBe(width);
    }
  });

  it("reads naturally in each language", () => {
    const pt = reportToMarkdown(r, "pt-BR");
    const en = reportToMarkdown(r, "en");
    expect(pt).toContain("## Regiões");
    expect(pt).toContain("55,6%");
    expect(pt).toContain("0,8 s");
    expect(en).toContain("## Regions");
    expect(en).toContain("55.6%");
    expect(en).toContain("0.8 s");
  });

  it("says so when there are no regions and no carried comments", () => {
    const same = compareTapes(tapeA, tapeA, [], "B", settings);
    const rep = buildReport({ passage, a, b: version("B", "v1 again", tapeA), result: same, settings, generated_at: GENERATED_AT });
    const md = reportToMarkdown(rep, "pt-BR");
    expect(rep.regions).toEqual([]);
    expect(md).toContain(translate("pt-BR", "report.summary.no_regions"));
    expect(md).toContain(translate("pt-BR", "report.carried.empty"));
    expect(md).toContain("100%");
    expect(md).not.toContain("undefined");
  });

  it("shows a dash for missing narrator, date and language", () => {
    const bare = buildReport({
      passage,
      a: version("A", "v1", tapeA),
      b: version("B", "v2", tapeB),
      result,
      settings,
      generated_at: GENERATED_AT,
    });
    const md = reportToMarkdown(bare, "en");
    expect(md).toContain("- Narrator: —");
    expect(md).toContain("- Recorded: —");
    expect(md).toContain("- Language: —");
    expect(md).not.toContain("undefined");
  });
});

describe("reportToJson", () => {
  it("round-trips through JSON.parse", () => {
    const r = build();
    const json = reportToJson(r);
    expect(json).toContain("\n  ");
    const back = JSON.parse(json) as ReportData;
    expect(back).toEqual(r);
    expect(back.app.format_version).toBe(1);
    expect(back.regions[1].verdict).toBe("undecided");
  });
});

describe("formatting helpers", () => {
  it("formats seconds and percents per language", () => {
    expect(formatSeconds(1.84, "pt-BR")).toBe("1,8");
    expect(formatSeconds(1.84, "en")).toBe("1.8");
    expect(formatSeconds(NaN, "en")).toBe("0.0");
    expect(formatPercent(87.5, "pt-BR")).toBe("87,5%");
    expect(formatPercent(87.5, "en")).toBe("87.5%");
    expect(formatPercent(100, "en")).toBe("100%");
    expect(formatPercent(250, "en")).toBe("100%");
  });

  it("describes spans and points as m:ss.s", () => {
    expect(describeSpan(0.6, 1, "en")).toBe("0:00.6 – 0:01.0");
    expect(describeSpan(1.4, 1.4, "en")).toBe("at 0:01.4");
    expect(describeSpan(1.4, 1.4, "pt-BR")).toBe("em 0:01.4");
    expect(describeSpan(2, 1, "en")).toBe("at 0:02.0");
  });

  it("formats dates for people and leaves bare or odd values as written", () => {
    expect(formatReportDate(undefined, "en")).toBeUndefined();
    expect(formatReportDate("", "en")).toBeUndefined();
    expect(formatReportDate("2026-03-04", "en")).toBe("2026-03-04");
    expect(formatReportDate("sometime in March", "en")).toBe("sometime in March");
    const formatted = formatReportDate("2026-03-04T10:30:00Z", "en");
    expect(formatted).toContain("2026");
    expect(formatted).not.toContain("T10:30");
  });
});
