'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaCog, FaCheck, FaTimes } from 'react-icons/fa';
import {
  getCookieConsent,
  saveCookieConsent,
  hasDntOrGpcEnabled,
  CookiePreferences,
} from '@/lib/consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [allowMarketing, setAllowMarketing] = useState(false);

  useEffect(() => {
    // Si el usuario ya tiene DNT o GPC activo, por defecto marketing y analytics inician en false
    const dnt = hasDntOrGpcEnabled();
    if (dnt) {
      setAllowAnalytics(false);
      setAllowMarketing(false);
    }

    const consent = getCookieConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({
      analytics: true,
      marketing: true,
      status: 'accepted_all',
    });
    setVisible(false);
    setShowConfig(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent({
      analytics: false,
      marketing: false,
      status: 'rejected_all',
    });
    setVisible(false);
    setShowConfig(false);
  };

  const handleSaveCustom = () => {
    saveCookieConsent({
      analytics: allowAnalytics,
      marketing: allowMarketing,
      status: 'custom',
    });
    setVisible(false);
    setShowConfig(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 p-5 rounded-3xl bg-neutral-950/98 border border-emerald-500/30 shadow-[0_0_50px_rgba(83,252,24,0.18)] backdrop-blur-2xl text-white pointer-events-auto"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <FaShieldAlt size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Tu Privacidad y Elección de Cookies</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  En Puchismo utilizamos cookies técnicas esenciales, analíticas propias y cookies publicitarias de Google AdSense para financiar la comunidad. Respetamos las señales DNT y GPC de tu navegador.
                </p>
              </div>
            </div>

            {/* Panel de configuración avanzada */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 pt-2 border-t border-white/10 text-xs"
                >
                  {/* Necesarias */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Técnicas y Sesión</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase font-mono">
                          Siempre activas
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Login con Kick, saldo de puntos y preferencias del sitio.
                      </p>
                    </div>
                    <input type="checkbox" checked disabled className="accent-emerald-500 w-4 h-4 cursor-not-allowed" />
                  </div>

                  {/* Analíticas */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-bold text-white">Analíticas Propias</div>
                      <p className="text-[11px] text-gray-400">
                        Métricas first-party anónimas para mejorar el rendimiento.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowAnalytics}
                        onChange={(e) => setAllowAnalytics(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  {/* Publicidad */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-bold text-white">Publicidad (Google AdSense)</div>
                      <p className="text-[11px] text-gray-400">
                        Permite anuncios de Google para mantener los servidores del streamer.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMarketing}
                        onChange={(e) => setAllowMarketing(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botones de acción */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <FaCheck size={11} />
                  Aceptar todo
                </button>

                <button
                  onClick={handleRejectAll}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <FaTimes size={11} />
                  Rechazar
                </button>

                {showConfig ? (
                  <button
                    onClick={handleSaveCustom}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs transition-all"
                  >
                    Guardar selección
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfig(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium text-xs transition-all flex items-center gap-1.5"
                  >
                    <FaCog size={11} />
                    Configurar
                  </button>
                )}
              </div>

              <Link
                href="/privacidad"
                className="text-[11px] text-gray-400 hover:text-emerald-400 underline transition-colors"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
