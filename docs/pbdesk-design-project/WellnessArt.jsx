/* WellnessArt — themed SVG illustration of the four pillars
   orbiting a central "Wellness" hub. Replaces the old
   pbdesk.com Astro wellness.png with a vector that adapts
   to light/dark and the active brand accent. */

const { useId } = React;

// Lucide-style icons used inside satellite nodes
const ArtIcon = ({ kind, size = 22, color }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color || 'currentColor',
    strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (kind) {
    case 'apple':
      return (
        <svg {...props}>
          <path d="M12 20.94c1.5 0 2.75-.67 3.58-1.94"/>
          <path d="M12 7c.5-1 1.5-2 3-2 2 0 3.5 1.5 3.5 4s-1 4-2 5.5c-1 1.5-2 3-3 3-1 0-1.5-.5-3-.5s-2 .5-3 .5c-1 0-2-1.5-3-3-1-1.5-2-3-2-5.5 0-3 2-4.5 3.5-4.5 1.5 0 2.5 1 3 2"/>
          <path d="M12 7c0-2 1-3 2-4"/>
        </svg>
      );
    case 'run':
      return (
        <svg {...props}>
          <circle cx="13" cy="4" r="2"/>
          <path d="M4 22 9 13l4 2 3-3 4 5"/>
          <path d="m7 18-3-1 4-5 3 2 2-3 4 1"/>
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg {...props}>
          <path d="M11 20A7 7 0 0 1 4 13c0-7 9-11 17-11 0 8-4 17-11 17a7 7 0 0 1-6-3"/>
          <path d="M2 22c2-7 8-10 13-10"/>
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
        </svg>
      );
    default: return null;
  }
};

window.ArtIcon = ArtIcon;

// Color palette per pillar — derived from brand + semantic tokens
window.PILLAR_DATA = [
  {
    n: '01',
    key: 'nutrition',
    title: 'Cellular Nutrition',
    short: 'Nutrition',
    body: 'Whole, natural, unprocessed foods rich in vitamins and minerals — fuel for immunity and repair.',
    icon: 'apple',
    color: '#10B981',  // emerald
    angle: -135,       // top-left
  },
  {
    n: '02',
    key: 'exercise',
    title: 'Adequate Exercise',
    short: 'Exercise',
    body: 'Regular movement — walking, yoga, strength — to boost endorphins and keep body and mind sharp.',
    icon: 'run',
    color: '#F59E0B',  // amber
    angle: -45,        // top-right
  },
  {
    n: '03',
    key: 'sleep',
    title: 'Quality Sleep',
    short: 'Sleep',
    body: 'Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.',
    icon: 'moon',
    color: '#0EA5E9',  // sky
    angle: 135,        // bottom-left
  },
  {
    n: '04',
    key: 'emotion',
    title: 'Emotional Wellness',
    short: 'Emotion',
    body: 'Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, the occasional detox.',
    icon: 'heart',
    color: '#E11D48',  // rose
    angle: 45,         // bottom-right
  },
];

