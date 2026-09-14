/**
 * AudioEngine — decode each version's audio.wav once, play slices of it by
 * sample offset through AudioBufferSourceNode. This is the ONLY way the app
 * makes sound from a recording: no synthesis, no vocoder, no render endpoint.
 *
 * Pause/resume policy (toggle): the whole AudioContext is suspended and
 * resumed. Suspending freezes ctx.currentTime, so every scheduled source
 * (including the look-ahead loop iteration) keeps its timing exactly when the
 * context resumes. We chose this over stop+remember-position because a
 * sequence (A, gap, B) stays sample-accurate across a pause. The engine is
 * the only user of the context, so suspending it affects nothing else.
 *
 * Loop policy: an iteration (one item, or the whole A-gap-B sequence) is
 * scheduled on the context clock one iteration ahead; when the last source of
 * iteration k ends we schedule iteration k+2. Loops are therefore gapless
 * except for the deliberate gap (gapSeconds between items and between
 * sequence repeats; LOOP_GAP_SECONDS between repeats of a single item).
 *
 * SSR/tests: nothing touches window or AudioContext until load() or play().
 */

export interface LoadedAudio {
  buffer: AudioBuffer;
  durationSeconds: number;
  /** 0..1 max-abs per bucket over channel 0; cached per bucket count. */
  peaks(buckets: number): Float32Array;
}

export interface PlayItem {
  versionId: string;
  startFrame: number;
  /** exclusive */
  endFrame: number;
  frameRate: number;
}

export interface PlayState {
  versionId: string;
  frame: number;
  playing: boolean;
  item: PlayItem;
}

/** Small lead so a freshly scheduled sequence starts sample-accurately. */
const LEAD_SECONDS = 0.03;
/** Silence between repeats when a single item loops (a sequence uses its gapSeconds). */
const LOOP_GAP_SECONDS = 0.3;
const DEFAULT_SEQUENCE_GAP_SECONDS = 0.6;

/** Max-abs per bucket over one channel; values clamped to 0..1. Pure; used by LoadedAudio.peaks. */
export function computePeaks(channel: ArrayLike<number>, buckets: number): Float32Array {
  const n = Number.isFinite(buckets) ? Math.max(0, Math.floor(buckets)) : 0;
  const out = new Float32Array(n);
  const len = channel.length;
  if (n === 0 || len === 0) return out;
  for (let b = 0; b < n; b++) {
    const lo = Math.floor((b * len) / n);
    let hi = Math.floor(((b + 1) * len) / n);
    if (hi <= lo) hi = Math.min(len, lo + 1);
    let max = 0;
    for (let i = lo; i < hi; i++) {
      const v = Math.abs(channel[i]);
      if (v > max) max = v;
    }
    out[b] = max > 1 ? 1 : max;
  }
  return out;
}

function makeLoaded(buffer: AudioBuffer): LoadedAudio {
  const cache = new Map<number, Float32Array>();
  return {
    buffer,
    durationSeconds: buffer.duration,
    peaks(buckets: number): Float32Array {
      const n = Number.isFinite(buckets) ? Math.max(0, Math.floor(buckets)) : 0;
      let p = cache.get(n);
      if (!p) {
        const channel = buffer.numberOfChannels > 0 ? buffer.getChannelData(0) : new Float32Array(0);
        p = computePeaks(channel, n);
        cache.set(n, p);
      }
      return p;
    },
  };
}

function decode(ctx: AudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise<AudioBuffer>((resolve, reject) => {
    let settled = false;
    const ok = (b: AudioBuffer) => {
      if (settled) return;
      settled = true;
      resolve(b);
    };
    const fail = (e: unknown) => {
      if (settled) return;
      settled = true;
      reject(e instanceof Error ? e : new Error("audio could not be decoded"));
    };
    try {
      // Promise form in modern browsers; callbacks cover older Safari.
      const r = ctx.decodeAudioData(bytes, ok, fail);
      if (r && typeof (r as Promise<AudioBuffer>).then === "function") {
        (r as Promise<AudioBuffer>).then(ok, fail);
      }
    } catch (e) {
      fail(e);
    }
  });
}

