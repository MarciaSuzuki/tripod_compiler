/**
 * Microphone → Blob through MediaRecorder.
 *
 * This is the only source of sound in the app besides slices of the original
 * audio.wav: the consultant's own spoken comment. Nothing is synthesized.
 */

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

export interface RecordingHandle {
  /** Stops the recorder, releases the microphone and resolves to the recorded blob. */
  stop(): Promise<Blob>;
  /** Releases the microphone and discards whatever was recorded. */
  cancel(): void;
}

/** True when getUserMedia and MediaRecorder exist (never throws; false in SSR/tests). */
export function canRecord(): boolean {
  if (typeof navigator === "undefined" || typeof MediaRecorder === "undefined") return false;
  const md = navigator.mediaDevices;
  return !!md && typeof md.getUserMedia === "function";
}

/** First mime type MediaRecorder says it supports, or undefined to let the browser choose. */
export function pickMimeType(candidates: readonly string[] = MIME_CANDIDATES): string | undefined {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      // ignore and try the next one
    }
  }
  return undefined;
}

/** Extension for a recorded blob's mime type (used by exports); "webm" when unknown. */
export function extensionForMime(mime: string): string {
  const base = mime.split(";")[0].trim().toLowerCase();
  if (base === "audio/ogg") return "ogg";
  if (base === "audio/mp4") return "m4a";
  if (base === "audio/mpeg") return "mp3";
  if (base === "audio/wav" || base === "audio/x-wav") return "wav";
  return "webm";
}

export async function startRecording(): Promise<RecordingHandle> {
  if (!canRecord()) throw new Error("recording is not supported in this browser");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  let rec: MediaRecorder;
  try {
    rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch (e) {
    stream.getTracks().forEach((t) => t.stop());
    throw e;
  }
  const chunks: BlobPart[] = [];
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    stream.getTracks().forEach((t) => t.stop());
  };
  rec.ondataavailable = (ev: BlobEvent) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  let result: Promise<Blob> | null = null;
  const type = rec.mimeType || mimeType || "";

  const stop = (): Promise<Blob> => {
    if (result) return result;
    result = new Promise<Blob>((resolve, reject) => {
      const finish = () => {
        release();
        resolve(new Blob(chunks, { type }));
      };
      if (rec.state === "inactive") {
        finish();
        return;
      }
      rec.onstop = finish;
      rec.onerror = () => {
        release();
        reject(new Error("recording failed"));
      };
      try {
        rec.stop();
      } catch (e) {
        release();
        reject(e);
      }
    });
    return result;
  };

  const cancel = () => {
    if (!result) result = Promise.resolve(new Blob([], { type }));
    rec.ondataavailable = null;
    rec.onstop = null;
    rec.onerror = null;
    try {
      if (rec.state !== "inactive") rec.stop();
    } catch {
      // already stopped
    }
    chunks.length = 0;
    release();
  };

  rec.start(1000);
  return { stop, cancel };
}
