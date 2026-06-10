// Phase 3 — "Twin check" (minimal-pair confirmation). Pairs surfaced by the
// Twins basket or the neighbor miner. Plays canonical takes only; rule 4 is
// enforced here: both canonical takes must come from the same speaker, same
// device, same session. If the pair "differs by a tiny bit", both words are
// re-recorded fresh in THIS session so the stored minimal-pair recordings are
// same-session by construction.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { listRecordings, listJudgments, addJudgment, addRecording, addMinimalPair, listMinimalPairs } from '../db.js';
import { findNeighbors } from '../logic/neighbors.js';
import { countsAsRep } from '../logic/scheduler.js';
import { WordTile } from '../components/WordTile.jsx';
import { RecorderPanel } from '../components/RecorderPanel.jsx';
import { Icons } from '../deck/icons.jsx';
import { ItemImage } from '../deck/svgLibrary.jsx';
import { playRecording } from '../audio/player.js';
import { sparkle } from '../audio/tones.js';

const pairKeyOf = (a, b) => [a, b].sort().join('|');

export function Phase3TwinCheck() {
  const { deck, speaker, session, settings, goto, bump } = useApp();
  const [queue, setQueue] = useState(null); // [{a, b, recA, recB}]
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState('listen'); // listen | judge | tiny | rerecordA | rerecordB | differsBy
  const fresh = useRef({ a: null, b: null });
  const itemsById = useRef(new Map());

  const load = useCallback(async () => {
    if (!speaker) return;
    itemsById.current = new Map(deck.items.map((i) => [i.id, i]));
    const recs = await listRecordings({ speakerId: speaker.id, purpose: 'probe' });
    const canon = new Map(recs.filter((r) => r.canonical).map((r) => [r.itemId, r]));
    const judged = new Set();
    for (const j of await listJudgments()) {
      if (j.type === 'twinCheck' && j.itemIds.length === 2) judged.add(pairKeyOf(...j.itemIds));
    }
    for (const m of await listMinimalPairs()) judged.add(pairKeyOf(m.itemA, m.itemB));

    const candidates = new Map(); // pairKey -> [idA, idB]
    for (const j of await listJudgments()) {
      if (j.type === 'basket' && j.mode === 'twins' && j.speakerId === speaker.id) {
        for (let x = 0; x < j.itemIds.length; x++) {
          for (let y = x + 1; y < j.itemIds.length; y++) {
            candidates.set(pairKeyOf(j.itemIds[x], j.itemIds[y]), [j.itemIds[x], j.itemIds[y]]);
          }
        }
      }
    }
    const canonIds = [...canon.keys()];
    for (const n of findNeighbors({ itemIds: canonIds, seed: session?.id ?? 'x', k: 10 })) {
      candidates.set(pairKeyOf(n.itemA, n.itemB), [n.itemA, n.itemB]);
    }

    const q = [];
    for (const [key, [ia, ib]] of candidates) {
      if (judged.has(key)) continue;
      const ra = canon.get(ia), rb = canon.get(ib);
      // Rule 4 filter: same speaker (by construction) AND same session — same
      // session implies same device (deviceInfo lives on the session record).
      if (!ra || !rb || ra.sessionId !== rb.sessionId) continue;
      const a = itemsById.current.get(ia), b = itemsById.current.get(ib);
      if (a && b) q.push({ a, b, recA: ra, recB: rb });
    }
    setQueue(q);
    setIdx(0);
    setStage('listen');
  }, [deck, speaker, session]);

  useEffect(() => { load(); }, [load]);

  const pair = queue?.[idx] ?? null;

  // Auto-play A then B on entry (canonical takes only), then enable judging.
  useEffect(() => {
    let live = true;
    (async () => {
      if (!pair || stage !== 'listen') return;
      await new Promise((r) => setTimeout(r, 350));
      if (!live) return;
      await playRecording(pair.recA.id);
      await new Promise((r) => setTimeout(r, 400));
      if (!live) return;
      await playRecording(pair.recB.id);
      if (live) setStage('judge');
    })();
    return () => { live = false; };
  }, [pair, stage]);

  const advance = () => { setIdx((i) => i + 1); setStage('listen'); fresh.current = { a: null, b: null }; };

  const judge = async (result) => {
    await addJudgment({
      type: 'twinCheck', mode: 'twins', speakerId: speaker.id, sessionId: session.id,
      itemIds: [pair.a.id, pair.b.id], recordingIds: [pair.recA.id, pair.recB.id], result,
    });
    bump();
    if (result === 'same') { sparkle(); advance(); }
    else setStage('tiny'); // "do they differ by just a tiny bit?"
  };

  const freshTake = async (item, { blob, mimeType, durationMs, analysis, quality }) => {
    const reps = (await listRecordings({ speakerId: speaker.id, itemId: item.id }))
      .filter(countsAsRep).length;
    return addRecording({
      itemId: item.id, speakerId: speaker.id, sessionId: session.id,
      takeIndex: reps + 1, purpose: 'probe',
      durationMs, quality, qualityScore: analysis.qualityScore, mimeType,
    }, blob);
  };

  const saveDiffersBy = async (differsBy) => {
    await addMinimalPair({
      itemA: pair.a.id, itemB: pair.b.id, differsBy,
      confirmedBy: speaker.id, sessionId: session.id,
      recordingA: fresh.current.a.id, recordingB: fresh.current.b.id,
    });
    sparkle();
    bump();
    advance();
  };

  if (!speaker || !session) return null;

  return (
    <div className="player-screen">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => goto('home')}><Icons.home width="34" height="34" /></button>
        <div className="mode-badge"><Icons.twins width="36" height="36" /></div>
        <div className="speaker-dot" />
      </header>

      {(!queue || !pair) && (
        <div className="done-state">
          {queue && queue.length === 0 ? <Icons.lock width="110" height="110" /> : <Icons.sunDone width="140" height="140" />}
        </div>
      )}

      {pair && (stage === 'listen' || stage === 'judge') && (
        <main className="twin-stage">
          <div className="twin-tiles">
            <WordTile item={pair.a} canonicalId={pair.recA.id} size={130} />
            <WordTile item={pair.b} canonicalId={pair.recB.id} size={130} />
          </div>
          <div className={`judge-row ${stage !== 'judge' ? 'disabled' : ''}`}>
            <button className="big-btn same" onPointerUp={() => stage === 'judge' && judge('same')}>
              <Icons.equals width="52" height="52" />
            </button>
            <button className="big-btn diff" onPointerUp={() => stage === 'judge' && judge('different')}>
              <Icons.notEquals width="52" height="52" />
            </button>
          </div>
        </main>
      )}

      {pair && stage === 'tiny' && (
        <main className="twin-stage">
          <div className="tiny-question"><Icons.twins width="120" height="120" /></div>
          <div className="judge-row">
            <button className="big-btn same" onPointerUp={() => setStage('rerecordA')}><Icons.check width="50" height="50" /></button>
            <button className="big-btn diff" onPointerUp={() => { sparkle(); advance(); }}><Icons.cross width="50" height="50" /></button>
          </div>
        </main>
      )}

      {pair && (stage === 'rerecordA' || stage === 'rerecordB') && (
        <main className="naming-stage">
          <div className="naming-card">
            <ItemImage imageRef={(stage === 'rerecordA' ? pair.a : pair.b).imageRef} className="big-img" />
          </div>
          <RecorderPanel
            gateMs={settings.wordGateMs}
            resetKey={stage}
            onAccept={async (take) => {
              if (stage === 'rerecordA') {
                fresh.current.a = await freshTake(pair.a, take);
                setStage('rerecordB');
              } else {
                fresh.current.b = await freshTake(pair.b, take);
                setStage('differsBy');
              }
            }}
          />
        </main>
      )}

      {pair && stage === 'differsBy' && (
        <main className="twin-stage">
          <div className="judge-row triple">
            <button className="big-btn" onPointerUp={() => saveDiffersBy('segment')}><Icons.segment width="52" height="52" /></button>
            <button className="big-btn" onPointerUp={() => saveDiffersBy('rhythm')}><Icons.wave width="52" height="52" /></button>
            <button className="big-btn" onPointerUp={() => saveDiffersBy('unknown')}><Icons.unknown width="52" height="52" /></button>
          </div>
        </main>
      )}
    </div>
  );
}
