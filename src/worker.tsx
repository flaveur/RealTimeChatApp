import { eq, or, and } from "drizzle-orm";
import { createDB } from "./db/client";
import { sessions, users, friends } from "./db/schema";

// Henter bruker fra session
async function getUserFromSession(db: any, cookie: string) {
  const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
  if (!s || s.length === 0) return null;
  const sess = s[0] as any;

  const u = await db.select().from(users).where(eq(users.id, sess.userId ?? sess.user_id)).all();
  if (!u || u.length === 0) return null;
  return u[0] as any;
}

// ----------------------------------------------------------
// Environment-variabler
// ----------------------------------------------------------
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  R2?: R2Bucket; // R2 bucket for avatar
  VERBOSE?: string;
}

// Body for /api/register
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

    // Søker etter brukere
    if (url.pathname === "/api/users/search" && request.method === "GET") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const user = await getUserFromSession(db, cookie);
        if (!user) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const query = url.searchParams.get("q")?.trim().toLowerCase();
        if (!query) return Response.json({ users: [] });

        const allUsers = await db.select().from(users).all();
        const results = allUsers
          .filter((u: any) => {
            const username = (u.username || "").toLowerCase();
            return u.id !== user.id && username.includes(query);
          })
          .slice(0, 10)
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            name: u.username,
            avatarUrl: u.avatar_url ?? u.avatarUrl,
            status: u.status ?? "offline",
          }));

        return Response.json({ users: results });
      } catch (err) {
        console.error("/api/users/search error:", err);
        return Response.json({ error: "Søk feilet" }, { status: 500 });
      }
    }

    // Send venneforespørselen
    if (url.pathname === "/api/friends/request" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const user = await getUserFromSession(db, cookie);
        if (!user) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendId } = (await request.json()) as { friendId: string };
        if (!friendId) return Response.json({ error: "Mangler friendId" }, { status: 400 });
        if (friendId === user.id) return Response.json({ error: "Kan ikke legge til deg selv" }, { status: 400 });

        const existing = await db
          .select()
          .from(friends)
          .where(
            or(
              and(eq(friends.userId, user.id), eq(friends.friendId, friendId)),
              and(eq(friends.userId, friendId), eq(friends.friendId, user.id))
            )
          )
          .all();

        if (existing.length > 0) {
          return Response.json({ error: "Venneforespørsel eksisterer allerede" }, { status: 409 });
        }

        await db.insert(friends).values({
          id: crypto.randomUUID(),
          userId: user.id,
          friendId: friendId,
          status: "pending",
        });

        if (VERBOSE) console.log("Venneforespørsel sendt:", user.id, "->", friendId);
        return Response.json({ success: true });
      } catch (err) {
        console.error("/api/friends/request error:", err);
        return Response.json({ error: "Kunne ikke sende forespørsel" }, { status: 500 });
      }
    }

    // Aksepter venneforespørselen
    if (url.pathname === "/api/friends/accept" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const user = await getUserFromSession(db, cookie);
        if (!user) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendshipId } = (await request.json()) as { friendshipId: string };
        if (!friendshipId) return Response.json({ error: "Mangler friendshipId" }, { status: 400 });

        const friendship = await db.select().from(friends).where(eq(friends.id, friendshipId)).all();
        if (!friendship || friendship.length === 0) {
          return Response.json({ error: "Forespørsel ikke funnet" }, { status: 404 });
        }

        const f = friendship[0] as any;
        if (f.friendId !== user.id && f.friend_id !== user.id) {
          return Response.json({ error: "Ikke autorisert" }, { status: 403 });
        }

        await db.update(friends).set({ status: "accepted" }).where(eq(friends.id, friendshipId));

        if (VERBOSE) console.log("Venneforespørsel akseptert:", friendshipId);
        return Response.json({ success: true });
      } catch (err) {
        console.error("/api/friends/accept error:", err);
        return Response.json({ error: "Kunne ikke akseptere forespørsel" }, { status: 500 });
      }
    }

    // Fjerner venneforespørselen
    if (url.pathname === "/api/friends/remove" && request.method === "DELETE") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const user = await getUserFromSession(db, cookie);
        if (!user) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendshipId } = (await request.json()) as { friendshipId: string };
        if (!friendshipId) return Response.json({ error: "Mangler friendshipId" }, { status: 400 });

        await db.delete(friends).where(eq(friends.id, friendshipId));

        if (VERBOSE) console.log("Vennskap fjernet:", friendshipId);
        return Response.json({ success: true });
      } catch (err) {
        console.error("/api/friends/remove error:", err);
        return Response.json({ error: "Kunne ikke fjerne venn" }, { status: 500 });
      }
    }

    // Henter alle venner
    if (url.pathname === "/api/friends" && request.method === "GET") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const user = await getUserFromSession(db, cookie);
        if (!user) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const allFriendships = await db
          .select()
          .from(friends)
          .where(
            or(
              eq(friends.userId, user.id),
              eq(friends.friendId, user.id)
            )
          )
          .all();

        const allUsers = await db.select().from(users).all();
        const userMap = new Map(allUsers.map((u: any) => [u.id, u]));

        const result = allFriendships.map((f: any) => {
          const friendUserId = f.userId === user.id ? f.friendId : (f.friend_id === user.id ? f.user_id : f.userId);
          const friendUser = userMap.get(friendUserId) || userMap.get(f.friendId) || userMap.get(f.friend_id);
          
          return {
            id: f.id,
            userId: f.userId ?? f.user_id,
            friendId: f.friendId ?? f.friend_id,
            status: f.status,
            createdAt: f.createdAt ?? f.created_at,
            friend: friendUser ? {
              id: friendUser.id,
              username: friendUser.username,
              name: friendUser.username,
              avatarUrl: friendUser.avatar_url ?? friendUser.avatarUrl,
              status: friendUser.status ?? "offline",
            } : null,
          };
        });

        return Response.json({ friends: result });
      } catch (err) {
        console.error("/api/friends error:", err);
        return Response.json({ error: "Kunne ikke hente venner" }, { status: 500 });
      }
    }

    // Oppdater brukernavn (visningsnavn)
    if (url.pathname === "/api/me/name" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        // Valider session
        const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
        if (!s || s.length === 0) return Response.json({ error: "Ugyldig session" }, { status: 401 });
        const sess = s[0] as any;

        const { name } = (await request.json()) as { name?: string };
        const next = (name ?? "").trim();
        if (!next) return Response.json({ error: "Navn kan ikke være tomt" }, { status: 400 });
        if (next.length < 2) return Response.json({ error: "Navn må være minst 2 tegn" }, { status: 400 });

        // Sjekk at brukernavn ikke er tatt av andre
        const existing = await db.select().from(users).where(eq(users.username, next)).all();
        if (existing.some((u: any) => (u.id ?? u.ID) !== (sess.userId ?? sess.user_id))) {
          return Response.json({ error: "Brukernavnet er allerede tatt" }, { status: 409 });
        }

        await db.update(users).set({ username: next }).where(eq(users.id, sess.userId ?? sess.user_id));

        return Response.json({ success: true, name: next });
      } catch (err) {
        console.error("/api/me/name error:", err);
        return Response.json({ error: "Kunne ikke oppdatere navn", details: String(err) }, { status: 500 });
      }
    }

    // Last opp/oppdater avatar-bilde
    if (url.pathname === "/api/me/avatar" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        // Valider session
        const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
        if (!s || s.length === 0) return Response.json({ error: "Ugyldig session" }, { status: 401 });
        const sess = s[0] as any;

        const form = await request.formData();
        const file = form.get("avatar");
        if (!file || typeof file === "string") {
          return Response.json({ error: "Mangler avatar-fil" }, { status: 400 });
        }

        const ct = (file as File).type || "application/octet-stream";
        const size = (file as File).size || 0;
        if (size > 2 * 1024 * 1024) {
          return Response.json({ error: "Bildet er for stort (maks 2MB)" }, { status: 413 });
        }

        const userId = sess.userId ?? sess.user_id;
        const key = `avatars/${userId}`;

        if (env.R2) {
          // Last opp til R2 med riktig content-type
          await env.R2.put(key, (file as File).stream(), { httpMetadata: { contentType: ct } });
          const urlPath = `/api/avatar/${userId}?v=${Date.now()}`; // cache-busting
          await db.update(users).set({ avatarUrl: urlPath }).where(eq(users.id, userId));
          return Response.json({ success: true, avatarUrl: urlPath });
        } else {
          // Fallback: lagre som data-URL direkte i DB (kun dev-fallback)
          const arrayBuffer = await (file as File).arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${ct};base64,${base64}`;
          await db.update(users).set({ avatarUrl: dataUrl }).where(eq(users.id, userId));
          return Response.json({ success: true, avatarUrl: dataUrl });
        }
      } catch (err) {
        console.error("/api/me/avatar error:", err);
        return Response.json({ error: "Kunne ikke oppdatere avatar", details: String(err) }, { status: 500 });
      }
    }

    // Hent avatar fra R2
    if (url.pathname.startsWith("/api/avatar/") && request.method === "GET") {
      try {
        const userId = url.pathname.split("/api/avatar/")[1];
        if (!userId) return new Response("Not found", { status: 404 });
        if (!env.R2) return new Response("R2 ikke konfigurert", { status: 501 });
        const key = `avatars/${userId}`;
        const obj = await env.R2.get(key);
        if (!obj) return new Response("Not found", { status: 404 });
        const headers = new Headers();
        const ct = obj.httpMetadata?.contentType || "application/octet-stream";
        headers.set("Content-Type", ct);
        headers.set("Cache-Control", "public, max-age=3600");
        return new Response(obj.body, { status: 200, headers });
      } catch (err) {
        console.error("/api/avatar error:", err);
        return new Response("Internal error", { status: 500 });
      }
    }

    // ----------------------------------------------------------
    // 1. API-RUTER
    // ----------------------------------------------------------

    // Registrer ny bruker
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const { username, email, password } = (await request.json()) as RegisterBody;

        if (!username || !email || !password) {
          return Response.json({ error: "Alle felt må fylles ut" }, { status: 400 });
        }

        // Sjekk at e-posten ikke finnes
        const existingEmail = await db.select().from(users).where(eq(users.email, email)).all();
        if (existingEmail.length > 0) {
          return Response.json({ error: "E-post er allerede registrert" }, { status: 409 });
        }

        // Sjekk at brukernavn ikke finnes
        const existingUsername = await db.select().from(users).where(eq(users.username, username)).all();
        if (existingUsername.length > 0) {
          return Response.json({ error: "Brukernavnet er allerede tatt" }, { status: 409 });
        }

        // Hash passord med SHA-256
        const encoder = new TextEncoder();
        const pwBuffer = encoder.encode(password);
        const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
        const hashed = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Lagre ny bruker i databasen
        await db.insert(users).values({
          id: crypto.randomUUID(),
          username,
          email,
          password: hashed,
          status: "offline",
        });

        if (VERBOSE) console.log("Ny bruker registrert:", username);
        return Response.json({ success: true }, { status: 201 });
      } catch (err) {
        console.error("Feil under registrering:", err);
        return Response.json(
          { error: "Brukernavn eller e-post er allerede i bruk", details: String(err) },
          { status: 500 }
        );
      }
    }

    // Login
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const { username, password } = (await request.json()) as any;
        if (!username || !password) {
          return Response.json({ error: "Mangler brukernavn eller passord" }, { status: 400 });
        }

        // Hent bruker fra DB
        const found = await db.select().from(users).where(eq(users.username, username)).all();
        if (!found || found.length === 0) {
          return Response.json({ error: "Ugyldig brukernavn eller passord" }, { status: 401 });
        }

        const user = found[0] as any;

        // Hash innsendt passord
        const encoder = new TextEncoder();
        const pwBuffer = encoder.encode(password);
        const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
        const hashed = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (hashed !== user.password) {
          return Response.json({ error: "Ugyldig brukernavn eller passord" }, { status: 401 });
        }

        // Opprett session-token
        const token = crypto.randomUUID();
        await db.insert(sessions).values({ id: crypto.randomUUID(), userId: user.id, token });

        // Cookie for å holde brukeren logget inn
        const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax`;
        return Response.json({ success: true }, { status: 200, headers: { "Set-Cookie": cookie } });
      } catch (err) {
        console.error("Login error:", err);
        return Response.json({ error: "Innlogging feilet", details: String(err) }, { status: 500 });
      }
    }

    // Hent innlogget bruker
    if (url.pathname === "/api/me" && request.method === "GET") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        // Valider session
        const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
        if (!s || s.length === 0) return Response.json({ error: "Ugyldig session" }, { status: 401 });
        const sess = s[0] as any;

        // Hent bruker
        const u = await db.select().from(users).where(eq(users.id, sess.userId ?? sess.user_id)).all();
        if (!u || u.length === 0) return Response.json({ error: "Bruker ikke funnet" }, { status: 404 });
        const user = u[0] as any;

        // Returner brukerobjekt til frontend
        return Response.json({
          user: {
            id: user.id,
            username: user.username,
            name: user.username, // frontend bruker name
            avatarUrl: user.avatar_url ?? user.avatarUrl,
            status: user.status ?? "offline",
          },
        });
      } catch (err) {
        console.error("/api/me error:", err);
        return Response.json({ error: "Kunne ikke hente bruker", details: String(err) }, { status: 500 });
      }
    }

    // Oppdater brukerstatus
    if (url.pathname === "/api/me/status" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        // Valider session
        const s = await db.select().from(sessions).where(eq(sessions.token, token)).all();
        if (!s || s.length === 0) return Response.json({ error: "Ugyldig session" }, { status: 401 });
        const sess = s[0] as any;

        // Les status fra body
        const { status } = (await request.json()) as { status: "online" | "busy" | "away" };
        if (!status || !["online", "busy", "away"].includes(status)) {
          return Response.json({ error: "Ugyldig status" }, { status: 400 });
        }

        // Oppdater status i database
        await db.update(users).set({ status }).where(eq(users.id, sess.userId ?? sess.user_id));

        if (VERBOSE) console.log("Status oppdatert:", sess.userId ?? sess.user_id, "->", status);
        return Response.json({ success: true, status });
      } catch (err) {
        console.error("/api/me/status error:", err);
        return Response.json({ error: "Kunne ikke oppdatere status", details: String(err) }, { status: 500 });
      }
    }

    // Logg ut (sletter session-cookie)
    if (url.pathname === "/api/logout" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;

        if (token) {
          await db.delete(sessions).where(eq(sessions.token, token));
        }

        const expired = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
        return Response.json({ success: true }, { status: 200, headers: { "Set-Cookie": expired } });
      } catch (err) {
        console.error("Logout-feil:", err);
        return Response.json({ error: "Kunne ikke logge ut", details: String(err) }, { status: 500 });
      }
    }

    // Test databaseforbindelse
    if (url.pathname === "/api/test-db" && request.method === "GET") {
      try {
        const allUsers = await db.select().from(users).all();
        return Response.json({ success: true, users: allUsers });
      } catch (err) {
        console.error("Feil i test-db:", err);
        return Response.json({ error: "Databasefeil", details: String(err) }, { status: 500 });
      }
    }

    // Slett bruker (kun for test)
    if (url.pathname === "/api/delete-user" && request.method === "DELETE") {
      try {
        const id = url.searchParams.get("id");
        if (!id) {
          return Response.json({ error: "Mangler bruker-ID" }, { status: 400 });
        }

        await db.delete(users).where(eq(users.id, id));
        return Response.json({ success: true });
      } catch (err) {
        console.error("Feil under sletting:", err);
        return Response.json({ error: "Databasefeil", details: String(err) }, { status: 500 });
      }
    }

    // ----------------------------------------------------------
    // 2. FRONTEND (React build fra ASSETS)
    // ----------------------------------------------------------
    try {
      // Kopi av requesten slik at den kan brukes på nytt
      const assetReq = new Request(request.url, {
        method: request.method,
        headers: request.headers,
      });

      let assetResponse = await env.ASSETS.fetch(assetReq);

      // Hvis fila ikke finnes → server index.html (SPA fallback)
      if (assetResponse.status === 404) {
        const indexReq = new Request(`${url.origin}/index.html`, {
          method: "GET",
          headers: request.headers,
        });
        assetResponse = await env.ASSETS.fetch(indexReq);
      }

      return assetResponse;
    } catch (err) {
      console.error("ASSETS fetch error:", err);
      return new Response("Feil under lasting av frontend", { status: 500 });
    }
  },
};

// Fjernet toppnivå debug-fetch: relative fetch kall ved modul-load kan føre til oppstartsfeil i wrangler.