import { drizzle } from 'drizzle-orm/d1';

// Hjelpefunksjon for å få databaseinstansen
export function getDb(d1: D1Database) {
  return drizzle(d1);
}

export type Db = ReturnType<typeof getDb>;