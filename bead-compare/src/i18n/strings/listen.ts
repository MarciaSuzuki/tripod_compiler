import type { StringModule } from "../index";

/**
 * Listen screen strings (#/listen/:versionId). Keys are `listen.section.item`.
 *
 * Placeholder: the Listen engineer replaces this file. Keep the named export
 * `listen`, which `src/i18n/index.tsx` imports and merges; both languages
 * must define the same keys (tests/i18n.test.ts checks).
 */
export const listen = {
  "pt-BR": {},
  en: {},
} satisfies StringModule;
