-- ====================================================================
-- PUCHISMO - SCRIPT MAESTRO DE MIGRACIÓN PARA SUPABASE DATABASE
-- Ejecuta este script en el "SQL Editor" de tu proyecto de Supabase
-- para habilitar la Casa de Apuestas de la Quiniela y las Analíticas 24/7
-- ====================================================================

-- 1. TABLA DE APUESTAS / QUINIELA CON PUNTOS (CASA DE APUESTAS)
CREATE TABLE IF NOT EXISTS public.quiniela_bets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  profile_pic TEXT DEFAULT '',
  match_id INTEGER NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  competition TEXT NOT NULL,
  bet_type TEXT NOT NULL DEFAULT '1X2', -- '1X2' o 'SCORE'
  selection TEXT NOT NULL,               -- 'HOME', 'DRAW', 'AWAY' o '2-1', etc.
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  odds NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- Cuota / Multiplicador (ej: 1.95x, 3.40x, 5.00x)
  points_bet INTEGER NOT NULL CHECK (points_bet > 0),
  potential_payout INTEGER NOT NULL CHECK (potential_payout >= points_bet),
  actual_home_score INTEGER,
  actual_away_score INTEGER,
  status TEXT CHECK (status IN ('PENDING', 'WON', 'LOST', 'CANCELLED')) DEFAULT 'PENDING',
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_quiniela_bets_user_id ON public.quiniela_bets (user_id);
CREATE INDEX IF NOT EXISTS idx_quiniela_bets_username ON public.quiniela_bets (username);
CREATE INDEX IF NOT EXISTS idx_quiniela_bets_match_id ON public.quiniela_bets (match_id);
CREATE INDEX IF NOT EXISTS idx_quiniela_bets_status ON public.quiniela_bets (status);
CREATE INDEX IF NOT EXISTS idx_quiniela_bets_created_at ON public.quiniela_bets (created_at DESC);

-- Habilitar RLS para quiniela_bets
ALTER TABLE public.quiniela_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso a quiniela_bets" ON public.quiniela_bets FOR ALL USING (true);


-- 2. TABLA DE ANALÍTICAS: VISITAS DE PÁGINA (PAGEVIEWS 24/7)
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

CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON public.analytics_pageviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor_id ON public.analytics_pageviews (visitor_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_session_id ON public.analytics_pageviews (session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON public.analytics_pageviews (path);
CREATE INDEX IF NOT EXISTS idx_pageviews_source ON public.analytics_pageviews (referrer_source);

ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserción de pageviews" ON public.analytics_pageviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de pageviews" ON public.analytics_pageviews FOR SELECT USING (true);
CREATE POLICY "Permitir eliminar pageviews antiguas" ON public.analytics_pageviews FOR DELETE USING (true);


-- 3. TABLA DE ANALÍTICAS: CLICS Y EVENTOS DE BOTONES (24/7)
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

CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_button_name ON public.analytics_events (button_name);
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON public.analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.analytics_events (session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserción de events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de events" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Permitir eliminar events antiguos" ON public.analytics_events FOR DELETE USING (true);


-- 4. TABLA DE RESÚMENES DIARIOS AGREGADOS (DAILY STATS)
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

ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acceso completo a daily_stats" ON public.analytics_daily_stats FOR ALL USING (true);

-- Notificación de éxito
COMMENT ON TABLE public.quiniela_bets IS 'Registro de apuestas de la comunidad con puntos Bepucho';
COMMENT ON TABLE public.analytics_events IS 'Registro de clics en botones de toda la plataforma 24/7';
COMMENT ON TABLE public.analytics_pageviews IS 'Registro de visitas a páginas 24/7';
