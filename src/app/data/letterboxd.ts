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

function parseRatingFromTitle(title: string): number {
  const match = title.match(/ - ([★½]+)$/);
  if (!match) return 0;

  const stars = match[1];
  let rating = 0;
  for (const char of stars) {
    if (char === "★") rating += 1;
    if (char === "½") rating += 0.5;
  }
  return rating;
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
    // If the paragraph contains the poster image, skip it
    if (p.querySelector("img")) continue;

    const text = p.textContent?.trim() ?? "";
    if (!text) continue;

    // Skip generic auto-generated "Watched on" notes if present
    if (/^Watched on /i.test(text)) continue;

    // Skip "This review may contain spoilers" type text
    if (/contains spoilers/i.test(text)) continue;

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

  try {
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

      // Helper to get text from namespaced tags, handling browser variations
      const getTag = (node: Element, tag: string) => {
        // Try standard getElementsByTagName
        const els = node.getElementsByTagName(tag);
        if (els.length > 0) return els[0].textContent;
        // Try with letterboxd: prefix just in case
        const elsNS = node.getElementsByTagName(`letterboxd:${tag}`);
        if (elsNS.length > 0) return elsNS[0].textContent;
        return null;
      };

      let filmTitle =
        getTag(item, "filmTitle")?.trim() ??
        item.querySelector("title")?.textContent?.trim() ??
        "Untitled";

      // Parse rating from title if available (common in Letterboxd RSS)
      let rating = 0;
      const ratingFromTitle = parseRatingFromTitle(filmTitle);

      // Clean title: "Movie Name, Year - ★★★" or "Movie Name - ★★★"
      // 1. Remove rating suffix
      if (ratingFromTitle > 0) {
        filmTitle = filmTitle.replace(/ - [★½]+$/, "").trim();
        rating = ratingFromTitle;
      }

      // Try specific memberRating tag (takes precedence if valid)
      const ratingText = getTag(item, "memberRating");
      if (ratingText) {
        const parsed = Number.parseFloat(ratingText);
        if (!isNaN(parsed) && parsed > 0) {
          rating = parsed;
        }
      }

      const yearText = getTag(item, "filmYear") ?? "0";
      const watchedDate = getTag(item, "watchedDate") ?? "";

      const descriptionCdata = item.querySelector("description")?.textContent ?? "";
      const { poster, review } = parseDescriptionToPosterAndReview(descriptionCdata);

      // 2. Remove ", Year" suffix if it matches the parsed year
      // The RSS title tag is often "Title, Year" if the specific filmTitle tag wasn't found
      const year = Number.parseInt(yearText, 10) || 0;
      if (year > 0) {
        const yearSuffix = `, ${year}`;
        if (filmTitle.endsWith(yearSuffix)) {
          filmTitle = filmTitle.slice(0, -yearSuffix.length).trim();
        }
      }

      // At this stage Letterboxd RSS does not expose director, runtime or genres
      // directly, so we leave them empty / neutral. The UI is updated to handle
      // missing values gracefully.
      const movie: Movie = {
        id: guid,
        title: filmTitle,
        year,
        director: "",
        rating,
        poster, // Prioritize RSS poster
        backdrop: poster,
        review,
        watchedDate,
        runtime: 0,
        genre: [],
      };

      return movie;
    });

    return movies;
  } catch (err) {
    console.warn("Failed to fetch/parse Letterboxd RSS", err);
    return null;
  }
}
