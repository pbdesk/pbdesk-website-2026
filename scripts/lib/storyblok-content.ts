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
    content: [{ text, type: "text" }],
    type: "paragraph",
  };
}

function richtext(...paragraphs: string[]): RichtextDoc {
  return { content: paragraphs.map(paragraph), type: "doc" };
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
    __placeholder: filename,
    alt: filename,
    filename: "",
  };
}

// Socials are reused on home, about, and global config
const socialLinks = [
  blok("social_link", {
    href: { linktype: "url", url: "https://github.com/pinalbhatt" },
    icon: "github",
    label: "GitHub",
  }),
  blok("social_link", {
    href: { linktype: "url", url: "https://www.linkedin.com/in/pinalbhatt" },
    icon: "linkedin",
    label: "LinkedIn",
  }),
  blok("social_link", {
    href: { linktype: "url", url: "https://x.com/pbdesk" },
    icon: "x",
    label: "X",
  }),
];

// ============================================================================
// Home page
// ============================================================================

const heroBlok = blok("hero", {
  cta_href: { linktype: "url", url: "#pillars" },
  cta_label: "Explore PBDesk",
  eyebrow: "Learning endeavor forever...",
  headline: richtext("PBDesk"),
  kicker: "From the desk of Pinal Bhatt",
  secondary_cta_href: { linktype: "url", url: "/about" },
  secondary_cta_label: "About Pinal",
  show_pillar_links: true,
  show_social: true,
  subheadline: richtext(
    "A personal space where code, AI, wellness, and mindful living meet."
  ),
});

const pillarsBlok = blok("pillars", {
  cards: [
    blok("pillar_card", {
      avatar: placeholderAsset("bits-avatar.svg"),
      cta_label: "Visit My Bits",
      description:
        "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
      gradient_class: "pillar-bits-gradient",
      href: { linktype: "url", url: "/bits" },
      name: "Bits",
      title: "Bits — the tech side",
    }),
    blok("pillar_card", {
      avatar: placeholderAsset("bites-avatar.svg"),
      cta_label: "Visit My Bites",
      description:
        "A healthy, active life is the greatest gift we can give ourselves and our loved ones. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
      gradient_class: "pillar-bites-gradient",
      href: { linktype: "url", url: "/bites" },
      name: "Bites",
      title: "Bites — the wellness side",
    }),
    blok("pillar_card", {
      avatar: placeholderAsset("blog-avatar.svg"),
      cta_label: "Visit My Blog",
      description:
        "Reflections on balancing tech life with physical and mental wellness, plus friendships, family, meaningful connections and emotions.",
      gradient_class: "pillar-blog-gradient",
      href: { linktype: "url", url: "/blog" },
      name: "Blog",
      title: "Blog — where they meet",
    }),
  ],
  eyebrow: "What I write about",
  heading: "Three lanes, one desk.",
});

const aboutSectionBlok = blok("about_section", {
  bio: richtext(
    "Hello! I'm Pinal Bhatt — I'm Human & I'm Software Engineer, and I love writing code! Though enjoying adrenaline rush from the new AI realm. Yes, I'm always on the learning ramp.",
    "When I'm not at the desk, I'm probably stretching, reading, or arguing with my family about who gets the couch and what to watch on TV.",
    "This site is a space where I share insights, tutorials, articles, and resources on topics such as AI, programming, microservices, cloud computing, serverless architectures, & other technologies and topics like JavaScript, Node.js, TypeScript, Vue, Angular, React, Astro, Postgres, Mongo, Kafka and many more.",
    "You'll also find a few personal reflections, tips on healthy living — because I believe good health fuels great work — and the occasional offbeat thought. After all, health is wealth!"
  ),
  chip_label: "Pinal",
  eyebrow: "About me",
  headline: "Welcome to my desk!",
  portrait: placeholderAsset("pb1.jpg"),
  show_social: true,
});

