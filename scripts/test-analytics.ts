import { recordPageView, recordEvent, getAnalyticsDashboardData } from '../lib/analytics-db';

async function main() {
  console.log('Testing analytics recording...');

  // 1. Simular visitas
  await recordPageView({
    visitorId: 'sim_user_1',
    sessionId: 'sim_session_1',
    path: '/',
    referrer: 'https://www.google.com/search?q=puchismo',
    referrerSource: 'Google',
    utmSource: 'google',
    utmMedium: 'organic',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    country: 'PE',
  });

  await recordPageView({
    visitorId: 'sim_user_2',
    sessionId: 'sim_session_2',
    path: '/stream',
    referrer: 'https://t.me/puchismo_canal',
    referrerSource: 'Telegram',
    device: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    country: 'ES',
  });

  await recordPageView({
    visitorId: 'sim_user_3',
    sessionId: 'sim_session_3',
    path: '/bet365',
    referrer: 'https://discord.com/channels/puchismo',
    referrerSource: 'Discord',
    device: 'mobile',
    browser: 'Chrome',
    os: 'Android',
    country: 'MX',
  });

  // 2. Simular clics en botones
  await recordEvent({
    eventName: 'click',
    buttonName: 'telegram-section-join-btn',
    visitorId: 'sim_user_2',
    sessionId: 'sim_session_2',
    path: '/stream',
    device: 'mobile',
    referrer: 'https://t.me/puchismo_canal',
  });

  await recordEvent({
    eventName: 'click',
    buttonName: 'hero-unirse-telegram',
    visitorId: 'sim_user_1',
    sessionId: 'sim_session_1',
    path: '/',
    device: 'desktop',
    referrer: 'https://www.google.com/search?q=puchismo',
  });

  await recordEvent({
    eventName: 'click',
    buttonName: 'bet365-promo-banner-1',
    visitorId: 'sim_user_3',
    sessionId: 'sim_session_3',
    path: '/bet365',
    device: 'mobile',
    referrer: '',
  });

  // 3. Obtener métricas
  const data = await getAnalyticsDashboardData('today');
  console.log('--- TEST RESULTS ---');
  console.log('Visitas Hoy:', data.summary.viewsToday);
  console.log('Visitantes Únicos Hoy:', data.summary.visitorsToday);
  console.log('Clics Hoy:', data.summary.clicksToday);
  console.log('Usuarios en Tiempo Real:', data.realtime.activeUsersNow);
  console.log('Botones registrados:', data.buttons.map(b => `${b.buttonName}: ${b.clicks} clics (Conv: ${b.conversionRate}%, Telegram: ${b.isTelegram})`));
  console.log('Páginas más visitadas:', data.topPages);
  console.log('Fuentes de tráfico:', data.trafficSources);
  console.log('Dispositivos:', data.devices);
}

main().catch(console.error);
