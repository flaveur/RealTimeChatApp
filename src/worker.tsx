import { eq } from "drizzle-orm";
import { createDB } from "./db/client";
import { users } from "./db/schema";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const db = createDB(env);

  // Håndter kun API-ruter her. La andre forespørsler falle gjennom til dev-serveren
  // eller statisk fil-håndterer, slik at appens HTML/CSS/JS serveres av Vite i utvikling.
    if (!url.pathname.startsWith("/api/")) {
      return fetch(request);
    }

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
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        await db.insert(users).values({
          id: id || crypto.randomUUID(),
          username,
          email,
          password,
          status: status || "offline",
        });

        return new Response(JSON.stringify({ message: "User added successfully" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Database error", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

  // Register-endepunkt brukt av frontend (POST /api/register)
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          username?: string;
          email?: string;
          password?: string;
        };

        const { username, email, password } = body;
        if (!username || !email || !password) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

  // Sjekk om brukernavn eller e-post allerede finnes
        const existingByUsername = await db.select().from(users).where(eq(users.username, username)).all();
        if (existingByUsername.length > 0) {
          return new Response(JSON.stringify({ error: "Username already taken" }), { status: 409, headers: { "Content-Type": "application/json" } });
        }
        const existingByEmail = await db.select().from(users).where(eq(users.email, email)).all();
        if (existingByEmail.length > 0) {
          return new Response(JSON.stringify({ error: "Email already registered" }), { status: 409, headers: { "Content-Type": "application/json" } });
        }

  // Hash passordet (SHA-256) før lagring
        const encoder = new TextEncoder();
        const pwBuffer = encoder.encode(password);
        const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
        const hashArray = Array.from(new Uint8Array(digest));
        const hashed = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        const id = crypto.randomUUID();
        await db.insert(users).values({ id, username, email, password: hashed, status: "offline" });

        return new Response(JSON.stringify({ message: "User registered" }), { status: 201, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Registration failed", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Hent alle brukere (GET /api/test-db)
    if (url.pathname === "/api/test-db" && request.method === "GET") {
      try {
        const allUsers = await db.select().from(users).all();
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
          return new Response(JSON.stringify({ error: "Missing user id" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

  await db.delete(users).where(eq(users.id, id));

        return new Response(JSON.stringify({ message: "User deleted successfully" }), { headers: { "Content-Type": "application/json" } });
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
