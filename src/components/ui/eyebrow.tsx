import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-semibold text-[var(--fg-brand)] text-xs uppercase tracking-widest",
        className
      )}
    >
      {children}
    </span>
  );
}
