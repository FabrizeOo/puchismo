import type { Metadata } from 'next';

export const SITE_URL = 'https://www.puchismo.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description,
  path = '',
  image = '/og-image.jpg',
  noIndex = false,
}: SeoOptions): Metadata {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const url = `${SITE_URL}${cleanPath}`;
  const fullTitle = cleanPath === '' ? title : `${title} | Puchismo`;
  const absoluteImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title,
    description,
    alternates: {
      canonical: cleanPath || '/',
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Puchismo',
      locale: 'es_PE',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - Puchismo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
      creator: '@bePucho',
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
