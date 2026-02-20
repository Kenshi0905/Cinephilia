import type { Movie } from "./movies";
import { fetchWithRssProxyFallback } from "./network";

const DETAILS_CACHE_KEY = "cinephilia-details-cache-v1";

function loadDetailsCache(): Record<string, { rating: number; review: string }> {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(DETAILS_CACHE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function saveDetailsCache(cache: Record<string, { rating: number; review: string }>) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(DETAILS_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore
    }
}

export async function enrichMissingDetails(movies: Movie[]): Promise<Movie[]> {
    if (typeof window === "undefined") return movies;

    const cache = loadDetailsCache();
    const updated = [...movies];
    let changed = false;
    let fetchedCount = 0;
    const MAX_FETCH_PER_RUN = 3; // Limit to prevent rate limiting

    for (let i = 0; i < updated.length; i++) {
        const movie = updated[i];

        // Only enrich if review is missing. 
        // If rating is 0 but review exists, maybe they just didn't rate it, so we leave it? 
        // But if both are missing, it's a candidate.
        // The user case is "missing review and note". 
        if (movie.review && movie.review.length > 0) continue;

        // Must have a URL ID (Letterboxd URI)
        if (!movie.id || !movie.id.startsWith("http")) continue;

        const url = movie.id;

        // Check cache
        const cachedData = cache[url];
        if (cachedData) {
            // Apply cached data if it has content
            if (cachedData.review || cachedData.rating > 0) {
                updated[i] = {
                    ...movie,
                    review: cachedData.review || movie.review,
                    rating: cachedData.rating > 0 ? cachedData.rating : movie.rating,
                };
                changed = true;
            }
            continue;
        }

        if (fetchedCount >= MAX_FETCH_PER_RUN) continue;

        try {
            const response = await fetchWithRssProxyFallback(url);
            if (!response.ok) continue;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            let foundReview = "";
            let foundRating = 0;

            // 1. Try JSON-LD (Best for Review and Rating)
            const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
            for (const script of Array.from(scripts)) {
                try {
                    const json = JSON.parse(script.textContent || "{}");

                    // Check for Review type
                    if (json["@type"] === "Review") {
                        if (json.reviewBody) {
                            foundReview = json.reviewBody;
                        }
                        if (json.reviewRating?.ratingValue) {
                            foundRating = parseFloat(json.reviewRating.ratingValue);
                        }
                        break;
                    }
                } catch (e) {
                    // ignore invalid json
                }
            }

            // 2. Fallback: Parse Title or Meta for Rating if JSON-LD failed
            if (foundRating === 0) {
                const metaRating = doc.querySelector('meta[name="twitter:data1"]')?.getAttribute("content");
                // Format: "4.0 stars" or "4 out of 5"
                if (metaRating) {
                    const match = metaRating.match(/([\d.]+)/);
                    if (match) foundRating = parseFloat(match[1]);
                }
            }

            // 3. Fallback: Parse Meta Description for Review if JSON-LD failed
            if (!foundReview) {
                const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
                if (ogDesc) {
                    // Cleanup generic prefixes if possible, though risky.
                    // Letterboxd og:description usually formats as "Review by User: [Review Text]"
                    // or just the text if it's a diary entry?
                    // Actually, it usually includes the review.
                    foundReview = ogDesc;
                }
            }

            if (foundReview || foundRating > 0) {
                cache[url] = { rating: foundRating, review: foundReview };
                updated[i] = {
                    ...movie,
                    review: foundReview || movie.review,
                    rating: foundRating > 0 ? foundRating : movie.rating,
                };
                changed = true;
                fetchedCount++;
            } else {
                // Cache empty result so we don't retry forever? 
                // Or maybe transient failure, so don't cache empty?
                // Let's cache it as empty to stop hammering.
                cache[url] = { rating: 0, review: "" };
                saveDetailsCache(cache); // Early save
            }

        } catch (e) {
            console.warn("Failed to enrich details for", url, e);
        }
    }

    if (changed) {
        saveDetailsCache(cache);
        return updated;
    }

    return movies;
}
