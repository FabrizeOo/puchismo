import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { GlobalPointsTracker } from '@/components/global-points-tracker';
import { TelegramAdModal } from '@/components/telegram-ad-modal';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { CookieBanner } from '@/components/cookie-banner';

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
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'google-adsense-account': 'ca-pub-5107361201305664',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-inter antialiased text-white`} style={{ backgroundColor: '#030b04' }}>
        <AnalyticsTracker />
        <GlobalPointsTracker />
        <TelegramAdModal />
        <CookieBanner />
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
