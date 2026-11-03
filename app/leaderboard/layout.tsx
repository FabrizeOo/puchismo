import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Tabla de Clasificación y Ranking de la Comunidad',
  description: 'Ranking en vivo de los hinchas con más puntos, horas de stream y mensajes en el chat de Puchismo. Sube de nivel de Rookie a GOAT.',
  path: '/leaderboard',
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
