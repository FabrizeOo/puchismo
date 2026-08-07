let cachedIsLive: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 20000; // Cache stream status for 20 seconds

/**
 * Checks if a Kick channel is currently live.
 * 
 * IMPORTANT FOR DEPLOYMENT:
 * On cloud serverless environments (like Vercel), Cloudflare anti-bot policy frequently
 * returns 403 Forbidden to automated server requests.
 * 
 * - When Kick API responds 200 OK: we check if livestream is null/offline.
 * - When Kick API is blocked by Cloudflare (403/5xx): we fall back to TRUE so that
 *   users on Vercel deployment are NOT blocked from accumulating points.
 */
export async function checkIsStreamLive(slug: string = 'bepucho'): Promise<boolean> {
  const now = Date.now();
  if (cachedIsLive !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedIsLive;
  }

  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];

  for (const ua of userAgents) {
    try {
      const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
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
        const isOffline = data?.livestream === null || data?.livestream?.is_live === false;
        const live = !isOffline;
        cachedIsLive = live;
        lastCheckTime = now;
        return live;
      }
    } catch (err) {
      console.error('[Kick API] Error checking stream status:', err);
    }
  }

  // If Cloudflare blocked Vercel (403) or fetch failed, fall back to cached value or true
  // to ensure points continue awarding properly in deployment.
  return cachedIsLive ?? true;
}
