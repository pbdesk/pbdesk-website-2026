// Adapter: convert a Storyblok global_config story into the Header / Footer
// prop shapes. Returns null when the story is missing — callers fall back
// to the components' built-in defaults.

import type {
  NavItem as FooterNavItem,
  SocialLink as FooterSocialLink,
} from "@/components/layout/footer";
import type {
  NavItem,
  SocialIconKey,
  SocialLink,
} from "@/components/layout/header/header";
import type { GlobalConfigStory, NavItemBlok, SocialLinkBlok } from "./types";
import { resolveLinkHref } from "./url";

const VALID_SOCIAL_ICONS: readonly SocialIconKey[] = [
  "github",
  "linkedin",
  "x",
] as const;

function isSocialIconKey(value: string | undefined): value is SocialIconKey {
  return (
    value !== undefined &&
    (VALID_SOCIAL_ICONS as readonly string[]).includes(value)
  );
}

function navItemFromBlok(blok: NavItemBlok): NavItem {
  return {
    label: blok.label,
    href: resolveLinkHref(blok.href),
    targetBlank: blok.target_blank ?? false,
  };
}

function socialLinkFromBlok(blok: SocialLinkBlok): SocialLink | null {
  if (!isSocialIconKey(blok.icon)) {
    return null;
  }
  return {
    label: blok.label,
    href: resolveLinkHref(blok.href),
    icon: blok.icon,
  };
}

export interface GlobalLayoutData {
  brandTagline?: string;
  footerAbout?: string;
  footerExplore: FooterNavItem[];
  footerMore: FooterNavItem[];
  footerSocials: FooterSocialLink[];
  footerTopics: FooterNavItem[];
  navItems: NavItem[];
  socials: SocialLink[];
}

export function globalConfigToLayoutData(
  story: GlobalConfigStory | null
): GlobalLayoutData | null {
  if (!story) {
    return null;
  }
  const c = story.content;
  const navItems = c.nav_items?.map(navItemFromBlok) ?? [];
  const footerExplore = c.footer_explore?.map(navItemFromBlok) ?? [];
  const footerTopics = c.footer_topics?.map(navItemFromBlok) ?? [];
  const footerMore = c.footer_more?.map(navItemFromBlok) ?? [];
  const socials =
    c.social_links
      ?.map(socialLinkFromBlok)
      .filter((s): s is SocialLink => s !== null) ?? [];

  return {
    navItems,
    socials,
    footerExplore,
    footerTopics,
    footerMore,
    footerSocials: socials,
    brandTagline: c.brand_tagline,
    footerAbout: c.footer_about,
  };
}
