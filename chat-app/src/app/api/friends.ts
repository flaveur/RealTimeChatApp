import { authenticateUser, getUserData } from "./utils";
import { eq, or, and } from "drizzle-orm";
import { friends } from "../db/schema";

export async function getFriends(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const allFriendships = await db
    .select()
    .from(friends)
    .where(or(eq(friends.userId, auth.userId), eq(friends.friendId, auth.userId)))
    .all();

  const friendships = await Promise.all(
    allFriendships.map(async (f: any) => {
      const friendId = f.userId === auth.userId ? f.friendId : f.userId;
      const friend = await getUserData(db, friendId);
      return { ...f, friend };
    })
  );

  return Response.json({ friends: friendships });
}

export async function addFriend(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const { friendId } = (await request.json()) as { friendId: string };
  if (!friendId) return Response.json({ error: "Mangler friendId" }, { status: 400 });

  const existing = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.userId, auth.userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, auth.userId))
      )
    )
    .all();

  if (existing.length > 0) {
    return Response.json({ error: "Venneforespørsel eksisterer allerede" }, { status: 409 });
  }

  await db.insert(friends).values({
    id: crypto.randomUUID(),
    userId: auth.userId,
    friendId,
    status: "pending",
  });

  return Response.json({ success: true });
}

export async function removeFriend(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const { friendshipId } = (await request.json()) as { friendshipId: string };
  if (!friendshipId) return Response.json({ error: "Mangler friendshipId" }, { status: 400 });

  await db.delete(friends).where(eq(friends.id, friendshipId));
  return Response.json({ success: true });
}