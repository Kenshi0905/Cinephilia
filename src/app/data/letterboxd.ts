import type { Movie } from "./movies";

function getEnvRssUrl(): string | null {
  const url = import.meta.env.VITE_LETTERBOXD_RSS_URL as string | undefined;
  if (url && url.length > 0) return url;

  // Fallback to the user's public Letterboxd RSS feed.
  // This can be overridden via VITE_LETTERBOXD_RSS_URL.
  return "https://letterboxd.com/kenshi05/rss/";
}

function buildFetchUrl(rssUrl: string): string {
  const proxyTemplate = import.meta.env
    .VITE_RSS_PROXY_TEMPLATE as string | undefined;

  // If explicitly disabled, hit the RSS URL directly
  if (proxyTemplate === "none") {
    return rssUrl;
  }

  // If a template is provided, substitute {url}
  if (proxyTemplate && proxyTemplate.length > 0) {
    return proxyTemplate.replace("{url}", encodeURIComponent(rssUrl));
  }

  // Default to a public CORS-friendly proxy for development / personal use
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
}

function parseDescriptionToPosterAndReview(descriptionHtml: string): {
  poster: string;
  review: string;
} {
  if (!descriptionHtml) {
    return { poster: "", review: "" };
  }

  const htmlParser = new DOMParser();
  const doc = htmlParser.parseFromString(descriptionHtml, "text/html");

  const imgEl = doc.querySelector("img");
  const poster = imgEl?.getAttribute("src") ?? "";

  // Collect all paragraph text, skipping the one that only wraps the image
  const paragraphs = Array.from(doc.querySelectorAll("p"));
  const reviewParts: string[] = [];

  for (const p of paragraphs) {
    const text = p.textContent?.trim() ?? "";
    if (!text) continue;

    // Skip generic auto-generated "Watched on" notes if present
    if (/^Watched on /i.test(text)) continue;

    reviewParts.push(text);
  }

  return {
    poster,
    review: reviewParts.join("\n\n"),
  };
}

export async function fetchLetterboxdMovies(): Promise<Movie[] | null> {
  const rssUrl = getEnvRssUrl();
  if (!rssUrl) {
    return null;
  }

  const response = await fetch(buildFetchUrl(rssUrl));
  if (!response.ok) {
    throw new Error(`Letterboxd RSS request failed with status ${response.status}`);
  }

  const xmlText = await response.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  const itemNodes = Array.from(xml.querySelectorAll("channel > item"));

  const movies: Movie[] = itemNodes.map((item, index) => {
    const guid = item.querySelector("guid")?.textContent ?? `letterboxd-item-${index}`;

    const filmTitle =
      item.querySelector("letterboxd\\:filmTitle")?.textContent?.trim() ??
      item.querySelector("title")?.textContent?.trim() ??
      "Untitled";

    const yearText = item.querySelector("letterboxd\\:filmYear")?.textContent ?? "0";
    const ratingText = item.querySelector("letterboxd\\:memberRating")?.textContent ?? "0";
    const watchedDate = item.querySelector("letterboxd\\:watchedDate")?.textContent ?? "";

    const descriptionCdata = item.querySelector("description")?.textContent ?? "";
    const { poster, review } = parseDescriptionToPosterAndReview(descriptionCdata);

    const year = Number.parseInt(yearText, 10) || 0;
    const rating = Number.parseFloat(ratingText) || 0;

    // At this stage Letterboxd RSS does not expose director, runtime or genres
    // directly, so we leave them empty / neutral. The UI is updated to handle
    // missing values gracefully.
    const movie: Movie = {
      id: guid,
      title: filmTitle,
      year,
      director: "",
      rating,
      poster,
      backdrop: poster,
      review,
      watchedDate,
      runtime: 0,
      genre: [],
    };

    return movie;
  });

  return movies;
}
