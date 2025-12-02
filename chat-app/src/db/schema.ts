// Database schema definition
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
   SESSIONS TABLE
   ================================ */
export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  expiresAt: text("expires_at"),
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
   FRIEND REQUESTS TABLE
   ================================ */
export const friendRequests = sqliteTable("friend_requests", {
  id: text("id").primaryKey(),                     // UUID
  senderId: text("sender_id").notNull(),           // Hvem som sender forespørselen
  receiverId: text("receiver_id").notNull(),       // Hvem som mottar forespørselen
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected"
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
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

/* ================================
   USER SETTINGS TABLE
   ================================ */
export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").primaryKey(),
  theme: text("theme").default("dark"),            // "dark" / "light"
  language: text("language").default("no"),        // "no" / "en"
  notifications: integer("notifications").default(1), // 0 = off, 1 = on
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});