import { Document } from "@/app/Document";
import FriendList from "@/app/pages/FriendList";
import Login from "@/app/pages/Login";
import Messages from "@/app/pages/Messages";
import NotesPage from "@/app/pages/NotesPage";
import Register from "@/app/pages/Register";
import Settings from "@/app/pages/Settings";

import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { z } from "zod";
import { setCommonHeaders } from "./app/headers";

// Drizzle import
import { createDB } from "./db/client";
import { messages, users } from "./db/schema";

// Typene
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
    if (path.startsWith("/api")) return; // Tillat API-ruter uten redirect
    if (path === "/login" || path === "/register") return;
    if (!ctx.user) {
      return new Response(null, { status: 302, headers: { Location: "/login" } });
    }
  };
}

// API-endepunkter for D1 + Drizzle
async function apiHandler(request: Request, env: Env) {
  const url = new URL(request.url);
  const db = createDB(env);

  // GET /api/users,  hent brukere
  if (url.pathname === "/api/users" && request.method === "GET") {
    const allUsers = await db.select().from(users);
    return Response.json(allUsers);
  }

  // POST /api/messages, lagre melding
  if (url.pathname === "/api/messages" && request.method === "POST") {
    const MessageInput = z.object({
      senderId: z.string().min(1),
      receiverId: z.string().min(1),
      content: z.string().min(1),
    });

    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
    }

    const parsed = MessageInput.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { senderId, receiverId, content } = parsed.data;
    await db.insert(messages).values({ senderId, receiverId, content });
    return new Response("Message saved ✅");
  }

  return new Response("Not found", { status: 404 });
}

export default defineApp([
  setCommonHeaders(),
  loadUserMiddleware(),
  requireAuthMiddleware(),
  // API handler
  async (args: any) => {
    const { request, env } = args;
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return apiHandler(request, env);
    }
  },
  // frontend rendering
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
