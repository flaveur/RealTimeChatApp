/**
 * Auth Controller - Forretningslogikk for autentisering
 * 
 * Denne filen inneholder kjernelogikken for brukerregistrering
 * og innlogging. Adskilt fra HTTP-håndtering (authHandler.ts)
 * for bedre separasjon av ansvar.
 * 
 * Sikkerhet:
 * - Passord hashes med bcrypt (10 salt rounds)
 * - Sessions lagres i database med UUID tokens
 * - Session-tokens utløper etter 7 dager
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

import bcrypt from 'bcryptjs';
import { getDb } from '../../lib/db.server';
import { users } from '../../../drizzle/schema';
import { sessions } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Miljøvariabler som inneholder database-binding
 */
interface Env {
  chat_appd1: D1Database;
}

/**
 * Payload for brukerregistrering
 */
interface RegisterPayload {
  username: string;
  password: string;
  displayName?: string;
}

/**
 * Payload for innlogging
 */
interface LoginPayload {
  username: string;
  password: string;
}

/**
 * Brukerrad fra databasen
 * Brukes for å type-caste resultater fra Drizzle
 */
interface UserRow {
  id: number;
  username: string;
  displayName: string | null;
  password: string | null;
  createdAt: string | null;
}

/**
 * Registrerer en ny bruker i systemet
 * 
 * Prosessen:
 * 1. Sjekk om brukernavn allerede er tatt
 * 2. Hash passordet med bcrypt (10 salt rounds)
 * 3. Sett inn ny bruker i databasen
 * 
 * @param env - Miljøvariabler med database-binding
 * @param payload - Brukerdata (username, password, displayName?)
 * @returns Database insert-resultat
 * @throws Error('username_taken') hvis brukernavn er opptatt
 */
export async function registerUser(env: Env, payload: RegisterPayload) {
  const db = getDb(env.chat_appd1); // Hent database instans

  // Sjekk om brukernavnet allerede finnes
  const existing = await db.select().from(users).where(eq(users.username, payload.username));
  
  if (existing.length > 0) {
    throw new Error('username_taken');
  }

  // Hash passordet før lagring
  // 10 = antall salt rounds (standard anbefaling)
  const hash = await bcrypt.hash(payload.password, 10);
  
  // Sett inn ny bruker i databasen
  const res = await db.insert(users).values({
    username: payload.username,
    displayName: payload.displayName || null,
    password: hash,
  });

  return res;
}

/**
 * Logger inn en eksisterende bruker
 * 
 * Prosessen:
 * 1. Finn bruker basert på brukernavn
 * 2. Verifiser passord med bcrypt.compare
 * 3. Opprett ny session med UUID token
 * 4. Returner brukerdata + session token
 * 
 * @param env - Miljøvariabler med database-binding
 * @param payload - Innloggingsdata (username, password)
 * @returns Brukerobjekt med sessionToken, eller null ved feil
 */
export async function loginUser(env: Env, payload: LoginPayload) {
  const db = getDb(env.chat_appd1);
  
  // Hent bruker basert på brukernavn
  const rows = await db.select().from(users).where(eq(users.username, payload.username));
  const user = rows[0] as UserRow | undefined;

  if (!user) {
    return null; // Bruker ikke funnet
  }

  // Sjekk om passordet stemmer
  // bcrypt.compare sammenligner klartekst med hash
  const ok = await bcrypt.compare(payload.password, user.password || '');
  
  if (!ok) {
    return null; // Feil passord
  }

  // Opprett ny session med unik UUID token
  const sessionToken = crypto.randomUUID();
  
  // Session utløper etter 7 dager
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Lagre session i databasen
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