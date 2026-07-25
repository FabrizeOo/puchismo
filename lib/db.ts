import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

export interface UserRecord {
  id: string;
  username: string;
  profilePic: string;
  slug: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
  lastMessageTime?: number;
  lastUpdated: string;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
}

export interface RewardClaim {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  contactInfo: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: Record<string, UserRecord>;
  rewards: RewardItem[];
  claims: RewardClaim[];
}

const getDbFile = () => (process.env.VERCEL ? path.join('/tmp', 'proyecto_kick_database.json') : path.join(process.cwd(), 'proyecto_kick_database.json'));
const getLegacyDbFile = () => (process.env.VERCEL ? path.join('/tmp', 'points_database.json') : path.join(process.cwd(), 'points_database.json'));

// Catálogo actualizado con costos incrementados y descripciones corregidas
export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'reward-casino',
    title: 'Recarga de mínima casino',
    description: 'Recarga del monto mínimo para jugar en el casino durante la transmisión.',
    pointsCost: 200,
    category: '🎰 Casino',
    image: '🎰',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-pollo',
    title: '1/4 pollo',
    description: '1/4 de pollo a la brasa con papas y cremas para tu almuerzo o cena.',
    pointsCost: 500,
    category: '🍗 Comida',
    image: '🍗',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-polo-madrid',
    title: 'Comprar un polo de Real Madrid',
    description: 'Bepucho comprará y usará una camiseta oficial del Real Madrid durante un stream completo (¡un verdadero castigo por ser hincha del FC Barcelona!).',
    pointsCost: 1500,
    category: '👕 Merch & Castigo',
    image: '👕',
    stock: 5,
    active: true,
  },
  {
    id: 'reward-cosplay',
    title: 'Cospobre de un futbolista',
    description: 'Bepucho vestirá un disfraz cómico del futbolista que tú elijas durante toda una transmisión.',
    pointsCost: 2500,
    category: '🎭 Show en Stream',
    image: '🎭',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-bono-20',
    title: 'Bono de 20 soles',
    description: 'Transferencia directa de S/. 20.00 soles a tu Yape, Plin o cuenta bancaria.',
    pointsCost: 4000,
    category: '💵 Efectivo',
    image: '💵',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-apostar',
    title: 'Venir a apostar conmigo',
    description: 'Salida presencial para ir juntos a un casino físico y apostar en vivo junto a Bepucho.',
    pointsCost: 8000,
    category: '🤝 Salida Presencial',
    image: '🤝',
    stock: 3,
    active: true,
  },
  {
    id: 'reward-bono-100',
    title: 'Bono de 100 soles',
    description: 'Gran premio: Transferencia directa de S/. 100.00 soles a tu Yape, Plin o cuenta bancaria.',
    pointsCost: 15000,
    category: '💰 Gran Premio',
    image: '💰',
    stock: -1,
    active: true,
  },
];

// Helper local DB
export function readDb(): DatabaseSchema {
  const dbFile = getDbFile();
  const legacyFile = getLegacyDbFile();
  try {
    if (!fs.existsSync(dbFile)) {
      let initialUsers: Record<string, UserRecord> = {};
      if (fs.existsSync(legacyFile)) {
        try {
          const legacyData = JSON.parse(fs.readFileSync(legacyFile, 'utf-8'));
          for (const key in legacyData) {
            const u = legacyData[key];
            initialUsers[key.toLowerCase()] = {
              id: u.id || '123456',
              username: u.username || key,
              profilePic: u.profilePic || '',
              slug: u.slug || key,
              points: Math.round(Number(u.points) || 200),
              watchTimeMinutes: Number(u.watchTimeMinutes) || 0,
              chatMessagesCount: Number(u.chatMessagesCount) || 0,
              lastUpdated: u.lastUpdated || new Date().toISOString(),
              createdAt: u.createdAt || new Date().toISOString(),
            };
          }
        } catch (e) {}
      }

      const initialDb: DatabaseSchema = {
        users: initialUsers,
        rewards: INITIAL_REWARDS,
        claims: [],
      };
      try {
        fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2), 'utf-8');
      } catch (wErr) {}
      return initialDb;
    }

    const content = fs.readFileSync(dbFile, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(content);

    if (!parsed.users) parsed.users = {};
    parsed.rewards = INITIAL_REWARDS;
    if (!parsed.claims) parsed.claims = [];

    return parsed;
  } catch (error) {
    return { users: {}, rewards: INITIAL_REWARDS, claims: [] };
  }
}

