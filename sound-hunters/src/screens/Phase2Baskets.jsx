// Phase 2 — "Sound baskets": matching by ear. Tiles play their canonical take
// on tap (rule 3); dragging into a basket replays softly (rule 1). Every
// committed basket / odd-one-out writes a judgment record. Sub-modes are
// introduced by a wordless ghost-hand demo. An item appears here only once it
// has a canonical take.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { listRecordings, addRecording, addJudgment } from '../db.js';
import { findNeighbors } from '../logic/neighbors.js';
import { WordTile } from '../components/WordTile.jsx';
import { Basket } from '../components/Basket.jsx';
import { GhostHandDemo } from '../components/GhostHandDemo.jsx';
import { RecorderPanel } from '../components/RecorderPanel.jsx';
import { Icons } from '../deck/icons.jsx';
import { SVG_LIB, ItemImage } from '../deck/svgLibrary.jsx';
import { sparkle } from '../audio/tones.js';
import { hashSeed, mulberry32, speakerColor } from '../logic/ids.js';

const demoSeen = new Set(); // once per app run, per sub-mode

const MODES = [
  { mode: 'echo', Icon: (p) => <Icons.wave {...p} /> },                  // ends alike
  { mode: 'sameMouth', Icon: (p) => <SVG_LIB.mouth {...p} /> },          // starts alike
  { mode: 'rhythm', Icon: (p) => <Icons.note {...p} />, hum: true },     // suprasegmental (stub UI, real writes)
  { mode: 'twins', Icon: (p) => <Icons.twins {...p} />, preSeeded: true },// very similar (preseeded by findNeighbors stub)
  { mode: 'foreignerTrap', Icon: (p) => <Icons.trapMask {...p} />, danger: true }, // facilitator-led
  { mode: 'oddOneOut', Icon: (p) => <Icons.oddOneOut {...p} />, odd: true },
];

