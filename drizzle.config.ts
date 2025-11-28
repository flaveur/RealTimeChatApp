import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "5af019aacbcddd891500ad12c0b6323d",
    databaseId: "933cc601-b52d-4886-be7d-27e49d68eb6a",
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
