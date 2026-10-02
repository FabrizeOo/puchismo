let cachedIsLive: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 20000; // Cache stream status for 20 seconds

/**
 * Checks if a Kick channel is currently live.
 * 
 * - Queries Kick v1 and v2 API endpoints with standard browser User-Agents.
 * - If stream is offline or null, returns false.
 * - If API is blocked or unreachable, defaults fallback to false (offline) to ensure
 *   points are strictly awarded ONLY during active live streams.
 */
export async function checkIsStreamLive(slug: string = 'bepucho'): Promise<boolean> {
  const now = Date.now();
  if (cachedIsLive !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedIsLive;
  }

  const endpoints = [
    `https://kick.com/api/v1/channels/${slug}`,
    `https://kick.com/api/v2/channels/${slug}`,
  ];

  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];

  for (const endpoint of endpoints) {
    for (const ua of userAgents) {
      try {
        const res = await fetch(endpoint, {
          headers: {
            'User-Agent': ua,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Referer': `https://kick.com/${slug}`,
          },
          next: { revalidate: 20 },
        });

        if (res.ok) {
          const data = await res.json();
          const livestream = data?.livestream;
          const live = Boolean(livestream && livestream?.is_live !== false);
          cachedIsLive = live;
          lastCheckTime = now;
          return live;
        }
      } catch (err) {
        console.error(`[Kick API] Error checking stream status at ${endpoint}:`, err);
      }
    }
  }

  // Fallback to cached state if available, or false (offline)
  return cachedIsLive ?? false;
}
