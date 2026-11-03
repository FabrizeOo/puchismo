import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.puchismo.com';
  const currentDate = new Date();

  const routes: Array<{ path: string; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/stream', changeFrequency: 'daily', priority: 0.9 },
    { path: '/quiniela', changeFrequency: 'daily', priority: 0.9 },
    { path: '/partidos/hoy', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/partidos/manana', changeFrequency: 'daily', priority: 0.8 },
    { path: '/tabla/champions-league', changeFrequency: 'daily', priority: 0.8 },
    { path: '/tabla/premier-league', changeFrequency: 'daily', priority: 0.8 },
    { path: '/tabla/la-liga', changeFrequency: 'daily', priority: 0.8 },
    { path: '/rewards', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/leaderboard', changeFrequency: 'daily', priority: 0.8 },
    { path: '/bet365', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/contacto', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/reglas-recompensas', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/juego-responsable', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/afiliados', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/terminos', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/privacidad', changeFrequency: 'monthly', priority: 0.5 },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: currentDate,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
