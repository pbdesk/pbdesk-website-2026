/* Brain Boost — three hub-page variations.
   Each variant is a full-page composition of the /brain-boost landing.
   They share the Nav + Footer chrome but differ in the body treatment. */

/* eslint-disable react/jsx-key */

const BANNER_SRC = 'public/pillers/brain-boost-banner.png';
const KENKEN_SRC = 'public/pillers/kenken-banner.png';

/* ------------------------------------------------------------------
   V1 — Editorial Hub
   Closest to the existing pillar pages (bits/bites/blog). Banner ->
   centered intro -> featured KenKen -> daily strip -> coming soon ->
   benefits. Easy to slot in alongside the other section landings.
   ------------------------------------------------------------------ */
function VariantEditorial() {
  return (
    <main>
      <div className="bb-hero">
        <img src={BANNER_SRC} alt="Brain Boost — puzzles for focus and mental fitness" />
        <div className="bb-hero-fade"/>
      </div>

      <section className="bb-wrap v1-intro">
        <div className="bb-breadcrumb" style={{justifyContent:'center', display:'flex'}}>
          <a href="#">PBDesk</a>
          <span className="sep">/</span>
          <span style={{color:'var(--fg-primary)', fontWeight:600}}>Brain Boost</span>
        </div>
        <h1>My <span className="accent">Brain Boost</span></h1>
        <p>
          A new corner of PBDesk for short, focused puzzles that sharpen the mind
          between Bits and Bites. Twenty minutes of arithmetic logic, one solved
          grid at a time — the kind of quiet focus that resets a working day.
          KenKen is here today; more games are queued.
        </p>
        <div className="v1-meta">
          <span className="v1-meta-item">
            <span className="v1-meta-icon"><I.Layers size={18}/></span>
            <span><strong>1</strong> game live</span>
          </span>
          <span className="v1-meta-item">
            <span className="v1-meta-icon"><I.Target size={18}/></span>
            <span><strong>4</strong> difficulty tiers</span>
          </span>
          <span className="v1-meta-item">
            <span className="v1-meta-icon"><I.Sparkles size={18}/></span>
            <span><strong>~200</strong> hand-checked puzzles</span>
          </span>
          <span className="v1-meta-item">
            <span className="v1-meta-icon"><I.Calendar size={18}/></span>
            <span>New daily, <strong>every day</strong></span>
          </span>
        </div>
      </section>

      <section className="bb-wrap v1-featured">
        <div className="v1-section-head">
          <h2>The <span className="accent">first game</span> is KenKen</h2>
          <a href="#" className="bb-btn bb-btn-ghost">All games <I.Arrow size={14}/></a>
        </div>
        <div className="v1-game-feature">
          <div className="v1-game-feature-cover">
            <span className="new-chip"><span style={{width:6, height:6, borderRadius:'50%', background:'#fff'}}/>Now playing</span>
            <img src={KENKEN_SRC} alt="KenKen puzzle preview"/>
          </div>
          <div className="v1-game-feature-body">
            <span className="cat">Arithmetic · Logic</span>
            <h3>KenKen</h3>
            <p>
              Fill an N×N grid so digits don't repeat in any row or column — the catch:
              outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no
              guessing required, designed in the late 1990s by a Japanese maths teacher
              for his students.
            </p>
            <div className="v1-stats">
              <div><strong>3×3 → 9×9</strong><span>Grid sizes</span></div>
              <div><strong>~10–25 min</strong><span>Typical solve</span></div>
              <div><strong>+ − × ÷</strong><span>Operations</span></div>
            </div>
            <div className="v1-cta-row">
              <a href="#" className="bb-btn bb-btn-primary"><I.Play size={14}/>Play KenKen</a>
              <a href="#" className="bb-btn bb-btn-secondary">How to play</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bb-wrap">
        <div className="v1-daily">
          <div>
            <h3>Today's daily — Intermediate</h3>
            <p>A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.</p>
          </div>
          <div className="actions">
            <a href="#" className="btn-on-grad"><I.Play size={14}/>Play today's</a>
            <a href="#" className="btn-on-grad ghost"><I.Calendar size={14}/>Archive</a>
          </div>
        </div>
      </section>

      <section className="bb-wrap">
        <div className="v1-section-head v1-soon-head">
          <h2><span className="accent">Coming next</span></h2>
          <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
            Vote on what's next →
          </span>
        </div>
        <div className="v1-soon-grid">
          <div className="v1-soon-card">
            <span className="chip">Coming · Q3</span>
            <h4>Sudoku</h4>
            <p>Classic 9×9 with hand-picked difficulty curves and a "no mark-up" expert mode.</p>
            <span className="glyph">SUD</span>
          </div>
          <div className="v1-soon-card">
            <span className="chip">Coming · Q4</span>
            <h4>Cryptic Mini</h4>
            <p>Five-clue cryptic crossword, finishable on a coffee break. Each solution links to its wordplay.</p>
            <span className="glyph">CRY</span>
          </div>
          <div className="v1-soon-card">
            <span className="chip">Exploring</span>
            <h4>Logic Grid</h4>
            <p>Five-by-five attribute deduction puzzles — the kind your physics teacher used to print out.</p>
            <span className="glyph">LOG</span>
          </div>
        </div>
      </section>

      <section className="bb-wrap v1-benefits">
        <div className="v1-section-head">
          <h2>Why <span className="accent">Brain Boost?</span></h2>
        </div>
        <div className="v1-benefits-grid">
          <div className="v1-benefit">
            <div className="v1-benefit-icon"><I.Target size={20}/></div>
            <h4>Single-task focus</h4>
            <p>Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.</p>
          </div>
          <div className="v1-benefit">
            <div className="v1-benefit-icon"><I.Brain size={20}/></div>
            <h4>Working-memory workout</h4>
            <p>Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.</p>
          </div>
          <div className="v1-benefit">
            <div className="v1-benefit-icon"><I.Clock size={20}/></div>
            <h4>Designed to be short</h4>
            <p>Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.</p>
          </div>
          <div className="v1-benefit">
            <div className="v1-benefit-icon"><I.Flame size={20}/></div>
            <h4>Daily ritual, no streak shame</h4>
            <p>A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.</p>
          </div>
        </div>
      </section>

      <Footer/>
    </main>
  );
}