export function writeDb(data: DatabaseSchema) {
  const dbFile = getDbFile();
  const legacyFile = getLegacyDbFile();
  try {
    const tempFile = `${dbFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, dbFile);
    try {
      fs.writeFileSync(legacyFile, JSON.stringify(data.users, null, 2), 'utf-8');
    } catch {}
  } catch (error) {}
}

// --- MÉTODOS DE USUARIO ---

export function getUser(username: string): UserRecord | null {
  const db = readDb();
  return db.users[username.toLowerCase()] || null;
}

export function getUserById(id: string): UserRecord | null {
  const db = readDb();
  return Object.values(db.users).find((u) => u.id === id) || null;
}

export function saveUser(user: { id: string; username: string; profilePic?: string; slug?: string }): UserRecord {
  const db = readDb();
  const key = user.username.toLowerCase();

  if (!db.users[key]) {
    db.users[key] = {
      id: user.id,
      username: user.username,
      profilePic: user.profilePic || '',
      slug: user.slug || user.username,
      points: 200,
      watchTimeMinutes: 0,
      chatMessagesCount: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  } else {
    db.users[key].profilePic = user.profilePic || db.users[key].profilePic;
    if (user.id) db.users[key].id = user.id;
    if (user.slug) db.users[key].slug = user.slug;
    db.users[key].lastUpdated = new Date().toISOString();
  }

  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    (async () => {
      try {
        await supabase.from('users').upsert({
          id: db.users[key].id,
          username: db.users[key].username,
          profile_pic: db.users[key].profilePic,
          slug: db.users[key].slug,
          points: db.users[key].points,
          watch_time_minutes: db.users[key].watchTimeMinutes,
          chat_messages_count: db.users[key].chatMessagesCount,
          last_updated: db.users[key].lastUpdated,
        });
      } catch (e) {}
    })();
  }

  return db.users[key];
}

export function addWatchTime(username: string, minutes: number = 1): UserRecord | null {
  const db = readDb();
  const key = username.toLowerCase();
  if (db.users[key]) {
    db.users[key].watchTimeMinutes += minutes;
    const pointsEarned = minutes * (10 / 60);
    db.users[key].points = Number((db.users[key].points + pointsEarned).toFixed(2));
    db.users[key].lastUpdated = new Date().toISOString();
    writeDb(db);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('users')
            .update({
              watch_time_minutes: db.users[key].watchTimeMinutes,
              points: db.users[key].points,
              last_updated: db.users[key].lastUpdated,
            })
            .eq('id', db.users[key].id);
        } catch (e) {}
      })();
    }

    return db.users[key];
  }
  return null;
}

export function addChatMessage(username: string): UserRecord | null {
  const db = readDb();
  const key = username.toLowerCase();
  if (db.users[key]) {
    const now = Date.now();
    const lastMsg = db.users[key].lastMessageTime || 0;

    db.users[key].chatMessagesCount += 1;

    if (now - lastMsg >= 5000) {
      db.users[key].points = Number((db.users[key].points + 0.1).toFixed(2));
      db.users[key].lastMessageTime = now;
    }

    db.users[key].lastUpdated = new Date().toISOString();
    writeDb(db);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('users')
            .update({
              chat_messages_count: db.users[key].chatMessagesCount,
              points: db.users[key].points,
              last_updated: db.users[key].lastUpdated,
            })
            .eq('id', db.users[key].id);
        } catch (e) {}
      })();
    }

    return db.users[key];
  }
  return null;
}

export function getLeaderboard(): UserRecord[] {
  const db = readDb();
  return Object.values(db.users).sort((a, b) => b.points - a.points);
}

// --- MÉTODOS DE RECOMPENSAS Y RECLAMACIONES ---

export function getRewards(): RewardItem[] {
  return INITIAL_REWARDS;
}

export function getRewardById(id: string): RewardItem | null {
  return INITIAL_REWARDS.find((r) => r.id === id) || null;
}

export function createClaim(claimData: {
  userId: string;
  username: string;
  profilePic?: string;
  rewardId: string;
  contactInfo: string;
}): { success: boolean; claim?: RewardClaim; error?: string; remainingPoints?: number } {
  const db = readDb();
  const userKey = claimData.username.toLowerCase();
  const user = db.users[userKey];

  if (!user) {
    return { success: false, error: 'Usuario no encontrado en la base de datos.' };
  }

  const reward = INITIAL_REWARDS.find((r) => r.id === claimData.rewardId);
  if (!reward) {
    return { success: false, error: 'La recompensa seleccionada no existe.' };
  }

  if (!reward.active) {
    return { success: false, error: 'Esta recompensa no está activa actualmente.' };
  }

  if (reward.stock === 0) {
    return { success: false, error: 'Esta recompensa está agotada por el momento.' };
  }

  if (user.points < reward.pointsCost) {
    return {
      success: false,
      error: `Puntos insuficientes. Necesitas ${reward.pointsCost} pts y actualmente tienes ${Math.floor(user.points)} pts.`,
    };
  }

  user.points = Number((user.points - reward.pointsCost).toFixed(2));
  user.lastUpdated = new Date().toISOString();

  if (reward.stock > 0) {
    reward.stock -= 1;
  }

  const newClaim: RewardClaim = {
    id: `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    username: user.username,
    profilePic: user.profilePic || claimData.profilePic || '',
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsCost,
    status: 'PENDING',
    contactInfo: claimData.contactInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.claims.unshift(newClaim);
  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    (async () => {
      try {
        await supabase.from('claims').insert({
          id: newClaim.id,
          user_id: newClaim.userId,
          username: newClaim.username,
          profile_pic: newClaim.profilePic,
          reward_id: newClaim.rewardId,
          reward_title: newClaim.rewardTitle,
          points_spent: newClaim.pointsSpent,
          status: newClaim.status,
          contact_info: newClaim.contactInfo,
        });
      } catch (e) {}
    })();
  }

  return {
    success: true,
    claim: newClaim,
    remainingPoints: user.points,
  };
}

