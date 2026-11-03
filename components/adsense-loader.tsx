'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getCookieConsent, onConsentChange } from '@/lib/consent';

const ADSENSE_CLIENT_ID = 'ca-pub-5107361201305664';

export function AdSenseLoader() {
  const [canLoadAds, setCanLoadAds] = useState(false);

  useEffect(() => {
    // Verificar si los anuncios están habilitados globalmente por configuración
    const adsGloballyEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
    if (!adsGloballyEnabled) {
      setCanLoadAds(false);
      return;
    }

    // Comprobar consentimiento de marketing/publicidad
    const consent = getCookieConsent();
    if (consent && consent.marketing) {
      setCanLoadAds(true);
    }

    // Suscribirse a cambios en tiempo real del banner de consentimiento
    const unsubscribe = onConsentChange((prefs) => {
      if (prefs.marketing && adsGloballyEnabled) {
        setCanLoadAds(true);
      } else {
        setCanLoadAds(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!canLoadAds) return null;

  return (
    <Script
      id="google-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
