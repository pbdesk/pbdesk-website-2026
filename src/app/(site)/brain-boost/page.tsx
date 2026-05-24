// src/app/(site)/brain-boost/page.tsx
import type { Metadata } from "next";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { Button } from "@/components/ui/button";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Brain Boost — puzzles & brain games — ${SITE_NAME}`,
  description:
    "Brain Boost is the PBDesk games corner. First up: KenKen, an arithmetic logic puzzle. More games coming soon.",
  path: "/brain-boost",
});

export default function BrainBoostPage() {
  return (
    <main>
      <section
        className="relative overflow-hidden py-24 sm:py-28"
        style={{ background: BRAIN_BOOST_ACCENT.gradient }}
      >
        <div className="wrapper relative z-10 text-center text-white">
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm text-white"
            style={{ background: "rgb(255 255 255 / 0.18)" }}
          >
            Brain Boost
          </span>
          <h1
            className="mt-6 mb-4 font-bold"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              letterSpacing: "-0.03em",
            }}
          >
            Brain Boost
          </h1>
          <p
            className="mx-auto mb-8 max-w-xl text-lg"
            style={{ lineHeight: 1.6 }}
          >
            A corner for puzzles and brain games. First up: KenKen. More to
            come.
          </p>
          <Button href="/brain-boost/kenken">Explore KenKen</Button>
        </div>
      </section>
    </main>
  );
}
