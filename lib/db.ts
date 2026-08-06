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
  proofs?: ProofItem[];
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
