import { useMemo, useSyncExternalStore } from "react";

/**
 * Hash router. Routes:
 *   #/                       passages
 *   #/listen/:versionId
 *   #/compare/:aId/:bId
 *   #/report/:aId/:bId
 * Anything else is the passage list. Ids are URI-encoded in the hash.
 */

export type Route =
  | { name: "passages" }
  | { name: "listen"; versionId: string }
  | { name: "compare"; aId: string; bId: string }
  | { name: "report"; aId: string; bId: string };

export const PASSAGES_ROUTE: Route = { name: "passages" };

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Parse a location hash (with or without the leading "#"). Unknown → passages. */
export function parseRoute(hash: string): Route {
  const raw = (hash ?? "").replace(/^#/, "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (raw === "") return PASSAGES_ROUTE;
  const [head, ...rest] = raw.split("/");
  const ids = rest.map(decode);
  const nonEmpty = ids.every((s) => s.length > 0);
  switch (head) {
    case "listen":
      if (ids.length === 1 && nonEmpty) return { name: "listen", versionId: ids[0]! };
      break;
    case "compare":
      if (ids.length === 2 && nonEmpty) return { name: "compare", aId: ids[0]!, bId: ids[1]! };
      break;
    case "report":
      if (ids.length === 2 && nonEmpty) return { name: "report", aId: ids[0]!, bId: ids[1]! };
      break;
    case "passages":
      if (ids.length === 0) return PASSAGES_ROUTE;
      break;
    default:
      break;
  }
  return PASSAGES_ROUTE;
}

/** The hash for a route, e.g. "#/listen/abc". */
export function routePath(r: Route): string {
  const enc = encodeURIComponent;
  switch (r.name) {
    case "listen":
      return `#/listen/${enc(r.versionId)}`;
    case "compare":
      return `#/compare/${enc(r.aId)}/${enc(r.bId)}`;
    case "report":
      return `#/report/${enc(r.aId)}/${enc(r.bId)}`;
    default:
      return "#/";
  }
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot(): string {
  return typeof window === "undefined" ? "" : window.location.hash;
}

function getServerSnapshot(): string {
  return "";
}

/** The current route; re-renders on hashchange. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseRoute(hash), [hash]);
}

export function navigate(r: Route): void {
  if (typeof window === "undefined") return;
  const path = routePath(r);
  if (window.location.hash === path) return;
  window.location.hash = path;
}
