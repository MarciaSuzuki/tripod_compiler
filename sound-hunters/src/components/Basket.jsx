// Drop target for Phase 2. Registers its hit-rect with the parent screen;
// shows mini-thumbnails of tiles inside (tap a thumbnail to take it back out).

import { useEffect, useRef } from 'react';
import { Icons } from '../deck/icons.jsx';
import { ItemImage } from '../deck/svgLibrary.jsx';

export function Basket({ basketId, icon = null, contents = [], registerRect, onRemove, danger = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) registerRect(basketId, ref.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    const iv = setInterval(update, 800); // layout shifts as tiles enter/leave
    return () => { window.removeEventListener('resize', update); clearInterval(iv); registerRect(basketId, null); };
  }, [basketId, registerRect, contents.length]);

  return (
    <div ref={ref} className={`basket ${danger ? 'danger' : ''}`}>
      <div className="basket-icon">
        {icon ?? <Icons.basket width="64" height="64" />}
      </div>
      <div className="basket-contents">
        {contents.map((item) => (
          <button key={item.id} className="basket-thumb" onPointerUp={() => onRemove(item)}>
            <ItemImage imageRef={item.imageRef} />
          </button>
        ))}
      </div>
    </div>
  );
}
