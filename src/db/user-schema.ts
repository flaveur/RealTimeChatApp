// src/db/schema/user-schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Basic users table definition compatible with Drizzle's sqlite-core API
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export type User = typeof users.$inferSelect;