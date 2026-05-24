// src/components/brain-boost/kenken/sections.tsx
import { StoryblokRichText } from "@storyblok/react";
import Image from "next/image";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { Button } from "@/components/ui/button";
import type { LevelCopy, OperationCopy, StepCopy } from "./fallback-content";

const PLAY_HREF = "/brain-boost/kenken/play";
const DAILY_HREF = "/brain-boost/kenken/daily";

export function KenkenHero({
  eyebrow,
  title,
  lede,
  ctaPlayLabel,
  ctaDailyLabel,
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  ctaPlayLabel?: string;
  ctaDailyLabel?: string;
}) {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: BRAIN_BOOST_ACCENT.gradient }}
    >
      <div className="wrapper relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto]">
          <div className="text-center text-white md:text-left">
            {eyebrow ? (
              <span
                className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm text-white"
                style={{ background: "rgb(255 255 255 / 0.18)" }}
              >
                {eyebrow}
              </span>
            ) : null}
            <h1
              className="mt-6 mb-4 font-bold"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h1>
            {lede ? (
              <p
                className="mx-auto mb-8 max-w-2xl text-lg md:mx-0"
                style={{ lineHeight: 1.6 }}
              >
                {lede}
              </p>
            ) : null}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              {ctaPlayLabel ? (
                <Button href={PLAY_HREF}>{ctaPlayLabel}</Button>
              ) : null}
              {ctaDailyLabel ? (
                <Button href={DAILY_HREF} variant="ghost">
                  {ctaDailyLabel}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <Image
              alt="KenKen puzzle preview"
              className="rounded-2xl"
              height={340}
              priority
              src="/pillers/kenken-banner.png"
              style={{ boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.5)" }}
              width={340}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function KenkenProse({
  heading,
  richtext,
  fallbackText,
}: {
  heading?: string;
  richtext?: Parameters<typeof StoryblokRichText>[0]["doc"];
  fallbackText?: string;
}) {
  return (
    <section className="py-12 sm:py-16">
      <div className="wrapper">
        <div className="mx-auto max-w-3xl">
          {heading ? (
            <h2
              className="mb-4 font-bold text-2xl"
              style={{ color: "var(--fg-primary)" }}
            >
              {heading}
            </h2>
          ) : null}
          <div className="post-prose">
            {richtext ? (
              <StoryblokRichText doc={richtext} />
            ) : (
              <p style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}>
                {fallbackText}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function KenkenSteps({
  heading,
  steps,
}: {
  heading?: string;
  steps: StepCopy[];
}) {
  return (
    <section className="bg-[var(--bg-subtle)] py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-3xl">
        {heading ? (
          <h2
            className="mb-6 font-bold text-2xl"
            style={{ color: "var(--fg-primary)" }}
          >
            {heading}
          </h2>
        ) : null}
        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <li className="flex gap-4" key={step.title}>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-sm text-white"
                style={{ background: BRAIN_BOOST_ACCENT.primary }}
              >
                {i + 1}
              </span>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--fg-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function KenkenOperations({
  heading,
  operations,
}: {
  heading?: string;
  operations: OperationCopy[];
}) {
  return (
    <section className="py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-4xl">
        {heading ? (
          <h2
            className="mb-6 font-bold text-2xl"
            style={{ color: "var(--fg-primary)" }}
          >
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {operations.map((op) => (
            <div
              className="rounded-2xl border p-5"
              key={op.name}
              style={{
                borderColor: "var(--border-strong)",
                background: "var(--bg-subtle)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white text-xl"
                  style={{ background: BRAIN_BOOST_ACCENT.primary }}
                >
                  {op.symbol}
                </span>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {op.name}
                </h3>
              </div>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--fg-secondary)", lineHeight: 1.6 }}
              >
                {op.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KenkenLevels({
  heading,
  levels,
}: {
  heading?: string;
  levels: LevelCopy[];
}) {
  return (
    <section className="bg-[var(--bg-subtle)] py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-4xl">
        {heading ? (
          <h2
            className="mb-6 font-bold text-2xl"
            style={{ color: "var(--fg-primary)" }}
          >
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {levels.map((level) => (
            <div
              className="rounded-2xl border p-5"
              key={level.name}
              style={{
                borderColor: "var(--border-strong)",
                background: "var(--bg-page)",
              }}
            >
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--fg-primary)" }}
              >
                {level.name}
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--fg-secondary)" }}
              >
                {level.sizes} · {level.operations}
              </p>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
              >
                {level.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KenkenCta({
  heading,
  ctaPlayLabel,
  ctaDailyLabel,
}: {
  heading?: string;
  ctaPlayLabel?: string;
  ctaDailyLabel?: string;
}) {
  return (
    <section className="py-16 text-center">
      <div className="wrapper">
        {heading ? (
          <h2
            className="mb-6 font-bold text-2xl"
            style={{ color: "var(--fg-primary)" }}
          >
            {heading}
          </h2>
        ) : null}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ctaPlayLabel ? (
            <Button href={PLAY_HREF}>{ctaPlayLabel}</Button>
          ) : null}
          {ctaDailyLabel ? (
            <Button href={DAILY_HREF} variant="secondary">
              {ctaDailyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
