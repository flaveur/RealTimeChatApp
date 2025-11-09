import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Brukere
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").default("online"),
  note: text("note"),
});

// Meldinger
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sender_id: integer("sender_id").notNull(),
  receiver_id: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  // Use SQLite expression for milliseconds since epoch at insert time
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).default(sql`(unixepoch('now') * 1000)`),
});

// Notater
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull(),
  title: text("title").notNull().default("Ny note"),
  body: text("body").notNull().default(""),
  updated_at: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch('now') * 1000)`),
});

// Types
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Note = typeof notes.$inferSelect;