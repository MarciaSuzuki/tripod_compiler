// Player hub — five big wordless buttons. The whole player flow is
// completable from here without reading anything.

import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { listRecordings, listJudgments } from '../db.js';
import { voicesQueue } from '../logic/convergence.js';
import { speakerColor } from '../logic/ids.js';
import { Icons } from '../deck/icons.jsx';

export function PlayerHome() {
  const { deck, speaker, goto, refreshKey } = useApp();
  const [voicesAvailable, setVoicesAvailable] = useState(0);

  useEffect(() => {
    (async () => {
      const coreItems = deck.items.filter((it) => it.coreItem);
      const recordings = await listRecordings({ purpose: 'probe' });
      const judgments = await listJudgments();
      setVoicesAvailable(voicesQueue({ coreItems, recordings, judgments }).length);
    })();
  }, [deck, refreshKey]);

  if (!speaker) return null;

  return (
    <div className="player-screen home">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => goto('facilitator')}><Icons.gear width="30" height="30" /></button>
        <div />
        <div className="speaker-dot big" style={{ background: speakerColor(speaker.id) }} />
      </header>
      <main className="home-grid">
        <button className="home-btn" onPointerUp={() => goto('phase1')}><Icons.phase1 width="84" height="84" /></button>
        <button className="home-btn" onPointerUp={() => goto('phase2')}><Icons.basket width="84" height="84" /></button>
        <button className="home-btn" onPointerUp={() => goto('phase3')}><Icons.twins width="84" height="84" /></button>
        <button className="home-btn" onPointerUp={() => goto('voices')}>
          <Icons.voices width="84" height="84" />
          {voicesAvailable > 0
            ? <span className="badge">{voicesAvailable}</span>
            : <span className="mini-lock"><Icons.lock width="28" height="28" /></span>}
        </button>
        <button className="home-btn wide" onPointerUp={() => goto('free')}><Icons.freeArt width="84" height="84" /></button>
      </main>
    </div>
  );
}
