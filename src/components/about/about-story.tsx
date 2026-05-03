import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

interface AboutStoryProps {
  eyebrow?: ReactNode;
  heading?: ReactNode;
  leftParagraphs?: ReactNode[];
  quoteAttribution?: ReactNode;
  quoteHref?: string;
  quoteText?: ReactNode;
  rightParagraphs?: ReactNode[];
}

const DEFAULT_LEFT: ReactNode[] = [
  "I love coding and enjoy creating great software solutions through the power of code. I genuinely enjoy the entire process of creating software, from brainstorming ideas to writing clean code and debugging until everything runs just right. Whether I'm diving into backend, frontend, middleware, or experimenting with any new tech, I find a lot of joy in figuring things out and making things better.",
  "One of the areas that really excites me is artificial intelligence. I love exploring how AI is changing the way we live and work, and I'm always curious to see how I can apply it in the projects I build. I'm also always on the lookout for new tools, trends, and tech that challenge me to grow and think differently. For me, learning is an ongoing journey — and that's one of the best parts of being in tech.",
];

const DEFAULT_RIGHT: ReactNode[] = [
  "But as much as I love coding, I don't believe life should be all about work. I'm a big believer in balance. Health and wellness are super important to me. I make time for physical and mental well-being, whether it's through regular exercise, mindfulness, or simply slowing down when needed. Staying healthy helps me stay sharp and present — both in my work and in life. Spending quality time with family and friends is something I truly value. At the end of the day, it's the people around us that bring the most meaning to our lives. I try to stay grounded, enjoy the little moments, and never take anything for granted. Work is important, but so is life — and I believe in showing up fully for both.",
];

function Column({ paragraphs }: { paragraphs: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-6">
      {paragraphs.map((node, index) => (
        <p
          className="text-[var(--fg-secondary)] text-base"
          // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is the identity here
          key={index}
          style={{ lineHeight: 1.8 }}
        >
          {node}
        </p>
      ))}
    </div>
  );
}

export default function AboutStory({
  eyebrow = "My story",
  heading = "Code, curiosity, and a healthy dose of balance.",
  leftParagraphs = DEFAULT_LEFT,
  rightParagraphs = DEFAULT_RIGHT,
  quoteText = "The best gift you can give your loved ones is by existing in good health!",
  quoteHref = "https://www.linkedin.com/pulse/best-gift-you-can-give-your-loved-ones-existing-good-health-bhatt-nkvde",
  quoteAttribution = "— That's why I say",
}: AboutStoryProps = {}) {
  const quoteBody = quoteHref ? (
    <a
      className="text-[var(--fg-brand)] underline decoration-[var(--fg-brand)]/30 underline-offset-4 transition-colors hover:decoration-[var(--fg-brand)]"
      href={quoteHref}
      rel="noopener"
      target="_blank"
    >
      {quoteText}
    </a>
  ) : (
    quoteText
  );

  return (
    <section className="bg-[var(--bg-subtle)] py-20 sm:py-24">
      <div className="wrapper">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Eyebrow className="mb-3 block">{eyebrow}</Eyebrow>
          <h2
            className="font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            {heading}
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
          <Column paragraphs={leftParagraphs} />
          <Column paragraphs={rightParagraphs} />
        </div>

        {quoteText ? (
          <figure className="mx-auto mt-14 max-w-3xl">
            <blockquote className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-8 py-10 text-center shadow-[var(--shadow-lg)] sm:px-12">
              <span
                aria-hidden="true"
                className="absolute -top-4 left-8 font-serif text-6xl text-[var(--fg-brand)] leading-none"
              >
                &ldquo;
              </span>
              <p
                className="font-semibold text-[var(--fg-primary)]"
                style={{
                  fontSize: "clamp(20px, 2.4vw, 28px)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.015em",
                  textWrap: "balance",
                }}
              >
                {quoteBody}
              </p>
              {quoteAttribution ? (
                <figcaption className="mt-5 font-mono font-semibold text-[11px] text-[var(--fg-muted)] uppercase tracking-widest">
                  {quoteAttribution}
                </figcaption>
              ) : null}
            </blockquote>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
