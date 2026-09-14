import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine, type LoadedAudio } from "../audio/engine";
import { formatRange, formatTime } from "../audio/format";
import { BeadStrip } from "../components/BeadStrip";
import { CommentEditor, type CommentEditorLabels } from "../components/CommentEditor";
import { CommentList, type CommentListLabels } from "../components/CommentList";
import { MockBadge } from "../components/MockBadge";
import { PlayerControls, type PlayerLabels } from "../components/PlayerControls";
import { TechnicalDetails } from "../components/TechnicalDetails";
import { Waveform } from "../components/Waveform";
import { repo } from "../db/repo";
import { useI18n, type T } from "../i18n";
import type { Cluster, Comment, FrameRange, Passage, Span, Version } from "../model";
import { groupClusters, shortHash } from "../model";
import { routePath, useRoute } from "../router";
import { useSettings } from "../settings";
import { formatDate } from "./PassageList";
import {
  clusterRange,
  extendSelection,
  formatSeries,
  hasSelection,
  markersFromComments,
  rangeToSpan,
  readStoredAuthor,
  resolveAuthor,
  resolveKeyAction,
  sameRange,
  selectionValues,
  spanToRange,
  wholeRange,
  writeStoredAuthor,
  type ListenKeyAction,
} from "./listenLogic";
import "./Listen.css";

/**
 * Listen (#/listen/:versionId): one version, its bead strip under a thin
 * waveform, play / pause / stop / loop, comments on spans, and technical
 * details at the bottom.
 *
 * Sound comes only from AudioEngine (slices of the decoded audio.wav) and
 * from the <audio> element of a spoken comment. Beads are never numbered;
 * frame indexes and U/F values appear only inside <TechnicalDetails>.
 *
 * Comments carried forward from an earlier version (carried_from set) show
 * with the "carried" label and dashed markers; resolving one also resolves
 * its source on the earlier version, and it cannot be deleted here.
 */

type Load = { status: "loading" } | { status: "missing" } | { status: "ready"; version: Version };

const WAVEFORM_HEIGHT = 36;
const STRIP_HEIGHT = 64;

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function playerLabels(t: T): PlayerLabels {
  return {
    play: t("common.button.play"),
    pause: t("common.button.pause"),
    stop: t("common.button.stop"),
    loop: t("common.button.loop"),
  };
}

function editorLabels(t: T): CommentEditorLabels {
  return {
    text: t("listen.comment.text"),
    kind: t("listen.comment.kind"),
    kinds: {
      note: t("common.kind.note"),
      fix_requested: t("common.kind.fix_requested"),
      approved: t("common.kind.approved"),
    },
    record: t("listen.comment.record"),
    stopRecording: t("listen.comment.stop_recording"),
    recording: t("listen.comment.recording"),
    discardRecording: t("listen.comment.discard_recording"),
    recordUnavailable: t("listen.comment.record_unavailable"),
    recordFailed: t("listen.comment.record_failed"),
    save: t("common.button.save"),
    cancel: t("common.button.cancel"),
  };
}

function listLabels(t: T): CommentListLabels {
  return {
    kinds: {
      note: t("common.kind.note"),
      fix_requested: t("common.kind.fix_requested"),
      approved: t("common.kind.approved"),
    },
    statuses: {
      open: t("common.status.open"),
      resolved: t("common.status.resolved"),
      carried: t("common.status.carried"),
    },
    resolve: t("listen.comment.resolve"),
    delete: t("common.button.delete"),
    play: t("listen.comment.play"),
    audio: t("listen.comment.audio"),
    carried: t("listen.comment.carried"),
  };
}

// ---------------------------------------------------------------------------

