import { Navbar } from '@/components/navbar';
import { HeroSection, SocialSection, DiscordSection } from '@/components/home-sections';
import { TelegramSection } from '@/components/telegram-section';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Puchismo',
  description: '¿Quieres ser parte de la comunidad? Únete al Discord de Puchismo para ver partidos de Champions, Premier League, Liga Española, Liga Peruana, Libertadores y más en vivo con Bepucho.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-950 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <TelegramSection />
      <SocialSection />
      <DiscordSection />
      <Footer />
    </main>
  );
}
