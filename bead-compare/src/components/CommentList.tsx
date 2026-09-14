import { useEffect, useState } from "react";
import type { Comment, CommentKind, CommentStatus } from "../model";
import { formatRange } from "../audio/format";

/**
 * Comments under a strip. Tapping a comment's header plays its span (the
 * screen decides); a spoken comment gets an <audio controls> element that
 * plays the consultant's own recording. Holds no strings.
 */

export interface CommentListLabels {
  kinds: Record<CommentKind, string>;
  statuses: Record<CommentStatus, string>;
  resolve: string;
  delete: string;
  /** e.g. "Ouvir" — accessible name of the header button */
  play: string;
  /** e.g. "Comentário falado" — accessible name of the audio element */
  audio: string;
  /** e.g. "Trazido da versão anterior" */
  carried?: string;
}

export interface CommentListProps {
  comments: Comment[];
  frameRate: number;
  activeId?: string | null;
  onTap(c: Comment): void;
  onResolve?(c: Comment): void;
  onDelete?(c: Comment): void;
  labels: CommentListLabels;
}

/** <audio controls> for a blob; the object URL is created on mount and revoked on cleanup. */
export function CommentAudio(props: { blob: Blob; label: string }): JSX.Element | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(props.blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
    };
  }, [props.blob]);
  if (!url) return null;
  return <audio className="comment__audio" controls preload="metadata" src={url} aria-label={props.label} />;
}

export function CommentList(props: CommentListProps): JSX.Element {
  const { comments, frameRate, activeId, labels } = props;
  return (
    <ul className="comment-list">
      {comments.map((c) => {
        const active = activeId != null && activeId === c.id;
        const cls =
          `comment comment--${c.kind} comment--${c.status}` +
          (active ? " comment--active" : "") +
          (c.carried_from ? " comment--carried" : "");
        return (
          <li key={c.id} className={cls} aria-current={active ? "true" : undefined}>
            <button
              type="button"
              className="comment__head"
              onClick={() => props.onTap(c)}
              aria-label={`${labels.play}: ${labels.kinds[c.kind]}, ${c.author}, ${formatRange(c.span.start_frame, c.span.end_frame, frameRate)}`}
            >
              <span className={"comment__dot comment__dot--" + c.kind} aria-hidden="true" />
              <span className="comment__author">{c.author}</span>
              <span className="comment__range">{formatRange(c.span.start_frame, c.span.end_frame, frameRate)}</span>
              <span className="comment__kind">{labels.kinds[c.kind]}</span>
            </button>
            {c.text && <p className="comment__text">{c.text}</p>}
            {c.audio_blob && <CommentAudio blob={c.audio_blob} label={labels.audio} />}
            <div className="comment__foot">
              <span className={"comment__status comment__status--" + c.status}>{labels.statuses[c.status]}</span>
              {c.carried_from && labels.carried && <span className="comment__carried">{labels.carried}</span>}
              {(props.onResolve || props.onDelete) && (
                <span className="comment__actions">
                  {props.onResolve && c.status !== "resolved" && (
                    <button type="button" className="btn btn--small" onClick={() => props.onResolve?.(c)}>
                      {labels.resolve}
                    </button>
                  )}
                  {props.onDelete && (
                    <button type="button" className="btn btn--small btn--danger" onClick={() => props.onDelete?.(c)}>
                      {labels.delete}
                    </button>
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