const myRealmBlok = blok("my_realm", {
  eyebrow: "My realm",
  features: [
    blok("feature_card", {
      description:
        "Quick takes you can read in the time it takes `npm install` to finish.",
      icon: "bolt",
      title: "Short-form Bits",
    }),
    blok("feature_card", {
      description:
        "Small habits that protect your energy — for the long code review marathon.",
      icon: "heart",
      title: "Wellness for devs",
    }),
    blok("feature_card", {
      description:
        "When a thought needs more than a tweet — full posts on the things I keep returning to.",
      icon: "pencil",
      title: "Longer essays",
    }),
  ],
  headline: richtext("Health, family, wellness, and technology."),
  realms: [
    blok("realm_card", {
      description:
        "Whole, natural, unprocessed foods rich in essential nutrients, vitamins, and minerals — fuel for immunity and repair.",
      title: "Nutrition",
    }),
    blok("realm_card", {
      description:
        "Regular movement — walking, yoga, strength — to improve circulation, boost endorphins, and keep body and mind sharp.",
      title: "Movement",
    }),
    blok("realm_card", {
      description:
        "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
      title: "Sleep & Recovery",
    }),
    blok("realm_card", {
      description:
        "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.",
      title: "Mindfulness",
    }),
  ],
  subheading:
    "The four threads I weave through everything I write. Never one without the others.",
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
      angle: -135,
      body: "Whole, natural, unprocessed foods rich in vitamins and minerals — fuel for immunity and repair.",
      color: "#10B981",
      icon: "apple",
      index: "01",
      key: "nutrition",
      short_label: "Nutrition",
      title: "Cellular Nutrition",
    }),
    blok("wellness_thread_item", {
      angle: -45,
      body: "Regular movement — walking, yoga, strength — to boost endorphins and keep body and mind sharp.",
      color: "#F59E0B",
      icon: "run",
      index: "02",
      key: "exercise",
      short_label: "Exercise",
      title: "Adequate Exercise",
    }),
    blok("wellness_thread_item", {
      angle: 135,
      body: "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
      color: "#0EA5E9",
      icon: "moon",
      index: "03",
      key: "sleep",
      short_label: "Sleep",
      title: "Quality Sleep",
    }),
    blok("wellness_thread_item", {
      angle: 45,
      body: "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, emotional detox.",
      color: "#E11D48",
      icon: "heart",
      index: "04",
      key: "emotion",
      short_label: "Emotion",
      title: "Emotional Wellness",
    }),
  ],
});

const myPillersBlok = blok("my_pillers", {
  eyebrow: "My Pillers",
  heading: "Three threads, one desk.",
  pillars: [
    blok("piller_orbit_item", {
      angle: -90,
      body: "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
      color: "#4F46E5",
      cta_label: "Visit My Bits",
      href: { linktype: "url", url: "/bits" },
      index: "01",
      key: "bits",
      label: "Bits",
      title: "Bits — the tech side",
    }),
    blok("piller_orbit_item", {
      angle: 30,
      body: "A healthy, active life is the greatest gift we can give ourselves. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
      color: "#10B981",
      cta_label: "Visit My Bites",
      href: { linktype: "url", url: "/bites" },
      index: "02",
      key: "bites",
      label: "Bites",
      title: "Bites — the wellness side",
    }),
    blok("piller_orbit_item", {
      angle: 150,
      body: "Longer-form reflections on balancing tech life with physical wellness, plus friendships, family, and meaningful connections.",
      color: "#7C3AED",
      cta_label: "Visit My Blog",
      href: { linktype: "url", url: "/blog" },
      index: "03",
      key: "blog",
      label: "Blog",
      title: "Blog — where they meet",
    }),
  ],
});

const ctaBannerBlok = blok("cta_banner", {
  description:
    "One email when something new lands on Bits, Bites, or Blog. No noise, no spam — just signal from my desk to yours.",
  heading: "Stay in touch.",
  placeholder: "your@email.com",
  submit_action: { linktype: "url", url: "" },
  submit_label: "Subscribe",
});

export const homeContent: SbStoryContent = {
  body: [
    heroBlok,
    pillarsBlok,
    aboutSectionBlok,
    myRealmBlok,
    myWellnessThreadsBlok,
    myPillersBlok,
    ctaBannerBlok,
  ],
  component: "home_page",
  description:
    "From the desk of Pinal Bhatt — a space where code meets wellness. Explore Bits (dev & AI), Bites (fitness & mindfulness), and the Blog (long-form reflections).",
  title: "PBDesk — Bits, Bites & Blog by Pinal Bhatt",
};

// ============================================================================
// About page
// ============================================================================

