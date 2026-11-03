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

export interface PredictionRecord {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  matchId: number;
  matchDate: string; // ISO UTC
  homeTeam: string;
  awayTeam: string;
  competition: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore?: number | null;
  actualAwayScore?: number | null;
  status: 'PENDING' | 'EVALUATED' | 'CANCELLED';
  pointsAwarded: number;
  createdAt: string;
  evaluatedAt?: string;
}

export interface QuinielaBetRecord {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  matchId: number;
  matchDate: string; // ISO UTC
  homeTeam: string;
  awayTeam: string;
  competition: string;
  betType: '1X2' | 'SCORE';
  selection: 'HOME' | 'DRAW' | 'AWAY' | string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  odds: number;
  pointsBet: number;
  potentialPayout: number;
  actualHomeScore?: number | null;
  actualAwayScore?: number | null;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
  pointsAwarded: number;
  createdAt: string;
  evaluatedAt?: string;
}

export interface DatabaseSchema {
  users: Record<string, UserRecord>;
  rewards: RewardItem[];
  claims: RewardClaim[];
  proofs?: ProofItem[];
  predictions?: PredictionRecord[];
  bets?: QuinielaBetRecord[];
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
    category: 'Casino',
    image: '',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-pollo',
    title: '1/4 pollo',
    description: '1/4 de pollo a la brasa con papas y cremas para tu almuerzo o cena.',
    pointsCost: 500,
    category: 'Gastronomía',
    image: '',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-polo-madrid',
    title: 'Comprar un polo de Real Madrid',
    description: 'Bepucho comprará y usará una camiseta oficial del Real Madrid durante un stream completo (¡un verdadero castigo por ser hincha del FC Barcelona!).',
    pointsCost: 1500,
    category: 'Merch & Dinámicas',
    image: '',
    stock: 5,
    active: true,
  },
  {
    id: 'reward-cosplay',
    title: 'Cospobre de un futbolista',
    description: 'Bepucho vestirá un disfraz cómico del futbolista que tú elijas durante toda una transmisión.',
    pointsCost: 2500,
    category: 'Show en Stream',
    image: '',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-bono-20',
    title: 'Bono de 20 soles',
    description: 'Transferencia directa de S/. 20.00 soles a tu Yape, Plin o cuenta bancaria.',
    pointsCost: 4000,
    category: 'Premios en Efectivo',
    image: '',
    stock: -1,
    active: true,
  },
  {
    id: 'reward-apostar',
    title: 'Venir a apostar conmigo',
    description: 'Salida presencial para ir juntos a un casino físico y apostar en vivo junto a Bepucho.',
    pointsCost: 8000,
    category: 'Experiencia Presencial',
    image: '',
    stock: 3,
    active: true,
  },
  {
    id: 'reward-bono-100',
    title: 'Bono de 100 soles',
    description: 'Gran premio: Transferencia directa de S/. 100.00 soles a tu Yape, Plin o cuenta bancaria.',
    pointsCost: 15000,
    category: 'Gran Premio',
    image: '',
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
              points: u.points !== undefined && u.points !== null ? Math.round(Number(u.points)) : 0,
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
        proofs: [],
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
    if (!parsed.proofs) parsed.proofs = [];

    return parsed;
  } catch (error) {
    return { users: {}, rewards: INITIAL_REWARDS, claims: [], proofs: [] };
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

export async function getUser(username: string): Promise<UserRecord | null> {
  const db = readDb();
  const key = username.toLowerCase();

  // Primary: Always fetch fresh data from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .maybeSingle();

      if (data && !error) {
        const restoredUser: UserRecord = {
          id: data.id || key,
          username: data.username || username,
          profilePic: data.profile_pic || '',
          slug: data.slug || username,
          points: data.points !== undefined && data.points !== null ? Number(data.points) : 0,
          watchTimeMinutes: Number(data.watch_time_minutes) || 0,
          chatMessagesCount: Number(data.chat_messages_count) || 0,
          lastUpdated: data.last_updated || new Date().toISOString(),
          createdAt: data.created_at || new Date().toISOString(),
        };
        db.users[key] = restoredUser;
        writeDb(db);
        return restoredUser;
      }
    } catch (e) {
      console.error('Supabase getUser error:', e);
    }
  }

  // Fallback: Local memory / JSON cache
  if (db.users[key]) {
    return db.users[key];
  }

  return null;
}

export function getUserById(id: string): UserRecord | null {
  const db = readDb();
  return Object.values(db.users).find((u) => u.id === id) || null;
}

