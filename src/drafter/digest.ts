import { loadSpecJson } from "../spec/load.js";

/**
 * Deterministic context digests for the FOR_MODEL drafter (SC-0063).
 * Rules live in the pinned prompt (_spec/drafter/fm-drafter-prompt.md); the DATA the rules
 * point at is rendered here from the pinned spec files, so the prompt does not drift when an
 * enumeration grows. Everything renders in pinned-file order — byte-stable for caching and
 * for the dry-run reproducibility guarantee.
 */

const CLOSED_FOR_DRAFTER = ["GENRE_GROUP", "GENRE", "REGISTER", "SPEECH_ACT", "NARRATIVE_FRAMING"] as const;

export function closedListsDigest(): string {
  const rules = loadSpecJson<any>("validation-rules.json");
  const cl = rules.closed_lists ?? {};
  const lines: string[] = ["## SPEC DIGEST — L1 closed lists (never expand; hard validation errors)", ""];
  for (const name of CLOSED_FOR_DRAFTER) {
    const vals = cl[name];
    if (Array.isArray(vals)) lines.push(`${name} (${vals.length}): ${vals.join(" · ")}`, "");
  }
  lines.push(
    "REGISTER RULE (v0.16, genre-aware): genre_group NARRATIVE → pericope register is INFORMAL_CASUAL " +
      "(the narrator's plain chronicle voice); non-NARRATIVE genre_groups choose from the closed 7 by the " +
      "text's own register. Texture goes in register_overrides, never the pericope value.",
    "",
    `FORBIDDEN event_specific_slots keys: ${(cl.FORBIDDEN_GRAMMATICAL_FRAME_SLOT_NAMES ?? []).join(" · ")}`,
    `FORBIDDEN speech-act values: ${(cl.FORBIDDEN_GRAMMATICAL_MOOD_SPEECH_ACTS ?? []).join(" · ")}`,
  );
  return lines.join("\n");
}

export function approvedAxesDigest(): string {
  const ae = loadSpecJson<any>("approved-enumerations.json");
  const lines: string[] = [
    `## SPEC DIGEST — L2 approved enumerations (approved-enumerations ${ae.version ?? "?"}; reuse first, mint = vocabulary_additions with justification)`,
    "",
  ];
  for (const [axis, entries] of Object.entries<any>(ae.axes ?? {})) {
    const vals = (entries as any[]).map((e) => e.value);
    lines.push(`${axis} (${vals.length}): ${vals.join(" · ")}`, "");
  }
  return lines.join("\n");
}

/** Book cast + canon banks: the IDs the drafter is allowed to write. */
export function registryDigest(book: string): string {
  const aliases = loadSpecJson<any>(`registry/${book}.aliases.json`);
  const concepts = loadSpecJson<any>("registry/concepts.json");
  const figures = loadSpecJson<any>("registry/figures.json");
  const lines: string[] = [`## REGISTRY DIGEST — ${book} cast + canon concept/figure banks (IDs you may reference)`, "", `### Cast (${book})`];
  for (const [code, e] of Object.entries<any>(aliases.entities ?? {})) {
    let line = `${code} · ${e.english ?? "?"} · ${e.kind ?? "?"}`;
    if (Array.isArray(e.referential_forms) && e.referential_forms.length) line += ` · forms: ${e.referential_forms.join(", ")}`;
    lines.push(line);
  }
  lines.push("", "### Concept Bank (canon-wide)");
  for (const [code, e] of Object.entries<any>(concepts.entries ?? {})) {
    lines.push(`${code} · ${e.name_slug ?? "?"} · appears_in: ${(e.appears_in ?? []).join(",")}`);
  }
  lines.push("", "### Figure Registry (canon-wide)");
  for (const [code, e] of Object.entries<any>(figures.entries ?? {})) {
    lines.push(`${code} · ${e.name_slug ?? "?"} · appears_in: ${(e.appears_in ?? []).join(",")}`);
  }
  return lines.join("\n");
}
