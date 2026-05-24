import Image from "next/image";

export default function BrainBoostHero() {
  return (
    <div className="relative">
      <Image
        alt="Brain Boost — puzzles for focus and mental fitness"
        className="block h-auto w-full"
        height={640}
        priority
        sizes="100vw"
        src="/pillers/brain-boost-banner.png"
        width={1920}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[30%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, var(--bg-page) 100%)",
        }}
      />
    </div>
  );
}
