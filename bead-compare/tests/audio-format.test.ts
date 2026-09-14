import { describe, expect, it } from "vitest";
import { decimalMark, formatRange, formatTime, frameTime } from "../src/audio/format";

describe("formatTime", () => {
  it("formats seconds as m:ss.s", () => {
    expect(formatTime(0)).toBe("0:00.0");
    expect(formatTime(3.4)).toBe("0:03.4");
    expect(formatTime(72)).toBe("1:12.0");
    expect(formatTime(9.95)).toBe("0:10.0");
    expect(formatTime(59.96)).toBe("1:00.0");
    expect(formatTime(600.04)).toBe("10:00.0");
  });
  it("rounds to tenths", () => {
    expect(formatTime(0.04)).toBe("0:00.0");
    expect(formatTime(0.05)).toBe("0:00.1");
    expect(formatTime(1.26)).toBe("0:01.3");
  });
  it("is defensive about bad input", () => {
    expect(formatTime(-2)).toBe("0:00.0");
    expect(formatTime(NaN)).toBe("0:00.0");
    expect(formatTime(Infinity)).toBe("0:00.0");
  });
  it("uses the language's decimal mark for the tenths", () => {
    expect(decimalMark("pt-BR")).toBe(",");
    expect(decimalMark("en")).toBe(".");
    expect(decimalMark(undefined)).toBe(".");
    expect(formatTime(3.4, "pt-BR")).toBe("0:03,4");
    expect(formatTime(3.4, "en")).toBe("0:03.4");
    expect(formatTime(72, "pt-BR")).toBe("1:12,0");
    expect(formatTime(NaN, "pt-BR")).toBe("0:00,0");
  });
});

describe("frameTime", () => {
  it("converts frames to seconds", () => {
    expect(frameTime(0, 50)).toBe(0);
    expect(frameTime(50, 50)).toBe(1);
    expect(frameTime(170, 50)).toBeCloseTo(3.4);
  });
  it("returns 0 for a non-positive frame rate", () => {
    expect(frameTime(10, 0)).toBe(0);
    expect(frameTime(10, -5)).toBe(0);
  });
});

describe("formatRange", () => {
  it("joins two times with an en dash", () => {
    expect(formatRange(170, 205, 50)).toBe("0:03.4 – 0:04.1");
    expect(formatRange(0, 0, 50)).toBe("0:00.0 – 0:00.0");
    expect(formatRange(3600, 3625, 50)).toBe("1:12.0 – 1:12.5");
  });
  it("follows the language like formatTime", () => {
    expect(formatRange(170, 205, 50, "pt-BR")).toBe("0:03,4 – 0:04,1");
    expect(formatRange(170, 205, 50, "en")).toBe("0:03.4 – 0:04.1");
  });
});
