import type { Metadata } from 'next';
import Link from 'next/link';
import { FaFutbol, FaCalendarAlt } from 'react-icons/fa';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { getMatchesToday } from '@/lib/football/service';
import { PartidosHoyClient } from '@/components/partidos-hoy-client';

export const revalidate = 60; // ISR cada 60 segundos

export const metadata: Metadata = constructMetadata({
  title: 'Partidos de Hoy: Horarios en Perú y Resultados en Vivo 24/7',
  description: 'Consulta los partidos de fútbol de hoy, horarios en Lima (Perú), competiciones y resultados en tiempo real constantemente monitorizados con Bepucho.',
  path: '/partidos/hoy',
});

export default async function PartidosHoyPage() {
  const matches = await getMatchesToday();

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-[1920px] mx-auto space-y-8">
        {/* Encabezado con proporción equilibrada */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FaFutbol className="text-[#53fc18]" />
            <span>Agenda Futbolera en Directo</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Partidos de Fútbol de <span className="text-gradient">Hoy</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Horarios sincronizados automáticamente según tu ubicación local. Monitoreo constante de marcadores en vivo, hora exacta y previa deportiva con la comunidad de Bepucho.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/partidos/manana"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
            >
              <FaCalendarAlt size={11} /> Ver partidos de mañana →
            </Link>
            <span className="text-gray-600">·</span>
            <Link
              href="/quiniela"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Ir a la Casa de Apuestas de la Quiniela →
            </Link>
          </div>
        </div>

        {/* Cliente Interactivo de Partidos con Monitoreo 24/7 y Proporción Responsiva */}
        <PartidosHoyClient initialMatches={matches} />

        {/* Disclaimer legal y de proveedor */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            <strong>Aviso legal:</strong> Puchismo es una comunidad de entretenimiento y streamers. Este sitio web no transmite partidos de fútbol en directo.
          </p>
          <p className="text-[11px] text-gray-500">
            Estadísticas y resultados suministrados por football-data.org ajustados a hora oficial de Lima.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