/* ------------------------------------------------------------------
   V2 — Arcade Tile Hub
   Game-library treatment. Smaller hero, larger tile grid, KenKen
   featured prominently with locked "coming soon" tiles around it.
   ------------------------------------------------------------------ */
function VariantArcade() {
  return (
    <main>
      <div className="bb-hero">
        <img src={BANNER_SRC} alt="Brain Boost — focus puzzles for makers and minds"/>
        <div className="bb-hero-fade"/>
      </div>

      <section className="bb-wrap v2-intro">
        <div>
          <span className="bb-eyebrow"><span className="dot"/>Brain Boost · games hub</span>
          <h1>Short games for <span className="accent">long focus.</span></h1>
          <p>
            A tiny arcade tucked between Bits and Bites. Pick a puzzle, lose
            yourself in it for twenty minutes, and walk away sharper than you
            arrived. KenKen is the first game; more are queued.
          </p>
          <div className="v2-intro-actions">
            <a href="#" className="bb-btn bb-btn-primary"><I.Play size={14}/>Play today's puzzle</a>
            <a href="#" className="bb-btn bb-btn-secondary">How Brain Boost works</a>
          </div>
        </div>
        <aside className="v2-counter">
          <div className="v2-counter-row"><span className="label">Games live</span><span className="value">1</span></div>
          <div className="v2-counter-row"><span className="label">Puzzles in rotation</span><span className="value">217</span></div>
          <div className="v2-counter-row"><span className="label">Daily tier</span><span className="value accent">Intermediate</span></div>
          <div className="v2-counter-row" style={{borderTop:'1px solid var(--border-subtle)', paddingTop:18}}>
            <span className="label">Today, 24 May</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:13, color:'var(--bb-orange)'}}>k4-int-00031</span>
          </div>
        </aside>
      </section>

      <section className="bb-wrap">
        <div className="v2-section-bar">
          <h2>The games</h2>
          <span className="meta"><I.Layers size={14}/>· 1 live · 5 in the pipeline</span>
        </div>
        <div className="v2-games">
          {/* Featured — KenKen */}
          <a href="#" className="v2-game v2-game-featured">
            <div className="v2-game-art"><img src={KENKEN_SRC} alt=""/></div>
            <div className="v2-game-body">
              <h3>KenKen <span className="bb-eyebrow" style={{fontSize:10, padding:'4px 8px'}}><span className="dot"/>Live</span></h3>
              <p>Latin square + cages with +, −, ×, ÷ targets. Four difficulty tiers from 3×3 freebies to 9×9 Genius. The thinking-person's Sudoku.</p>
              <div className="v2-game-meta">
                <span><I.Layers size={12}/>4 tiers</span>
                <span><I.Clock size={12}/>10–25 min</span>
                <span><I.Target size={12}/>+ − × ÷</span>
              </div>
            </div>
          </a>

          {/* Daily — tall card on the right */}
          <div className="v2-game v2-game-daily">
            <span className="label"><I.Calendar size={12} style={{verticalAlign:-2}}/>· Daily — today</span>
            <h3>One puzzle. All day.</h3>
            <p>Today's Intermediate KenKen is sticky on this device until tomorrow. Same puzzle every refresh — pick up where you left off.</p>
            <div className="mini-grid" aria-hidden="true">
              <div className="mini-cell"><span className="cage">2−</span></div>
              <div className="mini-cell empty"><span className="cage">2−</span></div>
              <div className="mini-cell empty"><span className="cage">8×</span></div>
              <div className="mini-cell"><span className="cage">7+</span>3</div>
              <div className="mini-cell empty"><span className="cage">5</span></div>
              <div className="mini-cell empty"><span className="cage">8×</span></div>
              <div className="mini-cell empty"><span className="cage">8×</span>2</div>
              <div className="mini-cell empty"><span className="cage">7+</span></div>
              <div className="mini-cell"><span className="cage">24×</span>4</div>
              <div className="mini-cell empty"><span className="cage">4÷</span></div>
              <div className="mini-cell empty"><span className="cage">3</span>3</div>
              <div className="mini-cell empty"><span className="cage">1−</span></div>
              <div className="mini-cell empty"><span className="cage">24×</span></div>
              <div className="mini-cell"><span className="cage">4÷</span>1</div>
              <div className="mini-cell empty"><span className="cage">1−</span></div>
              <div className="mini-cell empty"></div>
            </div>
            <div className="actions">
              <a href="#" className="btn-on-grad"><I.Play size={14}/>Play today's</a>
            </div>
          </div>

          {/* Coming soon tiles */}
          <div className="v2-game v2-game-soon">
            <div className="v2-game-art"><span className="glyph">SUD</span></div>
            <span className="chip">Coming · Q3</span>
            <div className="v2-game-body">
              <h3>Sudoku</h3>
              <p>9×9 classic with a five-tier difficulty curve and an expert "no mark-ups" mode.</p>
              <div className="v2-game-meta">
                <span><I.Layers size={12}/>5 tiers</span>
                <span><I.Clock size={12}/>5–30 min</span>
              </div>
            </div>
          </div>
          <div className="v2-game v2-game-soon">
            <div className="v2-game-art"><span className="glyph">CRY</span></div>
            <span className="chip">Coming · Q4</span>
            <div className="v2-game-body">
              <h3>Cryptic Mini</h3>
              <p>Five-clue cryptic crossword, finishable on a coffee break. Tap a solved clue to see the wordplay.</p>
              <div className="v2-game-meta">
                <span><I.Layers size={12}/>3 tiers</span>
                <span><I.Clock size={12}/>10–15 min</span>
              </div>
            </div>
          </div>
          <div className="v2-game v2-game-soon">
            <div className="v2-game-art"><span className="glyph">LOG</span></div>
            <span className="chip">Exploring</span>
            <div className="v2-game-body">
              <h3>Logic Grid</h3>
              <p>Five-by-five attribute deduction puzzles. The kind your physics teacher used to print and hand out.</p>
              <div className="v2-game-meta">
                <span><I.Layers size={12}/>3 tiers</span>
                <span><I.Clock size={12}/>10–20 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="v2-pulse-bar">
          <div className="v2-pulse-stat"><span className="num">217</span><span className="lbl">hand-checked KenKens in rotation</span></div>
          <div className="v2-pulse-stat"><span className="num">14:38</span><span className="lbl">median solve, Intermediate</span></div>
          <div className="v2-pulse-stat"><span className="num">∞</span><span className="lbl">hints — unlimited, counted only for you</span></div>
          <a href="#" className="bb-btn bb-btn-ghost" style={{marginLeft:'auto'}}>About the puzzles <I.Arrow size={14}/></a>
        </div>
      </section>

      <Footer/>
    </main>
  );
}

