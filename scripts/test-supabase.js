require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Conectando a Supabase URL:', url);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('rewards').select('*');
    if (error) {
      console.error('❌ Error de conexión:', error.message);
    } else {
      console.log('✅ ¡CONEXIÓN EXITOSA CON SUPABASE!');
      console.log(`📦 Se encontraron ${data.length} recompensas registradas:`);
      data.forEach((r) => {
        console.log(`  - [${r.category}] ${r.title}: ${r.points_cost} pts`);
      });
    }
  } catch (err) {
    console.error('❌ Excepción al conectar:', err);
  }
}

test();
