import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

export interface PageViewRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  path: string;
  referrer: string;
  referrerSource: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  country: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  eventName: string;
  buttonName: string;
  visitorId: string;
  sessionId: string;
  path: string;
  device: string;
  referrer: string;
  createdAt: string;
}

export interface DailyStatsRecord {
  date: string; // YYYY-MM-DD
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  pageBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  buttonBreakdown: Record<string, { clicks: number; uniqueVisitors: number }>;
  hourlyBreakdown: Record<string, number>;
  updatedAt: string;
}

export interface AnalyticsStorageSchema {
  pageviews: PageViewRecord[];
  events: EventRecord[];
  dailyStats: Record<string, DailyStatsRecord>;
  lastUpdated: string;
}

const getAnalyticsFile = () =>
  process.env.VERCEL
    ? path.join('/tmp', 'proyecto_kick_analytics.json')
    : path.join(process.cwd(), 'proyecto_kick_analytics.json');

// Memoria cache para evitar lecturas constantes de disco
let memoryAnalytics: AnalyticsStorageSchema | null = null;

export function readAnalyticsDb(): AnalyticsStorageSchema {
  if (memoryAnalytics) {
    return memoryAnalytics;
  }

  const filePath = getAnalyticsFile();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      memoryAnalytics = {
        pageviews: Array.isArray(parsed.pageviews) ? parsed.pageviews : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
        dailyStats: parsed.dailyStats || {},
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
      return memoryAnalytics;
    }
  } catch (err) {
    console.error('Error leyendo archivo de analíticas local:', err);
  }

  memoryAnalytics = {
    pageviews: [],
    events: [],
    dailyStats: {},
    lastUpdated: new Date().toISOString(),
  };
  return memoryAnalytics;
}

export function writeAnalyticsDb(data: AnalyticsStorageSchema) {
  memoryAnalytics = data;
  const filePath = getAnalyticsFile();
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error('Error escribiendo archivo de analíticas local:', err);
  }
}

/**
 * Clasificador inteligente de fuente de tráfico a partir del referrer
 */
export function classifyReferrerSource(referrer: string): string {
  if (!referrer || referrer.trim() === '') return 'Directo';

  try {
    const parsed = new URL(referrer);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('google.')) return 'Google';
    if (host.includes('t.me') || host.includes('telegram.')) return 'Telegram';
    if (host.includes('discord.')) return 'Discord';
    if (host.includes('kick.com')) return 'Kick';
    if (host.includes('twitch.tv')) return 'Twitch';
    if (host.includes('twitter.com') || host.includes('x.com') || host.includes('t.co')) return 'Twitter / X';
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('tiktok.com')) return 'TikTok';
    if (host.includes('facebook.com') || host.includes('fb.me')) return 'Facebook';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
    if (host.includes('bing.com')) return 'Bing';

    return host.replace(/^www\./, '');
  } catch {
    return 'Otros';
  }
}

/**
 * Inserción de Visita de Página (Pageview)
 */
export async function recordPageView(pv: Omit<PageViewRecord, 'id' | 'createdAt'>): Promise<PageViewRecord> {
  const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();
  const record: PageViewRecord = {
    ...pv,
    id,
    createdAt,
  };

  // 1. Guardar en memoria y archivo JSON
  const db = readAnalyticsDb();
  db.pageviews.push(record);

  // Mantener el array en memoria razonable si supera 50,000 registros
  if (db.pageviews.length > 50000) {
    db.pageviews = db.pageviews.slice(-40000);
  }
  db.lastUpdated = createdAt;
  writeAnalyticsDb(db);

  // 2. Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('analytics_pageviews').insert({
        id: record.id,
        visitor_id: record.visitorId,
        session_id: record.sessionId,
        path: record.path,
        referrer: record.referrer || '',
        referrer_source: record.referrerSource || 'Directo',
        utm_source: record.utmSource || '',
        utm_medium: record.utmMedium || '',
        utm_campaign: record.utmCampaign || '',
        utm_term: record.utmTerm || '',
        utm_content: record.utmContent || '',
        device: record.device || 'desktop',
        browser: record.browser || 'Otro',
        os: record.os || 'Otro',
        country: record.country || 'Desconocido',
        created_at: record.createdAt,
      });
    } catch (e) {
      // No frenar la app si la tabla aún no fue creada en Supabase
    }
  }

  return record;
}

