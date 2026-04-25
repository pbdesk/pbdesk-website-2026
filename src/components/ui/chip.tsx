import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium text-sm",
        active
          ? "border-transparent bg-[var(--fg-brand)] text-white"
          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)]",
        className
      )}
    >
      {children}
    </span>
  );
}
