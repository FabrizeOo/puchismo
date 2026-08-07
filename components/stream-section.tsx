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
          if (parsed.event === 'App\\Events\\ChatMessageEvent') {
            const d = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
            const msgUser = d.sender?.username || d.sender?.slug || 'Usuario';
            
            const newMsg: ChatMessage = {
              id: `${++msgIdRef.current}`,
              user: msgUser,
              content: d.content || '',
              color: d.sender?.identity?.color || getColor(msgUser),
              badges: d.sender?.identity?.badges?.map((b: { type: string }) => b.type) || [],
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev.slice(-150), newMsg]);

            if (loggedInUsername && msgUser.toLowerCase() === loggedInUsername.toLowerCase()) {
              fetch('/api/kick/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', username: loggedInUsername }),
              })
              .then((res) => res.json())
              .then((data) => {
                if (data.success && onStatsUpdate) {
                  onStatsUpdate(data);
                }
              })
              .catch(() => {});
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
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin max-h-[400px] xl:max-h-[550px]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💬
            </motion.div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-semibold mb-1">
                {connected ? 'Esperando mensajes...' : 'Cargando chat...'}
              </p>
              <p className="text-gray-600 text-[11px]">
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
          className="w-full block text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electric/30 text-xs sm:text-sm text-gray-400 hover:text-white transition-all"
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
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    
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

    // Verificar si el canal de Kick está en vivo al cargar
    fetch('/api/kick/bepucho')
      .then((res) => res.json())
      .then((data) => {
        setIsLive(!!data.isLive);
      })
      .catch(() => setIsLive(false));

    const onUserUpdated = (evt: CustomEvent) => {
      if (evt.detail?.isLive !== undefined) {
        setIsLive(evt.detail.isLive);
      }
    };
    window.addEventListener('kick_user_updated', onUserUpdated as EventListener);
    return () => {
      window.removeEventListener('kick_user_updated', onUserUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!kickUser) return;

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
          if (data.isLive !== undefined) {
            setIsLive(data.isLive);
          }
          setKickUser((prev: any) => prev ? {
            ...prev,
            points: data.points,
            watchTimeMinutes: data.watchTimeMinutes,
            chatMessagesCount: data.chatMessagesCount
          } : null);
        }
      })
      .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [kickUser]);

  return (
    <section className="pt-24 sm:pt-28 pb-12 px-3 sm:px-4 min-h-screen">
      <div className="max-w-[1700px] mx-auto">

        {/* Header */}
        <motion.div
          className="text-center py-4 sm:py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs sm:text-sm font-bold mb-3">
            <motion.span
              className={`w-2 h-2 rounded-full ${isLive !== false ? 'bg-red-500' : 'bg-gray-500'}`}
              animate={isLive !== false ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {isLive === false ? 'CANAL OFFLINE — KICK.COM/BEPUCHO' : 'CANAL EN VIVO — KICK.COM/BEPUCHO'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-poppins font-black mb-2">
            <span className="text-white">Stream de </span>
            <span className="text-gradient">Bepucho</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-base">Fútbol en vivo (Champions, Premier, Liga 1, etc.) con la comunidad Puchismo</p>
        </motion.div>

        {/* Notificación de puntos activa según estado live */}
        {kickUser && isLive === true && (
          <motion.div 
            className="max-w-md mx-auto mb-4 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-center text-xs font-bold text-green-400 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="animate-ping w-2.5 h-2.5 rounded-full bg-green-400" />
            Stream en vivo: Acumulando +0.4 pts/min para @{kickUser.username}.
          </motion.div>
        )}

        {kickUser && isLive === false && (
          <motion.div 
            className="max-w-md mx-auto mb-4 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-center text-xs font-bold text-yellow-400 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            Streamer offline: Los puntos solo se acumulan cuando @Bepucho transmite en vivo.
          </motion.div>
        )}

        {/* Stream + Chat */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 mt-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* PLAYER */}
          <div className="flex flex-col gap-4">
            <div className="glass-card overflow-hidden rounded-2xl">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-dark-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400 font-mono">kick.com/bepucho</span>
                <div className="ml-auto flex items-center gap-2">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isLive !== false ? 'bg-red-500' : 'bg-gray-500'}`}
                    animate={isLive !== false ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className={`text-[10px] sm:text-xs font-semibold ${isLive !== false ? 'text-red-400' : 'text-gray-400'}`}>
                    {isLive === false ? 'OFFLINE' : 'EN VIVO'}
                  </span>
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
            <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Bepucho</h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Transmisiones en vivo de partidos 🏆 Comunidad Puchismo
                </p>
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <a
                  href="https://kick.com/bepucho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-kick text-xs sm:text-sm py-2 px-4 flex-1 sm:flex-none text-center whitespace-nowrap"
                >
                  Abrir en Kick ↗
                </a>
                <a
                  href="https://discord.gg/puchismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-discord text-xs sm:text-sm py-2 px-4 flex-1 sm:flex-none text-center whitespace-nowrap"
                >
                  Discord
                </a>
              </div>
            </div>
          </div>

          {/* CHAT */}
          <div className="glass-card overflow-hidden rounded-2xl flex flex-col h-[450px] xl:h-[650px]">
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
