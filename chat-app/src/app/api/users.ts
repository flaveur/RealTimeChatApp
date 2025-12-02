import { authenticateUser, hashPassword, getUserData } from "./utils";
import { eq } from "drizzle-orm";
import { users, sessions } from "../../db/schema";

export async function registerUser(request: Request, db: any) {
  const { username, email, password } = (await request.json()) as {
    username: string;
    email: string;
    password: string;
  };
  if (!username || !email || !password) {
    return Response.json({ error: "Alle felt må fylles ut" }, { status: 400 });
  }

  const existingEmail = await db.select().from(users).where(eq(users.email, email)).all();
  if (existingEmail.length > 0) {
    return Response.json({ error: "E-post er allerede registrert" }, { status: 409 });
  }

  const existingUsername = await db.select().from(users).where(eq(users.username, username)).all();
  if (existingUsername.length > 0) {
    return Response.json({ error: "Brukernavnet er allerede tatt" }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  await db.insert(users).values({
    id: crypto.randomUUID(),
    username,
    email,
    password: hashed,
    status: "offline",
  });

  return Response.json({ success: true }, { status: 201 });
}

export async function loginUser(request: Request, db: any) {
  const { username, password } = (await request.json()) as any;
  if (!username || !password) {
    return Response.json({ error: "Mangler brukernavn eller passord" }, { status: 400 });
  }

  const found = await db.select().from(users).where(eq(users.username, username)).all();
  if (!found || found.length === 0) {
    return Response.json({ error: "Ugyldig brukernavn eller passord" }, { status: 401 });
  }

  const user = found[0] as any;
  const hashed = await hashPassword(password);

  if (hashed !== user.password) {
    return Response.json({ error: "Ugyldig brukernavn eller passord" }, { status: 401 });
  }

  const token = crypto.randomUUID();
  await db.insert(sessions).values({ id: crypto.randomUUID(), userId: user.id, token });

  const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax`;
  return Response.json({ success: true }, { status: 200, headers: { "Set-Cookie": cookie } });
}

export async function getCurrentUser(request: Request, db: any) {
  const auth = await authenticateUser(request, db);
  if (!auth) return Response.json({ error: "Ikke autentisert" }, { status: 401 });

  const user = await getUserData(db, auth.userId);
  if (!user) return Response.json({ error: "Bruker ikke funnet" }, { status: 404 });

  return Response.json({ user });
}