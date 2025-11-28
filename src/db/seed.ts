import { users } from "./schema";
import { getDb, setupDb } from ".";
import { hashPassword } from "@/app/lib/auth/password";

export async function seedDatabase(env: Env) {
  try {
    await setupDb(env.DB);
    const db = await getDb();
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

    console.log("Seed success");
    return { success: true };
  } catch (error) {
    console.error("SEED ERROR:", error);
    return { success: false, error: "Failed to seed database" };
  }
}
