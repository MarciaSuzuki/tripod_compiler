#!/usr/bin/env node
import { Command } from "commander";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { validateArtifact } from "../engine/validate.js";
import { formatReport } from "../engine/report.js";
import { checkDrift, closedListSyncIssues } from "../spec/pins.js";

const program = new Command();
program.name("tripod").description("Tripod Compiler — Slice 1 (spec + validator)").version("0.1.0");

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
