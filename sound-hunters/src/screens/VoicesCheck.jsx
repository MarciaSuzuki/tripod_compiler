// Voices check — cross-speaker convergence (rule 8). Unlocked when >= 2
// speakers have canonical takes for a core item. Same interaction as the twin
// check, different question: speaker A's word vs speaker B's word for the
// same image — same word (=) or different (≠)? "different" only excludes the
// item from the cross-speaker set for that pair; nothing is deleted.

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { listRecordings, listJudgments, addJudgment, listSpeakers, getOrCreateTodaySession } from '../db.js';
import { voicesQueue } from '../logic/convergence.js';
import { speakerColor } from '../logic/ids.js';
import { Icons } from '../deck/icons.jsx';
import { ItemImage } from '../deck/svgLibrary.jsx';
import { playRecording } from '../audio/player.js';
import { sparkle } from '../audio/tones.js';
import { STR } from '../strings.js';

export function VoicesCheck() {
  const { deck, language, goto, bump } = useApp();
  const [queue, setQueue] = useState(null);
  const [idx, setIdx] = useState(0);
  const [judge, setJudge] = useState(null);      // facilitator-chosen judge speaker
  const [speakers, setSpeakers] = useState([]);
  const [stage, setStage] = useState('listen');  // listen | judge

  const load = useCallback(async () => {
    const coreItems = deck.items.filter((it) => it.coreItem);
    const recordings = await listRecordings({ purpose: 'probe' });
    const judgments = await listJudgments();
    setQueue(voicesQueue({ coreItems, recordings, judgments }));
    setSpeakers(await listSpeakers(language?.id));
    setIdx(0);
    setStage('listen');
  }, [deck, language]);

  useEffect(() => { load(); }, [load]);

  const entry = queue?.[idx] ?? null;

  useEffect(() => {
    let live = true;
    (async () => {
      if (!entry || !judge || stage !== 'listen') return;
      await new Promise((r) => setTimeout(r, 350));
      if (!live) return;
      await playRecording(entry.recA.id);
      await new Promise((r) => setTimeout(r, 450));
      if (!live) return;
      await playRecording(entry.recB.id);
      if (live) setStage('judge');
    })();
    return () => { live = false; };
  }, [entry, judge, stage]);

  const verdict = async (result) => {
    // The judge may be a third speaker or one of the two compared
    // (facilitator decides — recorded as judgeSpeakerId).
    const judgeSession = await getOrCreateTodaySession(judge.id);
    await addJudgment({
      type: 'crossSpeakerCheck', mode: 'convergence',
      speakerId: judge.id, judgeSpeakerId: judge.id, sessionId: judgeSession.id,
      itemIds: [entry.item.id],
      recordingIds: [entry.recA.id, entry.recB.id],
      result, // 'same' | 'different' — tag, never delete
    });
    sparkle();
    bump();
    setIdx((i) => i + 1);
    setStage('listen');
  };

  return (
    <div className="player-screen">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => goto('home')}><Icons.home width="34" height="34" /></button>
        <div className="mode-badge"><Icons.voices width="36" height="36" /></div>
        <div />
      </header>

      {queue && queue.length === 0 && (
        <div className="done-state"><Icons.lock width="110" height="110" /><Icons.voices width="70" height="70" /></div>
      )}

      {queue && queue.length > 0 && !judge && (
        // Facilitator gate (text allowed): pick who judges this run.
        <div className="overlay">
          <div className="overlay-card fac-card">
            <h3>{STR.judge}</h3>
            <p className="hint">{STR.judgeHint}</p>
            {speakers.map((sp) => (
              <button key={sp.id} className="fac-row-btn" onClick={() => setJudge(sp)}>
                <span className="speaker-dot" style={{ background: speakerColor(sp.id) }} /> {sp.alias}
              </button>
            ))}
            <button className="fac-row-btn subtle" onClick={() => goto('home')}>{STR.cancel}</button>
          </div>
        </div>
      )}

      {entry && judge && (
        <main className="twin-stage">
          <div className="voices-item"><ItemImage imageRef={entry.item.imageRef} className="big-img" /></div>
          <div className="voices-plays">
            <button
              className="big-btn voice-a"
              style={{ borderColor: speakerColor(entry.recA.speakerId) }}
              onPointerUp={() => playRecording(entry.recA.id)}
            >
              <Icons.play width="44" height="44" style={{ color: speakerColor(entry.recA.speakerId) }} />
            </button>
            <button
              className="big-btn voice-b"
              style={{ borderColor: speakerColor(entry.recB.speakerId) }}
              onPointerUp={() => playRecording(entry.recB.id)}
            >
              <Icons.play width="44" height="44" style={{ color: speakerColor(entry.recB.speakerId) }} />
            </button>
          </div>
          <div className={`judge-row ${stage !== 'judge' ? 'disabled' : ''}`}>
            <button className="big-btn same" onPointerUp={() => stage === 'judge' && verdict('same')}>
              <Icons.equals width="52" height="52" />
            </button>
            <button className="big-btn diff" onPointerUp={() => stage === 'judge' && verdict('different')}>
              <Icons.notEquals width="52" height="52" />
            </button>
          </div>
        </main>
      )}

      {queue && queue.length > 0 && idx >= queue.length && (
        <div className="done-state"><Icons.sunDone width="140" height="140" /></div>
      )}
    </div>
  );
}
