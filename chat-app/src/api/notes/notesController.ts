import { getNotes, createNote, updateOrDeleteNote } from "../../app/api/notes";
import { getEnv } from '../../lib/env';
import { getDb } from '../../lib/db.server';

export async function notesController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // GET /api/notes - hent alle notater
  if (request.method === "GET" && pathname === "/api/notes") {
    return getNotes(request, db);
  }

  // POST /api/notes - opprett nytt notat
  if (request.method === "POST" && pathname === "/api/notes") {
    return createNote(request, db);
  }

  // PUT/DELETE /api/notes/:id - oppdater eller slett notat
  const noteIdMatch = pathname.match(/^\/api\/notes\/([^/]+)$/);
  if (noteIdMatch && (request.method === "PUT" || request.method === "DELETE")) {
    const noteId = noteIdMatch[1];
    return updateOrDeleteNote(request, db, noteId);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
