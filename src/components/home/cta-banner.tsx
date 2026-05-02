"use client";

interface CtaBannerProps {
  description?: string;
  heading?: string;
  placeholder?: string;
  submitLabel?: string;
}

export default function CtaBanner({
  heading = "Stay in touch.",
  description = "One email when something new lands on Bits, Bites, or Blog. No noise, no spam — just signal from my desk to yours.",
  placeholder = "your@email.com",
  submitLabel = "Subscribe",
}: CtaBannerProps = {}) {
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
            {heading}
          </h2>

          <p
            className="mx-auto mb-10 max-w-xl text-base text-indigo-200"
            style={{ lineHeight: 1.7 }}
          >
            {description}
          </p>

          <form
            className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="flex-1 bg-transparent px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              placeholder={placeholder}
              type="email"
            />
            <button
              className="rounded-full bg-[var(--fg-brand)] px-6 py-3 font-semibold text-sm text-white transition-transform hover:-translate-y-0.5"
              type="submit"
            >
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
