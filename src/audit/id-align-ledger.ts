import type { IdAlignReport } from "../engine/id-align.js";

/**
 * Render the SC-0018 cross-artifact ID-alignment inventory for the CLI and as a wiki-fileable ledger
 * note. Sectioned per the brief: reference-integrity errors · name-binding errors · cross-artifact
 * misalignments (LIKELY_SAME_REFERENT called out) · dangling-note flags · unverifiable codes ·
 * accepted. Diagnostic only — the inventory is the deliverable; the human rules it.
 */

const dir = (d: "MAP_NOT_MC" | "MC_NOT_MAP") => (d === "MAP_NOT_MC" ? "map-not-MC" : "MC-not-map");

/** Compact human-readable inventory for `tripod id-check` stdout (one pericope). */
export function formatIdAlignText(r: IdAlignReport): string {
  const c = r.counts;
  const lines: string[] = [];
  lines.push(`${r.ok ? "✓" : "✗"} ID-CHECK  ${r.pericope}  (map ${baseName(r.mapPath)} ↔ FM ${baseName(r.mcPath)})`);
  lines.push(
    `   ${c.refErrors} ref-integrity error(s) · ${c.nameErrors} name-binding error(s) · ` +
      `${c.misalign} misalignment(s) (${c.likelySameReferent} LIKELY_SAME_REFERENT) · ${c.flagMismatch} flag-mismatch(es) · ${c.dangling} dangling note(s)` +
      (c.unverifiable ? ` · ${c.unverifiable} unverifiable` : "") +
      (c.withheld ? ` · ${c.withheld} withheld-referent` : "") +
      (c.accepted ? ` · ${c.accepted} accepted` : ""),
  );

  if (r.referenceIntegrity.length) {
    lines.push(`   reference integrity — code with no BCD/registry entry:`);
    for (const f of r.referenceIntegrity)
      lines.push(`      ${mark(f.severity)} [${f.side}] ${f.code}  @${f.where}  — ${f.reason} (${f.detail})${acc(f.accepted)}`);
  }
  if (r.nameBinding.length) {
    lines.push(`   name-binding — map slug ≠ slugify(BCD name):`);
    for (const f of r.nameBinding)
      lines.push(
        `      ${mark(f.severity)} ${f.code}  @${f.where}  slug «${f.slugFound}» ≠ expected «${f.slugExpected}» (BCD: "${f.canonicalName}")${acc(f.accepted)}`,
      );
  }
  if (r.misalignments.length) {
    lines.push(`   cross-artifact misalignment (structural symmetric difference):`);
    for (const f of r.misalignments) {
      const lsr = f.likelySameReferent ? `  ⟵ LIKELY_SAME_REFERENT as ${f.likelySameReferent.otherCode} (shared stem ${f.likelySameReferent.sharedStem})` : "";
      const pe = f.presentElsewhere ? `  (present on other side as ${f.presentElsewhere})` : "";
      lines.push(`      ${mark(f.severity)} [${f.scope}] ${dir(f.direction)}: ${f.code}${lsr}${pe}${acc(f.accepted)}`);
    }
  }
  if (r.flagMismatches.length) {
    lines.push(`   CB_/FIG_ flag mismatch (flag-set symmetric difference — map active-concepts/§5 ↔ FM cb/figure_flags):`);
    for (const f of r.flagMismatches)
      lines.push(`      ${mark(f.severity)} [${f.kind}] ${dir(f.direction)}: ${f.code}${acc(f.accepted)}`);
  }
  if (r.danglingNotes.length) {
    lines.push(`   dangling note links (non-entity [[…]] resolving to no note):`);
    for (const f of r.danglingNotes) lines.push(`      ${mark(f.severity)} [[${f.raw}]]  @${f.where}  — ${f.detail}${acc(f.accepted)}`);
  }
  if (r.unverifiable.length) {
    lines.push(`   unverifiable (schema-legal codes in namespaces no vendored registry tracks — TH_ thematic overlay):`);
    const byCode = new Map<string, string[]>();
    for (const f of r.unverifiable) (byCode.get(f.code) ?? byCode.set(f.code, []).get(f.code)!).push(f.side);
    lines.push(`      ${[...byCode.keys()].sort().join(" · ")}`);
  }
  if (r.withheldReferents.length) {
    lines.push(`   withheld referents (INFO — intentional \`<NS>?\` gaps, e.g. B?; never an error):`);
    for (const f of r.withheldReferents) lines.push(`      ⓘ [${f.side}] ${f.code}  @${f.where}  — ${f.reason} (${f.detail})`);
  }
  if (r.referenceIntegrity.length + r.nameBinding.length + r.misalignments.length + r.flagMismatches.length + r.danglingNotes.length + r.unverifiable.length + r.withheldReferents.length === 0)
    lines.push(`   — clean: every entity code aligns and resolves.`);
  return lines.join("\n");
}