export async function saveUser(user: { id: string; username: string; profilePic?: string; slug?: string }): Promise<UserRecord> {
  const db = readDb();
  const key = user.username.toLowerCase();

  let existing: UserRecord | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('users').select('*').ilike('username', user.username).maybeSingle();
      if (data) {
        existing = {
          id: data.id || key,
          username: data.username || user.username,
          profilePic: data.profile_pic || user.profilePic || '',
          slug: data.slug || user.slug || user.username,
          points: data.points !== undefined && data.points !== null ? Number(data.points) : 0,
          watchTimeMinutes: Number(data.watch_time_minutes) || 0,
          chatMessagesCount: Number(data.chat_messages_count) || 0,
          lastUpdated: data.last_updated || new Date().toISOString(),
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {}
  }

  if (!existing && db.users[key]) {
    existing = db.users[key];
  }

  if (!existing) {
    db.users[key] = {
      id: user.id || key,
      username: user.username,
      profilePic: user.profilePic || '',
      slug: user.slug || user.username,
      points: 0,
      watchTimeMinutes: 0,
      chatMessagesCount: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  } else {
    db.users[key] = {
      ...existing,
      profilePic: user.profilePic || existing.profilePic,
      id: user.id || existing.id,
      slug: user.slug || existing.slug,
      lastUpdated: new Date().toISOString(),
    };
  }

  writeDb(db);

  if (isSupabaseConfigured && supabase) {
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
    } catch (e) {
      console.error('Supabase saveUser error:', e);
    }
  }

  return db.users[key];
}

export async function addWatchTime(username: string, minutes: number = 1): Promise<UserRecord | null> {
  const db = readDb();
  const key = username.toLowerCase();

  // Always fetch latest record from Supabase first
  let userRecord = await getUser(username);
  if (!userRecord) {
    userRecord = await saveUser({ id: key, username: username });
  }

  if (userRecord) {
    userRecord.watchTimeMinutes += minutes;
    // +0.4 pts per minute (reducido de 1.0)
    const pointsEarned = minutes * 0.4;
    userRecord.points = Number((userRecord.points + pointsEarned).toFixed(2));
    userRecord.lastUpdated = new Date().toISOString();

    db.users[key] = userRecord;
    writeDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('users')
          .update({
            watch_time_minutes: userRecord.watchTimeMinutes,
            points: userRecord.points,
            last_updated: userRecord.lastUpdated,
          })
          .ilike('username', userRecord.username);
      } catch (e) {
        console.error('Supabase addWatchTime error:', e);
      }
    }

    return userRecord;
  }
  return null;
}

export async function addChatMessage(username: string): Promise<UserRecord | null> {
  const db = readDb();
  const key = username.toLowerCase();

  // Always fetch latest record from Supabase first
  let userRecord = await getUser(username);
  if (!userRecord) {
    userRecord = await saveUser({ id: key, username: username });
  }

  if (userRecord) {
    const now = Date.now();
    const lastMsg = userRecord.lastMessageTime || 0;

    userRecord.chatMessagesCount += 1;

    // +0.2 pts per chat message (cooldown 10 segundos para evitar spam)
    if (now - lastMsg >= 10000) {
      userRecord.points = Number((userRecord.points + 0.2).toFixed(2));
      userRecord.lastMessageTime = now;
    }

    userRecord.lastUpdated = new Date().toISOString();

    db.users[key] = userRecord;
    writeDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('users')
          .update({
            chat_messages_count: userRecord.chatMessagesCount,
            points: userRecord.points,
            last_updated: userRecord.lastUpdated,
          })
          .ilike('username', userRecord.username);
      } catch (e) {
        console.error('Supabase addChatMessage error:', e);
      }
    }

    return userRecord;
  }
  return null;
}

export async function getLeaderboard(): Promise<UserRecord[]> {
  const db = readDb();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false })
        .limit(100);

      if (data && !error && data.length > 0) {
        const list: UserRecord[] = data.map((row) => ({
          id: row.id || (row.username || '').toLowerCase(),
          username: row.username,
          profilePic: row.profile_pic || '',
          slug: row.slug || row.username,
          points: row.points !== undefined && row.points !== null ? Number(row.points) : 0,
          watchTimeMinutes: Number(row.watch_time_minutes) || 0,
          chatMessagesCount: Number(row.chat_messages_count) || 0,
          lastUpdated: row.last_updated || new Date().toISOString(),
          createdAt: row.created_at || new Date().toISOString(),
        }));

        // Sync local cache with Supabase data
        for (const u of list) {
          db.users[u.username.toLowerCase()] = u;
        }
        writeDb(db);

        return list.sort((a, b) => b.points - a.points);
      }
    } catch (e) {
      console.error('Supabase getLeaderboard error:', e);
    }
  }

  return Object.values(db.users).sort((a, b) => b.points - a.points);
}

