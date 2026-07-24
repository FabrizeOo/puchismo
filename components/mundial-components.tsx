'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ============================================
   HELPERS DE TIMEZONE (browser-native)
   ============================================ */

function formatLocalTime(utcDateStr: string): string {
  // Usa la timezone del navegador directamente — sin manipulación manual
  const date = new Date(utcDateStr);
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAfterStart = new Date(tomorrowStart);
  dayAfterStart.setDate(dayAfterStart.getDate() + 1);

  const matchStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (matchStart.getTime() === todayStart.getTime()) {
    return `Hoy a las ${timeStr}`;
  } else if (matchStart.getTime() === tomorrowStart.getTime()) {
    return `Mañana a las ${timeStr}`;
  } else if (date > now) {
    return date.toLocaleDateString('es-PE', {
      weekday: 'short', day: 'numeric', month: 'short',
    }) + ` a las ${timeStr}`;
  } else {
    return date.toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short',
    }) + ` — ${timeStr}`;
  }
}

function getStatusLabel(status: string, minute?: number | null): string {
  if (status === 'LIVE' || status === 'IN_PLAY') {
    return minute ? `🔴 EN VIVO — ${minute}'` : '🔴 EN VIVO';
  }
  if (status === 'PAUSED') return '⏸️ Descanso (HT)';
  if (status === 'FINISHED') return '✅ Finalizado';
  if (status === 'SCHEDULED') return '⏰ Programado';
  if (status === 'POSTPONED') return '⏸️ Aplazado';
  if (status === 'CANCELLED') return '❌ Cancelado';
  return status;
}

