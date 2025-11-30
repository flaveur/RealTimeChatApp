import { render, route, prefix, layout } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { ApplicationDocument } from "@/app/ApplicationDocument";
import { RealtimeDocument } from "@/app/RealtimeDocument";
import { MainLayout } from "@/app/layouts/MainLayout";
import { setCommonHeaders } from "@/app/headers";
import { messagesHandler } from "./api/messages/messagesHandler";
import { registerHandler, loginHandler } from "./api/auth/authHandler";
import Login from "@/app/pages/Login";
import Register from "@/app/pages/Register";
import Messages from "@/app/pages/Messages";
import Friends from "@/app/pages/Friends";

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  // API routes
  route("/api/messages", messagesHandler as any),
  route("/api/auth/register", registerHandler as any),
  route("/api/auth/login", loginHandler as any),
  // Page routes (render different Documents for different route groups)
  // Public / auth pages
  render(Document, [
    route("/", Login),
    route("/login", Login),
    route("/register", Register),
  ]),

  // Application pages use ApplicationDocument (adds sidebar placeholder, etc.)
  render(ApplicationDocument, [
    // wrapper routes med MainLayout
    layout(MainLayout, [
      route("/messages", Messages),
      route("/friends", Friends),
    ]),
  ]),

  // Eksempel realtime 
  render(RealtimeDocument, [
    prefix("/app", [
      route(
        "/dashboard",
        () => <div className="p-4">Realtime Dashboard (example)</div>
      ),
    ]),
  ]),
]);
