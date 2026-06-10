// Phase 1 — "Name the pictures". One large image; mic → waveform → stop →
// quality gate → auto-advance. Item order comes from the spaced scheduler
// (rules 2 & 7): never the same word twice in a row, >=6 other items between
// reps, daily cap, and core items first while the speaker's core is open.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { listRecordings, addRecording } from '../db.js';
import { buildHistory, nextItem, repsOf, targetOf } from '../logic/scheduler.js';
import { speakerColor } from '../logic/ids.js';
import { ItemImage, POSSESSOR_LIB } from '../deck/svgLibrary.jsx';
import { Icons } from '../deck/icons.jsx';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { RecorderPanel } from '../components/RecorderPanel.jsx';

const LEVELS = ['auto', 1, 2, 3];

function LevelIcon({ level }) {
  const s = { viewBox: '0 0 100 100', fill: 'none', stroke: 'currentColor', strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round', width: 30, height: 30 };
  if (level === 'auto') return <svg {...s}><circle cx="28" cy="50" r="8" fill="currentColor" stroke="none" /><circle cx="54" cy="50" r="8" fill="currentColor" stroke="none" /><circle cx="80" cy="50" r="8" fill="currentColor" stroke="none" /></svg>;
  if (level === 1) return <svg {...s}><rect x="22" y="22" width="56" height="56" rx="8" /></svg>;
  if (level === 2) return <svg {...s}><rect x="14" y="22" width="48" height="56" rx="8" /><circle cx="78" cy="38" r="9" fill="currentColor" stroke="none" /><path d="M66 78 V62 q0 -10 12 -10 t12 10 v16" fill="currentColor" stroke="none" /></svg>;
  return <svg {...s}><rect x="10" y="26" width="36" height="48" rx="6" /><rect x="54" y="26" width="36" height="48" rx="6" /></svg>;
}

export function Phase1Naming() {
  const { deck, speaker, session, settings, devMode, goto } = useApp();
  const [levelTab, setLevelTab] = useState('auto');
  const [pick, setPick] = useState(null);     // { item, debug }
  const [history, setHistory] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const pickLog = useRef([]);                 // dev: last picks with spacing at pick time

  const load = useCallback(async () => {
    if (!deck || !speaker) return;
    const recs = await listRecordings({ speakerId: speaker.id, purpose: 'probe' });
    const h = buildHistory(recs);
    const scope = levelTab === 'auto' ? deck.items : deck.items.filter((i) => i.level === levelTab);
    const p = nextItem({ items: scope, history: h, settings });
    setHistory(h);
    setPick(p);
    if (p.item) {
      const row = p.debug.rows.find((r) => r.itemId === p.item.id);
      pickLog.current = [
        { itemId: p.item.id, gloss: p.item.conceptGloss, sinceLast: row?.sinceLast ?? null, core: !!p.item.coreItem, filler: p.debug.usedFiller },
        ...pickLog.current,
      ].slice(0, 8);
    }
    setResetKey((k) => k + 1);
  }, [deck, speaker, levelTab, settings]);

  useEffect(() => { load(); }, [load]);

  if (!speaker || !session) return null;

  const onAccept = async ({ blob, mimeType, durationMs, analysis, quality }) => {
    const item = pick.item;
    const reps = repsOf(history, item.id);
    await addRecording({
      itemId: item.id, speakerId: speaker.id, sessionId: session.id,
      takeIndex: reps + 1, purpose: 'probe', // rule 5: game phases write "probe"
      durationMs, quality, qualityScore: analysis.qualityScore, mimeType,
    }, blob);
    load(); // recompute scheduler → auto-advance
  };

  const item = pick?.item;
  const gateMs = item && item.level === 3 ? settings.frameGateMs : settings.wordGateMs;

  return (
    <div className="player-screen">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => goto('home')}><Icons.home width="34" height="34" /></button>
        <div className="level-tabs">
          {LEVELS.map((lv) => (
            <button key={lv} className={`icon-btn ${levelTab === lv ? 'active' : ''}`} onPointerUp={() => setLevelTab(lv)}>
              <LevelIcon level={lv} />
            </button>
          ))}
        </div>
        <div className="speaker-dot" style={{ background: speakerColor(speaker.id) }} />
      </header>

      {!item && (
        <div className="done-state">
          <Icons.sunDone width="160" height="160" />
        </div>
      )}

      {item && (
        <main className="naming-stage">
          <div className="naming-card">
            {item.level === 3 ? (
              <div className="frame-panels">
                {item.frame.panels.map((p) => (
                  <div key={p.wordId} className="frame-panel"><ItemImage imageRef={p.imageRef} className="big-img" /></div>
                ))}
              </div>
            ) : item.level === 2 ? (
              <div className="possessed-row">
                <div className="possessor-device">{POSSESSOR_LIB[item.possessor]?.({ width: 110, height: 110 })}</div>
                <ItemImage imageRef={item.imageRef} className="big-img" />
              </div>
            ) : (
              <ItemImage imageRef={item.imageRef} className="big-img" />
            )}
            <div className="naming-ring">
              <ProgressRing value={repsOf(history, item.id)} max={targetOf(item, settings)} size={40} stroke={5} />
            </div>
          </div>
          <RecorderPanel gateMs={gateMs} onAccept={onAccept} resetKey={resetKey} />
        </main>
      )}

      {devMode && pick && (
        <div className="dev-overlay">
          <div>
            core {pick.debug.corePhase ? 'ABERTO' : 'completo'} · elegíveis C:{pick.debug.eligibleCore} E:{pick.debug.eligibleExpansion}
            {pick.debug.usedFiller && ' · FILLER'}
          </div>
          <div className="dev-picklog">
            {pickLog.current.map((p, i) => (
              <span key={i} className={`dev-chip ${p.core ? 'core' : ''}`}>
                {p.gloss} {p.sinceLast === null ? '∞' : `+${p.sinceLast}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
