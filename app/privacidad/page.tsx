import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Política de Privacidad y Gestión de Cookies',
  description: 'Conoce cómo tratamos tus datos en Puchismo: analíticas propias, Google AdSense, cookies de afiliación, login seguro con Kick y ejercicio de tus derechos.',
  path: '/privacidad',
});

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Transparencia & Privacidad
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Política de Privacidad y Cookies</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Última actualización: Octubre 2026. En Puchismo protegemos la privacidad de nuestra comunidad informando de manera clara y transparente sobre cada tecnología que utilizamos.
          </p>
        </div>

        {/* Contenido en tarjetas limpias */}
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {/* 1. Responsable del Tratamiento */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>1.</span> Responsable del Tratamiento de los Datos
            </h2>
            <p>
              El responsable del tratamiento de los datos recabados en <strong className="text-white">https://www.puchismo.com</strong> es <strong className="text-white">Andres C.</strong> (en adelante &quot;Puchismo&quot; o &quot;Bepucho&quot;), con domicilio de contacto en <strong className="text-white">Lima, Perú</strong> y correo electrónico de contacto <strong className="text-emerald-400">contactopucho@gmail.com</strong>.
            </p>
          </section>

          {/* 2. Publicidad de Terceros - Google AdSense */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>2.</span> Publicidad de Terceros (Google AdSense y Redes Asociadas)
            </h2>
            <p>
              Este sitio web utiliza servicios publicitarios de <strong className="text-white">Google AdSense</strong> (Google LLC) para financiar el mantenimiento de los servidores y el soporte a la comunidad.
            </p>
            <p>
              Google y sus socios publicitarios utilizan cookies para publicar anuncios en nuestro sitio basados en visitas anteriores de los usuarios a esta u otras páginas web en Internet:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>
                Las cookies de publicidad permiten a Google y a sus proveedores mostrar anuncios orientados o contextuales según el consentimiento otorgado.
              </li>
              <li>
                Puedes inhabilitar la publicidad personalizada a través del panel de configuración de anuncios de Google en{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline font-semibold"
                >
                  adssettings.google.com ↗
                </a>{' '}
                o mediante el portal{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline font-semibold"
                >
                  aboutads.info/choices ↗
                </a>.
              </li>
              <li>
                En Puchismo disponemos de un <strong>Banner de Consentimiento de Cookies</strong> que bloquea la carga de cookies y scripts publicitarios hasta que expreses tu aceptación voluntaria.
              </li>
            </ul>
          </section>

          {/* 3. Enlaces de Afiliación y Terceros */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>3.</span> Enlaces de Afiliación Comercial (Bet365 y Otros)
            </h2>
            <p>
              Participamos en programas de afiliados. Cuando haces clic en un enlace de patrocinio (por ejemplo, enlaces a Bet365), la plataforma de destino puede almacenar cookies en tu navegador para identificar que la visita provino de Puchismo y registrar la atribución correspondiente.
            </p>
            <p>
              Estas cookies son gestionadas directamente por el operador externo según sus propias políticas de privacidad. Te recomendamos revisar sus condiciones antes de interactuar. Para más detalles, consulta nuestra{' '}
              <Link href="/afiliados" className="text-emerald-400 underline font-semibold">
                Declaración de Afiliados
              </Link>.
            </p>
          </section>

          {/* 4. Login OAuth con Kick */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>4.</span> Inicio de Sesión con Kick (OAuth 2.0)
            </h2>
            <p>
              Para participar en el sistema de recompensas, tienda comunitaria y quinielas, ofrecemos la opción de iniciar sesión mediante la API oficial de Kick (Kick.com).
            </p>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-xs sm:text-sm">¿Qué datos recibimos de Kick?</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm">
                <li><strong className="text-white">ID único de usuario de Kick</strong> y nombre de usuario público.</li>
                <li><strong className="text-white">Slug de canal y foto de perfil pública</strong> (avatar).</li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-white text-xs sm:text-sm">¿Para qué usamos estos datos?</h3>
              <p className="text-xs sm:text-sm">
                Únicamente para asociar de forma segura tus horas de visualización en directo, participaciones en el chat, predicciones de la quiniela y saldo de puntos en la tienda de recompensas. <strong>Nunca solicitamos ni tenemos acceso a tu contraseña, correo privado de Kick, métodos de pago ni datos sensibles</strong>.
              </p>
            </div>
          </section>

          {/* 5. Analíticas Propias de Primera Parte */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>5.</span> Analíticas Propias de Primera Parte (First-Party)
            </h2>
            <p>
              En Puchismo medimos el rendimiento técnico de la web mediante un sistema propio alojado en nuestra infraestructura:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm">
              <li>Páginas visitadas, origen de tráfico y clics en elementos de la interfaz.</li>
              <li>Tipo de dispositivo, navegador y país aproximado (sin geolocalización exacta ni IPs almacenadas completas).</li>
              <li>Respeto estricto a las señales del navegador <strong>Do Not Track (DNT)</strong> y <strong>Global Privacy Control (GPC)</strong>: si están activadas, nuestro sistema no registra ningún evento.</li>
            </ul>
          </section>

          {/* 6. Ejercicio de Derechos */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>6.</span> Ejercicio de Derechos (Acceso, Rectificación y Cancelación)
            </h2>
            <p>
              En concordancia con el Reglamento General de Protección de Datos (GDPR) y la legislación de protección de datos personales de Perú (Ley N° 29733), tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>Conocer qué datos tenemos asociados a tu cuenta de Kick o puntos de recompensas.</li>
              <li>Solicitar la rectificación o actualización de cualquier dato erróneo.</li>
              <li>Solicitar la <strong>eliminación total de tu perfil, historial de puntos y reclamos</strong> en cualquier momento.</li>
              <li>Revocar el consentimiento otorgado para cookies en cualquier momento borrando el almacenamiento local del navegador o mediante nuestro banner de configuración.</li>
            </ul>
            <p className="pt-2 text-xs sm:text-sm">
              Para ejercer cualquiera de estos derechos, envía una solicitud formal indicando tu usuario de Kick a:{' '}
              <strong className="text-emerald-400 font-mono">contactopucho@gmail.com</strong>. Atenderemos tu petición en un plazo máximo de 10 días hábiles.
            </p>
            <div className="pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-md"
              >
                ← Volver al Inicio
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
