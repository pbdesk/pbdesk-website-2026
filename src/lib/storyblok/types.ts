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
  hide_share_bar?: boolean;
  intro_blocks?: SbBlokBase[];
  labels: string[];
  pillar: PillarKey;
  published_at?: string;
  read_time: string;
  // After relation resolution these arrive as full `PostStory` objects;
  // before resolution (or when relations fail) they're UUID strings.
  related?: (PostStory | string)[];
  related_sets?: SbBlokBase[];
  seo?: SbBlokBase[];
  share_desktop_layout?: "inline" | "sidebar" | "both";
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

export interface KenkenPageStoryContent extends SbBlokBase {
  body?: SbBlokBase[];
  component: "kenken_page";
  seo_description?: string;
  seo_title?: string;
}

export interface HubMetaItemBlok extends SbBlokBase {
  component: "hub_meta_item";
  icon: "Layers" | "Target" | "Sparkles" | "Calendar";
  label: string;
  value: string;
}

export interface HubGameBlok extends SbBlokBase {
  category: string;
  component: "hub_game";
  cover_image?: string;
  description?: string;
  est_time?: string;
  glyph?: string;
  href?: string;
  name: string;
  operations?: string;
  slug: string;
  status: "live" | "coming-q3" | "coming-q4" | "exploring";
  tiers?: number;
}

export interface HubBenefitBlok extends SbBlokBase {
  body: string;
  component: "hub_benefit";
  icon: "Target" | "Brain" | "Clock" | "Flame";
  title: string;
}

export interface BrainBoostHubPageStoryContent extends SbBlokBase {
  benefits?: HubBenefitBlok[];
  benefits_heading?: string;
  component: "brain_boost_hub_page";
  daily_body?: string;
  daily_cta_play?: string;
  daily_heading?: string;
  games?: HubGameBlok[];
  intro_lede?: string;
  intro_tagline?: string;
  intro_title?: string;
  meta_items?: HubMetaItemBlok[];
  seo_description?: string;
  seo_title?: string;
}

export type PostStory = ISbStoryData<PostStoryContent>;
export type LandingPageStory = ISbStoryData<LandingPageStoryContent>;
export type HomePageStory = ISbStoryData<HomePageStoryContent>;
export type AboutPageStory = ISbStoryData<AboutPageStoryContent>;
export type DisclaimerPageStory = ISbStoryData<DisclaimerPageStoryContent>;
export type PrivacyPolicyPageStory =
  ISbStoryData<PrivacyPolicyPageStoryContent>;
export type GlobalConfigStory = ISbStoryData<GlobalConfigStoryContent>;
export type KenkenPageStory = ISbStoryData<KenkenPageStoryContent>;
export type BrainBoostHubPageStory =
  ISbStoryData<BrainBoostHubPageStoryContent>;
