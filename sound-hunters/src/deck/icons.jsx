// Wordless UI glyphs. Players navigate by these alone (zero-text rule);
// facilitator screens may pair them with text.

const base = {
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function I({ children, ...props }) {
  return <svg {...base} {...props} aria-hidden="true">{children}</svg>;
}
const fill = { fill: 'currentColor', stroke: 'none' };

export const Icons = {
  mic: (p) => (
    <I {...p}>
      <rect x="38" y="10" width="24" height="42" rx="12" {...fill} />
      <path d="M26 44 a24 24 0 0 0 48 0" />
      <line x1="50" y1="68" x2="50" y2="84" />
      <line x1="34" y1="88" x2="66" y2="88" />
    </I>
  ),
  stop: (p) => <I {...p}><rect x="26" y="26" width="48" height="48" rx="8" {...fill} /></I>,
  play: (p) => <I {...p}><path d="M34 22 L78 50 L34 78 Z" {...fill} /></I>,
  check: (p) => <I {...p} strokeWidth="10"><path d="M18 54 L42 76 L84 26" /></I>,
  cross: (p) => <I {...p} strokeWidth="10"><path d="M26 26 L74 74 M74 26 L26 74" /></I>,
  home: (p) => <I {...p}><path d="M16 50 L50 18 L84 50 M28 46 V84 H72 V46 M44 84 V62 H56 V84" /></I>,
  back: (p) => <I {...p} strokeWidth="10"><path d="M62 18 L30 50 L62 82" /></I>,
  next: (p) => <I {...p} strokeWidth="10"><path d="M38 18 L70 50 L38 82" /></I>,
  speaker: (p) => (
    <I {...p}>
      <path d="M18 40 H32 L52 22 V78 L32 60 H18 Z" {...fill} />
      <path d="M62 36 a18 18 0 0 1 0 28 M70 26 a30 30 0 0 1 0 48" />
    </I>
  ),
  ear: (p) => (
    <I {...p}>
      <path d="M34 36 a20 20 0 0 1 36 9 q-2 12 -10 19 q-7 6 -7 12 a11 11 0 0 1 -22 -1" />
    </I>
  ),
  basket: (p) => (
    <I {...p}>
      <path d="M20 42 H80 L72 84 H28 Z" />
      <path d="M32 42 a18 18 0 0 1 36 0" />
      <path d="M26 56 H74 M30 70 H70" strokeWidth="4.5" />
    </I>
  ),
  // Phase / mode glyphs
  phase1: (p) => (
    <I {...p}>
      <rect x="14" y="14" width="48" height="48" rx="8" />
      <circle cx="38" cy="33" r="9" strokeWidth="5" />
      <path d="M20 56 q10 -14 20 -4 q8 -10 16 2" strokeWidth="5" />
      <rect x="64" y="48" width="16" height="26" rx="8" {...fill} />
      <path d="M56 70 a16 16 0 0 0 32 0 M72 84 v6" strokeWidth="5" />
    </I>
  ),
  twins: (p) => (
    <I {...p} strokeWidth="5">
      <path d="M10 36 q12 -14 26 -14 q10 0 16 8 l8 -7 v26 l-8 -7 q-6 8 -16 8 q-14 0 -26 -14 Z" />
      <path d="M10 72 q12 -14 26 -14 q10 0 16 8 l8 -7 v26 l-8 -7 q-6 8 -16 8 q-14 0 -26 -14 Z" />
      <circle cx="22" cy="33" r="2.5" {...fill} />
      <circle cx="22" cy="69" r="2.5" {...fill} />
    </I>
  ),
  voices: (p) => (
    <I {...p} strokeWidth="5">
      <circle cx="28" cy="34" r="14" />
      <circle cx="72" cy="34" r="14" />
      <path d="M20 80 q0 -18 8 -18 t8 18 M64 80 q0 -18 8 -18 t8 18" />
      <path d="M42 56 h16 M42 66 h16" strokeWidth="6" />
    </I>
  ),
  freeArt: (p) => (
    <I {...p}>
      <rect x="40" y="12" width="20" height="36" rx="10" {...fill} />
      <path d="M28 42 a22 22 0 0 0 44 0 M50 70 v12" strokeWidth="5" />
      <path d="M14 24 l6 6 M86 24 l-6 6 M10 46 h8 M82 46 h8" strokeWidth="5" />
    </I>
  ),
  equals: (p) => <I {...p} strokeWidth="11"><path d="M26 40 H74 M26 60 H74" /></I>,
  notEquals: (p) => <I {...p} strokeWidth="11"><path d="M26 40 H74 M26 60 H74 M66 22 L34 78" /></I>,
  wave: (p) => <I {...p}><path d="M10 50 q10 -24 20 0 t20 0 t20 0 t20 0" /></I>,
  segment: (p) => (
    <I {...p} strokeWidth="5">
      <rect x="12" y="40" width="20" height="20" rx="4" />
      <rect x="40" y="40" width="20" height="20" rx="4" {...fill} />
      <rect x="68" y="40" width="20" height="20" rx="4" />
    </I>
  ),
  unknown: (p) => (
    <I {...p} strokeWidth="6">
      <circle cx="50" cy="50" r="34" strokeDasharray="10 12" />
      <circle cx="50" cy="50" r="5" {...fill} />
    </I>
  ),
  turtle: (p) => (
    <I {...p} strokeWidth="5">
      <path d="M26 56 a24 18 0 0 1 48 0 Z" />
      <path d="M34 56 l-6 10 M66 56 l6 10 M26 52 q-10 -2 -12 6 M74 50 q8 -6 12 0" />
      <circle cx="84" cy="48" r="5" />
      <path d="M38 46 h24 M44 38 h12" strokeWidth="4" />
    </I>
  ),
  person: (p) => (
    <I {...p} strokeWidth="6">
      <circle cx="50" cy="22" r="10" />
      <path d="M50 32 V60 M32 44 L50 38 L68 44 M50 60 L38 86 M50 60 L62 86" />
    </I>
  ),
  rabbit: (p) => (
    <I {...p} strokeWidth="5">
      <path d="M30 46 q-6 -26 4 -28 q8 -2 10 24 M52 42 q0 -28 10 -28 q8 0 2 28" />
      <circle cx="46" cy="60" r="18" />
      <circle cx="40" cy="56" r="2.5" {...fill} />
      <path d="M64 70 q14 -4 22 4" strokeWidth="5" />
    </I>
  ),
  note: (p) => (
    <I {...p} strokeWidth="6">
      <path d="M38 76 V24 L74 16 V68" />
      <ellipse cx="28" cy="76" rx="10" ry="8" {...fill} />
      <ellipse cx="64" cy="68" rx="10" ry="8" {...fill} />
    </I>
  ),
  storyFire: (p) => (
    <I {...p} strokeWidth="5">
      <path d="M50 18 c-7 12 -14 17 -14 29 a14 14 0 0 0 28 0 c0 -12 -7 -17 -14 -29 Z" />
      <circle cx="18" cy="64" r="7" />
      <path d="M12 86 q0 -12 6 -12 t6 12" />
      <circle cx="82" cy="64" r="7" />
      <path d="M70 86 q0 -12 6 -12 t6 12" />
      <line x1="30" y1="78" x2="70" y2="78" strokeWidth="4" />
    </I>
  ),
  knot: (p) => (
    <I {...p} strokeWidth="6">
      <path d="M14 60 q10 -28 30 -22 q16 5 10 18 q-5 12 -18 7 q-12 -5 -4 -16 q8 -10 24 -8 q20 3 30 -11" />
      <path d="M14 60 q4 6 12 6 M86 28 q-2 8 -10 10" strokeWidth="5" />
    </I>
  ),
  dots: (p) => (
    <I {...p}>
      <circle cx="24" cy="50" r="7" {...fill} />
      <circle cx="50" cy="50" r="7" {...fill} />
      <circle cx="76" cy="50" r="7" {...fill} />
    </I>
  ),
  oddOneOut: (p) => (
    <I {...p} strokeWidth="5">
      <circle cx="28" cy="36" r="11" {...fill} />
      <circle cx="60" cy="36" r="11" {...fill} />
      <circle cx="62" cy="72" r="11" />
      <path d="M76 60 l10 -10" strokeWidth="5" />
    </I>
  ),
  ghostHand: (p) => (
    <I {...p} strokeWidth="5" opacity="0.85">
      <path d="M36 84 V60 q-8 -8 -4 -14 q4 -4 8 2 l4 6 V32 q0 -5 5 -5 t5 5 v18 v-22 q0 -5 5 -5 t5 5 v24 v-18 q0 -5 5 -5 t5 5 v26 q6 -8 10 -4 q3 4 -3 12 q-8 10 -8 18 v8" />
    </I>
  ),
  hum: (p) => (
    <I {...p} strokeWidth="5">
      <circle cx="38" cy="50" r="22" />
      <path d="M28 56 h20" strokeWidth="5" />
      <path d="M66 34 q8 -6 8 8 t8 8" strokeWidth="5" />
      <ellipse cx="84" cy="56" rx="6" ry="5" {...fill} />
    </I>
  ),
  trapMask: (p) => (
    <I {...p} strokeWidth="5">
      <path d="M26 18 h48 q6 22 0 44 q-6 18 -24 22 q-18 -4 -24 -22 q-6 -22 0 -44 Z" />
      <path d="M34 38 l12 6 M66 38 l-12 6" />
      <path d="M38 64 l8 -6 8 6 8 -6" />
    </I>
  ),
  lock: (p) => (
    <I {...p} strokeWidth="6">
      <rect x="28" y="44" width="44" height="38" rx="8" />
      <path d="M36 44 V32 a14 14 0 0 1 28 0 v12" />
      <circle cx="50" cy="62" r="5" {...fill} />
    </I>
  ),
  gear: (p) => (
    <I {...p} strokeWidth="6">
      <circle cx="50" cy="50" r="14" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a} x1={50 + 22 * Math.cos(r)} y1={50 + 22 * Math.sin(r)}
                x2={50 + 32 * Math.cos(r)} y2={50 + 32 * Math.sin(r)} />
        );
      })}
    </I>
  ),
  download: (p) => (
    <I {...p}>
      <path d="M50 14 V58 M32 42 L50 60 L68 42" />
      <path d="M20 70 V84 H80 V70" />
    </I>
  ),
  star: (p) => <I {...p} strokeWidth="6"><path d="M50 14 L58 38 L84 39 L63 54 L70 80 L50 65 L30 80 L37 54 L16 39 L42 38 Z" /></I>,
  starFilled: (p) => <I {...p}><path d="M50 14 L58 38 L84 39 L63 54 L70 80 L50 65 L30 80 L37 54 L16 39 L42 38 Z" {...fill} /></I>,
  sunDone: (p) => (
    <I {...p} strokeWidth="6">
      <circle cx="50" cy="50" r="20" />
      <path d="M40 52 L48 60 L62 42" strokeWidth="7" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a} x1={50 + 28 * Math.cos(r)} y1={50 + 28 * Math.sin(r)}
                x2={50 + 36 * Math.cos(r)} y2={50 + 36 * Math.sin(r)} />
        );
      })}
    </I>
  ),
};