/* ------------------------------------------------------------------
   V3 — Daily-First / Minimal
   Daily puzzle is hero. Free-play is secondary. Coming-soon is a quiet
   row. Best for a "daily ritual" reading of Brain Boost.
   ------------------------------------------------------------------ */
function VariantDaily() {
  return (
    <main>
      <div className="bb-hero">
        <img src={BANNER_SRC} alt="Brain Boost — your daily puzzle ritual"/>
        <div className="bb-hero-fade"/>
      </div>

      <section className="bb-wrap v3-intro">
        <span className="bb-eyebrow"><span className="dot"/>Brain Boost · games hub</span>
        <h1>One <span className="accent">small puzzle</span> a day.</h1>
        <p>
          A short, deliberate moment of focus tucked into PBDesk. Solve today's
          KenKen, pause your timer when life happens, come back tomorrow for a
          fresh one. No streaks to defend, no scores to chase.
        </p>
      </section>

      <section className="bb-wrap">
        <div className="v3-today">
          <div className="v3-today-art" aria-hidden="true">
            <div className="v3-today-grid">
              <div className="v3-cell cage-a"><span className="cage">2−</span></div>
              <div className="v3-cell empty cage-a"><span className="cage"></span></div>
              <div className="v3-cell empty cage-b"><span className="cage">8×</span></div>
              <div className="v3-cell cage-b"><span className="cage">7+</span>3</div>
              <div className="v3-cell empty cage-c"><span className="cage">5</span></div>
              <div className="v3-cell empty cage-b"><span className="cage"></span></div>
              <div className="v3-cell empty cage-b">2</div>
              <div className="v3-cell empty cage-d"><span className="cage"></span></div>
              <div className="v3-cell cage-c"><span className="cage">24×</span>4</div>
              <div className="v3-cell empty cage-d"><span className="cage">4÷</span></div>
              <div className="v3-cell empty cage-a"><span className="cage">3</span>3</div>
              <div className="v3-cell empty cage-d"><span className="cage">1−</span></div>
              <div className="v3-cell empty cage-c"><span className="cage"></span></div>
              <div className="v3-cell cage-c"><span className="cage">4÷</span>1</div>
              <div className="v3-cell empty cage-d"><span className="cage"></span></div>
              <div className="v3-cell empty cage-d"><span className="cage"></span></div>
            </div>
          </div>
          <div className="v3-today-body">
            <span className="v3-today-eyebrow"><span className="live-dot"/>Today · 24 May · Intermediate</span>
            <h2>Today's KenKen.</h2>
            <p className="lede">
              A 4×4 with subtraction and multiplication cages. Average solve time
              for this tier is about fifteen minutes, but there is no timer
              chasing you. Take your time.
            </p>
            <div className="v3-today-meta">
              <div><strong>4×4</strong><span>Grid</span></div>
              <div><strong>+ − ×</strong><span>Operations</span></div>
              <div><strong>14m 38s</strong><span>Median solve</span></div>
            </div>
            <div className="v3-today-actions">
              <a href="#" className="bb-btn bb-btn-primary"><I.Play size={14}/>Play today's puzzle</a>
              <a href="#" className="bb-btn bb-btn-secondary"><I.Calendar size={14}/>Archive</a>
              <a href="#" className="bb-btn bb-btn-ghost">How to play</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bb-wrap v3-section">
        <div className="v3-section-head">
          <h3>Or pick your own <span className="accent">level</span></h3>
          <a href="#" className="bb-btn bb-btn-ghost">All KenKens <I.Arrow size={14}/></a>
        </div>
        <div className="v3-freeplay">
          <div className="v3-game-card">
            <div className="v3-game-card-head">
              <div className="v3-game-card-icon"><I.Puzzle size={24}/></div>
              <div>
                <h4>KenKen — free play</h4>
                <p>Live · 217 puzzles</p>
              </div>
            </div>
            <p>Pick a difficulty and we'll serve you a fresh puzzle from that tier — and skip ones you've already been served.</p>
            <div className="v3-levels">
              <div className="v3-level">Easy<span className="sz">3×3</span></div>
              <div className="v3-level active">Intermediate<span className="sz">4×4 · 5×5</span></div>
              <div className="v3-level">Hard<span className="sz">6×6 · 7×7</span></div>
              <div className="v3-level">Genius<span className="sz">8×8 · 9×9</span></div>
            </div>
            <a href="#" className="bb-btn bb-btn-primary"><I.Play size={14}/>Start a new game</a>
          </div>
          <div className="v3-game-card coming">
            <div className="v3-game-card-head">
              <div className="v3-game-card-icon"><I.Sparkles size={22}/></div>
              <div>
                <h4>Up next</h4>
                <p>Coming through 2026</p>
              </div>
            </div>
            <p>More games are queued — vote on what's next, or suggest your own. Brain Boost is built as a small library, one puzzle at a time.</p>
            <div className="v3-coming-list">
              <div><span className="name">Sudoku</span><span className="when">Q3 2026</span></div>
              <div><span className="name">Cryptic Mini</span><span className="when">Q4 2026</span></div>
              <div><span className="name">Logic Grid</span><span className="when">Exploring</span></div>
              <div><span className="name">Tangram</span><span className="when">Exploring</span></div>
            </div>
          </div>
        </div>

        <div className="v3-how">
          <div className="v3-how-step">
            <span className="n">01 / Show up</span>
            <h5>Open Brain Boost</h5>
            <p>One link in the nav. The daily puzzle is always front and centre.</p>
          </div>
          <div className="v3-how-step">
            <span className="n">02 / Solve</span>
            <h5>Twenty minutes of focus</h5>
            <p>Pencil marks, hints, undo, pause. Quality-of-life tools so you can think, not fight the UI.</p>
          </div>
          <div className="v3-how-step">
            <span className="n">03 / Pause anytime</span>
            <h5>Life happens</h5>
            <p>Tab loses focus, timer pauses. Refresh and it's exactly where you left it.</p>
          </div>
          <div className="v3-how-step">
            <span className="n">04 / Come back</span>
            <h5>A fresh one tomorrow</h5>
            <p>New daily puzzle every day. No streaks, no shame, no shake-finger.</p>
          </div>
        </div>
      </section>

      <Footer/>
    </main>
  );
}

Object.assign(window, { VariantEditorial, VariantArcade, VariantDaily });
