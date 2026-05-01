import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "default" | "brand" | "solid" | "category";

export function Chip({
  children,
  variant = "default",
  dot,
  className,
}: {
  children: ReactNode;
  variant?: ChipVariant;
  dot?: string;
  className?: string;
}) {
  if (variant === "category") {
    return (
      <span
        className={cn(
          "font-semibold text-[11px] text-[var(--fg-brand)] uppercase tracking-[0.08em]",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium text-sm",
        variant === "default" &&
          "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)]",
        variant === "brand" &&
          "border-[var(--fg-brand)]/25 bg-[var(--fg-brand)]/10 text-[var(--fg-brand)]",
        variant === "solid" &&
          "border-transparent bg-[var(--fg-brand)] text-white",
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}
