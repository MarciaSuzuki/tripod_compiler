import { describe, it, expect } from "vitest";
import { suggestReuse } from "../src/engine/concept-check.js";
import type { CodeRegistry } from "../src/reader/source-packet.js";

// SC-0037 — the cross-canon consistency check (the new-book guard). A new book that re-mints an
// existing canon concept under a fresh code should be flagged as a suggested reuse; a genuinely-new
// concept should stay quiet (so the check is signal, not noise).
const reg: CodeRegistry = {
  kind: "CONCEPT",
  entries: {
    CB_0028: { code: "CB_0028", name_slug: "Famine", aliases: [], appears_in: ["RUTH"] },
    CB_0015: { code: "CB_0015", name_slug: "Hand-of-YHWH", aliases: [], appears_in: ["RUTH"] },
    CB_0052: { code: "CB_0052", name_slug: "Before-the-Face-of-YHWH", aliases: [], appears_in: ["JONAH"] },
    CB_0053: { code: "CB_0053", name_slug: "Famine", aliases: [], appears_in: ["JONAH"] }, // planted near-dup
  },
};

describe("SC-0037 concept-check — suggest-reuse (the new-book guard)", () => {
  it("suggests reuse when a new book re-mints an existing canon concept", () => {
    const s = suggestReuse(reg, "jonah");
    const dup = s.find((x) => x.candidate === "CB_0053");
    expect(dup).toBeDefined();
    expect(dup!.match).toBe("CB_0028");
    expect(dup!.matchBooks).toContain("RUTH");
  });
  it("stays quiet for a genuinely-new concept (Before-the-Face-of-YHWH ≠ Hand-of-YHWH)", () => {
    const s = suggestReuse(reg, "jonah");
    expect(s.find((x) => x.candidate === "CB_0052")).toBeUndefined();
  });
});
