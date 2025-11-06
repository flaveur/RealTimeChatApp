import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Brukere-tabellen
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").default("offline"),
});

// Meldingstabellen
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), // ✅ fjernet default(sql...)
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Session-tabellen
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
});


// Vennskapstabell (kobler to brukere sammen)
export const friends = sqliteTable("friends", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  friendId: text("friend_id").notNull(),
});
