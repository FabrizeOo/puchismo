'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaFutbol, FaTrophy, FaCalendarAlt, FaDice, FaClock, FaMapMarkerAlt, FaDiscord } from 'react-icons/fa';
import { MatchItem } from '@/lib/football/types';

interface PartidosMananaClientProps {
  initialMatches: MatchItem[];
}

export function PartidosMananaClient({ initialMatches }: PartidosMananaClientProps) {
  // Zona horaria dinámica detectada desde el navegador del usuario
  const [userTz, setUserTz] = useState<string>('America/Lima');
  const [tzCity, setTzCity] = useState<string>('Lima');

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setUserTz(detected);
        const city = detected.split('/').pop()?.replace(/_/g, ' ') || detected;
        setTzCity(city);
      }
    } catch {
      // Mantener Lima como fallback por defecto
    }
  }, []);

  // Función para formatear hora grande y fecha en la zona horaria del usuario
  const formatUserTime = (utcIsoString: string) => {
    try {
      const d = new Date(utcIsoString);
      const timeFormatter = new Intl.DateTimeFormat('es-PE', {
        timeZone: userTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat('es-PE', {
        timeZone: userTz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      return {
        bigTime: timeFormatter.format(d),
        dateStr: dateFormatter.format(d).toUpperCase(),
      };
    } catch {
      return {
        bigTime: '--:--',
        dateStr: 'MAÑANA',
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Zona Horaria Detectada */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
            <span>Fixture Confirmado de Mañana</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
              <FaMapMarkerAlt size={10} />
              <span>Horarios según tu ubicación: {tzCity}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Reacción en Vivo en Discord */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/20 via-[#1b1e38]/90 to-black/90 border border-[#5865F2]/40 shadow-xl shadow-[#5865F2]/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-[#5865F2]/30">
            <FaDiscord size={26} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white">
                ¡Vivimos la previa y reaccionamos en directo en Discord!
              </h3>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              No veas los partidos solo: únete a la comunidad de <strong className="text-emerald-400">Bepucho</strong> en Discord para debatir alineaciones, analizar la jornada y reaccionar juntos a los goles.
            </p>
          </div>
        </div>

        <a
          href="https://discord.gg/3DtQkGhtrn"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs transition-all shadow-lg shadow-[#5865F2]/30 flex items-center justify-center gap-2 whitespace-nowrap hover:scale-105 active:scale-95 cursor-pointer"
        >
          <FaDiscord size={16} />
          <span>Unirme al Discord Oficial →</span>
        </a>
      </div>

      {/* Grid de Partidos */}
      {initialMatches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-neutral-900/60 border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <FaCalendarAlt size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No hay partidos registrados para mañana</h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
            Aún no hay fixture cargado para la jornada de mañana en las ligas monitoreadas. Te invitamos a revisar la agenda de hoy.
          </p>
          <div className="pt-2">
            <Link
              href="/partidos/hoy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all"
            >
              Ver partidos de hoy →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6">
          {initialMatches.map((m) => {
            const { bigTime, dateStr } = formatUserTime(m.utcDate);
            const homeDisplayName = m.homeTeam?.name || m.homeTeam?.shortName || 'Local';
            const awayDisplayName = m.awayTeam?.name || m.awayTeam?.shortName || 'Visitante';

            return (
              <motion.div
                key={m.id}
                layout
                className="p-5 sm:p-6 rounded-3xl bg-neutral-900/90 border border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between gap-4 group relative overflow-hidden backdrop-blur-sm"
              >
                {/* 1. Header: Nombre del Campeonato y Fecha */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                  <span className="font-bold text-emerald-400 flex items-center gap-2 truncate max-w-[200px]" title={m.competition?.name}>
                    <FaTrophy className="text-amber-400 flex-shrink-0" size={13} />
                    <span className="truncate">{m.competition?.name || 'Fútbol'}</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                    <FaCalendarAlt size={10} className="text-emerald-400" />
                    <span>{dateStr}</span>
                  </span>
                </div>

                {/* 2. Cuerpo: Equipos y en el centro la HORA GRANDE */}
                <div className="grid grid-cols-12 items-center gap-2 py-3">
                  {/* Local (4 columnas) */}
                  <div className="col-span-4 flex flex-col items-center text-center gap-2">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-2.5 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 group-hover:border-emerald-500/50 transition-all">
                      {m.homeTeam?.crest ? (
                        <img
                          src={m.homeTeam.crest}
                          alt={m.homeTeam.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-400">
                          {m.homeTeam?.tla || 'LOC'}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-snug break-words"
                      title={m.homeTeam?.name}
                    >
                      {homeDisplayName}
                    </span>
                  </div>

                  {/* Centro: HORA GRANDE digital destacada (4 columnas) */}
                  <div className="col-span-4 flex flex-col items-center justify-center text-center px-1">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-md">
                        {bigTime}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                        <FaClock size={9} className="text-emerald-400" />
                        <span>{tzCity}</span>
                      </span>
                    </div>
                  </div>

                  {/* Visitante (4 columnas) */}
                  <div className="col-span-4 flex flex-col items-center text-center gap-2">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-2.5 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 group-hover:border-emerald-500/50 transition-all">
                      {m.awayTeam?.crest ? (
                        <img
                          src={m.awayTeam.crest}
                          alt={m.awayTeam.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-400">
                          {m.awayTeam?.tla || 'VIS'}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-snug break-words"
                      title={m.awayTeam?.name}
                    >
                      {awayDisplayName}
                    </span>
                  </div>
                </div>

                {/* 3. Footer: Fecha de juego y botón para pronosticar en Quiniela */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-300 font-semibold">{dateStr}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quiniela?match=${m.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                      title="Ver cuotas de Bet365 y apostar puntos en la Quiniela"
                    >
                      <FaDice size={12} />
                      Pronosticar en Quiniela
                    </Link>
                    <Link
                      href={`/partido/${m.id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 group-hover:underline px-1 py-1"
                    >
                      Previa →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

