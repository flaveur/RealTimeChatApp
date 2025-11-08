import { eq } from "drizzle-orm";
import { createDB } from "./db/client";
import { sessions, users } from "./db/schema";

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