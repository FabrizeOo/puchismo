import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Cookies | Puchismo',
  description: 'Conoce cómo protegemos tu privacidad en Puchismo. Sistema de analíticas propias, anónimo y respetuoso con tu información personal.',
  alternates: {
    canonical: '/privacidad',
  },
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            🛡️ Transparencia & Privacidad
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Política de Privacidad y Cookies</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Última actualización: Octubre 2026. En Puchismo creemos en el fútbol en vivo y en la privacidad de nuestra comunidad.
          </p>
        </div>

        {/* Contenido en tarjetas limpias */}
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>1.</span> Analíticas Propias de Primera Parte (First-Party)
            </h2>
            <p>
              En <strong className="text-white">Puchismo (https://www.puchismo.com)</strong> utilizamos un sistema de analíticas desarrollado por nosotros mismos alojado en nuestra propia infraestructura. No vendemos, cedemos ni compartimos datos con redes publicitarias de terceros para rastreo entre sitios.
            </p>
            <p>
              El propósito exclusivo de nuestras métricas es saber qué transmisiones de partidos tienen mayor interés, cuáles son los botones más utilizados (como el canal de Telegram o Discord) y optimizar el rendimiento técnico de la plataforma.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>2.</span> Datos que Registramos y lo que NO Registramos
            </h2>
            <div className="space-y-2">
              <h3 className="font-bold text-emerald-400">Lo que sí medimos de forma anónima:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                <li>Rutas y páginas visitadas (ej. inicio, transmisiones, recompensas).</li>
                <li>Origen o fuente de tráfico (ej. búsqueda de Google, enlaces de Telegram o Discord).</li>
                <li>Clics en enlaces y botones interactivos (como el botón de unirse a Telegram o Discord).</li>
                <li>Información técnica básica del navegador, sistema operativo y tipo de dispositivo (escritorio, móvil o tablet).</li>
                <li>País geográfico aproximado detectado por las cabeceras de red, sin almacenar ubicaciones exactas.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <h3 className="font-bold text-red-400">Lo que NUNCA registramos ni almacenamos:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                <li><strong className="text-white">NO guardamos direcciones IP completas</strong>. Las IPs son descartadas inmediatamente tras procesar la petición y la tasa de peticiones anti-abuso.</li>
                <li><strong className="text-white">NO almacenamos datos personales identificables</strong> a través del script de analíticas (ni nombres reales, correos, documentos de identidad ni contraseñas).</li>
              </ul>
            </div>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>3.</span> Identificadores Anónimos y Sesiones
            </h2>
            <p>
              Para distinguir entre una visita repetida y un visitante único, nuestro script genera un identificador anónimo aleatorio (como un código alfanumérico generado al azar) que se guarda en el almacenamiento local del navegador (<code className="text-emerald-400 font-mono">localStorage</code>).
            </p>
            <p>
              Las sesiones de navegación caducan automáticamente tras 30 minutos de inactividad, tras lo cual se renueva el identificador de sesión sin vincularlo a tu identidad personal.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>4.</span> Respeto a &quot;Do Not Track&quot; (DNT) y Global Privacy Control
            </h2>
            <p>
              Respetamos tu decisión de no ser medido. Si tu navegador tiene activada la señal de cabecera <strong className="text-white">Do Not Track (DNT: 1)</strong> o <strong className="text-white">Global Privacy Control (Sec-GPC)</strong>, nuestro script de analíticas se desactiva de forma automática y no enviará ningún evento ni registro de visita.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>5.</span> Política de Retención y Depuración
            </h2>
            <p>
              Los eventos crudos de navegación se consolidan periódicamente en resúmenes estadísticos diarios agregados. Contamos con una política estricta de depuración automática que purga los registros crudos de más de 90 días, garantizando que la base de datos se mantenga optimizada y sin acumulación innecesaria de registros históricos.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>6.</span> Contacto
            </h2>
            <p>
              Si tienes preguntas sobre nuestra política de privacidad o deseas más información sobre cómo manejamos la comunidad futbolera, puedes contactarnos a través de nuestro Discord oficial o en los canales de transmisión en vivo de Bepucho.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all"
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
