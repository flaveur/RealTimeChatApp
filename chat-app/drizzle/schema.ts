import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/* ================================
   USERS TABLE
   ================================ */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  password: text('password'),
  status: text('status').default('offline'),       // "online", "busy", "away", "offline"
  statusText: text('status_text'),                 // Custom status text like "Hva driver du med?"
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   SESSIONS TABLE
   ================================ */
export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'),
});

/* ================================
   MESSAGES TABLE
   ================================ */
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  readAt: text('read_at'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   FRIENDSHIPS TABLE
   ================================ */
export const friendships = sqliteTable('friendships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   FRIEND REQUESTS TABLE
   ================================ */
export const friendRequests = sqliteTable('friend_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // "pending", "accepted", "rejected"
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

/* ================================
   NOTES TABLE
   ================================ */
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

/* ================================
   USER SETTINGS TABLE
   ================================ */
export const userSettings = sqliteTable('user_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  theme: text('theme').default('dark'),
  language: text('language').default('no'),
  notifications: integer('notifications').default(1),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export type User = typeof users;
export type Message = typeof messages;
export type Friendship = typeof friendships;
export type FriendRequest = typeof friendRequests;
export type Note = typeof notes;
export type UserSettings = typeof userSettings;