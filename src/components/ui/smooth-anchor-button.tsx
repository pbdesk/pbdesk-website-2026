"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { smoothScrollToHash } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

interface SmoothAnchorButtonProps {
  children: ReactNode;
  className?: string;
  href: string;
}

export function SmoothAnchorButton({
  children,
  className,
  href,
}: SmoothAnchorButtonProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) {
      return;
    }
    if (smoothScrollToHash(href)) {
      event.preventDefault();
    }
  };
  return (
    <Link
      className={cn(
        "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--fg-brand)] px-8 font-semibold text-base text-white shadow-[0_8px_20px_rgb(79_70_229_/_0.3)] transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      href={href}
      // biome-ignore lint/performance/noJsxPropsBind: React Compiler (enabled in next.config.ts) auto-memoizes this handler.
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
