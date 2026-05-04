import { randomUUID } from "node:crypto";
import { buildStoryContent as buildDisclaimerContent } from "../update-disclaimer";
import { buildStoryContent as buildPrivacyPolicyContent } from "../update-privacy-policy";
import type { SbStoryContent } from "./storyblok-management";

// Helpers --------------------------------------------------------------------

function uid(): string {
  return randomUUID();
}

interface RichtextDoc {
  content: RichtextNode[];
  type: "doc";
}

interface RichtextNode {
  attrs?: Record<string, unknown>;
  content?: RichtextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  type: string;
}

function paragraph(text: string): RichtextNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function richtext(...paragraphs: string[]): RichtextDoc {
  return { type: "doc", content: paragraphs.map(paragraph) };
}

function blok<T extends Record<string, unknown>>(
  component: string,
  fields: T
): SbStoryContent {
  return { _uid: uid(), component, ...fields };
}

// Brand assets are uploaded as part of the seed; the script swaps the
// returned signed URLs into these placeholders before publishing.
function placeholderAsset(filename: string): {
  filename: string;
  alt: string;
  // Mark with a sentinel so the orchestrator knows to swap in the real asset
  __placeholder: string;
} {
  return {
    filename: "",
    alt: filename,
    __placeholder: filename,
  };
}

// Socials are reused on home, about, and global config
const socialLinks = [
  blok("social_link", {
    label: "GitHub",
    href: { url: "https://github.com/pinalbhatt", linktype: "url" },
    icon: "github",
  }),
  blok("social_link", {
    label: "LinkedIn",
    href: { url: "https://www.linkedin.com/in/pinalbhatt", linktype: "url" },
    icon: "linkedin",
  }),
  blok("social_link", {
    label: "X",
    href: { url: "https://x.com/pbdesk", linktype: "url" },
    icon: "x",
  }),
];

// ============================================================================
// Home page
// ============================================================================

const heroBlok = blok("hero", {
  eyebrow: "Bits & Bites — Developer's Life",
  headline: richtext("Learnig endeavor forever..."),
  subheadline: richtext("...from the desk of Pinal Bhatt"),
  cta_label: "About Me",
  cta_href: { url: "/about", linktype: "url" },
  show_social: true,
});

const pillarsBlok = blok("pillars", {
  eyebrow: "What I write about",
  heading: "Three lanes, one desk.",
  cards: [
    blok("pillar_card", {
      name: "Bits",
      title: "Bits — the tech side",
      description:
        "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
      cta_label: "Visit My Bits",
      href: { url: "/bits", linktype: "url" },
      gradient_class: "pillar-bits-gradient",
      avatar: placeholderAsset("bits-avatar.svg"),
    }),
    blok("pillar_card", {
      name: "Bites",
      title: "Bites — the wellness side",
      description:
        "A healthy, active life is the greatest gift we can give ourselves and our loved ones. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
      cta_label: "Visit My Bites",
      href: { url: "/bites", linktype: "url" },
      gradient_class: "pillar-bites-gradient",
      avatar: placeholderAsset("bites-avatar.svg"),
    }),
    blok("pillar_card", {
      name: "Blog",
      title: "Blog — where they meet",
      description:
        "Reflections on balancing tech life with physical and mental wellness, plus friendships, family, meaningful connections and emotions.",
      cta_label: "Visit My Blog",
      href: { url: "/blog", linktype: "url" },
      gradient_class: "pillar-blog-gradient",
      avatar: placeholderAsset("blog-avatar.svg"),
    }),
  ],
});

const aboutSectionBlok = blok("about_section", {
  eyebrow: "About me",
  headline: "Welcome to my desk!",
  bio: richtext(
    "Hello! I'm Pinal Bhatt — I'm Human & I'm Software Engineer, and I love writing code! Though enjoying adrenaline rush from the new AI realm. Yes, I'm always on the learning ramp.",
    "When I'm not at the desk, I'm probably stretching, reading, or arguing with my family about who gets the couch and what to watch on TV.",
    "This site is a space where I share insights, tutorials, articles, and resources on topics such as AI, programming, microservices, cloud computing, serverless architectures, & other technologies and topics like JavaScript, Node.js, TypeScript, Vue, Angular, React, Astro, Postgres, Mongo, Kafka and many more.",
    "You'll also find a few personal reflections, tips on healthy living — because I believe good health fuels great work — and the occasional offbeat thought. After all, health is wealth!"
  ),
  portrait: placeholderAsset("pb1.jpg"),
  chip_label: "Pinal",
  show_social: true,
});

