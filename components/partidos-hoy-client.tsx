'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaFutbol, FaTrophy, FaSyncAlt, FaCalendarAlt, FaDice, FaClock, FaMapMarkerAlt, FaDiscord } from 'react-icons/fa';
import { MatchItem } from '@/lib/football/types';

interface PartidosHoyClientProps {
  initialMatches: MatchItem[];
}

export function PartidosHoyClient({ initialMatches }: PartidosHoyClientProps) {
  const [matches, setMatches] = useState<MatchItem[]>(initialMatches);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED'>('ALL');

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
        dateStr: 'HOY',
      };
    }
  };

  // Actualizar contador de segundos transcurridos
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Función para refrescar partidos en vivo
  const refreshMatches = async (forceBypass = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/football/matches?day=today${forceBypass ? '&refresh=true' : ''}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.matches)) {
          setMatches(data.matches);
          setLastUpdated(new Date());
          setSecondsAgo(0);
        }
      }
    } catch (err) {
      console.error('Error refrescando partidos:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Monitoreo en vivo cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMatches(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrado de partidos
  const filteredMatches = matches.filter((m) => {
    const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
    const isFinished = m.status === 'FINISHED';
    if (filter === 'LIVE') return isLive;
    if (filter === 'FINISHED') return isFinished;
    if (filter === 'SCHEDULED') return !isLive && !isFinished;
    return true;
  });

  const liveCount = matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length;

  return (
    <div className="space-y-6">
      {/* Barra de Monitoreo en Vivo, Zona Horaria Detectada y Filtros */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Monitoreo 24/7 en Vivo</span>
              {liveCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                  {liveCount} en directo
                </span>
              )}
              {/* Badge de Horario Local Adaptado */}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <FaMapMarkerAlt size={10} />
                <span>Horario local: {tzCity}</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-400">
              {secondsAgo < 5 ? 'Actualizado hace un momento' : `Actualizado hace ${secondsAgo}s`} · Auto-actualiza cada 30s
            </div>
          </div>
        </div>

        {/* Filtros y botón de refresco */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
            {(
              [
                { id: 'ALL', label: 'Todos' },
                { id: 'LIVE', label: 'En Vivo' },
                { id: 'SCHEDULED', label: 'Por Jugar' },
                { id: 'FINISHED', label: 'Finalizados' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                  filter === f.id
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refreshMatches(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-white/10 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            title="Forzar actualización de datos en tiempo real"
          >
            <FaSyncAlt className={isRefreshing ? 'animate-spin text-emerald-400' : ''} size={12} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
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
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white">
                ¡Reaccionamos a estos partidos en vivo en Discord!
              </h3>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Comentamos cada jugada en directo, cantamos los goles y debatimos en caliente en la sala de voz con <strong className="text-emerald-400">Bepucho</strong> y toda la comunidad. ¡Entra gratis para no perdértelo!
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
          <span>Unirme al Discord en Vivo →</span>
        </a>
      </div>

      {/* Grid de Partidos: Proporción balanceada aprovechando los costados en monitores medianos y anchos */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-neutral-900/60 border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <FaFutbol size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No hay partidos para el filtro seleccionado</h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
            Prueba cambiando el filtro de estado o revisa la agenda completa para la jornada de mañana.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredMatches.map((m) => {
            const { bigTime, dateStr } = formatUserTime(m.utcDate);
            const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
            const isFinished = m.status === 'FINISHED';

            const homeDisplayName = m.homeTeam?.name || m.homeTeam?.shortName || 'Local';
            const awayDisplayName = m.awayTeam?.name || m.awayTeam?.shortName || 'Visitante';

            return (
              <motion.div
                key={m.id}
                layout
                className={`p-5 sm:p-6 rounded-3xl bg-neutral-900/90 border transition-all flex flex-col justify-between gap-4 group relative overflow-hidden backdrop-blur-sm ${
                  isLive
                    ? 'border-red-500/60 shadow-xl shadow-red-500/10'
                    : 'border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10'
                }`}
              >
                {isLive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
                )}

                {/* 1. Header: Nombre del Campeonato (izq) y Fecha de Juego (der) */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                  <span className="font-bold text-emerald-400 flex items-center gap-2 truncate max-w-[200px]" title={m.competition?.name}>
                    <FaTrophy className="text-amber-400 flex-shrink-0" size={13} />
                    <span className="truncate">{m.competition?.name || 'Fútbol'}</span>
                  </span>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white flex items-center gap-1.5 shadow-sm animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        EN VIVO
                      </span>
                    ) : isFinished ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-800 text-gray-400 border border-white/10">
                        FINALIZADO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <FaCalendarAlt size={10} className="text-emerald-400" />
                        <span>{dateStr}</span>
                      </span>
                    )}
                  </div>
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
                    {isFinished || isLive ? (
                      <div className="flex flex-col items-center">
                        <div className="px-3.5 py-1.5 rounded-2xl bg-black/90 border border-emerald-500/40 text-center font-mono font-black text-2xl sm:text-3xl text-emerald-400 shadow-xl">
                          {m.score?.fullTime?.home ?? 0} : {m.score?.fullTime?.away ?? 0}
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-wider mt-1.5 ${isLive ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
                          {isLive ? 'Minuto a minuto' : 'Resultado'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-md">
                          {bigTime}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                          <FaClock size={9} className="text-emerald-400" />
                          <span>{tzCity}</span>
                        </span>
                      </div>
                    )}
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

                {/* 3. Footer: Fecha de juego y botón para ir a apostar en Quiniela */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-300 font-semibold">{dateStr}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!isFinished && (
                      <Link
                        href={`/quiniela?match=${m.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        title="Ver cuotas de Bet365 y apostar puntos en la Quiniela"
                      >
                        <FaDice size={12} />
                        Pronosticar en Quiniela
                      </Link>
                    )}
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
