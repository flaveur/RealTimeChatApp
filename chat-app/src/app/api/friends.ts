import { authenticateUser, getUserData } from "./utils";
import { eq, or, and, like } from "drizzle-orm";
import { friendships, friendRequests, users } from "../../../drizzle/schema";

// Hent alle venner (aksepterte forespørsler)
export async function getFriends(request: Request, db: any) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    const allFriendships = await db
      .select()
      .from(friendships)
      .where(or(eq(friendships.userId, auth.userId), eq(friendships.friendId, auth.userId)))
      .all();

    const friendsList = await Promise.all(
      allFriendships.map(async (f: any) => {
        const friendId = f.userId === auth.userId ? f.friendId : f.userId;
        const friendData = await getUserData(db, friendId);
        return { 
          id: friendId,
          username: friendData?.username,
          displayName: friendData?.displayName,
          status: friendData?.status || "offline",
          createdAt: f.createdAt
        };
      })
    );

    return Response.json({ friends: friendsList });
  } catch (error) {
    console.error("Feil ved henting av venner:", error);
    return Response.json({ error: "Kunne ikke hente venner" }, { status: 500 });
  }
}

// Hent alle venneforespørsler (både sendte og mottatte)
export async function getFriendRequests(request: Request, db: any) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const received = await db
    .select()
    .from(friendRequests)
    .where(and(eq(friendRequests.receiverId, auth.userId), eq(friendRequests.status, "pending")))
    .all();

  const sent = await db
    .select()
    .from(friendRequests)
    .where(and(eq(friendRequests.senderId, auth.userId), eq(friendRequests.status, "pending")))
    .all();

  const receivedWithUsers = await Promise.all(
    received.map(async (req: any) => {
      const senderId = req.sender_id ?? req.senderId;
      const sender = await getUserData(db, senderId);
      return {
        id: req.id,
        senderId: senderId,
        receiverId: req.receiver_id ?? req.receiverId,
        status: req.status,
        createdAt: req.created_at ?? req.createdAt,
        type: "received",
        sender: {
          id: senderId,
          username: sender?.username,
          displayName: sender?.displayName,
        }
      };
    })
  );

  const sentWithUsers = await Promise.all(
    sent.map(async (req: any) => {
      const receiverId = req.receiver_id ?? req.receiverId;
      const receiver = await getUserData(db, receiverId);
      return {
        id: req.id,
        senderId: req.sender_id ?? req.senderId,
        receiverId: receiverId,
        status: req.status,
        createdAt: req.created_at ?? req.createdAt,
        type: "sent",
        receiver: {
          id: receiverId,
          username: receiver?.username,
          displayName: receiver?.displayName,
        }
      };
    })
  );

  return Response.json({
    received: receivedWithUsers,
    sent: sentWithUsers
  });
  } catch (error) {
    console.error("Feil ved henting av forespørsler:", error);
    return Response.json({ error: "Kunne ikke hente forespørsler" }, { status: 500 });
  }
}

