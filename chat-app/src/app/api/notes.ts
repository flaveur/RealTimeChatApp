import { authenticateUser } from "./utils";
import { eq, desc } from "drizzle-orm";
import { notes } from "../../../drizzle/schema";

export async function getNotes(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, String(auth.userId)))
    .orderBy(desc(notes.createdAt))
    .all();

  return Response.json({ notes: userNotes });
}

export async function createNote(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const { title, content } = (await request.json()) as { title: string; content?: string };
  if (!title || !title.trim()) {
    return Response.json({ error: "Tittel er påkrevd" }, { status: 400 });
  }

  const newNote = {
    id: crypto.randomUUID(),
    userId: String(auth.userId),
    title: title.trim(),
    content: content?.trim() || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(notes).values(newNote);
  return Response.json({ note: newNote }, { status: 201 });
}

export async function updateOrDeleteNote(request: Request, db: any, noteId: string) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const existing = await db.select().from(notes).where(eq(notes.id, noteId)).all();
  if (!existing || existing.length === 0) {
    return Response.json({ error: "Notat ikke funnet" }, { status: 404 });
  }
  const note = existing[0] as any;
  if (String(note.userId ?? note.user_id) !== String(auth.userId)) {
    return Response.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  if (request.method === "PUT") {
    const { title, content } = (await request.json()) as { title?: string; content?: string };
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
}