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
    "Long-form essays on software craft, AI, programming habits, and the wellness practices that keep developers building for the long run. Written by Pinal Bhatt.",
  keywords: [
    "developer blog",
    "tech blog",
    "software development blog",
    "AI essays",
    "programming reflections",
    "wellness for developers",
    "Pinal Bhatt blog",
  ],
  path: "/blog",
  title: "Blog — Long-form reflections on code, AI & wellness",
});

const FALLBACK_DESCRIPTION =
  "Welcome to my blog, a space where technology, creativity, and well-being connect. I share insights on software development, programming, AI, and the latest in tech, along with thoughts on health, wellness, fitness, and living a balanced life. From coding tips and emerging tech trends to mindfulness, movement, and personal growth, I explore how small choices shape both our digital and real worlds. I also reflect on the importance of friendships, family, and meaningful connections. Whether you're here for tech insights or life inspiration, I'm excited to share this journey with you. Let's build, grow, and thrive together.";

const fallbackPosts: Post[] = [
  {
    category: "Reflections",
    description:
      "A long-form essay on the surprising overlap between deep work, deep breathing, and shipping software that lasts.",
    featured: true,
    gradient: "post-grad-violet",
    labels: ["Tech", "Wellness"],
    readTime: "8 min read",
    title: "When Code Meets Calm",
  },
  {
    category: "Article",
    description:
      "How to build a software career that compounds — without burning out the body that powers it.",
    gradient: "post-grad-indigo",
    labels: ["Career"],
    readTime: "6 min read",
    title: "Three Pillars of a Sustainable Dev Life",
  },
  {
    category: "Reflections",
    description:
      "On the practice of putting thoughts into the world — and why it makes me a better engineer.",
    gradient: "post-grad-rose",
    labels: ["Writing"],
    readTime: "4 min read",
    title: "Why I Write",
  },
  {
    category: "Tool",
    description:
      "A curated rotation of AI tools that earn their place in my workflow, plus the ones I dropped.",
    gradient: "post-grad-blue",
    labels: ["AI", "Productivity"],
    readTime: "7 min read",
    title: "AI Tools I Actually Use Daily",
  },
  {
    category: "Wellness",
    description:
      "Patience, breath, and beginner's mind — debugging hard problems with a wellness lens.",
    gradient: "post-grad-emerald",
    labels: ["Mindfulness"],
    readTime: "5 min read",
    title: "The Yoga of Debugging",
  },
  {
    category: "Programming",
    description:
      "Tiny daily rituals — naming, testing, journaling — that compound into compound interest for your career.",
    gradient: "post-grad-amber",
    labels: ["Habits"],
    readTime: "6 min read",
    title: "Programming Habits Worth Building",
  },
];

export default async function BlogPage() {
  const data = await loadPillarData("blog", {
    cadence: "weekly",
    description: FALLBACK_DESCRIPTION,
    fallbackPosts,
  });
  const { posts } = data;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      articleSection: post.category,
      author: { "@type": "Person", name: SITE_AUTHOR },
      description: post.description,
      headline: post.title,
      keywords: post.labels?.join(", "),
    })),
    description:
      "Long-form essays on software craft, AI, programming habits, and developer wellness.",
    inLanguage: "en",
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
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
        bannerDarkSrc={data.bannerDarkSrc}
        bannerLightSrc={data.bannerLightSrc}
        description={data.description}
        pillar="blog"
        posts={posts}
        story={data.story}
        title="Blog"
      />
    </>
  );
}
