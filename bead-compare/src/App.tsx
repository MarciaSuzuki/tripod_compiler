import { useState } from "react";
import { LanguageToggle } from "./components/LanguageToggle";
import { SettingsPanel } from "./components/SettingsPanel";
import { I18nProvider, useI18n } from "./i18n";
import { routePath, useRoute, type Route } from "./router";
import { Compare } from "./screens/Compare";
import { Listen } from "./screens/Listen";
import { PassageList } from "./screens/PassageList";
import { Report } from "./screens/Report";
import { SettingsProvider } from "./settings";

/**
 * App shell: header (title, language toggle, settings button), the routed
 * screen, and a footer reminding that only original recordings are played.
 *
 * Screens take no props; each reads its parameters from useRoute(). The
 * element is keyed by the route path so a screen remounts with fresh state
 * when its parameters change.
 */

function SettingsIcon(): JSX.Element {
  return (
    <svg className="icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="3" y1="5.5" x2="17" y2="5.5" />
        <line x1="3" y1="10" x2="17" y2="10" />
        <line x1="3" y1="14.5" x2="17" y2="14.5" />
      </g>
      <g fill="var(--surface, #fff)" stroke="currentColor" strokeWidth="1.6">
        <circle cx="7" cy="5.5" r="1.8" />
        <circle cx="13" cy="10" r="1.8" />
        <circle cx="8.5" cy="14.5" r="1.8" />
      </g>
    </svg>
  );
}

function Screen(props: { route: Route }): JSX.Element {
  const key = routePath(props.route);
  switch (props.route.name) {
    case "listen":
      return <Listen key={key} />;
    case "compare":
      return <Compare key={key} />;
    case "report":
      return <Report key={key} />;
    default:
      return <PassageList key={key} />;
  }
}

function Shell(): JSX.Element {
  const { t } = useI18n();
  const route = useRoute();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <a className="app-title" href={routePath({ name: "passages" })}>
          <span className="app-title__name">{t("common.app.title")}</span>
          <span className="app-title__sub">{t("common.app.subtitle")}</span>
        </a>
        <div className="app-header__tools">
          <LanguageToggle />
          <button
            type="button"
            className="btn btn--quiet btn--icon"
            aria-label={t("common.nav.settings")}
            title={t("common.nav.settings")}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="app-main">
        <Screen route={route} />
      </main>

      <footer className="app-footer">{t("common.footer.original_only")}</footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export function App(): JSX.Element {
  return (
    <I18nProvider>
      <SettingsProvider>
        <Shell />
      </SettingsProvider>
    </I18nProvider>
  );
}

export default App;
