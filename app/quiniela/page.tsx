import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { getMatchesToday, getMatchesTomorrow } from '@/lib/football/service';
import { QuinielaClient } from '@/components/quiniela-client';
import { FaDice, FaCoins, FaTrophy } from 'react-icons/fa';

export const revalidate = 60; // 1 minuto para frescura de partidos

export const metadata: Metadata = constructMetadata({
  title: 'Casa de Apuestas de la Quiniela: Apuesta tus Puntos y Multiplica x2 o x3',
  description: 'Apuesta los puntos de tu cuenta de Kick en los partidos de fútbol. Cuotas de riesgo al doble o triple como en una casa de apuestas comunitaria 100% gratuita.',
  path: '/quiniela',
});

export default async function QuinielaPage() {
  const [todayMatches, tomorrowMatches] = await Promise.all([
    getMatchesToday(false, true),
    getMatchesTomorrow(false, true),
  ]);

  // Filtrar partidos que aún no hayan finalizado
  const activeMatches = [...todayMatches, ...tomorrowMatches].filter(
    (m) => m.status !== 'FINISHED' && m.status !== 'CANCELLED'
  );

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-[1920px] mx-auto space-y-8">
        {/* Encabezado con proporción equilibrada */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FaDice size={13} className="text-amber-400" />
            <span>Casa de Apuestas Comunitaria: 100% Con Puntos de la Comunidad</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Casa de Apuestas & Quiniela <span className="text-gradient">Puchismo</span>
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Inicia sesión con tu cuenta de Kick y apuesta tus puntos en los partidos destacados. Según el riesgo del pronóstico, ¡recibirás el <strong className="text-emerald-400 font-bold">doble, triple o cuota especial</strong> directamente en tu saldo para canjear en la tienda de Bepucho!
          </p>

          {/* Reglas de la Casa de Apuestas */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-emerald-500/30 text-xs flex items-center gap-2 shadow-sm">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <FaCoins size={11} /> Cuota 1X2 (~1.9x a 2.5x)
              </span>
              <span className="text-gray-400">Paga el Doble o más al acertar</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-xs flex items-center gap-2 shadow-sm">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <FaTrophy size={11} /> Empates (~3.4x)
              </span>
              <span className="text-gray-400">Mayor riesgo: Paga más del Triple</span>
            </div>
          </div>
        </div>

        {/* Componente interactivo cliente de Casa de Apuestas */}
        <QuinielaClient initialMatches={activeMatches} />

        {/* Disclaimer legal */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            <strong>Juego de Habilidad Comunitario:</strong> La quiniela y apuestas de Puchismo son dinámicas recreativas que utilizan exclusivamente los puntos de lealtad generados en las transmisiones de Kick. Sin dinero fiduciario real ni compra de fichas.
          </p>
          <p className="text-[11px] text-gray-500">
            Los puntos se acreditan y descuentan directamente en la base de datos de la comunidad.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
