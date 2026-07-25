import {
  getUser,
  saveUser,
  addWatchTime as dbAddWatchTime,
  addChatMessage as dbAddChatMessage,
  getLeaderboard as dbGetLeaderboard,
  UserRecord,
} from './db';

export interface UserPoints {
  id: string;
  username: string;
  profilePic: string;
  points: number;
  watchTimeMinutes: number;
  chatMessagesCount: number;
  lastUpdated: string;
}

export async function getUserPoints(username: string): Promise<UserPoints | null> {
  const u = await getUser(username);
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  };
}

export async function saveUserPoints(user: { id: string; username: string; profilePic?: string; slug?: string }): Promise<UserPoints> {
  const u = await saveUser(user);
  return {
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  };
}

export async function addWatchTime(username: string, minutes: number = 1): Promise<UserPoints | null> {
  const u = await dbAddWatchTime(username, minutes);
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  };
}

export async function addChatMessage(username: string): Promise<UserPoints | null> {
  const u = await dbAddChatMessage(username);
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  };
}

export async function getLeaderboard(): Promise<UserPoints[]> {
  const list = await dbGetLeaderboard();
  return list.map((u) => ({
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  }));
}
