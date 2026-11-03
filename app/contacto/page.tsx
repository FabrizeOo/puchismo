import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { constructMetadata } from '@/lib/seo';
import { FaDiscord, FaTelegramPlane, FaTwitter, FaInstagram, FaTwitch, FaEnvelope } from 'react-icons/fa';

export const metadata: Metadata = constructMetadata({
  title: 'Contacto y Canales Oficiales',
  description: 'Comunícate con el equipo de Puchismo y Bepucho. Dudas sobre la comunidad, puntos de recompensa, propuestas comerciales y soporte.',
  path: '/contacto',
});

export default function ContactoPage() {
  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-28 sm:pt-36 pb-20 px-4 max-w-4xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            📬 Canales Oficiales
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Contacto y Soporte</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            ¿Tienes dudas sobre tus puntos, propuestas comerciales o quieres saludar a la banda? Aquí estamos para responderte.
          </p>
        </div>

        {/* Tarjetas de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quién está detrás */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-emerald-500/20 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>👤</span> ¿Quién está detrás de Puchismo?
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Puchismo es la plataforma y comunidad oficial de fútbol y entretenimiento liderada por{' '}
              <strong className="text-emerald-400">Andres C.</strong>, conocido en internet como{' '}
              <strong className="text-white">Bepucho</strong>.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Domicilio o país de operación: <strong className="text-gray-200">Lima, Perú</strong>.
            </p>
          </section>

          {/* Correo y atención */}
          <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FaEnvelope className="text-emerald-400" /> Correo Electrónico
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Para consultas de soporte, reclamos de recompensas, temas de privacidad de datos o contacto de negocios:
            </p>
            <a
              href="mailto:contactopucho@gmail.com"
              className="inline-block p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 text-emerald-400 font-mono text-sm break-all font-bold hover:bg-emerald-500/10 hover:border-emerald-400 transition-colors"
            >
              contactopucho@gmail.com
            </a>
            <p className="text-gray-400 text-xs">
              Tiempo estimado de respuesta: 24 a 48 horas hábiles.
            </p>
          </section>
        </div>

        {/* Canales comunitarios en vivo */}
        <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white mb-2">Comunidad y Redes en Vivo</h2>
            <p className="text-gray-400 text-sm">
              La forma más rápida de conversar con moderadores y la comunidad es a través de nuestras plataformas activas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://discord.gg/3DtQkGhtrn"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <FaDiscord size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Discord Oficial</h3>
                <p className="text-xs text-gray-400">Canales de debate y tickets de ayuda</p>
              </div>
            </a>

            <a
              href="https://kick.com/bepucho"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <span className="text-lg">🔴</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Kick Channel</h3>
                <p className="text-xs text-gray-400">kick.com/bepucho en directo</p>
              </div>
            </a>

            <a
              href="https://t.me/+jpyDeMxokzUzNDgx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/50 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <FaTelegramPlane size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Canal Telegram</h3>
                <p className="text-xs text-gray-400">Avisos instantáneos y alertas</p>
              </div>
            </a>

            <a
              href="https://x.com/bePucho"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 hover:border-slate-500/50 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                <FaTwitter size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Twitter / X</h3>
                <p className="text-xs text-gray-400">@bePucho</p>
              </div>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
