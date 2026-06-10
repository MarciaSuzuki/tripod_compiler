// DEV ONLY — demo data seeder so the dashboard, baskets, twin check, Voices
// check and export can be shown without recording hundreds of real takes.
// Generates short synthetic WAV tones (distinct pitch per item, slight detune
// per take) so every tile is audibly distinct when tapped.
//
// Speaker "Beto (demo)" gets the FULL core at 5 reps (core complete).
// Speaker "Ana (demo)" gets a partial core — so Phase 1 still demonstrates
// core-first scheduling with Ana, while Voices check unlocks for items both
// speakers have canonical takes for.

import {
  upsertLanguage, addSpeaker, getOrCreateTodaySession, addRecording, kvGet, kvSet,
} from '../db.js';
import { hashSeed, mulberry32 } from '../logic/ids.js';

function makeToneWav(freq, ms, { sampleRate = 16000, gain = 0.4, seed = 1 } = {}) {
  const n = Math.round((ms / 1000) * sampleRate);
  const samples = new Float32Array(n);
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    // simple vowel-ish tone: fundamental + 2 harmonics + tiny noise, AD envelope
    const env = Math.min(1, t / 0.04) * Math.min(1, (n - i) / (0.12 * sampleRate));
    samples[i] =
      gain * env *
      (0.7 * Math.sin(2 * Math.PI * freq * t) +
        0.25 * Math.sin(2 * Math.PI * freq * 2 * t) +
        0.1 * Math.sin(2 * Math.PI * freq * 3.1 * t) +
        0.02 * (rng() * 2 - 1));
  }
  // PCM16 WAV
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const wr = (off, str) => { for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i)); };
  wr(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE');
  wr(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  wr(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

export async function seedDemoData({ language, deck, onProgress = () => {} }) {
  if (await kvGet('demoSeeded')) return { already: true };
  const lang = language ?? (await upsertLanguage({ name: 'Língua demo' }));

  const ana = await addSpeaker({
    languageId: lang.id, alias: 'Ana (demo)', ageBand: '31–45', gender: 'feminino',
    consentAt: new Date().toISOString(),
  });
  const beto = await addSpeaker({
    languageId: lang.id, alias: 'Beto (demo)', ageBand: '46–60', gender: 'masculino',
    consentAt: new Date().toISOString(),
  });
  const sesAna = await getOrCreateTodaySession(ana.id);
  const sesBeto = await getOrCreateTodaySession(beto.id);

  const level1 = deck.items.filter((it) => it.level === 1);
  const core = level1.filter((it) => it.coreItem);
  const expansion = level1.filter((it) => !it.coreItem);

  // Per-item base pitch so each word is audibly distinct; per-speaker offset
  // so the Voices check comparison is audible too.
  const baseFreq = (itemId) => 180 + (hashSeed(itemId) % 240);

  async function seedTakes(speaker, session, item, takes, freqOffset) {
    for (let t = 1; t <= takes; t++) {
      const ms = 550 + ((hashSeed(item.id + t) % 5) * 90);
      const blob = makeToneWav(baseFreq(item.id) + freqOffset + t * 3, ms, {
        seed: hashSeed(item.id + speaker.id + t),
      });
      await addRecording({
        itemId: item.id, speakerId: speaker.id, sessionId: session.id,
        takeIndex: t, purpose: 'probe', durationMs: ms, quality: 'ok',
        qualityScore: 30 + (hashSeed(item.id + t + speaker.id) % 100) / 10,
        mimeType: 'audio/wav',
        // Spread createdAt so scheduler history ordering is well-defined.
        createdAt: new Date(Date.now() - 86400000 * (6 - t)).toISOString(),
      }, blob);
    }
  }

  let done = 0;
  const total = core.length * 5 /* beto */ + Math.ceil(core.length / 2) * 5 + 6 * 2 /* ana */;
  // Beto: full core at 5 reps + a few expansion items.
  for (const item of core) {
    await seedTakes(beto, sesBeto, item, 5, 40);
    onProgress((done += 5) / total);
  }
  for (const item of expansion.slice(0, 6)) await seedTakes(beto, sesBeto, item, 2, 40);
  // Ana: half the core complete, so core-first scheduling still shows.
  for (const item of core.slice(0, Math.ceil(core.length / 2))) {
    await seedTakes(ana, sesAna, item, 5, 0);
    onProgress((done += 5) / total);
  }
  for (const item of expansion.slice(0, 6)) {
    await seedTakes(ana, sesAna, item, 2, 0);
    onProgress((done += 2) / total);
  }

  await kvSet('demoSeeded', true);
  return { speakers: [ana, beto] };
}
