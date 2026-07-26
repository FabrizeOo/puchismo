import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { GlobalPointsTracker } from '@/components/global-points-tracker';

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
  title: 'Puchismo — Fútbol en Vivo con Bepucho',
  description: 'Comunidad de fútbol en vivo. Únete al Discord de Puchismo para ver los partidos de Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más.',
  keywords: 'puchismo, bepucho, fútbol, champions league, premier league, liga1, libertadores, streaming, kick, discord',
  other: {
    'google-adsense-account': 'ca-pub-5107361201305664',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${poppins.variable} ${inter.variable} font-inter antialiased text-white`} style={{ backgroundColor: '#030b04' }}>
        <GlobalPointsTracker />
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