export interface ProofItem {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  imageUrl: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}


// --- MÉTODOS DE RECOMPENSAS Y RECLAMACIONES ---


export async function getRewards(): Promise<RewardItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rewards').select('*');
      if (data && !error && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          pointsCost: Number(r.points_cost !== undefined ? r.points_cost : r.pointsCost || 0),
          category: r.category || 'General',
          image: r.image || '🎁',
          stock: r.stock !== undefined && r.stock !== null ? Number(r.stock) : -1,
          active: r.active !== undefined ? Boolean(r.active) : true,
        }));
      }
    } catch (e) {
      console.error('Supabase getRewards error:', e);
    }
  }
  return INITIAL_REWARDS;
}

export async function getRewardById(id: string): Promise<RewardItem | null> {
  const rewards = await getRewards();
  return rewards.find((r) => r.id === id) || null;
}

export async function updateUserPoints(username: string, newPoints: number): Promise<UserRecord | null> {
  const db = readDb();
  const key = username.toLowerCase();
  let user = await getUser(username);
  if (!user) return null;

  user.points = Math.max(0, Number(newPoints.toFixed(2)));
  user.lastUpdated = new Date().toISOString();
  db.users[key] = user;
  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('users')
        .update({ points: user.points, last_updated: user.lastUpdated })
        .ilike('username', username);
    } catch (e) {
      console.error('Supabase updateUserPoints error:', e);
    }
  }
  return user;
}

export async function createClaim(claimData: {
  userId: string;
  username: string;
  profilePic?: string;
  rewardId: string;
  contactInfo: string;
}): Promise<{ success: boolean; claim?: RewardClaim; error?: string; remainingPoints?: number }> {
  const db = readDb();
  const userKey = claimData.username.toLowerCase();
  let user = db.users[userKey];

  if (!user) {
    const restored = await getUser(claimData.username);
    if (restored) {
      user = restored;
    } else {
      return { success: false, error: 'Usuario no encontrado en la base de datos.' };
    }
  }

  const reward = await getRewardById(claimData.rewardId);
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
      await supabase
        .from('users')
        .update({ points: user.points, last_updated: user.lastUpdated })
        .ilike('username', user.username);
    } catch (e) {
      console.error('Supabase createClaim error:', e);
    }
  }

  return {
    success: true,
    claim: newClaim,
    remainingPoints: user.points,
  };
}

export async function getUserClaims(username: string): Promise<RewardClaim[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .ilike('username', username)
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map((c) => ({
          id: c.id,
          userId: c.user_id || c.userId,
          username: c.username,
          profilePic: c.profile_pic || c.profilePic || '',
          rewardId: c.reward_id || c.rewardId,
          rewardTitle: c.reward_title || c.rewardTitle,
          pointsSpent: Number(c.points_spent !== undefined ? c.points_spent : c.pointsSpent || 0),
          status: c.status,
          contactInfo: c.contact_info || c.contactInfo || '',
          adminNotes: c.admin_notes || c.adminNotes || '',
          createdAt: c.created_at || c.createdAt,
          updatedAt: c.updated_at || c.updatedAt,
        }));
      }
    } catch (e) {
      console.error('Supabase getUserClaims error:', e);
    }
  }

  const db = readDb();
  return (db.claims || []).filter((c) => c.username.toLowerCase() === username.toLowerCase());
}

export async function getAllClaims(): Promise<RewardClaim[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map((c) => ({
          id: c.id,
          userId: c.user_id || c.userId,
          username: c.username,
          profilePic: c.profile_pic || c.profilePic || '',
          rewardId: c.reward_id || c.rewardId,
          rewardTitle: c.reward_title || c.rewardTitle,
          pointsSpent: Number(c.points_spent !== undefined ? c.points_spent : c.pointsSpent || 0),
          status: c.status,
          contactInfo: c.contact_info || c.contactInfo || '',
          adminNotes: c.admin_notes || c.adminNotes || '',
          createdAt: c.created_at || c.createdAt,
          updatedAt: c.updated_at || c.updatedAt,
        }));
      }
    } catch (e) {
      console.error('Supabase getAllClaims error:', e);
    }
  }

  const db = readDb();
  return db.claims || [];
}

