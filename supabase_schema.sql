-- ====================================================================
-- PUCHISMO - SCRIPT DE MIGRACIÓN Y TABLAS PARA SUPABASE DATABASE
-- Ejecuta este script en el "SQL Editor" de tu proyecto en Supabase
-- ====================================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  profile_pic TEXT DEFAULT '',
  slug TEXT DEFAULT '',
  points NUMERIC(10,2) DEFAULT 200.00,
  watch_time_minutes INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  last_message_time BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Recompensas
CREATE TABLE IF NOT EXISTS public.rewards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  category TEXT NOT NULL,
  image TEXT DEFAULT '',
  stock INTEGER DEFAULT -1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Reclamaciones / Canjes
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  profile_pic TEXT DEFAULT '',
  reward_id TEXT REFERENCES public.rewards(id) ON DELETE CASCADE,
  reward_title TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
  contact_info TEXT NOT NULL,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para servicio y lecturas públicas
CREATE POLICY "Permitir todo acceso con service role o anon" ON public.users FOR ALL USING (true);
CREATE POLICY "Permitir todo acceso a rewards" ON public.rewards FOR ALL USING (true);
CREATE POLICY "Permitir todo acceso a claims" ON public.claims FOR ALL USING (true);

-- Insertar o actualizar el catálogo inicial de 7 recompensas con los nuevos costos y descripciones corregidas
INSERT INTO public.rewards (id, title, description, points_cost, category, image, stock, active)
VALUES 
  (
    'reward-casino',
    'Recarga de mínima casino',
    'Recarga del monto mínimo para jugar en el casino durante la transmisión.',
    200,
    '🎰 Casino',
    '🎰',
    -1,
    true
  ),
  (
    'reward-pollo',
    '1/4 pollo',
    '1/4 de pollo a la brasa con papas y cremas para tu almuerzo o cena.',
    500,
    '🍗 Comida',
    '🍗',
    -1,
    true
  ),
  (
    'reward-polo-madrid',
    'Comprar un polo de Real Madrid',
    'Bepucho comprará y usará una camiseta oficial del Real Madrid durante un stream completo (¡un verdadero castigo por ser hincha del FC Barcelona!).',
    1500,
    '👕 Merch & Castigo',
    '👕',
    5,
    true
  ),
  (
    'reward-cosplay',
    'Cospobre de un futbolista',
    'Bepucho vestirá un disfraz cómico del futbolista que tú elijas durante toda una transmisión.',
    2500,
    '🎭 Show en Stream',
    '🎭',
    -1,
    true
  ),
  (
    'reward-bono-20',
    'Bono de 20 soles',
    'Transferencia directa de S/. 20.00 soles a tu Yape, Plin o cuenta bancaria.',
    4000,
    '💵 Efectivo',
    '💵',
    -1,
    true
  ),
  (
    'reward-apostar',
    'Venir a apostar conmigo',
    'Salida presencial para ir juntos a un casino físico y apostar en vivo junto a Bepucho.',
    8000,
    '🤝 Salida Presencial',
    '🤝',
    3,
    true
  ),
  (
    'reward-bono-100',
    'Bono de 100 soles',
    'Gran premio: Transferencia directa de S/. 100.00 soles a tu Yape, Plin o cuenta bancaria.',
    15000,
    '💰 Gran Premio',
    '💰',
    -1,
    true
  )
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points_cost = EXCLUDED.points_cost,
  category = EXCLUDED.category,
  image = EXCLUDED.image;
