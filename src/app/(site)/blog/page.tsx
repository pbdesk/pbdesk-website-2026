import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";

const posts: Post[] = [
  {
    title: "When Code Meets Calm",
    category: "Reflections",
    tags: ["Tech", "Wellness"],
    description:
      "A long-form essay on the surprising overlap between deep work, deep breathing, and shipping software that lasts.",
    readTime: "8 min read",
    gradient: "post-grad-violet",
    featured: true,
  },
  {
    title: "Three Pillars of a Sustainable Dev Life",
    category: "Article",
    tags: ["Career"],
    description:
      "How to build a software career that compounds — without burning out the body that powers it.",
    readTime: "6 min read",
    gradient: "post-grad-indigo",
  },
  {
    title: "Why I Write",
    category: "Reflections",
    tags: ["Writing"],
    description:
      "On the practice of putting thoughts into the world — and why it makes me a better engineer.",
    readTime: "4 min read",
    gradient: "post-grad-rose",
  },
  {
    title: "AI Tools I Actually Use Daily",
    category: "Tool",
    tags: ["AI", "Productivity"],
    description:
      "A curated rotation of AI tools that earn their place in my workflow, plus the ones I dropped.",
    readTime: "7 min read",
    gradient: "post-grad-blue",
  },
  {
    title: "The Yoga of Debugging",
    category: "Wellness",
    tags: ["Mindfulness"],
    description:
      "Patience, breath, and beginner's mind — debugging hard problems with a wellness lens.",
    readTime: "5 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "Programming Habits Worth Building",
    category: "Programming",
    tags: ["Habits"],
    description:
      "Tiny daily rituals — naming, testing, journaling — that compound into compound interest for your career.",
    readTime: "6 min read",
    gradient: "post-grad-amber",
  },
];

export default function BlogPage() {
  return (
    <SectionLanding
      accentColor={pillarAccents.blog.primary}
      cadence="weekly"
      description="Welcome to my blog, a space where technology, creativity, and well-being connect. I share insights on software development, programming, AI, and the latest in tech, along with thoughts on health, wellness, fitness, and living a balanced life. From coding tips and emerging tech trends to mindfulness, movement, and personal growth, I explore how small choices shape both our digital and real worlds. I also reflect on the importance of friendships, family, and meaningful connections. Whether you're here for tech insights or life inspiration, I'm excited to share this journey with you. Let's build, grow, and thrive together."
      filters={[
        { label: "Reflections", count: 2 },
        { label: "Article", count: 1 },
        { label: "Tool", count: 1 },
        { label: "Wellness", count: 1 },
        { label: "Programming", count: 1 },
      ]}
      pillar="blog"
      posts={posts}
      title="Blog"
    />
  );
}
