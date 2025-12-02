import { eq } from "drizzle-orm";
import { sessions, users } from "../db/schema";

export async function authenticateUser(request: Request, db: any): Promise<{ userId: string } | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
  if (!s || s.length === 0) return null;

  const sess = s[0] as any;
  return { userId: sess.userId ?? sess.user_id };
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const pwBuffer = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getUserData(db: any, userId: string) {
  const u = await db.select().from(users).where(eq(users.id, userId)).all();
  if (!u || u.length === 0) return null;
  const user = u[0] as any;
  return {
    id: user.id,
    username: user.username,
    name: user.username,
    avatarUrl: user.avatar_url ?? user.avatarUrl,
    status: user.status ?? "offline",
  };
}