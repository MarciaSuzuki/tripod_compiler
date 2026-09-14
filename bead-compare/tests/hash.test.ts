import { describe, expect, it } from "vitest";
import { hasWebCrypto, newId, sha256Hex, sha256Sync, shortHash } from "../src/model";

function hex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("sha256Sync (the fallback for insecure origins)", () => {
  it("matches the known vectors", () => {
    expect(hex(sha256Sync(new Uint8Array(0)))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(hex(sha256Sync(new TextEncoder().encode("abc")))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hex(sha256Sync(new TextEncoder().encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")))).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("agrees with WebCrypto on bytes around the block boundary", async () => {
    expect(hasWebCrypto()).toBe(true);
    for (const n of [0, 1, 55, 56, 63, 64, 65, 119, 120, 128, 1000]) {
      const bytes = new Uint8Array(n).map((_, i) => (i * 37 + n) & 0xff);
      const expected = hex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
      expect(hex(sha256Sync(bytes)), `n=${n}`).toBe(expected);
    }
  });

  it("is what sha256Hex uses when crypto.subtle is missing", async () => {
    const text = "tape.json bytes";
    const viaSubtle = await sha256Hex(text);
    const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });
    try {
      expect(hasWebCrypto()).toBe(false);
      expect(await sha256Hex(text)).toBe(viaSubtle);
      expect(await sha256Hex(new TextEncoder().encode(text))).toBe(viaSubtle);
      expect(newId()).toMatch(/^[a-z0-9]+$/); // random fallback, never throws
    } finally {
      if (original) Object.defineProperty(globalThis, "crypto", original);
    }
  });
});

describe("shortHash", () => {
  it("drops a sha256: prefix and keeps eight characters", () => {
    expect(shortHash("sha256:abcdef0123456789")).toBe("abcdef01");
    expect(shortHash("abcdef0123456789")).toBe("abcdef01");
  });
});
