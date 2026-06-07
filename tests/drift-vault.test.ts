import { describe, it, expect } from "vitest";
import { copyFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkDrift, loadPins } from "../src/spec/pins.js";
import { SPEC_DIR } from "../src/spec/load.js";

// SC-0008 — the absent-canonical-schema blind spot.
// Before the fix, a pinned schema missing from the vault set `vaultOk = undefined`, which the
// exit code ignored: a missing canonical file passed silently. The fix makes absent == drift.
describe("check-drift --vault — absent canonical schema is drift (SC-0008)", () => {
  it("flags a pinned schema MISSING from the vault as drift, not a silent undefined", () => {
    // Stand-in vault: every pinned schema copied (so it matches the pin) EXCEPT one left absent.
    const tmp = mkdtempSync(join(tmpdir(), "tripod-vault-"));
    const omitted = "verification-input.schema.json";
    for (const f of Object.keys(loadPins().schemas)) {
      if (f === omitted) continue;
      copyFileSync(join(SPEC_DIR, f), join(tmp, f));
    }
    const results = checkDrift(tmp);

    const missing = results.find((r) => r.file === omitted);
    expect(missing?.vaultAbsent).toBe(true);
    expect(missing?.vaultOk).toBe(false); // the fix: absent counts as drift (was `undefined`, ignored)

    const present = results.find((r) => r.file === "validation-rules.json");
    expect(present?.vaultOk).toBe(true); // a present, matching schema still reads ok
  });
});

// The live guard: run `check-drift --vault` against the real wiki _spec when configured, and
// skip VISIBLY otherwise — never a silent green (the false-green this whole bug class is about).
// NOTE (SC-0008): with TRIPOD_VAULT_SPEC set, this is EXPECTED to be red until the vault writeback
// lands — it is catching the real, pre-existing drift, not a regression.
const vaultDir = process.env.TRIPOD_VAULT_SPEC;
if (!vaultDir) {
  console.warn(
    "⚠ SC-0008 vault-drift guard SKIPPED — set TRIPOD_VAULT_SPEC=<wiki>/_spec " +
      "(e.g. ~/Github/ruth-pilot-b-wiki/_spec) to run it.",
  );
}
describe("SC-0008 — upstream vault-drift guard (conditional)", () => {
  it.skipIf(!vaultDir)(
    "the wiki _spec/ matches the pinned spec — no upstream drift, no missing canonical files",
    () => {
      const drifted = checkDrift(vaultDir)
        .filter((r) => r.vaultOk === false)
        .map((r) => (r.vaultAbsent ? `${r.file} (MISSING)` : r.file));
      expect(drifted, `vault drift vs pins: ${drifted.join(", ") || "(none)"}`).toEqual([]);
    },
  );
});
