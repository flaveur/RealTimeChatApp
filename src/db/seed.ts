import { drizzle } from "drizzle-orm/d1";
import { defineScript } from "rwsdk/worker";
import { users } from ".";

export default defineScript(async ({ env }) => {
  try {
    const db = drizzle(env.DB);
    await db.delete(users);

    // Insert a user
    await db.insert(users).values({
      name: "Test user",
      email: "test@testuser.io",
    });

    // Verify the insert by selecting all users
    const result = await db.select().from(users).all();

    console.log("🌱 Finished seeding");

    return Response.json(result);
  } catch (error) {
    console.error("Error seeding database:", error);
    return Response.json({
      success: false,
      error: "Failed to seed database",
    });
  }
});