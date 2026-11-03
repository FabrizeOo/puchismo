import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Divulgación de Enlaces de Afiliación y Patrocinios',
  description: 'Transparencia sobre nuestros acuerdos comerciales y comisiones de afiliación en Puchismo y streams de Bepucho.',
  path: '/afiliados',
});

export default function AfiliadosPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            🤝 Transparencia Comercial
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Declaración de Afiliados y Publicidad</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            En cumplimiento con las directrices internacionales de transparencia publicitaria (FTC y AdSense), explicamos con total claridad cómo se financia este proyecto.
          </p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {/* Cómo funcionan los enlaces de afiliado */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🔗</span> ¿Qué son los Enlaces de Afiliado?
            </h2>
            <p>
              En <strong className="text-white">Puchismo (https://www.puchismo.com)</strong> encontrarás determinados enlaces que dirigen a sitios de terceros, tales como casas de apuestas deportivas (por ejemplo, Bet365) u otros servicios de entretenimiento.
            </p>
            <p>
              Estos enlaces contienen códigos de seguimiento de afiliación. Esto significa que si haces clic en ellos y te registras o realizas una acción en dicha plataforma externa, <strong className="text-emerald-400">Puchismo puede recibir una comisión económica o compensación publicitaria</strong> por parte del operador comercial.
            </p>
          </section>

          {/* Impacto para el usuario */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>💡</span> ¿Afecta esto al Costo para Ti?
            </h2>
            <p className="text-white font-medium">
              No. El uso de nuestros enlaces de afiliado no genera ningún costo adicional para ti:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
              <li>El precio, cuotas o condiciones ofrecidas por la plataforma externa son exactamente los mismos que si ingresaras de forma directa.</li>
              <li>En muchos casos, el uso del enlace te otorga promociones exclusivas (como los +50 puntos de bienvenida para nuestra tienda comunitaria).</li>
              <li>Los ingresos generados se reinvierten en costear la infraestructura técnica del sitio web y premiar a la comunidad en los directos de Bepucho.</li>
            </ul>
          </section>

          {/* Independencia editorial y responsabilidad */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🛡️</span> Independencia y Juego Responsable
            </h2>
            <p>
              Aunque colaboramos con programas de afiliados seleccionados, mantenemos absoluta independencia en nuestras charlas, opiniones de fútbol y contenido del stream.
            </p>
            <p>
              Recordamos a todos los usuarios que los juegos de azar y apuestas están <strong>estrictamente reservados a mayores de 18 años (+18)</strong> y pueden ocasionar dependencia o problemas económicos. Para más información, visita nuestra sección de{' '}
              <Link href="/juego-responsable" className="text-emerald-400 underline font-semibold">
                Juego Responsable
              </Link>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
