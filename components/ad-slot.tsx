'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCookieConsent, onConsentChange } from '@/lib/consent';

interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function AdSlot({
  slotId = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';

  useEffect(() => {
    if (!adsEnabled) return;

    const consent = getCookieConsent();
    if (consent?.marketing) {
      setHasConsent(true);
    }

    const unsub = onConsentChange((p) => {
      setHasConsent(Boolean(p.marketing));
    });

    return () => unsub();
  }, [adsEnabled]);

  useEffect(() => {
    if (!adsEnabled || !hasConsent || adLoaded || !containerRef.current) return;

    // Carga diferida mediante IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !adLoaded) {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdLoaded(true);
            } catch (err) {
              console.warn('[AdSense] Slot push error:', err);
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [adsEnabled, hasConsent, adLoaded]);

  // Si los anuncios están deshabilitados globalmente o el usuario no dio consentimiento, no renderizar nada
  if (!adsEnabled || !hasConsent) {
    return null;
  }

  // Dimensiones mínimas reservadas para evitar saltos de diseño (CLS)
  const minHeightClass =
    format === 'horizontal'
      ? 'min-h-[90px]'
      : format === 'rectangle'
      ? 'min-h-[250px]'
      : 'min-h-[100px] sm:min-h-[250px]';

  return (
    <div
      ref={containerRef}
      className={`relative my-6 mx-auto w-full max-w-4xl p-2 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center overflow-hidden ${minHeightClass} ${className}`}
    >
      <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-1">
        Publicidad
      </span>
      <ins
        className="adsbygoogle w-full block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5107361201305664"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
