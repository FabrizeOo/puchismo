import { Navbar } from '@/components/navbar';
import { HeroSection, SocialSection, DiscordSection } from '@/components/home-sections';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Puchismo — Inicio',
  description: '¿Quieres ser parte de la comunidad? Únete al Discord de Puchismo y ve el Mundial 2026 en vivo con Bepucho.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-950 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <SocialSection />
      <DiscordSection />
      <Footer />
    </main>
  );
}
