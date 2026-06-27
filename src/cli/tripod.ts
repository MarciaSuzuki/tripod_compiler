#!/usr/bin/env node
import { Command } from "commander";
import { readdirSync, statSync, writeFileSync, appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateArtifact } from "../engine/validate.js";
import { formatReport, quarantineWatch, formatQuarantineWatch } from "../engine/report.js";
import { checkDrift, closedListSyncIssues } from "../spec/pins.js";
import { readMeaningMap } from "../reader/meaning-map.js";
import { compileSkeleton } from "../compiler/skeleton.js";
import { compileCompilationLog } from "../compiler/complog.js";
import { goldDiff } from "../compiler/golddiff.js";
import { readArtifactNote } from "../reader/obsidian.js";
import { SPEC_DIR } from "../spec/load.js";
import { loadApprovedEnumerations } from "../spec/enumerations.js";
import { planPromotion, applyPromotion } from "../compiler/promote.js";
import { loadSourcePacket, loadAliasTable, sourcePacketPath, loadCoverageExceptions, loadLintExceptions, loadIdAlignmentExceptions, loadConceptRegistry, loadFigureRegistry } from "../reader/source-packet.js";
import { suggestReuse, type ReuseSuggestion } from "../engine/concept-check.js";
import { reconcile } from "../engine/coverage.js";
import { formatLedgerText, renderLedgerNote } from "../audit/coverage-ledger.js";
import { lintForModel, lintMeaningMap, applyLintExceptions, type LintReport } from "../engine/lint.js";
import { checkIdAlignment, type IdAlignReport } from "../engine/id-align.js";
import { formatIdAlignText, renderIdAlignNote } from "../audit/id-align-ledger.js";

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
      const quarantined = reports.reduce((n, r) => n + r.counts.quarantined, 0);
      const descr = reports.reduce((n, r) => n + r.counts.descriptive, 0);
      const propose = reports.reduce((n, r) => n + r.counts.propose, 0);
      console.log(
        `— ${reports.length} artifact(s): ${reports.length - invalid} valid, ${invalid} invalid · ${drift} drift (convergent) · ${quarantined} quarantined · ${descr} descr (open) · ${propose} propose —`,
      );
      const watch = formatQuarantineWatch(quarantineWatch(reports));
      if (watch) console.log("\n" + watch);
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
      const rowBad = !r.vendoredOk || r.vaultOk === false;
      let line = `${rowBad ? "✗" : "✓"} ${r.file}  pin ${r.pinnedVersion}  vendored:${r.vendoredOk ? "ok" : "DRIFT"}`;
      if (r.vaultAbsent) line += `  vault:MISSING`;
      else if (r.vaultSha !== undefined) line += `  vault:${r.vaultOk ? "ok" : "DRIFT"}`;
      console.log(line);
      if (rowBad) bad++;
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
        `type: "sta-compilation-log"\n` +  // SC-0075: canonical envelope the portal gate keys on
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
  .option("--sc <id>", "the governing SC id stamped as sc_ref on every promoted entry (REQUIRED with --apply)")
  .action((path: string, opts: { status?: string; apply?: boolean; to?: string; log?: string; sc?: string }) => {
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
    if (!opts.sc || !/^SC-\d{4}$/.test(opts.sc)) {
      console.error(`  ✗ --apply requires --sc <SC-id> (e.g. --sc SC-0063): every promoted entry's sc_ref must name the GOVERNING spec change, not the machinery's (the P08 batch was stamped SC-0006 by default and had to be fixed by hand).`);
      process.exitCode = 1;
      return;
    }
    const target = opts.to ?? join(SPEC_DIR, "approved-enumerations.json");
    const { reg, added } = applyPromotion(loadApprovedEnumerations(), plan, opts.sc);
    writeFileSync(target, JSON.stringify(reg, null, 2) + "\n");
    const stamp = plan.sourceArtifact;
    // log the repo-relative target — an absolute worktree path dangles once the worktree is cleaned
    const targetForLog = target.includes("_spec/") ? `_spec/${target.split("_spec/").pop()}` : target;
    appendFileSync(
      opts.log ?? "VOCABULARY_LOG.md",
      `- ${stamp}: promoted ${added.length} value(s) [${added.map((a) => `${a.axis}:${a.value}`).join(", ")}] → ${targetForLog} (${opts.sc})\n`,
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
        const pid = mf.slice(0, 3); // P0# / J0#
        const fm = fmFiles.find((f) => f.startsWith(pid));
        if (!fm) {
          // a map-only fixture (FOR_MODEL not yet graduated) is a legitimate state — skip VISIBLY, never silently
          console.log(`${pid}: skipped — no gold FOR_MODEL in ${opts.fmDir} (map-only fixture)`);
          return null;
        }
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

program
  .command("coverage")
  .description("reconcile FOR_MODEL(s) against the frozen BHSA referent set (docs/COVERAGE.md): MATCHED / UNMAPPED_SOURCE / UNANCHORED_ENTITY + coverage score. One target = detailed ledger; many / --corpus = summary.")
  .argument("[targets...]", "pericope id(s) (e.g. P01) and/or FOR_MODEL .md note path(s)")
  .option("--book <book>", "book whose pinned packet + alias table to use", "ruth")
  .option("--fm-dir <dir>", "where to find the FOR_MODEL note when a pericope id is given", "fixtures/for-model")
  .option("--corpus", "run every pericope that has both a pinned packet and a FOR_MODEL note")
  .option("--out <file>", "write the full coverage ledger as a wiki note (single-target only)")
  .option("--out-dir <dir>", "write each pericope's ledger note into this dir (batch)")
  .option("--json", "emit the structured ledger(s) as JSON")
  .action((targets: string[], opts: { book: string; fmDir: string; corpus?: boolean; out?: string; outDir?: string; json?: boolean }) => {
    const aliases = loadAliasTable(opts.book);
    const exceptions = loadCoverageExceptions();

    const resolveOne = (arg: string): { pericope: string; led: ReturnType<typeof reconcile>; packet: ReturnType<typeof loadSourcePacket> } => {
      let fmPath: string;
      let pericope: string;
      if (/^[A-Za-z]\d+$/.test(arg)) {
        pericope = arg.toUpperCase();
        const f = readdirSync(opts.fmDir).find((x) => x.startsWith(pericope) && x.endsWith("-FOR-MODEL.md"));
        if (!f) throw new Error(`no FOR_MODEL note for ${pericope} in ${opts.fmDir}`);
        fmPath = join(opts.fmDir, f);
      } else {
        fmPath = arg;
        pericope = (readArtifactNote(fmPath).frontmatter.pericope ?? "").toUpperCase();
        if (!pericope) throw new Error(`cannot determine pericope from ${fmPath} frontmatter`);
      }
      const note = readArtifactNote(fmPath);
      const packet = loadSourcePacket(sourcePacketPath(opts.book, pericope));
      return { pericope, led: reconcile(packet, note.json as any, aliases, exceptions), packet };
    };

    // assemble the target list (explicit args, and/or --corpus auto-discovery)
    let list = [...targets];
    if (opts.corpus) {
      const dir = join(SPEC_DIR, "source", opts.book.toLowerCase());
      const have = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
      const withFm = readdirSync(opts.fmDir).filter((f) => f.endsWith(".md"));
      for (const p of have.sort()) if (withFm.some((f) => f.startsWith(p)) && !list.includes(p)) list.push(p);
    }
    if (list.length === 0) {
      console.error("no targets. Pass pericope id(s)/path(s), or --corpus to run all pinned pericopes.");
      process.exit(2);
    }

    // resolve all, surfacing per-target errors without aborting the batch
    const results: Array<{ pericope: string; led: ReturnType<typeof reconcile>; packet: ReturnType<typeof loadSourcePacket> }> = [];
    for (const arg of list) {
      try {
        results.push(resolveOne(arg));
      } catch (e) {
        console.error(`✗ ${arg}: ${(e as Error).message}`);
        process.exitCode = 2;
      }
    }
    if (results.length === 0) process.exit(2);

    if (opts.outDir) mkdirSync(opts.outDir, { recursive: true });
    for (const r of results) {
      if (opts.outDir) {
        const slug = `${r.pericope}-${(r.packet.bcv || r.pericope).replace(/[ :]/g, "-")}`; // e.g. P01-Ruth-1-1-5
        writeFileSync(join(opts.outDir, `${slug}-COVERAGE-LEDGER.md`), renderLedgerNote(r.led, r.packet));
      }
    }

    if (opts.json) {
      console.log(JSON.stringify(results.length === 1 ? results[0]!.led : results.map((r) => r.led), null, 2));
      if (results.some((r) => !r.led.ok)) process.exitCode = 1;
      return;
    }

    if (results.length === 1) {
      const r = results[0]!;
      console.log(formatLedgerText(r.led));
      if (opts.out) {
        writeFileSync(opts.out, renderLedgerNote(r.led, r.packet));
        console.log(`  ledger written to ${opts.out}`);
      } else if (!opts.outDir) {
        console.log(`  → --out <file> to write the full reconciliation ledger into the audit trail`);
      }
      process.exitCode = r.led.ok ? 0 : 1;
      return;
    }

    // corpus summary
    console.log(`Coverage — ${opts.book} corpus (${results.length} pericope${results.length === 1 ? "" : "s"})\n`);
    let accFor = 0, accTot = 0, implied = 0, unanchored = 0, accepted = 0, withFindings = 0;
    for (const { led: l } of results) {
      const s = l.score;
      accFor += s.explicit_total - s.proper_unmapped;
      accTot += s.explicit_total;
      implied += s.implied_flagged;
      unanchored += s.unanchored;
      accepted += s.accepted;
      if (!l.ok) withFindings++;
      console.log(
        `  ${l.ok ? "✓" : "✗"} ${l.pericope}  ${(l.bcv + "").padEnd(13)} ` +
          `${s.explicit_total - s.proper_unmapped}/${s.explicit_total} explicit · ${s.implied_flagged} implied · ` +
          `${s.unanchored} unanchored · ${s.checklist} tick` + (s.accepted ? ` · ${s.accepted} accepted` : "") +
          (l.ok ? "" : `   ← ${l.blockers.length} blocker(s)`),
      );
      for (const b of l.blockers) console.log(`       ✗ ${b}`);
    }
    console.log(
      `\n— corpus: ${results.length - withFindings}/${results.length} block-clean · ${withFindings} with findings · ` +
        `${accFor}/${accTot} explicit accounted · ${implied} implied flagged · ${unanchored} unanchored` +
        (accepted ? ` · ${accepted} accepted exception${accepted === 1 ? "" : "s"}` : "") + " —",
    );
    if (opts.outDir) console.log(`  ledgers written to ${opts.outDir}/`);
    process.exitCode = withFindings ? 1 : 0;
  });

program
  .command("lint")
  .description("Level-3 / §3C content-discipline lint (the drift-guard): flag forbidden grammatical vocabulary, interpretive labels, conditioning-in-Q&A, compounds, and §3C-not-an-entity. Surfaces drift; the human judges.")
  .argument("[paths...]", "meaning-map and/or FOR_MODEL .md notes (auto-detected) and/or directories")
  .option("--corpus", "lint fixtures/meaning-map/ + fixtures/for-model/")
  .option("--mm-dir <dir>", "meaning-map dir for --corpus", "fixtures/meaning-map")
  .option("--fm-dir <dir>", "FOR_MODEL dir for --corpus", "fixtures/for-model")
  .option("--tier1", "show only high-confidence (tier-1) findings")
  .option("--json", "emit the structured reports as JSON")
  .action((paths: string[], opts: { corpus?: boolean; mmDir: string; fmDir: string; tier1?: boolean; json?: boolean }) => {
    const files = [...expandPaths(paths)];
    if (opts.corpus) {
      for (const d of [opts.mmDir, opts.fmDir]) for (const f of readdirSync(d)) if (f.endsWith(".md")) files.push(join(d, f));
    }
    if (files.length === 0) {
      console.error("no targets. Pass .md note(s)/dir(s), or --corpus.");
      process.exit(2);
    }
    const lintExceptions = loadLintExceptions();
    const lintOne = (file: string): LintReport => {
      const raw = readFileSync(file, "utf8");
      const isForModel = /type:\s*["']?sta-for-model/.test(raw) || /"sta_id"\s*:/.test(raw);
      const base = isForModel ? lintForModel(readArtifactNote(file).json as any, file) : lintMeaningMap(raw, file);
      return applyLintExceptions(base, lintExceptions); // recorded reviewer sign-offs (SC-0010 pattern)
    };
    const reports = [...new Set(files)].sort().map(lintOne).map((r) => ({
      ...r,
      findings: opts.tier1 ? r.findings.filter((f) => f.tier === 1) : r.findings,
    }));

    if (opts.json) {
      console.log(JSON.stringify(reports, null, 2));
      process.exitCode = reports.some((r) => r.findings.length) ? 1 : 0;
      return;
    }
    let total = 0, t1 = 0, accepted = 0;
    for (const r of reports) {
      if (r.findings.length === 0) continue;
      const drift = r.findings.filter((f) => !f.accepted);
      const acc = r.findings.filter((f) => f.accepted);
      total += drift.length;
      t1 += drift.filter((f) => f.tier === 1).length;
      accepted += acc.length;
      console.log(`\n${r.artifact}  ${r.file}  — ${drift.length} finding(s)${acc.length ? ` · ${acc.length} accepted` : ""}`);
      for (const f of r.findings.sort((a, b) => Number(!!a.accepted) - Number(!!b.accepted) || a.tier - b.tier)) {
        const mark = f.accepted ? "✓" : f.tier === 1 ? "✗" : "~";
        const tag = f.accepted ? ` [ACCEPTED: ${f.accepted.reason}]` : "";
        console.log(`  ${mark} [${f.rule}] ${f.location}  «${f.match}»${tag}  ${f.context ? `— ${f.context}` : ""}`);
      }
    }
    const clean = reports.filter((r) => r.findings.every((f) => f.accepted)).length;
    console.log(
      `\n— lint: ${reports.length} artifact(s) · ${total} finding(s) (${t1} tier-1, ${total - t1} tier-2)` +
        `${accepted ? ` · ${accepted} accepted (signed off)` : ""} · ` +
        `${clean} clean. Surfaces drift; the human judges (relocate insight, never delete). —`,
    );
    process.exitCode = total ? 1 : 0;
  });

program
  .command("id-check")
  .description(
    "SC-0018 cross-artifact entity-ID alignment (the 5th deterministic check: legal · complete · atomic-bare-plain · ALIGNED · true). " +
      "Diagnostic only — surfaces where the prose map and the FOR_MODEL disagree on which canonical code names an entity; fixes nothing.",
  )
  .argument("[paths...]", "meaning-map .md note(s) and/or directories; each is paired with its FOR_MODEL by P0# prefix")
  .option("--corpus", "check every map in --mm-dir that has a paired FOR_MODEL in --fm-dir")
  .option("--mm-dir <dir>", "meaning-map dir", "fixtures/meaning-map")
  .option("--fm-dir <dir>", "FOR_MODEL dir", "fixtures/for-model")
  .option("--book <book>", "force one alias-table book for every map (default: derived per map from its bcv frontmatter, falling back to ruth)")
  .option("--json", "emit the structured inventory as JSON")
  .option("--out <file>", "write the full inventory as a wiki ledger note (single-target only)")
  .option("--out-dir <dir>", "write each pericope's ledger note into this dir (batch)")
  .action((paths: string[], opts: { corpus?: boolean; mmDir: string; fmDir: string; book?: string; json?: boolean; out?: string; outDir?: string }) => {
    const exceptions = loadIdAlignmentExceptions();
    const fmFiles = readdirSync(opts.fmDir).filter((f) => f.endsWith(".md"));
    const noteResolveDirs = [...new Set([opts.mmDir, opts.fmDir])];

    // assemble the map list: explicit map paths (auto-detected from dirs) and/or --corpus.
    const mapPaths: string[] = [];
    for (const p of paths) {
      const st = statSync(p);
      if (st.isDirectory()) for (const f of readdirSync(p)) { if (f.endsWith(".md")) mapPaths.push(join(p, f)); }
      else mapPaths.push(p);
    }
    const explicit = new Set(mapPaths); // an explicitly-passed map keeps the hard unpaired error
    if (opts.corpus) for (const f of readdirSync(opts.mmDir)) if (f.endsWith(".md")) mapPaths.push(join(opts.mmDir, f));
    const maps = [...new Set(mapPaths)].sort();
    if (maps.length === 0) {
      console.error("no targets. Pass map .md note(s)/dir(s), or --corpus.");
      process.exit(2);
    }

    // SC-0038: a mixed-book corpus must check each map against its OWN book's alias table (a Jonah map
    // resolved against ruth.aliases.json mis-binds every entity). Book = the bcv's leading word
    // (single-word book names cover the pilot; a multi-word book — e.g. 1 Samuel — will need a map here).
    const aliasCache = new Map<string, ReturnType<typeof loadAliasTable>>();
    const aliasesFor = (mapPath: string) => {
      const book = opts.book ?? readMeaningMap(mapPath).bcv?.trim().split(/\s+/)[0]?.toLowerCase() ?? "ruth";
      let t = aliasCache.get(book);
      if (!t) { t = loadAliasTable(book); aliasCache.set(book, t); }
      return t;
    };

    const reports: IdAlignReport[] = [];
    for (const mapPath of maps) {
      const pid = (mapPath.split("/").pop() ?? "").slice(0, 3); // P0# / J0#
      // require the FOR_MODEL suffix — a bare prefix-find in a mixed dir grabs the COMPILATION-LOG
      // (the same trap coverage hit at SC-0038; second instance of the class)
      const fm = fmFiles.find((f) => f.startsWith(pid) && f.endsWith("-FOR-MODEL.md"));
      if (!fm) {
        if (opts.corpus && !explicit.has(mapPath)) {
          // a map-only fixture (FOR_MODEL not yet graduated) has nothing to align — skip VISIBLY, never silently
          console.log(`– ${mapPath}: skipped — no paired FOR_MODEL (prefix ${pid}) in ${opts.fmDir} (map-only fixture)`);
          continue;
        }
        console.error(`✗ ${mapPath}: no paired FOR_MODEL (prefix ${pid}) in ${opts.fmDir}`);
        process.exitCode = 2;
        continue;
      }
      try {
        reports.push(checkIdAlignment(mapPath, join(opts.fmDir, fm), { exceptions, noteResolveDirs, aliases: aliasesFor(mapPath) }));
      } catch (e) {
        console.error(`✗ ${mapPath}: ${(e as Error).message}`);
        process.exitCode = 2;
      }
    }
    if (reports.length === 0) process.exit(2);

    if (opts.outDir) {
      mkdirSync(opts.outDir, { recursive: true });
      for (const r of reports) writeFileSync(join(opts.outDir, `${r.pericope}-ID-ALIGNMENT-LEDGER.md`), renderIdAlignNote(r));
    }

    if (opts.json) {
      console.log(JSON.stringify(reports.length === 1 ? reports[0] : reports, null, 2));
      process.exitCode = reports.some((r) => !r.ok) ? 1 : 0;
      return;
    }

    for (const r of reports) console.log(formatIdAlignText(r), "\n");
    if (reports.length === 1 && opts.out) {
      writeFileSync(opts.out, renderIdAlignNote(reports[0]!));
      console.log(`  ledger written to ${opts.out}`);
    }

    // corpus / multi summary
    const sum = reports.reduce(
      (a, r) => ({
        ref: a.ref + r.counts.refErrors, name: a.name + r.counts.nameErrors, mis: a.mis + r.counts.misalign,
        flag: a.flag + r.counts.flagMismatch,
        lsr: a.lsr + r.counts.likelySameReferent, dang: a.dang + r.counts.dangling, uv: a.uv + r.counts.unverifiable,
        wh: a.wh + r.counts.withheld,
        acc: a.acc + r.counts.accepted, withFindings: a.withFindings + (r.ok ? 0 : 1),
      }),
      { ref: 0, name: 0, mis: 0, flag: 0, lsr: 0, dang: 0, uv: 0, wh: 0, acc: 0, withFindings: 0 },
    );
    console.log(
      `— id-check: ${reports.length} pericope(s) · ${reports.length - sum.withFindings} clean · ${sum.withFindings} with findings · ` +
        `${sum.ref} ref-integrity · ${sum.name} name-binding · ${sum.mis} misalignment (${sum.lsr} LIKELY_SAME_REFERENT) · ` +
        `${sum.flag} flag-mismatch · ${sum.dang} dangling · ${sum.uv} unverifiable` +
        (sum.wh ? ` · ${sum.wh} withheld-referent` : "") + (sum.acc ? ` · ${sum.acc} accepted` : "") +
        `. Diagnostic only — the human rules the inventory. —`,
    );
    if (opts.outDir) console.log(`  ledgers written to ${opts.outDir}/`);
    process.exitCode = sum.withFindings ? 1 : 0;
  });

program
  .command("concept-check")
  .description(
    "SC-0037 cross-canon consistency check for the GLOBAL Concept Bank + Figure Registry. The new-book guard: " +
      "surfaces where a book introduces a concept/figure resembling one the canon bank already has (a suggested reuse). " +
      "Diagnostic only — it suggests; the human rules reuse-vs-distinct. (Reference-integrity = `id-check`, now global.)",
  )
  .option("--book <book>", "the (new) book whose introduced concepts/figures to check for reuse", "jonah")
  .option("--threshold <n>", "similarity threshold 0..1 (default 0.34)", "0.34")
  .option("--json", "emit suggestions as JSON")
  .action((opts: { book: string; threshold: string; json?: boolean }) => {
    const th = parseFloat(opts.threshold);
    const cb = suggestReuse(loadConceptRegistry(), opts.book, th);
    const fig = suggestReuse(loadFigureRegistry(), opts.book, th);
    if (opts.json) { console.log(JSON.stringify({ book: opts.book, concepts: cb, figures: fig }, null, 2)); return; }
    const show = (label: string, arr: ReuseSuggestion[]) => {
      console.log(`\n${label} — ${arr.length} reuse suggestion(s) for book '${opts.book.toUpperCase()}':`);
      for (const s of arr)
        console.log(`  ⚠ ${s.candidate} (${s.candidateSlug}) resembles ${s.match} (${s.matchSlug}) [${s.matchBooks.join(",")}] @ ${s.score} — reuse, or genuinely distinct?`);
      if (!arr.length) console.log("  (none — introduced entries look genuinely new to the canon)");
    };
    show("CONCEPT BANK", cb);
    show("FIGURE REGISTRY", fig);
    console.log(`\n— concept-check: ${cb.length + fig.length} suggestion(s) · diagnostic (the human rules reuse) —`);
  });

program
  .command("draft")
  .description("SC-0063 Slice-4 drafter: fill a FOR_MODEL skeleton's judgment gaps via the Opus API (default = dry-run, no network)")
  .argument("<map-or-id>", "a Meaning Map .md path, or a pericope id (P08, J03) resolved in fixtures/meaning-map/")
  .option("--out <file>", "write the assembled request (dry-run artifact) to a file")
  .option("--measure", "exact input-token count via the free count_tokens endpoint (needs ANTHROPIC_API_KEY; falls back to byte estimate)")
  .option("--live", "PAID: actually call the drafter model and merge the fills (Phase B+; requires ANTHROPIC_API_KEY)")
  .option("--out-dir <dir>", "provenance directory for --live runs (default _working/<id>/drafts)")
  .action(async (mapOrId: string, opts: { out?: string; measure?: boolean; live?: boolean; outDir?: string }) => {
    const { assembleDraftRequest, renderRequest, requestStats } = await import("../drafter/assemble.js");
    const mmPath = resolveMapArg(mapOrId);
    const req = assembleDraftRequest(mmPath);
    const stats = requestStats(req);
    const id = req.mm.pericope ?? "P00";
    console.log(`drafter request assembled — ${id} (${req.mm.bcv ?? "?"}) · ${stats.gaps} gaps`);
    console.log(
      `  system ${(stats.systemBytes / 1024).toFixed(1)}KB · stable ${(stats.stableBytes / 1024).toFixed(1)}KB · per-pericope ${(stats.variableBytes / 1024).toFixed(1)}KB · total ${(stats.totalBytes / 1024).toFixed(1)}KB`,
    );
    console.log(`  request sha256 ${stats.sha256.slice(0, 16)}… (byte-stable: same inputs → same hash)`);
    if (opts.out) {
      writeFileSync(opts.out, renderRequest(req));
      console.log(`  assembled request written to ${opts.out}`);
    }
    if (opts.measure) {
      try {
        const { measureTokens, DRAFTER_MODEL } = await import("../drafter/call.js");
        const n = await measureTokens(req);
        console.log(`  input tokens (count_tokens, ${DRAFTER_MODEL}): ${n}`);
      } catch {
        console.log(`  input tokens ≈ ${stats.estTokens} (byte estimate — set ANTHROPIC_API_KEY for an exact count_tokens measurement)`);
      }
    }
    if (!opts.live) {
      if (!opts.measure) console.log(`  input tokens ≈ ${stats.estTokens} (byte estimate)`);
      console.log("  dry-run (no network). --measure for exact tokens · --live for the paid call (Phase B+, Marcia's ceiling applies).");
      return;
    }
    // ---- PAID PATH (Phase B+) ----
    const { draftViaApi, DRAFTER_MODEL, DrafterCallError } = await import("../drafter/call.js");
    const { applyFills } = await import("../drafter/fills.js");
    const { appendReceipt, checkCeiling, cumulativeUSD, usageCostUSD, RECEIPTS_PATH } = await import("../drafter/receipts.js");
    const gate = checkCeiling();
    if (!gate.ok) {
      console.error(
        `  ✗ CEILING GATE: $${gate.cumulative.toFixed(3)} spent + $${gate.reserve.toFixed(2)} call reserve exceeds the $${gate.ceiling} SC-0063 ceiling — stop-and-report (Marcia's word required to proceed).`,
      );
      process.exitCode = 1;
      return;
    }
    console.log(`  ceiling gate: $${gate.cumulative.toFixed(3)} of $${gate.ceiling} spent · reserve $${gate.reserve.toFixed(2)} · OK`);
    console.log(`  --live: calling ${DRAFTER_MODEL} (streaming, adaptive thinking, structured output)…`);
    let res;
    try {
      res = await draftViaApi(req);
    } catch (e) {
      if (e instanceof DrafterCallError && e.usage) {
        appendReceipt({
          ts: new Date().toISOString(),
          pericope: id,
          request_sha256: stats.sha256,
          model: e.model,
          status: e.kind === "truncated" ? "truncated" : "parse_error",
          usage: e.usage,
          cost_usd: Number(usageCostUSD(e.usage).toFixed(4)),
        });
        console.error(`  ✗ paid call FAILED (${e.kind}) — receipt written; cumulative now $${cumulativeUSD().toFixed(3)} (${RECEIPTS_PATH})`);
      }
      throw e;
    }
    const merge = applyFills(req.compile.skeleton, req.compile.gaps, res.output);
    const u = res.usage;
    appendReceipt({
      ts: new Date().toISOString(),
      pericope: id,
      request_sha256: stats.sha256,
      model: res.model,
      status: "ok",
      usage: u,
      cost_usd: Number(usageCostUSD(u).toFixed(4)),
    });
    console.log(
      `  usage: in ${u.input_tokens} · out ${u.output_tokens} · cache-write ${u.cache_creation_input_tokens ?? 0} · cache-read ${u.cache_read_input_tokens ?? 0} → $${usageCostUSD(u).toFixed(3)} (list) · cumulative $${cumulativeUSD().toFixed(3)} of $${gate.ceiling}`,
    );
    console.log(
      `  merge: ${merge.applied.length} applied · ${merge.noteOnly.length} note-only · ${merge.rejected.length} REJECTED · ${merge.unfilled.length} unfilled · ${merge.leftovers.length} __TODO__ left`,
    );
    for (const r of merge.rejected) console.log(`    ✗ ${r.location} — ${r.reason}`);
    const { auditMints, formatMintAudit } = await import("../drafter/calibrate.js");
    console.log("  " + formatMintAudit(auditMints(merge.merged, res.output, merge.applied, req.compile.skeleton)).split("\n").join("\n  "));
    const outDir = opts.outDir ?? join("_working", id, "drafts");
    const runDir = join(outDir, `run-${new Date().toISOString().replace(/[:.]/g, "-")}`);
    mkdirSync(runDir, { recursive: true });
    writeFileSync(join(runDir, "manifest.json"), JSON.stringify({ model: res.model, request_sha256: stats.sha256, map: mmPath, gaps: stats.gaps, usage: u, merge: { applied: merge.applied.length, noteOnly: merge.noteOnly.length, rejected: merge.rejected, unfilled: merge.unfilled.map((g) => g.location), leftovers: merge.leftovers } }, null, 2));
    writeFileSync(join(runDir, "fills.json"), JSON.stringify(res.output, null, 2));
    writeFileSync(join(runDir, "response-raw.txt"), res.rawText);
    const note =
      `---\ntype: "sta-for-model"\npericope: "${id}"\npericope-title: "${(req.mm.title ?? "").replace(/"/g, "'")}"\nsource-meaning-map: [[${String((req.compile.skeleton as any).header?.source_meaning_map_ref ?? "")}]]\nstatus: "draft"\npilot: "pilot-2"\ndrafter: "${res.model} · fm-drafter prompt (see _spec/pins.json) · machine-drafted, unruled"\n---\n\n` +
      `# ${id} — ${req.mm.bcv ?? ""} — FOR_MODEL (DRAFT — machine-drafted, awaiting review)\n\n` +
      `> Judgment gaps filled by the SC-0063 drafter (\`tripod draft --live\`); the merge layer enforced the patch-only contract. NOT canon until ruled.\n\n` +
      "```json\n" + JSON.stringify(merge.merged, null, 2) + "\n```\n";
    writeFileSync(join(runDir, `${id}-FOR-MODEL.md`), note);
    console.log(`  provenance + drafted FM written to ${runDir}`);
    console.log("  next: run the gates (validate · lint · coverage · id-check) on the drafted FM — findings are the experiment data.");
  });

program
  .command("calibrate")
  .description("SC-0063 Phase B: score a drafted FOR_MODEL against its GOLD counterpart at the judgment layer (drafted-vs-gold, alignment-aware, nothing smoothed)")
  .argument("<id>", "pericope id with a gold FOR_MODEL fixture (P01–P06) and a draft run under _working/<id>/drafts/")
  .option("--run <dir>", "a specific run directory (default: latest run-* under _working/<id>/drafts)")
  .action(async (id: string, opts: { run?: string }) => {
    const { assembleDraftRequest } = await import("../drafter/assemble.js");
    const { applyFills } = await import("../drafter/fills.js");
    const { calibrate, formatCalibration } = await import("../drafter/calibrate.js");
    const ID = id.toUpperCase();
    const goldFile = readdirSync(join("fixtures", "for-model")).find((f) => f.toUpperCase().startsWith(`${ID}-`));
    if (!goldFile) throw new Error(`no gold FOR_MODEL fixture for ${ID} (calibration needs one of P01–P06)`);
    const goldNote = readFileSync(join("fixtures", "for-model", goldFile), "utf8");
    const goldJson = JSON.parse(goldNote.match(/```json\n([\s\S]*?)\n```/)![1]!);
    const runDir =
      opts.run ??
      (() => {
        const base = join("_working", ID, "drafts");
        const runs = readdirSync(base)
          .filter((d) => d.startsWith("run-"))
          .sort();
        if (!runs.length) throw new Error(`no run-* under ${base} — run \`tripod draft ${ID} --live\` first`);
        return join(base, runs[runs.length - 1]!);
      })();
    const fills = JSON.parse(readFileSync(join(runDir, "fills.json"), "utf8"));
    const req = assembleDraftRequest(resolveMapArg(ID));
    const merge = applyFills(req.compile.skeleton, req.compile.gaps, fills);
    if (merge.rejected.length) console.log(`⚠ ${merge.rejected.length} rejected fill(s) — the merged draft excludes them (see manifest)`);
    const { auditMints, formatMintAudit } = await import("../drafter/calibrate.js");
    const cal = calibrate(merge.merged, goldJson);
    const audit = auditMints(merge.merged, fills, merge.applied, req.compile.skeleton);
    const text =
      formatCalibration(cal, `${ID} drafted (${runDir.split("/").pop()}) vs gold ${goldFile}`) + "\n\n" + formatMintAudit(audit);
    console.log(text);
    writeFileSync(join(runDir, "calibration.json"), JSON.stringify({ calibration: cal, mintAudit: audit }, null, 2));
    writeFileSync(join(runDir, "calibration.txt"), text + "\n");
    console.log(`\ncalibration written to ${runDir}/calibration.{json,txt}`);
  });

program.parseAsync(process.argv);

function resolveMapArg(mapOrId: string): string {
  try {
    if (statSync(mapOrId).isFile()) return mapOrId;
  } catch {
    /* not a path — try id resolution */
  }
  const dir = join("fixtures", "meaning-map");
  const hit = readdirSync(dir).find((f) => f.toUpperCase().startsWith(`${mapOrId.toUpperCase()}-`) && f.endsWith(".md"));
  if (!hit) throw new Error(`cannot resolve '${mapOrId}' — not a file, and no fixtures/meaning-map/${mapOrId}-*.md`);
  return join(dir, hit);
}

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
