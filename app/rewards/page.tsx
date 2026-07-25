'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
interface KickUser {
  id: string;
  username: string;
  profilePic: string;
  slug: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
}

interface LeaderboardUser {
  id: string;
  username: string;
  profilePic: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
}

interface RewardClaim {
  id: string;
  rewardTitle: string;
  pointsSpent: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  contactInfo: string;
  createdAt: string;
}

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Rookie', min: 0, max: 499, color: '#9ca3af', emoji: '🌱', perks: ['Acceso al chat', 'Emotes básicos'] },
  { name: 'Fan', min: 500, max: 1499, color: '#53fc18', emoji: '⚽', perks: ['Rol especial Discord', 'Emotes exclusivos'] },
  { name: 'MVP', min: 1500, max: 3999, color: '#fbbf24', emoji: '🏆', perks: ['Rol MVP Discord', 'Acceso a sorteos'] },
  { name: 'Legend', min: 4000, max: 9999, color: '#f97316', emoji: '👑', perks: ['Rol Legend', 'Sorteos VIP', 'Shoutout en stream'] },
  { name: 'GOAT', min: 10000, max: Infinity, color: '#ec4899', emoji: '🐐', perks: ['Todos los beneficios', 'Acceso anticipado', 'Co-stream con Bepucho'] },
];

const WAYS_TO_EARN = [
  {
    id: 'watch',
    icon: '📺',
    title: 'Ver el Stream',
    subtitle: '10 puntos por hora',
    points: '+10 pts / hora',
    description: 'Mantén la transmisión abierta en nuestra web. Sumas puntos de manera constante mientras disfrutas el directo.',
    color: '#53fc18',
    glow: 'rgba(83,252,24,0.4)',
    steps: ['Inicia sesión con Kick', 'Abre el reproductor de Stream', 'Gana 10 pts acumulando cada hora'],
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'Participar en Chat',
    subtitle: '0.1 puntos por mensaje (Anti-Spam)',
    points: '+0.1 pt / msg',
    description: 'Sé parte del chat en vivo de Bepucho. Cuenta con protección Anti-Spam (5 segundos de cooldown entre mensajes).',
    color: '#7fff00',
    glow: 'rgba(127,255,0,0.4)',
    steps: ['Escribe en el Chat en vivo', 'Gana 0.1 pt por mensaje válido', 'Evita spamear mensajes repetidos'],
  },
];

