import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { FaBookOpen, FaFutbol, FaChartBar, FaTrophy, FaGlobeAmericas } from 'react-icons/fa';

export const metadata: Metadata = constructMetadata({
  title: 'Guías de Fútbol, Análisis Táctico y Estadísticas',
  description: 'Artículos editoriales, guías completas sobre el formato de la Champions League, análisis táctico de la Premier League, métricas avanzadas (xG) y fútbol sudamericano.',
  path: '/guias',
});

export default function GuiasPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-12">
        {/* Encabezado */}
        <header className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <FaBookOpen size={12} />
            <span>Archivo Editorial Puchismo</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Guías de Fútbol, Táctica y <span className="text-gradient">Estadísticas</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Análisis en profundidad elaborados para nuestra comunidad. Entiende los reglamentos actuales de los torneos más importantes, cómo leer los datos estadísticos más allá del marcador final y las claves tácticas de cada temporada.
          </p>
        </header>

        {/* Artículo 1 */}
        <article className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <FaTrophy size={13} />
            <span>Competiciones UEFA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Cómo funciona el formato de la Fase de Liga en la UEFA Champions League
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            La UEFA Champions League dejó atrás la clásica fase de grupos de 32 equipos divididos en ocho zonas de cuatro clubes para dar paso a una <strong>Fase de Liga única con 36 participantes</strong>. Este cambio transformó por completo la manera en que los equipos planifican cada jornada europea y elevó la importancia de cada gol anotado o recibido desde la primera fecha.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            En este sistema, cada club disputa ocho partidos frente a ocho rivales distintos (cuatro encuentros como local y cuatro como visitante), seleccionados mediante un sorteo estructurado en cuatro bombos según el coeficiente UEFA. A diferencia del modelo anterior, no existen duelos de ida y vuelta contra los mismos tres rivales en la primera ronda, lo que multiplica la variedad de cruces entre potencias desde septiembre hasta enero.
          </p>
          <h3 className="text-lg font-bold text-white pt-2">Criterios de clasificación y tabla general</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            <li>
              <strong>Puestos 1 al 8:</strong> Clasifican de forma directa a los octavos de final y evitan la ronda de playoffs de febrero, obteniendo además la ventaja de definir la serie de vuelta en casa.
            </li>
            <li>
              <strong>Puestos 9 al 24:</strong> Disputan una eliminatoria a doble partido (playoffs) para definir los otros ocho boletos hacia los octavos de final. Los ubicados del 9 al 16 son cabezas de serie.
            </li>
            <li>
              <strong>Puestos 25 al 36:</strong> Quedan eliminados definitivamente de las competiciones europeas de la temporada, sin descenso a la UEFA Europa League.
            </li>
          </ul>
          <p className="text-gray-300 text-sm leading-relaxed">
            Debido a que 36 equipos compiten en una sola clasificación, la <strong>diferencia de goles</strong> se convirtió en un factor decisivo para desempatar posiciones clave entre el octavo y noveno lugar o entre el puesto 24 y el 25. Puedes seguir la tabla actualizada jornada a jornada en nuestra sección de{' '}
            <Link href="/tabla/champions-league" className="text-emerald-400 underline font-semibold">
              Tabla de la Champions League
            </Link>.
          </p>
        </article>

        {/* Artículo 2 */}
        <article className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <FaChartBar size={13} />
            <span>Análisis y Métricas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Qué son los Goles Esperados (xG) y cómo interpretarlos correctamente
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Al analizar un partido de fútbol, el resultado final muchas veces no refleja con exactitud lo que ocurrió sobre el césped. Un equipo puede dominar territorialmente y generar cinco ocasiones claras frente al arco, pero caer 1-0 por un remate lejano desviado o una actuación sobresaliente del arquero rival. Para medir la calidad real de las oportunidades creadas nació la métrica de <strong>Goles Esperados (xG, por sus siglas en inglés Expected Goals)</strong>.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            El modelo asigna a cada disparo un valor probabilístico entre 0.01 y 0.99 según miles de remates históricos registrados en situaciones similares. Entre las variables principales que determinan el xG de una jugada se encuentran la distancia al arco, el ángulo de tiro, si el remate fue con el pie o de cabeza, el tipo de asistencia previa (centro aéreo, pase filtrado o jugada a balón parado) y la cantidad de defensores entre la pelota y la línea de gol.
          </p>
          <h3 className="text-lg font-bold text-white pt-2">Errores comunes al usar el xG</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Un error habitual es evaluar un solo partido de forma aislada utilizando únicamente el xG acumulado. Esta estadística cobra su verdadero valor predictivo en muestras medianas o largas (de 8 a 15 partidos), donde permite detectar si un delantero atraviesa una racha de mala fortuna frente al arco o si una defensa está concediendo demasiadas ocasiones limpias a pesar de haber mantenido la valla invicta.
          </p>
        </article>

        {/* Artículo 3 */}
        <article className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FaFutbol size={13} />
            <span>Táctica Moderna</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Claves tácticas de la Premier League: presión tras pérdida y amplitud ofensiva
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            La <strong>Premier League</strong> se caracteriza por su ritmo físico sostenido y por la capacidad de sus clubes para ejecutar transiciones defensa-ataque en cuestión de segundos. Uno de los conceptos que domina la liga inglesa en la actualidad es la <strong>presión tras pérdida (gegenpressing)</strong>: en lugar de replegarse inmediatamente cuando se pierde la posesión en campo contrario, los jugadores más cercanos al balón cierran líneas de pase durante los primeros cinco segundos para forzar el error en la salida rival.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Al mismo tiempo, los entrenadores combinan carrileros o extremos pegados a la banda con laterales invertidos que se suman al mediocampo para generar superioridad numérica por el centro. Esta estructura permite abrir defensas cerradas de cinco hombres y proteger mejor los contragolpes rivales. Revisa cómo marchan los equipos ingleses en la{' '}
            <Link href="/tabla/premier-league" className="text-emerald-400 underline font-semibold">
              Tabla de la Premier League
            </Link>{' '}
            y consulta la{' '}
            <Link href="/partidos/hoy" className="text-emerald-400 underline font-semibold">
              agenda de partidos de hoy
            </Link>.
          </p>
        </article>

        {/* Artículo 4 */}
        <article className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <FaGlobeAmericas size={13} />
            <span>Fútbol Sudamericano</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Cómo funcionan las tablas acumuladas y los torneos CONMEBOL
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            A diferencia de la mayoría de ligas europeas con calendario largo de agosto a mayo, el fútbol sudamericano (como la Liga 1 de Perú y diversos torneos de la región) suele dividirse en dos torneos cortos semestrales: <strong>Torneo Apertura y Torneo Clausura</strong>. Esta estructura mantiene la tensión competitiva alta durante todo el año, ya que un equipo que tuvo un arranque irregular en la primera mitad del calendario aún puede pelear por el Clausura y acceder a la definición nacional.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Sin embargo, la regularidad anual sigue siendo fundamental gracias a la <strong>Tabla Acumulada</strong>, que suma todos los puntos obtenidos en ambos torneos. Esa clasificación anual es la que define tanto los cupos internacionales hacia la Copa Libertadores y la Copa Sudamericana como los puestos de descenso a segunda división. Mantener una localía sólida en la altura o en escenarios complejos de la región suele marcar la diferencia entre pelear un torneo continental o quedar fuera en noviembre.
          </p>
        </article>
      </div>

      <Footer />
    </main>
  );
}
