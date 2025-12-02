import bcrypt from 'bcryptjs';
import { getDb } from '../../lib/db.server';
import { users } from '../../../drizzle/schema';
import { sessions } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface Env {
  chat_appd1: D1Database;
}

interface RegisterPayload {
  username: string;
  password: string;
  displayName?: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface UserRow {
  id: number;
  username: string;
  displayName: string | null;
  password: string | null;
  createdAt: string | null;
}

export async function registerUser(env: Env, payload: RegisterPayload) {
  const db = getDb(env.chat_appd1); // Hent database instans

  // Sjekk om brukernavnet allerede finnes
  const existing = await db.select().from(users).where(eq(users.username, payload.username));
  
  if (existing.length > 0) {
    throw new Error('username_taken');
  }

  // Hash passordet før lagring
  const hash = await bcrypt.hash(payload.password, 10);
  
  // Sett inn ny bruker i databasen
  const res = await db.insert(users).values({
    username: payload.username,
    displayName: payload.displayName || null,
    password: hash,
  });

  return res;
}

export async function loginUser(env: Env, payload: LoginPayload) {
  const db = getDb(env.chat_appd1);
  
  // Hent bruker basert på brukernavn
  const rows = await db.select().from(users).where(eq(users.username, payload.username));
  const user = rows[0] as UserRow | undefined;

  if (!user) {
    return null; // Bruker ikke funnet
  }

  // Sjekk om passordet stemmer
  const ok = await bcrypt.compare(payload.password, user.password || '');
  
  if (!ok) {
    return null; // Feil passord
  }

  // Opprett ny session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dager
  
  await db.insert(sessions).values({
    token: sessionToken,
    userId: String(user.id),
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt,
  });

  // Returner brukerdata uten passord + session token
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    sessionToken,
  };
}