function shuffleWith(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Phase2Baskets() {
  const { deck, speaker, session, settings, goto, bump } = useApp();
  const [eligible, setEligible] = useState([]);     // items with a canonical take
  const [canonicalOf, setCanonicalOf] = useState(new Map()); // itemId -> recordingId
  const [modeCfg, setModeCfg] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [basketContents, setBasketContents] = useState([]); // array per basket
  const [humTarget, setHumTarget] = useState(null);
  const [roundN, setRoundN] = useState(0);
  const rects = useRef(new Map());

  useEffect(() => {
    (async () => {
      if (!speaker) return;
      const recs = await listRecordings({ speakerId: speaker.id, purpose: 'probe' });
      const canon = new Map(recs.filter((r) => r.canonical).map((r) => [r.itemId, r.id]));
      setCanonicalOf(canon);
      setEligible(deck.items.filter((it) => canon.has(it.id)));
    })();
  }, [deck, speaker, roundN]);

  const buildRound = useCallback((cfg, n) => {
    const rng = mulberry32(hashSeed(`${session?.id ?? 'x'}:${cfg.mode}:${n}`));
    let pool = eligible;
    let count;
    if (cfg.odd) {
      count = 3;
    } else {
      const { min, max } = settings.basketRoundTiles;
      count = Math.min(pool.length, min + Math.floor(rng() * (max - min + 1)));
    }
    let chosen;
    if (cfg.preSeeded) {
      // Twins basket: pre-seed candidate pairs from the (stub) neighbor miner.
      const pairs = findNeighbors({ itemIds: pool.map((i) => i.id), seed: `${session?.id}:${n}`, k: 6 });
      const ids = [];
      for (const p of pairs) {
        for (const id of [p.itemA, p.itemB]) if (!ids.includes(id)) ids.push(id);
        if (ids.length >= count) break;
      }
      chosen = ids.slice(0, count).map((id) => pool.find((i) => i.id === id));
    } else {
      chosen = shuffleWith(rng, pool).slice(0, count);
    }
    setTiles(chosen);
    setBasketContents([[]]); // 1 basket per round in the prototype (cfg supports 1–3)
    rects.current = new Map();
  }, [eligible, session, settings]);

  const enterMode = (cfg) => {
    setModeCfg(cfg);
    buildRound(cfg, roundN);
    if (!demoSeen.has(cfg.mode)) setShowDemo(true);
  };

  const registerRect = useCallback((basketId, rect) => {
    if (rect) rects.current.set(basketId, rect); else rects.current.delete(basketId);
  }, []);

  const findDropTarget = useCallback((x, y) => {
    for (const [id, r] of rects.current) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return null;
  }, []);

  const onDrop = async (item, basketId) => {
    if (modeCfg.odd) {
      // Odd-one-out: a single drop IS the judgment.
      await addJudgment({
        type: 'oddOneOut', mode: null, speakerId: speaker.id, sessionId: session.id,
        itemIds: tiles.map((t) => t.id),
        recordingIds: tiles.map((t) => canonicalOf.get(t.id)),
        result: item.id, // the tile judged not to belong
      });
      sparkle();
      const n = roundN + 1; setRoundN(n); buildRound(modeCfg, n); bump();
      return;
    }
    setTiles((ts) => ts.filter((t) => t.id !== item.id));
    setBasketContents((bs) => bs.map((b, i) => (i === basketId ? [...b, item] : b)));
  };

  const removeFromBasket = (item) => {
    setBasketContents((bs) => bs.map((b) => b.filter((i) => i.id !== item.id)));
    setTiles((ts) => [...ts, item]);
  };

  const commitRound = async () => {
    for (const contents of basketContents) {
      if (contents.length >= 2) {
        await addJudgment({
          type: 'basket', mode: modeCfg.mode, speakerId: speaker.id, sessionId: session.id,
          itemIds: contents.map((i) => i.id),
          recordingIds: contents.map((i) => canonicalOf.get(i.id)),
          result: 'grouped',
          dangerZone: !!modeCfg.danger, // foreigner-trap groups: "words outsiders say wrong"
        });
      }
    }
    sparkle();
    const n = roundN + 1; setRoundN(n); buildRound(modeCfg, n); bump();
  };

  const onHumAccept = async ({ blob, mimeType, durationMs, analysis, quality }) => {
    const prior = (await listRecordings({ speakerId: speaker.id, itemId: humTarget.id }))
      .filter((r) => r.hummed).length;
    await addRecording({
      itemId: humTarget.id, speakerId: speaker.id, sessionId: session.id,
      takeIndex: prior + 1, purpose: 'probe', hummed: true, // hummed never counts as a rep
      durationMs, quality, qualityScore: analysis.qualityScore, mimeType,
    }, blob);
    setHumTarget(null);
    bump();
  };

  if (!speaker || !session) return null;

  const locked = eligible.length < 3;

  return (
    <div className="player-screen">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => (modeCfg ? setModeCfg(null) : goto('home'))}>
          {modeCfg ? <Icons.back width="34" height="34" /> : <Icons.home width="34" height="34" />}
        </button>
        {modeCfg && <div className="mode-badge"><modeCfg.Icon width="36" height="36" /></div>}
        <div className="speaker-dot" style={{ background: speakerColor(speaker.id) }} />
      </header>

      {!modeCfg && (
        <main className="mode-grid">
          {locked ? (
            <div className="done-state">
              <Icons.lock width="110" height="110" />
              <div className="lock-hint"><Icons.phase1 width="70" height="70" /><Icons.next width="40" height="40" /><Icons.basket width="70" height="70" /></div>
            </div>
          ) : (
            MODES.map((cfg) => (
              <button key={cfg.mode} className={`mode-btn ${cfg.danger ? 'danger' : ''}`} onPointerUp={() => enterMode(cfg)}>
                <cfg.Icon width="64" height="64" />
              </button>
            ))
          )}
        </main>
      )}

      {modeCfg && (
        <main className="basket-stage">
          <div className="tile-grid">
            {tiles.map((item) => (
              <WordTile
                key={item.id} item={item} canonicalId={canonicalOf.get(item.id)}
                size={92} draggable findDropTarget={findDropTarget} onDrop={onDrop}
              />
            ))}
          </div>
          <div className="basket-row">
            {modeCfg.odd ? (
              <Basket basketId={0} registerRect={registerRect} contents={[]} onRemove={() => {}}
                      icon={<Icons.oddOneOut width="64" height="64" />} />
            ) : (
              basketContents.map((contents, i) => (
                <Basket key={i} basketId={i} registerRect={registerRect} contents={contents}
                        onRemove={removeFromBasket} danger={!!modeCfg.danger} />
              ))
            )}
            {!modeCfg.odd && (
              <div className="basket-actions">
                {modeCfg.hum && basketContents[0]?.length > 0 && (
                  <button className="icon-btn hum-btn" onPointerUp={() => setHumTarget(basketContents[0][basketContents[0].length - 1])}>
                    <Icons.hum width="44" height="44" />
                  </button>
                )}
                <button className="big-btn ok" onPointerUp={commitRound}><Icons.check width="44" height="44" /></button>
              </div>
            )}
          </div>
        </main>
      )}

      {showDemo && (
        <GhostHandDemo onDone={() => { demoSeen.add(modeCfg.mode); setShowDemo(false); }} />
      )}

      {humTarget && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="hum-head"><Icons.hum width="48" height="48" /><ItemImage imageRef={humTarget.imageRef} className="hum-img" /></div>
            <RecorderPanel gateMs={{ min: 300, max: 6000 }} onAccept={onHumAccept} resetKey={humTarget.id} />
            <button className="icon-btn" onPointerUp={() => setHumTarget(null)}><Icons.cross width="34" height="34" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
