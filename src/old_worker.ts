// Helper: autentiser bruker fra cookie
async function authenticateUser(
  request: Request,
  db: any
): Promise<{ userId: string } | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  const s = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .all();
  if (!s || s.length === 0) return null;

  const sess = s[0] as any;
  return { userId: sess.userId ?? sess.user_id };
}

// Helper: hash passord
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const pwBuffer = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", pwBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: hent bruker-data
async function getUserData(db: any, userId: string) {
  const u = await db.select().from(users).where(eq(users.id, userId)).all();
  if (!u || u.length === 0) return null;
  const user = u[0] as any;
  return {
    id: user.id,
    username: user.username,
    name: user.username,
    avatarUrl: user.avatar_url ?? user.avatarUrl,
    status: user.status ?? "offline",
  };
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const db = await setupDb(env.DB);
    const VERBOSE = env.VERBOSE === "true";

    if (
      url.pathname === "/favicon.ico" ||
      url.pathname.startsWith("/.well-known")
    ) {
      return new Response(null, { status: 204 });
    }

    // Update user name
    if (url.pathname === "/api/me/name" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { name } = (await request.json()) as { name?: string };
        const next = (name ?? "").trim();
        if (!next || next.length < 2) {
          return Response.json(
            { error: "Navn må være minst 2 tegn" },
            { status: 400 }
          );
        }

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.username, next))
          .all();
        if (existing.some((u: any) => (u.id ?? u.ID) !== auth.userId)) {
          return Response.json(
            { error: "Brukernavnet er allerede tatt" },
            { status: 409 }
          );
        }

        await db
          .update(users)
          .set({ username: next })
          .where(eq(users.id, auth.userId));
        return Response.json({ success: true, name: next });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke oppdatere navn" },
          { status: 500 }
        );
      }
    }
    // avatar opplastning
    if (url.pathname === "/api/me/avatar" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const form = await request.formData();
        const file = form.get("avatar");
        if (!file || typeof file === "string") {
          return Response.json(
            { error: "Mangler avatar-fil" },
            { status: 400 }
          );
        }

        const ct = (file as File).type || "application/octet-stream";
        const size = (file as File).size || 0;
        if (size > 2 * 1024 * 1024) {
          return Response.json(
            { error: "Bildet er for stort (maks 2MB)" },
            { status: 413 }
          );
        }

        const key = `avatars/${auth.userId}`;

        if (env.R2) {
          await env.R2.put(key, (file as File).stream(), {
            httpMetadata: { contentType: ct },
          });
          const urlPath = `/api/avatar/${auth.userId}?v=${Date.now()}`;
          await db
            .update(users)
            .set({ avatarUrl: urlPath })
            .where(eq(users.id, auth.userId));
          return Response.json({ success: true, avatarUrl: urlPath });
        } else {
          const arrayBuffer = await (file as File).arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );
          const dataUrl = `data:${ct};base64,${base64}`;
          await db
            .update(users)
            .set({ avatarUrl: dataUrl })
            .where(eq(users.id, auth.userId));
          return Response.json({ success: true, avatarUrl: dataUrl });
        }
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke oppdatere avatar" },
          { status: 500 }
        );
      }
    }

    // hente avatar fra r2
    if (url.pathname.startsWith("/api/avatar/") && request.method === "GET") {
      try {
        const userId = url.pathname.split("/api/avatar/")[1];
        if (!userId || !env.R2)
          return new Response("Not found", { status: 404 });

        const obj = await env.R2.get(`avatars/${userId}`);
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        headers.set(
          "Content-Type",
          obj.httpMetadata?.contentType || "application/octet-stream"
        );
        headers.set("Cache-Control", "public, max-age=3600");
        return new Response(obj.body, { status: 200, headers });
      } catch (err) {
        return new Response("Internal error", { status: 500 });
      }
    }

    // register ny bruker
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const { username, email, password } =
          (await request.json()) as RegisterBody;
        if (!username || !email || !password) {
          return Response.json(
            { error: "Alle felt må fylles ut" },
            { status: 400 }
          );
        }

        const existingEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .all();
        if (existingEmail.length > 0) {
          return Response.json(
            { error: "E-post er allerede registrert" },
            { status: 409 }
          );
        }

        const existingUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .all();
        if (existingUsername.length > 0) {
          return Response.json(
            { error: "Brukernavnet er allerede tatt" },
            { status: 409 }
          );
        }

        const hashed = await hashPassword(password);
        await db.insert(users).values({
          id: crypto.randomUUID(),
          username,
          email,
          password: hashed,
          status: "offline",
        });

        if (VERBOSE) console.log("Ny bruker registrert:", username);
        return Response.json({ success: true }, { status: 201 });
      } catch (err) {
        return Response.json(
          { error: "Brukernavn eller e-post er allerede i bruk" },
          { status: 500 }
        );
      }
    }

    // login
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const { username, password } = (await request.json()) as any;
        if (!username || !password) {
          return Response.json(
            { error: "Mangler brukernavn eller passord" },
            { status: 400 }
          );
        }

        const found = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .all();
        if (!found || found.length === 0) {
          return Response.json(
            { error: "Ugyldig brukernavn eller passord" },
            { status: 401 }
          );
        }

        const user = found[0] as any;
        const hashed = await hashPassword(password);

        if (hashed !== user.password) {
          return Response.json(
            { error: "Ugyldig brukernavn eller passord" },
            { status: 401 }
          );
        }

        const token = crypto.randomUUID();
        await db
          .insert(sessions)
          .values({ id: crypto.randomUUID(), userId: user.id, token });

        const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax`;
        return Response.json(
          { success: true },
          { status: 200, headers: { "Set-Cookie": cookie } }
        );
      } catch (err) {
        return Response.json({ error: "Innlogging feilet" }, { status: 500 });
      }
    }

    // gå inn nåværende bruker
    if (url.pathname === "/api/me" && request.method === "GET") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const user = await getUserData(db, auth.userId);
        if (!user)
          return Response.json(
            { error: "Bruker ikke funnet" },
            { status: 404 }
          );

        return Response.json({ user });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke hente bruker" },
          { status: 500 }
        );
      }
    }

    // update status
    if (url.pathname === "/api/me/status" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { status } = (await request.json()) as {
          status: "online" | "busy" | "away";
        };
        if (!status || !["online", "busy", "away"].includes(status)) {
          return Response.json({ error: "Ugyldig status" }, { status: 400 });
        }

        await db.update(users).set({ status }).where(eq(users.id, auth.userId));
        if (VERBOSE)
          console.log("Status oppdatert:", auth.userId, "->", status);
        return Response.json({ success: true, status });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke oppdatere status" },
          { status: 500 }
        );
      }
    }

    // logge ut
    if (url.pathname === "/api/logout" && request.method === "POST") {
      try {
        const cookie = request.headers.get("cookie") || "";
        const match = cookie.match(/(?:^|;)\s*session=([^;]+)/);
        const token = match ? match[1] : null;

        if (token) {
          const s = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token))
            .all();
          if (s && s.length > 0) {
            const sess = s[0] as any;
            await db
              .update(users)
              .set({ status: "offline" })
              .where(eq(users.id, sess.userId ?? sess.user_id));
          }
          await db.delete(sessions).where(eq(sessions.token, token));
        }

        const expired = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
        return Response.json(
          { success: true },
          { status: 200, headers: { "Set-Cookie": expired } }
        );
      } catch (err) {
        return Response.json({ error: "Kunne ikke logge ut" }, { status: 500 });
      }
    }

    // hente venner
    if (url.pathname === "/api/friends" && request.method === "GET") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const allFriendships = await db
          .select()
          .from(friends)
          .where(
            or(
              eq(friends.userId, auth.userId),
              eq(friends.friendId, auth.userId)
            )
          )
          .all();

        const friendships = await Promise.all(
          allFriendships.map(async (f: any) => {
            const friendId = f.userId === auth.userId ? f.friendId : f.userId;
            const friend = await getUserData(db, friendId);
            return { ...f, friend };
          })
        );

        return Response.json({ friends: friendships });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke hente venner" },
          { status: 500 }
        );
      }
    }

    // søke etter brukere
    if (url.pathname === "/api/users/search" && request.method === "GET") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const query = url.searchParams.get("q") || "";
        if (query.length < 2) return Response.json({ users: [] });

        const allUsers = await db.select().from(users).all();
        const results = allUsers.filter(
          (u: any) =>
            u.username.toLowerCase().includes(query.toLowerCase()) &&
            u.id !== auth.userId
        );

        const usersData = results.map((u: any) => ({
          id: u.id,
          username: u.username,
          name: u.username,
          avatarUrl: u.avatar_url ?? u.avatarUrl,
          status: u.status ?? "offline",
        }));

        return Response.json({ users: usersData });
      } catch (err) {
        return Response.json({ error: "Søk feilet" }, { status: 500 });
      }
    }

    // sende venneforespørsel
    if (url.pathname === "/api/friends/request" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendId } = (await request.json()) as { friendId: string };
        if (!friendId)
          return Response.json({ error: "Mangler friendId" }, { status: 400 });

        const existing = await db
          .select()
          .from(friends)
          .where(
            or(
              and(
                eq(friends.userId, auth.userId),
                eq(friends.friendId, friendId)
              ),
              and(
                eq(friends.userId, friendId),
                eq(friends.friendId, auth.userId)
              )
            )
          )
          .all();

        if (existing.length > 0) {
          return Response.json(
            { error: "Venneforespørsel eksisterer allerede" },
            { status: 409 }
          );
        }

        await db.insert(friends).values({
          id: crypto.randomUUID(),
          userId: auth.userId,
          friendId,
          status: "pending",
        });

        return Response.json({ success: true });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke sende forespørsel" },
          { status: 500 }
        );
      }
    }

    // akseptere venneforespørsel
    if (url.pathname === "/api/friends/accept" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendshipId } = (await request.json()) as {
          friendshipId: string;
        };
        if (!friendshipId)
          return Response.json(
            { error: "Mangler friendshipId" },
            { status: 400 }
          );

        await db
          .update(friends)
          .set({ status: "accepted" })
          .where(eq(friends.id, friendshipId));
        return Response.json({ success: true });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke akseptere forespørsel" },
          { status: 500 }
        );
      }
    }

    // fjerne venn
    if (url.pathname === "/api/friends/remove" && request.method === "DELETE") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { friendshipId } = (await request.json()) as {
          friendshipId: string;
        };
        if (!friendshipId)
          return Response.json(
            { error: "Mangler friendshipId" },
            { status: 400 }
          );

        await db.delete(friends).where(eq(friends.id, friendshipId));
        return Response.json({ success: true });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke fjerne venn" },
          { status: 500 }
        );
      }
    }

    // hente inn notater
    if (url.pathname === "/api/notes" && request.method === "GET") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const userNotes = await db
          .select()
          .from(notes)
          .where(eq(notes.userId, auth.userId))
          .orderBy(desc(notes.createdAt))
          .all();

        return Response.json({ notes: userNotes });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke hente notater" },
          { status: 500 }
        );
      }
    }

    // lage notater
    if (url.pathname === "/api/notes" && request.method === "POST") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const { title, content } = (await request.json()) as {
          title: string;
          content?: string;
        };
        if (!title || !title.trim()) {
          return Response.json({ error: "Tittel er påkrevd" }, { status: 400 });
        }

        const newNote = {
          id: crypto.randomUUID(),
          userId: auth.userId,
          title: title.trim(),
          content: content?.trim() || "",
          createdAt: new Date().toISOString(),
        };

        await db.insert(notes).values(newNote);
        return Response.json({ note: newNote }, { status: 201 });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke opprette notat" },
          { status: 500 }
        );
      }
    }

    // oppdatere/slette notater (PUT/DELETE)
    if (url.pathname.startsWith("/api/notes/")) {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const noteId = url.pathname.split("/api/notes/")[1];
        if (!noteId)
          return Response.json({ error: "Mangler notat-ID" }, { status: 400 });

        const existing = await db
          .select()
          .from(notes)
          .where(eq(notes.id, noteId))
          .all();
        if (!existing || existing.length === 0) {
          return Response.json({ error: "Notat ikke funnet" }, { status: 404 });
        }
        const note = existing[0] as any;
        if (note.userId !== auth.userId) {
          return Response.json({ error: "Ikke autorisert" }, { status: 403 });
        }

        if (request.method === "PUT") {
          const { title, content } = (await request.json()) as {
            title?: string;
            content?: string;
          };
          await db
            .update(notes)
            .set({
              title: title?.trim() || note.title,
              content: content?.trim() || note.content,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(notes.id, noteId));
          return Response.json({ success: true });
        }

        if (request.method === "DELETE") {
          await db.delete(notes).where(eq(notes.id, noteId));
          return Response.json({ success: true });
        }
      } catch (err) {
        return Response.json(
          { error: "Notat-operasjon feilet" },
          { status: 500 }
        );
      }
    }

    // hente threads (chat-tråder)
    if (url.pathname === "/api/threads" && request.method === "GET") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const acceptedFriends = await db
          .select()
          .from(friends)
          .where(
            and(
              or(
                eq(friends.userId, auth.userId),
                eq(friends.friendId, auth.userId)
              ),
              eq(friends.status, "accepted")
            )
          )
          .all();

        const threads = await Promise.all(
          acceptedFriends.map(async (f: any) => {
            const friendId = f.userId === auth.userId ? f.friendId : f.userId;
            const friend = await getUserData(db, friendId);

            const lastMsg = await db
              .select()
              .from(messages)
              .where(
                or(
                  and(
                    eq(messages.senderId, auth.userId),
                    eq(messages.receiverId, friendId)
                  ),
                  and(
                    eq(messages.senderId, friendId),
                    eq(messages.receiverId, auth.userId)
                  )
                )
              )
              .orderBy(desc(messages.createdAt))
              .limit(1)
              .all();

            return {
              id: f.id,
              title: friend?.username || "Ukjent",
              lastMessage: lastMsg[0]?.content || null,
              avatarUrl: friend?.avatarUrl,
            };
          })
        );

        return Response.json({ threads });
      } catch (err) {
        return Response.json(
          { error: "Kunne ikke hente tråder" },
          { status: 500 }
        );
      }
    }

    // hente/sende meldinger
    if (url.pathname === "/api/messages") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        const threadId = url.searchParams.get("threadId");
        if (!threadId)
          return Response.json({ error: "Mangler threadId" }, { status: 400 });

        const friendship = await db
          .select()
          .from(friends)
          .where(eq(friends.id, threadId))
          .all();
        if (!friendship || friendship.length === 0) {
          return Response.json({ error: "Tråd ikke funnet" }, { status: 404 });
        }
        const f = friendship[0] as any;
        const friendId = f.userId === auth.userId ? f.friendId : f.userId;

        if (request.method === "GET") {
          const msgs = await db
            .select()
            .from(messages)
            .where(
              or(
                and(
                  eq(messages.senderId, auth.userId),
                  eq(messages.receiverId, friendId)
                ),
                and(
                  eq(messages.senderId, friendId),
                  eq(messages.receiverId, auth.userId)
                )
              )
            )
            .orderBy(messages.createdAt)
            .all();

          const [currentUser, friendUser] = await Promise.all([
            getUserData(db, auth.userId),
            getUserData(db, friendId),
          ]);

          const userMap: Record<string, any> = {
            [auth.userId]: currentUser,
            [friendId]: friendUser,
          };

          const formattedMessages = msgs.map((m: any) => {
            const author = userMap[m.senderId];
            return {
              id: m.id,
              authorId: m.senderId,
              text: m.content,
              createdAt: m.createdAt,
              authorName: author?.username || "Ukjent",
              authorAvatar: author?.avatarUrl,
            };
          });

          return Response.json({ messages: formattedMessages });
        }

        if (request.method === "POST") {
          const { text } = (await request.json()) as { text: string };
          if (!text?.trim())
            return Response.json({ error: "Mangler text" }, { status: 400 });

          const newMessage = {
            id: crypto.randomUUID(),
            senderId: auth.userId,
            receiverId: friendId,
            content: text.trim(),
            friendshipId: threadId,
            createdAt: new Date().toISOString(),
          };

          await db.insert(messages).values(newMessage);
          return Response.json(
            { success: true, message: newMessage },
            { status: 201 }
          );
        }
      } catch (err) {
        return Response.json(
          { error: "Melding-operasjon feilet" },
          { status: 500 }
        );
      }
    }

    // hente/oppdatere innstillinger
    if (url.pathname === "/api/me/settings") {
      try {
        const auth = await authenticateUser(request, db);
        if (!auth)
          return Response.json({ error: "Ikke autentisert" }, { status: 401 });

        if (request.method === "GET") {
          const u = await db
            .select()
            .from(users)
            .where(eq(users.id, auth.userId))
            .all();
          if (!u || u.length === 0)
            return Response.json(
              { error: "Bruker ikke funnet" },
              { status: 404 }
            );
          const user = u[0] as any;
          const settings = user.settings ? JSON.parse(user.settings) : {};
          return Response.json({ settings });
        }

        if (request.method === "PUT") {
          const newSettings = (await request.json()) as any;
          await db
            .update(users)
            .set({ settings: JSON.stringify(newSettings) })
            .where(eq(users.id, auth.userId));
          return Response.json({ success: true, settings: newSettings });
        }
      } catch (err) {
        return Response.json(
          { error: "Innstillinger-operasjon feilet" },
          { status: 500 }
        );
      }
    }

    // Test database
    if (url.pathname === "/api/test-db" && request.method === "GET") {
      try {
        const allUsers = await db.select().from(users).all();
        return Response.json({ success: true, users: allUsers });
      } catch (err) {
        console.error("Feil i test-db:", err);
        return Response.json(
          { error: "Databasefeil", details: String(err) },
          { status: 500 }
        );
      }
    }

    // Delete user (for testing)
    if (url.pathname === "/api/delete-user" && request.method === "DELETE") {
      try {
        const id = url.searchParams.get("id");
        if (!id) {
          return Response.json({ error: "Mangler bruker-ID" }, { status: 400 });
        }

        await db.delete(users).where(eq(users.id, id));
        return Response.json({ success: true });
      } catch (err) {
        console.error("Feil under sletting:", err);
        return Response.json(
          { error: "Databasefeil", details: String(err) },
          { status: 500 }
        );
      }
    }

    // Serve frontend files
    if (request.method === "GET") {
      try {
        let assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.status === 404) {
          const indexReq = new Request(`${url.origin}/index.html`, {
            method: "GET",
            headers: request.headers,
          });
          assetResponse = await env.ASSETS.fetch(indexReq);
        }

        if (assetResponse.status === 200) {
          const newHeaders = new Headers(assetResponse.headers);

          if (url.pathname.endsWith(".js")) {
            newHeaders.set(
              "Content-Type",
              "application/javascript; charset=utf-8"
            );
          } else if (url.pathname.endsWith(".css")) {
            newHeaders.set("Content-Type", "text/css; charset=utf-8");
          } else if (url.pathname.endsWith(".html")) {
            newHeaders.set("Content-Type", "text/html; charset=utf-8");
          } else if (url.pathname.endsWith(".json")) {
            newHeaders.set("Content-Type", "application/json; charset=utf-8");
          } else if (url.pathname.endsWith(".png")) {
            newHeaders.set("Content-Type", "image/png");
          } else if (
            url.pathname.endsWith(".jpg") ||
            url.pathname.endsWith(".jpeg")
          ) {
            newHeaders.set("Content-Type", "image/jpeg");
          } else if (url.pathname.endsWith(".svg")) {
            newHeaders.set("Content-Type", "image/svg+xml");
          } else if (url.pathname.endsWith(".ico")) {
            newHeaders.set("Content-Type", "image/x-icon");
          }

          return new Response(assetResponse.body, {
            status: assetResponse.status,
            statusText: assetResponse.statusText,
            headers: newHeaders,
          });
        }

        return assetResponse;
      } catch (err) {
        console.error("ASSETS fetch error:", err);
        return new Response("Feil under lasting av frontend", { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
