import { useI18n } from "../i18n";
import { routePath, useRoute } from "../router";

/**
 * PLACEHOLDER — the Compare engineer replaces this file entirely.
 * App.tsx renders <Compare /> with no props; the screen reads its params
 * from useRoute().
 */
export function Compare(): JSX.Element {
  const { t } = useI18n();
  const route = useRoute();
  const aId = route.name === "compare" ? route.aId : "";
  const bId = route.name === "compare" ? route.bId : "";
  return (
    <section className="screen card stack" data-a-id={aId} data-b-id={bId}>
      <h2 className="screen__title">{t("common.nav.compare")}</h2>
      <p className="muted">{t("common.state.coming_soon")}</p>
      <p>
        <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
          {t("common.nav.back")}
        </a>
      </p>
    </section>
  );
}
