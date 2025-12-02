import { eq, and, or, desc, isNull } from "drizzle-orm";
import { messages, users, friendships } from "../../../drizzle/schema";
import { authenticateUser, getUserData } from "./utils";

// Hent alle samtaler (liste over venner med siste melding)
export async function getConversations(request: Request, db: any) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    // Hent alle venner (sjekk begge retninger siden vi kun lagrer én rad per vennskap)
    const allFriendships = await db
      .select()
      .from(friendships)
      .where(
        or(
          eq(friendships.userId, auth.userId),
          eq(friendships.friendId, auth.userId)
        )
      )
      .all();

    if (!allFriendships || allFriendships.length === 0) {
      return Response.json({ conversations: [] });
    }

    // Finn venn-IDer (den andre parten i vennskapet)
    const friendIds = allFriendships.map((f: any) => {
      const fUserId = Number(f.userId ?? f.user_id);
      const fFriendId = Number(f.friendId ?? f.friend_id);
      return fUserId === auth.userId ? fFriendId : fUserId;
    }).filter((id: number) => id !== auth.userId); // Filtrer ut seg selv

    // Fjern duplikater
    const uniqueFriendIds = [...new Set(friendIds)] as number[];

    if (uniqueFriendIds.length === 0) {
      return Response.json({ conversations: [] });
    }

    // Hent brukerdata for alle venner
    const friendsData = await Promise.all(
      uniqueFriendIds.map(async (friendId: number) => {
        const userData = await getUserData(db, friendId);
        
        // Hent siste melding i samtalen
        const lastMessage = await db
          .select({
            id: messages.id,
            content: messages.content,
            senderId: messages.senderId,
            receiverId: messages.receiverId,
            createdAt: messages.createdAt,
            readAt: messages.readAt,
          })
          .from(messages)
          .where(
            or(
              and(eq(messages.senderId, auth.userId), eq(messages.receiverId, friendId)),
              and(eq(messages.senderId, friendId), eq(messages.receiverId, auth.userId))
            )
          )
          .orderBy(desc(messages.createdAt))
          .limit(1)
          .all();

        // Tell ulesete meldinger
        const unreadCount = await db
          .select({ count: messages.id })
          .from(messages)
          .where(
            and(
              eq(messages.senderId, friendId),
              eq(messages.receiverId, auth.userId),
              isNull(messages.readAt)
            )
          )
          .all();

        return {
          friend: userData,
          lastMessage: lastMessage[0] || null,
          unreadCount: unreadCount.length,
        };
      })
    );

    // Sorter etter siste melding
    friendsData.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    return Response.json({ conversations: friendsData });
  } catch (error) {
    console.error("Feil ved henting av samtaler:", error);
    return Response.json({ error: "Kunne ikke hente samtaler" }, { status: 500 });
  }
}

// Hent meldinger i en samtale
export async function getConversation(request: Request, db: any, friendId: number) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    // Verifiser at de er venner (sjekk begge retninger)
    const friendship = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, auth.userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, auth.userId))
        )
      )
      .all();

    if (!friendship || friendship.length === 0) {
      return Response.json({ error: "Dere er ikke venner" }, { status: 403 });
    }

    // Hent alle meldinger mellom de to brukerne
    const conversationMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, auth.userId), eq(messages.receiverId, friendId)),
          and(eq(messages.senderId, friendId), eq(messages.receiverId, auth.userId))
        )
      )
      .orderBy(messages.createdAt)
      .all();

    // Hent brukerdata for vennen
    const friendData = await getUserData(db, friendId);

    return Response.json({
      friend: friendData,
      messages: conversationMessages,
    });
  } catch (error) {
    console.error("Feil ved henting av samtale:", error);
    return Response.json({ error: "Kunne ikke hente samtale" }, { status: 500 });
  }
}

// Send melding
export async function sendMessage(request: Request, db: any) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    const { receiverId, content } = (await request.json()) as {
      receiverId: number;
      content: string;
    };

    if (!receiverId || !content || !content.trim()) {
      return Response.json({ error: "Mangler mottaker eller innhold" }, { status: 400 });
    }

    // Verifiser at de er venner (sjekk begge retninger)
    const friendship = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, auth.userId), eq(friendships.friendId, receiverId)),
          and(eq(friendships.userId, receiverId), eq(friendships.friendId, auth.userId))
        )
      )
      .all();

    if (!friendship || friendship.length === 0) {
      return Response.json({ error: "Dere er ikke venner" }, { status: 403 });
    }

    // Opprett melding
    const newMessage = {
      senderId: auth.userId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const result = await db.insert(messages).values(newMessage).returning().all();

    return Response.json({ success: true, message: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Feil ved sending av melding:", error);
    return Response.json({ error: "Kunne ikke sende melding" }, { status: 500 });
  }
}

// Merk meldinger som lest
export async function markAsRead(request: Request, db: any, friendId: number) {
  try {
    const auth = await authenticateUser(request, db);
    if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

    // Merk alle meldinger fra denne vennen som lest
    await db
      .update(messages)
      .set({ readAt: new Date().toISOString() })
      .where(
        and(
          eq(messages.senderId, friendId),
          eq(messages.receiverId, auth.userId),
          isNull(messages.readAt)
        )
      );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Feil ved marking av meldinger som lest:", error);
    return Response.json({ error: "Kunne ikke markere som lest" }, { status: 500 });
  }
}
