import { render, route, prefix, layout } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { ApplicationDocument } from "@/app/ApplicationDocument";
import { RealtimeDocument } from "@/app/RealtimeDocument";
import { MainLayout } from "@/app/layouts/MainLayout";
import { setCommonHeaders } from "@/app/headers";
import { setEnv } from "./lib/env";
import { messagesHandler } from "./api/messages/messagesHandler";
import { registerHandler, loginHandler } from "./api/auth/authHandler";
import Login from "@/app/pages/Login";
import Register from "@/app/pages/Register";
import Messages from "@/app/pages/Messages";
import Friends from "@/app/pages/Friends";
import Settings from "./app/pages/Settings";
import Sidebar from "@/app/components/Sidebar/Sidebar";

export type AppContext = {};

const originalDefineApp = defineApp;

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    setEnv(env);
    
    const app = originalDefineApp<AppContext>([
      setCommonHeaders(),
      ({ ctx: appCtx }) => {
        appCtx;
      },
      route("/api/messages", messagesHandler as any),
      route("/api/auth/register", registerHandler as any),
      route("/api/auth/login", loginHandler as any),
      render(Document, [
        route("/", Login),
        route("/login", Login),
        route("/register", Register),
      ]),
      render(ApplicationDocument, [
        layout(MainLayout, [
          route("/messages", Messages),
          route("/friends", Friends),
          route("/sidebar", Sidebar),
        ]),
      ]),
      render(RealtimeDocument, [
        prefix("/app", [
          route(
            "/dashboard",
            () => <div className="p-4"></div>
          ),
        ]),
      ]),
    ]);
    
    return app.fetch(request, env, ctx);
  }
};