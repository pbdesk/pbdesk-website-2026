import Image from "next/image";

export type PillarKey = "bits" | "bites" | "blog";

interface SectionBannerProps {
  pillar: PillarKey;
  title: string;
}

const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 640;

export default function SectionBanner({ pillar, title }: SectionBannerProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <Image
        alt={`${title} banner`}
        className="block h-auto w-full dark:hidden"
        height={BANNER_HEIGHT}
        priority
        src={`/pillers/${pillar}-banner-light.svg`}
        width={BANNER_WIDTH}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="hidden h-auto w-full dark:block"
        height={BANNER_HEIGHT}
        src={`/pillers/${pillar}-banner-dark.svg`}
        width={BANNER_WIDTH}
      />
    </div>
  );
}
