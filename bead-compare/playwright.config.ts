import { defineConfig } from "@playwright/test";
import fs from "node:fs";

/**
 * Playwright end-to-end smoke test for Bead Compare (`npm run test:e2e`).
 *
 * Server: the real production bundle. `webServer` runs `vite build` and then
 * `vite preview --port 4173 --strictPort`, so the tests exercise exactly what
 * gets deployed (relative `base`, `fixtures/` as publicDir, hash router).
 * With `reuseExistingServer` (outside CI) an already-running preview on 4173
 * is reused, so rebuild or stop it after changing the app.
 *
 * Browser: headless Chromium. When `PLAYWRIGHT_CHROMIUM_EXECUTABLE` is set,
 * or the pre-installed build at /opt/pw-browsers/chromium exists, that binary
 * is used (the environment ships a Chromium whose revision may differ from
 * the one this Playwright version would download). Otherwise Playwright's
 * own managed Chromium is used.
 *
 * Chromium flags: autoplay without a gesture so Web Audio starts headlessly,
 * and a fake media device/UI so getUserMedia never prompts.
 *
 * Storage: each test gets a fresh browser context, hence an empty IndexedDB
 * and localStorage. `page.reload()` keeps the context, so persistence checks
 * stay inside one test.
 */

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/`;

const preinstalled = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? "/opt/pw-browsers/chromium";
const executablePath = fs.existsSync(preinstalled) ? preinstalled : undefined;

export default defineConfig({
  testDir: "e2e",
  testMatch: /.*\.spec\.ts$/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    headless: true,
    acceptDownloads: true,
    trace: "retain-on-failure",
    locale: "pt-BR",
    viewport: { width: 1200, height: 900 },
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
