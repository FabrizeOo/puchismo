'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  FaTwitch, FaInstagram, FaTwitter, FaTiktok, FaDiscord, FaTelegramPlane,
  FaFutbol, FaCalendarAlt, FaTrophy, FaCrosshairs, FaCrown, FaShieldAlt
} from 'react-icons/fa';

/* ============================================
   HERO SECTION
   ============================================ */

export function HeroSection() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] pt-28 sm:pt-36 pb-16 flex flex-col justify-center overflow-hidden"
    >
      {/* Fondo ambiental */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #030b04 0%, rgba(3,11,4,0.92) 50%, #030b04 100%)' }} />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full pointer-events-none transform-gpu"
          style={{ background: 'radial-gradient(circle, rgba(83,252,24,0.14) 0%, rgba(83,252,24,0) 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full pointer-events-none transform-gpu"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0) 70%)' }}
          animate={{ scale: [1.12, 1, 1.12], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(83,252,24,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(83,252,24,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero Principal Centrado y de Gran Impacto */}
        <div className="max-w-4xl mx-auto space-y-7 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-poppins font-black leading-tight tracking-tight text-white">
              ¿QUIERES SER PARTE <br />
              <span className="text-gradient">DE LA COMUNIDAD?</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              ¡Accede a nuestro Discord oficial para comentar y vivir juntos cada fecha de la{' '}
              <strong className="text-emerald-400 font-bold">
                Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más
              </strong>!
            </p>
          </motion.div>

          {/* Acciones principales (CTAs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center"
          >
            <motion.a
              href="https://discord.gg/3DtQkGhtrn"
              target="_blank"
              rel="noopener noreferrer"
              data-track="hero-unirse-discord"
              className="btn-discord text-sm sm:text-base px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-xl shadow-indigo-600/30"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaDiscord size={22} />
              Únete al Discord y vive el fútbol
            </motion.a>

            <motion.a
              href="https://t.me/+jpyDeMxokzUzNDgx"
              target="_blank"
              rel="noopener noreferrer"
              data-track="hero-unirse-telegram"
              className="btn-telegram text-sm sm:text-base px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-xl shadow-sky-600/25"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTelegramPlane size={22} />
              Unirme a Telegram
            </motion.a>

            <motion.a
              href="https://kick.com/bepucho"
              target="_blank"
              rel="noopener noreferrer"
              data-track="hero-ver-kick-live"
              className="btn-kick text-sm sm:text-base px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-xl shadow-emerald-500/20"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
              Verme en Vivo en Kick
            </motion.a>
          </motion.div>

          {/* Redes sociales secundarias */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-2 flex items-center justify-center gap-3"
          >
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sígueme en:</span>
            <div className="flex gap-2.5">
              {[
                { icon: FaTwitch, href: 'https://www.twitch.tv/bepucho', color: '#9146ff', track: 'hero-mini-twitch' },
                { icon: FaTiktok, href: 'https://www.tiktok.com/@bepucho', color: '#ffffff', track: 'hero-mini-tiktok' },
                { icon: FaTwitter, href: 'https://x.com/bePucho', color: '#1d9bf0', track: 'hero-mini-twitter' },
                { icon: FaInstagram, href: 'https://www.instagram.com/bepucho/', color: '#e1306c', track: 'hero-mini-instagram' },
              ].map(({ icon: Icon, href, color, track }) => (
                <motion.a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={track}
                  className="w-10 h-10 rounded-xl bg-neutral-900/90 border border-white/10 flex items-center justify-center hover:border-white/30 transition-all"
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon size={18} style={{ color }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Grilla Gestalt de 4 Tarjetas de Acceso Maestro (Aprovechamiento total del espacio) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="pt-14 sm:pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Link
            href="/partidos/hoy"
            prefetch={true}
            className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-emerald-500/50 hover:bg-neutral-900/90 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-emerald-400 text-xl"><FaFutbol /></span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                En Vivo
              </span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Partidos de Hoy</h4>
            <p className="text-xs text-gray-400 mt-1">Horarios oficiales de Lima (UTC-5), marcadores y previas.</p>
          </Link>

          <Link
            href="/partidos/manana"
            prefetch={true}
            className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-emerald-500/50 hover:bg-neutral-900/90 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-sky-400 text-xl"><FaCalendarAlt /></span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                Fixture
              </span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">Partidos de Mañana</h4>
            <p className="text-xs text-gray-400 mt-1">Agenda de las mejores ligas del mundo con hora local.</p>
          </Link>

          <Link
            href="/quiniela"
            prefetch={true}
            className="p-5 rounded-2xl bg-neutral-900/70 border border-amber-500/30 hover:border-amber-400 hover:bg-neutral-900/90 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-amber-400 text-xl"><FaCrosshairs /></span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Gana Puntos
              </span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Casa de Apuestas</h4>
            <p className="text-xs text-gray-400 mt-1">Apuesta con tus puntos de Kick: cuotas 1X2 al doble y triple.</p>
          </Link>

          <Link
            href="/rewards"
            prefetch={true}
            className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-purple-500/50 hover:bg-neutral-900/90 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-purple-400 text-xl"><FaCrown /></span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Tienda
              </span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">Canje de Premios</h4>
            <p className="text-xs text-gray-400 mt-1">Reclama dinero en efectivo, camisetas, cosplay y comidas.</p>
          </Link>
        </motion.div>
      </div>
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
                data-track={`social-card-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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
            ¡La Casa de la Comunidad en <span className="text-gradient">Discord</span>!
          </motion.h2>

          <motion.p
            className="text-gray-300 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Únete a nuestra comunidad en Discord para comentar en vivo, reaccionar y debatir cada fecha de la <strong className="text-emerald-400">Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más</strong>.
          </motion.p>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: FaTrophy, text: 'Champions League', color: '#fbbf24' },
              { icon: FaCrown, text: 'Premier League', color: '#a78bfa' },
              { icon: FaFutbol, text: 'LaLiga EA Sports', color: '#f87171' },
              { icon: FaShieldAlt, text: 'Liga 1 & Libs', color: '#34d399' },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.text} className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-2.5 sm:p-3 flex flex-col items-center">
                  <Icon className="text-xl sm:text-2xl mb-1.5" style={{ color: b.color }} />
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-300">{b.text}</div>
                </div>
              );
            })}
          </motion.div>

          <motion.a
            href="https://discord.gg/3DtQkGhtrn"
            target="_blank"
            rel="noopener noreferrer"
            data-track="discord-section-acceder"
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
