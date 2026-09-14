import { describe, expect, it } from "vitest";
import { parseRoute, routePath, type Route } from "../src/router";

const PASSAGES: Route = { name: "passages" };

describe("parseRoute", () => {
  it("maps the root and empty hashes to passages", () => {
    for (const h of ["", "#", "#/", "/", "#//", "#/passages", "#/passages/"]) {
      expect(parseRoute(h), `hash ${JSON.stringify(h)}`).toEqual(PASSAGES);
    }
  });

  it("parses listen, compare and report", () => {
    expect(parseRoute("#/listen/abc")).toEqual({ name: "listen", versionId: "abc" });
    expect(parseRoute("#/compare/a1/b2")).toEqual({ name: "compare", aId: "a1", bId: "b2" });
    expect(parseRoute("#/report/a1/b2")).toEqual({ name: "report", aId: "a1", bId: "b2" });
  });

  it("tolerates a missing '#' and a trailing slash", () => {
    expect(parseRoute("/listen/abc")).toEqual({ name: "listen", versionId: "abc" });
    expect(parseRoute("#/listen/abc/")).toEqual({ name: "listen", versionId: "abc" });
  });

  it("decodes URI-encoded ids", () => {
    expect(parseRoute("#/listen/a%2Fb%20c")).toEqual({ name: "listen", versionId: "a/b c" });
    expect(parseRoute("#/compare/x%3Ay/z")).toEqual({ name: "compare", aId: "x:y", bId: "z" });
  });

  it("maps unknown or malformed routes to passages", () => {
    const bad = [
      "#/nope",
      "#/nope/1/2",
      "#/listen",
      "#/listen/",
      "#/listen/a/b",
      "#/compare",
      "#/compare/a",
      "#/compare/a/b/c",
      "#/compare//b",
      "#/report/a",
      "#/report/a/b/c",
      "#/Listen/abc",
    ];
    for (const h of bad) expect(parseRoute(h), `hash ${JSON.stringify(h)}`).toEqual(PASSAGES);
  });

  it("survives a malformed percent-encoding", () => {
    expect(parseRoute("#/listen/%E0%A4%A")).toEqual({ name: "listen", versionId: "%E0%A4%A" });
  });
});

describe("routePath", () => {
  it("builds the documented hashes", () => {
    expect(routePath(PASSAGES)).toBe("#/");
    expect(routePath({ name: "listen", versionId: "abc" })).toBe("#/listen/abc");
    expect(routePath({ name: "compare", aId: "a", bId: "b" })).toBe("#/compare/a/b");
    expect(routePath({ name: "report", aId: "a", bId: "b" })).toBe("#/report/a/b");
  });

  it("encodes ids", () => {
    expect(routePath({ name: "listen", versionId: "a/b c" })).toBe("#/listen/a%2Fb%20c");
  });

  it("round-trips every route through parseRoute", () => {
    const routes: Route[] = [
      PASSAGES,
      { name: "listen", versionId: "6f1a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8" },
      { name: "listen", versionId: "with/slash and space" },
      { name: "compare", aId: "a::1", bId: "b?2" },
      { name: "report", aId: "α", bId: "β" },
    ];
    for (const r of routes) expect(parseRoute(routePath(r))).toEqual(r);
  });
});
