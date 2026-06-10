// Placeholder line drawings, all inline SVG (no assets to load offline).
// The deck JSON points at these via imageRef "svg:<name>"; any other imageRef
// is treated as an image URL, so a real drawn/photographed deck swaps in by
// editing the JSON only.

const base = {
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function S({ children, ...props }) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      {children}
    </svg>
  );
}

export const SVG_LIB = {
  sun: (p) => (
    <S {...p}>
      <circle cx="50" cy="50" r="17" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a} x1={50 + 25 * Math.cos(r)} y1={50 + 25 * Math.sin(r)}
                x2={50 + 38 * Math.cos(r)} y2={50 + 38 * Math.sin(r)} />
        );
      })}
    </S>
  ),
  moon: (p) => (
    <S {...p}>
      <path d="M63 14 A38 38 0 1 0 63 86 A31 31 0 1 1 63 14 Z" />
    </S>
  ),
  star: (p) => (
    <S {...p}>
      <path d="M50 12 L59 38 L88 39 L65 56 L73 84 L50 67 L27 84 L35 56 L12 39 L41 38 Z" />
    </S>
  ),
  fire: (p) => (
    <S {...p}>
      <path d="M50 10 C40 28 28 36 28 56 a22 22 0 0 0 44 0 C72 38 58 30 50 10 Z" />
      <path d="M50 48 c-6 8 -9 11 -9 18 a9 9 0 0 0 18 0 c0 -7 -3 -10 -9 -18 Z" />
    </S>
  ),
  water: (p) => (
    <S {...p}>
      <path d="M14 34 q9 -10 18 0 t18 0 t18 0 t18 0" />
      <path d="M14 54 q9 -10 18 0 t18 0 t18 0 t18 0" />
      <path d="M14 74 q9 -10 18 0 t18 0 t18 0 t18 0" />
    </S>
  ),
  rain: (p) => (
    <S {...p}>
      <path d="M30 50 a13 13 0 0 1 -3 -25 a19 19 0 0 1 37 -4 a12 12 0 0 1 6 29 Z" />
      <line x1="32" y1="62" x2="27" y2="76" />
      <line x1="50" y1="62" x2="45" y2="80" />
      <line x1="68" y1="62" x2="63" y2="76" />
    </S>
  ),
  cloud: (p) => (
    <S {...p}>
      <path d="M28 66 a14 14 0 0 1 -2 -28 a20 20 0 0 1 39 -5 a13 13 0 0 1 8 33 Z" />
    </S>
  ),
  mountain: (p) => (
    <S {...p}>
      <path d="M8 80 L36 30 L50 54 L64 24 L92 80 Z" />
      <path d="M30 41 L36 47 L42 41" strokeWidth="4" />
    </S>
  ),
  stone: (p) => (
    <S {...p}>
      <path d="M28 72 q-13 -8 -7 -23 q7 -17 28 -19 q23 -2 29 15 q6 15 -7 25 q-15 11 -43 2 Z" />
    </S>
  ),
  river: (p) => (
    <S {...p}>
      <path d="M34 8 q-16 22 0 42 t0 42" />
      <path d="M62 8 q-16 22 0 42 t0 42" />
      <path d="M42 38 q4 -5 9 0" strokeWidth="4" />
      <path d="M46 64 q4 -5 9 0" strokeWidth="4" />
    </S>
  ),
  tree: (p) => (
    <S {...p}>
      <circle cx="50" cy="36" r="24" />
      <path d="M46 88 V58 M54 88 V58 M50 70 l-10 -8 M50 64 l9 -7" />
      <line x1="32" y1="88" x2="68" y2="88" />
    </S>
  ),
  leaf: (p) => (
    <S {...p}>
      <path d="M50 14 q31 20 23 46 q-8 26 -23 26 q-15 0 -23 -26 q-8 -26 23 -46 Z" />
      <path d="M50 26 V78 M50 44 l-12 -8 M50 56 l12 -8" strokeWidth="4" />
    </S>
  ),
  flower: (p) => (
    <S {...p}>
      <circle cx="50" cy="34" r="9" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={50 + 18 * Math.cos(r)} cy={34 + 18 * Math.sin(r)} r="8" strokeWidth="4" />;
      })}
      <path d="M50 52 V88 M50 70 q-12 -2 -16 -12 M50 76 q12 -2 16 -12" strokeWidth="4" />
    </S>
  ),
  fish: (p) => (
    <S {...p}>
      <path d="M16 50 q18 -22 38 -22 q15 0 24 14 l12 -12 v40 l-12 -12 q-9 14 -24 14 q-20 0 -38 -22 Z" />
      <circle cx="32" cy="45" r="3.5" fill="currentColor" stroke="none" />
      <path d="M52 32 q6 18 0 36" strokeWidth="4" />
    </S>
  ),
  bird: (p) => (
    <S {...p}>
      <path d="M28 56 q3 -20 24 -20 q19 0 21 15 l15 -3 -12 10 q-5 18 -24 18 q-21 0 -24 -20 Z" />
      <circle cx="44" cy="46" r="3" fill="currentColor" stroke="none" />
      <path d="M50 56 q10 -8 20 -4" strokeWidth="4" />
      <path d="M44 76 v10 M56 76 v10" strokeWidth="4" />
    </S>
  ),
  dog: (p) => (
    <S {...p}>
      <path d="M22 64 q-3 -16 12 -16 h28 q3 -10 12 -10 q11 0 11 11 q5 2 4 7 q-1 4 -7 4 q-2 4 -8 4 v16 M30 64 v16 M42 48 v-2 M58 64 v16 M70 64 v6" />
      <path d="M22 64 q-10 -4 -8 -14" />
      <path d="M74 38 l-2 -8 -6 6" />
      <circle cx="77" cy="45" r="2.5" fill="currentColor" stroke="none" />
    </S>
  ),
  snake: (p) => (
    <S {...p}>
      <path d="M22 28 q20 -16 36 -2 q14 12 -4 24 q-18 12 -2 24 q14 10 28 0" />
      <circle cx="20" cy="30" r="7" />
      <path d="M14 26 l-8 -5 M14 32 l-8 4" strokeWidth="4" />
    </S>
  ),
  frog: (p) => (
    <S {...p}>
      <path d="M26 72 q-2 -26 24 -26 q26 0 24 26 Z" />
      <circle cx="36" cy="40" r="7" />
      <circle cx="64" cy="40" r="7" />
      <circle cx="36" cy="40" r="2" fill="currentColor" stroke="none" />
      <circle cx="64" cy="40" r="2" fill="currentColor" stroke="none" />
      <path d="M26 72 q-10 6 -4 12 M74 72 q10 6 4 12" strokeWidth="4" />
    </S>
  ),
  egg: (p) => (
    <S {...p}>
      <path d="M50 12 C66 32 74 46 74 60 a24 24 0 0 1 -48 0 C26 46 34 32 50 12 Z" />
    </S>
  ),
  man: (p) => (
    <S {...p}>
      <circle cx="50" cy="20" r="10" />
      <path d="M50 30 V60 M28 44 L50 36 L72 44 M50 60 L36 86 M50 60 L64 86" />
    </S>
  ),
  woman: (p) => (
    <S {...p}>
      <circle cx="50" cy="18" r="10" />
      <path d="M50 28 V52 M30 40 L50 34 L70 40" />
      <path d="M40 52 H60 L70 78 H30 Z" />
      <path d="M42 78 V88 M58 78 V88" />
    </S>
  ),
  child: (p) => (
    <S {...p}>
      <circle cx="50" cy="34" r="9" />
      <path d="M50 43 V64 M34 54 L50 48 L66 54 M50 64 L40 84 M50 64 L60 84" />
      <path d="M62 22 q6 -8 12 -2" strokeWidth="4" />
    </S>
  ),
  head: (p) => (
    <S {...p}>
      <circle cx="50" cy="44" r="26" />
      <path d="M40 86 q10 6 20 0 M44 70 v8 M56 70 v8" strokeWidth="4" />
      <path d="M24 44 q-6 2 -4 8 q2 5 7 3" strokeWidth="4" />
      <path d="M30 26 q18 -14 40 0" strokeWidth="4" />
    </S>
  ),
  eye: (p) => (
    <S {...p}>
      <path d="M14 50 q36 -28 72 0 q-36 28 -72 0 Z" />
      <circle cx="50" cy="50" r="10" />
      <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
    </S>
  ),
  ear: (p) => (
    <S {...p}>
      <path d="M36 38 a20 20 0 0 1 36 8 q-2 12 -10 19 q-7 6 -7 13 a11 11 0 0 1 -22 -1" />
      <path d="M46 42 a10 10 0 0 1 16 6 q-1 7 -7 12" strokeWidth="4" />
    </S>
  ),
  nose: (p) => (
    <S {...p}>
      <path d="M54 18 q0 22 9 32 q8 9 -1 15 q-7 5 -14 1" />
      <path d="M42 62 q-5 4 -1 8" strokeWidth="4" />
    </S>
  ),
  mouth: (p) => (
    <S {...p}>
      <path d="M18 50 q16 -14 32 -5 q16 -9 32 5 q-16 18 -32 16 q-16 2 -32 -16 Z" />
      <path d="M18 50 q32 8 64 0" strokeWidth="4" />
    </S>
  ),
  hand: (p) => (
    <S {...p}>
      <path d="M32 88 V62 q-9 -10 -5 -16 q4 -5 9 1 l5 7 V28 q0 -6 5.5 -6 t5.5 6 v22 V22 q0 -6 5.5 -6 t5.5 6 v28 V28 q0 -6 5 -6 t5 6 v30 q7 -9 11 -5 q4 4 -3 14 q-9 12 -9 21 v6" />
    </S>
  ),
  foot: (p) => (
    <S {...p}>
      <path d="M38 14 q14 -4 18 8 q3 10 10 16 q12 10 12 24 q0 14 -16 14 q-22 0 -30 -12 q-8 -13 -4 -30 q3 -14 10 -20 Z" />
      <path d="M34 30 q8 4 16 2" strokeWidth="4" />
    </S>
  ),
  house: (p) => (
    <S {...p}>
      <path d="M24 46 V84 H76 V46" />
      <path d="M16 48 L50 16 L84 48" />
      <path d="M44 84 V62 H56 V84" />
    </S>
  ),
  pot: (p) => (
    <S {...p}>
      <ellipse cx="50" cy="38" rx="22" ry="7" />
      <path d="M28 38 q-4 28 22 32 q26 -4 22 -32" />
      <path d="M28 42 q-10 0 -8 8 M72 42 q10 0 8 8" strokeWidth="4" />
    </S>
  ),
  knife: (p) => (
    <S {...p}>
      <path d="M20 66 Q44 36 70 26 l8 12 Q52 50 32 74 Z" />
      <path d="M70 26 l12 -10 8 10 -12 12" />
    </S>
  ),
  basket: (p) => (
    <S {...p}>
      <path d="M22 44 H78 L70 84 H30 Z" />
      <path d="M30 44 a20 20 0 0 1 40 0" />
      <path d="M26 57 H74 M28 70 H72 M40 44 l4 40 M60 44 l-4 40" strokeWidth="3.5" />
    </S>
  ),
  eat: (p) => (
    <S {...p}>
      <circle cx="62" cy="30" r="13" />
      <path d="M62 36 q-5 4 -10 0" strokeWidth="4" />
      <path d="M28 80 q22 4 34 -8" />
      <path d="M30 80 L52 44" />
      <ellipse cx="54" cy="41" rx="6" ry="4" strokeWidth="4" />
      <path d="M20 86 a18 8 0 0 0 36 0 Z" strokeWidth="4" />
    </S>
  ),
  drink: (p) => (
    <S {...p}>
      <circle cx="60" cy="26" r="12" />
      <path d="M44 44 l14 -4 M44 44 v14 q0 8 9 8 t9 -8 l2 -18" />
      <path d="M28 84 L46 56" />
      <path d="M50 50 q5 3 10 1" strokeWidth="4" />
    </S>
  ),
  sleep: (p) => (
    <S {...p}>
      <line x1="10" y1="80" x2="90" y2="80" />
      <circle cx="26" cy="68" r="9" />
      <path d="M35 72 q26 -10 52 -4" />
      <path d="M22 67 q4 3 8 0" strokeWidth="4" />
      <path d="M72 18 a13 13 0 1 0 10 22 a10 10 0 1 1 -10 -22 Z" strokeWidth="4" />
    </S>
  ),
  run: (p) => (
    <S {...p}>
      <circle cx="60" cy="18" r="9" />
      <path d="M58 27 L50 52 M38 34 L56 40 L74 30 M50 52 L28 64 M50 52 L64 70 L74 88" />
      <path d="M14 44 h12 M10 56 h10" strokeWidth="4" />
    </S>
  ),
  walk: (p) => (
    <S {...p}>
      <circle cx="50" cy="16" r="9" />
      <path d="M50 25 V54 M38 38 L50 32 L62 40 M50 54 L40 86 M50 54 L62 72 L60 88" />
    </S>
  ),
  fall: (p) => (
    <S {...p}>
      <circle cx="32" cy="34" r="9" />
      <path d="M39 40 L58 56 M44 28 L60 38 M52 62 L58 56 L76 60 M58 56 L72 74" />
      <path d="M70 14 a26 26 0 0 1 12 20" strokeWidth="4" />
      <path d="M78 10 l4 6 -7 2" strokeWidth="4" />
      <line x1="14" y1="88" x2="88" y2="88" />
    </S>
  ),
  cry: (p) => (
    <S {...p}>
      <circle cx="50" cy="44" r="28" />
      <path d="M38 38 q4 -4 8 0 M54 38 q4 -4 8 0" strokeWidth="4" />
      <path d="M38 60 q12 -8 24 0" />
      <path d="M40 48 q-3 8 0 12 q5 3 6 -4 q0 -5 -6 -8 Z M60 48 q3 8 0 12 q-5 3 -6 -4 q0 -5 6 -8 Z" strokeWidth="3.5" />
    </S>
  ),
  laugh: (p) => (
    <S {...p}>
      <circle cx="50" cy="46" r="28" />
      <path d="M36 38 q4 -5 9 0 M55 38 q4 -5 9 0" strokeWidth="4" />
      <path d="M34 52 a16 16 0 0 0 32 0 Z" />
      <path d="M14 26 l8 6 M86 26 l-8 6" strokeWidth="4" />
    </S>
  ),
  sit: (p) => (
    <S {...p}>
      <circle cx="42" cy="22" r="9" />
      <path d="M42 31 V56 L64 56 V80 M42 44 L56 48 M42 56 L42 64" />
      <path d="M30 80 V56 M30 64 H64 M64 80 v0" />
      <line x1="20" y1="88" x2="80" y2="88" strokeWidth="4" />
    </S>
  ),
};

