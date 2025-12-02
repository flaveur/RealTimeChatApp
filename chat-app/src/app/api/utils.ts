/**
 * API Hjelpefunksjoner
 * 
 * Denne filen inneholder felles hjelpefunksjoner som brukes på tvers av
 * alle API-endepunkter. Inkluderer autentisering, passord-hashing og
 * brukerdata-henting.
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

import { eq } from "drizzle-orm";
import { sessions, users } from "../../../drizzle/schema";

/**
 * Autentiserer en bruker basert på session-cookie
 * 
 * Prosessen:
 * 1. Henter "session" cookie fra request headers
 * 2. Bruker regex for å parse cookie-verdien
 * 3. Slår opp token i sessions-tabellen i databasen
 * 4. Returnerer userId hvis gyldig, ellers null
 * 
 * @param request - HTTP request objektet
 * @param db - Drizzle database instans
 * @returns userId objekt eller null hvis ikke autentisert
 */
export async function authenticateUser(request: Request, db: any): Promise<{ userId: number } | null> {
  // Hent cookie header, eller tom streng hvis ikke finnes
  const cookie = request.headers.get("cookie") || "";
  
  // Regex for å finne session token i cookie-strengen
  // Matcher enten start av string eller semikolon, deretter "session=verdi"
  const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  // Slå opp session i databasen
  const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
  if (!s || s.length === 0) return null;

  // Håndterer både camelCase og snake_case kolonnenavn
  // (Drizzle kan returnere begge avhengig av konfigurasjon)
  const sess = s[0] as any;
  const userId = parseInt(sess.userId ?? sess.user_id, 10);
  if (isNaN(userId)) return null;
  
  return { userId };
}

/**
 * Hasher et passord med SHA-256
 * 
 * Bruker Web Crypto API (crypto.subtle) som er tilgjengelig i
 * Cloudflare Workers. Konverterer digest til hexadecimal streng.
 * 
 * MERK: I produksjon bør man vurdere bcrypt eller Argon2 for
 * bedre sikkerhet mot brute-force angrep.
 * 
 * @param password - Klartekst passord
 * @returns SHA-256 hash som hexadecimal streng
 */
export async function hashPassword(password: string): Promise<string> {
  // Konverter passord til bytes (UTF-8)
  const encoder = new TextEncoder();
  const pwBuffer = encoder.encode(password);
  
  // Beregn SHA-256 hash
  const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
  
  // Konverter til hex-streng (f.eks. "a3f2b1..." )
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Henter brukerdata fra databasen
 * 
 * Returnerer et normalisert brukerobjekt med konsistente
 * feltnavn, uavhengig av database-kolonnenes format.
 * 
 * @param db - Drizzle database instans
 * @param userId - Brukerens ID
 * @returns Brukerobjekt eller null hvis ikke funnet
 */
export async function getUserData(db: any, userId: number) {
  const u = await db.select().from(users).where(eq(users.id, userId)).all();
  if (!u || u.length === 0) return null;
  
  const user = u[0] as any;
  
  // Normaliserer feltnavn (håndterer både camelCase og snake_case)
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name ?? user.displayName,
    name: user.display_name ?? user.displayName ?? user.username,
    avatarUrl: user.avatar_url ?? user.avatarUrl,
    status: user.status ?? "offline",
  };
}