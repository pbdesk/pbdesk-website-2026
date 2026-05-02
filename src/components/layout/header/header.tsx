"use client";
import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
  type IconProps,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/icons/icons";
import ThemeToggle from "./theme-toggle";

export interface NavItem {
  href: string;
  label: string;
  targetBlank?: boolean;
}

export type SocialIconKey = "github" | "linkedin" | "x";

export interface SocialLink {
  href: string;
  icon: SocialIconKey;
  label: string;
}

interface HeaderProps {
  brandTagline?: string;
  navItems?: NavItem[];
  socials?: SocialLink[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Bits", href: "/bits" },
  { label: "Bites", href: "/bites" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

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

export default function Header({
  navItems,
  socials,
  brandTagline,
}: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const items = navItems?.length ? navItems : DEFAULT_NAV_ITEMS;
  const socialList = socials?.length ? socials : DEFAULT_SOCIALS;
  const tagline = brandTagline ?? "from the desk of Pinal Bhatt";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className="header-bg sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-7">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link className="flex items-center gap-3" href="/">
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

          <nav className="hidden items-center gap-8 lg:flex">
            {items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  className="relative py-2 font-medium text-sm transition-colors"
                  href={item.href}
                  key={item.href}
                  rel={item.targetBlank ? "noopener noreferrer" : undefined}
                  style={{
                    color: isActive
                      ? "var(--fg-primary)"
                      : "var(--fg-secondary)",
                  }}
                  target={item.targetBlank ? "_blank" : undefined}
                >
                  {item.label}
                  {isActive ? (
                    <span
                      className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: "var(--fg-brand)" }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {socialList.map(({ label, href, icon }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <a
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    href={href}
                    key={label}
                    rel="noopener"
                    style={{ color: "var(--fg-secondary)" }}
                    target="_blank"
                  >
                    <Icon size={18} />
                    <span className="sr-only">{label}</span>
                  </a>
                );
              })}
            </div>

            <ThemeToggle />

            <button
              aria-label="Toggle menu"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              style={{ color: "var(--fg-secondary)" }}
              type="button"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          className="border-t lg:hidden"
          style={{
            background: "var(--bg-page)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    className="rounded-md px-3 py-2 font-medium text-sm transition-colors"
                    href={item.href}
                    key={item.href}
                    rel={item.targetBlank ? "noopener noreferrer" : undefined}
                    style={{
                      background: isActive ? "var(--bg-subtle)" : "transparent",
                      color: isActive ? "var(--fg-brand)" : "var(--fg-primary)",
                    }}
                    target={item.targetBlank ? "_blank" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div
              className="mt-4 flex items-center gap-2 border-t pt-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {socialList.map(({ label, href, icon }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <a
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    href={href}
                    key={label}
                    rel="noopener"
                    style={{ color: "var(--fg-secondary)" }}
                    target="_blank"
                  >
                    <Icon size={18} />
                    <span className="sr-only">{label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
