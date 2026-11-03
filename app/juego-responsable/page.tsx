import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaHandsHelping,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';

export const metadata: Metadata = constructMetadata({
  title: 'Juego Responsable y Recursos de Ayuda (+18)',
  description: 'Información de juego responsable, aviso +18, prevención de ludopatía y directorio de Jugadores Anónimos (JA) Grupo Los Pioneros en Lima, Perú.',
  path: '/juego-responsable',
});

const CONTACTS = [
  { name: 'Milagros', phone: '993 170 400', raw: '993170400' },
  { name: 'Ana María', phone: '923 525 377', raw: '923525377' },
  { name: 'Julio N.', phone: '932 995 970', raw: '932995970' },
  { name: 'Víctor (Los Olivos)', phone: '992 527 339', raw: '992527339' },
  { name: 'Jorge G.', phone: '998 169 173', raw: '998169173' },
  { name: 'Richard L.', phone: '982 726 859', raw: '982726859' },
  { name: 'Justo (Cusco)', phone: '984 364 237', raw: '984364237' },
  { name: 'Ayuda a familias (Verónica)', phone: '998 279 866', raw: '998279866' },
  { name: 'Ayuda a familias (María Luz)', phone: '992 736 678', raw: '992736678' },
];

export default function JuegoResponsablePage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-32 sm:pt-40 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FaShieldAlt size={12} />
            <span>Solo Mayores de 18 Años (+18)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Juego Responsable</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            El juego debe ser siempre una forma de diversión, nunca una vía de escape, solución a problemas financieros o fuente de ingresos.
          </p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {/* Declaración de no operador */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-amber-500/30 space-y-3">
            <h2 className="text-xl font-black text-amber-400 flex items-center gap-2.5">
              <FaExclamationTriangle size={18} />
              <span>Puchismo NO es una Casa de Apuestas ni Operador de Juego</span>
            </h2>
            <p className="text-white font-medium">
              Aclaramos categóricamente a toda nuestra comunidad y visitantes:
            </p>
            <p>
              <strong className="text-white">Puchismo no recibe dinero, no gestiona apuestas deportivas, no cobra entradas ni custodia fondos de usuarios</strong>. Cualquier mención a plataformas de apuestas responde a patrocinios comerciales o enlaces de afiliación regulados.
            </p>
            <p>
              Nuestra quiniela comunitaria y el sistema de puntos de stream son <strong>100% gratuitos</strong> y no exigen pago alguno para participar.
            </p>
          </section>

          {/* Advertencia de adicción y riesgos */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <FaShieldAlt className="text-red-400" size={18} />
              <span>El Juego Puede Generar Adicción (Ludopatía)</span>
            </h2>
            <p>
              Apostar en eventos deportivos o participar en juegos de azar conlleva riesgos psicológicos y financieros reales. Si decides registrarte en plataformas de apuestas externas mediante enlaces de patrocinio, ten en cuenta:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
              <li>El acceso a apuestas está legalmente prohibido a menores de 18 años (+18).</li>
              <li>Nunca apuestes dinero que necesites para gastos esenciales (vivienda, alimentación, familia, salud).</li>
              <li>No intentes recuperar pérdidas de forma impulsiva; las rachas negativas forman parte de la probabilidad.</li>
              <li>No juegues bajo los efectos del alcohol, sustancias psicoactivas o estados de estrés y ansiedad.</li>
              <li>Define límites estrictos de tiempo y depósito antes de empezar.</li>
            </ul>
          </section>

          {/* Jugadores Anónimos (JA) - Grupo Los Pioneros (Lima, Perú) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-emerald-500/30 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                <FaHandsHelping size={12} />
                <span>Atención en Lima, Perú</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Jugadores Anónimos — Grupo &ldquo;Los Pioneros&rdquo; (Lima)
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                En Lima, Perú, los grupos de <strong>Jugadores Anónimos (JA)</strong> y de apoyo para familiares cuentan con atención presencial y virtual en el Grupo &ldquo;Los Pioneros&rdquo;.
              </p>
            </div>

            {/* Dirección y ubicación */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaMapMarkerAlt size={16} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Dirección Presencial</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Parroquia Santa María Reina, Av. Conquistadores 1293 (Óvalo Gutiérrez, San Isidro — entrada al área pastoral por la Av. Santa Cruz, 2do piso).
                </p>
              </div>
            </div>

            {/* Horarios de Reuniones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                  <FaUsers size={14} />
                  <span>Reuniones Presenciales</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong>JA:</strong> Lunes, miércoles, jueves y viernes de 7:00 p.m. a 9:00 p.m.
                </p>
                <p className="text-[11px] text-gray-400">
                  Grupo general: Lunes a viernes de 7:00 p.m. a 9:00 p.m.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
                  <FaVideo size={14} />
                  <span>Reuniones Virtuales</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Martes y miércoles de 7:00 p.m. a 9:00 p.m.
                </p>
                <p className="text-[11px] text-gray-400">
                  Acceso vía videollamada previa coordinación.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <FaClock size={14} />
                  <span>Grupos para Familiares</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong>Juga-Anon:</strong> Martes, miércoles, jueves y viernes de 12:00 p.m. a 2:00 p.m.
                </p>
                <p className="text-[11px] text-gray-400">
                  O consulta de familiares con previa coordinación.
                </p>
              </div>
            </div>

            {/* Directorio de Contactos */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaPhoneAlt className="text-emerald-400" size={13} />
                  <span>Números de Contacto (WhatsApp previo recomendado)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {CONTACTS.map((c) => (
                  <a
                    key={c.name}
                    href={`https://wa.me/51${c.raw}?text=Hola,%20busco%20informaci%C3%B3n%20sobre%20Jugadores%20An%C3%B3nimos`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs font-mono text-gray-400">{c.phone}</div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaWhatsapp size={14} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Recursos Internacionales */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <FaExternalLinkAlt className="text-emerald-400" size={16} />
              <span>Organizaciones Internacionales de Apoyo</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://www.begambleaware.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-500/40 transition-all block group"
              >
                <div className="text-emerald-400 font-bold text-sm mb-1 group-hover:underline flex items-center gap-1.5">
                  <span>BeGambleAware</span>
                  <FaExternalLinkAlt size={11} />
                </div>
                <p className="text-xs text-gray-400">
                  Asistencia, información y soporte internacional para prevenir daños relacionados con el juego.
                </p>
              </a>

              <a
                href="https://www.gamblingtherapy.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-500/40 transition-all block group"
              >
                <div className="text-emerald-400 font-bold text-sm mb-1 group-hover:underline flex items-center gap-1.5">
                  <span>Gambling Therapy (Multilingüe)</span>
                  <FaExternalLinkAlt size={11} />
                </div>
                <p className="text-xs text-gray-400">
                  Líneas de ayuda en línea y grupos de apoyo en español para personas afectadas por el juego.
                </p>
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
