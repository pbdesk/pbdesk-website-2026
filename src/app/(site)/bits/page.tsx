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
  title: "Bits — AI tools, dev tools & web tech worth knowing",
  description:
    "Curated bits on AI agents, developer tools, browsers, VS Code extensions, and the frameworks shaping modern web development. Notes from Pinal Bhatt's desk.",
  path: "/bits",
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
});

const FALLBACK_DESCRIPTION =
  "Welcome to my digital corner, where I share insights on the ever-evolving world of AI, programming, and software development. From the latest advancements in generative AI to cutting-edge developer tools and web design trends, I explore how technology shapes our digital future. Whether it's dissecting new frameworks, discussing ethical AI, or sharing productivity hacks for coders, I aim to bridge knowledge gaps and spark curiosity. Join me as I navigate the fast-paced tech landscape one thought, tutorial, and trend at a time. Let's build, learn, and innovate together.";

const fallbackPosts: Post[] = [
  {
    title: "Arc Browser",
    category: "Tool",
    labels: ["Browser"],
    description:
      "Arc is a stunningly modern browser — fast, creative, and built to supercharge your productivity.",
    readTime: "4 min read",
    gradient: "post-grad-indigo",
    featured: true,
  },
  {
    title: "Microsoft Edge",
    category: "Tool",
    labels: ["Browser"],
    description:
      "Blazing fast, ultra-secure, and powered by AI — Microsoft Edge redefines the modern web.",
    readTime: "5 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "OpenAI ChatGPT: Key Milestones",
    category: "AI",
    labels: ["AIAgent"],
    description:
      "Chronological overview of the significant releases and breakthroughs that shaped ChatGPT.",
    readTime: "6 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "VS Code Extension: Swissknife",
    category: "Tool",
    labels: ["VSCode", "Extension"],
    description:
      "The developer's swissknife. Do conversions and generations right out of VS Code.",
    readTime: "3 min read",
    gradient: "post-grad-red",
  },
  {
    title: "Build with bolt.new AI Agent",
    category: "AI",
    labels: ["AIAgent", "VibeCoding"],
    description:
      "Unleash next-gen coding power with Bolt.new — your AI-infused, vibe-rich coding companion!",
    readTime: "5 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "Great for AI vibe coding — lovable.dev",
    category: "AI",
    labels: ["WebApp", "VibeCoding"],
    description: "Lovable is your superhuman full stack engineer.",
    readTime: "4 min read",
    gradient: "post-grad-rose",
  },
  {
    title: "Flexbox Froggy",
    category: "Tutorial",
    labels: ["CSS", "Frontend"],
    description:
      "A game for learning CSS flexbox. Fun and engaging way to master Flexbox.",
    readTime: "6 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "Peacock VS Code Extension",
    category: "Util",
    labels: ["Extension", "VSCode"],
    description:
      "Peacock colors VS Code workspaces to help identify and distinguish them quickly and beautifully.",
    readTime: "3 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "Tailwind CSS",
    category: "Framework",
    labels: ["CSS", "Tailwind"],
    description:
      "Effortless styling, responsive, utility-first — Tailwind CSS turns your HTML into design.",
    readTime: "5 min read",
    gradient: "post-grad-rose",
  },
];

export default async function BitsPage() {
  const data = await loadPillarData("bits", {
    description: FALLBACK_DESCRIPTION,
    cadence: "weekly",
    fallbackPosts,
  });
  const posts = data.posts;

  const bitsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Bits`,
    url: `${SITE_URL}/bits`,
    description:
      "Curated notes on AI tools, developer tools, and modern web tech — from PBDesk.",
    inLanguage: "en",
    author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
    hasPart: posts.map((post) => ({
      "@type": "CreativeWork",
      name: post.title,
      description: post.description,
      keywords: post.labels?.join(", "),
      genre: post.category,
    })),
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
        description={data.description}
        pillar="bits"
        posts={posts}
        story={data.story}
        title="Bits"
      />
    </>
  );
}