export async function updateClaimStatus(
  claimId: string,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  adminNotes?: string
): Promise<{ success: boolean; claim?: RewardClaim; error?: string }> {
  const db = readDb();
  if (!db.claims) db.claims = [];

  let claimIndex = db.claims.findIndex((c) => c.id === claimId);
  let claim: RewardClaim | null = claimIndex !== -1 ? db.claims[claimIndex] : null;

  if (!claim && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('claims').select('*').eq('id', claimId).maybeSingle();
      if (data) {
        claim = {
          id: data.id,
          userId: data.user_id || data.userId,
          username: data.username,
          profilePic: data.profile_pic || data.profilePic || '',
          rewardId: data.reward_id || data.rewardId,
          rewardTitle: data.reward_title || data.rewardTitle,
          pointsSpent: Number(data.points_spent !== undefined ? data.points_spent : data.pointsSpent || 0),
          status: data.status,
          contactInfo: data.contact_info || data.contactInfo || '',
          adminNotes: data.admin_notes || data.adminNotes || '',
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        };
        db.claims.unshift(claim);
        claimIndex = 0;
      }
    } catch (e) {}
  }

  if (!claim) {
    return { success: false, error: 'Reclamación no encontrada.' };
  }

  const oldStatus = claim.status;
  claim.status = status;
  if (adminNotes !== undefined) {
    claim.adminNotes = adminNotes;
  }
  claim.updatedAt = new Date().toISOString();

  if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
    const user = await getUser(claim.username);
    if (user) {
      await updateUserPoints(claim.username, user.points + claim.pointsSpent);
    }
  }

  if (claimIndex !== -1) {
    db.claims[claimIndex] = claim;
  } else {
    db.claims.unshift(claim);
  }
  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('claims')
        .update({ status: claim.status, admin_notes: claim.adminNotes, updated_at: claim.updatedAt })
        .eq('id', claimId);
    } catch (e) {
      console.error('Supabase updateClaimStatus error:', e);
    }
  }

  return { success: true, claim };
}

// --- MÉTODOS DE PRUEBAS BET365 ---

