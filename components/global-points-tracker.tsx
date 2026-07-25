'use client';

import { useEffect } from 'react';

export function GlobalPointsTracker() {
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        try {
          const raw = parts.pop()!.split(';').shift()!;
          return JSON.parse(decodeURIComponent(raw));
        } catch {
          try {
            const raw = parts.pop()!.split(';').shift()!;
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }
      }
      return null;
    };

    const sendHeartbeat = () => {
      const user = getCookie('kick_user_profile');
      if (!user || !user.username) return;

      fetch('/api/kick/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'watch',
          username: user.username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const updatedUser = {
              ...user,
              points: data.points,
              watchTimeMinutes: data.watchTimeMinutes,
              chatMessagesCount: data.chatMessagesCount,
            };
            window.dispatchEvent(new CustomEvent('kick_user_updated', { detail: updatedUser }));
          }
        })
        .catch(() => {});
    };

    // Send heartbeat every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    // Initial heartbeat after 5 seconds
    const initialTimeout = setTimeout(sendHeartbeat, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return null;
}
