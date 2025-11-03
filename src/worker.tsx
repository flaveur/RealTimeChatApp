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
import { messages, users, sessions } from "./db/schema";
import { eq } from "drizzle-orm";

// Typene
export interface Env {
  DB: D1Database;
}

export type AppContext = {
  user: { id: string; username: string } | undefined;
};

// ===== Helpers: cookies =====
type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  path?: string;
  maxAge?: number; // seconds
};

function getCookie(header: string, name: string): string | undefined {
  const parts = header.split(/;\s*/);
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (decodeURIComponent(k) === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function setCookie(name: string, value: string, opts: CookieOptions = {}): string {
  const segments = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    opts.path ? `Path=${opts.path}` : undefined,
    typeof opts.maxAge === "number" ? `Max-Age=${opts.maxAge}` : undefined,
    opts.sameSite ? `SameSite=${opts.sameSite}` : undefined,
    opts.secure ? "Secure" : undefined,
    opts.httpOnly ? "HttpOnly" : undefined,
  ].filter(Boolean) as string[];
  return segments.join("; ");
}

function deleteCookie(name: string, opts: CookieOptions = {}): string {
  return setCookie(name, "", { ...opts, maxAge: 0 });
}

// ===== Helpers: password hashing (SHA-256 + salt) =====
function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = toHex(saltBytes);
  const hash = await sha256Hex(`${salt}:${password}`);
  return { salt, hash };
}

async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const calc = await sha256Hex(`${salt}:${password}`);
  return calc === hash;
}

function loadUserMiddleware() {
  return async ({ ctx, request, env }: any) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = getCookie(cookieHeader, "authToken");
    ctx.user = undefined;

    if (!token) return;
    try {
      const db = createDB(env);
      const [sess] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      if (!sess) return;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, (sess as any).userId))
        .limit(1);
      if (user) {
        ctx.user = { id: (user as any).id, username: (user as any).username };
      }
    } catch (e) {
      // swallow and keep unauthenticated
    }
  };
}

function requireAuthMiddleware() {
  return async ({ ctx, request }: any) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const isApi = path.startsWith("/api");
    const isAuthApi = path === "/api/login" || path === "/api/register";

    // For API: krever auth bortsett fra login/register
    if (isApi) {
      if (!ctx.user && !isAuthApi) {
        return new Response("Unauthorized", { status: 401 });
      }
      return;
    }

    // For pages: la /login og /register være åpne
    if (path === "/login" || path === "/register") return;
    if (!ctx.user) {
      return new Response(null, { status: 302, headers: { Location: "/login" } });
    }
  };
}

// API-endepunkter for D1 + Drizzle
async function apiHandler(request: Request, env: Env, ctx: AppContext) {
  const url = new URL(request.url);
  const db = createDB(env);

  // GET /api/users,  hent brukere
  if (url.pathname === "/api/users" && request.method === "GET") {
    if (!ctx.user) return new Response("Unauthorized", { status: 401 });
    const allUsers = await db.select().from(users);
    return Response.json(allUsers);
  }

  // POST /api/messages, lagre melding
  if (url.pathname === "/api/messages" && request.method === "POST") {
    if (!ctx.user) return new Response("Unauthorized", { status: 401 });
    const MessageInput = z.object({
      // senderId ignoreres; vi bruker ctx.user.id
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

    const { receiverId, content } = parsed.data;
    await db.insert(messages).values({ senderId: ctx.user!.id, receiverId, content });
    return new Response("Message saved ✅");
  }

  // POST /api/register: registrer ny bruker
  if (url.pathname === "/api/register" && request.method === "POST") {
    const RegisterInput = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(4),
    });
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
    }
    const parsed = RegisterInput.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { username, email, password } = parsed.data;

    // sjekk om finnes
    const exists = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (exists.length) {
      return Response.json({ error: "Username already taken" }, { status: 409 });
    }
    const existsEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existsEmail.length) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const { salt, hash } = await hashPassword(password);
    const userId = crypto.randomUUID();
    await db.insert(users).values({ id: userId, username, email, password: `${salt}:${hash}`, status: "offline" });

    // opprett session
    const token = crypto.randomUUID();
    await db.insert(sessions).values({ id: crypto.randomUUID(), userId, token });
    const headers = new Headers({ "Set-Cookie": setCookie("authToken", token, { httpOnly: true, sameSite: "Lax", path: "/" }) });
    return new Response("Registered ✅", { status: 201, headers });
  }

  // POST /api/login
  if (url.pathname === "/api/login" && request.method === "POST") {
    const LoginInput = z.object({
      username: z.string().min(3),
      password: z.string().min(4),
    });
    let body: unknown = null;
    try { body = await request.json(); } catch { return Response.json({ error: "Body must be valid JSON" }, { status: 400 }); }
    const parsed = LoginInput.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const { username, password } = parsed.data;

    const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = rows[0] as any;
    if (!user) return new Response("Invalid credentials", { status: 401 });
    const [salt, storedHash] = String(user.password).split(":");
    const ok = await verifyPassword(password, salt, storedHash);
    if (!ok) return new Response("Invalid credentials", { status: 401 });

    const token = crypto.randomUUID();
    await db.insert(sessions).values({ id: crypto.randomUUID(), userId: user.id, token });
    const headers = new Headers({ "Set-Cookie": setCookie("authToken", token, { httpOnly: true, sameSite: "Lax", path: "/" }) });
    return new Response("Logged in ✅", { status: 200, headers });
  }

  // POST /api/logout
  if (url.pathname === "/api/logout" && request.method === "POST") {
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = getCookie(cookieHeader, "authToken");
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    const headers = new Headers({ "Set-Cookie": deleteCookie("authToken", { path: "/" }) });
    return new Response("Logged out ✅", { status: 200, headers });
  }

  return new Response("Not found", { status: 404 });
}

export default defineApp([
  setCommonHeaders(),
  loadUserMiddleware(),
  requireAuthMiddleware(),
  // API handler
  async (args: any) => {
    const { request, env, ctx } = args;
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return apiHandler(request, env, ctx);
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
