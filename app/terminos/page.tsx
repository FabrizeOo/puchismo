import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Términos y Condiciones de Uso',
  description: 'Términos de servicio, reglas de la comunidad y condiciones del programa de puntos y recompensas de Puchismo.',
  path: '/terminos',
});

export default function TerminosPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Marco Legal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Términos y Condiciones</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Última actualización: Octubre 2026. Por favor lee atentamente las normas de uso de Puchismo.
          </p>
        </div>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {/* 1. Naturaleza del Servicio */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>1.</span> Naturaleza del Sitio Web y la Comunidad
            </h2>
            <p>
              <strong className="text-white">Puchismo (https://www.puchismo.com)</strong> es una plataforma de contenido deportivo, entretenimiento y fidelización de aficionados creada por <strong className="text-white">Bepucho</strong> (Andres C.).
            </p>
            <p>
              El sitio tiene como objetivo reunir a la afición del fútbol para debatir, analizar estadísticas, participar en dinámicas comunitarias gratuitas y seguir los directos oficiales emitidos a través de plataformas autorizadas como Kick.com.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <strong>Aclaración fundamental:</strong> Puchismo <strong>NO retransmite ni aloja señales audiovisuales de partidos oficiales protegidos por derechos de autor</strong>. Todos los datos de resultados y tablas son provistos mediante APIs públicas de estadísticas deportivas.
            </div>
          </section>

          {/* 2. Normas de Convivencia */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>2.</span> Normas de la Comunidad y Conducta
            </h2>
            <p>
              Al interactuar en el chat integrado de la web, en nuestro servidor de Discord o en los canales asociados, el usuario se compromete a mantener un trato respetuoso:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
              <li>Queda terminantemente prohibido el acoso, la discriminación, el lenguaje de odio o las amenazas a otros usuarios o al streamer.</li>
              <li>No se permite el spam, la difusión de enlaces maliciosos, publicidad no autorizada ni intentos de suplantación de identidad.</li>
              <li>El equipo de moderación se reserva el derecho de silenciar, suspender o expulsar a cualquier infractor de forma temporal o definitiva.</li>
            </ul>
          </section>

          {/* 3. Programa de Puntos */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>3.</span> Programa de Puntos y Recompensas
            </h2>
            <p>
              El sistema de puntos de Puchismo es un <strong>programa de lealtad gratuito y de entretenimiento</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
              <li>Los puntos acumulados <strong>no constituyen moneda fiduciaria, saldo bancario, criptoactivos ni instrumento financiero</strong> alguno.</li>
              <li>Los puntos carecen de valor monetario directo y no son transferibles ni canjeables por dinero en efectivo fuera del catálogo de recompensas ofrecido.</li>
              <li>
                Consulta las condiciones detalladas, límites y sanciones por trampas en nuestra sección dedicada de{' '}
                <Link href="/reglas-recompensas" className="text-emerald-400 underline font-semibold">
                  Reglas del Programa de Recompensas
                </Link>.
              </li>
            </ul>
          </section>

          {/* 4. Enlaces de Terceros */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>4.</span> Enlaces a Terceros y Afiliación Comercial
            </h2>
            <p>
              Este sitio web contiene enlaces a plataformas externas (Discord, Kick, Telegram, YouTube) y a operadores comerciales colaboradores mediante enlaces de afiliado patrocinados (como Bet365).
            </p>
            <p>
              Puchismo no se responsabiliza por los términos, políticas de privacidad o disponibilidad de los servicios provistos por dichos terceros. Te invitamos a leer nuestra divulgación en{' '}
              <Link href="/afiliados" className="text-emerald-400 underline font-semibold">
                Declaración de Afiliados
              </Link>{' '}
              y las pautas de{' '}
              <Link href="/juego-responsable" className="text-emerald-400 underline font-semibold">
                Juego Responsable
              </Link>.
            </p>
          </section>

          {/* 5. Propiedad Intelectual y Procedimiento de Notificación DMCA */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>5.</span> Propiedad Intelectual y Procedimiento de Notificación DMCA / Takedown
            </h2>
            <p>
              La marca Puchismo, logotipos, diseño gráfico, código fuente y contenido original son propiedad exclusiva de Bepucho. Los escudos, marcas comerciales y nombres de equipos o competiciones deportivas pertenecen a sus respectivos titulares y se utilizan únicamente con fines informativos y de referencia periodística/estadística.
            </p>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs sm:text-sm">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                Aviso de Derechos de Autor (DMCA / Retiro de Contenido)
              </h3>
              <p>
                Si consideras que algún archivo, imagen o comprobante subido por usuarios infringe tus derechos de autor o propiedad intelectual, puedes enviar una notificación formal de retiro a nuestro buzón designado:
              </p>
              <p className="font-mono text-emerald-400 font-bold">
                contactopucho@gmail.com (Asunto: &ldquo;Notificación DMCA / Takedown - Puchismo&rdquo;)
              </p>
              <p className="text-[11px] text-gray-400">
                Tu solicitud debe detallar: (a) identificación de la obra protegida, (b) URL o descripción del contenido infractor, (c) datos de contacto del titular o representante legal, y (d) declaración de buena fe. Al recibirla, procederemos a la baja inmediata del contenido tras la verificación técnica.
              </p>
            </div>
          </section>

          {/* 6. Protección de Menores y Requisito de Edad */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>6.</span> Protección de Menores (COPPA y Restricción +18)
            </h2>
            <p>
              Puchismo promueve un entorno digital seguro y responsable:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
              <li>
                <strong>Cumplimiento COPPA (EE. UU.):</strong> No dirigimos nuestros servicios ni recopilamos deliberadamente información personal de niños menores de 13 años. Si detectamos una cuenta perteneciente a un menor de 13 años, eliminaremos sus registros de inmediato.
              </li>
              <li>
                <strong>Mayoría de edad (+18):</strong> El acceso a programas de canjes, quinielas comunitarias y promociones con operadores de apuestas (como Bet365) está <strong>estrictamente reservado a mayores de 18 años (+18)</strong>. Al iniciar sesión o interactuar con dichas áreas, el usuario declara bajo juramento cumplir con la edad legal requerida en su jurisdicción.
              </li>
            </ul>
          </section>

          {/* 7. Jurisdicción */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>7.</span> Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Estos términos se rigen por las leyes de la <strong className="text-white">República del Perú</strong>. Cualquier controversia se someterá a los tribunales competentes de la ciudad de <strong className="text-white">Lima, Perú</strong>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
