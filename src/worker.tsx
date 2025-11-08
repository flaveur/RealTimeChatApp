import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createDB } from "./db/client";
import { users } from "./db/schema";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher; // 
  VERBOSE?: string;
}

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const db = createDB(env);
    const VERBOSE = env.VERBOSE === "true";

    // Ignorer Chrome sine devtools-requests
    if (url.pathname === "/favicon.ico" || url.pathname.startsWith("/.well-known")) {
      return new Response(null, { status: 204 });
    }

    /* =====================================
       1. API-ruter håndteres først
    ===================================== */
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const { username, email, password } = (await request.json()) as RegisterBody;

        if (!username || !email || !password) {
          return Response.json({ error: "Alle felt må fylles ut" }, { status: 400 });
        }

        const existingEmail = await db.select().from(users).where(eq(users.email, email)).all();
        if (existingEmail.length > 0) {
          return Response.json({ error: "E-post er allerede registrert" }, { status: 409 });
        }

        // Hash passordet
        const encoder = new TextEncoder();
        const pwBuffer = encoder.encode(password);
        const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
        const hashed = Array.from(new Uint8Array(digest))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        await db.insert(users).values({
          id: crypto.randomUUID(),
          username,
          email,
          password: hashed,
          status: "offline",
        });

        if (VERBOSE) console.log("✅ Ny bruker registrert:", username);
        return Response.json({ success: true }, { status: 201 });
      } catch (err) {
        console.error("Feil under registrering:", err);
        return Response.json(
          { error: "Serverfeil under registrering", details: String(err) },
          { status: 500 }
        );
      }
    }

    if (url.pathname === "/api/test-db" && request.method === "GET") {
      try {
        const allUsers = await db.select().from(users).all();
        return Response.json({ success: true, users: allUsers });
      } catch (err) {
        console.error("Feil i test-db:", err);
        return Response.json({ error: "Databasefeil", details: String(err) }, { status: 500 });
      }
    }

    if (url.pathname === "/api/delete-user" && request.method === "DELETE") {
      try {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Mangler bruker-ID" }, { status: 400 });
        await db.delete(users).where(eq(users.id, id));
        return Response.json({ success: true });
      } catch (err) {
        console.error("Feil under sletting:", err);
        return Response.json({ error: "Databasefeil", details: String(err) }, { status: 500 });
      }
    }

    /* =====================================
       2. Serve React-bygget fra "dist"
    ===================================== */
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;
    } catch (err) {
      console.error("ASSETS fetch error:", err);
    }

    // Fallback hvis ingenting matcher
    return new Response("✅ Worker kjører, men ingen rute matchet", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
