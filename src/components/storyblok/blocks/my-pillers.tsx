import MyPillersComponent from "@/components/home/my-pillers";
import { resolveLinkHref } from "@/lib/storyblok/url";
import { editable } from "./editable";
import type { MyPillersBlok } from "./types";

const VALID_KEYS = ["bits", "bites", "blog"] as const;
type OrbitKey = (typeof VALID_KEYS)[number];

function isOrbitKey(value: string | undefined): value is OrbitKey {
  return (
    value !== undefined && (VALID_KEYS as readonly string[]).includes(value)
  );
}

export default function MyPillers({ blok }: { blok: MyPillersBlok }) {
  const pillars = blok.pillars
    ?.filter((p): p is typeof p & { key: OrbitKey } => isOrbitKey(p.key))
    .map((p) => ({
      key: p.key,
      title: p.title ?? "",
      short: p.label ?? p.title ?? "",
      body: p.body ?? "",
      cta: p.cta_label,
      href: p.href ? resolveLinkHref(p.href) : undefined,
      color: p.color,
      angle: p.angle,
      n: p.index,
    }));

  return (
    <div {...editable(blok)}>
      <MyPillersComponent
        eyebrow={blok.eyebrow}
        heading={blok.heading}
        pillars={pillars}
      />
    </div>
  );
}
