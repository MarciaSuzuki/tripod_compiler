import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { groupClusters } from "../src/model";
import type { Comment, FrameRange } from "../src/model";
import {
  AUTHOR_KEY,
  SERIES_LIMIT,
  clusterRange,
  clustersInside,
  extendSelection,
  firstClusterRange,
  formatSeries,
  hasSelection,
  isTextEntryTarget,
  keyboardAction,
  markersFromComments,
  nextClusterRange,
  rangeToSpan,
  readStoredAuthor,
  resolveAuthor,
  resolveKeyAction,
  sameRange,
  selectionValues,
  spanToRange,
  speechClusters,
  wholeRange,
  writeStoredAuthor,
} from "../src/screens/listenLogic";
import { comment, tape } from "./helpers";

const g = { min_cluster_frames: 3 };

// pause 0..5 | speech A 5..15 | pause 15..20 | speech B 20..30 | speech C 30..35 | pause 35..40 | speech D 40..50
const t = tape([
  [49, 5],
  [5, 10],
  [49, 5],
  [7, 10],
  [8, 5],
  [49, 5],
  [9, 10],
]);
const clusters = groupClusters(t, g);
const A: FrameRange = { start: 5, end: 15 };
const B: FrameRange = { start: 20, end: 30 };
const C: FrameRange = { start: 30, end: 35 };
const D: FrameRange = { start: 40, end: 50 };

describe("fixture sanity", () => {
  it("groups the tape as expected", () => {
    expect(clusters.map((c) => [c.start, c.end, c.is_pause])).toEqual([
      [0, 5, true],
      [5, 15, false],
      [15, 20, true],
      [20, 30, false],
      [30, 35, false],
      [35, 40, true],
      [40, 50, false],
    ]);
  });
});

describe("ranges", () => {
  it("clusterRange, wholeRange, spanToRange and rangeToSpan", () => {
    expect(clusterRange(clusters[1])).toEqual(A);
    expect(wholeRange(50)).toEqual({ start: 0, end: 50 });
    expect(wholeRange(-3)).toEqual({ start: 0, end: 0 });
    expect(wholeRange(12.7)).toEqual({ start: 0, end: 12 });
    expect(spanToRange({ version_id: "v", start_frame: 3, end_frame: 9 })).toEqual({ start: 3, end: 9 });
    expect(rangeToSpan("v", { start: 3, end: 9 })).toEqual({ version_id: "v", start_frame: 3, end_frame: 9 });
  });

  it("hasSelection rejects null, empty and inverted ranges", () => {
    expect(hasSelection(null)).toBe(false);
    expect(hasSelection(undefined)).toBe(false);
    expect(hasSelection({ start: 5, end: 5 })).toBe(false);
    expect(hasSelection({ start: 9, end: 5 })).toBe(false);
    expect(hasSelection({ start: NaN, end: 5 })).toBe(false);
    expect(hasSelection(A)).toBe(true);
  });

  it("sameRange compares by value and treats null/undefined alike", () => {
    expect(sameRange(A, { start: 5, end: 15 })).toBe(true);
    expect(sameRange(A, B)).toBe(false);
    expect(sameRange(null, undefined)).toBe(true);
    expect(sameRange(null, A)).toBe(false);
    expect(sameRange(A, null)).toBe(false);
  });
});

describe("speech clusters", () => {
  it("skips pauses, falling back to every cluster when there is no speech", () => {
    expect(speechClusters(clusters).map((c) => c.start)).toEqual([5, 20, 30, 40]);
    const silent = groupClusters(tape([[49, 10]]), g);
    expect(speechClusters(silent)).toEqual(silent);
    expect(speechClusters([])).toEqual([]);
  });

  it("firstClusterRange is the first speech cluster, not the leading pause", () => {
    expect(firstClusterRange(clusters)).toEqual(A);
    expect(firstClusterRange([])).toBeNull();
    expect(firstClusterRange(groupClusters(tape([[49, 10]]), g))).toEqual({ start: 0, end: 10 });
  });

  it("clustersInside lists the speech clusters fully covered by a range", () => {
    expect(clustersInside(clusters, { start: 5, end: 35 }).map(clusterRange)).toEqual([A, B, C]);
    expect(clustersInside(clusters, { start: 7, end: 35 }).map(clusterRange)).toEqual([B, C]);
    expect(clustersInside(clusters, { start: 15, end: 20 })).toEqual([]);
  });
});