/**
 * Inserción de Clic de Botón / Evento
 */
export async function recordEvent(ev: Omit<EventRecord, 'id' | 'createdAt'>): Promise<EventRecord> {
  const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();
  const record: EventRecord = {
    ...ev,
    id,
    createdAt,
  };

  // 1. Guardar en memoria y archivo JSON
  const db = readAnalyticsDb();
  db.events.push(record);
  if (db.events.length > 50000) {
    db.events = db.events.slice(-40000);
  }
  db.lastUpdated = createdAt;
  writeAnalyticsDb(db);

  // 2. Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('analytics_events').insert({
        id: record.id,
        event_name: record.eventName || 'click',
        button_name: record.buttonName,
        visitor_id: record.visitorId,
        session_id: record.sessionId,
        path: record.path,
        referrer: record.referrer || '',
        device: record.device || 'desktop',
        created_at: record.createdAt,
      });
    } catch (e) {
      // Ignorar silenciosamente si tabla aún no existe
    }
  }

  return record;
}

export interface AnalyticsDashboardData {
  summary: {
    viewsToday: number;
    viewsTodayChange: number;
    visitorsToday: number;
    visitorsTodayChange: number;
    viewsLast7Days: number;
    viewsLast30Days: number;
    clicksToday: number;
    clicksTodayChange: number;
  };
  realtime: {
    activeUsersNow: number;
    pages: { path: string; count: number }[];
  };
  timeline: {
    label: string;
    views: number;
    visitors: number;
    clicks: number;
  }[];
  buttons: {
    buttonName: string;
    clicks: number;
    uniqueUsers: number;
    conversionRate: number; // porcentaje (clicks / visitantes período)
    isTelegram: boolean;
  }[];
  topPages: {
    path: string;
    views: number;
    percentage: number;
  }[];
  trafficSources: {
    source: string;
    views: number;
    percentage: number;
  }[];
  devices: {
    device: string;
    count: number;
    percentage: number;
  }[];
  browsers: {
    browser: string;
    count: number;
    percentage: number;
  }[];
  countries: {
    country: string;
    count: number;
    percentage: number;
  }[];
  peakHours: {
    hour: number;
    hourLabel: string;
    views: number;
    percentage: number;
  }[];
  rangeInfo: {
    range: string;
    startDate: string;
    endDate: string;
    totalPeriodViews: number;
    totalPeriodVisitors: number;
    totalPeriodClicks: number;
  };
}

/**
 * Obtener todos los datos analíticos agregados para el panel de administración
 */
