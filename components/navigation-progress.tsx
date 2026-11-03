'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cuando cambia la ruta o query params, finalizamos la barra
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Interceptar clicks en enlaces internos para iniciar la barra inmediatamente
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isTargetBlank = target.getAttribute('target') === '_blank';

      // Solo si es un enlace interno a otra ruta diferente de la actual
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !isTargetBlank &&
        href !== pathname
      ) {
        setLoading(true);
        setProgress(35);

        // Incrementar suavemente mientras carga
        const t1 = setTimeout(() => setProgress(65), 150);
        const t2 = setTimeout(() => setProgress(85), 400);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-[#53fc18] to-emerald-300 shadow-[0_0_12px_#53fc18] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

