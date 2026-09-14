import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Compare.css";
import { AudioEngine, type PlayItem, type PlayState } from "../audio/engine";
import { BeadStrip } from "../components/BeadStrip";
import { CommentAudio } from "../components/CommentList";
import { MockBadge } from "../components/MockBadge";
import { PlayerControls } from "../components/PlayerControls";
import { TechnicalDetails } from "../components/TechnicalDetails";
import { pairId, repo } from "../db/repo";
import { useI18n, type T } from "../i18n";
import type {
  CarriedComment,
  Cluster,
  Comment,
  CompareResult,
  FrameRange,
  PairRecord,
  Passage,
  Region,
  Settings,
  Span,
  Verdict,
  Version,
} from "../model";
import { compareTapes, regionKey, shortHash } from "../model";
import { routePath, useRoute } from "../router";
import { useSettings } from "../settings";
import {
  VERDICTS,
  buildConnectors,
  carriedHighlights,
  carriedMarkers,
  carriedPlayTarget,
  describeSide,
  formatPercent,
  formatSeconds,
  opCounts,
  parseHighlightId,
  regionHighlights,
  regionPlayItems,
  sourceMarkers,
  verdictOf,
  type Connector,
  type PlayWhich,
  type TapeRef,
} from "./compareLogic";

/**
 * Compare (#/compare/:aId/:bId): A (older) above B (newer).
 *
 * Header, three summary facts, the two bead strips joined by a connector
 * band, a player bar for the active region, the region list with verdicts,
 * the carried fix requests, and technical details at the bottom (the only
 * place where numbers other than times, counts and the percent appear).
 *
 * Sound comes only from AudioEngine slices of the two original recordings
 * and from the consultant's own spoken comments (<audio>).
 */

const SEQUENCE_GAP_SECONDS = 0.6;
const CONNECTOR_HEIGHT = 28;

interface Loaded {
  passage: Passage | undefined;
  a: Version;
  b: Version;
}

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Loaded };

type AudioState = { status: "idle" } | { status: "loading" } | { status: "ready" } | { status: "error"; message: string };

type ActiveTarget = { type: "region"; key: string } | { type: "carried"; commentId: string } | null;

