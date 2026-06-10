// One-click export: ZIP with every audio blob (audio/<recordingId>.<ext>)
// plus manifest.json (the data contract).

import JSZip from 'jszip';
import { exportAll, getAudioBlob, kvGet } from '../db.js';
import { buildManifest, audioFileName } from './manifest.js';

export async function exportZip({ language, deck }) {
  const data = await exportAll();
  const speakers = data.speakers.filter((s) => !language || s.languageId === language.id);
  const speakerIds = new Set(speakers.map((s) => s.id));
  const sessions = data.sessions.filter((s) => speakerIds.has(s.speakerId));
  const recordings = data.recordings.filter((r) => speakerIds.has(r.speakerId));
  const judgments = data.judgments.filter((j) => speakerIds.has(j.speakerId));

  const manifest = buildManifest({
    language, deck, speakers, sessions, recordings, judgments,
    minimalPairs: data.minimalPairs,
  });

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  for (const rec of recordings) {
    const blob = await getAudioBlob(rec.id);
    if (blob) zip.file(audioFileName(rec), blob);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `sound-hunters_${(language?.name || 'export').replace(/\s+/g, '-')}_${stamp}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { name, bytes: blob.size, recordings: recordings.length };
}

export async function activeExportContext() {
  return { activeDeckId: await kvGet('activeDeckId') };
}
