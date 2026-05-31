import type { CoverageLedger } from "../engine/coverage.js";
import type { SourcePacket } from "../reader/source-packet.js";

/**
 * Render the coverage reconciliation ledger (docs/COVERAGE.md §"deliverable") for the CLI and as
 * a wiki-fileable note for the pericope's audit trail. Three buckets + the one-line coverage score,
 * with the doc's confidence asymmetry made visible (block vs warn vs tick).
 */

function table(header: string[], rows: string[][]): string {
  if (rows.length === 0) return "_none._\n";
  const head = `| ${header.join(" | ")} |`;
  const sep = `| ${header.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}\n`;
}

/** Compact human-readable summary for `tripod coverage` stdout. */
export function formatLedgerText(led: CoverageLedger): string {
  const s = led.score;
  const lines: string[] = [];
  lines.push(`${led.ok ? "✓" : "✗"} COVERAGE  ${led.pericope}  (${led.bcv})  ·  BHSA ${led.bhsa_version}`);
  lines.push(`   ${led.score_line}`);
  lines.push(
    `   matched ${s.explicit_matched}/${s.explicit_total} explicit · ${s.checklist} to tick · ${s.minor} minor (pronoun/suffix) · ` +
      `entities ${s.entities_anchored}/${s.entities_total} anchored (${s.unanchored_abstract} abstract overlay${s.unanchored_abstract === 1 ? "" : "s"} unanchored)`,
  );
  if (!led.ok) {
    lines.push(`   ✗ ${led.blockers.length} blocker(s):`);
    for (const b of led.blockers) lines.push(`      ✗ ${b}`);
  }
  const proper = led.unmapped_source.filter((u) => u.subtag === "proper" && !u.accepted);
  if (proper.length) {
    lines.push(`   possible omissions (named referents absent from the map):`);
    for (const u of proper) lines.push(`      ✗ ${u.verse}  ${u.surface}  ${u.gloss}`);
  }
  const accepted = [
    ...led.unmapped_source.filter((u) => u.accepted),
    ...led.unanchored_entities.filter((e) => e.accepted),
  ];
  if (accepted.length) {
    lines.push(`   accepted exceptions (reviewer signed off — not blocking):`);
    for (const u of led.unmapped_source.filter((x) => x.accepted))
      lines.push(`      ✓ ${u.verse}  ${u.surface} (${u.gloss})  [${u.accepted!.reason}${u.accepted!.accepted_by ? ` — ${u.accepted!.accepted_by}` : ""}]`);
    for (const e of led.unanchored_entities.filter((x) => x.accepted))
      lines.push(`      ✓ ${e.entity_id} (${e.kind})  [${e.accepted!.reason}${e.accepted!.accepted_by ? ` — ${e.accepted!.accepted_by}` : ""}]`);
  }
  const checklist = led.unmapped_source.filter((u) => u.subtag === "checklist");
  if (checklist.length) {
    lines.push(`   source nouns to tick (interpretive — reviewer confirms or dismisses):`);
    lines.push(`      ${checklist.map((u) => `${u.gloss}@${u.verse}`).join(" · ")}`);
  }
  const implied = led.unmapped_source.filter((u) => u.subtag === "implied_subject");
  if (implied.length) {
    lines.push(`   implied subjects flagged (verb-morphology actor — reviewer confirms the participant):`);
    for (const u of implied)
      lines.push(`      ~ ${u.verse}  ${u.surface} (${u.gloss})${u.likely_impersonal ? "  [likely impersonal — dismiss]" : `  → likely ${u.best_guess_entity ?? "?"}`}`);
  }
  if (s.unanchored_abstract) {
    lines.push(`   abstract overlays without a single surface anchor (interpretive, not red):`);
    lines.push(`      ${led.unanchored_entities.filter((e) => e.abstract).map((e) => e.entity_id).join(" · ")}`);
  }
  return lines.join("\n");
}

/** Full ledger as a wiki note (frontmatter + score + the three bucket tables). */
export function renderLedgerNote(led: CoverageLedger, packet: SourcePacket): string {
  const fmStatus = led.ok ? "valid" : "blocked";
  const matchedRows = led.matched.map((m) => [m.verse, m.surface, `\`${m.gloss}\``, m.referent_class, `**${m.entity_id}**`, m.via]);
  const unmapped = led.unmapped_source.filter((u) => u.subtag !== "implied_subject");
  const unmappedRows = unmapped.map((u) => {
    const sev = u.accepted
      ? `✓ accepted (${u.accepted.reason})`
      : u.subtag === "proper" ? "✗ block" : u.subtag === "checklist" ? "tick" : "minor";
    return [u.verse, u.surface, `\`${u.gloss}\``, u.referent_class, u.subtag, sev];
  });
  const impliedRows = led.unmapped_source
    .filter((u) => u.subtag === "implied_subject")
    .map((u) => [u.verse, u.surface, `\`${u.gloss}\``, u.likely_impersonal ? "likely impersonal — dismiss" : `→ likely ${u.best_guess_entity ?? "?"}`]);
  const unanchoredRows = led.unanchored_entities.map((e) => [
    `**${e.entity_id}**`,
    e.kind,
    e.verses.join(", "),
    e.referential_forms.join("; ") || "—",
    e.accepted ? `✓ accepted (${e.accepted.reason})` : e.abstract ? "~ warn (abstract overlay)" : "✗ block",
  ]);

  return (
    `---\n` +
    `type: "coverage-ledger"\n` +
    `pericope: "${led.pericope}"\n` +
    `bcv: "${led.bcv}"\n` +
    `source: "BHSA ${led.bhsa_version} · extractor ${packet.extractor_version}"\n` +
    `status: "${fmStatus}"\n` +
    `pilot: "pilot-2"\n` +
    `---\n\n` +
    `# ${led.pericope} — ${led.bcv} — COVERAGE LEDGER\n\n` +
    `> **${led.score_line}**\n>\n` +
    `> Gate order: conformance → **coverage (this)** → reading-quality. Coverage reconciles the BHSA\n` +
    `> referent set R against the map's entity mentions M (docs/COVERAGE.md). "Nothing added" is\n` +
    `> near-mechanical; "nothing missing" is explicit (airtight) + implied (flagged) + interpretive (tick).\n\n` +
    `## MATCHED — source expression ↔ map entity (${led.matched.length})\n\n` +
    table(["verse", "surface", "gloss", "class", "entity", "via"], matchedRows) +
    `\n## UNMAPPED_SOURCE — in the text, not (yet) in the map (${unmapped.length})\n\n` +
    `_\`proper\` = named referent absent from the map (**block**); \`checklist\` = source noun the reviewer ticks; \`minor\` = pronoun/suffix/adjective (bound)._\n\n` +
    table(["verse", "surface", "gloss", "class", "tag", "severity"], unmappedRows) +
    `\n## UNANCHORED_ENTITY — in the map, no source expression can host it (${led.unanchored_entities.length})\n\n` +
    `_Non-abstract = possible hallucination (**block**); \`TH_\`/\`CB_\` overlays have no single surface anchor (interpretive, warn)._\n\n` +
    table(["entity", "kind", "verses", "referential_forms", "severity"], unanchoredRows) +
    `\n## Implied subjects — verb-morphology actors to confirm (${impliedRows.length})\n\n` +
    `_The class a human reviewer most often misses. Confirm the participant; \`vayhi\`-type existentials are impersonal._\n\n` +
    table(["verse", "surface", "gloss", "resolution"], impliedRows)
  );
}
