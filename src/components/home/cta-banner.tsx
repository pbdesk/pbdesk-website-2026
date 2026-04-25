"use client";

export default function CtaBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="wrapper">
        <div className="newsletter-gradient relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-[var(--shadow-xl)] sm:px-12 sm:py-20">
          <h2
            className="mb-5 font-bold text-white"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            Stay in touch.
          </h2>

          <p
            className="mx-auto mb-10 max-w-xl text-base text-indigo-200"
            style={{ lineHeight: 1.7 }}
          >
            One email when something new lands on Bits, Bites, or Blog. No
            noise, no spam — just signal from my desk to yours.
          </p>

          <form
            className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="flex-1 bg-transparent px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              placeholder="your@email.com"
              type="email"
            />
            <button
              className="rounded-full bg-[var(--fg-brand)] px-6 py-3 font-semibold text-sm text-white transition-transform hover:-translate-y-0.5"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
