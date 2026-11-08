'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookieConsent, onConsentChange } from '@/lib/consent';

const TRACK_ENDPOINT = '/api/e';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de inactividad

declare global {
  interface Window {
    puchismoTrack?: (name: string, meta?: Record<string, any>) => void;
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    } catch {}
  }
  return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStored(key: string, val: string) {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

function removeStored(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function clearTrackingStorage() {
  removeStored('p_vid');
  removeStored('p_sid');
  removeStored('p_last_active');
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  // Escuchar y verificar consentimiento explícito de analíticas
  useEffect(() => {
    const consent = getCookieConsent();
    if (consent && consent.analytics) {
      setHasConsent(true);
    } else {
      setHasConsent(false);
      clearTrackingStorage();
    }

    const unsubscribe = onConsentChange((prefs) => {
      if (prefs.analytics) {
        setHasConsent(true);
      } else {
        setHasConsent(false);
        clearTrackingStorage();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 1. Respetar Do Not Track si está habilitado por el usuario o si no hay consentimiento explícito
    if (!hasConsent) return;
    if (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl)) {
      clearTrackingStorage();
      return;
    }

    // 2. Obtener o inicializar identificador de visitante anónimo (persistente, sin PII)
    let vid = getStored('p_vid');
    if (!vid) {
      vid = generateId();
      setStored('p_vid', vid);
    }

    // 3. Manejo de sesión con expiración a los 30 minutos de inactividad
    function getSessionId(): string {
      const now = Date.now();
      const lastActiveStr = getStored('p_last_active');
      let sid = getStored('p_sid');

      if (!sid || !lastActiveStr || now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS) {
        sid = generateId();
        setStored('p_sid', sid);
      }

      setStored('p_last_active', now.toString());
      return sid;
    }

    // 4. Función de envío ultra-rápida y garantizada (sendBeacon con fallback a fetch keepalive)
    function sendPayload(payload: Record<string, any>) {
      const dataStr = JSON.stringify(payload);
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const sent = navigator.sendBeacon(TRACK_ENDPOINT, blob);
        if (sent) return;
      }

      fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dataStr,
        keepalive: true,
      }).catch(() => {});
    }

    // 5. Exponer helper global para trackeo programático
    window.puchismoTrack = (name: string) => {
      const sid = getSessionId();
      sendPayload({
        type: 'click',
        name,
        path: window.location.pathname,
        vid,
        sid,
        ref: document.referrer || '',
      });
    };

    // 6. Delegación global de clics para cualquier elemento con atributo data-track
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trackEl = target.closest('[data-track]');
      if (!trackEl) return;

      const trackName = trackEl.getAttribute('data-track');
      if (!trackName) return;

      const sid = getSessionId();
      sendPayload({
        type: 'click',
        name: trackName,
        path: window.location.pathname,
        vid,
        sid,
        ref: document.referrer || '',
      });
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [hasConsent]);

  // Trackeo de cambio de ruta / visita a página solo con consentimiento
  useEffect(() => {
    if (!hasConsent) return;
    if (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl)) {
      return;
    }

    // Extraer solo parámetros UTM de forma sanitizada (evita filtrar tokens o query params sensibles)
    const utm: Record<string, string> = {};
    if (searchParams) {
      ['source', 'medium', 'campaign', 'term', 'content'].forEach((key) => {
        const val = searchParams.get(`utm_${key}`);
        if (val) utm[key] = val;
      });
    }

    const utmQuery = new URLSearchParams(utm).toString();
    const cleanPath = utmQuery ? `${pathname}?${utmQuery}` : pathname;

    // Evitar disparar visitas idénticas consecutivas de render
    if (lastPathRef.current === cleanPath) return;
    lastPathRef.current = cleanPath;

    let vid = getStored('p_vid');
    if (!vid) {
      vid = generateId();
      setStored('p_vid', vid);
    }

    const now = Date.now();
    const lastActiveStr = getStored('p_last_active');
    let sid = getStored('p_sid');

    if (!sid || !lastActiveStr || now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS) {
      sid = generateId();
      setStored('p_sid', sid);
    }
    setStored('p_last_active', now.toString());

    const payload = {
      type: 'pageview',
      path: cleanPath,
      vid,
      sid,
      ref: document.referrer || '',
      utm: Object.keys(utm).length > 0 ? utm : undefined,
    };

    const dataStr = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([dataStr], { type: 'application/json' });
      if (navigator.sendBeacon(TRACK_ENDPOINT, blob)) return;
    }

    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dataStr,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams, hasConsent]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
