import type { Metadata } from "next";
import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";
import {
  jsonLdString,
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { loadPillarData } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  description:
    "Curated bits on AI agents, developer tools, browsers, VS Code extensions, and the frameworks shaping modern web development. Notes from Pinal Bhatt's desk.",
  keywords: [
    "AI tools",
    "developer tools",
    "VS Code extensions",
    "AI agents",
    "vibe coding",
    "Tailwind CSS",
    "modern web development",
    "PBDesk Bits",
  ],
  path: "/bits",
  title: "Bits — AI tools, dev tools & web tech worth knowing",
});

const FALLBACK_DESCRIPTION =
  "Welcome to my digital corner, where I share insights on the ever-evolving world of AI, programming, and software development. From the latest advancements in generative AI to cutting-edge developer tools and web design trends, I explore how technology shapes our digital future. Whether it's dissecting new frameworks, discussing ethical AI, or sharing productivity hacks for coders, I aim to bridge knowledge gaps and spark curiosity. Join me as I navigate the fast-paced tech landscape one thought, tutorial, and trend at a time. Let's build, learn, and innovate together.";

const fallbackPosts: Post[] = [
  {
    category: "Tool",
    description:
      "Arc is a stunningly modern browser — fast, creative, and built to supercharge your productivity.",
    featured: true,
    gradient: "post-grad-indigo",
    labels: ["Browser"],
    readTime: "4 min read",
    title: "Arc Browser",
  },
  {
    category: "Tool",
    description:
      "Blazing fast, ultra-secure, and powered by AI — Microsoft Edge redefines the modern web.",
    gradient: "post-grad-blue",
    labels: ["Browser"],
    readTime: "5 min read",
    title: "Microsoft Edge",
  },
  {
    category: "AI",
    description:
      "Chronological overview of the significant releases and breakthroughs that shaped ChatGPT.",
    gradient: "post-grad-emerald",
    labels: ["AIAgent"],
    readTime: "6 min read",
    title: "OpenAI ChatGPT: Key Milestones",
  },
  {
    category: "Tool",
    description:
      "The developer's swissknife. Do conversions and generations right out of VS Code.",
    gradient: "post-grad-red",
    labels: ["VSCode", "Extension"],
    readTime: "3 min read",
    title: "VS Code Extension: Swissknife",
  },
  {
    category: "AI",
    description:
      "Unleash next-gen coding power with Bolt.new — your AI-infused, vibe-rich coding companion!",
    gradient: "post-grad-blue",
    labels: ["AIAgent", "VibeCoding"],
    readTime: "5 min read",
    title: "Build with bolt.new AI Agent",
  },
  {
    category: "AI",
    description: "Lovable is your superhuman full stack engineer.",
    gradient: "post-grad-rose",
    labels: ["WebApp", "VibeCoding"],
    readTime: "4 min read",
    title: "Great for AI vibe coding — lovable.dev",
  },
  {
    category: "Tutorial",
    description:
      "A game for learning CSS flexbox. Fun and engaging way to master Flexbox.",
    gradient: "post-grad-emerald",
    labels: ["CSS", "Frontend"],
    readTime: "6 min read",
    title: "Flexbox Froggy",
  },
  {
    category: "Util",
    description:
      "Peacock colors VS Code workspaces to help identify and distinguish them quickly and beautifully.",
    gradient: "post-grad-blue",
    labels: ["Extension", "VSCode"],
    readTime: "3 min read",
    title: "Peacock VS Code Extension",
  },
  {
    category: "Framework",
    description:
      "Effortless styling, responsive, utility-first — Tailwind CSS turns your HTML into design.",
    gradient: "post-grad-rose",
    labels: ["CSS", "Tailwind"],
    readTime: "5 min read",
    title: "Tailwind CSS",
  },
];

export default async function BitsPage() {
  const data = await loadPillarData("bits", {
    cadence: "weekly",
    description: FALLBACK_DESCRIPTION,
    fallbackPosts,
  });
  const { posts } = data;

  const bitsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
    description:
      "Curated notes on AI tools, developer tools, and modern web tech — from PBDesk.",
    hasPart: posts.map((post) => ({
      "@type": "CreativeWork",
      description: post.description,
      genre: post.category,
      keywords: post.labels?.join(", "),
      name: post.title,
    })),
    inLanguage: "en",
    name: `${SITE_NAME} Bits`,
    url: `${SITE_URL}/bits`,
  };

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(bitsJsonLd) }}
        type="application/ld+json"
      />
      <SectionLanding
        accentColor={pillarAccents.bits.primary}
        bannerDarkSrc={data.bannerDarkSrc}
        bannerLightSrc={data.bannerLightSrc}
        description={data.description}
        pillar="bits"
        posts={posts}
        story={data.story}
        title="Bits"
      />
    </>
  );
}
