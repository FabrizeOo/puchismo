import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { HeroSection, SocialSection, DiscordSection } from '@/components/home-sections';
import { TelegramSection } from '@/components/telegram-section';
import { Footer } from '@/components/footer';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Puchismo | Comunidad de Fútbol en Vivo, Reacciones y Stream',
  description: 'Comunidad futbolera con Bepucho: únete a nuestro Discord y streams en Kick para comentar partidos en vivo, análisis, predicciones y ganar recompensas.',
  path: '/',
});

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.puchismo.com/#organization',
        name: 'Puchismo',
        url: 'https://www.puchismo.com',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://www.puchismo.com/#logo',
          url: 'https://www.puchismo.com/favicon-192x192.png',
          contentUrl: 'https://www.puchismo.com/favicon-192x192.png',
          caption: 'Puchismo Logo',
          width: 192,
          height: 192,
        },
        image: 'https://www.puchismo.com/og-image.jpg',
        sameAs: [
          'https://discord.gg/3DtQkGhtrn',
          'https://kick.com/bepucho',
          'https://t.me/+jpyDeMxokzUzNDgx',
          'https://x.com/bePucho',
          'https://www.instagram.com/bepucho/',
          'https://www.twitch.tv/bepucho',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.puchismo.com/#website',
        url: 'https://www.puchismo.com',
        name: 'Puchismo',
        description: 'Comunidad de fútbol en vivo, reacciones, pronósticos y streams con Bepucho.',
        publisher: {
          '@id': 'https://www.puchismo.com/#organization',
        },
        inLanguage: 'es-PE',
      },
    ],
  };

  return (
    <main className="min-h-screen bg-dark-950 text-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <TelegramSection />
      <SocialSection />
      <DiscordSection />
      <Footer />
    </main>
  );
}
