import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${poppins.variable} ${inter.variable} font-inter antialiased text-white`} style={{ backgroundColor: '#030b04' }}>
        {children}
      </body>
    </html>
  );
}
