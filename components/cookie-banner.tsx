'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('p_cookie_consent');
      if (!consent) {
        // Retardo sutil para no interrumpir la carga inicial
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('p_cookie_consent', 'accepted');
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-[0_0_40px_rgba(83,252,24,0.15)] backdrop-blur-xl text-white pointer-events-auto"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚽</span>
            <div className="space-y-2">
              <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Privacidad y Analíticas Propias
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Utilizamos almacenamiento local anónimo para medir visitas a las transmisiones y clics de la comunidad. No recopilamos datos personales ni vendemos información a terceros.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Entendido
                </button>
                <Link
                  href="/privacidad"
                  className="text-xs text-gray-400 hover:text-emerald-400 transition-colors underline font-medium"
                >
                  Ver Política
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
