import { getEnv } from "../../lib/env";
import { getDb } from "../../lib/db.server";
import { getConversations, getConversation, sendMessage, markAsRead } from "../../app/api/messages";

export async function messagesController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // GET /api/messages - Hent alle samtaler
    if (pathname === "/api/messages" && request.method === "GET") {
      return await getConversations(request, db);
    }

    // POST /api/messages - Send melding
    if (pathname === "/api/messages" && request.method === "POST") {
      return await sendMessage(request, db);
    }

    // GET /api/messages/:friendId - Hent samtale med en venn
    const conversationMatch = pathname.match(/^\/api\/messages\/(\d+)$/);
    if (conversationMatch && request.method === "GET") {
      const friendId = parseInt(conversationMatch[1], 10);
      return await getConversation(request, db, friendId);
    }

    // POST /api/messages/:friendId/read - Merk meldinger som lest
    const readMatch = pathname.match(/^\/api\/messages\/(\d+)\/read$/);
    if (readMatch && request.method === "POST") {
      const friendId = parseInt(readMatch[1], 10);
      return await markAsRead(request, db, friendId);
    }

    return Response.json({ error: "Endpoint ikke funnet" }, { status: 404 });
  } catch (error) {
    console.error("Feil i messagesController:", error);
    return Response.json({ error: "Intern serverfeil" }, { status: 500 });
  }
}