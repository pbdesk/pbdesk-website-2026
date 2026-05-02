import MyRealmComponent from "@/components/home/my-realm";
import { editable } from "./editable";
import { richtextToInline } from "./richtext-inline";
import type { MyRealmBlok } from "./types";

const VALID_ICONS = [
  "bolt",
  "code",
  "heart",
  "leaf",
  "notebook",
  "pencil",
] as const;
type IconKey = (typeof VALID_ICONS)[number];

function isIconKey(value: string | undefined): value is IconKey {
  return (
    value !== undefined && (VALID_ICONS as readonly string[]).includes(value)
  );
}

export default function MyRealm({ blok }: { blok: MyRealmBlok }) {
  const realms = blok.realms?.map((r) => ({
    title: r.title,
    description: r.description ?? "",
  }));
  const features = blok.features?.map((f) => ({
    title: f.title,
    description: f.description ?? "",
    icon: (isIconKey(f.icon) ? f.icon : "bolt") as IconKey,
  }));

  return (
    <div {...editable(blok)}>
      <MyRealmComponent
        eyebrow={blok.eyebrow}
        features={features}
        headline={richtextToInline(blok.headline)}
        realms={realms}
        subheading={blok.subheading}
        tags={blok.tags}
      />
    </div>
  );
}
