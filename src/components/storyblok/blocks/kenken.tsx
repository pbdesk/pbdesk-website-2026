// src/components/storyblok/blocks/kenken.tsx
import {
  KenkenCta,
  KenkenHero,
  KenkenLevels,
  KenkenOperations,
  KenkenProse,
  KenkenSteps,
} from "@/components/brain-boost/kenken/sections";
import { editable } from "./editable";
import type {
  KenkenCtaBlok,
  KenkenHeroBlok,
  KenkenLevelsBlok,
  KenkenOperationsBlok,
  KenkenProseBlok,
  KenkenStepsBlok,
} from "./types";

export function KenkenHeroBlock({ blok }: { blok: KenkenHeroBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenHero
        ctaDailyLabel={blok.cta_daily_label}
        ctaPlayLabel={blok.cta_play_label}
        eyebrow={blok.eyebrow}
        lede={blok.lede}
        title={blok.title}
      />
    </div>
  );
}

export function KenkenProseBlock({ blok }: { blok: KenkenProseBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenProse
        heading={blok.heading}
        richtext={
          blok.richtext as Parameters<typeof KenkenProse>[0]["richtext"]
        }
      />
    </div>
  );
}

export function KenkenStepsBlock({ blok }: { blok: KenkenStepsBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenSteps
        heading={blok.heading}
        steps={(blok.steps ?? []).map((s) => ({
          title: s.title ?? "",
          text: s.text ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenOperationsBlock({
  blok,
}: {
  blok: KenkenOperationsBlok;
}) {
  return (
    <div {...editable(blok)}>
      <KenkenOperations
        heading={blok.heading}
        operations={(blok.operations ?? []).map((o) => ({
          symbol: o.symbol ?? "",
          name: o.name ?? "",
          description: o.description ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenLevelsBlock({ blok }: { blok: KenkenLevelsBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenLevels
        heading={blok.heading}
        levels={(blok.levels ?? []).map((l) => ({
          name: l.name ?? "",
          sizes: l.sizes ?? "",
          operations: l.operations ?? "",
          description: l.description ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenCtaBlock({ blok }: { blok: KenkenCtaBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenCta
        ctaDailyLabel={blok.cta_daily_label}
        ctaPlayLabel={blok.cta_play_label}
        heading={blok.heading}
      />
    </div>
  );
}