describe("nextClusterRange", () => {
  it("finds the speech cluster beyond the selection on either side, absorbing pauses", () => {
    expect(nextClusterRange(clusters, A, "right")).toEqual(B);
    expect(nextClusterRange(clusters, B, "right")).toEqual(C);
    expect(nextClusterRange(clusters, C, "right")).toEqual(D);
    expect(nextClusterRange(clusters, D, "left")).toEqual(C);
    expect(nextClusterRange(clusters, B, "left")).toEqual(A);
  });

  it("returns null at the edges of the tape", () => {
    expect(nextClusterRange(clusters, D, "right")).toBeNull();
    expect(nextClusterRange(clusters, A, "left")).toBeNull();
    expect(nextClusterRange([], A, "right")).toBeNull();
  });

  it("works from a selection that only covers a pause", () => {
    const pause: FrameRange = { start: 15, end: 20 };
    expect(nextClusterRange(clusters, pause, "right")).toEqual(B);
    expect(nextClusterRange(clusters, pause, "left")).toEqual(A);
  });

  it("snaps an unaligned selection edge to the cluster containing it", () => {
    expect(nextClusterRange(clusters, { start: 22, end: 27 }, "right")).toEqual(B);
    expect(nextClusterRange(clusters, { start: 22, end: 27 }, "left")).toEqual(B);
  });
});

describe("extendSelection", () => {
  it("selects the first speech cluster when there is no selection, whatever the key", () => {
    expect(extendSelection(clusters, null, "right")).toEqual(A);
    expect(extendSelection(clusters, null, "left")).toEqual(A);
    expect(extendSelection(clusters, undefined, "right", true)).toEqual(A);
    expect(extendSelection(clusters, { start: 8, end: 8 }, "left", true)).toEqual(A);
    expect(extendSelection([], null, "right")).toBeNull();
  });

  it("grows to the right one speech cluster at a time, absorbing pauses", () => {
    const s1 = extendSelection(clusters, A, "right");
    expect(s1).toEqual({ start: 5, end: 30 });
    const s2 = extendSelection(clusters, s1, "right");
    expect(s2).toEqual({ start: 5, end: 35 });
    const s3 = extendSelection(clusters, s2, "right");
    expect(s3).toEqual({ start: 5, end: 50 });
    expect(extendSelection(clusters, s3, "right")).toEqual(s3); // at the end: unchanged
  });

  it("grows to the left one speech cluster at a time", () => {
    const s1 = extendSelection(clusters, D, "left");
    expect(s1).toEqual({ start: 30, end: 50 });
    const s2 = extendSelection(clusters, s1, "left");
    expect(s2).toEqual({ start: 20, end: 50 });
    const s3 = extendSelection(clusters, s2, "left");
    expect(s3).toEqual({ start: 5, end: 50 });
    expect(extendSelection(clusters, s3, "left")).toEqual(s3); // at the start: unchanged
  });

  it("shrinks: Shift+Left drops the last cluster, Shift+Right drops the first", () => {
    const all: FrameRange = { start: 5, end: 50 };
    expect(extendSelection(clusters, all, "left", true)).toEqual({ start: 5, end: 35 });
    expect(extendSelection(clusters, all, "right", true)).toEqual({ start: 20, end: 50 });
    // trailing pause inside the selection stays put when shrinking from the left
    expect(extendSelection(clusters, { start: 5, end: 40 }, "right", true)).toEqual({ start: 20, end: 40 });
  });

  it("never shrinks below one speech cluster", () => {
    expect(extendSelection(clusters, A, "left", true)).toEqual(A);
    expect(extendSelection(clusters, A, "right", true)).toEqual(A);
    const pauseOnly: FrameRange = { start: 15, end: 20 };
    expect(extendSelection(clusters, pauseOnly, "left", true)).toEqual(pauseOnly);
  });

  it("grow then shrink returns to where it started", () => {
    const grown = extendSelection(clusters, B, "right");
    expect(extendSelection(clusters, grown, "left", true)).toEqual(B);
    const grownLeft = extendSelection(clusters, B, "left");
    expect(extendSelection(clusters, grownLeft, "right", true)).toEqual(B);
  });
});

