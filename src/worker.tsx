import { createDB } from "./db/client";
import { users } from "./db/schema";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const db = createDB(env);

    // Legg til bruker (POST /api/add-user)
    if (url.pathname === "/api/add-user" && request.method === "POST") {
      try {
        type UserPayload = {
          id?: string;
          username?: string;
          email?: string;
          password?: string;
          status?: string;
        };

        const body = (await request.json()) as UserPayload;
        const { id, username, email, password, status } = body;

        if (!username || !email || !password) {
          return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        await db.insert(users).values({
          id: id || crypto.randomUUID(),
          username,
          email,
          password,
          status: status || "offline",
        });

        return Response.json({ message: "✅ User added successfully!" });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Database error", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Hent alle brukere (GET /api/test-db)
    if (url.pathname === "/api/test-db" && request.method === "GET") {
      try {
        const allUsers = await db.select().from(users);
        return new Response(JSON.stringify(allUsers, null, 2), {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Database error", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Slett bruker (DELETE /api/delete-user?id=...)
    if (url.pathname === "/api/delete-user" && request.method === "DELETE") {
      try {
        const id = url.searchParams.get("id");
        if (!id) {
          return Response.json({ error: "Missing user id" }, { status: 400 });
        }

        await db.delete(users).where({ id });

        return Response.json({ message: "✅ User deleted successfully!" });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Database error", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Standard svar
    return new Response("✅ Worker running!", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
