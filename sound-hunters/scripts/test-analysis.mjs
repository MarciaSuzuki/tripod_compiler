// Quality gate + canonical score proxy checks (rule 6 / rule 3) on synthetic
// audio, against the shipped analysis module.
import assert from 'node:assert/strict';
import { analyzeSamples, gateCheck } from '../src/audio/analysis.js';
import { pickCanonicalId } from '../src/logic/canonical.js';

const SR = 16000;
const gate = { min: 300, max: 4000 };

function tone({ ms, freq = 220, gain = 0.4, noise = 0.005, clip = false }) {
  const n = Math.round((ms / 1000) * SR);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // leading/trailing silence frames the "speech" like a real take
    const inSpeech = t > 0.1 && t < ms / 1000 - 0.1;
    let v = inSpeech ? gain * Math.sin(2 * Math.PI * freq * t) : 0;
    v += noise * (Math.random() * 2 - 1);
    if (clip) v *= 4;
    s[i] = Math.max(-1, Math.min(1, v));
  }
  return s;
}

// Good take passes.
const good = analyzeSamples(tone({ ms: 900 }), SR);
assert.ok(gateCheck(good, gate).pass, 'clean 0.9s word should pass the gate');

// Too short fails.
const short = analyzeSamples(tone({ ms: 150 }), SR);
assert.deepEqual(gateCheck(short, gate).pass, false);
assert.ok(gateCheck(short, gate).reasons.includes('tooShort'));

// Too long fails.
const long = analyzeSamples(tone({ ms: 5000 }), SR);
assert.ok(gateCheck(long, gate).reasons.includes('tooLong'));

// Silence fails.
const silent = analyzeSamples(tone({ ms: 900, gain: 0.0005, noise: 0.0004 }), SR);
assert.ok(gateCheck(silent, gate).reasons.includes('silence'), 'near-silence must fail');

// Clipping fails the gate AND tanks the canonical score.
const clipped = analyzeSamples(tone({ ms: 900, clip: true }), SR);
assert.ok(gateCheck(clipped, gate).reasons.includes('clipping'));
assert.ok(clipped.qualityScore < good.qualityScore, 'clipped score must rank below clean score');

// Canonical selection: best score wins; manual override beats everything;
// hummed takes are never canonical.
const takes = [
  { id: 'r1', purpose: 'probe', hummed: false, quality: 'ok', qualityScore: 10, createdAt: '1' },
  { id: 'r2', purpose: 'probe', hummed: false, quality: 'ok', qualityScore: 25, createdAt: '2' },
  { id: 'r3', purpose: 'probe', hummed: true, quality: 'ok', qualityScore: 99, createdAt: '3' },
  { id: 'r4', purpose: 'probe', hummed: false, quality: 'low', qualityScore: 80, createdAt: '4' },
];
assert.equal(pickCanonicalId(takes), 'r2', 'highest-scoring gate-passing spoken take wins');
assert.equal(
  pickCanonicalId(takes.map((t) => (t.id === 'r1' ? { ...t, canonicalManual: true } : t))),
  'r1', 'facilitator override wins');

console.log('analysis + canonical OK — gate (duration/clipping/silence), score ranking, manual override');
