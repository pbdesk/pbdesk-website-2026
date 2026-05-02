import { IconArrowLeft, IconClock } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/home/cta-banner";
import PostBody from "@/components/storyblok/blocks/post-body";
import { pillarAccents } from "@/lib/pillars";
import { pageMetadata, SITE_AUTHOR, SITE_URL } from "@/lib/seo";
import { loadAllPostSlugs, loadPostStory } from "@/lib/storyblok/landing";
import type { PillarKey, SbBlokBase } from "@/lib/storyblok/types";
import { normalizeAssetUrl } from "@/lib/storyblok/url";

const VALID_PILLARS: readonly PillarKey[] = ["bits", "bites", "blog"] as const;

function isValidPillar(value: string): value is PillarKey {
  return (VALID_PILLARS as readonly string[]).includes(value);
}

interface RouteParams {
  pillar: string;
  slug: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await loadAllPostSlugs();
  return slugs.map(({ pillar, slug }) => ({ pillar, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { pillar, slug } = await params;
  if (!isValidPillar(pillar)) {
    return {};
  }
  const story = await loadPostStory(pillar, slug);
  if (!story) {
    return {};
  }
  const c = story.content;
  return pageMetadata({
    title: `${c.title} — ${pillar.charAt(0).toUpperCase()}${pillar.slice(1)} on PBDesk`,
    description: c.excerpt,
    path: `/${pillar}/${slug}`,
    ogType: "article",
    ogImage: normalizeAssetUrl(c.cover_image?.filename),
    keywords: c.labels,
  });
}

function PostHeader({
  pillar,
  story,
}: {
  pillar: PillarKey;
  story: NonNullable<Awaited<ReturnType<typeof loadPostStory>>>;
}) {
  const accent = pillarAccents[pillar].primary;
  const c = story.content;
  const cover = normalizeAssetUrl(c.cover_image?.filename);

  return (
    <header className="relative">
      {/* Banner — gradient or cover image */}
      {cover ? (
        <div className="relative aspect-[16/7] w-full overflow-hidden">
          <Image
            alt={c.cover_image?.alt ?? c.title}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={cover}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/70" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={`${c.gradient ?? "post-grad-indigo"} h-72 w-full sm:h-96`}
        />
      )}

      <div className="wrapper relative -mt-24 pb-10 sm:-mt-32">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-lg)] sm:p-10">
          <nav className="mb-5 flex items-center justify-start gap-2 text-[var(--fg-muted)] text-sm">
            <Link
              className="text-[var(--fg-secondary)] hover:underline"
              href="/"
            >
              PBDesk
            </Link>
            <span>/</span>
            <Link
              className="text-[var(--fg-secondary)] hover:underline"
              href={`/${pillar}`}
            >
              {pillar.charAt(0).toUpperCase()}
              {pillar.slice(1)}
            </Link>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">{c.title}</span>
          </nav>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 font-semibold text-white uppercase"
              style={{ background: accent, letterSpacing: "0.05em" }}
            >
              {c.category}
            </span>
            {c.labels?.map((label) => (
              <Link
                className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[var(--fg-secondary)] hover:underline"
                href={`/labels/${encodeURIComponent(label)}`}
                key={label}
              >
                #{label}
              </Link>
            ))}
          </div>

          <h1
            className="mb-4 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {c.title}
          </h1>

          <p
            className="mb-5 text-[var(--fg-secondary)]"
            style={{ fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.7 }}
          >
            {c.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[var(--fg-muted)] text-sm">
            <span>{SITE_AUTHOR}</span>
            {c.published_at ? (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={c.published_at}>
                  {new Date(c.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            ) : null}
            {c.read_time ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <IconClock size={14} stroke={2} />
                  {c.read_time}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function PostFooter({
  pillar,
  externalUrl,
}: {
  externalUrl?: { url?: string };
  pillar: PillarKey;
}) {
  return (
    <section className="border-[var(--border-subtle)] border-t pt-10 pb-16">
      <div className="wrapper">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-1 font-semibold text-[var(--fg-brand)] text-sm hover:underline"
            href={`/${pillar}`}
          >
            <IconArrowLeft size={14} stroke={2} /> Back to{" "}
            {pillar.charAt(0).toUpperCase()}
            {pillar.slice(1)}
          </Link>
          {externalUrl?.url ? (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-[var(--fg-brand)] px-5 py-2.5 font-semibold text-sm text-white transition-transform hover:-translate-y-0.5"
              href={externalUrl.url}
              rel="noopener"
              target="_blank"
            >
              Visit official site →
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { pillar, slug } = await params;
  if (!isValidPillar(pillar)) {
    notFound();
  }
  const story = await loadPostStory(pillar, slug);
  if (!story || story.content.component !== "post") {
    notFound();
  }

  const c = story.content;
  const introBlocks = (c.intro_blocks ?? []) as SbBlokBase[];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: c.title,
    description: c.excerpt,
    keywords: c.labels?.join(", "),
    articleSection: c.category,
    datePublished: c.published_at,
    dateModified: c.updated_at ?? c.published_at,
    author: { "@type": "Person", name: SITE_AUTHOR },
    image: normalizeAssetUrl(c.cover_image?.filename),
    url: `${SITE_URL}/${pillar}/${slug}`,
  };

  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />
      <PostHeader pillar={pillar} story={story} />

      <section className="pb-12">
        <div className="wrapper max-w-3xl">
          <PostBody body={c.body} introBlocks={introBlocks} />
        </div>
      </section>

      <PostFooter externalUrl={c.external_url} pillar={pillar} />

      <CtaBanner />
    </main>
  );
}
