import MyWellnessThreadsComponent from "@/components/home/my-wellness-threads";
import { editable } from "./editable";
import { richtextToString } from "./richtext-inline";
import type { MyWellnessThreadsBlok } from "./types";

const VALID_KEYS = ["nutrition", "exercise", "sleep", "emotion"] as const;
type WellnessKey = (typeof VALID_KEYS)[number];

const VALID_ICONS = ["apple", "run", "moon", "heart"] as const;
type IconKey = (typeof VALID_ICONS)[number];

function isWellnessKey(value: string | undefined): value is WellnessKey {
  return (
    value !== undefined && (VALID_KEYS as readonly string[]).includes(value)
  );
}
function isIconKey(value: string | undefined): value is IconKey {
  return (
    value !== undefined && (VALID_ICONS as readonly string[]).includes(value)
  );
}

export default function MyWellnessThreads({
  blok,
}: {
  blok: MyWellnessThreadsBlok;
}) {
  const threads = blok.threads
    ?.filter((t): t is typeof t & { key: WellnessKey } => isWellnessKey(t.key))
    .map((t) => ({
      key: t.key,
      title: t.title ?? "",
      short: t.short_label ?? t.title ?? "",
      body: t.body ?? "",
      icon: isIconKey(t.icon) ? t.icon : undefined,
      color: t.color,
      angle: t.angle,
      n: t.index,
    }));

  return (
    <div {...editable(blok)}>
      <MyWellnessThreadsComponent
        eyebrow={blok.eyebrow}
        headline={richtextToString(blok.headline)}
        subheading={blok.subheading}
        threads={threads}
      />
    </div>
  );
}
