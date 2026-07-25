export function getAppUrl(req?: Request): string {
  // 1. Check if NEXT_PUBLIC_APP_URL is set and valid for production
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== '') {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
    if (!url.includes('localhost')) {
      return url;
    }
  }

  // 2. Infer dynamically from Request headers (Vercel, custom domain, local proxy)
  if (req) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    if (host) {
      return `${proto}://${host}`;
    }
  }

  // 3. Vercel deployment automatic URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  // 4. Fallback default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
