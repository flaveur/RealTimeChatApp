import { getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, searchUsers } from "../../app/api/friends";
import { getEnv } from '../../lib/env';
import { getDb } from '../../lib/db.server';

export async function friendsController(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv();
  const db = getDb(env.chat_appd1);
  const d1 = env.chat_appd1; // Raw D1 database for raw queries
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // GET /api/friends - hent alle venner
  if (request.method === "GET" && pathname === "/api/friends") {
    return getFriends(request, db);
  }

  // GET /api/friends/requests - hent venneforespørsler
  if (request.method === "GET" && pathname === "/api/friends/requests") {
    return getFriendRequests(request, db);
  }

  // GET /api/friends/search - søk etter brukere
  if (request.method === "GET" && pathname.includes("/api/friends/search")) {
    return searchUsers(request, db);
  }

  // POST /api/friends/request - send venneforespørsel
  if (request.method === "POST" && pathname === "/api/friends/request") {
    return sendFriendRequest(request, db);
  }

  // POST /api/friends/accept - aksepter venneforespørsel
  if (request.method === "POST" && pathname === "/api/friends/accept") {
    return acceptFriendRequest(request, db, d1);
  }

  // POST /api/friends/reject - avslå venneforespørsel
  if (request.method === "POST" && pathname === "/api/friends/reject") {
    return rejectFriendRequest(request, db, d1);
  }

  // DELETE /api/friends/remove - fjern venn
  if (request.method === "DELETE" && pathname === "/api/friends/remove") {
    return removeFriend(request, db, d1);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
