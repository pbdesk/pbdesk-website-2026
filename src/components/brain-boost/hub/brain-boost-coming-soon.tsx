import { BRAIN_BOOST_GAMES, STATUS_LABEL } from "./games-registry";

export default function BrainBoostComingSoon() {
  const coming = BRAIN_BOOST_GAMES.filter((g) => g.status !== "live");
  return (
    <section className="wrapper py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2
          className="font-extrabold"
          style={{
            fontSize: "clamp(28px, 3.4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          <span className="bb-gradient-text">Coming next</span>
        </h2>
        {/* TODO voting route — Phase 2+ */}
        <span
          className="font-mono text-xs uppercase tracking-[0.08em]"
          style={{ color: "var(--fg-muted)" }}
        >
          Vote on what's next →
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {coming.map((game) => (
          <article
            className="flex min-h-[220px] flex-col gap-[14px] rounded-2xl p-7"
            key={game.slug}
            style={{
              background: "var(--bg-subtle)",
              border: "1px dashed var(--border-strong)",
            }}
          >
            <span
              className="inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg-secondary)",
              }}
            >
              {STATUS_LABEL[game.status]}
            </span>
            <h3 className="font-bold" style={{ fontSize: 20, lineHeight: 1.2 }}>
              {game.name}
            </h3>
            <p
              className="text-[13px]"
              style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
            >
              {game.description}
            </p>
            {game.glyph ? (
              <span
                aria-hidden="true"
                className="bb-gradient-text mt-auto font-bold font-mono text-[36px]"
                style={{ opacity: 0.7 }}
              >
                {game.glyph}
              </span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
