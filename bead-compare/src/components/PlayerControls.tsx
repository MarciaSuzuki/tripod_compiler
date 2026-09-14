export interface PlayerLabels {
  play: string;
  pause: string;
  stop: string;
  loop: string;
}

export interface PlayerControlsProps {
  playing: boolean;
  loop: boolean;
  onPlay(): void;
  onPause(): void;
  onStop(): void;
  onToggleLoop(): void;
  disabled?: boolean;
  /** Translated by the screen (common.button.play/pause/stop/loop). */
  labels: PlayerLabels;
}

/** Play/pause, stop and loop buttons. Glyphs are icons; the accessible name is the label. */
export function PlayerControls(props: PlayerControlsProps): JSX.Element {
  const { playing, loop, disabled, labels } = props;
  const playLabel = playing ? labels.pause : labels.play;
  return (
    <div className="player" role="group">
      <button
        type="button"
        className={"player__btn player__btn--play" + (playing ? " is-on" : "")}
        onClick={playing ? props.onPause : props.onPlay}
        disabled={disabled}
        aria-label={playLabel}
        title={playLabel}
      >
        <span className="player__glyph" aria-hidden="true">
          {playing ? "❚❚" : "▶"}
        </span>
        <span className="player__label">{playLabel}</span>
      </button>
      <button
        type="button"
        className="player__btn player__btn--stop"
        onClick={props.onStop}
        disabled={disabled}
        aria-label={labels.stop}
        title={labels.stop}
      >
        <span className="player__glyph" aria-hidden="true">
          ■
        </span>
        <span className="player__label">{labels.stop}</span>
      </button>
      <button
        type="button"
        className={"player__btn player__btn--loop" + (loop ? " is-on" : "")}
        onClick={props.onToggleLoop}
        disabled={disabled}
        aria-label={labels.loop}
        aria-pressed={loop}
        title={labels.loop}
      >
        <span className="player__glyph" aria-hidden="true">
          ⟳
        </span>
        <span className="player__label">{labels.loop}</span>
      </button>
    </div>
  );
}
