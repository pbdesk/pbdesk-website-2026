/* Brain Boost — shared chrome (Nav, Footer, Icons, Theme toggle).
   Matches the PBDesk 2026 design system; Brain Boost gets a Sunset-Pulse
   accent on its nav item to flag it as the active section. */

const { useState, useEffect } = React;

const Icon = ({ d, size = 20, sw = 1.75, fill = 'none', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);

const I = {
  Sun: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>}/>,
  Moon: (p) => <Icon {...p} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}/>,
  Brain: (p) => <Icon {...p} d={<><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></>}/>,
  Arrow: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>}/>,
  Play: (p) => <Icon {...p} d={<polygon points="6 4 20 12 6 20 6 4"/>} fill="currentColor" sw={0}/>,
  Calendar: (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>}/>,
  Sparkles: (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>}/>,
  Trophy: (p) => <Icon {...p} d={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>}/>,
  Target: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>}/>,
  Layers: (p) => <Icon {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>}/>,
  Clock: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>}/>,
  Flame: (p) => <Icon {...p} d={<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>}/>,
  Puzzle: (p) => <Icon {...p} d={<path d="M9 3a2 2 0 0 1 2 2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V5a2 2 0 1 1 4 0v2a1 1 0 0 0 1 1h2v3a1 1 0 0 1-1 1h-2a2 2 0 1 0 0 4h2a1 1 0 0 1 1 1v3h-3a1 1 0 0 1-1-1v-2a2 2 0 1 0-4 0v2a1 1 0 0 1-1 1h-3v-3a1 1 0 0 0-1-1H5a2 2 0 1 1 0-4h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4V5a2 2 0 0 1 2-2h3z"/>}/>,
  Dice: (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="8" cy="16" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></>}/>,
  Crossword: (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>}/>,
  Wordle: (p) => <Icon {...p} d={<><rect x="3" y="5" width="4.5" height="4.5" rx="0.5"/><rect x="9.75" y="5" width="4.5" height="4.5" rx="0.5"/><rect x="16.5" y="5" width="4.5" height="4.5" rx="0.5"/><rect x="3" y="14.5" width="4.5" height="4.5" rx="0.5"/><rect x="9.75" y="14.5" width="4.5" height="4.5" rx="0.5"/><rect x="16.5" y="14.5" width="4.5" height="4.5" rx="0.5"/></>}/>,
  GitHub: (p) => <Icon {...p} d={<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>}/>,
  LinkedIn: (p) => <Icon {...p} d={<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>}/>,
  X: (p) => <Icon {...p} d={<path d="M18 3h3l-7.5 8.6L22 22h-6.8l-5.3-7-6.1 7H1l8-9.2L1 3h7l4.8 6.4z"/>} fill="currentColor" sw={0}/>,
  Rss: (p) => <Icon {...p} d={<><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></>}/>,
};

function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="bb-icon-btn" onClick={onToggle} aria-label="Toggle theme">
      {dark ? <I.Sun size={16}/> : <I.Moon size={16}/>}
    </button>
  );
}

function Nav({ dark, onToggleDark }) {
  return (
    <header className="bb-nav">
      <div className="bb-wrap bb-nav-inner">
        <a href="#" className="bb-logo">
          <span className="bb-logo-mark">PB</span>
          <span>PBDesk</span>
        </a>
        <nav className="bb-nav-links">
          <a href="#">Home</a>
          <a href="#">Bits</a>
          <a href="#">Bites</a>
          <a href="#">Blog</a>
          <a href="#" className="active">Brain Boost</a>
          <a href="#">About</a>
        </nav>
        <div className="bb-nav-actions">
          <a href="#" className="bb-icon-btn" aria-label="GitHub"><I.GitHub size={16}/></a>
          <a href="#" className="bb-icon-btn" aria-label="LinkedIn"><I.LinkedIn size={16}/></a>
          <a href="#" className="bb-icon-btn" aria-label="X"><I.X size={14}/></a>
          <ThemeToggle dark={dark} onToggle={onToggleDark}/>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bb-footer">
      <div className="bb-wrap">
        <div className="bb-footer-grid">
          <div>
            <a href="#" className="bb-logo" style={{marginBottom: 14}}>
              <span className="bb-logo-mark">PB</span>
              <span>PBDesk</span>
            </a>
            <p style={{margin: '14px 0 0', fontSize: 14, color: 'var(--fg-secondary)', lineHeight: 1.6, maxWidth: 360}}>
              Bits, Bites, Blog &amp; Brain Boost — Developer's Life. Learning Endeavor Forever, from the desk of Pinal Bhatt.
            </p>
            <div style={{display: 'flex', gap: 8, marginTop: 18}}>
              <a href="#" className="bb-icon-btn" aria-label="GitHub"><I.GitHub size={16}/></a>
              <a href="#" className="bb-icon-btn" aria-label="LinkedIn"><I.LinkedIn size={16}/></a>
              <a href="#" className="bb-icon-btn" aria-label="X"><I.X size={14}/></a>
              <a href="#" className="bb-icon-btn" aria-label="RSS"><I.Rss size={16}/></a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="#">Bits</a></li>
              <li><a href="#">Bites</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Brain Boost</a></li>
              <li><a href="#">About Me</a></li>
            </ul>
          </div>
          <div>
            <h4>Brain Boost</h4>
            <ul>
              <li><a href="#">KenKen</a></li>
              <li><a href="#">Daily Puzzle</a></li>
              <li><a href="#">How to play</a></li>
              <li><a href="#">Difficulty levels</a></li>
            </ul>
          </div>
          <div>
            <h4>More</h4>
            <ul>
              <li><a href="#">RSS Feed</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Archive</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="bb-footer-bottom">
          <span>© 2026 PBDesk. Built with Next.js 16 + Tailwind 4.</span>
          <span>Made with <span style={{color: 'var(--bb-rose)'}}>♥</span> by Pinal Bhatt</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { I, Nav, Footer, ThemeToggle });