// --- Possessor silhouette devices (Level 2) ----------------------------
// my   = filled figure, arm bent to own chest (dot on chest)
// your = filled figure, arm extended outward toward the viewer-figure
// third= filled figure pointing at a separate smaller figure
const fill = { fill: 'currentColor', stroke: 'none' };

export const POSSESSOR_LIB = {
  my: (p) => (
    <S {...p}>
      <circle cx="50" cy="22" r="12" {...fill} />
      <path d="M30 88 V56 q0 -18 20 -18 t20 18 V88 Z" {...fill} />
      <path d="M70 52 Q60 58 52 60" strokeWidth="6" />
      <circle cx="50" cy="60" r="5" fill="#fff" stroke="currentColor" strokeWidth="4" />
    </S>
  ),
  your: (p) => (
    <S {...p}>
      <circle cx="34" cy="22" r="12" {...fill} />
      <path d="M16 88 V56 q0 -18 18 -18 t18 18 V88 Z" {...fill} />
      <path d="M48 50 L78 44" strokeWidth="6" />
      <path d="M72 38 l8 6 -8 6" strokeWidth="5" />
      <circle cx="86" cy="60" r="9" />
      <path d="M80 84 q0 -14 6 -14 t6 14" strokeWidth="4" />
    </S>
  ),
  third: (p) => (
    <S {...p}>
      <circle cx="28" cy="20" r="11" {...fill} />
      <path d="M12 84 V52 q0 -16 16 -16 t16 16 V84 Z" {...fill} />
      <path d="M40 48 L62 42" strokeWidth="6" />
      <path d="M57 37 l7 5 -7 5" strokeWidth="5" />
      <circle cx="76" cy="48" r="8" {...fill} />
      <path d="M66 86 V64 q0 -10 10 -10 t10 10 V86 Z" {...fill} />
    </S>
  ),
};

/** Resolve a deck imageRef: "svg:<name>" → library; anything else → URL. */
export function ItemImage({ imageRef, className, style }) {
  if (imageRef && imageRef.startsWith('svg:')) {
    const Cmp = SVG_LIB[imageRef.slice(4)];
    if (Cmp) return <Cmp className={className} style={style} />;
  }
  if (imageRef) return <img src={imageRef} alt="" className={className} style={style} draggable={false} />;
  return <S className={className} style={style}><circle cx="50" cy="50" r="30" /></S>;
}
