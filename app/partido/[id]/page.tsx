import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { getMatchDetails, formatLimaTime } from '@/lib/football/service';
import { FaDiscord } from 'react-icons/fa';

export const revalidate = 180; // 3 minutos

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { match } = await getMatchDetails(params.id);
  if (!match) {
    return constructMetadata({
      title: 'Partido no encontrado',
      description: 'Ficha de partido de fútbol.',
      path: `/partido/${params.id}`,
      noIndex: true,
    });
  }

  const { fullLimaStr } = formatLimaTime(match.utcDate);
  const home = match.homeTeam.name;
  const away = match.awayTeam.name;
  const comp = match.competition.name;

  return constructMetadata({
    title: `${home} vs ${away} en Vivo: Horario, Análisis y Previa`,
    description: `Sigue el cruce ${home} vs ${away} por ${comp}. Horario para Perú (${fullLimaStr}), alineaciones previas, datos y debate en vivo con la comunidad de Bepucho.`,
    path: `/partido/${params.id}`,
  });
}

export default async function PartidoDetailPage({ params }: PageProps) {
  const { match, seoAnalysis } = await getMatchDetails(params.id);
  if (!match) notFound();

  const { time, dateStr, fullLimaStr } = formatLimaTime(match.utcDate);
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  // Structured Data JSON-LD SportsEvent
  const sportsEventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    description: seoAnalysis,
    startDate: match.utcDate,
    sport: 'Soccer',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: isFinished
      ? 'https://schema.org/EventMovedOnline'
      : 'https://schema.org/EventScheduled',
    competitor: [
      {
        '@type': 'SportsTeam',
        name: match.homeTeam.name,
        image: match.homeTeam.crest || undefined,
      },
      {
        '@type': 'SportsTeam',
        name: match.awayTeam.name,
        image: match.awayTeam.crest || undefined,
      },
    ],
    organizer: {
      '@type': 'Organization',
      name: match.competition.name,
    },
    location: {
      '@type': 'VirtualLocation',
      url: `https://www.puchismo.com/partido/${params.id}`,
    },
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventJsonLd) }}
      />
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/partidos/hoy" className="hover:text-emerald-400 transition-colors">
            Partidos de Hoy
          </Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">
            {match.competition.name}
          </span>
          <span>/</span>
          <span className="text-emerald-400 truncate">
            {match.homeTeam.shortName || match.homeTeam.name} vs {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>

        {/* Tarjeta Principal del Partido */}
        <div className="p-6 sm:p-10 rounded-3xl bg-neutral-900/90 border border-emerald-500/30 shadow-[0_0_50px_rgba(83,252,24,0.1)] relative overflow-hidden">
          {/* Header de la tarjeta */}
          <div className="text-center space-y-1 mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-emerald-400">
              {match.competition.name}
            </span>
            <p className="text-xs text-gray-400 font-mono pt-1">
              {fullLimaStr}
            </p>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-red-500/20 border border-red-500/40 text-red-400 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                EN VIVO
              </span>
            )}
            {isFinished && (
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300 mt-2">
                FINALIZADO
              </span>
            )}
          </div>

          {/* Versus Visual */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Local */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3 shadow-lg">
                {match.homeTeam.crest ? (
                  <img
                    src={match.homeTeam.crest}
                    alt={`Escudo de ${match.homeTeam.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xl font-black text-gray-400">{match.homeTeam.tla || 'LOC'}</span>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white">{match.homeTeam.name}</h2>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Local</span>
            </div>

            {/* Marcador Central */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-black/80 border border-emerald-500/30 text-2xl sm:text-4xl font-mono font-black text-emerald-400 shadow-inner">
                {isFinished || isLive ? (
                  <span>
                    {match.score?.fullTime?.home ?? 0} : {match.score?.fullTime?.away ?? 0}
                  </span>
                ) : (
                  <span className="text-gray-400 text-lg sm:text-2xl">VS</span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-mono uppercase">
                {isLive ? 'Minuto a minuto' : isFinished ? 'Resultado final' : `Inicio: ${time}`}
              </span>
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3 shadow-lg">
                {match.awayTeam.crest ? (
                  <img
                    src={match.awayTeam.crest}
                    alt={`Escudo de ${match.awayTeam.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xl font-black text-gray-400">{match.awayTeam.tla || 'VIS'}</span>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white">{match.awayTeam.name}</h2>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Visitante</span>
            </div>
          </div>

          {/* CTA Comunidad */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-white">¿Quieres comentar este partido con la banda?</p>
              <p className="text-[11px] text-gray-400">Únete al canal de debate en vivo y gana puntos en stream.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="https://discord.gg/3DtQkGhtrn"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-discord flex-1 sm:flex-none text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <FaDiscord size={16} />
                Comentar en Discord
              </a>
              <Link
                href="/quiniela"
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-xs transition-all text-center"
              >
                Pronosticar en Quiniela →
              </Link>
            </div>
          </div>
        </div>

        {/* Bloque SEO de análisis deportivo autogenerado */}
        <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            Análisis Previo y Contexto del Encuentro
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {seoAnalysis}
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs text-gray-400">
            <p>
              <strong>Fecha y Hora en Lima:</strong> {dateStr} a las {time} (UTC-5).
            </p>
            <p>
              <strong>Torneo:</strong> {match.competition.name}.
            </p>
            <p>
              <strong>Seguimiento de la Comunidad:</strong> Durante el transcurso del encuentro, los hinchas comparten impresiones y pronósticos en vivo en la sala de chat de Puchismo.
            </p>
          </div>
        </section>

        {/* Disclaimer legal */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            <strong>Aclaración importante:</strong> Puchismo es un portal de debate, estadísticas y comunidad de streamers. Este sitio web <strong>no realiza retransmisiones audiovisuales</strong> de partidos oficiales con derechos protegidos.
          </p>
          <p className="text-[11px] text-gray-500">
            Estadísticas y resultados obtenidos mediante la API de football-data.org.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
