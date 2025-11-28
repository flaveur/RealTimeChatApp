import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions } from "./sessions";
import { friendships } from "./friendships";
import { messages } from "./messages";

/* Users */

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  friendships: many(friendships, {
    relationName: "userFriendships",
  }),
  reverseFriendships: many(friendships, {
    relationName: "reverseUserFriendships",
  }),
  messagesSent: many(messages, { relationName: "messagesSent" }),
  messagesReceived: many(messages, { relationName: "messagesReceived" }),
}));

/* Sessions */

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/* Friendships */

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    relationName: "userFriendships",
    fields: [friendships.userId],
    references: [users.id],
  }),
  friend: one(users, {
    relationName: "reverseUserFriendships",
    fields: [friendships.friendId],
    references: [users.id],
  }),
}));

/* Messages */

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    relationName: "messagesSent",
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: "messagesReceived",
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));