export async function createProof(proofData: {
  userId: string;
  username: string;
  profilePic?: string;
  imageUrl: string;
  notes?: string;
}): Promise<{ success: boolean; proof?: ProofItem; error?: string }> {
  const db = readDb();
  if (!db.proofs) db.proofs = [];

  const newProof: ProofItem = {
    id: `proof-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: proofData.userId,
    username: proofData.username,
    profilePic: proofData.profilePic || '',
    imageUrl: proofData.imageUrl,
    notes: proofData.notes || '',
    status: 'PENDING',
    pointsAwarded: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.proofs.unshift(newProof);
  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('proofs').insert({
        id: newProof.id,
        user_id: newProof.userId,
        username: newProof.username,
        profile_pic: newProof.profilePic,
        image_url: newProof.imageUrl,
        notes: newProof.notes,
        status: newProof.status,
        points_awarded: newProof.pointsAwarded,
      });
    } catch (e) {
      console.error('Supabase createProof error:', e);
    }
  }

  return { success: true, proof: newProof };
}

export async function getUserProofs(username: string): Promise<ProofItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .ilike('username', username)
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map((p) => ({
          id: p.id,
          userId: p.user_id || p.userId,
          username: p.username,
          profilePic: p.profile_pic || p.profilePic || '',
          imageUrl: p.image_url || p.imageUrl,
          notes: p.notes || '',
          status: p.status,
          pointsAwarded: Number(p.points_awarded || p.pointsAwarded || 50),
          createdAt: p.created_at || p.createdAt,
          updatedAt: p.updated_at || p.updatedAt,
        }));
      }
    } catch (e) {}
  }

  const db = readDb();
  return (db.proofs || []).filter((p) => p.username.toLowerCase() === username.toLowerCase());
}

export async function getAllProofs(): Promise<ProofItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map((p) => ({
          id: p.id,
          userId: p.user_id || p.userId,
          username: p.username,
          profilePic: p.profile_pic || p.profilePic || '',
          imageUrl: p.image_url || p.imageUrl,
          notes: p.notes || '',
          status: p.status,
          pointsAwarded: Number(p.points_awarded || p.pointsAwarded || 50),
          createdAt: p.created_at || p.createdAt,
          updatedAt: p.updated_at || p.updatedAt,
        }));
      }
    } catch (e) {}
  }

  const db = readDb();
  return db.proofs || [];
}

export async function updateProofStatus(
  proofId: string,
  status: 'APPROVED' | 'REJECTED',
  points: number = 50
): Promise<{ success: boolean; proof?: ProofItem; error?: string }> {
  const db = readDb();
  if (!db.proofs) db.proofs = [];

  let proof = db.proofs.find((p) => p.id === proofId);

  if (!proof && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('proofs').select('*').eq('id', proofId).maybeSingle();
      if (data) {
        proof = {
          id: data.id,
          userId: data.user_id || data.userId,
          username: data.username,
          profilePic: data.profile_pic || data.profilePic || '',
          imageUrl: data.image_url || data.imageUrl,
          notes: data.notes || '',
          status: data.status,
          pointsAwarded: Number(data.points_awarded || 50),
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        };
        db.proofs.unshift(proof);
      }
    } catch (e) {}
  }

  if (!proof) {
    return { success: false, error: 'Prueba no encontrada.' };
  }

  const prevStatus = proof.status;
  proof.status = status;
  proof.updatedAt = new Date().toISOString();

  // Si fue aprobada y no lo estaba antes, sumarle los +50 puntos al usuario
  if (status === 'APPROVED' && prevStatus !== 'APPROVED') {
    const user = await getUser(proof.username);
    if (user) {
      await updateUserPoints(proof.username, user.points + points);
    }
  }

  writeDb(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('proofs')
        .update({ status: proof.status, updated_at: proof.updatedAt })
        .eq('id', proofId);
    } catch (e) {
      console.error('Supabase updateProofStatus error:', e);
    }
  }

  return { success: true, proof };
}

export async function getAdminMetrics() {
  const users = await getLeaderboard();
  const claims = await getAllClaims();

  const totalUsers = users.length;
  const totalPointsInCirculation = users.reduce((acc, u) => acc + (u.points || 0), 0);
  const totalClaims = claims.length;
  const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
  const completedClaims = claims.filter((c) => c.status === 'COMPLETED').length;

  return {
    totalUsers,
    totalPointsInCirculation: Math.round(totalPointsInCirculation),
    totalClaims,
    pendingClaims,
    completedClaims,
  };
}

/* ============================================
   QUINIELA / PRODE PREDICTIONS SYSTEM
   ============================================ */

export const QUINIELA_POINTS_OUTCOME = 10; // Acierto de ganador / empate (1X2)
export const QUINIELA_POINTS_EXACT = 25;   // Acierto de marcador exacto (Total = 35)

export async function createPrediction(input: {
  userId: string;
  username: string;
  profilePic?: string;
  matchId: number;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}): Promise<{ success: boolean; prediction?: PredictionRecord; error?: string }> {
  // 1. Validar que el partido no haya comenzado
  const matchTimestamp = new Date(input.matchDate).getTime();
  if (Date.now() >= matchTimestamp) {
    return {
      success: false,
      error: 'El partido ya ha comenzado. Las predicciones están cerradas para este encuentro.',
    };
  }

  // 2. Validar marcadores coherentes
  if (
    input.predictedHomeScore < 0 ||
    input.predictedAwayScore < 0 ||
    !Number.isInteger(input.predictedHomeScore) ||
    !Number.isInteger(input.predictedAwayScore) ||
    input.predictedHomeScore > 20 ||
    input.predictedAwayScore > 20
  ) {
    return {
      success: false,
      error: 'Marcador inválido. Ingrese números enteros entre 0 y 20.',
    };
  }

  const db = readDb();
  if (!db.predictions) db.predictions = [];

  // 3. Validar una sola predicción por usuario y partido
  const existing = db.predictions.find(
    (p) => String(p.userId) === String(input.userId) && Number(p.matchId) === Number(input.matchId)
  );
  if (existing) {
    return {
      success: false,
      error: 'Ya has enviado una predicción para este partido. No se permiten ediciones posteriores al envío.',
    };
  }

  const newPrediction: PredictionRecord = {
    id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    userId: String(input.userId),
    username: input.username,
    profilePic: input.profilePic || '',
    matchId: Number(input.matchId),
    matchDate: input.matchDate,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    competition: input.competition,
    predictedHomeScore: input.predictedHomeScore,
    predictedAwayScore: input.predictedAwayScore,
    status: 'PENDING',
    pointsAwarded: 0,
    createdAt: new Date().toISOString(),
  };

  db.predictions.push(newPrediction);
  writeDb(db);

  return { success: true, prediction: newPrediction };
}

export async function getUserPredictions(userId: string): Promise<PredictionRecord[]> {
  const db = readDb();
  if (!db.predictions) return [];
  return db.predictions
    .filter((p) => String(p.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function evaluateMatchPredictions(
  matchId: number,
  actualHomeScore: number,
  actualAwayScore: number
): Promise<{ evaluatedCount: number; totalPointsGiven: number }> {
  const db = readDb();
  if (!db.predictions) return { evaluatedCount: 0, totalPointsGiven: 0 };

  let evaluatedCount = 0;
  let totalPointsGiven = 0;

  const actualSign = Math.sign(actualHomeScore - actualAwayScore);

  for (const pred of db.predictions) {
    if (Number(pred.matchId) === Number(matchId) && pred.status === 'PENDING') {
      pred.actualHomeScore = actualHomeScore;
      pred.actualAwayScore = actualAwayScore;
      pred.status = 'EVALUATED';
      pred.evaluatedAt = new Date().toISOString();

      let points = 0;
      const predSign = Math.sign(pred.predictedHomeScore - pred.predictedAwayScore);

      // Acierto de resultado (1X2)
      if (predSign === actualSign) {
        points += QUINIELA_POINTS_OUTCOME;
      }

      // Marcador exacto
      if (
        pred.predictedHomeScore === actualHomeScore &&
        pred.predictedAwayScore === actualAwayScore
      ) {
        points += QUINIELA_POINTS_EXACT;
      }

      pred.pointsAwarded = points;

      if (points > 0) {
        // Asignar puntos al usuario en la base de datos comunitaria
        const user = await getUser(pred.username);
        if (user) {
          await updateUserPoints(pred.username, (user.points || 0) + points);
        }
        totalPointsGiven += points;
      }

      evaluatedCount++;
    }
  }

  if (evaluatedCount > 0) {
    writeDb(db);
  }

  return { evaluatedCount, totalPointsGiven };
}

export async function getQuinielaLeaderboard(timeframe: 'weekly' | 'all' = 'weekly'): Promise<
  Array<{
    userId: string;
    username: string;
    profilePic: string;
    points: number;
    hitsCount: number;
    exactHitsCount: number;
  }>
> {
  const db = readDb();
  if (!db.predictions) return [];

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const userMap: Record<
    string,
    {
      userId: string;
      username: string;
      profilePic: string;
      points: number;
      hitsCount: number;
      exactHitsCount: number;
    }
  > = {};

  for (const pred of db.predictions) {
    if (pred.status !== 'EVALUATED') continue;

    if (timeframe === 'weekly') {
      const predTime = new Date(pred.evaluatedAt || pred.createdAt).getTime();
      if (predTime < oneWeekAgo) continue;
    }

    if (!userMap[pred.userId]) {
      userMap[pred.userId] = {
        userId: pred.userId,
        username: pred.username,
        profilePic: pred.profilePic || '',
        points: 0,
        hitsCount: 0,
        exactHitsCount: 0,
      };
    }

    userMap[pred.userId].points += pred.pointsAwarded || 0;
    if (pred.pointsAwarded && pred.pointsAwarded >= QUINIELA_POINTS_OUTCOME) {
      userMap[pred.userId].hitsCount += 1;
    }
    if (pred.pointsAwarded && pred.pointsAwarded >= QUINIELA_POINTS_OUTCOME + QUINIELA_POINTS_EXACT) {
      userMap[pred.userId].exactHitsCount += 1;
    }
  }

  return Object.values(userMap).sort((a, b) => b.points - a.points);
}

/* ====================================================================
   CASA DE APUESTAS DE LA QUINIELA CON PUNTOS (BETTING ENGINE)
   ==================================================================== */

/**
 * Calcula cuotas realistas según el riesgo de cada resultado
 */
export function calculateMatchOdds(
  matchId: number,
  homeTeam: string = '',
  awayTeam: string = ''
): {
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  exactScoreOdds: number;
} {
  // Determinista según el ID del partido para mantener cuotas estables
  const seed = (Math.abs(Number(matchId)) * 9301 + 49297) % 233280;
  const variation = (seed % 30) / 100; // 0.00 a 0.29

  // Local gana: Favorito moderado (~1.85x a 2.15x) -> Dobla
  const homeOdds = Number((1.85 + variation).toFixed(2));

  // Empate: Mayor riesgo (~3.20x a 3.55x) -> Más del triple
  const drawOdds = Number((3.25 + (variation * 0.9)).toFixed(2));

  // Visitante gana: Riesgo medio/alto (~2.25x a 2.70x) -> Más del doble
  const awayOdds = Number((2.35 + (variation * 1.2)).toFixed(2));

  // Marcador exacto: Riesgo extremo (~5.50x a 7.50x)
  const exactScoreOdds = Number((5.50 + variation * 5).toFixed(2));

  return {
    homeOdds,
    drawOdds,
    awayOdds,
    exactScoreOdds,
  };
}

/**
 * Colocar una apuesta con puntos del usuario
 */
export async function placeQuinielaBet(input: {
  userId: string;
  username: string;
  profilePic?: string;
  matchId: number;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  betType: '1X2' | 'SCORE';
  selection: 'HOME' | 'DRAW' | 'AWAY' | string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  pointsBet: number;
  odds?: number;
}): Promise<{ success: boolean; bet?: QuinielaBetRecord; remainingPoints?: number; error?: string }> {
  const pointsBet = Math.floor(Number(input.pointsBet));
  if (isNaN(pointsBet) || pointsBet <= 0) {
    return { success: false, error: 'Ingresa un monto de puntos válido para apostar (mínimo 1 punto).' };
  }

  // 1. Verificar si el partido ya inició
  const matchTime = new Date(input.matchDate).getTime();
  if (Date.now() >= matchTime) {
    return { success: false, error: 'Este partido ya ha comenzado. Las apuestas están cerradas.' };
  }

  // 2. Obtener usuario y verificar saldo
  const user = await getUser(input.username);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado. Inicia sesión con Kick primero.' };
  }

  const currentPoints = user.points || 0;
  if (currentPoints < pointsBet) {
    return {
      success: false,
      error: `Puntos insuficientes. Tu saldo actual es de ${Math.floor(currentPoints)} pts, e intentas apostar ${pointsBet} pts.`,
    };
  }

  // 3. Determinar cuota / multiplicador según riesgo (o usar cuota real de mercado confirmada)
  const oddsData = calculateMatchOdds(input.matchId, input.homeTeam, input.awayTeam);
  let odds = 2.0;

  if (input.odds && input.odds >= 1.05 && input.odds <= 50) {
    odds = Number(input.odds.toFixed(2));
  } else if (input.betType === '1X2') {
    if (input.selection === 'HOME') odds = oddsData.homeOdds;
    else if (input.selection === 'DRAW') odds = oddsData.drawOdds;
    else if (input.selection === 'AWAY') odds = oddsData.awayOdds;
  } else if (input.betType === 'SCORE') {
    odds = oddsData.exactScoreOdds;
  }

  const potentialPayout = Math.floor(pointsBet * odds);

  // 4. Deducir puntos del usuario inmediatamente (como una casa de apuestas)
  const remainingPoints = Number((currentPoints - pointsBet).toFixed(2));
  await updateUserPoints(input.username, remainingPoints);

  // 5. Crear registro de apuesta
  const betId = `bet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newBet: QuinielaBetRecord = {
    id: betId,
    userId: String(input.userId),
    username: input.username,
    profilePic: input.profilePic || user.profilePic || '',
    matchId: Number(input.matchId),
    matchDate: input.matchDate,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    competition: input.competition || 'Fútbol',
    betType: input.betType,
    selection: input.selection,
    predictedHomeScore: input.predictedHomeScore,
    predictedAwayScore: input.predictedAwayScore,
    odds,
    pointsBet,
    potentialPayout,
    status: 'PENDING',
    pointsAwarded: 0,
    createdAt: new Date().toISOString(),
  };

  // Guardar en base de datos local
  const db = readDb();
  if (!db.bets) db.bets = [];
  db.bets.push(newBet);
  writeDb(db);

  // Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('quiniela_bets').insert({
        id: newBet.id,
        user_id: newBet.userId,
        username: newBet.username,
        profile_pic: newBet.profilePic,
        match_id: newBet.matchId,
        match_date: newBet.matchDate,
        home_team: newBet.homeTeam,
        away_team: newBet.awayTeam,
        competition: newBet.competition,
        bet_type: newBet.betType,
        selection: newBet.selection,
        predicted_home_score: newBet.predictedHomeScore,
        predicted_away_score: newBet.predictedAwayScore,
        odds: newBet.odds,
        points_bet: newBet.pointsBet,
        potential_payout: newBet.potentialPayout,
        status: newBet.status,
        points_awarded: 0,
        created_at: newBet.createdAt,
      });
    } catch (e) {
      console.error('Error insertando apuesta en Supabase:', e);
    }
  }

  return {
    success: true,
    bet: newBet,
    remainingPoints,
  };
}

