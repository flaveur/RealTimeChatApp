import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';

// Return a Drizzle client for a given D1 binding (env.DB)
export function getDb(d1: D1Database) {
  return drizzle(d1);
}

export type Db = ReturnType<typeof getDb>;
