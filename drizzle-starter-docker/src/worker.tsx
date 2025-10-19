import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import Login from "@/app/pages/Login";
import Register from "@/app/pages/Register";
import { setCommonHeaders } from "./app/headers";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { users } from "./db/schema/user-schema";

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  user: { id: string; username: string } | undefined;
};


function loadUser({ ctx }: any) {
  ctx.user = undefined;
} 

/* function requireAuth({ ctx, response }: any) {
  if (!ctx.user) {
    response.status = 302;
    response.headers.set("Location", "/login");
    return new Response(null, { status: 302, headers: response.headers });
  }
} */

export default defineApp([
  setCommonHeaders(),
  loadUser,

  render(Document, [
    route("/login", Login),
    route("/register", Register),
  ]),
]);