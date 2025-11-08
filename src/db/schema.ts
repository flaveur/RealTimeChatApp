import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/* ================================
   USERS TABLE
   ================================ */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),                     // UUID generert i Worker
  username: text("username").notNull().unique(),   // Unikt brukernavn
  email: text("email").notNull().unique(),         // Unik e-post
  password: text("password").notNull(),            // Hashet passord
  status: text("status").default("offline"),       // "online" / "offline"
  bio: text("bio"),                                // Kort beskrivelse (valgfritt)
  avatarUrl: text("avatar_url"),                   // Lenke til profilbilde (valgfritt)
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/* ================================
   MESSAGES TABLE
   ================================ */
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),                     // UUID
  senderId: text("sender_id").notNull(),           // Hvem som sendte
  receiverId: text("receiver_id").notNull(),       // Hvem som mottok (privat melding)
  content: text("content").notNull(),              // Meldingsinnhold
  chatId: text("chat_id"),                         // (valgfritt) for gruppekontroll
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  editedAt: text("edited_at"),                     // hvis meldingen er redigert
});

/* ================================
   FRIENDS TABLE
   ================================ */
export const friends = sqliteTable("friends", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),               // Hovedbrukeren
  friendId: text("friend_id").notNull(),           // Den andre brukeren
  status: text("status").default("pending"),       // pending / accepted / blocked
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/* ================================
   SESSIONS TABLE
   ================================ */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at"),                // tidspunkt (UNIX-timestamp)
});

/* ================================
   NOTES TABLE
   ================================ */
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
});