interface Refs {
  a: TapeRef;
  b: TapeRef;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function spanRange(span: Span): FrameRange {
  return { start: span.start_frame, end: span.end_frame };
}

/** "0:03.4 – 0:04.1", or "here, at 0:03.4" for a zero-length side. */
function sideText(t: T, range: FrameRange, frameRate: number): string {
  const d = describeSide(range, frameRate);
  return d.kind === "range" ? d.text : t("compare.regions.point", { time: d.text });
}

function clusterItem(ref: TapeRef, c: Cluster): PlayItem {
  return { versionId: ref.versionId, startFrame: c.start, endFrame: c.end, frameRate: ref.frameRate };
}

// ---------------------------------------------------------------------------

export function Compare(): JSX.Element {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const route = useRoute();
  const aId = route.name === "compare" ? route.aId : "";
  const bId = route.name === "compare" ? route.bId : "";

  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [commentsA, setCommentsA] = useState<Comment[]>([]);
  const [pair, setPair] = useState<PairRecord | undefined>(undefined);
  const [audio, setAudio] = useState<AudioState>({ status: "idle" });
  const [playState, setPlayState] = useState<PlayState | null>(null);
  const [active, setActive] = useState<ActiveTarget>(null);
  const [loop, setLoop] = useState(false);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const whichRef = useRef<PlayWhich>("both");

  // Versions, passage, A's comments and the pair record.
  useEffect(() => {
    if (!aId || !bId) {
      setLoad({ status: "not_found" });
      return;
    }
    let cancelled = false;
    setLoad({ status: "loading" });
    void (async () => {
      try {
        const [a, b] = await Promise.all([repo.getVersion(aId), repo.getVersion(bId)]);
        if (cancelled) return;
        if (!a || !b) {
          setLoad({ status: "not_found" });
          return;
        }
        const [passage, comments, pairRecord] = await Promise.all([
          repo.getPassage(a.passage_id),
          repo.listComments(aId),
          repo.getPair(aId, bId),
        ]);
        if (cancelled) return;
        setCommentsA(comments);
        setPair(pairRecord);
        setLoad({ status: "ready", data: { passage, a, b } });
      } catch (e) {
        if (!cancelled) setLoad({ status: "error", message: errorMessage(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aId, bId]);

  const data = load.status === "ready" ? load.data : null;
  const mismatch = data !== null && data.a.tape.codebook_hash !== data.b.tape.codebook_hash;

  // The whole comparison, recomputed when comments or settings change.
  const result = useMemo<CompareResult | null>(() => {
    if (!data || mismatch) return null;
    return compareTapes(data.a.tape, data.b.tape, commentsA, bId, settings);
  }, [data, mismatch, commentsA, bId, settings]);

  const refs = useMemo<Refs | null>(
    () =>
      data
        ? {
            a: { versionId: data.a.id, frameRate: data.a.tape.frame_rate },
            b: { versionId: data.b.id, frameRate: data.b.tape.frame_rate },
          }
        : null,
    [data],
  );

  // Decode both recordings once (cached by the engine).
  useEffect(() => {
    if (!data || mismatch) return;
    let cancelled = false;
    setAudio({ status: "loading" });
    const engine = AudioEngine.get();
    Promise.all([engine.load(data.a.id, data.a.audio), engine.load(data.b.id, data.b.audio)]).then(
      () => {
        if (!cancelled) setAudio({ status: "ready" });
      },
      (e: unknown) => {
        if (!cancelled) setAudio({ status: "error", message: errorMessage(e) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [data, mismatch]);

  // Follow playback; stop it when the screen goes away.
  useEffect(() => {
    const engine = AudioEngine.get();
    const unsubscribe = engine.subscribe(setPlayState);
    return () => {
      unsubscribe();
      engine.stop();
    };
  }, []);

  const audioReady = audio.status === "ready";

  const playItems = useCallback(
    (items: PlayItem[], loopFlag: boolean) => {
      if (!audioReady || items.length === 0) return;
      AudioEngine.get().playSequence(items, { gapSeconds: SEQUENCE_GAP_SECONDS, loop: loopFlag });
    },
    [audioReady],
  );

  const playRegion = useCallback(
    (region: Region, which: PlayWhich, loopFlag: boolean) => {
      if (!refs) return;
      whichRef.current = which;
      playItems(regionPlayItems(region, refs.a, refs.b, which), loopFlag);
    },
    [refs, playItems],
  );

  const selectRegion = useCallback(
    (region: Region, which: PlayWhich = "both") => {
      setActive({ type: "region", key: regionKey(region) });
      playRegion(region, which, loop);
    },
    [playRegion, loop],
  );

  const playCarried = useCallback(
    (c: CarriedComment, loopFlag: boolean) => {
      if (!refs) return;
      const target = carriedPlayTarget(c, refs.a, refs.b);
      if (target) playItems([target.item], loopFlag);
    },
    [refs, playItems],
  );

  const selectCarried = useCallback(
    (c: CarriedComment) => {
      setActive({ type: "carried", commentId: c.source.id });
      playCarried(c, loop);
    },
    [playCarried, loop],
  );

  /** The original comment's span on A (tap on an A marker). */
  const playSource = useCallback(
    (c: CarriedComment) => {
      if (!refs) return;
      setActive({ type: "carried", commentId: c.source.id });
      const s = c.source.span;
      playItems([{ versionId: refs.a.versionId, startFrame: s.start_frame, endFrame: s.end_frame, frameRate: refs.a.frameRate }], loop);
    },
    [refs, playItems, loop],
  );

  const onTapHighlight = useCallback(
    (id: string) => {
      if (!result) return;
      const ref = parseHighlightId(id);
      if (!ref) return;
      if (ref.type === "region") {
        const region = result.regions[ref.index];
        if (region) selectRegion(region);
        return;
      }
      const c = result.carried.find((x) => x.source.id === ref.commentId);
      if (!c) return;
      if (ref.type === "carried") selectCarried(c);
      else playSource(c);
    },
    [result, selectRegion, selectCarried, playSource],
  );

  const onTapClusterA = useCallback(
    (c: Cluster) => {
      if (refs) playItems([clusterItem(refs.a, c)], false);
    },
    [refs, playItems],
  );
  const onTapClusterB = useCallback(
    (c: Cluster) => {
      if (refs) playItems([clusterItem(refs.b, c)], false);
    },
    [refs, playItems],
  );

  const onVerdict = useCallback(
    async (region: Region, verdict: Verdict) => {
      if (!data) return;
      const key = regionKey(region);
      setError(null);
      // Optimistic, so the select never snaps back while the write is in flight.
      setPair((prev) => ({
        id: pairId(aId, bId),
        passage_id: prev?.passage_id ?? data.a.passage_id,
        a_version_id: aId,
        b_version_id: bId,
        verdicts: { ...(prev?.verdicts ?? {}), [key]: verdict },
        updated_at: prev?.updated_at ?? new Date().toISOString(),
      }));
      try {
        setPair(await repo.setVerdict(data.a.passage_id, aId, bId, key, verdict));
      } catch (e) {
        setError(t("compare.regions.save_failed", { message: errorMessage(e) }));
        try {
          setPair(await repo.getPair(aId, bId));
        } catch {
          // keep the optimistic value; the error line already says the save failed
        }
      }
    },
    [data, aId, bId, t],
  );

  const onResolve = useCallback(
    async (c: CarriedComment) => {
      setError(null);
      try {
        await repo.updateComment(c.source.id, { status: "resolved" });
        const comments = await repo.listComments(aId);
        setCommentsA(comments);
        setActive((prev) => (prev?.type === "carried" && prev.commentId === c.source.id ? null : prev));
      } catch (e) {
        setError(t("compare.carried.resolve_failed", { message: errorMessage(e) }));
      }
    },
    [aId, t],
  );

  // What is active, resolved against the current result (survives recomputation).
  const activeRegion =
    active?.type === "region" && result ? (result.regions.find((r) => regionKey(r) === active.key) ?? null) : null;
  const activeCarried =
    active?.type === "carried" && result
      ? (result.carried.find((c) => c.source.id === active.commentId) ?? null)
      : null;
  const activeKey = activeRegion ? regionKey(activeRegion) : null;
  const activeCommentId = activeCarried ? activeCarried.source.id : null;

  const highlightsA = useMemo(() => (result ? regionHighlights(result.regions, "a", activeKey) : []), [result, activeKey]);
  const highlightsB = useMemo(
    () =>
      result
        ? [...regionHighlights(result.regions, "b", activeKey), ...carriedHighlights(result.carried, activeCommentId)]
        : [],
    [result, activeKey, activeCommentId],
  );
  const markersA = useMemo(() => (result ? sourceMarkers(result.carried, activeCommentId) : []), [result, activeCommentId]);
  const markersB = useMemo(() => (result ? carriedMarkers(result.carried, activeCommentId) : []), [result, activeCommentId]);
  const connectors = useMemo(
    () =>
      result && data
        ? buildConnectors(result.alignment, result.clustersA, result.clustersB, data.a.tape.u.length, data.b.tape.u.length, width)
        : [],
    [result, data, width],
  );

  // ---- player bar handlers -------------------------------------------------

  const playing = playState?.playing === true;
  const paused = playState !== null && !playState.playing;

  const onPlay = () => {
    if (paused) {
      AudioEngine.get().toggle();
      return;
    }
    if (activeRegion) playRegion(activeRegion, "both", loop);
    else if (activeCarried) playCarried(activeCarried, loop);
  };
  const onPause = () => AudioEngine.get().toggle();
  const onStop = () => AudioEngine.get().stop();
  const onToggleLoop = () => {
    const next = !loop;
    setLoop(next);
    if (!playing) return;
    if (activeRegion) playRegion(activeRegion, whichRef.current, next);
    else if (activeCarried) playCarried(activeCarried, next);
  };

  // ---- render ---------------------------------------------------------------

  if (load.status === "loading") {
    return (
      <section className="screen compare">
        <p className="muted">{t("common.state.loading")}</p>
      </section>
    );
  }
  if (load.status === "not_found" || load.status === "error") {
    const message =
      load.status === "not_found"
        ? t("compare.state.not_found")
        : t("compare.state.load_failed", { message: load.message });
    return (
      <section className="screen compare">
        <div className="card stack">
          <p className="compare__refusal" role="alert">
            {message}
          </p>
          <p>
            <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
              {t("compare.header.back")}
            </a>
          </p>
        </div>
      </section>
    );
  }

  const { passage, a, b } = load.data;
  const title = passage?.title ?? t("common.nav.compare");

  if (mismatch) {
    return (
      <section className="screen compare">
        <Header title={title} a={a} b={b} t={t} />
        <div className="card stack">
          <p className="compare__refusal" role="alert">
            {t("common.error.codebook_mismatch")}
          </p>
          <TechnicalDetails summary={t("common.tech.summary")}>
            <dl className="tech__list">
              <dt>{t("compare.tech.codebook_a")}</dt>
              <dd>
                <code>{shortHash(a.tape.codebook_hash)}</code>
              </dd>
              <dt>{t("compare.tech.codebook_b")}</dt>
              <dd>
                <code>{shortHash(b.tape.codebook_hash)}</code>
              </dd>
            </dl>
          </TechnicalDetails>
          <p>
            <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
              {t("compare.header.back")}
            </a>
          </p>
        </div>
      </section>
    );
  }

  if (!result || !refs) {
    return (
      <section className="screen compare">
        <p className="muted">{t("common.state.loading")}</p>
      </section>
    );
  }

  const { summary, regions, carried } = result;
  const cursorA = playState && playState.versionId === a.id ? playState.frame : null;
  const cursorB = playState && playState.versionId === b.id ? playState.frame : null;
  const hasWarning = carried.some((c) => c.outcome === "no_change_detected");
  const activeTarget = activeCarried ? carriedPlayTarget(activeCarried, refs.a, refs.b) : null;
  const counts = opCounts(result.alignment);

  return (
    <section className="screen compare">
      <Header title={title} a={a} b={b} t={t} reportHref={routePath({ name: "report", aId, bId })} />

      <div className="card stack stack--loose">
        <div className="compare__summary">
          <Fact value={String(summary.region_count)} label={t(summary.region_count === 1 ? "compare.summary.regions_one" : "compare.summary.regions_other")} />
          <Fact
            value={t("compare.summary.seconds", { value: formatSeconds(summary.changed_seconds, lang) })}
            label={t("compare.summary.changed")}
          />
          <Fact value={formatPercent(summary.stability, lang)} label={t("compare.summary.stability")} />
        </div>

        <div className="compare__strips">
          <div className="compare__strip-label">
            <span className="compare__strip-tag">{t("compare.regions.side_a")}</span>
            <span>{a.label}</span>
            <MockBadge tape={a.tape} label={t("common.mock.badge")} />
          </div>
          <BeadStrip
            clusters={result.clustersA}
            totalFrames={a.tape.u.length}
            frameRate={a.tape.frame_rate}
            highlights={highlightsA}
            markers={markersA}
            cursorFrame={cursorA}
            onTapHighlight={onTapHighlight}
            onTapMarker={onTapHighlight}
            onTapCluster={onTapClusterA}
            onWidth={setWidth}
            ariaLabel={t("compare.strips.a", { label: a.label })}
          />
          <ConnectorBand connectors={connectors} width={width} label={t("compare.strips.connectors")} />
          <BeadStrip
            clusters={result.clustersB}
            totalFrames={b.tape.u.length}
            frameRate={b.tape.frame_rate}
            highlights={highlightsB}
            markers={markersB}
            cursorFrame={cursorB}
            onTapHighlight={onTapHighlight}
            onTapMarker={onTapHighlight}
            onTapCluster={onTapClusterB}
            ariaLabel={t("compare.strips.b", { label: b.label })}
          />
          <div className="compare__strip-label compare__strip-label--b">
            <span className="compare__strip-tag">{t("compare.regions.side_b")}</span>
            <span>{b.label}</span>
            <MockBadge tape={b.tape} label={t("common.mock.badge")} />
          </div>
        </div>

        <div className="compare__player">
          {activeRegion ? (
            <>
              <div className="compare__player-what">
                <span className="compare__player-title">
                  <span className={"swatch swatch--" + activeRegion.kind} aria-hidden="true" />
                  {t("compare.player.region", { n: activeRegion.index + 1 })} · {t("common.region." + activeRegion.kind)}
                </span>
                <span className="compare__player-sub">
                  {t("compare.regions.side_a")} {sideText(t, activeRegion.a, a.tape.frame_rate)} · {t("compare.regions.side_b")}{" "}
                  {sideText(t, activeRegion.b, b.tape.frame_rate)}
                </span>
              </div>
              <div className="compare__player-actions">
                <button
                  type="button"
                  className="btn"
                  disabled={!audioReady || activeRegion.a.end <= activeRegion.a.start}
                  onClick={() => selectRegion(activeRegion, "a")}
                >
                  {t("compare.player.play_a")}
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!audioReady || activeRegion.b.end <= activeRegion.b.start}
                  onClick={() => selectRegion(activeRegion, "b")}
                >
                  {t("compare.player.play_b")}
                </button>
                <PlayerControls
                  playing={playing}
                  loop={loop}
                  onPlay={onPlay}
                  onPause={onPause}
                  onStop={onStop}
                  onToggleLoop={onToggleLoop}
                  disabled={!audioReady}
                  labels={{
                    play: t("compare.player.play_both"),
                    pause: t("common.button.pause"),
                    stop: t("common.button.stop"),
                    loop: t("common.button.loop"),
                  }}
                />
              </div>
            </>
          ) : activeCarried ? (
            <>
              <div className="compare__player-what">
                <span className="compare__player-title">
                  <span className="comment__dot comment__dot--fix_requested" aria-hidden="true" />
                  {t("compare.player.carried", { author: activeCarried.source.author })}
                </span>
                <span className="compare__player-sub">
                  {t("compare.carried.lands", { where: sideText(t, spanRange(activeCarried.span), b.tape.frame_rate) })}
                </span>
              </div>
              <div className="compare__player-actions">
                <PlayerControls
                  playing={playing}
                  loop={loop}
                  onPlay={onPlay}
                  onPause={onPause}
                  onStop={onStop}
                  onToggleLoop={onToggleLoop}
                  disabled={!audioReady || activeTarget === null}
                  labels={{
                    play: activeTarget?.side === "a" ? t("compare.carried.play_a_instead") : t("compare.carried.play_here"),
                    pause: t("common.button.pause"),
                    stop: t("common.button.stop"),
                    loop: t("common.button.loop"),
                  }}
                />
              </div>
            </>
          ) : (
            audioReady && <p className="compare__hint">{t("compare.strips.hint")}</p>
          )}
        </div>
        {audio.status === "loading" && (
          <p className="muted small" role="status">
            {t("compare.player.audio_loading")}
          </p>
        )}
        {audio.status === "error" && (
          <p className="error" role="alert">
            {t("compare.player.audio_failed", { message: audio.message })}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="card stack">
        <h2>{t("compare.regions.title")}</h2>
        {regions.length === 0 ? (
          <p className="muted">{t("compare.summary.no_regions")}</p>
        ) : (
          <RegionList
            regions={regions}
            activeKey={activeKey}
            pair={pair}
            frameRateA={a.tape.frame_rate}
            frameRateB={b.tape.frame_rate}
            t={t}
            onSelect={selectRegion}
            onVerdict={onVerdict}
          />
        )}
      </div>

      <div className="card stack">
        <div>
          <h2>{t("compare.carried.title")}</h2>
          <p className="muted small">{t("compare.carried.intro")}</p>
        </div>
        {hasWarning && (
          <p className="compare__warning" role="status">
            {t("compare.carried.warning_hint")}
          </p>
        )}
        {carried.length === 0 ? (
          <p className="muted">{t("compare.carried.empty")}</p>
        ) : (
          <CarriedList
            carried={carried}
            activeCommentId={activeCommentId}
            refs={refs}
            audioReady={audioReady}
            t={t}
            onPlay={selectCarried}
            onResolve={onResolve}
          />
        )}
      </div>

      <TechnicalDetails summary={t("common.tech.summary")}>
        <dl className="tech__list">
          <dt>{t("compare.tech.alignment_score")}</dt>
          <dd>
            <code>{result.alignment.score}</code>
          </dd>
          <dt>{t("compare.tech.ops")}</dt>
          <dd>
            <code>
              {t("compare.tech.op_match")} {counts.match} · {t("compare.tech.op_mismatch")} {counts.mismatch} ·{" "}
              {t("compare.tech.op_insert_b")} {counts.insert_b} · {t("compare.tech.op_delete_b")} {counts.delete_b}
            </code>
          </dd>
          <dt>{t("compare.tech.clusters_a")}</dt>
          <dd>
            <code>{result.clustersA.length}</code>
          </dd>
          <dt>{t("compare.tech.clusters_b")}</dt>
          <dd>
            <code>{result.clustersB.length}</code>
          </dd>
          <dt>{t("compare.tech.matched_frames")}</dt>
          <dd>
            <code>
              {summary.matched_b_frames} / {summary.total_b_frames}
            </code>
          </dd>
          <dt>{t("compare.tech.codebook")}</dt>
          <dd>
            <code>{shortHash(a.tape.codebook_hash)}</code> <code className="tech__full">{a.tape.codebook_hash}</code>
          </dd>
          <HashRow label={t("compare.tech.tape_hash_a")} hash={a.tape_sha256} />
          <HashRow label={t("compare.tech.audio_hash_a")} hash={a.audio_sha256} />
          <HashRow label={t("compare.tech.tape_hash_b")} hash={b.tape_sha256} />
          <HashRow label={t("compare.tech.audio_hash_b")} hash={b.audio_sha256} />
          <dt>{t("compare.tech.settings")}</dt>
          <dd>
            <code className="tech__full">{settingsText(settings)}</code>
          </dd>
        </dl>
      </TechnicalDetails>
    </section>
  );
}

// ---------------------------------------------------------------------------

function settingsText(s: Settings): string {
  return JSON.stringify(s);
}

function HashRow(props: { label: string; hash: string }): JSX.Element {
  return (
    <>
      <dt>{props.label}</dt>
      <dd>
        <code>{shortHash(props.hash)}</code> <code className="tech__full">{props.hash}</code>
      </dd>
    </>
  );
}

function Fact(props: { value: string; label: string }): JSX.Element {
  return (
    <div className="fact">
      <span className="fact__value">{props.value}</span>
      <span className="fact__label">{props.label}</span>
    </div>
  );
}

function Header(props: { title: string; a: Version; b: Version; t: T; reportHref?: string }): JSX.Element {
  const { title, a, b, t } = props;
  return (
    <div className="screen__head">
      <div>
        <h1 className="screen__title">{title}</h1>
        <div className="compare__versions">
          <span className="compare__version">
            <span>{t("compare.header.a_label", { label: a.label })}</span>
            <span className="compare__version-hint">({t("compare.header.a_hint")})</span>
            <MockBadge tape={a.tape} label={t("common.mock.badge")} />
          </span>
          <span className="compare__version">
            <span>{t("compare.header.b_label", { label: b.label })}</span>
            <span className="compare__version-hint">({t("compare.header.b_hint")})</span>
            <MockBadge tape={b.tape} label={t("common.mock.badge")} />
          </span>
        </div>
      </div>
      {props.reportHref && (
        <div className="row">
          <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
            {t("compare.header.back")}
          </a>
          <a className="btn" href={props.reportHref}>
            {t("compare.header.report")}
          </a>
        </div>
      )}
    </div>
  );
}

/** Light lines joining matched clusters of A to their partners in B. */
function ConnectorBand(props: { connectors: Connector[]; width: number; label: string }): JSX.Element {
  const { connectors, width, label } = props;
  return (
    <div className="compare__connectors">
      {width > 0 && (
        <svg
          width={width}
          height={CONNECTOR_HEIGHT}
          viewBox={`0 0 ${width} ${CONNECTOR_HEIGHT}`}
          role="img"
          aria-label={label}
          focusable="false"
        >
          {connectors.map((c, i) => (
            <line key={i} className={`connector connector--${c.kind}`} x1={c.x1} y1={0} x2={c.x2} y2={CONNECTOR_HEIGHT} />
          ))}
        </svg>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface RegionListProps {
  regions: Region[];
  activeKey: string | null;
  pair: PairRecord | undefined;
  frameRateA: number;
  frameRateB: number;
  t: T;
  onSelect(region: Region): void;
  onVerdict(region: Region, verdict: Verdict): void;
}

const RegionList = memo(function RegionList(props: RegionListProps): JSX.Element {
  const { regions, activeKey, pair, frameRateA, frameRateB, t } = props;
  return (
    <ul className="region-list">
      {regions.map((region) => {
        const n = region.index + 1;
        const active = activeKey !== null && regionKey(region) === activeKey;
        const verdict = verdictOf(pair, region);
        return (
          <li
            key={regionKey(region)}
            className={"region-row" + (active ? " region-row--active" : "")}
            aria-current={active ? "true" : undefined}
          >
            <button
              type="button"
              className="region-row__main"
              onClick={() => props.onSelect(region)}
              aria-label={t("compare.regions.select", { n })}
            >
              <span className="region-row__index tabular">{n}</span>
              <span className="region-row__kind">
                <span className={"swatch swatch--" + region.kind} aria-hidden="true" />
                {t("common.region." + region.kind)}
              </span>
              <span className="region-row__side">
                <span className="region-row__tag">{t("compare.regions.side_a")}</span>
                {sideText(t, region.a, frameRateA)}
              </span>
              <span className="region-row__side">
                <span className="region-row__tag">{t("compare.regions.side_b")}</span>
                {sideText(t, region.b, frameRateB)}
              </span>
            </button>
            <label className="region-row__verdict">
              <span className="sr-only">{t("compare.regions.verdict", { n })}</span>
              <select
                className={verdict === "undecided" ? "is-undecided" : undefined}
                value={verdict}
                onChange={(e) => {
                  const v = e.target.value as Verdict;
                  if (VERDICTS.includes(v)) props.onVerdict(region, v);
                }}
              >
                {VERDICTS.map((v) => (
                  <option key={v} value={v}>
                    {t("common.verdict." + v)}
                  </option>
                ))}
              </select>
            </label>
          </li>
        );
      })}
    </ul>
  );
});

// ---------------------------------------------------------------------------

interface CarriedListProps {
  carried: CarriedComment[];
  activeCommentId: string | null;
  refs: Refs;
  audioReady: boolean;
  t: T;
  onPlay(c: CarriedComment): void;
  onResolve(c: CarriedComment): void;
}

const CarriedList = memo(function CarriedList(props: CarriedListProps): JSX.Element {
  const { carried, activeCommentId, refs, audioReady, t } = props;
  return (
    <ul className="carried-list">
      {carried.map((c) => {
        const active = activeCommentId !== null && c.source.id === activeCommentId;
        const target = carriedPlayTarget(c, refs.a, refs.b);
        const where = sideText(t, spanRange(c.span), refs.b.frameRate);
        return (
          <li
            key={c.source.id}
            className={`carried-row carried-row--${c.outcome}` + (active ? " carried-row--active" : "")}
            aria-current={active ? "true" : undefined}
          >
            <div className="carried-row__head">
              <span className="comment__dot comment__dot--fix_requested" aria-hidden="true" />
              <span className="comment__author">{c.source.author}</span>
              <span className="comment__range">
                {t("compare.carried.original", { range: sideText(t, spanRange(c.source.span), refs.a.frameRate) })}
              </span>
              <span className={`carried-row__badge carried-row__badge--${c.outcome}`}>{t("common.carry." + c.outcome)}</span>
            </div>
            {c.source.text && <p className="comment__text">{c.source.text}</p>}
            {c.source.audio_blob && <CommentAudio blob={c.source.audio_blob} label={t("compare.carried.audio")} />}
            <div className="carried-row__foot">
              <span>{t("compare.carried.lands", { where })}</span>
              <span className="carried-row__actions">
                <button
                  type="button"
                  className="btn btn--small"
                  disabled={!audioReady || target === null}
                  onClick={() => props.onPlay(c)}
                >
                  {target?.side === "a" ? t("compare.carried.play_a_instead") : t("compare.carried.play_here")}
                </button>
                <button type="button" className="btn btn--small" onClick={() => props.onResolve(c)}>
                  {t("compare.carried.resolve")}
                </button>
              </span>
            </div>
            {target?.side === "a" && <p className="field__hint">{t("compare.carried.play_a_note")}</p>}
          </li>
        );
      })}
    </ul>
  );
});
