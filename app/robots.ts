import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/favicon.ico',
          '/favicon-*.png',
          '/apple-touch-icon.png',
          '/favicon.svg',
          '/site.webmanifest',
          '/logo.png',
          '/logo.webp',
        ],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/favicon.ico',
          '/favicon-*.png',
          '/apple-touch-icon.png',
          '/favicon.svg',
          '/site.webmanifest',
          '/logo.png',
          '/logo.webp',
          '/icon.png',
        ],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://www.puchismo.com/sitemap.xml',
  };
}