function getStatusColor(status: string): string {
  if (status === 'LIVE' || status === 'IN_PLAY') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (status === 'FINISHED') return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (status === 'SCHEDULED') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

/* ============================================
   TABLA DE GRUPOS
   ============================================ */

interface TeamStanding {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface GroupStanding {
  group: string;
  table: TeamStanding[];
}

export function GroupsTable() {
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    fetch('/api/sports/standings')
      .then((r) => r.json())
      .then((data) => {
        if (data.standings) setStandings(data.standings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="section-title text-white">
            Tabla de <span className="text-gradient">Grupos</span>
          </h2>
          <p className="section-subtitle">Mundial 2026 — Actualización en tiempo real</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-7 bg-white/10 rounded mb-5 w-28" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-12 bg-white/5 rounded-xl mb-2" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {standings.map((group) => (
              <GroupCard key={group.group} group={group} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function GroupCard({ group }: { group: GroupStanding }) {
  const sorted = [...group.table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  const label = group.group.replace('Group ', 'Grupo ');

  return (
    <motion.div
      className="glass-card overflow-hidden hover:border-electric/40 transition-all duration-300"
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,212,255,0.1)' }}
    >
      {/* Header del grupo */}
      <div className="px-5 py-3 bg-gradient-to-r from-electric/10 to-purple/10 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-black text-electric tracking-wide">{label}</h3>
        <div className="flex gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span className="w-6 text-center">G</span>
          <span className="w-6 text-center">E</span>
          <span className="w-6 text-center">P</span>
          <span className="w-10 text-center text-electric">PTS</span>
        </div>
      </div>

      {/* Filas de equipos */}
      <div className="divide-y divide-white/5">
        {sorted.map((entry, idx) => (
          <div
            key={entry.team.id}
            className={`flex items-center gap-2 px-4 py-3 transition-all duration-200 hover:bg-white/5 ${
              idx < 2 ? 'bg-electric/3' : ''
            }`}
          >
            {/* Posición */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
              idx === 0
                ? 'bg-electric text-dark-950'
                : idx === 1
                ? 'bg-electric/30 text-electric'
                : 'bg-white/5 text-gray-500'
            }`}>
              {idx + 1}
            </div>

            {/* Escudo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.team.crest}
              alt={entry.team.name}
              className="w-7 h-7 object-contain flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
            />

            {/* Nombre */}
            <span className={`flex-1 text-sm font-bold truncate ${idx < 2 ? 'text-white' : 'text-gray-300'}`}>
              {entry.team.tla}
            </span>

            {/* Stats */}
            <div className="flex gap-2 text-sm font-mono flex-shrink-0">
              <span className="w-6 text-center text-gray-400">{entry.won}</span>
              <span className="w-6 text-center text-gray-400">{entry.draw}</span>
              <span className="w-6 text-center text-gray-400">{entry.lost}</span>
              {/* PUNTOS — grande y destacado */}
              <span className={`w-10 text-center font-black text-lg leading-none ${
                idx === 0
                  ? 'text-electric'
                  : idx === 1
                  ? 'text-cyan-400'
                  : 'text-white'
              }`}>
                {entry.points}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-electric" />
        <span className="text-xs text-gray-500">Clasifican a octavos</span>
      </div>
    </motion.div>
  );
}

/* ============================================
   PARTIDOS EN VIVO / PRÓXIMOS
   ============================================ */

export function LiveMatchesSection() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'today' | 'upcoming'>('live');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    fetch('/api/sports/matches')
      .then((r) => r.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const todayMatches = matches.filter((m) => {
    const d = new Date(m.utcDate);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  });
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED').slice(0, 8);

  const tabs = [
    { key: 'live', label: '🔴 En Vivo', count: liveMatches.length },
    { key: 'today', label: '📅 Hoy', count: todayMatches.length },
    { key: 'upcoming', label: '⏰ Próximos', count: upcomingMatches.length },
  ] as const;

  const displayMatches =
    activeTab === 'live' ? liveMatches
    : activeTab === 'today' ? todayMatches
    : upcomingMatches;

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-transparent via-dark-900/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="section-title text-white">
            Partidos <span className="text-gradient">en Vivo</span>
          </h2>
          <p className="section-subtitle">Todos los horarios en tu hora local</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-electric text-dark-950 shadow-glow-electric'
                  : 'glass-card text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-dark-950/30' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : displayMatches.length === 0 ? (
          <motion.div
            className="text-center py-16 glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">⚽</div>
            <p className="text-gray-400 text-lg font-semibold">
              {activeTab === 'live'
                ? 'No hay partidos en vivo ahora mismo'
                : activeTab === 'today'
                ? 'No hay más partidos hoy'
                : 'No hay próximos partidos programados'}
            </p>
            <p className="text-gray-600 text-sm mt-2">Revisa la pestaña de Próximos partidos</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {displayMatches.map((match: any, idx: number) => (
              <MatchCard key={match.id || idx} match={match} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function MatchCard({ match }: { match: any }) {
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY';
  const isPaused = match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const score = match.score?.fullTime;
  const minute = match.minute;

  return (
    <motion.div
      className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${
        isLive ? 'border-red-500/40 border-2' : isPaused ? 'border-yellow-500/30' : ''
      }`}
      whileHover={{ y: -4, boxShadow: isLive ? '0 15px 50px rgba(239,68,68,0.2)' : '0 15px 40px rgba(0,212,255,0.08)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Barra de live en la parte superior */}
      {isLive && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Stage + tiempo */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          {match.stage === 'GROUP_STAGE' ? 'Fase de Grupos' : match.stage?.replace(/_/g, ' ')}
          {match.matchday && ` · J${match.matchday}`}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(match.status)}`}>
          {getStatusLabel(match.status, minute)}
        </span>
      </div>

      {/* Equipos y marcador */}
      <div className="flex items-center gap-4">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={match.homeTeam?.crest}
            alt={match.homeTeam?.name}
            className="w-12 h-12 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
          />
          <span className="text-sm font-bold text-white text-center leading-tight">
            {match.homeTeam?.shortName || match.homeTeam?.tla}
          </span>
        </div>

        {/* Marcador */}
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          {score?.home !== null && score?.home !== undefined ? (
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-black tabular-nums ${
                isFinished ? 'text-white' : isLive ? 'text-electric' : 'text-white'
              }`}>
                {score.home}
              </span>
              <span className="text-gray-600 text-2xl font-bold">-</span>
              <span className={`text-4xl font-black tabular-nums ${
                isFinished ? 'text-white' : isLive ? 'text-electric' : 'text-white'
              }`}>
                {score.away}
              </span>
            </div>
          ) : (
            <div className="text-gray-500 font-bold text-xl">
              {formatLocalTime(match.utcDate)}
            </div>
          )}
          {isLive && minute && (
            <motion.div
              className="flex items-center gap-1 text-red-400 text-sm font-bold"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {minute}&apos;
            </motion.div>
          )}
          {(isFinished || (score?.home !== null && !isLive)) && (
            <span className="text-xs text-gray-500">{formatLocalTime(match.utcDate)}</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={match.awayTeam?.crest}
            alt={match.awayTeam?.name}
            className="w-12 h-12 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
          />
          <span className="text-sm font-bold text-white text-center leading-tight">
            {match.awayTeam?.shortName || match.awayTeam?.tla}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   LLAVES ELIMINATORIAS
   ============================================ */

export function BracketsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} id="llaves" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="section-title text-white">
            Llaves <span className="text-gradient">Eliminatorias</span>
          </h2>
          <p className="section-subtitle">Se actualizarán al avanzar los partidos</p>
        </motion.div>

        <motion.div
          className="overflow-x-auto pb-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="min-w-max mx-auto flex items-center justify-center gap-6 p-6">
            <BracketRound title="Octavos" matches={['1A vs 2B','1C vs 2D','1E vs 2F','1G vs 2H','1I vs 2J','1K vs 2L','1B vs 2A','1D vs 2C']} />
            <Arrow />
            <BracketRound title="Cuartos" matches={['? vs ?','? vs ?','? vs ?','? vs ?']} />
            <Arrow />
            <BracketRound title="Semifinal" matches={['? vs ?','? vs ?']} />
            <Arrow />
            <div className="text-center">
              <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">🏆 Final</h4>
              <motion.div
                className="glass-card border-electric/40 border-2 px-10 py-6 font-black text-electric text-2xl"
                animate={{ boxShadow: ['0 0 15px rgba(0,212,255,0.2)','0 0 40px rgba(0,212,255,0.5)','0 0 15px rgba(0,212,255,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                ?
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Arrow() {
  return <div className="text-gray-600 text-3xl font-black self-center">›</div>;
}

function BracketRound({ title, matches }: { title: string; matches: string[] }) {
  return (
    <div className="text-center">
      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">{title}</h4>
      <div className="flex flex-col gap-3">
        {matches.map((m, i) => (
          <div key={i} className="glass-card px-4 py-3 text-sm font-semibold text-gray-300 min-w-[140px] text-center hover:border-electric/30 transition-all">
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
