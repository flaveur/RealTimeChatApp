import { getDb } from '../../lib/db.server';
import { messages } from '../../../drizzle/schema';

export async function listMessages(env: any) {
  const db = getDb(env.chat_appd1);
  // return all messages
  const rows = await db.select().from(messages).all();
  return rows;
}

export async function createMessage(env: any, payload: { userId: number; body: string }) {
  const db = getDb(env.chat_appd1);
  const res = await db.insert(messages).values({ userId: payload.userId, body: payload.body });
  return res;
}
