import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SC-0085 — the Sala three-signal gate guard (docs/SALA-GATE-SEAM.md). Floor extended by SC-0086
 * (P09, ruled 2026-09-26, ahead of P08), SC-0087 (P11, ruled 2026-09-27), SC-0088 (P12, P13, P14,
 * ruled 2026-09-28) and SC-0089 (P08, P10, ruled 2026-09-29) — all 14 Ruth pericopes.
 *
 * João's Sala opens a pericope only when THREE signals agree: (1) a real
 * high_risk_register_audit (no SKELETON entries), (2) validation_checklist.
 * high_risk_register_complete === true, (3) the meaning map's sta-status === "complete".
 * Divergence on his side = the passage stays closed + an alert; divergence on OUR side is
 * drift. This guard makes silent divergence impossible: it walks every COMPILATION-LOG,
 * derives all three signals, and fails on any disagreement.
 *
 * The 18 Esther pericopes diverged BEFORE the contract was ruled (maps say complete,
 * registers are skeletons — the safe, reads-as-closed direction). They are FROZEN below as a
 * known list: any NEW divergence fails, and burning an entry off the list (the future Esther
 * card) must edit it here, in a governed change.
 */
const here = dirname(fileURLToPath(import.meta.url));
const CL_DIR = join(here, "..", "fixtures", "compilation-log");
const MAP_DIR = join(here, "..", "fixtures", "meaning-map");

const KNOWN_DIVERGENT_FROZEN_2026_08_31 = [
  "E01-Esther-1-1-9", "E02-Esther-1-10-22", "E03-Esther-2-1-4", "E04-Esther-2-5-18",
  "E05-Esther-2-19-23", "E06-Esther-3-1-6", "E07-Esther-3-7-15", "E08-Esther-4-1-8",
  "E09-Esther-4-9-17", "E10-Esther-5-1-14", "E11-Esther-6-1-14", "E12-Esther-7-1-10",
  "E13-Esther-8-1-8", "E14-Esther-8-9-17", "E15-Esther-9-1-10", "E16-Esther-9-11-19",
  "E17-Esther-9-20-32", "E18-Esther-10-1-3",
];

interface Signals {
  stem: string;
  hasSkeleton: boolean;
  checklistFlag: boolean;
  staStatus: string | null;
  agree: boolean;
}

function readSignals(clFile: string): Signals {
  const stem = clFile.replace(/-COMPILATION-LOG\.md$/, "");
  const text = readFileSync(join(CL_DIR, clFile), "utf8");
  const m = text.match(/```json\n([\s\S]*?)\n```/);
  const d = JSON.parse(m![1]!);
  const audit: { kind?: string }[] = d.high_risk_register_audit ?? [];
  const hasSkeleton = audit.some((e) => e.kind === "SKELETON_PENDING_HIGH_RISK_REVIEW");
  const checklistFlag = d.validation_checklist?.high_risk_register_complete === true;
  const mapPath = join(MAP_DIR, `${stem}.md`);
  let staStatus: string | null = null;
  if (existsSync(mapPath)) {
    const fm = readFileSync(mapPath, "utf8").match(/^sta-status:\s*"?([\w-]+)"?/m);
    staStatus = fm ? fm[1]! : null;
  }
  // agreement: flag ⇔ no-skeleton, and flag ⇔ sta-status complete
  const agree = checklistFlag === !hasSkeleton && (staStatus === "complete") === checklistFlag;
  return { stem, hasSkeleton, checklistFlag, staStatus, agree };
}

const all = readdirSync(CL_DIR)
  .filter((f) => f.endsWith("-COMPILATION-LOG.md"))
  .map(readSignals);