const myRealmBlok = blok("my_realm", {
  eyebrow: "My realm",
  headline: richtext("Health, family, wellness, and technology."),
  subheading:
    "The four threads I weave through everything I write. Never one without the others.",
  realms: [
    blok("realm_card", {
      title: "Nutrition",
      description:
        "Whole, natural, unprocessed foods rich in essential nutrients, vitamins, and minerals — fuel for immunity and repair.",
    }),
    blok("realm_card", {
      title: "Movement",
      description:
        "Regular movement — walking, yoga, strength — to improve circulation, boost endorphins, and keep body and mind sharp.",
    }),
    blok("realm_card", {
      title: "Sleep & Recovery",
      description:
        "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
    }),
    blok("realm_card", {
      title: "Mindfulness",
      description:
        "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.",
    }),
  ],
  features: [
    blok("feature_card", {
      title: "Short-form Bits",
      description:
        "Quick takes you can read in the time it takes `npm install` to finish.",
      icon: "bolt",
    }),
    blok("feature_card", {
      title: "Wellness for devs",
      description:
        "Small habits that protect your energy — for the long code review marathon.",
      icon: "heart",
    }),
    blok("feature_card", {
      title: "Longer essays",
      description:
        "When a thought needs more than a tweet — full posts on the things I keep returning to.",
      icon: "pencil",
    }),
  ],
  tags: [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "React",
    "Astro",
    "Next.js",
    "AI",
    "OpenAI",
    "Postgres",
    "MongoDB",
  ],
});

const myWellnessThreadsBlok = blok("my_wellness_threads", {
  eyebrow: "My Wellness Threads",
  headline: richtext("for happy & healthy life."),
  subheading: "Four threads I keep weaving through everyday life.",
  threads: [
    blok("wellness_thread_item", {
      key: "nutrition",
      index: "01",
      title: "Cellular Nutrition",
      short_label: "Nutrition",
      body: "Whole, natural, unprocessed foods rich in vitamins and minerals — fuel for immunity and repair.",
      icon: "apple",
      color: "#10B981",
      angle: -135,
    }),
    blok("wellness_thread_item", {
      key: "exercise",
      index: "02",
      title: "Adequate Exercise",
      short_label: "Exercise",
      body: "Regular movement — walking, yoga, strength — to boost endorphins and keep body and mind sharp.",
      icon: "run",
      color: "#F59E0B",
      angle: -45,
    }),
    blok("wellness_thread_item", {
      key: "sleep",
      index: "03",
      title: "Quality Sleep",
      short_label: "Sleep",
      body: "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
      icon: "moon",
      color: "#0EA5E9",
      angle: 135,
    }),
    blok("wellness_thread_item", {
      key: "emotion",
      index: "04",
      title: "Emotional Wellness",
      short_label: "Emotion",
      body: "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, emotional detox.",
      icon: "heart",
      color: "#E11D48",
      angle: 45,
    }),
  ],
});

const myPillersBlok = blok("my_pillers", {
  eyebrow: "My Pillers",
  heading: "Three threads, one desk.",
  pillars: [
    blok("piller_orbit_item", {
      key: "bits",
      index: "01",
      label: "Bits",
      title: "Bits — the tech side",
      body: "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
      cta_label: "Visit My Bits",
      href: { url: "/bits", linktype: "url" },
      color: "#4F46E5",
      angle: -90,
    }),
    blok("piller_orbit_item", {
      key: "bites",
      index: "02",
      label: "Bites",
      title: "Bites — the wellness side",
      body: "A healthy, active life is the greatest gift we can give ourselves. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
      cta_label: "Visit My Bites",
      href: { url: "/bites", linktype: "url" },
      color: "#10B981",
      angle: 30,
    }),
    blok("piller_orbit_item", {
      key: "blog",
      index: "03",
      label: "Blog",
      title: "Blog — where they meet",
      body: "Longer-form reflections on balancing tech life with physical wellness, plus friendships, family, and meaningful connections.",
      cta_label: "Visit My Blog",
      href: { url: "/blog", linktype: "url" },
      color: "#7C3AED",
      angle: 150,
    }),
  ],
});

const ctaBannerBlok = blok("cta_banner", {
  heading: "Stay in touch.",
  description:
    "One email when something new lands on Bits, Bites, or Blog. No noise, no spam — just signal from my desk to yours.",
  placeholder: "your@email.com",
  submit_label: "Subscribe",
  submit_action: { url: "", linktype: "url" },
});

