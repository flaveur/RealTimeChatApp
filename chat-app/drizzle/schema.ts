/**
 * Database-skjema definert med Drizzle ORM
 * 
 * Drizzle er en TypeScript-first ORM som gir typesikkerhet
 * for databaseoperasjoner. Skjemaet definerer alle tabeller
 * og deres kolonner med typer og constraints.
 * 
 * Kilde: Drizzle ORM dokumentasjon
 * https://orm.drizzle.team/docs/sql-schema-declaration
 * Denne koden er skrevet med hjelp fra AI (GitHub Copilot / Claude / ChatGPT / Qwen).
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/* ================================
   USERS TABLE
   Lagrer brukerkontoer med profil og status
   ================================ */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),                  // Auto-increment primærnøkkel
  username: text('username').notNull().unique(),   // Unikt brukernavn for innlogging
  displayName: text('display_name'),               // Valgfritt visningsnavn
  password: text('password'),                      // Hashet passord (bcrypt)
  status: text('status').default('offline'),       // Online-status: "online", "busy", "away", "offline"
  statusText: text('status_text'),                 // Egendefinert statusmelding
  avatarUrl: text('avatar_url'),                   // URL til profilbilde i R2
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   SESSIONS TABLE
   Håndterer brukersesjoner for autentisering
   ================================ */
export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(),               // Unik sesjonstoken (UUID)
  userId: text('user_id').notNull(),               // Referanse til bruker
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'),                   // Utløpstidspunkt for sesjonen
});

/* ================================
   MESSAGES TABLE
   Lagrer meldinger mellom brukere
   ================================ */
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id),   // Avsender
  receiverId: integer('receiver_id').notNull().references(() => users.id), // Mottaker
  content: text('content').notNull(),              // Meldingsinnhold
  readAt: text('read_at'),                         // Tidspunkt for lesing (null = ulest)
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   FRIENDSHIPS TABLE
   Representerer etablerte vennskap (toveis relasjon)
   ================================ */
export const friendships = sqliteTable('friendships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

/* ================================
   FRIEND REQUESTS TABLE
   Håndterer ventende venneforespørsler
   ================================ */
export const friendRequests = sqliteTable('friend_requests', {
  id: text('id').primaryKey(),  // UUID som text for unikhet
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // "pending", "accepted", "rejected"
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

/* ================================
   NOTES TABLE
   Personlige notater for hver bruker
   ================================ */
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),                     // UUID som primærnøkkel
  userId: text('user_id').notNull(),               // Eier av notatet
  title: text('title').notNull(),                  // Tittel på notatet
  content: text('content'),                        // Valgfritt innhold
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

/* ================================
   USER SETTINGS TABLE
   Lagrer brukerpreferanser som tema og språk
   ================================ */
export const userSettings = sqliteTable('user_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  theme: text('theme').default('dark'),            // 'light', 'dark', eller 'system'
  language: text('language').default('no'),        // Språkkode (no = norsk)
  notifications: integer('notifications').default(1), // 1 = på, 0 = av
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// TypeScript types eksportert for bruk i resten av applikasjonen
export type User = typeof users;
export type Message = typeof messages;
export type Friendship = typeof friendships;
export type FriendRequest = typeof friendRequests;
export type Note = typeof notes;
export type UserSettings = typeof userSettings;