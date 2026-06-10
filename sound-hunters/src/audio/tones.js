// Tiny synthesized UI sounds (no assets): chime for a confirmed drop /
// demo "tiles chime together", soft thud for the gentle retry, sparkle for
// finishing. All wordless feedback — part of the zero-text design.

let ctx = null;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, t0, dur, type = 'sine', gain = 0.12) {
  const c = ac();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function chime() {
  const t = ac().currentTime;
  tone(880, t, 0.18);
  tone(1318.5, t + 0.09, 0.22);
}

export function chord() {
  const t = ac().currentTime;
  tone(659.25, t, 0.3); tone(830.6, t, 0.3); tone(987.8, t, 0.35);
}

export function softThud() {
  const t = ac().currentTime;
  tone(220, t, 0.25, 'triangle', 0.1);
  tone(160, t + 0.12, 0.3, 'triangle', 0.08);
}

export function sparkle() {
  const t = ac().currentTime;
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.18, 'sine', 0.09));
}
