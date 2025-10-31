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
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).default(Date.now()),
});
