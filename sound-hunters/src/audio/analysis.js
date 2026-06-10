// Audio quality analysis — pure sample math kept browser-free so the
// acceptance tests can run it in Node (scripts/test-analysis.mjs).
//
// Rule 6 (gentle gate): duration window, clipping, silence.
// Rule 3 (canonical proxy): qualityScore = trimmed RMS-to-noise-floor ratio,
// heavily penalized when clipping is detected.

const FRAME_MS = 25;
const HOP_MS = 10;
const CLIP_LEVEL = 0.985;     // |sample| above this counts as clipped
const CLIP_FRACTION = 0.001;  // >0.1% clipped samples => clipping
const SILENCE_RMS = 0.004;    // ~ -48 dBFS speech floor for the prototype

export function frameRms(samples, sampleRate) {
  const frame = Math.max(1, Math.round((FRAME_MS / 1000) * sampleRate));
  const hop = Math.max(1, Math.round((HOP_MS / 1000) * sampleRate));
  const out = [];
  for (let start = 0; start + frame <= samples.length; start += hop) {
    let acc = 0;
    for (let i = start; i < start + frame; i++) acc += samples[i] * samples[i];
    out.push(Math.sqrt(acc / frame));
  }
  if (out.length === 0 && samples.length > 0) {
    let acc = 0;
    for (let i = 0; i < samples.length; i++) acc += samples[i] * samples[i];
    out.push(Math.sqrt(acc / samples.length));
  }
  return out;
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.floor(p * (sortedAsc.length - 1))));
  return sortedAsc[idx];
}

/**
 * @param samples Float32Array mono PCM in [-1, 1]
 * @returns { durationMs, clipped, silent, rmsToNoise, qualityScore }
 */
export function analyzeSamples(samples, sampleRate) {
  const durationMs = Math.round((samples.length / sampleRate) * 1000);
  let clippedCount = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] < 0 ? -samples[i] : samples[i];
    if (v >= CLIP_LEVEL) clippedCount++;
  }
  const clipped = samples.length > 0 && clippedCount / samples.length > CLIP_FRACTION;

  const rms = frameRms(samples, sampleRate);
  const sorted = [...rms].sort((a, b) => a - b);
  const noiseFloor = Math.max(percentile(sorted, 0.1), 1e-5);
  // Trimmed signal level: mean of frames clearly above the floor, dropping the
  // top 5% so a single spike doesn't dominate.
  const speechFrames = sorted.filter((v) => v > noiseFloor * 3);
  const trimmed = speechFrames.slice(0, Math.max(1, Math.ceil(speechFrames.length * 0.95)));
  const signal = trimmed.length
    ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    : 0;
  const peakRms = sorted.length ? sorted[sorted.length - 1] : 0;
  const silent = peakRms < SILENCE_RMS || speechFrames.length < 3;

  const rmsToNoise = signal / noiseFloor;
  const qualityScore = clipped ? rmsToNoise * 0.2 : rmsToNoise;
  return { durationMs, clipped, silent, rmsToNoise, qualityScore };
}

/**
 * Rule 6 gate. Returns { pass, reasons[] }; reasons are machine tags — the UI
 * shows only a friendly wordless retry animation, never error text.
 */
export function gateCheck(analysis, { min, max }) {
  const reasons = [];
  if (analysis.durationMs < min) reasons.push('tooShort');
  if (analysis.durationMs > max) reasons.push('tooLong');
  if (analysis.clipped) reasons.push('clipping');
  if (analysis.silent) reasons.push('silence');
  return { pass: reasons.length === 0, reasons };
}
