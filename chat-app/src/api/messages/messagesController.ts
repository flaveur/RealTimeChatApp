/**
 * Messages Controller - Routing for meldinger API
 * 
 * Denne controlleren fungerer som en router for alle meldings-relaterte
 * API-endepunkter. Den parser URL-en og delegerer til riktig funksjon
 * i messages.ts (forretningslogikk).
 * 
 * Endepunkter:
 * - GET  /api/messages          → Hent alle samtaler (oversikt)
 * - POST /api/messages          → Send ny melding
 * - GET  /api/messages/:id      → Hent samtale med spesifikk venn
 * - POST /api/messages/:id/read → Merk meldinger som lest
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

import { getEnv } from "../../lib/env";
import { getDb } from "../../lib/db.server";
import { getConversations, getConversation, sendMessage, markAsRead } from "../../app/api/messages";

/**
 * Hovedcontroller for meldinger
 * 
 * Bruker regex for å matche dynamiske ruter (f.eks. /api/messages/123)
 * 
 * @param context - Cloudflare Workers request context
 * @returns HTTP Response med JSON data
 */
export async function messagesController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // GET /api/messages - Hent alle samtaler (oversikt med siste melding)
    if (pathname === "/api/messages" && request.method === "GET") {
      return await getConversations(request, db);
    }

    // POST /api/messages - Send ny melding til en venn
    if (pathname === "/api/messages" && request.method === "POST") {
      return await sendMessage(request, db);
    }

    // GET /api/messages/:friendId - Hent full samtalehistorikk med en venn
    // Regex matcher /api/messages/ etterfulgt av tall
    const conversationMatch = pathname.match(/^\/api\/messages\/(\d+)$/);
    if (conversationMatch && request.method === "GET") {
      const friendId = parseInt(conversationMatch[1], 10);
      return await getConversation(request, db, friendId);
    }

    // POST /api/messages/:friendId/read - Merk alle meldinger fra venn som lest
    const readMatch = pathname.match(/^\/api\/messages\/(\d+)\/read$/);
    if (readMatch && request.method === "POST") {
      const friendId = parseInt(readMatch[1], 10);
      return await markAsRead(request, db, friendId);
    }

    // 404 hvis ingen rute matcher
    return Response.json({ error: "Endpoint ikke funnet" }, { status: 404 });
  } catch (error) {
    console.error("Feil i messagesController:", error);
    return Response.json({ error: "Intern serverfeil" }, { status: 500 });
  }
}