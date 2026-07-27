/*
 * Marchi vettoriali ridisegnati dalla brochure ECO_2G:
 *  - PawMark: zampa nel cerchio-foglia (copertina)
 *  - Turtle: tartaruga stilizzata del marchio "2G Puglia — Plastic Second Life"
 *  - LogoFull: zampa + wordmark "imballaggi" + badge "2g"
 * I path hanno pathLength="1" così da poter essere "disegnati"
 * animando stroke-dashoffset da 1 a 0.
 */

export function PawMark({ size = 44, draw = false, className = '' }) {
  const common = draw
    ? { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, pathLength: 1 }
    : {};
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`paw-mark ${className}`}
      aria-hidden="true"
    >
      {/* cerchio-foglia */}
      <path
        d="M 51 13 A 26 26 0 1 0 58 32"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength="1"
        className="paw-swoosh"
      />
      {/* polpastrello */}
      <path
        d="M 32 34 c 7 0 12 4.5 12 10 c 0 5 -4.5 8.5 -12 8.5 c -7.5 0 -12 -3.5 -12 -8.5 c 0 -5.5 5 -10 12 -10 Z"
        fill={draw ? 'none' : 'var(--lime)'}
        {...(draw ? { ...common, stroke: 'var(--lime)' } : {})}
        className="paw-pad"
      />
      {/* dita */}
      {[
        { cx: 15.5, cy: 27, r: 5, rot: -24 },
        { cx: 26, cy: 17.5, r: 5.6, rot: -10 },
        { cx: 38.5, cy: 16.5, r: 5.6, rot: 8 },
        { cx: 49, cy: 25, r: 5, rot: 22 },
      ].map((t, i) => (
        <ellipse
          key={i}
          cx={t.cx}
          cy={t.cy}
          rx={t.r * 0.82}
          ry={t.r}
          transform={`rotate(${t.rot} ${t.cx} ${t.cy})`}
          fill={draw ? 'none' : 'var(--lime)'}
          {...(draw ? { ...common, stroke: 'var(--lime)' } : {})}
          className="paw-toe"
        />
      ))}
    </svg>
  );
}

export function Turtle({ size = 160, className = '', title }) {
  return (
    <svg
      viewBox="0 0 132 150"
      width={size}
      height={size * (150 / 132)}
      className={`turtle ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* testa e collo */}
        <path
          className="t-part t-head"
          d="M 58 26 C 56 14 62 6 66 6 C 70 6 76 14 74 26"
          pathLength="1"
        />
        <circle className="t-part t-eye" cx="61" cy="14" r="1.4" pathLength="1" />
        <circle className="t-part t-eye" cx="71" cy="14" r="1.4" pathLength="1" />
        {/* pinne anteriori */}
        <path
          className="t-part t-fin"
          d="M 36 52 C 22 42 12 44 6 52 C 14 60 24 62 36 58"
          pathLength="1"
        />
        <path
          className="t-part t-fin"
          d="M 96 52 C 110 42 120 44 126 52 C 118 60 108 62 96 58"
          pathLength="1"
        />
        {/* pinne posteriori */}
        <path
          className="t-part t-fin"
          d="M 42 112 C 32 120 28 128 30 136 C 40 132 46 126 50 118"
          pathLength="1"
        />
        <path
          className="t-part t-fin"
          d="M 90 112 C 100 120 104 128 102 136 C 92 132 86 126 82 118"
          pathLength="1"
        />
        {/* coda */}
        <path className="t-part t-tail" d="M 62 132 L 66 144 L 70 132" pathLength="1" />
        {/* carapace */}
        <ellipse className="t-part t-shell" cx="66" cy="80" rx="38" ry="46" pathLength="1" />
        {/* scudi del carapace */}
        <path
          className="t-part t-plate"
          d="M 52 66 L 66 58 L 80 66 L 80 84 L 66 92 L 52 84 Z"
          pathLength="1"
        />
        <path className="t-part t-plate" d="M 66 58 L 66 40" pathLength="1" />
        <path className="t-part t-plate" d="M 52 66 L 36 58" pathLength="1" />
        <path className="t-part t-plate" d="M 80 66 L 96 58" pathLength="1" />
        <path className="t-part t-plate" d="M 52 84 L 34 92" pathLength="1" />
        <path className="t-part t-plate" d="M 80 84 L 98 92" pathLength="1" />
        <path className="t-part t-plate" d="M 66 92 L 66 112" pathLength="1" />
      </g>
    </svg>
  );
}

export function LogoFull({ compact = false, className = '' }) {
  return (
    <span className={`logo-full ${compact ? 'is-compact' : ''} ${className}`}>
      <PawMark size={compact ? 30 : 40} />
      <span className="logo-word">imballaggi</span>
      <span className="logo-badge">2g</span>
    </span>
  );
}
