import type { Metadata } from 'next';
import Link from 'next/link';
import { FaCalendarAlt, FaFutbol } from 'react-icons/fa';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { getMatchesTomorrow } from '@/lib/football/service';
import { PartidosMananaClient } from '@/components/partidos-manana-client';

export const revalidate = 600; // ISR cada 10 minutos

export const metadata: Metadata = constructMetadata({
  title: 'Partidos de Mañana: Calendario y Horarios Dinámicos',
  description: 'Conoce los partidos de fútbol programados para mañana, fixture de ligas europeas y torneos internacionales con horario adaptado a tu ubicación.',
  path: '/partidos/manana',
});

export default async function PartidosMananaPage() {
  const matches = await getMatchesTomorrow();

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-[1920px] mx-auto space-y-8">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FaCalendarAlt className="text-[#53fc18]" />
            <span>Próximos Encuentros</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Partidos de Fútbol de <span className="text-gradient">Mañana</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Prepárate para la jornada deportiva con los horarios oficiales ajustados automáticamente según tu ubicación local. Participa en nuestra quiniela comunitaria antes del pitazo inicial y apuesta tus puntos.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/partidos/hoy"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
            >
              <FaFutbol size={11} /> Ver partidos de hoy
            </Link>
            <span className="text-gray-600">·</span>
            <Link
              href="/quiniela"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Hacer pronóstico en la Casa de Apuestas de la Quiniela →
            </Link>
          </div>
        </div>

        {/* Lista de partidos con Hora Grande y Zona Horaria Dinámica */}
        <PartidosMananaClient initialMatches={matches} />

        {/* Disclaimer legal y de proveedor */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            <strong>Aviso legal:</strong> Puchismo no realiza transmisiones en directo de partidos con derechos reservados.
          </p>
          <p className="text-[11px] text-gray-500">
            Datos y fixture provistos por la API oficial de football-data.org.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
