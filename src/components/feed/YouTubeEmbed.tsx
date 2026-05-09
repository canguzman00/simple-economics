function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  return (
    <div className="w-full">
      <div className="relative w-full rounded-xl overflow-hidden border border-[#2C2417]" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
