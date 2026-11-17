import React from 'react';
import Link from 'next/link';
import { FaFutbol, FaTrophy, FaChartLine, FaQuestionCircle, FaBookOpen } from 'react-icons/fa';

export function EditorialHomeSection() {
  const leagues = [
    {
      name: 'UEFA Champions League',
      href: '/tabla/champions-league',
      desc: 'Seguimiento completo de la máxima competición europea de clubes bajo el nuevo formato de Fase de Liga con 36 equipos, tabla general unificada, clasificación directa a octavos de final y cruces de playoffs.',
    },
    {
      name: 'Premier League',
      href: '/tabla/premier-league',
      desc: 'Análisis jornada a jornada del campeonato inglés: lucha por el título, zona de clasificación a copas europeas, rendimiento de los clubes históricos y estadísticas actualizadas de goles y puntos.',
    },
    {
      name: 'LaLiga EA Sports',
      href: '/tabla/la-liga',
      desc: 'Cobertura de la primera división de España con horarios adaptados automáticamente a tu país, tabla de posiciones al instante y previa de los clásicos y partidos decisivos de cada fecha.',
    },
    {
      name: 'Agenda Diaria de Partidos',
      href: '/partidos/hoy',
      desc: 'Consulta los encuentros programados para hoy y mañana en las principales ligas del mundo, con conversión automática a tu zona horaria local para que no te pierdas ningún pitazo inicial.',
    },
  ];

  const faqs = [
    {
      q: '¿Qué es Puchismo y qué ofrece a los aficionados al fútbol?',
      a: 'Puchismo es una plataforma informativa y comunidad deportiva creada en torno al fútbol internacional y sudamericano. Reunimos en un solo lugar la agenda de partidos de hoy y mañana, tablas de posiciones actualizadas, guías de análisis táctico, transmisiones de reacciones en vivo y una quiniela gratuita comunitaria.',
    },
    {
      q: '¿Los horarios de los partidos se adaptan a mi país?',
      a: 'Sí. Toda la cartelera de partidos en las secciones de Partidos de Hoy y Partidos de Mañana detecta automáticamente la zona horaria de tu navegador (Perú, Argentina, España, México, Colombia, Chile, EE. UU. y más) para mostrarte la hora exacta del encuentro sin necesidad de hacer cálculos manuales.',
    },
    {
      q: '¿La plataforma retransmite partidos de fútbol en vivo?',
      a: 'No. Puchismo respeta estrictamente los derechos de autor y de transmisión audiovisual. No alojamos ni retransmitimos señales de televisión ni streams piratas de partidos oficiales. En nuestra sección de Stream compartimos las reacciones en directo y comentarios de la comunidad.',
    },
    {
      q: '¿Cómo funciona la Quiniela y el programa de puntos?',
      a: 'Es una dinámica recreativa 100% gratuita y sin dinero real. Los miembros que participan activamente en la comunidad y los directos pueden acumular puntos de fidelidad y poner a prueba su criterio futbolístico pronosticando resultados en las jornadas destacadas.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 border-t border-white/10 bg-gradient-to-b from-dark-950 via-[#041106] to-dark-950">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Intro editorial */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FaFutbol size={12} />
            <span>Centro Informativo de Fútbol</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-white">
            Calendario, Tablas y Análisis en un Solo Lugar
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Más allá del chat y los directos, Puchismo funciona como una herramienta diaria para seguir el pulso del fútbol mundial. Organizamos las estadísticas oficiales de las ligas europeas y sudamericanas con información clara, rápida y sin distracciones.
          </p>
        </div>

        {/* Grid de cobertura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leagues.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group p-6 sm:p-7 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 block"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2.5">
                  <FaTrophy className="text-emerald-400 flex-shrink-0" size={16} />
                  <span>{item.name}</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Explorar →
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Destacado a Guías y Análisis */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-black border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <FaBookOpen size={13} />
              <span>Editorial &amp; Táctica</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Guías de Análisis, Reglamentos y Estadísticas Avanzadas
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Lee nuestros artículos explicativos sobre el nuevo formato de la Champions League, cómo interpretar métricas como los goles esperados (xG), las reglas de desempate en las grandes ligas y el análisis táctico del fútbol moderno.
            </p>
          </div>
          <Link
            href="/guias"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 flex-shrink-0"
          >
            <FaChartLine size={15} />
            <span>Leer Guías y Análisis</span>
          </Link>
        </div>

        {/* Preguntas Frecuentes (FAQ) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <FaQuestionCircle className="text-emerald-400" size={20} />
            <h3 className="text-2xl font-black text-white">Preguntas Frecuentes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-2"
              >
                <h4 className="font-bold text-white text-sm sm:text-base">{faq.q}</h4>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
