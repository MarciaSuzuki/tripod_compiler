import { LANGS, useI18n, type Lang } from "../i18n";

const SHORT: Record<Lang, string> = { "pt-BR": "common.lang.pt", en: "common.lang.en" };
const LONG: Record<Lang, string> = { "pt-BR": "common.lang.pt_name", en: "common.lang.en_name" };

/** Two small buttons, PT / EN. The active one is pressed. */
export function LanguageToggle(): JSX.Element {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label={t("common.settings.language")}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={"lang-toggle__btn" + (lang === l ? " is-on" : "")}
          aria-pressed={lang === l}
          title={t(LONG[l])}
          onClick={() => setLang(l)}
        >
          {t(SHORT[l])}
        </button>
      ))}
    </div>
  );
}
