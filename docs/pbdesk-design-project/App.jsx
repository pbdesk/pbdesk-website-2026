/* App — host the pillars section with theme + layout tweaks */

const { useEffect } = React;

const ACCENTS = {
  blue:    { b6: '#2563EB', b7: '#1D4ED8', b4: '#60A5FA', a5: '#0EA5E9' },
  violet:  { b6: '#7C3AED', b7: '#6D28D9', b4: '#A78BFA', a5: '#0EA5E9' },
  emerald: { b6: '#059669', b7: '#047857', b4: '#34D399', a5: '#0EA5E9' },
  rose:    { b6: '#E11D48', b7: '#BE123C', b4: '#FB7185', a5: '#F59E0B' },
};

function PageBar({ dark, setKey }) {
  return (
    <div className="page-bar">
      <div className="page-bar-logo">
        <img src={dark ? 'assets/logo-dark.png' : 'assets/logo-light.png'} alt="PBDesk" />
      </div>
      <span className="page-bar-trail">homepage / my-wellness-pillars</span>
      <div className="demo-toggles">
        <button
          className={`demo-toggle ${!dark ? 'active' : ''}`}
          onClick={() => setKey('dark', false)}
        >Light</button>
        <button
          className={`demo-toggle ${dark ? 'active' : ''}`}
          onClick={() => setKey('dark', true)}
        >Dark</button>
      </div>
    </div>
  );
}

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "dark": false,
    "accent": "blue",
    "layout": "orbital"
  }/*EDITMODE-END*/;

  const [tweaks, setKey] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!tweaks.dark);
  }, [tweaks.dark]);

  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.blue;
    const r = document.documentElement.style;
    r.setProperty('--brand-600', a.b6);
    r.setProperty('--brand-700', a.b7);
    r.setProperty('--brand-400', a.b4);
    r.setProperty('--accent-500', a.a5);
  }, [tweaks.accent]);

  return (
    <>
      <PageBar dark={tweaks.dark} setKey={setKey} />
      <main>
        <window.PillarsSection layout={tweaks.layout} />
      </main>
      <TweaksPanel>
        <TweakSection title="Layout">
          <TweakRadio
            value={tweaks.layout}
            onChange={(v) => setKey('layout', v)}
            options={[
              { label: 'Orbital — art left, list right', value: 'orbital' },
              { label: 'Stage — art on top, cards below', value: 'stage' },
              { label: 'Inline — compact stacked',         value: 'inline' },
            ]}
          />
        </TweakSection>
        <TweakSection title="Theme">
          <TweakToggle label="Dark mode" value={tweaks.dark} onChange={(v) => setKey('dark', v)} />
        </TweakSection>
        <TweakSection title="Brand accent">
          <TweakRadio
            value={tweaks.accent}
            onChange={(v) => setKey('accent', v)}
            options={[
              { label: 'Blue (default)', value: 'blue' },
              { label: 'Violet',         value: 'violet' },
              { label: 'Emerald',        value: 'emerald' },
              { label: 'Rose',           value: 'rose' },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
