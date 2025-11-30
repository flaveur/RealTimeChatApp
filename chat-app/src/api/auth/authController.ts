import bcrypt from 'bcryptjs';
import { getDb } from '../../lib/db.server';
import { users } from '../../../drizzle/schema';

export async function registerUser(env: any, payload: { username: string; password: string; displayName?: string }) {
  const db = getDb(env.chat_appd1);

  // simple uniqueness check
  const existing = await db.select().from(users).all();
  if (existing.find((u: any) => u.username === payload.username)) {
    throw new Error('username_taken');
  }

  const hash = await bcrypt.hash(payload.password, 10);
  const res = await db.insert(users).values({ username: payload.username, displayName: payload.displayName || null, /* createdAt handled by DB */ password: hash } as any);
  return res;
}

export async function loginUser(env: any, payload: { username: string; password: string }) {
  const db = getDb(env.chat_appd1);
  const rows = await db.select().from(users).all();
  const user = rows.find((u: any) => u.username === payload.username);
  if (!user) return null;
  const ok = await bcrypt.compare(payload.password, user.password || '');
  if (!ok) return null;
  // return minimal user info
  return { id: user.id, username: user.username, displayName: user.display_name || user.displayName };
}
