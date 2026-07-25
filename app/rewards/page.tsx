'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
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
    id: 'bet365',
    icon: '🎲',
    title: 'Registro en Bet365',
    subtitle: '50 puntos de regalo',
    points: '+50 pts',
    description: 'Regístrate en Bet365 mediante bit.ly/BEPUCHO y sube tu comprobante en la interfaz especial.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.4)',
    link: '/bet365',
  },
  {
    id: 'watch',
    icon: '📺',
    title: 'Ver el Stream',
    subtitle: '10 puntos por hora',
    points: '+10 pts / hora',
    description: 'Mantén la transmisión abierta en nuestra web. Sumas puntos de manera constante mientras disfrutas el directo.',
    color: '#53fc18',
    glow: 'rgba(83,252,24,0.4)',
    link: '/stream',
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'Participar en Chat',
    subtitle: '0.1 puntos por mensaje',
    points: '+0.1 pt / msg',
    description: 'Sé parte del chat en vivo de Bepucho. Cuenta con protección Anti-Spam (5 segundos de cooldown entre mensajes).',
    color: '#7fff00',
    glow: 'rgba(127,255,0,0.4)',
    link: '/stream',
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
      const res = await fetch('/api/rewards', { cache: 'no-store' });
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

  const handleLogout = async () => {
    await fetch('/api/kick/logout', { method: 'POST' });
    setKickUser(null);
    window.location.reload();
  };

  const handleClaimReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;

    if (!contactInput.trim()) {
      setClaimMessage({ type: 'error', text: 'Por favor ingresa tu dato de contacto.' });
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
        setClaimMessage({
          type: 'success',
          text: `¡Felicidades! Reclamaste "${selectedReward.title}". Quedó registrado para entrega.`,
        });
        if (kickUser && data.remainingPoints !== undefined) {
          setKickUser({ ...kickUser, points: data.remainingPoints });
        }
        setTimeout(() => {
          setSelectedReward(null);
          setContactInput('');
          setClaimMessage(null);
          fetchRewardsData();
        }, 3000);
      } else {
        setClaimMessage({ type: 'error', text: data.error || 'No se pudo procesar la reclamación.' });
      }
    } catch (e) {
      setClaimMessage({ type: 'error', text: 'Error de red al procesar el reclamo.' });
    } finally {
      setClaiming(false);
    }
  };

  const currentPoints = kickUser?.points || 0;
  const userTier = TIERS.slice().reverse().find((t) => currentPoints >= t.min) || TIERS[0];

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      {/* ── HEADER & USER STATUS ── */}
      <section ref={headerRef} className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <span>🎁 Tienda & Recompensas Puchismo</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4"
          >
            Canjea tus Puntos por <span className="text-emerald-400">Premios Exclusivos</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-8"
          >
            Gana puntos viendo el stream de Bepucho, participando en el chat o completando la misión especial de registrarte en Bet365.
          </motion.p>

          {/* Banner de Usuario Conectado / Estado */}
          <div className="max-w-xl mx-auto p-4 sm:p-6 rounded-3xl bg-neutral-950/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            {kickUser ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-400 bg-neutral-800 flex-shrink-0">
                    {kickUser.profilePic ? (
                      <img src={kickUser.profilePic} alt={kickUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-emerald-400 bg-emerald-950">
                        {kickUser.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">@{kickUser.username}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/10 text-emerald-400">
                        {userTier.emoji} {userTier.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      ⏱️ {kickUser.watchTimeMinutes} min | 💬 {kickUser.chatMessagesCount} msgs
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                  <div className="text-center sm:text-right bg-emerald-500/10 px-4 py-1.5 rounded-2xl border border-emerald-500/30 w-full sm:w-auto">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Tu Saldo</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                      {Math.floor(currentPoints)} <span className="text-xs text-white">pts</span>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition-all"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 space-y-3">
                <p className="text-xs text-gray-400">Inicia sesión con Kick para ver tus puntos y reclamar premios:</p>
                <a
                  href="/api/kick/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-black bg-emerald-400 hover:bg-emerald-300 transition-all text-sm shadow-lg shadow-emerald-500/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  🟢 Iniciar Sesión con Kick
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── BANNER DESTACADO BET365 50 PTS ── */}
      <section className="px-4 pb-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-emerald-950/80 to-neutral-950 border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black">
              <span>🔥 MISIÓN ESPECIAL</span>
              <span>•</span>
              <span>+50 PUNTOS DE REGALO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Regístrate en <span className="text-amber-400">Bet365</span> y Gana 50 Puntos
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
              Crea tu cuenta en Bet365 usando el enlace oficial de Bepucho y sube tu comprobante en la interfaz dedicada para recibir +50 puntos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="https://bit.ly/BEPUCHO"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-black bg-amber-400 hover:bg-amber-300 transition-all text-sm text-center shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              🚀 Registrarme en Bet365 ↗
            </a>
            <Link
              href="/bet365"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all text-sm text-center border border-white/10 flex items-center justify-center gap-1.5"
            >
              📤 Subir Capturas & Datos
            </Link>
          </div>
        </div>
      </section>

      {/* ── TABS NAVEGACIÓN ── */}
      <section className="px-4 pb-16 max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-950 border border-white/10 flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'store' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              🏬 Catálogo de Premios
            </button>
            <Link
              href="/bet365"
              className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 border border-amber-500/30"
            >
              <span>🎲 Misión Bet365 (+50 Pts) ↗</span>
            </Link>
            <button
              onClick={() => setActiveTab('my-claims')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'my-claims' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 Mis Canjes ({userClaims.length})
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'tiers' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              🏆 Nivel & Rangos
            </button>
          </div>
        </div>

        {/* ── CONTENIDO TABS ── */}
        <div>
          {/* TAB 1: CATÁLOGO DE RECOMPENSAS */}
          {activeTab === 'store' && (
            <div>
              {loadingRewards ? (
                <div className="py-16 text-center text-gray-400 text-sm">Cargando premios...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewardsCatalog.map((reward) => {
                    const canAfford = currentPoints >= reward.pointsCost;
                    const outOfStock = reward.stock === 0;

                    return (
                      <div
                        key={reward.id}
                        className="p-6 rounded-3xl bg-neutral-900/90 border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between relative overflow-hidden group shadow-xl"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <span className="text-4xl">{reward.image}</span>
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400">
                              {reward.category}
                            </span>
                          </div>

                          <h3 className="text-xl font-black mb-2 text-white">{reward.title}</h3>
                          <p className="text-gray-400 text-xs leading-relaxed mb-6">{reward.description}</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/5">
                            <span className="text-xs text-gray-400 font-medium">Puntos Necesarios</span>
                            <span className="text-xl font-black text-emerald-400 font-mono">
                              {reward.pointsCost.toLocaleString()} <span className="text-xs text-gray-300">pts</span>
                            </span>
                          </div>

                          <button
                            disabled={!kickUser || !canAfford || outOfStock}
                            onClick={() => {
                              setSelectedReward(reward);
                              setClaimMessage(null);
                            }}
                            className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                              outOfStock
                                ? 'bg-neutral-800 text-gray-500 cursor-not-allowed border border-white/5'
                                : canAfford && kickUser
                                ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 cursor-pointer'
                                : 'bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed'
                            }`}
                          >
                            {!kickUser
                              ? 'Inicia sesión para canjear'
                              : outOfStock
                              ? 'Agotado temporalmente'
                              : canAfford
                              ? '🎁 CANJEAR AHORA'
                              : `FALTAN ${Math.ceil(reward.pointsCost - currentPoints)} PTS`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CÓMO GANAR PUNTOS */}
          {activeTab === 'earn' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WAYS_TO_EARN.map((way) => (
                <div
                  key={way.id}
                  className="p-6 rounded-3xl bg-neutral-900/90 border border-emerald-500/20 relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{way.icon}</span>
                      <span className="font-black text-emerald-400 text-xs px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        {way.points}
                      </span>
                    </div>
                    <h3 className="text-xl font-black mb-1 text-white">{way.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{way.subtitle}</p>
                    <p className="text-gray-300 text-xs leading-relaxed mb-4">{way.description}</p>
                  </div>

                  <Link
                    href={way.link}
                    className="w-full py-3 rounded-xl font-bold text-xs text-center bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all block"
                  >
                    Ir a Misión →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MIS CANJES */}
          {activeTab === 'my-claims' && (
            <div className="space-y-4">
              {userClaims.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-neutral-900/50 rounded-3xl border border-white/5 text-sm">
                  Aún no has realizado ninguna reclamación de recompensas.
                </div>
              ) : (
                userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-base font-black text-white">{claim.rewardTitle}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Puntos gastados: <strong className="text-emerald-400 font-mono">{claim.pointsSpent} pts</strong> | Contacto: <span className="text-gray-300 font-mono">{claim.contactInfo}</span>
                      </p>
                    </div>

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
                        ? '⏳ Pendiente de entrega'
                        : claim.status === 'COMPLETED'
                        ? '✅ Entregado'
                        : '❌ Cancelado y reembolsado'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: RANGOS */}
          {activeTab === 'tiers' && (
            <div className="space-y-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="p-5 rounded-2xl bg-neutral-900 border border-white/5 flex items-center gap-4"
                >
                  <div className="text-3xl">{tier.emoji}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-black text-white text-base">{tier.name}</span>
                      <span className="text-xs text-gray-400">
                        {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min} - ${tier.max} pts`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.perks.map((p) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL RECLAMAR PREMIO ── */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-emerald-500/30 text-left relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Confirmar Reclamación
                  </span>
                  <h3 className="text-2xl font-black text-white">{selectedReward.title}</h3>
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

              <form onSubmit={handleClaimReward} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">
                    Dato de Contacto (Yape/Plin/Número o Discord):
                  </label>
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="Ej: Yape 987654321 / Discord: user#1234"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={claiming}
                    className="flex-1 py-3.5 rounded-xl font-black text-xs text-black bg-emerald-400 hover:bg-emerald-300 transition-all"
                  >
                    {claiming ? 'Procesando...' : 'Confirmar Canje'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