function WellnessArt({ active, onHover, compact = false }) {
  const uid = useId().replace(/[:]/g, '');
  const VB = 560;
  const cx = VB / 2, cy = VB / 2;
  const ringR = 200;
  const nodeR = 56;
  const hubR = 78;

  // Position helpers
  const pos = (deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: cx + Math.cos(r) * ringR, y: cy + Math.sin(r) * ringR };
  };

  return (
    <svg className="pillars-art" viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="My four wellness pillars">
      <defs>
        <radialGradient id={`hubGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="var(--brand-600)" stopOpacity="0.22" />
          <stop offset="60%" stopColor="var(--brand-600)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`bgGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="var(--brand-600)" stopOpacity="0.06" />
          <stop offset="70%" stopColor="var(--brand-600)" stopOpacity="0" />
        </radialGradient>

        {window.PILLAR_DATA.map(p => (
          <radialGradient key={p.key} id={`nodeGrad-${uid}-${p.key}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%"  stopColor={p.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0.04" />
          </radialGradient>
        ))}
      </defs>

      {/* Soft ambient backdrop */}
      <rect x="0" y="0" width={VB} height={VB} fill={`url(#bgGrad-${uid})`} />

      {/* Outer dotted orbit ring */}
      <circle className="orbit-ring" cx={cx} cy={cy} r={ringR} />
      {/* Inner dotted ring */}
      <circle className="orbit-ring" cx={cx} cy={cy} r={ringR - 60} style={{ opacity: 0.4 }} />

      {/* Decorative satellites (small dots on ring) */}
      {[0, 90, 180, 270].map((a) => {
        const p = pos(a);
        return <circle key={a} className="pip" cx={p.x} cy={p.y} r="3" />;
      })}

      {/* Connectors hub -> nodes */}
      {window.PILLAR_DATA.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        return (
          <line
            key={`c-${p.key}`}
            className="connector"
            x1={cx} y1={cy} x2={np.x} y2={np.y}
            style={isActive ? { stroke: p.color, opacity: 0.7, strokeWidth: 1.75 } : null}
          />
        );
      })}

      {/* Floating decorative bits (between nodes, on rings) */}
      <g className="float-1">
        <circle className="satellite" cx={cx + ringR - 18} cy={cy - 4} r="6" />
      </g>
      <g className="float-2">
        <circle className="satellite" cx={cx - ringR + 18} cy={cy + 4} r="5" />
      </g>
      <g className="float-3">
        <circle className="satellite" cx={cx - 4} cy={cy - ringR + 18} r="4" />
      </g>
      <g className="float-4">
        <circle className="satellite" cx={cx + 4} cy={cy + ringR - 18} r="5" />
      </g>

      {/* Hub glow */}
      <circle className="hub-glow" cx={cx} cy={cy} r={hubR + 30} fill={`url(#hubGrad-${uid})`} />

      {/* Hub */}
      <g>
        <circle className="hub-inner" cx={cx} cy={cy} r={hubR} />
        <circle className="hub-circle" cx={cx} cy={cy} r={hubR - 6} />
        <text className="hub-sub" x={cx} y={cy - 14}>Wellness</text>
        <text className="hub-title" x={cx} y={cy + 8}>Live Well,</text>
        <text className="hub-title" x={cx} y={cy + 30}>Build Long.</text>
      </g>

      {/* Pillar nodes */}
      {window.PILLAR_DATA.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        const labelOffset = (p.angle === -135 || p.angle === 135) ? -1 : 1;
        return (
          <g
            key={p.key}
            className={`breath`}
            style={{ animationDelay: `${(p.n.charCodeAt(1) - 49) * 1.2}s`, cursor: 'pointer' }}
            onMouseEnter={() => onHover && onHover(p.key)}
            onMouseLeave={() => onHover && onHover(null)}
          >
            {/* outer halo (only when active) */}
            {isActive && (
              <circle cx={np.x} cy={np.y} r={nodeR + 10}
                fill="none"
                stroke={p.color}
                strokeOpacity="0.25"
                strokeWidth="1.5"
                strokeDasharray="2 4" />
            )}

            {/* node circle */}
            <circle
              cx={np.x} cy={np.y} r={nodeR}
              className={`node-bg ${isActive ? 'node-bg-active' : ''}`}
              style={{
                '--pillar-color': p.color,
                stroke: isActive ? p.color : undefined,
                strokeWidth: isActive ? 1.75 : 1.25,
              }}
            />
            {/* tinted fill on top */}
            <circle cx={np.x} cy={np.y} r={nodeR - 1} fill={`url(#nodeGrad-${uid}-${p.key})`} />

            {/* icon */}
            <foreignObject x={np.x - 14} y={np.y - 22} width="28" height="28">
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <ArtIcon kind={p.icon} size={26} color={p.color} />
              </div>
            </foreignObject>

            {/* number badge */}
            <g transform={`translate(${np.x + nodeR - 14}, ${np.y - nodeR + 14})`}>
              <circle r="11" fill={p.color} />
              <text x="0" y="3" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700" fill="white">{p.n}</text>
            </g>

            {/* label below */}
            <text className="node-label" x={np.x} y={np.y + 14}>{p.short}</text>
            <text className="node-sub" x={np.x} y={np.y + 28}>0{p.n.slice(1)}</text>
          </g>
        );
      })}
    </svg>
  );
}

window.WellnessArt = WellnessArt;
