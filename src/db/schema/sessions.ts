import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { createId } from "@/app/lib/utils/id";

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type CreateSession = typeof sessions.$inferInsert;
