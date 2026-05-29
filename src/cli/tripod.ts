#!/usr/bin/env node
import { Command } from "commander";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { validateArtifact } from "../engine/validate.js";
import { formatReport } from "../engine/report.js";
import { checkDrift, closedListSyncIssues } from "../spec/pins.js";
import { readMeaningMap } from "../reader/meaning-map.js";
import { compileSkeleton } from "../compiler/skeleton.js";

const program = new Command();
program.name("tripod").description("Tripod Compiler — Slice 1 (validator) + Slice 2 (skeleton compiler)").version("0.2.0");

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
      const propose = reports.reduce((n, r) => n + r.counts.propose, 0);
      console.log(
        `— ${reports.length} artifact(s): ${reports.length - invalid} valid, ${invalid} invalid · ${drift} drift · ${propose} propose —`,
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
  .option("--out <file>", "write the FOR_MODEL skeleton JSON to a file")
  .option("--json", "print { skeleton, gaps, stats } as JSON")
  .action((mmPath: string, opts: { out?: string; json?: boolean }) => {
    const mm = readMeaningMap(mmPath);
    const { skeleton, gaps, stats } = compileSkeleton(mm);
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
