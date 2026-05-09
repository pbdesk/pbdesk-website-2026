"use client";

import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandPocket,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandX,
  IconLink,
  IconMail,
  type IconProps,
} from "@tabler/icons-react";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  PocketShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "next-share";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type ShareNetwork =
  | "facebook"
  | "linkedin"
  | "pinterest"
  | "pocket"
  | "telegram"
  | "twitter"
  | "whatsapp"
  | "email";

const DEFAULT_NETWORKS: ShareNetwork[] = [
  "twitter",
  "facebook",
  "linkedin",
  "whatsapp",
  "telegram",
  "pinterest",
  "pocket",
  "email",
];

const NETWORK_META: Record<
  ShareNetwork,
  {
    Icon: ComponentType<IconProps>;
    accentClass: string;
    label: string;
  }
> = {
  facebook: {
    Icon: IconBrandFacebook,
    accentClass: "social-icon-facebook",
    label: "Share on Facebook",
  },
  linkedin: {
    Icon: IconBrandLinkedin,
    accentClass: "social-icon-linkedin",
    label: "Share on LinkedIn",
  },
  pinterest: {
    Icon: IconBrandPinterest,
    accentClass: "social-icon-pinterest",
    label: "Pin to Pinterest",
  },
  pocket: {
    Icon: IconBrandPocket,
    accentClass: "social-icon-pocket",
    label: "Save to Pocket",
  },
  telegram: {
    Icon: IconBrandTelegram,
    accentClass: "social-icon-telegram",
    label: "Share on Telegram",
  },
  twitter: {
    Icon: IconBrandX,
    accentClass: "social-icon-x",
    label: "Share on X (Twitter)",
  },
  whatsapp: {
    Icon: IconBrandWhatsapp,
    accentClass: "social-icon-whatsapp",
    label: "Share on WhatsApp",
  },
  email: {
    Icon: IconMail,
    accentClass: "social-icon-email",
    label: "Share via email",
  },
};

interface ShareBarProps {
  className?: string;
  description?: string;
  hashtag?: string;
  heading?: string;
  media?: string;
  networks?: ShareNetwork[];
  showCopyLink?: boolean;
  title: string;
  url: string;
  variant?: "inline" | "sidebar";
}

const PINTEREST_FALLBACK_MEDIA =
  "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200";

const LEADING_HASH_RE = /^#/;

function normalizeHashtag(value?: string): string | undefined {
  return value?.replace(LEADING_HASH_RE, "");
}

export function ShareBar({
  url,
  title,
  description,
  media,
  hashtag,
  variant = "inline",
  heading,
  networks = DEFAULT_NETWORKS,
  showCopyLink = true,
  className,
}: ShareBarProps) {
  const isSidebar = variant === "sidebar";
  const buttons: ReactNode[] = networks.map((network) =>
    renderNetworkButton({ network, url, title, description, media, hashtag })
  );

  if (showCopyLink) {
    buttons.push(<CopyLinkButton key="copy-link" url={url} />);
  }

  if (isSidebar) {
    return (
      <Reveal variant="up">
        <aside
          aria-label={heading ?? "Share this page"}
          className={cn(
            "hidden lg:sticky lg:top-32 lg:flex lg:flex-col lg:items-center lg:gap-3",
            className
          )}
        >
          {heading ? (
            <span className="mb-1 -rotate-180 font-medium text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
              {heading}
            </span>
          ) : null}
          {buttons}
        </aside>
      </Reveal>
    );
  }

  return (
    <Reveal variant="up">
      <div
        className={cn(
          "flex flex-col items-center gap-4 py-2",
          "rounded-2xl",
          className
        )}
      >
        {heading ? (
          <span className="font-medium text-[var(--fg-muted)] text-xs uppercase tracking-[0.18em]">
            {heading}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {buttons}
        </div>
      </div>
    </Reveal>
  );
}

function renderNetworkButton({
  network,
  url,
  title,
  description,
  media,
  hashtag,
}: {
  network: ShareNetwork;
  url: string;
  title: string;
  description?: string;
  media?: string;
  hashtag?: string;
}): ReactNode {
  const meta = NETWORK_META[network];
  const child = (
    <ShareIconCircle
      accentClass={meta.accentClass}
      Icon={meta.Icon}
      label={meta.label}
    />
  );
  const tag = normalizeHashtag(hashtag);

  switch (network) {
    case "facebook":
      return (
        <FacebookShareButton
          aria-label={meta.label}
          hashtag={tag ? `#${tag}` : undefined}
          key="facebook"
          quote={description ?? title}
          url={url}
        >
          {child}
        </FacebookShareButton>
      );
    case "linkedin":
      return (
        <LinkedinShareButton
          aria-label={meta.label}
          key="linkedin"
          summary={description}
          title={title}
          url={url}
        >
          {child}
        </LinkedinShareButton>
      );
    case "pinterest":
      return (
        <PinterestShareButton
          aria-label={meta.label}
          description={title}
          key="pinterest"
          media={media ?? PINTEREST_FALLBACK_MEDIA}
          url={url}
        >
          {child}
        </PinterestShareButton>
      );
    case "pocket":
      return (
        <PocketShareButton
          aria-label={meta.label}
          key="pocket"
          title={title}
          url={url}
        >
          {child}
        </PocketShareButton>
      );
    case "telegram":
      return (
        <TelegramShareButton
          aria-label={meta.label}
          key="telegram"
          title={title}
          url={url}
        >
          {child}
        </TelegramShareButton>
      );
    case "twitter":
      return (
        <TwitterShareButton
          aria-label={meta.label}
          hashtags={tag ? [tag] : undefined}
          key="twitter"
          title={title}
          url={url}
        >
          {child}
        </TwitterShareButton>
      );
    case "whatsapp":
      return (
        <WhatsappShareButton
          aria-label={meta.label}
          key="whatsapp"
          separator=" — "
          title={title}
          url={url}
        >
          {child}
        </WhatsappShareButton>
      );
    case "email":
      return (
        <EmailShareButton
          aria-label={meta.label}
          body={`${description ?? title}\n\n`}
          key="email"
          subject={title}
          url={url}
        >
          {child}
        </EmailShareButton>
      );
    default:
      return null;
  }
}

function ShareIconCircle({
  Icon,
  accentClass,
  label,
}: {
  Icon: ComponentType<IconProps>;
  accentClass: string;
  label: string;
}) {
  return (
    <span className={cn("social-icon h-10 w-10", accentClass)}>
      <Icon size={18} stroke={1.75} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Silent — clipboard write can fail if the document is not focused.
    }
  }, [url]);

  return (
    <button
      aria-label="Copy link"
      className={cn(
        "social-icon social-icon-copy h-10 w-10",
        copied && "is-copied"
      )}
      onClick={handleCopy}
      type="button"
    >
      <IconLink size={18} stroke={1.75} />
      <span className="sr-only">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}
