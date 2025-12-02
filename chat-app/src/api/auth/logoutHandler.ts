import { getEnv } from '../../lib/env';
import { getDb } from '../../lib/db.server';
import { eq } from 'drizzle-orm';
import { sessions } from '../../../drizzle/schema';

export async function logoutHandler(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();

  if (request?.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Hent session token fra cookie
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
    const token = match ? match[1] : null;

    if (token) {
      // Slett session fra databasen
      const db = getDb(env.chat_appd1);
      await db.delete(sessions).where(eq(sessions.token, token)).run();
    }

    // Returner respons med cleared cookie
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
