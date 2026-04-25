/* PBDesk homepage — composed from UI kit components.
   Keep component boundaries clean; Tweaks toggle theme + accent. */

const { useState, useEffect } = React;

// ---------- ICONS (lucide-style inline SVGs, currentColor strokes) ----------
const Icon = ({ d, size = 20, sw = 1.75, fill = 'none', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>{d}</svg>
);
const I = {
  Sparkles: (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>} />,
  PenTool: (p) => <Icon {...p} d={<><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></>} />,
  Bot: (p) => <Icon {...p} d={<><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></>} />,
  Bulb: (p) => <Icon {...p} d={<><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></>} />,
  Heart: (p) => <Icon {...p} d={<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>} />,
  Zap: (p) => <Icon {...p} d={<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>} />,
  Moon: (p) => <Icon {...p} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>} />,
  Sun: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>} />,
  Arrow: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />,
  UpRight: (p) => <Icon {...p} d={<><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>} />,
  Play: (p) => <Icon {...p} d={<path d="m6 3 14 9-14 9z"/>} fill="currentColor" sw={0} />,
  GitHub: (p) => <Icon {...p} d={<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>} />,
  LinkedIn: (p) => <Icon {...p} d={<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>} />,
  Twitter: (p) => <Icon {...p} d={<path d="M18 3h3l-7.5 8.6L22 22h-6.8l-5.3-7-6.1 7H1l8-9.2L1 3h7l4.8 6.4z"/>} fill="currentColor" sw={0} />,
  Rss: (p) => <Icon {...p} d={<><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></>} />,
  Code: (p) => <Icon {...p} d={<><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></>} />,
  Apple: (p) => <Icon {...p} d={<><path d="M12 20.94c1.5 0 2.75-.67 3.58-1.94"/><path d="M12 3c-1.5 0-3.5 1.5-3.5 3.5 0 1 .5 2 1.5 2.5M12 7c.5-1 1.5-2 3-2 2 0 3.5 1.5 3.5 4s-1 4-2 5.5c-1 1.5-2 3-3 3-1 0-1.5-.5-3-.5s-2 .5-3 .5c-1 0-2-1.5-3-3-1-1.5-2-3-2-5.5 0-3 2-4.5 3.5-4.5 1.5 0 2.5 1 3 2"/></>} />,
  Edit: (p) => <Icon {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>} />,
  BookOpen: (p) => <Icon {...p} d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>} />,
  Leaf: (p) => <Icon {...p} d={<><path d="M11 20A7 7 0 0 1 4 13c0-7 9-11 17-11 0 8-4 17-11 17a7 7 0 0 1-6-3"/><path d="M2 22c2-7 8-10 13-10"/></>} />,
};

// ---------- NAV ----------
function Nav({ tweaks }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo">
          <img src={tweaks.dark ? "../../assets/logo-dark.png?v=5" : "../../assets/logo-light.png?v=5"} alt="PBDesk" />
        </a>
        <nav className="nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#bits">Bits</a>
          <a href="#bites">Bites</a>
          <a href="#blog">Blog</a>
          <a href="#about">About</a>
        </nav>
        <div className="nav-cta">
          <a href="https://github.com/pinalbhatt" className="nav-social" aria-label="GitHub"><I.GitHub size={18} /></a>
          <a href="https://linkedin.com/in/pinalbhatt" className="nav-social" aria-label="LinkedIn"><I.LinkedIn size={18} /></a>
          <a href="https://x.com/pbdesk" className="nav-social" aria-label="X (Twitter)"><I.Twitter size={18} /></a>
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
      <I.Sun size={18} className="sun" />
      <I.Moon size={18} className="moon" />
    </button>
  );
}

