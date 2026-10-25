-- ====================================================================
-- PUCHISMO - SCRIPT DE MIGRACIÓN Y TABLAS PARA ANALÍTICAS PROPIAS (FIRST-PARTY)
-- Ejecuta este script en el "SQL Editor" de tu proyecto en Supabase
-- ====================================================================

-- 1. Tabla de Visitas de Página (Pageviews)
CREATE TABLE IF NOT EXISTS public.analytics_pageviews (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  referrer_source TEXT DEFAULT 'Directo',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_term TEXT DEFAULT '',
  utm_content TEXT DEFAULT '',
  device TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'Otro',
  os TEXT DEFAULT 'Otro',
  country TEXT DEFAULT 'Desconocido',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Eventos y Clics en Botones (Events)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL DEFAULT 'click',
  button_name TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  device TEXT DEFAULT 'desktop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Resúmenes Diarios Agregados (Daily Aggregates - Para Carga Ultrarrápida)
CREATE TABLE IF NOT EXISTS public.analytics_daily_stats (
  date DATE PRIMARY KEY,
  total_views INTEGER DEFAULT 0 NOT NULL,
  unique_visitors INTEGER DEFAULT 0 NOT NULL,
  total_clicks INTEGER DEFAULT 0 NOT NULL,
  page_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  source_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  device_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  browser_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  country_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  button_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  hourly_breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Índices para Consultas de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON public.analytics_pageviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor_id ON public.analytics_pageviews (visitor_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON public.analytics_pageviews (session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON public.analytics_pageviews (path);
CREATE INDEX IF NOT EXISTS idx_pageviews_source ON public.analytics_pageviews (referrer_source);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_button_name ON public.analytics_events (button_name);
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON public.analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.analytics_events (session_id);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Acceso: Permitir inserción y lectura vía Service Role y API pública
CREATE POLICY "Permitir inserción de pageviews" ON public.analytics_pageviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de pageviews para backend" ON public.analytics_pageviews FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de events para backend" ON public.analytics_events FOR SELECT USING (true);

CREATE POLICY "Permitir acceso completo a daily_stats" ON public.analytics_daily_stats FOR ALL USING (true);
