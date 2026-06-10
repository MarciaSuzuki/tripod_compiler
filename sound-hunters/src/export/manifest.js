// manifest.json builder — the data contract. Pure function so the schema is
// testable in Node (scripts/test-manifest.mjs). Field set matches the spec
// exactly; internal fields (qualityScore, canonicalManual, mimeType,
// languageId) never leak into the manifest.

function extFor(mimeType) {
  if (!mimeType) return 'webm';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export function audioFileName(rec) {
  // PRODUCTION NOTE: files will be WAV 16 kHz mono; prototype keeps the
  // browser's native container (webm/opus, m4a on Safari, wav for seeded data).
  return `audio/${rec.id}.${extFor(rec.mimeType)}`;
}

/**
 * @param data { language, deck, speakers, sessions, recordings, judgments, minimalPairs }
 * @returns manifest object matching the spec schema
 */
export function buildManifest({ language, deck, speakers, sessions, recordings, judgments, minimalPairs }) {
  return {
    language: { id: language?.id ?? '', name: language?.name ?? '' },
    deckVersion: deck?.version ?? '',
    speakers: speakers.map((s) => ({
      id: s.id,
      alias: s.alias ?? '',
      ageBand: s.ageBand ?? '',
      gender: s.gender ?? '',
      consentAt: s.consentAt ?? '',
    })),
    sessions: sessions.map((s) => ({
      id: s.id,
      speakerId: s.speakerId,
      startedAt: s.startedAt,
      deviceInfo: s.deviceInfo ?? '',
    })),
    items: (deck?.items ?? []).map((it) => ({
      id: it.id,
      level: it.level,
      conceptGloss: it.conceptGloss ?? '',
      imageRef: it.imageRef ?? '',
      rootId: it.rootId ?? null,
      possessor: it.possessor ?? null,
      frame: it.frame ?? null,
      coreItem: !!it.coreItem,
    })),
    recordings: recordings.map((r) => ({
      id: r.id,
      itemId: r.itemId ?? null,
      speakerId: r.speakerId,
      sessionId: r.sessionId,
      takeIndex: r.takeIndex ?? 1,
      purpose: r.purpose,
      file: audioFileName(r),
      durationMs: r.durationMs ?? 0,
      quality: r.quality ?? 'ok',
      canonical: !!r.canonical,
      hummed: !!r.hummed,
      category: r.category ?? null,
      setId: r.setId ?? null,
      attribution: r.attribution ?? null,
      reuseConsent: r.reuseConsent ?? null,
      createdAt: r.createdAt,
    })),
    judgments: judgments.map((j) => ({
      id: j.id,
      type: j.type,
      mode: j.mode ?? null,
      speakerId: j.speakerId,
      judgeSpeakerId: j.judgeSpeakerId ?? null,
      sessionId: j.sessionId,
      itemIds: j.itemIds ?? [],
      recordingIds: j.recordingIds ?? [],
      result: j.result ?? '',
      dangerZone: !!j.dangerZone,
      createdAt: j.createdAt,
    })),
    minimalPairCandidates: minimalPairs.map((m) => ({
      id: m.id,
      itemA: m.itemA,
      itemB: m.itemB,
      differsBy: m.differsBy,
      confirmedBy: m.confirmedBy ?? '',
      sessionId: m.sessionId,
      recordingA: m.recordingA,
      recordingB: m.recordingB,
    })),
  };
}
