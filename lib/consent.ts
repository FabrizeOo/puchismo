// lib/consent.ts
// Gestor de consentimiento de cookies conforme con RGPD, ePrivacy y AdSense

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  status: 'accepted_all' | 'rejected_all' | 'custom';
}

const STORAGE_KEY = 'puchismo_cookie_consent_v2';
const EVENT_NAME = 'puchismo_consent_change';

export function hasDntOrGpcEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' ||
    (navigator as any).globalPrivacyControl === true ||
    (window as any).doNotTrack === '1'
  );
}

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCookieConsent(prefs: Omit<CookiePreferences, 'necessary' | 'timestamp'> & { status: CookiePreferences['status'] }) {
  if (typeof window === 'undefined') return;
  const full: CookiePreferences = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    status: prefs.status,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    // Notificar a componentes en tiempo real
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: full }));
  } catch {}

  // Google Consent Mode v2 (preparado para integración con Google Privacy & messaging CMP)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('consent', 'update', {
        ad_storage: full.marketing ? 'granted' : 'denied',
        ad_user_data: full.marketing ? 'granted' : 'denied',
        ad_personalization: full.marketing ? 'granted' : 'denied',
        analytics_storage: full.analytics ? 'granted' : 'denied',
      });
    } catch {}
  }
}

export function onConsentChange(callback: (prefs: CookiePreferences) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<CookiePreferences>;
    if (custom.detail) callback(custom.detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
