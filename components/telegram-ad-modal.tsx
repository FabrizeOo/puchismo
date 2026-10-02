'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTelegramPlane, FaThumbsUp } from 'react-icons/fa';

const TELEGRAM_URL = 'https://t.me/+jpyDeMxokzUzNDgx';
const REAPPEAR_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos (600,000 ms)

export function TelegramAdModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Abrir de inmediato como anuncio al entrar a la página
    setIsOpen(true);

    // Reaparecer periódicamente cada 10 minutos si el usuario se mantiene en la página
    const interval = setInterval(() => {
      setIsOpen(true);
    }, REAPPEAR_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const handleOpenTelegram = () => {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
          {/* Backdrop con desenfoque */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-2xl bg-[#07111e]/95 border-2 border-sky-500/40 rounded-3xl shadow-[0_0_50px_rgba(14,165,233,0.4)] overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/75 hover:bg-black/95 text-white hover:text-red-400 border border-white/20 flex items-center justify-center transition-all shadow-lg hover:scale-110"
              aria-label="Cerrar anuncio"
            >
              <FaTimes size={18} />
            </button>

            {/* Imagen del anuncio con redirección al hacer click */}
            <div
              className="relative group cursor-pointer"
              onClick={handleOpenTelegram}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <Image
                  src="/puchotele.png"
                  alt="Únete al canal de Telegram de Puchismo"
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Resplandor hover */}
              <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* Barra de acción inferior */}
            <div className="p-4 sm:p-5 bg-gradient-to-t from-[#040910] to-[#07111e] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sky-500/20">
              <div className="text-center sm:text-left">
                <p className="text-xs text-sky-400 font-semibold tracking-wider uppercase flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Canal Oficial de Puchismo
                </p>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Noticias, avisos y cuotas diarias exclusivas
                </h4>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenTelegram}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(14,165,233,0.5)] hover:shadow-[0_0_35px_rgba(14,165,233,0.8)] transition-all transform hover:scale-105 active:scale-95"
                >
                  <FaThumbsUp className="text-amber-300 text-base" />
                  <FaTelegramPlane className="text-white text-lg" />
                  <span>Unirme a Telegram</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
