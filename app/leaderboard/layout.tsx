import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tabla de Clasificación y Ranking',
  description: 'Ranking en vivo de los miembros de la comunidad con más puntos, horas de stream y mensajes en el chat de Puchismo.',
  alternates: {
    canonical: '/leaderboard',
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
