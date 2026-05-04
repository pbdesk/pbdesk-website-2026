import type { ISbStoryData } from "@storyblok/react/rsc";

export type PillarKey = "bits" | "bites" | "blog";

export interface SbAssetField {
  alt?: string | null;
  filename: string;
  focus?: string | null;
  id: number;
  name?: string | null;
  title?: string | null;
}

export interface SbLinkField {
  anchor?: string;
  cached_url?: string;
  email?: string;
  id?: string;
  linktype?: "url" | "story" | "asset" | "email";
  target?: "_blank" | "_self";
  url?: string;
}

export interface SbBlokBase {
  _editable?: string;
  _uid: string;
  component: string;
}

export interface PostStoryContent extends SbBlokBase {
  author?: string;
  body?: unknown;
  category: string;
  component: "post";
  cover_image?: SbAssetField;
  excerpt: string;
  external_url?: SbLinkField;
  featured?: boolean;
  gradient: string;
  intro_blocks?: SbBlokBase[];
  labels: string[];
  pillar: PillarKey;
  published_at?: string;
  read_time: string;
  related?: string[];
  seo?: SbBlokBase[];
  title: string;
  updated_at?: string;
}

export interface LandingPageStoryContent extends SbBlokBase {
  accent_primary: string;
  accent_secondary: string;
  banner_dark?: SbAssetField;
  banner_light?: SbAssetField;
  body?: SbBlokBase[];
  cadence: string;
  component: "landing_page";
  description: string;
  filters?: SbBlokBase[];
  pillar: PillarKey;
  seo_description?: string;
  seo_title?: string;
  title: string;
}

export interface HomePageStoryContent extends SbBlokBase {
  body: SbBlokBase[];
  component: "home_page";
  description: string;
  title: string;
}

export interface AboutPageStoryContent extends SbBlokBase {
  bio: unknown;
  body?: SbBlokBase[];
  component: "about_page";
  headline: string;
  intro_chip_label: string;
  portrait?: SbAssetField;
  seo_description?: string;
  seo_title?: string;
  title: string;
}

export interface DisclaimerPageStoryContent extends SbBlokBase {
  body: unknown;
  component: "disclaimer_page";
  eyebrow?: string;
  last_updated?: string;
  lede?: string;
  seo_description?: string;
  seo_title?: string;
  title: string;
}

export interface PrivacyPolicyPageStoryContent extends SbBlokBase {
  body: unknown;
  component: "privacy_policy_page";
  eyebrow?: string;
  last_updated?: string;
  lede?: string;
  seo_description?: string;
  seo_title?: string;
  title: string;
}

export interface NavItemBlok extends SbBlokBase {
  component: "nav_item";
  href: SbLinkField;
  label: string;
  target_blank?: boolean;
}

export interface SocialLinkBlok extends SbBlokBase {
  component: "social_link";
  href: SbLinkField;
  icon: "github" | "linkedin" | "x";
  label: string;
}

export interface GlobalConfigStoryContent extends SbBlokBase {
  brand_tagline: string;
  component: "global_config";
  cta_default?: SbBlokBase[];
  footer_about: string;
  footer_explore: NavItemBlok[];
  footer_more: NavItemBlok[];
  footer_topics: NavItemBlok[];
  nav_items: NavItemBlok[];
  social_links: SocialLinkBlok[];
}

export type PostStory = ISbStoryData<PostStoryContent>;
export type LandingPageStory = ISbStoryData<LandingPageStoryContent>;
export type HomePageStory = ISbStoryData<HomePageStoryContent>;
export type AboutPageStory = ISbStoryData<AboutPageStoryContent>;
export type DisclaimerPageStory = ISbStoryData<DisclaimerPageStoryContent>;
export type PrivacyPolicyPageStory =
  ISbStoryData<PrivacyPolicyPageStoryContent>;
export type GlobalConfigStory = ISbStoryData<GlobalConfigStoryContent>;
