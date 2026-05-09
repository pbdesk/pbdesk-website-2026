// Shared block types for the Storyblok wrapper components.

import type {
  LandingPageStory,
  PostStory,
  SbAssetField,
  SbBlokBase,
  SbLinkField,
} from "@/lib/storyblok/types";

export type PillarKey = "bits" | "bites" | "blog";

export interface RichtextDoc {
  content?: unknown[];
  type: "doc";
}

// ---- Hero ----------------------------------------------------------------

export interface HeroBlok extends SbBlokBase {
  component: "hero";
  cta_href?: SbLinkField;
  cta_label?: string;
  eyebrow?: string;
  headline?: RichtextDoc;
  show_social?: boolean;
  subheadline?: RichtextDoc;
}

// ---- Pillars + PillarCard -------------------------------------------------

export interface PillarCardBlok extends SbBlokBase {
  avatar?: SbAssetField;
  component: "pillar_card";
  cta_label?: string;
  description?: string;
  gradient_class?: string;
  href?: SbLinkField;
  name: string;
  title: string;
}

export interface PillarsBlok extends SbBlokBase {
  cards?: PillarCardBlok[];
  component: "pillars";
  eyebrow?: string;
  heading?: string;
}

// ---- About ---------------------------------------------------------------

export interface AboutSectionBlok extends SbBlokBase {
  bio?: RichtextDoc;
  chip_label?: string;
  component: "about_section";
  eyebrow?: string;
  headline?: string;
  portrait?: SbAssetField;
  show_social?: boolean;
}

export interface AboutHeroBlok extends SbBlokBase {
  chip_label?: string;
  component: "about_hero";
  description?: string;
  primary_cta_href?: SbLinkField;
  primary_cta_label?: string;
  secondary_cta_href?: SbLinkField;
  secondary_cta_label?: string;
  show_social?: boolean;
  title_lead?: string;
  title_name?: string;
  title_subheadline?: string;
}

export interface AboutStoryBlok extends SbBlokBase {
  column_left?: RichtextDoc;
  column_right?: RichtextDoc;
  component: "about_story";
  eyebrow?: string;
  heading?: string;
  quote_attribution?: string;
  quote_link?: SbLinkField;
  quote_text?: string;
}

// ---- MyRealm + sub-blocks -------------------------------------------------

export interface RealmCardBlok extends SbBlokBase {
  component: "realm_card";
  description?: string;
  title: string;
}

export interface FeatureCardBlok extends SbBlokBase {
  component: "feature_card";
  description?: string;
  icon?: string;
  title: string;
}

export interface MyRealmBlok extends SbBlokBase {
  component: "my_realm";
  eyebrow?: string;
  features?: FeatureCardBlok[];
  headline?: RichtextDoc;
  realms?: RealmCardBlok[];
  subheading?: string;
  tags?: string[];
}

// ---- MyWellnessThreads ---------------------------------------------------

export interface WellnessThreadItemBlok extends SbBlokBase {
  angle?: number;
  body?: string;
  color?: string;
  component: "wellness_thread_item";
  icon?: string;
  index?: string;
  key?: string;
  short_label?: string;
  title?: string;
}

export interface MyWellnessThreadsBlok extends SbBlokBase {
  component: "my_wellness_threads";
  eyebrow?: string;
  headline?: RichtextDoc;
  subheading?: string;
  threads?: WellnessThreadItemBlok[];
}

// ---- MyPillers -----------------------------------------------------------

export interface PillerOrbitItemBlok extends SbBlokBase {
  angle?: number;
  body?: string;
  color?: string;
  component: "piller_orbit_item";
  cta_label?: string;
  href?: SbLinkField;
  index?: string;
  key?: string;
  label?: string;
  title?: string;
}

export interface MyPillersBlok extends SbBlokBase {
  component: "my_pillers";
  eyebrow?: string;
  heading?: string;
  pillars?: PillerOrbitItemBlok[];
}

// ---- CTA Banner ----------------------------------------------------------

export interface CtaBannerBlok extends SbBlokBase {
  component: "cta_banner";
  description?: string;
  heading?: string;
  placeholder?: string;
  submit_action?: SbLinkField;
  submit_label?: string;
}

// ---- Curated Post Set ----------------------------------------------------

// `pillar` and `posts` hold story UUIDs from Storyblok. With
// `resolve_relations` (configured in the storyblok client + bridge) they
// arrive pre-inflated as full story objects. The block wrapper accepts
// either shape and unwraps stories before rendering.
export interface CuratedPostSetBlok extends SbBlokBase {
  component: "curated_post_set";
  eyebrow?: string;
  pillar?: LandingPageStory | string;
  posts?: (PostStory | string)[];
  title: string;
}

// ---- Richtext Section ----------------------------------------------------

export interface RichtextSectionBlok extends SbBlokBase {
  component: "richtext_section";
  content?: RichtextDoc;
}

// ---- Share Bar -----------------------------------------------------------

export type ShareNetwork =
  | "facebook"
  | "linkedin"
  | "pinterest"
  | "pocket"
  | "telegram"
  | "twitter"
  | "whatsapp"
  | "email";

export type ShareDesktopLayout = "inline" | "sidebar" | "both";

export interface ShareBarBlok extends SbBlokBase {
  component: "share_bar";
  desktop_layout?: ShareDesktopLayout;
  heading?: string;
  networks?: ShareNetwork[];
  show_copy_link?: boolean;
  title_override?: string;
  url_override?: string;
}
