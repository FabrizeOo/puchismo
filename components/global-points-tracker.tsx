'use client';

import { useEffect, useRef } from 'react';

const CHANNEL_SLUG = 'bepucho';
const CHATROOM_ID = 5258420; // hardcoded para evitar request extra
const PUSHER_KEY = '32cbd69e4b950bf97679';
const PUSHER_CLUSTER = 'us2';

function getCookieUser() {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; kick_user_profile=`);
    if (parts.length === 2) {
      const raw = parts.pop()!.split(';').shift()!;
      try {
        return JSON.parse(decodeURIComponent(raw));
      } catch {
        return JSON.parse(raw);
      }
    }
  } catch {}
  return null;
}

export function GlobalPointsTracker() {
  const wsRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string | null>(null);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Heartbeat: watch time (corre siempre que haya usuario loggeado) ---
  const sendWatchHeartbeat = () => {
    const user = getCookieUser();
    if (!user?.username) return;

    fetch('/api/kick/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'watch', username: user.username }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          window.dispatchEvent(
            new CustomEvent('kick_user_updated', {
              detail: {
                ...user,
                points: data.points,
                watchTimeMinutes: data.watchTimeMinutes,
                chatMessagesCount: data.chatMessagesCount,
                isLive: data.isLive,
              },
            })
          );
        }
      })
      .catch(() => {});
  };

  // --- Heartbeat: mensaje de chat ---
  const sendChatHeartbeat = (username: string) => {
    fetch('/api/kick/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', username }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const user = getCookieUser();
          window.dispatchEvent(
            new CustomEvent('kick_user_updated', {
              detail: {
                ...(user || {}),
                username,
                points: data.points,
                watchTimeMinutes: data.watchTimeMinutes,
                chatMessagesCount: data.chatMessagesCount,
                isLive: data.isLive,
              },
            })
          );
        }
      })
      .catch(() => {});
  };

  // --- WebSocket: escuchar el chat de Kick globalmente ---
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=7.0.3&flash=false`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'pusher:subscribe',
          data: { auth: '', channel: `chatrooms.${CHATROOM_ID}.v2` },
        })
      );

      // Ping para mantener la conexión viva
      pingIntervalRef.current = setInterval(() => {
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
          const msgUser: string = (d.sender?.username || d.sender?.slug || '').toLowerCase();

          // Si el usuario loggeado es el que mandó el mensaje → sumar puntos
          const loggedUser = usernameRef.current;
          if (loggedUser && msgUser && msgUser === loggedUser.toLowerCase()) {
            sendChatHeartbeat(loggedUser);
          }
        }
      } catch {}
    };

    ws.onclose = () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      // Reconectar en 4 segundos
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 4000);
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  useEffect(() => {
    // Actualizar el ref de username desde la cookie en cada render
    const refreshUsername = () => {
      const user = getCookieUser();
      usernameRef.current = user?.username || null;
    };

    refreshUsername();

    // Escuchar cambios de usuario (login/logout)
    const onUserUpdated = () => refreshUsername();
    window.addEventListener('kick_user_updated', onUserUpdated);

    // Conectar WebSocket al chat de Kick (siempre, en todas las páginas)
    connectWebSocket();

    // Watch heartbeat: cada 30 segundos
    sendWatchHeartbeat();
    watchIntervalRef.current = setInterval(sendWatchHeartbeat, 30000);

    return () => {
      window.removeEventListener('kick_user_updated', onUserUpdated);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);

  return null;
}