export const aboutContent: SbStoryContent = {
  bio: richtext(
    "I love coding and enjoy creating great software solutions through the power of code. I genuinely enjoy the entire process of creating software, from brainstorming ideas to writing clean code and debugging until everything runs just right. Whether I'm diving into backend, frontend, middleware, or experimenting with any new tech, I find a lot of joy in figuring things out and making things better.",
    "One of the areas that really excites me is artificial intelligence. I love exploring how AI is changing the way we live and work, and I'm always curious to see how I can apply it in the projects I build. I'm also always on the lookout for new tools, trends, and tech that challenge me to grow and think differently. For me, learning is an ongoing journey — and that's one of the best parts of being in tech.",
    "But as much as I love coding, I don't believe life should be all about work. I'm a big believer in balance. Health and wellness are super important to me. I make time for physical and mental well-being, whether it's through regular exercise, mindfulness, or simply slowing down when needed. Staying healthy helps me stay sharp and present — both in my work and in life. Spending quality time with family and friends is something I truly value. At the end of the day, it's the people around us that bring the most meaning to our lives. I try to stay grounded, enjoy the little moments, and never take anything for granted. Work is important, but so is life — and I believe in showing up fully for both."
  ),
  body: [aboutSectionBlok, myPillersBlok, myWellnessThreadsBlok],
  component: "about_page",
  headline:
    "Hi, I'm Pinal Bhatt. Engineer by craft, learner by habit, human by nature.",
  intro_chip_label: "About — the human behind the desk",
  portrait: placeholderAsset("pb1.jpg"),
  seo_description:
    "Get to know the human behind PBDesk. Pinal Bhatt is a software engineer exploring AI, web development, and the daily wellness habits that fuel sustainable craft.",
  seo_title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
  title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
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
  accent_primary: "#4f46e5",
  accent_secondary: "#0ea5e9",
  body: [],
  cadence: "weekly",
  component: "landing_page",
  description:
    "Welcome to my digital corner, where I share insights on the ever-evolving world of AI, programming, and software development. From the latest advancements in generative AI to cutting-edge developer tools and web design trends, I explore how technology shapes our digital future. Whether it's dissecting new frameworks, discussing ethical AI, or sharing productivity hacks for coders, I aim to bridge knowledge gaps and spark curiosity. Join me as I navigate the fast-paced tech landscape one thought, tutorial, and trend at a time. Let's build, learn, and innovate together.",
  filters: [],
  pillar: "bits",
  seo_description:
    "Curated bits on AI agents, developer tools, browsers, VS Code extensions, and the frameworks shaping modern web development. Notes from Pinal Bhatt's desk.",
  seo_title: "Bits — AI tools, dev tools & web tech worth knowing",
  title: "Bits",
};

export const bitesLandingContent: SbStoryContent = {
  accent_primary: "#10b981",
  accent_secondary: "#3b82f6",
  body: [],
  cadence: "weekly",
  component: "landing_page",
  description:
    "Bites are the wellness pillar — small daily choices that compound into vitality. Movement, nutrition, sleep, and mindfulness — practical notes from a developer trying to stay sharp for the long run. No gurus, no fads, just things that have worked.",
  filters: [],
  pillar: "bites",
  seo_description:
    "A developer's wellness notebook: movement, nutrition, sleep, and mindfulness. Small habits that protect your energy for the long haul.",
  seo_title: "Bites — wellness, fitness & mindfulness for developers",
  title: "Bites",
};

export const blogLandingContent: SbStoryContent = {
  accent_primary: "#7c3aed",
  accent_secondary: "#10b981",
  body: [],
  cadence: "monthly",
  component: "landing_page",
  description:
    "Long-form reflections where Bits and Bites meet. Posts on building software while staying human — the friction of growth, the rituals that compound, and the stories worth re-reading. Writing here is slower and more personal.",
  filters: [],
  pillar: "blog",
  seo_description:
    "Reflections on code, craft, and wellness from Pinal Bhatt. Where technology meets a thoughtful, healthy life.",
  seo_title: "Blog — long-form reflections from PBDesk",
  title: "Blog",
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
    href: { linktype: "url", url: href },
    label,
    target_blank: targetBlank,
  });
}

export const globalConfigContent: SbStoryContent = {
  brand_tagline: "from the desk of Pinal Bhatt",
  component: "global_config",
  cta_default: [ctaBannerBlok],
  footer_about:
    "PBDesk is the personal site of Pinal Bhatt — a space where code meets wellness. Notes on AI, dev tools, fitness, mindfulness, and the long-form reflections that connect them.",
  footer_explore: [
    navItem("Bits", "/bits"),
    navItem("Bites", "/bites"),
    navItem("Blog", "/blog"),
    navItem("About Me", "/about"),
  ],
  footer_more: [
    navItem("Disclaimer", "/disclaimer"),
    navItem("Privacy Policy", "/privacy-policy"),
  ],
  footer_topics: [
    navItem("All Bits", "/bits/all"),
    navItem("All Bites", "/bites/all"),
    navItem("All Blog Posts", "/blog/all"),
    navItem("Categories", "/categories"),
    navItem("Labels", "/labels"),
  ],
  nav_items: [
    navItem("Home", "/"),
    navItem("Bits", "/bits"),
    navItem("Bites", "/bites"),
    navItem("Blog", "/blog"),
    navItem("About", "/about"),
  ],
  social_links: socialLinks,
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
          alt: node.alt,
          filename: real.filename,
          id: real.id,
        };
      }
      return { alt: node.alt, filename: "" };
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