// ---------- HERO ----------
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-shapes">
        <div className="hero-shape s1" />
        <div className="hero-shape s2" />
      </div>
      <div className="container hero-inner">
        <span className="hero-eyebrow">
          <span className="dot" /> Bits &amp; Bites — Developer's Life
        </span>
        <h1>
          Learning Endeavor <span className="accent">Forever</span><br />
          from my desk to yours.
        </h1>
        <p className="hero-lede">
          Hi, I'm <strong style={{color:'var(--fg-primary)'}}>Pinal Bhatt</strong> — software engineer, AI tinkerer,
          and wellness enthusiast. I write about code, tools, and the small habits that keep
          us building for the long run.
        </p>
        <div className="hero-ctas">
          <a href="#bits" className="btn btn-lg btn-primary">Explore the Blog <I.Arrow size={16} /></a>
          <span className="play">
            <span className="play-ico"><I.Play size={14} /></span>
            Watch Intro
          </span>
        </div>
        <div className="hero-socials">
          <a href="https://github.com/pinalbhatt" className="hero-social" aria-label="GitHub"><I.GitHub size={20} /></a>
          <a href="https://linkedin.com/in/pinalbhatt" className="hero-social" aria-label="LinkedIn"><I.LinkedIn size={20} /></a>
          <a href="https://x.com/pbdesk" className="hero-social" aria-label="X (Twitter)"><I.Twitter size={20} /></a>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-visual-chrome">
        <span className="tl" /><span className="tl" /><span className="tl" />
        <span style={{marginLeft:14, fontSize:12, color:'var(--fg-muted)', fontFamily:'var(--font-mono)'}}>
          pbdesk.com — bits &amp; bites
        </span>
      </div>
      <div className="hero-visual-body">
        <aside className="hv-sidebar">
          <div className="group-label">Sections</div>
          <div className="hv-item active"><I.Code size={16} /> Bits</div>
          <div className="hv-item"><I.Leaf size={16} /> Bites</div>
          <div className="hv-item"><I.BookOpen size={16} /> Blog</div>
          <div className="hv-item"><I.Edit size={16} /> About</div>
          <div className="group-label" style={{marginTop:12}}>Topics</div>
          <div className="hv-item"><I.Sparkles size={16} /> AI</div>
          <div className="hv-item"><I.Zap size={16} /> Tools</div>
          <div className="hv-item"><I.Heart size={16} /> Wellness</div>
        </aside>
        <main className="hv-main">
          <div className="hv-pill-row">
            <span className="hv-pill active">Featured</span>
            <span className="hv-pill">AI</span>
            <span className="hv-pill">Tools</span>
            <span className="hv-pill">Wellness</span>
          </div>
          <div className="hv-card">
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:28,height:28,borderRadius:8,background:'color-mix(in srgb, var(--brand-600) 15%, transparent)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--brand-600)'}}>
                <I.Bot size={16} />
              </div>
              <div className="hv-title">Which AI model to use with Copilot?</div>
            </div>
            <div className="hv-skel w-80" />
            <div className="hv-skel w-60" />
            <div className="hv-meta">Bits / AI · 4 min read</div>
          </div>
          <div className="hv-row">
            <div className="hv-card">
              <div className="hv-title" style={{fontSize:14}}>Arc Browser</div>
              <div className="hv-skel w-80" />
              <div className="hv-bar"><div className="hv-bar-fill" style={{width:'74%'}}/></div>
            </div>
            <div className="hv-card">
              <div className="hv-title" style={{fontSize:14}}>Wellness Pillars</div>
              <div className="hv-skel w-60" />
              <div className="hv-bar"><div className="hv-bar-fill" style={{width:'48%', background:'linear-gradient(90deg,#10B981,#0EA5E9)'}}/></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------- BRANDS ----------
function Brands() {
  const stack = ['Next.js', 'React', 'TypeScript', 'Node', 'Astro', 'Vercel', 'OpenAI'];
  return (
    <section className="container">
      <div className="brands">
        <div className="brands-label">Built with the tools I write about</div>
        <div className="brands-grid">
          {stack.map(s => <div key={s} className="brand-logo">{s}</div>)}
        </div>
      </div>
    </section>
  );
}

