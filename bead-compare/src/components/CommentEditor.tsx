import { useEffect, useRef, useState } from "react";
import type { Comment, CommentKind, Span } from "../model";
import { canRecord, startRecording, type RecordingHandle } from "../audio/recorder";

/**
 * Typed and/or spoken comment for a span. Holds no strings: every label is
 * translated by the screen and passed in.
 *
 * The <audio> preview plays back the consultant's own recording only.
 */

export interface CommentEditorLabels {
  /** textarea label/placeholder */
  text: string;
  /** legend of the kind selector */
  kind: string;
  kinds: Record<CommentKind, string>;
  record: string;
  stopRecording: string;
  /** shown while recording, e.g. "Gravando…" */
  recording: string;
  discardRecording: string;
  /** shown when the browser cannot record */
  recordUnavailable: string;
  /** shown when the microphone could not be opened */
  recordFailed: string;
  save: string;
  cancel: string;
}

export interface CommentEditorProps {
  span: Span;
  author: string;
  onSave(c: Omit<Comment, "id" | "created_at">): void;
  onCancel(): void;
  labels: CommentEditorLabels;
  /** Kind preselected when the editor opens; default "note". */
  initialKind?: CommentKind;
}

const KINDS: CommentKind[] = ["note", "fix_requested", "approved"];

export function CommentEditor(props: CommentEditorProps): JSX.Element {
  const { span, author, labels } = props;
  const [text, setText] = useState("");
  const [kind, setKind] = useState<CommentKind>(props.initialKind ?? "note");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleRef = useRef<RecordingHandle | null>(null);
  const supported = canRecord();

  // Object URL for the preview; revoked on change/unmount.
  useEffect(() => {
    if (!blob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // Release the microphone if the editor unmounts mid-recording.
  useEffect(() => {
    return () => {
      handleRef.current?.cancel();
      handleRef.current = null;
    };
  }, []);

  const beginRecording = async () => {
    if (isRecording || handleRef.current) return;
    setRecordError(false);
    try {
      const handle = await startRecording();
      handleRef.current = handle;
      setIsRecording(true);
    } catch {
      setRecordError(true);
    }
  };

  const finishRecording = async () => {
    const handle = handleRef.current;
    if (!handle) return;
    handleRef.current = null;
    try {
      const result = await handle.stop();
      setBlob(result.size > 0 ? result : null);
    } catch {
      setRecordError(true);
    } finally {
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    handleRef.current?.cancel();
    handleRef.current = null;
    setIsRecording(false);
    setBlob(null);
  };

  const trimmed = text.trim();
  const canSave = !isRecording && (trimmed.length > 0 || blob !== null);

  const save = () => {
    if (!canSave) return;
    const c: Omit<Comment, "id" | "created_at"> = {
      span: { ...span },
      author,
      kind,
      status: "open",
    };
    if (trimmed.length > 0) c.text = trimmed;
    if (blob) c.audio_blob = blob;
    props.onSave(c);
  };

  const cancel = () => {
    handleRef.current?.cancel();
    handleRef.current = null;
    setIsRecording(false);
    props.onCancel();
  };

  return (
    <form
      className="comment-editor"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="comment-editor__field">
        <span className="comment-editor__label">{labels.text}</span>
        <textarea
          className="comment-editor__text"
          value={text}
          placeholder={labels.text}
          rows={3}
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      <fieldset className="comment-editor__kinds">
        <legend className="comment-editor__label">{labels.kind}</legend>
        {KINDS.map((k) => (
          <label key={k} className={"comment-editor__kind comment-editor__kind--" + k + (kind === k ? " is-on" : "")}>
            <input type="radio" name="comment-kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
            <span className={"comment__dot comment__dot--" + k} aria-hidden="true" />
            <span>{labels.kinds[k]}</span>
          </label>
        ))}
      </fieldset>

      <div className="comment-editor__audio">
        {!supported ? (
          <span className="comment-editor__hint">{labels.recordUnavailable}</span>
        ) : isRecording ? (
          <>
            <span className="rec-indicator" role="status">
              <span className="rec-indicator__dot" aria-hidden="true" />
              {labels.recording}
            </span>
            <button type="button" className="btn comment-editor__record is-on" onClick={finishRecording}>
              {labels.stopRecording}
            </button>
          </>
        ) : blob ? (
          <>
            {previewUrl && <audio className="comment-editor__preview" controls src={previewUrl} />}
            <button type="button" className="btn comment-editor__discard" onClick={discardRecording}>
              {labels.discardRecording}
            </button>
          </>
        ) : (
          <button type="button" className="btn comment-editor__record" onClick={beginRecording}>
            {labels.record}
          </button>
        )}
        {recordError && (
          <span className="comment-editor__error" role="alert">
            {labels.recordFailed}
          </span>
        )}
      </div>

      <div className="comment-editor__actions">
        <button type="button" className="btn" onClick={cancel}>
          {labels.cancel}
        </button>
        <button type="submit" className="btn btn--primary" disabled={!canSave}>
          {labels.save}
        </button>
      </div>
    </form>
  );
}