interface Segment {
  item: PlayItem;
  buffer: AudioBuffer;
  /** start within the iteration, seconds */
  at: number;
  /** seconds into the buffer */
  offsetSeconds: number;
  duration: number;
}

interface Session {
  segments: Segment[];
  /** first start → last end, seconds */
  iterationSeconds: number;
  /** iterationSeconds + the gap before a repeat */
  period: number;
  loop: boolean;
  /** context time of iteration 0 */
  t0: number;
  nextIteration: number;
  sources: Set<AudioBufferSourceNode>;
}

type FrameCb = (t: number) => void;
const raf: (cb: FrameCb) => number =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(Date.now()), 33) as unknown as number;
const caf: (id: number) => void =
  typeof cancelAnimationFrame === "function" ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id);

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private readonly cache = new Map<string, LoadedAudio>();
  private readonly pending = new Map<string, Promise<LoadedAudio>>();
  private readonly subscribers = new Set<(s: PlayState | null) => void>();
  private session: Session | null = null;
  private paused = false;
  private rafId: number | null = null;

  /** Singleton. Constructing never touches window; the AudioContext is created lazily. */
  static get(): AudioEngine {
    if (!AudioEngine.instance) AudioEngine.instance = new AudioEngine();
    return AudioEngine.instance;
  }

  /** The context, created on first use (decoding needs no gesture; playback resume() does). */
  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : undefined;
    const Ctor = (w?.AudioContext ?? w?.webkitAudioContext) as (new () => AudioContext) | undefined;
    if (typeof Ctor !== "function") throw new Error("Web Audio is not available in this environment");
    this.ctx = new Ctor();
    return this.ctx;
  }

  /** Decode once per versionId; concurrent calls share one decode. */
  load(versionId: string, audio: Blob): Promise<LoadedAudio> {
    const existing = this.cache.get(versionId);
    if (existing) return Promise.resolve(existing);
    const inFlight = this.pending.get(versionId);
    if (inFlight) return inFlight;
    const p = (async () => {
      const ctx = this.ensureContext();
      const bytes = await audio.arrayBuffer();
      const buffer = await decode(ctx, bytes);
      const loaded = makeLoaded(buffer);
      this.cache.set(versionId, loaded);
      return loaded;
    })();
    this.pending.set(versionId, p);
    p.then(
      () => this.pending.delete(versionId),
      () => this.pending.delete(versionId),
    );
    return p;
  }

  loaded(versionId: string): LoadedAudio | undefined {
    return this.cache.get(versionId);
  }

  unload(versionId: string): void {
    if (this.session && this.session.segments.some((s) => s.item.versionId === versionId)) this.stop();
    this.cache.delete(versionId);
  }

  /** Play one slice. Stops anything playing first. A zero-length item plays nothing. */
  play(item: PlayItem, opts?: { loop?: boolean }): void {
    this.playSequence([item], { loop: opts?.loop, gapSeconds: LOOP_GAP_SECONDS });
  }

  /**
   * Play items one after another (A, gap, B). With loop the whole sequence
   * repeats, with the same gap between repeats.
   */
  playSequence(items: PlayItem[], opts?: { gapSeconds?: number; loop?: boolean }): void {
    this.stop();
    const ctx = this.ensureContext();
    const gapRaw = opts?.gapSeconds ?? DEFAULT_SEQUENCE_GAP_SECONDS;
    const gap = Number.isFinite(gapRaw) && gapRaw > 0 ? gapRaw : 0;

    const segments: Segment[] = [];
    let t = 0;
    for (const item of items) {
      const loaded = this.cache.get(item.versionId);
      if (!loaded) throw new Error(`audio not loaded: ${item.versionId}`);
      if (!(item.frameRate > 0)) continue;
      const offsetSeconds = Math.max(0, item.startFrame / item.frameRate);
      const wanted = (item.endFrame - item.startFrame) / item.frameRate;
      const duration = Math.min(wanted, loaded.durationSeconds - offsetSeconds);
      if (!(duration > 0)) continue; // zero-length (or out of range): nothing to play
      if (segments.length > 0) t += gap;
      segments.push({ item, buffer: loaded.buffer, at: t, offsetSeconds, duration });
      t += duration;
    }
    if (segments.length === 0) return;

    // Playback needs a running context; this is called from a user gesture (a tap).
    void ctx.resume().catch(() => undefined);

    const session: Session = {
      segments,
      iterationSeconds: t,
      period: t + gap,
      loop: opts?.loop === true,
      t0: ctx.currentTime + LEAD_SECONDS,
      nextIteration: 0,
      sources: new Set(),
    };
    this.session = session;
    this.paused = false;
    this.scheduleIteration(session, session.nextIteration++);
    if (session.loop) this.scheduleIteration(session, session.nextIteration++);
    this.emit(this.computeState());
    this.startTicking();
  }

  private scheduleIteration(session: Session, k: number): void {
    const ctx = this.ctx;
    if (!ctx || this.session !== session) return;
    const base = session.t0 + k * session.period;
    const last = session.segments.length - 1;
    session.segments.forEach((seg, i) => {
      const src = ctx.createBufferSource();
      src.buffer = seg.buffer;
      src.connect(ctx.destination);
      session.sources.add(src);
      src.onended = () => {
        session.sources.delete(src);
        try {
          src.disconnect();
        } catch {
          // already disconnected
        }
        if (this.session !== session || i !== last) return;
        if (session.loop) this.scheduleIteration(session, session.nextIteration++);
        else this.stop();
      };
      src.start(base + seg.at, seg.offsetSeconds, seg.duration);
    });
  }

  /** Stop and forget the current item. Emits null once when something was playing. */
  stop(): void {
    const s = this.session;
    this.session = null;
    this.stopTicking();
    if (s) {
      for (const src of s.sources) {
        src.onended = null;
        try {
          src.stop();
        } catch {
          // not started yet or already stopped
        }
        try {
          src.disconnect();
        } catch {
          // already disconnected
        }
      }
      s.sources.clear();
    }
    if (this.paused) {
      this.paused = false;
      void this.ctx?.resume().catch(() => undefined);
    }
    if (s) this.emit(null);
  }

  /** Pause/resume the current item by suspending/resuming the context (see header comment). */
  toggle(): void {
    const ctx = this.ctx;
    if (!this.session || !ctx) return;
    if (this.paused) {
      this.paused = false;
      void ctx.resume().catch(() => undefined);
      this.emit(this.computeState());
      this.startTicking();
    } else {
      this.paused = true;
      this.stopTicking();
      void ctx.suspend().catch(() => undefined);
      this.emit(this.computeState());
    }
  }

  get state(): PlayState | null {
    return this.computeState();
  }

  /** Called on every animation frame while playing, once on pause/resume, and once (null) on stop. */
  subscribe(cb: (s: PlayState | null) => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private computeState(): PlayState | null {
    const s = this.session;
    const ctx = this.ctx;
    if (!s || !ctx) return null;
    let elapsed = ctx.currentTime - s.t0;
    if (s.loop && s.period > 0 && elapsed > 0) elapsed = elapsed % s.period;
    let seg = s.segments[0];
    let frame = seg.item.startFrame;
    for (const g of s.segments) {
      if (elapsed < g.at) break;
      seg = g;
      const within = elapsed - g.at;
      frame = within >= g.duration ? g.item.endFrame : g.item.startFrame + within * g.item.frameRate;
    }
    const lo = Math.min(seg.item.startFrame, seg.item.endFrame);
    const hi = Math.max(seg.item.startFrame, seg.item.endFrame);
    frame = Math.min(hi, Math.max(lo, Math.floor(frame)));
    return { versionId: seg.item.versionId, frame, playing: !this.paused, item: seg.item };
  }

  private emit(state: PlayState | null): void {
    for (const cb of Array.from(this.subscribers)) {
      try {
        cb(state);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private startTicking(): void {
    if (this.rafId !== null) return;
    const tick = () => {
      this.rafId = null;
      if (!this.session || this.paused) return;
      this.emit(this.computeState());
      this.rafId = raf(tick);
    };
    this.rafId = raf(tick);
  }

  private stopTicking(): void {
    if (this.rafId !== null) {
      caf(this.rafId);
      this.rafId = null;
    }
  }
}
