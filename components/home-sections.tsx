'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaTwitch, FaInstagram, FaTwitter, FaTiktok, FaDiscord,
} from 'react-icons/fa';

/* ============================================
   HERO SECTION
   ============================================ */

export function HeroSection() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative min-h-screen pt-28 sm:pt-32 pb-16 flex items-center justify-center overflow-hidden"
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #030b04 0%, rgba(3,11,4,0.85) 50%, #030b04 100%)' }} />
        {/* Orbes de color verde neón */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(83,252,24,0.08)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(45,171,10,0.07)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(83,252,24,0.04)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Grid de fondo */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(83,252,24,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(83,252,24,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Tag animado */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold backdrop-blur"
              style={{ border: '1px solid rgba(83,252,24,0.4)', background: 'rgba(83,252,24,0.1)', color: '#53fc18' }}
            >
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ background: '#53fc18' }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              ⚽ PUCHISMO — FÚTBOL EN VIVO
            </span>
          </motion.div>

          {/* Título principal */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-6xl md:text-7xl xl:text-8xl font-poppins font-black leading-tight tracking-tight">
              <span className="text-white">¿QUIERES SER PARTE</span>
              <br />
              <span className="text-gradient">DE LA COMUNIDAD?</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-4 px-2">
              ¡Accede a nuestro Discord oficial para ver partidos en vivo de la <strong className="text-emerald-400">Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más</strong>!
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
          >
            <motion.a
              href="https://discord.gg/puchismo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-discord text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-2xl"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99, 102, 241, 0.7)' }}
              whileTap={{ scale: 0.97 }}
            >
              <FaDiscord size={20} />
              Únete al Discord para ver los Partidos
            </motion.a>

            <motion.a
              href="https://kick.com/bepucho"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kick text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-2xl"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-lg">🔴</span>
              Verme en Vivo en Kick
            </motion.a>
          </motion.div>

          {/* Separador */}
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="flex items-center gap-4 max-w-xs mx-auto pt-2"
          >
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs sm:text-sm">o sígueme en</span>
            <div className="flex-1 h-px bg-white/10" />
          </motion.div>

          {/* Social mini-icons */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="flex justify-center gap-3 sm:gap-4"
          >
            {[
              { icon: FaTwitch, href: 'https://www.twitch.tv/bepucho', color: '#9146ff' },
              { icon: FaTiktok, href: 'https://www.tiktok.com/@bepucho', color: '#ffffff' },
              { icon: FaTwitter, href: 'https://x.com/bePucho', color: '#1d9bf0' },
              { icon: FaInstagram, href: 'https://www.instagram.com/bepucho/', color: '#e1306c' },
            ].map(({ icon: Icon, href, color }) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-card flex items-center justify-center hover:border-white/40 transition-all"
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={18} style={{ color }} />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden sm:flex"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-electric/50 to-transparent" />
      </motion.div>
    </section>
  );
}

/* ============================================
   SOCIAL SECTION
   ============================================ */

const socials = [
  {
    name: 'Twitch',
    icon: FaTwitch,
    href: 'https://www.twitch.tv/bepucho',
    gradient: 'from-purple-600 to-purple-800',
    glow: 'rgba(145,70,255,0.4)',
    description: 'Streams en vivo de fútbol y más',
    tag: 'VODs & Live',
  },
  {
    name: 'TikTok',
    icon: FaTiktok,
    href: 'https://www.tiktok.com/@bepucho',
    gradient: 'from-gray-800 to-black',
    glow: 'rgba(255,255,255,0.15)',
    description: 'Clips virales, memes y momentazos',
    tag: 'Clips',
  },
  {
    name: 'Twitter / X',
    icon: FaTwitter,
    href: 'https://x.com/bePucho',
    gradient: 'from-slate-700 to-slate-900',
    glow: 'rgba(29,155,240,0.3)',
    description: 'Opiniones y novedades del fútbol',
    tag: 'Noticias',
  },
  {
    name: 'Instagram',
    icon: FaInstagram,
    href: 'https://www.instagram.com/bepucho/',
    gradient: 'from-pink-600 via-rose-500 to-orange-500',
    glow: 'rgba(225,48,108,0.3)',
    description: 'Fotos y contenido detrás de cámaras',
    tag: 'Fotos',
  },
];

export function SocialSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="redes" className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-poppins font-black text-white mb-2">
            Sígueme en <span className="text-gradient">Todas Partes</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">No te pierdas ningún contenido</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {socials.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 sm:p-6 flex flex-col gap-4 group cursor-pointer relative overflow-hidden rounded-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: `0 20px 60px ${s.glow}` }}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-electric bg-electric/10 px-2.5 py-1 rounded-full">
                    {s.tag}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">{s.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="relative z-10 w-full py-2 sm:py-2.5 rounded-xl border border-white/20 text-center text-xs sm:text-sm font-semibold text-white group-hover:bg-white/10 transition-all">
                  Seguir →
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   DISCORD SECTION
   ============================================ */

export function DiscordSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="discord" className="py-16 sm:py-24 px-4 relative overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="glass-card border-indigo-500/30 border-2 p-6 sm:p-12 md:p-16 text-center relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="text-5xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 inline-block"
            animate={{ rotate: [-3, 3, -3], y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaDiscord className="text-indigo-400 mx-auto" style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.8))' }} />
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-4xl md:text-5xl font-poppins font-black mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            ¡Transmisiones en <span className="text-gradient">Discord</span>!
          </motion.h2>

          <motion.p
            className="text-gray-300 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Únete a nuestra comunidad en Discord para disfrutar de todos los partidos en vivo de la <strong className="text-emerald-400">Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más</strong>.
          </motion.p>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            {[
              { emoji: '🏆', text: 'Champions League' },
              { emoji: '🦁', text: 'Premier League' },
              { emoji: '🇪🇸', text: 'Liga Española' },
              { emoji: '🇵🇪', text: 'Liga Peruana & Libs' },
            ].map((b) => (
              <div key={b.text} className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-2.5 sm:p-3">
                <div className="text-xl sm:text-2xl mb-1">{b.emoji}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-300">{b.text}</div>
              </div>
            ))}
          </motion.div>

          <motion.a
            href="https://discord.gg/puchismo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm sm:text-lg shadow-2xl"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaDiscord size={22} />
            ACCEDER AL DISCORD
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
