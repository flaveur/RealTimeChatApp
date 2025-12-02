import { getEnv } from '../../lib/env';
import { getDb } from '../../lib/db.server';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser } from '../../app/api/utils';

export async function uploadController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // POST /api/upload/avatar - Last opp profilbilde
  if (request.method === "POST" && pathname === "/api/upload/avatar") {
    return uploadAvatar(request, db, env);
  }

  // GET /api/upload/avatar/:key - Hent profilbilde
  if (request.method === "GET" && pathname.startsWith("/api/upload/avatar/")) {
    return getAvatar(request, env);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

async function uploadAvatar(request: Request, db: any, env: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "Ingen fil lastet opp" }, { status: 400 });
    }

    // Valider filtype
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ 
        error: "Ugyldig filtype. Kun JPG, PNG, GIF og WebP er tillatt." 
      }, { status: 400 });
    }

    // Valider filstørrelse (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ 
        error: "Filen er for stor. Maks 5MB." 
      }, { status: 400 });
    }

    // Generer unik filnøkkel
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `avatars/${auth.userId}-${Date.now()}.${ext}`;

    // Last opp til R2
    if (!env.R2) {
      return Response.json({ 
        error: "R2 storage er ikke konfigurert" 
      }, { status: 500 });
    }

    await env.R2.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generer URL til bildet
    const avatarUrl = `/api/upload/avatar/${key}`;

    // Oppdater brukerens avatar i databasen
    await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, auth.userId))
      .run();

    return Response.json({ 
      success: true, 
      avatarUrl,
      message: "Profilbilde lastet opp!" 
    });
  } catch (error) {
    console.error("Feil ved opplasting av avatar:", error);
    return Response.json({ error: "Kunne ikke laste opp bilde" }, { status: 500 });
  }
}

async function getAvatar(request: Request, env: any): Promise<Response> {
  try {
    const url = new URL(request.url);
    // Fjern /api/upload/avatar/ prefixet
    const key = url.pathname.replace("/api/upload/avatar/", "");

    if (!env.R2) {
      return new Response("R2 storage er ikke konfigurert", { status: 500 });
    }

    const object = await env.R2.get(key);
    
    if (!object) {
      return new Response("Bilde ikke funnet", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000", // Cache i 1 år
      },
    });
  } catch (error) {
    console.error("Feil ved henting av avatar:", error);
    return new Response("Kunne ikke hente bilde", { status: 500 });
  }
}
