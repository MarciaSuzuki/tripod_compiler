// Wordless instruction: before a basket sub-mode starts, a ghost hand drags
// two example tiles into the basket and they "chime" together. Tap to skip.

import { useEffect, useRef, useState } from 'react';
import { Icons } from '../deck/icons.jsx';
import { ItemImage } from '../deck/svgLibrary.jsx';
import { chime, chord } from '../audio/tones.js';

const DEMO_TILES = ['svg:fish', 'svg:dog', 'svg:sun'];

// Keyframe positions (% of overlay) the hand+tile travel through.
const SCRIPT = [
  { hand: [22, 30], hold: null, dur: 600 },
  { hand: [22, 30], hold: 0, dur: 400 },     // grab tile 0
  { hand: [50, 72], hold: 0, dur: 900, sfx: chime }, // into basket
  { hand: [50, 30], hold: null, dur: 500 },
  { hand: [78, 30], hold: null, dur: 500 },
  { hand: [78, 30], hold: 2, dur: 400 },     // grab tile 2
  { hand: [50, 72], hold: 2, dur: 900, sfx: chord }, // chime together
  { hand: [50, 72], hold: null, dur: 700 },
];

export function GhostHandDemo({ onDone }) {
  const [step, setStep] = useState(0);
  const [dropped, setDropped] = useState([]);
  const timer = useRef(0);

  useEffect(() => {
    if (step >= SCRIPT.length) { onDone(); return; }
    const s = SCRIPT[step];
    if (s.sfx) {
      timer.current = setTimeout(() => {
        s.sfx();
        if (s.hold != null) setDropped((d) => [...d, s.hold]);
        setStep(step + 1);
      }, s.dur);
    } else {
      timer.current = setTimeout(() => setStep(step + 1), s.dur);
    }
    return () => clearTimeout(timer.current);
  }, [step, onDone]);

  if (step >= SCRIPT.length) return null;
  const s = SCRIPT[step];
  const [hx, hy] = s.hand;

  return (
    <div className="ghost-demo" onPointerUp={onDone}>
      <div className="ghost-stage">
        {DEMO_TILES.map((ref, i) =>
          dropped.includes(i) ? null : (
            <div
              key={ref}
              className="word-tile demo-tile"
              style={
                s.hold === i
                  ? { left: `${hx}%`, top: `${hy}%`, transition: `all ${s.dur}ms ease-in-out`, zIndex: 5 }
                  : { left: `${22 + i * 28}%`, top: '30%' }
              }
            >
              <ItemImage imageRef={ref} className="tile-img" />
            </div>
          )
        )}
        <div className="demo-basket" style={{ left: '50%', top: '72%' }}>
          <Icons.basket width="72" height="72" />
          {dropped.length > 0 && <div className="basket-badge">{dropped.length}</div>}
        </div>
        <div
          className="ghost-hand"
          style={{ left: `${hx}%`, top: `${hy + 6}%`, transition: `all ${s.dur}ms ease-in-out` }}
        >
          <Icons.ghostHand width="64" height="64" />
        </div>
      </div>
    </div>
  );
}
