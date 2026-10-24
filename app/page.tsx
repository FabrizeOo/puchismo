import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { HeroSection, SocialSection, DiscordSection } from '@/components/home-sections';
import { TelegramSection } from '@/components/telegram-section';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Puchismo | Comunidad de Fútbol en Vivo',
  description: '¿Quieres ser parte de la comunidad? Únete al Discord de Puchismo para ver partidos de Champions, Premier League, Liga Española, Liga Peruana, Libertadores y más en vivo con Bepucho.',
  alternates: {
    canonical: '/',
  },
};

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
        image: 'https://www.puchismo.com/favicon-192x192.png',
        sameAs: [
          'https://discord.gg/3DtQkGhtrn',
          'https://kick.com/bepucho',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.puchismo.com/#website',
        url: 'https://www.puchismo.com',
        name: 'Puchismo',
        description: 'Comunidad de fútbol en vivo con Bepucho.',
        publisher: {
          '@id': 'https://www.puchismo.com/#organization',
        },
        inLanguage: 'es-ES',
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
