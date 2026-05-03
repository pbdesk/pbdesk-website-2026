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
  title: "Blog — Long-form reflections on code, AI & wellness",
  description:
    "Long-form essays on software craft, AI, programming habits, and the wellness practices that keep developers building for the long run. Written by Pinal Bhatt.",
  path: "/blog",
  keywords: [
    "developer blog",
    "tech blog",
    "software development blog",
    "AI essays",
    "programming reflections",
    "wellness for developers",
    "Pinal Bhatt blog",
  ],
});

const FALLBACK_DESCRIPTION =
  "Welcome to my blog, a space where technology, creativity, and well-being connect. I share insights on software development, programming, AI, and the latest in tech, along with thoughts on health, wellness, fitness, and living a balanced life. From coding tips and emerging tech trends to mindfulness, movement, and personal growth, I explore how small choices shape both our digital and real worlds. I also reflect on the importance of friendships, family, and meaningful connections. Whether you're here for tech insights or life inspiration, I'm excited to share this journey with you. Let's build, grow, and thrive together.";

const fallbackPosts: Post[] = [
  {
    title: "When Code Meets Calm",
    category: "Reflections",
    labels: ["Tech", "Wellness"],
    description:
      "A long-form essay on the surprising overlap between deep work, deep breathing, and shipping software that lasts.",
    readTime: "8 min read",
    gradient: "post-grad-violet",
    featured: true,
  },
  {
    title: "Three Pillars of a Sustainable Dev Life",
    category: "Article",
    labels: ["Career"],
    description:
      "How to build a software career that compounds — without burning out the body that powers it.",
    readTime: "6 min read",
    gradient: "post-grad-indigo",
  },
  {
    title: "Why I Write",
    category: "Reflections",
    labels: ["Writing"],
    description:
      "On the practice of putting thoughts into the world — and why it makes me a better engineer.",
    readTime: "4 min read",
    gradient: "post-grad-rose",
  },
  {
    title: "AI Tools I Actually Use Daily",
    category: "Tool",
    labels: ["AI", "Productivity"],
    description:
      "A curated rotation of AI tools that earn their place in my workflow, plus the ones I dropped.",
    readTime: "7 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "The Yoga of Debugging",
    category: "Wellness",
    labels: ["Mindfulness"],
    description:
      "Patience, breath, and beginner's mind — debugging hard problems with a wellness lens.",
    readTime: "5 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "Programming Habits Worth Building",
    category: "Programming",
    labels: ["Habits"],
    description:
      "Tiny daily rituals — naming, testing, journaling — that compound into compound interest for your career.",
    readTime: "6 min read",
    gradient: "post-grad-amber",
  },
];

export default async function BlogPage() {
  const data = await loadPillarData("blog", {
    description: FALLBACK_DESCRIPTION,
    cadence: "weekly",
    fallbackPosts,
  });
  const posts = data.posts;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
    description:
      "Long-form essays on software craft, AI, programming habits, and developer wellness.",
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      keywords: post.labels?.join(", "),
      articleSection: post.category,
      author: { "@type": "Person", name: SITE_AUTHOR },
    })),
  };

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(blogJsonLd) }}
        type="application/ld+json"
      />
      <SectionLanding
        accentColor={pillarAccents.blog.primary}
        description={data.description}
        pillar="blog"
        posts={posts}
        title="Blog"
      />
    </>
  );
}
