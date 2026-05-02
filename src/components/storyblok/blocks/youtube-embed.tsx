interface YoutubeEmbedProps {
  caption?: string;
  youtubeId: string;
}

export default function YoutubeEmbed({
  youtubeId,
  caption,
}: YoutubeEmbedProps) {
  return (
    <figure className="my-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-black shadow-[var(--shadow-lg)]">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={caption ?? "Embedded video"}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-[var(--fg-muted)] text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
