'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';

interface LeaderboardUser {
  id: string;
  username: string;
  profilePic: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
  lastUpdated?: string;
}

interface KickUser {
  id: string;
  username: string;
  profilePic: string;
  slug: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
}

const TIERS = [
  { name: 'Rookie', min: 0, max: 499, color: '#9ca3af', emoji: '🌱' },
  { name: 'Fan', min: 500, max: 1499, color: '#53fc18', emoji: '⚽' },
  { name: 'MVP', min: 1500, max: 3999, color: '#fbbf24', emoji: '🏆' },
  { name: 'Legend', min: 4000, max: 9999, color: '#f97316', emoji: '👑' },
  { name: 'GOAT', min: 10000, max: Infinity, color: '#ec4899', emoji: '🐐' },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'watchTime' | 'chat'>('points');
  const [kickUser, setKickUser] = useState<KickUser | null>(null);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true });

  const fetchUserData = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        try {
          return JSON.parse(decodeURIComponent(parts.pop()!.split(';').shift()!));
        } catch {
          return null;
        }
      }
      return null;
    };

    const cookieUser = getCookie('kick_user_profile');
    if (cookieUser) {
      setKickUser(cookieUser);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/kick/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        }
      }
    } catch (e) {
      console.error('Error cargando leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Sort leaderboard
  const sortedList = [...leaderboard].sort((a, b) => {
    if (sortBy === 'watchTime') return (b.watchTimeMinutes || 0) - (a.watchTimeMinutes || 0);
    if (sortBy === 'chat') return (b.chatMessagesCount || 0) - (a.chatMessagesCount || 0);
    return (b.points || 0) - (a.points || 0);
  });

  // Filter list
  const filteredList = sortedList.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase().trim())
  );

  // Top 3 Podium (1st, 2nd, 3rd)
  const first = sortedList[0];
  const second = sortedList[1];
  const third = sortedList[2];

  // User position
  const userRankIndex = kickUser
    ? sortedList.findIndex((u) => u.username.toLowerCase() === kickUser.username.toLowerCase())
    : -1;

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={headerRef} className="relative pt-28 sm:pt-32 pb-10 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 25%, rgba(83,252,24,0.14) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4"
              style={{ border: '1px solid rgba(83,252,24,0.4)', background: 'rgba(83,252,24,0.1)', color: '#53fc18' }}
            >
              🏆 RANKING DE LA COMUNIDAD
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl font-poppins font-black mb-3 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Tabla de{' '}
            <span style={{ color: '#53fc18', textShadow: '0 0 30px rgba(83,252,24,0.7)' }}>
              Clasificación
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto px-2 mb-6"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25 }}
          >
            Los mejores viewers y miembros más activos de Puchismo. ¡Mira streams, participa en el chat y escala hasta el TOP 1!
          </motion.p>
        </div>
      </section>

      {/* ── PODIUM TOP 3 ── */}
      {sortedList.length > 0 && (
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 sm:gap-6 items-end justify-center mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              {second ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-300 overflow-hidden bg-neutral-900 shadow-[0_0_20px_rgba(203,213,225,0.3)]">
                      {second.profilePic ? (
                        <img src={second.profilePic} alt={second.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-sm sm:text-base bg-slate-900">
                          {second.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="absolute -top-3 -right-2 text-xl sm:text-2xl">🥈</span>
                  </div>
                  <span className="font-black text-xs sm:text-sm text-slate-200 truncate max-w-[90px] sm:max-w-[140px] text-center">
                    @{second.username}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
                    {second.points.toLocaleString()} pts
                  </span>
                  <div className="w-full h-24 sm:h-32 mt-3 rounded-t-2xl bg-gradient-to-t from-slate-900/90 to-slate-800/40 border-t-2 border-slate-400/40 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-3xl font-black text-slate-300">#2</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 rounded-t-2xl bg-neutral-900/40 border border-white/5" />
              )}
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              {first ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl border-4 border-amber-400 overflow-hidden bg-neutral-900 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                      {first.profilePic ? (
                        <img src={first.profilePic} alt={first.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-amber-400 text-lg sm:text-xl bg-amber-950">
                          {first.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="absolute -top-4 -right-2 text-2xl sm:text-3xl">👑</span>
                  </div>
                  <span className="font-black text-sm sm:text-base text-amber-300 truncate max-w-[100px] sm:max-w-[160px] text-center">
                    @{first.username}
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                    {first.points.toLocaleString()} pts
                  </span>
                  <div className="w-full h-32 sm:h-44 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-950/80 via-amber-900/30 to-amber-500/20 border-t-2 border-amber-400 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-4xl font-black text-amber-400">#1</span>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-1">LÍDER</span>
                  </div>
                </div>
              ) : null}
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              {third ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-700 overflow-hidden bg-neutral-900 shadow-[0_0_20px_rgba(180,83,9,0.3)]">
                      {third.profilePic ? (
                        <img src={third.profilePic} alt={third.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-amber-600 text-sm sm:text-base bg-amber-950">
                          {third.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="absolute -top-3 -right-2 text-xl sm:text-2xl">🥉</span>
                  </div>
                  <span className="font-black text-xs sm:text-sm text-amber-600 truncate max-w-[90px] sm:max-w-[140px] text-center">
                    @{third.username}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-600">
                    {third.points.toLocaleString()} pts
                  </span>
                  <div className="w-full h-20 sm:h-28 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-950/90 to-amber-900/30 border-t-2 border-amber-700/50 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-3xl font-black text-amber-600">#3</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-20 rounded-t-2xl bg-neutral-900/40 border border-white/5" />
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CARD MI POSICIÓN ── */}
      {kickUser && (
        <section className="py-2 px-4 mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-emerald-400 bg-neutral-950">
                  {kickUser.profilePic ? (
                    <img src={kickUser.profilePic} alt={kickUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-emerald-400 bg-emerald-950 text-sm">
                      {kickUser.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Tu Posición</span>
                  <h4 className="font-black text-white text-base">@{kickUser.username}</h4>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 block">Ranking</span>
                  <strong className="text-emerald-400 font-black text-base sm:text-lg">
                    {userRankIndex !== -1 ? `#${userRankIndex + 1}` : 'Sin clasificar'}
                  </strong>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 block">Puntos</span>
                  <strong className="text-white font-black text-base sm:text-lg font-mono">
                    {kickUser.points} pts
                  </strong>
                </div>
                <Link
                  href="/rewards"
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                >
                  🎁 Ir a Tienda
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTROLES Y LISTADO ── */}
      <section className="py-4 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* BUSCADOR Y ORDENAMIENTO */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="🔍 Buscar por usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
              {([
                { id: 'points', label: '🏆 Puntos' },
                { id: 'watchTime', label: '⏱️ Horas Vistas' },
                { id: 'chat', label: '💬 Mensajes' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === tab.id
                      ? 'bg-emerald-400 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA COMPLETA */}
          {loading ? (
            <div className="text-center py-16 text-gray-500 text-sm font-semibold">
              Cargando tabla de clasificación...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              No se encontraron usuarios en el ranking.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredList.map((user, index) => {
                const isTop1 = index === 0 && !search && sortBy === 'points';
                const isTop2 = index === 1 && !search && sortBy === 'points';
                const isTop3 = index === 2 && !search && sortBy === 'points';
                const userTier = getTier(user.points);

                return (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isTop1
                        ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : isTop2
                        ? 'bg-slate-900/40 border-slate-400/30'
                        : isTop3
                        ? 'bg-amber-950/20 border-amber-700/30'
                        : 'bg-neutral-900/80 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="font-mono text-xs sm:text-sm font-black w-6 text-center text-gray-400">
                        {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${index + 1}`}
                      </span>

                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-white/10 bg-neutral-950 flex-shrink-0">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-xs text-emerald-400 bg-emerald-950">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-xs sm:text-base">@{user.username}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-gray-400">
                            {userTier.emoji} {userTier.name}
                          </span>
                        </div>
                        <div className="flex gap-3 text-[10px] sm:text-xs text-gray-400 mt-0.5">
                          <span>⏱️ {user.watchTimeMinutes || 0} min</span>
                          <span>💬 {user.chatMessagesCount || 0} msgs</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-400 font-mono text-sm sm:text-lg block">
                        {user.points.toLocaleString()} <span className="text-xs text-gray-400 font-normal">pts</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
