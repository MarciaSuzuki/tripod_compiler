import { configDefaults, defineConfig } from 'vitest/config';

// The compiler test board must not discover portal/ — the review portal
// (SC-0043, Tier B) is a self-contained npm package whose tests run on the
// Node built-in runner (`cd portal && npm test`), not vitest. Without this
// exclude, vitest's default glob picks up portal/test/*.test.mjs and reports
// 3 file-level failures ("No test suite found") while the board's own tests
// still pass — a false-red board. configDefaults.exclude is preserved
// verbatim; this only ADDS the portal exclusion and cannot change which
// compiler tests run.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'portal/**'],
  },
});
