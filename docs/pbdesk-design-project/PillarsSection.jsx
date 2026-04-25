/* PillarsSection — three layout variations of the
   "My Wellness Pillars" homepage section. Switch via Tweaks. */

const { useState } = React;

// Re-use the same icon set inline for the list/cards
const SecIcon = ({ kind, size = 26, color }) => window.ArtIcon({ kind, size, color });

function PillarsList({ active, setActive }) {
  return (
    <div className="pillars-list">
      {window.PILLAR_DATA.map((p) => (
        <div
          key={p.key}
          className={`pillar-row ${active === p.key ? 'active' : ''}`}
          style={{ '--pillar-color': p.color }}
          onMouseEnter={() => setActive(p.key)}
          onMouseLeave={() => setActive(null)}
        >
          <span className="pillar-icon" style={{ '--pillar-color': p.color }}>
            <SecIcon kind={p.icon} size={26} color={p.color} />
          </span>
          <div className="pillar-content">
            <div className="pillar-content-head">
              <span className="pillar-num-tag">PILLAR / {p.n}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PillarsCards() {
  return (
    <div className="pillars-cards">
      {window.PILLAR_DATA.map((p) => (
        <div
          key={p.key}
          className="pillar-card"
          style={{ '--pillar-color': p.color }}
        >
          <span className="pillar-icon" style={{ '--pillar-color': p.color }}>
            <SecIcon kind={p.icon} size={22} color={p.color} />
          </span>
          <span className="pillar-num-tag">PILLAR / {p.n}</span>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </div>
      ))}
    </div>
  );
}

function PillarsSection({ layout }) {
  const [active, setActive] = useState(null);

  const Header = (
    <div className="section-header">
      <span className="eyebrow">My Wellness Pillars</span>
      <h2>Basic pillars for a happy &amp; healthy life.</h2>
      <p>Inspired by the wellness gurus I follow — Saurabh Bothra and Luke Coutinho.
        Four threads I keep weaving through everyday life.</p>
    </div>
  );

  if (layout === 'stage') {
    return (
      <section className="section">
        <div className="container">
          {Header}
          <div className="pillars-stage">
            <div className="pillars-art-wrap">
              <window.WellnessArt active={active} onHover={setActive} />
            </div>
            <PillarsCards />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'inline') {
    return (
      <section className="section">
        <div className="container">
          {Header}
          <div className="pillars-inline">
            <div className="pillars-art-wrap">
              <window.WellnessArt active={active} onHover={setActive} />
            </div>
            <PillarsCards />
          </div>
        </div>
      </section>
    );
  }

  // default: orbital (artwork left, list right)
  return (
    <section className="section">
      <div className="container">
        {Header}
        <div className="pillars-orbital">
          <div className="pillars-art-wrap">
            <window.WellnessArt active={active} onHover={setActive} />
          </div>
          <PillarsList active={active} setActive={setActive} />
        </div>
      </div>
    </section>
  );
}

window.PillarsSection = PillarsSection;
