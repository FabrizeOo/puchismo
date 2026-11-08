'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KickLogo } from './kick-logo';
import { FaUserCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

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
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [underageError, setUnderageError] = useState(false);

  const handleStartAuth = () => {
    // Si ya confirmó mayoría de edad previamente en esta sesión, redirigir
    const saved = sessionStorage.getItem('puchismo_age_verified');
    if (saved === 'true') {
      window.location.href = '/api/kick/auth?age_verified=1';
      return;
    }
    setShowAgeModal(true);
    setUnderageError(false);
  };

  const handleConfirmAge = () => {
    try {
      sessionStorage.setItem('puchismo_age_verified', 'true');
    } catch {}
    setShowAgeModal(false);
    window.location.href = '/api/kick/auth?age_verified=1';
  };

  const handleRejectAge = () => {
    setUnderageError(true);
    try {
      sessionStorage.setItem('puchismo_age_verified', 'false');
    } catch {}
  };

  return (
    <>
      {compact ? (
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

            <motion.button
              onClick={handleStartAuth}
              data-track="auth-conectar-kick-compact"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(83,252,24,0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-black text-xs uppercase tracking-wider bg-[#53fc18] hover:bg-[#45dc10] transition-all flex items-center justify-center gap-2.5 flex-shrink-0 shadow-[0_0_20px_rgba(83,252,24,0.25)] cursor-pointer"
            >
              <KickLogo className="w-4 h-4" color="#000000" />
              <span>CONECTAR KICK</span>
            </motion.button>
          </div>
        </div>
      ) : (
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Puntos Automáticos</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>OAuth 2.0 Oficial</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Solo +18 Años</span>
              </span>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleStartAuth}
              data-track="auth-conectar-kick-full"
              whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(83,252,24,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-black text-sm uppercase tracking-wider bg-[#53fc18] hover:bg-[#45dc10] transition-all shadow-[0_0_25px_rgba(83,252,24,0.3)] border border-[#53fc18] cursor-pointer"
            >
              <KickLogo className="w-6 h-6 transition-transform group-hover:rotate-12" color="#000000" />
              <span>INICIAR SESIÓN CON KICK</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}

      {/* Modal de Verificación de Mayoría de Edad (COPPA / Términos) */}
      <AnimatePresence>
        {showAgeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-neutral-950 border border-emerald-500/40 shadow-[0_0_50px_rgba(83,252,24,0.2)] text-white text-center space-y-5"
            >
              <button
                onClick={() => setShowAgeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <FaTimes size={16} />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl">
                <FaUserCheck />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Verificación de Edad</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para participar en la comunidad, canjear premios y acceder a dinámicas con patrocinios deportivos, declaras y confirmas que eres mayor de edad (<strong>+18 años</strong>) y no eres menor de 13 años (cumplimiento COPPA).
                </p>
              </div>

              {underageError ? (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-400">
                    <FaExclamationTriangle />
                    <span>Acceso Restringido</span>
                  </div>
                  <p>
                    Lo sentimos. Los servicios de recompensas, canjes y enlaces de patrocinio de Puchismo están estrictamente limitados a mayores de edad (+18). No recopilamos datos de menores de 13 años.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleConfirmAge}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Soy Mayor de 18 (+18)
                  </button>
                  <button
                    onClick={handleRejectAge}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Tengo menos de 18
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