// Send venneforespørsel
export async function sendFriendRequest(request: Request, db: any) {
  try {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const { username } = (await request.json()) as { username: string };
  if (!username) return Response.json({ error: "Mangler brukernavn" }, { status: 400 });

  // Finn bruker basert på brukernavn
  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .all();

  if (!targetUser || targetUser.length === 0) {
    return Response.json({ error: "Bruker ikke funnet" }, { status: 404 });
  }

  const friendId = targetUser[0].id;

  if (friendId === auth.userId) {
    return Response.json({ error: "Du kan ikke legge til deg selv som venn" }, { status: 400 });
  }

  // Sjekk om de allerede er venner
  const existingFriendship = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userId, auth.userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, auth.userId))
      )
    )
    .all();

  if (existingFriendship.length > 0) {
    return Response.json({ error: "Dere er allerede venner" }, { status: 409 });
  }

  // Sjekk om det allerede finnes en aktiv forespørsel
  const existingRequest = await db
    .select()
    .from(friendRequests)
    .where(
      and(
        or(
          and(eq(friendRequests.senderId, auth.userId), eq(friendRequests.receiverId, friendId)),
          and(eq(friendRequests.senderId, friendId), eq(friendRequests.receiverId, auth.userId))
        ),
        eq(friendRequests.status, "pending")
      )
    )
    .all();

  if (existingRequest.length > 0) {
    return Response.json({ error: "Venneforespørsel eksisterer allerede" }, { status: 409 });
  }

  // Opprett venneforespørsel med UUID
  const requestId = crypto.randomUUID();
  const result = await db.insert(friendRequests).values({
    id: requestId,
    senderId: auth.userId,
    receiverId: friendId,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning().all();

  return Response.json({ success: true, request: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Feil ved sending av venneforespørsel:", error);
    return Response.json({ error: "Kunne ikke sende venneforespørsel" }, { status: 500 });
  }
}

// Aksepter venneforespørsel
export async function acceptFriendRequest(request: Request, db: any, d1: D1Database) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: "Ugyldig JSON i request body" }, { status: 400 });
    }
    
    const requestId = body.requestId;
    if (!requestId) {
      return Response.json({ error: "Mangler requestId i request body" }, { status: 400 });
    }

    console.log("Looking for friend request with id:", requestId);

    // Bruk D1 direkte for raw SQL med UUID
    const existingRequest = await d1.prepare(
      `SELECT * FROM friend_requests WHERE id = ?`
    ).bind(requestId).all();

    console.log("Found requests:", JSON.stringify(existingRequest));

    if (!existingRequest?.results || existingRequest.results.length === 0) {
      return Response.json({ error: "Forespørsel ikke funnet" }, { status: 404 });
    }

    const req = existingRequest.results[0] as any;
    
    // Hent receiver_id og sender_id
    const receiverId = req.receiver_id;
    const senderId = req.sender_id;
    
    console.log("Request details - receiverId:", receiverId, "senderId:", senderId, "auth.userId:", auth.userId);

    if (Number(receiverId) !== auth.userId) {
      return Response.json({ error: "Ikke autorisert - du kan bare akseptere forespørsler sendt til deg" }, { status: 403 });
    }

    if (req.status !== "pending") {
      return Response.json({ error: "Forespørselen er allerede behandlet" }, { status: 400 });
    }

    // Oppdater forespørsel til akseptert
    await d1.prepare(
      `UPDATE friend_requests SET status = 'accepted', updated_at = ? WHERE id = ?`
    ).bind(new Date().toISOString(), requestId).run();

    // Opprett vennskap i BEGGE retninger
    const now = new Date().toISOString();
    await d1.prepare(
      `INSERT INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)`
    ).bind(senderId, receiverId, now).run();
    
    await d1.prepare(
      `INSERT INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)`
    ).bind(receiverId, senderId, now).run();

    console.log("Friendship created between", senderId, "and", receiverId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Feil ved godkjenning av venneforespørsel:", error);
    return Response.json({ error: "Kunne ikke godkjenne venneforespørsel: " + String(error) }, { status: 500 });
  }
}

// Avslå venneforespørsel - sletter forespørselen helt
export async function rejectFriendRequest(request: Request, db: any, d1: D1Database) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: "Ugyldig JSON i request body" }, { status: 400 });
    }
    
    console.log("Reject request body:", JSON.stringify(body));
    
    const requestId = body.requestId;
    if (!requestId) {
      return Response.json({ error: "Mangler requestId i request body" }, { status: 400 });
    }

    // Bruk D1 direkte for raw SQL med UUID
    const existingRequest = await d1.prepare(
      `SELECT * FROM friend_requests WHERE id = ?`
    ).bind(requestId).all();

    if (!existingRequest?.results || existingRequest.results.length === 0) {
      return Response.json({ error: "Forespørsel ikke funnet" }, { status: 404 });
    }

    const req = existingRequest.results[0] as any;
    
    // Hent receiver_id
    const receiverId = req.receiver_id;

    if (Number(receiverId) !== auth.userId) {
      return Response.json({ error: "Ikke autorisert - du kan bare avslå forespørsler sendt til deg" }, { status: 403 });
    }

    // Slett forespørselen helt
    await d1.prepare(
      `DELETE FROM friend_requests WHERE id = ?`
    ).bind(requestId).run();

    console.log("Friend request", requestId, "deleted");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Feil ved avslåing av venneforespørsel:", error);
    return Response.json({ error: "Kunne ikke avslå venneforespørsel: " + String(error) }, { status: 500 });
  }
}

// Fjern venn
export async function removeFriend(request: Request, db: any, d1: D1Database) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const { friendId } = (await request.json()) as { friendId: string };
  if (!friendId) return Response.json({ error: "Mangler friendId" }, { status: 400 });

  const friendIdNum = parseInt(friendId, 10);
  if (isNaN(friendIdNum)) {
    return Response.json({ error: "Ugyldig friendId" }, { status: 400 });
  }

  // Fjern vennskapet (sjekk begge retninger) med D1 direkte
  await d1.prepare(
    `DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`
  ).bind(auth.userId, friendIdNum, friendIdNum, auth.userId).run();

  return Response.json({ success: true });
}

// Søk etter brukere
export async function searchUsers(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return Response.json({ error: "Søk må være minst 2 tegn" }, { status: 400 });
  }

  const searchPattern = `%${query.trim().toLowerCase()}%`;
  
  try {
    const results = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        status: users.status,
      })
      .from(users)
      .where(
        or(
          like(users.username, searchPattern),
          like(users.displayName, searchPattern)
        )
      )
      .limit(20)
      .all();

    // Filtrer bort seg selv
    const filtered = results.filter((u: any) => u.id !== auth.userId);

    return Response.json({ users: filtered });
  } catch (error) {
    console.error("Søkefeil:", error);
    return Response.json({ error: "Søk feilet" }, { status: 500 });
  }
}