function mark(sev: string): string {
  return sev === "ACCEPTED" ? "✓" : sev === "MISALIGN" ? "~" : sev === "FLAG" ? "⚑" : "✗";
}
function acc(a?: { reason: string; accepted_by?: string }): string {
  return a ? `  [ACCEPTED: ${a.reason}${a.accepted_by ? ` — ${a.accepted_by}` : ""}]` : "";
}
function baseName(p: string): string {
  return (p.split("/").pop() ?? p).replace(/\.md$/, "");
}

function table(header: string[], rows: string[][]): string {
  if (rows.length === 0) return "_none._\n";
  return `| ${header.join(" | ")} |\n| ${header.map(() => "---").join(" | ")} |\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;
}

/** Full inventory as a wiki ledger note (frontmatter + the sectioned tables). */
export function renderIdAlignNote(r: IdAlignReport): string {
  const c = r.counts;
  const status = r.ok ? "aligned" : "findings";
  const riRows = r.referenceIntegrity.map((f) => [f.side, `\`${f.code}\``, f.where, f.reason, severityCell(f.severity, f.accepted)]);
  const nbRows = r.nameBinding.map((f) => [`\`${f.code}\``, f.where, `\`${f.slugFound}\``, `\`${f.slugExpected}\``, `"${f.canonicalName}"`, severityCell(f.severity, f.accepted)]);
  const maRows = r.misalignments.map((f) => [
    f.scope,
    dir(f.direction),
    `\`${f.code}\``,
    f.likelySameReferent
      ? `**LIKELY_SAME_REFERENT** \`${f.likelySameReferent.otherCode}\` (stem \`${f.likelySameReferent.sharedStem}\`)`
      : f.presentElsewhere ? `present on other side as ${f.presentElsewhere}` : "—",
    severityCell(f.severity, f.accepted),
  ]);
  const fmiRows = r.flagMismatches.map((f) => [f.kind, dir(f.direction), `\`${f.code}\``, severityCell(f.severity, f.accepted)]);
  const dnRows = r.danglingNotes.map((f) => [`[[${f.raw}]]`, f.where, f.detail, severityCell(f.severity, f.accepted)]);
  const uvRows = [...new Set(r.unverifiable.map((f) => f.code))].sort().map((code) => {
    const sides = [...new Set(r.unverifiable.filter((f) => f.code === code).map((f) => f.side))].join(", ");
    return [`\`${code}\``, sides];
  });
  const whRows = r.withheldReferents.map((f) => [`\`${f.code}\``, f.side, f.where, f.reason]);

  return (
    `---\n` +
    `type: "id-alignment-ledger"\n` +
    `pericope: "${r.pericope}"\n` +
    `map: "${baseName(r.mapPath)}"\n` +
    `meaning-coordinates: "${baseName(r.mcPath)}"\n` +
    `status: "${status}"\n` +
    `pilot: "pilot-2"\n` +
    `sc_ref: "SC-0018"\n` +
    `---\n\n` +
    `# ${r.pericope} — CROSS-ARTIFACT ID-ALIGNMENT LEDGER\n\n` +
    `> **${c.refErrors} ref-integrity · ${c.nameErrors} name-binding · ${c.misalign} misalignment (${c.likelySameReferent} LIKELY_SAME_REFERENT) · ${c.flagMismatch} flag-mismatch · ${c.dangling} dangling · ${c.unverifiable} unverifiable · ${c.withheld} withheld-referent · ${c.accepted} accepted.**\n>\n` +
    `> SC-0018, the 5th deterministic check (legal · complete · atomic-bare-plain · **aligned** · true).\n` +
    `> DIAGNOSTIC ONLY — the prose map and the MEANING_COORDINATES are two halves of one training pair; an entity\n` +
    `> named in one must be the same canonical code the other uses. This inventory is ruled by a human; it fixes nothing.\n\n` +
    `## Reference integrity — code with no registry entry (${r.referenceIntegrity.length})\n\n` +
    `_B/PL/O/TM/I resolve via the book's per-book alias table; \`CB_\`/\`FIG_\` via the **global** \`concepts.json\`/\`figures.json\` (canon-wide, SC-0037). Unknown ⇒ **ERROR**._\n\n` +
    table(["side", "code", "where", "reason", "severity"], riRows) +
    `\n## Name-binding — map slug ≠ canonical name (${r.nameBinding.length})\n\n` +
    `_B/PL/O/TM/I: slug = slugify(BCD English name) (trim · whitespace→\`-\` · Title-Case preserved). \`CB_\`/\`FIG_\`: slug = the registry \`name_slug\` or a known alias. Catches typos and wrong-code-on-name._\n\n` +
    table(["code", "where", "slug found", "slug expected", "canonical name", "severity"], nbRows) +
    `\n## Cross-artifact misalignment — structural symmetric difference (${r.misalignments.length})\n\n` +
    `_Per aligned scene (map §3 ↔ MEANING_COORDINATES scene_id), entities only (B/PL/O/TM/I/TH). \`LIKELY_SAME_REFERENT\` = an unmatched map code + FM code sharing a stem (the highest-value finding, e.g. \`TM_TEN_YEARS\` ↔ \`TH_TEN_YEARS_APPROXIMATELY\`)._\n\n` +
    table(["scope", "direction", "code", "tag", "severity"], maRows) +
    `\n## CB_/FIG_ flag mismatch — flag-set symmetric difference (${r.flagMismatches.length})\n\n` +
    `_Flags are compared in their real homes: the map's frontmatter \`active-concepts\`/\`active-figures\` + §5 Flags vs the MEANING_COORDINATES's \`cb_flags\`/\`figure_flags\`. An aligned flag never reports; only a genuinely one-sided flag does._\n\n` +
    table(["kind", "direction", "code", "severity"], fmiRows) +
    `\n## Dangling note links (${r.danglingNotes.length})\n\n` +
    `_A non-entity map \`[[Note-Title]]\` that names no real note. Known pilot-2 sibling artifacts (\`-MEANING-COORDINATES\`/\`-COMPILATION-LOG\`/\`-BCD-DELTA\`/\`-VERIFICATION-INPUT[-en]\`/\`-COVERAGE-LEDGER\`) and discourse-thread refs (\`T#-…\`) resolve; a stale \`[[…-AUDIT]]\` still flags — pilot-2 has no AUDIT._\n\n` +
    table(["note", "where", "detail", "severity"], dnRows) +
    `\n## Unverifiable codes — schema-legal, no vendored registry tracks them (${uvRows.length})\n\n` +
    `_\`TH_\` (thematic overlay): legal per the schema, but vendored in no registry, so reference-integrity cannot verify it here. Surfaced, not errored. (\`CB_\`/\`FIG_\` are now verifiable — see above.)_\n\n` +
    table(["code", "sides"], uvRows) +
    `\n## Withheld referents — intentional \`<NS>?\` gaps (${whRows.length})\n\n` +
    `_A schema-legal code ending in \`?\` (e.g. \`B?\`, the \`b_code\` pattern \`^B(\\d+|\\?)$\`) is an INTENTIONAL withheld referent — the artifact declines to bind the slot to a registered entity (P06's deceased-husband, "her husband (pair withheld; see P01-D2)"). INFO only: it cannot resolve in a registry and cannot align across artifacts, so it is excluded from reference-integrity and the structural symmetric difference._\n\n` +
    table(["code", "side", "where", "reason"], whRows)
  );
}

function severityCell(sev: string, accepted?: { reason: string }): string {
  if (sev === "ACCEPTED") return `✓ accepted (${accepted?.reason ?? ""})`;
  if (sev === "MISALIGN") return "~ misalign";
  if (sev === "FLAG") return "⚑ flag";
  return "✗ error";
}