export const homeContent: SbStoryContent = {
  component: "home_page",
  title: "PBDesk — Bits, Bites & Blog by Pinal Bhatt",
  description:
    "From the desk of Pinal Bhatt — a space where code meets wellness. Explore Bits (dev & AI), Bites (fitness & mindfulness), and the Blog (long-form reflections).",
  body: [
    heroBlok,
    pillarsBlok,
    aboutSectionBlok,
    myRealmBlok,
    myWellnessThreadsBlok,
    myPillersBlok,
    ctaBannerBlok,
  ],
};

// ============================================================================
// About page
// ============================================================================

export const aboutContent: SbStoryContent = {
  component: "about_page",
  title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
  headline:
    "Hi, I'm Pinal Bhatt. Engineer by craft, learner by habit, human by nature.",
  intro_chip_label: "About — the human behind the desk",
  bio: richtext(
    "I love coding and enjoy creating great software solutions through the power of code. I genuinely enjoy the entire process of creating software, from brainstorming ideas to writing clean code and debugging until everything runs just right. Whether I'm diving into backend, frontend, middleware, or experimenting with any new tech, I find a lot of joy in figuring things out and making things better.",
    "One of the areas that really excites me is artificial intelligence. I love exploring how AI is changing the way we live and work, and I'm always curious to see how I can apply it in the projects I build. I'm also always on the lookout for new tools, trends, and tech that challenge me to grow and think differently. For me, learning is an ongoing journey — and that's one of the best parts of being in tech.",
    "But as much as I love coding, I don't believe life should be all about work. I'm a big believer in balance. Health and wellness are super important to me. I make time for physical and mental well-being, whether it's through regular exercise, mindfulness, or simply slowing down when needed. Staying healthy helps me stay sharp and present — both in my work and in life. Spending quality time with family and friends is something I truly value. At the end of the day, it's the people around us that bring the most meaning to our lives. I try to stay grounded, enjoy the little moments, and never take anything for granted. Work is important, but so is life — and I believe in showing up fully for both."
  ),
  portrait: placeholderAsset("pb1.jpg"),
  body: [aboutSectionBlok, myPillersBlok, myWellnessThreadsBlok],
  seo_title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
  seo_description:
    "Get to know the human behind PBDesk. Pinal Bhatt is a software engineer exploring AI, web development, and the daily wellness habits that fuel sustainable craft.",
};

// ============================================================================
// Disclaimer page
// ============================================================================
// Long-form content (hero + 18 sections) lives in scripts/update-disclaimer.ts
// so a focused `bun run update:disclaimer` and the full `bun run seed:storyblok`
// produce identical output. Edit the canonical copy there.

export const disclaimerContent: SbStoryContent = buildDisclaimerContent();

// ============================================================================
// Privacy Policy page
// ============================================================================
// Long-form content (hero + Privacy Policy + Cookie Notice) lives in
// scripts/update-privacy-policy.ts so a focused `bun run update:privacy-policy`
// and the full `bun run seed:storyblok` produce identical output. Edit the
// canonical copy there.

export const privacyPolicyContent: SbStoryContent = buildPrivacyPolicyContent();

// ============================================================================
// Landing pages
// ============================================================================

export const bitsLandingContent: SbStoryContent = {
  component: "landing_page",
  title: "Bits",
  pillar: "bits",
  description:
    "Welcome to my digital corner, where I share insights on the ever-evolving world of AI, programming, and software development. From the latest advancements in generative AI to cutting-edge developer tools and web design trends, I explore how technology shapes our digital future. Whether it's dissecting new frameworks, discussing ethical AI, or sharing productivity hacks for coders, I aim to bridge knowledge gaps and spark curiosity. Join me as I navigate the fast-paced tech landscape one thought, tutorial, and trend at a time. Let's build, learn, and innovate together.",
  cadence: "weekly",
  accent_primary: "#4f46e5",
  accent_secondary: "#0ea5e9",
  filters: [],
  body: [],
  seo_title: "Bits — AI tools, dev tools & web tech worth knowing",
  seo_description:
    "Curated bits on AI agents, developer tools, browsers, VS Code extensions, and the frameworks shaping modern web development. Notes from Pinal Bhatt's desk.",
};

