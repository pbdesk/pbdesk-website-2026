// src/app/(site)/brain-boost/kenken/daily/page.tsx
import type { Metadata } from "next";
import KenKenGame from "@/components/games/kenken/kenken-game";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  description:
    "A fresh Intermediate KenKen puzzle each day. Solve today's daily KenKen — free, no sign-up.",
  path: "/brain-boost/kenken/daily",
  title: `Daily KenKen — ${SITE_NAME}`,
});

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  applicationCategory: "Game",
  genre: "Logic puzzle",
  name: "Daily KenKen",
  url: `${SITE_URL}/brain-boost/kenken/daily`,
};

export default function KenKenDailyPage() {
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
            { label: "Daily" },
          ]}
        />
      </div>
      <KenKenGame mode="daily" />
    </main>
  );
}
