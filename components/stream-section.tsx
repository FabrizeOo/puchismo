'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================
   CHAT EN TIEMPO REAL VÍA KICK WEBSOCKET
   ============================================ */

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  color: string;
  badges: string[];
  timestamp: number;
}

const COLORS = [
  '#00d4ff', '#8b5cf6', '#f59e0b', '#10b981',
  '#f43f5e', '#3b82f6', '#a78bfa', '#34d399',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function LiveChat({ 
  channelSlug, 
  loggedInUsername, 
  onStatsUpdate 
}: { 
  channelSlug: string; 
  loggedInUsername: string | null; 
  onStatsUpdate?: (data: { points: number; watchTimeMinutes: number; chatMessagesCount: number }) => void 
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  // Paso 1: Obtener chatroom ID via proxy Next.js (evita CORS)
  useEffect(() => {
    fetch(`/api/kick/${channelSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.chatroomId) {
          setChannelId(data.chatroomId);
        } else {
          setError('no-id');
        }
      })
      .catch(() => setError('no-id'));
  }, [channelSlug]);

  // Paso 2: Conectar al WebSocket de Pusher (backend de Kick) con auto-reconexión
  useEffect(() => {
    if (!channelId) return;

    const PUSHER_KEY = '32cbd69e4b950bf97679';
    const PUSHER_CLUSTER = 'us2';
    const wsUrl = `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=7.0.3&flash=false`;

    let pingInterval: ReturnType<typeof setInterval>;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let active = true;

    function connect() {
      if (!active) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) { ws.close(); return; }
        setConnected(true);
        setError(null);
        ws.send(JSON.stringify({
          event: 'pusher:subscribe',
          data: { auth: '', channel: `chatrooms.${channelId}.v2` },
        }));
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
          }
        }, 25000);
      };

      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          // DEBUG: log every event received from Kick WebSocket
          if (parsed.event !== 'pusher:pong' && parsed.event !== 'pusher:connection_established') {
            console.log('[Kick WS] Event received:', parsed.event, '| loggedInAs:', loggedInUsername);
          }
          if (parsed.event === 'App\\Events\\ChatMessageEvent') {
            const d = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
            const msgUser = d.sender?.username || d.sender?.slug || 'Usuario';
            console.log('[Kick Chat] Message from:', msgUser, '| loggedIn:', loggedInUsername, '| match:', loggedInUsername && msgUser.toLowerCase() === loggedInUsername.toLowerCase());
            
            const newMsg: ChatMessage = {
              id: `${++msgIdRef.current}`,
              user: msgUser,
              content: d.content || '',
              color: d.sender?.identity?.color || getColor(msgUser),
              badges: d.sender?.identity?.badges?.map((b: { type: string }) => b.type) || [],
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev.slice(-150), newMsg]);

            // Si el mensaje es del usuario conectado, sumamos un punto por chatear de forma automática
            if (loggedInUsername && msgUser.toLowerCase() === loggedInUsername.toLowerCase()) {
              console.log('[Kick Chat] Sending chat heartbeat for:', loggedInUsername);
              fetch('/api/kick/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', username: loggedInUsername }),
              })
              .then((res) => res.json())
              .then((data) => {
                console.log('[Kick Chat] Heartbeat response:', data);
                if (data.success && onStatsUpdate) {
                  onStatsUpdate(data);
                }
              })
              .catch((e) => console.error("Error sending chat heartbeat:", e));
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        clearInterval(pingInterval);
        if (active) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      active = false;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [channelId, loggedInUsername]);

  // Auto-scroll al fondo localmente en el contenedor
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getBadgeEmoji = (badge: string) => {
    const map: Record<string, string> = {
      broadcaster: '👑',
      moderator: '🛡️',
      subscriber: '⭐',
      vip: '💎',
      og: '🔥',
    };
    return map[badge] || '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <span className="text-sm font-bold text-white">💬 Chat en Vivo</span>
        <div className="ml-auto flex items-center gap-2">
          {connected ? (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-green-400 font-semibold">Conectado</span>
            </>
          ) : error ? (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold">Reconectando...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
              <span className="text-xs text-gray-500">Conectando...</span>
            </>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💬
            </motion.div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">
                {connected ? 'Esperando mensajes...' : 'Cargando chat...'}
              </p>
              <p className="text-gray-600 text-xs">
                El chat aparece aquí en tiempo real
              </p>
            </div>
            <a
              href="https://kick.com/bepucho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-electric hover:underline"
            >
              Abrir chat en Kick.com →
            </a>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className="flex gap-2 group"
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold flex-shrink-0" style={{ color: msg.color }}>
                  {msg.badges.map((b) => getBadgeEmoji(b)).join('')}
                  {msg.user}
                </span>
                <span className="text-gray-400 text-xs mx-1">:</span>
                <span className="text-white/90 text-xs break-words leading-relaxed">
                  {msg.content}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>

      {/* Footer del chat */}
      <div className="border-t border-white/10 px-4 py-3 flex-shrink-0">
        <a
          href="https://kick.com/bepucho"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electric/30 text-sm text-gray-400 hover:text-white transition-all"
        >
          Chatear en Kick.com ↗
        </a>
      </div>
    </div>
  );
}

/* ============================================
   STREAM SECTION PRINCIPAL
   ============================================ */

export function StreamSection() {
  const [mounted, setMounted] = useState(false);
  const [kickUser, setKickUser] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Obtener usuario conectado
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
    
    const user = getCookie('kick_user_profile');
    if (user) {
      setKickUser(user);
    }
  }, []);

  // Heartbeat para sumar puntos de visualización (+10 puntos por minuto)
  useEffect(() => {
    if (!kickUser) return;

    // Ejecuta el latido cada 60 segundos
    const interval = setInterval(() => {
      fetch('/api/kick/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'watch',
          username: kickUser.username,
        }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setKickUser((prev: any) => prev ? {
            ...prev,
            points: data.points,
            watchTimeMinutes: data.watchTimeMinutes,
            chatMessagesCount: data.chatMessagesCount
          } : null);
        }
      })
      .catch((e) => console.error("Error sending watch heartbeat:", e));
    }, 60000);

    return () => clearInterval(interval);
  }, [kickUser]);

  return (
    <section className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-[1700px] mx-auto">

        {/* Header */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-sm font-bold mb-4">
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            CANAL EN VIVO — KICK.COM/BEPUCHO
          </div>
          <h1 className="text-4xl md:text-5xl font-poppins font-black mb-3">
            <span className="text-white">Stream de </span>
            <span className="text-gradient">Bepucho</span>
          </h1>
          <p className="text-gray-400 text-lg">Mundial 2026 con toda la comunidad Puchismo</p>
        </motion.div>

        {/* Notificación de puntos activa */}
        {kickUser && (
          <motion.div 
            className="max-w-md mx-auto mb-6 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-center text-xs font-bold text-green-400 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="animate-ping w-2.5 h-2.5 rounded-full bg-green-400" />
            Rastreador de puntos activo para @{kickUser.username}. ¡Ganando +10 pts/min!
          </motion.div>
        )}

        {/* Stream + Chat — layout lado a lado */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 mt-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* ── PLAYER ── */}
          <div className="flex flex-col gap-4">
            <div className="glass-card overflow-hidden">
              {/* Barra decorativa */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-dark-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-gray-400 font-mono">kick.com/bepucho</span>
                <div className="ml-auto flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs text-red-400 font-semibold">EN VIVO</span>
                </div>
              </div>

              {/* Video 16:9 */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                {mounted && (
                  <iframe
                    src="https://player.kick.com/bepucho?autoplay=true&muted=false"
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    frameBorder="0"
                    title="Bepucho en Kick.com"
                  />
                )}
              </div>
            </div>

            {/* Info bar */}
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Bepucho</h2>
                <p className="text-sm text-gray-400">
                  Transmisiones del Mundial 2026 🏆 Comunidad Puchismo
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://kick.com/bepucho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-kick text-sm py-2 px-5 whitespace-nowrap"
                >
                  Abrir en Kick ↗
                </a>
                <a
                  href="https://discord.gg/puchismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-discord text-sm py-2 px-5 whitespace-nowrap"
                >
                  Discord
                </a>
              </div>
            </div>

            {/* Aviso offline */}
            <div className="glass-card border-yellow-500/20 p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-sm text-gray-400">
                Si el stream aparece offline, Bepucho no está transmitiendo en este momento.
                Únete al{' '}
                <a
                  href="https://discord.gg/puchismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Discord
                </a>{' '}
                para recibir avisos de inicio de stream.
              </p>
            </div>
          </div>

          {/* ── CHAT ── */}
          <div
            className="glass-card overflow-hidden flex flex-col"
            style={{ height: 'calc(56.25vw * 0.6 + 200px)', maxHeight: '85vh', minHeight: '600px' }}
          >
            {mounted && (
              <LiveChat 
                channelSlug="bepucho" 
                loggedInUsername={kickUser?.username || null} 
                onStatsUpdate={(data) => {
                  setKickUser((prev: any) => prev ? {
                    ...prev,
                    ...data
                  } : null);
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
