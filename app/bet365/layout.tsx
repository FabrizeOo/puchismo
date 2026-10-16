import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promo Bet365 (+50 Puntos)',
  description: 'Regístrate en Bet365 con el link de Bepucho y reclama 50 puntos para la tienda de recompensas de Puchismo.',
  alternates: {
    canonical: '/bet365',
  },
};

export default function Bet365Layout({ children }: { children: React.ReactNode }) {
  return children;
}