export default function RewardsPage() {
  const [kickUser, setKickUser] = useState<KickUser | null>(null);
  const [rewardsCatalog, setRewardsCatalog] = useState<RewardItem[]>([]);
  const [userClaims, setUserClaims] = useState<RewardClaim[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'store' | 'my-claims' | 'earn' | 'tiers'>('store');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error') || params.get('auth_error');
      if (err) {
        setAuthError('No se pudo completar el inicio de sesión con Kick. Por favor, intenta de nuevo.');
      }
    }
  }, []);

  // Modal para reclamar premio
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [contactInput, setContactInput] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true });

  // Cargar datos de usuario
  const fetchUserData = async () => {
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
    if (cookieUser && !kickUser) {
      setKickUser(cookieUser);
    }

    try {
      const res = await fetch('/api/kick/user-stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setKickUser({
            id: data.user.id,
            username: data.user.username,
            profilePic: data.user.profilePic,
            slug: data.user.username,
            points: data.user.points,
            watchTimeMinutes: data.user.watchTimeMinutes,
            chatMessagesCount: data.user.chatMessagesCount,
          });
        }
      }
    } catch (e) {
      console.error('Error al obtener perfil:', e);
    }
  };

  // Cargar catálogo de recompensas e historial
  const fetchRewardsData = async () => {
    setLoadingRewards(true);
    try {
      const res = await fetch('/api/rewards');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRewardsCatalog(data.rewards || []);
          if (data.userClaims) {
            setUserClaims(data.userClaims);
          }
        }
      }
    } catch (e) {
      console.error('Error cargando recompensas:', e);
    } finally {
      setLoadingRewards(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRewardsData();

    const interval = setInterval(() => {
      fetchUserData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'store' || activeTab === 'my-claims') fetchRewardsData();
  }, [activeTab]);

  const currentPoints = kickUser && typeof kickUser.points === 'number' ? kickUser.points : 0;
  const userTier = TIERS.find((t) => currentPoints >= t.min && currentPoints <= t.max) ?? TIERS[0];

  const handleLoginClick = () => {
    window.location.href = '/api/kick/auth';
  };

  const handleLogoutClick = () => {
    window.location.href = '/api/kick/logout';
  };

  const handleOpenClaimModal = (reward: RewardItem) => {
    if (!kickUser) {
      handleLoginClick();
      return;
    }
    setSelectedReward(reward);
    setContactInput('');
    setClaimMessage(null);
  };

  const handleConfirmClaim = async () => {
    if (!selectedReward) return;
    if (!contactInput || contactInput.trim().length < 3) {
      setClaimMessage({ type: 'error', text: 'Ingresa tu usuario de Discord, WhatsApp o Nickname para contactarte.' });
      return;
    }

    setClaiming(true);
    setClaimMessage(null);

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          contactInfo: contactInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaimMessage({ type: 'success', text: data.message });
        setKickUser((prev) => (prev ? { ...prev, points: data.remainingPoints } : null));
        fetchRewardsData();
        setTimeout(() => {
          setSelectedReward(null);
          setActiveTab('my-claims');
        }, 2000);
      } else {
        setClaimMessage({ type: 'error', text: data.error || 'No se pudo reclamar la recompensa.' });
      }
    } catch (e) {
      setClaimMessage({ type: 'error', text: 'Error de red al procesar el reclamo.' });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={headerRef} className="relative pt-28 sm:pt-32 pb-8 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(83,252,24,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
              style={{ border: '1px solid rgba(83,252,24,0.4)', background: 'rgba(83,252,24,0.1)', color: '#53fc18' }}
            >
              🎁 TIENDA DE RECOMPENSAS Y PUNTOS
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl font-poppins font-black mb-3 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Canjea tus Puntos por{' '}
            <span style={{ color: '#53fc18', textShadow: '0 0 30px rgba(83,252,24,0.7)' }}>
              Premios Reales
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto px-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25 }}
          >
            Suma puntos viendo el stream (10 pts/hora) y participando en el chat (0.1 pt/msg). ¡Conecta tu cuenta de Kick y reclama tus recompensas favoritas!
          </motion.p>
        </div>
      </section>

      {/* ── ALERTA DE ERROR SI FALLA LOGIN ── */}
      {authError && (
        <div className="max-w-xl mx-auto px-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-between">
            <span>⚠️ {authError}</span>
            <button onClick={() => setAuthError(null)} className="text-red-400 hover:text-white ml-2">✕</button>
          </div>
        </div>
      )}

      {/* ── CARD PERFIL USUARIO ── */}
      <section className="py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {!kickUser ? (
              <motion.div
                key="logged-out-card"
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 max-w-xl mx-auto border"
                style={{
                  background: 'linear-gradient(135deg, rgba(83,252,24,0.05) 0%, rgba(3,11,4,0.98) 100%)',
                  borderColor: 'rgba(83,252,24,0.18)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl overflow-hidden border border-emerald-500/30">
                  <img src="/kick.jpg" alt="Kick" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-lg sm:text-xl font-black mb-2">Conecta tu cuenta de Kick</h2>
                <p className="text-gray-400 text-xs mb-6 px-2">
                  Inicia sesión para consultar tus puntos acumulados en tiempo real y reclamar tus premios.
                </p>
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3.5 rounded-xl font-black text-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-500 hover:scale-[1.02] transition-all"
                >
                  💚 Iniciar sesión con Kick
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="logged-in-card"
                className="relative overflow-hidden rounded-3xl p-5 sm:p-8 text-left border border-emerald-500/30 bg-neutral-950/90"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
                  <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2 border-2 border-emerald-400 bg-neutral-900">
                      {kickUser.profilePic ? (
                        <img src={kickUser.profilePic} alt={kickUser.username} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-lg text-emerald-400 bg-emerald-950">
                          {kickUser.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-widest">Cuenta Vinculada</span>
                    <h3 className="text-base sm:text-lg font-black text-white">@{kickUser.username}</h3>
                    <button onClick={handleLogoutClick} className="text-xs text-red-400 hover:underline mt-1">
                      Desconectar
                    </button>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
                      <div>
                        <span className="text-gray-400 text-xs block">Saldo de Puntos Disponible</span>
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                          {currentPoints.toLocaleString()} <span className="text-xs text-gray-400">pts</span>
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-end">
                        {userTier.emoji} Rango: {userTier.name}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/50 border border-white/5 text-xs">
                      <div>
                        <span className="text-gray-500 text-[10px] block">Tiempo Visto</span>
                        <strong className="text-white">⏱️ {kickUser.watchTimeMinutes || 0} min</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Mensajes Chat</span>
                        <strong className="text-white">💬 {kickUser.chatMessagesCount || 0} msgs</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── TABS RESPONSIVAS ── */}
      <section className="py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 mb-8 bg-neutral-900/90 border border-white/10 rounded-2xl">
            <div className="flex overflow-x-auto gap-2 scrollbar-none">
              {([
                { id: 'store', label: '🛍️ Recompensas' },
                { id: 'my-claims', label: `📦 Reclamaciones (${userClaims.length})` },
                { id: 'earn', label: '⚡ Ganar Puntos' },
                { id: 'tiers', label: '🎖️ Rangos' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <a
              href="/leaderboard"
              className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            >
              🏆 Ver Leaderboard Completo ↗
            </a>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: TIENDA DE RECOMPENSAS */}
            {activeTab === 'store' && (
              <motion.div
                key="store"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {rewardsCatalog.map((reward, i) => {
                  const canAfford = currentPoints >= reward.pointsCost;
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-neutral-900/90 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl sm:text-4xl">{reward.image}</span>
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-white/5 border border-white/10 text-gray-300">
                            {reward.category}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white mb-1">{reward.title}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-4">{reward.description}</p>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between pt-3 border-t border-white/10 mb-4">
                          <span className="text-xs text-gray-400">Puntos Necesarios</span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                            {reward.pointsCost.toLocaleString()} <span className="text-xs">pts</span>
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenClaimModal(reward)}
                          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                            canAfford
                              ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-lg shadow-emerald-500/20'
                              : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                          }`}
                        >
                          {canAfford ? '✨ Reclamar Recompensa' : `Faltan ${reward.pointsCost - Math.floor(currentPoints)} pts`}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* TAB 2: MIS RECLAMACIONES */}
            {activeTab === 'my-claims' && (
              <motion.div
                key="my-claims"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {!kickUser ? (
                  <div className="text-center py-12 text-gray-500 text-xs sm:text-sm">
                    Inicia sesión para ver el historial de tus premios reclamados.
                  </div>
                ) : userClaims.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs sm:text-sm">
                    Aún no has reclamado ninguna recompensa. ¡Suma puntos y canjea tu primer premio!
                  </div>
                ) : (
                  userClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                    >
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">ID: {claim.id}</span>
                        <h4 className="text-base sm:text-lg font-black text-white">{claim.rewardTitle}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Puntos canjeados: <strong className="text-emerald-400 font-mono">{claim.pointsSpent} pts</strong> | Contacto: <span className="text-gray-300 font-mono">{claim.contactInfo}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            claim.status === 'PENDING'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                              : claim.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {claim.status === 'PENDING'
                            ? '⏳ Pendiente'
                            : claim.status === 'COMPLETED'
                            ? '✅ Entregado'
                            : '❌ Cancelado'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* TAB 3: CÓMO GANAR PUNTOS */}
            {activeTab === 'earn' && (
              <motion.div
                key="earn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
              >
                {WAYS_TO_EARN.map((way) => (
                  <div
                    key={way.id}
                    className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-emerald-500/20 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl sm:text-4xl">{way.icon}</span>
                      <span className="font-black text-emerald-400 text-xs px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        {way.points}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mb-1">{way.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{way.subtitle}</p>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">{way.description}</p>
                    <div className="space-y-2">
                      {way.steps.map((st, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-4 h-4 rounded-full bg-emerald-400 text-black font-black flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB 5: RANGOS */}
            {activeTab === 'tiers' && (
              <motion.div
                key="tiers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-white/5 flex items-center gap-4"
                  >
                    <div className="text-2xl sm:text-3xl">{tier.emoji}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-black text-white text-sm sm:text-base">{tier.name}</span>
                        <span className="text-[11px] sm:text-xs text-gray-400">
                          {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min} - ${tier.max} pts`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.perks.map((p) => (
                          <span key={p} className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── MODAL DE RECLAMO ── */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-neutral-950 border border-emerald-500/30 text-left relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Confirmar Reclamación
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{selectedReward.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedReward(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 mb-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Costo en puntos:</span>
                  <strong className="text-emerald-400 font-mono">{selectedReward.pointsCost} pts</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tu saldo actual:</span>
                  <strong className="text-white font-mono">{Math.floor(currentPoints)} pts</strong>
                </div>
              </div>

              {claimMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl border text-xs font-bold ${
                    claimMessage.type === 'success'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-red-950 border-red-500 text-red-400'
                  }`}
                >
                  {claimMessage.text}
                </div>
              )}

              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-300 block">
                  Método de contacto (Discord / WhatsApp / Nick Kick):
                </label>
                <input
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="ej: mi_usuario#1234 o +51 987654321"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-xs bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  disabled={claiming}
                  onClick={handleConfirmClaim}
                  className="flex-1 py-3 rounded-xl font-black text-xs text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1"
                >
                  {claiming ? 'Procesando...' : 'Confirmar y Canjear'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
