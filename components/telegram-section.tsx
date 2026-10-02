'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { FaTelegramPlane, FaThumbsUp } from 'react-icons/fa';

const TELEGRAM_URL = 'https://t.me/+jpyDeMxokzUzNDgx';

export function TelegramSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="telegram" className="py-16 sm:py-24 px-4 relative overflow-hidden">
      {/* Luz ambiental de fondo azul/celeste Telegram */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, #2563eb 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Encabezado de la sección */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <FaTelegramPlane className="text-sky-400" />
            <span>CANAL EXCLUSIVO</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-poppins font-black text-white mb-3">
            Únete a Nuestro Canal de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500">
              Telegram
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto">
            Recibe noticias de fútbol en vivo, avisos cuando arranquen los directos y cuotas diarias exclusivas.
          </p>
        </motion.div>

        {/* Tarjeta del banner interactivo */}
        <motion.div
          className="relative rounded-3xl overflow-hidden border-2 border-sky-500/30 bg-gradient-to-b from-[#091424] to-[#040910] shadow-[0_0_50px_rgba(14,165,233,0.25)] group"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Banner con enlace directo a Telegram */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative cursor-pointer"
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src="/puchotele.png"
                alt="Canal oficial de Telegram de Puchismo"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Efecto de resplandor hover */}
            <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Barra inferior con botón de acción */}
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sky-500/20 bg-[#07111e]/90">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <FaTelegramPlane size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Comunidad de Telegram Puchismo
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  ¡No te pierdas de nada! Haz click para ingresar al canal oficial.
                </p>
              </div>
            </div>

            <motion.a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:shadow-[0_0_45px_rgba(14,165,233,0.8)] transition-all w-full sm:w-auto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <FaThumbsUp className="text-amber-300 text-lg" />
              <FaTelegramPlane size={20} />
              <span>Unirme al Telegram</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
