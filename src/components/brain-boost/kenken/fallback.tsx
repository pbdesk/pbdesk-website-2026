// src/components/brain-boost/kenken/fallback.tsx
import {
  FALLBACK_HERO,
  FALLBACK_LEVELS,
  FALLBACK_OPERATIONS,
  FALLBACK_STEPS,
  FALLBACK_WHAT_IS,
} from "./fallback-content";
import {
  KenkenCta,
  KenkenHero,
  KenkenLevels,
  KenkenOperations,
  KenkenProse,
  KenkenSteps,
} from "./sections";

export default function KenkenFallback() {
  return (
    <>
      <KenkenHero
        ctaDailyLabel={FALLBACK_HERO.ctaDailyLabel}
        ctaPlayLabel={FALLBACK_HERO.ctaPlayLabel}
        eyebrow={FALLBACK_HERO.eyebrow}
        lede={FALLBACK_HERO.lede}
        title={FALLBACK_HERO.title}
      />
      <KenkenProse fallbackText={FALLBACK_WHAT_IS} heading="What is KenKen?" />
      <KenkenSteps heading="How to play" steps={FALLBACK_STEPS} />
      <KenkenOperations heading="Operations" operations={FALLBACK_OPERATIONS} />
      <KenkenLevels heading="Difficulty levels" levels={FALLBACK_LEVELS} />
      <KenkenCta
        ctaDailyLabel="Today's daily"
        ctaPlayLabel="Play now"
        heading="Ready to solve?"
      />
    </>
  );
}