/**
 * Obtiene el historial de apuestas de un usuario
 */
export async function getUserQuinielaBets(userId: string): Promise<QuinielaBetRecord[]> {
  const db = readDb();
  let bets = db.bets || [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('quiniela_bets')
        .select('*')
        .eq('user_id', String(userId))
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        const mapped: QuinielaBetRecord[] = data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          username: r.username,
          profilePic: r.profile_pic || '',
          matchId: Number(r.match_id),
          matchDate: r.match_date,
          homeTeam: r.home_team,
          awayTeam: r.away_team,
          competition: r.competition,
          betType: r.bet_type || '1X2',
          selection: r.selection,
          predictedHomeScore: r.predicted_home_score,
          predictedAwayScore: r.predicted_away_score,
          odds: Number(r.odds) || 2.0,
          pointsBet: Number(r.points_bet) || 0,
          potentialPayout: Number(r.potential_payout) || 0,
          actualHomeScore: r.actual_home_score,
          actualAwayScore: r.actual_away_score,
          status: r.status,
          pointsAwarded: Number(r.points_awarded) || 0,
          createdAt: r.created_at,
          evaluatedAt: r.evaluated_at,
        }));
        return mapped;
      }
    } catch (e) {
      console.error('Error obteniendo apuestas de usuario desde Supabase:', e);
    }
  }

  return bets
    .filter((b) => String(b.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Obtener todas las apuestas (para administración y monitoreo)
 */
export async function getAllQuinielaBets(limit: number = 100): Promise<QuinielaBetRecord[]> {
  const db = readDb();
  let bets = db.bets || [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('quiniela_bets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data && !error && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          username: r.username,
          profilePic: r.profile_pic || '',
          matchId: Number(r.match_id),
          matchDate: r.match_date,
          homeTeam: r.home_team,
          awayTeam: r.away_team,
          competition: r.competition,
          betType: r.bet_type || '1X2',
          selection: r.selection,
          predictedHomeScore: r.predicted_home_score,
          predictedAwayScore: r.predicted_away_score,
          odds: Number(r.odds) || 2.0,
          pointsBet: Number(r.points_bet) || 0,
          potentialPayout: Number(r.potential_payout) || 0,
          actualHomeScore: r.actual_home_score,
          actualAwayScore: r.actual_away_score,
          status: r.status,
          pointsAwarded: Number(r.points_awarded) || 0,
          createdAt: r.created_at,
          evaluatedAt: r.evaluated_at,
        }));
      }
    } catch (e) {
      console.error('Error obteniendo all quiniela bets desde Supabase:', e);
    }
  }

  return bets.slice(-limit).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Evaluar todas las apuestas de un partido finalizado y acreditar ganancias automáticamente
 */
