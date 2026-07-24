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

export function getUserPoints(username: string): UserPoints | null {
  const u = getUser(username);
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

export function saveUserPoints(user: { id: string; username: string; profilePic?: string; slug?: string }) {
  const u = saveUser(user);
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

export function addWatchTime(username: string, minutes: number = 1) {
  const u = dbAddWatchTime(username, minutes);
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

export function addChatMessage(username: string) {
  const u = dbAddChatMessage(username);
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

export function getLeaderboard(): UserPoints[] {
  return dbGetLeaderboard().map((u) => ({
    id: u.id,
    username: u.username,
    profilePic: u.profilePic,
    points: u.points,
    watchTimeMinutes: u.watchTimeMinutes,
    chatMessagesCount: u.chatMessagesCount,
    lastUpdated: u.lastUpdated,
  }));
}
