import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readMeaningMap } from "../src/reader/meaning-map.js";

// SC-0047 — the §5 flag-pointer parenthetical leak. A §5 entry's prop pointers live BEFORE the
// parenthetical; the parenthetical is commentary and may legitimately name ANOTHER pericope's
// propositions ("cross-pericope pair with J01 Proposition 1"). The old parser scanned the whole
// line, so J04's FIG_0196 note flagged local P1 (YHWH speaks to the fish) — a wrong supervision
// signal. The pointers must come only from the pre-parenthetical segment.

const MAP = `---
type: "pericope"
pericope-num: "T01"
bcv: "Test 1:1–2"
genre-group: "NARRATIVE"
genre: "HISTORICAL_NARRATIVE"
register: "INFORMAL_CASUAL"
---

# T01 — Test 1:1–2

## 1. Metadata
- **Pericope title:** test

## 2. Level 1 — Whole-Passage Movement
### 2.1 Prose Arc / Shape / Argument / Burden / Concern
x.
### 2.2 Context
x.
### 2.3 Emotion / Tone / Pace
x.
### 2.4 Communicative Function
x.

## 3. Level 2 — Scenes / Episodes
### Scene 1 — test (v.1–2)
**3A — Beings**
[[B1-Someone]] — x / Someone
- Role: x
- Presence: PRESENT
**3B — Places**
None: no place.
**3C — Objects and Concepts**
None: no persistent objects in this scene.
**3D — Times**
- None: none.
**3E — What Happens**
x.
**3F — Communicative Purpose**
x.

## 4. Level 3 — Proposition Inventory
### Proposition 1 — Test 1:1 [Scene 1]
- **Q:** What happened? **A:** one
### Proposition 2 — Test 1:2 [Scene 1]
- **Q:** What happened? **A:** two

## 5. Flags

**5A — Concept Bank Flags**

**5B — Figure Flags**
- [[FIG_0001-Test-Figure]] — active at Proposition 2 (cross-pericope pair with J01 Proposition 1)
`;

let tmp: string;
let mapPath: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "tripod-flagparse-"));
  mapPath = join(tmp, "T01-Test-1-1-2.md");
  writeFileSync(mapPath, MAP);
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("SC-0047 — §5 flag pointers stop at the parenthetical", () => {
  it("flags the declared proposition, and NOT the one named inside the cross-pericope note", () => {
    const mm = readMeaningMap(mapPath);
    const p1 = mm.propositions.find((p) => p.propId === "MM_P1")!;
    const p2 = mm.propositions.find((p) => p.propId === "MM_P2")!;
    expect(p2.figFlags).toContain("FIG_0001");
    expect(p1.figFlags, "the parenthetical's 'Proposition 1' must NOT become a local pointer").toEqual([]);
  });
});
