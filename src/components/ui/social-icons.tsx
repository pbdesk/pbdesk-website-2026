import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { SOCIAL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type SocialKey = "github" | "linkedin" | "x";

export interface SocialItem {
  href: string;
  icon: SocialKey;
  label?: string;
}

type SocialSize = "sm" | "md" | "lg";

const SOCIAL_META: Record<
  SocialKey,
  { Icon: ComponentType<IconProps>; brandClass: string; defaultLabel: string }
> = {
  github: {
    Icon: IconBrandGithubFilled,
    brandClass: "social-icon-github",
    defaultLabel: "GitHub",
  },
  linkedin: {
    Icon: IconBrandLinkedinFilled,
    brandClass: "social-icon-linkedin",
    defaultLabel: "LinkedIn",
  },
  x: {
    Icon: IconBrandX,
    brandClass: "social-icon-x",
    defaultLabel: "X (Twitter)",
  },
};

const DEFAULT_KEYS: SocialKey[] = ["github", "linkedin", "x"];

const SIZE_CONFIG: Record<SocialSize, { box: string; icon: number }> = {
  sm: { box: "h-9 w-9", icon: 16 },
  md: { box: "h-10 w-10", icon: 18 },
  lg: { box: "h-12 w-12", icon: 22 },
};

interface SocialIconsProps {
  className?: string;
  id?: string;
  items?: SocialItem[];
  keys?: SocialKey[];
  size?: SocialSize;
}

export function SocialIcons({
  className,
  id,
  items,
  keys,
  size = "md",
}: SocialIconsProps) {
  const list: SocialItem[] = items?.length
    ? items
    : (keys ?? DEFAULT_KEYS).map((icon) => ({ icon, href: SOCIAL[icon] }));

  const sizing = SIZE_CONFIG[size];

  return (
    <div className={cn("flex items-center gap-2", className)} id={id}>
      {list.map(({ icon, href, label }) => {
        const meta = SOCIAL_META[icon];
        const Icon = meta.Icon;
        const accessibleLabel = label ?? meta.defaultLabel;

        return (
          <a
            aria-label={accessibleLabel}
            className={cn("social-icon", meta.brandClass, sizing.box)}
            href={href}
            key={icon}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon size={sizing.icon} />
            <span className="sr-only">{accessibleLabel}</span>
          </a>
        );
      })}
    </div>
  );
}
