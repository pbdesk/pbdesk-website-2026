import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentYear } from "@/lib/utils";

const explore = [
  { label: "Bits", href: "/bits" },
  { label: "Bites", href: "/bites" },
  { label: "Blog", href: "/blog" },
  { label: "About Me", href: "/about" },
];

const topics = [
  { label: "AI & ML", href: "/topics/ai" },
  { label: "Web Dev", href: "/topics/web-dev" },
  { label: "Tools", href: "/topics/tools" },
  { label: "Wellness", href: "/topics/wellness" },
];

const more = [
  { label: "RSS Feed", href: "/rss.xml" },
  { label: "Categories", href: "/categories" },
  { label: "Archive", href: "/archive" },
  { label: "Privacy", href: "/privacy" },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/pinalbhatt",
    icon: IconBrandGithubFilled,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pinalbhatt",
    icon: IconBrandLinkedinFilled,
  },
  { label: "X", href: "https://x.com/pbdesk", icon: IconBrandX },
];

export default function Footer() {
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
                <span className="brand-tagline">
                  from the desk of Pinal Bhatt
                </span>
              </div>
            </Link>
            <p
              className="mb-6 max-w-sm text-sm"
              style={{
                color: "var(--fg-secondary)",
                lineHeight: 1.65,
              }}
            >
              Bits &amp; Bites — Developer&apos;s Life. Learning Endeavor
              Forever, from the desk of Pinal Bhatt.
            </p>
            <div className="flex items-center gap-1">
              {socials.map(({ label, href, icon: Icon }) => (
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
              ))}
            </div>
          </div>

          {/* Explore column */}
          <FooterColumn heading="Explore" items={explore} />
          <FooterColumn heading="Topics" items={topics} />
          <FooterColumn heading="More" items={more} />
        </div>

        {/* Bottom bar */}
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
  items: { label: string; href: string }[];
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
              style={{ color: "var(--fg-secondary)" }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
