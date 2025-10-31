import { Document } from "@/app/Document";
import FriendList from "@/app/pages/FriendList";
import Login from "@/app/pages/Login";
import Messages from "@/app/pages/Messages";
import NotesPage from "@/app/pages/NotesPage";
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

function loadUserMiddleware() {
  return async ({ ctx, request }: any) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const hasAuthCookie = cookieHeader.includes("authToken=");
    ctx.user = hasAuthCookie ? { id: "mock-user-123", username: "testbruker" } : undefined;
  };
}

function requireAuthMiddleware() {
  return async ({ ctx, response, request }: any) => {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/login" || path === "/register") return;
    if (!ctx.user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  };
}

export default defineApp([
  setCommonHeaders(),
  loadUserMiddleware(),
  requireAuthMiddleware(),
  render(Document, [
    route("/", Messages),
    route("/messages", Messages),
    route("/friendlist", FriendList),
    route("/notespage", NotesPage),
    route("/settings", Settings),
    route("/login", Login),
    route("/register", Register),
  ]),
]);
