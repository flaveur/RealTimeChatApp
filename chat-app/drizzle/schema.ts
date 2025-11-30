import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull(),
  displayName: text('display_name'),
  password: text('password'),
  createdAt: text('created_at'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: text('created_at'),
});

export type User = typeof users;
export type Message = typeof messages;