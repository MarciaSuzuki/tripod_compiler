import { useI18n } from "../i18n";
import { routePath, useRoute } from "../router";

/**
 * PLACEHOLDER — the Listen engineer replaces this file entirely.
 * App.tsx renders <Listen /> with no props; the screen reads its params
 * from useRoute().
 */
export function Listen(): JSX.Element {
  const { t } = useI18n();
  const route = useRoute();
  const versionId = route.name === "listen" ? route.versionId : "";
  return (
    <section className="screen card stack" data-version-id={versionId}>
      <h2 className="screen__title">{t("common.nav.listen")}</h2>
      <p className="muted">{t("common.state.coming_soon")}</p>
      <p>
        <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
          {t("common.nav.back")}
        </a>
      </p>
    </section>
  );
}
