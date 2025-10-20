import { Document } from "@/app/Document";
import FriendList from "@/app/pages/FriendList";
import Login from "@/app/pages/Login";
import Messages from "@/app/pages/Messages";
import Notes from "@/app/pages/Notes";
import Register from "@/app/pages/Register";
import Settings from "@/app/pages/Settings";

import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { setCommonHeaders } from "./app/headers";

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  user: { id: string; username: string } | undefined;
};

function loadUser({ ctx, request }: any) {
  // TODO: Implementer faktisk auth i neste oblig
  // For nå: sjekk om det finnes en mock auth cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const hasAuthCookie = cookieHeader.includes("authToken=");
  
  if (hasAuthCookie) {
    // Mock user for testing
    ctx.user = { id: "mock-user-123", username: "testbruker" };
  } else {
    ctx.user = undefined;
  }
}

function requireAuth({ ctx, response, request }: any) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Tillat login og register uten autentisering
  if (path === "/login" || path === "/register") {
    return;
  }
  
  if (!ctx.user) {
    response.status = 302;
    response.headers.set("Location", "/login");
    return new Response(null, { status: 302, headers: response.headers });
  }
}

export default defineApp([
  setCommonHeaders(),
  loadUser,
  requireAuth,

  render(Document, [
    route("/", Messages),
    route("/messages", Messages),
    route("/friends", FriendList),
    route("/notes", Notes),
    route("/settings", Settings),
    route("/login", Login),
    route("/register", Register),
  ]),
]);
