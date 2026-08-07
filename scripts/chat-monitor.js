/**
 * chat-monitor.js
 * 
 * Monitor de chat de Kick en tiempo real - Se ejecuta en el servidor de forma independiente.
 * Detecta mensajes de todos los usuarios registrados en la base de datos y les suma puntos,
 * AUNQUE no tengan la web abierta. También registra minutos de visualización mientras está activo.
 * 
 * Uso: node scripts/chat-monitor.js
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const CHATROOM_ID = 5258420;        // ID del chatroom de Bepucho
const CHANNEL_SLUG = 'bepucho';    
const PUSHER_KEY = '32cbd69e4b950bf97679';
const PUSHER_CLUSTER = 'us2';
const DB_FILE = path.join(__dirname, '..', 'proyecto_kick_database.json');
const LEGACY_DB_FILE = path.join(__dirname, '..', 'points_database.json');
const WATCH_TICK_MINUTES = 1;       // Cuántos minutos equivale cada tick de visualización
const WATCH_TICK_INTERVAL_MS = 60000; // Cada cuánto ms se aplica el tick de visualización (60s = 1 min)

// ── DB Helpers ───────────────────────────────────────────────────────────────
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: {}, rewards: [], claims: [] };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    console.error('[DB] Error reading DB:', e.message);
    return { users: {}, rewards: [], claims: [] };
  }
}

function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    try {
      fs.writeFileSync(LEGACY_DB_FILE, JSON.stringify(data.users, null, 2), 'utf-8');
    } catch {}
  } catch (e) {
    console.error('[DB] Error writing DB:', e.message);
  }
}

function addChatMessage(username) {
  const db = readDb();
  const key = username.toLowerCase();
  if (!db.users || !db.users[key]) {
    console.log(`[Monitor] Usuario "${username}" no está registrado en la BD, ignorando.`);
    return null;
  }

  const user = db.users[key];
  const now = Date.now();
  const lastMsg = user.lastMessageTime || 0;

  user.chatMessagesCount = (user.chatMessagesCount || 0) + 1;

  // Anti-spam cooldown (10 segundos entre mensajes para sumar puntos)
  if (now - lastMsg >= 10000) {
    // 0.2 Puntos por mensaje
    user.points = Number(((user.points || 0) + 0.2).toFixed(2));
    user.lastMessageTime = now;
    console.log(`[+0.2 pt] Chat Anti-Spam: @${username} → ${user.points} pts total (${user.chatMessagesCount} msgs)`);
  } else {
    console.log(`[Anti-Spam] Mensaje de @${username} ignorado para puntos por cooldown (<10s).`);
  }

  user.lastUpdated = new Date().toISOString();
  writeDb(db);
  return user;
}

function addWatchTime(username, minutes = 1) {
  const db = readDb();
  const key = username.toLowerCase();
  if (!db.users || !db.users[key]) return null;

  const user = db.users[key];
  user.watchTimeMinutes = (user.watchTimeMinutes || 0) + minutes;
  // +0.4 pts por minuto (reducido de 1.0)
  const ptsEarned = minutes * 0.4;
  user.points = Number(((user.points || 0) + ptsEarned).toFixed(2));
  user.lastUpdated = new Date().toISOString();
  writeDb(db);
  return user;
}

function getRegisteredUsernames() {
  const db = readDb();
  return Object.keys(db.users || {});
}

async function checkIsStreamLive(slug = 'bepucho') {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  ];
  for (const ua of userAgents) {
    try {
      const res = await fetch('https://kick.com/api/v2/channels/' + slug, {
        headers: {
          'User-Agent': ua,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Referer': 'https://kick.com/' + slug,
        }
      });
      if (res.ok) {
        const data = await res.json();
        const isOffline = data?.livestream === null || data?.livestream?.is_live === false;
        return !isOffline;
      }
    } catch {}
  }
  return true; // Fallback to true if Cloudflare blocks server request
}

// ── Watch Time Ticker ─────────────────────────────────────────────────────────
const recentChatters = new Map(); // username -> timestamp del último mensaje

function startWatchTimeTicker() {
  setInterval(async () => {
    const isLive = await checkIsStreamLive(CHANNEL_SLUG);
    if (!isLive) {
      console.log('[Monitor] Streamer offline. No se otorgan puntos de watch time.');
      return;
    }

    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    let count = 0;
    for (const [username, lastSeen] of recentChatters.entries()) {
      if (now - lastSeen < TEN_MINUTES) {
        addWatchTime(username, WATCH_TICK_MINUTES);
        count++;
      } else {
        recentChatters.delete(username); // Limpiar usuarios inactivos
      }
    }
    if (count > 0) {
      console.log(`[+0.4 pts/min] Watch time aplicado a ${count} usuario(s) activo(s)`);
    }
  }, WATCH_TICK_INTERVAL_MS);
}

// ── WebSocket Connection ──────────────────────────────────────────────────────
let ws = null;
let pingInterval = null;
let reconnectTimeout = null;
let isConnected = false;

function connect() {
  const wsUrl = `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=7.0.3&flash=false`;
  console.log(`\n[Monitor] Conectando al WebSocket de Kick para el canal: ${CHANNEL_SLUG}`);
  console.log(`[Monitor] Chatroom ID: ${CHATROOM_ID}\n`);

  ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    isConnected = true;
    console.log('[Monitor] ✅ WebSocket conectado a Kick/Pusher');

    ws.send(JSON.stringify({
      event: 'pusher:subscribe',
      data: { auth: '', channel: `chatrooms.${CHATROOM_ID}.v2` },
    }));

    pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
      }
    }, 25000);
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.event === 'pusher:pong') return;

      if (parsed.event === 'pusher:connection_established') {
        console.log('[Monitor] 🔗 Conexión establecida con Pusher');
        return;
      }

      if (parsed.event === 'pusher:subscription_succeeded') {
        console.log(`[Monitor] 📺 Suscrito al chat de ${CHANNEL_SLUG}. Escuchando mensajes...\n`);
        return;
      }

      if (parsed.event === 'App\\Events\\ChatMessageEvent') {
        const d = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
        const msgUser = d.sender?.username || d.sender?.slug || '';

        if (!msgUser) return;

        const registeredUsers = getRegisteredUsernames();
        const isRegistered = registeredUsers.includes(msgUser.toLowerCase());

        if (isRegistered) {
          // Verificar que el streamer esté en vivo antes de sumar puntos por chat
          checkIsStreamLive(CHANNEL_SLUG).then((isLive) => {
            if (!isLive) {
              console.log(`[Monitor] Streamer offline. Mensaje de @${msgUser} no suma puntos.`);
              return;
            }
            recentChatters.set(msgUser.toLowerCase(), Date.now());
            addChatMessage(msgUser);
          }).catch(() => {
            console.log(`[Monitor] No se pudo verificar estado del stream para @${msgUser}.`);
          });
        } else {
          console.log(`[Monitor] Mensaje de @${msgUser} (no registrado)`);
        }
      }
    } catch (e) {
      console.error('[Monitor] Error parsing message:', e.message);
    }
  });

  ws.on('close', (code, reason) => {
    isConnected = false;
    clearInterval(pingInterval);
    console.log(`[Monitor] ⚠️  WebSocket cerrado (code: ${code}). Reconectando en 5s...`);
    reconnectTimeout = setTimeout(connect, 5000);
  });

  ws.on('error', (err) => {
    isConnected = false;
    console.error('[Monitor] ❌ Error de WebSocket:', err.message);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('╔════════════════════════════════════════════════╗');
console.log('║  🎮 PUCHISMO - Monitor de Chat en Tiempo Real  ║');
console.log('║  Tasa: 10 pts/hora & 0.1 pts/msg (Anti-Spam)   ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log(`[Monitor] Base de datos: ${DB_FILE}`);
const initialUsers = getRegisteredUsernames();
console.log(`[Monitor] Usuarios registrados al inicio: ${initialUsers.length > 0 ? initialUsers.join(', ') : '(ninguno aún)'}\n`);

connect();
startWatchTimeTicker();

process.on('SIGINT', () => {
  console.log('\n[Monitor] Apagando monitor...');
  clearInterval(pingInterval);
  clearTimeout(reconnectTimeout);
  if (ws) ws.close();
  process.exit(0);
});