describe("markersFromComments", () => {
  it("maps each comment to a marker and flags the active and carried ones", () => {
    const a = comment("v", 5, 15, "fix_requested", "open");
    const b: Comment = { ...comment("v", 20, 30, "note", "resolved"), id: "b", carried_from: "orig" };
    const markers = markersFromComments([a, b], "b");
    expect(markers).toEqual([
      { id: a.id, range: { start: 5, end: 15 }, kind: "fix_requested", status: "open", active: false, carried: false },
      { id: "b", range: { start: 20, end: 30 }, kind: "note", status: "resolved", active: true, carried: true },
    ]);
    expect(markersFromComments([a], null).map((m) => m.active)).toEqual([false]);
    expect(markersFromComments([], "x")).toEqual([]);
    // an optional label names the marker for assistive technology
    expect(markersFromComments([a], null, (c) => `${c.kind} by ${c.author}`)[0]!.ariaLabel).toBe("fix_requested by test");
  });
});

describe("author", () => {
  class MemoryStorage implements Storage {
    private map = new Map<string, string>();
    get length(): number {
      return this.map.size;
    }
    clear(): void {
      this.map.clear();
    }
    getItem(key: string): string | null {
      return this.map.has(key) ? (this.map.get(key) as string) : null;
    }
    key(index: number): string | null {
      return Array.from(this.map.keys())[index] ?? null;
    }
    removeItem(key: string): void {
      this.map.delete(key);
    }
    setItem(key: string, value: string): void {
      this.map.set(key, String(value));
    }
  }

  let store: MemoryStorage;
  beforeEach(() => {
    store = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true, writable: true });
  });
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it("resolveAuthor uses the typed name or the fallback", () => {
    expect(resolveAuthor("Marcia", "Consultor(a)")).toBe("Marcia");
    expect(resolveAuthor("  Marcia  ", "Consultor(a)")).toBe("Marcia");
    expect(resolveAuthor("   ", "Consultor(a)")).toBe("Consultor(a)");
    expect(resolveAuthor("", "Consultant")).toBe("Consultant");
    expect(resolveAuthor(null, "Consultant")).toBe("Consultant");
    expect(resolveAuthor(undefined, "Consultant")).toBe("Consultant");
  });

  it("remembers the author under bead-compare.author", () => {
    expect(AUTHOR_KEY).toBe("bead-compare.author");
    expect(readStoredAuthor()).toBe("");
    writeStoredAuthor("Ana");
    expect(store.getItem(AUTHOR_KEY)).toBe("Ana");
    expect(readStoredAuthor()).toBe("Ana");
  });

  it("survives a missing localStorage", () => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(readStoredAuthor()).toBe("");
    expect(() => writeStoredAuthor("Ana")).not.toThrow();
  });
});

describe("technical details helpers", () => {
  it("selectionValues slices U and F over the selection, clamped to the tape", () => {
    const small = tape([
      [5, 3, 10],
      [49, 2],
      [7, 2, 12],
    ]);
    expect(selectionValues(small, { start: 1, end: 6 })).toEqual({ u: [5, 5, 49, 49, 7], f: [10, 10, 0, 0, 12] });
    expect(selectionValues(small, { start: -4, end: 99 })).toEqual({ u: small.u, f: small.f });
    expect(selectionValues(small, null)).toEqual({ u: [], f: [] });
    expect(selectionValues(small, { start: 3, end: 3 })).toEqual({ u: [], f: [] });
  });

  it("formatSeries joins values and cuts long series with an ellipsis", () => {
    expect(formatSeries([])).toBe("");
    expect(formatSeries([5, 5, 7])).toBe("5 5 7");
    expect(formatSeries([1, 2, 3, 4], 2)).toBe("1 2 …");
    expect(formatSeries([1, 2], 2)).toBe("1 2");
    const long = Array.from({ length: SERIES_LIMIT + 1 }, (_, i) => i);
    expect(formatSeries(long).endsWith(" …")).toBe(true);
    expect(formatSeries(long.slice(0, SERIES_LIMIT)).endsWith("…")).toBe(false);
  });
});

