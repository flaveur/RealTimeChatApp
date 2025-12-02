import { eq } from "drizzle-orm";
import { users, userSettings } from "../../../drizzle/schema";
import { authenticateUser } from "./utils";

/**
 * GET /api/settings - Hent brukerens innstillinger
 */
export async function getSettings(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Hent settings fra database
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, auth.userId))
      .all();

    if (!settings || settings.length === 0) {
      // Opprett default settings hvis de ikke finnes
      await db.insert(userSettings).values({
        userId: auth.userId,
        theme: "dark",
        language: "no",
        notifications: 1,
        updatedAt: new Date().toISOString(),
      }).run();

      return Response.json({
        theme: "dark",
        language: "no",
        notifications: true,
      });
    }

    const s = settings[0] as any;
    return Response.json({
      theme: s.theme ?? "dark",
      language: s.language ?? "no",
      notifications: s.notifications === 1,
    });
  } catch (error) {
    console.error("Feil ved henting av settings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/settings - Oppdater brukerens innstillinger
 */
export async function updateSettings(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: any = await request.json();
    const { theme, language, notifications } = body;

    // Valider input
    if (theme && !["light", "dark", "system"].includes(theme)) {
      return Response.json({ error: "Ugyldig tema" }, { status: 400 });
    }
    if (language && !["no", "en"].includes(language)) {
      return Response.json({ error: "Ugyldig språk" }, { status: 400 });
    }

    // Sjekk om settings finnes
    const existing = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, auth.userId))
      .all();

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };
    if (theme !== undefined) updates.theme = theme;
    if (language !== undefined) updates.language = language;
    if (notifications !== undefined) updates.notifications = notifications ? 1 : 0;

    if (existing && existing.length > 0) {
      // Oppdater
      await db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, auth.userId))
        .run();
    } else {
      // Opprett
      await db.insert(userSettings).values({
        userId: auth.userId,
        ...updates,
      }).run();
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Feil ved oppdatering av settings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/me/name - Oppdater brukerens displayName
 */
export async function updateName(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: any = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return Response.json({ error: "Navn må være minst 2 tegn" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ displayName: name.trim() })
      .where(eq(users.id, auth.userId))
      .run();

    return Response.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error("Feil ved oppdatering av navn:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/me/status - Oppdater brukerens status (online/busy/away)
 */
export async function updateStatus(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: any = await request.json();
    const { status } = body;

    if (!["online", "busy", "away", "offline"].includes(status)) {
      return Response.json({ error: "Ugyldig status" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ status })
      .where(eq(users.id, auth.userId))
      .run();

    return Response.json({ success: true, status });
  } catch (error) {
    console.error("Feil ved oppdatering av status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/me/avatar - Oppdater brukerens profilbilde
 */
export async function updateAvatar(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: any = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl || avatarUrl.trim().length === 0) {
      return Response.json({ error: "Mangler avatar URL" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ avatarUrl: avatarUrl.trim() })
      .where(eq(users.id, auth.userId))
      .run();

    return Response.json({ success: true, avatarUrl: avatarUrl.trim() });
  } catch (error) {
    console.error("Feil ved oppdatering av avatar:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/me/status-text - Oppdater brukerens statustekst (egendefinert melding)
 */
export async function updateStatusText(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: any = await request.json();
    const { statusText } = body;

    // Tillat tom streng for å fjerne statustekst, men begrens lengden
    const text = statusText?.trim() ?? "";
    if (text.length > 100) {
      return Response.json({ error: "Statustekst kan være maks 100 tegn" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ statusText: text || null })
      .where(eq(users.id, auth.userId))
      .run();

    return Response.json({ success: true, statusText: text || null });
  } catch (error) {
    console.error("Feil ved oppdatering av statustekst:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/me - Hent innlogget bruker
 */
export async function getCurrentUser(request: Request, db: any): Promise<Response> {
  const auth = await authenticateUser(request, db);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .all();

    if (!userList || userList.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = userList[0] as any;
    return Response.json({
      id: user.id,
      username: user.username,
      name: user.display_name ?? user.displayName ?? user.username,
      status: user.status ?? "offline",
      statusText: user.status_text ?? user.statusText ?? null,
      avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
    });
  } catch (error) {
    console.error("Feil ved henting av bruker:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
