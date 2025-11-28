import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
});
