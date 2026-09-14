import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { LanguageToggle } from "./components/LanguageToggle";
import { SettingsPanel } from "./components/SettingsPanel";
import { TechnicalDetails } from "./components/TechnicalDetails";
import { I18nProvider, useI18n } from "./i18n";
import { AlignmentTooLargeError } from "./model";
import { routePath, useRoute, type Route } from "./router";
import { Compare } from "./screens/Compare";
import { Listen } from "./screens/Listen";
import { PassageList } from "./screens/PassageList";
import { Report } from "./screens/Report";
import { SettingsProvider, useSettings } from "./settings";

/**
 * App shell: header (title, language toggle, settings button), the routed
 * screen, and a footer reminding that only original recordings are played.
 *
 * Screens take no props; each reads its parameters from useRoute(). The
 * element is keyed by the route path so a screen remounts with fresh state
 * when its parameters change.
 *
 * The routed screen sits inside an error boundary; the header and the
 * settings panel stay outside it, so a throw during render (a pathological
 * setting, a corrupt record) leaves the consultant a way to reset the
 * settings and go back to the passages instead of a blank page.
 */

interface BoundaryProps {
  children: ReactNode;
  renderError(error: unknown, retry: () => void): ReactNode;
}

class ErrorBoundary extends Component<BoundaryProps, { error: unknown; failed: boolean }> {
  state = { error: null as unknown, failed: false };

  static getDerivedStateFromError(error: unknown): { error: unknown; failed: boolean } {
    return { error, failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error("Bead Compare: screen failed", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.failed) return this.props.renderError(this.state.error, () => this.setState({ error: null, failed: false }));
    return this.props.children;
  }
}

/** What the boundary shows: a calm message, reset/retry, and the way home. */
function ScreenError(props: { error: unknown; retry(): void }): JSX.Element {
  const { t } = useI18n();
  const { reset } = useSettings();
  const { error, retry } = props;
  const message = error instanceof AlignmentTooLargeError ? t("common.error.too_large") : t("common.error.screen_failed");
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return (
    <section className="screen">
      <div className="card stack">
        <p className="error" role="alert">
          {message}
        </p>
        <p className="muted small">{t("common.error.screen_failed.hint")}</p>
        <div className="row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              reset();
              retry();
            }}
          >
            {t("common.error.screen_failed.reset")}
          </button>
          <button type="button" className="btn" onClick={retry}>
            {t("common.error.screen_failed.retry")}
          </button>
          <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
            {t("common.error.screen_failed.home")}
          </a>
        </div>
        <TechnicalDetails summary={t("common.tech.summary")}>
          <code className="tech__full">{detail}</code>
        </TechnicalDetails>
      </div>
    </section>
  );
}

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
        <ErrorBoundary key={routePath(route)} renderError={(error, retry) => <ScreenError error={error} retry={retry} />}>
          <Screen route={route} />
        </ErrorBoundary>
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
