'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KickLoginCard } from '@/components/kick-login-card';
import { formatLimaTime } from '@/lib/football/service';
import { MatchItem } from '@/lib/football/types';
import {
  FaCheckCircle,
  FaLock,
  FaTrophy,
  FaCalendarAlt,
  FaHistory,
  FaCoins,
  FaDice,
  FaTimesCircle,
  FaClock,
  FaDiscord,
} from 'react-icons/fa';

interface KickUser {
  id: string;
  username: string;
  profilePic: string;
  slug: string;
  points: number;
}

interface BetItem {
  id: string;
  matchId: number;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  betType: '1X2' | 'SCORE';
  selection: string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  odds: number;
  pointsBet: number;
  potentialPayout: number;
  actualHomeScore?: number | null;
  actualAwayScore?: number | null;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
  pointsAwarded: number;
  createdAt: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePic: string;
  points: number;
  hitsCount: number;
  exactHitsCount: number;
}

// Cálculo local de cuotas según el ID para previsualización inmediata en cliente
function getClientOdds(matchId: number) {
  const seed = (Math.abs(Number(matchId)) * 9301 + 49297) % 233280;
  const variation = (seed % 30) / 100;
  return {
    home: Number((1.85 + variation).toFixed(2)),
    draw: Number((3.25 + variation * 0.9).toFixed(2)),
    away: Number((2.35 + variation * 1.2).toFixed(2)),
    exact: Number((5.5 + variation * 5).toFixed(2)),
  };
}