export async function evaluateMatchQuinielaBets(
  matchId: number,
  actualHomeScore: number,
  actualAwayScore: number
): Promise<{ evaluatedCount: number; wonCount: number; totalPayoutAwarded: number }> {
  const db = readDb();
  if (!db.bets) db.bets = [];

  let evaluatedCount = 0;
  let wonCount = 0;
  let totalPayoutAwarded = 0;

  const actualSign = Math.sign(actualHomeScore - actualAwayScore);
  const nowIso = new Date().toISOString();

  // 1. Obtener apuestas pendientes para este partido
  for (const bet of db.bets) {
    if (Number(bet.matchId) === Number(matchId) && bet.status === 'PENDING') {
      bet.actualHomeScore = actualHomeScore;
      bet.actualAwayScore = actualAwayScore;
      bet.evaluatedAt = nowIso;

      let isWin = false;

      if (bet.betType === '1X2') {
        if (actualSign > 0 && bet.selection === 'HOME') isWin = true;
        else if (actualSign === 0 && bet.selection === 'DRAW') isWin = true;
        else if (actualSign < 0 && bet.selection === 'AWAY') isWin = true;
      } else if (bet.betType === 'SCORE') {
        if (
          bet.predictedHomeScore === actualHomeScore &&
          bet.predictedAwayScore === actualAwayScore
        ) {
          isWin = true;
        }
      }

      if (isWin) {
        bet.status = 'WON';
        bet.pointsAwarded = bet.potentialPayout;
        wonCount++;
        totalPayoutAwarded += bet.potentialPayout;

        // Acreditar el pago (doble, triple o cuota exacta) a la cuenta del usuario en Supabase
        const user = await getUser(bet.username);
        if (user) {
          await updateUserPoints(bet.username, (user.points || 0) + bet.potentialPayout);
        }
      } else {
        bet.status = 'LOST';
        bet.pointsAwarded = 0;
      }

      evaluatedCount++;

      // Sincronizar en Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('quiniela_bets')
            .update({
              actual_home_score: actualHomeScore,
              actual_away_score: actualAwayScore,
              status: bet.status,
              points_awarded: bet.pointsAwarded,
              evaluated_at: nowIso,
            })
            .eq('id', bet.id);
        } catch (e) {
          console.error('Error actualizando apuesta en Supabase:', e);
        }
      }
    }
  }

  if (evaluatedCount > 0) {
    writeDb(db);
  }

  return { evaluatedCount, wonCount, totalPayoutAwarded };
}


