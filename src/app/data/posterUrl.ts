type PosterSize = "tiny" | "card" | "detail";

const SIZE_MAP: Record<PosterSize, { width: number; height: number }> = {
  tiny: { width: 96, height: 144 },
  card: { width: 240, height: 360 },
  detail: { width: 700, height: 1050 },
};

function resizeLetterboxdPoster(url: string, width: number, height: number): string {
  if (!url.includes("a.ltrbxd.com/resized/film-poster/")) {
    return url;
  }

  return url.replace(/-0-\d+-0-\d+-crop\./, `-0-${width}-0-${height}-crop.`);
}

export function getOptimizedPosterUrl(url: string, size: PosterSize): string {
  if (!url) return "";
  const target = SIZE_MAP[size];
  return resizeLetterboxdPoster(url, target.width, target.height);
}

export function getOptimizedPosterSrcSet(url: string, widths: number[]): string | undefined {
  if (!url || !url.includes("a.ltrbxd.com/resized/film-poster/")) {
    return undefined;
  }

  const candidates = widths
    .map((width) => {
      const height = Math.round(width * 1.5);
      return `${resizeLetterboxdPoster(url, width, height)} ${width}w`;
    })
    .filter((value, index, arr) => arr.indexOf(value) === index);

  return candidates.length > 0 ? candidates.join(", ") : undefined;
}
