/**
 * Hovedworker for applikasjonen - Cloudflare Workers entry point
 * 
 * Denne filen definerer all routing og middleware for applikasjonen.
 * Den bruker RedwoodSDK sin defineApp-funksjon for å sette opp
 * request-håndtering med React Server Components.
 * 
 * Kilde: RedwoodSDK dokumentasjon - Request Handling & Routing
 * https://rwsdk.com/docs
 */

import { render, route, prefix, layout } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { ApplicationDocument } from "@/app/ApplicationDocument";
import { RealtimeDocument } from "@/app/RealtimeDocument";
import { MainLayout } from "@/app/layouts/MainLayout";
import { setCommonHeaders } from "@/app/headers";
import { setEnv } from "./lib/env";
import { messagesController } from "./api/messages/messagesController";
import { registerHandler, loginHandler } from "./api/auth/authHandler";
import { logoutHandler } from "./api/auth/logoutHandler";
import { friendsController } from "./api/friends/friendsController";
import { notesController } from "./api/notes/notesController";
import { settingsController } from "./api/settings/settingsController";
import { uploadController } from "./api/upload/uploadController";
import Login from "@/app/pages/Login";
import Register from "@/app/pages/Register";
import Messages from "@/app/pages/Messages";
import Friends from "@/app/pages/Friends";
import Settings from "./app/pages/Settings";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Notes from "@/app/pages/Notes";

/**
 * Cloudflare Worker fetch-handler
 * Alle innkommende HTTP-requests går gjennom denne funksjonen
 */
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    // Sett miljøvariabler tilgjengelig for hele applikasjonen
    setEnv(env);
    
    /**
     * defineApp setter opp routing-pipelinen
     * Rekkefølgen er viktig: middleware først, deretter routes
     * 
     * Struktur:
     * 1. Middleware (kjører på alle requests)
     * 2. API-routes (prefix "/api/...")
     * 3. Sidevisninger med render() for HTML-response
     */
    const app = defineApp([
      // Middleware: Setter sikkerhetsheadere på alle responses
      setCommonHeaders(),
      
      // === API ROUTES ===
      // Autentisering - registrering og innlogging
      route("/api/auth/register", registerHandler as any),
      route("/api/auth/login", loginHandler as any),
      route("/api/logout", logoutHandler as any),
      
      // Brukerinfo og innstillinger
      route("/api/me", settingsController as any),
      route("/api/me/name", settingsController as any),
      route("/api/me/status", settingsController as any),
      route("/api/me/status-text", settingsController as any),
      route("/api/me/avatar", settingsController as any),
      
      // Prefix-routes grupperer relaterte endepunkter
      // Alle requests til /api/settings/* håndteres av settingsController
      prefix("/api/settings", [
        route("*", settingsController as any),
      ]),
      prefix("/api/friends", [
        route("*", friendsController as any),
      ]),
      prefix("/api/messages", [
        route("*", messagesController as any),
      ]),
      prefix("/api/notes", [
        route("*", notesController as any),
      ]),
      prefix("/api/upload", [
        route("*", uploadController as any),
      ]),
      
      // === SIDEVISNINGER ===
      // render() wrapper sider med et Document-komponent (HTML-shell)
      // Offentlige sider (krever ikke innlogging)
      render(Document, [
        route("/", Login),
        route("/login", Login),
        route("/register", Register),
      ]),
      
      // Beskyttede sider med MainLayout (sidebar + navigasjon)
      render(ApplicationDocument, [
        layout(MainLayout, [
          route("/messages", Messages),
          route("/friends", Friends),
          route("/notes", Notes),
          route("/settings", Settings),
          route("/sidebar", Sidebar),
        ]),
      ]),
      
      // Eksperimentell realtime-seksjon
      render(RealtimeDocument, [
        prefix("/app", [
          route(
            "/dashboard",
            () => <div className="p-4"></div>
          ),
        ]),
      ]),
    ]);
    
    // Returner response fra app-pipelinen
    return app.fetch(request, env, ctx);
  }
};