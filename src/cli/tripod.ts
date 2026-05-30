#!/usr/bin/env node
import { Command } from "commander";
import { readdirSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { validateArtifact } from "../engine/validate.js";
import { formatReport } from "../engine/report.js";
import { checkDrift, closedListSyncIssues } from "../spec/pins.js";
import { readMeaningMap } from "../reader/meaning-map.js";
import { compileSkeleton } from "../compiler/skeleton.js";
import { compileCompilationLog } from "../compiler/complog.js";
import { goldDiff } from "../compiler/golddiff.js";
import { readArtifactNote } from "../reader/obsidian.js";
import { SPEC_DIR } from "../spec/load.js";
import { loadApprovedEnumerations } from "../spec/enumerations.js";
import { planPromotion, applyPromotion } from "../compiler/promote.js";

const program = new Command();
program
  .name("tripod")
  .description("Tripod Compiler — validator, drift convergence, and MeaningMap→FOR_MODEL skeleton compiler")
  .version("0.4.0");

program
  .command("validate")
  .description("validate artifact note(s) against the pinned locked spec")
  .argument("<paths...>", "artifact .md notes and/or directories")
  .option("--json", "emit the structured JSON report instead of text")
  .action((paths: string[], opts: { json?: boolean }) => {
    const files = expandPaths(paths);
    if (files.length === 0) {
      console.error("no .md artifacts found in the given path(s)");
      process.exit(2);
    }
    const reports = files.map(validateArtifact);
    const invalid = reports.filter((r) => !r.ok).length;
    if (opts.json) {
      // JSON mode: emit only the report (no trailing summary), so stdout is parseable.
      console.log(JSON.stringify(reports, null, 2));
    } else {
      for (const r of reports) console.log(formatReport(r), "\n");
      const drift = reports.reduce((n, r) => n + r.counts.drift, 0);
      const descr = reports.reduce((n, r) => n + r.counts.descriptive, 0);
      const propose = reports.reduce((n, r) => n + r.counts.propose, 0);
      console.log(
        `— ${reports.length} artifact(s): ${reports.length - invalid} valid, ${invalid} invalid · ${drift} drift (convergent) · ${descr} descr (open) · ${propose} propose —`,
      );
    }
    // Set exitCode (don't process.exit) so large stdout flushes before exit.
    process.exitCode = invalid ? 1 : 0;
  });

program
  .command("check-drift")
  .description("verify the vendored spec against its pins (and optionally the wiki vault)")
  .option("--vault <specDir>", "path to the wiki's _spec dir, to detect upstream drift")
  .action((opts: { vault?: string }) => {
    let bad = 0;
    for (const r of checkDrift(opts.vault)) {
      let line = `${r.vendoredOk ? "✓" : "✗"} ${r.file}  pin ${r.pinnedVersion}  vendored:${r.vendoredOk ? "ok" : "DRIFT"}`;
      if (r.vaultSha !== undefined) line += `  vault:${r.vaultOk ? "ok" : "DRIFT"}`;
      console.log(line);
      if (!r.vendoredOk || r.vaultOk === false) bad++;
    }
    const sync = closedListSyncIssues();
    if (sync.length === 0) console.log("✓ closed-list sync invariant holds (REGISTER / GENRE / NARRATIVE_FRAMING)");
    else for (const s of sync) console.log(`✗ spec self-check: ${s}`);
    process.exitCode = bad || sync.length ? 1 : 0;
  });

program
  .command("compile")
  .description("deterministically compile a Meaning Map into a FOR_MODEL skeleton + gap report (no LLM)")
  .argument("<meaning-map>", "a pericope Meaning Map .md note")
  .option("--out <file>", "write the FOR_MODEL skeleton as a draft note")
  .option("--out-log <file>", "write the gap report as a schema-valid COMPILATION-LOG note")
  .option("--json", "print { skeleton, gaps, stats } as JSON")
  .action((mmPath: string, opts: { out?: string; outLog?: string; json?: boolean }) => {
    const mm = readMeaningMap(mmPath);
    const result = compileSkeleton(mm);
    const { skeleton, gaps, stats } = result;
    if (opts.out) {
      const ref = String((skeleton as any).header?.source_meaning_map_ref ?? mm.pericope ?? "");
      const note =
        `---\n` +
        `type: "sta-for-model"\n` +
        `pericope: "${mm.pericope ?? ""}"\n` +
        `pericope-title: "${(mm.title ?? "").replace(/"/g, "'")}"\n` +
        `source-meaning-map: [[${ref}]]\n` +
        `status: "skeleton"\n` +
        `pilot: "pilot-2"\n` +
        `---\n\n` +
        `# ${mm.pericope ?? ""} — ${mm.bcv ?? ""} — FOR_MODEL (SKELETON — ${gaps.length} judgment gaps)\n\n` +
        `> Deterministic skeleton compiled from the Meaning Map (\`tripod compile\`). Fields set to ` +
        `\`__TODO__\` need the drafter/LLM (Slice 4); see the gap report (\`--json\`).\n\n` +
        "```json\n" +
        JSON.stringify(skeleton, null, 2) +
        "\n```\n";
      writeFileSync(opts.out, note);
    }
    if (opts.outLog) {
      const log = compileCompilationLog(mm, result);
      const note =
        `---\n` +
        `type: "compilation-log"\n` +
        `pericope: "${mm.pericope ?? ""}"\n` +
        `status: "skeleton"\n` +
        `pilot: "pilot-2"\n` +
        `---\n\n` +
        `# ${mm.pericope ?? ""} — ${mm.bcv ?? ""} — COMPILATION-LOG (skeleton gap report)\n\n` +
        "```json\n" +
        JSON.stringify(log, null, 2) +
        "\n```\n";
      writeFileSync(opts.outLog, note);
    }
    if (opts.json) {
      console.log(JSON.stringify({ skeleton, gaps, stats }, null, 2));
      return;
    }
    console.log(`compiled ${mmPath} → FOR_MODEL skeleton (${skeleton["sta_id"]})`);
    console.log(
      `  scenes ${stats.scenes} · propositions ${stats.propositions} (MM granularity) · beings ${stats.beings} · place codes ${stats.placesWithCode} · flags carried ${stats.flagsCarried}`,
    );
    // gap summary by field
    const byField = new Map<string, number>();
    for (const g of gaps) byField.set(g.field, (byField.get(g.field) ?? 0) + 1);
    console.log(`  ${gaps.length} judgment gap(s) for the drafter/LLM (Slice 4):`);
    for (const [field, n] of [...byField.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     ${String(n).padStart(3)}×  ${field}`);
    }
    if (opts.out) console.log(`  skeleton written to ${opts.out}`);
    else console.log(`  → --out <file> to write the skeleton; --json for the full gap list with hints`);
  });

program
  .command("propose-vocabulary")
  .description("from a FOR_MODEL, list convergent-axis drift values as candidate COMPILATION-LOG vocabulary_additions")
  .argument("<for-model>", "a FOR_MODEL artifact note")
  .action((path: string) => {
    const r = validateArtifact(path);
    const byAxis = new Map<string, Set<string>>();
    for (const f of r.findings) {
      if (f.severity !== "drift" || !f.axis) continue; // convergent drift only
      const v = f.message.match(/^'([^']+)'/)?.[1];
      if (v) (byAxis.get(f.axis) ?? byAxis.set(f.axis, new Set()).get(f.axis)!).add(v);
    }
    if (byAxis.size === 0) {
      console.log(`${path}: no convergent drift — nothing to propose.`);
      return;
    }
    console.log(`Convergent-drift values in ${path} — candidate vocabulary_additions for review (Gate F):`);
    for (const [axis, vals] of [...byAxis.entries()].sort()) {
      console.log(`  ${axis}:`);
      for (const v of [...vals].sort()) console.log(`     - ${v}`);
    }
    console.log(`\n  Record approved ones in the pericope's COMPILATION-LOG vocabulary_additions, then \`tripod promote\`.`);
  });

program
  .command("promote")
  .description("promote approved convergent vocabulary from a COMPILATION-LOG into the approved-enumerations registry (SC-0006)")
  .argument("<compilation-log>", "a COMPILATION-LOG artifact note")
  .option("--status <status>", "promote only values at this status (CONFIRMED|PROPOSED|ANY)", "CONFIRMED")
  .option("--apply", "write the grown registry (default target: the vendored _spec/approved-enumerations.json)")
  .option("--to <file>", "registry file to write when --apply is set")
  .option("--log <file>", "VOCABULARY_LOG path to append a promotion line", "VOCABULARY_LOG.md")
  .action((path: string, opts: { status?: string; apply?: boolean; to?: string; log?: string }) => {
    const plan = planPromotion(path, { status: opts.status });
    console.log(`promote ${plan.pericope ?? path} — status gate: ${plan.statusFilter}`);
    console.log(
      `  ${plan.promote.length} to promote · ${plan.alreadyApproved.length} already approved · ${plan.skippedByStatus.length} skipped (status)`,
    );
    for (const c of plan.promote) console.log(`     + ${c.axis}: ${c.value}  [${c.status ?? "—"}]`);
    if (plan.skippedByStatus.length)
      console.log(`  (${plan.skippedByStatus.length} skipped — not ${plan.statusFilter}; use --status ANY to include)`);
    if (plan.uncoveredAxes.length)
      console.log(
        `  note: convergent axes NOT covered by COMPILATION-LOG vocabulary_additions (won't converge via promote yet): ${plan.uncoveredAxes.join(", ")}`,
      );
    else console.log(`  note: all convergent axes are promotable via the COMPILATION-LOG (SC-0007).`);
    if (!opts.apply) {
      console.log(`  → dry run. Re-run with --apply to grow the registry.`);
      return;
    }
    if (plan.statusFilter !== "CONFIRMED")
      console.log(
        `  ⚠ policy: promotion is CONFIRMED-only from P03 onward — Gate-F flips PROPOSED→CONFIRMED before promote. ` +
          `'--status ${plan.statusFilter}' is a deliberate gate override (P02 was the grandfathered exception; see VOCABULARY_LOG.md).`,
      );
    const target = opts.to ?? join(SPEC_DIR, "approved-enumerations.json");
    const { reg, added } = applyPromotion(loadApprovedEnumerations(), plan);
    writeFileSync(target, JSON.stringify(reg, null, 2) + "\n");
    const stamp = plan.sourceArtifact;
    appendFileSync(
      opts.log ?? "VOCABULARY_LOG.md",
      `- ${stamp}: promoted ${added.length} value(s) [${added.map((a) => `${a.axis}:${a.value}`).join(", ")}] → ${target}\n`,
    );
    console.log(`  applied: ${added.length} value(s) written to ${target}; logged to ${opts.log ?? "VOCABULARY_LOG.md"}.`);
    console.log(`  ⚠ governed step: re-vendor + re-pin (update _spec/pins.json sha256) and record under SPEC_CHANGES if this is the canonical registry.`);
  });

program
  .command("gold-diff")
  .description("diff each fixture skeleton vs its gold FOR_MODEL: extracted-and-matched vs judgment (Slice-4 regression baseline)")
  .option("--mm-dir <dir>", "meaning-map fixtures dir", "fixtures/meaning-map")
  .option("--fm-dir <dir>", "gold FOR_MODEL fixtures dir", "fixtures/for-model")
  .option("--out <file>", "write the diff baseline JSON")
  .action((opts: { mmDir: string; fmDir: string; out?: string }) => {
    const fmFiles = readdirSync(opts.fmDir).filter((f) => f.endsWith("-FOR-MODEL.md"));
    const diffs = readdirSync(opts.mmDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((mf) => {
        const pid = mf.slice(0, 3); // P0#
        const fm = fmFiles.find((f) => f.startsWith(pid));
        if (!fm) return null;
        const mm = readMeaningMap(join(opts.mmDir, mf));
        const { skeleton } = compileSkeleton(mm);
        return goldDiff(mm, skeleton, readArtifactNote(join(opts.fmDir, fm)).json);
      })
      .filter((d): d is ReturnType<typeof goldDiff> => d !== null);
    for (const d of diffs) {
      console.log(
        `${d.pericope}: ${d.agreementPct}% gold agreement (${d.matched} matched · ${d.divergent} divergent vs gold) · ${d.judgmentPlaceholders} judgment placeholders`,
      );
      for (const m of d.divergences) console.log(`     ~ ${m.field}: ${m.note}`);
    }
    if (opts.out) {
      writeFileSync(opts.out, JSON.stringify(diffs, null, 2) + "\n");
      console.log(`baseline written to ${opts.out}`);
    }
  });

program.parseAsync(process.argv);

function expandPaths(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) for (const f of readdirSync(p)) {
      if (f.endsWith(".md")) out.push(join(p, f));
    } else out.push(p);
  }
  return out.sort();
}
