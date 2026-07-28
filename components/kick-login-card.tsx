'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KickLogo } from './kick-logo';

interface KickLoginCardProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function KickLoginCard({
  title = "Inicia Sesión con Kick",
  subtitle = "Conecta tu cuenta para acumular puntos viendo el stream, chateando y reclamando premios exclusivos.",
  compact = false,
}: KickLoginCardProps) {
  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-950/95 to-black border border-[#53fc18]/40 p-5 shadow-[0_0_40px_rgba(83,252,24,0.12)]">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#53fc18]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-black border border-[#53fc18]/50 flex items-center justify-center shadow-[0_0_20px_rgba(83,252,24,0.3)] flex-shrink-0">
              <KickLogo className="w-6 h-6" color="#53FC18" />
            </div>
            <div>
              <span className="text-white font-black text-sm sm:text-base block tracking-tight">
                {title}
              </span>
              <span className="text-gray-400 text-xs block">
                {subtitle}
              </span>
            </div>
          </div>

          <motion.a
            href="/api/kick/auth"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(83,252,24,0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-black text-xs uppercase tracking-wider bg-[#53fc18] hover:bg-[#45dc10] transition-all flex items-center justify-center gap-2.5 flex-shrink-0 shadow-[0_0_20px_rgba(83,252,24,0.25)]"
          >
            <KickLogo className="w-4 h-4" color="#000000" />
            <span>CONECTAR KICK</span>
          </motion.a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-950/95 to-black border border-[#53fc18]/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(83,252,24,0.15)] text-center">
      {/* Background neon glows */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#53fc18]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#53fc18]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center space-y-6">
        {/* Kick Logo Header & Glow Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#53fc18] to-emerald-400 opacity-75 blur transition duration-500 group-hover:opacity-100" />
          <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black border border-[#53fc18]/60 shadow-[0_0_20px_rgba(83,252,24,0.3)]">
            <KickLogo className="w-7 h-7" color="#53FC18" />
            <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase">
              AUTENTICACIÓN OFICIAL <span className="text-[#53fc18]">KICK</span>
            </span>
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Perks pill list */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5 font-semibold">
            ⚡ <span>Puntos Automáticos</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5 font-semibold">
            🔒 <span>OAuth 2.0 Oficial</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5 font-semibold">
            🎁 <span>Premios Exclusivos</span>
          </span>
        </div>

        {/* CTA Button */}
        <motion.a
          href="/api/kick/auth"
          whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(83,252,24,0.5)' }}
          whileTap={{ scale: 0.97 }}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-black text-sm uppercase tracking-wider bg-[#53fc18] hover:bg-[#45dc10] transition-all shadow-[0_0_25px_rgba(83,252,24,0.3)] border border-[#53fc18]"
        >
          <KickLogo className="w-6 h-6 transition-transform group-hover:rotate-12" color="#000000" />
          <span>INICIAR SESIÓN CON KICK</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
}
