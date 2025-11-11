import { drizzle } from "drizzle-orm/d1";

/*
 Oppretter en Drizzle databaseinstans fra Cloudflare D1.
 
  @param env miljøobjekt fra Worker (inneholder env.DB)
  @returns drizzle-tilkobling til databasen
 */
export function createDB(env: { DB: D1Database }) {
  if (!env.DB) {
    throw new Error("⚠️ D1-database mangler i miljøet (env.DB)");
  }

  return drizzle(env.DB);
}
