import { Navbar } from '@/components/navbar';
import { StreamSection } from '@/components/stream-section';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Puchismo — Stream en Vivo',
  description: 'Ve el stream en vivo de Bepucho en Kick.com. Mundial 2026 con la comunidad Puchismo.',
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