export function Listen(): JSX.Element {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const route = useRoute();
  const versionId = route.name === "listen" ? route.versionId : "";
  const engine = AudioEngine.get();

  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [passage, setPassage] = useState<Passage | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState<LoadedAudio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selection, setSelection] = useState<FrameRange | null>(null);
  const [cursorFrame, setCursorFrame] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [stripWidth, setStripWidth] = useState(0);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editorSpan, setEditorSpan] = useState<Span | null>(null);
  const [author, setAuthor] = useState<string>(readStoredAuthor);

  const version = load.status === "ready" ? load.version : null;

  // --- data -----------------------------------------------------------------

  const reloadComments = useCallback(async (id: string) => {
    setComments(await repo.listComments(id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    (async () => {
      try {
        const v = await repo.getVersion(versionId);
        if (cancelled) return;
        if (!v) {
          setLoad({ status: "missing" });
          return;
        }
        const [p, cs] = await Promise.all([repo.getPassage(v.passage_id), repo.listComments(v.id)]);
        if (cancelled) return;
        setPassage(p);
        setComments(cs);
        setLoad({ status: "ready", version: v });
      } catch (e) {
        if (!cancelled) setError(t("listen.state.load_failed", { message: errorMessage(e) }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only the route id triggers a fetch; a language change must not refetch.
  }, [versionId]);

  // Decode once; the engine caches by version id.
  useEffect(() => {
    if (!version) return;
    let cancelled = false;
    engine.load(version.id, version.audio).then(
      (l) => {
        if (!cancelled) setLoaded(l);
      },
      (e) => {
        if (!cancelled) setError(t("listen.state.decode_failed", { message: errorMessage(e) }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [version, engine]);

  // Cursor follows playback of this version; anything else clears it.
  useEffect(() => {
    if (!version) return;
    const id = version.id;
    const unsubscribe = engine.subscribe((s) => {
      if (s && s.versionId === id) {
        setCursorFrame(s.frame);
        setPlaying(s.playing);
      } else {
        setCursorFrame(null);
        setPlaying(false);
      }
    });
    return () => {
      unsubscribe();
      engine.stop();
    };
  }, [version, engine]);

  // --- derived --------------------------------------------------------------

  const clusters = useMemo<Cluster[]>(
    () => (version ? groupClusters(version.tape, settings.grouping) : []),
    [version, settings.grouping],
  );
  const totalFrames = version ? version.tape.u.length : 0;
  const frameRate = version ? version.tape.frame_rate : 0;
  const peaks = useMemo(() => (loaded && stripWidth > 0 ? loaded.peaks(stripWidth) : null), [loaded, stripWidth]);
  const labelsPlayer = useMemo(() => playerLabels(t), [t]);
  const labelsEditor = useMemo(() => editorLabels(t), [t]);
  const labelsList = useMemo(() => listLabels(t), [t]);
  const markers = useMemo(
    () =>
      markersFromComments(
        comments,
        activeId,
        (c) => `${labelsList.kinds[c.kind]}, ${c.author}, ${formatRange(c.span.start_frame, c.span.end_frame, frameRate, lang)}`,
      ),
    [comments, activeId, labelsList, frameRate, lang],
  );

  // --- playback -------------------------------------------------------------

  const playRange = useCallback(
    (range: FrameRange, loopFlag: boolean) => {
      if (!version || !loaded || !hasSelection(range)) return;
      try {
        engine.play(
          { versionId: version.id, startFrame: range.start, endFrame: range.end, frameRate: version.tape.frame_rate },
          { loop: loopFlag },
        );
      } catch (e) {
        setError(t("common.error.with_detail", { message: errorMessage(e) }));
      }
    },
    [engine, version, loaded, t],
  );

  const currentRange = (): FrameRange => selection ?? wholeRange(totalFrames);

  /** Our own item, paused or playing, or null. */
  const ownState = () => {
    const s = engine.state;
    return s && version && s.versionId === version.id ? s : null;
  };

  const choose = (range: FrameRange) => {
    setSelection(range);
    setActiveId(null);
    playRange(range, loop);
  };

  const onTapCluster = (c: Cluster) => choose(clusterRange(c));
  const onSelect = (range: FrameRange) => choose(range);

  const onPlay = () => {
    const s = ownState();
    if (s && !s.playing) engine.toggle();
    else playRange(currentRange(), loop);
  };
  const onPause = () => {
    if (ownState()?.playing) engine.toggle();
  };
  const onStop = () => engine.stop();

  const onPlayPause = () => {
    const s = ownState();
    if (s) engine.toggle();
    else playRange(currentRange(), loop);
  };

  const onToggleLoop = () => {
    const next = !loop;
    setLoop(next);
    const s = ownState();
    if (s) playRange({ start: s.item.startFrame, end: s.item.endFrame }, next);
  };

  const onClearSelection = () => {
    setSelection(null);
    setActiveId(null);
    setEditorSpan(null);
  };

  // --- comments -------------------------------------------------------------

  const openEditor = () => {
    if (!version || !hasSelection(selection)) return;
    setEditorSpan(rangeToSpan(version.id, selection));
  };

  const onSaveComment = async (c: Omit<Comment, "id" | "created_at">) => {
    if (!version) return;
    try {
      const saved = await repo.addComment(c);
      await reloadComments(version.id);
      setActiveId(saved.id);
      setEditorSpan(null);
    } catch (e) {
      setError(t("common.error.with_detail", { message: errorMessage(e) }));
    }
  };

  const onTapComment = (c: Comment) => {
    const range = spanToRange(c.span);
    setSelection(range);
    setActiveId(c.id);
    playRange(range, loop);
  };

  const onTapMarker = (id: string) => {
    const c = comments.find((x) => x.id === id);
    if (c) onTapComment(c);
  };

  const onResolve = async (c: Comment) => {
    if (!version) return;
    try {
      await repo.updateComment(c.id, { status: "resolved" });
      // A carried copy is a projection of its source on the earlier version: resolve that too.
      if (c.carried_from) await repo.updateComment(c.carried_from, { status: "resolved" }).catch(() => undefined);
      await reloadComments(version.id);
    } catch (e) {
      setError(t("common.error.with_detail", { message: errorMessage(e) }));
    }
  };

  const onDelete = async (c: Comment) => {
    if (!version) return;
    if (!window.confirm(t("listen.comment.delete_confirm"))) return;
    try {
      await repo.deleteComment(c.id);
      await reloadComments(version.id);
      if (activeId === c.id) setActiveId(null);
    } catch (e) {
      setError(t("common.error.with_detail", { message: errorMessage(e) }));
    }
  };

  const onAuthorChange = (value: string) => {
    setAuthor(value);
    writeStoredAuthor(value);
  };

  // --- keyboard -------------------------------------------------------------

  const keyActionRef = useRef<(a: ListenKeyAction) => void>(() => {});
  useEffect(() => {
    keyActionRef.current = (a) => {
      switch (a.type) {
        case "play_pause":
          onPlayPause();
          break;
        case "step": {
          const next = extendSelection(clusters, selection, a.direction, a.shrink);
          if (next && !sameRange(next, selection)) choose(next);
          break;
        }
        case "comment":
          openEditor();
          break;
        case "escape":
          engine.stop();
          setEditorSpan(null);
          break;
      }
    };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = resolveKeyAction(e, e.target);
      if (!action) return;
      e.preventDefault();
      keyActionRef.current(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- render ---------------------------------------------------------------

  if (load.status === "loading" && !error) {
    return (
      <section className="screen listen">
        <p className="muted" role="status">
          {t("listen.state.loading")}
        </p>
      </section>
    );
  }

  if (load.status === "missing" || !version) {
    return (
      <section className="screen listen">
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : (
          <p className="empty">{t("listen.state.not_found")}</p>
        )}
        <p>
          <a className="btn btn--quiet" href={routePath({ name: "passages" })}>
            {t("listen.state.back")}
          </a>
        </p>
      </section>
    );
  }

  const meta = version.meta;
  const values = selectionValues(version.tape, selection);
  const canComment = loaded !== null && hasSelection(selection);
  const rangeText = selection
    ? formatRange(selection.start, selection.end, frameRate, lang)
    : formatRange(0, totalFrames, frameRate, lang);

  return (
    <section className="screen listen">
      <header className="listen__head">
        <p className="listen__back">
          <a href={routePath({ name: "passages" })}>← {t("listen.header.passages")}</a>
        </p>
        <h1 className="screen__title">{passage?.title ?? t("listen.header.untitled")}</h1>
        <p className="listen__meta">
          <span className="listen__meta-item">
            {t("listen.header.version")} <strong>{version.label}</strong>
          </span>
          {meta.narrator && (
            <span className="listen__meta-item">
              {t("listen.header.narrator")} {meta.narrator}
            </span>
          )}
          {meta.recorded_at && (
            <span className="listen__meta-item">
              {t("listen.header.recorded_at")} {formatDate(meta.recorded_at, lang)}
            </span>
          )}
          <MockBadge tape={version.tape} label={t("common.mock.badge")} />
        </p>
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="card listen__stage" role="region" aria-label={t("listen.player.stage_aria", { label: version.label })}>
        <div className="strip-stack listen__strips">
          <Waveform peaks={peaks} totalFrames={totalFrames} cursorFrame={cursorFrame} selection={selection} height={WAVEFORM_HEIGHT} />
          <BeadStrip
            clusters={clusters}
            totalFrames={totalFrames}
            frameRate={frameRate}
            height={STRIP_HEIGHT}
            selection={selection}
            cursorFrame={cursorFrame}
            markers={markers}
            onTapCluster={onTapCluster}
            onSelect={onSelect}
            onTapMarker={onTapMarker}
            onWidth={setStripWidth}
            ariaLabel={t("listen.player.strip_aria", { label: version.label })}
            lang={lang}
          />
        </div>

        <div className="row row--between listen__controls">
          <PlayerControls
            playing={playing}
            loop={loop}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
            onToggleLoop={onToggleLoop}
            disabled={loaded === null}
            labels={labelsPlayer}
          />
          <div className="row listen__range">
            {loaded === null ? (
              <span className="muted" role="status">
                {t("listen.state.decoding")}
              </span>
            ) : (
              <>
                <span className="muted">{selection ? t("listen.player.selection") : t("listen.player.whole")}</span>
                <span className="tabular">{rangeText}</span>
                {selection && (
                  <button type="button" className="btn btn--quiet btn--small" onClick={onClearSelection}>
                    {t("listen.player.clear_selection")}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="listen__keys">
          <span className="listen__key">
            <kbd>{t("listen.keys.space_key")}</kbd> {t("listen.keys.space")}
          </span>
          <span className="listen__key">
            <kbd>{t("listen.keys.arrows_key")}</kbd> {t("listen.keys.arrows")}
          </span>
          <span className="listen__key">
            <kbd>{t("listen.keys.shift_arrows_key")}</kbd> {t("listen.keys.shift_arrows")}
          </span>
          <span className="listen__key">
            <kbd>{t("listen.keys.comment_key")}</kbd> {t("listen.keys.comment")}
          </span>
          <span className="listen__key">
            <kbd>{t("listen.keys.escape_key")}</kbd> {t("listen.keys.escape")}
          </span>
        </p>
      </div>

      <div className="listen__comments">
        <div className="row row--between listen__comments-head">
          <h2>{t("listen.comment.title")}</h2>
          <div className="row listen__comments-tools">
            <label className="field listen__author">
              <span className="field__label">{t("common.author.label")}</span>
              <input
                type="text"
                value={author}
                placeholder={t("listen.comment.default_author")}
                autoComplete="name"
                onChange={(e) => onAuthorChange(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={openEditor}
              disabled={!canComment || editorSpan !== null}
              title={canComment ? undefined : t("listen.comment.add_hint")}
            >
              {t("listen.comment.add")}
            </button>
          </div>
        </div>

        {!hasSelection(selection) && editorSpan === null && <p className="muted small">{t("listen.comment.add_hint")}</p>}

        {editorSpan && (
          <div className="stack stack--tight listen__editor">
            <p className="muted small">
              {t("listen.comment.editing", { range: formatRange(editorSpan.start_frame, editorSpan.end_frame, frameRate, lang) })}
            </p>
            <CommentEditor
              key={`${editorSpan.start_frame}-${editorSpan.end_frame}`}
              span={editorSpan}
              author={resolveAuthor(author, t("listen.comment.default_author"))}
              onSave={(c) => void onSaveComment(c)}
              onCancel={() => setEditorSpan(null)}
              labels={labelsEditor}
            />
          </div>
        )}

        {comments.length === 0 ? (
          <p className="muted listen__empty">{t("listen.comment.empty")}</p>
        ) : (
          <CommentList
            comments={comments}
            frameRate={frameRate}
            activeId={activeId}
            onTap={onTapComment}
            onResolve={(c) => void onResolve(c)}
            onDelete={(c) => void onDelete(c)}
            labels={labelsList}
            lang={lang}
          />
        )}
      </div>

      <TechnicalDetails summary={t("common.tech.summary")}>
        <dl className="tech__list">
          <dt>{t("listen.tech.frames")}</dt>
          <dd>
            <code>{totalFrames}</code>
          </dd>
          <dt>{t("listen.tech.frame_rate")}</dt>
          <dd>
            <code>{frameRate}</code>
          </dd>
          <dt>{t("listen.tech.duration")}</dt>
          <dd>
            <code>{formatTime(frameRate > 0 ? totalFrames / frameRate : 0, lang)}</code>
          </dd>
          <dt>{t("listen.tech.audio_duration")}</dt>
          <dd>
            <code>{loaded ? `${loaded.durationSeconds.toFixed(3)} s` : t("listen.tech.none")}</code>
          </dd>
          <dt>{t("listen.tech.pause_unit")}</dt>
          <dd>
            <code>{version.tape.pause_unit ?? t("listen.tech.none")}</code>
          </dd>
          <dt>{t("listen.tech.codebook")}</dt>
          <dd>
            <code>{shortHash(version.tape.codebook_hash)}</code>{" "}
            <code className="tech__full">{version.tape.codebook_hash}</code>
          </dd>
          <dt>{t("listen.tech.tape_hash")}</dt>
          <dd>
            <code>{shortHash(version.tape_sha256)}</code> <code className="tech__full">{version.tape_sha256}</code>
          </dd>
          <dt>{t("listen.tech.audio_hash")}</dt>
          <dd>
            <code>{shortHash(version.audio_sha256)}</code> <code className="tech__full">{version.audio_sha256}</code>
          </dd>
          <dt>{t("listen.tech.clusters")}</dt>
          <dd>
            <code>{clusters.length}</code>
          </dd>
          <dt>{t("listen.tech.selection")}</dt>
          <dd>
            <code>{selection ? `${selection.start}–${selection.end}` : t("listen.tech.selection_none")}</code>
          </dd>
          <dt>{t("listen.tech.u_values")}</dt>
          <dd>
            <code>{values.u.length > 0 ? formatSeries(values.u) : t("listen.tech.none")}</code>
          </dd>
          <dt>{t("listen.tech.f_values")}</dt>
          <dd>
            <code>{values.f.length > 0 ? formatSeries(values.f) : t("listen.tech.none")}</code>
          </dd>
        </dl>
      </TechnicalDetails>
    </section>
  );
}
