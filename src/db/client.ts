import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const createDB = (env: Env) => {
  // Cloudflare binder D1-instansen til env.DB via wrangler.toml
  return drizzle(env.DB, { schema });
};

// Typen Env sørger for at TypeScript vet at DB finnes
export interface Env {
  DB: D1Database;
}