export const bitesLandingContent: SbStoryContent = {
  component: "landing_page",
  title: "Bites",
  pillar: "bites",
  description:
    "Bites are the wellness pillar — small daily choices that compound into vitality. Movement, nutrition, sleep, and mindfulness — practical notes from a developer trying to stay sharp for the long run. No gurus, no fads, just things that have worked.",
  cadence: "weekly",
  accent_primary: "#10b981",
  accent_secondary: "#3b82f6",
  filters: [],
  body: [],
  seo_title: "Bites — wellness, fitness & mindfulness for developers",
  seo_description:
    "A developer's wellness notebook: movement, nutrition, sleep, and mindfulness. Small habits that protect your energy for the long haul.",
};

export const blogLandingContent: SbStoryContent = {
  component: "landing_page",
  title: "Blog",
  pillar: "blog",
  description:
    "Long-form reflections where Bits and Bites meet. Posts on building software while staying human — the friction of growth, the rituals that compound, and the stories worth re-reading. Writing here is slower and more personal.",
  cadence: "monthly",
  accent_primary: "#7c3aed",
  accent_secondary: "#10b981",
  filters: [],
  body: [],
  seo_title: "Blog — long-form reflections from PBDesk",
  seo_description:
    "Reflections on code, craft, and wellness from Pinal Bhatt. Where technology meets a thoughtful, healthy life.",
};

// ============================================================================
// Global config (header nav, footer, social, brand)
// ============================================================================

function navItem(
  label: string,
  href: string,
  targetBlank = false
): SbStoryContent {
  return blok("nav_item", {
    label,
    href: { url: href, linktype: "url" },
    target_blank: targetBlank,
  });
}

export const globalConfigContent: SbStoryContent = {
  component: "global_config",
  brand_tagline: "from the desk of Pinal Bhatt",
  footer_about:
    "PBDesk is the personal site of Pinal Bhatt — a space where code meets wellness. Notes on AI, dev tools, fitness, mindfulness, and the long-form reflections that connect them.",
  nav_items: [
    navItem("Home", "/"),
    navItem("Bits", "/bits"),
    navItem("Bites", "/bites"),
    navItem("Blog", "/blog"),
    navItem("About", "/about"),
  ],
  footer_explore: [
    navItem("Bits", "/bits"),
    navItem("Bites", "/bites"),
    navItem("Blog", "/blog"),
    navItem("About Me", "/about"),
  ],
  footer_topics: [
    navItem("All Bits", "/bits/all"),
    navItem("All Bites", "/bites/all"),
    navItem("All Blog Posts", "/blog/all"),
    navItem("Categories", "/categories"),
    navItem("Labels", "/labels"),
  ],
  footer_more: [
    navItem("Disclaimer", "/disclaimer"),
    navItem("Privacy Policy", "/privacy-policy"),
  ],
  social_links: socialLinks,
  cta_default: [ctaBannerBlok],
};

// ============================================================================
// Brand assets to upload
// ============================================================================

export const brandAssets: { localPath: string; placeholderKey: string }[] = [
  { localPath: "public/pb/pb1.jpg", placeholderKey: "pb1.jpg" },
  {
    localPath: "public/pillers/bits-avatar.svg",
    placeholderKey: "bits-avatar.svg",
  },
  {
    localPath: "public/pillers/bites-avatar.svg",
    placeholderKey: "bites-avatar.svg",
  },
  {
    localPath: "public/pillers/blog-avatar.svg",
    placeholderKey: "blog-avatar.svg",
  },
];

// ============================================================================
// Asset placeholder swap helper
// ============================================================================

interface PlaceholderAsset {
  __placeholder: string;
  alt: string;
  filename: string;
}

function isPlaceholder(value: unknown): value is PlaceholderAsset {
  return (
    typeof value === "object" &&
    value !== null &&
    "__placeholder" in value &&
    typeof (value as PlaceholderAsset).__placeholder === "string"
  );
}

export function swapAssetPlaceholders(
  content: SbStoryContent,
  assets: Map<string, { filename: string; id: number }>
): SbStoryContent {
  function walk(node: unknown): unknown {
    if (Array.isArray(node)) {
      return node.map(walk);
    }
    if (isPlaceholder(node)) {
      const real = assets.get(node.__placeholder);
      if (real) {
        return {
          filename: real.filename,
          alt: node.alt,
          id: real.id,
        };
      }
      return { filename: "", alt: node.alt };
    }
    if (typeof node === "object" && node !== null) {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        node as Record<string, unknown>
      )) {
        out[key] = walk(value);
      }
      return out;
    }
    return node;
  }
  return walk(content) as SbStoryContent;
}
