import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { SUPPORTED_LEAGUES, getLeagueStandings } from '@/lib/football/service';

export const revalidate = 900; // 15 minutos

export async function generateStaticParams() {
  return Object.keys(SUPPORTED_LEAGUES).map((liga) => ({ liga }));
}

interface PageProps {
  params: { liga: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const league = SUPPORTED_LEAGUES[params.liga];
  if (!league) {
    return constructMetadata({
      title: 'Tabla de Posiciones no encontrada',
      description: 'Clasificación de fútbol.',
      path: `/tabla/${params.liga}`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `Tabla de Posiciones ${league.name} 2026: Clasificación en Vivo`,
    description: `Consulta la tabla de posiciones actualizada de la ${league.name}. Puntos, partidos jugados, diferencia de goles y últimos resultados en Puchismo.`,
    path: `/tabla/${params.liga}`,
  });
}

export default async function TablaLigaPage({ params }: PageProps) {
  const data = await getLeagueStandings(params.liga);
  if (!data) notFound();

  const { league, groups } = data;
  const currentGroup = groups[0]; // Grupo principal o tabla general

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-5xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">{league.flag}</span>
            <span>Clasificación Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Tabla de Posiciones de la <span className="text-gradient">{league.name}</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl">
            Clasificación oficial de {league.country} actualizada en tiempo real. Sigue a tu equipo favorito, revisa su diferencia de goles y comenta la fecha con la comunidad de Bepucho.
          </p>
        </div>

        {/* Selector de ligas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.entries(SUPPORTED_LEAGUES).map(([slug, item]) => {
            const isActive = slug === params.liga;
            return (
              <Link
                key={slug}
                href={`/tabla/${slug}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-900/80 text-gray-400 hover:text-white hover:bg-neutral-800 border border-white/10'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-black/40 text-gray-300 font-mono text-[10px]">{item.flag}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Tabla */}
        {!currentGroup || currentGroup.table.length === 0 ? (
          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/10 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              La tabla de posiciones de esta competición se encuentra en actualización o en receso entre temporadas.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 font-bold uppercase text-[10px] sm:text-xs">
                    <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                    <th className="py-3 px-3 sm:px-4">Club</th>
                    <th className="py-3 px-2 text-center" title="Partidos Jugados">PJ</th>
                    <th className="py-3 px-2 text-center" title="Ganados">G</th>
                    <th className="py-3 px-2 text-center" title="Empatados">E</th>
                    <th className="py-3 px-2 text-center" title="Perdidos">P</th>
                    <th className="py-3 px-2 text-center hidden md:table-cell" title="Goles a Favor">GF</th>
                    <th className="py-3 px-2 text-center hidden md:table-cell" title="Goles en Contra">GC</th>
                    <th className="py-3 px-2 text-center" title="Diferencia de Goles">DG</th>
                    <th className="py-3 px-3 sm:px-4 text-center font-black text-white">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {currentGroup.table.map((row) => {
                    const isTop4 = row.position <= 4;
                    const isRelegation = row.position >= currentGroup.table.length - 2;

                    return (
                      <tr
                        key={row.team.id}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="py-3 px-3 sm:px-4 text-center font-bold font-mono">
                          <span
                            className={`inline-block w-6 h-6 rounded-lg text-center leading-6 text-xs ${
                              isTop4
                                ? 'bg-emerald-500/20 text-emerald-400 font-black'
                                : isRelegation
                                ? 'bg-red-500/20 text-red-400 font-black'
                                : 'text-gray-400'
                            }`}
                          >
                            {row.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            {row.team.crest ? (
                              <img
                                src={row.team.crest}
                                alt={`Escudo de ${row.team.name}`}
                                className="w-5 h-5 object-contain flex-shrink-0"
                                loading="lazy"
                              />
                            ) : null}
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-none">
                              {row.team.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-gray-300 font-mono">{row.playedGames}</td>
                        <td className="py-3 px-2 text-center text-gray-300 font-mono">{row.won}</td>
                        <td className="py-3 px-2 text-center text-gray-300 font-mono">{row.draw}</td>
                        <td className="py-3 px-2 text-center text-gray-300 font-mono">{row.lost}</td>
                        <td className="py-3 px-2 text-center text-gray-400 font-mono hidden md:table-cell">{row.goalsFor}</td>
                        <td className="py-3 px-2 text-center text-gray-400 font-mono hidden md:table-cell">{row.goalsAgainst}</td>
                        <td className="py-3 px-2 text-center font-mono font-semibold text-gray-300">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center font-black font-mono text-emerald-400 text-sm sm:text-base">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="p-3 sm:p-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 inline-block" />
                <span>Puestos de clasificación europea / destacados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500/40 inline-block" />
                <span>Zona de descenso</span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            <strong>Aviso de datos:</strong> Resultados y clasificaciones provistos por <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">football-data.org</a>.
          </p>
          <p className="text-[11px] text-gray-500">
            Puchismo es una comunidad de aficionados y creadores de contenido. Este sitio web no transmite partidos de fútbol en directo.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
