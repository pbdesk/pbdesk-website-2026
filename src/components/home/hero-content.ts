export type HeroPillarTone = "bits" | "bites" | "blog";

export interface HeroPillarLink {
  href: string;
  icon?: string;
  label: string;
  tone: HeroPillarTone;
}

export const DEFAULT_HERO_CONTENT = {
  ctaHref: "#pillars",
  ctaLabel: "Explore PBDesk",
  eyebrow: "Learning endeavor forever...",
  headline: "PBDesk",
  kicker: "From the desk of Pinal Bhatt",
  secondaryCtaHref: "/about",
  secondaryCtaLabel: "About Pinal",
  subheadline:
    "A personal space where code, AI, wellness, and mindful living meet.",
} as const;

export const DEFAULT_HERO_PILLAR_LINKS: HeroPillarLink[] = [
  {
    href: "/bits",
    icon: "/pillers/bits-avatar.svg",
    label: "Bits",
    tone: "bits",
  },
  {
    href: "/bites",
    icon: "/pillers/bites-avatar.svg",
    label: "Bites",
    tone: "bites",
  },
  {
    href: "/blog",
    icon: "/pillers/blog-avatar.svg",
    label: "Blog",
    tone: "blog",
  },
];
