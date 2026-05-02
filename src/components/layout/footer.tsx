import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
  type IconProps,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { getCurrentYear } from "@/lib/utils";

export type SocialIconKey = "github" | "linkedin" | "x";

export interface NavItem {
  href: string;
  label: string;
  targetBlank?: boolean;
}

export interface SocialLink {
  href: string;
  icon: SocialIconKey;
  label: string;
}

interface FooterProps {
  brandTagline?: string;
  exploreItems?: NavItem[];
  footerAbout?: string;
  moreItems?: NavItem[];
  socials?: SocialLink[];
  topicsItems?: NavItem[];
}

const DEFAULT_EXPLORE: NavItem[] = [
  { label: "Bits", href: "/bits" },
  { label: "Bites", href: "/bites" },
  { label: "Blog", href: "/blog" },
  { label: "About Me", href: "/about" },
];

const DEFAULT_TOPICS: NavItem[] = [
  { label: "Categories", href: "/categories" },
  { label: "Labels", href: "/labels" },
];

const DEFAULT_MORE: NavItem[] = [{ label: "Disclaimer", href: "/disclaimer" }];

const DEFAULT_SOCIALS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/pinalbhatt", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pinalbhatt",
    icon: "linkedin",
  },
  { label: "X", href: "https://x.com/pbdesk", icon: "x" },
];

const SOCIAL_ICONS: Record<SocialIconKey, ComponentType<IconProps>> = {
  github: IconBrandGithubFilled,
  linkedin: IconBrandLinkedinFilled,
  x: IconBrandX,
};

const DEFAULT_FOOTER_ABOUT =
  "Bits & Bites — Developer's Life. Learning Endeavor Forever, from the desk of Pinal Bhatt.";

export default function Footer({
  exploreItems,
  topicsItems,
  moreItems,
  socials,
  brandTagline,
  footerAbout,
}: FooterProps = {}) {
  const explore = exploreItems?.length ? exploreItems : DEFAULT_EXPLORE;
  const topics = topicsItems?.length ? topicsItems : DEFAULT_TOPICS;
  const more = moreItems?.length ? moreItems : DEFAULT_MORE;
  const socialList = socials?.length ? socials : DEFAULT_SOCIALS;
  const tagline = brandTagline ?? "from the desk of Pinal Bhatt";
  const about = footerAbout ?? DEFAULT_FOOTER_ABOUT;

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg-page)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="wrapper py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link className="mb-5 flex items-center gap-3" href="/">
              <Image
                alt="Pinal Bhatt"
                className="-translate-y-[5px] rounded-full border"
                height={44}
                src="/pb/pb-sq-no-bg.png"
                style={{ borderColor: "var(--fg-brand)" }}
                width={44}
              />
              <div className="flex flex-col">
                <span className="brand-wordmark">
                  <span className="pb-mark">PB</span>
                  <span style={{ color: "var(--fg-primary)" }}>Desk</span>
                </span>
                <span className="brand-tagline">{tagline}</span>
              </div>
            </Link>
            <p
              className="mb-6 max-w-sm text-sm"
              style={{
                color: "var(--fg-secondary)",
                lineHeight: 1.65,
              }}
            >
              {about}
            </p>
            <div className="flex items-center gap-1">
              {socialList.map(({ label, href, icon }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <a
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    href={href}
                    key={label}
                    rel="noopener"
                    style={{ color: "var(--fg-muted)" }}
                    target="_blank"
                  >
                    <Icon size={18} />
                    <span className="sr-only">{label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <FooterColumn heading="Explore" items={explore} />
          <FooterColumn heading="Topics" items={topics} />
          <FooterColumn heading="More" items={more} />
        </div>

        <div
          className="mt-14 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            &copy; {getCurrentYear()} PBDesk.
          </p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            With{" "}
            <span aria-hidden="true" style={{ color: "var(--fg-brand)" }}>
              ♥
            </span>{" "}
            from the desk of Pinal Bhatt
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  items,
}: {
  heading: string;
  items: NavItem[];
}) {
  return (
    <div>
      <h3
        className="mb-5 font-semibold text-xs uppercase tracking-widest"
        style={{ color: "var(--fg-brand)" }}
      >
        {heading}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className="text-sm transition-colors hover:underline"
              href={item.href}
              rel={item.targetBlank ? "noopener noreferrer" : undefined}
              style={{ color: "var(--fg-secondary)" }}
              target={item.targetBlank ? "_blank" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
