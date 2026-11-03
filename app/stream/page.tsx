import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { StreamSection } from '@/components/stream-section';
import { Footer } from '@/components/footer';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Stream en Vivo y Chat Comunitario con Bepucho',
  description: 'Conéctate al stream en vivo de Bepucho en Kick.com: chatea en tiempo real, acumula puntos para la tienda y comparte reacciones futboleras.',
  path: '/stream',
});

export default function StreamPage() {
  return (
    <main className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <StreamSection />
      <Footer />
    </main>
  );
}