export async function getAnalyticsDashboardData(
  range: 'today' | 'yesterday' | '7d' | '30d' | 'custom' = '7d',
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsDashboardData> {
  const db = readAnalyticsDb();
  let allViews = [...db.pageviews];
  let allEvents = [...db.events];

  // Si Supabase está configurado, intentamos consultar registros recientes
  if (isSupabaseConfigured && supabase) {
    try {
      const sinceDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
      const [sbViewsRes, sbEventsRes] = await Promise.all([
        supabase.from('analytics_pageviews').select('*').gte('created_at', sinceDate).order('created_at', { ascending: false }).limit(25000),
        supabase.from('analytics_events').select('*').gte('created_at', sinceDate).order('created_at', { ascending: false }).limit(25000),
      ]);

      if (sbViewsRes.data && sbViewsRes.data.length > 0) {
        // Map Supabase column names to interface
        const mappedViews: PageViewRecord[] = sbViewsRes.data.map((r: any) => ({
          id: r.id,
          visitorId: r.visitor_id,
          sessionId: r.session_id,
          path: r.path,
          referrer: r.referrer,
          referrerSource: r.referrer_source,
          utmSource: r.utm_source,
          utmMedium: r.utm_medium,
          utmCampaign: r.utm_campaign,
          utmTerm: r.utm_term,
          utmContent: r.utm_content,
          device: r.device,
          browser: r.browser,
          os: r.os,
          country: r.country,
          createdAt: r.created_at,
        }));

        // Merge with in-memory avoiding duplicates by id
        const idSet = new Set(mappedViews.map((v) => v.id));
        allViews = [...mappedViews, ...allViews.filter((v) => !idSet.has(v.id))];
      }

      if (sbEventsRes.data && sbEventsRes.data.length > 0) {
        const mappedEvents: EventRecord[] = sbEventsRes.data.map((r: any) => ({
          id: r.id,
          eventName: r.event_name,
          buttonName: r.button_name,
          visitorId: r.visitor_id,
          sessionId: r.session_id,
          path: r.path,
          device: r.device,
          referrer: r.referrer,
          createdAt: r.created_at,
        }));
        const idSet = new Set(mappedEvents.map((e) => e.id));
        allEvents = [...mappedEvents, ...allEvents.filter((e) => !idSet.has(e.id))];
      }
    } catch {
      // Fallback a memoria local si Supabase tiene timeout o tablas pendientes
    }
  }

  const now = new Date();
  const nowMs = now.getTime();

  // Fechas clave
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayDate = new Date(nowMs - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;

  // Real-time: últimos 5 minutos (300,000 ms)
  const fiveMinutesAgoMs = nowMs - 5 * 60 * 1000;
  const realtimeViews = allViews.filter((v) => new Date(v.createdAt).getTime() >= fiveMinutesAgoMs);
  const realtimeEvents = allEvents.filter((e) => new Date(e.createdAt).getTime() >= fiveMinutesAgoMs);

  const activeVisitorsSet = new Set<string>();
  realtimeViews.forEach((v) => activeVisitorsSet.add(v.visitorId));
  realtimeEvents.forEach((e) => activeVisitorsSet.add(e.visitorId));

  const realtimePagesMap: Record<string, number> = {};
  realtimeViews.forEach((v) => {
    realtimePagesMap[v.path] = (realtimePagesMap[v.path] || 0) + 1;
  });
  const realtimePages = Object.entries(realtimePagesMap)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);

  // Resúmenes de Tarjetas
  const viewsTodayList = allViews.filter((v) => v.createdAt.startsWith(todayStr));
  const viewsYesterdayList = allViews.filter((v) => v.createdAt.startsWith(yesterdayStr));
  const viewsTodayCount = viewsTodayList.length;
  const viewsYesterdayCount = viewsYesterdayList.length;
  const viewsTodayChange = viewsYesterdayCount === 0 ? (viewsTodayCount > 0 ? 100 : 0) : Math.round(((viewsTodayCount - viewsYesterdayCount) / viewsYesterdayCount) * 100);

  const visitorsTodaySet = new Set(viewsTodayList.map((v) => v.visitorId));
  const visitorsYesterdaySet = new Set(viewsYesterdayList.map((v) => v.visitorId));
  const visitorsTodayCount = visitorsTodaySet.size;
  const visitorsYesterdayCount = visitorsYesterdaySet.size;
  const visitorsTodayChange = visitorsYesterdayCount === 0 ? (visitorsTodayCount > 0 ? 100 : 0) : Math.round(((visitorsTodayCount - visitorsYesterdayCount) / visitorsYesterdayCount) * 100);

  const viewsLast7DaysCount = allViews.filter((v) => new Date(v.createdAt).getTime() >= sevenDaysAgoMs).length;
  const viewsLast30DaysCount = allViews.filter((v) => new Date(v.createdAt).getTime() >= thirtyDaysAgoMs).length;

  const clicksTodayList = allEvents.filter((e) => e.createdAt.startsWith(todayStr));
  const clicksYesterdayList = allEvents.filter((e) => e.createdAt.startsWith(yesterdayStr));
  const clicksTodayCount = clicksTodayList.length;
  const clicksYesterdayCount = clicksYesterdayList.length;
  const clicksTodayChange = clicksYesterdayCount === 0 ? (clicksTodayCount > 0 ? 100 : 0) : Math.round(((clicksTodayCount - clicksYesterdayCount) / clicksYesterdayCount) * 100);

  // Determinar ventana del rango seleccionado
  let startMs = sevenDaysAgoMs;
  let endMs = nowMs;
  let isHourly = false;

  if (range === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    startMs = startOfToday;
    endMs = nowMs;
    isHourly = true;
  } else if (range === 'yesterday') {
    const startOfYesterday = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate()).getTime();
    const endOfYesterday = startOfYesterday + 24 * 60 * 60 * 1000 - 1;
    startMs = startOfYesterday;
    endMs = endOfYesterday;
    isHourly = true;
  } else if (range === '7d') {
    startMs = sevenDaysAgoMs;
    endMs = nowMs;
    isHourly = false;
  } else if (range === '30d') {
    startMs = thirtyDaysAgoMs;
    endMs = nowMs;
    isHourly = false;
  } else if (range === 'custom' && customStart) {
    startMs = new Date(customStart).getTime();
    endMs = customEnd ? new Date(customEnd).getTime() + 24 * 60 * 60 * 1000 - 1 : nowMs;
    const diffDays = (endMs - startMs) / (24 * 60 * 60 * 1000);
    isHourly = diffDays <= 1.5;
  }

  // Filtrar vistas y eventos en la ventana seleccionada
  const filteredViews = allViews.filter((v) => {
    const t = new Date(v.createdAt).getTime();
    return t >= startMs && t <= endMs;
  });

  const filteredEvents = allEvents.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= startMs && t <= endMs;
  });

  const periodVisitorsSet = new Set(filteredViews.map((v) => v.visitorId));
  const totalPeriodViews = filteredViews.length;
  const totalPeriodVisitors = periodVisitorsSet.size;
  const totalPeriodClicks = filteredEvents.length;

  // Timeline (Línea de tiempo)
  const timelineMap = new Map<string, { views: number; visitors: Set<string>; clicks: number }>();

  if (isHourly) {
    // 24 horas del día
    for (let h = 0; h < 24; h++) {
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      timelineMap.set(hStr, { views: 0, visitors: new Set(), clicks: 0 });
    }

    filteredViews.forEach((v) => {
      const dateObj = new Date(v.createdAt);
      const hStr = `${dateObj.getHours().toString().padStart(2, '0')}:00`;
      const item = timelineMap.get(hStr);
      if (item) {
        item.views++;
        item.visitors.add(v.visitorId);
      }
    });

    filteredEvents.forEach((e) => {
      const dateObj = new Date(e.createdAt);
      const hStr = `${dateObj.getHours().toString().padStart(2, '0')}:00`;
      const item = timelineMap.get(hStr);
      if (item) {
        item.clicks++;
      }
    });
  } else {
    // Agrupación por días
    const daysCount = Math.max(1, Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000)));
    for (let i = daysCount; i >= 0; i--) {
      const d = new Date(endMs - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      timelineMap.set(dStr, { views: 0, visitors: new Set(), clicks: 0 });
    }

    filteredViews.forEach((v) => {
      const dStr = v.createdAt.split('T')[0];
      if (timelineMap.has(dStr)) {
        const item = timelineMap.get(dStr)!;
        item.views++;
        item.visitors.add(v.visitorId);
      }
    });

    filteredEvents.forEach((e) => {
      const dStr = e.createdAt.split('T')[0];
      if (timelineMap.has(dStr)) {
        const item = timelineMap.get(dStr)!;
        item.clicks++;
      }
    });
  }

  const timeline = Array.from(timelineMap.entries()).map(([label, val]) => ({
    label,
    views: val.views,
    visitors: val.visitors.size,
    clicks: val.clicks,
  }));

  // Clics por Botón con Tasa de Conversión
  const buttonMap: Record<string, { clicks: number; uniqueUsers: Set<string> }> = {};
  filteredEvents.forEach((e) => {
    const btn = e.buttonName || 'Desconocido';
    if (!buttonMap[btn]) {
      buttonMap[btn] = { clicks: 0, uniqueUsers: new Set() };
    }
    buttonMap[btn].clicks++;
    buttonMap[btn].uniqueUsers.add(e.visitorId);
  });

  const buttons = Object.entries(buttonMap)
    .map(([buttonName, data]) => {
      const uniqueCount = data.uniqueUsers.size;
      const conversionRate = totalPeriodVisitors > 0
        ? Math.round((uniqueCount / totalPeriodVisitors) * 1000) / 10
        : 0;
      const isTelegram = buttonName.toLowerCase().includes('tele');
      return {
        buttonName,
        clicks: data.clicks,
        uniqueUsers: uniqueCount,
        conversionRate,
        isTelegram,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  // Páginas Más Visitadas
  const pageMap: Record<string, { views: number; visitors: Set<string> }> = {};
  filteredViews.forEach((v) => {
    const p = v.path || '/';
    if (!pageMap[p]) {
      pageMap[p] = { views: 0, visitors: new Set() };
    }
    pageMap[p].views++;
    pageMap[p].visitors.add(v.visitorId);
  });

  const topPages = Object.entries(pageMap)
    .map(([path, data]) => ({
      path,
      views: data.views,
      percentage: totalPeriodViews > 0 ? Math.round((data.views / totalPeriodViews) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  // Fuentes de Tráfico
  const sourceMap: Record<string, number> = {};
  filteredViews.forEach((v) => {
    const s = v.referrerSource || 'Directo';
    sourceMap[s] = (sourceMap[s] || 0) + 1;
  });

  const trafficSources = Object.entries(sourceMap)
    .map(([source, count]) => ({
      source,
      views: count,
      percentage: totalPeriodViews > 0 ? Math.round((count / totalPeriodViews) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views);

  // Dispositivos
  const deviceMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  filteredViews.forEach((v) => {
    const dev = v.device || 'desktop';
    deviceMap[dev] = (deviceMap[dev] || 0) + 1;
  });

  const devices = Object.entries(deviceMap)
    .map(([device, count]) => ({
      device: device === 'mobile' ? 'Móvil' : device === 'tablet' ? 'Tablet' : 'Escritorio',
      count,
      percentage: totalPeriodViews > 0 ? Math.round((count / totalPeriodViews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Navegadores
  const browserMap: Record<string, number> = {};
  filteredViews.forEach((v) => {
    const b = v.browser || 'Otro';
    browserMap[b] = (browserMap[b] || 0) + 1;
  });

  const browsers = Object.entries(browserMap)
    .map(([browser, count]) => ({
      browser,
      count,
      percentage: totalPeriodViews > 0 ? Math.round((count / totalPeriodViews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Países
  const countryMap: Record<string, number> = {};
  filteredViews.forEach((v) => {
    const c = v.country || 'Desconocido';
    countryMap[c] = (countryMap[c] || 0) + 1;
  });

  const countries = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: totalPeriodViews > 0 ? Math.round((count / totalPeriodViews) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Horas Pico (0 a 23 hs)
  const hourlyCount = new Array(24).fill(0);
  filteredViews.forEach((v) => {
    const hour = new Date(v.createdAt).getHours();
    hourlyCount[hour]++;
  });

  const peakHours = hourlyCount.map((views, hour) => ({
    hour,
    hourLabel: `${hour.toString().padStart(2, '0')}:00`,
    views,
    percentage: totalPeriodViews > 0 ? Math.round((views / totalPeriodViews) * 100) : 0,
  }));

  return {
    summary: {
      viewsToday: viewsTodayCount,
      viewsTodayChange,
      visitorsToday: visitorsTodayCount,
      visitorsTodayChange,
      viewsLast7Days: viewsLast7DaysCount,
      viewsLast30Days: viewsLast30DaysCount,
      clicksToday: clicksTodayCount,
      clicksTodayChange,
    },
    realtime: {
      activeUsersNow: activeVisitorsSet.size,
      pages: realtimePages,
    },
    timeline,
    buttons,
    topPages,
    trafficSources,
    devices,
    browsers,
    countries,
    peakHours,
    rangeInfo: {
      range,
      startDate: new Date(startMs).toISOString(),
      endDate: new Date(endMs).toISOString(),
      totalPeriodViews,
      totalPeriodVisitors,
      totalPeriodClicks,
    },
  };
}

/**
 * Política de retención:
 * Consolida registros antiguos en resúmenes diarios y elimina eventos crudos mayores a N días (def: 90)
 */
export async function pruneOldAnalytics(daysToKeep = 90): Promise<{ prunedPageviews: number; prunedEvents: number }> {
  const db = readAnalyticsDb();
  const cutoffMs = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  const cutoffIso = new Date(cutoffMs).toISOString();

  const initialPvCount = db.pageviews.length;
  const initialEvCount = db.events.length;

  // Filtrar eventos más recientes que el corte
  db.pageviews = db.pageviews.filter((v) => new Date(v.createdAt).getTime() >= cutoffMs);
  db.events = db.events.filter((e) => new Date(e.createdAt).getTime() >= cutoffMs);

  writeAnalyticsDb(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await Promise.all([
        supabase.from('analytics_pageviews').delete().lt('created_at', cutoffIso),
        supabase.from('analytics_events').delete().lt('created_at', cutoffIso),
      ]);
    } catch (e) {
      console.error('Supabase prune error:', e);
    }
  }

  return {
    prunedPageviews: Math.max(0, initialPvCount - db.pageviews.length),
    prunedEvents: Math.max(0, initialEvCount - db.events.length),
  };
}
