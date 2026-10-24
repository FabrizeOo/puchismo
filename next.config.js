/** @type {import('next').NextConfig} */

// Content Security Policy (CSP) estricta que cubre todos los orígenes del proyecto
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.google-analytics.com https://*.analytics.google.com https://player.kick.com https://kick.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://flagcdn.com https://crests.football-data.org https://media.api-sports.io https://*.cloudinary.com https://upload.wikimedia.org https://*.kick.com https://kick.com https://*.supabase.co;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.google-analytics.com https://*.analytics.google.com https://*.pusher.com wss://*.pusher.com https://id.kick.com https://api.kick.com https://*.kick.com https://*.supabase.co wss://*.supabase.co https://api.football-data.org;
  frame-src 'self' https://player.kick.com https://kick.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://id.kick.com;
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspHeader },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '*.kick.com' },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'puchismo.com' }],
        destination: 'https://www.puchismo.com/:path*',
        permanent: true,
      },
      {
        source: '/inicio',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Headers globales de seguridad y control de caché para páginas dinámicas y HTML
        source: '/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Assets estáticos de Next.js con hash en el nombre
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        // Íconos, favicon y manifest para permitir su indexación y rastreo cross-origin por Googlebot
        source: '/(favicon.*|apple-touch-icon.*|site\\.webmanifest|logo.*|\\.well-known/.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=86400' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        // Rutas de API: No cache, restricción estricta de CORS
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Access-Control-Allow-Origin', value: 'https://www.puchismo.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
