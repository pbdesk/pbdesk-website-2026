// src/app/(site)/brain-boost/kenken/play/page.tsx
import type { Metadata } from "next";
import KenKenGame from "@/components/games/kenken/kenken-game";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Play KenKen — ${SITE_NAME}`,
  description:
    "Play KenKen online — pick a difficulty and solve uniquely-generated arithmetic logic puzzles. Free, no sign-up.",
  path: "/brain-boost/kenken/play",
});

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "KenKen",
  url: `${SITE_URL}/brain-boost/kenken/play`,
  genre: "Logic puzzle",
  applicationCategory: "Game",
};

export default async function KenKenPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ puzzle?: string }>;
}) {
  const { puzzle } = await searchParams;
  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD payload
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
        type="application/ld+json"
      />
      <div className="wrapper pt-6">
        <Breadcrumb
          align="start"
          items={[
            { href: "/brain-boost", label: "Brain Boost" },
            { href: "/brain-boost/kenken", label: "KenKen" },
            { label: "Play" },
          ]}
        />
      </div>
      <KenKenGame initialPuzzleId={puzzle} mode="play" />
    </main>
  );
}
