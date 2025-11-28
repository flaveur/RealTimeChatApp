import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),

  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date()
  ),
});

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type UserRole = "admin" | "user";
export type SafeUser = Pick<
  User,
  | "id"
  | "username"
  | "email"
  | "role"
  | "isActive"
  | "lastLoginAt"
  | "createdAt"
  | "updatedAt"
>;
