function isLikelyLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function shouldAttemptBackendApi(apiBaseUrl?: string): boolean {
  if (apiBaseUrl && apiBaseUrl.trim().length > 0) return true;
  if (typeof window === "undefined") return false;
  return !isLikelyLocalHost(window.location.hostname);
}

function getProxyCandidates(targetUrl: string): string[] {
  const proxyTemplate = import.meta.env
    .VITE_RSS_PROXY_TEMPLATE as string | undefined;

  if (proxyTemplate === "none") {
    return [targetUrl];
  }

  const candidates: string[] = [];

  if (proxyTemplate && proxyTemplate.length > 0) {
    candidates.push(proxyTemplate.replace("{url}", encodeURIComponent(targetUrl)));
  }

  candidates.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
  candidates.push(`https://cors.isomorphic-git.org/${targetUrl}`);

  return Array.from(new Set(candidates));
}

export async function fetchWithRssProxyFallback(
  targetUrl: string,
  init?: RequestInit,
): Promise<Response> {
  const candidates = getProxyCandidates(targetUrl);
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, init);
      if (response.ok) {
        return response;
      }

      lastError = new Error(`Request failed with status ${response.status} at ${candidate}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All RSS proxy fetch attempts failed");
}
