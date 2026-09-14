import { describe, expect, it } from "vitest";
import { AudioEngine, computePeaks } from "../src/audio/engine";
import { canRecord, extensionForMime, pickMimeType } from "../src/audio/recorder";

describe("computePeaks", () => {
  it("takes the max-abs of each bucket", () => {
    const ch = new Float32Array([0.1, -0.5, 0.2, 0.3, -0.9, 0.0, 0.4, 0.1]);
    expect(Array.from(computePeaks(ch, 4))).toEqual([0.5, 0.3, 0.9, 0.4].map((v) => Math.fround(v)));
  });
  it("handles buckets that do not divide the length evenly", () => {
    const ch = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
    const p = computePeaks(ch, 2);
    expect(p.length).toBe(2);
    expect(p[0]).toBeCloseTo(0.2);
    expect(p[1]).toBeCloseTo(0.5);
  });
  it("gives every bucket at least one sample when there are more buckets than samples", () => {
    const ch = new Float32Array([0.5, 1.0]);
    const p = computePeaks(ch, 4);
    expect(Array.from(p)).toEqual([0.5, 0.5, 1.0, 1.0]);
  });
  it("clamps to 1 and returns zeros for silence", () => {
    expect(Array.from(computePeaks(new Float32Array([2, -3]), 1))).toEqual([1]);
    expect(Array.from(computePeaks(new Float32Array(10), 3))).toEqual([0, 0, 0]);
  });
  it("returns an empty array for zero buckets or an empty channel", () => {
    expect(computePeaks(new Float32Array([0.5]), 0).length).toBe(0);
    expect(computePeaks(new Float32Array(0), 5).length).toBe(5);
    expect(Array.from(computePeaks(new Float32Array(0), 5))).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("AudioEngine without a browser", () => {
  it("constructs, reports nothing loaded and no state, and stop/toggle are no-ops", () => {
    const e = AudioEngine.get();
    expect(AudioEngine.get()).toBe(e);
    expect(e.loaded("x")).toBeUndefined();
    expect(e.state).toBeNull();
    expect(() => e.stop()).not.toThrow();
    expect(() => e.toggle()).not.toThrow();
    expect(() => e.unload("x")).not.toThrow();
  });
  it("throws only when asked to play or load", async () => {
    const e = AudioEngine.get();
    expect(() => e.play({ versionId: "x", startFrame: 0, endFrame: 10, frameRate: 50 })).toThrow();
    await expect(e.load("x", new Blob([new Uint8Array(4)]))).rejects.toThrow();
  });
  it("subscribe returns an unsubscribe function", () => {
    const e = AudioEngine.get();
    let calls = 0;
    const off = e.subscribe(() => calls++);
    off();
    e.stop();
    expect(calls).toBe(0);
  });
});

describe("recorder helpers without a browser", () => {
  it("canRecord is false and pickMimeType is undefined", () => {
    expect(canRecord()).toBe(false);
    expect(pickMimeType()).toBeUndefined();
  });
  it("maps mime types to file extensions", () => {
    expect(extensionForMime("audio/webm;codecs=opus")).toBe("webm");
    expect(extensionForMime("audio/ogg;codecs=opus")).toBe("ogg");
    expect(extensionForMime("audio/mp4")).toBe("m4a");
    expect(extensionForMime("")).toBe("webm");
  });
});
