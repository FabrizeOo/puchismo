import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { GlobalPointsTracker } from '@/components/global-points-tracker';
import { TelegramAdModal } from '@/components/telegram-ad-modal';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.puchismo.com'),
  title: {
    default: 'Puchismo | Comunidad de Fútbol en Vivo',
    template: '%s | Puchismo',
  },
  description: 'Comunidad de fútbol en vivo. Únete al Discord de Puchismo para ver los partidos de Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más.',
  keywords: 'puchismo, bepucho, fútbol, champions league, premier league, liga1, libertadores, streaming, kick, discord',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Puchismo | Comunidad de Fútbol en Vivo',
    description: 'Comunidad de fútbol en vivo con Bepucho. Partidos, streams, recompensas y más.',
    url: 'https://www.puchismo.com',
    siteName: 'Puchismo',
    locale: 'es_ES',
    type: 'website',
  },
  icons: {
    icon: '/logo-pestana.png',
    shortcut: '/logo-pestana.png',
    apple: '/logo-pestana.png',
  },
  other: {
    'google-adsense-account': 'ca-pub-5107361201305664',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${poppins.variable} ${inter.variable} font-inter antialiased text-white`} style={{ backgroundColor: '#030b04' }}>
        <GlobalPointsTracker />
        <TelegramAdModal />
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5107361201305664"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
