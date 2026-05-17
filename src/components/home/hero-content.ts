export type HeroPillarTone = "bits" | "bites" | "blog";

export interface HeroPillarLink {
  href: string;
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
  { href: "/bits", label: "Bits", tone: "bits" },
  { href: "/bites", label: "Bites", tone: "bites" },
  { href: "/blog", label: "Blog", tone: "blog" },
];
