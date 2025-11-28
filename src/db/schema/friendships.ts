import {
  sqliteTable,
  int,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const friendships = sqliteTable(
  "friendships",
  {
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    friendId: int("friend_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    status: text("status", {
      enum: ["pending", "accepted", "blocked"],
    })
      .notNull()
      .default("pending"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.friendId] }),
  })
);

export type Friendship = typeof friendships.$inferSelect;
export type CreateFriendship = typeof friendships.$inferInsert;
export type FriendshipStatus = "pending" | "accepted" | "blocked";
