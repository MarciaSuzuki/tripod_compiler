import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { common } from "./strings/common";
import { passages } from "./strings/passages";
import { listen } from "./strings/listen";
import { compare } from "./strings/compare";
import { report } from "./strings/report";

/**
 * i18n: Brazilian Portuguese by default, English via toggle. Every visible
 * string goes through `t()`. Keys are `screen.section.item`.
 */

export type Lang = "pt-BR" | "en";
export type Dict = Record<string, string>;
export interface StringModule {
  "pt-BR": Dict;
  en: Dict;
}

export const LANG_KEY = "bead-compare.lang";
export const DEFAULT_LANG: Lang = "pt-BR";
export const LANGS: readonly Lang[] = ["pt-BR", "en"];

/** Every strings module, by name. tests/i18n.test.ts checks each one for pt-BR/en drift. */
export const STRING_MODULES = { common, passages, listen, compare, report } satisfies Record<string, StringModule>;

/** The union of every module's keys (typed from the pt-BR dictionaries). */
export type MergedStrings = (typeof common)["pt-BR"] &
  (typeof passages)["pt-BR"] &
  (typeof listen)["pt-BR"] &
  (typeof compare)["pt-BR"] &
  (typeof report)["pt-BR"];
export type StringKey = keyof MergedStrings & string;

function mergeDicts(lang: Lang): Dict {
  const out: Dict = {};
  for (const mod of Object.values(STRING_MODULES)) Object.assign(out, (mod as StringModule)[lang]);
  return out;
}

/** The merged dictionaries, one per language. */
export const STRINGS: Record<Lang, Dict> = { "pt-BR": mergeDicts("pt-BR"), en: mergeDicts("en") };

export type Vars = Record<string, string | number>;
export type T = (key: string, vars?: Vars) => string;

export function isLang(x: unknown): x is Lang {
  return x === "pt-BR" || x === "en";
}

/** Replace `{name}` placeholders from `vars`; unknown placeholders are left as written. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}

function warnInDev(message: string): void {
  try {
    const env = import.meta.env;
    if (env && env.DEV && env.MODE !== "test") console.warn(message);
  } catch {
    // no import.meta.env (plain node)
  }
}

const warned = new Set<string>();

/** For non-React code (report export). A missing key returns the key itself. */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  const dict = STRINGS[lang] ?? STRINGS[DEFAULT_LANG];
  const template = dict[key];
  if (template === undefined) {
    const id = `${lang}:${key}`;
    if (!warned.has(id)) {
      warned.add(id);
      warnInDev(`[i18n] missing key "${key}" for ${lang}`);
    }
    return key;
  }
  return interpolate(template, vars);
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredLang(): Lang {
  try {
    const v = storage()?.getItem(LANG_KEY);
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function writeStoredLang(lang: Lang): void {
  try {
    storage()?.setItem(LANG_KEY, lang);
  } catch {
    // storage unavailable; the choice lives for this session only
  }
}

function applyDocumentLang(lang: Lang): void {
  if (typeof document !== "undefined" && document.documentElement) document.documentElement.lang = lang;
}

export interface I18n {
  lang: Lang;
  setLang(l: Lang): void;
  t: T;
}

/** Used when a component renders outside I18nProvider (tests, isolated stories). */
const fallback: I18n = {
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key, vars) => translate(DEFAULT_LANG, key, vars),
};

const I18nContext = createContext<I18n>(fallback);

export function I18nProvider(props: { children: ReactNode }): JSX.Element {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    if (!isLang(l)) return;
    writeStoredLang(l);
    setLangState(l);
  }, []);

  const t = useCallback<T>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo<I18n>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
