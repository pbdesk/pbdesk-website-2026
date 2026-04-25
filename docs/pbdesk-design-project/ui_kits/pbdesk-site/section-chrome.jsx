/* Shared chrome components for section pages: Nav, Footer, PostCard, Tweaks */

const { useState, useEffect } = React;

// ---------- ICONS ----------
const Icon = ({ d, size = 20, sw = 1.75, fill = 'none', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>{d}</svg>
);
const SI = {
  Sun: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>} />,
  Moon: (p) => <Icon {...p} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>} />,
  Arrow: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />,
  GitHub: (p) => <Icon {...p} d={<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>} />,
  LinkedIn: (p) => <Icon {...p} d={<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>} />,
  Twitter: (p) => <Icon {...p} d={<path d="M18 3h3l-7.5 8.6L22 22h-6.8l-5.3-7-6.1 7H1l8-9.2L1 3h7l4.8 6.4z"/>} fill="currentColor" sw={0} />,
  Rss: (p) => <Icon {...p} d={<><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></>} />,
  Search: (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />,
  Clock: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>} />,
  ArrowRight: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />,
  Sparkles: (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>} />,
  Stack: (p) => <Icon {...p} d={<><path d="M12 2 2 7l10 5 10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></>} />,
  Tag: (p) => <Icon {...p} d={<><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>} />,
};

// ---------- NAV ----------
function Nav({ active, dark }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="../../index.html" className="nav-logo">
          <img src={dark ? "../../assets/logo-dark.png?v=5" : "../../assets/logo-light.png?v=5"} alt="PBDesk" />
        </a>
        <nav className="nav-links">
          <a href="../../index.html" className={active === 'home' ? 'active' : ''}>Home</a>
          <a href="bits.html" className={active === 'bits' ? 'active' : ''}>Bits</a>
          <a href="bites.html" className={active === 'bites' ? 'active' : ''}>Bites</a>
          <a href="blog.html" className={active === 'blog' ? 'active' : ''}>Blog</a>
          <a href="../../index.html#about" className={active === 'about' ? 'active' : ''}>About</a>
        </nav>
        <div className="nav-cta">
          <a href="https://github.com/pinalbhatt" className="nav-social" aria-label="GitHub"><SI.GitHub size={18} /></a>
          <a href="https://linkedin.com/in/pinalbhatt" className="nav-social" aria-label="LinkedIn"><SI.LinkedIn size={18} /></a>
          <a href="https://x.com/pbdesk" className="nav-social" aria-label="X (Twitter)"><SI.Twitter size={18} /></a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  return (
    <button className="theme-toggle" aria-label="Toggle theme"
      onClick={() => {
        const d = document.documentElement.classList.toggle('dark');
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { dark: d } }, '*');
      }}>
      <SI.Sun size={18} className="sun" />
      <SI.Moon size={18} className="moon" />
    </button>
  );
}

// ---------- POST CARD ----------
function PostCard({ post }) {
  return (
    <a href="#" className="post-card" onClick={(e) => e.preventDefault()}>
      <div className="post-card-thumb" style={{
        '--thumb-bg': post.thumb.bg,
        '--thumb-label': `"${post.thumb.label}"`,
      }}>
        <span className="post-card-tag">{post.cat}</span>
      </div>
      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="cat">{post.cat}</span>
          {post.labels && post.labels.length > 0 && (
            <>
              <span className="sep">·</span>
              <span className="label">{post.labels.map(l => `#${l}`).join(' ')}</span>
            </>
          )}
        </div>
        <h3>{post.title}</h3>
        <p className="post-card-dek">{post.dek}</p>
        <div className="post-card-foot">
          <span className="post-card-read">Read More <SI.Arrow size={14} /></span>
          <span className="post-card-time"><SI.Clock size={13} /> {post.time}</span>
        </div>
      </div>
    </a>
  );
}

// ---------- FILTER BAR ----------
function FilterBar({ filters, active, onChange, query, setQuery }) {
  return (
    <div className="filter-bar">
      <div className="filter-chips">
        {filters.map(f => (
          <button
            key={f.value}
            className={`filter-chip ${active === f.value ? 'active' : ''}`}
            onClick={() => onChange(f.value)}>
            {f.label}<span className="count">{f.count}</span>
          </button>
        ))}
      </div>
      <div className="filter-search">
        <SI.Search size={16} />
        <input
          type="search"
          placeholder="Search posts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

// ---------- NEWSLETTER ----------
function Newsletter({ section }) {
  return (
    <section className="container" style={{ paddingTop: 64, paddingBottom: 0 }}>
      <div className="newsletter">
        <div className="newsletter-inner">
          <h2>Never miss a {section} drop.</h2>
          <p>Subscribe and I'll send you new posts as they land — Bits, Bites, and Blog. No noise, just signal.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" />
            <button className="btn btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ---------- FOOTER ----------
function Footer({ dark }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="../../index.html" className="nav-logo">
              <img src={dark ? "../../assets/logo-dark.png?v=5" : "../../assets/logo-light.png?v=5"} alt="PBDesk" />
            </a>
            <p>Bits &amp; Bites — Developer's Life. Learning Endeavor Forever, from the desk of Pinal Bhatt.</p>
            <div className="footer-socials" style={{ marginTop: 18 }}>
              <a href="https://github.com/pinalbhatt" className="social"><SI.GitHub /></a>
              <a href="https://linkedin.com/in/pinalbhatt" className="social"><SI.LinkedIn /></a>
              <a href="https://x.com/pbdesk" className="social"><SI.Twitter /></a>
              <a href="#" className="social"><SI.Rss /></a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="bits.html">Bits</a></li>
              <li><a href="bites.html">Bites</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="../../index.html#about">About Me</a></li>
            </ul>
          </div>
          <div>
            <h4>Topics</h4>
            <ul>
              <li><a href="#">AI &amp; ML</a></li>
              <li><a href="#">Web Dev</a></li>
              <li><a href="#">Tools</a></li>
              <li><a href="#">Wellness</a></li>
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
        <div className="footer-bottom">
          <span>© 2026 PBDesk. Built with Next.js 16 + Tailwind 4.</span>
          <span>Made with <span style={{ color: 'var(--brand-600)' }}>♥</span> by Pinal Bhatt</span>
        </div>
      </div>
    </footer>
  );
}

// Expose to globals so other Babel scripts can use them
Object.assign(window, { SI, Nav, Footer, PostCard, FilterBar, Newsletter, ThemeToggle });