export function getUserClaims(username: string): RewardClaim[] {
  const db = readDb();
  return db.claims.filter((c) => c.username.toLowerCase() === username.toLowerCase());
}

export function getAllClaims(): RewardClaim[] {
  const db = readDb();
  return db.claims;
}

export function updateClaimStatus(
  claimId: string,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  adminNotes?: string
): { success: boolean; claim?: RewardClaim; error?: string } {
  const db = readDb();
  const claimIndex = db.claims.findIndex((c) => c.id === claimId);

  if (claimIndex === -1) {
    return { success: false, error: 'Reclamación no encontrada.' };
  }

  const claim = db.claims[claimIndex];
  const oldStatus = claim.status;

  claim.status = status;
  if (adminNotes !== undefined) {
    claim.adminNotes = adminNotes;
  }
  claim.updatedAt = new Date().toISOString();

  if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
    const userKey = claim.username.toLowerCase();
    if (db.users[userKey]) {
      db.users[userKey].points = Number((db.users[userKey].points + claim.pointsSpent).toFixed(2));
      db.users[userKey].lastUpdated = new Date().toISOString();
    }
  }

  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    (async () => {
      try {
        await supabase
          .from('claims')
          .update({ status: claim.status, admin_notes: claim.adminNotes, updated_at: claim.updatedAt })
          .eq('id', claimId);
      } catch (e) {}
    })();
  }

  return { success: true, claim };
}

export function getAdminMetrics() {
  const db = readDb();
  const usersList = Object.values(db.users);
  const totalUsers = usersList.length;
  const totalPointsInCirculation = usersList.reduce((acc, u) => acc + (u.points || 0), 0);
  const totalClaims = db.claims.length;
  const pendingClaims = db.claims.filter((c) => c.status === 'PENDING').length;
  const completedClaims = db.claims.filter((c) => c.status === 'COMPLETED').length;

  return {
    totalUsers,
    totalPointsInCirculation: Math.round(totalPointsInCirculation),
    totalClaims,
    pendingClaims,
    completedClaims,
  };
}
