'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaExternalLinkAlt, FaCoins, FaCheckCircle } from 'react-icons/fa';

const BET365_AFFILIATE_URL = 'https://bit.ly/BEPUCHO';

export function Bet365BottomBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya lo minimizó en esta sesión
    const isDismissed = sessionStorage.getItem('bet365_bottom_banner_minimized');
    if (isDismissed === 'true') {
      setIsMinimized(true);
      setIsOpen(true);
      return;
    }

    // Mostrar el popup tras 2 segundos para no interrumpir la carga inicial
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleMinimize = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMinimized(true);
    try {
      sessionStorage.setItem('bet365_bottom_banner_minimized', 'true');
    } catch {}
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    try {
      sessionStorage.removeItem('bet365_bottom_banner_minimized');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-lg w-[calc(100%-2rem)] sm:w-auto pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Botón Flotante Minimizado (Píldora de Regalo) */
          <motion.button
            key="minimized-pill"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaximize}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-[#126e51] to-emerald-700 text-white font-bold text-xs shadow-[0_4px_25px_rgba(83,252,24,0.35)] border border-emerald-400/50 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-[#53fc18] animate-ping" />
            <FaGift className="text-amber-300 group-hover:rotate-12 transition-transform" size={14} />
            <span className="font-extrabold tracking-wide">🎁 Bono Bet365 (+50 Pts)</span>
          </motion.button>
        ) : (
          /* Popup Desplegado Completo */
          <motion.div
            key="expanded-card"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#071c14]/98 via-[#030d07]/98 to-[#0b2419]/98 border border-emerald-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(83,252,24,0.2)] backdrop-blur-xl overflow-hidden"
          >
            {/* Resplandor decorativo de fondo */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Botón de Cerrar / Minimizar */}
            <button
              onClick={handleMinimize}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
              title="Minimizar anuncio"
              aria-label="Cerrar anuncio"
            >
              <FaTimes size={13} />
            </button>

            {/* Encabezado con Regalo y Badges */}
            <div className="flex items-center gap-3 pb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0 animate-bounce">
                🎁
              </div>
              <div className="space-y-0.5 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider">
                    Regalo de la Comunidad
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-black uppercase tracking-wider">
                    +18 Solamente
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#53fc18] border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <FaCoins size={9} /> +50 Pts Kick
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                  ¡Bono Exclusivo Bet365!
                </h4>
              </div>
            </div>

            {/* Explicación de los Bonos y Promociones */}
            <div className="space-y-2 py-1">
              <p className="text-xs text-gray-300 leading-relaxed">
                Regístrate con el enlace oficial de <strong className="text-white">Bepucho</strong>, aprovecha las promociones de <strong className="text-emerald-400">bet365</strong> (Duplica tu primer depósito, Super Aumento de Cuotas y Aumentos Exclusivos) y llévate:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-black/50 border border-white/10 flex items-center gap-1.5 text-gray-200">
                  <FaCheckCircle className="text-emerald-400 flex-shrink-0" size={12} />
                  <span>Duplica tu 1er depósito</span>
                </div>
                <div className="p-2 rounded-xl bg-black/50 border border-white/10 flex items-center gap-1.5 text-gray-200">
                  <FaCheckCircle className="text-[#53fc18] flex-shrink-0" size={12} />
                  <span>+50 Pts en la web</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 leading-snug pt-1">
                +18 | Juega con Responsabilidad. Aplican T&C. Premio proporcionado por BEPUCHO. No afiliado, patrocinado ni organizado por bet365.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={BET365_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-[#53fc18] to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Reclamar Bono Bet365</span>
                <FaExternalLinkAlt size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/bet365"
                onClick={() => setIsMinimized(true)}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-xs transition-all text-center whitespace-nowrap"
              >
                Ver cómo funciona →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

