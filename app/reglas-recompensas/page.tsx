import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Reglas del Programa de Puntos y Recompensas',
  description: 'Conoce cómo ganar puntos viendo directos en Kick, límites de canje, plazos de entrega y normas contra trampas en la comunidad de Puchismo.',
  path: '/reglas-recompensas',
});

export default function ReglasRecompensasPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Sistema de Fidelidad
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Reglas del Programa de Recompensas</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Todo lo que necesitas saber para acumular puntos legalmente, canjear premios y cuidar tu saldo en la comunidad.
          </p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {/* Cómo se ganan los puntos */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              ¿Cómo se Ganan Puntos?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="text-emerald-400 font-bold text-sm flex items-center justify-between">
                  <span>Tiempo en Stream</span>
                  <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono">+0.4 pts / min</span>
                </div>
                <p className="text-xs text-gray-400">
                  Mantén abierta la sección de stream con tu sesión de Kick iniciada mientras Bepucho esté transmitiendo en vivo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="text-emerald-400 font-bold text-sm flex items-center justify-between">
                  <span>Mensajes en el Chat</span>
                  <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono">+1 pt / mensaje</span>
                </div>
                <p className="text-xs text-gray-400">
                  Participa activamente en el chat en tiempo real. Cooldown anti-spam de 30 segundos entre mensajes puntuados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="text-emerald-400 font-bold text-sm flex items-center justify-between">
                  <span>Quiniela y Pronósticos</span>
                  <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono">+10 a +35 pts</span>
                </div>
                <p className="text-xs text-gray-400">
                  Acierta ganador (10 pts) o marcador exacto (35 pts) en los partidos seleccionados de nuestra quiniela gratuita.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="text-amber-400 font-bold text-sm flex items-center justify-between">
                  <span>Promociones de Afiliados</span>
                  <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full font-mono">+50 pts</span>
                </div>
                <p className="text-xs text-gray-400">
                  Completar registros en plataformas patrocinadas como Bet365 y validar el comprobante con moderación.
                </p>
              </div>
            </div>
          </section>

          {/* Límites y Plazos de entrega */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Límites de Acumulación y Plazos de Entrega
            </h2>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-gray-300">
              <li>
                <strong>Límite Diario:</strong> Para mantener una economía justa y balanceada, existe un tope máximo de acumulación pasiva diaria por usuario de <strong className="text-white">[COMPLETAR: ej. 250 puntos por día]</strong>.
              </li>
              <li>
                <strong>Revisión de Canjes:</strong> Cada solicitud de canje ingresa a una cola de moderación. El equipo de Bepucho verifica la legitimidad de los puntos y procesa el premio en un plazo habitual de <strong className="text-white">[COMPLETAR: 24 a 72 horas hábiles]</strong>.
              </li>
              <li>
                <strong>Contacto de Entrega:</strong> Al realizar un canje en la tienda, es obligatorio ingresar un medio de contacto válido (usuario de Discord o Telegram) para coordinar la entrega.
              </li>
            </ul>
          </section>

          {/* Política Anti-Trampa */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-red-500/30 space-y-3">
            <h2 className="text-xl font-black text-red-400 flex items-center gap-2">
              Tolerancia Cero con Trampas y Multicuentas
            </h2>
            <p>
              Queremos premiar a la gente real que apoya el contenido y la pasa bien en los directos. Por ello, las siguientes conductas están terminantemente prohibidas:
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-gray-300">
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span><strong>Uso de bots, macros, scripts automatizados o extensiones de navegador</strong> que simulen actividad o presencia.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span><strong>Creación de cuentas duplicadas o multicuentas</strong> de Kick para acumular puntos simultáneamente.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span><strong>Comprobantes falsos, editados o reutilizados</strong> en promociones de afiliados.</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              <strong>Sanción:</strong> La detección de cualquiera de estas prácticas derivará en el <strong>reseteo inmediato de la totalidad de puntos, cancelación sin reembolso de los canjes pendientes y baneo permanente</strong> de la plataforma y el canal de Kick.
            </div>
          </section>

          {/* Stock y Modificaciones */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Stock, Vigencia y Modificaciones de Premios
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Los premios físicos, digitales o recargas ofrecidos en la tienda están sujetos a <strong>disponibilidad de stock</strong>. La administración de Puchismo se reserva el derecho de actualizar los costos de puntos, agregar nuevos productos, pausar ítems agotados o reemplazar recompensas por alternativas de valor equivalente si existieran problemas de suministro logístico.
            </p>
            <div className="pt-2">
              <Link
                href="/rewards"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md"
              >
                Ir a la Tienda de Recompensas →
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