// ---------- LANES ----------
function Lanes() {
  const lanes = [
    { id:'bits', tag:'Bits', icon:<I.Code />, title:'Bits — the tech side',
      body:"Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
      cls:'bits' },
    { id:'bites', tag:'Bites', icon:<I.Leaf />, title:'Bites — the wellness side',
      body:"A healthy, active life is the greatest gift we can give ourselves. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
      cls:'bites' },
    { id:'blog', tag:'Blog', icon:<I.BookOpen />, title:'Blog — where they meet',
      body:"Longer-form reflections on balancing tech life with physical wellness, plus friendships, family, and meaningful connections.",
      cls:'blog' },
  ];
  return (
    <section className="section container" id="bits">
      <div className="section-header">
        <span className="eyebrow">What I write about</span>
        <h2>Three lanes, one desk.</h2>
        <p>Bits for the craft. Bites for the body. Blog for everything in between.</p>
      </div>
      <div className="lanes">
        {lanes.map(l => (
          <a href={`#${l.id}`} key={l.id} className="lane">
            <div className={`lane-thumb ${l.cls}`}>
              <span className="lane-thumb-tag">{l.tag}</span>
              <div className="lane-thumb-icon">{l.icon}</div>
            </div>
            <div className="lane-body">
              <h3>{l.title}</h3>
              <p>{l.body}</p>
              <span className="lane-link">Visit My {l.tag} <I.Arrow size={14} /></span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ---------- FEATURES (Core capabilities) ----------
function Features() {
  const feats = [
    { icon:<I.Sparkles />, title:'AI, demystified', body:'Plain-language walkthroughs of the tools reshaping how we build.' },
    { icon:<I.Bulb />,     title:'Ideas worth keeping', body:'Tips, patterns, and tricks I keep coming back to in my own work.' },
    { icon:<I.Bot />,      title:'Honest tool reviews', body:'What actually sticks in my workflow — and what quietly gets uninstalled.' },
    { icon:<I.Zap />,      title:'Short-form Bits', body:'Quick takes you can read in the time it takes `npm install` to finish.' },
    { icon:<I.Heart />,    title:'Wellness for devs', body:'Small habits that protect your energy — for the long code review marathon.' },
    { icon:<I.PenTool />,  title:'Longer essays', body:'When a thought needs more than a tweet — full posts on the things I keep returning to.' },
  ];
  return (
    <section className="section" style={{background:'var(--bg-subtle)'}}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">My Realm</span>
          <h2>Health, family, wellness, and technology.</h2>
          <p>The four threads I weave through everything I write. Never one without the others.</p>
        </div>
        <div className="features-grid">
          {feats.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- MARQUEE ----------
function Marquee() {
  const items = ['JavaScript','TypeScript','Node.js','React','Astro','Next.js','AI','OpenAI','Postgres','MongoDB','Kafka','Wellness','Gardening','Family','VS Code','Slack','Beach','Mindfulness'];
  const row = [...items, ...items];
  return (
    <section className="container">
      <div className="marquee">
        <div className="marquee-track">
          {row.map((x, i) => (
            <span key={i} className="chip"><span className="chip-dot" />{x}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- ABOUT ----------
function About() {
  return (
    <section className="section container" id="about">
      <div className="about">
        <div className="about-copy">
          <span className="eyebrow">About Me</span>
          <h2>Welcome to my desk.</h2>
          <p>
            Hello! I'm <strong>Pinal Bhatt</strong> — a human first, and a software engineer who
            genuinely loves writing code. Lately I'm enjoying the adrenaline rush from the new AI
            realm. Yes, I'm always on the learning ramp.
          </p>
          <p>
            This site is where I share insights, tutorials, articles, and resources on AI,
            programming, microservices, cloud, serverless — and the JavaScript, TypeScript,
            React, Node, Astro, Postgres, Mongo, and Kafka that I reach for daily.
          </p>
          <p>
            You'll also find personal reflections and tips on healthy living — because I believe
            good health fuels great work. After all, <strong>health is wealth!</strong>
          </p>
          <div className="about-socials">
            <a href="https://github.com/pinalbhatt" className="social" aria-label="GitHub"><I.GitHub /></a>
            <a href="https://linkedin.com/in/pinalbhatt" className="social" aria-label="LinkedIn"><I.LinkedIn /></a>
            <a href="https://x.com/pbdesk" className="social" aria-label="Twitter"><I.Twitter /></a>
            <a href="/rss.xml" className="social" aria-label="RSS"><I.Rss /></a>
          </div>
        </div>
        <div className="about-visual">
          <div className="about-portrait">
            <img className="about-portrait-img" src="../../assets/pb-portrait.jpg?v=2" alt="Pinal Bhatt" />
            <div className="floating-chip fc-1">
              <span className="fc-icon"><I.Code size={14} /></span>
              <span>Writing code</span>
            </div>
            <div className="floating-chip fc-2">
              <span className="fc-icon"><I.Heart size={14} /></span>
              <span>Staying well</span>
            </div>
            <div className="floating-chip fc-3">
              <span className="fc-icon"><I.Sparkles size={14} /></span>
              <span>Learning AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- PILLARS ----------
function Pillars() {
  const items = [
    { n:'01', title:'Cellular Nutrition', body:'Whole, natural, unprocessed foods rich in essential nutrients, vitamins, and minerals — fuel for immunity and repair.' },
    { n:'02', title:'Adequate Exercise', body:'Regular movement — walking, yoga, strength — to improve circulation, boost endorphins, and keep body and mind sharp.' },
    { n:'03', title:'Quality Sleep', body:'Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.' },
    { n:'04', title:'Emotional Wellness', body:'Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.' },
  ];
  return (
    <section className="section container">
      <div className="section-header">
        <span className="eyebrow">My Wellness Pillars</span>
        <h2>Basic pillars for a happy &amp; healthy life.</h2>
        <p>Inspired by the wellness gurus I follow — Saurabh Bothra and Luke Coutinho.</p>
      </div>
      <div className="pillars">
        {items.map(p => (
          <div key={p.n} className="pillar">
            <div className="pillar-num">{p.n}</div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- FEATURED POSTS ----------
function Featured() {
  const [tab, setTab] = useState('Bits');
  const data = {
    Bits: [
      { cat:'Tool', date:'Apr 18, 2025', title:'Arc Browser', dek:'Arc is a stunningly modern browser — fast, creative, and built to supercharge your productivity.', thumb:{bg:'linear-gradient(135deg,#0F172A,#1E3A8A)', label:'Arc Browser'} },
      { cat:'AI',   date:'Apr 10, 2025', title:'Which AI model to use with GitHub Copilot?', dek:'Ever wondered which AI model is the best fit for your project? Here are some things to consider.', thumb:{bg:'linear-gradient(135deg,#312E81,#7C3AED)', label:'Copilot Models'} },
      { cat:'AI',   date:'Apr 03, 2025', title:'Firebase Studio', dek:'Accelerate development lifecycle with AI agents. Build fullstack & mobile apps all in one place.', thumb:{bg:'linear-gradient(135deg,#B45309,#F59E0B)', label:'Firebase Studio'} },
    ],
    Bites: [
      { cat:'Wellness', date:'Mar 29, 2025', title:'My Wellness Guru — Luke Coutinho', dek:'Indian wellness expert, author, and entrepreneur known for holistic healing, nutrition, and lifestyle coaching.', thumb:{bg:'linear-gradient(135deg,#065F46,#10B981)', label:'Luke Coutinho'} },
      { cat:'Health',   date:'Mar 22, 2025', title:'My Wellness Guru — Saurabh Bothra', dek:'Founder of Habuild.in — a habit-building yoga trainer transforming lives through daily practice.', thumb:{bg:'linear-gradient(135deg,#7C2D12,#EA580C)', label:'Saurabh Bothra'} },
      { cat:'Wellness', date:'Mar 15, 2025', title:'Cellular Nutrition 101', dek:'Why nourishing the body at the cellular level is the quiet superpower behind lasting energy.', thumb:{bg:'linear-gradient(135deg,#14532D,#65A30D)', label:'Nutrition 101'} },
    ],
    Blog: [
      { cat:'Wellness', date:'Mar 10, 2025', title:'My Wellness Gurus', dek:'Two wellness gurus whom I follow — Saurabh Bothra and Luke Coutinho. What they taught me.', thumb:{bg:'linear-gradient(135deg,#581C87,#D946EF)', label:'Wellness Gurus'} },
      { cat:'Article',  date:'Feb 28, 2025', title:'The best gift you can give your loved ones…', dek:'…is by existing in good health. Live fully, stay strong, and inspire others with your energy.', thumb:{bg:'linear-gradient(135deg,#9F1239,#F43F5E)', label:'Good Health'} },
      { cat:'Tool',     date:'Feb 14, 2025', title:'VS Code Extensions I Use', dek:'Extensions that enhance functionality, language support, and tools for better development.', thumb:{bg:'linear-gradient(135deg,#0C4A6E,#0EA5E9)', label:'VS Code'} },
    ],
  };
  const posts = data[tab];
  return (
    <section className="section" style={{background:'var(--bg-subtle)'}}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Featured</span>
          <h2>Fresh from the desk.</h2>
          <p>Recently published across Bits, Bites, and Blog.</p>
        </div>
        <div className="tabs-wrap">
          <div className="tabs" role="tablist">
            {['Bits','Bites','Blog'].map(t => (
              <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="posts">
          {posts.map((p, i) => (
            <article key={i} className="post">
              <div className="post-thumb" style={{'--thumb-bg': p.thumb.bg, '--thumb-label': `"${p.thumb.label}"`}} />
              <div className="post-body">
                <div className="post-meta">
                  <span className="cat">{p.cat}</span>
                  <span className="sep">·</span>
                  <span>{p.date}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.dek}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- NEWSLETTER ----------
function Newsletter() {
  return (
    <section className="container" id="newsletter" style={{paddingTop:96, paddingBottom:0}}>
      <div className="newsletter">
        <div className="newsletter-inner">
          <h2>Stay in touch.</h2>
          <p>One email when something new lands on Bits, Bites, or Blog. No noise, no spam — just signal from my desk to yours.</p>
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
function Footer({ tweaks }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <img src={tweaks.dark ? "../../assets/logo-dark.png?v=5" : "../../assets/logo-light.png?v=5"} alt="PBDesk" />
            </a>
            <p>Bits &amp; Bites — Developer's Life. Learning Endeavor Forever, from the desk of Pinal Bhatt.</p>
            <div className="footer-socials" style={{marginTop:18}}>
              <a href="https://github.com/pinalbhatt" className="social"><I.GitHub /></a>
              <a href="https://linkedin.com/in/pinalbhatt" className="social"><I.LinkedIn /></a>
              <a href="https://x.com/pbdesk" className="social"><I.Twitter /></a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="#bits">Bits</a></li>
              <li><a href="#bites">Bites</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#about">About Me</a></li>
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
          <span>Made with <span style={{color:'var(--brand-600)'}}>♥</span> by Pinal Bhatt</span>
        </div>
      </div>
    </footer>
  );
}

// ---------- TWEAKS ----------
function Tweaks({ tweaks, setKey }) {
  return (
    <TweaksPanel>
      <TweakSection title="Theme">
        <TweakToggle label="Dark mode" value={tweaks.dark} onChange={v => setKey('dark', v)} />
      </TweakSection>
      <TweakSection title="Brand accent">
        <TweakRadio value={tweaks.accent} onChange={v => setKey('accent', v)}
          options={[
            { label: 'Violet (default)', value: 'violet' },
            { label: 'Indigo',           value: 'indigo' },
            { label: 'Emerald',          value: 'emerald' },
            { label: 'Rose',             value: 'rose' },
          ]}/>
      </TweakSection>
      <TweakSection title="Hero">
        <TweakToggle label="Show decorative blobs" value={tweaks.blobs} onChange={v => setKey('blobs', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

const ACCENTS = {
  violet:  { b6:'#2563EB', b7:'#1D4ED8', b4:'#60A5FA', a5:'#0EA5E9' },
  indigo:  { b6:'#4F46E5', b7:'#4338CA', b4:'#818CF8', a5:'#06B6D4' },
  emerald: { b6:'#059669', b7:'#047857', b4:'#34D399', a5:'#0EA5E9' },
  rose:    { b6:'#E11D48', b7:'#BE123C', b4:'#FB7185', a5:'#F59E0B' },
};

// ---------- APP ----------
function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "dark": false,
    "accent": "violet",
    "blobs": true
  }/*EDITMODE-END*/;
  const [tweaks, setKey] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!tweaks.dark);
  }, [tweaks.dark]);

  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.violet;
    const r = document.documentElement.style;
    r.setProperty('--brand-600', a.b6);
    r.setProperty('--brand-700', a.b7);
    r.setProperty('--brand-400', a.b4);
    r.setProperty('--accent-500', a.a5);
  }, [tweaks.accent]);

  useEffect(() => {
    document.documentElement.style.setProperty('--hero-shape-display', tweaks.blobs ? 'block' : 'none');
  }, [tweaks.blobs]);

  return (
    <>
      <style>{`.hero-shape { display: var(--hero-shape-display, block); }`}</style>
      <Nav tweaks={tweaks} />
      <main>
        <Hero />
        <Brands />
        <Lanes />
        <Features />
        <Marquee />
        <About />
        <Pillars />
        <Featured />
        <Newsletter />
      </main>
      <Footer tweaks={tweaks} />
      <Tweaks tweaks={tweaks} setKey={setKey} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
