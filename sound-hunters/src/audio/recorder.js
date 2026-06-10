// MediaRecorder wrapper — mono capture, raw blob kept as recorded.
//
// PRODUCTION NOTE: the prototype stores whatever the browser encodes
// (webm/opus on Chrome/Android, mp4/aac on Safari). Production capture must be
// WAV PCM 16 kHz mono (uncompressed) — swap this module for a worklet-based
// PCM recorder; the rest of the app only sees { blob, mimeType, durationMs }.

let sharedStream = null;

export function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

export function extFor(mimeType) {
  if (!mimeType) return 'webm';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export async function getMicStream() {
  if (sharedStream && sharedStream.getAudioTracks().some((t) => t.readyState === 'live')) {
    return sharedStream;
  }
  sharedStream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, noiseSuppression: false, echoCancellation: false },
  });
  return sharedStream;
}

export class Recorder {
  constructor() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.startedAt = 0;
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
  }

  /** Resolves once recording is rolling; exposes an AnalyserNode for the live waveform. */
  async start() {
    const stream = await getMicStream();
    const mimeType = pickMimeType();
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.sourceNode.connect(this.analyser); // analysis only — not routed to output
    this.mediaRecorder.start();
    this.startedAt = performance.now();
    return this.analyser;
  }

  async stop() {
    const mr = this.mediaRecorder;
    if (!mr || mr.state === 'inactive') return null;
    const done = new Promise((resolve) => { mr.onstop = resolve; });
    mr.stop();
    await done;
    const durationMs = Math.round(performance.now() - this.startedAt);
    const mimeType = mr.mimeType || pickMimeType() || 'audio/webm';
    const blob = new Blob(this.chunks, { type: mimeType });
    try { this.sourceNode?.disconnect(); } catch { /* already gone */ }
    try { await this.audioCtx?.close(); } catch { /* already gone */ }
    this.audioCtx = null;
    this.analyser = null;
    this.mediaRecorder = null;
    return { blob, mimeType, durationMs };
  }
}

/** Decode a blob to mono Float32 samples for the quality gate. Browser-only. */
export async function decodeBlob(blob) {
  const buf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  try {
    const audio = await ctx.decodeAudioData(buf);
    const ch = audio.getChannelData(0);
    return { samples: Float32Array.from(ch), sampleRate: audio.sampleRate };
  } finally {
    ctx.close().catch(() => {});
  }
}
