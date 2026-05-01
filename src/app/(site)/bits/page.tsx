import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";

const posts: Post[] = [
  {
    title: "Arc Browser",
    category: "Tool",
    tags: ["Browser"],
    description:
      "Arc is a stunningly modern browser — fast, creative, and built to supercharge your productivity.",
    readTime: "4 min read",
    gradient: "post-grad-indigo",
    featured: true,
  },
  {
    title: "Microsoft Edge",
    category: "Tool",
    tags: ["Browser"],
    description:
      "Blazing fast, ultra-secure, and powered by AI — Microsoft Edge redefines the modern web.",
    readTime: "5 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "OpenAI ChatGPT: Key Milestones",
    category: "AI",
    tags: ["AIAgent"],
    description:
      "Chronological overview of the significant releases and breakthroughs that shaped ChatGPT.",
    readTime: "6 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "VS Code Extension: Swissknife",
    category: "Tool",
    tags: ["VSCode", "Extension"],
    description:
      "The developer's swissknife. Do conversions and generations right out of VS Code.",
    readTime: "3 min read",
    gradient: "post-grad-red",
  },
  {
    title: "Build with bolt.new AI Agent",
    category: "AI",
    tags: ["AIAgent", "VibeCoding"],
    description:
      "Unleash next-gen coding power with Bolt.new — your AI-infused, vibe-rich coding companion!",
    readTime: "5 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "Great for AI vibe coding — lovable.dev",
    category: "AI",
    tags: ["WebApp", "VibeCoding"],
    description: "Lovable is your superhuman full stack engineer.",
    readTime: "4 min read",
    gradient: "post-grad-rose",
  },
  {
    title: "Flexbox Froggy",
    category: "Tutorial",
    tags: ["CSS", "Frontend"],
    description:
      "A game for learning CSS flexbox. Fun and engaging way to master Flexbox.",
    readTime: "6 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "Peacock VS Code Extension",
    category: "Util",
    tags: ["Extension", "VSCode"],
    description:
      "Peacock colors VS Code workspaces to help identify and distinguish them quickly and beautifully.",
    readTime: "3 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "Tailwind CSS",
    category: "Framework",
    tags: ["CSS", "Tailwind"],
    description:
      "Effortless styling, responsive, utility-first — Tailwind CSS turns your HTML into design.",
    readTime: "5 min read",
    gradient: "post-grad-rose",
  },
];

export default function BitsPage() {
  return (
    <SectionLanding
      accentColor={pillarAccents.bits.primary}
      cadence="weekly"
      description="Welcome to my digital corner, where I share insights on the ever-evolving world of AI, programming, and software development. From the latest advancements in generative AI to cutting-edge developer tools and web design trends, I explore how technology shapes our digital future. Whether it's dissecting new frameworks, discussing ethical AI, or sharing productivity hacks for coders — let's build, learn, and innovate together."
      filters={[
        { label: "Tool", count: 4 },
        { label: "AI", count: 3 },
        { label: "Tutorial", count: 1 },
        { label: "Util", count: 1 },
        { label: "Framework", count: 1 },
      ]}
      pillar="bits"
      posts={posts}
      title="Bits"
    />
  );
}
