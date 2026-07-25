'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface KickUser {
  id: string;
  username: string;
  profilePic: string;
  slug: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
}

interface ProofItem {
  id: string;
  imageUrl: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsAwarded: number;
  createdAt: string;
}

export default function Bet365Page() {
  const [kickUser, setKickUser] = useState<KickUser | null>(null);
  const [userProofs, setUserProofs] = useState<ProofItem[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Formulario de prueba
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [bet365Username, setBet365Username] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofMessage, setProofMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchProofsData = async () => {
    try {
      const res = await fetch('/api/proofs', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.proofs)) {
          setUserProofs(data.proofs);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserData();
    fetchProofsData();

    const interval = setInterval(() => {
      fetchUserData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setProofMessage({ type: 'error', text: 'La imagen es muy pesada. Debe pesar menos de 8MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImageBase64(reader.result as string);
      setProofMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImageBase64) {
      setProofMessage({ type: 'error', text: 'Por favor adjunta la captura de pantalla comprobante.' });
      return;
    }

    if (!bet365Username.trim()) {
      setProofMessage({ type: 'error', text: 'Por favor ingresa tu nombre de usuario en Bet365.' });
      return;
    }

    setSubmittingProof(true);
    setProofMessage(null);

    try {
      const res = await fetch('/api/proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: proofImageBase64,
          notes: `Usuario Bet365: ${bet365Username.trim()}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProofMessage({ type: 'success', text: data.message });
        setProofImageBase64(null);
        setBet365Username('');
        fetchProofsData();
      } else {
        setProofMessage({ type: 'error', text: data.error || 'Error al enviar la prueba.' });
      }
    } catch (e) {
      setProofMessage({ type: 'error', text: 'Error de conexión al enviar la prueba.' });
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/kick/logout', { method: 'POST' });
    setKickUser(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider"
          >
            <span>🎲 Misión Especial Promocional</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Gana <span className="text-amber-400">+50 Puntos</span> Registrándote en Bet365
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Regístrate en Bet365 mediante el código de creador de Bepucho, sube la captura comprobante y recibe 50 puntos acumulables para canjear por premios reales.
          </p>
        </div>

        {/* User Card Bar (con Iniciar Sesión y Cerrar Sesión) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-neutral-950/90 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {kickUser ? (
            <>
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
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Conectado
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Saldo: <strong className="text-emerald-400 font-mono">{Math.floor(kickUser.points)} pts</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all flex items-center justify-center gap-1.5"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="text-center sm:text-left">
                <span className="text-white font-bold text-sm block">¿Aún no te has conectado?</span>
                <span className="text-gray-400 text-xs block">
                  Debes iniciar sesión con tu cuenta de Kick para asignar los 50 puntos a tu perfil.
                </span>
              </div>
              <a
                href="/api/kick/login"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-black bg-emerald-400 hover:bg-emerald-300 transition-all text-xs text-center flex items-center justify-center gap-2"
              >
                🟩 Iniciar Sesión con KICK
              </a>
            </div>
          )}
        </div>

        {/* Paso 1: Redirección Bet365 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Paso 1: Registro en Bet365
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Crea tu cuenta con el enlace oficial de Bepucho
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm max-w-lg">
              Presiona el botón de abajo para ir directamente al sitio de registro de Bet365 con el código de creador habilitado.
            </p>
          </div>

          <a
            href="https://bit.ly/BEPUCHO"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl font-black text-black bg-amber-400 hover:bg-amber-300 transition-all text-sm text-center shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 flex-shrink-0"
          >
            🚀 Ir a Bet365 (bit.ly/BEPUCHO) ↗
          </a>
        </div>

        {/* Paso 2: Formulario de comprobante */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Paso 2: Subir Captura & Usuario
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Enviar Comprobante de Registro</h3>
            <p className="text-gray-400 text-xs mt-1">
              Sube una captura clara de tu perfil o registro en Bet365 e ingresa tu nombre de usuario exacto.
            </p>
          </div>

          {proofMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
                proofMessage.type === 'success'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  : 'bg-red-950 border-red-500 text-red-400'
              }`}
            >
              <span>{proofMessage.type === 'success' ? '✅' : '❌'}</span>
              <span>{proofMessage.text}</span>
            </div>
          )}

          {!kickUser ? (
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-center space-y-3">
              <p className="text-xs text-gray-400">Debes iniciar sesión con Kick para poder subir tus pruebas.</p>
              <a
                href="/api/kick/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-black bg-emerald-400 hover:bg-emerald-300 transition-all"
              >
                🟩 Conectar Cuenta de Kick
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">
                  1. Selecciona tu captura de pantalla (JPG o PNG):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer"
                />
              </div>

              {proofImageBase64 && (
                <div className="p-3 rounded-2xl bg-black border border-amber-500/30 inline-block">
                  <span className="text-[10px] text-amber-400 block mb-1 font-bold">Vista previa de la captura:</span>
                  <img src={proofImageBase64} alt="Preview" className="h-40 rounded-xl object-contain" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  2. Nombre de Usuario en Bet365:
                </label>
                <input
                  type="text"
                  value={bet365Username}
                  onChange={(e) => setBet365Username(e.target.value)}
                  placeholder="Ejemplo: PuchismoBet99"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProof || !proofImageBase64}
                className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${
                  submittingProof || !proofImageBase64
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                    : 'bg-amber-400 text-black hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-500/20'
                }`}
              >
                {submittingProof ? 'Enviando comprobante...' : '📤 ENVIAR COMPROBANTE (+50 PTS)'}
              </button>
            </form>
          )}
        </div>

        {/* Mis Pruebas Enviadas */}
        {userProofs.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-4">
            <h3 className="text-lg font-black text-white">Historial de Pruebas Enviadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userProofs.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt="Proof" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                    <div>
                      <span className="text-xs font-bold text-white block">{p.notes || 'Comprobante Bet365'}</span>
                      <span className="text-[10px] text-gray-400 block">{new Date(p.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'PENDING'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : p.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {p.status === 'PENDING' ? '⏳ En Revisión' : p.status === 'APPROVED' ? '✅ Aprobado (+50 pts)' : '❌ Rechazado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
