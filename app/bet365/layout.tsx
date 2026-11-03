import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Promoción Afiliados Bet365 (+50 Puntos para la Tienda)',
  description: 'Regístrate en Bet365 mediante nuestro enlace de afiliado oficial y reclama 50 puntos para canjear en la tienda de Puchismo. Solo +18. Juega responsablemente.',
  path: '/bet365',
});

export default function Bet365Layout({ children }: { children: React.ReactNode }) {
  return children;
}
