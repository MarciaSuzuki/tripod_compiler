// Reps-collected ring (0–N). Purely visual — rendering it never plays audio
// (rule 2: progress display is silent).
export function ProgressRing({ value, max = 5, size = 28, stroke = 4, color = 'var(--ok)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-bg)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={frac >= 1 ? 'var(--gold)' : color} strokeWidth={stroke}
        strokeDasharray={`${c * frac} ${c * (1 - frac)}`}
        strokeDashoffset={c / 4} strokeLinecap="round"
      />
      {frac >= 1 && <circle cx={size / 2} cy={size / 2} r={r / 3} fill="var(--gold)" />}
    </svg>
  );
}
