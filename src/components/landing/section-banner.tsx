import Image from "next/image";

export type PillarKey = "bits" | "bites" | "blog";

interface SectionBannerProps {
  darkSrc?: string;
  lightSrc?: string;
  pillar: PillarKey;
  title: string;
}

const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 640;

export default function SectionBanner({
  darkSrc,
  lightSrc,
  pillar,
  title,
}: SectionBannerProps) {
  const resolvedLightSrc = lightSrc ?? `/pillers/${pillar}-banner-light.svg`;
  const resolvedDarkSrc = darkSrc ?? `/pillers/${pillar}-banner-dark.svg`;

  return (
    <div className="relative w-full overflow-hidden">
      <Image
        alt={`${title} banner`}
        className="block h-auto w-full dark:hidden"
        height={BANNER_HEIGHT}
        priority
        src={resolvedLightSrc}
        width={BANNER_WIDTH}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="hidden h-auto w-full dark:block"
        height={BANNER_HEIGHT}
        src={resolvedDarkSrc}
        width={BANNER_WIDTH}
      />
    </div>
  );
}
