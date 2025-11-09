import { Document } from "@/app/Document";
import FriendList from "@/app/pages/FriendList";
import Login from "@/app/pages/Login";
import Messages from "@/app/pages/Messages";
import NotesPage from "@/app/pages/NotesPage";
import Register from "@/app/pages/Register";
import Settings from "@/app/pages/Settings";

import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { setCommonHeaders } from "./app/headers";

import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { notes } from "@/db/schema";

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  user: { id: string; username: string } | undefined;
};

function loadUserMiddleware() {
  return async ({ ctx, request }: any) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const hasAuthCookie = cookieHeader.includes("authToken=");
    ctx.user = hasAuthCookie ? { id: "mock-user-123", username: "testbruker" } : undefined;
  };
}

function requireAuthMiddleware() {
  return async ({ ctx, response, request }: any) => {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/login" || path === "/register") return;
    if (!ctx.user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  };
}

function apiNotesMiddleware() {
  return async ({ env, ctx, request }: any) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (!pathname.startsWith("/api/notes")) return;

    if (!ctx.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = drizzle(env.DB, { schema: { notes } });
    const userId = 1; // Mock user ID - i produksjon hent fra ctx.user
    const method = request.method;

    try {
      // GET /api/notes - Hent alle notater
      if (method === "GET" && pathname === "/api/notes") {
        const rows = await db
          .select()
          .from(notes)
          .where(eq(notes.user_id, userId))
          .orderBy(desc(notes.updated_at));
        return new Response(JSON.stringify(rows), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // POST /api/notes - Opprett nytt notat
      if (method === "POST" && pathname === "/api/notes") {
        const body = await request.json();
        await db.insert(notes).values({
          user_id: userId,
          title: body.title || "Ny note",
          body: body.body || "",
        });
        const [row] = await db
          .select()
          .from(notes)
          .where(eq(notes.user_id, userId))
          .orderBy(desc(notes.id))
          .limit(1);
        return new Response(JSON.stringify(row), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // PUT /api/notes/:id - Oppdater notat
      const putMatch = pathname.match(/^\/api\/notes\/(\d+)$/);
      if (method === "PUT" && putMatch) {
        const id = Number(putMatch[1]);
        const body = await request.json();
        await db
          .update(notes)
          .set({
            title: body.title,
            body: body.body,
            updated_at: Date.now(),
          })
          .where(eq(notes.id, id));
        const [row] = await db.select().from(notes).where(eq(notes.id, id));
        return new Response(JSON.stringify(row), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // DELETE /api/notes/:id - Slett notat
      const deleteMatch = pathname.match(/^\/api\/notes\/(\d+)$/);
      if (method === "DELETE" && deleteMatch) {
        const id = Number(deleteMatch[1]);
        await db.delete(notes).where(eq(notes.id, id));
        return new Response(null, { status: 204 });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("API Error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

export default defineApp([
  setCommonHeaders(),
  loadUserMiddleware(),
  apiNotesMiddleware(),
  requireAuthMiddleware(),
  render(Document, [
    route("/", Messages),
    route("/messages", Messages),
    route("/friendlist", FriendList),
    route("/notespage", NotesPage),
    route("/settings", Settings),
    route("/login", Login),
    route("/register", Register),
  ]),
]);