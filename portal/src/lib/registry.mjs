import fs from 'node:fs';
import path from 'node:path';

// Public registry JSONs (read-only consumption of _spec/registry/):
//   <book>.aliases.json — per-book entity registry (B/PL/O/TH/TM/I codes →
//                          english, hebrew, kind, referential forms)
//   concepts.json        — global Concept Bank (CB_#### → name_slug, books)
//   figures.json         — global Figure Registry (FIG_#### → name_slug, books)
// These power wikilink resolution + hover tooltips. The portal never writes them.

export function loadRegistries(repoRoot, booksCfg) {
  const regDir = path.join(repoRoot, '_spec', 'registry');
  const readJson = (file) => JSON.parse(fs.readFileSync(path.join(regDir, file), 'utf8'));

  const byPrefix = new Map();
  for (const book of booksCfg) {
    const data = readJson(book.aliasesFile);
    byPrefix.set(book.prefix, {
      ...book,
      entities: data.entities ?? {},
    });
  }

  const concepts = readJson('concepts.json').entries ?? {};
  const figures = readJson('figures.json').entries ?? {};

  return {
    byPrefix,
    concepts,
    figures,
    bookFor(pericopeId) {
      return byPrefix.get(String(pericopeId).charAt(0)) ?? null;
    },
    entity(bookPrefix, code) {
      return byPrefix.get(bookPrefix)?.entities?.[code] ?? null;
    },
    concept(code) {
      return concepts[code] ?? null;
    },
    figure(code) {
      return figures[code] ?? null;
    },
  };
}

/** "Judges-Era" → "Judges Era" */
export function deSlug(slug) {
  return String(slug).replace(/-/g, ' ');
}

/** Tooltip line for an entity: code · Hebrew · English · kind. */
export function entityTooltip(code, e) {
  const parts = [code];
  if (e.hebrew) parts.push(e.hebrew);
  if (e.english) parts.push(e.english);
  if (e.kind) parts.push(e.kind);
  return parts.join(' · ');
}
