// Rule 1 — audio is the object; the image is a handle.
//   tap  = play the item's canonical take, exactly once
//   drag = tile follows the finger; dropping into a basket replays it softly
// Rule 3 — the only audio a tile ever plays is the ONE canonical take.

import { useRef, useState } from 'react';
import { ItemImage } from '../deck/svgLibrary.jsx';
import { ProgressRing } from './ProgressRing.jsx';
import { playRecording } from '../audio/player.js';

const DRAG_THRESHOLD_PX = 10;

export function WordTile({
  item,
  canonicalId,          // the ONE take this tile may play
  size = 96,
  draggable = false,
  findDropTarget,       // (x, y) => basketId | null
  onDrop,               // (item, basketId) => void
  reps, repsMax,        // optional silent progress ring
  highlight = false,
  dimmed = false,
}) {
  const elRef = useRef(null);
  const start = useRef(null);
  const [drag, setDrag] = useState(null); // {dx, dy}

  const onPointerDown = (e) => {
    e.preventDefault();
    elRef.current?.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, dragging: false };
  };

  const onPointerMove = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!start.current.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX && draggable) {
      start.current.dragging = true;
    }
    if (start.current.dragging) setDrag({ dx, dy });
  };

  const onPointerUp = async (e) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    if (!s) return;
    if (!s.dragging) {
      // Tap: play the canonical take, exactly once.
      playRecording(canonicalId);
      return;
    }
    const basketId = findDropTarget?.(e.clientX, e.clientY) ?? null;
    if (basketId != null) {
      onDrop?.(item, basketId);
      // Soft confirmation replay on drop (rule 1).
      playRecording(canonicalId, { volume: 0.35 });
    }
  };

  const style = {
    width: size,
    height: size,
    touchAction: 'none',
    ...(drag
      ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.08)`, zIndex: 50, position: 'relative' }
      : {}),
  };

  return (
    <div
      ref={elRef}
      className={`word-tile ${drag ? 'dragging' : ''} ${highlight ? 'highlight' : ''} ${dimmed ? 'dimmed' : ''}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { start.current = null; setDrag(null); }}
    >
      <ItemImage imageRef={item.imageRef} className="tile-img" />
      {reps !== undefined && (
        <div className="tile-ring"><ProgressRing value={reps} max={repsMax} size={24} stroke={3.5} /></div>
      )}
      <div className="tile-ear" />
    </div>
  );
}
