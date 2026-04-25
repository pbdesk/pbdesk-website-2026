import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--fg-brand)] text-white shadow-[0_8px_20px_rgb(79_70_229_/_0.3)] hover:-translate-y-0.5 hover:shadow-lg",
  secondary:
    "border border-[var(--fg-brand)] text-[var(--fg-brand)] hover:bg-[var(--fg-brand)] hover:text-white",
  ghost:
    "border border-[var(--border-strong)] text-[var(--fg-primary)] hover:bg-[var(--bg-subtle)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-7 text-sm",
  lg: "h-14 px-8 text-base",
};

interface BaseProps {
  children: ReactNode;
  className?: string;
  size?: Size;
  variant?: Variant;
}

interface LinkButtonProps extends BaseProps {
  href: string;
}

interface NativeButtonProps
  extends BaseProps,
    Omit<ComponentProps<"button">, keyof BaseProps> {
  href?: never;
}

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all",
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link className={cls} href={props.href}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    href: _h,
    ...rest
  } = props as NativeButtonProps;
  return (
    <button className={cls} type="button" {...rest}>
      {children}
    </button>
  );
}
