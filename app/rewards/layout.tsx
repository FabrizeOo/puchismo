import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tienda de Recompensas y Canje de Puntos',
  description: 'Acumula puntos viendo streams y participando en el chat para canjear recompensas exclusivas de Puchismo y Bepucho.',
  alternates: {
    canonical: '/rewards',
  },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
