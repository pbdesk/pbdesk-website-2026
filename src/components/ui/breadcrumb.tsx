import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbProps {
  align?: "center" | "start";
  children?: ReactNode;
  items: BreadcrumbItem[];
}

export function Breadcrumb({
  items,
  align = "center",
  children,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-5 flex items-center gap-2 text-[var(--fg-muted)] text-sm ${align === "start" ? "justify-start" : "justify-center"}`}
    >
      <Link
        aria-label="Home"
        className="text-[var(--fg-secondary)] transition-[filter] hover:drop-shadow-[0_0_6px_currentColor]"
        href="/"
      >
        <IconHome size={16} stroke={1.5} />
      </Link>
      {items.map((item) => (
        <Fragment key={item.href ?? item.label}>
          <span aria-hidden="true">/</span>
          {item.href ? (
            <Link
              className="text-[var(--fg-secondary)] hover:underline"
              href={item.href}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--fg-primary)]">{item.label}</span>
          )}
        </Fragment>
      ))}
      {children}
    </nav>
  );
}
