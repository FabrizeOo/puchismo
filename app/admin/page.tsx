'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface Metrics {
  totalUsers: number;
  totalPointsInCirculation: number;
  totalClaims: number;
  pendingClaims: number;
  completedClaims: number;
}

interface AdminUser {
  idMasked: string;
  username: string;
  profilePic: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
  lastUpdated: string;
  createdAt: string;
}

interface Claim {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  contactInfo: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Proof {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  imageUrl: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'claims' | 'users' | 'proofs'>('claims');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal para ver imagen completa de prueba
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal / Edición CRUD de Puntos de Usuario
  const [editingUser, setEditingUser] = useState<{ username: string; points: number } | null>(null);
  const [newPointsInput, setNewPointsInput] = useState<string>('');

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, usersRes, claimsRes, proofsRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/claims', { cache: 'no-store' }),
        fetch('/api/admin/proofs', { cache: 'no-store' }),
      ]);

      if (statsRes.status === 401 || usersRes.status === 401) {
        setIsAuthenticated(false);
        setLoadingData(false);
        return;
      }

      setIsAuthenticated(true);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const claimsData = await claimsRes.json();
      const proofsData = await proofsRes.json();

      if (statsData.success) setMetrics(statsData.metrics);
      if (usersData.success) setUsers(usersData.users);
      if (claimsData.success) setClaims(claimsData.claims);
      if (proofsData.success) setProofs(proofsData.proofs);
    } catch (err) {
      console.error('Error cargando panel de admin:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchAdminData();
      } else {
        setLoginError(data.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setLoginError('Error de conexión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const handleUpdateClaimStatus = async (claimId: string, status: 'COMPLETED' | 'CANCELLED') => {
    setActionLoading(claimId);
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al actualizar' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error de red al procesar la acción' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleUpdateProofStatus = async (proofId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(proofId);
    try {
      const res = await fetch('/api/admin/proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al actualizar la prueba' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error de red al procesar la acción' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSaveUserPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const pts = parseFloat(newPointsInput);
    if (isNaN(pts)) {
      setNotification({ type: 'error', message: 'Ingresa un valor numérico válido de puntos.' });
      return;
    }

    setActionLoading('points-' + editingUser.username);
    try {
      const res = await fetch('/api/admin/users/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editingUser.username, points: pts }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message });
        setEditingUser(null);
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al guardar puntos' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error de red al modificar puntos' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredClaims = claims.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rewardTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProofs = proofs.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingProofsCount = proofs.filter((p) => p.status === 'PENDING').length;

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#030b04' }}>
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {!isAuthenticated ? (
          // ── FORMULARIO LOGIN DE ADMIN ──
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              className="w-full max-w-md p-8 rounded-3xl border border-green-500/20 bg-neutral-950/90 shadow-2xl relative overflow-hidden text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <h1 className="text-2xl font-black mb-1">Panel de Administración</h1>
              <p className="text-gray-400 text-xs mb-6">
                Ingresa la clave maestra para administrar usuarios, puntos y verificar pruebas Bet365
              </p>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Clave de administrador"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-center font-mono text-sm"
                />
                <motion.button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl font-black text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loginLoading ? 'Verificando...' : 'Acceder al Panel'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        ) : (
          // ── PANEL PRINCIPAL DE ADMINISTRACIÓN ──
          <div>
            {/* Header Admin */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  🛡️ Control Center
                </span>
                <h1 className="text-3xl font-black mt-2">Administración de Usuarios y Puntos</h1>
                <p className="text-gray-400 text-sm">
                  Asignación y CRUD de puntos, verificación de pruebas Bet365 y entrega de recompensas.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchAdminData}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  🔄 Actualizar Datos
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Cerrar Sesión Admin
                </button>
              </div>
            </div>

            {/* Notificaciones Toasts */}
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-2xl border font-bold text-sm flex items-center gap-3 ${
                  notification.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-950/80 border-red-500/40 text-red-400'
                }`}
              >
                <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                <span>{notification.message}</span>
              </motion.div>
            )}

            {/* Métricas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10">
                <span className="text-gray-400 text-xs block font-semibold mb-1">Total Usuarios</span>
                <span className="text-3xl font-black text-white">{metrics?.totalUsers || users.length || 0}</span>
                <span className="text-gray-500 text-[10px] block mt-1">Cuentas registadas en Supabase</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-emerald-500/20">
                <span className="text-emerald-400 text-xs block font-semibold mb-1">Puntos en Circulación</span>
                <span className="text-3xl font-black text-emerald-400">
                  {metrics?.totalPointsInCirculation?.toLocaleString() || 0}
                </span>
                <span className="text-gray-500 text-[10px] block mt-1">Acumulados en la plataforma</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-yellow-500/20">
                <span className="text-yellow-400 text-xs block font-semibold mb-1">Pruebas Bet365 Pendientes</span>
                <span className="text-3xl font-black text-yellow-400">{pendingProofsCount}</span>
                <span className="text-gray-500 text-[10px] block mt-1">Capturas por revisar</span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10">
                <span className="text-gray-400 text-xs block font-semibold mb-1">Premios Reclamados</span>
                <span className="text-3xl font-black text-white">{claims.length}</span>
                <span className="text-gray-500 text-[10px] block mt-1">Solicitudes de canje</span>
              </div>
            </div>

            {/* Tabs de Navegación Admin */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex rounded-2xl p-1 bg-neutral-900 border border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab('claims');
                    setFilterStatus('ALL');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'claims' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🎁 Reclamaciones ({claims.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('proofs');
                    setFilterStatus('ALL');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all relative ${
                    activeTab === 'proofs' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📸 Pruebas Bet365 ({proofs.length})
                  {pendingProofsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-400 text-black font-black text-[10px]">
                      {pendingProofsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setFilterStatus('ALL');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'users' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  👥 Usuarios & CRUD Puntos ({users.length})
                </button>
              </div>

              {/* Buscador */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por usuario o datos..."
                className="w-full sm:w-72 px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* TAB 1: RECLAMACIONES */}
            {activeTab === 'claims' && (
              <div>
                <div className="flex gap-2 mb-4">
                  {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filterStatus === st
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                          : 'bg-black/40 text-gray-400 border border-white/5'
                      }`}
                    >
                      {st === 'ALL' ? 'Todas' : st === 'PENDING' ? '⏳ Pendientes' : st === 'COMPLETED' ? '✅ Entregadas' : '❌ Canceladas'}
                    </button>
                  ))}
                </div>

                <div className="bg-neutral-900/90 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Usuario Kick</th>
                          <th className="py-3 px-4">Recompensa Canjeada</th>
                          <th className="py-3 px-4">Puntos Gastados</th>
                          <th className="py-3 px-4">Contacto / Entrega</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4 text-right">Acciones Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {filteredClaims.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500 font-sans">
                              No hay reclamaciones encontradas.
                            </td>
                          </tr>
                        ) : (
                          filteredClaims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4 font-sans font-bold">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-800 flex-shrink-0">
                                    {claim.profilePic ? (
                                      <img src={claim.profilePic} alt={claim.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-black text-xs text-emerald-400 bg-emerald-950">
                                        {claim.username.substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <span>@{claim.username}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-sans font-bold text-white">{claim.rewardTitle}</td>
                              <td className="py-3 px-4 text-emerald-400 font-black">{claim.pointsSpent} pts</td>
                              <td className="py-3 px-4 font-sans">
                                <span className="bg-black/60 px-2 py-1 rounded text-gray-300 border border-white/10 font-mono text-[11px]">
                                  {claim.contactInfo}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 text-[11px]">
                                {new Date(claim.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-sans">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    claim.status === 'PENDING'
                                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                      : claim.status === 'COMPLETED'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {claim.status === 'PENDING' ? '⏳ Pendiente' : claim.status === 'COMPLETED' ? '✅ Entregado' : '❌ Cancelado'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-sans">
                                {claim.status === 'PENDING' && (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      disabled={actionLoading === claim.id}
                                      onClick={() => handleUpdateClaimStatus(claim.id, 'COMPLETED')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold transition-all"
                                    >
                                      ✓ Marcar Entregado
                                    </button>
                                    <button
                                      disabled={actionLoading === claim.id}
                                      onClick={() => handleUpdateClaimStatus(claim.id, 'CANCELLED')}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 text-[11px] font-bold transition-all"
                                    >
                                      ✕ Cancelar
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRUEBAS BET365 */}
            {activeTab === 'proofs' && (
              <div>
                <div className="flex gap-2 mb-4">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filterStatus === st
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                          : 'bg-black/40 text-gray-400 border border-white/5'
                      }`}
                    >
                      {st === 'ALL' ? 'Todas' : st === 'PENDING' ? '⏳ Pendientes' : st === 'APPROVED' ? '✅ Aprobadas (+50 pts)' : '❌ Rechazadas'}
                    </button>
                  ))}
                </div>

                <div className="bg-neutral-900/90 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Usuario Kick</th>
                          <th className="py-3 px-4">Captura de Pantalla</th>
                          <th className="py-3 px-4">Notas / Usuario Bet365</th>
                          <th className="py-3 px-4">Fecha de Envío</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4 text-right">Acción Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {filteredProofs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 font-sans">
                              No hay capturas enviadas con ese filtro.
                            </td>
                          </tr>
                        ) : (
                          filteredProofs.map((proof) => (
                            <tr key={proof.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4 font-sans font-bold">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-800 flex-shrink-0">
                                    {proof.profilePic ? (
                                      <img src={proof.profilePic} alt={proof.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-black text-xs text-emerald-400 bg-emerald-950">
                                        {proof.username.substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <span>@{proof.username}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div
                                  onClick={() => setPreviewImage(proof.imageUrl)}
                                  className="w-24 h-16 rounded-xl overflow-hidden border border-emerald-500/40 bg-black cursor-pointer relative group hover:scale-105 transition-transform"
                                >
                                  <img src={proof.imageUrl} alt="Prueba Bet365" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                                    🔍 Ver Grande
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-sans text-gray-300">
                                {proof.notes ? (
                                  <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px] block max-w-xs truncate">
                                    {proof.notes}
                                  </span>
                                ) : (
                                  <span className="text-gray-600 italic">Sin notas</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-400 text-[11px]">
                                {new Date(proof.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-sans">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    proof.status === 'PENDING'
                                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                      : proof.status === 'APPROVED'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {proof.status === 'PENDING'
                                    ? '⏳ En Revisión'
                                    : proof.status === 'APPROVED'
                                    ? '✅ Aprobado (+50 pts)'
                                    : '❌ Rechazado'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-sans">
                                <div className="flex justify-end gap-2">
                                  {proof.status !== 'APPROVED' && (
                                    <button
                                      disabled={actionLoading === proof.id}
                                      onClick={() => handleUpdateProofStatus(proof.id, 'APPROVED')}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold transition-all"
                                    >
                                      ✓ Aprobar (+50 pts)
                                    </button>
                                  )}
                                  {proof.status !== 'REJECTED' && (
                                    <button
                                      disabled={actionLoading === proof.id}
                                      onClick={() => handleUpdateProofStatus(proof.id, 'REJECTED')}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 text-[11px] font-bold transition-all"
                                    >
                                      ✕ Rechazar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USUARIOS & CRUD DE PUNTOS */}
            {activeTab === 'users' && (
              <div className="bg-neutral-900/90 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 bg-emerald-950/40 border-b border-white/10 text-xs text-emerald-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>
                      <strong>Gestión de Puntos (CRUD):</strong> Puedes modificar directamente el saldo de puntos de cualquier usuario. Los cambios se sincronizan en tiempo real con Supabase.
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Usuario Kick</th>
                        <th className="py-3 px-4">Puntos Actuales</th>
                        <th className="py-3 px-4">Tiempo en Stream</th>
                        <th className="py-3 px-4">Mensajes Chat</th>
                        <th className="py-3 px-4">Última Actividad</th>
                        <th className="py-3 px-4 text-right">Asignar / Editar Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500 font-sans">
                            No hay usuarios encontrados.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.username} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-sans font-bold">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-800 flex-shrink-0">
                                  {u.profilePic ? (
                                    <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-emerald-400 bg-emerald-950">
                                      {u.username.substring(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <span>@{u.username}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-emerald-400 font-black text-sm">{u.points} pts</td>
                            <td className="py-3 px-4 text-gray-300">⏱️ {u.watchTimeMinutes} min</td>
                            <td className="py-3 px-4 text-gray-300">💬 {u.chatMessagesCount} msgs</td>
                            <td className="py-3 px-4 text-gray-500 text-[11px]">
                              {new Date(u.lastUpdated).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-sans">
                              <button
                                onClick={() => {
                                  setEditingUser({ username: u.username, points: u.points });
                                  setNewPointsInput(u.points.toString());
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-all"
                              >
                                ✏️ Asignar Puntos
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PARA EDITAR PUNTOS DE USUARIO (CRUD) */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-emerald-500/40 text-left relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Gestión de Puntos (CRUD)
                  </span>
                  <h3 className="text-xl font-black text-white">Modificar Puntos de @{editingUser.username}</h3>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveUserPoints} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">
                    Nuevo Total de Puntos:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPointsInput}
                    onChange={(e) => setNewPointsInput(e.target.value)}
                    placeholder="Ej: 50"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-emerald-400 font-mono font-black text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewPointsInput((parseFloat(newPointsInput || '0') + 50).toString())}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                  >
                    +50 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPointsInput((parseFloat(newPointsInput || '0') + 100).toString())}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                  >
                    +100 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPointsInput((parseFloat(newPointsInput || '0') + 500).toString())}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                  >
                    +500 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPointsInput('0')}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-bold"
                  >
                    Reset a 0
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-black text-xs text-black bg-emerald-400 hover:bg-emerald-300 transition-all"
                  >
                    💾 Guardar en Supabase
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PARA AMPLIAR IMAGEN DE PRUEBA */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] p-4 rounded-3xl bg-neutral-950 border border-white/20 relative flex flex-col items-center"
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 text-white bg-black/70 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
              <img
                src={previewImage}
                alt="Comprobante Bet365"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/10"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