export function QuinielaClient({ initialMatches }: { initialMatches: MatchItem[] }) {
  const [activeTab, setActiveTab] = useState<'matches' | 'myBets' | 'weekly' | 'all'>('matches');
  const [kickUser, setKickUser] = useState<KickUser | null>(null);
  const [userBets, setUserBets] = useState<BetItem[]>([]);
  const [submittingMatchId, setSubmittingMatchId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado del formulario de apuesta por partido
  const [selectedPicks, setSelectedPicks] = useState<Record<number, { type: '1X2' | 'SCORE'; pick: string; homeScore?: string; awayScore?: string }>>({});
  const [betAmounts, setBetAmounts] = useState<Record<number, number>>({});

  // Leaderboard data
  const [weeklyRanking, setWeeklyRanking] = useState<LeaderboardEntry[]>([]);
  const [allTimeRanking, setAllTimeRanking] = useState<LeaderboardEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Obtener usuario desde cookies
  useEffect(() => {
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
    if (cookieUser) setKickUser(cookieUser);
  }, []);

  // Cargar apuestas del usuario
  const loadUserBets = async () => {
    try {
      const res = await fetch('/api/quiniela/bet', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bets)) {
          setUserBets(data.bets);
        }
      }
    } catch {}
  };

  // Cargar rankings
  const loadLeaderboards = async () => {
    setLoadingRanking(true);
    try {
      const res = await fetch('/api/quiniela/leaderboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWeeklyRanking(data.weekly || []);
          setAllTimeRanking(data.allTime || []);
        }
      }
    } catch {} finally {
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    if (kickUser) {
      loadUserBets();
    }
    loadLeaderboards();
  }, [kickUser]);

  const handleSelect1X2 = (matchId: number, pick: 'HOME' | 'DRAW' | 'AWAY') => {
    setSelectedPicks((prev) => ({
      ...prev,
      [matchId]: { type: '1X2', pick },
    }));
  };

  const handleSelectScore = (matchId: number, side: 'home' | 'away', val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 2);
    setSelectedPicks((prev) => {
      const current = prev[matchId] || { type: 'SCORE', pick: '', homeScore: '0', awayScore: '0' };
      const home = side === 'home' ? num : current.homeScore || '0';
      const away = side === 'away' ? num : current.awayScore || '0';
      return {
        ...prev,
        [matchId]: {
          type: 'SCORE',
          pick: `${home}-${away}`,
          homeScore: home,
          awayScore: away,
        },
      };
    });
  };

  const handleBetAmountChange = (matchId: number, amount: number) => {
    setBetAmounts((prev) => ({
      ...prev,
      [matchId]: Math.max(1, amount),
    }));
  };

  const handlePlaceBet = async (match: MatchItem) => {
    if (!kickUser) {
      setErrorMsg('Debes iniciar sesión con Kick para apostar.');
      return;
    }

    const currentPick = selectedPicks[match.id];
    if (!currentPick || !currentPick.pick) {
      setErrorMsg('Selecciona una jugada (Local, Empate, Visita o Marcador exacto).');
      return;
    }

    const amount = betAmounts[match.id] || 25;
    if (amount <= 0) {
      setErrorMsg('Ingresa un monto de puntos válido para apostar.');
      return;
    }

    if (kickUser.points < amount) {
      setErrorMsg(`Saldo insuficiente. Tienes ${Math.floor(kickUser.points)} pts y deseas apostar ${amount} pts.`);
      return;
    }

    setSubmittingMatchId(match.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Calcular cuota seleccionada para enviarla confirmada al backend
    const odds = match.odds ? {
      home: match.odds.home,
      draw: match.odds.draw,
      away: match.odds.away,
      exact: match.odds.exactScore || Number((Math.min(match.odds.home, match.odds.away) * match.odds.draw * 1.35).toFixed(2)),
    } : getClientOdds(match.id);

    let selectedOdds = odds.home;
    if (currentPick.type === '1X2') {
      if (currentPick.pick === 'HOME') selectedOdds = odds.home;
      else if (currentPick.pick === 'DRAW') selectedOdds = odds.draw;
      else if (currentPick.pick === 'AWAY') selectedOdds = odds.away;
    } else if (currentPick.type === 'SCORE') {
      selectedOdds = odds.exact;
    }

    try {
      const res = await fetch('/api/quiniela/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          matchDate: match.utcDate,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          competition: match.competition?.name || 'Fútbol',
          betType: currentPick.type,
          selection: currentPick.pick,
          predictedHomeScore: currentPick.homeScore ? parseInt(currentPick.homeScore, 10) : undefined,
          predictedAwayScore: currentPick.awayScore ? parseInt(currentPick.awayScore, 10) : undefined,
          pointsBet: amount,
          odds: selectedOdds,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No se pudo colocar la apuesta.');
      } else {
        const potentialWon = data.bet?.potentialPayout || Math.floor(amount * 2);
        setSuccessMsg(
          `¡Apuesta de ${amount} pts confirmada con éxito! Puedes ganar ${potentialWon} pts si aciertas.`
        );
        // Actualizar saldo de usuario en pantalla
        if (data.remainingPoints !== undefined) {
          setKickUser((prev) => (prev ? { ...prev, points: data.remainingPoints } : null));
        }
        await loadUserBets();
      }
    } catch {
      setErrorMsg('Error de conexión al enviar la apuesta.');
    } finally {
      setSubmittingMatchId(null);
    }
  };

  // Partidos en los que el usuario ya tiene apuestas activas
  const userBetMatchIds = new Set(userBets.map((b) => b.matchId));

  return (
    <div className="space-y-6">
      {/* Barra de usuario o aviso de login */}
      {!kickUser ? (
        <KickLoginCard
          compact
          title="Inicia sesión con Kick para apostar tus puntos"
          subtitle="Gana el doble o triple de tus puntos según las cuotas de cada partido. Sin dinero real, 100% de la comunidad."
        />
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/50 bg-black flex-shrink-0">
              {kickUser.profilePic ? (
                <img src={kickUser.profilePic} alt={kickUser.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-emerald-400">
                  {kickUser.username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>@{kickUser.username}</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Apostador Activo
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Apuestas registradas: <strong className="text-emerald-400">{userBets.length}</strong>
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div className="p-2.5 px-4 rounded-xl bg-black/60 border border-emerald-500/30">
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Saldo Disponible:</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400 flex items-center gap-1.5 justify-end">
                <FaCoins className="text-amber-400" size={14} />
                {Math.floor(kickUser.points)} pts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg">
          <FaTimesCircle className="text-red-400 flex-shrink-0" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg">
          <FaCheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pestañas de navegación */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { key: 'matches', label: 'Partidos Disponibles', icon: FaCalendarAlt, count: initialMatches.length },
          { key: 'myBets', label: 'Mis Apuestas en Vivo', icon: FaHistory, count: userBets.length },
          { key: 'weekly', label: 'Ranking Semanal', icon: FaTrophy },
          { key: 'all', label: 'Ranking Histórico', icon: FaTrophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900/60 text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-black text-emerald-400' : 'bg-white/10 text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PARTIDOS Y MESA DE APUESTAS (CASA DE APUESTAS) */}
      {activeTab === 'matches' && (
        <div className="space-y-5">
          {/* Banner de Reacción en Vivo a las Cuotas y Partidos en Discord */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/20 via-[#1b1e38]/90 to-black/90 border border-[#5865F2]/40 shadow-xl shadow-[#5865F2]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-[#5865F2]/30">
                <FaDiscord size={26} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <h3 className="text-sm sm:text-base font-black text-white">
                    ¡Reaccionamos a las cuotas y partidos en vivo en Discord!
                  </h3>
                </div>
                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                  ¿Hiciste tus pronósticos en la Quiniela? Entra a la sala de voz con <strong className="text-emerald-400">Bepucho</strong> y la comunidad para seguir los resultados en directo, cantar tus aciertos y festejar juntos.
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
              <span>Unirme a la Sala en Vivo →</span>
            </a>
          </div>

          {initialMatches.length === 0 ? (
            <div className="p-12 rounded-3xl bg-neutral-900/60 border border-white/10 text-center text-gray-400 text-sm">
              No hay partidos disponibles para apostar en este momento. Revisa la agenda de hoy o mañana.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {initialMatches.map((m) => {
                const { time, dateStr } = formatLimaTime(m.utcDate);
                const isStarted = Date.now() >= new Date(m.utcDate).getTime();
                const odds = m.odds ? {
                  home: m.odds.home,
                  draw: m.odds.draw,
                  away: m.odds.away,
                  exact: m.odds.exactScore || Number((Math.min(m.odds.home, m.odds.away) * m.odds.draw * 1.35).toFixed(2)),
                  bookmaker: 'Bet365',
                  isReal: m.odds.isReal,
                } : {
                  ...getClientOdds(m.id),
                  bookmaker: 'Bet365',
                  isReal: false,
                };
                const currentPick = selectedPicks[m.id];
                const amount = betAmounts[m.id] || 25;

                // Calcular multiplicador elegido
                let selectedOdds = odds.home;
                if (currentPick?.type === '1X2') {
                  if (currentPick.pick === 'HOME') selectedOdds = odds.home;
                  else if (currentPick.pick === 'DRAW') selectedOdds = odds.draw;
                  else if (currentPick.pick === 'AWAY') selectedOdds = odds.away;
                } else if (currentPick?.type === 'SCORE') {
                  selectedOdds = odds.exact;
                }
                const potentialPayout = Math.floor(amount * selectedOdds);

                const existingBetsForMatch = userBets.filter((b) => b.matchId === m.id);

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-neutral-900/85 border border-white/10 hover:border-emerald-500/40 transition-all space-y-4 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5">
                        <span className="text-emerald-400 font-bold truncate max-w-[180px] flex items-center gap-1.5">
                          <FaTrophy className="text-amber-400" size={11} />
                          {m.competition?.name || 'Fútbol'}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {dateStr} · {time}
                        </span>
                      </div>

                      {/* Equipos */}
                      <div className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {m.homeTeam?.crest ? (
                              <img src={m.homeTeam.crest} alt={m.homeTeam.name} className="w-6 h-6 object-contain" />
                            ) : null}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">
                            {m.homeTeam?.shortName || m.homeTeam?.name}
                          </span>
                        </div>

                        <div className="px-2 py-1 rounded-md bg-black/60 border border-white/10 text-gray-400 text-xs font-mono font-bold">
                          VS
                        </div>

                        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end text-right">
                          <span className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">
                            {m.awayTeam?.shortName || m.awayTeam?.name}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {m.awayTeam?.crest ? (
                              <img src={m.awayTeam.crest} alt={m.awayTeam.name} className="w-6 h-6 object-contain" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MESA DE CUOTAS 1X2 (AL DOBLE O TRIPLE) */}
                    {!isStarted ? (
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span>Mercado 1X2</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Bet365
                            </span>
                          </span>
                          <span className="text-amber-400 text-[10px]">Multiplica puntos</span>
                        </div>

                        {/* Botones de cuotas */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelect1X2(m.id, 'HOME')}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              currentPick?.type === '1X2' && currentPick.pick === 'HOME'
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                                : 'bg-black/50 border-white/10 hover:border-emerald-500/40 text-white'
                            }`}
                          >
                            <span className="text-[10px] block opacity-80 font-bold">1 (Local)</span>
                            <span className="text-xs sm:text-sm font-mono font-black">x{odds.home.toFixed(2)}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelect1X2(m.id, 'DRAW')}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              currentPick?.type === '1X2' && currentPick.pick === 'DRAW'
                                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                                : 'bg-black/50 border-white/10 hover:border-amber-400/40 text-white'
                            }`}
                          >
                            <span className="text-[10px] block opacity-80 font-bold">X (Empate)</span>
                            <span className="text-xs sm:text-sm font-mono font-black text-amber-400">
                              x{odds.draw.toFixed(2)}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelect1X2(m.id, 'AWAY')}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              currentPick?.type === '1X2' && currentPick.pick === 'AWAY'
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                                : 'bg-black/50 border-white/10 hover:border-emerald-500/40 text-white'
                            }`}
                          >
                            <span className="text-[10px] block opacity-80 font-bold">2 (Visita)</span>
                            <span className="text-xs sm:text-sm font-mono font-black">x{odds.away.toFixed(2)}</span>
                          </button>
                        </div>

                        {/* Selector de Puntos a Apostar */}
                        {currentPick && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-300 font-semibold">¿Cuántos puntos apuestas?</span>
                              <div className="flex gap-1">
                                {[25, 50, 100, 200].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleBetAmountChange(m.id, val)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                                      amount === val ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                                {kickUser && kickUser.points > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleBetAmountChange(m.id, Math.floor(kickUser.points))}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black hover:bg-amber-400"
                                  >
                                    Máx
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={kickUser?.points || 10000}
                                value={amount}
                                onChange={(e) => handleBetAmountChange(m.id, parseInt(e.target.value, 10) || 0)}
                                className="w-24 px-3 py-1.5 rounded-lg bg-black border border-white/20 text-white font-mono font-bold text-sm outline-none focus:border-emerald-500 text-center"
                              />
                              <span className="text-xs text-gray-400">pts</span>
                              <div className="flex-1 text-right">
                                <span className="text-[10px] text-gray-400 block">Ganancia Potencial:</span>
                                <span className="text-sm font-mono font-black text-emerald-400">
                                  +{potentialPayout} pts
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePlaceBet(m)}
                              disabled={submittingMatchId === m.id || !kickUser}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-black font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <FaDice size={13} />
                              {submittingMatchId === m.id ? 'Confirmando apuesta...' : `Apostar ${amount} pts (Ganas ${potentialPayout} pts)`}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <FaLock size={12} />
                        <span>Partido iniciado o finalizado. Apuestas cerradas.</span>
                      </div>
                    )}

                    {/* Apuestas ya realizadas por el usuario en este partido */}
                    {existingBetsForMatch.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Tus apuestas en este juego:</span>
                        {existingBetsForMatch.map((b) => (
                          <div key={b.id} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
                            <span className="text-white font-bold">
                              Jugada: {b.selection === 'HOME' ? '1 (Local)' : b.selection === 'DRAW' ? 'X (Empate)' : '2 (Visita)'} (x{b.odds})
                            </span>
                            <span className="text-emerald-400 font-mono font-bold">
                              Apostaste: {b.pointsBet} pts → Ganas: {b.potentialPayout} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MIS APUESTAS EN VIVO */}
      {activeTab === 'myBets' && (
        <div className="space-y-4">
          {!kickUser ? (
            <div className="p-10 rounded-3xl bg-neutral-900/60 border border-white/10 text-center text-gray-400 text-sm">
              Inicia sesión con Kick para ver tu historial de apuestas y ganancias.
            </div>
          ) : userBets.length === 0 ? (
            <div className="p-10 rounded-3xl bg-neutral-900/60 border border-white/10 text-center text-gray-400 text-sm space-y-3">
              <FaDice size={28} className="mx-auto text-emerald-400" />
              <div className="font-bold text-white">No tienes apuestas activas</div>
              <p className="text-xs text-gray-400">¡Ingresa a la pestaña de Partidos Disponibles y multiplica tus puntos!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden">
              {userBets.map((b) => {
                const { fullLimaStr } = formatLimaTime(b.matchDate);
                const isWon = b.status === 'WON';
                const isLost = b.status === 'LOST';
                const isPending = b.status === 'PENDING';

                return (
                  <div key={b.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-emerald-400 font-semibold">{b.competition}</div>
                      <div className="text-sm sm:text-base font-bold text-white">
                        {b.homeTeam} vs {b.awayTeam}
                      </div>
                      <div className="text-[11px] text-gray-500">{fullLimaStr}</div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase block">Tu Jugada:</span>
                        <span className="text-xs font-mono font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                          {b.selection === 'HOME' ? '1 (Local)' : b.selection === 'DRAW' ? 'X (Empate)' : b.selection === 'AWAY' ? '2 (Visita)' : b.selection} · x{b.odds}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase block">Apostado:</span>
                        <span className="text-xs font-mono font-black text-amber-400">
                          {b.pointsBet} pts
                        </span>
                      </div>

                      <div className="text-right min-w-[100px]">
                        {isPending && (
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase block">Pago Potencial:</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-end gap-1">
                              <FaClock size={10} /> +{b.potentialPayout} pts
                            </span>
                          </div>
                        )}
                        {isWon && (
                          <div>
                            <span className="text-[10px] text-emerald-400 uppercase font-black block">¡GANASTE!</span>
                            <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              +{b.pointsAwarded} pts
                            </span>
                          </div>
                        )}
                        {isLost && (
                          <div>
                            <span className="text-[10px] text-red-400 uppercase font-bold block">No acertada</span>
                            <span className="text-xs font-mono text-gray-500">0 pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3 y 4: RANKINGS */}
      {(activeTab === 'weekly' || activeTab === 'all') && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 text-xs text-gray-400">
            {activeTab === 'weekly'
              ? 'Clasificación de los mejores apostadores de la comunidad en los últimos 7 días.'
              : 'Salón de la fama: mayores ganadores históricos de la casa de apuestas de Puchismo.'}
          </div>

          {loadingRanking ? (
            <div className="p-8 text-center text-gray-400 text-sm">Cargando clasificación...</div>
          ) : (
            <div className="rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 font-bold uppercase text-[10px] sm:text-xs">
                    <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                    <th className="py-3 px-3 sm:px-4">Apostador</th>
                    <th className="py-3 px-3 text-center">Aciertos</th>
                    <th className="py-3 px-4 text-right font-black text-white">Puntos Ganados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(activeTab === 'weekly' ? weeklyRanking : allTimeRanking).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        Aún no hay puntuaciones evaluadas en este periodo. ¡Coloca tu apuesta y lidera el podio!
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'weekly' ? weeklyRanking : allTimeRanking).map((user, idx) => (
                      <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-black ${
                              idx === 0
                                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                                : idx === 1
                                ? 'bg-slate-300 text-black'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'text-gray-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="font-bold text-white">@{user.username}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-gray-300">{user.hitsCount}</td>
                        <td className="py-3 px-4 text-right font-black font-mono text-emerald-400 text-sm sm:text-base">
                          {user.points} pts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
