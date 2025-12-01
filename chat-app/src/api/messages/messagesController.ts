import { getDb } from '../../lib/db.server';
import { messages } from '../../../drizzle/schema';

interface Env {
  chat_appd1: D1Database;
}

interface CreateMessagePayload {
  userId: number;
  body: string;
}

export async function listMessages(env: Env) {
  const db = getDb(env.chat_appd1); // Henter DB
  const rows = await db.select().from(messages); // Henter alle meldinger
  return rows;
}

export async function createMessage(env: Env, payload: CreateMessagePayload) {
  const db = getDb(env.chat_appd1);// Henter DB

  // Setter inn en ny melding
  const res = await db.insert(messages).values({
    userId: payload.userId,
    body: payload.body,
  });
  return res;
}