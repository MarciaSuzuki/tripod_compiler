import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/model";
import { SETTINGS_KEY, loadSettings, mergeSettings, saveSettings } from "../src/settings";

/** A tiny in-memory localStorage stub. */
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

describe("loadSettings", () => {
  it("returns the defaults when nothing is stored", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("returns a fresh copy, never DEFAULT_SETTINGS itself", () => {
    const s = loadSettings();
    expect(s).not.toBe(DEFAULT_SETTINGS);
    expect(s.alignment).not.toBe(DEFAULT_SETTINGS.alignment);
    s.alignment.gap_penalty = 99;
    expect(DEFAULT_SETTINGS.alignment.gap_penalty).toBe(1);
  });

  it("merges a partial stored object over the defaults", () => {
    store.setItem(SETTINGS_KEY, JSON.stringify({ alignment: { gap_penalty: 5 } }));
    const s = loadSettings();
    expect(s.grouping).toEqual(DEFAULT_SETTINGS.grouping);
    expect(s.alignment.gap_penalty).toBe(5);
    expect(s.alignment.match_score).toBe(DEFAULT_SETTINGS.alignment.match_score);
    expect(s.alignment.mismatch_penalty).toBe(DEFAULT_SETTINGS.alignment.mismatch_penalty);
    expect(s.alignment.merge_gap_frames).toBe(DEFAULT_SETTINGS.alignment.merge_gap_frames);
    expect(s.alignment.melody_threshold).toBe(DEFAULT_SETTINGS.alignment.melody_threshold);
  });

  it("gives new fields their defaults when an older object lacks them", () => {
    // An object stored by an earlier build without `melody_threshold` and without `grouping`.
    store.setItem(
      SETTINGS_KEY,
      JSON.stringify({ alignment: { match_score: 3, mismatch_penalty: 2, gap_penalty: 2, merge_gap_frames: 4 } }),
    );
    const s = loadSettings();
    expect(s.grouping.min_cluster_frames).toBe(DEFAULT_SETTINGS.grouping.min_cluster_frames);
    expect(s.alignment).toEqual({ match_score: 3, mismatch_penalty: 2, gap_penalty: 2, merge_gap_frames: 4, melody_threshold: 3 });
  });

  it("ignores wrongly typed values, NaN/Infinity and unknown keys", () => {
    store.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        grouping: { min_cluster_frames: "9", bogus: 1 },
        alignment: "not an object",
        extra: { x: 1 },
      }),
    );
    const s = loadSettings();
    expect(s).toEqual(DEFAULT_SETTINGS);
    expect(Object.keys(s).sort()).toEqual(["alignment", "grouping"]);
    expect(Object.keys(s.grouping)).toEqual(["min_cluster_frames"]);
    expect(mergeSettings({ alignment: { gap_penalty: Number.NaN } }).alignment.gap_penalty).toBe(1);
    expect(mergeSettings({ alignment: { gap_penalty: null } }).alignment.gap_penalty).toBe(1);
  });

  it("falls back to the defaults on corrupt JSON", () => {
    store.setItem(SETTINGS_KEY, "{not json");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("falls back to the defaults when localStorage is unavailable", () => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
  });
});

describe("saveSettings", () => {
  it("round-trips through loadSettings under the documented key", () => {
    const next = { grouping: { min_cluster_frames: 5 }, alignment: { ...DEFAULT_SETTINGS.alignment, melody_threshold: 4.5 } };
    saveSettings(next);
    expect(store.getItem(SETTINGS_KEY)).not.toBeNull();
    expect(JSON.parse(store.getItem(SETTINGS_KEY) as string)).toEqual(next);
    expect(loadSettings()).toEqual(next);
  });
});