describe("keyboard", () => {
  it("maps the documented keys", () => {
    expect(keyboardAction({ key: " " })).toEqual({ type: "play_pause" });
    expect(keyboardAction({ key: "Spacebar" })).toEqual({ type: "play_pause" });
    expect(keyboardAction({ key: "ArrowRight" })).toEqual({ type: "step", direction: "right", shrink: false });
    expect(keyboardAction({ key: "ArrowLeft" })).toEqual({ type: "step", direction: "left", shrink: false });
    expect(keyboardAction({ key: "ArrowRight", shiftKey: true })).toEqual({ type: "step", direction: "right", shrink: true });
    expect(keyboardAction({ key: "ArrowLeft", shiftKey: true })).toEqual({ type: "step", direction: "left", shrink: true });
    expect(keyboardAction({ key: "c" })).toEqual({ type: "comment" });
    expect(keyboardAction({ key: "C" })).toEqual({ type: "comment" });
    expect(keyboardAction({ key: "Escape" })).toEqual({ type: "escape" });
    expect(keyboardAction({ key: "Esc" })).toEqual({ type: "escape" });
  });

  it("ignores other keys and chords with Ctrl, Meta or Alt", () => {
    expect(keyboardAction({ key: "a" })).toBeNull();
    expect(keyboardAction({ key: "Enter" })).toBeNull();
    expect(keyboardAction({ key: "ArrowUp" })).toBeNull();
    expect(keyboardAction({ key: " ", ctrlKey: true })).toBeNull();
    expect(keyboardAction({ key: "c", metaKey: true })).toBeNull();
    expect(keyboardAction({ key: "ArrowRight", altKey: true })).toBeNull();
    expect(keyboardAction({ key: "C", shiftKey: true })).toBeNull(); // Shift+C is not "c"
  });

  it("isTextEntryTarget recognises inputs, textareas, selects and contenteditable", () => {
    expect(isTextEntryTarget({ tagName: "INPUT" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "textarea" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "SELECT" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "DIV", isContentEditable: true })).toBe(true);
    // a spoken comment's <audio controls>: Space pauses it, the arrows seek it
    expect(isTextEntryTarget({ tagName: "AUDIO" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "video" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "DIV" })).toBe(false);
    expect(isTextEntryTarget({ tagName: "BUTTON" })).toBe(false);
    expect(isTextEntryTarget({ tagName: "svg" })).toBe(false);
    expect(isTextEntryTarget(null)).toBe(false);
    expect(isTextEntryTarget(undefined)).toBe(false);
    expect(isTextEntryTarget("body")).toBe(false);
  });

  it("resolveKeyAction leaves text fields alone and lets buttons and summaries keep Space", () => {
    expect(resolveKeyAction({ key: " " }, { tagName: "TEXTAREA" })).toBeNull();
    expect(resolveKeyAction({ key: "c" }, { tagName: "INPUT" })).toBeNull();
    expect(resolveKeyAction({ key: "Escape" }, { tagName: "INPUT" })).toBeNull();
    expect(resolveKeyAction({ key: " " }, { tagName: "BUTTON" })).toBeNull();
    expect(resolveKeyAction({ key: " " }, { tagName: "summary" })).toBeNull();
    expect(resolveKeyAction({ key: " " }, { tagName: "AUDIO" })).toBeNull();
    expect(resolveKeyAction({ key: "ArrowRight" }, { tagName: "AUDIO" })).toBeNull();
    expect(resolveKeyAction({ key: "Escape" }, { tagName: "AUDIO" })).toBeNull();
    expect(resolveKeyAction({ key: "Escape" }, { tagName: "SUMMARY" })).toEqual({ type: "escape" });
    expect(resolveKeyAction({ key: "c" }, { tagName: "BUTTON" })).toEqual({ type: "comment" });
    expect(resolveKeyAction({ key: "ArrowRight" }, { tagName: "BUTTON" })).toEqual({
      type: "step",
      direction: "right",
      shrink: false,
    });
    expect(resolveKeyAction({ key: " " }, { tagName: "BODY" })).toEqual({ type: "play_pause" });
    expect(resolveKeyAction({ key: " " }, { tagName: "svg" })).toEqual({ type: "play_pause" });
    expect(resolveKeyAction({ key: " " }, null)).toEqual({ type: "play_pause" });
    expect(resolveKeyAction({ key: "x" }, null)).toBeNull();
  });
});
