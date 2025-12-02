import { getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, searchUsers } from "./friendsController";

export async function friendsHandler(request: Request, env: any) {
  const url = new URL(request.url);
  const db = env.chat_appd1;

  // GET /api/friends - hent alle venner
  if (request.method === "GET" && url.pathname === "/api/friends") {
    return getFriends(request, db);
  }

  // GET /api/friends/requests - hent venneforespørsler
  if (request.method === "GET" && url.pathname === "/api/friends/requests") {
    return getFriendRequests(request, db);
  }

  // GET /api/friends/search - søk etter brukere
  if (request.method === "GET" && url.pathname === "/api/friends/search") {
    return searchUsers(request, db);
  }

  // POST /api/friends/request - send venneforespørsel
  if (request.method === "POST" && url.pathname === "/api/friends/request") {
    return sendFriendRequest(request, db);
  }

  // POST /api/friends/accept - aksepter venneforespørsel
  if (request.method === "POST" && url.pathname === "/api/friends/accept") {
    return acceptFriendRequest(request, db);
  }

  // POST /api/friends/reject - avslå venneforespørsel
  if (request.method === "POST" && url.pathname === "/api/friends/reject") {
    return rejectFriendRequest(request, db);
  }

  // DELETE /api/friends/remove - fjern venn
  if (request.method === "DELETE" && url.pathname === "/api/friends/remove") {
    return removeFriend(request, db);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
