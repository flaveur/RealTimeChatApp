import { sqliteTable, int, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const messages = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),

  senderId: int("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: int("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  body: text("body").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  editedAt: integer("edited_at", { mode: "timestamp" }),
  readAt: integer("read_at", { mode: "timestamp" }),
});

export type Message = typeof messages.$inferSelect;
export type CreateMessage = typeof messages.$inferInsert;
