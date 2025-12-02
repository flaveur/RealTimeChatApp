// Database schema definition
import { drizzle } from 'drizzle-orm';
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/* ================================
   USERS TABLE
   ================================ */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),                     // UUID generert i Worker
  email: text("email").notNull().unique(),         // Unik e-post
  displayName: text("display_name"),              // Visningsnavn
  passwordHash: text("password_hash").notNull(),  // Hashet passord
  status: text("status").default("offline"),       // "online" / "offline"
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/* ================================
   CONVERSATIONS TABLE
   ================================ */
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),                     // UUID
  title: text("title"),
  isGroup: integer("is_group").default(0),         // 0 = privat, 1 = gruppe
  createdBy: text("created_by").notNull(),         // Hvem som opprettet
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/* ================================
   CONVERSATION PARTICIPANTS TABLE
   ================================ */
export const conversationParticipants = sqliteTable("conversation_participants", {
  conversationId: text("conversation_id").notNull(),
  userId: text("user_id").notNull(),
  isAdmin: integer("is_admin").default(0),          // 0 = ikke admin, 1 = admin
  joinedAt: text("joined_at").default("CURRENT_TIMESTAMP"),
});

/* ================================
   MESSAGES TABLE
   ================================ */
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),                     // UUID
  conversationId: text("conversation_id").notNull(),
  senderId: text("sender_id").notNull(),           // Hvem som sendte
  body: text("body").notNull(),                   // Meldingsinnhold
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  editedAt: text("edited_at"),                     // hvis meldingen er redigert
});

/* ================================
   FRIENDSHIPS TABLE
   ================================ */
export const friendships = sqliteTable("friendships", {
  userId: text("user_id").notNull(),
  friendId: text("friend_id").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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

export const schema = drizzle({
  // Define your tables and columns here
});