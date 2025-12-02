import { getSettings, updateSettings, updateName, updateStatus, updateAvatar, getCurrentUser } from "../../app/api/settings";
import { getEnv } from '../../lib/env';
import { getDb } from '../../lib/db.server';

export async function settingsController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // GET /api/me - hent innlogget bruker
  if (request.method === "GET" && pathname === "/api/me") {
    return getCurrentUser(request, db);
  }

  // PUT /api/me/name - oppdater navn
  if (request.method === "PUT" && pathname === "/api/me/name") {
    return updateName(request, db);
  }

  // PUT /api/me/status - oppdater status
  if (request.method === "PUT" && pathname === "/api/me/status") {
    return updateStatus(request, db);
  }

  // PUT /api/me/avatar - oppdater profilbilde
  if (request.method === "PUT" && pathname === "/api/me/avatar") {
    return updateAvatar(request, db);
  }

  // GET /api/settings - hent settings
  if (request.method === "GET" && pathname === "/api/settings") {
    return getSettings(request, db);
  }

  // PUT /api/settings - oppdater settings
  if (request.method === "PUT" && pathname === "/api/settings") {
    return updateSettings(request, db);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
