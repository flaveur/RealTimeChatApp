// src/db/seed.ts
import { users } from "./schema";
import { setupDb } from ".";
import { hashPassword } from "@/app/lib/auth/password";

export async function runSeed(d1: D1Database) {
  const db = setupDb(d1);
  await db.delete(users);

  const passwordHash = await hashPassword("test123456");

  await db.insert(users).values({
    username: "test",
    email: "test@testuser.io",
    passwordHash,
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const result = await db.select().from(users).all();

  console.log("🌱 Ferdig med seeding");

  return result;
}
