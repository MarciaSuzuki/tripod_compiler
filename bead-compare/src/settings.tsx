import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Settings } from "./model";
import { DEFAULT_SETTINGS } from "./model";

/**
 * Grouping and alignment parameters, persisted in localStorage. A stored
 * object is deep-merged over DEFAULT_SETTINGS so fields added later get
 * their defaults, and a corrupt or wrongly-typed value falls back too.
 */

export const SETTINGS_KEY = "bead-compare.settings.v1";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

/**
 * Deep-merge `stored` over `defaults`. Only keys present in `defaults` are
 * taken; a stored leaf replaces the default only when it has the same
 * primitive type (numbers must be finite). Returns a fresh object.
 */
function mergeInto<T>(defaults: T, stored: unknown): T {
  if (isRecord(defaults)) {
    const src = isRecord(stored) ? stored : {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(defaults)) out[key] = mergeInto(value, src[key]);
    return out as T;
  }
  if (typeof defaults === "number") {
    return (typeof stored === "number" && Number.isFinite(stored) ? stored : defaults) as T;
  }
  if (typeof defaults === "string" || typeof defaults === "boolean") {
    return (typeof stored === typeof defaults ? stored : defaults) as T;
  }
  return defaults;
}

export function mergeSettings(stored: unknown): Settings {
  return mergeInto(DEFAULT_SETTINGS, stored);
}

/** DEFAULT_SETTINGS merged with whatever is stored (a fresh copy every call). */
export function loadSettings(): Settings {
  let stored: unknown;
  try {
    const raw = storage()?.getItem(SETTINGS_KEY);
    stored = raw ? JSON.parse(raw) : undefined;
  } catch {
    stored = undefined;
  }
  return mergeSettings(stored);
}

export function saveSettings(s: Settings): void {
  try {
    storage()?.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable or full; settings live for this session only
  }
}

export interface SettingsApi {
  settings: Settings;
  update(next: Settings): void;
  reset(): void;
}

/** Used when a component renders outside SettingsProvider (tests, isolated stories). */
const fallback: SettingsApi = {
  settings: mergeSettings(undefined),
  update: () => {},
  reset: () => {},
};

const SettingsContext = createContext<SettingsApi>(fallback);

export function SettingsProvider(props: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback((next: Settings) => {
    const clean = mergeSettings(next);
    saveSettings(clean);
    setSettings(clean);
  }, []);

  const reset = useCallback(() => {
    const clean = mergeSettings(undefined);
    saveSettings(clean);
    setSettings(clean);
  }, []);

  const value = useMemo<SettingsApi>(() => ({ settings, update, reset }), [settings, update, reset]);
  return <SettingsContext.Provider value={value}>{props.children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsApi {
  return useContext(SettingsContext);
}