describe("Sala gate — three-signal agreement (SC-0085)", () => {
  it("every COMPILATION-LOG has a matching vendored meaning map with a readable sta-status", () => {
    const missing = all.filter((s) => s.staStatus === null).map((s) => s.stem);
    expect(missing, `maps missing or without sta-status: ${missing.join(", ")}`).toEqual([]);
  });

  it("the divergent set is EXACTLY the frozen known list (new divergence fails; burn-down edits the list)", () => {
    const divergent = all.filter((s) => !s.agree).map((s) => s.stem).sort();
    expect(divergent).toEqual([...KNOWN_DIVERGENT_FROZEN_2026_08_31].sort());
  });

  it("completed registers agree in the complete direction (all 14 Ruth pericopes, P01–P14)", () => {
    const complete = all.filter((s) => !s.hasSkeleton).map((s) => s.stem).sort();
    for (const stem of complete) {
      const s = all.find((x) => x.stem === stem)!;
      expect(s.checklistFlag, `${stem}: real audit but checklist flag is false`).toBe(true);
      expect(s.staStatus, `${stem}: real audit + flag true but sta-status is not complete`).toBe("complete");
    }
    // The queue's floor: P01–P07 are complete as of the SC-0085 P07 slice; P09 joined under
    // SC-0086 (ruled ahead of P08), P11 under SC-0087, P12–P14 under SC-0088, and P08 + P10 under
    // SC-0089 — the SC-0085 program's Ruth queue is done. A pericope LEAVING this list is a regression.
    for (const stem of ["P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7", "P06-Ruth-2-8-16", "P07-Ruth-2-17-23", "P08-Ruth-3-1-5", "P09-Ruth-3-6-13", "P10-Ruth-3-14-18", "P11-Ruth-4-1-8", "P12-Ruth-4-9-12", "P13-Ruth-4-13-17", "P14-Ruth-4-18-22"]) {
      expect(complete, `${stem} fell out of the completed set`).toContain(stem);
    }
  });

  it("SC-0086: the P09 register carries the 18 ruled entries, 10 do_not_decide", () => {
    const text = readFileSync(join(CL_DIR, "P09-Ruth-3-6-13-COMPILATION-LOG.md"), "utf8");
    const d = JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);
    const audit: { id: string; do_not_decide?: boolean }[] = d.high_risk_register_audit;
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 18 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R3", "R4", "R7", "R9", "R15", "R16", "R17", "R18"]);
  });

  it("SC-0087 + SC-0088: the P11 register carries 15 entries, 10 do_not_decide", () => {
    const text = readFileSync(join(CL_DIR, "P11-Ruth-4-1-8-COMPILATION-LOG.md"), "utf8");
    const d = JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);
    const audit: { id: string; do_not_decide?: boolean }[] = d.high_risk_register_audit;
    // SC-0088, Marcia 2026-09-28 after the session: P11's never-rules to the Validator too (P11-D7).
    expect(audit.map((e) => e.id)).toEqual(Array.from({ length: 15 }, (_, i) => `R${i + 1}`));
    expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R10", "R13", "R15"]);
  });

  for (const [stem, sc, n, dnd] of [
    // SC-0088, Marcia 2026-09-28 after the session: the never-rules go to the Validator (P12-D6, P13-D6, P14-D6).
    ["P12-Ruth-4-9-12", "SC-0088", 13, ["R1", "R2", "R3", "R5", "R6", "R13"]],
    ["P13-Ruth-4-13-17", "SC-0088", 13, ["R1", "R2", "R3", "R5", "R7", "R8", "R9", "R10", "R13"]],
    ["P14-Ruth-4-18-22", "SC-0088", 11, ["R1", "R2", "R3", "R4", "R5", "R6"]],
    // SC-0089, Marcia 2026-09-29: every never-rule do_not_decide from the start (the SC-0088 lesson).
    ["P08-Ruth-3-1-5", "SC-0089", 13, ["R2", "R3", "R4", "R5", "R6", "R7", "R8", "R10", "R11"]],
    ["P10-Ruth-3-14-18", "SC-0089", 13, ["R1", "R2", "R4", "R5", "R6", "R9", "R10"]],
  ] as [string, string, number, string[]][]) {
    it(`${sc}: the ${stem.slice(0, 3)} register carries ${n} entries, ${dnd.length} do_not_decide`, () => {
      const text = readFileSync(join(CL_DIR, `${stem}-COMPILATION-LOG.md`), "utf8");
      const d = JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]!);
      const audit: { id: string; do_not_decide?: boolean }[] = d.high_risk_register_audit;
      expect(audit.map((e) => e.id)).toEqual(Array.from({ length: n }, (_, i) => `R${i + 1}`));
      expect(audit.filter((e) => e.do_not_decide).map((e) => e.id)).toEqual(dnd);
    });
  }

  // Exact set (SC-0087, SC-0088, SC-0089): the three signals open a pericope to Sala only on Marcia's
  // ruled register. After SC-0089 all 14 Ruth pericopes are complete-agreeing and no Ruth register is a
  // skeleton; the next book's completed registers add their stems here in their own governed change.
  it("the complete-agreeing set is exactly the ruled Ruth pericopes (all 14, P01–P14)", () => {
    const completeAgreeing = all.filter((s) => s.agree && !s.hasSkeleton).map((s) => s.stem).sort();
    expect(completeAgreeing).toEqual([
      "P01-Ruth-1-1-5", "P02-Ruth-1-6-14", "P03-Ruth-1-15-18", "P04-Ruth-1-19-22", "P05-Ruth-2-1-7",
      "P06-Ruth-2-8-16", "P07-Ruth-2-17-23", "P08-Ruth-3-1-5", "P09-Ruth-3-6-13", "P10-Ruth-3-14-18",
      "P11-Ruth-4-1-8", "P12-Ruth-4-9-12", "P13-Ruth-4-13-17", "P14-Ruth-4-18-22",
    ]);
    const ruthClosed = all.filter((s) => /^P\d\d-Ruth/.test(s.stem) && s.hasSkeleton).map((s) => s.stem).sort();
    expect(ruthClosed).toEqual([]);
  });
});
