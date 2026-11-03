import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Tienda de Recompensas y Canje de Puntos',
  description: 'Acumula puntos en la comunidad viendo streams en Kick y participando en el chat para canjear premios exclusivos de Puchismo y Bepucho.',
  path: '/rewards',
});

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
