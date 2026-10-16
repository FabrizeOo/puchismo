import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { StreamSection } from '@/components/stream-section';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Stream en Vivo',
  description: 'Ve el stream en vivo de Bepucho en Kick.com. Transmisiones y fútbol en directo con la comunidad Puchismo.',
  alternates: {
    canonical: '/stream',
  },
};

export default function StreamPage() {
  return (
    <main className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <StreamSection />
      <Footer />
    </main>
  );
}
